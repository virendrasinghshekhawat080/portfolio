// A short overview gives visitors useful context before the detailed About section.
export default function HomeHighlights() {
  const highlights = [
    { number: '01', icon: '◈', title: 'Frontend development', description: 'Responsive React interfaces, reusable components, JavaScript and modern CSS.', href: '#skills', link: 'Explore skills' },
    { number: '02', icon: '⌘', title: 'Full-stack integration', description: 'Hands-on experience with Node.js, Express.js, REST APIs, MongoDB and Mongoose.', href: '#experience', link: 'My experience' },
    { number: '03', icon: '↗', title: 'Real projects', description: 'Explore four live applications, from e-commerce storefronts to productivity and finance tools.', href: '#projects', link: 'View projects' },
  ];
  return <section className="home-highlights" aria-label="What I build"><div className="wrap">
    <div className="home-highlights-heading reveal"><span className="section-kicker">MY WORK AT A GLANCE</span><h2>Design-minded frontend.<br/><span className="gradient-text">Practical full-stack skills.</span></h2><p>Building web experiences that work across screens and connect to real application features.</p></div>
    <div className="home-highlight-grid">{highlights.map((item) => <article className="home-highlight-card glass reveal" key={item.number}>
      <div className="home-highlight-top"><span className="home-highlight-icon" aria-hidden="true">{item.icon}</span><span className="home-highlight-num">{item.number} / 03</span></div>
      <h3>{item.title}</h3><p>{item.description}</p><a href={item.href}>{item.link} <span aria-hidden="true">↗</span></a>
    </article>)}</div>
  </div></section>;
}
