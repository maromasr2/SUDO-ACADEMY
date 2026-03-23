// حماية الأدمن - استبدل بالإيميل بتاعك
const OWNER_EMAIL = "marwan@gmail.com"; 

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        const roleDoc = await db.collection("users_roles").doc(user.email).get();
        const isAdmin = (roleDoc.exists && roleDoc.data().role === 'admin') || user.email === OWNER_EMAIL;
        if (!isAdmin) {
            alert("⛔ منطقة محظورة!"); window.location.href = "index.html";
        }
    } else {
        window.location.href = "index.html";
    }
});

function addNewVideoInput() {
    const container = document.getElementById('videos-inputs');
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'video-url'; inp.placeholder = 'لينك الدرس التالي';
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

    if(!title || videos.length === 0) return alert("يرجى إكمال البيانات!");
    
    await db.collection("courses").add({ title, type, videos, createdAt: new Date() });
    alert("🚀 تم النشر بنجاح!"); 
    location.reload();
}

async function loadAdminData() {
    const sel = document.getElementById('courseSelect');
    const list = document.getElementById('manage-courses-list');
    
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(snap => {
        sel.innerHTML = ""; list.innerHTML = "";
        snap.forEach(doc => {
            const d = doc.data();
            sel.innerHTML += `<option value="${doc.id}">${d.title}</option>`;
            list.innerHTML += `
                <div class="manage-item">
                    <span><strong>${d.title}</strong> (${d.type})</span>
                    <button onclick="deleteCourse('${doc.id}')" class="btn-main" style="background:#dc3545">حذف</button>
                </div>`;
        });
    });
}

async function activateAccess() {
    const email = document.getElementById('studentEmail').value.trim().toLowerCase();
    const courseId = document.getElementById('courseSelect').value;
    if(!email) return alert("اكتب إيميل الطالب!");
    
    await db.collection("access").doc(`${email}_${courseId}`).set({ email, courseId, date: new Date() });
    alert("✅ تم التفعيل بنجاح!");
}

async function changeUserRole() {
    const email = document.getElementById('userEmailRole').value.trim().toLowerCase();
    const role = document.getElementById('roleSelect').value;
    if(!email) return alert("اكتب الإيميل!");
    
    await db.collection("users_roles").doc(email).set({ role, updatedAt: new Date() });
    alert("🛡️ تم تحديث الصلاحية!");
}

async function deleteCourse(id) { if(confirm("هل أنت متأكد من حذف الكورس نهائياً؟")) await db.collection("courses").doc(id).delete(); }

window.onload = loadAdminData;