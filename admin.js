const OWNER_EMAIL = "liopliop524@gmail.com";
let editModeId = null;

firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const roleDoc = await db.collection("users_roles").doc(user.email).get();
    const isAdmin = (roleDoc.exists && roleDoc.data().role === 'admin') || user.email === OWNER_EMAIL;
    if (!isAdmin) { alert("⛔ غير مصرح لك!"); window.location.href = "index.html"; }
    loadAdminStats();
});

function addNewVideoInput(val = "") {
    const container = document.getElementById('videos-inputs');
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'video-url'; inp.placeholder = 'رابط الدرس (Embed)';
    inp.value = val;
    container.appendChild(inp);
}

async function saveCourse() {
    const title = document.getElementById('courseTitle').value;
    const type = document.getElementById('courseType').value;
    const urls = document.querySelectorAll('.video-url');
    let videos = [];

    urls.forEach((u, i) => {
        if(u.value) {
            let cleanUrl = u.value.trim().replace("watch?v=", "embed/");
            videos.push({ title: `الدرس ${i+1}`, url: cleanUrl });
        }
    });

    if(!title || videos.length === 0) return alert("اكمل البيانات!");

    const data = { title, type, videos, updatedAt: new Date() };

    if(editModeId) {
        await db.collection("courses").doc(editModeId).update(data);
        alert("✅ تم التعديل!");
        editModeId = null;
        document.querySelector('.admin-card h3').innerText = "➕ إضافة كورس جديد";
    } else {
        await db.collection("courses").add({ ...data, createdAt: new Date() });
        alert("🚀 تم النشر!");
    }
    location.reload();
}

function loadAdminStats() {
    const list = document.getElementById('manage-courses-list');
    const sel = document.getElementById('courseSelect');
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(snap => {
        list.innerHTML = ""; sel.innerHTML = "";
        snap.forEach(doc => {
            const d = doc.data();
            sel.innerHTML += `<option value="${doc.id}">${d.title}</option>`;
            list.innerHTML += `
                <div class="manage-item" style="display:flex; justify-content:space-between; align-items:center; background:#1a1d21; padding:15px; margin-bottom:10px; border-radius:10px;">
                    <span><strong>${d.title}</strong></span>
                    <div>
                        <button onclick="prepareEdit('${doc.id}')" style="background:var(--neon-blue); color:black; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:10px;">تعديل</button>
                        <button onclick="deleteCourse('${doc.id}')" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">حذف</button>
                    </div>
                </div>`;
        });
    });
}

async function prepareEdit(id) {
    editModeId = id;
    const doc = await db.collection("courses").doc(id).get();
    const d = doc.data();
    document.getElementById('courseTitle').value = d.title;
    document.getElementById('courseType').value = d.type;
    document.getElementById('videos-inputs').innerHTML = "";
    d.videos.forEach(v => addNewVideoInput(v.url));
    window.scrollTo(0,0);
    document.querySelector('.admin-card h3').innerText = "📝 تعديل الكورس الحالي";
}

async function deleteCourse(id) { if(confirm("حذف؟")) await db.collection("courses").doc(id).delete(); }

async function activateAccess() {
    const email = document.getElementById('studentEmail').value.trim().toLowerCase();
    const courseId = document.getElementById('courseSelect').value;
    if(!email) return alert("الايميل!");
    await db.collection("access").doc(`${email}_${courseId}`).set({ email, courseId, date: new Date() });
    alert("✅ تم التفعيل!");
}

async function changeUserRole() {
    const email = document.getElementById('userEmailRole').value.trim().toLowerCase();
    const role = document.getElementById('roleSelect').value;
    await db.collection("users_roles").doc(email).set({ role, updatedAt: new Date() });
    alert("🛡️ تم تحديث الرتبة!");
}
