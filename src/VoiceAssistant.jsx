

import { useCallback, useEffect, useRef, useState } from "react";

import {
  classifyUtterance,
  localReply,
  NO_NAME,
} from "./voice/conversation.js";

import {
  FATAL_SPEECH_ERRORS,
  retrySpeech,
} from "./voice/continuity.js";

const API_BASE = (
  import.meta.env.VITE_AI_API_URL || ""
).replace(/\/$/, "");

const STORAGE_KEY = "virendra-portfolio-voice-chat-v6";

const examples = [
  "Home खोलो",
  "Contact page",
  "Experience दिखाओ",
  "मेरे projects बताओ",
  "WhatsApp खोलो",
  "LinkedIn profile",
  "GitHub कैसे चलाएँ?",
];

// Recognise confirmation only while a social-media request is pending.
// Check the negative answer first: "हाँ नहीं" must never open a link.
function socialConfirmation(text) {
  const value = String(text || "")
    .toLowerCase()
    .replace(/[।!?.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/(^|\s)(नहीं|नही|ना|मत|रद्द|कैंसिल|cancel|no|nope)(\s|$)/i.test(value)) {
    return "no";
  }

  if (/^(?:हाँ|हां|हा|हाँ खोलो|हां खोलो|हाँ कर दो|जी हाँ|जी|बिल्कुल|yes|yes open|yes please|yeah|yep|haan|han|ha|ok|okay|ओके|खोलो|open|करो|कर दो)$/.test(value)) {
    return "yes";
  }

  return "unknown";
}

// The extension must be installed once through Edge/Chrome settings.
// A webpage cannot reliably open new tabs from speech-recognition callbacks.
// There is deliberately NO window.open fallback here: the user asked for
// voice-only confirmation, not a second manual click.
function extensionRequest(type, url = "") {
  return new Promise((resolve) => {
    const id = window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let finished = false;
    let timer;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onResult);
      resolve(result);
    };
    const onResult = (event) => {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (event.data?.type !== "VIRENDRA_VOICE_TAB_RESULT" || event.data?.id !== id) return;
      finish({ ok: event.data.ok === true, reason: event.data.reason || "failed" });
    };
    window.addEventListener("message", onResult);
    timer = window.setTimeout(() => finish({ ok: false, reason: "not-connected" }), 3500);
    window.postMessage(
      { type: "VIRENDRA_VOICE_TAB_REQUEST", id, action: type, url },
      window.location.origin
    );
  });
}

async function openConfirmedSocialLink(url) {
  let destination;
  try {
    destination = new URL(url, window.location.href);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
  if (!["http:", "https:"].includes(destination.protocol)) {
    return { ok: false, reason: "unsupported-link" };
  }
  return extensionRequest("OPEN_TAB", destination.href);
}

// =============================================
// SAVED CHAT HISTORY
// =============================================

function savedMessages() {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(value)
      ? value
          .filter(
            (item) =>
              ["user", "assistant"].includes(item?.role) &&
              typeof item?.text === "string"
          )
          .slice(-40)
      : [];
  } catch {
    return [];
  }
}

// =============================================
// MAIN VOICE ASSISTANT HOOK
// =============================================

export function useVoiceAssistant() {
  const recognizer = useRef(null);
  const pendingSocial = useRef(null);

  const active = useRef(false);

  const busy = useRef(false);

  const speakingNow = useRef(false);

  const mounted = useRef(false);

  const retryTimer = useRef(null);

  const watchdog = useRef(null);

  const doneSpeaking = useRef(null);

  const request = useRef(null);

  const launch = useRef(() => {});

  const resume = useRef(() => {});

  const failures = useRef(0);

  const retryDelay = useRef(350);

  const locale = useRef("hi-IN");

  const history = useRef(
    savedMessages()
      .slice(-10)
      .map((item) => ({
        role: item.role,
        content: item.text,
      }))
  );

  const chatEnd = useRef(null);

  // =============================================
  // REACT STATES
  // =============================================

  const [panelOpen, setPanelOpen] = useState(false);

  const [enabled, setEnabled] = useState(false);

  const [listening, setListening] = useState(false);

  const [speaking, setSpeaking] = useState(false);

  const [loading, setLoading] = useState(false);

  const [supported, setSupported] = useState(true);

  const [language, setLanguage] = useState("hi-IN");

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [transcript, setTranscript] = useState("");

  const [status, setStatus] = useState(
    "माइक दबाएँ और बातचीत शुरू करें।"
  );

  const [messages, setMessages] = useState(savedMessages);

  const [link, setLink] = useState(null);

  const [aiStatus, setAiStatus] = useState("checking");
  const [tabSupport, setTabSupport] = useState("checking");

  locale.current = language;

  // =============================================
  // SAVE CHAT HISTORY
  // =============================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-40))
      );
    } catch {
      // Storage unavailable.
    }
  }, [messages]);

  const push = useCallback((role, text, sources = []) => {
    setMessages((old) =>
      [...old, { role, text, sources }].slice(-40)
    );
  }, []);

  // =============================================
  // CLEAR RESTART TIMER
  // =============================================

  const clearRetry = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
    }

    retryTimer.current = null;
  }, []);

  // =============================================
  // STOP CURRENT SPEECH
  // =============================================

  const silence = useCallback(() => {
    if (watchdog.current) {
      clearTimeout(watchdog.current);
    }

    watchdog.current = null;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    speakingNow.current = false;

    setSpeaking(false);

    const finish = doneSpeaking.current;

    doneSpeaking.current = null;

    if (finish) {
      finish();
    }
  }, []);

  // =============================================
  // AI SPEAKING FUNCTION
  // =============================================

  const say = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (
          !voiceEnabled ||
          !window.speechSynthesis ||
          !window.SpeechSynthesisUtterance ||
          !active.current
        ) {
          resolve();
          return;
        }

        silence();

        const value = String(text)
          .replace(/https?:\/\/\S+/g, "लिंक")
          .slice(0, 2700);

        if (!value.trim()) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(
          value
        );

        utterance.lang = /[\u0900-\u097F]/.test(value)
          ? "hi-IN"
          : locale.current;

        utterance.rate = 0.96;

        utterance.pitch = 1;

        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();

        utterance.voice =
          voices.find(
            (voice) => voice.lang === utterance.lang
          ) ||
          voices.find((voice) =>
            voice.lang.startsWith(
              utterance.lang.slice(0, 2)
            )
          ) ||
          null;

        let finished = false;

        const finish = () => {
          if (finished) return;

          finished = true;

          clearTimeout(watchdog.current);

          watchdog.current = null;

          speakingNow.current = false;

          if (mounted.current) {
            setSpeaking(false);
          }

          doneSpeaking.current = null;

          resolve();
        };

        speakingNow.current = true;

        setSpeaking(true);

        doneSpeaking.current = finish;

        utterance.onend = finish;

        utterance.onerror = finish;

        watchdog.current = setTimeout(() => {
          window.speechSynthesis.cancel();

          finish();
        }, Math.min(135000, Math.max(5500, value.length * 135)));

        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          finish();
        }
      }),
    [silence, voiceEnabled]
  );

  // =============================================
  // STOP VOICE ASSISTANT
  // =============================================

  const stop = useCallback(
    (close = true) => {
      pendingSocial.current = null;
      active.current = false;

      setEnabled(false);

      clearRetry();

      const previous = recognizer.current;

      recognizer.current = null;

      try {
        previous?.abort();
      } catch {
        // Recognition already stopped.
      }

      if (request.current) {
        request.current.abort();
      }

      request.current = null;

      busy.current = false;

      silence();

      setListening(false);

      setLoading(false);

      setStatus(
        "वॉइस बंद है। फिर माइक दबाकर चालू कर सकते हैं।"
      );

      if (close) {
        setPanelOpen(false);
      }
    },
    [clearRetry, silence]
  );

  // =============================================
  // CONTINUOUS VOICE LISTENING
  // =============================================

  resume.current = () => {
    clearRetry();

    if (
      !active.current ||
      busy.current ||
      speakingNow.current ||
      recognizer.current ||
      document.hidden
    ) {
      return;
    }

    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;

      if (
        active.current &&
        !busy.current &&
        !speakingNow.current &&
        !recognizer.current &&
        !document.hidden
      ) {
        launch.current();
      }
    }, retryDelay.current);
  };

  // =============================================
  // PROCESS USER COMMAND
  // =============================================

  const execute = useCallback(
    async (value) => {
      const heard = String(value || "")
        .trim()
        .slice(0, 1200);

      if (!heard || busy.current) {
        return;
      }

      busy.current = true;

      clearRetry();

      const previous = recognizer.current;

      recognizer.current = null;

      try {
        previous?.abort();
      } catch {
        // Recognition already stopped.
      }

      setListening(false);

      silence();

      setPanelOpen(true);

      setTranscript(heard);

      setLink(null);

      push("user", heard);

      try {
        const action = classifyUtterance(heard);

        // STOP COMMAND

        if (action.kind === "stop") {
          push(
            "assistant",
            "ठीक है दोस्त, वॉइस बंद कर दी।"
          );

          stop(true);

          return;
        }

        let reply = "";
        let sources = [];

        // The next spoken or typed answer belongs to the pending request.
        // A different social-link command replaces the old request, and a
        // portfolio-navigation command cancels it without blocking navigation.
        if (pendingSocial.current &&
            (socialConfirmation(heard) !== "unknown" ||
             (action.kind !== "external" && action.kind !== "internal"))) {
          const pending = pendingSocial.current;
          const confirmation = socialConfirmation(heard);

          if (confirmation === "yes") {
            pendingSocial.current = null;
            const result = await openConfirmedSocialLink(pending.url);
            setLink(null); // Never ask for a second click to open a social tab.
            if (result.reason === "not-connected") setTabSupport("missing");
            reply = result.ok
              ? `${pending.label} खोल दिया।`
              : result.reason === "not-connected"
                ? `Voice Tab Extension जुड़ा नहीं है। एक बार Extension इंस्टॉल कर वेबसाइट Refresh करें।`
                : result.reason === "unsupported-link"
                  ? `इस लिंक को वॉइस से नए टैब में खोलना सपोर्ट नहीं है।`
                  : `${pending.label} का नया टैब नहीं खुल सका। Extension को Reload करें और फिर कोशिश करें।`;
          } else if (confirmation === "no") {
            pendingSocial.current = null;
            setLink(null);
            reply = `${pending.label} खोलने का अनुरोध रद्द कर दिया है।`;
          } else {
            reply = `${pending.label} खोलूँ? हाँ या ना बोलिए।`;
          }
        }

        // =====================================
        // PORTFOLIO PAGE NAVIGATION
        // =====================================

        else if (action.kind === "internal") {
          pendingSocial.current = null;
          reply = `${
            action.message.replace(/…$/, "")
          }।`;

          if (window.location.hash !== action.hash) {
            window.location.hash = action.hash;
          } else if (action.hash === "#/contact") {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } else {
            document
              .getElementById(
                action.hash.substring(1)
              )
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
          }
        }

        // =====================================
        // SOCIAL MEDIA LINKS
        // =====================================

        else if (action.kind === "external") {
          const label = action.message.replace(/…$/, "").trim();
          pendingSocial.current = { url: action.url, label };
          setLink(null);
          reply = `${label} नए टैब में खोलूँ? हाँ या ना बोलिए।`;
        }

        // =====================================
        // UNKNOWN PERSON / NAME
        // =====================================

        else if (action.kind === "unknown-name") {
          reply = NO_NAME;
        }

        // =====================================
        // HELP COMMAND
        // =====================================

        else if (action.kind === "help") {
          reply =
            "आप होम, अबाउट, प्रोजेक्ट्स, एक्सपीरियंस या कॉन्टैक्ट खुलवा सकते हैं। किसी प्रोजेक्ट के बारे में सवाल पूछिए, या GitHub का इस्तेमाल कैसे करें जैसे सामान्य सवाल पूछिए।";
        }

        // =====================================
        // NORMAL AI CHAT
        // =====================================

        else {
          reply = aiStatus === "ready" ? "" : (localReply(heard) || "");

          if (!reply) {
            setLoading(true);

            setStatus("AI जवाब तैयार कर रहा है…");

            const controller = new AbortController();

            request.current = controller;

            try {
              const response = await fetch(
                `${API_BASE}/api/chat`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type": "application/json",
                  },

                  body: JSON.stringify({
                    message: heard,

                    history: history.current.slice(-8),
                  }),

                  signal: controller.signal,
                }
              );

              const data = await response
                .json()
                .catch(() => ({}));

              sources = Array.isArray(data.sources) ? data.sources.slice(0, 3) : [];
              reply = String(
                data.reply ||
                  (response.ok
                    ? "जवाब नहीं मिला, कृपया दोबारा पूछें।"
                    : data.error ||
                      "AI अभी उपलब्ध नहीं है, वेबसाइट के कमांड फिर भी चलेंगे।")
              ).trim();
            } catch (error) {
              if (error.name === "AbortError") {
                return;
              }

              reply =
                "AI सर्वर से कनेक्शन नहीं हुआ। पहले Backend चालू करें और API Key जाँचें। पोर्टफोलियो के पेज और लिंक अब भी खुलेंगे।";
            } finally {
              if (request.current === controller) {
                request.current = null;
              }

              if (mounted.current) {
                setLoading(false);
              }
            }
          }
        }

        // =====================================
        // ASSISTANT REPLY
        // =====================================

        if (!mounted.current || !reply) {
          return;
        }

        history.current = [
          ...history.current,

          {
            role: "user",
            content: heard,
          },

          {
            role: "assistant",
            content: reply,
          },
        ].slice(-10);

        push("assistant", reply, sources);

        setStatus(reply);

        // Speak the reply.

        await say(reply);
      } finally {
        busy.current = false;

        // Resume listening after assistant reply.

        if (active.current && mounted.current) {
          retryDelay.current = 350;

          resume.current();
        }
      }
    },
    [aiStatus, clearRetry, push, say, silence, stop]
  );

  // =============================================
  // SPEECH RECOGNITION
  // =============================================

  launch.current = () => {
    if (
      !active.current ||
      busy.current ||
      speakingNow.current ||
      recognizer.current ||
      document.hidden
    ) {
      return;
    }

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition || !window.isSecureContext) {
      setSupported(false);

      stop(false);

      setStatus(
        "इस ब्राउज़र में Voice Recognition उपलब्ध नहीं है। Chrome या Edge में localhost या HTTPS खोलें। नीचे टाइप भी कर सकते हैं।"
      );

      return;
    }

    const instance = new Recognition();

    recognizer.current = instance;

    instance.lang = locale.current;

    instance.continuous = false;

    instance.interimResults = true;

    instance.maxAlternatives = 3;

    let resolved = false;

    let started = false;

    let error = "";

    // MICROPHONE STARTED

    instance.onstart = () => {
      if (recognizer.current !== instance) {
        return;
      }

      started = true;

      failures.current = 0;

      retryDelay.current = 350;

      setListening(true);

      setStatus("सुन रहा हूँ… बोलिए दोस्त।");
    };

    // =====================================
    // USER SPEECH RESULT
    // =====================================

    instance.onresult = (event) => {
      if (
        recognizer.current !== instance ||
        resolved
      ) {
        return;
      }

      const item =
        event.results[event.resultIndex] ||
        event.results[event.results.length - 1];

      const first = item?.[0]?.transcript?.trim();

      if (!first) {
        return;
      }

      // Show partial speech.

      if (!item.isFinal) {
        setTranscript(first);

        return;
      }

      resolved = true;

      const alternatives = [...item]
        .map((result) => result.transcript?.trim())
        .filter(Boolean);

      const chosen =
        (pendingSocial.current
          ? alternatives.find((value) => socialConfirmation(value) !== "unknown")
          : null) ||
        alternatives.find((value) =>
          ["stop", "internal", "external"].includes(
            classifyUtterance(value).kind
          )
        ) || first;

      recognizer.current = null;

      setListening(false);

      try {
        instance.stop();
      } catch {
        // Recognition already ended.
      }

      void execute(chosen);
    };

    // =====================================
    // SPEECH RECOGNITION ERROR
    // =====================================

    instance.onerror = (event) => {
      if (recognizer.current !== instance) {
        return;
      }

      error = event.error || "unknown";

      setListening(false);

      if (FATAL_SPEECH_ERRORS.has(error)) {
        active.current = false;

        setEnabled(false);

        clearRetry();

        setStatus(
          "माइक्रोफोन या Speech Service की अनुमति नहीं मिली। Browser Settings में Allow करें, फिर माइक दबाएँ।"
        );
      } else {
        if (
          error !== "no-speech" &&
          error !== "aborted"
        ) {
          failures.current += 1;
        }

        const plan = retrySpeech(
          error,
          failures.current
        );

        retryDelay.current = plan.delay;

        setStatus(
          plan.retry
            ? "थोड़ा रुककर फिर से सुन रहा हूँ…"
            : "Speech Service बार-बार रुक रही है। इंटरनेट और Mic जाँचकर दोबारा चालू करें।"
        );

        if (!plan.retry) {
          active.current = false;

          setEnabled(false);
        }
      }
    };

    // =====================================
    // LISTEN AGAIN
    // =====================================

    instance.onend = () => {
      if (
        recognizer.current &&
        recognizer.current !== instance
      ) {
        return;
      }

      if (recognizer.current === instance) {
        recognizer.current = null;
      }

      setListening(false);

      if (!started && !error && active.current) {
        active.current = false;

        setEnabled(false);

        setStatus(
          "Mic चालू नहीं हो पाया। अनुमति जाँचकर फिर दबाएँ।"
        );

        return;
      }

      resume.current();
    };

    // =====================================
    // START RECOGNITION
    // =====================================

    try {
      instance.start();
    } catch {
      recognizer.current = null;

      setListening(false);

      failures.current += 1;

      const plan = retrySpeech(
        "start-failed",
        failures.current
      );

      retryDelay.current = plan.delay;

      if (plan.retry) {
        resume.current();
      } else {
        active.current = false;

        setEnabled(false);

        setStatus(
          "Mic शुरू नहीं हो पाया। Browser permission जाँचें।"
        );
      }
    }
  };

  // =============================================
  // START VOICE ASSISTANT
  // =============================================

  const start = useCallback(() => {
    if (active.current) {
      stop(true);

      return;
    }

    setPanelOpen(true);

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition || !window.isSecureContext) {
      setSupported(false);

      setStatus(
        "Chrome या Edge में localhost या HTTPS पर खोलें। आप चैट में टाइप भी कर सकते हैं।"
      );

      return;
    }

    active.current = true;

    setEnabled(true);

    setStatus(
      "पहली बार Microphone Permission में Allow दबाएँ…"
    );

    failures.current = 0;

    retryDelay.current = 350;

    clearRetry();

    silence();

    // Trigger permission prompt directly
    // from the user's click.

    launch.current();
  }, [clearRetry, silence, stop]);

  // =============================================
  // MOUNT / UNMOUNT CLEANUP
  // =============================================

  useEffect(() => {
    mounted.current = true;

    setSupported(
      Boolean(
        window.SpeechRecognition ||
          window.webkitSpeechRecognition
      ) && window.isSecureContext
    );

    const onVisibility = () => {
      if (!document.hidden) {
        resume.current();
      }
    };

    const onPageHide = () => {
      active.current = false;

      clearRetry();

      const instance = recognizer.current;

      recognizer.current = null;

      try {
        instance?.abort();
      } catch {
        // Already stopped.
      }

      silence();
    };

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    window.addEventListener(
      "pagehide",
      onPageHide
    );

    return () => {
      mounted.current = false;

      active.current = false;

      clearRetry();

      const instance = recognizer.current;

      recognizer.current = null;

      try {
        instance?.abort();
      } catch {
        // Already stopped.
      }

      if (request.current) {
        request.current.abort();
      }

      silence();

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );

      window.removeEventListener(
        "pagehide",
        onPageHide
      );
    };
  }, [clearRetry, silence]);

  // =============================================
  // AI BACKEND HEALTH CHECK
  // =============================================

  useEffect(() => {
    let disposed = false;

    const check = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/health`
        );

        if (!response.ok) {
          throw new Error("Backend offline");
        }

        const data = await response.json();

        if (!disposed) {
          setAiStatus(
            data.ready ? "ready" : "setup-required"
          );
        }
      } catch {
        if (!disposed) {
          setAiStatus("offline");
        }
      }
    };

    void check();

    const timer = window.setInterval(() => {
      void check();
    }, 30000);

    return () => {
      disposed = true;

      window.clearInterval(timer);
    };
  }, []);

  // Extension availability: shows setup status without making the user
  // click an extra Open button after spoken confirmation.
  useEffect(() => {
    let disposed = false;
    const check = async () => {
      const result = await extensionRequest("PING");
      if (!disposed) setTabSupport(result.ok ? "ready" : "missing");
    };
    void check();
    window.addEventListener("focus", check);
    return () => {
      disposed = true;
      window.removeEventListener("focus", check);
    };
  }, []);

  // =============================================
  // CHANGE VOICE LANGUAGE
  // =============================================

  const changeLanguage = useCallback((next) => {
    setLanguage(next);

    locale.current = next;

    const instance = recognizer.current;

    recognizer.current = null;

    try {
      instance?.abort();
    } catch {
      // Already stopped.
    }

    setListening(false);

    resume.current();
  }, []);

  // =============================================
  // CLEAR CHAT HISTORY
  // =============================================

  const clearChat = useCallback(() => {
    setMessages([]);

    history.current = [];

    setTranscript("");

    setLink(null);
    pendingSocial.current = null;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable.
    }
  }, []);

  // =============================================
  // EXPORTED VOICE FUNCTIONS
  // =============================================

  return {
    enabled,

    listening,

    speaking,

    loading,

    supported,

    language,

    changeLanguage,

    voiceEnabled,

    setVoiceEnabled,

    transcript,

    status,

    messages,

    panelOpen,

    setPanelOpen,

    link,

    aiStatus,

    tabSupport,

    start,

    stop,

    execute,

    silence,

    clearChat,

    chatEnd,
  };
}

// =============================================
// MICROPHONE SVG ICON
// =============================================

export function MicSymbol() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="2"
        width="6"
        height="12"
        rx="3"
      />

      <path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" />
    </svg>
  );
}

// =============================================
// FLOATING VOICE CHAT COMPONENT
// =============================================

export function FloatingVoice({ voice }) {
  const [typed, setTyped] = useState("");

  const logRef = useRef(null);

  // =============================================
  // FIXED: useEffect CLEANUP ERROR
  // =============================================

  useEffect(() => {
    if (
      voice.panelOpen &&
      logRef.current
    ) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [voice.messages, voice.panelOpen]);

  // =============================================
  // SEND TYPED MESSAGE
  // =============================================

  const send = (event) => {
    event.preventDefault();

    if (typed.trim()) {
      void voice.execute(typed);

      setTyped("");
    }
  };

  return (
    <div className="agent-dock">
      {/* =====================================
          VOICE CHAT PANEL
      ===================================== */}

      {voice.panelOpen && (
        <section
          className="agent-panel"
          role="dialog"
          aria-label="AI Voice Assistant"
          aria-modal="false"
        >
          {/* CHAT HEADER */}

          <header className="agent-head">
            <span className="agent-avatar">
              <MicSymbol />
            </span>

            <div>
              <strong>
                Virendra AI Voice
              </strong>

              <small>
                {voice.listening
                  ? "● आपकी बात सुन रहा हूँ"
                  : voice.speaking
                  ? "● जवाब बोल रहा हूँ"
                  : voice.loading
                  ? "● जवाब तैयार कर रहा हूँ"
                  : voice.enabled
                  ? "● अगला सवाल सुनने के लिए तैयार"
                  : "● चैट / Voice Assistant"}
              </small>
            </div>

            <button
              type="button"
              className="agent-close"
              onClick={() => voice.stop(true)}
              aria-label="Close chat and stop microphone"
            >
              ×
            </button>
          </header>

          {/* AI BACKEND STATUS */}

          <div
            className={`agent-backend status-${voice.aiStatus}`}
            role="status"
          >
            {voice.aiStatus === "ready"
              ? "AI Backend चालू है · सामान्य सवाल पूछिए"
              : voice.aiStatus === "setup-required"
              ? "AI के लिए API Key सेट करें · Portfolio Commands चालू हैं"
              : voice.aiStatus === "offline"
              ? "AI Backend बंद है · Portfolio Commands चालू हैं"
              : "AI कनेक्शन जाँच रहा हूँ…"}
          </div>

          <div className={`agent-backend status-${voice.tabSupport}`} role="status">
            {voice.tabSupport === "ready"
              ? "✓ Voice Tab Extension जुड़ा है · हाँ बोलने पर नया टैब खुलेगा"
              : voice.tabSupport === "missing"
                ? "Voice Tab Extension जुड़ा नहीं है · एक बार इंस्टॉल करके Refresh करें"
                : "Voice Tab Extension की जाँच हो रही है…"}
          </div>

          {/* CHAT MESSAGES */}

          <div
            className="agent-log"
            ref={logRef}
            role="log"
            aria-live="polite"
          >
            <div className="agent-intro">
              नमस्ते दोस्त! Home, Projects,
              Experience, Contact खुलवाएँ
              या किसी प्रोजेक्ट के बारे में पूछें।
            </div>

            {voice.messages.map((message, index) => (
              <div
                className={`agent-message ${message.role}`}
                key={`${index}-${message.role}`}
              >
                <small>
                  {message.role === "user"
                    ? "आप"
                    : "AI साथी"}
                </small>

                <p>{message.text}</p>
                {Array.isArray(message.sources) && message.sources.length > 0 && (
                  <div className="agent-sources" aria-label="AI web sources">
                    {message.sources.map((source, idx) => (
                      <a key={`${source.url}-${idx}`} href={source.url} target="_blank" rel="noopener noreferrer">
                        स्रोत {idx + 1}: {source.title || new URL(source.url).hostname}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}


          </div>

          {/* EXTERNAL LINK */}

          {voice.link && (
            <a
              className="agent-link"
              href={voice.link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ {voice.link.label} नए टैब में खोलें
            </a>
          )}

          {/* VOICE STATUS */}

          <div
            className={`agent-hearing ${
              voice.listening ? "listening" : ""
            }`}
            aria-live="polite"
          >
            <span className="agent-dot" />

            {voice.status}

            {voice.listening && voice.transcript
              ? ` — “${voice.transcript}”`
              : ""}
          </div>

          {/* CHAT INPUT */}

          <form
            className="agent-type"
            onSubmit={send}
          >
            <input
              value={typed}
              onChange={(event) =>
                setTyped(event.target.value)
              }
              placeholder="बोलें या यहाँ लिखकर पूछें…"
              maxLength={1200}
              aria-label="Ask AI Voice Assistant"
            />

            <button
              type="submit"
              disabled={
                !typed.trim() || voice.loading
              }
            >
              ➤
            </button>
          </form>

          {/* VOICE CONTROLS */}

          <div className="agent-actions">
            <label>
              भाषा

              <select
                value={voice.language}
                onChange={(event) =>
                  voice.changeLanguage(
                    event.target.value
                  )
                }
              >
                <option value="hi-IN">
                  हिन्दी / Hinglish
                </option>

                <option value="en-IN">
                  English India
                </option>

                <option value="en-US">
                  English US
                </option>
              </select>
            </label>

            <button
              type="button"
              onClick={() =>
                voice.enabled
                  ? voice.stop(false)
                  : voice.start()
              }
            >
              {voice.enabled
                ? "■ Mic बंद"
                : "🎙 Mic चालू"}
            </button>

            <button
              type="button"
              onClick={voice.clearChat}
            >
              Chat साफ करें
            </button>
          </div>

          {/* SUGGESTED COMMANDS */}

          <div className="agent-example" hidden>
            {examples.slice(0, 4).map((question) => (
              <button
                type="button"
                key={question}
                onClick={() =>
                  void voice.execute(question)
                }
              >
                {question}
              </button>
            ))}
          </div>

          {/* DISCLAIMER */}

          <small className="agent-disclaimer" hidden>
            Voice आपकी अनुमति से चलता है।
            Browser Speech Service, इंटरनेट
            या background-tab प्रतिबंधों से
            सुनना रुक सकता है। बातचीत इसी
            Browser में सेव होती है।
            Chat साफ करें से History हटाएँ।
            सामान्य AI सवालों के लिए Backend
            और API Key चाहिए।
          </small>
        </section>
      )}

      {/* =====================================
          FLOATING MICROPHONE BUTTON
      ===================================== */}

      <button
        type="button"
        className={`agent-mic ${
          voice.enabled ? "active" : ""
        }`}
        onClick={() =>
          voice.enabled
            ? voice.stop(true)
            : voice.start()
        }
        aria-label={
          voice.enabled
            ? "Stop AI voice"
            : "Start AI voice and open chat"
        }
        aria-pressed={voice.enabled}
        title="AI Voice Assistant"
      >
        <MicSymbol />

        <span className="agent-mic-ring" />
      </button>
    </div>
  );
}