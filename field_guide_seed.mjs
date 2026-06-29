// field_guide_seed.mjs
// One-off seed: load the Quilter's Field Guide HTML into the
// plan-gated `premium_guides` table. Uses the SERVICE ROLE key
// (bypasses RLS) so it can write. NEVER commit the service-role key.
//
// Run from the folder that contains quilters_field_guide.html:
//
//   $env:SUPABASE_URL="https://sbupkbtvaujvwwslqjnd.supabase.co"   # PowerShell
//   $env:SUPABASE_SERVICE_ROLE_KEY="<your service role key>"
//   node field_guide_seed.mjs
//
// (Get the service role key from Supabase Dashboard → Project Settings
//  → API → service_role. Treat it like a password.)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const HTML_PATH = process.env.GUIDE_HTML || "./quilters_field_guide.html";
let html;
try {
  html = readFileSync(HTML_PATH, "utf8");
} catch (e) {
  console.error(`Couldn't read ${HTML_PATH}:`, e.message);
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { error } = await supabase
  .from("premium_guides")
  .upsert(
    {
      slug: "field-guide",
      title: "Quilter's Field Guide",
      html,
      min_plan: "basic",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

if (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}

console.log(`Seeded field-guide (${html.length.toLocaleString()} chars). Done.`);
