const BASE = "http://localhost:3001";

async function getToken() {
  const res = await fetch(BASE + "/api/users/login", { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ email: "mccullca1@gmail.com", password: "admin123" }) 
  });
  return (await res.json()).token;
}

async function main() {
  const token = await getToken();
  
  // Get sites
  const sitesRes = await fetch(BASE + "/api/sites", {
    headers: { Authorization: "JWT " + token }
  });
  const sites = await sitesRes.json();
  console.log("Sites:");
  sites.docs.forEach(s => console.log(`  ID: ${s.id}, Name: ${s.name}, Slug: ${s.slug}`));
  
  // Get pages
  const pagesRes = await fetch(BASE + "/api/pages?depth=1", {
    headers: { Authorization: "JWT " + token }
  });
  const pages = await pagesRes.json();
  console.log("\nPages:");
  pages.docs.forEach(p => {
    const siteId = typeof p.site === 'object' ? p.site.id : p.site;
    console.log(`  ID: ${p.id}, Title: ${p.title}, Slug: ${p.slug}, Site: ${siteId}`);
  });
}

main().catch(console.error);
