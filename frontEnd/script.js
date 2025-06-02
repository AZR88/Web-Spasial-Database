// Inisialisasi peta dengan posisi tengah default
const map = L.map('map').setView([-7.5, 110], 9);

// Tambahkan tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Asumsi zona UTM 49S (cek ulang jika perlu)
const fromProj = '+proj=utm +zone=49 +south +ellps=WGS84 +units=m +no_defs';
const toProj = 'WGS84';

// Hilangkan Z (koordinat 3D ke 2D)
function stripZ(geometry) {
  if (geometry.type === "MultiPolygon") {
    geometry.coordinates = geometry.coordinates.map(polygon =>
      polygon.map(ring =>
        ring.map(coord => [coord[0], coord[1]])
      )
    );
  }
  return geometry;
}

// Konversi koordinat dari UTM ke lat-lng
function reprojectGeometry(geometry) {
  if (geometry.type === "MultiPolygon") {
    geometry.coordinates = geometry.coordinates.map(polygon =>
      polygon.map(ring =>
        ring.map(coord => {
          const [x, y] = proj4(fromProj, toProj, [coord[0], coord[1]]);
          return [x, y];
        })
      )
    );
  }
  return geometry;
}

// Pewarnaan berdasarkan nilai produksi
function getColor(value) {
  return value > 3000 ? '#006837' :
         value > 2000 ? '#31a354' :
         value > 1000 ? '#78c679' :
         value > 500  ? '#c2e699' :
                        '#ffffcc';
}

// Ambil dan tampilkan data dari endpoint
async function loadData() {
  const response = await fetch('/panen/?komoditas_id=6&tahun=2024');
  const rawData = await response.json();

  const features = rawData.map(item => {
    let geom = JSON.parse(item.geom);
    geom = stripZ(geom);
    geom = reprojectGeometry(geom);

    return {
      type: "Feature",
      geometry: geom,
      properties: {
        nama: item.nama_kecamatan,
        produksi: item.total_produksi,
        satuan: item.satuan
      }
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features: features
  };

  // Tampilkan di Leaflet
  L.geoJSON(geojson, {
    style: feature => ({
      fillColor: getColor(feature.properties.produksi),
      color: "#333",
      weight: 1,
      fillOpacity: 0.7
    }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      layer.bindPopup(`<strong>${props.nama}</strong><br>Produksi: ${props.produksi} ${props.satuan}`);
    }
  }).addTo(map);
}

loadData();
