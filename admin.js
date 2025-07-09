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
  } else {
    alert("كلمة السر غير صحيحة");
  }
}

// تحميل الطلبات
function loadOrders() {
  db.ref("orders").orderByChild("timestamp").limitToLast(20).on("value", snapshot => {
    const ordersDiv = document.getElementById('orders');
    ordersDiv.innerHTML = '';
    const orders = snapshot.val() || {};
    
    for (let key in orders) {
      const order = orders[key];
      let html = `
        <div class="item">
          <strong>الطاولة: ${order.table}</strong>
          <p>الحالة: ${order.status || 'pending'}</p>
          <p>الوقت: ${new Date(order.timestamp).toLocaleString()}</p>
          <ul>`;
      
      order.items.forEach(i => {
        html += `
          <li>
            ${i.name} - الكمية: ${i.qty} 
            - السعر: ${i.price} جنيه
            ${i.note ? '<br>ملاحظات: ' + i.note : ''}
          </li>`;
      });
      
      html += `
          </ul>
          <p>المجموع: ${calculateOrderTotal(order)} جنيه</p>
          <button onclick="updateOrderStatus('${key}', 'preparing')" style="background-color: #FFA000;">تحضير</button>
          <button onclick="updateOrderStatus('${key}', 'ready')" style="background-color: #388E3C;">جاهز</button>
          <button onclick="updateOrderStatus('${key}', 'delivered')" style="background-color: #1976D2;">تم التوصيل</button>
        </div>`;
      
      ordersDiv.innerHTML += html;
    }
  });
}

// حساب مجموع الطلب
function calculateOrderTotal(order) {
  return order.items.reduce((total, item) => {
    return total + (item.price * item.qty);
  }, 0);
}

// تحديث حالة الطلب
function updateOrderStatus(orderId, status) {
  db.ref(`orders/${orderId}/status`).set(status)
    .catch(error => {
      alert("حدث خطأ أثناء تحديث حالة الطلب: " + error.message);
    });
}

// تحميل طلبات استدعاء النادل
function loadWaiterCalls() {
  db.ref("waiterCalls").orderByChild("timestamp").limitToLast(10).on("value", snapshot => {
    const callsDiv = document.getElementById('waiter-calls');
    callsDiv.innerHTML = '';
    const calls = snapshot.val() || {};
    
    for (let key in calls) {
      const call = calls[key];
      callsDiv.innerHTML += `
        <div class="item">
          <strong>طاولة: ${call.table}</strong>
          <p>الوقت: ${call.time}</p>
          <p>الحالة: ${call.status || 'pending'}</p>
          <button onclick="updateCallStatus('${key}', 'attended')" style="background-color: #388E3C;">تمت الخدمة</button>
        </div>`;
    }
  });
}

// تحديث حالة استدعاء النادل
function updateCallStatus(callId, status) {
  db.ref(`waiterCalls/${callId}/status`).set(status)
    .catch(error => {
      alert("حدث خطأ أثناء تحديث حالة الاستدعاء: " + error.message);
    });
}

// إضافة صنف جديد
function addMenuItem() {
  const name = document.getElementById('new-item').value;
  const price = document.getElementById('new-price').value;
  const category = document.getElementById('item-category').value;
  
  if (name && price && category) {
    db.ref("menu").push({ name, price, category })
      .then(() => {
        document.getElementById('new-item').value = '';
        document.getElementById('new-price').value = '';
        alert("تمت إضافة الصنف بنجاح");
      })
      .catch(error => {
        alert("حدث خطأ أثناء إضافة الصنف: " + error.message);
      });
  } else {
    alert("الرجاء إدخال جميع البيانات المطلوبة");
  }
}
