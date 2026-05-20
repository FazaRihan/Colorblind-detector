/* ========================================
   ColorBlind Helper - Script.js
   Aplikasi bantu buta warna (Django)
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  initSimulator();
  initTest();
  initHistory();
});

/* ================== NAVIGATION ================== */
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

/* ================== SIMULATOR BUTA WARNA ================== */
function initSimulator() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const simType = document.getElementById("simulationType");
  const resetBtn = document.getElementById("resetBtn");
  const canvasContainer = document.getElementById("canvasContainer");
  const controls = document.getElementById("simulatorControls");

  let originalImageData = null;

  uploadArea.addEventListener("click", () => fileInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });

  simType.addEventListener("change", () => {
    if (originalImageData) applySimulation(originalImageData);
  });

  resetBtn.addEventListener("click", () => {
    fileInput.value = "";
    canvasContainer.style.display = "none";
    controls.style.display = "none";
    originalImageData = null;
  });

  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 500;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = img.width * scale;
        const h = img.height * scale;

        const origCanvas = document.getElementById("originalCanvas");
        origCanvas.width = w;
        origCanvas.height = h;
        const ctx = origCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        originalImageData = ctx.getImageData(0, 0, w, h);

        const simCanvas = document.getElementById("simulatedCanvas");
        simCanvas.width = w;
        simCanvas.height = h;

        canvasContainer.style.display = "grid";
        controls.style.display = "flex";
        applySimulation(originalImageData);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function applySimulation(imageData) {
    const type = simType.value;
    const titleEl = document.getElementById("simulatedTitle");
    titleEl.textContent =
      "Hasil Simulasi: " + simType.options[simType.selectedIndex].text;

    const simCanvas = document.getElementById("simulatedCanvas");
    const ctx = simCanvas.getContext("2d");
    const data = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    );

    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];
      const [nr, ng, nb] = transformColor(r, g, b, type);
      data.data[i] = nr;
      data.data[i + 1] = ng;
      data.data[i + 2] = nb;
    }
    ctx.putImageData(data, 0, 0);
  }

  // Matriks transformasi buta warna (Brettel/Vienot simplified)
  function transformColor(r, g, b, type) {
    const matrices = {
      protanopia: [
        [0.567, 0.433, 0.0],
        [0.558, 0.442, 0.0],
        [0.0, 0.242, 0.758],
      ],
      deuteranopia: [
        [0.625, 0.375, 0.0],
        [0.7, 0.3, 0.0],
        [0.0, 0.3, 0.7],
      ],
      tritanopia: [
        [0.95, 0.05, 0.0],
        [0.0, 0.433, 0.567],
        [0.0, 0.475, 0.525],
      ],
      achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
      ],
      normal: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    };
    const m = matrices[type] || matrices.normal;
    return [
      clamp(m[0][0] * r + m[0][1] * g + m[0][2] * b),
      clamp(m[1][0] * r + m[1][1] * g + m[1][2] * b),
      clamp(m[2][0] * r + m[2][1] * g + m[2][2] * b),
    ];
  }

  function clamp(v) {
    return Math.max(0, Math.min(255, Math.round(v)));
  }
}

/* ================== TES BUTA WARNA (ISHIHARA) ================== */
function initTest() {
  const form = document.getElementById("testForm");
  const mulaiBtn = document.getElementById("mulaiTesBtn");
  const testArea = document.getElementById("testArea");
  const resultArea = document.getElementById("testResult");
  const ulangiBtn = document.getElementById("ulangiTesBtn");

  let currentQ = 0;
  let score = 0;
  let answered = [];

  // Soal Ishihara sederhana - angka pada piringan dengan warna tertentu
  const questions = [
    {
      number: "12",
      options: ["12", "17", "21", "Tidak ada"],
      correct: "12",
      type: "protanopia",
    },
    {
      number: "5",
      options: ["5", "2", "7", "Tidak ada"],
      correct: "5",
      type: "deuteranopia",
    },
    {
      number: "8",
      options: ["8", "3", "6", "Tidak ada"],
      correct: "8",
      type: "normal",
    },
    {
      number: "74",
      options: ["74", "21", "17", "Tidak ada"],
      correct: "74",
      type: "protanopia",
    },
    {
      number: "6",
      options: ["6", "9", "8", "Tidak ada"],
      correct: "6",
      type: "deuteranopia",
    },
  ];

  mulaiBtn.addEventListener("click", () => {
    const nama = document.getElementById("nama").value.trim();
    const usia = document.getElementById("usia").value;
    if (!nama || !usia) {
      alert("Isi nama dan usia dulu!");
      return;
    }
    form.style.display = "none";
    testArea.style.display = "block";
    resultArea.style.display = "none";
    currentQ = 0;
    score = 0;
    answered = [];
    showQuestion();
  });

  ulangiBtn.addEventListener("click", () => {
    testArea.style.display = "none";
    resultArea.style.display = "none";
    form.style.display = "block";
  });

  function showQuestion() {
    if (currentQ >= questions.length) {
      showResult();
      return;
    }
    const q = questions[currentQ];
    document.getElementById("questionTitle").textContent =
      `Angka berapa yang Anda lihat pada piringan? (Soal ${currentQ + 1})`;
    document.getElementById("progressText").textContent =
      `Soal ${currentQ + 1} dari ${questions.length}`;
    document.getElementById("progressFill").style.width =
      ((currentQ + 1) / questions.length) * 100 + "%";

    drawPlate(q.number, q.type);

    const optContainer = document.getElementById("optionsContainer");
    optContainer.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.onclick = () => answerQuestion(opt, q.correct, btn);
      optContainer.appendChild(btn);
    });
  }

  function drawPlate(number, type) {
    const canvas = document.getElementById("plateCanvas");
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 140;

    // Latar belakang piringan
    ctx.fillStyle = "#e8e0d0";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Buat dot-dot kecil membentuk angka
    const colors = {
      protanopia: {
        bg: ["#8b4513", "#a0522d", "#6b3410", "#c87533"],
        num: ["#d32f2f", "#e57373", "#c62828", "#f44336"],
      },
      deuteranopia: {
        bg: ["#2e7d32", "#388e3c", "#1b5e20", "#4caf50"],
        num: ["#e53935", "#f44336", "#d32f2f", "#ef5350"],
      },
      normal: {
        bg: ["#ff9800", "#ffa726", "#fb8c00", "#ef6c00"],
        num: ["#4caf50", "#66bb6a", "#2e7d32", "#43a047"],
      },
    };
    const c = colors[type];

    // Gambar dot random di luar angka
    const dots = [];
    let attempts = 0;
    while (dots.length < 400 && attempts < 2000) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const r = 3 + Math.random() * 6;
      let overlap = false;
      for (const d of dots) {
        const dx = x - d.x,
          dy = y - d.y;
        if (Math.sqrt(dx * dx + dy * dy) < d.r + r + 1) {
          overlap = true;
          break;
        }
      }
      if (!overlap) dots.push({ x, y, r, isNumber: false });
      attempts++;
    }

    // Buat dot membentuk angka
    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext("2d");
    offCtx.fillStyle = "black";
    offCtx.font = "bold 120px Arial";
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(number, cx, cy);
    const pixels = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);

    for (const d of dots) {
      const idx = (Math.floor(d.y) * offCanvas.width + Math.floor(d.x)) * 4;
      if (pixels.data[idx + 3] > 128) {
        d.isNumber = true;
      }
    }

    // Gambar semua dot
    for (const d of dots) {
      const palette = d.isNumber ? c.num : c.bg;
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function answerQuestion(selected, correct, btn) {
    const allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach((b) => (b.disabled = true));
    const isCorrect = selected === correct;
    if (isCorrect) {
      btn.classList.add("correct");
      score++;
    } else {
      btn.classList.add("wrong");
      allBtns.forEach((b) => {
        if (b.textContent === correct) b.classList.add("correct");
      });
    }
    answered.push({ selected, correct, isCorrect });
    setTimeout(() => {
      currentQ++;
      showQuestion();
    }, 1200);
  }

  function showResult() {
    testArea.style.display = "none";
    resultArea.style.display = "block";
    const pct = score / questions.length;
    let hasil, title, icon, desc;

    if (pct >= 0.8) {
      hasil = "normal";
      title = "Penglihatan Warna Normal";
      icon = "✅";
      desc =
        "Selamat! Penglihatan warna Anda tampak normal berdasarkan tes ini.";
    } else if (pct >= 0.5) {
      hasil = "deuteranopia";
      title = "Kemungkinan Deuteranopia";
      icon = "🟡";
      desc =
        "Ada indikasi kelemahan penglihatan hijau (deuteranopia). Disarankan konsultasi dengan dokter mata.";
    } else if (pct >= 0.2) {
      hasil = "protanopia";
      title = "Kemungkinan Protanopia";
      icon = "🟠";
      desc =
        "Ada indikasi kelemahan penglihatan merah (protanopia). Disarankan konsultasi dengan dokter mata.";
    } else {
      hasil = "total";
      title = "Kemungkinan Buta Warna Berat";
      icon = "🔴";
      desc =
        "Hasil menunjukkan kemungkinan buta warna yang serius. Segera konsultasikan dengan dokter mata.";
    }

    document.getElementById("resultIcon").textContent = icon;
    document.getElementById("resultTitle").textContent = title;
    document.getElementById("resultDesc").textContent = desc;
    document.getElementById("resultScore").textContent =
      `${score}/${questions.length}`;

    // Simpan ke server (Django API)
    saveResult(hasil, score, questions.length);
  }

  function saveResult(hasil, skor, total) {
    const nama = document.getElementById("nama").value;
    const usia = document.getElementById("usia").value;
    const jk = document.getElementById("jenisKelamin").value;

    fetch("/api/simpan/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({
        nama,
        usia,
        jenis_kelamin: jk,
        hasil,
        skor,
        total_soal: total,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        if (typeof loadHistory === "function") loadHistory();
      })
      .catch((err) => console.warn("Gagal simpan:", err));
  }
}

/* ================== RIWAYAT ================== */
function initHistory() {
  document
    .getElementById("refreshHistory")
    .addEventListener("click", loadHistory);
  document.getElementById("clearHistory").addEventListener("click", () => {
    if (confirm("Hapus semua riwayat tes?")) {
      fetch("/api/hapus/", {
        method: "POST",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      })
        .then((r) => r.json())
        .then(() => loadHistory());
    }
  });
  loadHistory();
}

function loadHistory() {
  fetch("/api/hasil/")
    .then((r) => r.json())
    .then((res) => {
      const body = document.getElementById("historyBody");
      if (!res.data || res.data.length === 0) {
        body.innerHTML =
          '<tr><td colspan="6" class="empty">Belum ada data</td></tr>';
        return;
      }
      body.innerHTML = res.data
        .map(
          (r) => `
                <tr>
                    <td>${escapeHtml(r.nama)}</td>
                    <td>${r.usia}</td>
                    <td>${r.jenis_kelamin}</td>
                    <td>${r.hasil}</td>
                    <td>${r.skor}/${r.total_soal}</td>
                    <td>${r.tanggal}</td>
                </tr>
            `,
        )
        .join("");
    })
    .catch(() => {
      document.getElementById("historyBody").innerHTML =
        '<tr><td colspan="6" class="empty">Gagal memuat data</td></tr>';
    });
}

/* ================== UTILITIES ================== */
function getCookie(name) {
  let v = null;
  document.cookie.split(";").forEach((c) => {
    c = c.trim();
    if (c.startsWith(name + "="))
      v = decodeURIComponent(c.substring(name.length + 1));
  });
  return v;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Expose loadHistory secara global untuk dipakai di tes
window.loadHistory = loadHistory;
