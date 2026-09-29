const DATA_MAHASISWA = {
    nama: "NAMA ANDA / TEMAN",
    nim: "535250136"
};

// Fungsi untuk memperbarui tampilan otomatis
function updateIdentitasMahasiswa() {
    // Update Nama
    document.querySelectorAll('#profile-name, #print-name, #sig-name').forEach(el => {
        if (el) el.textContent = DATA_MAHASISWA.nama;
    });
    
    // Update NIM
    document.querySelectorAll('#profile-nim, #print-nim, #sig-nim').forEach(el => {
        if (el) el.textContent = DATA_MAHASISWA.nim;
    });
}

// Jalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', updateIdentitasMahasiswa);
// Data Master Mata Kuliah
const masterCourses = [
  { id: "IF301", name: "Front end programming", sks: 3, sem: 3, day: "Senin", time: "07:30 - 11.10", room: "Lab Pemrog 6", lecturer: "Dr. Eng. Rahmat, M.T.", classCode: "IF-A" },
  { id: "IF302", name: "Computer architecture and Organization", sks: 3, sem: 3, day: "Selasa", time: "09:30 - 11:10", room: "R. 702", lecturer: "Prof. Dr. Ir. Siti, M.Sc.", classCode: "IF-A" },
  { id: "IF303", name: "Mobile Programming", sks: 3, sem: 3, day: "Rabu", time: "13:30 - 15:10", room: "R. 401", lecturer: "Budi Pratama, M.Kom.", classCode: "IF-A" },
  { id: "IF304", name: "Scientific Writing", sks: 3, sem: 3, day: "Kamis", time: "07:45 - 09:10", room: "Lab Mobile", lecturer: "Eka Surya, M.T.", classCode: "IF-B" },
  { id: "IF305", name: "Machine Learning", sks: 4, sem: 3, day: "Kamis", time: "13:30 - 17:10", room: "Lab Jaringan", lecturer: "Dedi Kurniawan, M.T.", classCode: "IF-A" },
];

// App State
let selectedCourseIds = [];
let isSubmitted = false;
const MAX_SKS = 24;

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  renderCourseTable();
  updateSKSWidget();
});

// Render Tabel Pengisian KRS (Tab 1)
function renderCourseTable(filteredData = masterCourses) {
  const tbody = document.getElementById("matkul-list");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (filteredData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-slate" style="padding: 20px;">Mata kuliah tidak ditemukan.</td></tr>`;
    return;
  }

  filteredData.forEach(mk => {
    const isChecked = selectedCourseIds.includes(mk.id);
    const isClash = checkClash(mk.id);

    const tr = document.createElement("tr");
    if (isClash && isChecked) tr.classList.add("clash-row");

    tr.innerHTML = `
      <td class="text-center">
        <input type="checkbox" class="checkbox-lg" value="${mk.id}" 
               ${isChecked ? "checked" : ""} 
               ${isSubmitted ? "disabled" : ""} 
               onchange="toggleCourse('${mk.id}')">
      </td>
      <td><span class="badge badge-slate">${mk.id}</span></td>
      <td>
        <strong class="text-dark">${mk.name}</strong>
        ${isClash && isChecked ? '<br><span class="badge badge-rose"><i class="fa-solid fa-triangle-exclamation"></i> Bentrok</span>' : ''}
      </td>
      <td class="text-center font-bold">${mk.sks}</td>
      <td class="text-center"><span class="badge badge-primary">Sem ${mk.sem}</span></td>
      <td>
        <div class="text-sm"><strong>${mk.day}</strong>, ${mk.time}</div>
        <div class="text-sm text-slate">${mk.room} (${mk.classCode})</div>
      </td>
      <td class="text-sm">${mk.lecturer}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Toggle Selection
function toggleCourse(courseId) {
  const course = masterCourses.find(c => c.id === courseId);
  const currentTotalSKS = calculateTotalSKS();

  if (!selectedCourseIds.includes(courseId)) {
    // Check Overlimit SKS
    if (currentTotalSKS + course.sks > MAX_SKS) {
      showToast(`SKS Melebihi Batas! Maksimal ${MAX_SKS} SKS.`, 'error');
      renderCourseTable();
      return;
    }
    selectedCourseIds.push(courseId);
    showToast(`Menambahkan ${course.name}`);
  } else {
    selectedCourseIds = selectedCourseIds.filter(id => id !== courseId);
    showToast(`Menghapus ${course.name}`);
  }

  updateSKSWidget();
  renderCourseTable();
  renderSummaryAndPrint();
}

// Menghitung Total SKS
function calculateTotalSKS() {
  return masterCourses
    .filter(c => selectedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + c.sks, 0);
}

// Update UI Widget SKS
function updateSKSWidget() {
  const total = calculateTotalSKS();
  const currentSksEl = document.getElementById("current-sks");
  const progressBar = document.getElementById("sks-progress-bar");
  
  if (currentSksEl) currentSksEl.innerText = total;

  const percentage = Math.min((total / MAX_SKS) * 100, 100);
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    if (total === MAX_SKS) {
      progressBar.className = "progress-bar-fill danger";
    } else {
      progressBar.className = "progress-bar-fill";
    }
  }

  // Check Schedule Clash overall
  const hasClash = selectedCourseIds.some(id => checkClash(id));
  const clashAlert = document.getElementById("clash-alert");
  if (clashAlert) {
    if (hasClash) clashAlert.classList.remove("hidden");
    else clashAlert.classList.add("hidden");
  }
}

// Check Bentrok Jadwal
function checkClash(courseId) {
  if (!selectedCourseIds.includes(courseId)) return false;
  const target = masterCourses.find(c => c.id === courseId);

  return selectedCourseIds.some(id => {
    if (id === courseId) return false;
    const other = masterCourses.find(c => c.id === id);
    return target.day === other.day && target.time === other.time;
  });
}

// Search & Filter
function filterCourses() {
  const searchVal = document.getElementById("search-input").value.toLowerCase();
  const semVal = document.getElementById("semester-filter").value;

  const filtered = masterCourses.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchVal) || 
                        c.id.toLowerCase().includes(searchVal) || 
                        c.lecturer.toLowerCase().includes(searchVal);
    const matchSem = semVal === "all" || c.sem.toString() === semVal;
    return matchSearch && matchSem;
  });

  renderCourseTable(filtered);
}

// Select Paket Sem 5 Automatis
function selectRecommendedPackage() {
  if (isSubmitted) return;
  const sem5Ids = masterCourses.filter(c => c.sem === 5 && c.id !== "IF307").map(c => c.id);
  selectedCourseIds = [...new Set([...selectedCourseIds, ...sem5Ids])];
  
  updateSKSWidget();
  renderCourseTable();
  renderSummaryAndPrint();
  showToast("Paket Rekomendasi Semester 5 Berhasil Dipilih!");
}

// Render Data ke Tab 2 (Ringkasan) & Tab 3 (Cetak)
function renderSummaryAndPrint() {
  const ringkasanTbody = document.getElementById("ringkasan-list");
  const cetakTbody = document.getElementById("cetak-list");
  const selectedObjects = masterCourses.filter(c => selectedCourseIds.includes(c.id));
  const totalSks = calculateTotalSKS();

  if (ringkasanTbody) {
    ringkasanTbody.innerHTML = "";
    if (selectedObjects.length === 0) {
      ringkasanTbody.innerHTML = `<tr><td colspan="6" class="text-center text-slate" style="padding: 20px;">Belum ada mata kuliah yang dipilih.</td></tr>`;
    } else {
      selectedObjects.forEach((mk, idx) => {
        ringkasanTbody.innerHTML += `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><span class="badge badge-slate">${mk.id}</span></td>
            <td><strong>${mk.name}</strong></td>
            <td class="text-center font-bold">${mk.sks}</td>
            <td>${mk.day}, ${mk.time} (${mk.room})</td>
            <td>${mk.lecturer}</td>
          </tr>
        `;
      });
    }
  }

  if (cetakTbody) {
    cetakTbody.innerHTML = "";
    if (selectedObjects.length === 0) {
      cetakTbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 20px;">Belum ada data KRS.</td></tr>`;
    } else {
      selectedObjects.forEach((mk, idx) => {
        cetakTbody.innerHTML += `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td>${mk.id}</td>
            <td><strong>${mk.name}</strong></td>
            <td class="text-center">${mk.sks}</td>
            <td class="text-center">${mk.classCode}</td>
            <td>${mk.day}, ${mk.time} (${mk.room})</td>
            <td>${mk.lecturer}</td>
          </tr>
        `;
      });
    }
  }

  document.getElementById("total-sks-ringkasan").innerText = `${totalSks} SKS`;
  document.getElementById("total-sks-cetak").innerText = totalSks;
}

// Modal Konfirmasi Pengajuan
function openConfirmModal() {
  if (selectedCourseIds.length === 0) {
    showToast("Pilih minimal 1 mata kuliah terlebih dahulu!", "error");
    return;
  }
  
  if (selectedCourseIds.some(id => checkClash(id))) {
    showToast("Jadwal kuliah bentrok! Harap perbaiki pilihan.", "error");
    return;
  }

  document.getElementById("modal-sks-count").innerText = calculateTotalSKS();
  document.getElementById("confirm-modal").classList.remove("hidden");
}

function closeConfirmModal() {
  document.getElementById("confirm-modal").classList.add("hidden");
}

// Submit KRS Logic
function submitKRS() {
  isSubmitted = true;
  closeConfirmModal();

  // Update Status UI Badge
  const badge = document.getElementById("status-badge");
  badge.className = "badge badge-emerald";
  badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Disetujui Dosen PA`;

  // Disable Buttons
  const btnSubmit = document.getElementById("btn-pengajuan");
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-check-double"></i> KRS Terkunci & Disetujui`;
  btnSubmit.className = "btn btn-outline btn-lg w-full";

  // Enable Tab Cetak
  document.getElementById("btn-tab-cetak").disabled = false;

  renderCourseTable();
  showToast("KRS Berhasil Diajukan & Disetujui!");
  switchTab("cetak");
}

// Switch Tab Navigation
function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).classList.add("active");

  const btnIndex = tabName === 'pengisian' ? 0 : tabName === 'ringkasan' ? 1 : 2;
  document.querySelectorAll(".tab-btn")[btnIndex].classList.add("active");

  if (tabName === 'ringkasan' || tabName === 'cetak') {
    renderSummaryAndPrint();
  }
}

// Toast Notification Helper
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  
  const icon = type === "error" ? "fa-circle-xmark" : "fa-circle-info";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}