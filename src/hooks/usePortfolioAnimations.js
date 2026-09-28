import { useEffect, useState } from "react";

export default function usePortfolioAnimations() {
  const [progress, setProgress] = useState(0);

  const [activeSection, setActiveSection] =
    useState("home");

  const [typed, setTyped] =
    useState("modern web experiences");

  const [cursor, setCursor] = useState(null);

  // Scroll animations

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const reveal = () => {
      const elements =
        document.querySelectorAll(
          ".reveal:not(.visible)"
        );

      if (
        reduceMotion ||
        !("IntersectionObserver" in window)
      ) {
        elements.forEach((el) =>
          el.classList.add("visible")
        );

        return () => {};
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.07,
          rootMargin: "0px 0px -20px 0px",
        }
      );

      elements.forEach((el) =>
        observer.observe(el)
      );

      return () =>
        observer.disconnect();
    };

    const stopReveal = reveal();

    const sections =
      document.querySelectorAll(
        "main section[id]"
      );

    const sectionObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  setActiveSection(
                    entry.target.id
                  );
                }
              });
            },
            {
              rootMargin:
                "-25% 0px -60% 0px",
            }
          )
        : null;

    sections.forEach((section) =>
      sectionObserver?.observe(section)
    );

    let frame = 0;

    const updateScroll = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const max =
          document.documentElement
            .scrollHeight -
          window.innerHeight;

        setProgress(
          max > 0
            ? Math.min(
                100,
                (window.scrollY / max) * 100
              )
            : 0
        );

        frame = 0;
      });
    };

    window.addEventListener(
      "scroll",
      updateScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateScroll
    );

    updateScroll();

    return () => {
      stopReveal();

      sectionObserver?.disconnect();

      window.removeEventListener(
        "scroll",
        updateScroll
      );

      window.removeEventListener(
        "resize",
        updateScroll
      );

      cancelAnimationFrame(frame);
    };
  }, []);

  // Typewriter animation

  useEffect(() => {
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    const phrases = [
      "modern web experiences",
      "responsive React interfaces",
      "full-stack applications",
      "ideas into real products",
    ];

    let phrase = 0;

    let position =
      phrases[0].length;

    let deleting = true;

    let timeout;

    function tick() {
      if (deleting) {
        position -= 1;
      } else {
        position += 1;
      }

      setTyped(
        phrases[phrase].slice(
          0,
          position
        )
      );

      if (position === 0) {
        deleting = false;

        phrase =
          (phrase + 1) %
          phrases.length;

        timeout =
          window.setTimeout(
            tick,
            250
          );
      } else if (
        !deleting &&
        position ===
          phrases[phrase].length
      ) {
        deleting = true;

        timeout =
          window.setTimeout(
            tick,
            1700
          );
      } else {
        timeout =
          window.setTimeout(
            tick,
            deleting ? 38 : 72
          );
      }
    }

    timeout =
      window.setTimeout(
        tick,
        2100
      );

    return () =>
      window.clearTimeout(timeout);
  }, []);

  // Cursor animation

  useEffect(() => {
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ||
      !window.matchMedia(
        "(pointer:fine)"
      ).matches
    ) {
      return;
    }

    let frame = 0;

    const follow = (event) => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      const {
        clientX,
        clientY,
      } = event;

      frame =
        requestAnimationFrame(
          () => {
            setCursor({
              x: clientX,
              y: clientY,
            });
          }
        );
    };

    window.addEventListener(
      "pointermove",
      follow,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        follow
      );

      cancelAnimationFrame(
        frame
      );
    };
  }, []);

  return {
    progress,
    activeSection,
    typed,
    cursor,
  };
}
