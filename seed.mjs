const BASE = "http://localhost:3001";

async function getToken() {
  const res = await fetch(BASE + "/api/users/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "mccullca1@gmail.com", password: "admin123" }) });
  return (await res.json()).token;
}

async function api(path, token, body) {
  const res = await fetch(BASE + path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "JWT " + token }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) console.error("ERR " + path, JSON.stringify(data));
  return data;
}

async function main() {
  const token = await getToken();
  console.log("Authenticated");

  // 1. Create the portfolio site
  console.log("\nCreating portfolio site...");
  const siteRes = await api("/api/sites", token, {
    name: "Cameron McCullough Portfolio",
    slug: "portfolio",
    domain: "http://localhost:3000",
    active: true,
    branding: { primaryColor: "#6366f1" },
  });
  const siteId = siteRes.doc?.id;
  const apiKey = siteRes.doc?.apiKey;
  console.log("  Site ID:", siteId);
  console.log("  API Key:", apiKey);

  // 2. Seed globals
  console.log("\nSeeding globals...");

  await api("/api/site-globals", token, {
    site: siteId,
    key: "hero",
    data: {
      name: "Cameron McCullough",
      subtitle: "Cybersecurity & IT student at Southern Illinois University — building practical solutions and solving real problems.",
      roles: ["Software Developer", "Tech Enthusiast", "Problem Solver", "Cybersecurity Student"],
      imageSrc: "/cameron.jpg",
      socialLinks: [
        { label: "LinkedIn", url: "https://linkedin.com" },
        { label: "GitHub", url: "https://github.com" },
        { label: "Email", url: "mailto:cameron.mccullough@siu.edu" },
      ],
    },
  });
  console.log("  Hero seeded");

  await api("/api/site-globals", token, {
    site: siteId,
    key: "about",
    data: {
      label: "About",
      title: "I'm Cameron.",
      subtitle: "Cybersecurity & IT student at Southern Illinois University — building practical solutions and solving real problems.",
      bioHeading: "I'm a versatile developer who builds practical solutions — from training simulations to help desk systems to research tools. I focus on clean code, smart problem-solving, and real impact.",
      bioBody: "Bringing ideas to life with purpose and precision — whether it's cybersecurity, IT support, or software — I've got it covered, delivering smooth and effective solutions from start to finish.",
      services: [
        { number: "01", title: "Software Development", description: "Building practical applications that solve real problems — from interactive training simulations to automation tools that streamline workflows.", items: ["Python Development", "Web Applications", "Training Simulations", "Automation & Scripting", "Database Management", "API Integration"] },
        { number: "02", title: "Cybersecurity & IT", description: "Protecting systems and supporting users through hands-on troubleshooting, network security, and proactive IT solutions at SalukiTech.", items: ["Network Security", "System Administration", "Help Desk Support", "Troubleshooting", "Security Auditing", "Infrastructure Management"] },
      ],
    },
  });
  console.log("  About seeded");

  await api("/api/site-globals", token, {
    site: siteId,
    key: "contact",
    data: {
      label: "Contact",
      title: "Let's work together.",
      subtitle: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of something great.",
      email: "cameron.mccullough@siu.edu",
      location: "Southern Illinois University",
      locationDetail: "Carbondale, IL 62901",
      socials: [
        { label: "LinkedIn", url: "https://linkedin.com" },
        { label: "GitHub", url: "https://github.com" },
      ],
    },
  });
  console.log("  Contact seeded");

  // 3. Seed projects
  console.log("\nSeeding projects...");
  const projects = [
    { title: "2D Training Simulation", slug: "2d-training-simulation", number: "01", description: "Built an interactive training simulation for educational purposes, combining game design principles with practical learning outcomes.", longDescription: "Developed a fully interactive 2D training simulation using Python and Pygame, designed to teach users through hands-on scenarios.", tags: [{ tag: "Python" }, { tag: "Game Design" }, { tag: "Education" }], year: "2024", highlights: [{ highlight: "Built with Python and Pygame for cross-platform compatibility" }, { highlight: "Implemented progressive difficulty scaling" }, { highlight: "Designed intuitive UI with real-time visual feedback" }, { highlight: "Created modular scenario system for easy content expansion" }, { highlight: "Integrated scoring and progress tracking system" }], status: "published" },
    { title: "Help Desk System", slug: "help-desk-system", number: "02", description: "Improved the SalukiTech help desk system to streamline troubleshooting and enhance the support experience.", longDescription: "Worked on improving the SalukiTech help desk system at Southern Illinois University, focusing on streamlining the troubleshooting workflow.", tags: [{ tag: "IT Support" }, { tag: "Systems" }, { tag: "UX" }], year: "2024", highlights: [{ highlight: "Streamlined ticketing workflow reducing average resolution time" }, { highlight: "Improved user interface for both support staff and end users" }, { highlight: "Implemented categorization system for faster issue routing" }, { highlight: "Created documentation and knowledge base articles" }, { highlight: "Collaborated with IT team on system architecture improvements" }], status: "published" },
    { title: "Research Parts Design", slug: "research-parts-design", number: "03", description: "Designed and machined precision parts for university research projects, bridging engineering and technology.", longDescription: "Designed and machined precision parts for university research projects at Southern Illinois University.", tags: [{ tag: "Engineering" }, { tag: "CAD" }, { tag: "Research" }], year: "2023", highlights: [{ highlight: "Created detailed CAD models with precise specifications" }, { highlight: "Machined parts using CNC and manual equipment" }, { highlight: "Maintained tight tolerances for research-grade components" }, { highlight: "Collaborated with research teams on design requirements" }, { highlight: "Documented fabrication processes for reproducibility" }], status: "published" },
  ];

  for (const p of projects) {
    await api("/api/projects", token, { ...p, site: siteId });
    console.log("  Project: " + p.title);
  }

  console.log("\n✅ Done! CMS seeded with portfolio content.");
  console.log("   CMS Admin: http://localhost:3001/admin");
  console.log("   API Key:  ", apiKey);
  console.log("\n   Use this API key in your portfolio's .env.local:");
  console.log(`   CMS_URL=http://localhost:3001`);
  console.log(`   CMS_API_KEY=${apiKey}`);
}

main().catch(console.error);
