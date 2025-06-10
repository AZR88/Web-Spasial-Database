// File: Backend/static/js/main.js

// const API_BASE_URL = 'http://127.0.0.1:8000'; // Baris lama
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Baris baru, untuk path relatif ke prefix API

const DEFAULT_MAP_CENTER = [-7.5700, 112.0000]; // Sesuaikan jika perlu
const DEFAULT_MAP_ZOOM = 9;

/**
 * Initializes a Leaflet map on a given HTML element ID.
 * (Fungsi initMap dan clearMapLayers tetap sama seperti sebelumnya)
 */
function initMap(mapId, center = DEFAULT_MAP_CENTER, zoom = DEFAULT_MAP_ZOOM) {
    // ... (isi fungsi initMap seperti sebelumnya) ...
    const mapContainer = document.getElementById(mapId);
    if (window[mapId + '_map_instance']) {
        window[mapId + '_map_instance'].remove();
        window[mapId + '_map_instance'] = null;
    }
    if (mapContainer && mapContainer._leaflet_id) {
        // mapContainer.innerHTML = ''; // Opsi drastis jika ada masalah render
    }
    const map = L.map(mapId).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    window[mapId + '_map_instance'] = map;
    return map;
}

function clearMapLayers(map) {
    // ... (isi fungsi clearMapLayers seperti sebelumnya) ...
    if (map) {
        map.eachLayer(function (layer) {
            if (!(layer instanceof L.TileLayer)) {
                map.removeLayer(layer);
            }
        });
    }
}