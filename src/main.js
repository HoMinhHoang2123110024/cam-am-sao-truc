import "./style.css";

/* =====================================================
   DỮ LIỆU
===================================================== */

let songs = JSON.parse(
    localStorage.getItem("camAmSongs")
) || [];


/* =====================================================
   APP
===================================================== */

const app = document.querySelector("#app");

render();


/* =====================================================
   GIAO DIỆN
===================================================== */

function render() {

    app.innerHTML = `

        <!-- HEADER -->

        <header class="header">

            <div class="container header-inner">

                <div class="logo">

                    <div class="logo-icon">
                        🎵
                    </div>

                    <div>
                        <h1>Cảm Âm Sáo Trúc</h1>

                        <p>
                            Kho cảm âm cá nhân
                        </p>
                    </div>

                </div>


                <button
                    class="btn btn-primary"
                    id="addSongBtn"
                >
                    + Thêm bài
                </button>

            </div>

        </header>


        <!-- MAIN -->

        <main class="container main">

            <!-- SEARCH -->

            <div class="search-wrapper">

                <span class="search-icon">
                    🔍
                </span>

                <input
                    type="text"
                    id="searchInput"
                    placeholder="Tìm tên bài hát..."
                >

            </div>


            <!-- THỐNG KÊ -->

            <div class="stats">

                <div class="stat-card">

                    <div class="stat-icon">
                        🎵
                    </div>

                    <div>

                        <strong id="songCount">
                            ${songs.length}
                        </strong>

                        <span>
                            Bài cảm âm
                        </span>

                    </div>

                </div>

            </div>


            <!-- DANH SÁCH -->

            <section>

                <div class="section-title">

                    <h2>
                        Danh sách cảm âm
                    </h2>

                </div>

                <div id="songList"></div>

            </section>

        </main>


        <!-- MODAL -->

        <div
            class="modal"
            id="songModal"
        >

            <div class="modal-overlay"></div>


            <div class="modal-content">

                <div class="modal-header">

                    <div>

                        <h2 id="modalTitle">
                            Thêm cảm âm
                        </h2>

                        <p>
                            Tạo bài cảm âm mới
                        </p>

                    </div>

                    <button
                        class="modal-close"
                        id="closeModalBtn"
                    >
                        ×
                    </button>

                </div>


                <!-- FORM -->

                <form id="songForm">

                    <input
                        type="hidden"
                        id="songId"
                    >


                    <div class="form-group">

                        <label>
                            Tên bài hát
                        </label>

                        <input
                            type="text"
                            id="songName"
                            placeholder="Ví dụ: Thủy Chung"
                            required
                        >

                    </div>


                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Ca sĩ
                            </label>

                            <input
                                type="text"
                                id="artist"
                                placeholder="Ví dụ: Thương Võ"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Tone sáo
                            </label>

                            <select id="fluteTone">

                                <option value="C5">
                                    C5
                                </option>

                                <option value="C6">
                                    C6
                                </option>

                                <option value="D">
                                    D
                                </option>

                                <option value="G">
                                    G
                                </option>

                            </select>

                        </div>

                    </div>


                    <!-- LỜI -->

                    <div class="form-group">

                        <label>
                            📝 Lời bài hát
                        </label>

                        <textarea
                            id="lyrics"
                            rows="7"
                            placeholder="Nhập lời bài hát..."
                        ></textarea>

                    </div>


                    <!-- CẢM ÂM -->

                    <div class="form-group">

                        <label>
                            🎶 Cảm âm sáo
                        </label>

                        <textarea
                            id="notes"
                            rows="5"
                            placeholder="Đô Rê Mi Mi Rê Đô..."
                        ></textarea>


                        <!-- NÚT NỐT -->

                        <div class="note-toolbar">

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Đô"
                            >
                                Đô
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Rê"
                            >
                                Rê
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Mi"
                            >
                                Mi
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Fa"
                            >
                                Fa
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Son"
                            >
                                Son
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="La"
                            >
                                La
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Si"
                            >
                                Si
                            </button>

                            <button
                                type="button"
                                class="note-btn"
                                data-note="Đô'"
                            >
                                Đô'
                            </button>

                            <button
                                type="button"
                                class="note-btn special"
                                data-note="|"
                            >
                                Nhịp
                            </button>

                            <button
                                type="button"
                                class="note-btn special"
                                data-note="-"
                            >
                                Ngân
                            </button>

                        </div>

                    </div>


                    <!-- PREVIEW -->

                    <div class="preview">

                        <div class="preview-title">
                            Xem trước
                        </div>

                        <div
                            id="previewNotes"
                            class="preview-notes"
                        >
                            Chưa có cảm âm
                        </div>

                    </div>


                    <!-- BUTTON -->

                    <div class="form-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            id="cancelBtn"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                        >
                            💾 Lưu bài
                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;


    renderSongs();

    setupEvents();

}


/* =====================================================
   HIỂN THỊ DANH SÁCH
===================================================== */

function renderSongs(list = songs) {

    const songList =
        document.querySelector("#songList");

    const songCount =
        document.querySelector("#songCount");


    songCount.textContent = songs.length;


    if (list.length === 0) {

        songList.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🎵
                </div>

                <h3>
                    Chưa có bài cảm âm
                </h3>

                <p>
                    Hãy thêm bài cảm âm đầu tiên của bạn.
                </p>

                <button
                    class="btn btn-primary"
                    id="emptyAddBtn"
                >
                    + Thêm bài đầu tiên
                </button>

            </div>

        `;


        document
            .querySelector("#emptyAddBtn")
            ?.addEventListener(
                "click",
                openAddModal
            );

        return;
    }


    songList.innerHTML = list.map(song => `

        <article class="song-card">

            <div class="song-card-top">

                <div>

                    <h3>
                        🎵 ${escapeHTML(song.name)}
                    </h3>

                    <p class="artist">

                        ${
                            song.artist
                                ? escapeHTML(song.artist)
                                : "Chưa nhập ca sĩ"
                        }

                    </p>

                </div>


                <span class="tone">
                    Sáo ${escapeHTML(song.tone)}
                </span>

            </div>


            <div class="song-content">

                <div class="lyrics-box">

                    <div class="box-title">
                        📝 Lời bài hát
                    </div>

                    <div class="lyrics-text">

                        ${
                            song.lyrics
                                ? formatText(song.lyrics)
                                : "Chưa nhập lời bài hát"
                        }

                    </div>

                </div>


                <div class="notes-box">

                    <div class="box-title">
                        🎶 Cảm âm
                    </div>

                    <div class="notes-text">

                        ${
                            song.notes
                                ? formatText(song.notes)
                                : "Chưa nhập cảm âm"
                        }

                    </div>

                </div>

            </div>


            <div class="song-actions">

                <button
                    class="action-btn edit-btn"
                    data-id="${song.id}"
                >
                    ✏️ Sửa
                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${song.id}"
                >
                    🗑️ Xóa
                </button>

            </div>

        </article>

    `).join("");


    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => editSong(button.dataset.id)
            );

        });


    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => deleteSong(button.dataset.id)
            );

        });

}


/* =====================================================
   EVENT
===================================================== */

function setupEvents() {

    document
        .querySelector("#addSongBtn")
        .addEventListener(
            "click",
            openAddModal
        );


    document
        .querySelector("#closeModalBtn")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .querySelector("#cancelBtn")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .querySelector("#songForm")
        .addEventListener(
            "submit",
            saveSong
        );


    document
        .querySelector("#notes")
        .addEventListener(
            "input",
            updatePreview
        );


    document
        .querySelectorAll(".note-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => addNote(button.dataset.note)
            );

        });


    document
        .querySelector("#searchInput")
        .addEventListener(
            "input",
            searchSongs
        );

}


/* =====================================================
   THÊM BÀI
===================================================== */

function openAddModal() {

    document
        .querySelector("#songModal")
        .classList.add("show");


    document
        .querySelector("#modalTitle")
        .textContent = "Thêm cảm âm";


    document
        .querySelector("#songForm")
        .reset();


    document
        .querySelector("#songId")
        .value = "";


    updatePreview();

}


/* =====================================================
   ĐÓNG MODAL
===================================================== */

function closeModal() {

    document
        .querySelector("#songModal")
        .classList.remove("show");

}


/* =====================================================
   THÊM NỐT
===================================================== */

function addNote(note) {

    const textarea =
        document.querySelector("#notes");


    const start =
        textarea.selectionStart;


    const end =
        textarea.selectionEnd;


    const current =
        textarea.value;


    const before =
        current.substring(0, start);


    const after =
        current.substring(end);


    const spaceBefore =
        before.length > 0 &&
        !before.endsWith(" ")
            ? " "
            : "";


    const spaceAfter =
        after.length > 0 &&
        !after.startsWith(" ")
            ? " "
            : "";


    textarea.value =
        before +
        spaceBefore +
        note +
        spaceAfter +
        after;


    const newPosition =
        (
            before +
            spaceBefore +
            note +
            spaceAfter
        ).length;


    textarea.focus();

    textarea.setSelectionRange(
        newPosition,
        newPosition
    );


    updatePreview();

}


/* =====================================================
   PREVIEW
===================================================== */

function updatePreview() {

    const notes =
        document.querySelector("#notes").value;


    const preview =
        document.querySelector("#previewNotes");


    if (!notes.trim()) {

        preview.textContent =
            "Chưa có cảm âm";

        return;

    }


    preview.textContent = notes;

}


/* =====================================================
   LƯU BÀI
===================================================== */

function saveSong(event) {

    event.preventDefault();


    const id =
        document.querySelector("#songId").value;


    const name =
        document
            .querySelector("#songName")
            .value
            .trim();


    const artist =
        document
            .querySelector("#artist")
            .value
            .trim();


    const tone =
        document
            .querySelector("#fluteTone")
            .value;


    const lyrics =
        document
            .querySelector("#lyrics")
            .value
            .trim();


    const notes =
        document
            .querySelector("#notes")
            .value
            .trim();


    if (!name) {

        alert("Vui lòng nhập tên bài hát!");

        return;

    }


    if (id) {

        const index =
            songs.findIndex(
                song => String(song.id) === String(id)
            );


        if (index !== -1) {

            songs[index] = {

                ...songs[index],

                name,
                artist,
                tone,
                lyrics,
                notes

            };

        }

    } else {

        const newSong = {

            id: Date.now(),

            name,

            artist,

            tone,

            lyrics,

            notes,

            createdAt:
                new Date().toISOString()

        };


        songs.unshift(newSong);

    }


    saveToStorage();

    closeModal();

    render();

}


/* =====================================================
   SỬA BÀI
===================================================== */

function editSong(id) {

    const song =
        songs.find(
            item => String(item.id) === String(id)
        );


    if (!song) return;


    document
        .querySelector("#songModal")
        .classList.add("show");


    document
        .querySelector("#modalTitle")
        .textContent = "Chỉnh sửa cảm âm";


    document
        .querySelector("#songId")
        .value = song.id;


    document
        .querySelector("#songName")
        .value = song.name;


    document
        .querySelector("#artist")
        .value = song.artist;


    document
        .querySelector("#fluteTone")
        .value = song.tone;


    document
        .querySelector("#lyrics")
        .value = song.lyrics;


    document
        .querySelector("#notes")
        .value = song.notes;


    updatePreview();

}


/* =====================================================
   XÓA BÀI
===================================================== */

function deleteSong(id) {

    const song =
        songs.find(
            item => String(item.id) === String(id)
        );


    if (!song) return;


    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa bài "${song.name}" không?`
        );


    if (!confirmed) return;


    songs =
        songs.filter(
            item => String(item.id) !== String(id)
        );


    saveToStorage();

    render();

}


/* =====================================================
   TÌM KIẾM
===================================================== */

function searchSongs(event) {

    const keyword =
        event.target.value
            .trim()
            .toLowerCase();


    if (!keyword) {

        renderSongs();

        return;

    }


    const result =
        songs.filter(song => {

            return (

                song.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                song.artist
                    .toLowerCase()
                    .includes(keyword)

            );

        });


    renderSongs(result);

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveToStorage() {

    localStorage.setItem(
        "camAmSongs",
        JSON.stringify(songs)
    );

}


/* =====================================================
   FORMAT
===================================================== */

function formatText(text) {

    return escapeHTML(text)
        .replace(/\n/g, "<br>");

}


/* =====================================================
   BẢO VỆ HTML
===================================================== */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}