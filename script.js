const daftarBarang = [
    { id: 1, nama: "Beras 5 Kg", harga: 75000 },
    { id: 2, nama: "Minyak Goreng 1 L", harga: 18000 },
    { id: 3, nama: "Gula Pasir 1 Kg", harga: 17000 },
    { id: 4, nama: "Tepung Terigu 1 Kg", harga: 12000 },
    { id: 5, nama: "Mie Instan", harga: 3000 },
    { id: 6, nama: "Air Mineral Dus", harga: 45000 },
    { id: 7, nama: "Kopi Sachet", harga: 2000 },
    { id: 8, nama: "Telur 1 Kg", harga: 30000 }
];
let keranjang = [];
let metodePembayaran = "Tunai";
let transaksiTerakhir = null;

const el = id => document.getElementById(id);

const rupiah = angka => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
}).format(angka);

function tampilkanBarang() {
    el("barang").innerHTML = '<option value="">Pilih barang</option>';

    daftarBarang.forEach(item => {
        const opsi = document.createElement("option");
        opsi.value = item.id;
        opsi.textContent = `${item.nama} - ${rupiah(item.harga)}`;
        el("barang").appendChild(opsi);
    });

    el("jumlahProduk").textContent = daftarBarang.length;
    cariProduk();
}

function cariProduk() {
    const kata = el("cariProduk").value.toLowerCase();
    const daftar = el("daftarProduk");
    daftar.innerHTML = "";

    const hasil = daftarBarang.filter(item =>
        item.nama.toLowerCase().includes(kata)
    );

    if (!hasil.length) {
        daftar.textContent = "Produk tidak ditemukan.";
        return;
    }

    hasil.forEach(item => {
        const kartu = document.createElement("button");
        kartu.type = "button";
        kartu.className = "product-card";

        const emoji = document.createElement("span");
        emoji.className = "product-emoji";
        emoji.textContent = item.emoji;

        const nama = document.createElement("span");
        nama.className = "product-name";
        nama.textContent = item.nama;

        const harga = document.createElement("span");
        harga.className = "product-price";
        harga.textContent = rupiah(item.harga);

        kartu.append(emoji, nama, harga);

        kartu.addEventListener("click", () => {
            el("barang").value = item.id;
            el("harga").value = item.harga;
            el("jumlah").value = 1;
            tambahBarang();
        });

        daftar.appendChild(kartu);
    });
}

el("barang").addEventListener("change", () => {
    const item = daftarBarang.find(
        b => b.id === Number(el("barang").value)
    );
    el("harga").value = item ? item.harga : "";
});

function tambahBarang() {
    const id = Number(el("barang").value);
    const jumlah = Number(el("jumlah").value);
    const harga = Number(el("harga").value);
    const produk = daftarBarang.find(b => b.id === id);

    if (!produk) {
        alert("Pilih produk terlebih dahulu.");
        return;
    }

    if (!Number.isSafeInteger(jumlah) || jumlah < 1 ||
        !Number.isSafeInteger(harga) || harga < 0) {
        alert("Jumlah atau harga tidak valid.");
        return;
    }

    const ada = keranjang.find(
        b => b.id === id && b.harga === harga
    );

    if (ada) {
        ada.jumlah += jumlah;
    } else {
        keranjang.push({
            id: produk.id,
            nama: produk.nama,
            emoji: produk.emoji,
            harga,
            jumlah
        });
    }

    el("jumlah").value = 1;
    el("pesan").textContent = "";
    tampilkanKeranjang();
}

function ubahJumlah(index, perubahan) {
    keranjang[index].jumlah += perubahan;

    if (keranjang[index].jumlah <= 0) {
        keranjang.splice(index, 1);
    }

    tampilkanKeranjang();
}

function tampilkanKeranjang() {
    const tbody = el("keranjang");
    tbody.innerHTML = "";

    if (keranjang.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.className = "empty-cell";
        td.textContent = "Keranjang masih kosong";
        tr.appendChild(td);
        tbody.appendChild(tr);
    }

    keranjang.forEach((item, index) => {
        const tr = document.createElement("tr");

        const nama = document.createElement("td");
        nama.textContent = item.nama;

        const harga = document.createElement("td");
        harga.textContent = rupiah(item.harga);

        const qty = document.createElement("td");
        const kontrol = document.createElement("div");
        kontrol.className = "qty-control";

        const kurang = document.createElement("button");
        kurang.textContent = "−";
        kurang.type = "button";
        kurang.onclick = () => ubahJumlah(index, -1);

        const jumlah = document.createElement("span");
        jumlah.textContent = item.jumlah;

        const tambah = document.createElement("button");
        tambah.textContent = "+";
        tambah.type = "button";
        tambah.onclick = () => ubahJumlah(index, 1);

        kontrol.append(kurang, jumlah, tambah);
        qty.appendChild(kontrol);

        const subtotal = document.createElement("td");
        subtotal.textContent = rupiah(item.harga * item.jumlah);

        const aksi = document.createElement("td");
        const hapus = document.createElement("button");
        hapus.textContent = "×";
        hapus.type = "button";
        hapus.className = "delete-btn";
        hapus.title = "Hapus barang";
        hapus.onclick = () => {
            keranjang.splice(index, 1);
            tampilkanKeranjang();
        };

        aksi.appendChild(hapus);
        tr.append(nama, harga, qty, subtotal, aksi);
        tbody.appendChild(tr);
    });

    el("jumlahItem").textContent = keranjang.reduce(
        (sum, item) => sum + item.jumlah, 0
    );

    hitungTotal();
}

function hitungTotal() {
    const subtotal = keranjang.reduce(
        (sum, item) => sum + item.harga * item.jumlah, 0
    );

    let diskon = Number(el("diskon").value) || 0;
    diskon = Math.min(100, Math.max(0, diskon));

    const potongan = Math.round(subtotal * diskon / 100);
    const totalBayar = subtotal - potongan;
    const uang = Number(el("uang").value) || 0;
    const kembalian = Math.max(0, uang - totalBayar);

    el("total").textContent = rupiah(subtotal);
    el("potongan").textContent = rupiah(potongan);
    el("totalBayar").textContent = rupiah(totalBayar);
    el("ringkasanTotal").textContent = rupiah(totalBayar);
    el("kembalian").textContent = rupiah(kembalian);

    return { subtotal, potongan, totalBayar, uang, kembalian };
}

// Pilihan metode pembayaran
el("pilihanPembayaran").addEventListener("click", event => {
    const tombol = event.target.closest("[data-metode]");
    if (!tombol) return;

    metodePembayaran = tombol.dataset.metode;

    document.querySelectorAll(".payment-option").forEach(btn => {
        btn.classList.toggle("selected", btn === tombol);
    });

    const tunai = metodePembayaran === "Tunai";

    el("labelUang").textContent = tunai
        ? "Uang diterima (Rp)"
        : "Nominal pembayaran / referensi (Rp)";

    el("uang").placeholder = tunai
        ? "Masukkan uang pelanggan"
        : "Masukkan nominal pembayaran";

    el("labelKembalian").textContent = tunai
        ? "Kembalian"
        : "Selisih pembayaran";

    el("uang").value = "";
    hitungTotal();
});

function bayar() {
    if (!keranjang.length) {
        alert("Keranjang masih kosong.");
        return;
    }

    const hasil = hitungTotal();

    if (!Number.isSafeInteger(hasil.uang) || hasil.uang < 0) {
        alert("Masukkan nominal pembayaran yang valid.");
        return;
    }

    if (metodePembayaran === "Tunai") {
        if (hasil.uang < hasil.totalBayar) {
            alert("Uang tunai pelanggan belum cukup.");
            return;
        }
    } else {
        if (hasil.uang !== hasil.totalBayar) {
            alert("Untuk pembayaran non-tunai, masukkan nominal tepat sesuai total.");
            return;
        }

        const konfirmasi = confirm(
            `Pastikan pembayaran ${metodePembayaran} sudah berhasil diterima di aplikasi atau mesin pembayaran. Lanjutkan pencatatan transaksi?`
        );

        if (!konfirmasi) return;
    }

    transaksiTerakhir = {
        tanggal: new Date(),
        metode: metodePembayaran,
        barang: keranjang.map(item => ({ ...item })),
        ...hasil
    };

    tampilkanStruk(transaksiTerakhir);
    el("modalStruk").classList.remove("hidden");
    el("pesan").textContent = "Transaksi berhasil dicatat.";
}

function tampilkanStruk(data) {
    el("strukTanggal").textContent =
        "Tanggal: " + data.tanggal.toLocaleString("id-ID");

    el("strukMetode").textContent =
        "Metode: " + data.metode;

    el("strukSubtotal").textContent = rupiah(data.subtotal);
    el("strukDiskon").textContent = rupiah(data.potongan);
    el("strukTotal").textContent = rupiah(data.totalBayar);
    el("strukUang").textContent = "Dibayar: " + rupiah(data.uang);

    el("strukKembalian").textContent = data.metode === "Tunai"
        ? "Kembalian: " + rupiah(data.kembalian)
        : "Status: Pembayaran dikonfirmasi kasir";

    const daftar = el("strukBarang");
    daftar.innerHTML = "";

    data.barang.forEach(item => {
        const baris = document.createElement("p");
        const nama = document.createElement("span");
        const total = document.createElement("b");

        nama.textContent = `${item.nama} × ${item.jumlah}`;
        total.textContent = rupiah(item.harga * item.jumlah);

        baris.append(nama, total);
        daftar.appendChild(baris);
    });
}

function transaksiBaru() {
    keranjang = [];
    el("uang").value = "";
    el("diskon").value = 0;
    el("barang").value = "";
    el("harga").value = "";
    el("jumlah").value = 1;
    el("pesan").textContent = "";
    el("modalStruk").classList.add("hidden");

    tampilkanKeranjang();
}

el("cariProduk").addEventListener("input", cariProduk);
el("btnTambah").addEventListener("click", tambahBarang);

el("btnKosongkan").addEventListener("click", () => {
    if (!keranjang.length) return;

    if (confirm("Kosongkan semua barang dalam keranjang?")) {
        keranjang = [];
        tampilkanKeranjang();
    }
});

el("diskon").addEventListener("input", hitungTotal);
el("uang").addEventListener("input", hitungTotal);
el("btnBayar").addEventListener("click", bayar);

el("btnCetak").addEventListener("click", () => window.print());
el("btnSelesai").addEventListener("click", transaksiBaru);

tampilkanBarang();
tampilkanKeranjang();