/**
 * Production Seed Script for Payload CMS on Railway
 * 
 * Usage: node seed-production.mjs
 * 
 * This script creates:
 * 1. Admin user
 * 2. Portfolio site with API key
 * 3. Sample globals (hero, about, contact)
 * 4. Sample projects
 */

const CMS_URL = "https://sandboxcms-production.up.railway.app";

// Admin credentials
const ADMIN_EMAIL = "mccullca1@gmail.com";
const ADMIN_PASSWORD = "@CamSyd0922Grad2028!";

async function api(endpoint, token, body) {
  const res = await fetch(`${CMS_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `JWT ${token}` }),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${res.status}:`, data);
  }
  return data;
}

async function createUser() {
  console.log("Creating admin user...");
  const res = await fetch(`${CMS_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: "Cameron McCullough",
      role: "super-admin",
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log("✓ Admin user created:", data.doc?.email);
  } else if (data.errors?.[0]?.message?.includes("already")) {
    console.log("→ Admin user already exists");
  } else {
    console.error("✗ Failed to create user:", data);
  }
}

async function getToken() {
  console.log("Logging in...");
  const res = await fetch(`${CMS_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
  }
  console.log("✓ Logged in as:", data.user?.email);
  return data.token;
}

async function main() {
  try {
    // Step 1: Create admin user
    await createUser();

    // Step 2: Get auth token
    const token = await getToken();

    // Step 3: Create portfolio site
    console.log("\nCreating portfolio site...");
    const siteRes = await api("/api/sites", token, {
      name: "Cameron McCullough Portfolio",
      slug: "portfolio",
      domain: "https://cameronmccullough.com",
      active: true,
    });
    
    const siteId = siteRes.doc?.id;
    const apiKey = siteRes.doc?.apiKey;
    
    if (siteId) {
      console.log("✓ Site created with ID:", siteId);
      console.log("✓ API Key:", apiKey);
    } else if (siteRes.errors?.[0]?.message?.includes("unique")) {
      console.log("→ Site already exists, fetching...");
      const sitesRes = await fetch(`${CMS_URL}/api/sites?where[slug][equals]=portfolio`, {
        headers: { Authorization: `JWT ${token}` },
      });
      const sites = await sitesRes.json();
      const existingSite = sites.docs?.[0];
      if (existingSite) {
        console.log("✓ Found existing site:", existingSite.id);
        console.log("✓ API Key:", existingSite.apiKey);
        await seedContent(token, existingSite.id);
        return;
      }
    }

    if (siteId) {
      await seedContent(token, siteId);
    }

    console.log("\n========================================");
    console.log("PRODUCTION SEED COMPLETE!");
    console.log("========================================");
    console.log("\nAdmin Panel: " + CMS_URL + "/admin");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("\nAPI Key for portfolio:", apiKey || "(check existing site)");
    console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");

  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

async function seedContent(token, siteId) {
  // Seed globals
  console.log("\nSeeding globals...");
  
  await api("/api/site-globals", token, {
    site: siteId,
    key: "hero",
    data: {
      title: "Cameron McCullough",
      subtitle: "Full-Stack Developer & Designer",
      description: "I build exceptional digital experiences that combine beautiful design with robust engineering.",
      cta: { text: "View My Work", href: "#projects" },
    },
  });
  console.log("✓ Hero global created");

  await api("/api/site-globals", token, {
    site: siteId,
    key: "about",
    data: {
      title: "About Me",
      bio: "I'm a passionate developer with expertise in modern web technologies. I love creating intuitive, performant applications that solve real problems.",
      skills: ["TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "AWS"],
      image: "/cameron.jpg",
    },
  });
  console.log("✓ About global created");

  await api("/api/site-globals", token, {
    site: siteId,
    key: "contact",
    data: {
      title: "Get In Touch",
      email: "hello@cameronmccullough.com",
      socials: {
        github: "https://github.com/campeete2",
        linkedin: "https://linkedin.com/in/cameronmccullough",
      },
    },
  });
  console.log("✓ Contact global created");

  // Seed projects
  console.log("\nSeeding projects...");
  
  const projects = [
    {
      title: "SandboxCMS",
      slug: "sandbox-cms",
      number: "01",
      description: "A modern headless CMS platform built with Payload CMS, featuring multi-site support and a custom admin interface.",
      overview: "SandboxCMS is a powerful content management system designed for developers who need flexibility and control. Built on top of Payload CMS with PostgreSQL, it supports multiple sites from a single installation.",
      tags: [{ tag: "Payload CMS" }, { tag: "Next.js" }, { tag: "PostgreSQL" }, { tag: "TypeScript" }],
      year: "2026",
      highlights: [
        { highlight: "Multi-site architecture" },
        { highlight: "Custom admin dashboard" },
        { highlight: "API-first design" },
      ],
      links: {
        github: "https://github.com/dreamparklabs/SandboxCMS",
        live: "https://sandboxcms-production.up.railway.app",
      },
      featured: true,
      status: "published",
    },
    {
      title: "Portfolio Website",
      slug: "portfolio",
      number: "02",
      description: "Personal portfolio showcasing projects and skills, powered by a headless CMS.",
      overview: "A modern, responsive portfolio built with Next.js and powered by SandboxCMS. Features smooth animations, dark mode, and dynamic content management.",
      tags: [{ tag: "Next.js" }, { tag: "React" }, { tag: "Tailwind CSS" }, { tag: "Framer Motion" }],
      year: "2026",
      highlights: [
        { highlight: "CMS-powered content" },
        { highlight: "Responsive design" },
        { highlight: "Smooth animations" },
      ],
      links: {
        github: "https://github.com/campeete2/cam-portfolio",
        live: "https://cameronmccullough.com",
      },
      featured: true,
      status: "published",
    },
  ];

  for (const project of projects) {
    await api("/api/projects", token, { ...project, site: siteId });
    console.log(`✓ Project created: ${project.title}`);
  }
}

main();
