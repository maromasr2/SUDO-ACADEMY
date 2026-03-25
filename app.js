// Sudo Academy Engine - التعديل الأصلي 🛡️
const grid = document.getElementById('courses-grid');
const myWhatsapp = "201515227612";
let currentUserEmail = null;

// مراقبة حالة تسجيل الدخول وتحديث الواجهة
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('user-info');
    const userDisplayName = document.getElementById('userDisplayName');
    const adminLink = document.getElementById('adminLink');

    if (user) {
        currentUserEmail = user.email;
        
        // تحديث الواجهة للمسجلين
        if(loginBtn) loginBtn.style.display = "none";
        if(userInfo) userInfo.style.display = "flex";
        if(userDisplayName) {
            userDisplayName.innerText = (user.displayName || "محارب سودو").toUpperCase();
        }
        
        // إظهار زر الإدارة لمروان فقط أو للأدمن
        if (user.email === "liopliop524@gmail.com") {
            if(adminLink) adminLink.style.display = "inline-block";
        } else {
            const roleDoc = await db.collection("users_roles").doc(user.email).get();
            if (roleDoc.exists && roleDoc.data().role === 'admin') {
                if(adminLink) adminLink.style.display = "inline-block";
            }
        }

        // نظام الطرد الفوري (Real-time Access Check)
        // لو الطالب فاتح صفحة كورس، بنراقب صلاحياته لحظياً
        if (window.location.pathname.includes('course-view.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('id');
            
            db.collection("users_profiles").doc(user.email).onSnapshot(doc => {
                const allowed = doc.exists ? (doc.data().allowedCourses || []) : [];
                
                db.collection("courses").doc(courseId).get().then(cDoc => {
                    if (cDoc.exists && cDoc.data().type === 'paid') {
                        // لو الكورس مدفوع والطالب مش مروان ومعهوش صلاحية.. اطرده فوراً
                        if (user.email !== "liopliop524@gmail.com" && !allowed.includes(courseId)) {
                            alert("🛡️ عذراً، تم سحب صلاحية الوصول لهذا المحتوى!");
                            window.location.href = "index.html";
                        }
                    }
                });
            });
        }
    } else {
        // حالة عدم تسجيل الدخول
        if(loginBtn) loginBtn.style.display = "block";
        if(userInfo) userInfo.style.display = "none";
        if(adminLink) adminLink.style.display = "none";
        
        // منع الدخول لصفحات الإدارة أو العرض بدون تسجيل
        if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('course-view.html')) {
            window.location.href = "index.html";
        }
    }
    
    // تحميل الكورسات في الهوم
    if(grid) loadCourses();
});

// دالة الدخول بجوجل
async function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error("Login Error:", error);
    }
}

// دالة تسجيل الخروج
function logout() {
    if(confirm("هل تريد مغادرة القلعة الآن؟")) {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    }
}

// تحميل وعرض الكورسات بنظام الحماية
async function loadCourses() {
    db.collection("courses").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        if(!grid) return;
        grid.innerHTML = "";
        
        if(snapshot.empty) {
            grid.innerHTML = "<p style='text-align:center; color:#666; grid-column: 1/-1;'>لا توجد مهام تدريبية حالياً.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const course = doc.data();
            grid.innerHTML += `
                <div class="card" onclick="handleAccess('${doc.id}', '${course.type}', '${course.title}')">
                    <span class="badge ${course.type}">${course.type.toUpperCase()}</span>
                    <h3>${course.title}</h3>
                    <p>فتح المهمة 🔒</p>
                </div>`;
        });
    });
}

// فحص الوصول قبل فتح صفحة الكورس
async function handleAccess(id, type, title) {
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

// إظهار نافذة التواصل لللاشتراك
function showPaidPopup(title) {
    const msg = encodeURIComponent(`أهلاً مروان، أريد تفعيل كورس: ${title}\nإيميلي: ${currentUserEmail}`);
    const popup = document.createElement('div');
    popup.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px;";
    popup.innerHTML = `
        <div class="admin-card" style="max-width:400px; text-align:center; border:1px solid var(--primary); padding:30px;">
            <h2 style="color:var(--primary);">🔒 محتوى مدفوع</h2>
            <p>هذا الكورس يتطلب تفعيل خاص من المهندس مروان.</p>
            <a href="https://wa.me/${myWhatsapp}?text=${msg}" target="_blank" class="btn-main" style="display:block; text-decoration:none; margin:20px 0; background:#25d366; color:white; font-weight:bold;">تواصل عبر واتساب للتفعيل 📱</a>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#666; cursor:pointer;">إغلاق</button>
        </div>`;
    document.body.appendChild(popup);
}
