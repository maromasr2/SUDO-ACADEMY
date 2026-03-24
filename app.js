// Sudo Academy Engine V3.0 🛡️
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
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(async (snapshot) => {
        grid.innerHTML = "";
        if(snapshot.empty) {
            grid.innerHTML = "<p style='text-align:center; color:#666; grid-column: 1/-1;'>لا توجد مهام حالياً. ابدأ بإضافة الكورسات من لوحة الإدارة.</p>";
            return;
        }
        snapshot.forEach(doc => {
            const course = doc.data();
            grid.innerHTML += `
                <div class="card" onclick="handleCourseAccess('${doc.id}', '${course.type}', '${course.title}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>انقر لبدء المهمة 🔓</p>
                </div>`;
        });
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
    popup.className = "popup-overlay";
    popup.innerHTML = `
        <div class="admin-card popup-content">
            <h2 style="color:var(--primary);">🔒 محتوى مخصص للمشتركين</h2>
            <p>هذه المهمة تتطلب تصريحاً خاصاً. تواصل مع مروان لتفعيل الوصول.</p>
            <a href="https://wa.me/${my
