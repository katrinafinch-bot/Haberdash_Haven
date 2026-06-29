import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import starterThreads from "./data/thread-library.json";
import { t, LANGUAGES, getColorFamilies } from "./i18n.js";
import { ProjectsTab } from "./ProjectsTab.jsx";
import InsuranceReportBuilder from "./InsuranceReportBuilder.jsx";
import PhotoUploader from "./PhotoUploader.jsx";
import SpoolQuest from "./SpoolQuest.jsx";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const APP_VERSION = "3.0.0";
const LOCAL_LIBRARY_KEY = "haberdash_haven_thread_library";
const LOCAL_SYNC_META   = "haberdash_haven_sync_meta";

// English keys — NEVER change these, they are used internally for comparison
const COLOR_FAMILY_KEYS = [
  "All","Whites & Creams","Yellows & Golds","Oranges","Reds","Pinks & Magentas",
  "Purples & Lavenders","Blues","Teals & Aquas","Greens","Browns & Tans",
  "Greys & Blacks","Specialty & Variegated"
];

// All available Home quick actions. key, label, emoji, color class, and where it goes.
// dest: {tab} or {tab:"more", sub:"..."} ; needsAuth gates guest users.
const QUICK_ACTION_CATALOG = [
  {key:"match",      label:"Match",      emoji:"🔍", cls:"gold",  dest:{tab:"match"},                 needsAuth:false},
  {key:"stash",      label:"My Stash",   emoji:"◈",  cls:"teal",  dest:{tab:"stash"},                 needsAuth:true},
  {key:"shopping",   label:"Shopping",   emoji:"🛒", cls:"amber", dest:{tab:"stash"},                 needsAuth:true},
  {key:"machines",   label:"Machines",   emoji:"⚙️", cls:"ocean", dest:{tab:"more",sub:"machines"},   needsAuth:true},
  {key:"accuquilt",  label:"AccuQuilt",  emoji:"◈",  cls:"amber", dest:{tab:"more",sub:"accuquilt"},  needsAuth:true},
  {key:"feet",       label:"Feet",       emoji:"👟", cls:"ocean", dest:{tab:"more",sub:"feet"},       needsAuth:true},
  {key:"rulers",     label:"Rulers",     emoji:"📐", cls:"green", dest:{tab:"more",sub:"rulers"},     needsAuth:true},
  {key:"projects",   label:"Projects",   emoji:"◉",  cls:"green", dest:{tab:"projects"},              needsAuth:true},
  {key:"forum",      label:"Forum",      emoji:"💬", cls:"navy",  dest:{tab:"more",sub:"forum"},      needsAuth:true},
  {key:"settings",   label:"Settings",   emoji:"⚙",  cls:"navy",  dest:{tab:"more",sub:"settings"},   needsAuth:true},
];
const DEFAULT_QUICK_ACTIONS = ["match","stash","shopping","projects"];


const threadBrands = [
  ["Isacord","isacord"],
  ["Aurifil","aurifil"],
  ["Brother Embroidery","brother_embroidery"],
  ["Coats & Clark","coats_clark"],
  ["Cosmo Seasons","cosmo"],
  ["DIME Exquisite","exquisite"],
  ["Fil-Tec Glide","glide"],
  ["Floriani","floriani"],
  ["Gunold POLY 40","gunold"],
  ["Gutermann","gutermann"],
  ["Hemingworth","hemingworth"],
  ["Madeira Polyneon","madeira_polyneon"],
  ["Madeira Classic Rayon","madeira_rayon"],
  ["Marathon Polyester","marathon"],
  ["Mettler Poly Sheen","mettler_poly_sheen"],
  ["Mettler Silk-Finish","mettler_silk_finish"],
  ["Presencia Finca","presencia"],
  ["Robison-Anton Poly","robison_anton_poly"],
  ["Robison-Anton Rayon","robison_anton_rayon"],
  ["Singer All Purpose","singer"],
  ["Sulky 40wt Rayon","sulky_rayon"],
  ["Superior King Tut","king_tut"],
  ["Superior Omni","superior_omni"],
  ["Superior So Fine!","superior_so_fine"],
  ["Valdani","valdani"],
  ["Wonderfil DecoBob","wonderfil_decobob"],
  ["Wonderfil Efina","wonderfil_efina"],
  ["Wonderfil Konfetti","wonderfil_konfetti"],
  ["Wonderfil Splendor","wonderfil_splendor"],
  ["YLI Hand Quilting","yli_hand"],
  ["YLI Silk","yli_silk"],
];

// Map from UI brand label → brand_key in thread_library
const brandKeyMap = {
  "Isacord":               "isacord",
  "Aurifil":               "aurifil",
  "Brother Embroidery":    "brother_embroidery",
  "Coats & Clark":         "coats_clark",
  "Cosmo Seasons":         "cosmo",
  "DIME Exquisite":        "exquisite",
  "Fil-Tec Glide":         "glide",
  "Floriani":              "floriani",
  "Gunold POLY 40":        "gunold",
  "Gutermann":             "gutermann",
  "Hemingworth":           "hemingworth",
  "Madeira Polyneon":      "madeira_polyneon",
  "Madeira Classic Rayon": "madeira_rayon",
  "Marathon Polyester":    "marathon",
  "Mettler Poly Sheen":    "mettler_poly_sheen",
  "Mettler Silk-Finish":   "mettler_silk_finish",
  "Presencia Finca":       "presencia",
  "Robison-Anton Poly":    "robison_anton_poly",
  "Robison-Anton Rayon":   "robison_anton_rayon",
  "Singer All Purpose":    "singer",
  "Sulky 40wt Rayon":      "sulky_rayon",
  "Superior King Tut":     "king_tut",
  "Superior Omni":         "superior_omni",
  "Superior So Fine!":     "superior_so_fine",
  "Valdani":               "valdani",
  "Wonderfil DecoBob":     "wonderfil_decobob",
  "Wonderfil Efina":       "wonderfil_efina",
  "Wonderfil Konfetti":    "wonderfil_konfetti",
  "Wonderfil Splendor":    "wonderfil_splendor",
  "YLI Hand Quilting":     "yli_hand",
  "YLI Silk":              "yli_silk",
};

const fabricBrands = [
  ["Kona Cotton","kona"],["Bella Solids","bella"],["AGF Pure Solids","agf"],
  ["FreeSpirit","freespirit"],["Michael Miller","michaelMiller"],
  ["Windham","windham"],["Clothworks","clothworks"],["Hoffman","hoffman"],
];

const commonSpoolSizes = ["Mini Cone","Small Spool","Medium Spool","Large Cone","500m","1000m","1100 yd","3000 yd","5000m"];
const emptyForm = { name:"",family:"Unsorted",isacord:"",barcode:"",weight:"40 wt",spools:"1",inventoryTarget:"2",spoolSize:"1000m",swatch:"#0F766E" };
const emptyProject = { name:"",status:"Planning",notes:"" };

// ─────────────────────────────────────────────────────────────
// PRICING — single source of truth for plan prices.
// monthly = charged per month; annual = charged once per year.
// (Billing is not wired up yet; these drive display only.)
// ─────────────────────────────────────────────────────────────
const PLAN_PRICING = {
  basic:   { monthly: 4.99, annual: 50 },
  premium: { monthly: 9.99, annual: 100 },
};
const fmtPrice = n => Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
// Price label for a plan + cycle, e.g. "$4.99/mo" or "$50/yr"
function priceLabel(plan, cycle){
  const p = PLAN_PRICING[plan]; if(!p) return "";
  return cycle==="annual" ? `${fmtPrice(p.annual)}/yr` : `${fmtPrice(p.monthly)}/mo`;
}
// Annual savings vs paying monthly for 12 months, as a whole-dollar amount and %.
function annualSavings(plan){
  const p = PLAN_PRICING[plan]; if(!p) return null;
  const yearlyIfMonthly = p.monthly*12;
  const saved = yearlyIfMonthly - p.annual;
  if(saved<=0) return null;
  return { amount: Math.round(saved), pct: Math.round((saved/yearlyIfMonthly)*100) };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function versionCompare(a,b){
  const pa=String(a||"0.0.0").split(".").map(n=>parseInt(n,10)||0);
  const pb=String(b||"0.0.0").split(".").map(n=>parseInt(n,10)||0);
  for(let i=0;i<Math.max(pa.length,pb.length);i++){
    const av=pa[i]||0,bv=pb[i]||0;
    if(av>bv)return 1;if(av<bv)return -1;
  }
  return 0;
}
function normalized(v){ return String(v||"").toLowerCase(); }
function hexToRgb(hex){
  const c=String(hex||"").replace("#","");
  if(c.length!==6)return null;
  return{r:parseInt(c.slice(0,2),16),g:parseInt(c.slice(2,4),16),b:parseInt(c.slice(4,6),16)};
}
function colorDistance(a,b){
  if(!a||!b)return Number.MAX_SAFE_INTEGER;
  const dr=a.r-b.r,dg=a.g-b.g,db=a.b-b.b;
  return Math.sqrt(dr*dr+dg*dg+db*db);
}

// Find nearest color in a given brand by hex distance
function findNearestInBrand(hexOrThread, targetBrandKey, allThreads){
  if(!targetBrandKey||!allThreads.length) return null;
  // Get source RGB — prefer r,g,b columns, fall back to hex
  let srcRgb;
  if(hexOrThread && typeof hexOrThread==="object" && hexOrThread.r!=null){
    srcRgb = {r:hexOrThread.r, g:hexOrThread.g, b:hexOrThread.b};
  } else {
    srcRgb = hexToRgb(typeof hexOrThread==="string" ? hexOrThread : hexOrThread?.hex_color);
  }
  if(!srcRgb) return null;
  let best = null, bestDist = Infinity;
  for(const t of allThreads){
    if(t.brand_key !== targetBrandKey) continue;
    // Use r,g,b if available, else parse hex
    const tRgb = t.r!=null ? {r:t.r,g:t.g,b:t.b} : hexToRgb(t.hex_color);
    if(!tRgb) continue;
    const dist = colorDistance(srcRgb, tRgb);
    if(dist < bestDist){ bestDist = dist; best = t; }
  }
  return best;
}

// Find nearest color in ANY pool (threads or fabrics) by RGB distance.
// Works cross-type because thread_library and fabric_library share r/g/b + hex_color.
function findNearestInPool(hexOrObj, pool){
  if(!pool||!pool.length) return null;
  let srcRgb;
  if(hexOrObj && typeof hexOrObj==="object" && hexOrObj.r!=null){
    srcRgb={r:hexOrObj.r,g:hexOrObj.g,b:hexOrObj.b};
  } else {
    srcRgb=hexToRgb(typeof hexOrObj==="string" ? hexOrObj : hexOrObj?.hex_color);
  }
  if(!srcRgb) return null;
  let best=null, bestDist=Infinity;
  for(const item of pool){
    const rgb=item.r!=null ? {r:item.r,g:item.g,b:item.b} : hexToRgb(item.hex_color);
    if(!rgb) continue;
    const d=colorDistance(srcRgb,rgb);
    if(d<bestDist){ bestDist=d; best=item; }
  }
  return best;
}

// Perceptual distance using CIELAB (Delta-E 76) when lab columns exist,
// falling back to RGB Euclidean. Lower = closer. fabric_library has lab_l/a/b.
function perceptualDistance(src, item){
  if(src && src.lab_l!=null && item.lab_l!=null){
    const dl=src.lab_l-item.lab_l, da=src.lab_a-item.lab_a, db=src.lab_b-item.lab_b;
    return Math.sqrt(dl*dl+da*da+db*db);
  }
  const sRgb = src && src.r!=null ? {r:src.r,g:src.g,b:src.b} : hexToRgb(src && src.hex_color);
  const iRgb = item.r!=null ? {r:item.r,g:item.g,b:item.b} : hexToRgb(item.hex_color);
  return colorDistance(sRgb, iRgb);
}

// Find the N nearest items in a pool, perceptually. Used for thread → closest fabrics.
function findNearestN(src, pool, n=3){
  if(!src || !pool || !pool.length) return [];
  return pool
    .map(item=>({item, d:perceptualDistance(src, item)}))
    .filter(x=>Number.isFinite(x.d))
    .sort((a,b)=>a.d-b.d)
    .slice(0,n)
    .map(x=>x.item);
}

// Sort comparator: groups visually-similar colors together (hue, then lightness, then saturation).
function colorSortKey(item){
  const rgb = item.r!=null ? {r:item.r,g:item.g,b:item.b} : hexToRgb(item.hex_color);
  if(!rgb) return [999,999,999];
  const {r,g,b}=rgb;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),chroma=max-min;
  const l=(max+min)/2;
  let h=0;
  if(chroma!==0){
    if(max===r) h=((g-b)/chroma+6)%6;
    else if(max===g) h=(b-r)/chroma+2;
    else h=(r-g)/chroma+4;
    h*=60;
  }
  // Neutrals (low chroma) sorted to the end, ordered by lightness
  const hueBucket = chroma<20 ? 1000 : h;
  return [hueBucket, l, -chroma];
}
function byColor(a,b){
  const ka=colorSortKey(a), kb=colorSortKey(b);
  return ka[0]-kb[0] || ka[1]-kb[1] || ka[2]-kb[2];
}

// Always returns an ENGLISH key from COLOR_FAMILY_KEYS — never a translated string
// Accepts a hex string, OR a thread object with r/g/b or hex_color fields
function hexToFamilyKey(hexOrThread){
  let rgb;
  if(hexOrThread && typeof hexOrThread==="object"){
    // Prefer r,g,b integer columns — most accurate, no parsing needed
    if(hexOrThread.r!=null && hexOrThread.g!=null && hexOrThread.b!=null){
      rgb={r:hexOrThread.r, g:hexOrThread.g, b:hexOrThread.b};
    } else {
      // Fall back to hex_color string
      rgb=hexToRgb(hexOrThread.hex_color||hexOrThread.hex||hexOrThread.swatch);
    }
  } else {
    rgb=hexToRgb(hexOrThread);
  }
  if(!rgb)return "Specialty & Variegated";
  const{r,g,b}=rgb;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  const l=(max+min)/2;
  const chroma=max-min;
  if(chroma<20){
    if(l>210)return "Whites & Creams";
    return "Greys & Blacks";
  }
  if(l>210&&chroma<60)return "Whites & Creams";
  let h;
  if(max===r)      h=((g-b)/chroma+6)%6;
  else if(max===g) h=(b-r)/chroma+2;
  else             h=(r-g)/chroma+4;
  h=h*60;
  if(h<15||h>=345) return "Reds";
  if(h<38)         return "Oranges";
  if(h<65)         return "Yellows & Golds";
  if(h<150)        return "Greens";
  if(h<185)        return "Teals & Aquas";
  if(h<260)        return "Blues";
  if(h<290)        return "Purples & Lavenders";
  if(h<345)        return "Pinks & Magentas";
  return "Specialty & Variegated";
}

// ─────────────────────────────────────────────────────────────
// MACHINE STASH SECTION
// ─────────────────────────────────────────────────────────────
function MachineStashSection({ machines, supabase, userId, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  function openEdit(item){
    // Use machine_id (FK on user_machines) as the stable edit key
    setEditing(item.machine_id||item.machine_library?.id);
    setForm({
      serial_number: item.serial_number||"",
      purchase_date: item.purchase_date||"",
      purchase_price:item.purchase_price||"",
      dealer:        item.dealer||"",
      warranty_until:item.warranty_until||"",
      user_notes:    item.user_notes||"",
      photos:        item.photos||[],
    });
  }

  async function saveEdit(machineId){
    if(!supabase||!userId)return;
    setSaving(true);
    const{error}=await supabase.from("user_machines").update({
      serial_number: form.serial_number||null,
      purchase_date: form.purchase_date||null,
      purchase_price:form.purchase_price?parseFloat(form.purchase_price):null,
      dealer:        form.dealer||null,
      warranty_until:form.warranty_until||null,
      user_notes:    form.user_notes||null,
      photos:        form.photos||[],
      image_url:     (form.photos&&form.photos[0])||null,
    }).eq("user_id",userId).eq("machine_id",machineId);
    if(error) console.error("Save machine details error:",error);
    setSaving(false);
    setEditing(null);
    onRefresh&&onRefresh();
  }

  async function removeMachine(machineId){
    if(!supabase||!userId)return;
    await supabase.from("user_machines").delete().eq("user_id",userId).eq("machine_id",machineId);
    onRefresh&&onRefresh();
  }

  if(machines.length===0)return(
    <div className="card"><h2>My Machines</h2><p className="muted">No machines yet — browse in More → Machines.</p></div>
  );

  return(
    <div className="card">
      <h2>My Machines ({machines.length})</h2>
      {machines.map((item,i)=>{
        const m=item.machine_library; if(!m)return null;
        const machineId=item.machine_id||m.id;
        const isEditing=editing===machineId;
        const hasDetails=item.serial_number||item.purchase_date||item.dealer||item.warranty_until||item.purchase_price;
        return(
          <div key={i} className="sub-card" style={{marginBottom:12}}>

            {/* ── Machine header ── */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
              <div style={{flex:1,display:"flex",gap:10}}>
                {item.image_url&&(
                  <img src={item.image_url} alt=""
                    style={{width:56,height:56,objectFit:"cover",borderRadius:6,
                      border:"1px solid var(--border-teal)",flexShrink:0}}/>
                )}
                <div style={{flex:1}}>
                <div style={{marginBottom:4}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,
                    background:"var(--sun-pale)",color:"var(--teal)",
                    border:"1px solid var(--border-sun)",display:"inline-block"}}>
                    {m.type}
                  </span>
                </div>
                <div className="thread-name">{m.brand} {m.model}</div>
                <div className="muted" style={{fontSize:12}}>{m.category}{m.throat_space?` · ${m.throat_space}" throat`:""}</div>

                {/* Detail chips — visible when not editing */}
                {!isEditing&&hasDetails&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                    {item.serial_number&&<span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"var(--teal-pale)",color:"var(--teal)",border:"1px solid var(--border-teal)"}}>S/N: {item.serial_number}</span>}
                    {item.purchase_date&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"var(--leaf-wash)",color:"var(--leaf)",border:"1px solid var(--leaf-light)"}}>📅 {item.purchase_date}</span>}
                    {item.purchase_price&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"var(--linen)",color:"var(--muted-warm)",border:"1px solid var(--border-warm)"}}>💰 ${parseFloat(item.purchase_price).toFixed(2)}</span>}
                    {item.dealer&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"var(--sky-wash)",color:"var(--sky-cobalt)",border:"1px solid var(--sky-pale)"}}>🏪 {item.dealer}</span>}
                    {item.warranty_until&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"var(--sun-wash)",color:"var(--sun-amber)",border:"1px solid var(--border-sun)"}}>🛡 warranty to {item.warranty_until}</span>}
                  </div>
                )}
                {!isEditing&&item.user_notes&&(
                  <div style={{fontSize:12,color:"var(--muted-warm)",marginTop:6,fontStyle:"italic",
                    borderLeft:"3px solid var(--border-sun)",paddingLeft:8,lineHeight:1.4}}>
                    {item.user_notes}
                  </div>
                )}
                {!isEditing&&!hasDetails&&(
                  <div className="muted" style={{fontSize:11,marginTop:5}}>
                    Tap ✎ Edit to add serial number, purchase info &amp; notes
                  </div>
                )}
              </div>
              </div>

              {/* Buttons */}
              <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                <button className={`btn ${isEditing?"active":""}`}
                  style={{fontSize:11,padding:"6px 11px"}}
                  onClick={()=>isEditing?setEditing(null):openEdit(item)}>
                  {isEditing?"✕ Cancel":"✎ Edit"}
                </button>
                {!isEditing&&(
                  <button className="btn"
                    style={{fontSize:11,padding:"6px 11px",color:"#C0392B",borderColor:"#C0392B"}}
                    onClick={()=>removeMachine(machineId)}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* ── Edit form — expands below ── */}
            {isEditing&&(
              <div style={{
                marginTop:14,paddingTop:14,
                borderTop:"1.5px solid var(--border-teal)",
              }}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,
                  color:"var(--teal)",marginBottom:12}}>
                  Edit — {m.brand} {m.model}
                </div>

                <label style={{fontSize:12}}>Serial Number
                  <input className="input" value={form.serial_number}
                    onChange={e=>setForm({...form,serial_number:e.target.value})}
                    placeholder="Found on machine plate (usually bottom or back)"/>
                </label>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <label style={{fontSize:12}}>Purchase Date
                    <input className="input" type="date" value={form.purchase_date}
                      onChange={e=>setForm({...form,purchase_date:e.target.value})}/>
                  </label>
                  <label style={{fontSize:12}}>Purchase Price ($)
                    <input className="input" type="number" step="0.01" value={form.purchase_price}
                      onChange={e=>setForm({...form,purchase_price:e.target.value})}
                      placeholder="For insurance"/>
                  </label>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <label style={{fontSize:12}}>Dealer / Shop
                    <input className="input" value={form.dealer}
                      onChange={e=>setForm({...form,dealer:e.target.value})}
                      placeholder="Where you bought it"/>
                  </label>
                  <label style={{fontSize:12}}>Warranty Expiry
                    <input className="input" type="date" value={form.warranty_until}
                      onChange={e=>setForm({...form,warranty_until:e.target.value})}/>
                  </label>
                </div>

                <label style={{fontSize:12}}>Notes
                  <input className="input" value={form.user_notes}
                    onChange={e=>setForm({...form,user_notes:e.target.value})}
                    placeholder="Service history, quirks, mods, storage location…"/>
                </label>

                <div style={{marginTop:12}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--teal)",marginBottom:6}}>
                    Photos
                  </div>
                  <PhotoUploader
                    bucket="machine-photos"
                    userId={userId}
                    existing={form.photos||[]}
                    onChange={(urls)=>setForm({...form,photos:urls})}
                    maxPhotos={6}
                  />
                </div>

                <button className="btn active" style={{width:"100%",marginTop:4}}
                  onClick={()=>saveEdit(machineId)} disabled={saving}>
                  {saving?"Saving…":"✓ Save Details"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UNIVERSAL STASH
// ─────────────────────────────────────────────────────────────
function UniversalStash({ supabase, userId, shoppingList, mergedShoppingList, threads,
  updateSpools, updateInventoryTarget, addManualShoppingItem, removeShoppingItem, settings, userSettings, userPlan }) {
  const planBasic   = userPlan === "basic" || userPlan === "premium";
  const planPremium = userPlan === "premium";
  const [activeSection, setActiveSection] = useState("threads");
  const [stash, setStash] = useState({threads:[],fabrics:[],rulers:[],machines:[],dies:[],feet:[],accessories:[]});
  const [counts, setCounts] = useState({threads:0,fabrics:0,rulers:0,machines:0,dies:0,feet:0,accessories:0,shopping:0});
  const [fabricShop, setFabricShop] = useState([]);
  const [customShop, setCustomShop] = useState([]);
  const [customForm, setCustomForm] = useState({item:"",qty:"",notes:""});
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  // Accessories state
  const [accForm, setAccForm]   = useState({name:"",quantity:"1",notes:""});
  const [showAccForm, setShowAccForm] = useState(false);

  const fetchAll = useCallback(async()=>{
    if(!supabase||!userId)return;
    setLoading(true);
    try{
      const [{data:th},{data:fa},{data:ru},{data:ma},{data:di},{data:fe},{data:fsh},{data:csh}] = await Promise.all([
        supabase.from("user_inventory").select("id,spool_count,inventory_target,thread_library(id,brand,brand_key,color_code,color_name,hex_color,fiber_type,weight)").eq("user_id",userId),
        supabase.from("user_fabric_inventory").select("id,notes,fabric_library(id,brand,color_code,color_name,hex_color,family,nearest_kona_name)").eq("user_id",userId),
        supabase.from("user_rulers").select("quantity,ruler_library(brand,name,category,size,sku)").eq("user_id",userId),
        supabase.from("user_machines").select("machine_id,serial_number,purchase_date,purchase_price,dealer,warranty_until,user_notes,machine_library(id,brand,model,type,category,throat_space,fun_fact,is_computerized)").eq("user_id",userId),
        supabase.from("user_dies").select("quantity,accuquilt_library(id,product_name,product_type)").eq("user_id",userId),
        supabase.from("user_feet").select("quantity,feet_library(brand,foot_name,category,shank_type)").eq("user_id",userId),
        supabase.from("fabric_shopping_list").select("id,name,brand,color_code,hex_color,notes").eq("user_id",userId),
        supabase.from("shopping_custom").select("id,item,qty,notes").eq("user_id",userId).order("created_at"),
      ]);
      // Accessories — stored in localStorage for now
      const savedAcc = JSON.parse(localStorage.getItem("hh_accessories")||"[]");
      const s={threads:th||[],fabrics:fa||[],rulers:ru||[],machines:ma||[],dies:di||[],feet:fe||[],accessories:savedAcc};
      setStash(s);
      setFabricShop(fsh||[]);
      setCustomShop(csh||[]);
      setCounts({threads:s.threads.length,fabrics:s.fabrics.length,rulers:s.rulers.length,machines:s.machines.length,dies:s.dies.length,feet:s.feet.length,accessories:s.accessories.length,shopping:(mergedShoppingList?.length||0)+((fsh||[]).length)+((csh||[]).length)});
    }catch(e){console.error("Stash fetch:",e);}
    setLoading(false);
  },[supabase,userId,mergedShoppingList]);

  useEffect(()=>{ fetchAll(); },[fetchAll]);

  function saveAccessory(){
    if(!accForm.name.trim())return;
    const newAcc={id:Date.now(),...accForm,quantity:parseInt(accForm.quantity)||1};
    const updated=[...stash.accessories,newAcc];
    localStorage.setItem("hh_accessories",JSON.stringify(updated));
    setStash(s=>({...s,accessories:updated}));
    setCounts(c=>({...c,accessories:updated.length}));
    setAccForm({name:"",quantity:"1",notes:""});
    setShowAccForm(false);
  }

  // Update a stash thread's spool_count (delta) — persists to user_inventory.
  async function updateStashSpools(rowId, delta){
    setStash(s=>({...s, threads: s.threads.map(t=>
      t.id===rowId ? {...t, spool_count: Math.max(0,(t.spool_count||0)+delta)} : t)}));
    if(supabase){
      const row=stash.threads.find(t=>t.id===rowId);
      const next=Math.max(0,((row?.spool_count)||0)+delta);
      const{error}=await supabase.from("user_inventory").update({spool_count:next}).eq("id",rowId);
      if(error)console.error("spool_count update:",error.message);
    }
  }
  // Set a stash thread's inventory_target — persists to user_inventory.
  async function updateStashTarget(rowId, value){
    const v=Math.max(0,parseInt(value)||0);
    setStash(s=>({...s, threads: s.threads.map(t=>
      t.id===rowId ? {...t, inventory_target:v} : t)}));
    if(supabase){
      const{error}=await supabase.from("user_inventory").update({inventory_target:v}).eq("id",rowId);
      if(error)console.error("inventory_target update:",error.message);
    }
  }

  function removeAccessory(id){
    const updated=stash.accessories.filter(a=>a.id!==id);
    localStorage.setItem("hh_accessories",JSON.stringify(updated));
    setStash(s=>({...s,accessories:updated}));
    setCounts(c=>({...c,accessories:updated.length}));
  }

  async function addCustomShoppingItem(){
    if(!customForm.item.trim()||!supabase||!userId)return;
    const{data,error}=await supabase.from("shopping_custom")
      .insert({user_id:userId,item:customForm.item.trim(),qty:customForm.qty.trim()||null,notes:customForm.notes.trim()||null})
      .select().maybeSingle();
    if(error){ console.error("custom shop:",error.message); return; }
    setCustomShop(prev=>[...prev,data]);
    setCounts(c=>({...c,shopping:(c.shopping||0)+1}));
    setCustomForm({item:"",qty:"",notes:""});
  }
  async function removeCustomShoppingItem(id){
    if(!supabase)return;
    await supabase.from("shopping_custom").delete().eq("id",id);
    setCustomShop(prev=>prev.filter(x=>x.id!==id));
    setCounts(c=>({...c,shopping:Math.max(0,(c.shopping||1)-1)}));
  }
  function printShoppingList(){
    const esc=s=>String(s||"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const row=(sw,main,sub)=>`<tr><td style="width:34px">${sw?`<span style="display:inline-block;width:22px;height:22px;border-radius:4px;border:1px solid #999;background:${esc(sw)}"></span>`:""}</td><td><b>${esc(main)}</b>${sub?`<div style="font-size:11px;color:#666">${esc(sub)}</div>`:""}</td></tr>`;
    let body="";
    if(mergedShoppingList.length){ body+=`<h2>Threads</h2><table>`; mergedShoppingList.forEach(i=>{ body+=row(i.hex_color,`${i.brand||""} ${i.code||""} — ${i.name||""}`.trim(),[i.fiber_type,i.weight,i.qty?`Qty ${i.qty}`:""].filter(Boolean).join(" · ")); }); body+=`</table>`; }
    if(fabricShop.length){ body+=`<h2>Fabrics</h2><table>`; fabricShop.forEach(i=>{ body+=row(i.hex_color,`${i.brand||""} ${i.color_code||""} ${i.name||""}`.trim(),i.notes); }); body+=`</table>`; }
    if(customShop.length){ body+=`<h2>Other Items</h2><table>`; customShop.forEach(i=>{ body+=row(null,i.item,[i.qty?`Qty ${i.qty}`:"",i.notes].filter(Boolean).join(" · ")); }); body+=`</table>`; }
    if(!body) body="<p>Your shopping list is empty.</p>";
    const html=`<!doctype html><html><head><title>Shopping List — Haberdash Haven</title><style>
      body{font-family:Georgia,serif;color:#1C2B2B;max-width:640px;margin:30px auto;padding:0 20px}
      h1{color:#0D5252;border-bottom:2px solid #E8A800;padding-bottom:8px}
      h2{color:#0D5252;font-size:15px;margin:20px 0 6px;text-transform:uppercase;letter-spacing:.5px}
      table{width:100%;border-collapse:collapse} td{padding:6px 8px;border-bottom:1px solid #eee;vertical-align:middle;font-size:13px}
      .foot{margin-top:30px;font-size:11px;color:#999;text-align:center}
      @media print{body{margin:0}}
    </style></head><body>
      <h1>🛒 Shopping List</h1>
      <div style="font-size:12px;color:#666">Haberdash Haven · ${new Date().toLocaleDateString()}</div>
      ${body}
      <div class="foot">Generated by Haberdash Haven — Stitch. Match. Thrive.</div>
    </body></html>`;
    const w=window.open("","_blank");
    if(!w){ alert("Please allow pop-ups to print your shopping list."); return; }
    w.document.write(html); w.document.close();
    w.onload=()=>{ w.focus(); w.print(); };
  }

  const catColors={
    Quilting:{bg:"#E8F0FF",text:"#0047AB"},Garment:{bg:"#E0F5EC",text:"#1A6B4A"},
    Embroidery:{bg:"#F3EAF8",text:"#6B3FA0"},Serging:{bg:"#FFF8E1",text:"#5C4A1E"},
    Specialty:{bg:"#FDECEA",text:"#C0392B"},General:{bg:"#F5F5F5",text:"#888"},
  };

  const allSections=[
    {key:"threads",label:"Threads",emoji:"🧵",minPlan:"free"},
    {key:"fabrics",label:"Fabrics",emoji:"◧",minPlan:"premium"},
    {key:"machines",label:"Machines",emoji:"⚙️",minPlan:"basic"},
    {key:"rulers",label:"Rulers",emoji:"📐",minPlan:"premium"},
    {key:"dies",label:"AccuQuilt",emoji:"◈",minPlan:"premium"},
    {key:"feet",label:"Feet",emoji:"👟",minPlan:"premium"},
    {key:"accessories",label:"Accessories",emoji:"✦",minPlan:"premium"},
    {key:"shopping",label:"Shopping",emoji:"🛒",minPlan:"basic"},
  ];
  const sections = allSections.filter(s => {
    if(s.minPlan === "free") return true;
    if(s.minPlan === "basic") return planBasic;
    if(s.minPlan === "premium") return planPremium;
    return false;
  });

  const totalItems=Object.values(counts).reduce((a,b)=>a+b,0);

  // Use Supabase stash threads if signed in, else local threads
  const useSupaStash = supabase&&userId;

  if(loading)return<div className="card"><p className="muted">Loading your stash…</p></div>;

  return(
    <div>
      <div className="stash-banner">
        <h2>Your Stash</h2>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="count-chip">{totalItems} items</span>
          {planPremium ? (
            <button
              onClick={()=>setShowReport(true)}
              style={{
                padding:"3px 10px",borderRadius:"var(--r-full)",
                border:"1.5px solid var(--teal)",
                background:"var(--teal-pale)",color:"var(--teal)",
                fontSize:11,fontWeight:800,cursor:"pointer",
                fontFamily:"Nunito, sans-serif"
              }}>
              📋 Insurance Report
            </button>
          ) : (
            <button
              disabled
              title="Premium feature"
              style={{
                padding:"3px 10px",borderRadius:"var(--r-full)",
                border:"1.5px solid var(--border-teal)",
                background:"var(--linen)",color:"var(--muted)",
                fontSize:11,fontWeight:800,cursor:"not-allowed",opacity:0.6,
                fontFamily:"Nunito, sans-serif"
              }}>
              📋 Insurance Report 🔒
            </button>
          )}
        </div>
      </div>

      {/* Section pills */}
      <div className="section-pills">
        {sections.map(s=>(
          <button key={s.key} className={`section-pill ${activeSection===s.key?"active":""}`}
            onClick={()=>setActiveSection(s.key)}>
            {s.emoji} {s.label} ({counts[s.key]})
          </button>
        ))}
      </div>

      {/* ── THREADS ── */}
      {activeSection==="threads"&&(
        useSupaStash?(
          <div className="card">
            <h2>Threads ({counts.threads})</h2>
            {!planBasic && counts.threads >= 25 && (
              <div style={{background:"#FFF3CD",border:"1px solid #FBBF24",borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#92400E"}}>
                <strong>Stash limit reached.</strong> Free accounts can store up to 25 threads. <span style={{color:"var(--teal)",cursor:"pointer",textDecoration:"underline"}} onClick={()=>window.location.href=window.location.origin}>Upgrade to Basic</span> for unlimited.
              </div>
            )}
            {!planBasic && counts.threads > 0 && counts.threads < 25 && (
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>{counts.threads}/25 threads · <span style={{color:"var(--teal)",cursor:"pointer",textDecoration:"underline"}} onClick={()=>window.location.href=window.location.origin}>Upgrade for unlimited</span></div>
            )}
            {stash.threads.length===0
              ?<p className="muted">No threads yet — use the Match tab to find and add threads.</p>
              :stash.threads.map((item,i)=>{
                // Support both thread_library (Isacord) and thread_library_all (all brands)
                const th = item.thread_library;
                if(!th) return null;
                const hex = th.hex_color || "#CCC";
                const spools = item.spool_count || 0;
                const target = item.inventory_target || 0;
                const isLow = target > 0 && spools <= target;
                return(
                  <div key={item.id||i} style={{borderBottom:"1px solid var(--border-teal)",paddingBottom:10,marginBottom:10}}>
                    <div className="thread-row" style={{alignItems:"center"}}>
                      <div className="swatch" style={{background:hex}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="thread-name" style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          {th.brand} {th.color_code} — {th.color_name}
                          {isLow && <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",color:"#fff",background:"#C0392B",padding:"2px 7px",borderRadius:10}}>Low</span>}
                        </div>
                        <div className="muted">{th.fiber_type||""} · {spools} {spools===1?"spool":"spools"}{target>0?` · target ${target}`:""}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <button className="btn" style={{padding:"2px 10px",fontSize:16,lineHeight:1}} onClick={()=>updateStashSpools(item.id,-1)} disabled={spools<=0}>−</button>
                        <span style={{minWidth:24,textAlign:"center",fontWeight:700}}>{spools}</span>
                        <button className="btn" style={{padding:"2px 10px",fontSize:16,lineHeight:1}} onClick={()=>updateStashSpools(item.id,1)}>+</button>
                      </div>
                      <label style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"var(--muted)",margin:0}}>
                        Target
                        <input type="number" min="0" className="input" style={{width:64,padding:"4px 6px"}} value={target} onChange={e=>updateStashTarget(item.id,e.target.value)}/>
                      </label>
                      {isLow && (
                        <button className="btn" style={{fontSize:11,padding:"4px 10px",marginLeft:"auto"}}
                          onClick={()=>addManualShoppingItem({brand:th.brand,color_code:th.color_code,color_name:th.color_name,hex_color:th.hex_color,fiber_type:th.fiber_type,weight:th.weight})}>
                          + Shopping List
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        ):(
          <>
            {!planBasic ? (
              <div className="card" style={{textAlign:"center",padding:"24px"}}>
                <div style={{fontSize:28,marginBottom:8}}>🛒</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"var(--teal)",marginBottom:8}}>Shopping List is a Basic feature</div>
                <p className="muted" style={{fontSize:13,marginBottom:12}}>Upgrade to Basic to manage your shopping list.</p>
                <button className="btn active" onClick={()=>window.location.href=window.location.origin}>Upgrade to Basic — {priceLabel("basic","monthly")} or {priceLabel("basic","annual")}</button>
              </div>
            ) : (
            <div className="card">
              <h2>Shopping List</h2>
              {mergedShoppingList.length===0
                ?<p className="muted">Your shopping list is empty.</p>
                :mergedShoppingList.map(item=>(
                  <div key={item.id} className="sub-card" style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    {item.hex_color&&<div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:item.hex_color,border:"2px solid rgba(255,255,255,0.6)",boxShadow:"0 2px 6px rgba(0,0,0,0.15)"}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13}}>{item.brand&&`${item.brand} `}{item.code} — {item.name}</div>
                      {item.fiber_type&&<div className="muted" style={{fontSize:11}}>{item.fiber_type} {item.weight}</div>}
                      <div className="muted" style={{fontSize:11}}>Qty: {item.qty}</div>
                    </div>
                    <button className="btn" style={{fontSize:11,padding:"4px 8px",color:"#C0392B",borderColor:"#C0392B",flexShrink:0}} onClick={()=>removeShoppingItem(item.id)}>✕</button>
                  </div>
                ))
              }
            </div>
            )}
            {threads.map(thread=>(
              <div key={thread.id} className="card">
                <div className="thread-row">
                  <div className="swatch" style={{background:thread.swatch}}/>
                  <div>
                    <div className="thread-name">{thread.name} {thread.isacord?`(${thread.isacord})`:""}</div>
                    <div className="muted">{thread.spools} spool(s) · {thread.spoolSize} · Target {thread.inventoryTarget||0}</div>
                  </div>
                </div>
                <label>Inventory Target<input className="input" type="number" value={thread.inventoryTarget||0} onChange={e=>updateInventoryTarget(thread.id,e.target.value)}/></label>
                <div className="button-row">
                  <button className="btn" onClick={()=>updateSpools(thread.id,1)}>+ Add Spool</button>
                  <button className="btn" onClick={()=>updateSpools(thread.id,-1)}>- Remove</button>
                  <button className="btn" onClick={()=>addManualShoppingItem(thread)}>Shopping List</button>
                </div>
              </div>
            ))}
          </>
        )
      )}

      {/* ── SHOPPING ── */}
      {activeSection==="shopping"&&(
        !planBasic ? (
          <div className="card" style={{textAlign:"center",padding:"24px"}}>
            <div style={{fontSize:28,marginBottom:8}}>🛒</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"var(--teal)",marginBottom:8}}>Shopping List is a Basic feature</div>
            <p className="muted" style={{fontSize:13,marginBottom:12}}>Upgrade to Basic to manage your shopping list.</p>
            <button className="btn active" onClick={()=>window.location.href=window.location.origin}>Upgrade to Basic — {priceLabel("basic","monthly")} or {priceLabel("basic","annual")}</button>
          </div>
        ) : (
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <h2 style={{margin:0}}>Shopping List</h2>
              <button className="btn" onClick={printShoppingList}>🖨 Print / Save PDF</button>
            </div>

            {/* Manual add */}
            <div style={{marginTop:12,padding:"10px 12px",background:"var(--teal-pale)",border:"1px solid var(--border-teal)",borderRadius:"var(--r-sm)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--teal)",marginBottom:6}}>Add an item</div>
              <input className="input" placeholder="Item (e.g. backing fabric, batting…)" value={customForm.item} onChange={e=>setCustomForm({...customForm,item:e.target.value})} style={{marginBottom:6}}/>
              <div style={{display:"flex",gap:6}}>
                <input className="input" placeholder="Qty (optional)" value={customForm.qty} onChange={e=>setCustomForm({...customForm,qty:e.target.value})} style={{flex:"0 0 110px"}}/>
                <input className="input" placeholder="Notes (optional)" value={customForm.notes} onChange={e=>setCustomForm({...customForm,notes:e.target.value})} style={{flex:1}}/>
              </div>
              <button className="btn active" disabled={!customForm.item.trim()} onClick={addCustomShoppingItem} style={{marginTop:8}}>+ Add to List</button>
            </div>

            {(mergedShoppingList.length===0 && fabricShop.length===0 && customShop.length===0)
              ?<p className="muted" style={{marginTop:12}}>Your shopping list is empty. Add threads or fabrics from the Match tab, or add an item above.</p>
              :<div style={{marginTop:12}}>
                {mergedShoppingList.length>0&&<div style={{fontSize:11,fontWeight:700,color:"var(--teal)",textTransform:"uppercase",letterSpacing:".5px",margin:"4px 0 8px"}}>Threads</div>}
                {mergedShoppingList.map(item=>(
                  <div key={item.id} className="sub-card" style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    {item.hex_color&&<div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:item.hex_color,border:"2px solid rgba(255,255,255,0.6)"}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13}}>{item.brand&&`${item.brand} `}{item.code} — {item.name}</div>
                      {item.fiber_type&&<div className="muted" style={{fontSize:11}}>{item.fiber_type} {item.weight}</div>}
                      <div className="muted" style={{fontSize:11}}>Qty: {item.qty}</div>
                    </div>
                    <button className="btn" style={{fontSize:11,padding:"4px 8px",color:"#C0392B",borderColor:"#C0392B",flexShrink:0}} onClick={()=>removeShoppingItem(item.id)}>✕</button>
                  </div>
                ))}
                {fabricShop.length>0&&<div style={{fontSize:11,fontWeight:700,color:"var(--sun-amber)",textTransform:"uppercase",letterSpacing:".5px",margin:"12px 0 8px"}}>Fabrics</div>}
                {fabricShop.map(item=>(
                  <div key={item.id} className="sub-card" style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    {item.hex_color&&<div style={{width:36,height:36,borderRadius:6,flexShrink:0,background:item.hex_color,border:"2px solid rgba(255,255,255,0.6)"}}/>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13}}>{item.brand&&`${item.brand} `}{item.color_code&&`${item.color_code} — `}{item.name}</div>
                      {item.notes&&<div className="muted" style={{fontSize:11}}>{item.notes}</div>}
                    </div>
                    <button className="btn" style={{fontSize:11,padding:"4px 8px",color:"#C0392B",borderColor:"#C0392B",flexShrink:0}}
                      onClick={async()=>{ if(supabase){ await supabase.from("fabric_shopping_list").delete().eq("id",item.id); setFabricShop(prev=>prev.filter(x=>x.id!==item.id)); setCounts(c=>({...c,shopping:Math.max(0,(c.shopping||1)-1)})); } }}>✕</button>
                  </div>
                ))}
                {customShop.length>0&&<div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".5px",margin:"12px 0 8px"}}>Other Items</div>}
                {customShop.map(item=>(
                  <div key={item.id} className="sub-card" style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13}}>{item.item}</div>
                      {(item.qty||item.notes)&&<div className="muted" style={{fontSize:11}}>{[item.qty?`Qty ${item.qty}`:"",item.notes].filter(Boolean).join(" · ")}</div>}
                    </div>
                    <button className="btn" style={{fontSize:11,padding:"4px 8px",color:"#C0392B",borderColor:"#C0392B",flexShrink:0}} onClick={()=>removeCustomShoppingItem(item.id)}>✕</button>
                  </div>
                ))}
              </div>
            }
          </div>
        )
      )}

      {/* ── FABRICS ── */}
      {activeSection==="fabrics"&&(
        <div className="card">
          <h2>Fabrics ({counts.fabrics})</h2>
          {stash.fabrics.length===0
            ?<p className="muted">No fabrics yet — find solids in the Match → Fabric tab.</p>
            :stash.fabrics.map((item,i)=>{
              const f=item.fabric_library;if(!f)return null;
              return(
                <div key={item.id||i} className="sub-card">
                  <div className="thread-row">
                    <div className="swatch" style={{background:f.hex_color||"#ccc"}}/>
                    <div style={{flex:1}}>
                      <div className="thread-name">{f.color_code?`${f.color_code} — `:""}{f.color_name}</div>
                      <div className="muted">{f.brand}{f.family?` · ${f.family}`:""}{f.nearest_kona_name?` · ~${f.nearest_kona_name}`:""}</div>
                    </div>
                  </div>
                  <label style={{fontSize:12,color:"var(--muted)"}}>Notes (yardage, cut, store…)
                    <input className="input" defaultValue={item.notes||""} placeholder="e.g. 2.5 yds, fat quarter…"
                      onBlur={e=>{ if(supabase) supabase.from("user_fabric_inventory").update({notes:e.target.value}).eq("id",item.id); }}/>
                  </label>
                  <div className="button-row">
                    <button className="btn" onClick={async()=>{ if(supabase){ await supabase.from("user_fabric_inventory").delete().eq("id",item.id); fetchAll(); } }}>Remove</button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ── RULERS ── */}
      {activeSection==="rulers"&&(
        <div className="card">
          <h2>Rulers ({counts.rulers})</h2>
          {stash.rulers.length===0
            ?<p className="muted">No rulers yet — browse in More → Rulers.</p>
            :stash.rulers.map((item,i)=>{
              const r=item.ruler_library;if(!r)return null;
              return<div key={i} className="sub-card"><b>{r.brand} — {r.name}</b><p className="muted">{r.category} · {r.size}{r.sku?` · ${r.sku}`:""}</p></div>;
            })
          }
        </div>
      )}

      {/* ── MACHINES ── */}
      {activeSection==="machines"&&(
        <MachineStashSection machines={stash.machines} supabase={supabase} userId={userId} onRefresh={fetchAll}/>
      )}

      {/* ── ACCUQUILT DIES ── */}
      {activeSection==="dies"&&(
        <div className="card">
          <h2>AccuQuilt Dies ({counts.dies})</h2>
          {stash.dies.length===0
            ?<p className="muted">No dies yet — browse in More → AccuQuilt.</p>
            :stash.dies.map((item,i)=>{
              const d=item.accuquilt_library||item.machine_library;if(!d)return null;
              return<div key={i} className="sub-card"><b>{d.product_name}</b><p className="muted">AccuQuilt · {d.product_type}</p></div>;
            })
          }
        </div>
      )}

      {/* ── FEET ── */}
      {activeSection==="feet"&&(
        <div className="card">
          <h2>Presser Feet ({counts.feet})</h2>
          {stash.feet.length===0
            ?<p className="muted">No feet yet — browse in More → Presser Feet.</p>
            :stash.feet.map((item,i)=>{
              const f=item.feet_library;if(!f)return null;
              const c=catColors[f.category]||catColors.General;
              return(
                <div key={i} className="sub-card" style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,background:c.bg,color:c.text,flexShrink:0}}>{f.category}</span>
                  <div><div className="thread-name">{f.foot_name}</div><div className="muted">{f.brand} · {f.shank_type}</div></div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ── ACCESSORIES ── */}
      {activeSection==="accessories"&&(
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <h2 style={{margin:0}}>Accessories ({counts.accessories})</h2>
            <button className="btn active" style={{fontSize:12}} onClick={()=>setShowAccForm(v=>!v)}>
              {showAccForm?"Cancel":"+ Add"}
            </button>
          </div>
          {showAccForm&&(
            <div className="sub-card" style={{marginBottom:12}}>
              <label style={{fontSize:12}}>Item name
                <input className="input" value={accForm.name} onChange={e=>setAccForm({...accForm,name:e.target.value})}
                  placeholder="e.g. Seam ripper, bobbins, needles, glue pen…"/>
              </label>
              <label style={{fontSize:12}}>Quantity
                <input className="input" type="number" value={accForm.quantity} onChange={e=>setAccForm({...accForm,quantity:e.target.value})} style={{marginBottom:8}}/>
              </label>
              <label style={{fontSize:12}}>Notes
                <input className="input" value={accForm.notes} onChange={e=>setAccForm({...accForm,notes:e.target.value})} placeholder="Brand, size, color, location…"/>
              </label>
              <button className="btn active" style={{width:"100%"}} onClick={saveAccessory}>Save Accessory</button>
            </div>
          )}
          {stash.accessories.length===0&&!showAccForm&&(
            <p className="muted">Track any sewing accessories here — bobbins, needles, seam rippers, glue pens, marking tools, anything that doesn't fit elsewhere.</p>
          )}
          {stash.accessories.map(acc=>(
            <div key={acc.id} className="sub-card" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
              <div>
                <b>{acc.name}</b>
                <div className="muted">Qty: {acc.quantity}</div>
                {acc.notes&&<div className="muted" style={{fontSize:12}}>{acc.notes}</div>}
              </div>
              <button className="btn" style={{fontSize:11,padding:"4px 8px",color:"#C0392B",borderColor:"#C0392B",flexShrink:0}} onClick={()=>removeAccessory(acc.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Insurance Report Modal */}
      {showReport&&(
        <InsuranceReportBuilder
          onClose={()=>setShowReport(false)}
          userId={userId}
          supabase={supabase}
          showValuesEnabled={userSettings?.showValuesInReports??false}
        />
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
function MachinesBrowser({ supabase, userId }) {
  const [machines,setMachines]   = useState([]);
  const [owned,setOwned]         = useState({});
  const [loading,setLoading]     = useState(true);
  const [search,setSearch]       = useState("");
  const [filterBrand,setFilterBrand] = useState("All");
  const [filterType,setFilterType]   = useState("All");
  const [browseMode,setBrowseMode]   = useState("brand"); // "brand" or "type"
  const [expandedId,setExpandedId]   = useState(null);

  const typeColors={
    Sewing:       {bg:"#E8F0FF",text:"#0047AB"},
    Quilting:     {bg:"#E0F5EC",text:"#1A6B4A"},
    Embroidery:   {bg:"#F3EAF8",text:"#6B3FA0"},
    Serger:       {bg:"#FFF8E1",text:"#5C4A1E"},
    Longarm:      {bg:"#FDE8E0",text:"#A0341A"},
    Coverstitch:  {bg:"#FFF3E0",text:"#E65100"},
    Combo:        {bg:"#E8F8F5",text:"#117A65"},
    "Sewing/Embroidery":{bg:"#F3EAF8",text:"#6B3FA0"},
    "Sewing/Quilting":  {bg:"#E0F5EC",text:"#1A6B4A"},
  };

  useEffect(()=>{ if(!supabase)return; fetchMachines(); if(userId)fetchOwned(); },[supabase,userId]);

  async function fetchMachines(){
    setLoading(true);
    const{data}=await supabase.from("machine_library").select("*").order("brand").order("model");
    setMachines(data||[]);
    setLoading(false);
  }

  async function fetchOwned(){
    const{data}=await supabase.from("user_machines").select("machine_id").eq("user_id",userId);
    if(data){const m={};data.forEach(r=>{m[r.machine_id]=true;});setOwned(m);}
  }

  async function toggleMachine(machineId){
    if(!userId||!supabase)return;
    if(owned[machineId]){
      const{error}=await supabase.from("user_machines")
        .delete().eq("user_id",userId).eq("machine_id",machineId);
      if(error){console.error("Remove machine error:",error);return;}
      setOwned(prev=>{const n={...prev};delete n[machineId];return n;});
    } else {
      const{error}=await supabase.from("user_machines")
        .insert({user_id:userId,machine_id:machineId});
      if(error){
        if(error.code==="23505"){setOwned(prev=>({...prev,[machineId]:true}));}
        else{console.error("Add machine error:",error);}
        return;
      }
      setOwned(prev=>({...prev,[machineId]:true}));
    }
  }

  if(loading)return<div className="card"><p className="muted">Loading machine library…</p></div>;

  const brands=["All",...new Set(machines.map(m=>m.brand).filter(Boolean))].sort();
  const types=["All",...new Set(machines.map(m=>m.type).filter(Boolean))].sort();

  const filtered=machines.filter(m=>{
    const q=normalized(search);
    const matchSearch=!q||
      normalized(m.brand).includes(q)||
      normalized(m.model).includes(q)||
      normalized(m.type||"").includes(q)||
      normalized(m.fun_fact||"").includes(q);
    const matchBrand=filterBrand==="All"||m.brand===filterBrand;
    const matchType=filterType==="All"||m.type===filterType;
    return matchSearch&&matchBrand&&matchType;
  });

  const grouped=filtered.reduce((acc,m)=>{
    const key=browseMode==="brand"?m.brand:(m.type||"Other");
    if(!acc[key])acc[key]=[];
    acc[key].push(m);
    return acc;
  },{});

  const ownedCount=Object.keys(owned).length;
  const hasFilters=search||filterBrand!=="All"||filterType!=="All";

  return(
    <div>
      {/* Header */}
      <div className="card" style={{padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div>
            <h2 style={{margin:0}}>Machine Library</h2>
            <div className="muted" style={{fontSize:12,marginTop:2}}>
              {machines.length} machines · {ownedCount} owned · Tap + Add to track in your stash
            </div>
          </div>
        </div>

        {/* Browse mode toggle */}
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <button className={`btn ${browseMode==="brand"?"active":""}`}
            style={{fontSize:12,flex:1}} onClick={()=>setBrowseMode("brand")}>
            Browse by Brand
          </button>
          <button className={`btn ${browseMode==="type"?"active":""}`}
            style={{fontSize:12,flex:1}} onClick={()=>setBrowseMode("type")}>
            Browse by Type
          </button>
        </div>

        {/* Search */}
        <input className="input" style={{marginBottom:8}} value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search brand, model, type…"/>

        {/* Filters */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <label style={{fontSize:11}}>Brand
            <select className="input" style={{marginBottom:0,fontSize:12}}
              value={filterBrand} onChange={e=>setFilterBrand(e.target.value)}>
              {brands.map(b=><option key={b}>{b}</option>)}
            </select>
          </label>
          <label style={{fontSize:11}}>Type
            <select className="input" style={{marginBottom:0,fontSize:12}}
              value={filterType} onChange={e=>setFilterType(e.target.value)}>
              {types.map(t=><option key={t}>{t}</option>)}
            </select>
          </label>
        </div>

        {hasFilters&&(
          <div style={{fontSize:12,color:"var(--teal)",marginTop:8,display:"flex",alignItems:"center",gap:8}}>
            Showing {filtered.length} of {machines.length} machines
            <button className="btn" style={{fontSize:11,padding:"2px 8px"}}
              onClick={()=>{setSearch("");setFilterBrand("All");setFilterType("All");}}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Grouped machines */}
      {Object.entries(grouped).sort(([a],[b])=>a.localeCompare(b)).map(([groupName,items])=>(
        <div key={groupName}>
          <div className="section-label">
            {groupName} ({items.length}) — {items.filter(m=>owned[m.id]).length} owned
          </div>
          {items.map(machine=>{
            const isOwned=owned[machine.id];
            const isExpanded=expandedId===machine.id;
            const tc=typeColors[machine.type]||{bg:"#F5F5F5",text:"#888"};

            return(
              <div key={machine.id} className="card"
                style={{borderColor:isOwned?"var(--leaf)":undefined,
                  borderWidth:isOwned?2:undefined,padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    {/* Type + computerized badges */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:5}}>
                      {machine.type&&(
                        <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8,
                          background:tc.bg,color:tc.text}}>
                          {machine.type}
                        </span>
                      )}
                      {machine.is_computerized&&(
                        <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6,
                          background:"var(--sky-pale)",color:"var(--sky-cobalt)",
                          border:"1px solid rgba(37,99,192,0.25)"}}>
                          💻 Computerized
                        </span>
                      )}
                      {machine.wifi&&(
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:6,
                          background:"#E8F0FF",color:"#0047AB"}}>
                          📶 WiFi
                        </span>
                      )}
                      {isOwned&&(
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:8,
                          background:"var(--leaf-wash)",color:"var(--leaf)",fontWeight:700}}>
                          ✓ Owned
                        </span>
                      )}
                    </div>

                    {/* Brand + Model */}
                    <div className="thread-name" style={{fontSize:13,marginBottom:3}}>
                      {machine.brand} {machine.model}
                    </div>

                    {/* Quick specs */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:4}}>
                      {machine.throat_space&&(
                        <span style={{fontSize:11,color:"var(--muted-warm)"}}>
                          📐 {machine.throat_space}" throat
                        </span>
                      )}
                      {machine.embroidery_field&&(
                        <span style={{fontSize:11,color:"var(--muted-warm)"}}>
                          🧵 {machine.embroidery_field} field
                        </span>
                      )}
                      {machine.stitch_count&&(
                        <span style={{fontSize:11,color:"var(--muted-warm)"}}>
                          {machine.stitch_count.toLocaleString()} stitches
                        </span>
                      )}
                      {machine.msrp&&(
                        <span style={{fontSize:11,color:"var(--leaf)",fontWeight:600}}>
                          {machine.msrp}
                        </span>
                      )}
                    </div>

                    {/* Feature chips */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {machine.auto_threader&&<span style={{fontSize:10,padding:"1px 5px",background:"#F5F5F5",color:"#888",borderRadius:4}}>Auto threader</span>}
                      {machine.auto_thread_cutter&&<span style={{fontSize:10,padding:"1px 5px",background:"#F5F5F5",color:"#888",borderRadius:4}}>Thread cutter</span>}
                      {machine.knee_lifter&&<span style={{fontSize:10,padding:"1px 5px",background:"#F5F5F5",color:"#888",borderRadius:4}}>Knee lifter</span>}
                      {machine.bsr_stitch_regulator&&<span style={{fontSize:10,padding:"1px 5px",background:"#F5F5F5",color:"#888",borderRadius:4}}>BSR</span>}
                      {machine.touchscreen&&<span style={{fontSize:10,padding:"1px 5px",background:"#F5F5F5",color:"#888",borderRadius:4}}>Touchscreen</span>}
                      {machine.usb&&<span style={{fontSize:10,padding:"1px 5px",background:"#F5F5F5",color:"#888",borderRadius:4}}>USB</span>}
                    </div>

                    {/* Fun fact */}
                    {machine.fun_fact&&(
                      <div style={{marginTop:3}}>
                        <p style={{fontSize:12,margin:0,color:"#5C4A1E",lineHeight:1.4,
                          display:isExpanded?"block":"-webkit-box",
                          WebkitLineClamp:isExpanded?undefined:2,
                          WebkitBoxOrient:"vertical",
                          overflow:isExpanded?"visible":"hidden"}}>
                          {machine.fun_fact}
                        </p>
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded&&(
                      <div style={{marginTop:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {machine.feed_system&&<div style={{fontSize:11}}><b>Feed:</b> {machine.feed_system}</div>}
                        {machine.bobbin_type&&<div style={{fontSize:11}}><b>Bobbin:</b> {machine.bobbin_type}</div>}
                        {machine.sewing_speed&&<div style={{fontSize:11}}><b>Speed:</b> {machine.sewing_speed} spm</div>}
                        {machine.needle_positions&&<div style={{fontSize:11}}><b>Needle pos:</b> {machine.needle_positions}</div>}
                        {machine.weight&&<div style={{fontSize:11}}><b>Weight:</b> {machine.weight}</div>}
                        {machine.dimensions&&<div style={{fontSize:11,gridColumn:"1/-1"}}><b>Dimensions:</b> {machine.dimensions}</div>}
                        {machine.warranty&&<div style={{fontSize:11}}><b>Warranty:</b> {machine.warranty}</div>}
                        {machine.country_made&&<div style={{fontSize:11}}><b>Made in:</b> {machine.country_made}</div>}
                        {machine.manufacturer_url&&(
                          <div style={{fontSize:11,gridColumn:"1/-1"}}>
                            <a href={machine.manufacturer_url} target="_blank" rel="noopener noreferrer"
                              style={{color:"var(--teal)"}}>
                              View on manufacturer site →
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expand toggle */}
                    <button style={{background:"none",border:"none",color:"var(--teal)",
                      fontSize:11,cursor:"pointer",padding:"3px 0"}}
                      onClick={()=>setExpandedId(isExpanded?null:machine.id)}>
                      {isExpanded?"▲ Less":"▼ More"}
                    </button>
                  </div>

                  <button className={`btn ${isOwned?"active":""}`}
                    style={{flexShrink:0,fontSize:11,padding:"6px 12px"}}
                    onClick={()=>toggleMachine(machine.id)}>
                    {isOwned?"✓ Owned":"+ Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {filtered.length===0&&(
        <div className="card" style={{textAlign:"center",padding:"24px"}}>
          <p className="muted">No machines match your search.</p>
          <button className="btn"
            onClick={()=>{setSearch("");setFilterBrand("All");setFilterType("All");}}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ACCUQUILT BROWSER
// ─────────────────────────────────────────────────────────────
function AccuQuiltBrowser({ supabase, userId }) {
  const [dies,setDies]=useState([]);
  const [owned,setOwned]=useState({});
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [filterType,setFilterType]=useState("All");
  const [filterCutter,setFilterCutter]=useState("All");
  const [expandedId,setExpandedId]=useState(null);

  useEffect(()=>{ if(!supabase)return; fetchDies(); if(userId)fetchOwned(); },[supabase,userId]);

  async function fetchDies(){
    setLoading(true);
    const{data}=await supabase.from("accuquilt_library").select("*").order("product_type").order("product_name");
    setDies(data||[]);
    setLoading(false);
  }

  async function fetchOwned(){
    const{data}=await supabase.from("user_dies").select("accuquilt_id").eq("user_id",userId);
    if(data){const m={};data.forEach(r=>{m[r.accuquilt_id]=true;});setOwned(m);}
  }

  async function toggleDie(id){
    if(!userId||!supabase)return;
    if(owned[id]){
      await supabase.from("user_dies").delete().eq("user_id",userId).eq("accuquilt_id",id);
      setOwned(prev=>{const n={...prev};delete n[id];return n;});
    } else {
      await supabase.from("user_dies").upsert({user_id:userId,accuquilt_id:id,quantity:1},{onConflict:"user_id,accuquilt_id"});
      setOwned(prev=>({...prev,[id]:true}));
    }
  }

  if(loading)return<div className="card"><p className="muted">Loading AccuQuilt library…</p></div>;

  const types=["All",...new Set(dies.map(d=>d.product_type).filter(Boolean))];
  const cutters=["All","GO!","GO! Big","GO! Bolt","GO! Me","Studio 2"];

  const filtered=dies.filter(d=>{
    const q=search.toLowerCase();
    const matchSearch=!q||
      d.product_name?.toLowerCase().includes(q)||
      d.sku?.toLowerCase().includes(q)||
      d.shape?.toLowerCase().includes(q)||
      d.size_info?.toLowerCase().includes(q)||
      d.description?.toLowerCase().includes(q);
    const matchType=filterType==="All"||d.product_type===filterType;
    const matchCutter=filterCutter==="All"||d.compatible_cutter?.includes(filterCutter);
    return matchSearch&&matchType&&matchCutter;
  });

  const grouped=filtered.reduce((acc,d)=>{
    const cat=d.product_type||"Other";
    if(!acc[cat])acc[cat]=[];
    acc[cat].push(d);
    return acc;
  },{});

  const ownedCount=Object.keys(owned).length;

  return(
    <div>
      {/* Header */}
      <div className="card" style={{padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div>
            <h2 style={{margin:0}}>AccuQuilt Cutters & Dies</h2>
            <div className="muted" style={{fontSize:12,marginTop:2}}>
              {dies.length} products · {ownedCount} owned · Tap + Add to track in your stash
            </div>
          </div>
        </div>
        {/* Search */}
        <input className="input" style={{marginBottom:8}} value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, SKU, shape, size…"/>
        {/* Filters */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <select className="input" style={{marginBottom:0,flex:1,fontSize:12}}
            value={filterType} onChange={e=>setFilterType(e.target.value)}>
            {types.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="input" style={{marginBottom:0,flex:1,fontSize:12}}
            value={filterCutter} onChange={e=>setFilterCutter(e.target.value)}>
            {cutters.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {(search||filterType!=="All"||filterCutter!=="All")&&(
          <div style={{fontSize:12,color:"var(--teal)",marginTop:6}}>
            Showing {filtered.length} of {dies.length} products
            <button className="btn" style={{fontSize:11,padding:"2px 8px",marginLeft:8}}
              onClick={()=>{setSearch("");setFilterType("All");setFilterCutter("All");}}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Product list */}
      {Object.entries(grouped).map(([cat,items])=>(
        <div key={cat}>
          <div className="section-label">{cat} ({items.length})</div>
          {items.map(die=>{
            const isOwned=owned[die.id];
            const isExpanded=expandedId===die.id;
            return(
              <div key={die.id} className="card"
                style={{borderColor:isOwned?"var(--leaf)":undefined,
                  borderWidth:isOwned?2:undefined,padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    {/* Name + BOB badge */}
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                      <div className="thread-name" style={{fontSize:13,margin:0}}>{die.product_name}</div>
                      {die.is_block_on_board&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:"var(--teal-pale)",color:"var(--teal)",fontWeight:700,flexShrink:0}}>
                          BOB
                        </span>
                      )}
                      {isOwned&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:"var(--leaf-wash)",color:"var(--leaf)",fontWeight:700,flexShrink:0}}>
                          ✓ Owned
                        </span>
                      )}
                    </div>

                    {/* Quick info chips */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {die.sku&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:"#F5F5F5",color:"#666",border:"1px solid #E0E0E0"}}>
                          SKU: {die.sku}
                        </span>
                      )}
                      {die.size_info&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:"var(--sky-pale)",color:"var(--sky-cobalt)",border:"1px solid var(--sky-pale)"}}>
                          {die.size_info}
                        </span>
                      )}
                      {die.finished_block_size&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:"var(--sun-pale)",color:"var(--sun-amber)",border:"1px solid var(--border-sun)"}}>
                          {die.finished_block_size} finished
                        </span>
                      )}
                      {die.msrp&&(
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                          background:"var(--leaf-wash)",color:"var(--leaf)",border:"1px solid var(--leaf-light)"}}>
                          {die.msrp}
                        </span>
                      )}
                    </div>

                    {/* Compatible cutters */}
                    {die.compatible_cutter&&(
                      <div style={{fontSize:11,color:"var(--muted-warm)",marginBottom:2}}>
                        ✂ {die.compatible_cutter}
                      </div>
                    )}

                    {/* Mat required */}
                    {die.mat_required&&(
                      <div style={{fontSize:11,color:"var(--muted-warm)",marginBottom:2}}>
                        🟦 Mat: {die.mat_required}
                      </div>
                    )}

                    {/* Description — expandable */}
                    {die.description&&(
                      <div style={{marginTop:4}}>
                        <p style={{fontSize:12,margin:0,color:"#5C4A1E",lineHeight:1.4,
                          display:isExpanded?"block":"-webkit-box",
                          WebkitLineClamp:isExpanded?undefined:2,
                          WebkitBoxOrient:"vertical",
                          overflow:isExpanded?"visible":"hidden"}}>
                          {die.description}
                        </p>
                        {die.description.length>80&&(
                          <button style={{background:"none",border:"none",color:"var(--teal)",
                            fontSize:11,cursor:"pointer",padding:"2px 0"}}
                            onClick={()=>setExpandedId(isExpanded?null:die.id)}>
                            {isExpanded?"▲ Less":"▼ More"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {isExpanded&&die.notes&&(
                      <div style={{marginTop:6,padding:"6px 8px",background:"var(--linen)",
                        borderRadius:6,fontSize:11,color:"var(--muted-warm)",fontStyle:"italic"}}>
                        💡 {die.notes}
                      </div>
                    )}
                  </div>

                  {/* Add button */}
                  <button className={`btn ${isOwned?"active":""}`}
                    style={{flexShrink:0,fontSize:11,padding:"6px 12px"}}
                    onClick={()=>toggleDie(die.id)}>
                    {isOwned?"✓ Owned":"+ Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {filtered.length===0&&(
        <div className="card" style={{textAlign:"center",padding:"24px"}}>
          <p className="muted">No products match your search.</p>
          <button className="btn" onClick={()=>{setSearch("");setFilterType("All");setFilterCutter("All");}}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMMUNITY FORUM (premium)
// ─────────────────────────────────────────────────────────────
function Forum({ supabase, userId }) {
  const [view,setView]=useState("list");      // "list" | "new" | "post"
  const [posts,setPosts]=useState([]);
  const [active,setActive]=useState(null);     // selected post object
  const [comments,setComments]=useState([]);
  const [myVotes,setMyVotes]=useState({});      // {post_id|comment_id:true}
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [busy,setBusy]=useState(false);
  // new post fields
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const [newComment,setNewComment]=useState("");
  // edit state
  const [editingPost,setEditingPost]=useState(false);
  const [editTitle,setEditTitle]=useState("");
  const [editBody,setEditBody]=useState("");
  const [editingComment,setEditingComment]=useState(null); // comment id
  const [editCommentBody,setEditCommentBody]=useState("");

  useEffect(()=>{ if(supabase) fetchPosts(); /* eslint-disable-next-line */ },[supabase]);

  async function fetchPosts(){
    setLoading(true);
    const{data}=await supabase.from("forum_posts").select("*").order("created_at",{ascending:false}).limit(100);
    const list=data||[];
    // Derive live counts from real rows (don't trust stored count columns)
    const withCounts=await Promise.all(list.map(async p=>{
      const[{count:vc},{count:cc}]=await Promise.all([
        supabase.from("forum_votes").select("id",{count:"exact",head:true}).eq("post_id",p.id),
        supabase.from("forum_comments").select("id",{count:"exact",head:true}).eq("post_id",p.id),
      ]);
      return {...p,_votes:vc||0,_comments:cc||0};
    }));
    setPosts(withCounts);
    if(userId){
      const{data:v}=await supabase.from("forum_votes").select("post_id,comment_id").eq("user_id",userId);
      if(v){const m={};v.forEach(x=>{if(x.post_id)m[x.post_id]=true;if(x.comment_id)m[x.comment_id]=true;});setMyVotes(m);}
    }
    setLoading(false);
  }

  async function openPost(p){
    setActive(p); setView("post"); setComments([]);
    const{data}=await supabase.from("forum_comments").select("*").eq("post_id",p.id).order("created_at",{ascending:true});
    const list=data||[];
    const withCounts=await Promise.all(list.map(async c=>{
      const{count}=await supabase.from("forum_votes").select("id",{count:"exact",head:true}).eq("comment_id",c.id);
      return {...c,_votes:count||0};
    }));
    setComments(withCounts);
  }

  async function createPost(){
    if(!userId||!title.trim()||busy)return;
    setBusy(true);
    const{data,error}=await supabase.from("forum_posts")
      .insert({user_id:userId,title:title.trim(),body:body.trim()})
      .select().maybeSingle();
    setBusy(false);
    if(error){alert("Could not post: "+error.message);return;}
    setTitle("");setBody("");
    setPosts(prev=>[{...data,_votes:0,_comments:0},...prev]);
    setView("list");
  }

  async function addComment(){
    if(!userId||!newComment.trim()||!active||busy)return;
    setBusy(true);
    const{data,error}=await supabase.from("forum_comments")
      .insert({post_id:active.id,user_id:userId,body:newComment.trim()})
      .select().maybeSingle();
    setBusy(false);
    if(error){alert("Could not comment: "+error.message);return;}
    setNewComment("");
    setComments(prev=>[...prev,{...data,_votes:0}]);
    const nc=(active._comments||0)+1;
    setActive(prev=>({...prev,_comments:nc}));
    setPosts(prev=>prev.map(p=>p.id===active.id?{...p,_comments:nc}:p));
  }

  async function votePost(p){
    if(!userId||myVotes[p.id])return;
    setMyVotes(prev=>({...prev,[p.id]:true}));
    const nc=(p._votes||0)+1;
    setPosts(prev=>prev.map(x=>x.id===p.id?{...x,_votes:nc}:x));
    if(active&&active.id===p.id)setActive(prev=>({...prev,_votes:nc}));
    const{error}=await supabase.from("forum_votes").insert({user_id:userId,post_id:p.id});
    if(error){ // roll back on failure
      setMyVotes(prev=>{const n={...prev};delete n[p.id];return n;});
      setPosts(prev=>prev.map(x=>x.id===p.id?{...x,_votes:(x._votes||1)-1}:x));
      if(active&&active.id===p.id)setActive(prev=>({...prev,_votes:(prev._votes||1)-1}));
    }
  }

  async function voteComment(c){
    if(!userId||myVotes[c.id])return;
    setMyVotes(prev=>({...prev,[c.id]:true}));
    const nc=(c._votes||0)+1;
    setComments(prev=>prev.map(x=>x.id===c.id?{...x,_votes:nc}:x));
    const{error}=await supabase.from("forum_votes").insert({user_id:userId,comment_id:c.id});
    if(error){
      setMyVotes(prev=>{const n={...prev};delete n[c.id];return n;});
      setComments(prev=>prev.map(x=>x.id===c.id?{...x,_votes:(x._votes||1)-1}:x));
    }
  }

  function when(ts){ if(!ts)return""; const d=new Date(ts); return d.toLocaleDateString(); }

  // ── EDIT / DELETE: POST ──
  function startEditPost(){ setEditTitle(active.title||""); setEditBody(active.body||""); setEditingPost(true); }
  async function saveEditPost(){
    if(!editTitle.trim()||busy)return;
    setBusy(true);
    const upd={title:editTitle.trim(),body:editBody.trim(),updated_at:new Date().toISOString()};
    const{error}=await supabase.from("forum_posts").update(upd).eq("id",active.id);
    setBusy(false);
    if(error){alert("Could not save: "+error.message);return;}
    setActive(prev=>({...prev,...upd}));
    setPosts(prev=>prev.map(p=>p.id===active.id?{...p,...upd}:p));
    setEditingPost(false);
  }
  async function deletePost(){
    if(busy||!window.confirm("Delete this post? This cannot be undone."))return;
    setBusy(true);
    const{error}=await supabase.from("forum_posts").delete().eq("id",active.id);
    setBusy(false);
    if(error){alert("Could not delete: "+error.message);return;}
    setPosts(prev=>prev.filter(p=>p.id!==active.id));
    setActive(null); setView("list");
  }

  // ── EDIT / DELETE: COMMENT ──
  function startEditComment(c){ setEditingComment(c.id); setEditCommentBody(c.body||""); }
  async function saveEditComment(c){
    if(!editCommentBody.trim()||busy)return;
    setBusy(true);
    const{error}=await supabase.from("forum_comments").update({body:editCommentBody.trim()}).eq("id",c.id);
    setBusy(false);
    if(error){alert("Could not save: "+error.message);return;}
    setComments(prev=>prev.map(x=>x.id===c.id?{...x,body:editCommentBody.trim()}:x));
    setEditingComment(null);
  }
  async function deleteComment(c){
    if(busy||!window.confirm("Delete this comment?"))return;
    setBusy(true);
    const{error}=await supabase.from("forum_comments").delete().eq("id",c.id);
    setBusy(false);
    if(error){alert("Could not delete: "+error.message);return;}
    setComments(prev=>prev.filter(x=>x.id!==c.id));
    setActive(prev=>({...prev,_comments:Math.max(0,(prev._comments||1)-1)}));
    setPosts(prev=>prev.map(p=>p.id===active.id?{...p,_comments:Math.max(0,(p._comments||1)-1)}:p));
  }

  if(loading)return<div className="card"><p className="muted">Loading community forum…</p></div>;

  // ── NEW POST ──
  if(view==="new"){
    return(
      <div>
        <div className="card" style={{padding:"12px 16px"}}>
          <button className="btn" onClick={()=>setView("list")}>← Back</button>
          <h2 style={{margin:"10px 0"}}>New Post</h2>
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{marginBottom:8}}/>
          <textarea className="input" placeholder="Share your tip, question, or review…" value={body} onChange={e=>setBody(e.target.value)} rows={6} style={{marginBottom:8,resize:"vertical"}}/>
          <button className="btn active" disabled={busy||!title.trim()} onClick={createPost}>{busy?"Posting…":"Post"}</button>
        </div>
      </div>
    );
  }

  // ── SINGLE POST ──
  if(view==="post"&&active){
    return(
      <div>
        <div className="card" style={{padding:"12px 16px"}}>
          <button className="btn" onClick={()=>{setView("list");setActive(null);setEditingPost(false);}}>← Back</button>
          {editingPost?(
            <div style={{marginTop:10}}>
              <input className="input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{marginBottom:8}}/>
              <textarea className="input" value={editBody} onChange={e=>setEditBody(e.target.value)} rows={6} style={{marginBottom:8,resize:"vertical"}}/>
              <div style={{display:"flex",gap:8}}>
                <button className="btn active" disabled={busy||!editTitle.trim()} onClick={saveEditPost}>{busy?"Saving…":"Save"}</button>
                <button className="btn" onClick={()=>setEditingPost(false)}>Cancel</button>
              </div>
            </div>
          ):(<>
            <h2 style={{margin:"10px 0 4px"}}>{active.title}</h2>
            <div className="muted" style={{fontSize:12,marginBottom:8}}>{when(active.created_at)}{active.updated_at&&active.updated_at!==active.created_at?" · edited":""}</div>
            {active.body&&<p style={{whiteSpace:"pre-wrap",lineHeight:1.5}}>{active.body}</p>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <button className={`btn ${myVotes[active.id]?"active":""}`} onClick={()=>votePost(active)} disabled={myVotes[active.id]}>▲ {active._votes||0}</button>
              {userId===active.user_id&&<>
                <button className="btn" onClick={startEditPost} style={{fontSize:12,padding:"2px 8px"}}>Edit</button>
                <button className="btn" onClick={deletePost} style={{fontSize:12,padding:"2px 8px",color:"#a33"}}>Delete</button>
              </>}
            </div>
          </>)}
        </div>
        <div className="card" style={{padding:"8px 12px"}}><p className="muted">{comments.length} comment{comments.length===1?"":"s"}</p></div>
        {comments.map(c=>(
          <div key={c.id} className="card">
            {editingComment===c.id?(
              <div>
                <textarea className="input" value={editCommentBody} onChange={e=>setEditCommentBody(e.target.value)} rows={3} style={{marginBottom:8,resize:"vertical"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn active" disabled={busy||!editCommentBody.trim()} onClick={()=>saveEditComment(c)}>{busy?"Saving…":"Save"}</button>
                  <button className="btn" onClick={()=>setEditingComment(null)}>Cancel</button>
                </div>
              </div>
            ):(<>
              <p style={{whiteSpace:"pre-wrap",lineHeight:1.5,margin:"0 0 6px"}}>{c.body}</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button className={`btn ${myVotes[c.id]?"active":""}`} onClick={()=>voteComment(c)} disabled={myVotes[c.id]} style={{fontSize:12,padding:"2px 8px"}}>▲ {c._votes||0}</button>
                <span className="muted" style={{fontSize:11}}>{when(c.created_at)}</span>
                {userId===c.user_id&&<>
                  <button className="btn" onClick={()=>startEditComment(c)} style={{fontSize:12,padding:"2px 8px"}}>Edit</button>
                  <button className="btn" onClick={()=>deleteComment(c)} style={{fontSize:12,padding:"2px 8px",color:"#a33"}}>Delete</button>
                </>}
              </div>
            </>)}
          </div>
        ))}
        {userId&&(
          <div className="card">
            <textarea className="input" placeholder="Add a comment…" value={newComment} onChange={e=>setNewComment(e.target.value)} rows={3} style={{marginBottom:8,resize:"vertical"}}/>
            <button className="btn active" disabled={busy||!newComment.trim()} onClick={addComment}>{busy?"Posting…":"Comment"}</button>
          </div>
        )}
      </div>
    );
  }

  // ── LIST ──
  const filtered=posts.filter(p=>!search||normalized(p.title).includes(normalized(search))||normalized(p.body).includes(normalized(search)));
  return(
    <div>
      <div className="card" style={{padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <h2 style={{margin:0}}>Community Forum</h2>
          {userId&&<button className="btn active" onClick={()=>setView("new")}>+ New Post</button>}
        </div>
        <input className="input" placeholder="Search posts…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="card" style={{padding:"8px 12px"}}><p className="muted">{filtered.length} post{filtered.length===1?"":"s"}</p></div>
      {filtered.map(p=>(
        <div key={p.id} className="card" style={{cursor:"pointer"}} onClick={()=>openPost(p)}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <div style={{flex:1}}>
              <div className="thread-name">{p.title}</div>
              {p.body&&<p style={{fontSize:13,margin:"4px 0 0",color:"#5C4A1E",lineHeight:1.4}}>{normalized(p.body).length>120?p.body.slice(0,120)+"…":p.body}</p>}
              <div className="muted" style={{fontSize:11,marginTop:6}}>▲ {p._votes||0} · 💬 {p._comments||0} · {when(p.created_at)}</div>
            </div>
          </div>
        </div>
      ))}
      {posts.length===0&&<div className="card"><p className="muted">No posts yet — start the conversation!</p></div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RULER BROWSER
// ─────────────────────────────────────────────────────────────
function RulerBrowser({ supabase, userId }) {
  const [rulers,setRulers]=useState([]);
  const [owned,setOwned]=useState({});
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  useEffect(()=>{ if(!supabase)return; fetchRulers(); if(userId)fetchOwned(); },[supabase,userId]);
  async function fetchRulers(){ setLoading(true); const{data}=await supabase.from("ruler_library").select("*").order("brand").order("name"); setRulers(data||[]); setLoading(false); }
  async function fetchOwned(){ const{data}=await supabase.from("user_rulers").select("ruler_id").eq("user_id",userId); if(data){const m={};data.forEach(r=>{m[r.ruler_id]=true;});setOwned(m);} }
  async function toggleRuler(rulerId){
    if(!userId||!supabase)return;
    if(owned[rulerId]){ await supabase.from("user_rulers").delete().eq("user_id",userId).eq("ruler_id",rulerId); setOwned(prev=>{const n={...prev};delete n[rulerId];return n;}); }
    else{ await supabase.from("user_rulers").upsert({user_id:userId,ruler_id:rulerId,quantity:1},{onConflict:"user_id,ruler_id"}); setOwned(prev=>({...prev,[rulerId]:true})); }
  }
  const filtered=rulers.filter(r=>!search||normalized(r.brand).includes(normalized(search))||normalized(r.name).includes(normalized(search))||normalized(r.category).includes(normalized(search)));
  if(loading)return<div className="card"><p className="muted">Loading ruler library…</p></div>;
  return(
    <div>
      <div className="card" style={{padding:"12px 16px"}}>
        <h2 style={{marginBottom:10}}>Ruler Library ({rulers.length})</h2>
        <input className="input" placeholder="Search brand, shape…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="card" style={{padding:"8px 12px"}}><p className="muted">{filtered.length} rulers — tap to add to your stash</p></div>
      {filtered.map(ruler=>{
        const isOwned=owned[ruler.id];
        return(
          <div key={ruler.id} className="card" style={{borderColor:isOwned?"#1A5C1A":undefined}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div className="thread-name">{ruler.brand} — {ruler.name}</div>
                <div className="muted">{ruler.category} · {ruler.size}{ruler.sku?` · ${ruler.sku}`:""}{ruler.msrp_usd?` · $${ruler.msrp_usd}`:""}</div>
                {ruler.notes&&<p style={{fontSize:12,margin:"4px 0 0",color:"#5C4A1E",lineHeight:1.4}}>{ruler.notes}</p>}
              </div>
              <button className={`btn ${isOwned?"active":""}`} style={{flexShrink:0}} onClick={()=>toggleRuler(ruler.id)}>{isOwned?"✓ Owned":"+ Add"}</button>
            </div>
          </div>
        );
      })}
      {rulers.length===0&&<div className="card"><p className="muted">No ruler data found. Check the ruler_library table in Supabase.</p></div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FEET BROWSER
// ─────────────────────────────────────────────────────────────
function FeetBrowser({ supabase, userId }) {
  const [feet,setFeet]=useState([]);
  const [owned,setOwned]=useState({});
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [filterBrand,setFilterBrand]=useState("All");
  const [filterCategory,setFilterCategory]=useState("All");
  
  const [expandedId,setExpandedId]=useState(null);
  const [browseMode,setBrowseMode]=useState("brand"); // "brand" or "category"

  const catColors={
    Quilting:{bg:"#E8F0FF",text:"#0047AB"},
    Garment:{bg:"#E0F5EC",text:"#1A6B4A"},
    Embroidery:{bg:"#F3EAF8",text:"#6B3FA0"},
    Serging:{bg:"#FFF8E1",text:"#5C4A1E"},
    Coverstitch:{bg:"#FFF3E0",text:"#E65100"},
    Specialty:{bg:"#FDECEA",text:"#C0392B"},
    General:{bg:"#F5F5F5",text:"#888"}
  };

  useEffect(()=>{ if(!supabase)return; fetchFeet(); if(userId)fetchOwned(); },[supabase,userId]);

  async function fetchFeet(){
    setLoading(true);
    const{data}=await supabase.from("feet_library").select("*").order("brand").order("category").order("foot_name");
    setFeet(data||[]);
    setLoading(false);
  }

  async function fetchOwned(){
    const{data}=await supabase.from("user_feet").select("foot_id").eq("user_id",userId);
    if(data){const m={};data.forEach(r=>{m[r.foot_id]=true;});setOwned(m);}
  }

  async function toggleFoot(footId){
    if(!userId||!supabase)return;
    if(owned[footId]){
      await supabase.from("user_feet").delete().eq("user_id",userId).eq("foot_id",footId);
      setOwned(prev=>{const n={...prev};delete n[footId];return n;});
    } else {
      await supabase.from("user_feet").upsert({user_id:userId,foot_id:footId,quantity:1},{onConflict:"user_id,foot_id"});
      setOwned(prev=>({...prev,[footId]:true}));
    }
  }

  if(loading)return<div className="card"><p className="muted">Loading feet library…</p></div>;

  // Build brand list from both brand field AND compatible_brands array
  const allBrands=["All",...new Set([
    ...feet.map(f=>f.brand).filter(Boolean),
    ...feet.flatMap(f=>Array.isArray(f.compatible_brands)?f.compatible_brands:[]).filter(Boolean)
  ].sort())];

  const categories=["All","Quilting","Garment","Embroidery","Specialty","Serging","Coverstitch","General"];
  

  // Filter logic
  const filtered=feet.filter(f=>{
    const q=search.toLowerCase();
    const matchSearch=!q||
      f.foot_name?.toLowerCase().includes(q)||
      f.brand?.toLowerCase().includes(q)||
      f.foot_number?.toLowerCase().includes(q)||
      
      f.description?.toLowerCase().includes(q)||
      (Array.isArray(f.best_for)&&f.best_for.some(b=>b.toLowerCase().includes(q)));

    const matchBrand=filterBrand==="All"||
      f.brand===filterBrand||
      (Array.isArray(f.compatible_brands)&&f.compatible_brands.includes(filterBrand));

    const matchCat=filterCategory==="All"||f.category===filterCategory;
    
    return matchSearch&&matchBrand&&matchCat;
  });

  // Group by brand or category
  const grouped=filtered.reduce((acc,f)=>{
    const key=browseMode==="brand"?f.brand:(f.category||"General");
    if(!acc[key])acc[key]=[];
    acc[key].push(f);
    return acc;
  },{});

  const ownedCount=Object.keys(owned).length;
  const hasFilters=search||filterBrand!=="All"||filterCategory!=="All";

  return(
    <div>
      {/* Header */}
      <div className="card" style={{padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div>
            <h2 style={{margin:0}}>Presser Feet</h2>
            <div className="muted" style={{fontSize:12,marginTop:2}}>
              {feet.length} feet · {ownedCount} owned · Tap + Add to track in your stash
            </div>
          </div>
        </div>

        {/* Browse mode toggle */}
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <button className={`btn ${browseMode==="brand"?"active":""}`}
            style={{fontSize:12,flex:1}} onClick={()=>setBrowseMode("brand")}>
            Browse by Brand
          </button>
          <button className={`btn ${browseMode==="category"?"active":""}`}
            style={{fontSize:12,flex:1}} onClick={()=>setBrowseMode("category")}>
            Browse by Category
          </button>
        </div>

        {/* Search */}
        <input className="input" style={{marginBottom:8}} value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search foot name, number, brand, use…"/>

        {/* Filters */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <label style={{fontSize:11}}>Brand
            <select className="input" style={{marginBottom:0,fontSize:12}}
              value={filterBrand} onChange={e=>setFilterBrand(e.target.value)}>
              {allBrands.map(b=><option key={b}>{b}</option>)}
            </select>
          </label>
          <label style={{fontSize:11}}>Category
            <select className="input" style={{marginBottom:0,fontSize:12}}
              value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {hasFilters&&(
          <div style={{fontSize:12,color:"var(--teal)",marginTop:8,display:"flex",alignItems:"center",gap:8}}>
            Showing {filtered.length} of {feet.length} feet
            <button className="btn" style={{fontSize:11,padding:"2px 8px"}}
              onClick={()=>{setSearch("");setFilterBrand("All");setFilterCategory("All");}}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Grouped feet */}
      {Object.entries(grouped).sort(([a],[b])=>a.localeCompare(b)).map(([groupName,items])=>(
        <div key={groupName}>
          <div className="section-label">
            {groupName} ({items.length}) — {items.filter(f=>owned[f.id]).length} owned
          </div>
          {items.map(foot=>{
            const c=catColors[foot.category]||catColors.General;
            const isOwned=owned[foot.id];
            const isExpanded=expandedId===foot.id;
            const compatBrands=Array.isArray(foot.compatible_brands)?foot.compatible_brands:[];

            return(
              <div key={foot.id} className="card"
                style={{borderColor:isOwned?"var(--leaf)":undefined,
                  borderWidth:isOwned?2:undefined,padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    {/* Category + foot number badges */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:5}}>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8,
                        background:c.bg,color:c.text}}>
                        {foot.category}
                      </span>
                      {foot.foot_number&&(
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:8,
                          background:"var(--teal-pale)",color:"var(--teal)"}}>
                          #{foot.foot_number}
                        </span>
                      )}
                      {isOwned&&(
                        <span style={{fontSize:10,padding:"2px 7px",borderRadius:8,
                          background:"var(--leaf-wash)",color:"var(--leaf)",fontWeight:700}}>
                          ✓ Owned
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="thread-name" style={{fontSize:13,marginBottom:3}}>{foot.foot_name}</div>

                    {/* Brand + shank */}
                    <div className="muted" style={{fontSize:12,marginBottom:4}}>
                      {foot.brand} · {foot.shank_type}
                    </div>

                    {/* Compatible brands chips */}
                    {compatBrands.length>0&&browseMode==="category"&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:5}}>
                        {compatBrands.slice(0,6).map((b,i)=>(
                          <span key={i} style={{fontSize:10,padding:"1px 6px",borderRadius:4,
                            background:"#F0F4FF",color:"#1A3C8F",border:"1px solid #C5D3F0"}}>
                            {b}
                          </span>
                        ))}
                        {compatBrands.length>6&&(
                          <span style={{fontSize:10,color:"var(--muted-warm)"}}>+{compatBrands.length-6} more</span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {foot.description&&(
                      <div style={{marginTop:3}}>
                        <p style={{fontSize:12,margin:0,color:"#5C4A1E",lineHeight:1.4,
                          display:isExpanded?"block":"-webkit-box",
                          WebkitLineClamp:isExpanded?undefined:2,
                          WebkitBoxOrient:"vertical",
                          overflow:isExpanded?"visible":"hidden"}}>
                          {foot.description}
                        </p>
                      </div>
                    )}

                    {/* Best for tags */}
                    {foot.best_for&&foot.best_for.length>0&&(
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                        {(isExpanded?foot.best_for:foot.best_for.slice(0,3)).map((u,i)=>(
                          <span key={i} style={{fontSize:10,padding:"1px 5px",
                            background:"#F5F5F5",color:"#888",borderRadius:4}}>
                            {u}
                          </span>
                        ))}
                        {!isExpanded&&foot.best_for.length>3&&(
                          <span style={{fontSize:10,color:"var(--muted-warm)"}}>+{foot.best_for.length-3}</span>
                        )}
                      </div>
                    )}

                    {/* Notes when expanded */}
                    {isExpanded&&foot.notes&&(
                      <div style={{marginTop:6,padding:"6px 8px",background:"var(--linen)",
                        borderRadius:6,fontSize:11,color:"var(--muted-warm)",fontStyle:"italic"}}>
                        💡 {foot.notes}
                      </div>
                    )}

                    {/* Expand toggle */}
                    {(foot.description?.length>80||foot.best_for?.length>3||foot.notes)&&(
                      <button style={{background:"none",border:"none",color:"var(--teal)",
                        fontSize:11,cursor:"pointer",padding:"3px 0"}}
                        onClick={()=>setExpandedId(isExpanded?null:foot.id)}>
                        {isExpanded?"▲ Less":"▼ More"}
                      </button>
                    )}
                  </div>

                  <button className={`btn ${isOwned?"active":""}`}
                    style={{flexShrink:0,fontSize:11,padding:"6px 12px"}}
                    onClick={()=>toggleFoot(foot.id)}>
                    {isOwned?"✓ Owned":"+ Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {filtered.length===0&&(
        <div className="card" style={{textAlign:"center",padding:"24px"}}>
          <p className="muted">No feet match your search.</p>
          <button className="btn" onClick={()=>{setSearch("");setFilterBrand("All");setFilterCategory("All");}}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CROSS-REFERENCE TAB


// ─────────────────────────────────────────────────────────────
// UpgradePrompt — shown when a feature requires a higher plan
// ─────────────────────────────────────────────────────────────
function UpgradePrompt({ requiredPlan, feature, currentPlan, isGuest }) {
  const [cycle, setCycle] = useState("annual"); // "monthly" | "annual"
  const perks = {
    basic: ["Unlimited thread stash", "Machine library", "Shopping lists", "Up to 5 projects", "Cross-reference", "Camera match", "Barcode scanner"],
    premium: ["Everything in Basic", "Fabric & accessory stash", "Unlimited projects", "Community Forum", "CSV export", "Insurance reports"],
  };
  const isPaid = requiredPlan === "basic" || requiredPlan === "premium";
  const sav = isPaid ? annualSavings(requiredPlan) : null;
  return (
    <div className="card" style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:36,marginBottom:10}}>🔒</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"var(--teal)",marginBottom:8}}>
        {feature} requires {requiredPlan === "basic" ? "Basic" : "Premium"}
      </div>
      <p className="muted" style={{fontSize:13,marginBottom:16,lineHeight:1.6}}>
        {isGuest || !currentPlan
          ? "Create a free account to get started, or upgrade for full access."
          : `You're on the ${currentPlan.charAt(0).toUpperCase()+currentPlan.slice(1)} plan. Upgrade to unlock this feature.`}
      </p>

      {isPaid && (
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          <div style={{display:"inline-flex",background:"var(--warm-white)",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-full)",padding:3,gap:2}}>
            {[["monthly","Monthly"],["annual","Annual"]].map(([key,label])=>(
              <button key={key} onClick={()=>setCycle(key)}
                style={{
                  padding:"5px 16px",borderRadius:"var(--r-full)",border:"none",cursor:"pointer",
                  fontFamily:"Nunito,sans-serif",fontSize:12,fontWeight:700,
                  background:cycle===key?"var(--teal)":"transparent",
                  color:cycle===key?"#fff":"var(--muted)",transition:"all .15s"
                }}>
                {label}{key==="annual"&&sav?` · save ${sav.pct}%`:""}
              </button>
            ))}
          </div>
        </div>
      )}

      {isPaid && (
        <div style={{background:"var(--teal-pale)",borderRadius:10,padding:"14px 16px",marginBottom:20,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--teal)",marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>
            {requiredPlan === "basic" ? "Basic" : "Premium"} — {priceLabel(requiredPlan,cycle)}
          </div>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:10}}>
            {cycle==="annual"
              ? (sav?`Save ${fmtPrice(sav.amount)} vs monthly`:"Billed yearly")
              : `or ${priceLabel(requiredPlan,"annual")} billed yearly`}
          </div>
          {perks[requiredPlan].map((p,i)=>(
            <div key={i} style={{fontSize:13,color:"var(--ink)",padding:"3px 0"}}>✓ &nbsp;{p}</div>
          ))}
        </div>
      )}
      <button
        className="btn active"
        onClick={()=>{ window.location.href = window.location.origin; }}
        style={{width:"100%",marginBottom:8}}
      >
        {isGuest ? "Create Account" : `Upgrade to ${requiredPlan === "basic" ? "Basic" : "Premium"}`}
      </button>
      {isGuest && (
        <p className="muted" style={{fontSize:12,margin:0}}>Already have an account? <span style={{color:"var(--teal)",cursor:"pointer",textDecoration:"underline"}} onClick={()=>window.location.reload()}>Sign in</span></p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ColorWheelTab — Color harmony explorer with thread matching
// ─────────────────────────────────────────────────────────────
// Custom RGB color picker — full control on mobile (native input shows only ~8 swatches on iOS/Android)
function ColorPicker({ value, onChange }) {
  const rgb = hexToRgb(value) || { r: 42, g: 127, b: 127 };
  const toHex = x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
  const setChannel = (ch, v) => {
    const next = { ...rgb, [ch]: Number(v) };
    onChange("#" + toHex(next.r) + toHex(next.g) + toHex(next.b));
  };
  const channels = [["r", "R", "#e44"], ["g", "G", "#2a2"], ["b", "B", "#36f"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: value, border: "2px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={e => {
            let v = e.target.value.trim();
            if (!v.startsWith("#")) v = "#" + v;
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
          }}
          style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--teal)", width: 100, padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--border-teal)", background: "var(--warm-white)" }}
        />
      </div>
      {channels.map(([ch, label, col]) => (
        <div key={ch} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: col, width: 14 }}>{label}</span>
          <input
            type="range" min="0" max="255" value={rgb[ch]}
            onChange={e => setChannel(ch, e.target.value)}
            style={{ flex: 1, accentColor: col }}
          />
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)", width: 30, textAlign: "right" }}>{rgb[ch]}</span>
        </div>
      ))}
    </div>
  );
}

function ColorWheelTab({ supaAllThreads, supaFabrics=[], userId, supabase, addToUserInventory, addFabricToInventory, addManualShoppingItem }) {
  const [stashThreads, setStashThreads] = useState([]);

  useEffect(() => {
    if (!supabase || !userId) return;
    supabase.from("user_inventory")
      .select("thread_library(id,brand,brand_key,color_code,color_name,hex_color,fiber_type,weight,r,g,b)")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setStashThreads(data.map(d => d.thread_library).filter(Boolean));
      });
  }, [supabase, userId]);

  const HARMONY_TYPES = [
    {
      key: "complementary",
      label: "Complementary",
      icon: "◑",
      desc: "Two colors directly opposite each other on the wheel. High contrast and bold — great for making embroidery pop against fabric.",
      example: "Red thread on a green quilt. Navy on gold.",
      angles: [180],
    },
    {
      key: "analogous",
      label: "Analogous",
      icon: "≋",
      desc: "Three colors sitting side-by-side on the wheel. Naturally harmonious and soothing — ideal for blended, gradient-style embroidery.",
      example: "Blue, teal, and green. Red, orange, and yellow.",
      angles: [-30, 30],
    },
    {
      key: "triadic",
      label: "Triadic",
      icon: "△",
      desc: "Three colors equally spaced around the wheel. Vibrant and playful — works well for bold, multi-color quilt designs.",
      example: "Red, yellow, and blue. Orange, green, and purple.",
      angles: [120, 240],
    },
    {
      key: "split",
      label: "Split-Complementary",
      icon: "⌥",
      desc: "Your color plus the two colors flanking its complement. Softer than complementary but still high contrast — a beginner-friendly bold palette.",
      example: "Blue with red-orange and yellow-orange.",
      angles: [150, 210],
    },
    {
      key: "tetradic",
      label: "Tetradic",
      icon: "▣",
      desc: "Four colors forming a rectangle on the wheel. Rich and complex — best when one color dominates and the others accent.",
      example: "Red, orange, blue, and teal.",
      angles: [90, 180, 270],
    },
    {
      key: "monochromatic",
      label: "Monochromatic",
      icon: "◎",
      desc: "Shades and tints of a single color. Elegant and cohesive — perfect for tone-on-tone quilting and subtle embroidery.",
      example: "Light blue, medium blue, and navy all in one design.",
      angles: [],
      mono: true,
    },
  ];

  const [harmony, setHarmony] = useState("complementary");
  const [baseHex, setBaseHex] = useState("#2a7f7f");
  const [source, setSource] = useState("all");
  const [matches, setMatches] = useState([]);

  const currentHarmony = HARMONY_TYPES.find(h => h.key === harmony);

  function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
        case gn: h = ((bn - rn) / d + 2) / 6; break;
        default: h = ((rn - gn) / d + 4) / 6;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, "0");
    return "#" + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  function getHarmonyColors(hex, harmonyDef) {
    const { h, s, l } = hexToHsl(hex);
    const colors = [{ hex, label: "Base" }];
    if (harmonyDef.mono) {
      colors.push({ hex: hslToHex(h, s, Math.max(l - 25, 10)), label: "Shade" });
      colors.push({ hex: hslToHex(h, s, Math.min(l + 25, 90)), label: "Tint" });
    } else {
      harmonyDef.angles.forEach((angle, i) => {
        colors.push({ hex: hslToHex(h + angle, s, l), label: `Harmony ${i + 1}` });
      });
    }
    return colors;
  }

  function findThreadMatches(hex, pool) {
    const rgb = hexToRgb(hex);
    if (!rgb || !pool || !pool.length) return [];
    return pool
      .filter(t => t && t.hex_color)
      .map(t => {
        const tRgb = t.r != null ? { r: t.r, g: t.g, b: t.b } : hexToRgb(t.hex_color);
        return { thread: t, dist: colorDistance(rgb, tRgb) };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map(m => ({ ...m.thread, _dist: m.dist }));
  }

  function findFabricMatches(hex, pool) {
    const rgb = hexToRgb(hex);
    if (!rgb || !pool || !pool.length) return [];
    return pool
      .filter(f => f && f.hex_color)
      .map(f => {
        const fRgb = f.r != null ? { r: f.r, g: f.g, b: f.b } : hexToRgb(f.hex_color);
        return { fabric: f, dist: colorDistance(rgb, fRgb) };
      })
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map(m => ({ ...m.fabric, _dist: m.dist }));
  }

  useEffect(() => {
    const harmonyDef = HARMONY_TYPES.find(h => h.key === harmony);
    const colors = getHarmonyColors(baseHex, harmonyDef);
    const pool = source === "stash" ? stashThreads : supaAllThreads;
    const result = colors.map(c => ({
      ...c,
      threads: findThreadMatches(c.hex, pool),
      fabrics: findFabricMatches(c.hex, supaFabrics),
    }));
    setMatches(result);
  }, [baseHex, harmony, source, supaAllThreads, stashThreads, supaFabrics]);

  return (
    <div>
      <div className="card" style={{ marginBottom: 10 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--teal)", marginBottom: 4 }}>
          🎨 Color Harmony
        </h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>
          Explore color relationships and find matching threads for any palette.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Base Color</label>
            <ColorPicker value={baseHex} onChange={setBaseHex} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Match From</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["all", "All Threads"], ["stash", "My Stash"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSource(val)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                    border: source === val ? "2px solid var(--teal)" : "1.5px solid var(--border-teal)",
                    background: source === val ? "var(--teal)" : "var(--warm-white)",
                    color: source === val ? "#fff" : "var(--teal)",
                    fontWeight: source === val ? 700 : 400,
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Harmony Type</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HARMONY_TYPES.map(h => (
            <button
              key={h.key}
              onClick={() => setHarmony(h.key)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                border: harmony === h.key ? "2px solid var(--teal)" : "1.5px solid var(--border-teal)",
                background: harmony === h.key ? "var(--teal)" : "var(--warm-white)",
                color: harmony === h.key ? "#fff" : "var(--teal)",
                fontWeight: harmony === h.key ? 700 : 400,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 15 }}>{h.icon}</span>
              {h.label}
            </button>
          ))}
        </div>

        {currentHarmony && (
          <div style={{
            marginTop: 12, padding: "12px 14px", borderRadius: 8,
            background: "var(--teal-pale)", border: "1px solid var(--border-teal)",
          }}>
            <div style={{ fontWeight: 700, color: "var(--teal)", marginBottom: 4, fontSize: 14 }}>
              {currentHarmony.icon} {currentHarmony.label}
            </div>
            <p style={{ fontSize: 13, color: "var(--ink)", marginBottom: 6, lineHeight: 1.5 }}>
              {currentHarmony.desc}
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
              <strong>Example:</strong> {currentHarmony.example}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map((colorEntry, ci) => (
          <div key={ci} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: colorEntry.threads.length ? 12 : 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                background: colorEntry.hex,
                border: "2px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{colorEntry.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>
                  {colorEntry.hex.toUpperCase()}
                </div>
              </div>
              {colorEntry.threads.length === 0 && (
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
                  {source === "stash" ? "No threads in your stash yet" : "No threads loaded"}
                </span>
              )}
            </div>
            {colorEntry.threads.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {colorEntry.threads.map((thread, ti) => (
                  <div key={ti} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 8,
                    border: "1px solid var(--border-teal)",
                    background: "var(--warm-white)",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: thread.hex_color || "#ccc",
                      border: "2px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {thread.color_code} — {thread.color_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {thread.brand} · {thread.fiber_type}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => addToUserInventory && addToUserInventory(thread)}
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 12, cursor: "pointer",
                          background: "var(--teal)", color: "#fff", border: "none", fontWeight: 600,
                        }}
                      >+ Stash</button>
                      <button
                        onClick={() => addManualShoppingItem && addManualShoppingItem({ name: `${thread.brand} ${thread.color_code} ${thread.color_name}` })}
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 12, cursor: "pointer",
                          background: "var(--warm-white)", color: "var(--teal)",
                          border: "1.5px solid var(--border-teal)", fontWeight: 600,
                        }}
                      >+ List</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {colorEntry.fabrics && colorEntry.fabrics.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sun-amber)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Matching fabrics</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {colorEntry.fabrics.map((fabric, fi) => (
                    <div key={fi} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 8,
                      border: "1px solid var(--border-sun)",
                      background: "var(--sun-wash)",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                        background: fabric.hex_color || "#ccc",
                        border: "2px solid rgba(255,255,255,0.6)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {fabric.color_code ? `${fabric.color_code} — ` : ""}{fabric.color_name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {fabric.brand}{fabric.nearest_kona_name ? ` · ~${fabric.nearest_kona_name}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => addFabricToInventory && addFabricToInventory(fabric)}
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 12, cursor: "pointer",
                          background: "var(--sun-amber)", color: "#fff", border: "none", fontWeight: 600, flexShrink: 0,
                        }}
                      >+ Stash</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// User picks two brands. Pick or search a thread from Brand A.
// App finds the nearest match in Brand B instantly.
// ─────────────────────────────────────────────────────────────
function CrossRefTab({ supaAllThreads, threadBrands, brandKeyMap, addToUserInventory,
                       addProjectRequiredThread, addManualShoppingItem, hexToFamilyKey, settings }) {

  const [brandA, setBrandA]           = useState(threadBrands[0][0]);
  const [brandB, setBrandB]           = useState(threadBrands[1][0]);
  const [searchA, setSearchA]         = useState("");
  const [selectedThread, setSelectedThread] = useState(null);
  const [results, setResults]         = useState([]); // top 5 matches in brand B

  // Threads for brand A dropdown
  const brandAKey = brandKeyMap[brandA] || normalized(brandA).replace(/[^a-z0-9]/g,"_");
  const brandBKey = brandKeyMap[brandB] || normalized(brandB).replace(/[^a-z0-9]/g,"_");

  const brandAThreads = useMemo(()=>{
    if(!searchA.trim()) return [];
    const q = normalized(searchA);
    return supaAllThreads
      .filter(t => t.brand_key === brandAKey &&
        (normalized(t.color_name).includes(q) || normalized(t.color_code).includes(q)))
      .slice(0, 30);
  }, [supaAllThreads, brandAKey, searchA]);

  // When a thread is selected, find top 5 nearest in brand B
  // Tries precomputed thread_crossref table first; falls back to live computation
  useEffect(()=>{
    if(!selectedThread){ setResults([]); return; }

    async function findMatches(){
      // ── Try precomputed crossref table ──
      if(window._supabaseClient){
        try{
          const supaClient = window._supabaseClient;
          const{data,error} = await supaClient
            .from("thread_crossref")
            .select("ref_thread_id,distance,distance_pct,thread_library!ref_thread_id(id,brand,brand_key,color_code,color_name,hex_color,fiber_type,weight)")
            .eq("thread_id", selectedThread.id)
            .order("distance", {ascending:true})
            .limit(20); // fetch 20, then filter to target brand top 5

          if(!error && data && data.length > 0){
            const brandMatches = data
              .filter(r => r.thread_library?.brand_key === brandBKey && r.distance <= 20)
              .slice(0,5)
              .map(r => ({...r.thread_library, _distance: r.distance, _distance_pct: r.distance_pct}));

            if(brandMatches.length > 0){
              setResults(brandMatches);
              return;
            }
            setResults([{_noEquivalent: true}]);
            return;
          }
        }catch(e){
          // Crossref table not available yet — fall through to live computation
        }
      }

      // ── Live computation fallback ──
      const rgb = hexToRgb(selectedThread.hex_color);
      if(!rgb){ setResults([]); return; }
      const matches = supaAllThreads
        .filter(t => t.brand_key === brandBKey && t.hex_color)
        .map(t => ({ thread:t, dist:colorDistance(rgb, hexToRgb(t.hex_color)) }))
        .filter(m => m.dist <= 20)
        .sort((a,b) => a.dist - b.dist)
        .slice(0,5)
        .map(m => m.thread);
      if(matches.length === 0){ setResults([{_noEquivalent: true}]); return; }
      setResults(matches);
    }

    findMatches();
  }, [selectedThread, brandBKey, supaAllThreads]);

  // Swap brands
  function swapBrands() {
    const tmp = brandA;
    setBrandA(brandB);
    setBrandB(tmp);
    setSelectedThread(null);
    setSearchA("");
    setResults([]);
  }

  return (
    <div>
      {/* Brand selectors */}
      <div className="card">
        <h2>Thread Cross-Reference</h2>
        <p className="muted" style={{fontSize:13,marginBottom:14}}>
          Pick two brands. Search for a color in the first brand — we'll find the closest matches in the second.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"end",marginBottom:4}}>
          <label>From Brand
            <select className="input" style={{marginBottom:0}} value={brandA}
              onChange={e=>{setBrandA(e.target.value);setSelectedThread(null);setSearchA("");setResults([]);}}>
              {threadBrands.filter(([l])=>l!==brandB).map(([label])=>
                <option key={label}>{label}</option>
              )}
            </select>
          </label>

          <button onClick={swapBrands} className="btn"
            style={{padding:"9px 12px",fontSize:16,marginBottom:0,alignSelf:"end"}}>
            ⇄
          </button>

          <label>To Brand
            <select className="input" style={{marginBottom:0}} value={brandB}
              onChange={e=>{setBrandB(e.target.value);setSelectedThread(null);setResults([]);}}>
              {threadBrands.filter(([l])=>l!==brandA).map(([label])=>
                <option key={label}>{label}</option>
              )}
            </select>
          </label>
        </div>

        {supaAllThreads.filter(t=>t.brand_key===brandAKey).length===0 && (
          <p style={{fontSize:12,color:"var(--sun-amber)",marginTop:8}}>
            ⚠ No {brandA} colors loaded yet.
          </p>
        )}
        {supaAllThreads.filter(t=>t.brand_key===brandBKey).length===0 && (
          <p style={{fontSize:12,color:"var(--sun-amber)",marginTop:4}}>
            ⚠ No {brandB} colors loaded yet.
          </p>
        )}
      </div>

      {/* Search brand A */}
      <div className="card">
        <label>Search {brandA}
          <input className="input" value={searchA}
            onChange={e=>{setSearchA(e.target.value);setSelectedThread(null);setResults([]);}}
            placeholder={`color name or code…`}/>
        </label>

        {/* Brand A results — pick one */}
        {brandAThreads.length > 0 && !selectedThread && (
          <div>
            <div className="muted" style={{fontSize:12,marginBottom:8}}>{brandAThreads.length} results — tap to select:</div>
            {brandAThreads.map(thread=>(
              <div key={thread.id}
                onClick={()=>setSelectedThread(thread)}
                style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"10px 12px",marginBottom:6,
                  borderRadius:"var(--r-sm)",
                  border:"1.5px solid var(--border-teal)",
                  background:"var(--teal-pale)",
                  cursor:"pointer",
                  transition:"all 0.15s"
                }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--teal)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-teal)"}
              >
                {thread.hex_color && (
                  <div style={{
                    width:36,height:36,borderRadius:"50%",flexShrink:0,
                    background:thread.hex_color,
                    border:"2px solid rgba(255,255,255,0.6)",
                    boxShadow:"0 2px 6px rgba(0,0,0,0.18),inset 0 1px 3px rgba(255,255,255,0.3)"
                  }}/>
                )}
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{thread.color_code} — {thread.color_name}</div>
                  <div className="muted" style={{fontSize:11}}>{thread.brand} · {thread.fiber_type||""} {thread.weight||""}</div>
                </div>
                <span style={{fontSize:11,color:"var(--teal)",fontWeight:700}}>Select →</span>
              </div>
            ))}
          </div>
        )}
        {searchA.trim() && brandAThreads.length === 0 && (
          <p className="muted" style={{fontSize:12}}>No {brandA} colors found for "{searchA}".</p>
        )}
      </div>

      {/* Selected thread + matches */}
      {selectedThread && (
        <>
          {/* Selected source thread */}
          <div className="card" style={{borderColor:"var(--teal)",borderWidth:2}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--teal)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>
              Selected — {brandA}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {selectedThread.hex_color && (
                <div style={{
                  width:52,height:52,borderRadius:"50%",flexShrink:0,
                  background:selectedThread.hex_color,
                  border:"3px solid rgba(255,255,255,0.7)",
                  boxShadow:"0 3px 12px rgba(0,0,0,0.20),inset 0 2px 4px rgba(255,255,255,0.3)"
                }}/>
              )}
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:16}}>{selectedThread.color_code} — {selectedThread.color_name}</div>
                <div className="muted">{selectedThread.brand} · {selectedThread.fiber_type||""} {selectedThread.weight||""}</div>
                <div className="muted" style={{fontSize:11}}>Color family: {hexToFamilyKey(selectedThread)}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                <button className="btn active" style={{fontSize:11,padding:"5px 10px"}}
                  onClick={()=>addToUserInventory(selectedThread)}>+ Stash</button>
                <button className="btn" style={{fontSize:11,padding:"5px 10px"}}
                  onClick={()=>{setSelectedThread(null);setResults([]);}}>✕ Clear</button>
              </div>
            </div>
          </div>

          {/* Nearest matches in brand B */}
          <div className="card">
            <div style={{
              fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,
              color:"var(--teal)",marginBottom:12
            }}>
              Nearest {brandB} matches
            </div>

            {results.length === 0 && (
              <p className="muted">No {brandB} colors loaded — check that {brandB} data exists in the database.</p>
            )}
            {results.length === 1 && results[0]._noEquivalent && (
              <p className="muted">No equivalent found in {brandB}.</p>
            )}

            {results.filter(m => !m._noEquivalent).map((match, i) => {
              const isExact = i === 0;
              return (
                <div key={match.id} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"12px 14px",marginBottom:8,
                  borderRadius:"var(--r-sm)",
                  border:`1.5px solid ${isExact?"var(--teal)":"var(--border-teal)"}`,
                  background: isExact ? "var(--teal-pale)" : "var(--warm-white)",
                  boxShadow: isExact ? "var(--shadow-sm)" : "none"
                }}>
                  {/* Rank badge */}
                  <div style={{
                    width:22,height:22,borderRadius:"50%",flexShrink:0,
                    background: isExact ? "var(--teal)" : "var(--border-teal)",
                    color: isExact ? "var(--warm-white)" : "var(--muted)",
                    fontSize:11,fontWeight:800,
                    display:"flex",alignItems:"center",justifyContent:"center"
                  }}>{i+1}</div>

                  {/* Color swatch */}
                  {match.hex_color && (
                    <div style={{
                      width:44,height:44,borderRadius:"50%",flexShrink:0,
                      background:match.hex_color,
                      border:"2px solid rgba(255,255,255,0.6)",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.18),inset 0 1px 3px rgba(255,255,255,0.3)"
                    }}/>
                  )}

                  {/* Side-by-side comparison swatches */}
                  <div style={{flexShrink:0}}>
                    <div style={{fontSize:9,color:"var(--muted)",textAlign:"center",marginBottom:2}}>vs</div>
                    <div style={{display:"flex",gap:2}}>
                      <div style={{width:16,height:32,borderRadius:"4px 0 0 4px",background:selectedThread.hex_color||"#CCC"}}/>
                      <div style={{width:16,height:32,borderRadius:"0 4px 4px 0",background:match.hex_color||"#CCC"}}/>
                    </div>
                  </div>

                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13}}>
                      {isExact && <span style={{fontSize:10,background:"var(--teal)",color:"white",borderRadius:4,padding:"1px 5px",marginRight:5}}>Best</span>}
                      {match.color_code} — {match.color_name}
                    </div>
                    <div className="muted" style={{fontSize:11}}>{match.brand} · {match.fiber_type||""} {match.weight||""}</div>
                    <div className="muted" style={{fontSize:11}}>Family: {hexToFamilyKey(match)}</div>
                    {match._distance_pct!==undefined&&(
                      <div style={{fontSize:10,color:"var(--teal)",fontWeight:700,marginTop:2}}>
                        {match._distance_pct < 2 ? "🎯 Near-identical" :
                         match._distance_pct < 8 ? "✓ Very close" :
                         match._distance_pct < 15 ? "≈ Close" : "~ Similar"}
                        {" "}({match._distance_pct.toFixed(1)}% difference)
                      </div>
                    )}
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                    <button className="btn active" style={{fontSize:11,padding:"5px 10px"}}
                      onClick={()=>addToUserInventory(match)}>+ Stash</button>
                    <button className="btn" style={{fontSize:11,padding:"5px 10px"}}
                      onClick={()=>addProjectRequiredThread(match)}>Project</button>
                    <button className="btn" style={{fontSize:11,padding:"5px 10px"}}
                      onClick={()=>addManualShoppingItem(match)}>+ List</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!selectedThread && !searchA && (
        <div className="card" style={{textAlign:"center",padding:"28px 20px"}}>
          <div style={{fontSize:32,marginBottom:10}}>⇄</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"var(--teal)",marginBottom:6}}>
            Cross-Reference Any Two Brands
          </div>
          <p className="muted" style={{fontSize:13}}>
            Select a "From" brand and "To" brand above, then search for a color.
            We'll find the top 5 closest color matches in the second brand.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// USER PROFILE PAGE
// ─────────────────────────────────────────────────────────────
function ProfilePage({ supabase, user, onBack }) {
  const [profile, setProfile]     = useState(null);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage]     = useState("");
  const [form, setForm]           = useState({
    display_name:"", hometown:"", state_province:"",
    country:"United States", email_public:false, bio:"", avatar_color:"#0D5252"
  });
  const fileRef = React.useRef(null);

  // Avatar color options matching brand palette
  const avatarColors = [
    "#0D5252","#1A4D9B","#2D5A1B","#E8A800","#C97B00",
    "#6B3FA0","#C0392B","#1A7070","#2563C0","#3D7226"
  ];

  const countries = [
    "United States","Canada","United Kingdom","Australia","New Zealand",
    "Germany","France","Netherlands","Japan","South Korea","Brazil",
    "Mexico","Sweden","Norway","Denmark","Finland","Ireland","Other"
  ];

  useEffect(()=>{
    if(!supabase||!user) return;
    loadProfile();
  },[supabase,user]);

  async function loadProfile(){
    const{data}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();
    if(data){
      setProfile(data);
      setForm({
        display_name: data.display_name||"",
        hometown:     data.hometown||"",
        state_province:data.state_province||"",
        country:      data.country||"United States",
        email_public: data.email_public||false,
        bio:          data.bio||"",
        avatar_color: data.avatar_color||"#0D5252"
      });
    }
  }

  async function saveProfile(){
    if(!supabase||!user) return;
    setSaving(true);
    const{error}=await supabase.from("profiles").upsert({
      id: user.id,
      ...form,
      updated_at: new Date().toISOString()
    });
    if(error) setMessage("Error saving: "+error.message);
    else{ setMessage("Profile saved!"); setEditing(false); loadProfile(); }
    setSaving(false);
  }

  async function uploadAvatar(e){
    const file = e.target.files?.[0];
    if(!file||!supabase||!user) return;
    if(file.size > 2*1024*1024){ setMessage("Image must be under 2MB"); return; }
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const{error:upErr}=await supabase.storage.from("avatars").upload(path, file, {upsert:true});
    if(upErr){ setMessage("Upload error: "+upErr.message); setUploading(false); return; }
    const{data:{publicUrl}}=supabase.storage.from("avatars").getPublicUrl(path);
    const{error:profErr}=await supabase.from("profiles").upsert({id:user.id,avatar_url:publicUrl,updated_at:new Date().toISOString()});
    if(profErr) setMessage("Error saving avatar: "+profErr.message);
    else{ setMessage("Avatar updated!"); loadProfile(); }
    setUploading(false);
  }

  // Generate initials avatar
  const initials = (profile?.display_name||user?.email||"?").slice(0,2).toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const avatarBg  = profile?.avatar_color||"#0D5252";

  return(
    <div>
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <button className="btn" style={{fontSize:12,padding:"5px 10px"}} onClick={onBack}>← Back</button>
          <h2 style={{margin:0,flex:1}}>My Profile</h2>
          {!editing&&<button className="btn active" style={{fontSize:12,padding:"5px 10px"}} onClick={()=>setEditing(true)}>✎ Edit</button>}
        </div>

        {message&&<div style={{padding:"8px 12px",marginBottom:12,borderRadius:"var(--r-sm)",
          background:"var(--leaf-light)",border:"1px solid var(--leaf)",color:"var(--leaf)",fontSize:13}}>
          {message}
        </div>}

        {/* Avatar */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{position:"relative"}}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar"
                  style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",
                    border:"3px solid var(--gold)",boxShadow:"var(--shadow-md)"}}/>
              : <div style={{width:80,height:80,borderRadius:"50%",
                  background:avatarBg,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:28,fontWeight:800,color:"white",fontFamily:"Playfair Display,serif",
                  border:"3px solid var(--gold)",boxShadow:"var(--shadow-md)"}}>
                  {initials}
                </div>
            }
            {editing&&(
              <button onClick={()=>fileRef.current?.click()}
                style={{position:"absolute",bottom:-4,right:-4,
                  width:26,height:26,borderRadius:"50%",border:"2px solid white",
                  background:"var(--teal)",color:"white",fontSize:13,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {uploading?"…":"📷"}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*"
              style={{display:"none"}} onChange={uploadAvatar}/>
          </div>
          <div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"var(--teal)"}}>
              {profile?.display_name||user?.email}
            </div>
            <div className="muted" style={{fontSize:12}}>
              {[profile?.hometown,profile?.state_province,profile?.country].filter(Boolean).join(", ")||"Location not set"}
            </div>
            {(() => {
              const raw=(profile?.plan||"").toString().trim().toLowerCase();
              let badge=["free","basic","premium"].includes(raw)?raw:"free";
              if(profile?.is_admin||profile?.is_premium) badge="premium";
              return (
              <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:6,
                background: badge==="premium" ? "var(--sun-pale)" : badge==="basic" ? "var(--teal-pale)" : "var(--linen)",
                color:"var(--teal)",border:"1px solid var(--border-teal)"}}>
                {badge==="premium" ? "✦ Premium" : badge==="basic" ? "★ Basic" : "◇ Free"}
              </span>
              );
            })()}
          </div>
        </div>

        {/* View mode */}
        {!editing&&profile&&(
          <div className="list-box">
            {profile.bio&&<div style={{marginBottom:8,fontStyle:"italic",color:"var(--ink-soft)"}}>{profile.bio}</div>}
            <div><b>Email:</b> {profile.email_public ? user.email : "Private"}</div>
            <div><b>Member since:</b> {new Date(profile.created_at||Date.now()).toLocaleDateString()}</div>
          </div>
        )}

        {/* Edit mode */}
        {editing&&(
          <div>
            <label style={{fontSize:12}}>Display Name
              <input className="input" value={form.display_name}
                onChange={e=>setForm({...form,display_name:e.target.value})}
                placeholder="How you appear to others"/>
            </label>
            <label style={{fontSize:12}}>Bio
              <input className="input" value={form.bio}
                onChange={e=>setForm({...form,bio:e.target.value})}
                placeholder="Tell the community about yourself…"/>
            </label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <label style={{fontSize:12}}>Hometown
                <input className="input" value={form.hometown}
                  onChange={e=>setForm({...form,hometown:e.target.value})}
                  placeholder="City"/>
              </label>
              <label style={{fontSize:12}}>State / Province
                <input className="input" value={form.state_province}
                  onChange={e=>setForm({...form,state_province:e.target.value})}
                  placeholder="State or Province"/>
              </label>
            </div>
            <label style={{fontSize:12}}>Country
              <select className="input" value={form.country}
                onChange={e=>setForm({...form,country:e.target.value})}>
                {countries.map(c=><option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={form.email_public}
                onChange={e=>setForm({...form,email_public:e.target.checked})}/>
              Make my email visible to other members
            </label>

            {/* Avatar color picker — shown when no photo uploaded */}
            {!avatarUrl&&(
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,display:"block",marginBottom:6}}>Avatar Color</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {avatarColors.map(color=>(
                    <div key={color}
                      onClick={()=>setForm({...form,avatar_color:color})}
                      style={{
                        width:32,height:32,borderRadius:"50%",background:color,
                        cursor:"pointer",
                        border:form.avatar_color===color?"3px solid var(--gold)":"3px solid transparent",
                        boxShadow:form.avatar_color===color?"var(--shadow-md)":"none",
                        transition:"all 0.15s"
                      }}/>
                  ))}
                </div>
                <p className="muted" style={{fontSize:11,marginTop:4}}>
                  Or tap the camera icon above to upload a photo.
                </p>
              </div>
            )}

            <div className="button-row">
              <button className="btn active" onClick={saveProfile} disabled={saving} style={{flex:1}}>
                {saving?"Saving…":"Save Profile"}
              </button>
              <button className="btn" onClick={()=>{setEditing(false);setMessage("");}}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BARCODE SCANNER
// ─────────────────────────────────────────────────────────────
function BarcodeScanner({ supabase, userId, onAddToStash, onColorMatch }) {
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const [adding,setAdding]=useState(false);
  const videoRef=useRef(null);const streamRef=useRef(null);const rafRef=useRef(null);const detRef=useRef(null);
  async function startScan(){
    setError(null);setResult(null);
    if(!("BarcodeDetector" in window)){setError("Barcode scanning requires Chrome on Android or desktop Chrome.");return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      detRef.current=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","code_39","itf","qr_code"]});
      setScanning(true);loop();
    }catch{setError("Camera access denied — check browser permissions.");}
  }
  function loop(){
    if(!videoRef.current||!detRef.current)return;
    rafRef.current=requestAnimationFrame(async()=>{
      try{ const barcodes=await detRef.current.detect(videoRef.current); if(barcodes.length>0){stopScan();await handleBarcode(barcodes[0].rawValue);}else{loop();} }catch{loop();}
    });
  }
  function stopScan(){ if(rafRef.current)cancelAnimationFrame(rafRef.current); if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;} setScanning(false); }
  async function handleBarcode(barcode){
    if(!supabase){setResult({barcode,found:false});return;}
    try{
      const{data}=await supabase.from("thread_barcodes").select("*,thread_library(id,brand,brand_key,color_code,color_name,hex_color,fiber_type,weight,nearest_isacord)").eq("barcode",barcode).maybeSingle();
      if(data?.thread_library){setResult({barcode,thread:data.thread_library,confirmed:data.confirmed_count,found:true});await supabase.rpc("increment_barcode_confirmation",{p_barcode:barcode});}
      else{setResult({barcode,found:false});}
    }catch{setResult({barcode,found:false});}
  }
  async function addToStash(){
    if(!result?.thread||!userId||!supabase)return;
    setAdding(true);
    try{
      const{data:lib}=await supabase.from("thread_library").select("id").eq("color_code",result.thread.color_code).maybeSingle();
      if(lib){await supabase.from("user_inventory").upsert({user_id:userId,thread_id:lib.id,spool_count:1},{onConflict:"user_id,thread_id"});}
      onAddToStash&&onAddToStash(result.thread);setResult(null);
    }catch(e){console.error(e);}
    setAdding(false);
  }
  useEffect(()=>()=>stopScan(),[]);
  return(
    <div>
      {!scanning&&!result&&<button className="btn active" style={{width:"100%",marginBottom:8}} onClick={startScan}>📷 Scan Thread Barcode</button>}
      {error&&<div className="message" style={{borderColor:"#C0392B",color:"#C0392B",background:"#FDECEA"}}>{error}</div>}
      {scanning&&(
        <div style={{position:"relative",marginBottom:8}}>
          <video ref={videoRef} style={{width:"100%",borderRadius:10}} playsInline muted/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:"70%",height:"30%",border:"2.5px solid #F5C400",borderRadius:10,boxShadow:"0 0 0 9999px rgba(0,0,0,0.45)"}}/>
          </div>
          <button className="btn" style={{position:"absolute",top:8,right:8}} onClick={stopScan}>✕ Cancel</button>
        </div>
      )}
      {result?.found&&result.thread&&(
        <div className="card" style={{borderColor:"#1A5C1A"}}>
          <div className="thread-row">
            {result.thread.hex_color&&<div className="swatch" style={{background:result.thread.hex_color}}/>}
            <div>
              <div style={{fontSize:11,color:"#1A5C1A",fontWeight:700}}>✓ Thread identified!</div>
              <div className="thread-name">{result.thread.brand} {result.thread.color_code} — {result.thread.color_name}</div>
              <div className="muted">{result.thread.fiber_type} · {result.thread.weight} · {result.confirmed} confirmed</div>
            </div>
          </div>
          <div className="button-row">
            <button className="btn active" onClick={addToStash} disabled={adding}>{adding?"Adding…":"+ Add to Stash"}</button>
            <button className="btn" onClick={()=>setResult(null)}>Dismiss</button>
          </div>
        </div>
      )}
      {result&&!result.found&&(
        <div className="card">
          <div className="thread-name">Barcode not in database yet</div>
          <div className="muted" style={{marginBottom:8}}>Barcode: {result.barcode}</div>
          <p style={{marginBottom:10}}>Use Camera Match to identify this thread — barcode gets saved for everyone!</p>
          <div className="button-row">
            <button className="btn active" onClick={()=>onColorMatch&&onColorMatch(result.barcode)}>📷 Color Match</button>
            <button className="btn" onClick={()=>setResult(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH SCREEN — Sign in / Sign up / Guest mode
// ─────────────────────────────────────────────────────────────
function AuthScreen({ supabase, onGuest, onSignIn }) {
  const [mode, setMode]         = useState("signin"); // signin | signup | reset
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [username, setUsername]   = useState("");
  const [country, setCountry]     = useState("");
  const [usState, setUsState]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState("");
  const [error, setError]       = useState("");

  async function handleSignIn(e){
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){ setError(error.message); setLoading(false); return; }
    if(data?.user && onSignIn) onSignIn(data.user);
    setLoading(false);
  }

  async function handleSignUp(e){
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const pw = password;
    const checks = {
      length: pw.length >= 8,
      upper:  /[A-Z]/.test(pw),
      lower:  /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[^A-Za-z0-9]/.test(pw),
    };
    if(!Object.values(checks).every(Boolean)){
      setError("Password must meet all requirements below.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: `${firstName} ${lastName}`.trim(), first_name: firstName, last_name: lastName, username, country, state_province: usState } }
    });
    if(error) setError(error.message);
    else setMessage("Check your email for a confirmation link!");
    setLoading(false);
  }

  async function handleReset(e){
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if(error) setError(error.message);
    else setMessage("Password reset email sent!");
    setLoading(false);
  }

  return(
    <div style={{
      minHeight:"100vh",
      background:"#EAE4CE",
      backgroundImage:`
        radial-gradient(ellipse 120% 60% at 50% 0%, rgba(37,99,192,0.12) 0%, transparent 55%),
        radial-gradient(ellipse 80% 50% at 15% 100%, rgba(232,168,0,0.18) 0%, transparent 50%)
      `,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"20px", fontFamily:"Nunito, sans-serif"
    }}>
      {/* Logo + title */}
      <div style={{textAlign:"center", marginBottom:28}}>
        <img src="/HH_Logo.png" alt="Haberdash Haven"
          style={{width:100, height:100, borderRadius:"50%",
            border:"3px solid #E8A800",
            boxShadow:"0 0 0 6px rgba(232,168,0,0.15), 0 8px 32px rgba(0,0,0,0.25)",
            marginBottom:14}}/>
        <div style={{fontFamily:"Playfair Display, serif", fontSize:"1.8rem",
          fontWeight:800, color:"#0A1F40", marginBottom:4}}>
          Haberdash Haven
        </div>
        <div style={{fontFamily:"Caveat, cursive", fontSize:"1rem",
          color:"#C97B00", letterSpacing:"0.3px"}}>
          Making the world a better place. One stitch at a time...
        </div>
      </div>

      {/* Auth card */}
      <div style={{
        background:"white", borderRadius:20, padding:"28px 28px",
        width:"100%", maxWidth:400,
        boxShadow:"0 8px 40px rgba(13,82,82,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        border:"1.5px solid #B8D8D8"
      }}>
        {/* Mode tabs */}
        <div style={{display:"flex", gap:0, marginBottom:22,
          background:"#EEF8F8", borderRadius:12, padding:4}}>
          {[["signin","Sign In"],["signup","Create Account"]].map(([m,label])=>(
            <button key={m} onClick={()=>{setMode(m);setError("");setMessage("");}}
              style={{
                flex:1, padding:"8px 0", border:"none", borderRadius:9,
                fontFamily:"Nunito, sans-serif", fontSize:13, fontWeight:700,
                cursor:"pointer", transition:"all 0.15s",
                background: mode===m ? "#0D5252" : "transparent",
                color: mode===m ? "white" : "#5C6E6E",
                boxShadow: mode===m ? "0 2px 8px rgba(13,82,82,0.25)" : "none"
              }}>{label}</button>
          ))}
        </div>

        {/* Sign In form */}
        {mode==="signin"&&(
          <form onSubmit={handleSignIn}>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Email
            </label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{width:"100%",padding:"10px 14px",marginBottom:12,borderRadius:9,
                border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Password
            </label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              style={{width:"100%",padding:"10px 14px",marginBottom:6,borderRadius:9,
                border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
            <div style={{textAlign:"right",marginBottom:16}}>
              <button type="button" onClick={()=>setMode("reset")}
                style={{background:"none",border:"none",color:"#1A7070",
                  fontSize:12,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontWeight:600}}>
                Forgot password?
              </button>
            </div>
            {error&&<div style={{background:"#FDECEA",border:"1px solid #C0392B",borderRadius:8,
              padding:"8px 12px",color:"#C0392B",fontSize:13,marginBottom:12}}>{error}</div>}
            {message&&<div style={{background:"#E4F0D6",border:"1px solid #3D7226",borderRadius:8,
              padding:"8px 12px",color:"#2D5A1B",fontSize:13,marginBottom:12}}>{message}</div>}
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
                background:"linear-gradient(145deg, #1A7070 0%, #0D5252 100%)",
                color:"white",fontFamily:"Nunito,sans-serif",fontSize:15,fontWeight:800,
                cursor:loading?"not-allowed":"pointer",
                boxShadow:"0 4px 16px rgba(13,82,82,0.30)",marginBottom:10}}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {/* Sign Up form */}
        {mode==="signup"&&(
          <form onSubmit={handleSignUp}>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
                  First Name
                </label>
                <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)}
                  placeholder="First name"
                  style={{width:"100%",padding:"10px 14px",borderRadius:9,
                    border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                    background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{flex:1}}>
                <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
                  Last Name
                </label>
                <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)}
                  placeholder="Last name"
                  style={{width:"100%",padding:"10px 14px",borderRadius:9,
                    border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                    background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Username
            </label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="Choose a username"
              style={{...{width:"100%",padding:"10px 14px",borderRadius:9,border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",background:"#EEF8F8",outline:"none",boxSizing:"border-box"},marginBottom:12}}/>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Country
            </label>
            <select value={country} onChange={e=>{setCountry(e.target.value);setUsState("");}}
              style={{...{width:"100%",padding:"10px 14px",borderRadius:9,border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",background:"#EEF8F8",outline:"none",boxSizing:"border-box"},marginBottom:12}}>
              <option value="">— select country —</option>
                <option key="United States" value="United States">United States</option>
                <option key="Australia" value="Australia">Australia</option>
                <option key="Canada" value="Canada">Canada</option>
                <option key="France" value="France">France</option>
                <option key="Germany" value="Germany">Germany</option>
                <option key="Ireland" value="Ireland">Ireland</option>
                <option key="Italy" value="Italy">Italy</option>
                <option key="Japan" value="Japan">Japan</option>
                <option key="Mexico" value="Mexico">Mexico</option>
                <option key="Netherlands" value="Netherlands">Netherlands</option>
                <option key="New Zealand" value="New Zealand">New Zealand</option>
                <option key="Norway" value="Norway">Norway</option>
                <option key="South Africa" value="South Africa">South Africa</option>
                <option key="Spain" value="Spain">Spain</option>
                <option key="Sweden" value="Sweden">Sweden</option>
                <option key="Switzerland" value="Switzerland">Switzerland</option>
                <option key="United Kingdom" value="United Kingdom">United Kingdom</option>
                <option key="Other" value="Other">Other</option>
            </select>
            {country==="United States"&&(
              <>
                <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
                  State
                </label>
                <select value={usState} onChange={e=>setUsState(e.target.value)}
                  style={{...{width:"100%",padding:"10px 14px",borderRadius:9,border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",background:"#EEF8F8",outline:"none",boxSizing:"border-box"},marginBottom:12}}>
                  <option value="">— select state —</option>
                  <option key="Alabama" value="Alabama">Alabama</option>
                  <option key="Alaska" value="Alaska">Alaska</option>
                  <option key="Arizona" value="Arizona">Arizona</option>
                  <option key="Arkansas" value="Arkansas">Arkansas</option>
                  <option key="California" value="California">California</option>
                  <option key="Colorado" value="Colorado">Colorado</option>
                  <option key="Connecticut" value="Connecticut">Connecticut</option>
                  <option key="Delaware" value="Delaware">Delaware</option>
                  <option key="Florida" value="Florida">Florida</option>
                  <option key="Georgia" value="Georgia">Georgia</option>
                  <option key="Hawaii" value="Hawaii">Hawaii</option>
                  <option key="Idaho" value="Idaho">Idaho</option>
                  <option key="Illinois" value="Illinois">Illinois</option>
                  <option key="Indiana" value="Indiana">Indiana</option>
                  <option key="Iowa" value="Iowa">Iowa</option>
                  <option key="Kansas" value="Kansas">Kansas</option>
                  <option key="Kentucky" value="Kentucky">Kentucky</option>
                  <option key="Louisiana" value="Louisiana">Louisiana</option>
                  <option key="Maine" value="Maine">Maine</option>
                  <option key="Maryland" value="Maryland">Maryland</option>
                  <option key="Massachusetts" value="Massachusetts">Massachusetts</option>
                  <option key="Michigan" value="Michigan">Michigan</option>
                  <option key="Minnesota" value="Minnesota">Minnesota</option>
                  <option key="Mississippi" value="Mississippi">Mississippi</option>
                  <option key="Missouri" value="Missouri">Missouri</option>
                  <option key="Montana" value="Montana">Montana</option>
                  <option key="Nebraska" value="Nebraska">Nebraska</option>
                  <option key="Nevada" value="Nevada">Nevada</option>
                  <option key="New Hampshire" value="New Hampshire">New Hampshire</option>
                  <option key="New Jersey" value="New Jersey">New Jersey</option>
                  <option key="New Mexico" value="New Mexico">New Mexico</option>
                  <option key="New York" value="New York">New York</option>
                  <option key="North Carolina" value="North Carolina">North Carolina</option>
                  <option key="North Dakota" value="North Dakota">North Dakota</option>
                  <option key="Ohio" value="Ohio">Ohio</option>
                  <option key="Oklahoma" value="Oklahoma">Oklahoma</option>
                  <option key="Oregon" value="Oregon">Oregon</option>
                  <option key="Pennsylvania" value="Pennsylvania">Pennsylvania</option>
                  <option key="Rhode Island" value="Rhode Island">Rhode Island</option>
                  <option key="South Carolina" value="South Carolina">South Carolina</option>
                  <option key="South Dakota" value="South Dakota">South Dakota</option>
                  <option key="Tennessee" value="Tennessee">Tennessee</option>
                  <option key="Texas" value="Texas">Texas</option>
                  <option key="Utah" value="Utah">Utah</option>
                  <option key="Vermont" value="Vermont">Vermont</option>
                  <option key="Virginia" value="Virginia">Virginia</option>
                  <option key="Washington" value="Washington">Washington</option>
                  <option key="West Virginia" value="West Virginia">West Virginia</option>
                  <option key="Wisconsin" value="Wisconsin">Wisconsin</option>
                  <option key="Wyoming" value="Wyoming">Wyoming</option>
                  <option key="Washington D.C." value="Washington D.C.">Washington D.C.</option>
                </select>
              </>
            )}
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Email
            </label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{width:"100%",padding:"10px 14px",marginBottom:12,borderRadius:9,
                border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Password
            </label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={{width:"100%",padding:"10px 14px",marginBottom:8,borderRadius:9,
                border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
            {/* Live password requirements checklist */}
            {(() => {
              const pw = password;
              const reqs = [
                { ok: pw.length >= 8,         label: "At least 8 characters" },
                { ok: /[A-Z]/.test(pw),       label: "One uppercase letter" },
                { ok: /[a-z]/.test(pw),       label: "One lowercase letter" },
                { ok: /[0-9]/.test(pw),       label: "One number" },
                { ok: /[^A-Za-z0-9]/.test(pw),label: "One special character (!@#$ etc.)" },
              ];
              return (
                <ul style={{listStyle:"none",padding:0,margin:"0 0 14px 0",fontSize:12,fontFamily:"Nunito,sans-serif"}}>
                  {reqs.map((r,i)=>(
                    <li key={i} style={{color:r.ok?"#2D5A1B":"#888",marginBottom:2,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{display:"inline-block",width:14,textAlign:"center",fontWeight:800}}>
                        {r.ok?"✓":"○"}
                      </span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              );
            })()}
            {error&&<div style={{background:"#FDECEA",border:"1px solid #C0392B",borderRadius:8,
              padding:"8px 12px",color:"#C0392B",fontSize:13,marginBottom:12}}>{error}</div>}
            {message&&<div style={{background:"#E4F0D6",border:"1px solid #3D7226",borderRadius:8,
              padding:"8px 12px",color:"#2D5A1B",fontSize:13,marginBottom:12}}>{message}</div>}
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
                background:"linear-gradient(145deg, #1A7070 0%, #0D5252 100%)",
                color:"white",fontFamily:"Nunito,sans-serif",fontSize:15,fontWeight:800,
                cursor:loading?"not-allowed":"pointer",
                boxShadow:"0 4px 16px rgba(13,82,82,0.30)",marginBottom:10}}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        {/* Password reset */}
        {mode==="reset"&&(
          <form onSubmit={handleReset}>
            <p style={{fontSize:13,color:"#5C6E6E",marginBottom:14}}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:"#0D5252",marginBottom:2}}>
              Email
            </label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{width:"100%",padding:"10px 14px",marginBottom:16,borderRadius:9,
                border:"1.5px solid #B8D8D8",fontSize:14,fontFamily:"Nunito,sans-serif",
                background:"#EEF8F8",outline:"none",boxSizing:"border-box"}}/>
            {error&&<div style={{background:"#FDECEA",border:"1px solid #C0392B",borderRadius:8,
              padding:"8px 12px",color:"#C0392B",fontSize:13,marginBottom:12}}>{error}</div>}
            {message&&<div style={{background:"#E4F0D6",border:"1px solid #3D7226",borderRadius:8,
              padding:"8px 12px",color:"#2D5A1B",fontSize:13,marginBottom:12}}>{message}</div>}
            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
                background:"linear-gradient(145deg, #1A7070 0%, #0D5252 100%)",
                color:"white",fontFamily:"Nunito,sans-serif",fontSize:15,fontWeight:800,
                cursor:loading?"not-allowed":"pointer",
                boxShadow:"0 4px 16px rgba(13,82,82,0.30)",marginBottom:10}}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <button type="button" onClick={()=>setMode("signin")}
              style={{width:"100%",padding:"10px",borderRadius:12,
                border:"1.5px solid #B8D8D8",background:"white",
                color:"#5C6E6E",fontFamily:"Nunito,sans-serif",fontSize:13,
                fontWeight:700,cursor:"pointer"}}>
              Back to Sign In
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
          <div style={{flex:1,height:1,background:"#D4E8E8"}}/>
          <span style={{fontSize:12,color:"#9EB8B8",fontWeight:600}}>or</span>
          <div style={{flex:1,height:1,background:"#D4E8E8"}}/>
        </div>

        {/* Guest mode */}
        <button onClick={onGuest}
          style={{width:"100%",padding:"11px",borderRadius:12,
            border:"1.5px solid #B8D8D8",background:"white",
            color:"#0D5252",fontFamily:"Nunito,sans-serif",fontSize:13,
            fontWeight:700,cursor:"pointer",
            boxShadow:"0 2px 8px rgba(13,82,82,0.08)"}}>
          👀 Browse as Guest
        </button>
        <p style={{textAlign:"center",fontSize:11,color:"#9EB8B8",marginTop:8}}>
          Guest mode lets you search threads but won't save your stash.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App({ supabase, user, isGuest, onGuestMode, onSignIn }) {
  const userId = user?.id||null;
  // Expose supabase on window so child components (CrossRefTab) can use precomputed table
  if(supabase) window._supabaseClient = supabase;

  // ── User plan ─────────────────────────────────────────────
  const [userPlan, setUserPlan] = useState("free"); // "free" | "basic" | "premium"
  useEffect(()=>{
    if(!supabase||!userId) return;
    supabase.from("profiles").select("plan,is_premium,is_admin").eq("id",userId).maybeSingle()
      .then(({data,error})=>{
        if(error){ console.error("Plan fetch error:",error); return; }
        if(!data) return;
        // Derive tier: explicit plan column wins; fall back to booleans.
        const raw = (data.plan||"").toString().trim().toLowerCase();
        let tier = "free";
        if(["free","basic","premium"].includes(raw)) tier = raw;
        // Boolean fallback / override — admins and premium-flagged users get premium.
        if(data.is_admin || data.is_premium) tier = "premium";
        setUserPlan(tier);
      });
  },[supabase,userId]);

  // Plan helpers
  const isFree    = !isGuest && userPlan === "free";
  const isBasic   = !isGuest && userPlan === "basic";
  const isPremium = !isGuest && userPlan === "premium";
  const canAccess = (minPlan) => {
    if(isGuest || !user) return false;
    if(minPlan === "free")    return true;
    if(minPlan === "basic")   return isBasic || isPremium;
    if(minPlan === "premium") return isPremium;
    return false;
  };

  // Always start on Home tab
  useEffect(()=>{ setTab("home"); },[]);

  // ── State ─────────────────────────────────────────────────
  const [tab, setTab]                 = useState("home");
  const [showGame, setShowGame]       = useState(false);
  const [subTab, setSubTab]           = useState("thread"); // match sub-tabs
  const [moreSubTab, setMoreSubTab]   = useState("machines");
  const [threads, setThreads]         = useState(starterThreads);
  const [supaAllThreads, setSupaAllThreads] = useState([]); // unified thread_library — all brands
  const [supaFabrics, setSupaFabrics] = useState([]); // fabric_library — all solids
  const [fabricStash, setFabricStash] = useState([]); // user_fabric_inventory rows (with joined fabric)
  const fabricBrandList = useMemo(()=>[...new Set(supaFabrics.map(f=>f.brand).filter(Boolean))].sort(),[supaFabrics]);
  const [fabricBrandFilter, setFabricBrandFilter] = useState("All");
  const [form, setForm]               = useState(emptyForm);
  const [message, setMessage]         = useState("");
  const [settings, setSettings]       = useState(()=>{ const saved=localStorage.getItem("hh_settings"); const base={showBarcodes:true,showWeights:true,autoAddZeroInventoryToShoppingList:true,defaultMatchMode:"thread",defaultBrand:"Isacord",crossRefBrand:"",showValuesInReports:false,defaultInventoryTarget:0,quickActions:DEFAULT_QUICK_ACTIONS}; return saved?{...base,...JSON.parse(saved)}:base; });
  const [syncMeta, setSyncMeta]       = useState({ appVersion:APP_VERSION,libraryVersion:"1.0.0",remoteLibraryVersion:"1.0.0",status:"Ready",lastSynced:"Never",hasUpdate:false });
  const [lang, setLang]               = useState(()=>localStorage.getItem("hh_lang")||"en-US");
  useEffect(()=>{localStorage.setItem("hh_lang",lang);},[lang]);
  useEffect(()=>{localStorage.setItem("hh_settings",JSON.stringify(settings));},[settings]);
  // Apply default brand from settings on mount
  useEffect(()=>{ if(settings.defaultBrand) setMatchBrand(settings.defaultBrand); },[]);

  // Match state
  const [matchBrand, setMatchBrand]           = useState("Isacord");
  const [matchQuery, setMatchQuery]           = useState("");
  const [colorFamilyKey, setColorFamilyKey]   = useState("All"); // ALWAYS an English key
  const [cameraImage, setCameraImage]         = useState(null);
  const [cameraSample, setCameraSample]       = useState(null);
  const [pendingBarcode, setPendingBarcode]   = useState(null);
  const [showAddThread, setShowAddThread]     = useState(false);
  const [editQuickActions, setEditQuickActions] = useState(false);
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual" — drives upgrade UI pricing display

  // Shopping / projects
  const [shoppingList, setShoppingList]                   = useState([]);
  const [projects, setProjects]                           = useState([{id:"proj-1",name:"Autumn Leaves Quilt",status:"Planning",notes:"",requiredThreads:[]}]);
  const [selectedProjectId, setSelectedProjectId]         = useState("proj-1");
  const [showNewProject, setShowNewProject]               = useState(false);
  const [newProjectForm, setNewProjectForm]               = useState(emptyProject);
  const [projectEntryMode, setProjectEntryMode]           = useState("manual");
  const [projectThreadInput, setProjectThreadInput]       = useState("");
  const [projectScanInput, setProjectScanInput]           = useState("");

  // ── Load cache ────────────────────────────────────────────
  useEffect(()=>{
    try{
      const cached=localStorage.getItem(LOCAL_LIBRARY_KEY);
      const meta=localStorage.getItem(LOCAL_SYNC_META);
      if(cached){const p=JSON.parse(cached);if(Array.isArray(p))setThreads(p);}
      if(meta){const p=JSON.parse(meta);setSyncMeta(c=>({...c,...p}));}
    }catch(e){console.error(e);}
  },[]);

  // ── Load thread library (single unified table) ──────────────
  const [threadLoadStatus, setThreadLoadStatus] = useState("loading");
  useEffect(()=>{
    if(!supabase){ setThreadLoadStatus("no-db"); return; }
    async function loadThreads(){
      setThreadLoadStatus("loading");
      let allRows=[]; let from=0; const pageSize=1000;
      while(true){
        const{data,error}=await supabase
          .from("thread_library")
          .select("id,brand,brand_key,color_code,color_name,hex_color,fiber_type,weight,thread_type,nearest_isacord,barcode,family")
          .order("color_name")
          .range(from,from+pageSize-1);
        if(error){ console.error("thread_library load error:",error.message); setThreadLoadStatus("error"); break; }
        if(!data||data.length===0) break;
        allRows=[...allRows,...data];
        if(data.length<pageSize) break;
        from+=pageSize;
      }
      if(allRows.length>0){
        console.log(`✓ Loaded ${allRows.length} thread colors from thread_library`);
        setSupaAllThreads(allRows);
        setThreadLoadStatus("ok");
      } else {
        console.warn("thread_library returned 0 rows — check RLS policy");
        setThreadLoadStatus("empty");
      }
    }
    loadThreads();
  },[supabase]);

  // Load fabric_library (all solids)
  useEffect(()=>{
    if(!supabase) return;
    async function loadFabrics(){
      let from=0, pageSize=1000, allRows=[];
      while(true){
        const{data,error}=await supabase
          .from("fabric_library")
          .select("id,brand,manufacturer,color_code,color_name,hex_color,r,g,b,family,nearest_kona,nearest_kona_name")
          .order("color_name")
          .range(from,from+pageSize-1);
        if(error){ console.error("fabric_library load error:",error.message); break; }
        if(!data||data.length===0) break;
        allRows=[...allRows,...data];
        if(data.length<pageSize) break;
        from+=pageSize;
      }
      if(allRows.length>0){ console.log(`✓ Loaded ${allRows.length} fabrics`); setSupaFabrics(allRows); }
    }
    loadFabrics();
  },[supabase]);

  // Load fabric stash (user_fabric_inventory + joined fabric)
  const loadFabricStash=useCallback(async()=>{
    if(!supabase||!userId){ setFabricStash([]); return; }
    const{data,error}=await supabase
      .from("user_fabric_inventory")
      .select("id,notes,fabric_id,fabric_library(id,brand,color_code,color_name,hex_color,family,nearest_kona_name)")
      .eq("user_id",userId);
    if(error){ console.error("fabric stash load:",error.message); return; }
    setFabricStash(data||[]);
  },[supabase,userId]);
  useEffect(()=>{ loadFabricStash(); },[loadFabricStash]);

  // ── Derived ───────────────────────────────────────────────
  const displayThreads = supaAllThreads.length>0 ? supaAllThreads : threads;
  const lowStockCount  = useMemo(()=>threads.filter(t=>t.spools<=Math.max(1,(t.inventoryTarget||0)-1)).length,[threads]);
  const belowTargetCount = useMemo(()=>threads.filter(t=>(t.spools||0)<(t.inventoryTarget||0)).length,[threads]);

  const autoShoppingItems = useMemo(()=>{
    if(!settings.autoAddZeroInventoryToShoppingList)return[];
    return threads.filter(t=>(t.spools||0)===0).map(thread=>({
      id:`auto-${thread.id}`,threadId:thread.id,name:thread.name,
      primary:thread.brands?.primary||thread.brands?.isacord||"—",
      isacord:thread.isacord,barcode:thread.barcode,spoolSize:thread.spoolSize,
      inventoryTarget:thread.inventoryTarget,qty:1,source:"auto"
    }));
  },[threads,settings.autoAddZeroInventoryToShoppingList]);

  const mergedShoppingList = useMemo(()=>{
    const map=new Map();
    [...autoShoppingItems,...shoppingList].forEach(item=>{
      const key=`${item.threadId}-${item.spoolSize}`;
      if(!map.has(key))map.set(key,{...item});
      else{const e=map.get(key);map.set(key,{...e,qty:e.qty+item.qty,source:e.source===item.source?e.source:"mixed"});}
    });
    return Array.from(map.values());
  },[autoShoppingItems,shoppingList]);

  // ── Notifications ─────────────────────────────────────────
  // Notifications are now generated SERVER-SIDE (the generate-notifications
  // Edge Function, on a cron) and stored in the `notifications` table. The app
  // just READS them and marks them read — so read-state syncs across devices and
  // the feed reflects activity that happened while the app was closed. This is
  // the row a push payload will point at once the Capacitor wrap lands.
  const [rawNotifs, setRawNotifs] = useState([]); // rows from `notifications`
  const [dismissedIds, setDismissedIds] = useState([]); // session-only local hide
  const [showNotifs, setShowNotifs] = useState(false);

  const loadNotifications = useCallback(async()=>{
    if(!supabase||!userId||isGuest){ setRawNotifs([]); return; }
    const{data,error}=await supabase
      .from("notifications")
      .select("id,type,title,body,icon,dest_tab,dest_sub,is_read,created_at")
      .eq("user_id",userId)
      .order("created_at",{ascending:false})
      .limit(50);
    // If the table isn't there yet (migration not run), fail quietly.
    if(error){ if(error.code!=="42P01") console.error("notifications load:",error.message); setRawNotifs([]); return; }
    setRawNotifs(data||[]);
  },[supabase,userId,isGuest]);

  useEffect(()=>{ loadNotifications(); },[loadNotifications, tab]);

  // Visible = not locally hidden this session; unread = not read on the server.
  const visibleNotifs = useMemo(()=>rawNotifs.filter(n=>!dismissedIds.includes(n.id)),[rawNotifs,dismissedIds]);
  const unreadCount = useMemo(()=>visibleNotifs.filter(n=>!n.is_read).length,[visibleNotifs]);

  // Mark all visible as read on the server (and optimistically in state).
  const markAllRead = useCallback(async()=>{
    const unread=visibleNotifs.filter(n=>!n.is_read).map(n=>n.id);
    if(!unread.length||!supabase) return;
    setRawNotifs(prev=>prev.map(n=>unread.includes(n.id)?{...n,is_read:true}:n));
    const{error}=await supabase.from("notifications")
      .update({is_read:true,read_at:new Date().toISOString()})
      .in("id",unread);
    if(error) console.error("mark read:",error.message);
  },[visibleNotifs,supabase]);

  // Dismiss = hide locally for this session. (Users can't delete server rows;
  // the generator removes them once the underlying condition resolves.)
  const dismissNotif = id=>setDismissedIds(prev=>[...new Set([...prev,id])]);

  const selectedProject = useMemo(()=>projects.find(p=>p.id===selectedProjectId)||projects[0],[projects,selectedProjectId]);

  // ── Thread match filter ──────────────────────────────────
  // Uses thread_library_all for all brands (consistent behavior across every brand)
  // Results always sorted alphabetically by color_name
  const filteredMatchResults = useMemo(()=>{
    const q = normalized(matchQuery).trim();
    const hasFilter = colorFamilyKey !== "All";
    const hasQuery  = q.length > 0;

    // Require at least a color family OR a search query
    // (fabric: a brand filter alone also qualifies)
    if(!hasFilter && !hasQuery && !(subTab==="fabric" && fabricBrandFilter!=="All")) return [];

    // Fabric search — queries real fabric_library (parity with thread search)
    if(subTab==="fabric"){
      let res=[...supaFabrics];
      if(fabricBrandFilter!=="All") res=res.filter(f=>f.brand===fabricBrandFilter);
      if(hasFilter) res=res.filter(f=>hexToFamilyKey(f)===colorFamilyKey);
      if(hasQuery) res=res.filter(f=>
        normalized(f.color_name).includes(q)||normalized(f.color_code).includes(q)||
        normalized(f.brand).includes(q)||normalized(f.family).includes(q)||
        normalized(f.nearest_kona_name).includes(q)
      );
      return res.sort(byColor).slice(0,120);
    }

    // Thread search — use thread_library_all if available, else local fallback
    if(supaAllThreads.length > 0){
      // Get the brand_key for the selected brand
      const bk = brandKeyMap[matchBrand] || normalized(matchBrand).replace(/[^a-z0-9]/g,"_");

      // Build Isacord hex map for nearest_isacord fallback
      // thread_library columns: isacord (code), hex or swatch (color)
      // Build hex map from Isacord entries in thread_library_all
      const isacordHexMap = {};
      supaAllThreads.forEach(t => {
        if(t.brand_key === "isacord" && t.color_code && t.hex_color)
          isacordHexMap[t.color_code] = t.hex_color;
      });

      let results = supaAllThreads.filter(thread=>{
        // Filter by brand
        if(thread.brand_key !== bk) return false;

        // Filter by search query if present
        if(hasQuery){
          const matchesQuery = normalized(thread.color_name).includes(q) ||
                               normalized(thread.color_code).includes(q) ||
                               normalized(thread.brand).includes(q);
          if(!matchesQuery) return false;
        }

        // Filter by color family if selected
        if(hasFilter){
          // Use thread's own hex_color, or fall back to nearest_isacord hex
          const effectiveHex = thread.hex_color ||
            (thread.nearest_isacord ? isacordHexMap[thread.nearest_isacord] : null);
          const threadWithHex = {...thread, hex_color: effectiveHex};
          if(hexToFamilyKey(threadWithHex) !== colorFamilyKey) return false;
        }

        return true;
      });

      results.sort(byColor);
      // Guest restrictions: Isacord only, 10 results max
      if(!user || isGuest){
        results = results.filter(t=>t.brand_key==="isacord");
        return results.slice(0,10);
      }
      return results.slice(0,100);
    }

    // Local fallback (no Supabase) — use local thread-library.json
    const brandKey = threadBrands.find(([label])=>label===matchBrand)?.[1]||"isacord";
    let results = threads.filter(thread=>{
      if(hasQuery){
        const matchesQuery = [thread.name, thread.isacord, thread.barcode,
                              thread.brands?.[brandKey], thread.brands?.primary]
                             .some(v=>normalized(v).includes(q));
        if(!matchesQuery) return false;
      }
      if(hasFilter){
        if(hexToFamilyKey(thread) !== colorFamilyKey) return false;
      }
      return true;
    });
    results.sort((a,b)=>(a.name||"").localeCompare(b.name||""));
    return results.slice(0,100);
  },[supaAllThreads,supaFabrics,threads,matchQuery,subTab,matchBrand,colorFamilyKey,fabricBrandFilter,user,isGuest]);

  const cameraMatches = useMemo(()=>{
    if(!cameraSample)return[];
    const sampleRgb={r:cameraSample.r,g:cameraSample.g,b:cameraSample.b};
    return [...displayThreads]
      .map(thread=>({thread,dist:colorDistance(sampleRgb,hexToRgb(thread.hex_color||thread.hex||thread.swatch))}))
      .sort((a,b)=>a.dist-b.dist).slice(0,5).map(item=>item.thread);
  },[cameraSample,displayThreads]);

  // ── Persistence ───────────────────────────────────────────
  const persistLibrary=nextThreads=>{setThreads(nextThreads);localStorage.setItem(LOCAL_LIBRARY_KEY,JSON.stringify(nextThreads));};
  const persistSyncMeta=nextMeta=>{setSyncMeta(nextMeta);localStorage.setItem(LOCAL_SYNC_META,JSON.stringify(nextMeta));};

  // ── Thread actions ────────────────────────────────────────
  const addThread=()=>{
    if(!form.name.trim()){setMessage("Please enter a thread name.");return;}
    const spools=Math.max(0,Number(form.spools||0));
    const inventoryTarget=Math.max(0,Number(form.inventoryTarget||0));
    const newThread={
      id:Date.now(),name:form.name.trim(),family:form.family||"Unsorted",
      isacord:form.isacord.trim(),barcode:form.barcode.trim(),weight:form.weight.trim()||"40 wt",
      inventoryTarget,spools,spoolSize:form.spoolSize,owned:spools>0,
      lowStock:spools<=Math.max(1,inventoryTarget-1),swatch:form.swatch,hex:form.swatch,rgb:"",
      brands:{primary:form.isacord?`Isacord ${form.isacord}`:form.name.trim(),isacord:form.isacord?`Isacord ${form.isacord}`:"",glide:"",floriani:"",madeira:"",sulky:"",aurifil:"",omni:"",kingTut:"",soFine:"",gutermann:"",mettler:"",robisonAnton:"",coatsClark:""},
      fabrics:{kona:"",bella:"",agf:"",freespirit:"",michaelMiller:"",windham:"",clothworks:"",hoffman:""}
    };
    persistLibrary([newThread,...threads]);
    setForm(emptyForm);setMessage(`${newThread.name} added.`);setShowAddThread(false);
  };
  const updateSpools=(id,delta)=>{
    persistLibrary(threads.map(thread=>{
      if(thread.id!==id)return thread;
      const spools=Math.max(0,thread.spools+delta);
      return{...thread,spools,owned:spools>0,lowStock:spools<=Math.max(1,(thread.inventoryTarget||0)-1)};
    }));
  };
  const updateInventoryTarget=(id,value)=>{
    const target=Math.max(0,Number(value||0));
    persistLibrary(threads.map(thread=>{
      if(thread.id!==id)return thread;
      return{...thread,inventoryTarget:target,lowStock:(thread.spools||0)<=Math.max(1,target-1)};
    }));
  };
  const addManualShoppingItem=thread=>{
    const name  = thread.color_name||thread.name||"Thread";
    const brand = thread.brand||thread.brands?.primary||"";
    const code  = thread.color_code||thread.code||"";
    setShoppingList(c=>[...c,{
      id:`${thread.id||code}-${Date.now()}`,
      threadId:thread.id||code,
      name,brand,code,
      hex_color:thread.hex_color||thread.hex||thread.swatch||"",
      fiber_type:thread.fiber_type||"",
      weight:thread.weight||"",
      qty:1,source:"manual"
    }]);
    setMessage(`${brand} ${code} — ${name} added to shopping list!`);
  };
  const removeShoppingItem=id=>setShoppingList(c=>c.filter(item=>item.id!==id));
  const addProjectRequiredThread=thread=>{
    const name  = thread.color_name||thread.name||"Thread";
    const brand = thread.brand||thread.brands?.primary||"";
    const code  = thread.color_code||thread.code||"";
    const tid   = thread.id||code;
    setProjects(c=>c.map(project=>{
      if(project.id!==selectedProjectId)return project;
      if(project.requiredThreads.some(item=>item.threadId===tid))return project;
      return{...project,requiredThreads:[...project.requiredThreads,{
        id:`${project.id}-${tid}`,threadId:tid,
        name,brand,code,
        hex_color:thread.hex_color||thread.hex||thread.swatch||"",
        weight:thread.weight||"",
        fiber_type:thread.fiber_type||""
      }]};
    }));
    setMessage(`${brand} ${code} — ${name} added to "${projects.find(p=>p.id===selectedProjectId)?.name||"project"}"!`);
  };
  const PROJECT_LIMIT = isPremium ? Infinity : isBasic ? 5 : 1; // Free 1 · Basic 5 · Premium unlimited
  const createProject=()=>{
    if(!newProjectForm.name.trim()){setMessage("Please enter a project name.");return;}
    if(projects.length>=PROJECT_LIMIT){
      setMessage(isFree
        ? "⚠ Free plan includes 1 project. Upgrade to Basic for 5, or Premium for unlimited."
        : "⚠ Basic plan includes 5 projects. Upgrade to Premium for unlimited.");
      return;
    }
    const id=`proj-${Date.now()}`;
    setProjects(c=>[...c,{id,...newProjectForm,requiredThreads:[]}]);
    setSelectedProjectId(id);setNewProjectForm(emptyProject);setShowNewProject(false);
    setMessage(`Project "${newProjectForm.name}" created!`);
  };
  const removeProjectThread=threadId=>{setProjects(c=>c.map(p=>p.id===selectedProjectId?{...p,requiredThreads:p.requiredThreads.filter(i=>i.threadId!==threadId)}:p));};
  const addProjectThreadFromManual=()=>{
    const q=normalized(projectThreadInput).trim();if(!q)return;
    const found=threads.find(thread=>[thread.name,thread.isacord,thread.barcode,thread.brands?.primary].some(v=>normalized(v).includes(q)));
    if(!found)return setMessage("No thread found.");
    addProjectRequiredThread(found);setProjectThreadInput("");
  };
  const addProjectThreadFromScan=()=>{
    const q=normalized(projectScanInput).trim();if(!q)return;
    const found=threads.find(thread=>normalized(thread.barcode)===q||normalized(thread.isacord)===q);
    if(!found)return setMessage("No thread found for that scan.");
    addProjectRequiredThread(found);setProjectScanInput("");
  };
  const handleCameraImageUpload=event=>{
    const file=event.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{setCameraImage(reader.result);setCameraSample(null);};
    reader.readAsDataURL(file);
  };
  const handleImageSample=event=>{
    const img=event.currentTarget;const rect=img.getBoundingClientRect();
    const canvas=document.createElement("canvas");
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    ctx.drawImage(img,0,0);
    const x=Math.max(0,Math.min(rect.width-1,event.clientX-rect.left));
    const y=Math.max(0,Math.min(rect.height-1,event.clientY-rect.top));
    const px=Math.floor((x/rect.width)*img.naturalWidth);
    const py=Math.floor((y/rect.height)*img.naturalHeight);
    // Average a box around the tap to kill JPEG noise / stray pixels on prints & solids.
    // Box scales with image size (~3% of width), clamped 5–41px, odd.
    let box=Math.round(img.naturalWidth*0.03);
    box=Math.max(5,Math.min(41,box)); if(box%2===0)box++;
    const half=(box-1)/2;
    const sx=Math.max(0,px-half), sy=Math.max(0,py-half);
    const sw=Math.min(img.naturalWidth-sx,box), sh=Math.min(img.naturalHeight-sy,box);
    const region=ctx.getImageData(sx,sy,sw,sh).data;
    let rSum=0,gSum=0,bSum=0,n=0;
    for(let i=0;i<region.length;i+=4){
      if(region[i+3]<128)continue; // skip transparent
      rSum+=region[i];gSum+=region[i+1];bSum+=region[i+2];n++;
    }
    if(!n){const d=ctx.getImageData(px,py,1,1).data;rSum=d[0];gSum=d[1];bSum=d[2];n=1;}
    const r=Math.round(rSum/n),g=Math.round(gSum/n),b=Math.round(bSum/n);
    const hex=`#${[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase()}`;
    // marker stored as % of displayed image so it survives layout/resizes
    setCameraSample({hex,r,g,b,markerX:(x/rect.width)*100,markerY:(y/rect.height)*100});
  };
  const handleCameraMatchWithBarcode=useCallback(async thread=>{
    if(pendingBarcode&&supabase&&userId){
      try{
        await supabase.from("thread_barcodes").upsert({barcode:pendingBarcode,brand_key:"isacord",color_code:thread.color_code||thread.code||thread.name,first_scanned_by:userId,confirmed_count:1},{onConflict:"barcode"});
        setMessage("Barcode saved for the community!");
      }catch(e){console.error(e);}
      setPendingBarcode(null);
    }
  },[pendingBarcode,supabase,userId]);

  // ── FABRIC ACTIONS (parity with thread actions) ──
  const fabricLabel=f=>`${f.brand||"Fabric"} ${f.color_code||""} — ${f.color_name||""}`.trim();
  const addFabricToInventory=async fabric=>{
    if(!supabase||!userId||!fabric.id){ setMessage("Sign in to save fabrics to your stash."); return; }
    const{error}=await supabase.from("user_fabric_inventory")
      .upsert({user_id:userId,fabric_id:fabric.id},{onConflict:"user_id,fabric_id"});
    if(error){ console.error("fabric inventory:",error.message); setMessage("Could not add fabric."); return; }
    setMessage(`${fabricLabel(fabric)} added to your fabric stash!`);
    loadFabricStash();
  };
  const addProjectRequiredFabric=async fabric=>{
    if(!supabase||!userId||!fabric.id){ setMessage("Sign in to add fabrics to projects."); return; }
    const{error}=await supabase.from("project_fabrics").insert({
      user_id:userId, project_id:selectedProjectId, fabric_id:fabric.id,
      name:fabric.color_name, brand:fabric.brand, color_code:fabric.color_code, hex_color:fabric.hex_color
    });
    if(error){ console.error("project_fabrics:",error.message); setMessage("Could not add fabric to project."); return; }
    setMessage(`${fabricLabel(fabric)} added to "${projects.find(p=>p.id===selectedProjectId)?.name||"project"}"!`);
  };
  const addFabricToShopping=async fabric=>{
    if(!supabase||!userId||!fabric.id){ setMessage("Sign in to use the shopping list."); return; }
    const{error}=await supabase.from("fabric_shopping_list")
      .upsert({user_id:userId,fabric_id:fabric.id,name:fabric.color_name,brand:fabric.brand,color_code:fabric.color_code,hex_color:fabric.hex_color},{onConflict:"user_id,fabric_id"});
    if(error){ console.error("fabric_shopping_list:",error.message); setMessage("Could not add to shopping list."); return; }
    setMessage(`${fabricLabel(fabric)} added to your shopping list!`);
  };
  const removeFabricFromStash=async rowId=>{
    if(!supabase)return;
    const{error}=await supabase.from("user_fabric_inventory").delete().eq("id",rowId);
    if(error){ setMessage("Could not remove fabric."); return; }
    setFabricStash(prev=>prev.filter(r=>r.id!==rowId));
  };
  const updateFabricStashNotes=async(rowId,notes)=>{
    setFabricStash(prev=>prev.map(r=>r.id===rowId?{...r,notes}:r));
    if(supabase) await supabase.from("user_fabric_inventory").update({notes}).eq("id",rowId);
  };

  const addToUserInventory=async thread=>{
    const label = `${thread.brand||"Thread"} ${thread.color_code||thread.code||""} — ${thread.color_name||thread.name||""}`.trim();
    try{
      if(supabase&&userId&&thread.id){
        // Enforce free plan thread limit (25)
        if(userPlan === "free"){
          const {count} = await supabase.from("user_inventory").select("*",{count:"exact",head:true}).eq("user_id",userId);
          if(count >= 25){
            setMessage("⚠ Free plan limit: 25 threads. Upgrade to Basic for unlimited stash.");
            return;
          }
        }
        // Store directly in user_inventory using thread_library_all id
        // Single thread_library table — thread.id is always the FK
        const{error}=await supabase.from("user_inventory")
          .upsert({user_id:userId,thread_id:thread.id,spool_count:1,inventory_target:settings.defaultInventoryTarget||0},{onConflict:"user_id,thread_id"});
        if(error){
          console.error("user_inventory upsert error:",error.message);
          saveThreadToLocalStash(thread);
          setMessage(`${label} saved locally.`);
          return;
        }
        if(error){
          console.error("user_inventory upsert error:",error.message);
          // If FK fails (thread_id not in thread_library), save to local stash instead
          saveThreadToLocalStash(thread);
          setMessage(`${label} saved to local stash.`);
          return;
        }
        setMessage(`${label} added to your stash!`);
        return;
      }
    }catch(e){
      console.error("addToUserInventory error:",e);
    }
    // Offline / no supabase — save locally
    saveThreadToLocalStash(thread);
    setMessage(`${label} saved to local stash.`);
  };

  const saveThreadToLocalStash=thread=>{
    const key="hh_thread_stash";
    const existing=JSON.parse(localStorage.getItem(key)||"[]");
    const id=thread.id||thread.color_code||thread.code;
    if(!existing.find(t=>t.id===id)){
      localStorage.setItem(key,JSON.stringify([...existing,{
        id,brand:thread.brand||"",brand_key:thread.brand_key||"",
        color_code:thread.color_code||thread.code||"",
        color_name:thread.color_name||thread.name||"",
        hex_color:thread.hex_color||thread.hex||thread.swatch||"",
        fiber_type:thread.fiber_type||"",weight:thread.weight||"",
        quantity:1,added:new Date().toISOString()
      }]));
    }
  };

  // ── Export stash as CSV ───────────────────────────────────
  const exportStash = async () => {
    const rows = [];
    const ts = new Date().toISOString().slice(0,10);

    // Helper to escape CSV fields
    const esc = v => `"${String(v||"").replace(/"/g,'""')}"`;

    if(supabase && userId){
      // Fetch all stash sections from Supabase
      const [{data:th},{data:fa},{data:ru},{data:ma},{data:di},{data:fe}] = await Promise.all([
        supabase.from("user_inventory")
          .select("spool_count,thread_library(brand,color_code,color_name,hex_color,fiber_type,weight)")
          .eq("user_id",userId),
        supabase.from("user_fabric_inventory")
          .select("notes,fabric_library(brand,color_code,color_name,hex_color,family,nearest_kona_name)")
          .eq("user_id",userId),
        supabase.from("user_rulers")
          .select("quantity,ruler_library(brand,name,category,size,sku)")
          .eq("user_id",userId),
        supabase.from("user_machines")
          .select("serial_number,purchase_date,purchase_price,dealer,warranty_until,user_notes,machine_library(brand,model,type,category)")
          .eq("user_id",userId),
        supabase.from("user_dies")
          .select("quantity,machine_library(brand,model,category)")
          .eq("user_id",userId),
        supabase.from("user_feet")
          .select("quantity,feet_library(brand,foot_name,category,shank_type)")
          .eq("user_id",userId),
      ]);

      // THREADS
      rows.push("THREADS");
      rows.push(["Type","Brand","Code","Color Name","Hex Color","Fiber","Weight","Spools"].map(esc).join(","));
      (th||[]).forEach(item => {
        const t = item.thread_library;
        if(!t) return;
        rows.push(["Thread",t.brand||"",t.color_code||"",t.color_name||"",t.hex_color||"",t.fiber_type||"",t.weight||"",item.spool_count||1].map(esc).join(","));
      });

      // FABRICS
      rows.push("");
      rows.push("FABRICS");
      rows.push(["Type","Brand","Code","Color Name","Hex Color","Family","Nearest Kona","Notes"].map(esc).join(","));
      (fa||[]).forEach(item => {
        const f = item.fabric_library;
        if(!f) return;
        rows.push(["Fabric",f.brand||"",f.color_code||"",f.color_name||"",f.hex_color||"",f.family||"",f.nearest_kona_name||"",item.notes||""].map(esc).join(","));
      });

      // RULERS
      rows.push("");
      rows.push("RULERS");
      rows.push(["Type","Brand","Name","Category","Size","SKU","Quantity"].map(esc).join(","));
      (ru||[]).forEach(item => {
        const r = item.ruler_library;
        if(!r) return;
        rows.push(["Ruler",r.brand,r.name,r.category,r.size,r.sku,item.quantity].map(esc).join(","));
      });

      // MACHINES
      rows.push("");
      rows.push("MACHINES");
      rows.push(["Type","Brand","Model","Category","Serial Number","Purchase Date","Purchase Price","Dealer","Warranty Until","Notes"].map(esc).join(","));
      (ma||[]).forEach(item => {
        const m = item.machine_library;
        if(!m) return;
        rows.push([
          "Machine", m.brand, m.model, m.category,
          item.serial_number||"", item.purchase_date||"",
          item.purchase_price||"", item.dealer||"",
          item.warranty_until||"", item.user_notes||""
        ].map(esc).join(","));
      });

      // ACCUQUILT DIES
      rows.push("");
      rows.push("ACCUQUILT DIES");
      rows.push(["Type","Brand","Model","Category","Quantity"].map(esc).join(","));
      (di||[]).forEach(item => {
        const d = item.machine_library;
        if(!d) return;
        rows.push(["AccuQuilt Die",d.brand,d.model,d.category,item.quantity||1].map(esc).join(","));
      });

      // FEET
      rows.push("");
      rows.push("PRESSER FEET");
      rows.push(["Type","Brand","Foot Name","Category","Shank Type","Quantity"].map(esc).join(","));
      (fe||[]).forEach(item => {
        const f = item.feet_library;
        if(!f) return;
        rows.push(["Presser Foot",f.brand,f.foot_name,f.category,f.shank_type,item.quantity||1].map(esc).join(","));
      });
    } else {
      // Local threads only
      rows.push("THREADS (Local Library)");
      rows.push(["Name","Isacord Code","Barcode","Weight","Spools","Spool Size","Inventory Target","Color Family","Hex Color"].map(esc).join(","));
      threads.forEach(t => {
        rows.push([
          t.name, t.isacord||"", t.barcode||"", t.weight||"",
          t.spools||0, t.spoolSize||"", t.inventoryTarget||0,
          t.family||"", t.hex||t.swatch||""
        ].map(esc).join(","));
      });
    }

    // ACCESSORIES (localStorage)
    const savedAcc = JSON.parse(localStorage.getItem("hh_accessories")||"[]");
    if(savedAcc.length > 0){
      rows.push("");
      rows.push("ACCESSORIES");
      rows.push(["Type","Name","Quantity","Notes"].map(esc).join(","));
      savedAcc.forEach(a => {
        rows.push(["Accessory",a.name,a.quantity||1,a.notes||""].map(esc).join(","));
      });
    }

    // Generate and download
    const csv = rows.join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haberdash-haven-stash-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage("Stash exported! Check your downloads folder.");
  };

  const checkForUpdates=async()=>{
    try{ const r=await fetch("/data/library-version.json",{cache:"no-store"}); const j=await r.json(); const rv=j.libraryVersion||j.version||syncMeta.libraryVersion; persistSyncMeta({...syncMeta,remoteLibraryVersion:rv,status:versionCompare(rv,syncMeta.libraryVersion)>0?"Update available":"Library up to date",hasUpdate:versionCompare(rv,syncMeta.libraryVersion)>0}); }
    catch{persistSyncMeta({...syncMeta,status:"Sync check unavailable"});}
  };
  const runAutoSync=async()=>{
    try{
      persistSyncMeta({...syncMeta,status:"Syncing…"});
      const vr=await fetch("/data/library-version.json",{cache:"no-store"}); const vj=await vr.json(); const rv=vj.libraryVersion||vj.version||syncMeta.libraryVersion;
      if(versionCompare(rv,syncMeta.libraryVersion)<=0){persistSyncMeta({...syncMeta,remoteLibraryVersion:rv,status:"Library already current",hasUpdate:false});return;}
      const lr=await fetch("/data/thread-library.json",{cache:"no-store"}); const lj=await lr.json();
      if(!Array.isArray(lj))throw new Error("Bad library");
      persistLibrary(lj);
      persistSyncMeta({appVersion:APP_VERSION,libraryVersion:rv,remoteLibraryVersion:rv,status:"Synced",lastSynced:new Date().toLocaleString(),hasUpdate:false});
      setMessage("Library synced!");
    }catch{persistSyncMeta({...syncMeta,status:"Sync failed"});setMessage("Sync failed.");}
  };

  // ── Match card ────────────────────────────────────────────
  // ── Fabric match card (parity with thread MatchCard) ──
  const FabricMatchCard=({fabric})=>{
    const hex=fabric.hex_color||(fabric.r!=null?`#${[fabric.r,fabric.g,fabric.b].map(v=>v.toString(16).padStart(2,'0')).join('')}`:"#CCCCCC");
    const nearestThread=React.useMemo(()=>findNearestInPool(fabric,supaAllThreads),[fabric]);
    const [xrefBrand,setXrefBrand]=React.useState("");
    const xrefFabric=React.useMemo(()=>{
      if(!xrefBrand) return null;
      const pool=supaFabrics.filter(f=>f.brand===xrefBrand && f.id!==fabric.id);
      return findNearestInPool(fabric,pool);
    },[xrefBrand,fabric]);
    return(
      <div className="card">
        <div className="thread-row">
          <div className="swatch" style={{background:hex}}/>
          <div style={{flex:1}}>
            <div className="thread-name">{fabric.color_code?`${fabric.color_code} — `:""}{fabric.color_name}</div>
            <div className="muted">{fabric.brand}{fabric.manufacturer&&fabric.manufacturer!==fabric.brand?` · ${fabric.manufacturer}`:""}</div>
          </div>
        </div>
        <div className="list-box">
          <div><b>Color family:</b> {hexToFamilyKey(fabric)}</div>
          {fabric.nearest_kona_name&&<div><b>Nearest Kona:</b> {fabric.nearest_kona_name}</div>}
        </div>

        {/* Cross-ref 1: nearest matching thread */}
        {nearestThread&&(
          <div style={{marginTop:10,padding:"10px 12px",background:"var(--sun-wash)",border:"1.5px solid var(--border-sun)",borderRadius:"var(--r-sm)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--teal)",whiteSpace:"nowrap"}}>Matching thread:</span>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:nearestThread.hex_color||"#ccc",border:"2px solid rgba(255,255,255,0.6)",boxShadow:"0 2px 6px rgba(0,0,0,0.18)"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,color:"var(--ink)"}}>{nearestThread.color_code} — {nearestThread.color_name}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{nearestThread.brand}</div>
              </div>
              <button className="btn active" style={{fontSize:11,padding:"5px 10px",flexShrink:0}} onClick={()=>addToUserInventory(nearestThread)}>+ Add</button>
            </div>
          </div>
        )}

        {/* Cross-ref 2: find equivalent in another fabric brand */}
        {fabricBrandList.length>1&&(
          <div style={{marginTop:10,padding:"10px 12px",background:"var(--teal-pale)",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-sm)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--teal)",whiteSpace:"nowrap"}}>Find equivalent in:</span>
              <select value={xrefBrand} onChange={e=>setXrefBrand(e.target.value)}
                style={{flex:1,minWidth:140,padding:"5px 10px",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-sm)",background:"var(--warm-white)",fontFamily:"Nunito,sans-serif",fontSize:13,fontWeight:600,color:"var(--ink)",cursor:"pointer",outline:"none"}}>
                <option value="">— choose a fabric brand —</option>
                {fabricBrandList.filter(b=>b!==fabric.brand).map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {xrefBrand&&xrefFabric&&(
              <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,padding:"8px 10px",background:"var(--warm-white)",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-sm)"}}>
                <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:xrefFabric.hex_color||"#ccc",border:"2px solid rgba(255,255,255,0.6)"}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--ink)"}}>{xrefFabric.color_code?`${xrefFabric.color_code} — `:""}{xrefFabric.color_name}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{xrefFabric.brand}</div>
                </div>
                <button className="btn active" style={{fontSize:11,padding:"5px 10px",flexShrink:0}} onClick={()=>addFabricToInventory(xrefFabric)}>+ Add</button>
              </div>
            )}
            {xrefBrand&&!xrefFabric&&<p style={{fontSize:12,color:"var(--muted)",marginTop:8}}>No {xrefBrand} colors loaded.</p>}
          </div>
        )}

        <div className="button-row">
          <button className="btn active" onClick={()=>addFabricToInventory(fabric)}>+ Add to Stash</button>
          <button className="btn" onClick={()=>addProjectRequiredFabric(fabric)}>Add to Project</button>
          <button className="btn" onClick={()=>addFabricToShopping(fabric)}>Shopping List</button>
        </div>
      </div>
    );
  };

  const MatchCard=({thread})=>{
    const [selectedCrossRef, setSelectedCrossRef] = React.useState(settings.crossRefBrand||"");
    const [crossRefResult, setCrossRefResult]     = React.useState(null);

    const isAllBrandsRow = thread.brand_key !== undefined && thread.color_code !== undefined;
    const isSupaThread   = !isAllBrandsRow && thread.code !== undefined && thread.color_name !== undefined && !thread.brands;
    // Use hex_color or construct from r,g,b columns
    const hex = thread.hex_color || thread.hex || thread.swatch ||
      (thread.r!=null ? `#${[thread.r,thread.g,thread.b].map(v=>v.toString(16).padStart(2,'0')).join('')}` : "#CCCCCC");
    const displayName    = isAllBrandsRow
      ? `${thread.color_code} — ${thread.color_name}`
      : isSupaThread ? `${thread.code} — ${thread.color_name}` : thread.name;
    const displayBrand   = isAllBrandsRow
      ? thread.brand
      : isSupaThread ? (thread.manufacturer||"Isacord") : (thread.brands?.primary||"—");
    const currentBrandKey = thread.brand_key||"isacord";

    // Find nearest equivalent whenever selected brand changes
    React.useEffect(()=>{
      if(!selectedCrossRef){ setCrossRefResult(null); return; }
      const bk = brandKeyMap[selectedCrossRef]||normalized(selectedCrossRef).replace(/[^a-z0-9]/g,"_");
      if(bk===currentBrandKey){ setCrossRefResult(null); return; }
      const nearest = findNearestInBrand(hex, bk, supaAllThreads);
      setCrossRefResult(nearest);
    },[selectedCrossRef, hex]);

    return(
      <div className="card">
        {/* Swatch + name */}
        <div className="thread-row">
          <div className="swatch" style={{background:hex}}/>
          <div style={{flex:1}}>
            <div className="thread-name">{displayName}</div>
            <div className="muted">{displayBrand}</div>
          </div>
        </div>

        {/* Thread details */}
        {(isAllBrandsRow||isSupaThread)&&(
          <div className="list-box">
            <div><b>Code:</b> {thread.color_code||thread.code}</div>
            {thread.fiber_type&&<div><b>Fiber:</b> {thread.fiber_type}{thread.weight?` · ${thread.weight}`:""}</div>}
            <div><b>Color family:</b> {hexToFamilyKey(thread)}</div>
          </div>
        )}
        {!isAllBrandsRow&&!isSupaThread&&(
          <div className="list-box">
            {settings.showBarcodes&&thread.barcode&&<div><b>Barcode:</b> {thread.barcode}</div>}
            {thread.weight&&<div><b>Weight:</b> {thread.weight}</div>}
          </div>
        )}

        {/* ── Find equivalent in another brand ── */}
        {supaAllThreads.length>0&&(isAllBrandsRow||isSupaThread)&&(
          <div style={{
            marginTop:10,padding:"10px 12px",
            background:"var(--sun-wash)",
            border:"1.5px solid var(--border-sun)",
            borderRadius:"var(--r-sm)"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--teal)",whiteSpace:"nowrap"}}>
                Find equivalent in:
              </span>
              <select
                value={selectedCrossRef}
                onChange={e=>setSelectedCrossRef(e.target.value)}
                style={{
                  flex:1,minWidth:140,padding:"5px 10px",
                  border:"1.5px solid var(--border-sun)",
                  borderRadius:"var(--r-sm)",
                  background:"var(--warm-white)",
                  fontFamily:"Nunito,sans-serif",
                  fontSize:13,fontWeight:600,color:"var(--ink)",
                  cursor:"pointer",outline:"none"
                }}
              >
                <option value="">— choose a brand —</option>
                {threadBrands
                  .filter(([,bk])=>bk!==currentBrandKey)
                  .map(([label])=>(
                    <option key={label} value={label}>{label}</option>
                  ))
                }
              </select>
            </div>

            {/* Result */}
            {selectedCrossRef&&crossRefResult&&(
              <div style={{
                display:"flex",alignItems:"center",gap:10,marginTop:8,
                padding:"8px 10px",
                background:"var(--warm-white)",
                border:"1.5px solid var(--border-teal)",
                borderRadius:"var(--r-sm)",
                boxShadow:"var(--shadow-xs)"
              }}>
                {crossRefResult.hex_color&&(
                  <div style={{
                    width:32,height:32,borderRadius:"50%",flexShrink:0,
                    background:crossRefResult.hex_color,
                    border:"2px solid rgba(255,255,255,0.6)",
                    boxShadow:"0 2px 6px rgba(0,0,0,0.18),inset 0 1px 3px rgba(255,255,255,0.3)"
                  }}/>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--ink)"}}>
                    {crossRefResult.color_code} — {crossRefResult.color_name}
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>
                    {crossRefResult.brand}{crossRefResult.fiber_type?` · ${crossRefResult.fiber_type}`:""}
                  </div>
                </div>
                <button
                  className="btn active"
                  style={{fontSize:11,padding:"5px 10px",flexShrink:0}}
                  onClick={()=>addToUserInventory(crossRefResult)}
                >+ Add</button>
              </div>
            )}
            {selectedCrossRef&&!crossRefResult&&(
              <p style={{fontSize:12,color:"var(--muted)",marginTop:8}}>
                No {selectedCrossRef} colors loaded.
              </p>
            )}
          </div>
        )}

        {/* ── Closest fabrics (thread → fabric cross-reference) ── */}
        {supaFabrics.length>0&&(isAllBrandsRow||isSupaThread)&&(()=>{
          const nearestFabrics=findNearestN(thread,supaFabrics,3);
          if(!nearestFabrics.length) return null;
          return(
            <div style={{marginTop:10,padding:"10px 12px",background:"var(--teal-pale)",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-sm)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--teal)",marginBottom:8}}>Closest fabrics</div>
              {nearestFabrics.map(fab=>(
                <div key={fab.id} style={{display:"flex",alignItems:"center",gap:10,marginTop:6,padding:"8px 10px",background:"var(--warm-white)",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-sm)"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:fab.hex_color||"#ccc",border:"2px solid rgba(255,255,255,0.6)",boxShadow:"0 2px 6px rgba(0,0,0,0.18)"}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,color:"var(--ink)"}}>{fab.color_code?`${fab.color_code} — `:""}{fab.color_name}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{fab.brand}{fab.nearest_kona_name?` · ~${fab.nearest_kona_name}`:""}</div>
                  </div>
                  <button className="btn active" style={{fontSize:11,padding:"5px 10px",flexShrink:0}} onClick={()=>addFabricToInventory&&addFabricToInventory(fab)}>+ Add</button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Actions */}
        <div className="button-row">
          <button className="btn active" onClick={()=>addToUserInventory(thread)}>+ Add to Stash</button>
          <button className="btn" onClick={()=>addProjectRequiredThread(thread)}>Add to Project</button>
          <button className="btn" onClick={()=>addManualShoppingItem(thread)}>Shopping List</button>
        </div>
      </div>
    );
  };

  // ── 4 main tabs ───────────────────────────────────────────
  const mainTabs = isGuest
    ? [["home","Home"],["match","Match"]]
    : [["home","Home"],["match","Match"],["stash","Stash"],["projects","Projects"],["more","More"]];

  // Auth gate — MUST be after all hooks
  if(supabase && !user && !isGuest){
    return <AuthScreen
      supabase={supabase}
      onGuest={onGuestMode||(() => {})}
      onSignIn={onSignIn}
    />;
  }

  return(
    <div className="app-shell">
      <header className="hero card dark" style={{position:"relative",zIndex:30}}>
        <div className="hero-inner">
          <img src="/HH_Logo.png" alt="Haberdash Haven Logo" className="hero-logo" />
          <div className="hero-text">
            <div className="brand"><span className="brand-accent">✿</span> Haberdash Haven</div>
            <div className="tagline">Making the world a better place. One stitch at a time...</div>
          </div>
        </div>

        {/* Notification bell — signed-in users only */}
        {user && !isGuest && (
          <div style={{position:"absolute",top:12,right:12,zIndex:20}}>
            <button
              onClick={()=>{ setShowNotifs(v=>!v); if(!showNotifs) markAllRead(); }}
              aria-label="Notifications"
              style={{
                position:"relative",background:"rgba(255,255,255,0.12)",border:"none",
                borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:18,
                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"
              }}>
              🔔
              {unreadCount>0 && (
                <span style={{
                  position:"absolute",top:-2,right:-2,minWidth:18,height:18,padding:"0 5px",
                  background:"var(--sun-gold)",color:"var(--ink)",borderRadius:"var(--r-full)",
                  fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",
                  border:"2px solid var(--teal)"
                }}>{unreadCount>9?"9+":unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div style={{
                position:"fixed",top:64,right:12,width:300,maxWidth:"86vw",zIndex:1000,
                background:"var(--warm-white)",border:"1.5px solid var(--border-teal)",
                borderRadius:"var(--r-md)",boxShadow:"0 8px 28px rgba(0,0,0,0.22)",
                overflow:"hidden",textAlign:"left"
              }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 14px",borderBottom:"1px solid var(--border-teal)",background:"var(--teal-pale)"}}>
                  <span style={{fontWeight:800,fontSize:13,color:"var(--teal)"}}>Notifications</span>
                  <span style={{fontSize:16,cursor:"pointer",color:"var(--muted)"}} onClick={()=>setShowNotifs(false)}>✕</span>
                </div>

                {visibleNotifs.length===0 ? (
                  <div style={{padding:"22px 16px",textAlign:"center"}}>
                    <div style={{fontSize:26,marginBottom:6}}>✨</div>
                    <p className="muted" style={{fontSize:13,margin:0}}>You're all caught up.</p>
                  </div>
                ) : (
                  <div style={{maxHeight:320,overflowY:"auto"}}>
                    {visibleNotifs.map(n=>(
                      <div key={n.id} style={{display:"flex",gap:10,padding:"11px 14px",
                        borderBottom:"1px solid var(--teal-pale)",alignItems:"flex-start"}}>
                        <div style={{fontSize:18,flexShrink:0,lineHeight:1.2}}>{n.icon}</div>
                        <div style={{flex:1,minWidth:0,cursor:"pointer"}}
                          onClick={()=>{ if(n.dest_tab){ setTab(n.dest_tab); if(n.dest_sub) setMoreSubTab(n.dest_sub); } setShowNotifs(false); }}>
                          <div style={{fontWeight:700,fontSize:13,color:"var(--ink)"}}>{n.title}</div>
                          {n.body&&<div style={{fontSize:12,color:"var(--muted)",marginTop:1}}>{n.body}</div>}
                        </div>
                        <span title="Dismiss" style={{fontSize:13,cursor:"pointer",color:"var(--subtle)",flexShrink:0}}
                          onClick={()=>dismissNotif(n.id)}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="hero-bar" style={{pointerEvents:"none"}}></div>
      </header>

      {/* ── 4-tab main nav ── */}
      <nav className="nav-row main-nav" style={{position:"relative",zIndex:1}}>
        {mainTabs.map(([key,label])=>(
          <button key={key} className={`btn ${tab===key?"active":""}`}
            onClick={()=>setTab(key)}
            style={{flex:1,textAlign:"center"}}>
            {label}
          </button>
        ))}
      </nav>

      {message&&<div className="message" onClick={()=>setMessage("")}>{message} ✕</div>}

      {/* ══════════════════════════════════════════════════════
          HOME
          ══════════════════════════════════════════════════════ */}
      {tab==="home"&&(
        <div>
          <div className="card">
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:"var(--teal)",marginBottom:6}}>
              Welcome to Haberdash Haven
            </div>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"var(--sun-amber)",marginBottom:10}}>
              Stitch. Match. Thrive.
            </div>
            <p style={{fontSize:14,lineHeight:1.55,color:"var(--ink-soft)",margin:0}}>
              Haberdash Haven is your sewing room in your pocket — the app that knows your supplies.
              Match thread and fabric colors instantly, track everything you own across threads, fabrics,
              machines, rulers, AccuQuilt dies, and presser feet, plan projects, and build smart shopping
              lists so you never buy a duplicate spool again.
            </p>
          </div>

          {/* Spool Quest — a little fun on the home tab */}
          <div className="card" style={{background:"linear-gradient(135deg,var(--sun-wash),var(--linen))",border:"1.5px solid var(--border-sun)",display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:34,flexShrink:0}}>🧵</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:800,color:"var(--teal)"}}>Spool Quest</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>Rescue your quilt before the Bee deadline. A quick coffee-break game.</div>
            </div>
            <button className="btn active" style={{flexShrink:0,fontWeight:700}} onClick={()=>setShowGame(true)}>Play</button>
          </div>

          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{margin:0}}>Quick Actions</h2>
              <button className="btn" style={{fontSize:12,padding:"4px 10px"}} onClick={()=>setEditQuickActions(v=>!v)}>{editQuickActions?"Done":"Customize"}</button>
            </div>

            {editQuickActions ? (
              <div style={{marginTop:10}}>
                <p className="muted" style={{fontSize:12,marginBottom:8}}>Pick up to 4 to show on your Home screen.</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {QUICK_ACTION_CATALOG.map(a=>{
                    const chosen=(settings.quickActions||DEFAULT_QUICK_ACTIONS).includes(a.key);
                    const atLimit=(settings.quickActions||DEFAULT_QUICK_ACTIONS).length>=4 && !chosen;
                    return(
                      <button key={a.key}
                        onClick={()=>{
                          const cur=settings.quickActions||DEFAULT_QUICK_ACTIONS;
                          let next;
                          if(chosen) next=cur.filter(k=>k!==a.key);
                          else { if(cur.length>=4) return; next=[...cur,a.key]; }
                          setSettings({...settings,quickActions:next});
                        }}
                        disabled={atLimit}
                        style={{
                          display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                          borderRadius:"var(--r-sm)",fontFamily:"Nunito,sans-serif",fontSize:13,fontWeight:600,
                          cursor:atLimit?"not-allowed":"pointer",textAlign:"left",
                          border:chosen?"2px solid var(--teal)":"1.5px solid var(--border-teal)",
                          background:chosen?"var(--teal-pale)":"var(--warm-white)",
                          color:atLimit?"var(--subtle)":"var(--ink)",opacity:atLimit?0.5:1
                        }}>
                        <span>{a.emoji}</span><span style={{flex:1}}>{a.label}</span>{chosen&&<span style={{color:"var(--teal)"}}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="quick-grid">
                {(settings.quickActions||DEFAULT_QUICK_ACTIONS)
                  .map(k=>QUICK_ACTION_CATALOG.find(a=>a.key===k))
                  .filter(Boolean)
                  .map(a=>{
                    const locked=a.needsAuth&&isGuest;
                    return(
                      <button key={a.key} className={`quick-btn ${a.cls}`}
                        disabled={locked} title={locked?"Sign in to access":""}
                        onClick={()=>{ if(locked)return; setTab(a.dest.tab); if(a.dest.sub) setMoreSubTab(a.dest.sub); }}
                        style={locked?{opacity:0.45,cursor:"not-allowed"}:{}}>
                        <span className="icon">{a.emoji}</span>{a.label}{locked&&" 🔒"}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Upgrade prompt on home for free/guest users */}
          {(!user || isGuest || userPlan === "free") && (
            <div className="card" style={{background:"linear-gradient(135deg,var(--teal-pale),var(--linen))",border:"1.5px solid var(--border-teal)"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"var(--teal)",marginBottom:10}}>
                Unlock the Full Haven ✦
              </div>

              {/* Monthly / Annual toggle */}
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                <div style={{display:"inline-flex",background:"var(--warm-white)",border:"1.5px solid var(--border-teal)",borderRadius:"var(--r-full)",padding:3,gap:2}}>
                  {[["monthly","Monthly"],["annual","Annual"]].map(([key,label])=>(
                    <button key={key} onClick={()=>setBillingCycle(key)}
                      style={{
                        padding:"5px 16px",borderRadius:"var(--r-full)",border:"none",cursor:"pointer",
                        fontFamily:"Nunito,sans-serif",fontSize:12,fontWeight:700,
                        background:billingCycle===key?"var(--teal)":"transparent",
                        color:billingCycle===key?"#fff":"var(--muted)",
                        transition:"all .15s"
                      }}>
                      {label}{key==="annual"?" · save ~17%":""}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {[
                  {plan:"Basic",planKey:"basic",perks:["Unlimited thread stash","Machine library","Shopping lists","5 projects"],color:"var(--teal)"},
                  {plan:"Premium",planKey:"premium",perks:["Everything in Basic","Fabric & accessories","Unlimited projects","Community Forum","CSV export & insurance reports"],color:"#1A5276"},
                ].map(({plan,planKey,perks,color})=>{
                  const sav=annualSavings(planKey);
                  return(
                  <div key={plan} style={{background:"#fff",borderRadius:10,padding:"12px",border:`1.5px solid ${color}`}}>
                    <div style={{fontWeight:700,color,fontSize:14,marginBottom:2}}>{plan}</div>
                    <div style={{fontSize:14,fontWeight:800,color:"var(--ink)"}}>{priceLabel(planKey,billingCycle)}</div>
                    <div style={{fontSize:11,color:"var(--muted)",marginBottom:8,minHeight:14}}>
                      {billingCycle==="annual"
                        ? (sav?`Save ${fmtPrice(sav.amount)}/yr`:"Billed yearly")
                        : `or ${priceLabel(planKey,"annual")} billed yearly`}
                    </div>
                    {perks.map((p,i)=><div key={i} style={{fontSize:11,color:"var(--ink)",padding:"1px 0"}}>✓ {p}</div>)}
                  </div>
                  );
                })}
              </div>
              <button className="btn active" style={{width:"100%"}} onClick={()=>window.location.href=window.location.origin}>
                {!user||isGuest ? "Create Account — Free" : "Upgrade Now"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MATCH — sub-tabs: Thread | Camera | Fabric | Barcode
          ══════════════════════════════════════════════════════ */}
      {tab==="match"&&(
        <>
          {/* Sub-tab row */}
          <div className="sub-tab-row">
            {[["thread","🔍 Thread"],["crossref","⇄ Cross-Ref"],["colorwheel","🎨 Color Wheel"],["camera","📷 Camera"],["fabric","◈ Fabric"],["barcode","▦ Barcode"]].map(([key,label])=>(
              <button key={key} className={`sub-tab ${subTab===key?"active":""}`} onClick={()=>setSubTab(key)}>
                {label}
              </button>
            ))}
          </div>

          {/* Thread search */}
          {subTab==="thread"&&(
            <>
              <div className="card">
                <h2>Thread Match</h2>
                <label>Thread Brand
                  {!user&&<span style={{fontSize:11,color:"var(--sky-cobalt)",marginLeft:6,fontWeight:600}}>
                    (Sign in to access all 26 brands)
                  </span>}
                  <select className="input" value={matchBrand} onChange={e=>setMatchBrand(e.target.value)}
                    disabled={!user||isGuest}>
                    {(user&&!isGuest)
                      ? threadBrands.map(([label])=><option key={label}>{label}</option>)
                      : <option>Isacord</option>
                    
                    }
                  </select>
                </label>
                <label>{t("match_color_family",lang)}
                  <select className="input" value={colorFamilyKey} onChange={e=>setColorFamilyKey(e.target.value)}>
                    {COLOR_FAMILY_KEYS.map((key,i)=>(
                      <option key={key} value={key}>{key==="All"?"Color Families":getColorFamilies(lang)[i]}</option>
                    ))}
                  </select>
                </label>
                <label>Search (name, code, or barcode)
                  <input className="input" value={matchQuery} onChange={e=>setMatchQuery(e.target.value)} placeholder="color name, code… e.g. Navy, 3810, Dusty Rose"/>
                </label>
                {colorFamilyKey==="All"&&!matchQuery&&(
                  <div style={{marginTop:-8}}>
                    {supaAllThreads.length>0?(
                      <p className="muted" style={{fontSize:12}}>
                        {supaAllThreads.filter(t=>t.brand_key===(brandKeyMap[matchBrand]||matchBrand)).length} {matchBrand} colors
                        · {supaAllThreads.length} total across all brands.
                        Choose a color family or type to search.
                      </p>
                    ):supabase?(
                      <p className="muted" style={{fontSize:12,color:"var(--sky-cobalt)"}}>
                        ⏳ Loading thread database… If this takes more than a few seconds,
                        run step 33 SQL in Supabase to fix RLS on thread_library.
                      </p>
                    ):(
                      <p className="muted" style={{fontSize:12}}>
                        {threads.length} local colors available. Sign in to search all brands.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* Guest limit banner */}
              {(!user||isGuest)&&filteredMatchResults.length>=10&&(
                <div style={{
                  padding:"14px 16px",marginBottom:8,
                  background:"linear-gradient(135deg, var(--teal) 0%, var(--sky-cobalt) 100%)",
                  borderRadius:"var(--r)",color:"white",textAlign:"center"
                }}>
                  <div style={{fontFamily:"Playfair Display,serif",fontSize:15,fontWeight:700,marginBottom:6}}>
                    Showing 10 of {supaAllThreads.filter(t=>t.brand_key==="isacord").length}+ Isacord colors
                  </div>
                  <p style={{fontSize:12,opacity:0.9,marginBottom:10}}>
                    Sign in to search all {supaAllThreads.length.toLocaleString()} thread colors across 26 brands, use cross-referencing, and save your stash.
                  </p>
                  <button className="btn"
                    style={{background:"var(--sun-gold)",color:"var(--teal)",border:"none",fontWeight:800,padding:"8px 20px"}}
                    onClick={()=>{ if(supabase) { window.location.href=window.location.origin; } }}>
                    Sign In / Create Account
                  </button>
                </div>
              )}

              {filteredMatchResults.length===0&&(matchQuery.trim()||colorFamilyKey!=="All")&&(
                <div className="card">
                  <p className="muted">
                    {supaAllThreads.length===0&&supabase
                      ? "⏳ Still loading thread database — please wait a moment and try again."
                      : `No ${matchBrand} colors found for ${colorFamilyKey!=="All"?`"${colorFamilyKey}"`:""} ${matchQuery?`"${matchQuery}"`:""}. Try a different color family, brand, or search term.`
                    }
                  </p>
                  {supaAllThreads.length===0&&supabase&&(
                    <p style={{fontSize:11,color:"var(--sky-cobalt)",marginTop:6}}>
                      If this persists, run step 33 SQL in Supabase to fix RLS on thread_library.
                    </p>
                  )}
                </div>
              )}
              {filteredMatchResults.map((thread,i)=><MatchCard key={thread.id||thread.code||i} thread={thread}/>)}

              {/* Collapsible manual add — hidden in guest mode */}
              {!isGuest&&(
              <div className="card" style={{borderStyle:"dashed",borderColor:"#C9A84C"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setShowAddThread(v=>!v)}>
                  <div><div style={{fontWeight:700,color:"#5C4A1E"}}>+ Add a thread manually</div><div className="muted" style={{fontSize:12}}>Can't find it? Add it to your local library.</div></div>
                  <span style={{fontSize:18,color:"#C9A84C"}}>{showAddThread?"▲":"▼"}</span>
                </div>
                {showAddThread&&(
                  <div style={{marginTop:14,borderTop:"1px solid #EEE",paddingTop:14}}>
                    <label>Thread Name<input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
                    <label>Color Family<input className="input" value={form.family} onChange={e=>setForm({...form,family:e.target.value})} placeholder="e.g. Blues, Reds…"/></label>
                    <label>Isacord Code<input className="input" value={form.isacord} onChange={e=>setForm({...form,isacord:e.target.value})}/></label>
                    <label>Barcode<input className="input" value={form.barcode} onChange={e=>setForm({...form,barcode:e.target.value})}/></label>
                    <label>Thread Weight<input className="input" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})}/></label>
                    <label>Spools on hand<input className="input" type="number" value={form.spools} onChange={e=>setForm({...form,spools:e.target.value})}/></label>
                    <label>Inventory Target<input className="input" type="number" value={form.inventoryTarget} onChange={e=>setForm({...form,inventoryTarget:e.target.value})}/></label>
                    <label>Spool Size<select className="input" value={form.spoolSize} onChange={e=>setForm({...form,spoolSize:e.target.value})}>{commonSpoolSizes.map(s=><option key={s}>{s}</option>)}</select></label>
                    <label>Color Swatch<input className="input" type="color" value={form.swatch} onChange={e=>setForm({...form,swatch:e.target.value})}/></label>
                    <button className="btn active" style={{width:"100%"}} onClick={addThread}>Save Thread to My Stash</button>
                  </div>
                )}
              </div>
              )}
            </>
          )}

          {/* ── Cross-Reference tab ── */}
          {subTab==="crossref"&&(
            (!user||isGuest||!canAccess("basic")) ? (
              <UpgradePrompt requiredPlan="basic" feature="Cross-Reference" currentPlan={userPlan} isGuest={isGuest||!user}/>
            ) : (
            <CrossRefTab
              supaAllThreads={supaAllThreads}
              threadBrands={threadBrands}
              brandKeyMap={brandKeyMap}
              addToUserInventory={addToUserInventory}
              addProjectRequiredThread={addProjectRequiredThread}
              addManualShoppingItem={addManualShoppingItem}
              hexToFamilyKey={hexToFamilyKey}
              settings={settings}
            />
            )
          )}

          {/* Color Wheel */}
          {subTab==="colorwheel"&&(
            (!user||isGuest) ? (
              <UpgradePrompt requiredPlan="free" feature="Color Harmony" currentPlan={userPlan} isGuest={isGuest||!user}/>
            ) : (
            <ColorWheelTab
              supaAllThreads={supaAllThreads}
              supaFabrics={supaFabrics}
              userId={userId}
              supabase={supabase}
              addToUserInventory={addToUserInventory}
              addFabricToInventory={addFabricToInventory}
              addManualShoppingItem={addManualShoppingItem}
            />
            )
          )}

          {/* Camera match */}
          {subTab==="camera"&&(
            !canAccess("basic") ? (
              <UpgradePrompt requiredPlan="basic" feature="Camera Color Match" currentPlan={userPlan} isGuest={isGuest||!user}/>
            ) : (
            <>
              {pendingBarcode&&(
                <div className="card" style={{borderColor:"#F5C400"}}>
                  <p><b>Identifying barcode:</b> {pendingBarcode}</p>
                  <p className="muted">Take a photo of the thread. Once matched, the barcode is saved for everyone.</p>
                </div>
              )}
              <div className="card">
                <h2>Camera Color Match</h2>
                <input className="input" type="file" accept="image/*" capture="environment" onChange={handleCameraImageUpload}/>
                {cameraImage&&(
                  <div style={{position:"relative",display:"inline-block",lineHeight:0}}>
                    <img src={cameraImage} alt="Sample" className="camera-preview" onClick={handleImageSample} style={{cursor:"crosshair"}}/>
                    {cameraSample&&cameraSample.markerX!=null&&(
                      <div style={{
                        position:"absolute",
                        left:`${cameraSample.markerX}%`,top:`${cameraSample.markerY}%`,
                        width:18,height:18,transform:"translate(-50%,-50%)",
                        borderRadius:"50%",border:"2px solid #fff",
                        boxShadow:"0 0 0 2px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.5)",
                        background:cameraSample.hex,pointerEvents:"none",
                      }}/>
                    )}
                  </div>
                )}
                {cameraImage&&<div style={{fontSize:12,color:"var(--muted)",marginTop:6}}>Tap the exact color on the image you want to match.</div>}
                {cameraSample&&(
                  <div className="list-box" style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{display:"inline-block",width:20,height:20,borderRadius:4,background:cameraSample.hex,border:"1px solid rgba(0,0,0,0.2)",flexShrink:0}}/>
                    <span><b>Sampled:</b> {cameraSample.hex} ({cameraSample.r}, {cameraSample.g}, {cameraSample.b})</span>
                  </div>
                )}
              </div>
              {cameraMatches.map((thread,i)=>(
                <div key={thread.id||thread.code||i}>
                  <MatchCard thread={thread}/>
                  {pendingBarcode&&(
                    <div style={{margin:"-8px 0 8px",padding:"0 4px"}}>
                      <button className="btn active" style={{width:"100%"}} onClick={()=>handleCameraMatchWithBarcode(thread)}>✓ This is the thread — save barcode for everyone</button>
                    </div>
                  )}
                </div>
              ))}
            </>
            )
          )}

          {/* Fabric match */}
          {subTab==="fabric"&&(
            <>
              <div className="card">
                <h2>Solid Fabric Match</h2>
                <label>Fabric Brand
                  <select className="input" value={fabricBrandFilter} onChange={e=>setFabricBrandFilter(e.target.value)}>
                    <option value="All">All brands</option>
                    {fabricBrandList.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                <label>Color Family
                  <select className="input" value={colorFamilyKey} onChange={e=>setColorFamilyKey(e.target.value)}>
                    <option value="All">Color Families</option>
                    {COLOR_FAMILY_KEYS.filter(k=>k!=="All").map(k=><option key={k} value={k}>{k}</option>)}
                  </select>
                </label>
                <label>Search<input className="input" value={matchQuery} onChange={e=>setMatchQuery(e.target.value)} placeholder="Color name, code, brand, Kona match…"/></label>
              </div>
              {filteredMatchResults.length===0&&(matchQuery.trim()||colorFamilyKey!=="All"||fabricBrandFilter!=="All")&&(
                <div className="card"><p className="muted">No fabrics found. Try a different brand, family, or search term.</p></div>
              )}
              {filteredMatchResults.map((fabric,i)=><FabricMatchCard key={fabric.id||i} fabric={fabric}/>)}
            </>
          )}

          {/* Barcode scan */}
          {subTab==="barcode"&&(
            !canAccess("basic") ? (
              <UpgradePrompt requiredPlan="basic" feature="Barcode Scanner" currentPlan={userPlan} isGuest={isGuest||!user}/>
            ) : (
            <div style={{padding:"8px 0"}}>
              {supabase
                ?<BarcodeScanner supabase={supabase} userId={userId}
                    onAddToStash={thread=>setMessage(`${thread.color_name} added to your stash!`)}
                    onColorMatch={barcode=>{setPendingBarcode(barcode);setSubTab("camera");}}
                  />
                :<div className="card"><p className="muted">Connect to Supabase to use barcode scanning.</p></div>
              }
            </div>
            )
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          STASH — all inventory in one place
          ══════════════════════════════════════════════════════ */}
      {tab==="stash"&&(
        (!user||isGuest) ? (
          <div className="card" style={{textAlign:"center",padding:"32px 20px"}}>
            <div style={{fontSize:32,marginBottom:10}}>◈</div>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"var(--teal)",marginBottom:8}}>
              Your Stash Requires an Account
            </div>
            <p className="muted" style={{fontSize:13,marginBottom:16}}>
              Sign in to track your threads, machines, rulers, presser feet, and accessories.
            </p>
            <button className="btn active" onClick={()=>{ if(supabase) { window.location.href=window.location.origin; } }}>
              Sign In / Create Account
            </button>
          </div>
        ) : (
        <>
          <div className="card">
            <div className="stats-grid">
              <div className="stat-box"><div className="stat-num">{lowStockCount}</div><div className="stat-label">Low Stock</div></div>
              <div className="stat-box"><div className="stat-num">{belowTargetCount}</div><div className="stat-label">Below Target</div></div>
              <div className="stat-box"><div className="stat-num">{mergedShoppingList.length}</div><div className="stat-label">Shopping List</div></div>
            </div>
          </div>
          <UniversalStash
            supabase={supabase} userId={userId}
            shoppingList={shoppingList} mergedShoppingList={mergedShoppingList}
            threads={threads} updateSpools={updateSpools}
            updateInventoryTarget={updateInventoryTarget}
            addManualShoppingItem={addManualShoppingItem}
            removeShoppingItem={removeShoppingItem}
            settings={settings}
            userSettings={settings}
            userPlan={userPlan}
          />
        </>
        )
      )}

      {/* ══════════════════════════════════════════════════════
          PROJECTS
          ══════════════════════════════════════════════════════ */}
      {tab==="projects"&&(
        <ProjectsTab
          supabase={supabase}
          userId={userId}
          user={user}
          isGuest={isGuest}
          userPlan={userPlan}
          projectLimit={isPremium ? Infinity : isBasic ? 10 : isFree ? 2 : 0}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          addProjectRequiredThread={addProjectRequiredThread}
          supaAllThreads={supaAllThreads}
        />
      )}



      {/* ══════════════════════════════════════════════════════
          MORE — browse libraries + manage
          ══════════════════════════════════════════════════════ */}
      {tab==="more"&&(
        <>
          {/* More sub-nav */}
          <div className="sub-tab-row">
            {[["machines","⚙️ Machines"],["accuquilt","◈ AccuQuilt"],["feet","👟 Feet"],["rulers","📐 Rulers"],["forum","💬 Forum"],["help","? Help"],["profile","👤 Profile"],["settings","⚙ Settings"]].map(([key,label])=>(
              <button key={key} className={`sub-tab ${moreSubTab===key?"active":""}`} onClick={()=>setMoreSubTab(key)}>{label}</button>
            ))}
          </div>

          {moreSubTab==="machines"&&(
            (!user||isGuest||!canAccess("basic"))
              ?<UpgradePrompt requiredPlan="basic" feature="Machine Library" currentPlan={userPlan} isGuest={isGuest||!user}/>
              :supabase?<MachinesBrowser supabase={supabase} userId={userId}/>:<div className="card"><p className="muted">Connect to Supabase to browse machines.</p></div>
          )}
          {moreSubTab==="accuquilt"&&(supabase?<AccuQuiltBrowser supabase={supabase} userId={userId}/>:<div className="card"><p className="muted">Connect to Supabase to browse AccuQuilt.</p></div>)}
          {moreSubTab==="feet"&&(supabase?<FeetBrowser supabase={supabase} userId={userId}/>:<div className="card"><p className="muted">Connect to Supabase to browse presser feet.</p></div>)}
          {moreSubTab==="rulers"&&(supabase?<RulerBrowser supabase={supabase} userId={userId}/>:<div className="card"><p className="muted">Connect to Supabase to browse rulers.</p></div>)}
          {moreSubTab==="forum"&&(
            !supabase
              ?<div className="card"><p className="muted">Connect to Supabase to access the forum.</p></div>
              :isPremium
                ?<Forum supabase={supabase} userId={userId}/>
                :<div className="card"><h2>Community Forum</h2><p className="muted">The Community Forum is a Premium feature. Upgrade to join the conversation, share tips, and post project reviews.</p></div>
          )}

          {moreSubTab==="help"&&(
            <div className="card">
              <h2>Help &amp; Guide</h2>
              <p className="muted" style={{fontSize:13,marginTop:-4,marginBottom:14}}>
                Everything Haberdash Haven can do, tab by tab. Tap any feature in the app to try it as you read.
              </p>

              {/* MATCH */}
              <div style={{fontSize:12,fontWeight:800,color:"var(--sun-amber)",textTransform:"uppercase",letterSpacing:".6px",margin:"4px 0 8px"}}>Match</div>
              <p><b>🔍 Thread:</b> Pick a brand, choose a color family, or type to search across every thread color in the library. Each result shows the color details, the closest equivalent in any other thread brand, and now the <b>closest fabrics</b> too — plus + Add to Stash, Add to Project, and Shopping List.</p>
              <p style={{marginTop:8}}><b>⇄ Cross-Ref:</b> Convert a color between any two thread brands. Pick a source brand and color, pick the brand you want the equivalent in, and get the nearest match by color distance.</p>
              <p style={{marginTop:8}}><b>🎨 Color Wheel:</b> Explore color harmonies — complementary, analogous, triadic, split-complementary, tetradic, and monochromatic. Each color in the palette matches to real threads and fabrics you can add straight to your stash or project.</p>
              <p style={{marginTop:8}}><b>📷 Camera:</b> Snap a photo of a fabric or thread, tap any color in the image, and get the closest matches. Works on prints and solids — it averages a small area around your tap for accuracy.</p>
              <p style={{marginTop:8}}><b>◈ Fabric:</b> Search solid fabrics by brand or color. Each fabric card shows its nearest matching thread and the closest equivalent in another fabric brand. <span className="muted">(Fabric stash is a Premium feature.)</span></p>
              <p style={{marginTop:8}}><b>▦ Barcode:</b> Scan any thread spool. A known barcode adds it to your stash instantly; an unknown one lets you identify it by camera, then saves that barcode for everyone.</p>

              {/* STASH */}
              <div style={{fontSize:12,fontWeight:800,color:"var(--sun-amber)",textTransform:"uppercase",letterSpacing:".6px",margin:"16px 0 8px"}}>Stash &amp; Shopping</div>
              <p><b>Stash:</b> Everything you own in one place — threads (free), machines (Basic), plus fabrics, rulers, AccuQuilt dies, presser feet, and accessories (Premium). Set inventory targets and deduct as you use supplies.</p>
              <p style={{marginTop:8}}><b>Shopping List:</b> Appears once it has items. Threads and fabrics you search for but don't own can be added with one tap, and you can add manual items like batting or backing fabric too.</p>

              {/* PROJECTS */}
              <div style={{fontSize:12,fontWeight:800,color:"var(--sun-amber)",textTransform:"uppercase",letterSpacing:".6px",margin:"16px 0 8px"}}>Projects</div>
              <p><b>Projects:</b> Create a project, build its required thread and fabric lists, track status, and keep a journal and notes as you stitch. <span className="muted">(Free includes 1 project · Basic includes 5 · Premium is unlimited.)</span></p>

              {/* MORE */}
              <div style={{fontSize:12,fontWeight:800,color:"var(--sun-amber)",textTransform:"uppercase",letterSpacing:".6px",margin:"16px 0 8px"}}>More</div>
              <p><b>Machine Library:</b> Browse the full reference library of 77 machines and tap + Add to track what you own; attach photos too. <span className="muted">(Basic feature.)</span></p>
              <p style={{marginTop:8}}><b>AccuQuilt / Feet / Rulers:</b> Browse the libraries and add items to your stash. <span className="muted">(Premium stash.)</span></p>
              <p style={{marginTop:8}}><b>Insurance Report:</b> Generate a printable report of your stash for insurance purposes, with optional purchase price and estimated value. <span className="muted">(Premium feature.)</span></p>
              <p style={{marginTop:8}}><b>Community Forum:</b> Share tips, ask questions, and post project reviews with other stitchers. <span className="muted">(Premium feature.)</span></p>
              <p style={{marginTop:8}}><b>Settings:</b> Set your default brand and preferred cross-reference brand, default inventory target, language, and barcode/weight display. CSV export of your full stash lives here too. <span className="muted">(CSV export is a Premium feature.)</span></p>

              {/* EXTRAS */}
              <div style={{fontSize:12,fontWeight:800,color:"var(--sun-amber)",textTransform:"uppercase",letterSpacing:".6px",margin:"16px 0 8px"}}>Just for fun</div>
              <p><b>🧵 Spool Quest:</b> A quick coffee-break game on your Home screen — rescue your quilt before the Bee deadline.</p>

              <p className="muted" style={{fontSize:12,marginTop:16}}>
                Beta build {APP_VERSION} — thanks for testing! Spot a bug or have an idea? Let us know.
              </p>
            </div>
          )}

          {moreSubTab==="profile"&&(
            <ProfilePage supabase={supabase} user={user} onBack={()=>setMoreSubTab("settings")}/>
          )}

          {moreSubTab==="settings"&&(
            <div className="card">
              <h2>{t("settings_title",lang)}</h2>
              {/* User info + sign out */}
              {user?(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 14px",background:"var(--teal-pale)",borderRadius:"var(--r-sm)",
                  border:"1.5px solid var(--border-teal)",marginBottom:14}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"var(--teal)"}}>
                      {user.user_metadata?.display_name||user.email}
                    </div>
                    <div className="muted" style={{fontSize:11}}>{user.email}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn" style={{fontSize:11,padding:"5px 10px"}}
                      onClick={()=>setMoreSubTab("profile")}>
                      ✎ Profile
                    </button>
                    <button className="btn"
                      style={{fontSize:11,padding:"5px 10px",color:"#C0392B",borderColor:"#C0392B"}}
                      onClick={async()=>{
                        // Sign out from Supabase
                        await supabase.auth.signOut({ scope: 'global' });
                        // Nuclear option — clear all localStorage
                        localStorage.clear();
                        sessionStorage.clear();
                        // Hard redirect to force fresh load
                        window.location.replace(window.location.origin);
                      }}>
                      Sign Out
                    </button>
                  </div>
                </div>
              ):(
                <div style={{padding:"10px 14px",background:"var(--sun-pale)",borderRadius:"var(--r-sm)",
                  border:"1.5px solid var(--border-sun)",marginBottom:14}}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--teal)",marginBottom:4}}>
                    Browsing as Guest
                  </div>
                  <p className="muted" style={{fontSize:12,marginBottom:8}}>
                    Sign in to save your stash, projects, and settings.
                  </p>
                  <button className="btn active" style={{width:"100%",fontSize:12}}
                    onClick={()=>setGuestMode(false)}>
                    Sign In / Create Account
                  </button>
                </div>
              )}
              <label className="check"><input type="checkbox" checked={settings.showBarcodes} onChange={e=>setSettings({...settings,showBarcodes:e.target.checked})}/> {t("settings_show_barcodes",lang)}</label>
              <label className="check"><input type="checkbox" checked={settings.showWeights} onChange={e=>setSettings({...settings,showWeights:e.target.checked})}/> {t("settings_show_weights",lang)}</label>
              <label className="check"><input type="checkbox" checked={settings.autoAddZeroInventoryToShoppingList} onChange={e=>setSettings({...settings,autoAddZeroInventoryToShoppingList:e.target.checked})}/> {t("settings_auto_shop",lang)}</label>
              <label className="check">
                <input type="checkbox" checked={settings.showValuesInReports||false}
                  onChange={e=>setSettings({...settings,showValuesInReports:e.target.checked})}/>
                Show item values in insurance reports
                <span className="muted" style={{display:"block",fontSize:11,marginTop:2,marginLeft:22}}>
                  Enables purchase price &amp; estimated value fields on insurance printouts.
                </span>
              </label>
              <label>Default Inventory Target
                <input type="number" min="0" className="input" style={{maxWidth:120}}
                  value={settings.defaultInventoryTarget??0}
                  onChange={e=>setSettings({...settings,defaultInventoryTarget:Math.max(0,parseInt(e.target.value)||0)})}/>
                <span className="muted" style={{fontSize:12,marginTop:-8,display:"block"}}>New threads added to your stash start with this target. Set to 0 for no target. You can adjust each thread individually in your stash.</span>
              </label>
              <label>Default Thread Brand
                <select className="input" value={settings.defaultBrand||"Isacord"} onChange={e=>{setSettings({...settings,defaultBrand:e.target.value});setMatchBrand(e.target.value);}}>
                  {threadBrands.map(([label])=><option key={label}>{label}</option>)}
                </select>
                <span className="muted" style={{fontSize:12,marginTop:-8,display:"block"}}>Pre-selected when you open the Match tab.</span>
              </label>
              <label>Preferred Cross-Reference Brand
                <select className="input" value={settings.crossRefBrand||""} onChange={e=>setSettings({...settings,crossRefBrand:e.target.value})}>
                  <option value="">— None (choose per card) —</option>
                  {threadBrands.map(([label])=><option key={label}>{label}</option>)}
                </select>
                <span className="muted" style={{fontSize:12,marginTop:-8,display:"block"}}>Auto-show equivalent in this brand on every match card. You can still change it per card.</span>
              </label>
              <label>{t("settings_language",lang)}
                <select className="input" value={lang} onChange={e=>setLang(e.target.value)}>
                  {LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
                <span className="muted" style={{fontSize:12,marginTop:-8,display:"block"}}>{t("settings_language_note",lang)}</span>
              </label>
              <div className="list-box">
                <div><b>{t("settings_app_version",lang)}:</b> {syncMeta.appVersion}</div>
                <div><b>{t("settings_lib_version",lang)}:</b> {syncMeta.libraryVersion}</div>
                <div><b>Remote:</b> {syncMeta.remoteLibraryVersion}</div>
                <div><b>{t("settings_last_synced",lang)}:</b> {syncMeta.lastSynced}</div>
                <div><b>{t("settings_status",lang)}:</b> {syncMeta.status}</div>
                {supabase&&<div>{t("settings_connected",lang)}</div>}
                {supaAllThreads.length>0&&<div><b>Thread DB:</b> {supaAllThreads.length} colors across all brands ✓</div>}
              </div>
              <div className="button-row">
                <button className="btn" onClick={checkForUpdates}>{t("settings_check_updates",lang)}</button>
                <button className="btn active" onClick={runAutoSync}>{t("settings_sync",lang)}</button>
              </div>

              {/* ── Export ── */}
              <div className="export-section">
                <div className="export-title">⬇ Export Your Stash</div>
                <p className="muted" style={{fontSize:12,marginBottom:10}}>
                  Downloads a .csv file with all your threads, rulers, machines, AccuQuilt dies, presser feet, and accessories. Open in Excel, Google Sheets, or Numbers.
                </p>
                {isPremium ? (
                  <button className="btn active" style={{width:"100%"}} onClick={exportStash}>
                    ⬇ Export Stash as CSV
                  </button>
                ) : (
                  <>
                    <button className="btn" style={{width:"100%",opacity:0.55,cursor:"not-allowed"}} disabled
                      title="Premium feature">
                      ⬇ Export Stash as CSV 🔒
                    </button>
                    <p className="muted" style={{fontSize:12,marginTop:8}}>
                      CSV export is a Premium feature. Upgrade to download your full stash.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showGame && <SpoolQuest onClose={()=>setShowGame(false)} />}
    </div>
  );
}
