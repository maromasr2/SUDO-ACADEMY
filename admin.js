const OWNER_EMAIL = "liopliop524@gmail.com";
let editModeId = null;

firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const roleDoc = await db.collection("users_roles").doc(user.email).get();
    const isAdmin = (roleDoc.exists && roleDoc.data().role === 'admin') || user.email === OWNER_EMAIL;
    if (!isAdmin) window.location.href = "index.html";
    loadAdminDashboard();
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
    urls.forEach((u, i) => { if(u.value) videos.push({ title: `الدرس ${i+1}`, url: u.value.trim() }); });

    if(!title || videos.length === 0) return alert("اكمل البيانات!");
    const data = { title, type, videos, updatedAt: new Date() };

    if(editModeId) {
        await db.collection("courses").doc(editModeId).update(data);
        alert("✅ تم التعديل!"); editModeId = null;
    } else {
        await db.collection("courses").add({ ...data, createdAt: new Date() });
        alert("🚀 تم النشر!");
    }
    location.reload();
}

async function loadAdminDashboard() {
    const usersSnap = await db.collection("users_profiles").get();
    const coursesSnap = await db.collection("courses").get();
    const courses = coursesSnap.docs.map(d => ({id: d.id, title: d.data().title}));

    document.getElementById('total-users-count').innerText = usersSnap.size;

    // قائمة الطلاب والصلاحيات
    const table = document.getElementById('users-list-table');
    table.innerHTML = "";
    usersSnap.forEach(doc => {
        const u = doc.data();
        const allowed = u.allowedCourses || [];
        let btnHtml = courses.map(c => {
            const active = allowed.includes(c.id);
            return `<button onclick="toggleAccess('${doc.id}', '${c.id}', ${active})" class="access-btn ${active?'active':''}">
                    ${active ? '✅' : '❌'} ${c.title}</button>`;
        }).join('');

        table.innerHTML += `<tr>
            <td>${u.name || 'مجهول'}<br><small>${doc.id}</small></td>
            <td>${btnHtml}</td>
            <td><a href="https://wa.me/${u.phone}" target="_blank">📱</a></td>
        </tr>`;
    });

    // قائمة إدارة الكورسات
    const mList = document.getElementById('manage-courses-list');
    mList.innerHTML = "";
    coursesSnap.forEach(doc => {
        const d = doc.data();
        mList.innerHTML += `
            <div class="manage-item">
                <span>${d.title} (${d.type})</span>
                <button onclick="prepareEdit('${doc.id}')">✏️</button>
                <button onclick="deleteCourse('${doc.id}')" style="background:#600;">🗑️</button>
            </div>`;
    });
}

async function toggleAccess(email, cId, has) {
    const ref = db.collection("users_profiles").doc(email);
    const d = await ref.get();
    let allowed = d.exists ? (d.data().allowedCourses || []) : [];
    if(has) allowed = allowed.filter(id => id !== cId); else allowed.push(cId);
    await ref.set({ allowedCourses: allowed }, { merge: true });
    loadAdminDashboard();
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
}

async function deleteCourse(id) { if(confirm("حذف؟")) await db.collection("courses").doc(id).delete(); }
