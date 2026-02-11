const BASE = "https://sandboxcms-production.up.railway.app";

async function getToken() {
  const res = await fetch(BASE + "/api/users/login", { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ email: "mccullca1@gmail.com", password: "@CamSyd0922Grad2028!" }) 
  });
  return (await res.json()).token;
}

async function main() {
  const token = await getToken();
  console.log("Authenticated\n");

  // Find portfolio site
  const sitesRes = await fetch(BASE + "/api/sites?where[slug][equals]=portfolio", { 
    headers: { Authorization: "JWT " + token } 
  });
  const sitesData = await sitesRes.json();
  const siteId = sitesData.docs?.[0]?.id;
  
  if (!siteId) { 
    console.error("Portfolio site not found!"); 
    return; 
  }
  console.log("Found portfolio site ID:", siteId, "\n");

  // Check if analytics global exists
  const checkRes = await fetch(
    BASE + `/api/site-globals?where[site][equals]=${siteId}&where[key][equals]=analytics`, 
    { headers: { Authorization: "JWT " + token } }
  );
  const checkData = await checkRes.json();

  const analyticsData = {
    googleAnalytics: {
      enabled: false,
      measurementId: "", // e.g., "G-XXXXXXXXXX"
    },
    linkedInInsight: {
      enabled: false,
      partnerId: "", // e.g., "123456"
    },
    metaPixel: {
      enabled: false,
      pixelId: "", // e.g., "1234567890123456"
    },
    googleTagManager: {
      enabled: false,
      containerId: "", // e.g., "GTM-XXXXXXX"
    },
  };

  if (checkData.docs?.length > 0) {
    // Update existing
    const res = await fetch(BASE + `/api/site-globals/${checkData.docs[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "JWT " + token },
      body: JSON.stringify({ data: analyticsData }),
    });
    console.log("Updated analytics global");
  } else {
    // Create new
    const res = await fetch(BASE + "/api/site-globals", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "JWT " + token },
      body: JSON.stringify({ site: siteId, key: "analytics", data: analyticsData }),
    });
    console.log("Created analytics global");
  }

  console.log("\n✅ Analytics global ready!");
  console.log("\nYou can now edit the analytics settings in the CMS admin panel:");
  console.log(BASE + "/admin/collections/site-globals");
  console.log("\nLook for the 'analytics' entry and add your tracking IDs.");
}

main().catch(console.error);
