// تكوين Firebase
const firebaseConfig = {
  databaseURL: "https://coffee-dda5d-default-rtdb.firebaseio.com/"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// كلمة سر الإدارة
const ADMIN_PASSWORD = "4321";

// تسجيل دخول المدير
function loginAdmin() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadOrders();
    loadWaiterCalls();
    loadMenuItems(); // تحميل أصناف المنيو
  } else {
    alert("كلمة السر غير صحيحة");
  }
}

// تحميل أصناف المنيو لعرضها وحذفها
function loadMenuItems() {
  db.ref("menu").on("value", snapshot => {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = '';
    const items = snapshot.val() || {};
    
    for (let key in items) {
      const item = items[key];
      menuDiv.innerHTML += `
        <div class="item">
          <strong>${item.name}</strong><br>
          السعر: ${item.price} جنيه<br>
          التصنيف: ${getCategoryName(item.category)}<br>
          <button onclick="deleteMenuItem('${key}')" style="background-color: #f44336;">حذف الصنف</button>
        </div>
      `;
    }
  });
}

// دالة مساعدة للحصول على اسم التصنيف
function getCategoryName(category) {
  const categories = {
    "hot-drinks": "مشروبات ساخنة",
    "cold-drinks": "مشروبات باردة",
    "food": "أطعمة",
    "desserts": "حلويات"
  };
  return categories[category] || category;
}

// حذف صنف من المنيو
function deleteMenuItem(itemId) {
  if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
    db.ref(`menu/${itemId}`).remove()
      .then(() => {
        alert("تم حذف الصنف بنجاح");
      })
      .catch(error => {
        alert("حدث خطأ أثناء حذف الصنف: " + error.message);
      });
  }
}

// باقي الدوال保持不变 (loadOrders, calculateOrderTotal, updateOrderStatus, loadWaiterCalls, updateCallStatus, addMenuItem)
// ... [الكود السابق المتبقي بدون تغيير]
