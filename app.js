// Sudo Academy Engine V5.0 🛡️
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
            userDisplayName.innerText = (user.displayName || "محارب سودو").toUpperCase();
            userDisplayName.style.display = "inline-block";
            userDisplayName.onclick = () => window.location.href = 'profile.html';
        }
        
        // نظام الطرد الفوري (Real-time Kick)
        if (window.location.pathname.includes('course-view.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('id');
            
            db.collection("users_profiles").doc(user.email).onSnapshot(doc => {
                if (doc.exists) {
                    const allowed = doc.data().allowedCourses || [];
                    // لو الكورس مدفوع والإيميل مش إيميلك ومش مسموح له.. اطرد
                    db.collection("courses").doc(courseId).get().then(cDoc => {
                        if (cDoc.data().type === 'paid' && user.email !== "liopliop524@gmail.com" && !allowed.includes(courseId)) {
                            alert("🛡️ تم سحب صلاحية الوصول لهذا المحتوى!");
                            window.location.href = "index.html";
                        }
                    });
                }
            });
        }

        // إظهار زر الإدارة
        if (user.email === "liopliop524@gmail.com") {
            if(adminLink) adminLink.style.display = "inline-block";
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
        snapshot.forEach(doc => {
            const course = doc.data();
            grid.innerHTML += `
                <div class="card" onclick="handleCourseAccess('${doc.id}', '${course.type}', '${course.title}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>دخول المهمة 🔓</p>
                </div>`;
        });
    });
}

async function handleCourseAccess(id, type, title) {
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

function loginWithGoogle() { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
