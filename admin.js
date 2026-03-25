let editModeId = null;

auth.onAuthStateChanged(async (user) => {
    if (!user || user.email !== "liopliop524@gmail.com") {
        window.location.href = "index.html";
        return;
    }
    loadAdminDashboard();
});

function addNewVideoInput(title = "", url = "", desc = "") {
    const container = document.getElementById('videos-inputs');
    const div = document.createElement('div');
    div.className = "video-edit-box";
    div.innerHTML = `
        <input type="text" class="v-title" placeholder="عنوان الدرس" value="${title}" style="width:100%; margin-bottom:5px;">
        <input type="text" class="v-url" placeholder="رابط الـ Embed" value="${url}" style="width:100%; margin-bottom:5px;">
        <textarea class="v-desc" placeholder="وصف الفيديو (اختياري)" style="width:100%; margin-bottom:10px; height:60px;">${desc}</textarea>
        <hr style="border:0; border-top:1px solid #222; margin-bottom:10px;">
    `;
    container.appendChild(div);
}

async function saveCourse() {
    const title = document.getElementById('courseTitle').value;
    const type = document.getElementById('courseType').value;
    const boxes = document.querySelectorAll('.video-edit-box');
    let videos = [];

    boxes.forEach(box => {
        const vTitle = box.querySelector('.v-title').value;
        const vUrl = box.querySelector('.v-url').value;
        const vDesc = box.querySelector('.v-desc').value;
        if(vUrl) videos.push({ title: vTitle, url: vUrl.trim(), description: vDesc });
    });

    if(!title || videos.length === 0) return alert("اكمل البيانات!");
    const data = { title, type, videos, updatedAt: new Date() };

    if(editModeId) {
        await db.collection("courses").doc(editModeId).update(data);
        alert("✅ تم التعديل!");
        editModeId = null;
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

    // إحصائيات الجيش
    document.getElementById('total-users-count').innerText = usersSnap.size;

    // جدول المحاربين والصلاحيات
    const table = document.getElementById('users-list-table');
    table.innerHTML = "";
    usersSnap.forEach(doc => {
        const u = doc.data();
        const allowed = u.allowedCourses || [];
        let btns = courses.map(c => {
            const active = allowed.includes(c.id);
            return `<button onclick="toggleAccess('${doc.id}', '${c.id}', ${active})" style="background:${active?'#006400':'#222'}; color:white; border:1px solid #444; cursor:pointer; font-size:10px; padding:4px; margin:2px;">${active?'✅':'❌'} ${c.title}</button>`;
        }).join('');

        table.innerHTML += `
            <tr style="border-bottom:1px solid #222;">
                <td style="padding:10px;">${u.name || 'مجهول'}<br><small style="color:#666;">${doc.id}</small></td>
                <td>${btns}</td>
                <td>${u.phone ? `<a href="https://wa.me/${u.phone}" target="_blank" style="text-decoration:none;">📱 واتساب</a>` : '❌'}</td>
            </tr>`;
    });

    // إدارة الكورسات (تعديل وحذف)
    const mList = document.getElementById('manage-courses-list');
    mList.innerHTML = "";
    coursesSnap.forEach(doc => {
        const d = doc.data();
        mList.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:12px; border-radius:8px; margin-bottom:10px;">
                <span>${d.title} (${d.type})</span>
                <div>
                    <button onclick="prepareEdit('${doc.id}')" style="background:#bc13fe; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">تعديل</button>
                    <button onclick="deleteCourse('${doc.id}')" style="background:#600; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; margin-right:5px;">حذف</button>
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

async function prepareEdit(id) {
    editModeId = id;
    const doc = await db.collection("courses").doc(id).get();
    const d = doc.data();
    document.getElementById('courseTitle').value = d.title;
    document.getElementById('courseType').value = d.type;
    document.getElementById('videos-inputs').innerHTML = "";
    d.videos.forEach(v => addNewVideoInput(v.title, v.url, v.description || ""));
    window.scrollTo(0,0);
}

async function deleteCourse(id) { if(confirm("حذف الكورس نهائياً؟")) { await db.collection("courses").doc(id).delete(); location.reload(); } }
