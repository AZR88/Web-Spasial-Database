document.addEventListener('DOMContentLoaded', () => {
    const usulanForm = document.getElementById('usulan-form');
    const usulanMessageDiv = document.getElementById('usulan-message');

    usulanForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        usulanMessageDiv.innerHTML = '';

        const formData = new FormData(usulanForm);
        const data = {};

        // Ambil dan ubah data sesuai tipe yang diminta oleh API
        formData.forEach((value, key) => {
            if (['tahun', 'id_kecamatan', 'id_komoditas'].includes(key)) {
                data[key] = parseInt(value, 10);
            } else if (key === 'total_produksi') {
                data[key] = parseFloat(value);
            } else {
                data[key] = value.trim();
            }
        });

        // Validasi: semua field harus diisi
        if (!data.nama_pengusul || !data.satuan) {
            usulanMessageDiv.innerHTML = '<p style="color: red;">Semua field harus diisi.</p>';
            return;
        }

        // Validasi angka
        if (
            isNaN(data.tahun) ||
            isNaN(data.id_kecamatan) ||
            isNaN(data.id_komoditas) ||
            isNaN(data.total_produksi)
        ) {
            usulanMessageDiv.innerHTML = '<p style="color: red;">Pastikan semua angka seperti tahun, ID dan total produksi valid.</p>';
            return;
        }

        usulanMessageDiv.innerHTML = '<p>Mengirim usulan...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/usulan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || `Gagal mengirim usulan: ${response.statusText}`);
            }

            usulanMessageDiv.innerHTML = `<p style="color: green;">${result.message}</p>`;
            usulanForm.reset(); // Reset form setelah sukses
        } catch (error) {
            console.error('Error submitting usulan:', error);
            usulanMessageDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan: ${error.message}</p>`;
        }
    });
});
