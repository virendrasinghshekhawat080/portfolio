import { RESUME } from "../config";
import SectionHeading from "./SectionHeading";

export default function About() {
  const focusAreas = [
    { index: '01', icon: '⚛', title: 'Frontend first', detail: 'Developing responsive layouts, clear navigation and reusable React components with JavaScript, HTML and CSS.' },
    { index: '02', icon: '↔', title: 'Connected experiences', detail: 'Integrating REST APIs and working with Node.js, Express.js, MongoDB and Mongoose for full-stack functionality.' },
    { index: '03', icon: '◇', title: 'Thoughtful delivery', detail: 'Working with Git, GitHub, Vite and testing tools to improve UI details and keep projects maintainable.' },
  ];
  return (
    <section className="section about" id="about"><div className="wrap">
      <SectionHeading number="01" label="ABOUT ME" before="More than code." highlight="Building useful experiences." description="A little about my background, the work I do and the technologies I use." />
      <div className="about-grid">
        <div className="about-main glass reveal">
          <span className="corner-label">// HELLO, I'M VIRENDRA</span>
          <h3>A React-focused developer who enjoys turning ideas into working products.</h3>
          <p>I'm Virendra Singh Shekhawat, a B.Tech graduate in Computer Science & Engineering (2026) from Shree Balaji College of Engineering & Technology, Jaipur, affiliated with Rajasthan Technical University, Kota. I'm based in Jaipur, Rajasthan.</p>
          <p>I'm working as a MERN Stack Developer Intern at Techno Derivation Pvt Ltd, Jaipur, where I build responsive web interfaces, work with reusable React components, integrate REST APIs and gain hands-on experience with Node.js, Express.js, MongoDB and Mongoose.</p>
          <p>My primary interest is frontend development. I like making pages feel smooth and clear across desktop and mobile, while learning how the frontend, backend and database work together in real applications. My projects include e-commerce websites, a task manager and a personal finance dashboard.</p>
          <div className="about-keywords"><span>React & JavaScript</span><span>Responsive UI</span><span>REST APIs</span><span>Git & GitHub</span></div>
          <div className="about-actions"><a className="btn btn-primary" href="#projects">See what I've built ↗</a><a className="text-link" href="#/contact">Contact me <span>↗</span></a></div>
        </div>
        <div className="about-side">
          <div className="mini-card glass reveal"><span className="mini-icon">⌁</span><strong>Jaipur, Rajasthan</strong><small>My home base · India</small></div>
          <div className="mini-card glass reveal"><span className="mini-icon">⌘</span><strong>B.Tech CSE · 2026</strong><small>Shree Balaji College of Engineering & Technology</small></div>
          <div className="mini-card glass reveal"><span className="mini-icon">✦</span><strong>MERN Developer Intern</strong><small>Techno Derivation Pvt Ltd · Since Aug 2026</small></div>
          <div className="mini-card glass reveal"><span className="mini-icon">↗</span><strong>4 live projects</strong><small>Each with a live demo and source code</small></div>
        </div>
      </div>
      <div className="about-focus-header reveal"><span className="section-kicker">HOW I WORK</span><h3>What I bring to a <span className="gradient-text">development project.</span></h3><p>Frontend is my main focus, supported by practical experience with backend APIs and database-driven features.</p></div>
      <div className="about-focus-grid">{focusAreas.map(area => <article className="about-focus-card glass reveal" key={area.index}>
        <div className="about-focus-top"><span className="about-focus-icon" aria-hidden="true">{area.icon}</span><span>{area.index}</span></div>
        <h4>{area.title}</h4><p>{area.detail}</p>
      </article>)}</div>
      <div className="about-journey glass reveal"><div><span className="section-kicker">THE NEXT STEP</span><h3>Open to frontend & MERN development opportunities.</h3><p>I enjoy learning from real projects, collaborating with others and continuing to strengthen my frontend and full-stack skills.</p></div><a className="btn btn-outline" href={RESUME} download>Download my resume ↓</a></div>
    </div></section>
  );
}
