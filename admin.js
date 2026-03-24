const OWNER_EMAIL = "liopliop524@gmail.com";
let editModeId = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "index.html"; return; }
    const roleDoc = await db.collection("users_roles").doc(user.email).get();
    const isAdmin = (roleDoc.exists && roleDoc.data().role === 'admin') || user.email === OWNER_EMAIL;
    if (!isAdmin) window.location.href = "index.html";
    loadAdminDashboard();
});

async function loadAdminDashboard() {
    const usersSnap = await db.collection("users_profiles").get();
    const coursesSnap = await db.collection("courses").get();
    const courses = coursesSnap.docs.map(d => ({id: d.id, title: d.data().title}));

    // إحصائيات
    document.getElementById('total-users-count').innerText = usersSnap.size;

    // جدول الجيش
    const table = document.getElementById('users-list-table');
    table.innerHTML = "";
    usersSnap.forEach(doc => {
        const u = doc.data();
        const allowed = u.allowedCourses || [];
        let btnHtml = courses.map(c => {
            const active = allowed.includes(c.id);
            return `<button onclick="toggleAccess('${doc.id}', '${c.id}', ${active})" style="background:${active?'#006400':'#222'}; color:white; border:1px solid #444; margin:2px; padding:4px 8px; border-radius:4px; font-size:10px; cursor:pointer;">
                    ${active ? '✅' : '❌'} ${c.title}</button>`;
        }).join('');

        table.innerHTML += `
            <tr style="border-bottom:1px solid #222;">
                <td style="padding:15px;">${u.name || 'مجهول'}<br><small style="color:#666;">${doc.id}</small></td>
                <td>${btnHtml}</td>
                <td style="text-align:center;">
                    ${u.phone ? `<a href="https://wa.me/${u.phone}" target="_blank" style="text-decoration:none;">📱</a>` : '❌'}
                </td>
            </tr>`;
    });

    // قائمة الكورسات للإدارة
    const mList = document.getElementById('manage-courses-list');
    mList.innerHTML = "";
    coursesSnap.forEach(doc => {
        const d = doc.data();
        mList.innerHTML += `
            <div class="manage-item" style="background:#111; padding:15px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between;">
                <span>${d.title} (${d.type})</span>
                <div>
                    <button onclick="prepareEdit('${doc.id}')" style="background:var(--neon-blue); border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:10px;">✏️</button>
                    <button onclick="deleteCourse('${doc.id}')" style="background:#600; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">🗑️</button>
                </div>
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
// دوال prepareEdit و deleteCourse و addNewVideoInput تظل كما هي
