import { useEffect, useRef, useState } from "react";
import { navItems } from "../data/portfolio";

export default function Header({ activeSection }) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const navRef = useRef(null);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    function closeOnOutsideClick(event) {
      if (
        navRef.current &&
        !navRef.current.contains(
          event.target
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      closeOnEscape
    );

    document.addEventListener(
      "pointerdown",
      closeOnOutsideClick
    );

    return () => {
      document.removeEventListener(
        "keydown",
        closeOnEscape
      );

      document.removeEventListener(
        "pointerdown",
        closeOnOutsideClick
      );
    };
  }, []);

  return (
    <header className="site-header">
      <nav
        className="nav wrap"
        aria-label="Main navigation"
        ref={navRef}
      >

        {/* LOGO */}

        <a
          className="logo"
          href="#home"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Virendra home"
        >
          <span className="logo-icon">
            V<span>.</span>
          </span>

          <span>
            virendra
            <span className="accent">
              .dev
            </span>
          </span>
        </a>

        {/* MOBILE MENU BUTTON */}

        <button
          className={`menu-toggle ${
            menuOpen ? "open" : ""
          }`}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="nav-links"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION LINKS */}

        <div
          className={`nav-links ${
            menuOpen ? "open" : ""
          }`}
          id="nav-links"
        >
          {navItems.map(
            ([id, title]) => (
              <a
                key={id}
                href={`#${id}`}
                className={
                  activeSection === id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {title}
              </a>
            )
          )}

          {/* CONTACT PAGE BUTTON */}

          <a
            href="#/contact"
            className={`nav-contact ${
              activeSection ===
              "contact"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMenuOpen(false)
            }
            aria-current={
              activeSection ===
              "contact"
                ? "page"
                : undefined
            }
          >
            Contact
            <span aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
