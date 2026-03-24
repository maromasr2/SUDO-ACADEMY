// Sudo Academy Engine 🛡️
const grid = document.getElementById('courses-grid');
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

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

async function loadCourses() {
    db.collection("courses").onSnapshot(async (snapshot) => {
        grid.innerHTML = "";
        snapshot.forEach(doc => {
            const course = doc.data();
            grid.innerHTML += `
                <div class="card" onclick="goToCourse('${doc.id}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>اضغط للدخول للأكاديمية 🔓</p>
                </div>`;
        });
    });
}

function goToCourse(id) {
    if(!currentUserEmail) return alert("سجل دخولك أولاً يا بطل!");
    window.location.href = `course-view.html?id=${id}`;
}

// نظام تتبع الفيديو (يستدعى في صفحة العرض)
function trackProgress(courseId, videoId, duration, currentTime) {
    const percent = (currentTime / duration) * 100;
    if (percent >= 80) {
        db.collection("user_progress").doc(`${currentUserEmail}_${courseId}_${videoId}`).set({
            completed: true,
            lastTime: currentTime,
            updatedAt: new Date()
        }, { merge: true });
    }
}
