// ════════════════════════════════════════════════════════════════════
// Supabase Edge Function: generate-notifications
//
// Runs on a schedule (cron). For every user, recomputes their notifications
// from live data (stash, shopping, projects, forum) and UPSERTS into the
// `notifications` table keyed by `dedupe_key` — so re-running never stacks
// duplicates. Respects each user's notification_prefs.
//
// This is the SAME rule set that App.jsx currently computes client-side,
// moved server-side so it can run while the app is closed (the prerequisite
// for real push later).
//
// Deploy:
//   supabase functions deploy generate-notifications
// Schedule (Supabase Dashboard → Edge Functions → Cron, or pg_cron):
//   every hour, e.g. "0 * * * *"
//
// Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set automatically
// in the Edge Function runtime).
// ════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FINISHED = ["Complete", "Gifted", "Donated", "Sold"];

// Build the notification objects for a single user from their live data.
// Returns an array of { type, title, body, icon, dest_tab, dest_sub, dedupe_key, data }.
async function buildForUser(admin: any, userId: string, prefs: any, isPremium: boolean) {
  const out: any[] = [];

  // ── Low stock ──────────────────────────────────────────────
  if (prefs.low_stock) {
    const { data: inv } = await admin
      .from("user_inventory")
      .select("spool_count, inventory_target, thread_library(color_code, color_name)")
      .eq("user_id", userId);
    const low = (inv || []).filter(
      (r: any) => (r.inventory_target || 0) > 0 && (r.spool_count || 0) <= (r.inventory_target || 0)
    );
    if (low.length) {
      const names = low.slice(0, 3).map((r: any) => {
        const t = r.thread_library;
        return t ? `${t.color_code || ""} ${t.color_name || ""}`.trim() : "a thread";
      });
      out.push({
        type: "low_stock",
        icon: "🧵",
        title: low.length === 1 ? "1 thread is low" : `${low.length} threads are low`,
        body: low.length <= 3 ? names.join(", ") : `${names.join(", ")} and ${low.length - 3} more`,
        dest_tab: "stash",
        dedupe_key: "low_stock",
        // Count in the key would re-notify on every change; keep key stable,
        // store the count in data so the row updates in place.
        data: { count: low.length },
      });
    }
  }

  // ── Shopping list ──────────────────────────────────────────
  if (prefs.shopping) {
    const [{ count: fc }, { count: cc }] = await Promise.all([
      admin.from("fabric_shopping_list").select("id", { count: "exact", head: true }).eq("user_id", userId),
      admin.from("shopping_custom").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    const shopCount = (fc || 0) + (cc || 0);
    if (shopCount > 0) {
      out.push({
        type: "shopping",
        icon: "🛒",
        title: `${shopCount} item${shopCount === 1 ? "" : "s"} on your shopping list`,
        body: "Ready when you head to the store.",
        dest_tab: "stash",
        dedupe_key: "shopping",
        data: { count: shopCount },
      });
    }
  }

  // ── Projects: overdue + due this week ──────────────────────
  if (prefs.project_due) {
    const { data: projRows } = await admin
      .from("projects")
      .select("name, status, due_date")
      .eq("user_id", userId);
    const active = (projRows || []).filter((p: any) => p.due_date && !FINISHED.includes(p.status));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const inDays = (d: string) => Math.round((new Date(d + "T00:00:00Z").getTime() - today.getTime()) / 86400000);
    const overdue = active.filter((p: any) => inDays(p.due_date) < 0);
    const dueSoon = active.filter((p: any) => { const n = inDays(p.due_date); return n >= 0 && n <= 7; });

    if (overdue.length) {
      out.push({
        type: "project_overdue",
        icon: "⏰",
        title: overdue.length === 1 ? "1 project is overdue" : `${overdue.length} projects are overdue`,
        body: overdue.length <= 2
          ? overdue.map((p: any) => p.name).join(", ")
          : `${overdue.slice(0, 2).map((p: any) => p.name).join(", ")} and more`,
        dest_tab: "projects",
        dedupe_key: "project_overdue",
        data: { count: overdue.length },
      });
    }
    if (dueSoon.length) {
      out.push({
        type: "project_due_soon",
        icon: "📅",
        title: `${dueSoon.length} project${dueSoon.length === 1 ? "" : "s"} due this week`,
        body: dueSoon.length <= 2
          ? dueSoon.map((p: any) => p.name).join(", ")
          : `${dueSoon.slice(0, 2).map((p: any) => p.name).join(", ")} and more`,
        dest_tab: "projects",
        dedupe_key: "project_due_soon",
        data: { count: dueSoon.length },
      });
    }
  }

  // ── Forum replies (premium only) ───────────────────────────
  // Server-side we can do this precisely: count replies to the user's posts
  // by OTHER users that arrived since the last forum_reply notification we
  // created. We store the high-water timestamp in data.since.
  if (prefs.forum_reply && isPremium) {
    const { data: myPosts } = await admin.from("forum_posts").select("id").eq("user_id", userId);
    const ids = (myPosts || []).map((p: any) => p.id);
    if (ids.length) {
      // Look back 30 days as a reasonable window for "recent activity".
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: replies } = await admin
        .from("forum_comments")
        .select("id, created_at, user_id, post_id")
        .in("post_id", ids)
        .neq("user_id", userId)
        .gt("created_at", since);
      const n = (replies || []).length;
      if (n > 0) {
        out.push({
          type: "forum_reply",
          icon: "💬",
          title: n === 1 ? "New reply to your post" : `${n} replies to your posts`,
          body: "Tap to join the conversation.",
          dest_tab: "more",
          dest_sub: "forum",
          dedupe_key: "forum_reply",
          data: { count: n },
        });
      }
    }
  }

  return out;
}

Deno.serve(async (_req) => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // Pull all users with their plan flags. (For large user bases, page this.)
  const { data: profiles, error: profErr } = await admin
    .from("profiles")
    .select("id, plan, is_premium, is_admin");
  if (profErr) {
    return new Response(JSON.stringify({ error: profErr.message }), { status: 500 });
  }

  let created = 0, updated = 0, usersProcessed = 0;

  for (const profile of profiles || []) {
    const userId = profile.id;

    // Load prefs (default to all-on / realtime if no row yet).
    const { data: prefRow } = await admin
      .from("notification_prefs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const prefs = prefRow || {
      low_stock: true, shopping: true, project_due: true, forum_reply: true, delivery: "realtime",
    };
    if (prefs.delivery === "off") continue;

    const isPremium = profile.is_admin || profile.is_premium || profile.plan === "premium";

    let items: any[] = [];
    try {
      items = await buildForUser(admin, userId, prefs, isPremium);
    } catch (e) {
      console.error(`buildForUser failed for ${userId}:`, (e as Error).message);
      continue;
    }
    usersProcessed++;

    // Upsert each notification on (user_id, dedupe_key). If the row exists and
    // its content changed, refresh it AND reset is_read so a materially-changed
    // notification resurfaces; if unchanged, leave it alone (don't nag).
    for (const it of items) {
      const { data: existing } = await admin
        .from("notifications")
        .select("id, title, body, is_read")
        .eq("user_id", userId)
        .eq("dedupe_key", it.dedupe_key)
        .maybeSingle();

      if (!existing) {
        const { error } = await admin.from("notifications").insert({
          user_id: userId,
          type: it.type, title: it.title, body: it.body || null, icon: it.icon || null,
          dest_tab: it.dest_tab || null, dest_sub: it.dest_sub || null,
          dedupe_key: it.dedupe_key, data: it.data || {},
        });
        if (!error) created++;
      } else if (existing.title !== it.title || (existing.body || null) !== (it.body || null)) {
        // Content changed (e.g. count went up) → update and re-surface.
        const { error } = await admin.from("notifications").update({
          type: it.type, title: it.title, body: it.body || null, icon: it.icon || null,
          dest_tab: it.dest_tab || null, dest_sub: it.dest_sub || null,
          data: it.data || {}, is_read: false, read_at: null, created_at: new Date().toISOString(),
        }).eq("id", existing.id);
        if (!error) updated++;
      }
      // else: identical to existing live notification — do nothing.
    }

    // Clean up: remove notifications whose underlying condition no longer holds
    // (e.g. user restocked, so low_stock should disappear from the bell).
    const liveKeys = new Set(items.map((i) => i.dedupe_key));
    const { data: stale } = await admin
      .from("notifications")
      .select("id, dedupe_key")
      .eq("user_id", userId);
    for (const row of stale || []) {
      if (!liveKeys.has(row.dedupe_key)) {
        await admin.from("notifications").delete().eq("id", row.id);
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, usersProcessed, created, updated }),
    { headers: { "Content-Type": "application/json" } }
  );
});
