let slideramt = -9623966400000;
let dateFilter = [
  "all",
  ["<=", ["get", "start_epoc"], slideramt],
  [">=", ["get", "end_epoch"], slideramt]
];
let slider = document.getElementById("dateslider");
slider.addEventListener("input", (event) => {
  slideramt = parseInt(event.target.value);
  dateFilter = [
    "all",
    ["<=", ["get", "start_epoc"], slideramt],
    [">=", ["get", "end_epoch"], slideramt]
  ];
  map.setFilter("counties-line-layer", dateFilter);
  map.setFilter("counties-fill-layer", dateFilter);
  map.setFilter("text-labels", dateFilter);
});

let amount = document.getElementById("amount");
let date = new Date(slideramt).toDateString();
amount.innerHTML = date;

slider.oninput = function (input) {
  date = new Date(slideramt).toDateString();
  amount.innerHTML = date;
};

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2VycnliYW5uZW4iLCJhIjoiY2owNXlzamEwMG80cTMycXJ1OTN3cGhuMiJ9.mtAv-FAXTH-capn2iRzm7g";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/kerrybannen/cld2fixa3003r01qe7l1a9tbt",
  center: [-80.9, 35.5],
  zoom: 6
});
const nav = new mapboxgl.NavigationControl({
  showCompass: false
});
map.addControl(nav, "bottom-right");

let hoveredStateId = null;

map.on("load", () => {
  map.addSource("counties", {
    type: "vector",
    url: "mapbox://kerrybannen.nccounties"
  });
  map.addSource("centroids", {
    type: "vector",
    url: "mapbox://kerrybannen.cldeta6er1iuf28jnb58bv1ls-8x1cd"
  });
  map.addSource("satellite", {
    type: "raster",
    url: "mapbox://mapbox.satellite"
  });

  map.addLayer({
    id: "satellite-layer",
    type: "raster",
    source: "satellite",
    "source-layer": "mapbox-satellite",
    layout: {
      visibility: "none"
    }
  });

  map.addLayer({
    id: "counties-fill-layer",
    type: "fill",
    source: "counties",
    "source-layer": "nccounties_epoch",
    paint: {
      "fill-color": "#FFFFFF",
      "fill-outline-color": "#FFFFFF",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.8,
        0.4
      ]
    },
    filter: dateFilter
  });
  map.addLayer({
    id: "counties-line-layer",
    type: "line",
    source: "counties",
    "source-layer": "nccounties_epoch",
    paint: {
      "line-width": 0.4,
      "line-color": "#707070"
    },
    filter: dateFilter
  });

  map.addLayer({
    id: "text-labels",
    type: "symbol",
    source: "centroids",
    "source-layer": "nccounties_centroid",
    layout: {
      "text-field": ["get", "name_case"],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 0,
      "text-justify": "auto", 
      "visibility": "visible"
    },
    paint: {
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 1,
      "text-halo-blur": 1,
      "text-color": "#646464"
    },
    filter: dateFilter
  });
  
  map.setLayoutProperty("text-labels", "text-field", [
    "format",
    ["get", "name_case"],
    {
      "font-scale": 0.8,
      "text-font": ["literal", ["DIN Pro Medium", "Arial Unicode MS Regular"]]
    }
  ]);

  const satelliteToggle = document.querySelector("#satellite-toggle");
  const labelsToggle = document.querySelector("#labels-toggle");
  satelliteToggle.addEventListener("change", () => {
    if (satelliteToggle.checked) {
      map.setLayoutProperty("satellite-layer", "visibility", "visible");
      map.setPaintProperty("counties-line-layer", "line-color", "#DBDBDB");
      map.setPaintProperty("counties-fill-layer", "fill-opacity", 0.2);
      map.setPaintProperty("text-labels", "text-color", "#FFFFFF");
      map.setPaintProperty("text-labels", "text-halo-color", "#000000");
    } else {
      map.setLayoutProperty("satellite-layer", "visibility", "none");
      map.setPaintProperty("counties-line-layer", "line-color", "#707070");
      map.setPaintProperty("counties-fill-layer", "fill-opacity", 0.4);
      map.setPaintProperty("text-labels", "text-color", "#646464");
      map.setPaintProperty("text-labels", "text-halo-color", "#FFFFFF");
    }
  });

  labelsToggle.addEventListener("change", () => {
    if (labelsToggle.checked) {
      map.setLayoutProperty("text-labels", "visibility", "visible");
    } else {
      map.setLayoutProperty("text-labels", "visibility", "none");
    }
  });

  map.on("mouseenter", "counties-fill-layer", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "counties-fill-layer", () => {
    map.getCanvas().style.cursor = "";
  });
  map.on("mousemove", "counties-fill-layer", (e) => {
    if (e.features.length > 0) {
      if (hoveredStateId !== null) {
        map.setFeatureState(
          { source: "counties-fill-layer", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = e.features[0].id;
      map.setFeatureState(
        { source: "states", id: hoveredStateId },
        { hover: true }
      );
    }
  });

  map.on("click", "counties-fill-layer", (e) => {
    const name = e.features[0].properties.name_case;
    let startdate = e.features[0].properties.START_DATE;
    let enddate = e.features[0].properties.END_DATE;
    const change = e.features[0].properties.CHANGE;
    let popuphtml = [
      "<p><strong>County: </strong>" +
        name +
        "</p>" +
        "<p><strong>Dates: </strong>" +
        startdate +
        " through " +
        enddate +
        "</p>" +
        "<p><strong>Description of border change: </strong>" +
        change +
        "</p>"
    ];
    const popup = new mapboxgl.Popup({
      className: "popup",
      closeButton: true,
      closeOnClick: true
    })
      .setLngLat(e.lngLat)
      .setHTML(popuphtml)
      .addTo(map);
  });

  map.setFilter("counties-line-layer", dateFilter);
  map.setFilter("counties-fill-layer", dateFilter);
  map.setFilter("text-labels", dateFilter);
});