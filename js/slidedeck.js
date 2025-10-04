/* global L */

class SlideDeck {
  constructor(container, slides, map) {
    this.container = container;   // can be null; we’ll listen on window scroll
    this.slides = slides;
    this.map = map;

    this.dataLayer = L.layerGroup().addTo(map);
    this.pointData = null;
    this.binLayers = [];   // [{label, start, end, layer}]
    this.currentBin = -1;
  }

  /**
   * Build one Leaflet layer per year-bin.
   * bins: [{label, start, end}]  (inclusive)
   */
  constructBinnedLayers(geojson, bins) {
    this.pointData = geojson;
    this.binLayers = [];

    const features = (geojson?.features || []).filter(f =>
      f &&
      f.geometry &&
      f.geometry.type === "Point" &&
      f.properties &&
      f.properties.FISCAL_YEAR_COMPLETE != null
    );

    // --- Styling: radius encodes TOTAL_UNITS using a sqrt scale, clamped ---
    const defaultOptions = {
      pointToLayer: (_feature, coords) => L.circleMarker(coords),
      style: (feature) => {
        const units = Number(feature.properties?.TOTAL_UNITS) || 0;
        // sqrt scale so AREA ~ units; clamp to keep sizes readable
        const r = Math.min(18, Math.max(2, Math.sqrt(units) * 0.5));
        return {
          stroke: false,
          radius: r,
          fillOpacity: 0.75,
          color: "#ffce09"
        };
      },
      interactive: true
    };

    bins.forEach(bin => {
      const start = Math.floor(+bin.start);
      const end   = Math.floor(+bin.end);

      const filtered = features.filter(f => {
        const y = Math.floor(+f.properties.FISCAL_YEAR_COMPLETE);
        return y >= start && y <= end;
      });

      const layer = L.geoJSON(
        { type: "FeatureCollection", features: filtered },
        {
          ...defaultOptions,
          onEachFeature: (f, lyr) => {
            const p = f.properties || {};
            lyr.bindPopup(
              `<strong>${p.PROJECT_NAME ?? "Project"}</strong><br/>
               Year: ${p.FISCAL_YEAR_COMPLETE ?? "—"}<br/>
               Units: ${p.TOTAL_UNITS ?? "—"}<br/>
               Type: ${p.PROJECT_TYPE ?? "—"}<br/>
               Developer: ${p.DEVELOPER_NAME ?? "—"}`
            );
          }
        }
      );

      this.binLayers.push({ ...bin, layer });
    });

    // If you want to inspect counts per bin:
    // console.table(this.binLayers.map(b => ({ bin: b.label, projects: b.layer.getLayers().length })));
  }

  /** Show layers cumulatively up to binIndex (0-based). */
  updateDataLayerByBin(binIndex) {
    if (!this.binLayers.length) return;
    const i = Math.max(0, Math.min(binIndex, this.binLayers.length - 1));
    if (i === this.currentBin) return;

    // CUMULATIVE: show 0..i, remove layers beyond i
    this.dataLayer.clearLayers();
    for (let k = 0; k <= i; k++) {
      this.dataLayer.addLayer(this.binLayers[k].layer);
    }

    this.currentBin = i;
  }
}

export { SlideDeck };