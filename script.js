// ==========================================
// DATA PRODUK
// ==========================================

const daftarBarang = [
    { id: 1, nama: "Beras 5 Kg", harga: 75000, emoji: "🍚" },
    { id: 2, nama: "Minyak Goreng 1 L", harga: 18000, emoji: "🛢️" },
    { id: 3, nama: "Gula Pasir 1 Kg", harga: 17000, emoji: "🍬" },
    { id: 4, nama: "Tepung Terigu 1 Kg", harga: 12000, emoji: "🌾" },
    { id: 5, nama: "Mie Instan", harga: 3000, emoji: "🍜" },
    { id: 6, nama: "Air Mineral Dus", harga: 45000, emoji: "💧" },
    { id: 7, nama: "Kopi Sachet", harga: 2000, emoji: "☕" },
    { id: 8, nama: "Telur 1 Kg", harga: 30000, emoji: "🥚" }
];

let keranjang = [];
let metodePembayaran = "Tunai";
let transaksiTerakhir = null;

const KUNCI_TRANSAKSI = "grosirSimamora_transaksi_v1";


// ==========================================
// PENYIMPANAN TRANSAKSI
// ==========================================

function ambilTransaksiTersimpan() {
    try {
        const data = JSON.parse(
            localStorage.getItem(KUNCI_TRANSAKSI) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Gagal membaca riwayat transaksi:", error);
        return [];
    }
}

let riwayatTransaksi = ambilTransaksiTersimpan();

function simpanTransaksi(data) {
    try {
        riwayatTransaksi.unshift(data);

        localStorage.setItem(
            KUNCI_TRANSAKSI,
            JSON.stringify(riwayatTransaksi)
        );

        return true;

    } catch (error) {
        riwayatTransaksi.shift();

        console.error("Gagal menyimpan transaksi:", error);

        alert(
            "Transaksi tidak dapat disimpan. Periksa penyimpanan browser."
        );

        return false;
    }
}


// ==========================================
// FUNGSI DASAR
// ==========================================

const el = id => document.getElementById(id);

const rupiah = angka => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
}).format(angka);


// ==========================================
// MENAMPILKAN PRODUK
// ==========================================

function tampilkanBarang() {
    el("barang").innerHTML =
        '<option value="">Pilih barang</option>';

    daftarBarang.forEach(item => {
        const opsi = document.createElement("option");

        opsi.value = item.id;

        opsi.textContent =
            `${item.nama} - ${rupiah(item.harga)}`;

        el("barang").appendChild(opsi);
    });

    el("jumlahProduk").textContent = daftarBarang.length;

    cariProduk();
}


// ==========================================
// PENCARIAN PRODUK
// ==========================================

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


// ==========================================
// MEMILIH BARANG
// ==========================================

el("barang").addEventListener("change", () => {
    const item = daftarBarang.find(
        b => b.id === Number(el("barang").value)
    );

    el("harga").value = item ? item.harga : "";
});


// ==========================================
// MENAMBAHKAN BARANG KE KERANJANG
// ==========================================

function tambahBarang() {
    const id = Number(el("barang").value);

    const jumlah = Number(el("jumlah").value);

    const harga = Number(el("harga").value);

    const produk = daftarBarang.find(b => b.id === id);

    if (!produk) {
        alert("Pilih produk terlebih dahulu.");
        return;
    }

    if (
        !Number.isSafeInteger(jumlah) ||
        jumlah < 1 ||
        !Number.isSafeInteger(harga) ||
        harga < 0
    ) {
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


// ==========================================
// MENGUBAH JUMLAH BARANG
// ==========================================

function ubahJumlah(index, perubahan) {
    keranjang[index].jumlah += perubahan;

    if (keranjang[index].jumlah <= 0) {
        keranjang.splice(index, 1);
    }

    tampilkanKeranjang();
}


// ==========================================
// MENAMPILKAN KERANJANG
// ==========================================

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

        subtotal.textContent =
            rupiah(item.harga * item.jumlah);

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
        (sum, item) => sum + item.jumlah,
        0
    );

    hitungTotal();
}


// ==========================================
// MENGHITUNG TOTAL PEMBAYARAN
// ==========================================

function hitungTotal() {
    const subtotal = keranjang.reduce(
        (sum, item) => sum + item.harga * item.jumlah,
        0
    );

    let diskon = Number(el("diskon").value) || 0;

    diskon = Math.min(100, Math.max(0, diskon));

    const potongan = Math.round(
        subtotal * diskon / 100
    );

    const totalBayar = subtotal - potongan;

    const uang = Number(el("uang").value) || 0;

    const kembalian = Math.max(
        0,
        uang - totalBayar
    );

    el("total").textContent = rupiah(subtotal);

    el("potongan").textContent = rupiah(potongan);

    el("totalBayar").textContent = rupiah(totalBayar);

    el("ringkasanTotal").textContent = rupiah(totalBayar);

    el("kembalian").textContent = rupiah(kembalian);

    return {
        subtotal,
        potongan,
        totalBayar,
        uang,
        kembalian
    };
}


// ==========================================
// METODE PEMBAYARAN
// ==========================================

el("pilihanPembayaran").addEventListener("click", event => {
    const tombol = event.target.closest("[data-metode]");

    if (!tombol) return;

    metodePembayaran = tombol.dataset.metode;

    document.querySelectorAll(".payment-option").forEach(btn => {
        btn.classList.toggle(
            "selected",
            btn === tombol
        );
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


// ==========================================
// PROSES PEMBAYARAN
// ==========================================

function bayar() {
    if (!keranjang.length) {
        alert("Keranjang masih kosong.");
        return;
    }

    const hasil = hitungTotal();

    if (
        !Number.isSafeInteger(hasil.uang) ||
        hasil.uang < 0
    ) {
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
            alert(
                "Untuk pembayaran non-tunai, masukkan nominal tepat sesuai total."
            );
            return;
        }

        const konfirmasi = confirm(
            `Pastikan pembayaran ${metodePembayaran} sudah berhasil diterima. Lanjutkan pencatatan transaksi?`
        );

        if (!konfirmasi) return;
    }

    transaksiTerakhir = {
        nomor: "TRX-" + Date.now(),

        tanggal: new Date().toISOString(),

        metode: metodePembayaran,

        barang: keranjang.map(item => ({ ...item })),

        ...hasil
    };

    // Simpan transaksi
    if (!simpanTransaksi(transaksiTerakhir)) {
        return;
    }

    // Tampilkan struk
    tampilkanStruk({
        ...transaksiTerakhir,
        tanggal: new Date(transaksiTerakhir.tanggal)
    });

    // Perbarui riwayat
    tampilkanDaftarTransaksi();

    el("modalStruk").classList.remove("hidden");

    el("pesan").textContent =
        "Transaksi berhasil dicatat.";
}


// ==========================================
// MENAMPILKAN STRUK
// ==========================================

function tampilkanStruk(data) {
    el("strukTanggal").textContent =
        "Tanggal: " + data.tanggal.toLocaleString("id-ID");

    el("strukMetode").textContent =
        "Metode: " + data.metode;

    el("strukSubtotal").textContent =
        rupiah(data.subtotal);

    el("strukDiskon").textContent =
        rupiah(data.potongan);

    el("strukTotal").textContent =
        rupiah(data.totalBayar);

    el("strukUang").textContent =
        "Dibayar: " + rupiah(data.uang);

    el("strukKembalian").textContent =
        data.metode === "Tunai"
            ? "Kembalian: " + rupiah(data.kembalian)
            : "Status: Pembayaran dikonfirmasi kasir";

    const daftar = el("strukBarang");

    daftar.innerHTML = "";

    data.barang.forEach(item => {
        const baris = document.createElement("p");

        const nama = document.createElement("span");

        const total = document.createElement("b");

        nama.textContent =
            `${item.nama} × ${item.jumlah}`;

        total.textContent =
            rupiah(item.harga * item.jumlah);

        baris.append(nama, total);

        daftar.appendChild(baris);
    });
}


// ==========================================
// TRANSAKSI BARU
// ==========================================

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


// ==========================================
// TOMBOL DAN EVENT KASIR
// ==========================================

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

el("btnCetak").addEventListener("click", () => {
    window.print();
});

el("btnSelesai").addEventListener("click", transaksiBaru);


// ==========================================
// NAVIGASI HALAMAN
// ==========================================

function bukaHalaman(halaman) {
    const tampilKasir = halaman === "kasir";

    el("ringkasanKasir").hidden = !tampilKasir;

    el("areaKasir").hidden = !tampilKasir;

    el("halamanTransaksi").hidden = tampilKasir;

    el("judulHalaman").textContent =
        tampilKasir ? "Kasir Penjualan" : "Transaksi";

    document.querySelectorAll(
        ".sidebar .menu[data-page]"
    ).forEach(menu => {
        menu.classList.toggle(
            "active",
            menu.dataset.page === halaman
        );
    });

    if (!tampilKasir) {
        tampilkanDaftarTransaksi();
    }
}


// ==========================================
// MENAMPILKAN RIWAYAT TRANSAKSI
// ==========================================

function tampilkanDaftarTransaksi(kataKunci = "") {
    const tbody = el("daftarTransaksi");

    if (!tbody) return;

    tbody.innerHTML = "";

    const kata = kataKunci.trim().toLowerCase();

    const hasil = riwayatTransaksi.filter(trx =>
        String(trx.nomor || "").toLowerCase().includes(kata) ||

        String(trx.metode || "").toLowerCase().includes(kata) ||

        (Array.isArray(trx.barang) &&
            trx.barang.some(item =>
                String(item.nama || "").toLowerCase().includes(kata)
            ))
    );

    if (!hasil.length) {
        const tr = document.createElement("tr");

        const td = document.createElement("td");

        td.colSpan = 6;

        td.className = "empty-cell";

        td.textContent = riwayatTransaksi.length
            ? "Transaksi yang dicari tidak ditemukan."
            : "Belum ada transaksi. Transaksi yang berhasil dibayar akan muncul di sini.";

        tr.appendChild(td);

        tbody.appendChild(tr);

    } else {
        hasil.forEach(trx => {
            const tr = document.createElement("tr");

            const tanggal = new Date(trx.tanggal);

            const namaProduk = (trx.barang || [])
                .map(item =>
                    `${item.nama} (${item.jumlah})`
                )
                .join(", ");

            const nilai = [
                trx.nomor || "-",

                Number.isNaN(tanggal.getTime())
                    ? "-"
                    : tanggal.toLocaleString("id-ID"),

                namaProduk || "-",

                trx.metode || "-",

                rupiah(Number(trx.totalBayar) || 0)
            ];

            nilai.forEach(teks => {
                const td = document.createElement("td");

                td.textContent = teks;

                tr.appendChild(td);
            });

            const aksi = document.createElement("td");

            const tombol = document.createElement("button");

            tombol.type = "button";

            tombol.className = "btn btn-light";

            tombol.textContent = "Lihat";

            tombol.addEventListener("click", () => {
                lihatDetailTransaksi(trx);
            });

            aksi.appendChild(tombol);

            tr.appendChild(aksi);

            tbody.appendChild(tr);
        });
    }

    el("totalRiwayat").textContent =
        `${riwayatTransaksi.length} transaksi tersimpan`;
}


// ==========================================
// DETAIL TRANSAKSI
// ==========================================

function lihatDetailTransaksi(trx) {
    const wadah = el("isiDetailTransaksi");

    wadah.innerHTML = "";

    const tambahBaris = (label, nilai) => {
        const p = document.createElement("p");

        const b = document.createElement("b");

        b.textContent = nilai;

        p.textContent = label + ": ";

        p.appendChild(b);

        wadah.appendChild(p);
    };

    tambahBaris("Nomor", trx.nomor || "-");

    tambahBaris(
        "Tanggal",
        new Date(trx.tanggal).toLocaleString("id-ID")
    );

    tambahBaris("Metode", trx.metode || "-");

    (trx.barang || []).forEach(item => {
        tambahBaris(
            item.nama,
            `${item.jumlah} x ${rupiah(item.harga)} = ${rupiah(item.jumlah * item.harga)}`
        );
    });

    tambahBaris(
        "Subtotal",
        rupiah(trx.subtotal || 0)
    );

    tambahBaris(
        "Diskon",
        rupiah(trx.potongan || 0)
    );

    tambahBaris(
        "Total",
        rupiah(trx.totalBayar || 0)
    );

    tambahBaris(
        "Dibayar",
        rupiah(trx.uang || 0)
    );

    if (trx.metode === "Tunai") {
        tambahBaris(
            "Kembalian",
            rupiah(trx.kembalian || 0)
        );
    }

    el("modalDetailTransaksi").classList.remove("hidden");
}


// ==========================================
// EVENT MENU SIDEBAR
// ==========================================

document.querySelectorAll(
    ".sidebar .menu[data-page]"
).forEach(menu => {

    menu.addEventListener("click", () => {
        bukaHalaman(menu.dataset.page);
    });

    menu.addEventListener("keydown", event => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            bukaHalaman(menu.dataset.page);
        }
    });
});


// ==========================================
// TOMBOL KEMBALI KE KASIR
// ==========================================

el("btnKembaliKasir").addEventListener("click", () => {
    bukaHalaman("kasir");
});


// ==========================================
// PENCARIAN TRANSAKSI
// ==========================================

el("cariTransaksi").addEventListener("input", event => {
    tampilkanDaftarTransaksi(event.target.value);
});


// ==========================================
// MENUTUP DETAIL TRANSAKSI
// ==========================================

el("tutupDetailTransaksi").addEventListener("click", () => {
    el("modalDetailTransaksi").classList.add("hidden");
});

el("modalDetailTransaksi").addEventListener("click", event => {
    if (event.target === el("modalDetailTransaksi")) {
        el("modalDetailTransaksi").classList.add("hidden");
    }
});


// ==========================================
// MENJALANKAN APLIKASI
// ==========================================

tampilkanBarang();

tampilkanKeranjang();

tampilkanDaftarTransaksi();
