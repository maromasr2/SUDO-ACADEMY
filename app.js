const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

// الجلسة تنتهي بمجرد إغلاق المتصفح (Session Persistence)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        currentUserEmail = user.email;
        const userId = user.uid;
        const deviceId = Math.random().toString(36).substring(7);

       
        // التحقق من صلاحية الأدمن لإظهار الزر
        const roleDoc = await db.collection("users_roles").doc(user.email).get();
        if (user.email === "marwan@gmail.com" || (roleDoc.exists && roleDoc.data().role === 'admin')) {
            document.getElementById('adminLink').style.display = "inline-block";
        }
    } else {
        document.getElementById('loginBtn').style.display = "block";
        document.getElementById('adminLink').style.display = "none";
        document.getElementById('userDisplayName').innerText = "";
    }
    loadCourses();
});

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

async function loadCourses() {
    db.collection("courses").onSnapshot(async (snapshot) => {
        grid.innerHTML = "";
        for (let doc of snapshot.docs) {
            const course = doc.data();
            const courseId = doc.id;
            let hasAccess = course.type === "free";

            // التحقق من شراء الكورس
            if (course.type === "paid" && currentUserEmail) {
                const acc = await db.collection("access").doc(`${currentUserEmail}_${courseId}`).get();
                if (acc.exists) hasAccess = true;
            }

            const videos = course.videos || [];
            const waMsg = encodeURIComponent(`أهلاً مروان، أريد تفعيل كورس: ${course.title}\nإيميلي: ${currentUserEmail}`);

            grid.innerHTML += `
                <div class="card" data-aos="fade-up">
                    <span style="color:var(--primary); font-size:12px; font-weight:bold;">${course.type.toUpperCase()} COURSE</span>
                    <h3>${course.title}</h3>
                    ${hasAccess && videos.length > 0 ? `
                        <div class="video-player">
                            <iframe id="vid-${courseId}" src="${videos[0].url}" allowfullscreen></iframe>
                            <div class="video-list">
                                ${videos.map((v, i) => `<div class="video-item" onclick="document.getElementById('vid-${courseId}').src='${v.url}'">${i+1}. ${v.title}</div>`).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="lock-zone" style="text-align:center; padding:40px 10px; background:#0b0e11; border-radius:15px; border:1px dashed #444;">
                            <p>🔒 ${course.type === 'paid' ? 'المحتوى متاح للمشتركين فقط' : 'يرجى تسجيل الدخول أولاً'}</p>
                            ${course.type === 'paid' ? `<a href="https://wa.me/${myWhatsapp}?text=${waMsg}" target="_blank" class="wa-btn">اشترك الآن عبر واتساب</a>` : ''}
                        </div>
                    `}
                </div>`;
        }
    });
}
