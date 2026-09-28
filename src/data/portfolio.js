import { GITHUB } from "../config";

export const navItems = [
  ["home", "Home"],
  ["about", "About"],
  ["skills", "Skills"],
  ["projects", "Projects"],
  ["experience", "Experience"],
];

export const techTicker = [
  "REACT.JS",
  "JAVASCRIPT",
  "NODE.JS",
  "EXPRESS.JS",
  "MONGODB",
  "RESPONSIVE DESIGN",
];


export const skills = [
  {
    title: "Frontend",
    items: [
      "⚛ React.js",
      "JavaScript (ES6)",
      "HTML5",
      "CSS3",
      "React Router",
      "Responsive Design",
    ],
  },
  {
    title: "Backend & Database",
    items: [
      "Node.js",
      "Express.js",
      "MongoDB",
      "Mongoose",
      "REST APIs",
      "CRUD Operations",
    ],
  },
  {
    title: "Tools & More",
    items: [
      "Git & GitHub",
      "Vite",
      "Postman",
      "VS Code",
      "Recharts",
      "GitHub Pages",
    ],
  },
];


export const projects = [
  {
    id: "mystore",
    title: "MyStore — E-Commerce",
    type: "FULL-STACK / E-COMMERCE",
    category: "Full Stack",

    description:
      "A full-stack online store with product browsing, user accounts, admin workflows and backend API integration.",

    tags: [
      "React.js",
      "Node.js",
      "Express",
      "MongoDB",
    ],

    live:
      "https://mystore-ecommerce-nine.vercel.app/",

    repo:
      `${GITHUB}/mystore-ecommerce`,
  },

  {
    id: "commerce",
    title: "E-Commerce Website",
    type: "FRONTEND / SHOPPING",
    category: "Frontend",

    description:
      "Responsive storefront with product discovery, category navigation, search and reusable components.",

    tags: [
      "React.js",
      "Vite",
      "JavaScript",
      "CSS",
    ],

    live:
      "https://virendrasinghshekhawat080.github.io/ecommerce-sit/",

    repo:
      `${GITHUB}/ecommerce-sit`,
  },

  {
    id: "task",
    title: "TaskFlow — Task Manager",
    type: "FRONTEND / PRODUCTIVITY",
    category: "Frontend",

    description:
      "Add, edit, complete, search and filter tasks with local storage persistence and helpful feedback.",

    tags: [
      "React.js",
      "Vite",
      "localStorage",
      "Toastify",
    ],

    live:
      "https://virendrasinghshekhawat080.github.io/TaskFlow/",

    repo:
      `${GITHUB}/TaskFlow`,
  },

  {
    id: "expense",
    title: "Expense Tracker",
    type: "FRONTEND / FINANCE",
    category: "Frontend",

    description:
      "Personal finance dashboard with expense categories, search, persistent data and spending visualizations.",

    tags: [
      "React.js",
      "Recharts",
      "JavaScript",
      "localStorage",
    ],

    live:
      "https://virendrasinghshekhawat080.github.io/Expense-Tracker/",

    repo:
      `${GITHUB}/Expense-Tracker`,
  },
];
