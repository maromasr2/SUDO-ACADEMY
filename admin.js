// Sudo Admin Engine V2.0 🛡️
async function saveCourse() {
    const id = document.getElementById('edit-course-id').value;
    const title = document.getElementById('courseTitle').value;
    const type = document.getElementById('courseType').value; // تعديل النوع هنا
    const urls = document.querySelectorAll('.video-url');
    let videos = [];
    urls.forEach((u, i) => { if(u.value) videos.push({ title: `الدرس ${i+1}`, url: u.value.trim() }); });

    const courseData = { title, type, videos, updatedAt: new Date() };

    if(id) {
        await db.collection("courses").doc(id).update(courseData);
        alert("✅ تم تحديث بيانات ونوع الكورس!");
    } else {
        await db.collection("courses").add({ ...courseData, createdAt: new Date() });
        alert("🚀 تم النشر بنجاح!");
    }
    location.reload();
}

// دالة تعديل صلاحيات الطالب (تستدعى من القائمة)
async function toggleStudentAccess(userEmail, courseId, hasNow) {
    const userRef = db.collection("users_profiles").doc(userEmail);
    const doc = await userRef.get();
    let allowed = doc.exists ? (doc.data().allowedCourses || []) : [];

    if (hasNow) {
        allowed = allowed.filter(id => id !== courseId); // سحب الصلاحية
    } else {
        allowed.push(courseId); // إضافة صلاحية
    }

    await userRef.set({ allowedCourses: allowed }, { merge: true });
    alert(`🛡️ تم تحديث صلاحية الوصول لـ ${userEmail}`);
    loadAdminData(); // إعادة تحميل القائمة
}

// جلب قائمة الطلاب مع أزرار التحكم
async function loadAdminData() {
    const usersSnap = await db.collection("users_profiles").get();
    const coursesSnap = await db.collection("courses").get();
    const courses = coursesSnap.docs.map(d => ({id: d.id, title: d.data().title}));

    const table = document.getElementById('users-list-table');
    table.innerHTML = "";
    usersSnap.forEach(doc => {
        const u = doc.data();
        const allowed = u.allowedCourses || [];
        
        let courseButtons = courses.map(c => {
            const isAllowed = allowed.includes(c.id);
            return `<button onclick="toggleStudentAccess('${doc.id}', '${c.id}', ${isAllowed})" 
                    style="font-size:10px; padding:2px 5px; margin:2px; background:${isAllowed ? '#006400' : '#444'}">
                    ${isAllowed ? '✅' : '❌'} ${c.title}
                    </button>`;
        }).join('');

        table.innerHTML += `
            <tr style="border-bottom:1px solid #222;">
                <td style="padding:10px;">${u.name || 'مجهول'}<br><small>${doc.id}</small></td>
                <td style="padding:10px;">${courseButtons}</td>
                <td style="padding:10px;"><a href="https://wa.me/${u.phone}" target="_blank">📱</a></td>
            </tr>`;
    });
}
