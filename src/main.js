import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// 1. Cấu hình Firebase (Thay thế bằng config của bạn)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 2. Tự động kiểm tra thiết bị Mobile hay PC
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
         || window.innerWidth <= 768;
};

const appContainer = document.getElementById('app');
let songsData = [];

// 3. Khởi tạo giao diện dựa trên thiết bị
function initApp() {
  if (isMobileDevice()) {
    renderMobileLayout();
  } else {
    // Trên PC: Kiểm tra trạng thái đăng nhập Admin
    onAuthStateChanged(auth, (user) => {
      if (user) {
        renderAdminPCLayout();
      } else {
        renderAdminLoginLayout();
      }
    });
  }
  
  // Tải dữ liệu Realtime từ Firebase cho cả 2 giao diện
  const songsRef = ref(db, 'songs');
  onValue(songsRef, (snapshot) => {
    const data = snapshot.val();
    songsData = [];
    if (data) {
      Object.keys(data).forEach(key => {
        songsData.push({ id: key, ...data[key] });
      });
    }
    updateSongListUI();
  });
}

// ==========================================
// GIAO DIỆN ĐIỆN THOẠI (VIEW ONLY & TÌM KIẾM)
// ==========================================
function renderMobileLayout() {
  appContainer.innerHTML = `
    <div class="mobile-container" style="padding: 15px; max-width: 600px; margin: 0 auto; font-family: sans-serif;">
      <h2 style="text-align: center; color: #2c3e50;">🎶 Cảm Âm Sáo Trúc</h2>
      
      <input type="text" id="searchInput" placeholder="🔍 Tìm kiếm bài hát..." 
        style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size: 16px; box-sizing: border-box; margin-bottom: 15px;" />

      <div id="songList"></div>
    </div>
  `;

  document.getElementById('searchInput').addEventListener('input', (e) => {
    filterSongs(e.target.value);
  });
}

// ==========================================
// GIAO DIỆN MÁY TÍNH (QUẢN TRỊ ADMIN - THÊM/SỬA/XÓA)
// ==========================================
function renderAdminPCLayout() {
  appContainer.innerHTML = `
    <div class="admin-container" style="padding: 20px; max-width: 900px; margin: 0 auto; font-family: sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>🛠️ Quản Lý Cảm Âm (Admin PC)</h2>
        <button id="logoutBtn" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Đăng xuất</button>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef;">
        <h3 id="formTitle">Thêm Bài Hát Mới</h3>
        <input type="hidden" id="songId" />
        <input type="text" id="songTitle" placeholder="Tên bài hát" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box;" />
        <textarea id="songContent" placeholder="Nội dung cảm âm..." rows="6" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box;"></textarea>
        
        <button id="saveBtn" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">Lưu bài hát</button>
        <button id="cancelBtn" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; display: none;">Hủy</button>
      </div>

      <input type="text" id="searchInput" placeholder="🔍 Tìm kiếm bài hát..." style="width: 100%; padding: 10px; margin-bottom: 15px; box-sizing: border-box;" />
      
      <div id="songList"></div>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
  document.getElementById('saveBtn').addEventListener('click', handleSaveSong);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
  document.getElementById('searchInput').addEventListener('input', (e) => filterSongs(e.target.value));
}

// Giao diện Đăng nhập cho Admin trên PC
function renderAdminLoginLayout() {
  appContainer.innerHTML = `
    <div style="max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; text-align: center; font-family: sans-serif;">
      <h2>🔑 Đăng Nhập Quản Trị</h2>
      <input type="email" id="adminEmail" placeholder="Email Admin" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box;" />
      <input type="password" id="adminPassword" placeholder="Mật khẩu" style="width: 100%; padding: 10px; margin-bottom: 15px; box-sizing: border-box;" />
      <button id="loginBtn" style="width: 100%; padding: 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Đăng nhập</button>
      <p id="loginError" style="color: red; margin-top: 10px;"></p>
    </div>
  `;

  document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    signInWithEmailAndPassword(auth, email, password).catch(err => {
      document.getElementById('loginError').innerText = "Thất bại: " + err.message;
    });
  });
}

// ==========================================
// XỬ LÝ DỮ LIỆU & HIỂN THỊ
// ==========================================
function updateSongListUI(filteredList = null) {
  const listContainer = document.getElementById('songList');
  if (!listContainer) return;

  const listToRender = filteredList || songsData;
  const isMobile = isMobileDevice();

  if (listToRender.length === 0) {
    listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Không tìm thấy bài hát nào.</p>';
    return;
  }

  listContainer.innerHTML = listToRender.map(song => `
    <div style="background: white; border: 1px solid #ddd; padding: 15px; margin-bottom: 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <h3 style="margin-top: 0; color: #34495e;">${escapeHTML(song.title)}</h3>
      <pre style="white-space: pre-wrap; font-family: monospace; background: #f4f4f4; padding: 10px; border-radius: 4px; font-size: 15px;">${escapeHTML(song.content)}</pre>
      
      ${!isMobile ? `
        <div style="margin-top: 10px; text-align: right;">
          <button onclick="editSong('${song.id}')" style="padding: 6px 12px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">Sửa</button>
          <button onclick="deleteSong('${song.id}')" style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Xóa</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Xử lý Thêm / Sửa
function handleSaveSong() {
  const id = document.getElementById('songId').value;
  const title = document.getElementById('songTitle').value.trim();
  const content = document.getElementById('songContent').value.trim();

  if (!title || !content) {
    alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
    return;
  }

  if (id) {
    // Sửa bài hát
    set(ref(db, `songs/${id}`), { title, content })
      .then(() => resetForm());
  } else {
    // Thêm bài hát mới
    push(ref(db, 'songs'), { title, content })
      .then(() => resetForm());
  }
}

// Đưa hàm Edit/Delete ra window scope để chạy được trong HTML string
window.editSong = (id) => {
  const song = songsData.find(s => s.id === id);
  if (!song) return;

  document.getElementById('songId').value = song.id;
  document.getElementById('songTitle').value = song.title;
  document.getElementById('songContent').value = song.content;
  document.getElementById('formTitle').innerText = 'Sửa Bài Hát';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteSong = (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài hát này?')) {
    remove(ref(db, `songs/${id}`));
  }
};

function resetForm() {
  const songId = document.getElementById('songId');
  if (songId) songId.value = '';
  if (document.getElementById('songTitle')) document.getElementById('songTitle').value = '';
  if (document.getElementById('songContent')) document.getElementById('songContent').value = '';
  if (document.getElementById('formTitle')) document.getElementById('formTitle').innerText = 'Thêm Bài Hát Mới';
  if (document.getElementById('cancelBtn')) document.getElementById('cancelBtn').style.display = 'none';
}

function filterSongs(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const filtered = songsData.filter(s => 
    s.title.toLowerCase().includes(lowerKeyword) || 
    s.content.toLowerCase().includes(lowerKeyword)
  );
  updateSongListUI(filtered);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Khởi chạy ứng dụng
initApp();