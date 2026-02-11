import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

const isProduction = process.env.NODE_ENV === "production";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Require DATABASE_URL in production
if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in production");
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "cms-admin-secret-change-in-production",

  admin: {
    user: "users",
    meta: {
      titleSuffix: " — CMS Admin",
    },
  },

  cors: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    process.env.PORTFOLIO_URL,
    process.env.CMS_PLATFORM_URL,
    process.env.ALLOWED_ORIGINS?.split(","),
  ].flat().filter(Boolean) as string[],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/cms",
    },
    push: !isProduction,
  }),

  editor: lexicalEditor(),

  collections: [
    // ─── Users (admin auth) ───
    {
      slug: "users",
      auth: true,
      admin: {
        useAsTitle: "email",
        group: "Admin",
      },
      fields: [
        {
          name: "name",
          type: "text",
        },
        {
          name: "role",
          type: "select",
          options: [
            { label: "Super Admin", value: "super-admin" },
            { label: "Site Admin", value: "site-admin" },
            { label: "Editor", value: "editor" },
          ],
          defaultValue: "editor",
          required: true,
        },
        {
          name: "sites",
          type: "relationship",
          relationTo: "sites",
          hasMany: true,
          admin: {
            description: "Which sites this user can manage (leave empty for all sites if super-admin)",
          },
        },
      ],
    },

    // ─── Sites (multi-site registry) ───
    {
      slug: "sites",
      admin: {
        useAsTitle: "name",
        group: "Admin",
        description: "Websites managed by this CMS",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: {
            description: "Unique identifier (e.g. 'portfolio', 'client-site')",
          },
        },
        {
          name: "domain",
          type: "text",
          admin: {
            description: "Production domain (e.g. https://cameronmccullough.com)",
          },
        },
        {
          name: "apiKey",
          type: "text",
          admin: {
            position: "sidebar",
            description: "API key for this site to authenticate requests",
            readOnly: true,
          },
          hooks: {
            beforeValidate: [
              ({ value, operation }) => {
                if (operation === "create" && !value) {
                  return `cms_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")}`;
                }
                return value;
              },
            ],
          },
        },
        {
          name: "branding",
          type: "group",
          admin: {
            description: "White-label branding for this site's admin experience",
          },
          fields: [
            {
              name: "primaryColor",
              type: "text",
              defaultValue: "#6366f1",
              admin: { description: "Primary brand color (hex)" },
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "favicon",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        {
          name: "active",
          type: "checkbox",
          defaultValue: true,
          admin: { position: "sidebar" },
        },
      ],
    },

    // ─── Pages (site-scoped) ───
    {
      slug: "pages",
      admin: {
        useAsTitle: "title",
        group: "Content",
        defaultColumns: ["title", "site", "slug", "updatedAt"],
      },
      fields: [
        {
          name: "site",
          type: "relationship",
          relationTo: "sites",
          required: true,
          admin: { position: "sidebar" },
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          admin: { position: "sidebar" },
        },
        {
          name: "sections",
          type: "array",
          admin: { description: "Page sections / content blocks" },
          fields: [
            {
              name: "key",
              type: "text",
              required: true,
              admin: { description: "Section identifier (e.g. 'hero', 'bio', 'services')" },
            },
            {
              name: "data",
              type: "json",
              required: true,
              admin: { description: "Section data as JSON" },
            },
          ],
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
          defaultValue: "draft",
          admin: { position: "sidebar" },
        },
      ],
    },

    // ─── Projects (site-scoped) ───
    {
      slug: "projects",
      admin: {
        useAsTitle: "title",
        group: "Content",
        defaultColumns: ["title", "site", "number", "year"],
      },
      fields: [
        {
          name: "site",
          type: "relationship",
          relationTo: "sites",
          required: true,
          admin: { position: "sidebar" },
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          admin: { position: "sidebar" },
        },
        {
          name: "number",
          type: "text",
          admin: { position: "sidebar" },
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          admin: { description: "Short description shown in project lists" },
        },
        {
          name: "overview",
          type: "textarea",
          admin: { description: "Detailed overview shown on the project detail page" },
        },
        {
          name: "tags",
          type: "array",
          fields: [{ name: "tag", type: "text", required: true }],
        },
        {
          name: "year",
          type: "text",
        },
        {
          name: "highlights",
          type: "array",
          fields: [{ name: "highlight", type: "text", required: true }],
        },
        {
          name: "links",
          type: "group",
          admin: { description: "External links for this project" },
          fields: [
            {
              name: "github",
              type: "text",
              admin: { description: "GitHub repository URL" },
            },
            {
              name: "live",
              type: "text",
              admin: { description: "Live project/demo URL" },
            },
            {
              name: "caseStudy",
              type: "text",
              admin: { description: "Case study or blog post URL" },
            },
          ],
        },
        {
          name: "madeAt",
          type: "text",
          admin: { description: "Company or organization (e.g., 'Upstatement', 'Freelance')" },
        },
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: { position: "sidebar", description: "Show in featured projects section" },
        },
        {
          name: "status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
          defaultValue: "published",
          admin: { position: "sidebar" },
        },
      ],
    },

    // ─── Globals (site-scoped key-value store) ───
    {
      slug: "site-globals",
      admin: {
        useAsTitle: "key",
        group: "Content",
        description: "Site-scoped global settings (hero, about, contact, etc.)",
        defaultColumns: ["key", "site", "updatedAt"],
      },
      fields: [
        {
          name: "site",
          type: "relationship",
          relationTo: "sites",
          required: true,
          admin: { position: "sidebar" },
        },
        {
          name: "key",
          type: "text",
          required: true,
          admin: { description: "Global identifier (e.g. 'hero', 'about', 'contact')" },
        },
        {
          name: "data",
          type: "json",
          required: true,
          admin: { description: "Global data as JSON" },
        },
      ],
    },

    // ─── Media ───
    {
      slug: "media",
      admin: {
        group: "Content",
      },
      upload: {
        staticDir: path.resolve(dirname, "../public/media"),
        mimeTypes: ["image/*"],
      },
      fields: [
        {
          name: "alt",
          type: "text",
        },
        {
          name: "site",
          type: "relationship",
          relationTo: "sites",
          admin: { position: "sidebar" },
        },
      ],
    },
  ],

  // No Payload globals — we use the site-globals collection for multi-site support
  globals: [],

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
