document.addEventListener('DOMContentLoaded', () => {
    const fetchTrenButton = document.getElementById('fetch-tren');
    const kecamatanInput = document.getElementById('tren-nama-kecamatan');
    const tahunInput = document.getElementById('tren-tahun');
    const trenInfoDiv = document.getElementById('tren-info');
    let trenMap = null;

    // Saat tombol diklik
    fetchTrenButton.addEventListener('click', async () => {
        const namaKecamatan = kecamatanInput.value.trim().toLowerCase();
        const tahun = tahunInput.value;

        // Validasi input
        if (!namaKecamatan || !tahun) {
            trenInfoDiv.innerHTML = '<p style="color: red;">Nama kecamatan dan tahun harus diisi.</p>';
            return;
        }

        trenInfoDiv.innerHTML = '<p>Memuat data tren...</p>';

        try {
            const data = await fetchTrenData(namaKecamatan, tahun);
            if (!data || data.length === 0) {
                trenInfoDiv.innerHTML = '<p>Tidak ada data panen untuk kecamatan dan tahun tersebut.</p>';
                return;
            }

            renderTrenInfo(data, namaKecamatan, tahun);
            renderTrenMap(data);
        } catch (error) {
            console.error('Error fetching tren data:', error);
            trenInfoDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan: ${error.message}</p>`;
        }
    });

    // Ambil data tren dari API
    async function fetchTrenData(namaKecamatan, tahun) {
        const response = await fetch(`${API_BASE_URL}/get_komoditas_by_kecamatan_tahun/?nama_kecamatan=${namaKecamatan}&tahun=${tahun}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Gagal mengambil data tren: ${response.statusText}`);
        }
        return await response.json();
    }

    // Tampilkan informasi dalam bentuk teks
    function renderTrenInfo(data, namaKecamatan, tahun) {
        trenInfoDiv.innerHTML = `<h3>Data Panen di ${capitalize(namaKecamatan)} (${tahun})</h3>`;
        const ul = document.createElement('ul');

        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.nama_komoditas} - ${item.total_produksi} ${item.satuan}`;
            ul.appendChild(li);
        });

        trenInfoDiv.appendChild(ul);
    }

    // Tampilkan data pada peta Leaflet
    function renderTrenMap(data) {
        if (!window['tren-map_map_instance']) {
            trenMap = initMap('tren-map');
        } else {
            trenMap = window['tren-map_map_instance'];
        }

        clearMapLayers(trenMap);

        const allGeometries = [];

        data.forEach(item => {
            if (item.geom_geojson) {
                try {
                    const geoJsonFeature = {
                        type: "Feature",
                        properties: {
                            nama_kecamatan: item.nama_kecamatan,
                            nama_komoditas: item.nama_komoditas,
                            produksi: item.total_produksi,
                            satuan: item.satuan
                        },
                        geometry: JSON.parse(item.geom_geojson)
                    };

                    allGeometries.push(geoJsonFeature);

                    const layer = L.geoJSON(geoJsonFeature, {
                        onEachFeature: (feature, layer) => {
                            // Popup
                            layer.bindPopup(
                                `<b>${feature.properties.nama_kecamatan}</b><br>` +
                                `Komoditas: <b>${feature.properties.nama_komoditas}</b><br>` +
                                `Produksi: ${feature.properties.produksi} ${feature.properties.satuan}`
                            );

                            // Label tetap di tengah polygon
                            const center = layer.getBounds().getCenter();
                            const label = L.tooltip({
                                permanent: true,
                                direction: 'center',
                                className: 'kecamatan-label'
                            })
                            .setContent(feature.properties.nama_kecamatan)
                            .setLatLng(center);

                            trenMap.addLayer(label);
                        }
                    }).addTo(trenMap);

                } catch (e) {
                    console.error("GeoJSON parsing error:", e);
                }
            }
        });

        // Atur tampilan peta
        if (allGeometries.length > 0) {
            const featureGroup = L.geoJSON(allGeometries);
            if (featureGroup.getLayers().length > 0) {
                trenMap.fitBounds(featureGroup.getBounds().pad(0.1));
            } else {
                trenMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
            }
        } else {
            trenMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
        }
    }

    // Utility untuk kapitalisasi
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});
