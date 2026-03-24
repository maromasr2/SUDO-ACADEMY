// Sudo Academy Engine V2.0 🛡️
const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

firebase.auth().onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const userDisplayName = document.getElementById('userDisplayName');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        currentUserEmail = user.email;
        if(loginBtn) loginBtn.style.display = "none";
        if(userDisplayName) {
            userDisplayName.innerText = user.displayName || "محارب سودو";
            userDisplayName.onclick = () => window.location.href = 'profile.html';
            userDisplayName.style.cursor = "pointer";
        }
        
        const roleDoc = await db.collection("users_roles").doc(user.email).get();
        if (user.email === "liopliop524@gmail.com" || (roleDoc.exists && roleDoc.data().role === 'admin')) {
            if(adminLink) adminLink.style.display = "inline-block";
        }
    } else {
        if(loginBtn) loginBtn.style.display = "block";
    }
    if(grid) loadCourses();
});

async function loadCourses() {
    // جلب الكورسات (سيكون فارغاً في البداية حتى تضيف أنت)
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(async (snapshot) => {
        grid.innerHTML = "";
        if(snapshot.empty) {
            grid.innerHTML = "<p style='text-align:center; color:#666;'>لا توجد كورسات حالياً، ابدأ بإضافة مهام جديدة من لوحة الأدمن.</p>";
            return;
        }
        for (let doc of snapshot.docs) {
            const course = doc.data();
            const courseId = doc.id;
            grid.innerHTML += `
                <div class="card" onclick="handleCourseAccess('${courseId}', '${course.type}', '${course.title}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>انقر لبدء المهمة 🔓</p>
                </div>`;
        }
    });
}

async function handleCourseAccess(id, type, title) {
    if(!currentUserEmail) return alert("سجل دخولك أولاً يا بطل!");
    
    let hasAccess = type === "free" || currentUserEmail === "liopliop524@gmail.com";
    
    if (type === "paid" && currentUserEmail !== "liopliop524@gmail.com") {
        const accessDoc = await db.collection("users_profiles").doc(currentUserEmail).get();
        const allowed = accessDoc.exists ? (accessDoc.data().allowedCourses || []) : [];
        if (allowed.includes(id)) hasAccess = true;
    }

    if(hasAccess) {
        window.location.href = `course-view.html?id=${id}`;
    } else {
        showPaidPopup(title);
    }
}

function showPaidPopup(title) {
    const msg = encodeURIComponent(`أهلاً مروان، أريد تفعيل كورس: ${title}\nإيميلي: ${currentUserEmail}`);
    const popup = document.createElement('div');
    popup.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; justify-content:center; align-items:center; padding:20px;";
    popup.innerHTML = `
        <div class="admin-card" style="max-width:400px; text-align:center; border:1px solid var(--primary);">
            <h2 style="color:var(--primary);">🔒 محتوى مدفوع</h2>
            <p>عذراً، هذا الكورس مخصص للمشتركين فقط. يرجى التواصل مع المهندس مروان لتفعيل الوصول.</p>
            <a href="https://wa.me/${myWhatsapp}?text=${msg}" target="_blank" class="btn-main" style="display:block; text-decoration:none; margin:20px 0; background:#25d366;">تواصل عبر واتساب 📱</a>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#666; cursor:pointer;">إغلاق</button>
        </div>`;
    document.body.appendChild(popup);
}
