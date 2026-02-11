const BASE = "http://localhost:3001";

async function getToken() {
  const res = await fetch(BASE + "/api/users/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "mccullca1@gmail.com", password: "admin123" }) });
  return (await res.json()).token;
}

async function api(path, token, body, method = "POST") {
  const res = await fetch(BASE + path, { method, headers: { "Content-Type": "application/json", Authorization: "JWT " + token }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok && res.status !== 409) console.error("ERR " + path, res.status, JSON.stringify(data).slice(0, 200));
  return data;
}

async function main() {
  const token = await getToken();
  console.log("Authenticated\n");

  // Find existing portfolio site
  const sitesRes = await fetch(BASE + "/api/sites?where[slug][equals]=portfolio", { headers: { Authorization: "JWT " + token } });
  const sitesData = await sitesRes.json();
  const siteId = sitesData.docs?.[0]?.id;
  if (!siteId) { console.error("Portfolio site not found! Run seed.mjs first."); return; }
  console.log("Found portfolio site ID:", siteId, "\n");

  // Helper to upsert a global
  async function upsertGlobal(key, data) {
    // Check if exists
    const check = await fetch(BASE + `/api/site-globals?where[site][equals]=${siteId}&where[key][equals]=${key}`, { headers: { Authorization: "JWT " + token } });
    const checkData = await check.json();
    if (checkData.docs?.length > 0) {
      // Update
      await api(`/api/site-globals/${checkData.docs[0].id}`, token, { data }, "PATCH");
      console.log(`  Updated: ${key}`);
    } else {
      // Create
      await api("/api/site-globals", token, { site: siteId, key, data });
      console.log(`  Created: ${key}`);
    }
  }

  // ─── NAVBAR ───
  console.log("Seeding navbar...");
  await upsertGlobal("navbar", {
    siteName: "Cameron McCullough",
    siteNameShort: "CM",
    links: [
      { href: "/about", label: "About" },
      { href: "/projects", label: "Projects" },
      { href: "/contact", label: "Contact" },
    ],
  });

  // ─── FOOTER ───
  console.log("Seeding footer...");
  await upsertGlobal("footer", {
    copyright: "© 2026 Cameron McCullough",
    tagline: "Built with purpose.",
  });

  // ─── HERO (already exists, update with full data) ───
  console.log("Seeding hero...");
  await upsertGlobal("hero", {
    name: "Cameron McCullough",
    subtitle: "Cybersecurity & IT student at Southern Illinois University — building practical solutions and solving real problems.",
    roles: ["Software Developer", "Tech Enthusiast", "Problem Solver", "Cybersecurity Student"],
    imageSrc: "/cameron.jpg",
    socialLinks: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "GitHub", url: "https://github.com" },
      { label: "Email", url: "mailto:cameron.mccullough@siu.edu" },
    ],
  });

  // ─── INTRO (About component on homepage) ───
  console.log("Seeding intro...");
  await upsertGlobal("intro", {
    sectionLabel: "Intro",
    heading: "I'm a versatile <strong class=\"text-accent\">developer who builds practical solutions</strong> — from training simulations to help desk systems to research tools. I focus on clean code, smart problem-solving, and real impact.",
    body: "Bringing ideas to life with purpose and precision — whether it's cybersecurity, IT support, or software — I've got it covered, delivering smooth and effective solutions from start to finish.",
    ctaText: "See my Work",
    ctaHref: "#projects",
  });

  // ─── SERVICES / SKILLS ───
  console.log("Seeding services...");
  await upsertGlobal("services", {
    sectionLabel: "Services",
    items: [
      {
        number: "01",
        title: "Software Development",
        description: "Building practical applications that solve real problems — from interactive training simulations to automation tools that streamline workflows.",
        skills: ["Python Development", "Web Applications", "Training Simulations", "Automation & Scripting", "Database Management", "API Integration"],
      },
      {
        number: "02",
        title: "Cybersecurity & IT",
        description: "Protecting systems and supporting users through hands-on troubleshooting, network security, and proactive IT solutions at SalukiTech.",
        skills: ["Network Security", "System Administration", "Help Desk Support", "Troubleshooting", "Security Auditing", "Infrastructure Management"],
      },
    ],
  });

  // ─── PROJECTS SECTION (homepage preview) ───
  console.log("Seeding projectsSection...");
  await upsertGlobal("projectsSection", {
    sectionLabel: "Projects",
    heading: "Selected Work",
  });

  // ─── CONTACT SECTION (homepage) ───
  console.log("Seeding contactSection...");
  await upsertGlobal("contactSection", {
    sectionLabel: "Contact",
    heading: "Let's work together.",
    body: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of something great.",
    email: "cameron.mccullough@siu.edu",
    location: "Southern Illinois University",
    locationDetail: "Carbondale, IL 62901",
    socials: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "GitHub", url: "https://github.com" },
    ],
    ctaText: "Send Me an Email",
  });

  // ─── ABOUT PAGE ───
  console.log("Seeding about...");
  await upsertGlobal("about", {
    label: "About",
    title: "I'm Cameron.",
    subtitle: "Cybersecurity & IT student at Southern Illinois University — building practical solutions and solving real problems.",
    bioHeading: "I'm a versatile developer who builds practical solutions — from training simulations to help desk systems to research tools. I focus on clean code, smart problem-solving, and real impact.",
    bioBody: "Bringing ideas to life with purpose and precision — whether it's cybersecurity, IT support, or software — I've got it covered, delivering smooth and effective solutions from start to finish.",
    services: [
      { number: "01", title: "Software Development", description: "Building practical applications that solve real problems — from interactive training simulations to automation tools that streamline workflows.", items: ["Python Development", "Web Applications", "Training Simulations", "Automation & Scripting", "Database Management", "API Integration"] },
      { number: "02", title: "Cybersecurity & IT", description: "Protecting systems and supporting users through hands-on troubleshooting, network security, and proactive IT solutions at SalukiTech.", items: ["Network Security", "System Administration", "Help Desk Support", "Troubleshooting", "Security Auditing", "Infrastructure Management"] },
    ],
  });

  // ─── CONTACT PAGE ───
  console.log("Seeding contact...");
  await upsertGlobal("contact", {
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
  });

  console.log("\n✅ All globals seeded!");
}

main().catch(console.error);
