// Update your URLs once here; all social buttons and voice commands use these values.
export const GITHUB = 'https://github.com/virendrasinghshekhawat080';
export const LINKEDIN = 'https://www.linkedin.com/in/virendra-singh-shekhawat22';
export const INSTAGRAM = 'https://www.instagram.com/virendrasinghshekhawat080/';
export const TELEGRAM = 'https://t.me/+919521051315'; // A public t.me/username is more reliable than a phone-number link.
export const EMAIL = 'virendrasinghshekhawat080@gmail.com';
export const PHONE = '9521051315';
export const WHATSAPP = `https://wa.me/91${PHONE}?text=${encodeURIComponent('Hi Virendra, I saw your portfolio and would like to connect.')}`;
export const RESUME = `${(import.meta.env?.BASE_URL || "/")}assets/Virendra_Singh_Shekhawat_Resume.pdf`;
export const SOCIALS = [
  { id: 'github', label: 'GitHub', icon: '⌘', href: GITHUB, detail: 'Explore my code' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in', href: LINKEDIN, detail: 'Let’s connect' },
  { id: 'instagram', label: 'Instagram', icon: '◎', href: INSTAGRAM, detail: 'Follow my updates' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '✳', href: WHATSAPP, detail: 'Chat with me' },
  { id: 'telegram', label: 'Telegram', icon: '➤', href: TELEGRAM, detail: 'Send a message' },
  { id: 'email', label: 'Email', icon: '✉', href: `mailto:${EMAIL}`, detail: EMAIL },
];
export const PROJECTS = [
  { id: 'mystore', title: 'MyStore — E-Commerce', live: 'https://mystore-ecommerce-nine.vercel.app/', repo: `${GITHUB}/mystore-ecommerce` },
  { id: 'commerce', title: 'E-Commerce Website', live: 'https://virendrasinghshekhawat080.github.io/ecommerce-sit/', repo: `${GITHUB}/ecommerce-sit` },
  { id: 'task', title: 'TaskFlow — Task Manager', live: 'https://virendrasinghshekhawat080.github.io/TaskFlow/', repo: `${GITHUB}/TaskFlow` },
  { id: 'expense', title: 'Expense Tracker', live: 'https://virendrasinghshekhawat080.github.io/Expense-Tracker/', repo: `${GITHUB}/Expense-Tracker` },
];
