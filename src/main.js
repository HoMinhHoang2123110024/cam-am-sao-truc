import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// 1. Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB7mKURhDMZMajT8BwiEVMa4qHmka-Ol4I",
    authDomain: "cam-am-sao-truc-c93f4.firebaseapp.com",
    databaseURL: "https://cam-am-sao-truc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cam-am-sao-truc-c93f4",
    storageBucket: "cam-am-sao-truc-c93f4.firebasestorage.app",
    messagingSenderId: "696854988441",
    appId: "1:696854988441:web:47aebd800d8687709d9a08",
    measurementId: "G-7L5NGJCFYE"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};

const appContainer = document.getElementById('app');
let songsData = [];

// 2. Khởi tạo App
function initApp() {
    if (isMobileDevice()) {
        renderMobileLayout();
    } else {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                renderAdminPCLayout();
            } else {
                renderAdminLoginLayout();
            }
        });
    }

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
// GIAO DIỆN ADMIN PC CHUYÊN NGHIỆP
// ==========================================
function renderAdminPCLayout() {
    appContainer.innerHTML = `
    <div style="min-height: 100vh; background-color: #f3f4f6; font-family: 'Segoe UI', system-ui, sans-serif; padding: 24px;">
      <div style="max-width: 1000px; margin: 0 auto;">
        
        <!-- Header -->
        <header style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 16px 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">🎶</span>
            <div>
              <h1 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700;">Quản Lý Cảm Âm Sáo Trúc</h1>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">Hệ thống quản trị nội dung bài hát (Admin Dashboard)</p>
            </div>
          </div>
          <button id="logoutBtn" style="background: #ef4444; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px;">
            🚪 Đăng xuất
          </button>
        </header>

        <!-- Form nhập dữ liệu -->
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px; border: 1px solid #e2e8f0;">
          <h2 id="formTitle" style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; display: inline-block;">
            ✨ Thêm Bài Hát Mới
          </h2>
          <input type="hidden" id="songId" />
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Tên bài hát</label>
            <input type="text" id="songTitle" placeholder="Ví dụ: Thần Thoại, Sóng Gió, ..." 
              style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none; box-sizing: border-box; transition: 0.2s;" />
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px;">Nội dung cảm âm</label>
            <textarea id="songContent" placeholder="Nhập nốt cảm âm tại đây (Đô Re Mi Fa Sol...)" rows="7" 
              style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; font-family: monospace; outline: none; box-sizing: border-box; transition: 0.2s; resize: vertical;"></textarea>
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="saveBtn" style="background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px; transition: 0.2s;">
              💾 Lưu Bài Hát
            </button>
            <button id="cancelBtn" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px; display: none;">
              ✖ Hủy bỏ
            </button>
          </div>
        </div>

        <!-- Tìm kiếm & Danh sách -->
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; color: #0f172a;">📚 Danh Sách Bài Hát</h3>
            <input type="text" id="searchInput" placeholder="🔍 Tìm tên hoặc nốt nhạc..." 
              style="width: 320px; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;" />
          </div>
          
          <div id="songList"></div>
        </div>

      </div>
    </div>
  `;

    document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
    document.getElementById('saveBtn').addEventListener('click', handleSaveSong);
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    document.getElementById('searchInput').addEventListener('input', (e) => filterSongs(e.target.value));
}

// Giao diện Đăng nhập Admin
function renderAdminLoginLayout() {
    appContainer.innerHTML = `
    <div style="min-height: 100vh; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px;">
      <div style="background: white; width: 100%; max-width: 400px; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px;">🔑</span>
          <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 22px;">Đăng Nhập Quản Trị</h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Cảm Âm Sáo Trúc Admin</p>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Email</label>
          <input type="email" id="adminEmail" placeholder="admin@example.com" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; box-sizing: border-box; outline: none;" />
        </div>

        <div style="margin-bottom: 24px;">
          <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Mật khẩu</label>
          <input type="password" id="adminPassword" placeholder="••••••••" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; box-sizing: border-box; outline: none;" />
        </div>

        <button id="loginBtn" style="width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer;">Đăng nhập</button>
        <p id="loginError" style="color: #ef4444; margin-top: 14px; text-align: center; font-size: 14px; font-weight: 500;"></p>
      </div>
    </div>
  `;

    document.getElementById('loginBtn').addEventListener('click', () => {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        signInWithEmailAndPassword(auth, email, password).catch(err => {
            document.getElementById('loginError').innerText = "Đăng nhập thất bại: " + err.message;
        });
    });
}

// Giao diện Điện thoại (Viewer)
function renderMobileLayout() {
    appContainer.innerHTML = `
    <div style="padding: 16px; max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', system-ui, sans-serif;">
      <h2 style="text-align: center; color: #1e293b; font-size: 22px; margin-bottom: 16px;">🎶 Cảm Âm Sáo Trúc</h2>
      <input type="text" id="searchInput" placeholder="🔍 Tìm kiếm bài hát..." 
        style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 16px; box-sizing: border-box; margin-bottom: 16px; outline: none;" />
      <div id="songList"></div>
    </div>
  `;

    document.getElementById('searchInput').addEventListener('input', (e) => filterSongs(e.target.value));
}

// ==========================================
// CẬP NHẬT UI DANH SÁCH BÀI HÁT
// ==========================================
function updateSongListUI(filteredList = null) {
    const listContainer = document.getElementById('songList');
    if (!listContainer) return;

    const listToRender = filteredList || songsData;
    const isMobile = isMobileDevice();

    if (listToRender.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #94a3b8;">Không tìm thấy bài hát nào trong dữ liệu.</div>';
        return;
    }

    listContainer.innerHTML = listToRender.map(song => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="margin: 0; font-size: 17px; color: #0f172a; font-weight: 700;">${escapeHTML(song.title)}</h4>
        ${!isMobile ? `
          <div style="display: flex; gap: 8px;">
            <button onclick="editSong('${song.id}')" style="background: #f59e0b; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">✏️ Sửa</button>
            <button onclick="deleteSong('${song.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">🗑️ Xóa</button>
          </div>
        ` : ''}
      </div>
      <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 15px; color: #334155; margin: 0; border: 1px solid #f1f5f9; line-height: 1.5;">${escapeHTML(song.content)}</pre>
    </div>
  `).join('');
}

// Thêm / Sửa
function handleSaveSong() {
    const id = document.getElementById('songId').value;
    const title = document.getElementById('songTitle').value.trim();
    const content = document.getElementById('songContent').value.trim();

    if (!title || !content) {
        alert('Vui lòng nhập đầy đủ tên bài hát và nốt cảm âm!');
        return;
    }

    if (id) {
        set(ref(db, `songs/${id}`), { title, content }).then(() => resetForm());
    } else {
        push(ref(db, 'songs'), { title, content }).then(() => resetForm());
    }
}

window.editSong = (id) => {
    const song = songsData.find(s => s.id === id);
    if (!song) return;

    document.getElementById('songId').value = song.id;
    document.getElementById('songTitle').value = song.title;
    document.getElementById('songContent').value = song.content;
    document.getElementById('formTitle').innerText = '✏️ Sửa Bài Hát';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteSong = (id) => {
    if (confirm('Bạn có chắc muốn xóa bài hát này không?')) {
        remove(ref(db, `songs/${id}`));
    }
};

function resetForm() {
    if (document.getElementById('songId')) document.getElementById('songId').value = '';
    if (document.getElementById('songTitle')) document.getElementById('songTitle').value = '';
    if (document.getElementById('songContent')) document.getElementById('songContent').value = '';
    if (document.getElementById('formTitle')) document.getElementById('formTitle').innerText = '✨ Thêm Bài Hát Mới';
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

initApp();