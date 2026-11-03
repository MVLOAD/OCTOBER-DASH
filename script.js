/* ═══════════════════════════════════════════════════════════════
   MVIKAS DASHBOARD — Refined Dark Theme
   ═══════════════════════════════════════════════════════════════ */

// Palette — dark base + subtle orange
const C = {
  orange: '#f58220',
  orangeDim: '#d96d10',
  bg: '#0a0a0a',
  s1: '#141414',
  s2: '#1a1a1a',
  s3: '#202020',
  s4: '#262626',
  border: '#2a2a2a',
  divider: '#3a3a3a',
  text: '#f5f5f5',
  text2: '#b8b8b8',
  text3: '#8b8b8b',
  text4: '#5a5a5a',
  grid: '#252525'
};
const orangeA = (a) => `rgba(245,130,32,${a})`;

// DOM helper — defined up top, before anything that might throw, so the rest of the
// dashboard (search/filter, tables, KPIs) still works even if Chart.js failed to load
// (blocked CDN, offline, ad-blocker, restrictive CSP, etc).
const $ = id => document.getElementById(id);

// Safe Chart.js wrapper — never throws, so a missing/blocked Chart.js library can't
// take down unrelated code that happens to run in the same function (e.g. renderDelayPanel
// also updates KPI text nodes after drawing its charts).
function safeChart(ctx, config) {
  if (typeof Chart === 'undefined') { console.warn('Chart.js not loaded — skipping chart render'); return null; }
  if (!ctx) return null;
  try { return new Chart(ctx, config); }
  catch (e) { console.error('Chart render failed:', e); return null; }
}

// Chart defaults — Dark theme (guarded: only runs if Chart.js actually loaded)
if (typeof Chart !== 'undefined') {
  const CD = Chart.defaults;
  CD.color = C.text3;
  CD.font.family = 'Inter, -apple-system, system-ui, sans-serif';
  CD.font.size = 11;
  CD.plugins.tooltip.backgroundColor = C.s3;
  CD.plugins.tooltip.borderColor = C.border;
  CD.plugins.tooltip.borderWidth = 1;
  CD.plugins.tooltip.padding = 12;
  CD.plugins.tooltip.cornerRadius = 8;
  CD.plugins.tooltip.titleColor = C.orange;
  CD.plugins.tooltip.titleFont = { size: 11, weight: '700' };
  CD.plugins.tooltip.bodyColor = C.text;
  CD.plugins.tooltip.bodyFont = { size: 12, weight: '500' };
  CD.plugins.tooltip.displayColors = false;
  CD.scale.grid.color = C.grid;
  CD.scale.grid.drawBorder = false;
  CD.scale.ticks.color = C.text3;
}

// Counter Animation — respects data-decimals so fractional targets (tonnage-in-thousands,
// revenue-in-lakhs) animate to their real precision instead of being rounded to an integer.
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const t = +el.dataset.target, dec = +(el.dataset.decimals || 0), dur = 1800, st = performance.now();
    (function tick(now) {
      const p = Math.min((now - st) / dur, 1);
      const v = t * (1 - Math.pow(1 - p, 3));
      el.textContent = dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
    })(st);
  });
}

// Tabs
function switchTab(id, btn) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
}
window.switchTab = switchTab;

// Client Data — sourced from MVLOAD 20_09_26 - Daily Tonnage ("Tonnage_of_September_Month" target/personnel sheet
// cross-referenced with "Total_Tonnage_this_month" for achieved kg).
// activeDays=20 (working days elapsed through report date Sep 20, 2026).
const clients = [
  { name: "Carrier Refrigeration", person: "Sangeet Dhasmana", target: 255775.58, achieved: 202029.54, activeDays: 20 },
  { name: "Carrier - CTD", person: "Deepak Sharma", target: 72780.2, achieved: 51814.77, activeDays: 20 },
  { name: "Mitras Technocrafts Pvt Ltd-HR", person: "Deepak Sharma", target: 3736.92, achieved: 100.0, activeDays: 20 },
  { name: "Paramount Surgimed Ltd", person: "Deepak Sharma", target: 11061.95, achieved: 0.0, activeDays: 20 },
  { name: "Haier CCR", person: "Deepak Sharma", target: 46136.1, achieved: 19934.79, activeDays: 20 },
  { name: "Bombax", person: "Sangeet Dhasmana", target: 71275.84, achieved: 50559.09, activeDays: 20 },
  { name: "Kumar Services", person: "Deepak Sharma", target: 14464.8, achieved: 10716.6, activeDays: 20 },
  { name: "Edusoft Healthcare Ltd", person: "Deepak Sharma", target: 5000.0, achieved: 0.0, activeDays: 20 },
  { name: "Oneric Appliances", person: "Deepak Sharma", target: 31036.62, achieved: 13364.98, activeDays: 20 },
  { name: "Vaidrishi Laboratories", person: "Sangeet Dhasmana", target: 2032.52, achieved: 1653.97, activeDays: 20 },
  { name: "Sukuga", person: "Deepak Sharma", target: 10838.15, achieved: 6884.19, activeDays: 20 },
  { name: "Cosmos Pumps Pvt. Ltd.", person: "Deepak Sharma", target: 8291.87, achieved: 3163.8, activeDays: 20 },
  { name: "Loom Solar", person: "Deepak Sharma", target: 13611.62, achieved: 6470.0, activeDays: 20 },
  { name: "MS Medicals Pvt Ltd", person: "Sangeet Dhasmana", target: 3787.88, achieved: 5962.33, activeDays: 20 },
  { name: "Epson India", person: "Sangeet Dhasmana", target: 2770.08, achieved: 100.0, activeDays: 20 },
  { name: "Conficore", person: "Sangeet Dhasmana", target: 2836.07, achieved: 119.12, activeDays: 20 },
  { name: "HERCULES NUTRA", person: "Sangeet Dhasmana", target: 10000.0, achieved: 151.95, activeDays: 20, isNew: true },
  { name: "MEDGLOBE THERAPEUTICS", person: "Sangeet Dhasmana", target: 10438.41, achieved: 0.0, activeDays: 20, isNew: true },
  { name: "Abhishek Tomar", person: "Deepak Sharma", target: 5000.0, achieved: 398.86, activeDays: 20, isNew: true },
  { name: "Khusbhu Enterprises", person: "Deepak Sharma", target: 2461.84, achieved: 461.65, activeDays: 20, isNew: true },
];

clients.forEach(c => {
  c.pct = c.target > 0 ? Math.round(c.achieved / c.target * 100) : (c.achieved > 0 ? 999 : 0);
  c.avgDay = c.activeDays > 0 ? Math.round(c.achieved / c.activeDays) : 0;
  c.remaining = Math.max((c.target || 0) - c.achieved, 0);
  c.daysNeeded = c.avgDay > 0 && c.remaining > 0 ? +(c.remaining / c.avgDay).toFixed(1) : (c.remaining === 0 ? 0 : 999);
});

const pT = {
  "Carrier Refrigeration": {
    "first10": 71910.46,
    "mid10": 68872.71,
    "last10": 115445.77
  },
  "Carrier - CTD": {
    "first10": 24104.92,
    "mid10": 25642.05,
    "last10": 23215.18
  },
  "Mitras Technocrafts Pvt Ltd-HR": {
    "first10": 995.73,
    "mid10": 1356.28,
    "last10": 1375.57
  },
  "Paramount Surgimed Ltd": {
    "first10": 497.79,
    "mid10": 4395.37,
    "last10": 6168.79
  },
  "Haier CCR": {
    "first10": 22076.06,
    "mid10": 11943.7,
    "last10": 12001.0
  },
  "Bombax": {
    "first10": 23303.79,
    "mid10": 23668.16,
    "last10": 24125.7
  },
  "Kumar Services": {
    "first10": 3466.96,
    "mid10": 5246.92,
    "last10": 5714.76
  },
  "Edusoft Healthcare Ltd": {
    "first10": 4000.0,
    "mid10": 1000.0,
    "last10": 0.0
  },
  "Oneric Appliances": {
    "first10": 11256.39,
    "mid10": 8816.4,
    "last10": 10963.83
  },
  "Vaidrishi Laboratories": {
    "first10": 563.75,
    "mid10": 537.85,
    "last10": 936.0
  },
  "Sukuga": {
    "first10": 1813.85,
    "mid10": 3381.34,
    "last10": 5642.96
  },
  "Cosmos Pumps Pvt. Ltd.": {
    "first10": 3605.02,
    "mid10": 2114.12,
    "last10": 2552.0
  },
  "Loom Solar": {
    "first10": 3271.64,
    "mid10": 5941.65,
    "last10": 4398.33
  },
  "MS Medicals Pvt Ltd": {
    "first10": 409.35,
    "mid10": 704.36,
    "last10": 2674.17
  },
  "Epson India": {
    "first10": 891.56,
    "mid10": 1486.07,
    "last10": 392.45
  },
  "Conficore": {
    "first10": 2661.38,
    "mid10": 0.0,
    "last10": 174.69
  },
  "HERCULES NUTRA": {
    "first10": 0.0,
    "mid10": 2553.04,
    "last10": 7446.96
  },
  "MEDGLOBE THERAPEUTICS": {
    "first10": 0.0,
    "mid10": 3337.67,
    "last10": 7100.33
  },
  "Abhishek Tomar": {
    "first10": 1666.0,
    "mid10": 0.0,
    "last10": 0.0
  },
  "Khusbhu Enterprises": {
    "first10": 0.0,
    "mid10": 0.0,
    "last10": 2462.0
  }
};

const pA = {
  "Carrier Refrigeration": {
    "first10": 91342.67,
    "mid10": 110685.26,
    "last10": null
  },
  "Carrier - CTD": {
    "first10": 33362.42,
    "mid10": 18452.35,
    "last10": null
  },
  "Mitras Technocrafts Pvt Ltd-HR": {
    "first10": 0.0,
    "mid10": 100.0,
    "last10": null
  },
  "Paramount Surgimed Ltd": {
    "first10": null,
    "mid10": null,
    "last10": null
  },
  "Haier CCR": {
    "first10": 13825.05,
    "mid10": 6109.74,
    "last10": null
  },
  "Bombax": {
    "first10": 25525.37,
    "mid10": 25033.72,
    "last10": null
  },
  "Kumar Services": {
    "first10": 7072.84,
    "mid10": 3643.76,
    "last10": null
  },
  "Edusoft Healthcare Ltd": {
    "first10": null,
    "mid10": null,
    "last10": null
  },
  "Oneric Appliances": {
    "first10": 8603.87,
    "mid10": 4760.15,
    "last10": null
  },
  "Vaidrishi Laboratories": {
    "first10": 1392.17,
    "mid10": 261.8,
    "last10": null
  },
  "Sukuga": {
    "first10": 4905.35,
    "mid10": 1978.84,
    "last10": null
  },
  "Cosmos Pumps Pvt. Ltd.": {
    "first10": 1663.82,
    "mid10": 1499.0,
    "last10": null
  },
  "Loom Solar": {
    "first10": 4270.0,
    "mid10": 2200.0,
    "last10": null
  },
  "MS Medicals Pvt Ltd": {
    "first10": 3520.69,
    "mid10": 2441.64,
    "last10": null
  },
  "Epson India": {
    "first10": 50.0,
    "mid10": 50.0,
    "last10": null
  },
  "Conficore": {
    "first10": null,
    "mid10": 119.12,
    "last10": null
  },
  "HERCULES NUTRA": {
    "first10": 151.95,
    "mid10": null,
    "last10": null
  },
  "MEDGLOBE THERAPEUTICS": {
    "first10": null,
    "mid10": null,
    "last10": null
  },
  "Abhishek Tomar": {
    "first10": 398.86,
    "mid10": null,
    "last10": null
  },
  "Khusbhu Enterprises": {
    "first10": 150.1,
    "mid10": 311.55,
    "last10": null
  }
};

clients.forEach(c => {
  c.periods = {
    first10: { target: pT[c.name]?.first10 || null, achieved: pA[c.name]?.first10 || null },
    mid10: { target: pT[c.name]?.mid10 || null, achieved: pA[c.name]?.mid10 || null },
    last10: { target: pT[c.name]?.last10 || null, achieved: pA[c.name]?.last10 || null }
  };
});

const eddData = [
  {
    "name": "Carrier Refrigeration",
    "count": 31
  },
  {
    "name": "Bombax",
    "count": 25
  },
  {
    "name": "Haier CCR",
    "count": 5
  },
  {
    "name": "MS Medicals Pvt Ltd",
    "count": 4
  },
  {
    "name": "Kumar Services",
    "count": 4
  },
  {
    "name": "Carrier - CTD",
    "count": 4
  },
  {
    "name": "Oneric Appliances",
    "count": 3
  },
  {
    "name": "MVIKAS Tech",
    "count": 2
  },
  {
    "name": "Khusbhu Enterprises",
    "count": 1
  },
  {
    "name": "Cosmos Pumps Pvt. Ltd.",
    "count": 1
  },
  {
    "name": "Sukuga",
    "count": 1
  }
];
const eddTotal = eddData.reduce((a, b) => a + b.count, 0);

const eddDetail = [
  { id: "MVS/26-27/10006", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "05 Aug 2026", reason: "Hold by consignee", type: "Customer" },
  { id: "MVS/26-27/10660", name: "Bombax", transporter: "EKART", edd: "12 Aug 2026", reason: "Delayed Operational Backlog", type: "Vendor" },
  { id: "MVS/26-27/11053", name: "Bombax", transporter: "EKART", edd: "15 Aug 2026", reason: "Delayed Operational Backlog", type: "Vendor" },
  { id: "MVS/26-27/11775", name: "Bombax", transporter: "EKART", edd: "26 Aug 2026", reason: "Delayed Operational Backlog", type: "Vendor" },
  { id: "MVS/26-27/11860", name: "Bombax", transporter: "EKART", edd: "27 Aug 2026", reason: "Delayed Operational Backlog", type: "Vendor" },
  { id: "MVS/26-27/12291", name: "Carrier Refrigeration", transporter: "EKART", edd: "27 Aug 2026", reason: "1 box short received at destination branch", type: "Vendor" },
  { id: "MVS/26-27/12429", name: "Bombax", transporter: "DP WORLD", edd: "05 Sep 2026", reason: "Consignee want open delivery", type: "Customer" },
  { id: "MVS/26-27/12496", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "31 Aug 2026", reason: "On Hold- RTO documents pending", type: "Vendor" },
  { id: "MVS/26-27/12722", name: "Bombax", transporter: "EKART", edd: "04 Sep 2026", reason: "Alt Contact req", type: "Vendor" },
  { id: "MVS/26-27/13171", name: "Bombax", transporter: "DP WORLD", edd: "13 Sep 2026", reason: "The consignee has permanently closed the establishment", type: "Customer" },
  { id: "MVS/26-27/13190", name: "Bombax", transporter: "EKART", edd: "13 Sep 2026", reason: "Connection delayed from Bhiwandi hub", type: "Vendor" },
  { id: "MVS/26-27/13236", name: "Carrier Refrigeration", transporter: "EKART", edd: "03 Sep 2026", reason: "Shipment has cancelled, Need to be RTO", type: "Vendor" },
  { id: "MVS/26-27/13473", name: "Bombax", transporter: "EKART", edd: "10 Sep 2026", reason: "Delayed Operational Backlog", type: "Vendor" },
  { id: "MVS/26-27/13531", name: "Khusbhu Enterprises", transporter: "Unassigned", edd: "11 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/13598", name: "Bombax", transporter: "EKART", edd: "11 Sep 2026", reason: "Customer Refused", type: "Customer" },
  { id: "MVS/26-27/13599", name: "Bombax", transporter: "EKART", edd: "08 Sep 2026", reason: "Hold by consignee due to space issue", type: "Customer" },
  { id: "MVS/26-27/13645", name: "Cosmos Pumps Pvt. Ltd.", transporter: "EKART", edd: "14 Sep 2026", reason: "Customer wants Delivery on Monday due to Vishwakarma Puja", type: "Customer" },
  { id: "MVS/26-27/13655", name: "Carrier - CTD", transporter: "DP WORLD", edd: "10 Sep 2026", reason: "Customer wants Delivery at Different Location", type: "Customer" },
  { id: "MVS/26-27/13747", name: "Bombax", transporter: "DP WORLD", edd: "11 Sep 2026", reason: "Request for delivery at alternate address / Contact req", type: "Customer" },
  { id: "MVS/26-27/13775", name: "MS Medicals Pvt Ltd", transporter: "DP WORLD", edd: "15 Sep 2026", reason: "Shipment Not connect due to Less Load from patna", type: "Vendor" },
  { id: "MVS/26-27/13826", name: "Carrier Refrigeration", transporter: "EKART", edd: "12 Sep 2026", reason: "Separate vehicle required", type: "Vendor" },
  { id: "MVS/26-27/13856", name: "Haier CCR", transporter: "DP WORLD", edd: "11 Sep 2026", reason: "Customer want delivery on another day", type: "Customer" },
  { id: "MVS/26-27/13933", name: "Bombax", transporter: "EKART", edd: "15 Sep 2026", reason: "Contact req", type: "Vendor" },
  { id: "MVS/26-27/13934", name: "Bombax", transporter: "EKART", edd: "17 Sep 2026", reason: "Customer Refused", type: "Customer" },
  { id: "MVS/26-27/13935", name: "Bombax", transporter: "EKART", edd: "17 Sep 2026", reason: "Customer Refused", type: "Customer" },
  { id: "MVS/26-27/13940", name: "Bombax", transporter: "EKART", edd: "13 Sep 2026", reason: "Connection delayed from Bhiwandi hub", type: "Vendor" },
  { id: "MVS/26-27/25285", name: "MVIKAS Tech", transporter: "Unassigned", edd: "12 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25294", name: "MS Medicals Pvt Ltd", transporter: "DP WORLD", edd: "18 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25381", name: "Carrier Refrigeration", transporter: "EKART", edd: "15 Sep 2026", reason: "Box untraceable", type: "Vendor" },
  { id: "MVS/26-27/25402", name: "Bombax", transporter: "EKART", edd: "17 Sep 2026", reason: "Shipment Mis Routed", type: "Vendor" },
  { id: "MVS/26-27/25431", name: "MS Medicals Pvt Ltd", transporter: "DP WORLD", edd: "13 Sep 2026", reason: "On Hold by Vendor - DG Goods", type: "Vendor" },
  { id: "MVS/26-27/25436", name: "Haier CCR", transporter: "EKART", edd: "15 Sep 2026", reason: "Signing Authority not available today", type: "Customer" },
  { id: "MVS/26-27/25438", name: "Haier CCR", transporter: "EKART", edd: "15 Sep 2026", reason: "Signing Authority not available today", type: "Customer" },
  { id: "MVS/26-27/25456", name: "Carrier Refrigeration", transporter: "DP WORLD", edd: "13 Sep 2026", reason: "Hold by consignee till 21st sep", type: "Customer" },
  { id: "MVS/26-27/25485", name: "Bombax", transporter: "DP WORLD", edd: "19 Sep 2026", reason: "Mall Delivery timing Restriction", type: "Customer" },
  { id: "MVS/26-27/25498", name: "MVIKAS Tech", transporter: "Unassigned", edd: "14 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25544", name: "Carrier Refrigeration", transporter: "EKART", edd: "14 Sep 2026", reason: "Documentation Issue", type: "Vendor" },
  { id: "MVS/26-27/25545", name: "Carrier Refrigeration", transporter: "EKART", edd: "14 Sep 2026", reason: "Connection delayed from pataudi location", type: "Vendor" },
  { id: "MVS/26-27/25557", name: "Bombax", transporter: "EKART", edd: "16 Sep 2026", reason: "Hold by consignee due to space issue", type: "Customer" },
  { id: "MVS/26-27/25563", name: "Bombax", transporter: "EKART", edd: "16 Sep 2026", reason: "Hold by consignee due to space issue", type: "Customer" },
  { id: "MVS/26-27/25587", name: "Carrier - CTD", transporter: "DP WORLD", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25598", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "17 Sep 2026", reason: "Hold by Consignee", type: "Customer" },
  { id: "MVS/26-27/25606", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "14 Sep 2026", reason: "Hold by Consignee", type: "Customer" },
  { id: "MVS/26-27/25615", name: "Carrier Refrigeration", transporter: "EKART", edd: "18 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25621", name: "Carrier Refrigeration", transporter: "EKART", edd: "16 Sep 2026", reason: "Connection Delayed", type: "Vendor" },
  { id: "MVS/26-27/25646", name: "Bombax", transporter: "DP WORLD", edd: "16 Sep 2026", reason: "Not traceable at GGN Branch", type: "Vendor" },
  { id: "MVS/26-27/25700", name: "Bombax", transporter: "DP WORLD", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25711", name: "Bombax", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25717", name: "Oneric Appliances", transporter: "DP WORLD", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25769", name: "Carrier - CTD", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25779", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "19 Sep 2026", reason: "Required Alternate No.", type: "Customer" },
  { id: "MVS/26-27/25797", name: "Carrier Refrigeration", transporter: "EKART", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25809", name: "Carrier Refrigeration", transporter: "EKART", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25813", name: "Carrier Refrigeration", transporter: "EKART", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25814", name: "Carrier Refrigeration", transporter: "EKART", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25815", name: "Carrier Refrigeration", transporter: "EKART", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25839", name: "Carrier Refrigeration", transporter: "DP WORLD", edd: "18 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25849", name: "Bombax", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25857", name: "Bombax", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25907", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "19 Sep 2026", reason: "Unloading issue at consignee premised", type: "Customer" },
  { id: "MVS/26-27/25917", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25919", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25922", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25926", name: "Carrier Refrigeration", transporter: "EKART", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25934", name: "Carrier Refrigeration", transporter: "OM", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25942", name: "Carrier Refrigeration", transporter: "DP WORLD", edd: "19 Sep 2026", reason: "Consignee delivery schedule for 21-Sep", type: "Customer" },
  { id: "MVS/26-27/25964", name: "Carrier - CTD", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25969", name: "Kumar Services", transporter: "LAST MILE", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25970", name: "Kumar Services", transporter: "LAST MILE", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25971", name: "Kumar Services", transporter: "LAST MILE", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25972", name: "Kumar Services", transporter: "LAST MILE", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/25990", name: "Oneric Appliances", transporter: "GATI", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26043", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26089", name: "Carrier Refrigeration", transporter: "EKART", edd: "19 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26104", name: "Haier CCR", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Reached delay at Last mile connection", type: "Vendor" },
  { id: "MVS/26-27/26125", name: "MS Medicals Pvt Ltd", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26139", name: "Haier CCR", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26162", name: "Sukuga", transporter: "DP WORLD", edd: "18 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26168", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26190", name: "Carrier Refrigeration", transporter: "XP INDIA", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
  { id: "MVS/26-27/26274", name: "Oneric Appliances", transporter: "DP WORLD", edd: "20 Sep 2026", reason: "Intransit delay", type: "Vendor" },
];

const openData = [
  {
    "name": "Carrier Refrigeration",
    "count": 211
  },
  {
    "name": "Bombax",
    "count": 166
  },
  {
    "name": "Carrier - CTD",
    "count": 76
  },
  {
    "name": "Haier CCR",
    "count": 17
  },
  {
    "name": "Oneric Appliances",
    "count": 15
  },
  {
    "name": "Sukuga",
    "count": 12
  },
  {
    "name": "Kumar Services",
    "count": 11
  },
  {
    "name": "MS Medicals Pvt Ltd",
    "count": 5
  },
  {
    "name": "Loom Solar",
    "count": 5
  },
  {
    "name": "Cosmos Pumps Pvt. Ltd.",
    "count": 4
  },
  {
    "name": "MITRAS",
    "count": 2
  },
  {
    "name": "Khusbhu Enterprises",
    "count": 1
  }
];
const openTotal = openData.reduce((a, b) => a + b.count, 0);

const dueData = [
  {
    "name": "Carrier Refrigeration",
    "count": 33
  },
  {
    "name": "Carrier - CTD",
    "count": 7
  },
  {
    "name": "Haier CCR",
    "count": 5
  },
  {
    "name": "Bombax",
    "count": 4
  },
  {
    "name": "Sukuga",
    "count": 3
  },
  {
    "name": "MITRAS",
    "count": 2
  },
  {
    "name": "Cosmos Pumps Pvt. Ltd.",
    "count": 1
  },
  {
    "name": "Loom Solar",
    "count": 1
  },
  {
    "name": "MS Medicals Pvt Ltd",
    "count": 1
  }
];
const dueTotal = dueData.reduce((a, b) => a + b.count, 0);

// Sunday report (Sep 20, 2026): No dispatches / bookings logged on Sunday
const bookedData = [{ name: "Sunday (No Dispatches)", count: 0 }];
const bookedTotal = 0;

const dailyTonnageData = [{ name: "Sunday (No Dispatches)", kg: 0 }];
const dailyTotal = 0;
const monthlyTotal = clients.reduce((a, c) => a + c.achieved, 0);
// Sep 2026: 20 active days elapsed through report date Sep 20, 2026
const activeDays = 20;
const dailyAverage = monthlyTotal / activeDays;

const RATES = {
  'Bombax': 14.03, 'Carrier Refrigeration': 12.12, 'Carrier CTD': 13.74, 'Carrier - CTD': 13.74, 'Conficore': 17.63,
  'Cosmos Pumps Pvt Ltd': 12.06, 'Cosmos Pumps Pvt. Ltd.': 12.06, 'Edusoft Healthcare Ltd': 13.77,
  'Haier CCR': 8.67, 'Kumar Services': 10.37, 'Epson': 7.22, 'Epson India': 7.22, 'Paramount Surgimed Ltd': 9.04,
  'Loom Solar Pvt Ltd': 22.04, 'Loom Solar': 22.04, 'Medical Science': 18.48, 'MS Medicals Pvt Ltd': 18.48,
  'Mitras Technocrafts Pvt Ltd-HR': 13.38, 'Oneiric Appliances Pvt Ltd': 16.11, 'Oneric Appliances': 16.11,
  'Sukuga Technologies Pvt Ltd': 13.84, 'Sukuga': 13.84, 'Vaidrishi Laboratories Pvt Ltd': 14.76, 'Vaidrishi Laboratories': 14.76,
  'Khusbhu Enterprises': 20.31, 'MEDGLOBE THERAPEUTICS': 9.58, 'HERCULES NUTRA': 10, 'Abhishek Tomar': 10
};
const DR = 10;
const rate = n => RATES[n] || DR;
const fR = v => '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fK = v => v.toLocaleString('en-IN', { maximumFractionDigits: 0 });

// Fixed monthly revenue target (₹), derived from September client targets × rates (₹73.89 Lakhs).
const FIXED_TARGET_MONEY = 7388850;
const totalTargetMoney = FIXED_TARGET_MONEY;

// P&L Data extracted from Total_Tonnage_this_month sheet
const pnlData = [
  { name: "Carrier Refrigeration", tonnage: 353625.28, sales: 4701041.91, purchase: 3518657.68, profit: 1182384.23 },
  { name: "Carrier - CTD", tonnage: 72634.57, sales: 1151834.54, purchase: 983957.60, profit: 167876.94 },
  { name: "Haier CCR", tonnage: 33114.57, sales: 527681.05, purchase: 334640.92, profit: 193040.13 },
  { name: "Bombax", tonnage: 75026.01, sales: 998171.38, purchase: 857436.81, profit: 140734.57 },
  { name: "Kumar Services", tonnage: 16910.10, sales: 159002.72, purchase: 123639.82, profit: 35362.90 },
  { name: "Oneric Appliances", tonnage: 16455.95, sales: 204964.16, purchase: 177977.33, profit: 26986.83 },
  { name: "Vaidrishi Laboratories", tonnage: 1997.75, sales: 24878.93, purchase: 14534.31, profit: 10344.62 },
  { name: "Sukuga", tonnage: 13375.94, sales: 215437.64, purchase: 118787.74, profit: 96649.90 },
  { name: "Cosmos Pumps Pvt. Ltd.", tonnage: 8589.33, sales: 113181.30, purchase: 113735.04, profit: -553.74 },
  { name: "Loom Solar", tonnage: 6530.00, sales: 109774.78, purchase: 77313.44, profit: 32461.34 },
  { name: "MS Medicals Pvt Ltd", tonnage: 6368.33, sales: 86612.84, purchase: 63172.59, profit: 23440.25 },
  { name: "Epson India", tonnage: 39.98, sales: 700.00, purchase: 575.38, profit: 124.62 },
  { name: "Conficore", tonnage: 400.14, sales: 4314.14, purchase: 3821.85, profit: 492.29 },
  { name: "HERCULES NUTRA", tonnage: 467.96, sales: 4169.33, purchase: 3731.15, profit: 438.18 },
  { name: "MEDGLOBE THERAPEUTICS", tonnage: 469.96, sales: 3451.74, purchase: 3143.26, profit: 308.48 },
  { name: "Abhishek Tomar", tonnage: 80.00, sales: 4958.86, purchase: 4113.19, profit: 845.67 },
  { name: "Khusbhu Enterprises", tonnage: 224.90, sales: 6358.41, purchase: 5865.11, profit: 493.30 },
  { name: "MITRAS", tonnage: 222.50, sales: 3484.26, purchase: 2065.63, profit: 1418.63 },
  { name: "Sunrise Sports India Pvt Ltd", tonnage: 15015.71, sales: 322110.66, purchase: 175271.55, profit: 146839.11 }
];
const totalSalesMoney = pnlData.reduce((s, c) => s + c.sales, 0);
const totalPurchaseMoney = pnlData.reduce((s, c) => s + c.purchase, 0);
const DAYS = 30;
const calendarDays = 20;
const dailyMoneyRate = totalSalesMoney / calendarDays;
const predictedSales = dailyMoneyRate * DAYS;
const predictedPct = totalTargetMoney > 0 ? (predictedSales / totalTargetMoney * 100) : null;

// Populate KPIs
$('kpi-open').textContent = openTotal;
$('kpi-edd').textContent = eddTotal;
$('kpi-edd-pct').textContent = Math.round(eddTotal / openTotal * 100) + '% of open';
$('kpi-due').textContent = dueTotal;
$('kpi-booked').textContent = bookedTotal;
$('kpi-daily-ton').innerHTML = dailyTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' <span style="font-size:.75rem;font-weight:500;color:' + C.text3 + '">kg</span>';
$('kpi-month-ton').innerHTML = monthlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' <span style="font-size:.75rem;font-weight:500;color:' + C.text3 + '">kg</span>';
$('kpi-daily-avg').innerHTML = dailyAverage.toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' <span style="font-size:.75rem;font-weight:500;color:' + C.text3 + '">kg/day</span>';
$('kpi-target-money').textContent = fR(totalTargetMoney);
$('kpi-sales-money').textContent = fR(totalSalesMoney);
if($('kpi-purchase-money')) $('kpi-purchase-money').textContent = fR(totalPurchaseMoney);

['strip-edd', 'dl-edd'].forEach(id => { const e = $(id); if (e) e.textContent = eddTotal });
['strip-transit', 'dl-transit'].forEach(id => { const e = $(id); if (e) e.textContent = openTotal - eddTotal });
['strip-due', 'dl-due'].forEach(id => { const e = $(id); if (e) e.textContent = dueTotal });
['strip-booked', 'dl-booked'].forEach(id => { const e = $(id); if (e) e.textContent = bookedTotal });
const eb = $('tab-edd-badge'); if (eb) eb.textContent = eddTotal;

// Open Table
const otb = $('open-table-body');
if (otb) openData.forEach((d, i) => {
  const ec = (eddData.find(e => e.name === d.name) || {}).count || 0;
  const dc = (dueData.find(e => e.name === d.name) || {}).count || 0;
  const pct = Math.round(ec / d.count * 100);
  const risk = pct >= 70 ? ['Critical', 'delayed'] : pct >= 40 ? ['High', 'delayed'] : pct >= 20 ? ['Medium', 'open'] : ['Low', 'due'];
  otb.innerHTML += `<tr><td style="color:${C.text4};font-size:.78rem">${String(i + 1).padStart(2, '0')}</td><td><strong>${d.name}</strong></td><td>${d.count}</td><td style="color:${C.orange};font-weight:600">${ec}</td><td style="color:${C.text2};font-weight:500">${dc}</td><td style="color:${pct >= 50 ? C.orange : C.text2};font-weight:600">${pct}%</td><td><span class="badge ${risk[1]}">${risk[0]}</span></td></tr>`;
});

// Render P&L Table
const pnltb = $('pnl-table-body');
if (pnltb) {
  pnlData.forEach(d => {
    const margin = d.sales > 0 ? (d.profit / d.sales * 100) : 0;
    pnltb.innerHTML += `<tr>
      <td><strong>${d.name}</strong></td>
      <td style="text-align: right; color: ${C.text2}">${d.tonnage.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
      <td style="text-align: right; color: ${C.orange}">${d.sales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
      <td style="text-align: right; color: ${C.text3}">${d.purchase.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
      <td style="text-align: right; color: ${d.profit >= 0 ? '#4caf50' : '#f44336'}">${d.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
      <td style="text-align: right; color: ${margin >= 0 ? '#4caf50' : '#f44336'}">${margin.toFixed(1)}%</td>
    </tr>`;
  });
}

// EDD KPIs & Detail
function renderEddKpis(list) {
  if (!list || !list.length) return;
  const total = list.length;
  $('edd-total-count').textContent = total;
  const rc = {}, cc = {};
  list.forEach(item => {
    const r = item.reason || 'Intransit Delay';
    const c = item.transporter || 'Unassigned';
    rc[r] = (rc[r] || 0) + 1; cc[c] = (cc[c] || 0) + 1;
  });
  const sr = Object.entries(rc).sort((a, b) => b[1] - a[1]);
  const sc = Object.entries(cc).sort((a, b) => b[1] - a[1]);
  if (sr[0]) {
    $('edd-top-reason-name').textContent = sr[0][0];
    $('edd-top-reason-pct').textContent = Math.round(sr[0][1] / total * 100) + '% (' + sr[0][1] + ')';
  }
  if (sc[0]) {
    $('edd-worst-carrier').textContent = sc[0][0];
    $('edd-worst-carrier-count').textContent = sc[0][1] + ' delayed';
  }
  const bars = $('edd-reason-bars');
  if (bars) bars.innerHTML = sr.slice(0, 3).map(([r, c]) => {
    const p = Math.round(c / total * 100);
    return `<div class="reason-bar-item"><div class="reason-bar-header"><span class="reason-label" title="${r}">${r}</span><span class="reason-val">${p}% (${c})</span></div><div class="reason-progress-bg"><div class="reason-progress-fill" style="width:${p}%"></div></div></div>`;
  }).join('');
}

function renderEddRows(rows) {
  const tbody = $('edd-detail-body'), cnt = $('edd-detail-count');
  if (!tbody) return;
  if (cnt) cnt.textContent = rows.length + ' of ' + eddDetail.length + ' orders';
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:${C.text3};padding:32px">No matching orders.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => {
    const typeBadge = r.type === 'Customer' ? `<span class="cv-chip cv-chip-customer">Customer</span>`
      : r.type === 'Vendor' ? `<span class="cv-chip cv-chip-vendor">Vendor</span>`
        : `<span class="cv-chip cv-chip-unclassified">—</span>`;
    return `<tr><td style="font-weight:600;font-size:.76rem;color:${C.orange}">${r.id}</td><td><strong>${r.name}</strong></td><td>${typeBadge}</td><td>${r.transporter || '—'}</td><td style="color:${C.text};font-weight:500">${r.edd || '—'}</td><td>${r.reason || `<span style="color:${C.text4};font-style:italic">Intransit Delay</span>`}</td></tr>`;
  }).join('');
  renderEddKpis(rows);
}

// Reads the search box + 3 dropdown filters and returns the matching eddDetail rows.
function filterEddRows() {
  const q = ($('edd-search')?.value || '').trim().toLowerCase();
  const type = $('edd-filter-type')?.value || '';
  const transporter = $('edd-filter-transporter')?.value || '';
  const reason = $('edd-filter-reason')?.value || '';
  return eddDetail.filter(r => {
    if (q) {
      const hay = (r.name + ' ' + r.id + ' ' + (r.transporter || '') + ' ' + (r.reason || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (type && r.type !== type) return false;
    if (transporter && (r.transporter || 'Unassigned') !== transporter) return false;
    if (reason && (r.reason || 'Unclassified / Intransit Delay') !== reason) return false;
    return true;
  });
}

function applyEddFilters() {
  renderEddRows(filterEddRows());
}
window.applyEddFilters = applyEddFilters;

function resetEddFilters() {
  const s = $('edd-search'), t = $('edd-filter-type'), tr = $('edd-filter-transporter'), r = $('edd-filter-reason');
  if (s) s.value = '';
  if (t) t.value = '';
  if (tr) tr.value = '';
  if (r) r.value = '';
  applyEddFilters();
}
window.resetEddFilters = resetEddFilters;

// Fills the three filter dropdowns from the actual data, so options never go stale.
function populateEddFilterOptions() {
  const typeSel = $('edd-filter-type'), transSel = $('edd-filter-transporter'), reasonSel = $('edd-filter-reason');
  const addOptions = (sel, values) => {
    if (!sel) return;
    values.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v.length > 55 ? v.slice(0, 52) + '…' : v;
      sel.appendChild(opt);
    });
  };
  const types = [...new Set(eddDetail.map(r => r.type).filter(Boolean))].sort();
  const transporters = [...new Set(eddDetail.map(r => r.transporter || 'Unassigned'))].sort();
  const reasons = [...new Set(eddDetail.map(r => r.reason || 'Unclassified / Intransit Delay'))].sort();
  addOptions(typeSel, types);
  addOptions(transSel, transporters);
  addOptions(reasonSel, reasons);
}

// Exports whatever is currently filtered/visible to a downloadable .xlsx workbook.
function exportEddToExcel() {
  if (typeof XLSX === 'undefined') { console.warn('XLSX library not loaded — cannot export'); return; }
  const rows = filterEddRows();
  const data = rows.map(r => ({
    'Order ID': r.id, 'Customer': r.name, 'Type': r.type || '',
    'Transporter': r.transporter || '', 'EDD': r.edd || '',
    'Delay Reason': r.reason || 'Intransit Delay'
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 18 }, { wch: 24 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 45 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'EDD Crossed');
  XLSX.writeFile(wb, 'MVIKAS_EDD_Crossed_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}
window.exportEddToExcel = exportEddToExcel;

function goToEddDetail() {
  const btn = $('tab-btn-edd');
  if (btn) switchTab('edd', btn);
  $('tab-edd')?.scrollIntoView({ behavior: 'smooth' });
}
window.goToEddDetail = goToEddDetail;

// Charts
const CF = { size: 11, weight: '500' };

safeChart($('statusDonut'), {
  type: 'doughnut',
  data: {
    labels: ['EDD Crossed', 'In Transit', 'Due Tomorrow', 'Booked'],
    datasets: [{
      data: [eddTotal, openTotal - eddTotal, dueTotal, bookedTotal],
      backgroundColor: [C.orange, '#8b8b8b', '#5a5a5a', '#3a3a3a'],
      borderWidth: 2, borderColor: C.s2, hoverOffset: 10
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    animation: { animateRotate: true, animateScale: true, duration: 1300, easing: 'easeOutQuart' },
    plugins: { legend: { display: false } }
  }
});

safeChart($('eddBarChart'), {
  type: 'bar',
  data: {
    labels: eddData.map(d => d.name),
    datasets: [{ label: 'EDD Crossed', data: eddData.map(d => d.count), backgroundColor: C.orange, borderRadius: 4 }]
  },
  options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 1100 }, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { font: CF } }, y: { ticks: { font: CF }, grid: { display: false } } } }
});

safeChart($('dueTmrChart'), {
  type: 'bar',
  data: { labels: dueData.map(d => d.name), datasets: [{ label: 'Due', data: dueData.map(d => d.count), backgroundColor: orangeA(.6), borderRadius: 4 }] },
  options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1100 }, plugins: { legend: { display: false } }, scales: { x: { ticks: { autoSkip: false, maxRotation: 30, font: CF }, grid: { display: false } }, y: { beginAtZero: true } } }
});

safeChart($('bookedChart'), {
  type: 'bar',
  data: { labels: bookedData.map(d => d.name), datasets: [{ label: 'Booked', data: bookedData.map(d => d.count), backgroundColor: '#8b8b8b', borderRadius: 4 }] },
  options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1100 }, plugins: { legend: { display: false } }, scales: { x: { ticks: { autoSkip: false, maxRotation: 30, font: CF }, grid: { display: false } }, y: { beginAtZero: true } } }
});

// Tonnage
function bucketColor(pct) {
  if (pct === null || pct === undefined) return C.text4;
  if (pct >= 80) return C.orange;
  if (pct >= 50) return C.text2;
  return C.text3;
}

const PL = { full: 'Tonnage — % Completion', first10: 'First 10 Days', mid10: 'Mid 10 Days', last10: 'Last 10 Days' };
const PS = { full: 'Full Month', first10: 'First 10 Days', mid10: 'Mid 10 Days', last10: 'Last 10 Days' };
let curPeriod = 'full';

function getPStats(c, p) {
  if (p === 'full') return { achieved: c.achieved, target: c.target };
  const d = c.periods && c.periods[p];
  return { achieved: d ? d.achieved : null, target: d ? d.target : null };
}

function setTonnagePeriod(p) {
  curPeriod = p;
  renderTonnageBars();
  renderTonnageCharts();
  renderKamSummary();
}
window.setTonnagePeriod = setTonnagePeriod;

function renderTonnageBars() {
  const el = $('tonnage-bars'); if (!el) return;
  const ti = $('tonnage-panel-title'); if (ti) ti.textContent = PL[curPeriod];
  const wd = clients.map(c => { const { achieved, target } = getPStats(c, curPeriod); return { c, achieved, target } }).filter(r => (r.achieved > 0) || (r.target > 0));
  const tier = item => {
    const ht = item.target > 0, ha = item.achieved > 0;
    if (!ht) return 3; if (!ha) return 4;
    const p = Math.round(item.achieved / item.target * 100);
    return p >= 80 ? 1 : p >= 50 ? 2 : 4;
  };
  wd.sort((a, b) => {
    const d = tier(a) - tier(b); if (d) return d;
    const pA = a.target && a.achieved ? a.achieved / a.target : 0;
    const pB = b.target && b.achieved ? b.achieved / b.target : 0;
    return pB - pA || (b.achieved || 0) - (a.achieved || 0);
  });
  if (!wd.length) { el.innerHTML = '<div class="tonnage-empty">No data.</div>'; return }
  el.innerHTML = wd.map(({ c, achieved, target }) => {
    const ht = target > 0, ha = achieved > 0;
    let pct = null;
    if (ht) pct = ha ? Math.round(achieved / target * 100) : 0;
    const dp = pct !== null ? Math.min(pct, 100) : 100;
    const nc = bucketColor(pct);
    const pl = pct !== null ? pct + '%' : '—';
    const nt = c.isNew ? '<span class="new-tag">New</span>' : '';
    let ta;
    if (ht && ha) ta = fK(achieved) + ' / ' + fK(target) + ` <span style="color:${C.text4}">kg</span>`;
    else if (ht && !ha) ta = '0 / ' + fK(target) + ` <span style="color:${C.text4}">kg</span>`;
    else ta = fK(achieved) + ` <span style="color:${C.text4}">kg</span>`;
    const r = rate(c.name);
    const vl = ha ? `<div class="value-badge"><span class="value-amount">${fR(achieved * r)}</span><span class="value-rate">@₹${r}/kg</span></div>` : '';
    return `<div class="client-row"><div class="client-name" title="${c.name}"><span class="client-name-text" style="color:${C.text};font-weight:600">${c.name}</span>${nt}</div><div class="client-person">${c.person}</div><div class="prog-bar-wrap"><div class="prog-bar" style="width:${dp}%;background:${nc}"></div></div><div class="pct-text" style="color:${nc}">${pl}</div><div class="client-tonnage"><div>${ta}</div>${vl}</div></div>`;
  }).join('');
}

const tl = $('tonnage-legend');
if (tl) tl.innerHTML = [['0–50%', C.text3], ['50–80%', C.text2], ['80%+', C.orange]].map(([l, c]) => `<span><span class="legend-dot" style="background:${c}"></span>${l}</span>`).join('') + '<span><span class="new-tag" style="margin-left:0">New</span> recently onboarded</span>';

let tci = null;
function renderTonnageCharts() {
  const top = clients.map(c => { const { achieved, target } = getPStats(c, curPeriod); return { name: c.name, achieved: achieved || 0, target: target || 0 } }).filter(r => r.achieved > 0 || r.target > 0).sort((a, b) => (b.achieved || b.target) - (a.achieved || a.target)).slice(0, 8);
  if (tci) tci.destroy();
  tci = safeChart($('targetChart'), {
    type: 'bar',
    data: {
      labels: top.map(r => r.name),
      datasets: [
        { label: 'Target', data: top.map(r => r.target), backgroundColor: '#3a3a3a', borderRadius: 4 },
        { label: 'Achieved', data: top.map(r => r.achieved), backgroundColor: C.orange, borderRadius: 4 }
      ]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 1100 }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: CF, color: C.text2 } }, title: { display: true, text: 'Target vs Achieved — ' + PS[curPeriod], font: { size: 11, weight: '500' }, color: C.text3, padding: { bottom: 16 } } }, scales: { x: { beginAtZero: true, ticks: { callback: v => (v / 1000).toFixed(0) + 'k', font: CF } }, y: { ticks: { font: CF }, grid: { display: false } } } }
  });
}

// Daily Table
const dtb = $('daily-table-body');
if (dtb) clients.filter(c => c.achieved > 0).forEach(c => {
  const pct = c.target > 0 ? Math.round(c.achieved / c.target * 100) + '%' : '—';
  const pc = c.target > 0 ? (c.achieved >= c.target ? C.orange : C.text2) : C.text4;
  const rem = c.target > 0 ? Math.max(c.target - c.achieved, 0).toLocaleString('en-IN') : '—';
  const df = c.target > 0 && c.avgDay > 0 && c.remaining > 0 ? +(c.remaining / c.avgDay).toFixed(1) : (c.target > 0 && c.remaining === 0 ? '✓' : '—');
  dtb.innerHTML += `<tr><td style="font-weight:600">${c.name}</td><td style="font-size:.78rem;color:${C.text3}">${c.person}</td><td>${c.target > 0 ? c.target.toLocaleString('en-IN') : '—'}</td><td>${c.achieved.toLocaleString('en-IN')}</td><td style="color:${pc};font-weight:600">${pct}</td><td>${c.activeDays}</td><td>${c.avgDay.toLocaleString('en-IN')}</td><td style="color:${C.text2};font-weight:500">${rem}</td><td style="color:${C.orange};font-weight:600">${df}</td></tr>`;
});

// Avg/Day chart
const topAvg = clients.filter(c => c.avgDay > 0).sort((a, b) => b.avgDay - a.avgDay).slice(0, 10);
safeChart($('avgDayChart'), {
  type: 'bar',
  data: { labels: topAvg.map(c => c.name), datasets: [{ label: 'Avg kg/day', data: topAvg.map(c => c.avgDay), backgroundColor: C.orange, borderRadius: 4 }] },
  options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 1100 }, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: v => v.toLocaleString('en-IN'), font: CF } }, y: { ticks: { font: CF }, grid: { display: false } } } }
});

// Days chart
const dc = $('daysChart');
if (dc) {
  const dd = clients.filter(c => c.target > 0 && c.avgDay > 0 && c.remaining > 0).sort((a, b) => b.daysNeeded - a.daysNeeded).slice(0, 10);
  safeChart(dc, {
    type: 'bar',
    data: { labels: dd.map(c => c.name), datasets: [{ label: 'Days', data: dd.map(c => c.daysNeeded), backgroundColor: dd.map(c => c.daysNeeded > 17 ? C.orange : '#8b8b8b'), borderRadius: 4 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 1100 }, plugins: { legend: { display: false }, title: { display: true, text: 'Estimated days at current pace', font: { size: 11, weight: '500' }, color: C.text3, padding: { bottom: 16 } } }, scales: { x: { beginAtZero: true, ticks: { font: CF } }, y: { ticks: { font: CF }, grid: { display: false } } } }
  });
}

// KAM Summary
function renderKamSummary() {
  const body = $('kam-summary-body'); if (!body) return;
  const km = {};
  clients.forEach(c => {
    const { achieved, target } = getPStats(c, curPeriod);
    if (!achieved && !target) return;
    if (!km[c.person]) km[c.person] = { person: c.person, tt: 0, ta: 0 };
    km[c.person].tt += (target || 0);
    km[c.person].ta += (achieved || 0);
  });
  const kl = Object.values(km).sort((a, b) => b.ta - a.ta);
  if (!kl.length) {
    body.innerHTML = `<tr><td colspan="4" style="text-align:center;color:${C.text3};padding:24px">No data.</td></tr>`;
    const tE = $('kam-total-target'), aE = $('kam-total-achieved'), pE = $('kam-total-pct');
    if (tE) tE.textContent = '—'; if (aE) aE.textContent = '—'; if (pE) pE.textContent = '—';
    return;
  }
  body.innerHTML = kl.map(k => {
    const p = k.tt > 0 ? Math.round(k.ta / k.tt * 100) : null;
    const pc = p === null ? C.text4 : bucketColor(p);
    return `<tr><td style="font-weight:600">${k.person}</td><td>${k.tt > 0 ? fK(k.tt) : '—'}</td><td>${fK(k.ta)}</td><td style="color:${pc};font-weight:600">${p !== null ? p + '%' : '—'}</td></tr>`;
  }).join('');
  // KAM total summary — recomputed live so it stays correct across the tonnage period filter.
  const totalTarget = kl.reduce((s, k) => s + k.tt, 0);
  const totalAchieved = kl.reduce((s, k) => s + k.ta, 0);
  const totalPct = totalTarget > 0 ? (totalAchieved / totalTarget * 100) : null;
  const tE = $('kam-total-target'), aE = $('kam-total-achieved'), pE = $('kam-total-pct');
  if (tE) tE.textContent = fK(totalTarget);
  if (aE) aE.textContent = fK(totalAchieved);
  if (pE) pE.textContent = totalPct !== null ? totalPct.toFixed(2) : '—';
}

// Forecast
function renderForecast() {
  $('forecast-sales-money').textContent = fR(totalSalesMoney);
  $('forecast-predicted-money').textContent = fR(predictedSales);
  $('forecast-target-money').textContent = fR(totalTargetMoney);
  const badge = $('forecast-badge'), vt = $('forecast-verdict-text');
  const will = predictedPct !== null && predictedPct >= 100;
  const border = predictedPct !== null && predictedPct >= 90 && predictedPct < 100;
  if (predictedPct === null) { badge.textContent = 'N/A'; badge.className = 'fbadge neutral'; vt.textContent = 'No target.' }
  else if (will) { badge.textContent = 'ON TRACK'; badge.className = 'fbadge good'; vt.textContent = `Projected ${Math.round(predictedPct)}% — surplus ${fR(predictedSales - totalTargetMoney)}.` }
  else if (border) { badge.textContent = 'BORDERLINE'; badge.className = 'fbadge warn'; vt.textContent = `Projected ${Math.round(predictedPct)}% — shortfall ${fR(totalTargetMoney - predictedSales)}.` }
  else { badge.textContent = 'AT RISK'; badge.className = 'fbadge bad'; vt.textContent = `Projected ${Math.round(predictedPct)}% — shortfall ${fR(totalTargetMoney - predictedSales)}.` }
  const max = Math.max(totalTargetMoney, predictedSales, 1);
  $('forecast-bar-fill').style.width = Math.min(predictedSales / max * 100, 100) + '%';
  $('forecast-bar-target-marker').style.left = Math.min(totalTargetMoney / max * 100, 100) + '%';
  $('forecast-bar-target-label').textContent = 'Target: ' + fR(totalTargetMoney);
  $('forecast-explain').innerHTML = '<strong style="color:' + C.text + '">Method:</strong> Predicted = (Sales ÷ ' + calendarDays + ' elapsed days) × ' + DAYS + ' days. Uses ₹' + DR + '/kg for unlisted. Straight-line projection. Report date: Sep 20, 2026.';
}

// DELAY REASONS PANEL
const REASON_CATEGORIES = {
  customer: { label: 'Customer-Related', keywords: ['customer', 'consignee', 'consignor', 'refused', 'hold', 'sales person', 'space issue at customer', 'address verification', 'alternate contact', 'invalid contact', 'store closed', 'premises closed', 'address issue', 'need contact', 'timing restriction', 'mall delivery', 'plant delivery', 'floor escalated', 'contact no', 'contact number', 'appointment', 'address not reachable', 'alternate address', 'entry restricted'] },
  carrier: { label: 'Carrier / Transit', keywords: ['hub', 'transit', 'misrouted', 'missed connection', 'vendor delay', 'intransit', 'last mile', 'gateway', 'backlog', 'connection', 'highway', 'warehouse', 'ware house', 'vehicle', 'late delivery', 'midmile', '3p', 'co - loader', 'destination', 'choking', 'choked', 'choke', 'interchanged', 'interchange', 'partially received', 'untraceable', 'no entery', 'no entry', 'dedicated vehicle'] },
  documentation: { label: 'Documentation', keywords: ['documents', 'documentation', 'document', 'po expired', 'deps', 'incorrect', 'incomplete', 'invoice', 'rto document'] },
  external: { label: 'External Factors', keywords: ['natural calamity', 'climate', 'rain', 'festival', 'strike', 'sez', 'weather', 'onam', 'kawad', 'janmashtami', 'janamasthi', 'ganesh', 'raksha bandan', 'holiday', 'spotlight', 'restrictions', 'traffic', 'sunday', 'road blockage'] },
  location: { label: 'Location / ODA', keywords: ['oda', 'remote', 'misrouted shipment', 'restrication', 'special delivery area', 'edl'] },
  damage: { label: 'Damage / Quality', keywords: ['damaged', 'damage'] }
};

const CATEGORY_COLORS = {
  customer: C.orange,
  carrier: '#b8b8b8',
  documentation: '#8b8b8b',
  external: '#f79c4d',
  location: '#5a5a5a',
  damage: '#3a3a3a',
  unknown: '#2a2a2a'
};

function classifyReason(reason) {
  if (!reason) return 'unknown';
  const r = reason.toLowerCase();
  for (const [cat, def] of Object.entries(REASON_CATEGORIES)) {
    if (def.keywords.some(k => r.includes(k))) return cat;
  }
  return 'unknown';
}

function analyzeDelayReasons() {
  const reasonCounts = {};
  const categoryCounts = { customer: 0, carrier: 0, documentation: 0, external: 0, location: 0, damage: 0, unknown: 0 };
  const transporterDelays = {};
  // Real Customer/Vendor attribution, taken directly from the sheet's "Customer Vendor" column
  // (not keyword-guessed) — every row with a logged delay reason is tagged Customer or Vendor.
  const customerVendorCounts = { customer: 0, vendor: 0, unclassified: 0 };

  eddDetail.forEach(item => {
    const reason = item.reason || 'Unclassified / Intransit Delay';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    const category = classifyReason(item.reason);
    categoryCounts[category]++;
    const t = item.transporter || 'Unassigned';
    transporterDelays[t] = (transporterDelays[t] || 0) + 1;
    if (item.type === 'Customer') customerVendorCounts.customer++;
    else if (item.type === 'Vendor') customerVendorCounts.vendor++;
    else customerVendorCounts.unclassified++;
  });

  return { reasonCounts, categoryCounts, transporterDelays, customerVendorCounts, total: eddDetail.length };
}

function animateDelayCounter(el, target, duration = 1500) {
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

function renderDelayPanel() {
  const analysis = analyzeDelayReasons();
  const { reasonCounts, categoryCounts, transporterDelays, customerVendorCounts, total } = analysis;

  const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  setText('dr-total-orders', total);
  setText('dr-unique-reasons', Object.keys(reasonCounts).length);
  const controllable = categoryCounts.customer + categoryCounts.documentation + categoryCounts.carrier;
  const external = categoryCounts.external + categoryCounts.location + categoryCounts.damage;
  setText('dr-controllable-pct', (total ? Math.round(controllable / total * 100) : 0) + '%');
  setText('dr-external-pct', (total ? Math.round(external / total * 100) : 0) + '%');
  setText('tab-reasons-badge', total);

  // Customer vs Vendor attribution (from the sheet's own "Customer Vendor" tagging)
  const cv = customerVendorCounts;
  const cvTotal = total || 1;
  const setCv = (id, count) => { const el = $(id); if (el) el.textContent = count; };
  setCv('dr-customer-count', cv.customer);
  setCv('dr-vendor-count', cv.vendor);
  setCv('dr-unclassified-count', cv.unclassified);
  const setCvPct = (id, count) => { const el = $(id); if (el) el.textContent = Math.round(count / cvTotal * 100) + '%'; };
  setCvPct('dr-customer-pct', cv.customer);
  setCvPct('dr-vendor-pct', cv.vendor);
  setCvPct('dr-unclassified-pct', cv.unclassified);

  const cvCanvas = $('customerVendorDonut');
  if (cvCanvas) {
    const cvEntries = [['Customer', cv.customer, C.orange], ['Vendor', cv.vendor, '#8b8b8b'], ['Unclassified / In-Transit', cv.unclassified, '#3a3a3a']].filter(([, v]) => v > 0);
    safeChart(cvCanvas, {
      type: 'doughnut',
      data: {
        labels: cvEntries.map(e => e[0]),
        datasets: [{
          data: cvEntries.map(e => e[1]),
          backgroundColor: cvEntries.map(e => e[2]),
          borderWidth: 2, borderColor: C.s2, hoverOffset: 10
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        animation: { animateRotate: true, animateScale: true, duration: 1300, easing: 'easeOutQuart' },
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11, weight: '500' }, padding: 12, boxWidth: 10, usePointStyle: true, pointStyle: 'circle', color: C.text2 } },
          tooltip: { callbacks: { label: (ctx) => { const pct = Math.round(ctx.parsed / cvTotal * 100); return ` ${ctx.label}: ${ctx.parsed} (${pct}%)` } } }
        }
      }
    });
  }

  const catMap = {
    customer: categoryCounts.customer,
    carrier: categoryCounts.carrier,
    documentation: categoryCounts.documentation,
    external: categoryCounts.external,
    location: categoryCounts.location + categoryCounts.damage,
    unknown: categoryCounts.unknown
  };

  document.querySelectorAll('.delay-cat').forEach(card => {
    const cat = card.dataset.cat;
    const count = catMap[cat] || 0;
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    const counter = card.querySelector('.counter-dr');
    const pctEl = card.querySelector('.dc-pct');
    const barFill = card.querySelector('.dc-bar-fill');
    counter.dataset.target = count;
    setTimeout(() => animateDelayCounter(counter, count), 220 + parseInt(card.dataset.d) * 110);
    if (pctEl) pctEl.textContent = pct + '%';
    if (barFill) setTimeout(() => { barFill.style.width = pct + '%'; }, 380);
  });

  // Category Donut
  const donutData = Object.entries(catMap).filter(([_, v]) => v > 0);
  safeChart($('delayCategoryDonut'), {
    type: 'doughnut',
    data: {
      labels: donutData.map(([k]) => REASON_CATEGORIES[k]?.label || 'Unclassified'),
      datasets: [{
        data: donutData.map(([_, v]) => v),
        backgroundColor: donutData.map(([k]) => CATEGORY_COLORS[k] || '#3a3a3a'),
        borderWidth: 2, borderColor: C.s2, hoverOffset: 12, hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      animation: { animateRotate: true, animateScale: true, duration: 1400, easing: 'easeOutQuart' },
      plugins: {
        legend: { position: 'right', labels: { font: { size: 11, weight: '500' }, padding: 14, boxWidth: 12, usePointStyle: true, pointStyle: 'circle', color: C.text2 } },
        tooltip: { callbacks: { label: (ctx) => { const pct = Math.round(ctx.parsed / total * 100); return ` ${ctx.label}: ${ctx.parsed} (${pct}%)` } } }
      }
    }
  });

  // Top 10 Reasons
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  safeChart($('topReasonsChart'), {
    type: 'bar',
    data: {
      labels: topReasons.map(([r]) => r.length > 40 ? r.slice(0, 37) + '…' : r),
      datasets: [{
        label: 'Occurrences',
        data: topReasons.map(([_, c]) => c),
        backgroundColor: topReasons.map((_, i) => i === 0 ? C.orange : i < 3 ? orangeA(.7) : orangeA(.4)),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      animation: { duration: 1300, easing: 'easeOutQuart', delay: (ctx) => ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 80 : 0 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => { const pct = Math.round(ctx.parsed.x / total * 100); return ` ${ctx.parsed.x} orders (${pct}%)` }, title: (items) => topReasons[items[0].dataIndex][0] } }
      },
      scales: { x: { beginAtZero: true, ticks: { font: CF } }, y: { ticks: { font: { size: 10 } }, grid: { display: false } } }
    }
  });

  // Transporter Chart
  const topTransporters = Object.entries(transporterDelays).sort((a, b) => b[1] - a[1]).slice(0, 8);
  safeChart($('transporterChart'), {
    type: 'bar',
    data: {
      labels: topTransporters.map(([t]) => t),
      datasets: [{
        label: 'Delayed Shipments',
        data: topTransporters.map(([_, c]) => c),
        backgroundColor: topTransporters.map((_, i) => {
          if (i === 0) return C.orange;
          if (i === 1) return orangeA(.7);
          return orangeA(.4);
        }),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutCubic', delay: (ctx) => ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 100 : 0 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => { const pct = Math.round(ctx.parsed.y / total * 100); return ` ${ctx.parsed.y} delays (${pct}% of total)` } } }
      },
      scales: { x: { ticks: { autoSkip: false, maxRotation: 35, font: CF }, grid: { display: false } }, y: { beginAtZero: true, ticks: { font: CF } } }
    }
  });

  // Reason Cards
  const grid = $('reason-cards-grid');
  if (grid) {
    const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
    grid.innerHTML = sortedReasons.map(([reason, count], i) => {
      const pct = Math.round(count / total * 100);
      const cat = classifyReason(reason === 'Unclassified / Intransit Delay' ? null : reason);
      const catLabel = REASON_CATEGORIES[cat]?.label || 'Unclassified';
      const severity = pct >= 10 ? 'high' : pct >= 5 ? 'medium' : 'low';
      const sevLabel = pct >= 10 ? 'HIGH' : pct >= 5 ? 'MED' : 'LOW';
      return `
        <div class="reason-card" style="animation-delay:${i * 0.03}s">
          <div class="rc-head">
            <div class="rc-title">${reason}</div>
            <span class="rc-badge ${severity}">${sevLabel}</span>
          </div>
          <div class="rc-stats">
            <span><span class="rc-count">${count}</span> ${count === 1 ? 'order' : 'orders'}</span>
            <span class="rc-pct">${pct}% of delays</span>
          </div>
          <div class="rc-progress">
            <div class="rc-progress-fill" style="width:${Math.min(pct * 3, 100)}%;animation-delay:${i * 0.03}s"></div>
          </div>
          <span class="rc-tag">${catLabel}</span>
        </div>
      `;
    }).join('');
  }

  renderInsights(analysis);
}

function renderInsights(analysis) {
  const { reasonCounts, categoryCounts, transporterDelays, total } = analysis;
  const insights = [];

  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
  if (topReason) {
    const pct = Math.round(topReason[1] / total * 100);
    insights.push({
      icon: '01',
      title: 'Primary Root Cause',
      desc: `<strong>${topReason[0]}</strong> accounts for <strong>${pct}%</strong> of total delays (${topReason[1]} orders). Prioritized resolution here delivers the highest operational leverage.`
    });
  }

  const topT = Object.entries(transporterDelays).sort((a, b) => b[1] - a[1])[0];
  if (topT) {
    const pct = Math.round(topT[1] / total * 100);
    insights.push({
      icon: '02',
      title: 'Carrier Performance Alert',
      desc: `<strong>${topT[0]}</strong> represents <strong>${topT[1]} delays (${pct}%)</strong>. Recommend SLA review and strategic load rebalancing across the carrier portfolio.`
    });
  }

  if (categoryCounts.customer > 0) {
    const pct = Math.round(categoryCounts.customer / total * 100);
    insights.push({
      icon: '03',
      title: 'Customer-Side Bottleneck',
      desc: `<strong>${pct}%</strong> of delays (${categoryCounts.customer} orders) originate from customer-side issues — refusals, capacity constraints, contact failures. Enhanced pre-delivery orchestration required.`
    });
  }

  if (categoryCounts.unknown > 0) {
    const pct = Math.round(categoryCounts.unknown / total * 100);
    insights.push({
      icon: '04',
      title: 'Data Governance Opportunity',
      desc: `<strong>${categoryCounts.unknown} delays (${pct}%)</strong> lack root-cause classification. Mandatory reason-capture at delay events will elevate analytical precision.`
    });
  }

  if (categoryCounts.external > 0) {
    const pct = Math.round(categoryCounts.external / total * 100);
    insights.push({
      icon: '05',
      title: 'External Risk Assessment',
      desc: `<strong>${pct}%</strong> of delays (${categoryCounts.external} orders) stem from external factors — weather, festivals, strikes. Incorporate probabilistic buffers into regional EDD models.`
    });
  }

  if (categoryCounts.documentation > 0) {
    insights.push({
      icon: '06',
      title: 'Documentation Excellence',
      desc: `<strong>${categoryCounts.documentation} delays</strong> traced to documentation gaps. Automated pre-dispatch verification workflows can eliminate this category entirely.`
    });
  }

  const list = $('insights-list');
  if (list) {
    list.innerHTML = insights.map((ins, i) => `
      <div class="insight" style="animation-delay:${i * 0.08}s">
        <div class="insight-icon">${ins.icon}</div>
        <div class="insight-body">
          <div class="insight-title">${ins.title}</div>
          <div class="insight-desc">${ins.desc}</div>
        </div>
      </div>
    `).join('');
  }
}

// Init
populateEddFilterOptions();
renderEddRows(eddDetail);
renderTonnageBars();
renderTonnageCharts();
renderKamSummary();
renderForecast();
renderDelayPanel();
animateCounters();
