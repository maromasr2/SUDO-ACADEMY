const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

// حفظ الجلسة
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
            userDisplayName.onclick = () => window.location.href = 'profile.html';
            userDisplayName.style.cursor = "pointer";
        }

        // فحص رتبة الأدمن
        const roleDoc = await db.collection("users_roles").doc(user.email).get();
        if (user.email === "liopliop524@gmail.com" || (roleDoc.exists && roleDoc.data().role === 'admin')) {
            if(adminLink) adminLink.style.display = "inline-block";
        }

        // لو إحنا في صفحة البروفايل نشحن البيانات
        if(window.location.pathname.includes('profile.html')) {
            document.getElementById('updateName').value = user.displayName || "";
            const profDoc = await db.collection("users_profiles").doc(user.email).get();
            if(profDoc.exists) {
                document.getElementById('updateAge').value = profDoc.data().age || "";
                document.getElementById('updatePhone').value = profDoc.data().phone || "";
            }
        }
    } else {
        if(loginBtn) loginBtn.style.display = "block";
        if(adminLink) adminLink.style.display = "none";
        if(userDisplayName) userDisplayName.innerText = "";
        if(window.location.pathname.includes('profile.html')) window.location.href = "index.html";
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
            const videos = course.videos || [];
            
            let hasAccess = course.type === "free";
            if (currentUserEmail) {
                const accessDoc = await db.collection("access").doc(`${currentUserEmail}_${courseId}`).get();
                if (accessDoc.exists || currentUserEmail === "liopliop524@gmail.com") hasAccess = true;
            }

            const waMsg = encodeURIComponent(`أهلاً مروان، أريد تفعيل كورس: ${course.title}\nإيميلي: ${currentUserEmail}`);

            grid.innerHTML += `
                <div class="card" data-aos="fade-up">
                    <span style="color:var(--primary); font-size:12px; font-weight:bold;">${course.type.toUpperCase()} COURSE</span>
                    <h3>${course.title}</h3>
                    ${hasAccess ? `
                        <div class="video-player">
                            <iframe id="vid-${courseId}" src="${videos[0]?.url || ''}" allowfullscreen></iframe>
                            <div class="video-list">
                                ${videos.map((v, i) => `<div class="video-item" onclick="document.getElementById('vid-${courseId}').src='${v.url}'">${i+1}. ${v.title}</div>`).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="lock-zone" style="text-align:center; padding:40px 10px; background:#0b0e11; border-radius:15px; border:1px dashed #444;">
                            <p>🔒 ${currentUserEmail ? 'تواصل مع مروان لتفعيل الكورس' : 'يرجى تسجيل الدخول أولاً'}</p>
                            ${course.type === 'paid' ? `<a href="https://wa.me/${myWhatsapp}?text=${waMsg}" target="_blank" class="wa-btn">اشترك الآن عبر واتساب</a>` : ''}
                        </div>
                    `}
                </div>`;
        }
    });
}

// دالة حفظ البروفايل (تستدعى من زر الحفظ في profile.html)
async function saveProfileData() {
    const user = firebase.auth().currentUser;
    const name = document.getElementById('updateName').value;
    const age = document.getElementById('updateAge').value;
    const phone = document.getElementById('updatePhone').value;

    try {
        await user.updateProfile({ displayName: name });
        await db.collection("users_profiles").doc(user.email).set({
            name, age, phone, updatedAt: new Date()
        }, { merge: true });
        alert("🛡️ تم تحديث بياناتك بنجاح!");
    } catch(e) { alert("خطأ: " + e.message); }
}
