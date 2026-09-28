import { useState } from 'react';
import { EMAIL, PHONE, SOCIALS, WHATSAPP } from './config';

const empty = { name: '', email: '', subject: '', message: '' };
export default function ContactPage() {
  const [form, setForm] = useState(empty);
  const [notice, setNotice] = useState('');
  const edit = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const valid = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) { setNotice('Please fill in your name, subject and message.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setNotice('Please enter a valid email address.'); return false; }
    setNotice(''); return true;
  };
  const send = (channel) => {
    if (!valid()) return;
    const text = `Hello Virendra,\n\n${form.message.trim()}\n\nFrom: ${form.name.trim()}\nEmail: ${form.email.trim()}\nSubject: ${form.subject.trim()}`;
    if (channel === 'email') {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(form.subject.trim())}&body=${encodeURIComponent(text)}`;
      setNotice('Your email app is opening. Please press Send there to deliver your message.');
    } else {
      window.open(`https://wa.me/91${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      setNotice('WhatsApp is opening. Please press Send there to deliver your message.');
    }
  };

  return <div className="contact-page" id="contact-page">
    <div className="contact-orb contact-orb-one" aria-hidden="true" /><div className="contact-orb contact-orb-two" aria-hidden="true" />
    <div className="wrap contact-page-inner">
      <div className="contact-hero"><a className="back-home" href="#home">← Back to portfolio</a><span className="section-kicker">LET'S CONNECT · 05 / CONTACT</span>
        <h1>Have an idea? <br/><span className="gradient-text">Let's build it.</span></h1>
        <p>Open to frontend and MERN Stack opportunities, collaborations and conversations about building great digital experiences.</p>
        <div className="contact-availability"><span className="pulse-dot"/> Available for opportunities <span className="contact-availability-separator">/</span> Jaipur, India</div>
      </div>
      <div className="contact-page-grid">
        <div className="contact-form-card glass"><div className="contact-card-heading"><span className="contact-overline">01 — SEND A MESSAGE</span><h2>Tell me about <span className="gradient-text">your project.</span></h2><p>Fill out your details and choose how you want to send your message.</p></div>
          <form onSubmit={(event)=>{event.preventDefault(); send('email');}}>
            <div className="form-two"><label>Your name <span>*</span><input name="name" value={form.name} onChange={edit} placeholder="Your full name" autoComplete="name" required maxLength={100}/></label><label>Email address <span>*</span><input type="email" name="email" value={form.email} onChange={edit} placeholder="you@example.com" autoComplete="email" required maxLength={160}/></label></div>
            <label>Subject <span>*</span><input name="subject" value={form.subject} onChange={edit} placeholder="Let's work together" required maxLength={150}/></label>
            <label>Message <span>*</span><textarea rows="6" name="message" value={form.message} onChange={edit} placeholder="Tell me about your idea, project or opportunity..." required minLength={2} maxLength={4000}/></label>
            <div className="form-actions"><button type="submit" className="btn btn-primary">Send via email ↗</button><button type="button" className="btn btn-outline" onClick={()=>send('whatsapp')}>Send via WhatsApp ↗</button></div>
            <p className="form-notice" role="status" aria-live="polite">{notice || 'No backend is required: your email app or WhatsApp opens with your message. You must press Send there.'}</p>
          </form>
        </div>
        <aside className="contact-side">
          <div className="contact-direct-card glass"><span className="contact-overline">02 — DIRECT CONTACT</span><h3>Prefer a quick chat?</h3><p>Reach out on your preferred platform. All links open your profile or conversation.</p><a className="contact-direct-link" href={WHATSAPP} target="_blank" rel="noopener noreferrer"><span className="contact-platform-icon">✳</span><span><strong>WhatsApp me</strong><small>+91 {PHONE}</small></span><b>↗</b></a><a className="contact-direct-link" href={`mailto:${EMAIL}`}><span className="contact-platform-icon">✉</span><span><strong>Send an email</strong><small>{EMAIL}</small></span><b>↗</b></a>
          </div>
          <div className="contact-social-card glass"><span className="contact-overline">03 — FIND ME ONLINE</span><h3>Let's stay connected.</h3><div className="contact-social-grid">{SOCIALS.filter(item=>!['email','whatsapp'].includes(item.id)).map(item=><a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer"><span className="contact-platform-icon">{item.icon}</span><strong>{item.label}</strong><span>↗</span></a>)}</div><small>Telegram phone links can be limited by account privacy settings.</small></div>
          <div className="contact-voice-teaser"><span className="contact-platform-icon">🎙</span><span>Want hands-free navigation?<br/><strong>Tap the floating voice button and say “Open WhatsApp”.</strong></span></div>
        </aside>
      </div>
      <div className="contact-endline"><span>Let's make something great together.</span><a href="#home">Return to portfolio ↑</a></div>
    </div>
  </div>;
}
