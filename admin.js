// Admin Logic - Vault-74 🛡️
let editModeId = null;

auth.onAuthStateChanged(async (user) => {
    // طرد فوري لو مش مروان حاول يدخل صفحة الأدمن
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
        <input type="text" class="v-title" placeholder="عنوان الدرس" value="${title}">
        <input type="text" class="v-url" placeholder="رابط الـ Embed" value="${url}">
        <textarea class="v-desc" placeholder="وصف الفيديو">${desc}</textarea>
        <hr style="border:1px solid #222">
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
        if(vUrl) videos.push({ title: vTitle, url: vUrl, description: vDesc });
    });

    if(!title || videos.length === 0) return alert("اكمل البيانات!");

    const data = { title, type, videos, updatedAt: new Date() };

    if(editModeId) {
        await db.collection("courses").doc(editModeId).update(data);
        alert("✅ تم تحديث الكورس والوصف!");
    } else {
        await db.collection("courses").add({ ...data, createdAt: new Date() });
        alert("🚀 تم النشر بنجاح!");
    }
    location.reload();
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

async function deleteCourse(id) {
    if(confirm("سيتم حذف الكورس وجميع دروسه، هل أنت متأكد؟")) {
        await db.collection("courses").doc(id).delete();
        alert("🗑️ تم الحذف!");
        location.reload();
    }
}

async function loadAdminDashboard() {
    const usersSnap = await db.collection("users_profiles").get();
    const coursesSnap = await db.collection("courses").get();
    
    // إحصائيات الجيش
    document.getElementById('total-users-count').innerText = usersSnap.size;

    // إدارة الكورسات (قائمة التعديل والحذف)
    const mList = document.getElementById('manage-courses-list');
    mList.innerHTML = "";
    coursesSnap.forEach(doc => {
        const d = doc.data();
        mList.innerHTML += `
            <div class="manage-item" style="display:flex; justify-content:space-between; background:#111; padding:15px; border-radius:10px; margin-bottom:10px;">
                <span>${d.title} (${d.type})</span>
                <div>
                    <button onclick="prepareEdit('${doc.id}')" style="background:#bc13fe; border:none; padding:5px 10px; cursor:pointer;">تعديل</button>
                    <button onclick="deleteCourse('${doc.id}')" style="background:#600; color:white; border:none; padding:5px 10px; cursor:pointer; margin-right:5px;">حذف</button>
                </div>
            </div>`;
    });
    
    // جدول الصلاحيات تظهره هنا بنفس الكود السابق...
}
