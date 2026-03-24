// Sudo Academy Engine V4.0 🛡️
const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const userDisplayName = document.getElementById('userDisplayName');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        currentUserEmail = user.email;
        if(loginBtn) loginBtn.style.display = "none";
        if(userDisplayName) {
            userDisplayName.innerText = user.displayName || "محارب سودو";
            userDisplayName.style.display = "inline-block";
            userDisplayName.onclick = () => window.location.href = 'profile.html';
        }
        
        // فحص الأدمن
        if (user.email === "liopliop524@gmail.com") {
            if(adminLink) adminLink.style.display = "inline-block";
        } else {
            const roleDoc = await db.collection("users_roles").doc(user.email).get();
            if (roleDoc.exists && roleDoc.data().role === 'admin') {
                if(adminLink) adminLink.style.display = "inline-block";
            }
        }
    } else {
        if(loginBtn) loginBtn.style.display = "block";
        if(userDisplayName) userDisplayName.style.display = "none";
        if(adminLink) adminLink.style.display = "none";
    }
    if(grid) loadCourses();
});

async function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error("Login Error:", error);
        alert("حدث خطأ أثناء تسجيل الدخول، جرب مرة أخرى.");
    }
}

async function loadCourses() {
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(async (snapshot) => {
        grid.innerHTML = "";
        if(snapshot.empty) {
            grid.innerHTML = "<p style='text-align:center; color:#666; grid-column:1/-1;'>لا توجد مهام حالياً.</p>";
            return;
        }
        snapshot.forEach(doc => {
            const course = doc.data();
            grid.innerHTML += `
                <div class="card" onclick="handleCourseAccess('${doc.id}', '${course.type}', '${course.title}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>انقر للبدء 🔓</p>
                </div>`;
        });
    });
}

async function handleCourseAccess(id, type, title) {
    if(!currentUserEmail) {
        alert("سجل دخولك أولاً يا بطل!");
        return;
    }
    
    let hasAccess = type === "free" || currentUserEmail === "liopliop524@gmail.com";
    
    if (type === "paid" && currentUserEmail !== "liopliop524@gmail.com") {
        const profile = await db.collection("users_profiles").doc(currentUserEmail).get();
        const allowed = profile.exists ? (profile.data().allowedCourses || []) : [];
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
    popup.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; justify-content:center; align-items:center;";
    popup.innerHTML = `
        <div class="admin-card" style="max-width:400px; text-align:center; padding:40px; border:1px solid var(--primary);">
            <h2 style="color:var(--primary);">🔒 محتوى مدفوع</h2>
            <p>هذا الكورس يتطلب تفعيلاً خاصاً من المهندس مروان.</p>
            <a href="https://wa.me/${myWhatsapp}?text=${msg}" target="_blank" class="btn-main" style="display:block; text-decoration:none; margin:20px 0; background:#25d366;">تواصل واتساب لتفعيل الكورس</a>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#666; cursor:pointer;">إغلاق</button>
        </div>`;
    document.body.appendChild(popup);
}

function logout() { auth.signOut().then(() => location.reload()); }
