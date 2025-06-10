document.addEventListener('DOMContentLoaded', () => {
    const fetchRekomendasiButton = document.getElementById('fetch-rekomendasi');
    const rekomendasiInfoDiv = document.getElementById('rekomendasi-info');
    let rekomendasiMap = null;

    fetchRekomendasiButton.addEventListener('click', async () => {
        if (!window['rekomendasi-map_map_instance']) {
            rekomendasiMap = initMap('rekomendasi-map');
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
                li.innerHTML = `<b>${item.nama_kecamatan}</b>: Rekomendasi <i>${item.nama_komoditas}</i> (Selisih Produksi: ${item.selisih}) <br>
                                <small>Produksi ${item.tahun_sekarang}: ${item.produksi_sekarang}, Produksi ${item.tahun_sebelumnya}: ${item.produksi_sebelumnya}</small>`;
                ul.appendChild(li);

                if (item.geom) {
                    try {
                        const geoJsonFeature = {
                            "type": "Feature",
                            "properties": {
                                "nama_kecamatan": item.nama_kecamatan,
                                "nama_komoditas": item.nama_komoditas,
                                "kenaikan": item.selisih,
                                "produksi_sekarang": item.produksi_sekarang,
                                "produksi_sebelumnya": item.produksi_sebelumnya
                            },
                            "geometry": JSON.parse(item.geom)
                        };
                        allGeometries.push(geoJsonFeature);

                        const geoJsonLayer = L.geoJSON(geoJsonFeature).addTo(rekomendasiMap);
                        geoJsonLayer.bindPopup(`<b>${item.nama_kecamatan}</b><br>Rekomendasi: ${item.nama_komoditas}<br>Selisih: ${item.selisih}`);
                    } catch (e) {
                        console.error("Error parsing GeoJSON for recommendation", item.nama_kecamatan, e);
                         const errorLi = document.createElement('li');
                        errorLi.innerHTML = `<span style="color:orange;">Kecamatan ${item.nama_kecamatan} (rekomendasi) memiliki data geometri yang tidak valid.</span>`;
                        ul.appendChild(errorLi);
                    }
                } else {
                     const noGeomLi = document.createElement('li');
                     noGeomLi.innerHTML = `<span style="color:grey;">Kecamatan ${item.nama_kecamatan} (rekomendasi) tidak memiliki data geometri.</span>`;
                     ul.appendChild(noGeomLi);
                }
            });
            rekomendasiInfoDiv.appendChild(ul);

            if (allGeometries.length > 0) {
                const featureGroup = L.geoJSON(allGeometries);
                if (featureGroup.getLayers().length > 0) {
                    rekomendasiMap.fitBounds(featureGroup.getBounds().pad(0.1));
                } else if (rekomendasiMap.getLayers().length <=1 ) {
                    rekomendasiMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
                }
            } else if (rekomendasiMap.getLayers().length <=1 ){
                rekomendasiMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
            }

        } catch (error) {
            console.error('Error fetching rekomendasi data:', error);
            rekomendasiInfoDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan: ${error.message}</p>`;
        }
    });
});