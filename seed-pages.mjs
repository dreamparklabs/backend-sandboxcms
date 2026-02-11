const BASE = "http://localhost:3001";

async function getToken() {
  const res = await fetch(BASE + "/api/users/login", { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ email: "mccullca1@gmail.com", password: "admin123" }) 
  });
  const data = await res.json();
  if (!data.token) {
    console.error("Login failed:", data);
    throw new Error("Failed to authenticate");
  }
  return data.token;
}

async function api(method, path, token, body) {
  const res = await fetch(BASE + path, { 
    method, 
    headers: { "Content-Type": "application/json", Authorization: "JWT " + token }, 
    body: body ? JSON.stringify(body) : undefined 
  });
  const data = await res.json();
  if (!res.ok) console.error("ERR " + path, JSON.stringify(data));
  return data;
}

async function main() {
  const token = await getToken();
  console.log("✓ Authenticated");

  // Get the portfolio site
  console.log("\nFinding portfolio site...");
  const sitesRes = await api("GET", "/api/sites?where[slug][equals]=portfolio", token);
  
  let siteId;
  if (sitesRes.docs && sitesRes.docs.length > 0) {
    siteId = sitesRes.docs[0].id;
    console.log("  Found site ID:", siteId);
  } else {
    // Create the site if it doesn't exist
    console.log("  Site not found, creating...");
    const siteRes = await api("POST", "/api/sites", token, {
      name: "Cameron McCullough Portfolio",
      slug: "portfolio",
      domain: "http://localhost:3000",
      active: true,
      branding: { primaryColor: "#6366f1" },
    });
    siteId = siteRes.doc?.id;
    console.log("  Created site ID:", siteId);
  }

  // Define the pages
  const pages = [
    {
      title: "Home",
      slug: "/",
      status: "published",
      sections: [
        {
          key: "hero",
          data: {
            type: "hero",
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
        },
      ],
    },
    {
      title: "About",
      slug: "/about",
      status: "published",
      sections: [
        {
          key: "about-hero",
          data: {
            type: "about-hero",
            label: "About",
            title: "I'm Cameron.",
            subtitle: "Cybersecurity & IT student at Southern Illinois University — building practical solutions and solving real problems.",
          },
        },
        {
          key: "bio",
          data: {
            type: "bio",
            heading: "I'm a versatile developer who builds practical solutions — from training simulations to help desk systems to research tools. I focus on clean code, smart problem-solving, and real impact.",
            body: "Bringing ideas to life with purpose and precision — whether it's cybersecurity, IT support, or software — I've got it covered, delivering smooth and effective solutions from start to finish.",
          },
        },
        {
          key: "services",
          data: {
            type: "services",
            items: [
              { 
                number: "01", 
                title: "Software Development", 
                description: "Building practical applications that solve real problems — from interactive training simulations to automation tools that streamline workflows.",
                items: ["Python Development", "Web Applications", "Training Simulations", "Automation & Scripting", "Database Management", "API Integration"]
              },
              { 
                number: "02", 
                title: "Cybersecurity & IT", 
                description: "Protecting systems and supporting users through hands-on troubleshooting, network security, and proactive IT solutions at SalukiTech.",
                items: ["Network Security", "System Administration", "Help Desk Support", "Troubleshooting", "Security Auditing", "Infrastructure Management"]
              },
            ],
          },
        },
      ],
    },
    {
      title: "Projects",
      slug: "/projects",
      status: "published",
      sections: [
        {
          key: "projects-hero",
          data: {
            type: "projects-hero",
            label: "Projects",
            title: "Selected Work",
            subtitle: "A collection of projects I've worked on, from training simulations to IT systems.",
          },
        },
        {
          key: "projects-list",
          data: {
            type: "projects-list",
            showAll: true,
          },
        },
      ],
    },
    {
      title: "Contact",
      slug: "/contact",
      status: "published",
      sections: [
        {
          key: "contact-hero",
          data: {
            type: "contact-hero",
            label: "Contact",
            title: "Let's work together.",
            subtitle: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of something great.",
          },
        },
        {
          key: "contact-info",
          data: {
            type: "contact-info",
            email: "cameron.mccullough@siu.edu",
            location: "Southern Illinois University",
            locationDetail: "Carbondale, IL 62901",
            socials: [
              { label: "LinkedIn", url: "https://linkedin.com" },
              { label: "GitHub", url: "https://github.com" },
            ],
          },
        },
      ],
    },
    {
      title: "Project Detail Template",
      slug: "/projects/[slug]",
      status: "draft",
      sections: [
        {
          key: "project-header",
          data: {
            type: "project-header",
            showBackLink: true,
            backLinkText: "Back to Projects",
            backLinkUrl: "/projects",
          },
        },
        {
          key: "project-content",
          data: {
            type: "project-content",
            showTitle: true,
            showDescription: true,
            showTags: true,
            showHighlights: true,
            showYear: true,
          },
        },
      ],
    },
  ];

  // Seed the pages
  console.log("\nSeeding pages...");
  for (const page of pages) {
    // Check if page already exists
    const existingRes = await api("GET", `/api/pages?where[site][equals]=${siteId}&where[slug][equals]=${encodeURIComponent(page.slug)}`, token);
    
    if (existingRes.docs && existingRes.docs.length > 0) {
      // Update existing page
      const pageId = existingRes.docs[0].id;
      await api("PATCH", `/api/pages/${pageId}`, token, {
        ...page,
        site: siteId,
      });
      console.log(`  ✓ Updated: ${page.title} (${page.slug})`);
    } else {
      // Create new page
      await api("POST", "/api/pages", token, {
        ...page,
        site: siteId,
      });
      console.log(`  ✓ Created: ${page.title} (${page.slug})`);
    }
  }

  console.log("\n✅ Done! Pages seeded successfully.");
  console.log("   CMS Admin: http://localhost:3001/admin/collections/pages");
  console.log("   CMS Platform: http://localhost:3002");
}

main().catch(console.error);
