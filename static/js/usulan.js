document.addEventListener('DOMContentLoaded', () => {
    const usulanForm = document.getElementById('usulan-form');
    const usulanMessageDiv = document.getElementById('usulan-message');

    usulanForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        usulanMessageDiv.innerHTML = '';

        const formData = new FormData(usulanForm);
        const data = {};
        formData.forEach((value, key) => {
            // Convert 'tahun_usulan' to number
            if (key === 'tahun_usulan') {
                data[key] = parseInt(value, 10);
            } else {
                data[key] = value;
            }
        });

        // Basic validation for date (must not be empty)
        if (!data.tanggal_usulan) {
            usulanMessageDiv.innerHTML = '<p style="color: red;">Tanggal Usulan tidak boleh kosong.</p>';
            return;
        }
         // Basic validation for year (must be a number)
        if (isNaN(data.tahun_usulan)) {
            usulanMessageDiv.innerHTML = '<p style="color: red;">Tahun Usulan harus berupa angka.</p>';
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
            usulanForm.reset(); // Clear the form
        } catch (error) {
            console.error('Error submitting usulan:', error);
            usulanMessageDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan: ${error.message}</p>`;
        }
    });
});