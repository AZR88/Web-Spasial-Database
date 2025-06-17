

function initMap(containerId) {
    const map = L.map(containerId).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    return map;
}

function clearMapLayers(map) {
    map.eachLayer(layer => {
        if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

document.addEventListener('DOMContentLoaded', () => {
    const fetchRekomendasiButton = document.getElementById('fetch-rekomendasi');
    const rekomendasiInfoDiv = document.getElementById('rekomendasi-info');
    let rekomendasiMap = null;

    fetchRekomendasiButton.addEventListener('click', async () => {
        if (!window['rekomendasi-map_map_instance']) {
            rekomendasiMap = initMap('rekomendasi-map');
            window['rekomendasi-map_map_instance'] = rekomendasiMap;
        } else {
            rekomendasiMap = window['rekomendasi-map_map_instance'];
        }

        clearMapLayers(rekomendasiMap);
        rekomendasiInfoDiv.innerHTML = '<p>Memuat data rekomendasi...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/rekomendasi`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Gagal mengambil data rekomendasi: ${response.statusText}`);
            }
            const data = await response.json();

            if (data.length === 0) {
                rekomendasiInfoDiv.innerHTML = '<p>Tidak ada data rekomendasi yang tersedia.</p>';
                return;
            }

            rekomendasiInfoDiv.innerHTML = '<h3>Rekomendasi Komoditas Unggulan:</h3>';
            const ul = document.createElement('ul');
            const allGeometries = [];

            data.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<b>${item.nama_kecamatan}</b>: <i>${item.nama_komoditas}</i> (Selisih: ${item.selisih})<br>
                    <small>Produksi ${item.tahun_sekarang}: ${item.produksi_sekarang}, ${item.tahun_sebelumnya}: ${item.produksi_sebelumnya}</small>`;
                ul.appendChild(li);

                if (item.geom) {
                    try {
                        const color = getRandomColor();
                        const geoJsonFeature = {
                            type: "Feature",
                            properties: {
                                nama_kecamatan: item.nama_kecamatan,
                                nama_komoditas: item.nama_komoditas,
                                kenaikan: item.selisih
                            },
                            geometry: JSON.parse(item.geom)
                        };

                        const geoJsonLayer = L.geoJSON(geoJsonFeature, {
                            style: {
                                color: 'white',
                                weight: 1,
                                fillColor: color,
                                fillOpacity: 0.6
                            }
                        }).addTo(rekomendasiMap);

                        geoJsonLayer.bindPopup(
                            `<b>${item.nama_kecamatan}</b><br>Rekomendasi: ${item.nama_komoditas}<br>Selisih Produksi: ${item.selisih}`
                        );

                        allGeometries.push(geoJsonFeature);

                    } catch (e) {
                        console.error(`GeoJSON error pada ${item.nama_kecamatan}:`, e);
                        const errorLi = document.createElement('li');
                        errorLi.innerHTML = `<span style="color:orange;">Kecamatan ${item.nama_kecamatan} memiliki data geometri yang tidak valid.</span>`;
                        ul.appendChild(errorLi);
                    }
                } else {
                    const noGeomLi = document.createElement('li');
                    noGeomLi.innerHTML = `<span style="color:grey;">Kecamatan ${item.nama_kecamatan} tidak memiliki data geometri.</span>`;
                    ul.appendChild(noGeomLi);
                }
            });

            rekomendasiInfoDiv.appendChild(ul);

            if (allGeometries.length > 0) {
                const featureGroup = L.geoJSON(allGeometries);
                if (featureGroup.getLayers().length > 0) {
                    rekomendasiMap.fitBounds(featureGroup.getBounds().pad(0.1));
                } else {
                    rekomendasiMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
                }
            } else {
                rekomendasiMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
            }

        } catch (error) {
            console.error('Gagal memuat data rekomendasi:', error);
            rekomendasiInfoDiv.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${error.message}</p>`;
        }
    });
});
