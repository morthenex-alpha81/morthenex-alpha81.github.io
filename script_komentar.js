	// === KONSTANTA ===
const BASE_URL = "https://hnwcewqtiotmlpltoowi.supabase.co/rest/v1";
const KOMENTAR_URL = `${BASE_URL}/Komentar`;
const REAKSI_URL = `${BASE_URL}/ReaksiKomentar`;
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhud2Nld3F0aW90bWxwbHRvb3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Njc4MTcsImV4cCI6MjA2MjI0MzgxN30.aWJtBV0QlPx3AvLOLGfn_1UX2iODO8ijwxz2xD_kyJ4";
const DEV_PASSWORD = "rahasia";

// === VARIABEL GLOBAL ===
let isDev = false;
let realName = localStorage.getItem("playerName")?.trim();
let currentCommentId = null;
let currentUsername = null;
let filterMode = "semua";
let temaSaatIni = "default";
let suaraAktif = true;

// === MODAL ===
function showModal(message, withInput = false) {
  const sndModal = document.getElementById("snd-modal");
  if (sndModal) sndModal.play();
  return new Promise((resolve) => {
    const overlay = document.getElementById("modalOverlay");
    const msg = document.getElementById("modalMessage");
    const input = document.getElementById("modalInput");
    const okBtn = document.getElementById("modalOk");

    msg.textContent = message;
    input.style.display = withInput ? "block" : "none";
    input.value = "";

    overlay.style.display = "flex";
    if (withInput) input.focus();

    function handleClose() {
      overlay.style.display = "none";
      okBtn.removeEventListener("click", handleClick);
      resolve(withInput ? input.value.trim() : true);
    }

    function handleClick() {
      handleClose();
    }

    okBtn.addEventListener("click", handleClick);
  });
}

// === REFERENSI DOM ===
const form = document.getElementById("formKomentar");
const daftar = document.getElementById("daftarKomentar");
const judul = document.getElementById("judul");
const pesanInput = document.getElementById("pesan");
const submitButton = form.querySelector("button");

// === CEK BOLEH KOMENTAR ===
async function bolehKomentar(username, pesanBaru) {
  const now = new Date();
  const satuMenitLalu = new Date(now.getTime() - 60 * 1000);
  const res = await fetch(`${KOMENTAR_URL}?username=eq.${username}&timestamp=gt.${satuMenitLalu.toISOString()}&order=timestamp.desc`, {
    headers: { apikey: API_KEY }
  });
  const data = await res.json();

  if (data.length >= 15) {
    const terakhir = new Date(data[0].timestamp);
    const bedaJam = (now - terakhir) / (1000 * 60 * 60);
    const sisaMs = 8 * 60 * 60 * 1000 - (now - terakhir);
    const sisaMenit = Math.round(sisaMs / 60000);
    const jam = Math.floor(sisaMenit / 60);
    const menit = sisaMenit % 60;
    if (bedaJam < 8) {
      return {
        boleh: false,
        pesan: `Terlalu banyak komentar dalam 1 menit. Tunggu ${jam > 0 ? jam + " jam " : ""}${menit} menit.`
      };
    }
  }

  const duplikat = data.find(k =>
    k.pesan === pesanBaru &&
    new Date(k.timestamp).getMinutes() === now.getMinutes()
  );
  if (duplikat) {
    return {
      boleh: false,
      pesan: `Komentar kamu sama persis dan baru dikirim barusan. Coba tulis yang beda.`
    };
  }

  return { boleh: true };
}

// === KIRIM KOMENTAR ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pesan = pesanInput.value.trim();
  if (!pesan) return await showModal("Tidak boleh kosong");

  const nama = isDev ? "Lastropy" : realName;
  if (!isDev) {
    const cek = await bolehKomentar(nama, pesan);
    if (!cek.boleh) {
      await showModal(cek.pesan);
      return;
    }
  }

  submitButton.disabled = true;
  const payload = {
    username: nama,
    pesan,
    dari_dev: isDev,
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch(KOMENTAR_URL, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();
    document.getElementById("snd-kirim")?.play();
    form.reset();
    



loadKomentar();
  } catch {
    await showModal("Gagal kirim komentar.");
  } finally {
    submitButton.disabled = false;
  }
});

// === MUAT ULANG KOMENTAR ===
async function loadKomentar() {
const res = await fetch(`${KOMENTAR_URL}?select=id,username,pesan,dari_dev,timestamp,Players(avatar)&order=timestamp.asc`, {
  headers: { apikey: API_KEY }
});
  const data = await res.json();
  daftar.innerHTML = "";
  for (const k of data) {
    if (
      filterMode === "semua" ||
      (filterMode === "player" && !k.dari_dev) ||
      (filterMode === "dev" && k.dari_dev)
    ) {
      appendKomentar(k);
    }
  }
  daftar.scrollTop = daftar.scrollHeight;
}

function appendKomentar(k) {
  const item = document.createElement("li");
  item.className = `bubble ${k.dari_dev ? "dev" : "player"}`;

  const avatarFile = k.Players?.avatar || "default.png"; // fallback jika null
  const avatarImg = `<img src="assets/avatars/${avatarFile}" class="avatar-mini" alt="avatar">`;

  item.innerHTML = `
    <div class="avatar-container">
      ${avatarImg}
      <strong>${k.username}${k.dari_dev ? " (dev)" : ""}</strong>
    </div>
    ${
  k.pesan.match(/^stiker-\d+\.png$/)
    ? `<img src="assets/stiker/${k.pesan}" alt="stiker" style="width: 120px; height: 120px;">`
    : k.pesan
}
    <div class="reaksi-bar" id="reaksi-bar-${k.id}"></div>
    <span class="timestamp">${new Date(k.timestamp).toLocaleString("id-ID", {
      hour: "2-digit", minute: "2-digit", day: "numeric", month: "short"
    })}</span>
  `;

  if (isDev) {
    item.ondblclick = (e) => showPopupMenu(e.pageX, e.pageY, k.id, k.username, k.dari_dev);
  }

  daftar.appendChild(item);
  renderReaksi(k.id);
}

// === REAKSI KOMENTAR ===
async function renderReaksi(idKomentar) {
  const bar = document.getElementById(`reaksi-bar-${idKomentar}`);
  bar.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "reaksi-wrapper";

  const button = document.createElement("img");
  button.src = "assets/reaksi-icon.png";
  button.className = "reaksi-btn";
  button.title = "Beri reaksi";

  const popup = document.createElement("div");
  popup.className = "reaksi-popup";

  const res = await fetch(`${REAKSI_URL}?id_komentar=eq.${idKomentar}`, {
    headers: { apikey: API_KEY }
  });
  const data = await res.json();

  const counts = Array(7).fill(0);
  let myReaksi = null;
  data.forEach(r => {
    counts[r.reaksi_ke - 1]++;
    if (r.username === realName) myReaksi = r.reaksi_ke;
  });

  for (let i = 1; i <= 7; i++) {
    const img = document.createElement("img");
    img.src = `assets/reaksi-${i}.png`;
    img.onclick = () => {
      kirimReaksi(idKomentar, i);
      popup.style.display = "none";
    };
    popup.appendChild(img);
  }

  if (myReaksi) {
    const iconSaya = document.createElement("img");
    iconSaya.src = `assets/reaksi-${myReaksi}.png`;
    iconSaya.className = "reaksi-saya";
    iconSaya.title = "Reaksi kamu";
    wrapper.appendChild(iconSaya);
  }

  wrapper.onmouseenter = () => popup.style.display = "flex";
  wrapper.onmouseleave = () => popup.style.display = "none";

  wrapper.appendChild(button);
  wrapper.appendChild(popup);
  bar.appendChild(wrapper);

  const summary = document.createElement("div");
  summary.className = "reaksi-summary";
  counts.forEach((count, i) => {
    if (count > 0) {
      const span = document.createElement("span");
      span.innerHTML = `<img src="assets/reaksi-${i + 1}.png" style="width:16px; vertical-align:middle;"> ${count}`;
      span.style.marginRight = "6px";
      summary.appendChild(span);
    }
  });
  bar.appendChild(summary);
}

async function kirimReaksi(idKomentar, reaksiKe) {
  try {
    const cek = await fetch(`${REAKSI_URL}?id_komentar=eq.${idKomentar}&username=eq.${realName}`, {
      headers: { apikey: API_KEY }
    });
    const data = await cek.json();

    const method = data.length === 0 ? "POST" : "PATCH";
    const url = method === "POST" ? REAKSI_URL : `${REAKSI_URL}?id_komentar=eq.${idKomentar}&username=eq.${realName}`;
    const body = JSON.stringify({ id_komentar: idKomentar, username: realName, reaksi_ke: reaksiKe });

    const res = await fetch(url, {
      method,
      headers: {
        apikey: API_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body
    });

    if (!res.ok) throw new Error(await res.text());
    await new Promise(resolve => setTimeout(resolve, 300));
    document.getElementById("snd-reaksi")?.play();
    renderReaksi(idKomentar);
  } catch (err) {
    await showModal("Gagal kirim/update reaksi:\n" + err.message);
  }
}

// === INISIALISASI NAMA PENGGUNA ===
(async () => {
  while (!realName) {
    realName = await showModal("Masukkan nama kamu dulu ya:", true);
  }
  localStorage.setItem("playerName", realName);
})();

function toggleFilter() {
  const urutan = ["semua", "player", "dev"];
  const idx = (urutan.indexOf(filterMode) + 1) % urutan.length;
  filterMode = urutan[idx];
  



loadKomentar();
  showModal(`Filter komentar: ${filterMode}`);
}

function toggleTema() {
  const pilihan = ["default", "gelap", "hijau"];
  const idx = (pilihan.indexOf(temaSaatIni) + 1) % pilihan.length;
  temaSaatIni = pilihan[idx];
  
  // Simpan tema yang dipilih ke localStorage
  localStorage.setItem("temaDipilih", temaSaatIni);
  
  // Terapkan tema dengan mengganti href stylesheet
  const linkStyle = document.querySelector("link[rel=stylesheet]");
  if (linkStyle) {
    linkStyle.href = `styles-${temaSaatIni}.css`;
  }

  // Tampilkan modal konfirmasi
  showModal(`Tema diganti ke: ${temaSaatIni}`);
}

function toggleSuara() {
  suaraAktif = !suaraAktif;
  document.querySelectorAll("audio").forEach(a => a.muted = !suaraAktif);
  document.getElementById("labelSuara").textContent = suaraAktif ? "Aktif" : "Mati";
}

function tutupMenu() {
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = "none";
}

function tampilkanSurat() {
  showModal(`Halo para pemain Project Orion!\n\nTerima kasih sudah mencoba game ini...`);
}

function refreshKomentar() {
  const snd = document.getElementById("snd-reaksi");
  if (snd && suaraAktif) snd.play();
  



loadKomentar();
}
const temaDisimpan = localStorage.getItem("temaDipilih");
if (temaDisimpan) {
  temaSaatIni = temaDisimpan;
  document.querySelector("link[rel=stylesheet]").href = `styles-${temaSaatIni}.css`;
}
document.getElementById("menuToggle").addEventListener("click", () => {
  const dropdown = document.getElementById("menuDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

loadKomentar();





const stikerBtn = document.getElementById("btnStiker");
const stikerPopup = document.getElementById("stikerPopup");

stikerBtn.addEventListener("click", () => {
  if (stikerPopup.innerHTML.trim() === "") {
  const petunjuk = document.createElement("div");
  petunjuk.textContent = "Double klik untuk mengirim stiker";
  petunjuk.style.fontSize = "16px";
  petunjuk.style.marginBottom = "8px";
  petunjuk.style.width = "100%";
  stikerPopup.appendChild(petunjuk);
    for (let i = 1; i <= 42; i++) {
      const img = document.createElement("img");
      img.src = `assets/stiker/stiker-${i}.png`;
      img.alt = `stiker-${i}`;
      img.title = `stiker-${i}.png`;
      img.ondblclick = () => {
        pesanInput.value = `stiker-${i}.png`;
        stikerPopup.style.display = "none";
        setTimeout(() => form.requestSubmit(), 0);
      };
      stikerPopup.appendChild(img);
    }
  }
  stikerPopup.style.display = stikerPopup.style.display === "flex" ? "none" : "flex";
});