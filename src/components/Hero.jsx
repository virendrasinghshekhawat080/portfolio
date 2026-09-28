import { useRef } from "react";
import { GITHUB, WHATSAPP, RESUME, LINKEDIN } from "../config";

export default function Hero({ typed }) {
  const tiltRef = useRef(null);
  const moveCard = (event) => {
    const el = tiltRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer:fine)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - .5;
    const y = (event.clientY - r.top) / r.height - .5;
    el.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(x * 7).toFixed(2)}deg`);
    el.style.setProperty('--shine-x', `${((x + .5) * 100).toFixed(1)}%`);
    el.style.setProperty('--shine-y', `${((y + .5) * 100).toFixed(1)}%`);
  };
  const resetCard = () => {
    const el = tiltRef.current;
    if (el) { el.style.setProperty('--tilt-x','0deg'); el.style.setProperty('--tilt-y','0deg'); }
  };
  return (
    <section className="hero section" id="home">
      <div className="hero-grid wrap">
        <div className="hero-content reveal">
          <div className="availability"><span className="pulse-dot" /> Jaipur, India <span className="availability-divider">/</span> Open to frontend & MERN roles</div>
          <p className="eyebrow">HELLO, I'M A FRONTEND & MERN DEVELOPER</p>
          <h1>Virendra Singh<br /><span className="gradient-text">Shekhawat<span className="period">.</span></span></h1>
          <p className="hero-role">I build <span id="typewriter" aria-live="off">{typed}</span><span className="caret" aria-hidden="true">|</span></p>
          <p className="hero-copy">
            I turn ideas into responsive, user-friendly web applications. My primary focus is
            React.js and modern frontend development, with hands-on experience connecting
            interfaces to Node.js, Express.js, MongoDB and REST APIs.
          </p>
          <div className="hero-strengths" aria-label="Development focus">
            <span><span aria-hidden="true">✦</span> Responsive React UI</span>
            <span><span aria-hidden="true">✦</span> REST API integration</span>
            <span><span aria-hidden="true">✦</span> MERN projects</span>
          </div>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#projects">Explore projects <span aria-hidden="true">↗</span></a>
            <a className="btn btn-outline" href="#/contact">Let's connect <span aria-hidden="true">↗</span></a>
            <a className="hero-cv" href={RESUME} download>Download CV ↓</a>
          </div>
          <div className="hero-social" aria-label="My profiles">
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
          </div>
          <div className="hero-metrics" aria-label="Portfolio highlights">
            <div><strong>04<span>+</span></strong><small>Featured live projects</small></div>
            <div><strong>2026</strong><small>B.Tech · Computer Science</small></div>
            <div><strong>MERN</strong><small>Developer internship</small></div>
          </div>
        </div>
        <div className="hero-visual reveal">
          <div className="orb orb-one" aria-hidden="true" />
          <div className="orb orb-two" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="portrait-card" ref={tiltRef} onPointerMove={moveCard} onPointerLeave={resetCard}>
            <div className="portrait-hologram" aria-hidden="true" /><div className="portrait-top"><span className="tiny-dot" /><span className="tiny-dot" /><span className="tiny-dot" /><span className="portrait-file">developer.jsx</span></div>
            <div className="portrait-wrap">
              <img src={`${import.meta.env.BASE_URL}assets/profile.png`} alt="Virendra Singh Shekhawat" fetchPriority="high" />
              <span className="portrait-ring" aria-hidden="true" />
            </div>
            <div className="portrait-caption"><span className="portrait-name">Virendra Singh Shekhawat</span><span className="portrait-job">{'<Frontend / MERN Developer />'}</span></div>
            <div className="portrait-status"><span className="pulse-dot" /> Building for the web</div>
          </div>
          <div className="floating-tag tag-react">⚛ React.js</div>
          <div className="floating-tag tag-code">{'{ }'} Clean Code</div>
          <div className="floating-tag tag-mern">✦ MERN Stack</div>
        </div>
      </div>
      <a href="#about" className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></a>
    </section>
  );
}
