// المحرك الرئيسي - Sudo Academy 🛡️
const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

// الحفاظ على الجلسة
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

firebase.auth().onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const userDisplayName = document.getElementById('userDisplayName');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        currentUserEmail = user.email;
        if(loginBtn) loginBtn.style.display = "none";
        if(userDisplayName) {
            userDisplayName.innerText = user.displayName || "محارب سودو";
            userDisplayName.style.display = "inline";
            // إضافة رابط للبروفايل عند الضغط على الاسم
            userDisplayName.onclick = () => window.location.href = 'profile.html';
            userDisplayName.style.cursor = "pointer";
        }

        // فحص رتبة الأدمن لإظهار الزر
        const roleDoc = await db.collection("users_roles").doc(user.email).get();
        if (user.email === "liopliop524@gmail.com" || (roleDoc.exists && roleDoc.data().role === 'admin')) {
            if(adminLink) adminLink.style.display = "inline-block";
        }

        // لو إحنا في صفحة البروفايل.. شغل دالة التحميل بتاعته
        if(window.location.pathname.includes('profile.html')) loadProfileData(user);

    } else {
        if(loginBtn) loginBtn.style.display = "block";
        if(adminLink) adminLink.style.display = "none";
        if(userDisplayName) userDisplayName.innerText = "";
    }
    if(grid) loadCourses();
});

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(e => console.error(e));
}

async function loadCourses() {
    if(!grid) return;
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(async (snapshot) => {
        grid.innerHTML = "";
        for (let doc of snapshot.docs) {
            const course = doc.data();
            const courseId = doc.id;
            
            // فحص الوصول (مجاني أو مفعل له)
            let hasAccess = course.type === "free";
            if (currentUserEmail) {
                const accessDoc = await db.collection("access").doc(`${currentUserEmail}_${courseId}`).get();
                if (accessDoc.exists || currentUserEmail === "liopliop524@gmail.com") hasAccess = true;
            }

            const waMsg = encodeURIComponent(`أهلاً مروان، أريد تفعيل كورس: ${course.title}\nإيميلي: ${currentUserEmail}`);

            grid.innerHTML += `
                <div class="card" data-aos="fade-up">
                    <span class="badge ${course.type === 'paid' ? 'badge-paid' : 'badge-free'}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    ${hasAccess ? `
                        <div class="video-player">
                            <iframe id="vid-${courseId}" src="${course.videos[0]?.url || ''}" allowfullscreen></iframe>
                            <div class="video-list">
                                ${course.videos.map((v, i) => `
                                    <div class="video-item" onclick="document.getElementById('vid-${courseId}').src='${v.url}'">
                                        ${i+1}. ${v.title}
                                    </div>`).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="lock-zone">
                            <p>🔒 ${currentUserEmail ? 'المحتوى مدفوع - تواصل مع الإدارة' : 'يرجى تسجيل الدخول للمشاهدة'}</p>
                            ${course.type === 'paid' ? `<a href="https://wa.me/${myWhatsapp}?text=${waMsg}" target="_blank" class="wa-btn">طلب تفعيل الكورس</a>` : ''}
                        </div>
                    `}
                </div>`;
        }
    });
}
