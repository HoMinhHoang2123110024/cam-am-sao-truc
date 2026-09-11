import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB7mKURhDMZMajT8BwiEVMa4qHmka-Ol4I",
  authDomain: "cam-am-sao-truc-c93f4.firebaseapp.com",
  databaseURL: "https://cam-am-sao-truc-c93f4-default-rtdb.firebaseio.com",
  projectId: "cam-am-sao-truc-c93f4",
  storageBucket: "cam-am-sao-truc-c93f4.firebasestorage.app",
  messagingSenderId: "696854988441",
  appId: "1:696854988441:web:47aebd800d8687709d9a08",
  measurementId: "G-7L5NGJCFYE"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const appContainer = document.getElementById('app');
let songsData = [];
let selectedCategory = 'All';
let selectedSongId = null;
let currentView = 'user'; // 'user', 'admin', 'login'

// Khởi chạy ứng dụng
function initApp() {
  // Lắng nghe dữ liệu realtime từ Firebase
  const songsRef = ref(db, 'songs');
  onValue(songsRef, (snapshot) => {
    const data = snapshot.val();
    songsData = [];
    if (data) {
      Object.keys(data).forEach(key => {
        songsData.push({ id: key, ...data[key] });
      });
    }
    renderApp();
  });

  // Lắng nghe trạng thái đăng nhập
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentView = 'admin';
    } else {
      currentView = 'user';
    }
    renderApp();
  });
}

function renderApp() {
  if (currentView === 'admin') {
    renderAdminPCLayout();
  } else if (currentView === 'login') {
    renderAdminLoginLayout();
  } else {
    renderUserLayout();
  }
}

// ==========================================
// GIAO DIỆN NGUỜI DÙNG (CHUẨN HOCTHOISAO.VN)
// ==========================================
function renderUserLayout() {
  const categories = ['All', 'Nhạc Trẻ', 'Bolero - Quê Hương', 'Nhạc Hoa', 'Sáo Đô C5', 'Sáo La A4', 'Sáo Rê D5'];

  appContainer.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; min-height: 100vh; color: #334155;">
      
      <!-- Header -->
      <header style="background: #0284c7; color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; cursor: pointer;" id="homeLogo">
          🎶 Cảm Âm Sáo Trúc
        </div>
        <div style="display: flex; gap: 15px; align-items: center;">
          <input type="text" id="searchInput" placeholder="🔍 Tìm bài hát, nốt nhạc..." 
            style="padding: 8px 16px; border-radius: 20px; border: none; outline: none; width: 250px; font-size: 14px;" />
          <button id="navAdminBtn" style="background: #0369a1; border: none; color: white; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 13px;">🔑 Admin</button>
        </div>
      </header>

      <!-- Layout 2 Cột -->
      <div style="max-width: 1200px; margin: 25px auto; display: flex; gap: 30px; padding: 0 15px;">
        
        <!-- Cột Trái: Sidebar Danh Mục -->
        <aside style="width: 260px; flex-shrink: 0; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); height: fit-content;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 2px solid #0284c7; padding-bottom: 8px;">📂 DANH MỤC CẢM ÂM</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${categories.map(cat => `
              <li class="cat-item" data-category="${cat}" 
                  style="padding: 10px 12px; cursor: pointer; border-radius: 6px; font-weight: 500; font-size: 14px; margin-bottom: 4px; transition: 0.2s; background: ${selectedCategory === cat ? '#e0f2fe' : 'transparent'}; color: ${selectedCategory === cat ? '#0284c7' : '#475569'};">
                • ${cat === 'All' ? 'Tất cả bài hát' : cat}
              </li>
            `).join('')}
          </ul>
        </aside>

        <!-- Cột Phải: Nội Dung Bài Hát -->
        <main id="mainContent" style="flex-grow: 1; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${renderSongContent()}
        </main>

      </div>
    </div>
  `;

  // Gắn sự kiện sau khi render HTML
  document.getElementById('homeLogo').addEventListener('click', () => {
    selectedCategory = 'All';
    selectedSongId = null;
    renderUserLayout();
  });

  document.getElementById('navAdminBtn').addEventListener('click', () => {
    if (auth.currentUser) {
      currentView = 'admin';
    } else {
      currentView = 'login';
    }
    renderApp();
  });

  document.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', (e) => {
      selectedCategory = e.currentTarget.getAttribute('data-category');
      selectedSongId = null;
      renderUserLayout();
    });
  });

  document.querySelectorAll('.song-item').forEach(item => {
    item.addEventListener('click', (e) => {
      selectedSongId = e.currentTarget.getAttribute('data-id');
      renderUserLayout();
    });
  });

  const backBtn = document.getElementById('backToListBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      selectedSongId = null;
      renderUserLayout();
    });
  }

  document.getElementById('searchInput').addEventListener('input', (e) => filterSongs(e.target.value));
}

function renderSongContent(filteredList = null) {
  const list = filteredList || (selectedCategory === 'All' ? songsData : songsData.filter(s => s.category === selectedCategory || s.tone === selectedCategory));
  
  if (selectedSongId) {
    const song = songsData.find(s => s.id === selectedSongId);
    if (song) {
      return `
        <button id="backToListBtn" style="margin-bottom: 20px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer;">⬅ Quay lại danh sách</button>
        <h1 style="color: #0369a1; margin-top: 0; font-size: 24px;">Cảm Âm Sáo Trúc ${escapeHTML(song.title)} ${song.artist ? '- ' + escapeHTML(song.artist) : ''}</h1>
        <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 10px 15px; margin-bottom: 20px; border-radius: 0 6px 6px 0; font-size: 14px; font-weight: 600; color: #0369a1;">
          📌 Tone Sáo: ${escapeHTML(song.tone || 'Sáo Đô C5')} | Thể Loại: ${escapeHTML(song.category || 'Nhạc Trẻ')}
        </div>
        <div style="line-height: 1.8; font-size: 16px; white-space: pre-wrap; font-family: 'Courier New', monospace; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9;">${formatNotes(song.content)}</div>
      `;
    }
  }

  if (list.length === 0) {
    return '<p style="text-align: center; color: #94a3b8; padding: 40px;">Chưa có bài hát nào trong mục này.</p>';
  }

  return `
    <h2 style="margin-top: 0; color: #1e293b; font-size: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
      ${selectedCategory === 'All' ? 'Danh Sách Cảm Âm Mới Nhất' : 'Danh Mục: ' + selectedCategory}
    </h2>
    <div style="display: grid; gap: 15px; margin-top: 20px;">
      ${list.map(song => `
        <div class="song-item" data-id="${song.id}" style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: 0.2s; background: #fff;">
          <h3 style="margin: 0 0 6px 0; color: #0284c7; font-size: 18px;">${escapeHTML(song.title)} ${song.artist ? '<span style="font-size: 14px; color: #64748b; font-weight: normal;">- ' + escapeHTML(song.artist) + '</span>' : ''}</h3>
          <div style="font-size: 13px; color: #64748b;">
            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; margin-right: 8px;">${escapeHTML(song.tone || 'Sáo Đô C5')}</span>
            <span>Thể loại: ${escapeHTML(song.category || 'Khác')}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ==========================================
// GIAO DIỆN ADMIN PC
// ==========================================
function renderAdminPCLayout() {
  appContainer.innerHTML = `
    <div style="min-height: 100vh; background: #f1f5f9; padding: 20px; font-family: sans-serif;">
      <div style="max-width: 900px; margin: 0 auto; background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f172a;">🛠️ Trang Quản Trị Cảm Âm</h2>
          <div>
            <button id="viewWebBtn" style="padding: 8px 14px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 8px;">👁️ Xem Giao Diện Web</button>
            <button id="logoutBtn" style="padding: 8px 14px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">Đăng xuất</button>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
          <h3 id="formTitle" style="margin-top:0;">Thêm Bài Hát Cảm Âm Mới</h3>
          <input type="hidden" id="songId" />
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
            <div>
              <label style="font-weight: 600; font-size: 13px;">Tên bài hát *</label>
              <input type="text" id="songTitle" placeholder="VD: Đau Để Trưởng Thành" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="font-weight: 600; font-size: 13px;">Ca sĩ / Tác giả</label>
              <input type="text" id="songArtist" placeholder="VD: OnlyC" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px;">
            <div>
              <label style="font-weight: 600; font-size: 13px;">Tone Sáo Khuyên Dùng</label>
              <select id="songTone" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                <option value="Sáo Đô C5">Sáo Đô C5</option>
                <option value="Sáo La A4">Sáo La A4</option>
                <option value="Sáo Rê D5">Sáo Rê D5</option>
                <option value="Sáo Sol G4">Sáo Sol G4</option>
                <option value="Sáo Sib Bb4">Sáo Sib Bb4</option>
              </select>
            </div>
            <div>
              <label style="font-weight: 600; font-size: 13px;">Thể Loại</label>
              <select id="songCategory" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                <option value="Nhạc Trẻ">Nhạc Trẻ</option>
                <option value="Bolero - Quê Hương">Bolero - Quê Hương</option>
                <option value="Nhạc Hoa">Nhạc Hoa</option>
                <option value="Nhạc Phim">Nhạc Phim</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="font-weight: 600; font-size: 13px;">Nội dung Lời + Nốt Cảm Âm *</label>
            <textarea id="songContent" placeholder="Lời bài hát...&#10;Đô Mi Sol La Sol..." rows="8" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-family: monospace;"></textarea>
          </div>

          <button id="saveBtn" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">💾 Lưu Bài Hát</button>
          <button id="cancelBtn" style="padding: 10px 20px; background: #94a3b8; color: white; border: none; border-radius: 6px; cursor: pointer; display: none;">Hủy</button>
        </div>

        <h3>📚 Danh Sách Bài Hát Hiện Có</h3>
        <div id="adminSongList"></div>

      </div>
    </div>
  `;

  document.getElementById('viewWebBtn').addEventListener('click', () => {
    currentView = 'user';
    renderApp();
  });
  document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
  document.getElementById('saveBtn').addEventListener('click', handleSaveSong);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
  
  renderAdminSongList();
}

function renderAdminSongList() {
  const container = document.getElementById('adminSongList');
  if (!container) return;

  container.innerHTML = songsData.map(song => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e2e8f0;">
      <div>
        <strong>${escapeHTML(song.title)}</strong> <span style="color: #64748b;">(${escapeHTML(song.tone || 'C5')} - ${escapeHTML(song.category || 'Nhạc Trẻ')})</span>
      </div>
      <div>
        <button class="edit-btn" data-id="${song.id}" style="background: #f59e0b; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Sửa</button>
        <button class="delete-btn" data-id="${song.id}" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer;">Xóa</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => editSong(e.target.getAttribute('data-id')));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => deleteSong(e.target.getAttribute('data-id')));
  });
}

function renderAdminLoginLayout() {
  appContainer.innerHTML = `
    <div style="max-width: 360px; margin: 100px auto; padding: 25px; border: 1px solid #cbd5e1; border-radius: 10px; text-align: center; font-family: sans-serif; background: white;">
      <h3 style="margin-top: 0;">🔑 Đăng Nhập Quản Trị</h3>
      <input type="email" id="adminEmail" placeholder="Email Admin" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 6px;" />
      <input type="password" id="adminPassword" placeholder="Mật khẩu" style="width: 100%; padding: 10px; margin-bottom: 15px; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 6px;" />
      <button id="loginBtn" style="width: 100%; padding: 10px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Đăng nhập</button>
      <button id="backUserBtn" style="width: 100%; padding: 8px; background: transparent; color: #64748b; border: none; cursor: pointer; margin-top: 10px;">⬅ Quay lại trang xem</button>
      <p id="loginError" style="color: red; font-size: 13px; margin-top: 10px;"></p>
    </div>
  `;

  document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    signInWithEmailAndPassword(auth, email, password).catch(err => {
      document.getElementById('loginError').innerText = "Đăng nhập lỗi: " + err.message;
    });
  });

  document.getElementById('backUserBtn').addEventListener('click', () => {
    currentView = 'user';
    renderApp();
  });
}

// Xử lý Thêm / Sửa Dữ Liệu
function handleSaveSong() {
  const id = document.getElementById('songId').value;
  const title = document.getElementById('songTitle').value.trim();
  const artist = document.getElementById('songArtist').value.trim();
  const tone = document.getElementById('songTone').value;
  const category = document.getElementById('songCategory').value;
  const content = document.getElementById('songContent').value.trim();

  if (!title || !content) {
    alert('Vui lòng nhập tên bài hát và nốt cảm âm!');
    return;
  }

  const payload = { title, artist, tone, category, content };

  if (id) {
    set(ref(db, `songs/${id}`), payload).then(() => resetForm());
  } else {
    push(ref(db, 'songs'), payload).then(() => resetForm());
  }
}

function editSong(id) {
  const song = songsData.find(s => s.id === id);
  if (!song) return;

  document.getElementById('songId').value = song.id;
  document.getElementById('songTitle').value = song.title || '';
  document.getElementById('songArtist').value = song.artist || '';
  document.getElementById('songTone').value = song.tone || 'Sáo Đô C5';
  document.getElementById('songCategory').value = song.category || 'Nhạc Trẻ';
  document.getElementById('songContent').value = song.content || '';

  document.getElementById('formTitle').innerText = '✏️ Sửa Bài Hát';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

function deleteSong(id) {
  if (confirm('Xóa bài hát này?')) {
    remove(ref(db, `songs/${id}`));
  }
}

function resetForm() {
  if (document.getElementById('songId')) document.getElementById('songId').value = '';
  if (document.getElementById('songTitle')) document.getElementById('songTitle').value = '';
  if (document.getElementById('songArtist')) document.getElementById('songArtist').value = '';
  if (document.getElementById('songContent')) document.getElementById('songContent').value = '';
  if (document.getElementById('formTitle')) document.getElementById('formTitle').innerText = 'Thêm Bài Hát Cảm Âm Mới';
  if (document.getElementById('cancelBtn')) document.getElementById('cancelBtn').style.display = 'none';
}

function filterSongs(keyword) {
  const lower = keyword.toLowerCase();
  const filtered = songsData.filter(s => 
    s.title.toLowerCase().includes(lower) || 
    (s.artist && s.artist.toLowerCase().includes(lower)) ||
    s.content.toLowerCase().includes(lower)
  );
  
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.innerHTML = renderSongContent(filtered);
  }
}

// Tự động tô đậm nốt nhạc
function formatNotes(text) {
  const safeText = escapeHTML(text);
  return safeText.replace(/(Đô|Rê|Mi|Fa|Sol|La|Si|Đô3|Rê3|Mi3|Fa3|Sol3|La3|Si3|Đô2|Rê2|Mi2|Fa2|Sol2|La2|Si2|Do|Re|Sol|La|Si)/gi, 
    '<strong style="color: #b91c1c;">$1</strong>'
  );
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

initApp();