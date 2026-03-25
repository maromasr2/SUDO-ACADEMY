const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

// مراقبة حالة تسجيل الدخول
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const userDisplayName = document.getElementById('userDisplayName');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        currentUserEmail = user.email;
        if(loginBtn) loginBtn.style.display = "none";
        if(userDisplayName) {
            userDisplayName.innerText = (user.displayName || "محارب سودو").toUpperCase();
            userDisplayName.style.display = "inline-block";
        }
        
        // فحص صلاحية الإدارة
        if (user.email === "liopliop524@gmail.com") {
            if(adminLink) adminLink.style.display = "inline-block";
        }

        // نظام الطرد الفوري (Real-time Kick)
        if (window.location.pathname.includes('course-view.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('id');
            
            db.collection("users_profiles").doc(user.email).onSnapshot(doc => {
                const allowed = doc.exists ? (doc.data().allowedCourses || []) : [];
                db.collection("courses").doc(courseId).get().then(cDoc => {
                    if (cDoc.exists && cDoc.data().type === 'paid' && user.email !== "liopliop524@gmail.com" && !allowed.includes(courseId)) {
                        alert("🛡️ عذراً، تم سحب صلاحية الوصول!");
                        window.location.href = "index.html";
                    }
                });
            });
        }
    } else {
        if(loginBtn) loginBtn.style.display = "block";
        if(window.location.pathname.includes('admin.html')) window.location.href = "index.html";
    }
    if(grid) loadCourses();
});

async function loadCourses() {
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        if(!grid) return;
        grid.innerHTML = "";
        if(snapshot.empty) {
            grid.innerHTML = "<p style='text-align:center; color:#666; grid-column:1/-1;'>لا توجد مهام حالياً في الميدان.</p>";
            return;
        }
        snapshot.forEach(doc => {
            const course = doc.data();
            grid.innerHTML += `
                <div class="card" onclick="handleAccess('${doc.id}', '${course.type}', '${course.title}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>دخول المهمة 🔒</p>
                </div>`;
        });
    });
}

async function handleAccess(id, type, title) {
    if(!currentUserEmail) return alert("سجل دخولك أولاً!");
    let hasAccess = type === "free" || currentUserEmail === "liopliop524@gmail.com";
    
    if (type === "paid" && currentUserEmail !== "liopliop524@gmail.com") {
        const profile = await db.collection("users_profiles").doc(currentUserEmail).get();
        const allowed = profile.exists ? (profile.data().allowedCourses || []) : [];
        if (allowed.includes(id)) hasAccess = true;
    }

    if(hasAccess) window.location.href = `course-view.html?id=${id}`;
    else showPaidPopup(title);
}

function showPaidPopup(title) {
    const msg = encodeURIComponent(`أهلاً مروان، أريد تفعيل كورس: ${title}\nإيميلي: ${currentUserEmail}`);
    const popup = document.createElement('div');
    popup.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px;";
    popup.innerHTML = `
        <div class="admin-card" style="max-width:400px; text-align:center; border:1px solid var(--primary); padding:30px;">
            <h2 style="color:var(--primary);">🔒 محتوى مدفوع</h2>
            <p>تواصل مع المهندس مروان لتفعيل هذا الكورس.</p>
            <a href="https://wa.me/${myWhatsapp}?text=${msg}" target="_blank" class="btn-main" style="display:block; text-decoration:none; margin:20px 0; background:#25d366; color:white;">تواصل عبر واتساب 📱</a>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#666; cursor:pointer;">إغلاق</button>
        </div>`;
    document.body.appendChild(popup);
}

function loginWithGoogle() { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
