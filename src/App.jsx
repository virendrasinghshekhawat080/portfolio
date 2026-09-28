import { useEffect, useState } from "react";
import ContactPage from "./ContactPage";
import { useVoiceAssistant, FloatingVoice } from "./VoiceAssistant";
import usePortfolioAnimations from "./hooks/usePortfolioAnimations";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomeHighlights from "./components/HomeHighlights";
import Ticker from "./components/Ticker";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import ContactTeaser from "./components/ContactTeaser";
import Footer from "./components/Footer";

function getCurrentRoute() {
  return window.location.hash ===
    "#/contact"
    ? "contact"
    : "home";
}

// ================= MAIN APP =================

export default function App() {
  const {
    progress,
    activeSection,
    typed,
    cursor,
  } = usePortfolioAnimations();

  const [route, setRoute] =
    useState(getCurrentRoute);

  const voice =
    useVoiceAssistant();

  // Reapply animations after returning
  // from the Contact page.

  useEffect(() => {
    if (route !== "home") {
      return;
    }

    const elements = [
      ...document.querySelectorAll(
        ".reveal:not(.visible)"
      ),
    ];

    if (
      !(
        "IntersectionObserver" in
        window
      ) ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      elements.forEach(
        (el) =>
          el.classList.add(
            "visible"
          )
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "visible"
                );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.07,
          rootMargin:
            "0px 0px -20px 0px",
        }
      );

    elements.forEach(
      (el) =>
        observer.observe(el)
    );

    return () =>
      observer.disconnect();
  }, [route]);

  // Handle Home and Contact navigation

  useEffect(() => {
    const syncRoute = () => {
      const next =
        getCurrentRoute();

      setRoute(next);

      if (next === "contact") {
        window.scrollTo({
          top: 0,
          behavior: "instant",
        });
      } else {
        const hash =
          decodeURIComponent(
            window.location.hash.substring(
              1
            )
          );

        window.requestAnimationFrame(
          () =>
            window.requestAnimationFrame(
              () => {
                const target =
                  document.getElementById(
                    hash || "home"
                  );

                if (target) {
                  target.scrollIntoView({
                    behavior:
                      window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                      ).matches
                        ? "instant"
                        : "smooth",
                  });
                }
              }
            )
        );
      }
    };

    window.addEventListener(
      "hashchange",
      syncRoute
    );

    return () =>
      window.removeEventListener(
        "hashchange",
        syncRoute
      );
  }, []);

  return (
    <>
      {/* CURSOR ANIMATION */}

      {cursor && (
        <div
          className="cursor-glow"
          aria-hidden="true"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        />
      )}

      {/* SCROLL PROGRESS */}

      <div
        className="scroll-progress"
        aria-hidden="true"
        style={{
          width: `${progress}%`,
        }}
      />

      {/* HEADER */}

      <Header
        activeSection={
          route === "contact"
            ? "contact"
            : activeSection
        }
      />

      {/* PAGE CONTENT */}

      <main>
        {route === "contact" ? (
          <ContactPage />
        ) : (
          <>
            <Hero typed={typed} />

            <HomeHighlights />

            <Ticker />

            <About />

            <Skills />

            <Projects />

            <Experience />

            <ContactTeaser />
          </>
        )}
      </main>

      {/* FOOTER */}

      <Footer />

      {/* FLOATING VOICE BUTTON */}

      <FloatingVoice voice={voice} />
    </>
  );
}