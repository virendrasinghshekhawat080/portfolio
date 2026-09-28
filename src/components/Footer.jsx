import { GITHUB, WHATSAPP, LINKEDIN, INSTAGRAM, TELEGRAM, EMAIL, PHONE, SOCIALS } from "../config";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-spotlight">
          <div>
            <span className="section-kicker">
              HAVE AN IDEA IN MIND?
            </span>

            <h2>
              Let's create something
              <br />

              <span className="gradient-text">
                remarkable together.
              </span>
            </h2>

            <p>
              Frontend & MERN Stack
              Developer · Jaipur, India
            </p>
          </div>

          <a
            className="btn btn-primary footer-spotlight-btn"
            href="#/contact"
          >
            Start a conversation{" "}

            <span>↗</span>
          </a>
        </div>

        <div className="footer-main">
          {/* FOOTER BRAND */}

          <div className="footer-brand">
            <a
              className="logo"
              href="#home"
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

            <p>
              Crafting thoughtful
              interfaces and functional
              web applications. Clean
              code, smooth experiences
              and a passion for
              learning.
            </p>

            <div className="footer-socials">
              {SOCIALS.map(
                (item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target={item.href.startsWith("https://") ? "_blank" : undefined}
                    rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <span>
                      {item.icon}
                    </span>
                  </a>
                )
              )}
            </div>
          </div>

          {/* EXPLORE */}

          <div className="footer-column">
            <span className="footer-column-heading">
              EXPLORE
            </span>

            <a href="#home">
              Home
            </a>

            <a href="#about">
              About me
            </a>

            <a href="#skills">
              My skills
            </a>

            <a href="#projects">
              Projects
            </a>

            <a href="#experience">
              Experience
            </a>

            <a href="#/contact">
              Contact page
            </a>
          </div>

          {/* SOCIAL MEDIA */}

          <div className="footer-column">
            <span className="footer-column-heading">
              LET'S CONNECT
            </span>

            <a
              href={WHATSAPP}
              target="_blank" rel="noopener noreferrer"
            >
              WhatsApp ↗
            </a>

            <a
              href={LINKEDIN}
              target="_blank" rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>

            <a
              href={GITHUB}
              target="_blank" rel="noopener noreferrer"
            >
              GitHub ↗
            </a>

            <a
              href={INSTAGRAM}
              target="_blank" rel="noopener noreferrer"
            >
              Instagram ↗
            </a>

            <a
              href={TELEGRAM}
              target="_blank" rel="noopener noreferrer"
            >
              Telegram ↗
            </a>

            <a
              href={`mailto:${EMAIL}`}
            >
              Email ↗
            </a>

            <a
              href={`tel:+91${PHONE}`}
            >
              Call me ↗
            </a>
          </div>

        </div>

        {/* FOOTER BOTTOM */}

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()}{" "}
            Virendra Singh Shekhawat
            · Made with React & Vite
          </span>

          <span>
            Designed with intention.
            Built to grow.
          </span>

          <a href="#home">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
