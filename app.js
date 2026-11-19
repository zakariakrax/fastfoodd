// ===== CART STATE =====
let cart = [];

// ===== RENDER MENU =====
function renderMenu(filter = 'all') {
  const grid = document.getElementById('menu-grid');
  const items = filter === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === filter);
  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <img src="${item.img}" alt="${item.name}" loading="lazy">
      <div class="menu-card-body">
        <span class="menu-tag">${item.tag}</span>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="menu-card-footer">
          <span class="menu-price">${item.price} درهم</span>
          <button class="add-btn" onclick="addToCart(${item.id})" title="زيد للسلة">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== FILTER MENU =====
function filterMenu(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderMenu(cat);
}

// ===== RENDER RECIPES =====
function renderRecipes(query = '') {
  const grid = document.getElementById('recipes-grid');
  const items = query
    ? RECIPES.filter(r => r.name.includes(query) || r.ingredients.some(i => i.includes(query)))
    : RECIPES;
  if (items.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#6c757d;grid-column:1/-1">ما لقينا حتى وصفة بهاد الاسم 😅</p>';
    return;
  }
  grid.innerHTML = items.map(r => `
    <div class="recipe-card">
      <img src="${r.img}" alt="${r.name}" loading="lazy">
      <div class="recipe-body">
        <h3>${r.emoji} ${r.name}</h3>
        <div class="recipe-meta">
          <span>⏱️ ${r.time}</span>
          <span>📊 ${r.difficulty}</span>
        </div>
        <div class="recipe-ingredients">
          <strong>المكونات:</strong> ${r.ingredients.join('، ')}
        </div>
        <div class="recipe-steps">
          <strong>الطريقة:</strong>
          <ol>${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== SEARCH RECIPES =====
function searchRecipes() {
  const q = document.getElementById('recipe-search').value.trim();
  renderRecipes(q);
}

// ===== CART FUNCTIONS =====
function addToCart(id) {
  const item = MENU_ITEMS.find(i => i.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCart();
  // Animation feedback
  const btn = event.target;
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => btn.style.transform = '', 200);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = total + ' درهم';

  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">🛒 السلة فارغة<br><small>زيد شي حاجة من المنيو!</small></div>';
    return;
  }
  container.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.img}" alt="${c.name}">
      <div class="cart-item-info">
        <h4>${c.name}</h4>
        <span class="price">${c.price} درهم</span>
      </div>
      <div class="cart-qty">
        <button onclick="changeQty(${c.id}, -1)">−</button>
        <span>${c.qty}</span>
        <button onclick="changeQty(${c.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  document.getElementById('cart').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

function checkout() {
  if (cart.length === 0) {
    alert('السلة فارغة! زيد شي حاجة قبل ما تطلب.');
    return;
  }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  alert(`🎉 تطلبك تأكد!\n\nعدد الأطباق: ${cart.reduce((s,c)=>s+c.qty,0)}\nالمجموع: ${total} درهم\n\nغادي نتواصلو معاك قريب! 📞`);
  cart = [];
  updateCart();
  toggleCart();
}

// ===== AI RECOMMENDATION =====
function getAIRecommendation() {
  const pref = document.getElementById('ai-pref').value.trim();
  const result = document.getElementById('ai-result');

  if (!pref) {
    result.innerHTML = '<p style="color:#e63946">عافاك، كتب لينا شنو بغيتي قبل ما نجيبو التوصيات 🙏</p>';
    return;
  }

  // Loading state
  result.innerHTML = '<div class="ai-loading"><span class="spinner">⏳</span> كنحلل ذوقك...</div>';

  setTimeout(() => {
    const prefLower = pref.toLowerCase();
    let matched = [];
    let reasons = [];

    AI_RULES.forEach(rule => {
      if (rule.keywords.some(k => prefLower.includes(k.toLowerCase()))) {
        matched.push(...rule.matches);
        reasons.push(rule.reason);
      }
    });

    // Remove duplicates
    matched = [...new Set(matched)];

    if (matched.length === 0) {
      // Default recommendations
      matched = [1, 3, 7, 9];
      reasons = ["هاهوما أحسن أطباق عندنا، غادي يعجبوك!"];
    }

    const recommended = MENU_ITEMS.filter(i => matched.includes(i.id));

    result.innerHTML = `
      <div style="margin-bottom:16px;padding:12px;background:#e8f5e9;border-radius:10px;font-size:0.9rem">
        ✅ ${reasons[0]}
      </div>
      ${recommended.map(item => `
        <div class="ai-rec-card">
          <div class="emoji">${item.emoji}</div>
          <div>
            <h4>${item.name}</h4>
            <p>${item.desc}</p>
            <span style="color:var(--primary);font-weight:700">${item.price} درهم</span>
            <button class="add-btn" style="margin-right:10px;margin-top:8px" onclick="addToCart(${item.id})">+ زيد للسلة</button>
          </div>
        </div>
      `).join('')}
    `;
  }, 1200);
}

// ===== MOBILE MENU =====
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// ===== INIT =====
renderMenu();
renderRecipes();
updateCart();
