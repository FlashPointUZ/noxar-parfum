/* NOXAR PARFUM — ochiq sayt (katalog, qidiruv, sevimlilar, kabinet, obuna).
   Mahsulotlar Supabase'dan o'qiladi. Rejim: "ajratib qo'yish / hidlab ko'rish" —
   onlayn savat va to'lov yo'q. Umumiy yordamchilar supabase-config.js ichida. */

const esc = noxarEscape;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const GENDER_LABEL = { ayollar: 'Ayollar', erkaklar: 'Erkaklar', unisex: 'Uniseks' };
const CACHE_KEY = 'noxar-products-cache-v2';

const toastElement = $('.toast');
let wishlistItems = noxarReadJSON('noxar-wishlist', []).map(String);
let recentlyViewed = noxarReadJSON('noxar-recent', []).map(String);
let allProducts = [];
let catalogLoaded = false;
const view = { department: 'all', gender: 'all', sort: 'default' };

/* ---------- Yordamchilar ---------- */
function showToast(message) {
  if (!toastElement) return;
  toastElement.textContent = message;
  toastElement.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toastElement.classList.remove('show'), 2800);
}

function productUrl(id) {
  return `product.html?id=${encodeURIComponent(id)}`;
}

function openProductPage(id) {
  if (id) window.location.href = productUrl(id);
}

function saveWishlist() { noxarWriteJSON('noxar-wishlist', wishlistItems); }
function saveRecent() { noxarWriteJSON('noxar-recent', recentlyViewed); }

function buildProducts(rows, reviewRows) {
  const stats = {};
  (reviewRows || []).forEach((review) => {
    const key = String(review.product_id);
    stats[key] ||= { sum: 0, count: 0 };
    stats[key].sum += Number(review.rating) || 0;
    stats[key].count += 1;
  });
  return (rows || []).map((row) => noxarProductFromRow(row, stats)).filter((product) => product.id && product.name);
}

/* ---------- Kartochka qismlari ---------- */
function stockLabel(product) {
  if (product.stock === 0) return '<span class="stock-badge sold-out">Sotilgan</span>';
  if (product.stock <= 3) return `<span class="stock-badge low-stock">Faqat ${product.stock} ta qoldi</span>`;
  return '<span class="stock-badge in-stock">Mavjud</span>';
}

function bottleMarkup(product) {
  const bottleClass = product.art === 'cream-art' ? 'light' : product.art === 'rose-art' ? 'rose' : '';
  return `<div class="mini-bottle ${bottleClass}"><b>N</b></div>`;
}

function mediaMarkup(product) {
  const image = noxarSafeUrl(product.image);
  const video = noxarSafeUrl(product.video);
  const frames = [];
  if (image) frames.push(`<img class="catalog-media-frame product-media-image" src="${image}" alt="${esc(product.name)}" loading="lazy">`);
  if (video) frames.push(`<video class="catalog-media-frame product-media-video" src="${video}" controls muted playsinline preload="metadata"></video>`);
  if (!frames.length) frames.push(`<div class="catalog-media-frame catalog-media-fallback">${bottleMarkup(product)}</div>`);
  const dots = frames.length > 1
    ? `<div class="catalog-media-dots" aria-hidden="true">${frames.map((_, index) => `<i class="${index === 0 ? 'active' : ''}"></i>`).join('')}</div><span class="catalog-media-hint">← suring →</span>`
    : '';
  return `<div class="catalog-media-viewport"><div class="catalog-media-track" data-media-index="0">${frames.join('')}</div>${dots}</div>`;
}

function ratingMarkup(product) {
  if (!product.reviewCount) return '';
  return `<div class="catalog-rating"><span>★ ${product.rating.toFixed(1)}</span><small>${product.reviewCount} sharh</small></div>`;
}

function priceMarkup(product) {
  return `<div><del>${product.oldAmount ? noxarFormatPrice(product.oldAmount) : ''}</del><strong>${noxarFormatPrice(product.amount)}</strong></div>`;
}

function isFavorite(id) { return wishlistItems.includes(String(id)); }

function catalogCard(product) {
  const favorite = isFavorite(product.id);
  return `
    <article class="catalog-card product-card reveal visible${product.stock === 0 ? ' is-soldout' : ''}" data-product-id="${esc(product.id)}" tabindex="0" role="link" aria-label="${esc(product.name)} — batafsil">
      <div class="catalog-art product-image ${product.art}">
        ${product.badge ? `<span class="badge">${esc(product.badge)}</span>` : ''}
        ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
        ${stockLabel(product)}
        <button class="card-favorite ${favorite ? 'active' : ''}" data-favorite-id="${esc(product.id)}" type="button" aria-label="Sevimliga qo‘shish" aria-pressed="${favorite}">${favorite ? '♥' : '♡'}</button>
        ${mediaMarkup(product)}
      </div>
      <div class="catalog-card-body">
        <p class="catalog-brand">${esc(product.brand)}</p>
        <h3><a class="card-link" href="${productUrl(product.id)}">${esc(product.name)}</a></h3>
        ${product.notes ? `<p class="product-notes">${esc(product.notes)}</p>` : ''}
        ${ratingMarkup(product)}
        <div class="catalog-card-footer">${priceMarkup(product)}</div>
        <span class="card-more">Batafsil ko‘rish <span aria-hidden="true">↗</span></span>
      </div>
    </article>`;
}

/* ---------- Katalog ---------- */
function visibleProducts() {
  const list = allProducts.filter((product) =>
    (view.department === 'all' || product.department === view.department)
    && (view.gender === 'all' || product.gender === view.gender));
  const inStockFirst = (a, b) => Number(a.stock === 0) - Number(b.stock === 0);
  list.sort((a, b) => {
    if (view.sort === 'priceAsc') return a.amount - b.amount;
    if (view.sort === 'priceDesc') return b.amount - a.amount;
    if (view.sort === 'popular') return (b.popularity - a.popularity) || (b.reviewCount - a.reviewCount) || (b.rating - a.rating);
    if (view.sort === 'newest') return b.createdAt - a.createdAt;
    return inStockFirst(a, b) || (b.createdAt - a.createdAt);
  });
  return list;
}

function renderCatalog() {
  const grid = $('.catalog-grid');
  const status = $('.catalog-status');
  if (!grid || !status) return;
  if (!catalogLoaded) {
    grid.innerHTML = '';
    status.textContent = 'Mahsulotlar yuklanmoqda…';
    return;
  }
  const list = visibleProducts();
  grid.innerHTML = list.map(catalogCard).join('');
  if (list.length) {
    status.textContent = `${list.length} ta mahsulot ko‘rsatilmoqda`;
  } else if (!allProducts.length) {
    status.textContent = 'Hozircha mahsulotlar qo‘shilmagan. Tez orada yangilanadi.';
  } else {
    status.textContent = 'Tanlangan filterlar bo‘yicha mahsulot topilmadi.';
  }
}

function renderCatalogError() {
  const status = $('.catalog-status');
  if (!status) return;
  status.innerHTML = 'Mahsulotlarni yuklab bo‘lmadi. <button class="text-link catalog-retry" type="button">Qayta urinib ko‘rish</button>';
}

/* ---------- Bosh sahifadagi "Yangi" va "Mashhur" bloklari ---------- */
function renderHighlights() {
  const newGrid = $('.product-grid');
  const popularGrid = $('.popular-grid');
  const pool = [...allProducts].sort((a, b) => Number(a.stock === 0) - Number(b.stock === 0));

  if (newGrid) {
    const fresh = [...pool].sort((a, b) => (Number(a.stock === 0) - Number(b.stock === 0)) || (Number(/yangi/i.test(b.badge)) - Number(/yangi/i.test(a.badge))) || (b.createdAt - a.createdAt)).slice(0, 3);
    newGrid.innerHTML = fresh.length ? fresh.map((product, index) => {
      const image = noxarSafeUrl(product.image);
      return `
      <article class="product-card reveal visible" data-product-id="${esc(product.id)}" tabindex="0" role="link" aria-label="${esc(product.name)} — batafsil">
        <div class="product-image ${product.art}${image ? ' has-photo' : ''}">${product.badge ? `<span class="badge">${esc(product.badge)}</span>` : ''}${image ? `<img class="product-media-image" src="${image}" alt="${esc(product.name)}" loading="lazy">` : bottleMarkup(product)}<span class="art-number">${String(index + 1).padStart(2, '0')}</span></div>
        <div class="product-info"><div><h3><a class="card-link" href="${productUrl(product.id)}">${esc(product.name)}</a></h3><p>${esc(product.notes || product.brand)}</p></div><strong>${noxarFormatPrice(product.amount)}</strong></div>
        <button class="product-view" type="button" data-product-id="${esc(product.id)}">Batafsil ko‘rish <span>↗</span></button>
      </article>`;
    }).join('') : '<p class="grid-status">Hozircha mahsulotlar qo‘shilmagan.</p>';
  }

  if (popularGrid) {
    const popular = [...pool].sort((a, b) => (Number(a.stock === 0) - Number(b.stock === 0)) || (b.popularity - a.popularity) || (b.reviewCount - a.reviewCount) || (b.rating - a.rating)).slice(0, 2);
    popularGrid.innerHTML = popular.map((product, index) => `
      <article class="popular-item reveal visible" data-product-id="${esc(product.id)}" tabindex="0" role="link" aria-label="${esc(product.name)} — batafsil">
        <span class="popular-index">${String(index + 1).padStart(2, '0')}</span>
        <div class="popular-bottle ${product.art === 'black-art' ? 'dark' : 'sand'}"></div>
        <div><p class="popular-type">${esc(product.brand)} · ${GENDER_LABEL[product.gender]}</p><h3>${esc(product.name)}</h3><p class="popular-notes">${esc(product.notes)}</p><strong>${noxarFormatPrice(product.amount)}</strong></div>
        <a class="round-link small" href="${productUrl(product.id)}" aria-label="${esc(product.name)}ni ko‘rish">↗</a>
      </article>`).join('');
  }
}

/* ---------- Sevimlilar ---------- */
function updateFavoriteButtons() {
  $$('[data-favorite-id]').forEach((button) => {
    const active = isFavorite(button.dataset.favoriteId);
    button.classList.toggle('active', active);
    button.textContent = active ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderWishlist() {
  const count = $('.wishlist-count');
  if (count) count.textContent = wishlistItems.length;
  const container = $('.wishlist-items');
  if (!container) return;
  const items = wishlistItems.map((id) => allProducts.find((product) => product.id === id)).filter(Boolean);
  if (!items.length) {
    const loading = !catalogLoaded && wishlistItems.length;
    container.innerHTML = loading
      ? '<div class="empty-cart"><span>♡</span><h3>Yuklanmoqda…</h3></div>'
      : '<div class="empty-cart"><span>♡</span><h3>Sevimlilar hali bo‘sh</h3><p>Yoqqan hidlaringizni yurak tugmasi orqali shu yerda saqlang.</p><button class="text-link continue-wishlist" type="button">Katalogni ko‘rish <span>↗</span></button></div>';
    return;
  }
  container.innerHTML = items.map((item) => {
    const image = noxarSafeUrl(item.image);
    return `<article class="wishlist-item" data-wishlist-id="${esc(item.id)}"><div class="wishlist-art ${item.art}">${image ? `<img src="${image}" alt="" loading="lazy">` : '<b>N</b>'}</div><div><h3>${esc(item.name)}</h3><p>${esc(item.brand)} · ${noxarFormatPrice(item.amount)}</p><button class="wishlist-view-product" type="button" data-wishlist-action="view">Mahsulotni ko‘rish <span>↗</span></button></div><button class="wishlist-remove" type="button" data-wishlist-action="remove" aria-label="${esc(item.name)}ni o‘chirish">×</button></article>`;
  }).join('');
}

function toggleWishlist(id) {
  id = String(id);
  const product = allProducts.find((item) => item.id === id);
  if (isFavorite(id)) {
    wishlistItems = wishlistItems.filter((item) => item !== id);
    showToast(`${product ? product.name : 'Mahsulot'} sevimlilardan olib tashlandi`);
  } else {
    wishlistItems.push(id);
    showToast(`${product ? product.name : 'Mahsulot'} sevimlilarga qo‘shildi`);
  }
  saveWishlist();
  renderWishlist();
  updateFavoriteButtons();
}

/* ---------- Yaqinda ko'rilganlar ---------- */
function renderRecent() {
  const section = $('#recently-viewed');
  const grid = $('.recent-grid');
  if (!section || !grid) return;
  const items = recentlyViewed.map((id) => allProducts.find((product) => product.id === id)).filter(Boolean).slice(0, 6);
  section.hidden = !items.length;
  grid.innerHTML = items.map((product) => {
    const image = noxarSafeUrl(product.image);
    return `
    <article class="recent-card" data-product-id="${esc(product.id)}" tabindex="0" role="link" aria-label="${esc(product.name)} — batafsil">
      <div class="recent-art ${product.art}">${image ? `<img src="${image}" alt="" loading="lazy">` : bottleMarkup(product)}</div>
      <div><p class="catalog-brand">${esc(product.brand)}</p><h3>${esc(product.name)}</h3><strong>${noxarFormatPrice(product.amount)}</strong></div>
      <button class="recent-add" type="button" data-product-id="${esc(product.id)}">Ko‘rish <span>↗</span></button>
    </article>`;
  }).join('');
}

/* ---------- Mahsulotlarni yuklash ---------- */
function applyProducts(products) {
  allProducts = products;
  catalogLoaded = true;
  renderCatalog();
  renderHighlights();
  renderWishlist();
  renderRecent();
  renderSearchResults($('#search-input')?.value || '');
}

async function loadProducts() {
  const cached = noxarReadJSON(CACHE_KEY, null);
  if (cached?.rows) applyProducts(buildProducts(cached.rows, cached.reviews));
  else renderCatalog();
  try {
    const [productResult, reviewRows] = await Promise.all([
      noxarSupabase.from('products').select('*').order('created_at', { ascending: false }),
      noxarSupabase.from('reviews').select('product_id,rating').then((result) => result.data || []).catch(() => [])
    ]);
    const rows = Array.isArray(productResult.data) ? productResult.data : [];
    noxarWriteJSON(CACHE_KEY, { savedAt: Date.now(), rows, reviews: reviewRows });
    applyProducts(buildProducts(rows, reviewRows));
    /* O'chirilgan mahsulotlarni sevimli va "ko'rilganlar"dan tozalaymiz. */
    const ids = new Set(allProducts.map((product) => product.id));
    wishlistItems = wishlistItems.filter((id) => ids.has(id));
    recentlyViewed = recentlyViewed.filter((id) => ids.has(id));
    saveWishlist();
    saveRecent();
    renderWishlist();
    renderRecent();
  } catch (error) {
    console.error('Mahsulotlarni yuklashda xatolik:', error);
    if (!catalogLoaded) renderCatalogError();
  }
}

/* ---------- Qidiruv ---------- */
function renderSearchResults(query) {
  const results = $('.search-results');
  if (!results) return;
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    results.innerHTML = '';
    return;
  }
  const matches = allProducts.filter((product) =>
    `${product.name} ${product.brand} ${product.notes} ${product.description} ${GENDER_LABEL[product.gender]}`.toLowerCase().includes(normalized));
  if (!matches.length) {
    results.innerHTML = `<span class="search-empty">“${esc(query.trim())}” bo‘yicha natija topilmadi</span>`;
    return;
  }
  results.innerHTML = matches.slice(0, 6).map((product) => `
    <button class="search-result" type="button" data-product-id="${esc(product.id)}">
      <span class="search-result-art ${product.art}"><b>N</b></span>
      <span><strong>${esc(product.name)}</strong><small>${esc(product.brand)} · ${noxarFormatPrice(product.amount)}</small></span>
      <span class="search-arrow">↗</span>
    </button>`).join('');
}

const searchPanel = $('.search-panel');
const searchInput = $('#search-input');
const searchToggle = $('.search-toggle');
const searchResults = $('.search-results');

function openSearch() {
  searchPanel.classList.add('active');
  searchInput.focus();
}
function closeSearch() {
  searchPanel.classList.remove('active');
  searchInput.value = '';
  searchResults.innerHTML = '';
}
searchToggle?.addEventListener('click', () => {
  if (searchPanel.classList.contains('active')) closeSearch(); else openSearch();
});
searchInput.addEventListener('input', () => {
  searchPanel.classList.toggle('active', searchInput.value.trim().length > 0);
  renderSearchResults(searchInput.value);
});
searchInput.addEventListener('blur', () => {
  if (!searchInput.value.trim()) searchPanel.classList.remove('active');
});
searchResults.addEventListener('click', (event) => {
  const result = event.target.closest('.search-result');
  if (result) openProductPage(result.dataset.productId);
});

/* ---------- Katalog va kartochkalar bilan ishlash ---------- */
let mediaSwipeStart = null;
let suppressClickUntil = 0;

function showCatalogMedia(track, direction) {
  const frames = $$('.catalog-media-frame', track);
  if (frames.length < 2) return;
  const nextIndex = (Number(track.dataset.mediaIndex) + direction + frames.length) % frames.length;
  track.dataset.mediaIndex = String(nextIndex);
  track.style.transform = `translateX(-${nextIndex * 100}%)`;
  $$('.catalog-media-dots i', track.parentElement).forEach((dot, index) => dot.classList.toggle('active', index === nextIndex));
  $$('video', track).forEach((video, index) => { if (index !== nextIndex) video.pause(); });
}

const catalogGrid = $('.catalog-grid');
catalogGrid.addEventListener('pointerdown', (event) => {
  const track = event.target.closest('.catalog-media-track');
  if (track) mediaSwipeStart = { track, x: event.clientX, y: event.clientY };
});
catalogGrid.addEventListener('pointerup', (event) => {
  if (!mediaSwipeStart) return;
  const { track, x, y } = mediaSwipeStart;
  mediaSwipeStart = null;
  const deltaX = event.clientX - x;
  const deltaY = event.clientY - y;
  if (Math.abs(deltaX) < 35 || Math.abs(deltaX) < Math.abs(deltaY)) return;
  showCatalogMedia(track, deltaX < 0 ? 1 : -1);
  suppressClickUntil = Date.now() + 450;
});

/* Kartochka, "Batafsil" tugmasi va yurakcha — bitta umumiy boshqaruvchi. */
function handleProductClick(event) {
  if (Date.now() < suppressClickUntil) return;
  const favoriteButton = event.target.closest('[data-favorite-id]');
  if (favoriteButton) {
    event.preventDefault();
    toggleWishlist(favoriteButton.dataset.favoriteId);
    return;
  }
  if (event.target.closest('video, .card-link, .round-link')) return;
  if (event.target.closest('.catalog-media-video')) return;
  const target = event.target.closest('[data-product-id]');
  if (target && !target.closest('.search-results, .wishlist-items')) openProductPage(target.dataset.productId);
}
function handleProductKey(event) {
  if (event.key !== 'Enter' || event.target.closest('a, button')) return;
  const card = event.target.closest('[data-product-id][role="link"]');
  if (card) openProductPage(card.dataset.productId);
}
['.catalog-grid', '.product-grid', '.popular-grid', '.recent-grid'].forEach((selector) => {
  const element = $(selector);
  element?.addEventListener('click', handleProductClick);
  element?.addEventListener('keydown', handleProductKey);
});

$('.catalog-status')?.addEventListener('click', (event) => {
  if (event.target.closest('.catalog-retry')) {
    catalogLoaded = false;
    renderCatalog();
    loadProducts();
  }
});

$('.clear-recent')?.addEventListener('click', () => {
  recentlyViewed = [];
  saveRecent();
  renderRecent();
});

/* ---------- Bo'lim va jins filtrlari ---------- */
const categorySelect = $('.category-select');
const categoryPicker = $('.category-picker');
const categoryTrigger = $('.category-select-trigger');
const categoryMenu = $('.category-select-menu');

function syncCategoryPicker() {
  const option = $(`[data-value="${view.gender}"]`, categoryMenu) || $('[data-value="all"]', categoryMenu);
  $('span', categoryTrigger).textContent = $('.category-option-label', option).textContent;
  $$('[role="option"]', categoryMenu).forEach((item) => item.setAttribute('aria-selected', String(item === option)));
  categorySelect.value = view.gender;
}

function closeCategoryMenu() {
  categoryPicker.classList.remove('open');
  categoryTrigger.setAttribute('aria-expanded', 'false');
  categoryMenu.hidden = true;
}

categoryTrigger.addEventListener('click', () => {
  const isOpen = categoryPicker.classList.toggle('open');
  categoryTrigger.setAttribute('aria-expanded', String(isOpen));
  categoryMenu.hidden = !isOpen;
});
categoryMenu.addEventListener('click', (event) => {
  const option = event.target.closest('[data-value]');
  if (!option) return;
  view.gender = option.dataset.value;
  syncCategoryPicker();
  closeCategoryMenu();
  renderCatalog();
});
categorySelect.addEventListener('change', () => {
  view.gender = categorySelect.value;
  syncCategoryPicker();
  renderCatalog();
});
document.addEventListener('click', (event) => {
  if (!categoryPicker.contains(event.target)) closeCategoryMenu();
});

$$('[data-department]').forEach((button) => button.addEventListener('click', () => {
  view.department = button.dataset.department;
  $$('[data-department]').forEach((item) => item.classList.toggle('active', item === button));
  renderCatalog();
}));

$('.sort-select').addEventListener('change', (event) => {
  view.sort = event.target.value;
  renderCatalog();
});
syncCategoryPicker();

/* ---------- Sevimlilar paneli ---------- */
const wishlistDrawer = $('.wishlist-drawer');
function openWishlist() {
  renderWishlist();
  wishlistDrawer.classList.add('open');
  wishlistDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('wishlist-open');
}
function closeWishlist() {
  wishlistDrawer.classList.remove('open');
  wishlistDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('wishlist-open');
}
$('.wishlist-button').addEventListener('click', openWishlist);
$$('[data-close-wishlist]', wishlistDrawer).forEach((element) => element.addEventListener('click', closeWishlist));
$('.wishlist-items', wishlistDrawer).addEventListener('click', (event) => {
  if (event.target.closest('.continue-wishlist')) {
    closeWishlist();
    $('#catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const itemElement = event.target.closest('.wishlist-item');
  const action = event.target.closest('[data-wishlist-action]')?.dataset.wishlistAction;
  if (!itemElement || !action) return;
  if (action === 'remove') toggleWishlist(itemElement.dataset.wishlistId);
  if (action === 'view') openProductPage(itemElement.dataset.wishlistId);
});

/* ---------- Kabinet ---------- */
const accountPanel = $('.account-panel');
const accountTabs = $$('.account-tab');

function authError(error, fallback) {
  const message = String(error?.message || '');
  if (/invalid login/i.test(message)) return 'Email yoki parol noto‘g‘ri';
  if (/not confirmed/i.test(message)) return 'Email manzilingiz hali tasdiqlanmagan. Pochtangizni tekshiring.';
  if (/already registered|already been registered/i.test(message)) return 'Bu email bilan allaqachon ro‘yxatdan o‘tilgan';
  if (/password/i.test(message) && /(least|short|weak)/i.test(message)) return 'Parol kamida 6 ta belgidan iborat bo‘lsin';
  if (/rate limit|too many/i.test(message)) return 'Juda ko‘p urinish. Biroz kutib qayta urinib ko‘ring.';
  if (/failed to fetch|network/i.test(message)) return 'Internet aloqasini tekshiring';
  return message || fallback;
}

function renderAccount() {
  const user = noxarAuth.currentUser();
  const dashboard = $('.account-dashboard');
  const authPanels = $$('.account-auth');
  const tabs = $('.account-tabs');
  if (!user) {
    dashboard.classList.add('hidden');
    tabs.style.display = '';
    const activeTab = $('.account-tab.active')?.dataset.accountTab || 'login';
    authPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.authPanel === activeTab));
    return;
  }
  tabs.style.display = 'none';
  authPanels.forEach((panel) => panel.classList.remove('active'));
  dashboard.classList.remove('hidden');
  $('#account-user-name').textContent = user.name;
  $('#account-user-email').textContent = user.email;
  const requests = noxarReadJSON('noxar-my-reservations', []);
  $('.account-orders').innerHTML = requests.length ? requests.slice(0, 10).map((request) => `
    <div class="history-item">
      <div><span class="history-code">${esc(request.productName)}</span><small>${esc(new Date(request.createdAt).toLocaleDateString('uz-UZ'))}</small></div>
      <div><strong>${esc(request.type)}</strong><small>${esc(request.quantity)} ta · yuborildi</small></div>
    </div>`).join('') : '<div class="empty-order">Hali so‘rov yuborilmagan</div>';
}

function openAccount() {
  renderAccount();
  accountPanel.classList.add('open');
  accountPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('account-open');
  setBottomNav('account');
}
function closeAccount() {
  accountPanel.classList.remove('open');
  accountPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('account-open');
  setBottomNav('home');
}
function setBottomNav(name) {
  $$('[data-mobile-nav]').forEach((button) => button.classList.toggle('active', button.dataset.mobileNav === name));
}

$('.account-button').addEventListener('click', openAccount);
$$('[data-close-account]', accountPanel).forEach((element) => element.addEventListener('click', closeAccount));

accountTabs.forEach((tab) => tab.addEventListener('click', () => {
  accountTabs.forEach((item) => item.classList.toggle('active', item === tab));
  $$('.account-auth').forEach((panel) => panel.classList.toggle('active', panel.dataset.authPanel === tab.dataset.accountTab));
}));

$('[data-form="login"]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('button[type="submit"]', form);
  const email = String(form.elements.email.value || '').trim().toLowerCase();
  const password = String(form.elements.password.value || '');
  button.disabled = true;
  try {
    await noxarAuth.signIn(email, password);
    form.reset();
    renderAccount();
    showToast('Kabinetga kirdingiz');
  } catch (error) {
    showToast(authError(error, 'Kirish amalga oshmadi'));
  } finally {
    button.disabled = false;
  }
});

$('[data-form="register"]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('button[type="submit"]', form);
  const name = String(form.elements.name.value || '').trim();
  const email = String(form.elements.email.value || '').trim().toLowerCase();
  const password = String(form.elements.password.value || '');
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    showToast('Ism va email manzilini to‘g‘ri kiriting');
    return;
  }
  if (password.length < 6) {
    showToast('Parol kamida 6 ta belgidan iborat bo‘lsin');
    return;
  }
  button.disabled = true;
  try {
    const result = await noxarAuth.signUp(email, password, name);
    form.reset();
    if (!result?.access_token) {
      showToast('Ro‘yxatdan o‘tdingiz. Email manzilingizni tasdiqlang, so‘ng kiring.');
      accountTabs.find((tab) => tab.dataset.accountTab === 'login')?.click();
      return;
    }
    renderAccount();
    showToast('Ro‘yxatdan o‘tish muvaffaqiyatli');
  } catch (error) {
    showToast(authError(error, 'Ro‘yxatdan o‘tish amalga oshmadi'));
  } finally {
    button.disabled = false;
  }
});

$('.forgot-password')?.addEventListener('click', async () => {
  const email = String($('[data-form="login"]').elements.email.value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    showToast('Avval email manzilingizni kiriting');
    return;
  }
  try {
    await noxarAuth.resetPassword(email);
    showToast('Parolni tiklash havolasi emailingizga yuborildi');
  } catch (error) {
    showToast(authError(error, 'Xat yuborilmadi'));
  }
});

$('.logout-button').addEventListener('click', async () => {
  await noxarAuth.signOut();
  renderAccount();
  showToast('Tizimdan chiqdingiz');
});

/* Sessiya muddati tugagan bo'lsa, jimgina yangilaymiz yoki chiqaramiz. */
async function validateSession() {
  const session = noxarAuth.readSession();
  if (!session?.access_token) return;
  const expiresAt = Number(session.expires_at || 0) * 1000;
  if (expiresAt && expiresAt - Date.now() < 60000) {
    try {
      if (!session.refresh_token) throw new Error('no refresh');
      await noxarAuth.refreshSession(session.refresh_token);
    } catch (error) {
      await noxarAuth.signOut();
    }
  }
}

/* ---------- Yangiliklarga obuna ---------- */
$('.newsletter-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = $('input[type="email"]', form);
  const status = $('.newsletter-status', form);
  const button = $('button[type="submit"]', form);
  const email = input.value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    status.textContent = 'Email manzilini to‘g‘ri kiriting.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Yuborilmoqda…';
  try {
    await noxarSupabase.from('newsletter_subscribers').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
    status.textContent = 'Rahmat! Siz obuna bo‘ldingiz.';
    input.value = '';
  } catch (error) {
    console.error('Obuna xatosi:', error);
    status.textContent = 'Obuna amalga oshmadi. Birozdan keyin qayta urinib ko‘ring.';
  } finally {
    button.disabled = false;
  }
});

/* ---------- Sarlavha, menyu, pastki panel ---------- */
$('.mobile-location')?.addEventListener('click', () => {
  window.open(NOXAR_SHOP.mapsUrl, '_blank', 'noopener,noreferrer');
});

const menuToggle = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
menuToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', String(mobileNav.classList.contains('active')));
});
$$('a', mobileNav).forEach((link) => link.addEventListener('click', () => {
  mobileNav.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

$$('[data-mobile-nav]').forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.mobileNav;
  if (action === 'home') {
    closeSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setBottomNav('home');
  }
  if (action === 'search') {
    if (searchPanel.classList.contains('active')) closeSearch(); else openSearch();
  }
  if (action === 'account') openAccount();
}));

document.addEventListener('click', (event) => {
  if (!searchPanel.contains(event.target) && !searchToggle?.contains(event.target) && !event.target.closest('[data-mobile-nav="search"]')) {
    if (searchPanel.classList.contains('active')) closeSearch();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeSearch();
  closeCategoryMenu();
  if (wishlistDrawer.classList.contains('open')) closeWishlist();
  if (accountPanel.classList.contains('open')) closeAccount();
  mobileNav.classList.remove('active');
});

const backToTop = $('.back-to-top');
window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 500), { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

$$('.current-year').forEach((element) => { element.textContent = new Date().getFullYear(); });

/* Ko'rinish animatsiyasi (reveal) — keyin qo'shilgan elementlar uchun ham. */
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;
$$('.reveal').forEach((element) => {
  if (revealObserver) revealObserver.observe(element); else element.classList.add('visible');
});

/* ---------- Ishga tushirish ---------- */
renderWishlist();
validateSession().finally(renderAccount);
loadProducts();
