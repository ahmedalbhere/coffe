// تكوين Firebase
const firebaseConfig = {
  databaseURL: "https://coffee-dda5d-default-rtdb.firebaseio.com/"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// متغيرات التطبيق
let currentTable = null;

// الدخول إلى الطاولة
function enterTable() {
  const table = document.getElementById('tableNumber').value;
  if (table && table > 0) {
    currentTable = table;
    document.getElementById('table-input').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    loadMenu();
  } else {
    alert("الرجاء إدخال رقم طاولة صحيح");
  }
}

// تحميل قائمة المنيو
function loadMenu() {
  db.ref("menu").on("value", snapshot => {
    const itemsDiv = document.getElementById('menu-items');
    itemsDiv.innerHTML = '';
    const items = snapshot.val() || {};
    
    // تصنيف الأصناف
    const categories = {
      "hot-drinks": "مشروبات ساخنة",
      "cold-drinks": "مشروبات باردة",
      "food": "أطعمة",
      "desserts": "حلويات"
    };
    
    for (const category in categories) {
      const categoryItems = Object.entries(items)
        .filter(([_, item]) => item.category === category);
      
      if (categoryItems.length > 0) {
        itemsDiv.innerHTML += `<h3 class="category-title">${categories[category]}</h3>`;
        
        categoryItems.forEach(([key, item]) => {
          itemsDiv.innerHTML += `
            <div class="item">
              <strong>${item.name}</strong><br>
              السعر: ${item.price} جنيه<br>
              <input type="number" placeholder="الكمية" id="qty-${key}" min="0">
              <textarea placeholder="ملاحظات" id="note-${key}"></textarea>
            </div>
          `;
        });
      }
    }
  });
}

// إرسال الطلب
function submitOrder() {
  const order = { 
    table: currentTable, 
    items: [],
    status: "pending",
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };
  
  db.ref("menu").once("value").then(snapshot => {
    const items = snapshot.val() || {};
    for (let key in items) {
      const qty = document.getElementById(`qty-${key}`).value;
      const note = document.getElementById(`note-${key}`).value;
      if (qty && qty > 0) {
        order.items.push({ 
          name: items[key].name, 
          qty, 
          note,
          price: items[key].price
        });
      }
    }
    
    if (order.items.length === 0) {
      alert("الرجاء اختيار صنف واحد على الأقل");
      return;
    }
    
    db.ref("orders").push(order)
      .then(() => {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('order-summary').style.display = 'block';
      })
      .catch(error => {
        alert("حدث خطأ أثناء إرسال الطلب: " + error.message);
      });
  });
}

// استدعاء النادل
function callWaiter() {
  if (!currentTable) return;
  
  db.ref("waiterCalls").push({
    table: currentTable,
    time: new Date().toLocaleTimeString(),
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    status: "pending"
  })
  .then(() => {
    alert("تم استدعاء النادل لطاولتك رقم " + currentTable);
  })
  .catch(error => {
    alert("حدث خطأ: " + error.message);
  });
}

// عند تحميل الصفحة
window.onload = function() {
  // التحقق من اتصال الإنترنت
  if (!navigator.onLine) {
    alert("تحذير: أنت غير متصل بالإنترنت، بعض الميزات قد لا تعمل");
  }
};
