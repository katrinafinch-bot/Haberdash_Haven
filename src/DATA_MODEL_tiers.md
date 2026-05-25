# Data Model Decision — User Tiers & Plans

**Status:** Decided · **Applies to:** `profiles` table

---

## The decision

A user's subscription tier is represented by **one column**: `profiles.plan`,
with values `'free' | 'basic' | 'premium'`. That single field is the source of
truth for what tier someone is on.

We do **not** use separate `is_free` / `is_basic` / `is_premium` booleans to
represent tier. (`is_premium` exists today only as a temporary comp flag — see
below — and will be retired.)

---

## Why one field, not booleans

Tiers are **mutually exclusive and ordered**: a user is exactly one of
free / basic / premium at any moment, and premium includes everything basic
includes. A single ordered value expresses this exactly. Multiple booleans
cannot — they allow contradictory states (`is_basic` AND `is_premium` both true,
or all three false), which forces every read to guess which flag wins and
creates "boolean soup" bugs.

Key points:

- **Free is not a flag — it's the default.** "No paid plan" *is* free, so
  `plan` defaults to `'free'`. There's nothing to store separately.
- **Basic and premium are just values** of `plan`, not their own columns.
- **"Building up to premium" is access logic, not data.** The ladder (premium
  satisfies basic-gated features) lives in the `canAccess(minPlan)` helper, which
  already treats premium as a superset of basic. It reads the single `plan`
  value; more booleans wouldn't help it.

---

## Admin is separate from tier

`is_admin` is a **role**, not a tier. Admin is orthogonal to plan — someone can
be an admin on any plan. Keep `is_admin` as its own boolean; never fold it into
`plan`.

---

## `is_premium` — temporary comp flag

`is_premium` currently exists and is used to comp beta testers to premium without
touching their `plan`. The app reads it as a strict override:

```
let tier = "free";
if (["free","basic","premium"].includes(plan)) tier = plan;   // plan is the truth
if (is_admin || is_premium) tier = "premium";                 // override
```

This is fine **for the beta**. It is not the long-term model.

### Retire it post-beta (when billing lands)

1. Migrate comped users into `plan`:
   `update profiles set plan = 'premium' where is_premium = true;`
2. Point all tier logic at `plan` only (drop the `is_premium` branch in the
   derivation above).
3. Drop the `is_premium` column.

When RevenueCat / Stripe go live, the billing webhook should write the purchased
tier directly to `plan` — which is the main reason `plan` must be the single
source of truth.

---

## Summary

| Field        | Purpose                          | Keep long-term? |
|--------------|----------------------------------|-----------------|
| `plan`       | Tier: free / basic / premium     | ✅ Source of truth |
| `is_admin`   | Admin role (orthogonal to tier)  | ✅ Separate role |
| `is_premium` | Temporary beta comp override     | ❌ Retire post-beta |
| `is_free`    | —                                | ❌ Never add (free = default plan) |
| `is_basic`   | —                                | ❌ Never add (basic = `plan` value) |
