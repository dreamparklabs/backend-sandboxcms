import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Public content API for external sites.
 * 
 * Authentication: x-api-key header (matches a site's apiKey)
 * 
 * Query params:
 *   type     - "global" | "collection" (required)
 *   key      - global key (e.g. "hero") or collection slug (e.g. "projects")
 *   slug     - for fetching a single document by slug
 *   status   - filter by status (default: "published")
 *   limit    - pagination limit
 *   page     - pagination page
 *   sort     - sort field
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const payload = await getPayload({ config });

  // Look up the site by API key
  const { docs: sites } = await payload.find({
    collection: "sites",
    where: { apiKey: { equals: apiKey }, active: { equals: true } },
    limit: 1,
  });

  if (sites.length === 0) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  const site = sites[0];
  const siteId = site.id;

  const url = req.nextUrl;
  const type = url.searchParams.get("type");
  const key = url.searchParams.get("key");

  if (!type || !key) {
    return NextResponse.json({ error: "Missing required params: type, key" }, { status: 400 });
  }

  try {
    if (type === "global") {
      const { docs } = await payload.find({
        collection: "site-globals",
        where: {
          site: { equals: siteId },
          key: { equals: key },
        },
        limit: 1,
      });

      if (docs.length === 0) {
        return NextResponse.json({ error: `Global '${key}' not found` }, { status: 404 });
      }

      return NextResponse.json({ data: docs[0].data });
    }

    if (type === "collection") {
      const slug = url.searchParams.get("slug");
      const status = url.searchParams.get("status") || "published";
      const limit = parseInt(url.searchParams.get("limit") || "100", 10);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const sort = url.searchParams.get("sort") || "createdAt";

      const where: Record<string, { equals: unknown }> = {
        site: { equals: siteId },
      };

      if (status !== "all") {
        where.status = { equals: status };
      }

      if (slug) {
        where.slug = { equals: slug };
      }

      const allowedCollections = ["projects", "pages"];
      if (!allowedCollections.includes(key)) {
        return NextResponse.json({ error: `Collection '${key}' not available via public API` }, { status: 400 });
      }

      const result = await payload.find({
        collection: key as "projects" | "pages",
        where,
        limit,
        page,
        sort,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const docs = result.docs.map(({ site, ...rest }) => rest);

      return NextResponse.json({
        data: docs,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        limit: result.limit,
      });
    }

    return NextResponse.json({ error: "Invalid type. Use 'global' or 'collection'" }, { status: 400 });
  } catch (err) {
    console.error("Content API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
