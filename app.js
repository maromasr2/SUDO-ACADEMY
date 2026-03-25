// Sudo Academy Engine - التعديل الأصلي المحصن 🛡️
(function() {
    const grid = document.getElementById('courses-grid');
    const myWhatsapp = "201515227612";
    let currentUserEmail = null;

    // مراقبة الدخول والخروج
    auth.onAuthStateChanged(async (user) => {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('user-info');
        const userDisplayName = document.getElementById('userDisplayName');
        const adminLink = document.getElementById('adminLink');

        if (user) {
            currentUserEmail = user.email;
            if(loginBtn) loginBtn.style.display = "none";
            if(userInfo) userInfo.style.display = "flex";
            if(userDisplayName) userDisplayName.innerText = (user.displayName || "محارب").toUpperCase();
            
            // التحقق من صلاحية الأدمن لمروان
            if (user.email === "liopliop524@gmail.com") {
                if(adminLink) adminLink.style.display = "inline-block";
            }

            // نظام الطرد الفوري (Real-time Kick)
            if (window.location.pathname.includes('course-view.html')) {
                const cId = new URLSearchParams(window.location.search).get('id');
                db.collection("users_profiles").doc(user.email).onSnapshot(doc => {
                    const allowed = doc.exists ? (doc.data().allowedCourses || []) : [];
                    db.collection("courses").doc(cId).get().then(c => {
                        if (c.exists && c.data().type === 'paid' && user.email !== "liopliop524@gmail.com" && !allowed.includes(cId)) {
                            alert("🛡️ تم سحب الصلاحية!");
                            window.location.href = "index.html";
                        }
                    });
                });
            }
        } else {
            if(loginBtn) loginBtn.style.display = "block";
            if(userInfo) userInfo.style.display = "none";
            if(window.location.pathname.includes('admin.html')) window.location.href = "index.html";
        }
        if(grid) loadCourses();
    });

    // الدوال المتاحة للـ HTML
    window.loginWithGoogle = async () => {
        try {
            await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        } catch(e) { console.error(e); }
    };

    window.logout = () => {
        if(confirm("مغادرة القلعة الآن؟")) {
            auth.signOut().then(() => window.location.href = "index.html");
        }
    };

    async function loadCourses() {
        db.collection("courses").orderBy("createdAt", "desc").onSnapshot(snap => {
            if(!grid) return;
            grid.innerHTML = "";
            if(snap.empty) {
                grid.innerHTML = "<p style='text-align:center; color:#666; grid-column:1/-1;'>لا توجد مهام حالياً.</p>";
                return;
            }
            snap.forEach(doc => {
                const c = doc.data();
                grid.innerHTML += `
                    <div class="card" onclick="window.handleAccess('${doc.id}', '${c.type}', '${c.title}')">
                        <span class="badge ${c.type}">${c.type.toUpperCase()}</span>
                        <h3>${c.title}</h3>
                        <p>فتح المهمة 🔒</p>
                    </div>`;
            });
        });
    }

    window.handleAccess = async (id, type, title) => {
        if(!currentUserEmail) return alert("سجل دخولك أولاً!");
        let access = type === "free" || currentUserEmail === "liopliop524@gmail.com";
        
        if (type === "paid" && currentUserEmail !== "liopliop524@gmail.com") {
            const p = await db.collection("users_profiles").doc(currentUserEmail).get();
            if (p.exists && (p.data().allowedCourses || []).includes(id)) access = true;
        }
        
        if(access) window.location.href = `course-view.html?id=${id}`;
        else showPaidPopup(title);
    };

    function showPaidPopup(title) {
        const msg = encodeURIComponent(`أريد تفعيل كورس: ${title}\nإيميلي: ${currentUserEmail}`);
        const p = document.createElement('div');
        p.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:20000; display:flex; justify-content:center; align-items:center; padding:20px;";
        p.innerHTML = `
            <div class="admin-card" style="max-width:400px; text-align:center; padding:30px; border:1px solid var(--primary); background:#111;">
                <h2 style="color:var(--primary);">🔒 محتوى مدفوع</h2>
                <p>تواصل مع مروان لتفعيل هذا الكورس.</p>
                <a href="https://wa.me/${myWhatsapp}?text=${msg}" target="_blank" class="btn-main" style="display:block; text-decoration:none; margin:20px 0; background:#25d366; color:white;">تواصل واتساب 📱</a>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#666; cursor:pointer;">إغلاق</button>
            </div>`;
        document.body.appendChild(p);
    }
})();
