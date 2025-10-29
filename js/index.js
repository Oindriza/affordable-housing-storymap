import { SlideDeck } from "./slidedeck.js";

/*MAP*/
const map = L.map("map", { zoomSnap: 0, scrollWheelZoom: false }).setView([39.99031838231997, -75.09241104125978], 12);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/nodi/cmg713hpu003901s2acg2ddfk/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoibm9kaSIsImEiOiJjbWZlYzdldXMwNWhxMnNvYzNvOWM1c3l1In0.M5eQdMz9QGmElmCb4_mvGg",
  {
    maxZoom: 19,
    zoomOffset: -1,
    tileSize: 512,
    attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
  }
).addTo(map);
window.map = map; // useful for debugging in console

/*YEAR BINS (slides 2–9)*/
const YEAR_BINS = [
  { label: "1800–1930", start: 1861, end: 1929 },
  { label: "1930–1949", start: 1930, end: 1949 },
  { label: "1950–1960", start: 1950, end: 1960 },
  { label: "1961–1979", start: 1961, end: 1979 },
  { label: "1980–1990", start: 1980, end: 1990 },
  { label: "1990–2010", start: 1990, end: 2010 },
  { label: "2010–2020", start: 2015, end: 2020 },
  { label: "2020–2024", start: 2020, end: 2024 },
];

// IDs of the 8 slides that control the bins (must match your HTML exactly)
const BIN_SLIDE_IDS = [
  "Second-Slide",
  "Third-Slide",
  "Fourth-Slide",
  "Fifth-Slide",
  "Sixth-Slide",
  "Seventh-Slide",
  "Eighth-Slide",
  "Ninth-Slide",
];
const binSlides = BIN_SLIDE_IDS.map(id => document.getElementById(id)).filter(Boolean);
if (binSlides.length !== YEAR_BINS.length) {
  console.warn("Bin slide count and bin count differ:", binSlides.length, YEAR_BINS.length);
}

/*FOCUS ZOOMS (slides 10–14)*/
const FOCUS_SLIDE_IDS = [
  "Tenth-Slide",      // Carl Mackley House
  "Eleventh-Slide",   // Richard Allen Homes
  "Twelvth-Slide",    // Haddington III  (matches your HTML spelling)
  "Thirteenth-Slide", // Mantua Hall / Mantua Square
  "Fourteenth-Slide", // Paseo Verde
];

// OBJECTIDs for each focus slide (numbers)
const FOCUS_OBJECTIDS = {
  "Tenth-Slide":      [59],   // Carl Mackley
  "Eleventh-Slide":   [444],  // Richard Allen Homes
  "Twelvth-Slide":    [445],  // Haddington
  "Thirteenth-Slide": [264],  // Mantua
  "Fourteenth-Slide": [241],  // Paseo Verde
};

/*SLIDE DECK + STATE*/
const slideSection = document.querySelector(".slide-section");
const deck = new SlideDeck(slideSection, binSlides, map);

let geojsonData = null;
let lastFocusId = null;     // prevent reflying every scroll tick
let focusEnabled = false;   // only allow zooms after the Ninth slide is active

/* HELPERS (for focus zoom)*/
function featuresForIds(gj, ids) {
  const set = new Set((ids || []).map(Number));
  return (gj.features || []).filter(
    f =>
      f &&
      f.geometry &&
      f.geometry.type === "Point" &&
      set.has(Number(f?.properties?.OBJECTID))
  );
}

function boundsFromFeatures(feats) {
  const pts = feats.map(f => {
    const [lng, lat] = f.geometry.coordinates;
    return [lat, lng]; // Leaflet expects [lat, lng]
  });
  if (!pts.length) return null;
  const bounds = L.latLngBounds(pts);
  return { bounds, center: bounds.getCenter() };
}

/* =========================
   INIT
========================= */
async function init() {
  const resp = await fetch("data/housing_p_updated.geojson");
  if (!resp.ok) throw new Error(`Failed to load GeoJSON: ${resp.status}`);
  geojsonData = await resp.json();

  // Build one layer per bin (SlideDeck should be the cumulative version)
  deck.constructBinnedLayers(geojsonData, YEAR_BINS);

  // SCROLL HANDLER: bins first; after 9th, enable focus zooms
  const onScroll = () => {
    // --- BINS (slides 2–9) ---
    let binIdx = -1;
    binSlides.forEach((slide, i) => {
      const r = slide.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5) binIdx = i;
    });
    deck.updateDataLayerByBin(Math.min(binIdx, YEAR_BINS.length - 1));

    // Arm focus zoom once Ninth (index 7) has become active
    focusEnabled = binIdx >= (YEAR_BINS.length - 1);

    // --- FOCUS ZOOMS (slides 10–14) ---
    if (!(focusEnabled && geojsonData)) return;

    // Which focus slide is currently in view?
    let currentFocusId = null;
    for (const id of FOCUS_SLIDE_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) currentFocusId = id;
    }
    if (!currentFocusId || currentFocusId === lastFocusId) return;

    const feats = featuresForIds(geojsonData, FOCUS_OBJECTIDS[currentFocusId] || []);
    if (!feats.length) return;

    // Tight zoom
    if (feats.length === 1) {
      const [lng, lat] = feats[0].geometry.coordinates;
      lastFocusId = currentFocusId;
      map.flyTo([lat, lng], 19, { duration: 0.6 }); // 18 if 19 feels too close
    } else {
      const bc = boundsFromFeatures(feats);
      if (!bc) return;
      lastFocusId = currentFocusId;
      map.flyToBounds(bc.bounds, { padding: [6, 6], maxZoom: 19, duration: 2 });
      map.once("moveend", () => {
        if (map.getZoom() < 19) map.flyTo(bc.center, 19, { duration: 2 });
      });
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  // Initial render: show the first bin view; do NOT zoom
  deck.updateDataLayerByBin(-1); // start with no data;
}

init().catch(console.error);



// ========== ADD LEGEND CONTROL ==========
const legend = L.control({ position: "bottomleft" });

legend.onAdd = function (map) {
  const div = L.DomUtil.create("div", "info legend");

  div.innerHTML = `
    <div style="background-color: rgba(30, 30, 30, 0.85); color: white; padding: 12px 14px; border-radius: 8px; width: 170px; font-family: 'Inter', 'Arial', sans-serif; font-size: 12px; line-height: 1.4; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
      
      <!-- NORTH ARROW -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong>Legend</strong>
        <div style="display: flex; flex-direction: column; align-items: center; font-size: 10px; line-height: 1;">
          <span style="font-weight: bold;">N</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <polygon points="12,2 4,22 12,18 20,22" />
          </svg>
        </div>
      </div>

      <!-- DOT SCALE -->
      <div style="margin: 6px 0;">
        <svg width="100" height="30">
          <circle cx="15" cy="15" r="3" fill="#FFD700" fill-opacity="0.9"></circle>
          <circle cx="40" cy="15" r="6" fill="#FFD700" fill-opacity="0.9"></circle>
          <circle cx="70" cy="15" r="9" fill="#FFD700" fill-opacity="0.9"></circle>
        </svg>
        <br>
        <span style="font-size: 11px;">Dot size increases with Number of units</span>
      </div>

      <hr style="border: none; border-top: 1px solid #666; margin: 6px 0;">

      <!-- INSTRUCTION -->
      <div style="font-size: 11px;">
        Click on a dot to learn more<br>
        about each housing project.
      </div>
    </div>
  `;
  return div;
};

legend.addTo(map);


// === Always scroll to the top (first slide) on refresh ===
window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

// Also make sure when the page loads, it starts at the top
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});