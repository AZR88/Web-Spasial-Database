const map = L.map('map').setView([-6.9, 107.6], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

async function loadData() {
    const tahun = document.getElementById("tahun").value;
    const komoditas = document.getElementById("komoditas").value;
    const res = await fetch(`http://localhost:8000/panen/?komoditas_id=${komoditas}&tahun=${tahun}`);
    const data = await res.json();

    data.forEach(item => {
        const geojson = JSON.parse(item.geom_geojson);
        L.geoJSON(geojson).bindPopup(`${item.nama_kecamatan}<br>Panen: ${item.total_panen} ${item.satuan}`).addTo(map);
    });
}
