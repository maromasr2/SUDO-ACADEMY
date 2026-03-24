const OWNER_EMAIL = "liopliop524@gmail.com";
let editModeId = null;

firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) { window.location.href = "index.html"; return; }
    
    // فحص الصلاحية
    const roleDoc = await db.collection("users_roles").doc(user.email).get();
    const isAdmin = (roleDoc.exists && roleDoc.data().role === 'admin') || user.email === OWNER_EMAIL;
    
    if (!isAdmin) {
        alert("⛔ منطقة محظورة!");
        window.location.href = "index.html";
    }

    loadAdminData();
});

// إضافة حقل فيديو جديد
function addNewVideoInput(val = "") {
    const container = document.getElementById('videos-inputs');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'video-url';
    input.placeholder = 'رابط الدرس (Embed)';
    input.value = val;
    input.style.marginBottom = "10px";
    container.appendChild(input);
}

// حفظ أو تعديل الكورس
async function saveCourse() {
    const id = document.getElementById('edit-course-id').value;
    const title = document.getElementById('courseTitle').value;
    const type = document.getElementById('courseType').value;
    const urls = document.querySelectorAll('.video-url');
    let videos = [];

    urls.forEach((u, i) => {
        if(u.value) videos.push({ title: `الدرس ${i+1}`, url: u.value.trim() });
    });

    if(!title || videos.length === 0) return alert("اكمل بيانات الكورس!");

    const courseData = { title, type, videos, updatedAt: new Date() };

    try {
        if(id) {
            await db.collection("courses").doc(id).update(courseData);
            alert("✅ تم تحديث الكورس بنجاح!");
        } else {
            await db.collection("courses").add({ ...courseData, createdAt: new Date() });
            alert("🚀 تم نشر الكورس الجديد!");
        }
        location.reload();
    } catch(e) { alert("خطأ: " + e.message); }
}

// تحميل كل بيانات الأدمن
async function loadAdminData() {
    // 1. تحميل إحصائيات وقائمة المستخدمين
    const usersSnap = await db.collection("users_profiles").get();
    document.getElementById('total-users-count').innerText = usersSnap.size;
    
    const table = document.getElementById('users-list-table');
    table.innerHTML = "";
    usersSnap.forEach(doc => {
        const u = doc.data();
        const wa = u.phone ? `https://wa.me/${u.phone.replace(/[^0-9]/g, '')}` : "#";
        table.innerHTML += `
            <tr style="border-bottom:1px solid #222;">
                <td style="padding:10px;">${u.name || 'مجهول'}<br><small style="color:#666;">${doc.id}</small></td>
                <td style="padding:10px;">
                    ${u.phone ? `<a href="${wa}" target="_blank" style="color:#25d366; text-decoration:none;">📱 WhatsApp</a>` : '❌ لا يوجد'}
                </td>
            </tr>`;
    });

    // 2. تحميل وإدارة الكورسات
    db.collection("courses").onSnapshot(snap => {
        const list = document.getElementById('manage-courses-list');
        list.innerHTML = "";
        snap.forEach(doc => {
            const d = doc.data();
            list.innerHTML += `
                <div class="admin-card" style="border:1px solid #333;">
                    <h4>${d.title}</h4>
                    <p style="font-size:12px; color:#888;">نوعه: ${d.type}</p>
                    <button onclick="prepareEdit('${doc.id}')" class="btn-outline" style="padding:5px;">✏️ تعديل</button>
                    <button onclick="deleteCourse('${doc.id}')" class="btn-main" style="padding:5px; background:#600;">🗑️ حذف</button>
                </div>`;
        });
    });
}

async function prepareEdit(id) {
    const doc = await db.collection("courses").doc(id).get();
    const d = doc.data();
    document.getElementById('edit-course-id').value = id;
    document.getElementById('courseTitle').value = d.title;
    document.getElementById('courseType').value = d.type;
    document.getElementById('form-title').innerText = "📝 تعديل الكورس الحالي";
    
    const container = document.getElementById('videos-inputs');
    container.innerHTML = "<label>روابط دروس اليوتيوب (Embed):</label>";
    d.videos.forEach(v => addNewVideoInput(v.url));
    window.scrollTo(0, 0);
}

async function deleteCourse(id) {
    if(confirm("هل أنت متأكد من حذف هذا الكورس نهائياً؟")) {
        await db.collection("courses").doc(id).delete();
    }
}
