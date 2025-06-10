// File: Backend/static/js/panen.js

document.addEventListener('DOMContentLoaded', () => {
    const fetchPanenButton = document.getElementById('fetch-panen');
    const komoditasIdInput = document.getElementById('panen-komoditas-id');
    const tahunInput = document.getElementById('panen-tahun');
    const panenInfoDiv = document.getElementById('panen-info');
    const legendDiv = document.getElementById('panen-legend');

    let panenMap = null;
    let panenLayerGroup = L.layerGroup();  // untuk menampung layer GeoJSON

    // Inisialisasi peta
    if (document.getElementById('panen-map')) {
        panenMap = initMap('panen-map', DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
        panenLayerGroup.addTo(panenMap);  // tambahkan group ke map
    }

    function getColorByProduksi(produksi) {
        return produksi > 20000 ? '#08306b' :
               produksi > 15000 ? '#084081' :
               produksi > 10000 ? '#08519c' :
               produksi > 7000  ? '#2171b5' :
               produksi > 5000  ? '#4292c6' :
               produksi > 3000  ? '#6baed6' :
               produksi > 2000  ? '#9ecae1' :
               produksi > 1000  ? '#c6dbef' :
               produksi > 500   ? '#deebf7' :
               produksi > 100   ? '#f7fbff' :
                                  '#f0f0f0';
    }

    function addLegend() {
        const grades = [0, 100, 500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000];
        
        const legend = L.control({ position: 'bottomright' });
    
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<h4>Produksi (Kw)</h4>';
    
            for (let i = 0; i < grades.length; i++) {
                const from = grades[i];
                const to = grades[i + 1];
                const color = getColorByProduksi(from + 1);
    
                div.innerHTML +=
                    `<i style="background:${color}"></i> ${from}${to ? '&ndash;' + to : '+'}<br>`;
            }
    
            return div;
        };
    
        legend.addTo(panenMap);
    }
    

    function clearMapLayers() {
        panenLayerGroup.clearLayers();
    }

    fetchPanenButton.addEventListener('click', async () => {
        const komoditasId = komoditasIdInput.value;
        const tahun = tahunInput.value;

        if (!komoditasId || !tahun) {
            panenInfoDiv.innerHTML = '<p style="color: red;">ID Komoditas dan Tahun harus diisi.</p>';
            return;
        }

        if (!panenMap || !document.getElementById('panen-map')) {
            panenInfoDiv.innerHTML = '<p style="color: red;">Peta tidak ditemukan.</p>';
            return;
        }

        clearMapLayers();
        panenInfoDiv.innerHTML = '<p>Memuat data hasil panen...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/panen/?komoditas_id=${komoditasId}&tahun=${tahun}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Status ${response.status}`);
            }

            const data = await response.json();

            if (data.length === 0) {
                panenInfoDiv.innerHTML = '<p>Tidak ada data panen untuk kriteria yang dipilih.</p>';
                return;
            }

            panenInfoDiv.innerHTML = '<h3>Data Hasil Panen:</h3>';
            const ul = document.createElement('ul');
            const geoJsonFeatures = [];

            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.nama_kecamatan}: ${item.total_produksi} ${item.satuan}`;
                ul.appendChild(li);

                if (item.geom_geojson) {
                    try {
                        const geometry = JSON.parse(item.geom_geojson);
                        const feature = {
                            type: "Feature",
                            properties: {
                                nama_kecamatan: item.nama_kecamatan,
                                total_produksi: item.total_produksi,
                                satuan: item.satuan
                            },
                            geometry: geometry
                        };
                        geoJsonFeatures.push(feature);

                        const layer = L.geoJSON(feature, {
                            style: f => ({
                                fillColor: getColorByProduksi(f.properties.total_produksi),
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                dashArray: '3',
                                fillOpacity: 0.6
                            }),
                            onEachFeature: (feature, layer) => {
                                // Tooltip saat diklik
                                layer.bindPopup(
                                    `<b>Kecamatan:</b> ${feature.properties.nama_kecamatan}<br>` +
                                    `<b>Total Produksi:</b> ${feature.properties.total_produksi} ${feature.properties.satuan}`
                                );

                                // Label permanen di tengah
                                const center = layer.getBounds().getCenter();
                                const label = L.tooltip({
                                    permanent: true,
                                    direction: 'center',
                                    className: 'kecamatan-label'
                                })
                                .setContent(feature.properties.nama_kecamatan)
                                .setLatLng(center);
                                panenMap.addLayer(label);
                            }
                        });

                        panenLayerGroup.addLayer(layer);

                    } catch (e) {
                        console.error("Gagal parsing GeoJSON:", e);
                        const errorLi = document.createElement('li');
                        errorLi.innerHTML = `<span style="color:orange;">Error data geometri untuk ${item.nama_kecamatan}</span>`;
                        ul.appendChild(errorLi);
                    }
                } else {
                    const noGeomLi = document.createElement('li');
                    noGeomLi.innerHTML = `<span style="color:gray;">Kecamatan ${item.nama_kecamatan} tidak memiliki data geometri.</span>`;
                    ul.appendChild(noGeomLi);
                }
            });

            panenInfoDiv.appendChild(ul);

            if (geoJsonFeatures.length > 0) {
                const bounds = L.geoJSON(geoJsonFeatures).getBounds().pad(0.1);
                panenMap.fitBounds(bounds);
            }

            addLegend();

        } catch (error) {
            console.error('Error:', error);
            panenInfoDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan saat memuat data: ${error.message}</p>`;
        }
    });
});
