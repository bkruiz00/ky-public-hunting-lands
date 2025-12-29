let map = L.map("map").setView([37.8, -85.5], 7);
let markers = [];
let allData = [];

// Map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Load data
fetch("ky_hunting_lands.json")
  .then(res => res.json())
  .then(data => {
    allData = data;
    populateCountyFilter(data);
    render(data);
  });

function populateCountyFilter(data) {
  const countySelect = document.getElementById("countyFilter");
  const counties = new Set();

  data.forEach(item => {
    item.county.forEach(c => counties.add(c));
  });

  [...counties].sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    countySelect.appendChild(opt);
  });
}

function render(data) {
  clearMap();
  const tbody = document.querySelector("#landsTable tbody");
  tbody.innerHTML = "";

  data.forEach(item => {
    // Table row
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.county.join(", ")}</td>
      <td>${item.region}</td>
      <td>${item.type}</td>
    `;

    // Marker popup
    let popup = `<strong>${item.name}</strong><br>
                 ${item.type}<br>
                 ${item.county.join(", ")}`;

    if (item.areas) {
      popup += "<ul>" + item.areas.map(a => `<li>${a}</li>`).join("") + "</ul>";
    }

    const marker = L.marker([item.latitude, item.longitude])
      .bindPopup(popup)
      .addTo(map);

    row.addEventListener("click", () => {
      map.setView([item.latitude, item.longitude], 11);
      marker.openPopup();
    });

    markers.push(marker);
  });
}

function clearMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// Filters
document.querySelectorAll(
  "#searchInput, #regionFilter, #countyFilter, #typeFilter"
).forEach(el => el.addEventListener("input", applyFilters));

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const region = document.getElementById("regionFilter").value;
  const county = document.getElementById("countyFilter").value;
  const type = document.getElementById("typeFilter").value;

  const filtered = allData.filter(item => {
    const textMatch =
      item.name.toLowerCase().includes(search) ||
      item.county.join(" ").toLowerCase().includes(search);

    const regionMatch = !region || item.region === region;
    const countyMatch = !county || item.county.includes(county);
    const typeMatch = !type || item.type === type;

    return textMatch && regionMatch && countyMatch && typeMatch;
  });

  render(filtered);
}
