/* ==========================================================================
   Restaurant Management & Food Ordering System - Application Logic
   With Strict Role-Based Access Control (RBAC) & MySQL Integration
   ========================================================================== */

const API_BASE = '/api';

// Application State
let currentUser = {
  username: 'Guest',
  role: 'GUEST' // 'USER' | 'ADMIN' | 'GUEST'
};

let restaurants = [];
let currentRestaurant = null;
let currentFoodItems = [];
let cart = []; // Array of { item, qty }
let newOrdersNotificationCount = 0;

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await loadRestaurants();
  // Check localStorage for saved session
  const savedUser = localStorage.getItem('foodApp_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateUserStatusBadge();
      updateNavVisibility();

      if (currentUser.role === 'ADMIN') {
        switchView('restaurantList');
      } else if (currentUser.role === 'USER') {
        switchView('foodList');
      } else {
        switchView('login');
      }
    } catch (e) {
      currentUser = { username: 'Guest', role: 'GUEST' };
      updateUserStatusBadge();
      updateNavVisibility();
      switchView('login');
    }
  } else {
    updateUserStatusBadge();
    updateNavVisibility();
    switchView('login');
  }
}

/* ==========================================================================
   Role-Based Access Control (RBAC): Navigation & View Guarding
   - USER: Access ONLY to Food Item List (& Checkout Summary)
   - ADMIN: Access ONLY to Restaurant Details (Admin View)
   ========================================================================== */
function updateNavVisibility() {
  const navLogin = document.getElementById('navLoginBtn');
  const navRegister = document.getElementById('navRegisterBtn');
  const navFoodList = document.getElementById('navFoodListBtn');
  const navSummary = document.getElementById('navSummaryBtn');
  const navRestaurantList = document.getElementById('navRestaurantListBtn');

  if (currentUser.role === 'ADMIN') {
    // ADMIN: Access ONLY to Restaurant Details (Admin View)
    if (navLogin) navLogin.style.display = 'none';
    if (navRegister) navRegister.style.display = 'none';
    if (navFoodList) navFoodList.style.display = 'none';
    if (navSummary) navSummary.style.display = 'none';
    if (navRestaurantList) navRestaurantList.style.display = 'inline-flex';
  } else if (currentUser.role === 'USER') {
    // USER: Access ONLY to Food Item List (& Checkout Summary)
    if (navLogin) navLogin.style.display = 'none';
    if (navRegister) navRegister.style.display = 'none';
    if (navFoodList) navFoodList.style.display = 'inline-flex';
    if (navSummary) navSummary.style.display = 'inline-flex';
    if (navRestaurantList) navRestaurantList.style.display = 'none';
  } else {
    // GUEST: Not logged in
    if (navLogin) navLogin.style.display = 'inline-flex';
    if (navRegister) navRegister.style.display = 'inline-flex';
    if (navFoodList) navFoodList.style.display = 'none';
    if (navSummary) navSummary.style.display = 'none';
    if (navRestaurantList) navRestaurantList.style.display = 'none';
  }
}

function switchView(viewName) {
  // STRICT ROLE-BASED ACCESS CONTROL GUARDS
  if (viewName === 'restaurantList') {
    if (currentUser.role !== 'ADMIN') {
      alert('⛔ Access Denied! Only an ADMIN has access to the Restaurant Details (Admin View).\nA USER has access ONLY to the Food Item List.');
      if (currentUser.role === 'USER') {
        return switchView('foodList');
      } else {
        return switchView('login');
      }
    }
  }

  if (viewName === 'foodList' || viewName === 'summary') {
    if (currentUser.role === 'ADMIN') {
      alert('⛔ Access Denied! As an ADMIN, you have access ONLY to the Restaurant Details (Admin View).\nThe Food Item List is reserved for customer USER accounts.');
      return switchView('restaurantList');
    }
    if (currentUser.role !== 'USER') {
      alert('Please log in with a USER account to access the Food Item List.');
      return switchView('login');
    }
  }

  // Hide all views
  const views = ['viewLogin', 'viewRegister', 'viewFoodList', 'viewSummary', 'viewRestaurantList'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.remove('active');
  });

  // Reset nav active states
  const navBtns = ['navLoginBtn', 'navRegisterBtn', 'navFoodListBtn', 'navSummaryBtn', 'navRestaurantListBtn'];
  navBtns.forEach(b => {
    const el = document.getElementById(b);
    if (el) el.classList.remove('active');
  });

  // Activate selected view
  let targetViewId = 'viewLogin';
  let targetNavId = 'navLoginBtn';

  if (viewName === 'login') {
    targetViewId = 'viewLogin';
    targetNavId = 'navLoginBtn';
  } else if (viewName === 'register') {
    targetViewId = 'viewRegister';
    targetNavId = 'navRegisterBtn';
  } else if (viewName === 'foodList') {
    targetViewId = 'viewFoodList';
    targetNavId = 'navFoodListBtn';
    loadFoodItemsForUser();
  } else if (viewName === 'summary') {
    targetViewId = 'viewSummary';
    targetNavId = 'navSummaryBtn';
    renderSummaryPage();
  } else if (viewName === 'restaurantList') {
    targetViewId = 'viewRestaurantList';
    targetNavId = 'navRestaurantListBtn';
    newOrdersNotificationCount = 0;
    updateNotificationBadge();
    loadAdminDashboard();
  }

  const activeView = document.getElementById(targetViewId);
  const activeNav = document.getElementById(targetNavId);
  if (activeView) activeView.classList.add('active');
  if (activeNav) activeNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUserStatusBadge() {
  const badgeText = document.getElementById('roleBadgeText');
  const logoutBtn = document.getElementById('logoutBtn');

  if (currentUser.role === 'GUEST') {
    badgeText.innerHTML = '👤 Not Logged In';
    logoutBtn.style.display = 'none';
  } else if (currentUser.role === 'ADMIN') {
    badgeText.innerHTML = `🛡️ Role: <strong>ADMIN</strong> (${escapeHtml(currentUser.username)})`;
    logoutBtn.style.display = 'inline-block';
  } else {
    badgeText.innerHTML = `👤 Role: <strong>USER</strong> (${escapeHtml(currentUser.username)})`;
    logoutBtn.style.display = 'inline-block';
  }
}

function logout() {
  currentUser = { username: 'Guest', role: 'GUEST' };
  localStorage.removeItem('foodApp_user');
  updateUserStatusBadge();
  updateNavVisibility();
  cart = [];
  updateCartBadge();
  alert('You have been logged out.');
  switchView('login');
}

/* ==========================================================================
   1. Login Page Logic (Authenticated via MySQL Database)
   ========================================================================== */
async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    alert('Please enter both username and password.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const user = await res.json();
      currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        restaurantName: user.restaurantName
      };

      localStorage.setItem('foodApp_user', JSON.stringify(currentUser));
      updateUserStatusBadge();
      updateNavVisibility();

      if (user.role === 'ADMIN') {
        alert(`✅ Login Successful as ADMIN (${user.username})!\nAccess granted strictly to: Restaurant Details (Admin View).`);
        switchView('restaurantList');
      } else {
        alert(`✅ Login Successful as USER (${user.username})!\nAccess granted strictly to: Food Item List.`);
        switchView('foodList');
      }
    } else {
      const err = await res.json();
      alert(`❌ Login Failed: ${err.error || 'Invalid credentials'}`);
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Error connecting to backend server.');
  }
}

function quickLogin(role) {
  if (role === 'ADMIN') {
    document.getElementById('loginUsername').value = 'admin';
    document.getElementById('loginPassword').value = 'admin123';
  } else {
    document.getElementById('loginUsername').value = 'user1';
    document.getElementById('loginPassword').value = 'pass123';
  }
  document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

/* ==========================================================================
   2. Register Page Logic (Stored into MySQL Database)
   ========================================================================== */
function toggleRegisterRoleFields() {
  const role = document.getElementById('regRole').value;
  const adminBox = document.getElementById('adminSpecificFields');
  if (role === 'ADMIN') {
    adminBox.style.display = 'block';
  } else {
    adminBox.style.display = 'none';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const role = document.getElementById('regRole').value;
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const email = document.getElementById('regEmail').value.trim();

  if (!username || !password) {
    alert('Please enter a username and password.');
    return;
  }

  const payload = {
    username: username,
    password: password,
    email: email,
    role: role
  };

  if (role === 'ADMIN') {
    payload.restaurantName = document.getElementById('regRestaurantName').value.trim() || `${username}'s Cafe`;
    payload.location = document.getElementById('regLocation').value.trim() || 'Central Road';
    payload.phone = document.getElementById('regPhone').value.trim() || '9876543210';
  }

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const registered = await res.json();
      currentUser = {
        id: registered.id,
        username: registered.username,
        email: registered.email,
        role: registered.role,
        restaurantName: registered.restaurantName
      };

      localStorage.setItem('foodApp_user', JSON.stringify(currentUser));
      updateUserStatusBadge();
      updateNavVisibility();
      await loadRestaurants();

      if (role === 'ADMIN') {
        alert(`✅ Admin Account Registered in MySQL Database!\nAccess granted strictly to: Restaurant Details (Admin View).`);
        switchView('restaurantList');
      } else {
        alert(`✅ User Account Registered in MySQL Database!\nAccess granted strictly to: Food Item List.`);
        switchView('foodList');
      }
    } else {
      const err = await res.json();
      alert(`❌ Registration Failed: ${err.error || 'Could not register user.'}`);
    }
  } catch (err) {
    console.error('Registration error:', err);
    alert('Error connecting to backend server.');
  }
}

/* ==========================================================================
   Restaurant Data Management (MySQL Backend)
   ========================================================================== */
async function loadRestaurants() {
  try {
    const res = await fetch(`${API_BASE}/restaurants`);
    if (res.ok) {
      restaurants = await res.json();
      if (restaurants.length > 0 && !currentRestaurant) {
        currentRestaurant = restaurants.find(r => r.name.toLowerCase().includes('ks')) || restaurants[0];
      }
      populateRestaurantDropdowns();
    }
  } catch (err) {
    console.error('Failed to load restaurants:', err);
  }
}

function populateRestaurantDropdowns() {
  const userSelect = document.getElementById('restaurantDropdownSelect');
  const adminSelect = document.getElementById('adminRestaurantSelect');

  if (userSelect) {
    userSelect.innerHTML = '';
    restaurants.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.id}. ${r.name}`;
      if (currentRestaurant && currentRestaurant.id === r.id) opt.selected = true;
      userSelect.appendChild(opt);
    });
  }

  if (adminSelect) {
    adminSelect.innerHTML = '';
    restaurants.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.id}. ${r.name}`;
      if (currentRestaurant && currentRestaurant.id === r.id) opt.selected = true;
      adminSelect.appendChild(opt);
    });
  }

  updateRestaurantDisplayHeaders();
}

function updateRestaurantDisplayHeaders() {
  if (!currentRestaurant) return;

  const userRestName = document.getElementById('userViewRestaurantName');
  const userRestMeta = document.getElementById('userViewRestaurantMeta');
  if (userRestName) userRestName.textContent = `${currentRestaurant.id}. ${currentRestaurant.name}`;
  if (userRestMeta) userRestMeta.textContent = `Location: ${currentRestaurant.location || 'N/A'} | Phone: ${currentRestaurant.phone || 'N/A'}`;

  const adminHotel = document.getElementById('adminHotelName');
  const adminLoc = document.getElementById('adminLocation');
  const adminPhone = document.getElementById('adminPhone');
  if (adminHotel) adminHotel.textContent = currentRestaurant.name;
  if (adminLoc) adminLoc.textContent = currentRestaurant.location || 'N/A';
  if (adminPhone) adminPhone.textContent = currentRestaurant.phone || 'N/A';
}

function onRestaurantSelectedChange() {
  const select = document.getElementById('restaurantDropdownSelect');
  const selectedId = Number(select.value);
  currentRestaurant = restaurants.find(r => r.id === selectedId) || currentRestaurant;
  updateRestaurantDisplayHeaders();
  loadFoodItemsForUser();
}

function onAdminRestaurantChange() {
  const select = document.getElementById('adminRestaurantSelect');
  const selectedId = Number(select.value);
  currentRestaurant = restaurants.find(r => r.id === selectedId) || currentRestaurant;
  updateRestaurantDisplayHeaders();
  loadAdminDashboard();
}

/* ==========================================================================
   3. Food Item List (USER Role Exclusive View)
   ========================================================================== */
async function loadFoodItemsForUser() {
  if (!currentRestaurant) {
    await loadRestaurants();
  }
  if (!currentRestaurant) return;

  const container = document.getElementById('foodItemsUserGrid');
  container.innerHTML = '<p style="color: var(--gray-600); grid-column: 1 / -1;">Loading menu from MySQL database...</p>';

  try {
    const res = await fetch(`${API_BASE}/fooditems/restaurant/${currentRestaurant.id}`);
    if (res.ok) {
      currentFoodItems = await res.json();
      renderUserFoodItems();
    }
  } catch (err) {
    console.error('Error fetching food items:', err);
    container.innerHTML = '<p style="color: var(--danger); grid-column: 1 / -1;">Failed to load food items.</p>';
  }
}

function renderUserFoodItems() {
  const container = document.getElementById('foodItemsUserGrid');
  container.innerHTML = '';

  if (currentFoodItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🍽️</div>
        <p>No food items found for this restaurant in MySQL.</p>
      </div>
    `;
    return;
  }

  currentFoodItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'food-item-card';
    card.innerHTML = `
      <div class="food-item-info">
        <h4>${escapeHtml(item.name)}</h4>
        <div class="price-tag">₹${Number(item.price).toFixed(2)}</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="addToCart(${item.id})">
        ➕ [add]
      </button>
    `;
    container.appendChild(card);
  });

  updateCartBadge();
}

function addToCart(itemId) {
  const food = currentFoodItems.find(f => f.id === itemId);
  if (!food) return;

  const existing = cart.find(c => c.item.id === food.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ item: food, qty: 1 });
  }

  updateCartBadge();

  const floatBar = document.querySelector('.cart-float-bar');
  if (floatBar) {
    floatBar.style.transform = 'scale(1.02)';
    setTimeout(() => { floatBar.style.transform = 'scale(1)'; }, 150);
  }
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalAmt = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);

  const cartNavCount = document.getElementById('cartNavCount');
  const cartItemsCount = document.getElementById('cartItemsCount');
  const cartItemsTotal = document.getElementById('cartItemsTotal');

  if (cartNavCount) cartNavCount.textContent = totalCount;
  if (cartItemsCount) cartItemsCount.textContent = totalCount;
  if (cartItemsTotal) cartItemsTotal.textContent = totalAmt.toFixed(2);
}

function proceedToSummary() {
  if (cart.length === 0) {
    alert('Please add at least one food item before proceeding to summary.');
    return;
  }
  switchView('summary');
}

/* ==========================================================================
   4. Summary Page Logic (USER Checkout & Cash/GPay Payments)
   ========================================================================== */
function renderSummaryPage() {
  const restTitle = document.getElementById('summaryRestaurantName');
  if (restTitle && currentRestaurant) {
    restTitle.textContent = currentRestaurant.name;
  }

  const tbody = document.getElementById('summaryItemsTableBody');
  tbody.innerHTML = '';

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--gray-600); padding: 20px;">No items selected in cart. <a href="javascript:void(0)" onclick="switchView('foodList')">Go back to menu</a></td></tr>`;
    document.getElementById('summaryTotalAmount').textContent = '0.00';
    return;
  }

  let grandTotal = 0;

  cart.forEach((entry, idx) => {
    const itemTotal = entry.item.price * entry.qty;
    grandTotal += itemTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(entry.item.name)}</strong></td>
      <td>₹${Number(entry.item.price).toFixed(2)}</td>
      <td>
        <div class="item-qty-controls">
          <button class="qty-btn" onclick="changeSummaryQty(${idx}, -1)">-</button>
          <span>${entry.qty}</span>
          <button class="qty-btn" onclick="changeSummaryQty(${idx}, 1)">+</button>
        </div>
      </td>
      <td>₹${itemTotal.toFixed(2)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="removeSummaryItem(${idx})" style="color: var(--danger); padding: 2px 6px;">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('summaryTotalAmount').textContent = grandTotal.toFixed(2);
}

function changeSummaryQty(index, change) {
  if (cart[index]) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    updateCartBadge();
    renderSummaryPage();
  }
}

function removeSummaryItem(index) {
  cart.splice(index, 1);
  updateCartBadge();
  renderSummaryPage();
}

async function processPayment(paymentMethod) {
  if (cart.length === 0) {
    alert('Your cart is empty. Please add food items first.');
    return;
  }

  const totalAmt = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);
  const itemsSummaryStr = cart.map(c => `${c.item.name} x ${c.qty}`).join(', ');
  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const orderRecord = {
    orderId: orderId,
    customer: currentUser.username || 'Customer',
    restaurantId: currentRestaurant ? currentRestaurant.id : 1,
    restaurantName: currentRestaurant ? currentRestaurant.name : 'KS cafe',
    itemsSummary: itemsSummaryStr,
    total: totalAmt.toFixed(2),
    paymentMethod: paymentMethod,
    status: 'Payment Success',
    time: timestamp
  };

  // 1. Send Order to Spring Boot Backend API (stored in MySQL database)
  try {
    const restaurantId = currentRestaurant ? currentRestaurant.id : 1;
    await fetch(`${API_BASE}/restaurants/${restaurantId}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser.role
      },
      body: JSON.stringify({ orderData: JSON.stringify(orderRecord) })
    });
  } catch (err) {
    console.warn('Backend order sync warning:', err);
  }

  saveOrderToLocalStorage(orderRecord);
  triggerAdminNotification(orderRecord);

  // 2. Display "Payment Success" popup
  const detailsBox = document.getElementById('paymentSuccessDetails');
  detailsBox.innerHTML = `
    <div><strong>Order ID:</strong> ${orderRecord.orderId}</div>
    <div><strong>Restaurant:</strong> ${orderRecord.restaurantName}</div>
    <div><strong>Food Items:</strong> ${orderRecord.itemsSummary}</div>
    <div><strong>Payment Mode:</strong> ${paymentMethod}</div>
    <div><strong>Total Paid:</strong> ₹${orderRecord.total}</div>
    <div><strong>Time:</strong> ${orderRecord.time}</div>
    <div style="margin-top: 8px; color: var(--secondary); font-weight: 700;">Status: Payment Success ✅</div>
  `;

  document.getElementById('paymentSuccessModal').classList.add('active');

  cart = [];
  updateCartBadge();
}

function closePaymentSuccessModal(redirectView) {
  document.getElementById('paymentSuccessModal').classList.remove('active');
  if (redirectView === 'restaurantList' && currentUser.role !== 'ADMIN') {
    // Prevent USER from jumping to admin view
    switchView('foodList');
  } else {
    switchView(redirectView || 'foodList');
  }
}

function triggerAdminNotification(orderRecord) {
  newOrdersNotificationCount++;
  updateNotificationBadge();

  const banner = document.getElementById('adminNotificationBanner');
  if (banner && currentUser.role === 'ADMIN') {
    banner.classList.add('active');
    setTimeout(() => { banner.classList.remove('active'); }, 6000);
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById('adminOrderNotificationBadge');
  const tag = document.getElementById('orderNotificationTag');

  if (badge) {
    if (newOrdersNotificationCount > 0 && currentUser.role === 'ADMIN') {
      badge.textContent = newOrdersNotificationCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  if (tag) {
    if (newOrdersNotificationCount > 0 && currentUser.role === 'ADMIN') {
      tag.style.display = 'inline-block';
    } else {
      tag.style.display = 'none';
    }
  }
}

function saveOrderToLocalStorage(order) {
  const saved = JSON.parse(localStorage.getItem('foodApp_placedOrders') || '[]');
  saved.unshift(order);
  localStorage.setItem('foodApp_placedOrders', JSON.stringify(saved));
}

function getOrdersFromLocalStorage(restaurantId) {
  const saved = JSON.parse(localStorage.getItem('foodApp_placedOrders') || '[]');
  if (!restaurantId) return saved;
  return saved.filter(o => o.restaurantId === restaurantId);
}

/* ==========================================================================
   5. Restaurant List (ADMIN Role Exclusive View)
   - Hotel name, Location, Phone
   - Food Item: [add], [update], [delete] (Permission access)
   - Order placed: [view], [delete]
   ========================================================================== */
async function loadAdminDashboard() {
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can access this view.');
    return switchView('login');
  }

  if (!currentRestaurant) {
    await loadRestaurants();
  }
  if (!currentRestaurant) return;

  updateRestaurantDisplayHeaders();
  await loadAdminFoodItems();
  await loadAdminOrders();
}

async function loadAdminFoodItems() {
  const tbody = document.getElementById('adminFoodTableBody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--gray-600);">Loading food items from MySQL...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/fooditems/restaurant/${currentRestaurant.id}`);
    if (res.ok) {
      currentFoodItems = await res.json();
      tbody.innerHTML = '';

      if (currentFoodItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--gray-600); padding: 18px;">No food items added yet for this restaurant. Click <strong>[add] Food Item</strong> above.</td></tr>`;
        return;
      }

      currentFoodItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${item.id}</td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td>₹${Number(item.price).toFixed(2)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-accent btn-sm" onclick="openEditFoodModal(${item.id})">✏️ [update]</button>
              <button class="btn btn-danger btn-sm" onclick="deleteFoodItem(${item.id})">🗑️ [delete]</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load admin food items:', err);
    tbody.innerHTML = '<tr><td colspan="4" style="color: var(--danger); text-align: center;">Error loading food items</td></tr>';
  }
}

/* Food Item CRUD with Role Enforcement */
function openAddFoodModal() {
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can add food items.');
    return;
  }
  document.getElementById('foodModalTitle').textContent = 'Add Food Item';
  document.getElementById('foodItemId').value = '';
  document.getElementById('foodItemName').value = '';
  document.getElementById('foodItemPrice').value = '';
  document.getElementById('foodModalSubmitBtn').textContent = 'Add Food Item';
  document.getElementById('foodItemModal').classList.add('active');
}

function openEditFoodModal(itemId) {
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can edit food items.');
    return;
  }
  const item = currentFoodItems.find(f => f.id === itemId);
  if (!item) return;

  document.getElementById('foodModalTitle').textContent = 'Update Food Item';
  document.getElementById('foodItemId').value = item.id;
  document.getElementById('foodItemName').value = item.name;
  document.getElementById('foodItemPrice').value = item.price;
  document.getElementById('foodModalSubmitBtn').textContent = 'Update Food Item';
  document.getElementById('foodItemModal').classList.add('active');
}

function closeFoodModal() {
  document.getElementById('foodItemModal').classList.remove('active');
}

async function handleFoodFormSubmit(event) {
  event.preventDefault();
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can save food items.');
    return;
  }

  const id = document.getElementById('foodItemId').value;
  const name = document.getElementById('foodItemName').value.trim();
  const price = parseFloat(document.getElementById('foodItemPrice').value);

  if (!name || isNaN(price)) {
    alert('Please enter a valid item name and price.');
    return;
  }

  const payload = {
    name: name,
    price: price,
    restaurantId: currentRestaurant.id,
    restaurantName: currentRestaurant.name
  };

  try {
    let res;
    if (id) {
      // UPDATE: PUT /api/fooditems/{id}
      res = await fetch(`${API_BASE}/fooditems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify(payload)
      });
    } else {
      // CREATE: POST /api/fooditems
      res = await fetch(`${API_BASE}/fooditems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      closeFoodModal();
      await loadAdminFoodItems();
    } else {
      const err = await res.json();
      alert(`Operation failed: ${err.error || 'Server rejected request'}`);
    }
  } catch (err) {
    console.error('Error saving food item:', err);
    alert('Failed to save food item to MySQL.');
  }
}

async function deleteFoodItem(itemId) {
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can delete food items.');
    return;
  }
  if (!confirm('Are you sure you want to delete this food item?')) return;

  try {
    const res = await fetch(`${API_BASE}/fooditems/${itemId}`, {
      method: 'DELETE',
      headers: { 'X-User-Role': currentUser.role }
    });
    if (res.ok || res.status === 204) {
      await loadAdminFoodItems();
    } else {
      const err = await res.json();
      alert(`Could not delete item: ${err.error || 'Access Denied'}`);
    }
  } catch (err) {
    console.error('Error deleting food item:', err);
    alert('Failed to delete food item.');
  }
}

/* Order Placed Section Logic (View & Delete) */
async function loadAdminOrders() {
  const tbody = document.getElementById('adminOrdersTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--gray-600);">Loading orders from MySQL...</td></tr>';

  let orders = [];

  try {
    const res = await fetch(`${API_BASE}/restaurants/${currentRestaurant.id}/orders`, {
      headers: { 'X-User-Role': currentUser.role }
    });
    if (res.ok) {
      const orderStrings = await res.json();
      orders = orderStrings.map((s, idx) => {
        try {
          const parsed = JSON.parse(s);
          parsed._backendIndex = idx;
          return parsed;
        } catch (e) {
          return { orderId: 'ORD-' + idx, itemsSummary: s, total: '0', paymentMethod: 'N/A', status: 'Payment Success', _backendIndex: idx };
        }
      });
    }
  } catch (e) {
    console.warn('Backend orders fetch error, checking local store:', e);
  }

  const localOrders = getOrdersFromLocalStorage(currentRestaurant.id);
  if (orders.length === 0 && localOrders.length > 0) {
    orders = localOrders;
  }

  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--gray-600); padding: 18px;">No orders placed yet. Orders placed by users will appear here!</td></tr>`;
    return;
  }

  orders.forEach((ord, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(ord.orderId || ('ORD-' + (idx + 1)))}</strong></td>
      <td>${escapeHtml(ord.customer || 'Customer')}</td>
      <td>${escapeHtml(ord.itemsSummary || 'Food Items')}</td>
      <td>₹${ord.total || '0.00'}</td>
      <td><span style="font-weight: 600; color: ${ord.paymentMethod === 'GPay' ? '#1565c0' : '#2e7d32'};">${ord.paymentMethod || 'Cash'}</span></td>
      <td><span style="color: var(--secondary); font-weight: 700;">Payment Success</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${idx})">👁️ [view]</button>
          <button class="btn btn-danger btn-sm" onclick="deleteOrderPlaced(${idx}, ${ord._backendIndex !== undefined ? ord._backendIndex : -1})">🗑️ [delete]</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  window._adminCurrentOrders = orders;
}

function viewOrderDetails(index) {
  const orders = window._adminCurrentOrders || [];
  const ord = orders[index];
  if (!ord) return;

  const modalBody = document.getElementById('viewOrderModalBody');
  modalBody.innerHTML = `
    <div style="line-height: 1.8; font-size: 0.95rem;">
      <p><strong>Order ID:</strong> ${escapeHtml(ord.orderId || 'N/A')}</p>
      <p><strong>Restaurant:</strong> ${escapeHtml(ord.restaurantName || currentRestaurant.name)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(ord.customer || 'Customer')}</p>
      <p><strong>Food Items:</strong> ${escapeHtml(ord.itemsSummary || 'N/A')}</p>
      <p><strong>Total Amount:</strong> ₹${ord.total || '0.00'}</p>
      <p><strong>Payment Mode:</strong> ${escapeHtml(ord.paymentMethod || 'Cash')}</p>
      <p><strong>Status:</strong> <span style="color: var(--secondary); font-weight: bold;">${escapeHtml(ord.status || 'Payment Success')}</span></p>
      <p><strong>Order Placed Time:</strong> ${escapeHtml(ord.time || 'Just now')}</p>
    </div>
  `;

  document.getElementById('viewOrderModal').classList.add('active');
}

function closeViewOrderModal() {
  document.getElementById('viewOrderModal').classList.remove('active');
}

async function deleteOrderPlaced(displayIndex, backendIndex) {
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can delete orders.');
    return;
  }
  if (!confirm('Are you sure you want to delete this placed order?')) return;

  if (backendIndex >= 0 && currentRestaurant) {
    try {
      await fetch(`${API_BASE}/restaurants/${currentRestaurant.id}/orders/${backendIndex}`, {
        method: 'DELETE',
        headers: { 'X-User-Role': currentUser.role }
      });
    } catch (e) {
      console.warn('Backend order delete error:', e);
    }
  }

  const saved = JSON.parse(localStorage.getItem('foodApp_placedOrders') || '[]');
  if (saved[displayIndex]) {
    saved.splice(displayIndex, 1);
    localStorage.setItem('foodApp_placedOrders', JSON.stringify(saved));
  }

  await loadAdminOrders();
}

/* Restaurant Modal (Add / Edit) */
function openRestaurantModal(isNew) {
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can manage restaurants.');
    return;
  }

  const title = document.getElementById('restaurantModalTitle');
  const idInput = document.getElementById('restaurantFormId');
  const nameInput = document.getElementById('restaurantFormName');
  const locInput = document.getElementById('restaurantFormLocation');
  const phoneInput = document.getElementById('restaurantFormPhone');

  if (isNew) {
    title.textContent = 'Add New Restaurant';
    idInput.value = '';
    nameInput.value = '';
    locInput.value = '';
    phoneInput.value = '';
  } else {
    title.textContent = 'Edit Restaurant Details';
    idInput.value = currentRestaurant ? currentRestaurant.id : '';
    nameInput.value = currentRestaurant ? currentRestaurant.name : '';
    locInput.value = currentRestaurant ? currentRestaurant.location : '';
    phoneInput.value = currentRestaurant ? currentRestaurant.phone : '';
  }

  document.getElementById('restaurantModal').classList.add('active');
}

function closeRestaurantModal() {
  document.getElementById('restaurantModal').classList.remove('active');
}

async function handleRestaurantFormSubmit(event) {
  event.preventDefault();
  if (currentUser.role !== 'ADMIN') {
    alert('Access Denied: Only ADMIN can save restaurants.');
    return;
  }

  const id = document.getElementById('restaurantFormId').value;
  const name = document.getElementById('restaurantFormName').value.trim();
  const location = document.getElementById('restaurantFormLocation').value.trim();
  const phone = document.getElementById('restaurantFormPhone').value.trim();

  if (!name) {
    alert('Please enter restaurant name.');
    return;
  }

  const payload = { name, location, phone };

  try {
    let res;
    if (id) {
      res = await fetch(`${API_BASE}/restaurants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API_BASE}/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      const saved = await res.json();
      currentRestaurant = saved;
      closeRestaurantModal();
      await loadRestaurants();
      updateRestaurantDisplayHeaders();
    } else {
      const err = await res.json();
      alert(`Save failed: ${err.error || 'Server error'}`);
    }
  } catch (err) {
    console.error('Error saving restaurant:', err);
    alert('Failed to save restaurant.');
  }
}

// Utility: HTML escape helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
