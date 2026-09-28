import { WHATSAPP } from "../config";

export default function ContactTeaser() {
  return (
    <section
      className="section contact"
      id="contact"
    >
      <div className="wrap">
        <div className="contact-panel glass reveal">
          <span className="section-kicker">
            05 / GET IN TOUCH
          </span>

          <h2>
            Have something in mind?
            <br />

            <span className="gradient-text">
              Let's talk about it.
            </span>
          </h2>

          <p>
            Whether it's a new
            website, frontend role
            or a collaboration,
            I'd love to hear about it.
          </p>

          <div className="contact-teaser-actions">
            <a
              className="btn btn-primary"
              href="#/contact"
            >
              Visit contact page ↗
            </a>

            <a
              className="btn btn-outline"
              href={WHATSAPP}
              target="_blank" rel="noopener noreferrer"
            >
              WhatsApp me ↗
            </a>
          </div>

          <div className="contact-teaser-mini">
            <span>
              Based in Jaipur, India
            </span>

            <span>
              Available for frontend
              & MERN opportunities
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
