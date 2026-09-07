const cartCount = document.querySelector('.cart-count');
const toast = document.querySelector('.toast');
document.querySelector('.mobile-preview-button')?.addEventListener('click', () => {
  const mobileWindow = window.open(`${window.location.pathname}#home`, 'noxar-mobile-preview', 'width=390,height=844,resizable=yes,scrollbars=yes');
  if (mobileWindow) mobileWindow.focus();
});
document.querySelector('.desktop-preview-button')?.addEventListener('click', () => {
  const desktopWindow = window.open(`${window.location.pathname}#home`, 'noxar-desktop-preview', 'width=1440,height=900,resizable=yes,scrollbars=yes');
  if (desktopWindow) desktopWindow.focus();
});
let cartItems = JSON.parse(localStorage.getItem('noxar-cart') || '[]');
let wishlistItems = JSON.parse(localStorage.getItem('noxar-wishlist') || '[]');
let appliedPromo = JSON.parse(localStorage.getItem('noxar-promo') || 'null');
let recentlyViewed = JSON.parse(localStorage.getItem('noxar-recent') || '[]');

const demoProducts = [
  { id: 'obsidian', name: 'NO. 01 Obsidian', brand: 'NOXAR', price: '890 000 so‘m', amount: 890000, notes: 'Qora qalampir · Vetiver · Amber', categories: ['unisex', 'yangi'], family: 'amber', volume: '50', rating: 4.9, popularity: 98, art: 'black-art', badge: 'Yangi', top: 'Qora qalampir', heart: 'Vetiver', base: 'Amber va tutun', description: 'Tutunli amber va vetiver uyg‘unligi bilan yaratilgan chuqur, zamonaviy va uzoq saqlanuvchi kompozitsiya.', usage: 'Bilak, bo‘yin va quloq orqasiga 2–3 marta seping. Ishqalamasdan, tabiiy qurishini kuting.', features: ['Eau de Parfum', 'Uniseks', 'Uzoq saqlanish: 8–10 soat'] },
  { id: 'santal', name: 'NO. 02 Santal', brand: 'NOXAR', price: '950 000 so‘m', amount: 950000, notes: 'Sandal · Iris · Oq mushk', categories: ['unisex'], family: 'woody', volume: '100', rating: 4.8, popularity: 100, art: 'cream-art', badge: 'Bestseller', top: 'Kardamon', heart: 'Iris', base: 'Sandal va oq mushk', description: 'Yumshoq sandal daraxti, iris va oq mushkdan tuzilgan nafis, sokin va kundalik foydalanishga mos hid.', usage: 'Toza teriga yoki kiyimga 2–4 marta seping. Ertalab va maxsus kechalar uchun mos.', features: ['Eau de Parfum', 'Uniseks', 'Uzoq saqlanish: 7–9 soat'] },
  { id: 'eclat', name: 'NO. 03 Éclat', brand: 'NOXAR', price: '820 000 so‘m', amount: 820000, notes: 'Atirgul · Lychee · Vanil', categories: ['ayollar', 'yangi'], family: 'floral', volume: '50', rating: 4.7, popularity: 92, art: 'rose-art', badge: 'Yangi', top: 'Lychee', heart: 'Atirgul', base: 'Vanil va mushk', description: 'Lychee va atirgulning yorqin ochilishi vanilning iliq shirinligi bilan muvozanatlangan romantik hid.', usage: 'Purkamchini teridan 15–20 sm uzoqlikda tuting va puls nuqtalariga yengil seping.', features: ['Eau de Parfum', 'Ayollar', 'Uzoq saqlanish: 6–8 soat'] },
  { id: 'noir', name: 'Noir Intense', brand: 'ATELIER N', price: '1 150 000 so‘m', amount: 1150000, notes: 'Teri · Oud · Qora amber', categories: ['erkaklar'], family: 'amber', volume: '100', rating: 4.6, popularity: 87, art: 'black-art', badge: '', top: "Za'faron", heart: 'Teri', base: 'Oud va qora amber', description: 'Qora amber, teri va oud notalari bilan kuchli xarakterga ega bo‘lgan kechki kompozitsiya.', usage: 'Kechki tadbirlar oldidan 2–3 marta seping. Issiq nuqtalarda ishlatish hidni yaxshiroq ochadi.', features: ['Eau de Parfum', 'Erkaklar', 'Uzoq saqlanish: 9–11 soat'] },
  { id: 'velours', name: 'Velours Rose', brand: 'MAISON N', price: '1 080 000 so‘m', amount: 1080000, notes: 'Atirgul · Peoniya · Vanil', categories: ['ayollar'], family: 'floral', volume: '30', rating: 4.5, popularity: 79, art: 'rose-art', badge: '', top: 'Bergamot', heart: 'Peoniya', base: 'Vanil va sandal', description: 'Yangi bergamot va peoniyaning nafis guldastasi vanil-sandal bazasida mayin yakunlanadi.', usage: 'Kiyim yoki teriga kun davomida 2 marta yangilab seping. Haddan tashqari ko‘p ishlatmaslik tavsiya etiladi.', features: ['Eau de Parfum', 'Ayollar', 'Uzoq saqlanish: 6–8 soat'] },
  { id: 'ritual', name: 'NOXAR Ritual Set', brand: 'NOXAR', price: '1 490 000 so‘m', amount:1490000, notes: '3 mini atir · Sovg‘a qutisi', categories: ['sovga', 'yangi'], family: 'woody', volume: 'set', rating: 4.9, popularity: 83, art: 'cream-art', badge: 'Sovg‘a', top: 'Neroli', heart: 'Sandal', base: 'Amber va tonka', description: 'NOXAR olamining uchta mini kompozitsiyasi va premium sovg‘a qutisidan iborat to‘plam.', usage: 'Mini flakonlarni navbat bilan sinab ko‘ring yoki sovg‘a sifatida taqdim eting.', features: ['3 mini atir', 'Sovg‘a qutisi', 'Kolleksiya to‘plami'] }
  ,{ id: 'mist', name: 'Neroli Body Mist', brand: 'NOXAR BODY', price: '320 000 so‘m', amount: 320000, notes: 'Neroli · Paxta · Oq mushk', categories: ['body-care', 'yangi'], family: 'floral', volume: '150', rating: 4.8, popularity: 76, art: 'cream-art', badge: 'Yangi', top: 'Neroli', heart: 'Paxta guli', base: 'Oq mushk', description: 'Tana uchun yengil va tetiklantiruvchi mist. Kundalik parvarishdan keyin mayin hid qoldiradi.', usage: 'Tana va kiyimga 15 sm masofadan seping.', features: ['Body mist', '150 ml', 'Vegan formula'] }
  ,{ id: 'serum', name: 'Radiance Face Serum', brand: 'NOXAR SKIN', price: '460 000 so‘m', amount: 460000, notes: 'Vitamin C · Niacinamide · Hyaluronic acid', categories: ['skincare'], family: 'floral', volume: '30', rating: 4.7, popularity: 71, art: 'rose-art', badge: '', top: 'Vitamin C', heart: 'Niacinamide', base: 'Hyaluronic acid', description: 'Yuz terisini namlantirish va yorqin ko‘rsatish uchun yengil serum.', usage: 'Tozalangan yuzga 2–3 tomchi surting, so‘ng namlantiruvchi krem ishlating.', features: ['30 ml', 'Barcha teri turlari', 'Dermatologik testdan o‘tgan'] }
  ,{ id: 'lipstick', name: 'Velvet Nude Lipstick', brand: 'NOXAR BEAUTY', price: '240 000 so‘m', amount: 240000, notes: 'Nude · Velvet · Uzoq saqlanuvchi', categories: ['makeup'], family: 'floral', volume: '4', rating: 4.6, popularity: 68, art: 'rose-art', badge: '', top: 'Nude pigment', heart: 'Velvet finish', base: 'Namlashtiruvchi baza', description: 'Yumshoq velvet teksturali, kundalik nude rangdagi lab bo‘yog‘i.', usage: 'Quruq va toza labga bir tekis surting.', features: ['4 g', 'Velvet finish', 'Cruelty-free'] }
  ,{ id: 'shampoo', name: 'Silk Repair Shampoo', brand: 'NOXAR HAIR', price: '280 000 so‘m', amount: 280000, notes: 'Argan · Keratin · Ipak proteini', categories: ['hair-care'], family: 'woody', volume: '250', rating: 4.5, popularity: 62, art: 'cream-art', badge: '', top: 'Argan', heart: 'Keratin', base: 'Ipak proteini', description: 'Quruq va shikastlangan sochlar uchun yumshoq tozalovchi tiklovchi shampun.', usage: 'Nam sochga surting, ko‘pirtiring va yaxshilab chaying.', features: ['250 ml', 'Sulfatsiz formula', 'Quruq sochlar uchun'] }
  ,{ id: 'beauty-set', name: 'Everyday Beauty Set', brand: 'NOXAR BEAUTY', price: '690 000 so‘m', amount: 690000, notes: 'Lipstick · Mist · Beauty pouch', categories: ['sovga', 'makeup', 'body-care'], family: 'floral', volume: 'set', rating: 4.8, popularity: 74, art: 'rose-art', badge: 'Sovg‘a', top: 'Neroli', heart: 'Nude pigment', base: 'Oq mushk', description: 'Kundalik go‘zallik uchun body mist, lab bo‘yog‘i va premium kosmetik sumkadan iborat set.', usage: 'Mahsulotlarni kundalik parvarish va makiyaj tartibida ishlating.', features: ['3 mahsulot', 'Sovg‘a qutisi', 'Premium beauty pouch'] }
  ,{ id: 'deo', name: 'Noir Active Deodorant', brand: 'NOXAR MEN', price: '145 000 so‘m', amount: 145000, notes: 'Bergamot · Teri · Vetiver', categories: ['deodorants', 'erkaklar'], family: 'woody', volume: '150', rating: 4.6, popularity: 63, art: 'black-art', badge: 'Yangi', top: 'Bergamot', heart: 'Teri', base: 'Vetiver', description: 'Kun davomida tetiklik va ishonchli himoya beruvchi premium dezodorant.', usage: 'Toza va quruq teriga seping.', features: ['150 ml', 'Uzoq himoya', 'Erkaklar'] }
  ,{ id: 'oil', name: 'Amber Parfum Oil', brand: 'NOXAR OILS', price: '210 000 so‘m', amount: 210000, notes: 'Amber · Vanil · Sandal', categories: ['perfume-oils', 'unisex'], family: 'amber', volume: '15', rating: 4.7, popularity: 59, art: 'cream-art', badge: '', top: 'Amber', heart: 'Vanil', base: 'Sandal', description: 'Konsentrlangan parfyumeriya moyi. Kichik flakonda uzoq saqlanuvchi iliq hid.', usage: 'Puls nuqtalariga oz miqdorda surting.', features: ['15 ml', 'Uniseks', 'Konsentrlangan moy'] }
  ,{ id: 'home-candle', name: 'Noir Home Candle', brand: 'NOXAR HOME', price: '260 000 so‘m', amount: 260000, notes: 'Qora choy · Sadr · Amber', categories: ['home-fragrance', 'unisex'], family: 'woody', volume: '220', rating: 4.8, popularity: 57, art: 'black-art', badge: '', top: 'Qora choy', heart: 'Sadr', base: 'Amber', description: 'Uy muhiti uchun iliq, nafis va sokin aroma beruvchi xushbo‘y sham.', usage: 'Bir marotaba 2–3 soatdan ortiq yoqmang.', features: ['220 g', '40 soat yonish', 'Uy uchun'] }
  ,{ id: 'bath-set', name: 'Silk Bath Ritual', brand: 'NOXAR CARE', price: '390 000 so‘m', amount: 390000, notes: 'Lavanda · Sut · Oq mushk', categories: ['bath-shower', 'ayollar'], family: 'floral', volume: 'set', rating: 4.7, popularity: 55, art: 'rose-art', badge: 'Set', top: 'Lavanda', heart: 'Sut', base: 'Oq mushk', description: 'Dush va vanna uchun mayin hidli, kundalik parvarish to‘plami.', usage: 'Mahsulotlarni dush yoki vanna paytida ko‘rsatmasiga muvofiq ishlating.', features: ['3 mahsulot', 'Ayollar', 'Parvarish to‘plami'] }
  ,{ id: 'atomizer', name: 'Travel Perfume Atomizer', brand: 'NOXAR ACCESSORIES', price: '95 000 so‘m', amount: 95000, notes: 'Metall korpus · 8 ml · Qayta to‘ldiriladi', categories: ['accessories', 'unisex'], family: 'woody', volume: '8', rating: 4.5, popularity: 48, art: 'cream-art', badge: '', top: 'Metall', heart: '8 ml', base: 'Qayta to‘ldiriladi', description: 'Sevimli atiringizni o‘zingiz bilan olib yurish uchun ixcham atomizer.', usage: 'Flakonni pastki klapan orqali ehtiyotkorlik bilan to‘ldiring.', features: ['8 ml', 'Uniseks', 'Qayta to‘ldiriladi'] }
];
const products = [];
const stockLevels = { obsidian: 3, santal: 8, eclat: 0, noir: 2, velours: 6, ritual: 4, mist: 12, serum: 7, lipstick: 15, shampoo: 10, 'beauty-set': 5 };
let compareItems = JSON.parse(localStorage.getItem('noxar-compare') || '[]');

function formatPrice(amount) {
  return `${amount.toLocaleString('uz-UZ')} so'm`;
}

// Admin paneldan qo'shilgan mahsulotlarni birlashtirish
function getAdminProducts() {
  try {
    const adminProducts = JSON.parse(localStorage.getItem('noxar-admin-products') || '[]');
    return Array.isArray(adminProducts) ? adminProducts : [];
  } catch (error) {
    return [];
  }
}

function getDeletedProductIds() {
    try {
      const deleted = JSON.parse(localStorage.getItem('noxar-deleted-products') || '[]');
      const deletedIds = Array.isArray(deleted) ? deleted : [];
      return deletedIds;
    } catch (error) {
      return [];
  }
}

function formatAdminProduct(adminProduct) {
  const department = ['erkaklar', 'ayollar', 'unisex', 'sovga'].includes(adminProduct.category) ? 'atirlar' : adminProduct.category;
  const gender = ['erkaklar', 'ayollar', 'unisex'].includes(adminProduct.gender) ? adminProduct.gender
    : ['erkaklar', 'ayollar', 'unisex'].includes(adminProduct.category) ? adminProduct.category : 'unisex';
  return {
    id: adminProduct.id,
    name: adminProduct.name,
    brand: adminProduct.brand,
    image: adminProduct.image || '',
    video: adminProduct.video || '',
    price: formatPrice(adminProduct.amount),
    amount: adminProduct.amount,
    notes: adminProduct.notes,
    categories: [department, gender],
    department,
    family: adminProduct.family,
    volume: '50',
    rating: 4.5,
    popularity: 50,
    art: 'black-art',
    badge: '',
    top: adminProduct.notes.split('·')[0] || 'Note',
    heart: adminProduct.notes.split('·')[1] || 'Heart',
    base: adminProduct.notes.split('·')[2] || 'Base',
    description: adminProduct.notes,
    usage: 'Bilak, bo\'yin va quloq orqasiga 2–3 marta seping.',
    stock: Number(adminProduct.stock) || 0,
    features: ['Eau de Parfum', gender === 'erkaklar' ? 'Erkaklar' : gender === 'ayollar' ? 'Ayollar' : 'Uniseks', `Stock: ${adminProduct.stock}`]
  };
}

const adminProductsList = getAdminProducts().map(formatAdminProduct);
function getProductDepartment(product) {
  const departments = ['atirlar', 'body-fragrance', 'deodorants', 'perfume-oils', 'home-fragrance', 'bath-shower', 'accessories'];
  const directDepartment = product.categories.find((item) => departments.includes(item));
  if (directDepartment) return directDepartment;
  if (product.department) return product.department;
  if (product.categories.includes('body-care')) return 'body-fragrance';
  if (product.categories.includes('skincare') || product.categories.includes('hair-care')) return 'bath-shower';
  if (product.categories.includes('makeup') || product.categories.includes('sovga')) return 'accessories';
  return 'atirlar';
}
products.forEach((product) => { product.department = getProductDepartment(product); });
adminProductsList.forEach((product) => { product.department = getProductDepartment(product); });
const deletedProductIds = new Set(getDeletedProductIds());
const allProducts = [...products, ...adminProductsList].filter((product) => !deletedProductIds.has(product.id));
const activeProductIds = new Set(allProducts.map((product) => product.id));
cartItems = cartItems.filter((item) => activeProductIds.has(item.id));
wishlistItems = wishlistItems.filter((id) => activeProductIds.has(id));
compareItems = compareItems.filter((id) => activeProductIds.has(id));
recentlyViewed = recentlyViewed.filter((id) => activeProductIds.has(id));
localStorage.setItem('noxar-cart', JSON.stringify(cartItems));
localStorage.setItem('noxar-wishlist', JSON.stringify(wishlistItems));
localStorage.setItem('noxar-compare', JSON.stringify(compareItems));
localStorage.setItem('noxar-recent', JSON.stringify(recentlyViewed));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2500);
}

function saveCart() {
  localStorage.setItem('noxar-cart', JSON.stringify(cartItems));
}

function saveWishlist() {
  localStorage.setItem('noxar-wishlist', JSON.stringify(wishlistItems));
}

function saveCompare() {
  localStorage.setItem('noxar-compare', JSON.stringify(compareItems));
}

function stockLabel(product) {
  const stock = product.stock ?? stockLevels[product.id] ?? 5;
  if (stock === 0) return '<span class="stock-badge sold-out">Sotilgan</span>';
  if (stock <= 3) return `<span class="stock-badge low-stock">Faqat ${stock} ta qoldi</span>`;
  return '<span class="stock-badge in-stock">Mavjud</span>';
}

function bottleMarkup(product) {
  const bottleClass = product.art === 'cream-art' ? 'light' : product.art === 'rose-art' ? 'rose' : '';
  return `<div class="mini-bottle ${bottleClass}"><b>N</b></div>`;
}

function productMediaMarkup(product, context = 'card') {
  if (product.image) {
    return `<img class="product-media-image product-media-${context}" src="${product.image}" alt="${product.name}" loading="lazy">`;
  }
  return bottleMarkup(product);
}

function saveRecentlyViewed() {
  localStorage.setItem('noxar-recent', JSON.stringify(recentlyViewed));
}

function renderRecentlyViewed() {
  const section = document.querySelector('#recently-viewed');
  const grid = document.querySelector('.recent-grid');
  const items = recentlyViewed.map((id) => allProducts.find((product) => product.id === id)).filter(Boolean);
  section.hidden = !items.length;
  grid.innerHTML = items.map((product) => `
    <article class="recent-card" data-recent-id="${product.id}">
      <div class="recent-art ${product.art}"><div class="mini-bottle ${product.art === 'cream-art' ? 'light' : ''} ${product.art === 'rose-art' ? 'rose' : ''}"><b>N</b></div></div>
      <div><p class="catalog-brand">${product.brand}</p><h3>${product.name}</h3><strong>${product.price}</strong></div>
      <button class="recent-add" type="button" data-recent-add="${product.name}">Savatga <span>+</span></button>
    </article>
  `).join('');
}

function savePromo() {
  if (appliedPromo) localStorage.setItem('noxar-promo', JSON.stringify(appliedPromo));
  else localStorage.removeItem('noxar-promo');
}

function calculateCartTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const discount = appliedPromo && subtotal > 0
    ? appliedPromo.type === 'fixed' ? Math.min(subtotal, Number(appliedPromo.value) || 0) : Math.round(subtotal * (Number(appliedPromo.percent) || 0) / 100)
    : 0;
  const shippingBase = subtotal - discount;
  const shipping = shippingBase === 0 || shippingBase >= 500000 ? 0 : 30000;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function getAdminPromoCodes() {
  try {
    const saved = JSON.parse(localStorage.getItem('noxar-promo-codes') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function applyActiveCampaign() {
  let campaigns = [];
  try { campaigns = JSON.parse(localStorage.getItem('noxar-campaigns') || '[]'); } catch (error) { return; }
  const now = new Date();
  const active = campaigns.find((campaign) => campaign.active !== false
    && (!campaign.starts || new Date(`${campaign.starts}T00:00:00`) <= now)
    && (!campaign.ends || new Date(`${campaign.ends}T23:59:59`) >= now));
  if (!active) return;
  const announcement = document.querySelector('.announcement');
  if (announcement) announcement.innerHTML = `${active.text} <span>✦</span>`;
  const offer = document.querySelector('.offer-content');
  if (offer && active.type === 'offer') {
    const heading = offer.querySelector('h2');
    const text = offer.querySelector('p:not(.eyebrow)');
    const link = offer.querySelector('a');
    if (heading) heading.textContent = active.title;
    if (text) text.textContent = active.text;
    if (link) { link.textContent = `${active.cta || 'Batafsil'} ↗`; link.href = active.link || '#new'; }
  }
}

function isFavorite(productId) {
  return wishlistItems.includes(productId);
}

function updateFavoriteButtons() {
  document.querySelectorAll('[data-favorite-id]').forEach((button) => {
    const active = isFavorite(button.dataset.favoriteId);
    button.classList.toggle('active', active);
    button.textContent = active ? '♥' : '♡';
  });
}

function updateWishlist() {
  document.querySelector('.wishlist-count').textContent = wishlistItems.length;
  const container = document.querySelector('.wishlist-items');
  container.innerHTML = wishlistItems.length ? wishlistItems.map((id) => {
    const item = products.find((product) => product.id === id);
    return `<article class="wishlist-item" data-wishlist-id="${item.id}"><div class="wishlist-art ${item.art}"><b>N</b></div><div><h3>${item.name}</h3><p>${item.brand} · ${item.price}</p><button class="wishlist-cart-add" type="button" data-wishlist-action="cart">Savatga qo‘shish <span>+</span></button></div><button class="wishlist-remove" type="button" data-wishlist-action="remove" aria-label="${item.name}ni olib tashlash">×</button></article>`;
  }).join('') : '<div class="empty-cart"><span>♡</span><h3>Sevimlilar hali bo‘sh</h3><p>Yoqqan hidlaringizni yurak tugmasi orqali shu yerda saqlang.</p><button class="text-link continue-wishlist" type="button">Katalogni ko‘rish <span>↗</span></button></div>';
  saveWishlist();
}

function toggleWishlist(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  if (isFavorite(productId)) {
    wishlistItems = wishlistItems.filter((id) => id !== productId);
    showToast(`${product.name} sevimlilardan olib tashlandi`);
  } else {
    wishlistItems.push(productId);
    showToast(`${product.name} sevimlilarga qo‘shildi`);
  }
  updateWishlist();
  updateFavoriteButtons();
}

function updateCart() {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalQuantity;
  const itemsContainer = document.querySelector('.cart-items');
  itemsContainer.innerHTML = cartItems.length ? cartItems.map((item) => `
    <article class="cart-item" data-cart-id="${item.id}">
      <div class="cart-item-art ${item.art}"><b>N</b></div>
      <div class="cart-item-info"><h3>${item.name}</h3><p>${item.price}</p><div class="quantity-control"><button type="button" data-cart-action="decrease">−</button><span>${item.quantity}</span><button type="button" data-cart-action="increase">+</button></div></div>
      <button class="cart-remove" type="button" data-cart-action="remove" aria-label="${item.name}ni o‘chirish">×</button>
    </article>
  `).join('') : '<div class="empty-cart"><span>✦</span><h3>Savatingiz hozircha bo‘sh</h3><p>O‘zingizga mos hidni tanlang va uni shu yerda saqlang.</p><button class="text-link continue-shopping" type="button">Xaridni davom ettirish <span>↗</span></button></div>';
  const { subtotal, discount, shipping, total } = calculateCartTotals();
  document.querySelector('.cart-subtotal').textContent = formatPrice(subtotal);
  document.querySelector('.cart-discount').textContent = `−${formatPrice(discount)}`;
  document.querySelector('.discount-row').classList.toggle('hidden', discount === 0);
  document.querySelector('.cart-shipping').textContent = shipping ? formatPrice(shipping) : 'Bepul';
  document.querySelector('.cart-grand-total').textContent = formatPrice(total);
  saveCart();
  savePromo();
  renderMobileCart();
}

function renderMobileCart() {
  const container = document.querySelector('.mobile-cart-items');
  const total = document.querySelector('.mobile-cart-total');
  if (!container || !total) return;
  const { total: cartTotal } = calculateCartTotals();
  total.textContent = formatPrice(cartTotal);
  container.innerHTML = cartItems.length ? cartItems.map((item) => `
    <article class="mobile-cart-row"><span>${item.name} × ${item.quantity}</span><strong>${formatPrice(item.amount * item.quantity)}</strong></article>
  `).join('') : '<p class="mobile-empty">Savatingiz hozircha bo‘sh.</p>';
}

function openMarketRoute(route) {
  const routeView = document.querySelector('#market-route');
  const home = document.querySelector('#home');
  if (!routeView || !home) return;
  document.querySelectorAll('[data-mobile-nav]').forEach((button) => {
    button.classList.toggle('active', button.dataset.mobileNav === (route === 'account' ? 'account' : route));
  });
  if (route === 'home') {
    routeView.hidden = true;
    home.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  home.hidden = true;
  routeView.hidden = false;
  if (route === 'cart') {
    routeView.innerHTML = `<div class="route-header"><button class="route-back" data-route-home>←</button><h1>Savat</h1></div><div class="mobile-cart-total route-total">${formatPrice(calculateCartTotals().total)}</div><div class="mobile-cart-items">${cartItems.length ? cartItems.map((item) => `<article class="mobile-cart-row"><span>${item.name} × ${item.quantity}</span><strong>${formatPrice(item.amount * item.quantity)}</strong></article>`).join('') : '<p class="mobile-empty">Savatingiz hozircha bo‘sh.</p>'}</div><button class="button button-gold route-checkout" data-route-checkout type="button">Buyurtma berish <span>↗</span></button>`;
  } else if (route === 'quick') {
    routeView.innerHTML = '<div class="route-header"><button class="route-back" data-route-home>←</button><h1>Bo‘limlar</h1></div><div class="mobile-quick-grid"><button data-category-link="all">UMUMIY</button><button data-category-link="atirlar">Atirlar</button><button data-category-link="body-fragrance">Tana uchun hushbo‘y mahsulotlar</button><button data-category-link="deodorants">Dezodorantlar</button><button data-category-link="perfume-oils">Parfyumeriya moylari</button><button data-category-link="home-fragrance">Uy uchun hushbo‘y mahsulotlar</button><button data-category-link="bath-shower">Dush va vanna mahsulotlari</button><button data-category-link="accessories">Parfyumeriya aksessuarlari</button></div>';
  } else if (route === 'card') {
    routeView.innerHTML = '<div class="route-header"><button class="route-back" data-route-home>←</button><h1>Karta</h1></div><div class="mobile-benefits"><span>✦ Original mahsulot</span><span>↗ Tez yetkazib berish</span><span>↻ 14 kunlik qaytarish</span></div>';
  } else if (route === 'account') {
    routeView.innerHTML = '<div class="route-header"><button class="route-back" data-route-home>←</button><h1>Profil</h1></div><div class="profile-route-card"><div class="profile-route-avatar">N</div><div><p class="eyebrow">NOXAR mijozi</p><h2>Mehmon foydalanuvchi</h2><p>Buyurtmalar va sevimli mahsulotlaringiz shu yerda.</p></div></div><div class="profile-route-actions"><button type="button">Buyurtmalarim <span>↗</span></button><button type="button">Sozlamalar <span>↗</span></button></div><button class="button button-gold route-profile" type="button">Kirish yoki ro‘yxatdan o‘tish <span>↗</span></button>';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addToCart(productName) {
  const product = products.find((item) => item.name === productName);
  if (!product) return;
  if (stockLevels[product.id] === 0) {
    showToast('Bu mahsulot hozircha sotuvda yo‘q');
    return;
  }
  const existing = cartItems.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cartItems.push({ id: product.id, name: product.name, price: product.price, amount: product.amount, art: product.art, quantity: 1 });
  updateCart();
  showToast(`${product.name} savatga qo‘shildi`);
}

function renderCompare() {
  const section = document.querySelector('#compare-section');
  const grid = document.querySelector('.compare-grid');
  if (!section || !grid) return;
  const items = compareItems.map((id) => allProducts.find((product) => product.id === id)).filter(Boolean);
  section.hidden = items.length < 2;
  grid.innerHTML = items.map((product) => `
    <article class="compare-card">
      <div class="compare-art ${product.art}"><div class="mini-bottle ${product.art === 'cream-art' ? 'light' : ''} ${product.art === 'rose-art' ? 'rose' : ''}"><b>N</b></div></div>
      <h3>${product.name}</h3><p>${product.brand}</p>
      <dl><div><dt>Narx</dt><dd>${product.price}</dd></div><div><dt>Hid oilasi</dt><dd>${product.family}</dd></div><div><dt>Hajm</dt><dd>${product.volume} ml</dd></div><div><dt>Reyting</dt><dd>${product.rating} ★</dd></div><div><dt>Stok</dt><dd>${stockLevels[product.id] || 0} ta</dd></div></dl>
      <button type="button" class="button button-gold compare-buy" data-compare-buy="${product.name}" ${stockLevels[product.id] === 0 ? 'disabled' : ''}>Savatga qo‘shish</button>
    </article>
  `).join('');
}

function toggleCompare(productId) {
  if (compareItems.includes(productId)) {
    compareItems = compareItems.filter((id) => id !== productId);
  } else if (compareItems.length < 3) {
    compareItems.push(productId);
    showToast('Mahsulot taqqoslashga qo‘shildi');
  } else {
    showToast('Bir vaqtda 3 tagacha mahsulotni taqqoslash mumkin');
    return;
  }
  saveCompare();
  renderCatalog();
  renderCompare();
}

document.querySelector('.compare-grid')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-compare-buy]');
  if (button) addToCart(button.dataset.compareBuy);
});
document.querySelector('.clear-compare')?.addEventListener('click', () => {
  compareItems = [];
  saveCompare();
  renderCatalog();
  renderCompare();
});

let activeCategory = 'all';
let activeDepartment = 'all';
let activeGender = 'all';
let activeFilters = { gender: 'all', brand: 'all', family: 'all', volume: 'all', rating: 'all', price: 'all' };
let activeSort = 'default';
function getProductDiscount(product) { return Number(product.discount || (product.id === 'eclat' ? 12 : product.id === 'noir' ? 10 : 0)); }

function renderCatalog(category = activeCategory) {
  activeCategory = category;
  if (category === 'all') {
    activeDepartment = 'all';
    activeGender = 'all';
  } else if (['ayollar', 'erkaklar', 'unisex'].includes(category)) {
    activeGender = category;
  } else {
    activeDepartment = category;
  }
  const catalog = document.querySelector('.catalog-grid');
  const genderCategories = ['ayollar', 'erkaklar', 'unisex'];
  let visibleProducts = allProducts.filter((product) =>
    (activeDepartment === 'all' || getProductDepartment(product) === activeDepartment)
    && (activeGender === 'all' || product.categories.includes(activeGender)));
  visibleProducts.sort((a, b) => {
    if (activeSort === 'priceAsc') return a.amount - b.amount;
    if (activeSort === 'priceDesc') return b.amount - a.amount;
    if (activeSort === 'popular') return b.popularity - a.popularity;
    if (activeSort === 'newest') return Number(b.categories.includes('yangi')) - Number(a.categories.includes('yangi'));
    return 0;
  });
  catalog.innerHTML = visibleProducts.map((product) => `
    <article class="catalog-card product-card reveal visible" data-name="${product.name}" data-category="${product.categories.join(' ')}" data-product-id="${product.id}">
      <div class="catalog-art product-image ${product.art}">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
        ${getProductDiscount(product) ? `<span class="discount-badge">-${getProductDiscount(product)}%</span>` : ''}
        ${stockLabel(product)}
        <button class="card-favorite ${isFavorite(product.id) ? 'active' : ''}" data-favorite-id="${product.id}" type="button" aria-label="Sevimliga qo‘shish">${isFavorite(product.id) ? '♥' : '♡'}</button>
        ${productMediaMarkup(product)}
      </div>
      <div class="catalog-card-body">
        <p class="catalog-brand">${product.brand}</p>
        <h3>${product.name}</h3>
        <p class="product-notes">${product.notes}</p>
        <div class="catalog-rating"><span>★ ${product.rating}</span><small>${product.reviewCount || Math.round(product.popularity * 1.7)} sharh</small></div>
        <div class="catalog-card-footer"><div><del>${getProductDiscount(product) ? formatPrice(Math.round(product.amount / (1 - getProductDiscount(product) / 100))) : ''}</del><strong>${product.price}</strong></div><button class="catalog-add" data-product="${product.name}" ${(product.stock ?? stockLevels[product.id] ?? 5) === 0 ? 'disabled' : ''}>Savatga <span>+</span></button></div>
        <button class="compare-toggle ${compareItems.includes(product.id) ? 'active' : ''}" type="button" data-compare-id="${product.id}">${compareItems.includes(product.id) ? 'Taqqoslashdan olib tashlash' : 'Taqqoslashga qo‘shish'}</button>
      </div>
    </article>
  `).join('');
  document.querySelector('.catalog-status').textContent = visibleProducts.length
    ? `${visibleProducts.length} ta mahsulot ko‘rsatilmoqda`
    : 'Tanlangan filterlar bo‘yicha mahsulot topilmadi.';
}

renderCatalog();
applyActiveCampaign();

function renderSearchResults(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    const popular = allProducts.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    results.innerHTML = `<span class="search-label">Mashhur qidiruvlar</span>${popular.map((product) => `
      <button class="search-result" data-product-id="${product.id}">
        <span class="search-result-art ${product.art}"><b>N</b></span>
        <span><strong>${product.name}</strong><small>${product.brand} · ${product.price}</small></span>
        <span class="search-arrow">↗</span>
      </button>`).join('')}`;
    return;
  }
  const matches = allProducts.filter((product) => (
    `${product.name} ${product.brand} ${product.notes} ${(product.categories || []).join(' ')} ${product.description || ''}`.toLowerCase().includes(normalizedQuery)
  ));
  if (!matches.length) {
    results.innerHTML = `<span class="search-empty">“${query}” bo‘yicha natija topilmadi</span>`;
    return;
  }
  results.innerHTML = matches.slice(0, 5).map((product) => `
    <button class="search-result" data-product-id="${product.id}">
      <span class="search-result-art ${product.art}"><b>N</b></span>
      <span><strong>${product.name}</strong><small>${product.brand} · ${product.price}</small></span>
      <span class="search-arrow">↗</span>
    </button>
  `).join('');
}

document.querySelectorAll('.add-cart').forEach((button) => {
  button.addEventListener('click', () => {
    addToCart(button.dataset.product);
    button.classList.add('added');
    button.innerHTML = 'Qo‘shildi <span>✓</span>';
    window.setTimeout(() => {
      button.classList.remove('added');
      button.innerHTML = 'Savatga qo‘shish <span>+</span>';
    }, 1800);
  });
  document.querySelector('.product-grid').addEventListener('click', (event) => {
    if (event.target.closest('.add-cart')) return;
    const card = event.target.closest('.product-card');
    if (!card) return;
    const product = allProducts.find((item) => card.dataset.name.toLowerCase().includes(item.name.replace('NO. ', 'No. ').toLowerCase()));
    if (product) openProductPage(product);
  });
});

document.querySelector('.catalog-grid').addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('[data-favorite-id]');
  if (favoriteButton) {
    event.stopPropagation();
    toggleWishlist(favoriteButton.dataset.favoriteId);
    return;
  }
  const button = event.target.closest('.catalog-add');
  if (button) {
    addToCart(button.dataset.product);
    return;
  }
  const compareButton = event.target.closest('[data-compare-id]');
  if (compareButton) {
    toggleCompare(compareButton.dataset.compareId);
    return;
  }
  const card = event.target.closest('.catalog-card');
  if (card) openProductPage(allProducts.find((product) => product.name === card.dataset.name));
});
document.querySelectorAll('[data-quick-category]').forEach((button) => button.addEventListener('click', () => {
  const category = button.dataset.quickCategory;
  if (!['all', 'atirlar', 'body-fragrance', 'deodorants', 'perfume-oils', 'home-fragrance', 'bath-shower', 'accessories'].includes(category)) return;
  const categorySelect = document.querySelector('.category-select');
  categorySelect.value = category;
  renderCatalog(category); document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.querySelectorAll('[data-department]').forEach((button) => button.addEventListener('click', () => {
  const department = button.dataset.department;
  document.querySelectorAll('[data-department]').forEach((item) => item.classList.toggle('active', item === button));
  document.querySelector('.category-select').value = 'all';
  renderCatalog(department);
}));
document.querySelectorAll('[data-mobile-nav]').forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.mobileNav;
  if (action === 'home') openMarketRoute('home');
  if (action === 'catalog') { openMarketRoute('home'); document.querySelectorAll('[data-mobile-nav]').forEach((item) => item.classList.toggle('active', item === button)); document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (['cart', 'quick', 'card', 'account'].includes(action)) openMarketRoute(action);
}));
document.querySelector('#market-route').addEventListener('click', (event) => {
  if (event.target.closest('[data-route-home]')) openMarketRoute('home');
  if (event.target.closest('[data-route-checkout]')) document.querySelector('.checkout-demo')?.click();
  const category = event.target.closest('[data-category-link]')?.dataset.categoryLink;
  if (category) {
    document.querySelector('.category-select').value = ['ayollar', 'erkaklar', 'unisex'].includes(category) ? category : 'all';
    document.querySelectorAll('[data-department]').forEach((item) => item.classList.toggle('active', item.dataset.department === category));
    renderCatalog(category);
    openMarketRoute('home');
    document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (event.target.closest('.route-profile')) document.querySelector('.account-button')?.click();
});

const productModal = document.querySelector('.product-modal');
let selectedProduct = null;
let selectedReviewRating = 0;
function openProductPage(product) {
  if (!product) return;
  localStorage.setItem(`noxar-product-${product.id}`, JSON.stringify(product));
  window.open(`product.html?id=${encodeURIComponent(product.id)}`, '_blank', 'noopener');
}
const defaultReviews = {
  obsidian: [{ name: 'Sanjar A.', rating: 5, text: 'Sirli va uzoq saqlanadigan hid.' }],
  santal: [{ name: 'Dilnoza K.', rating: 5, text: 'Yumshoq, nafis va juda esda qolarli.' }],
  eclat: [{ name: 'Madina N.', rating: 4, text: 'Gulli notalari juda chiroyli ochiladi.' }]
};

function getReviews() {
  return JSON.parse(localStorage.getItem('noxar-reviews') || '{}');
}

function saveReviews(reviews) {
  localStorage.setItem('noxar-reviews', JSON.stringify(reviews));
}

function renderProductReviews(product) {
  const savedReviews = getReviews();
  const reviews = [...(defaultReviews[product.id] || []), ...(savedReviews[product.id] || [])].filter((review) => review.status !== 'rejected');
  const list = productModal.querySelector('.reviews-list');
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product.rating;
  productModal.querySelector('.reviews-average').textContent = `${average.toFixed(1)} ★`;
  list.innerHTML = reviews.length ? reviews.map((review) => `
    <article class="review-item">
      <div><strong>${review.name}</strong><span>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span></div>
      <p>${review.text}</p>
    </article>
  `).join('') : '<p class="reviews-empty">Hali sharhlar yo‘q. Birinchi bo‘lib fikr qoldiring.</p>';
}

function openProductModal(product) {
  if (!product) return;
  selectedProduct = product;
  recentlyViewed = [product.id, ...recentlyViewed.filter((id) => id !== product.id)].slice(0, 4);
  saveRecentlyViewed();
  renderRecentlyViewed();
  setProductView(0);
  productModal.querySelector('.modal-art').dataset.art = product.art;
  document.querySelector('#modal-brand').textContent = product.brand;
  document.querySelector('#modal-title').textContent = product.name;
  document.querySelector('#modal-rating').textContent = `★★★★★ ${product.rating}`;
  document.querySelector('#modal-price').textContent = product.price;
  document.querySelector('#modal-description').textContent = product.description;
  productModal.querySelector('[data-info-panel="details"]').innerHTML = `<p>${product.description}</p><p class="modal-note-line"><strong>Notalar:</strong> ${product.notes}</p>`;
  productModal.querySelector('[data-info-panel="usage"]').innerHTML = `<p>${product.usage}</p><p class="modal-note-line"><strong>Maslahat:</strong> Flakonni quyosh nuri va issiqlikdan uzoqda saqlang.</p>`;
  productModal.querySelector('[data-info-panel="features"]').innerHTML = `<ul>${product.features.map((feature) => `<li>${feature}</li>`).join('')}</ul>`;
  productModal.querySelectorAll('[data-info-tab]').forEach((tab) => tab.classList.toggle('active', tab.dataset.infoTab === 'details'));
  productModal.querySelectorAll('[data-info-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.infoPanel === 'details'));
  document.querySelector('#modal-top').textContent = product.top;
  document.querySelector('#modal-heart').textContent = product.heart;
  document.querySelector('#modal-base').textContent = product.base;
  selectedReviewRating = 0;
  productModal.querySelectorAll('.review-stars button').forEach((button) => button.classList.remove('active'));
  productModal.querySelector('.review-form').reset();
  renderProductReviews(product);
  const modalFavorite = productModal.querySelector('.modal-favorite');
  modalFavorite.dataset.favoriteId = product.id;
  modalFavorite.classList.toggle('active', isFavorite(product.id));
  modalFavorite.textContent = isFavorite(product.id) ? '♥' : '♡';
  document.querySelector('#similar-list').innerHTML = allProducts.filter((item) => item.id !== product.id && item.family === product.family).slice(0, 2).map((item) => `<button class="similar-card" data-similar-id="${item.id}"><span class="similar-art ${item.art}">N</span><span>${item.name}<small>${item.price}</small></span></button>`).join('');
  productModal.classList.add('open');
  productModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function setProductView(viewIndex) {
  if (!selectedProduct) return;
  const art = productModal.querySelector('.modal-art');
  art.className = `modal-art product-image ${selectedProduct.art} view-${viewIndex}`;
  const media = viewIndex === 0 && selectedProduct.image
    ? `<img class="product-media-image product-media-modal" src="${selectedProduct.image}" alt="${selectedProduct.name}">`
    : viewIndex === 1 && selectedProduct.video
      ? `<video class="product-media-video" src="${selectedProduct.video}" controls preload="metadata"></video>`
      : productMediaMarkup(selectedProduct, 'modal');
  art.innerHTML = `${media}<span class="view-label">Ko‘rinish ${viewIndex + 1}</span>`;
  productModal.querySelectorAll('.gallery-dots button').forEach((button) => button.classList.toggle('active', Number(button.dataset.view) === viewIndex));
}
function closeProductModal() {
  productModal.classList.remove('open');
  productModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
productModal.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeProductModal));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && productModal.classList.contains('open')) closeProductModal(); });
productModal.querySelector('.modal-add').addEventListener('click', () => {
  if (!selectedProduct) return;
  addToCart(selectedProduct.name);
  closeProductModal();
});
productModal.querySelector('.modal-favorite').addEventListener('click', () => {
  if (selectedProduct) toggleWishlist(selectedProduct.id);
});
productModal.querySelector('.review-stars').addEventListener('click', (event) => {
  const button = event.target.closest('[data-rating]');
  if (!button) return;
  selectedReviewRating = Number(button.dataset.rating);
  productModal.querySelectorAll('.review-stars button').forEach((item) => {
    item.classList.toggle('active', Number(item.dataset.rating) <= selectedReviewRating);
  });
});
productModal.querySelector('.review-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!selectedProduct) return;
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get('reviewer') || '').trim();
  const text = String(formData.get('reviewText') || '').trim();
  if (!selectedReviewRating || !name || !text) {
    showToast('Ism, baho va sharhni to‘ldiring');
    return;
  }
  const reviews = getReviews();
  reviews[selectedProduct.id] = [...(reviews[selectedProduct.id] || []), { name, rating: selectedReviewRating, text }];
  saveReviews(reviews);
  renderProductReviews(selectedProduct);
  event.currentTarget.reset();
  selectedReviewRating = 0;
  productModal.querySelectorAll('.review-stars button').forEach((button) => button.classList.remove('active'));
  showToast('Sharhingiz qabul qilindi');
});
productModal.querySelector('.volume-options').addEventListener('click', (event) => {
  const option = event.target.closest('button');
  if (!option) return;
  productModal.querySelectorAll('.volume-options button').forEach((item) => item.classList.remove('active'));
  option.classList.add('active');
});
productModal.querySelector('.gallery-dots').addEventListener('click', (event) => {
  const button = event.target.closest('[data-view]');
  if (button) setProductView(Number(button.dataset.view));
});
productModal.querySelector('.product-info-tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-info-tab]');
  if (!button) return;
  productModal.querySelectorAll('[data-info-tab]').forEach((tab) => tab.classList.toggle('active', tab === button));
  productModal.querySelectorAll('[data-info-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.infoPanel === button.dataset.infoTab));
});
document.querySelector('#similar-list').addEventListener('click', (event) => {
  const card = event.target.closest('.similar-card');
  if (card) openProductModal(allProducts.find((product) => product.id === card.dataset.similarId));
});

document.querySelector('.recent-grid').addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-recent-add]');
  if (addButton) {
    event.stopPropagation();
    addToCart(addButton.dataset.recentAdd);
    return;
  }
  const card = event.target.closest('[data-recent-id]');
  if (card) openProductModal(products.find((product) => product.id === card.dataset.recentId));
});
document.querySelector('.clear-recent').addEventListener('click', () => {
  recentlyViewed = [];
  saveRecentlyViewed();
  renderRecentlyViewed();
});

const wishlistDrawer = document.querySelector('.wishlist-drawer');
function openWishlist() {
  updateWishlist();
  wishlistDrawer.classList.add('open');
  wishlistDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('wishlist-open');
}
function closeWishlist() {
  wishlistDrawer.classList.remove('open');
  wishlistDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('wishlist-open');
}
document.querySelector('.wishlist-button').addEventListener('click', openWishlist);
wishlistDrawer.querySelectorAll('[data-close-wishlist]').forEach((element) => element.addEventListener('click', closeWishlist));
wishlistDrawer.querySelector('.wishlist-items').addEventListener('click', (event) => {
  const itemElement = event.target.closest('.wishlist-item');
  const action = event.target.closest('[data-wishlist-action]')?.dataset.wishlistAction;
  if (!itemElement || !action) {
    if (event.target.closest('.continue-wishlist')) closeWishlist();
    return;
  }
  const productId = itemElement.dataset.wishlistId;
  if (action === 'remove') toggleWishlist(productId);
  if (action === 'cart') addToCart(allProducts.find((product) => product.id === productId).name);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && wishlistDrawer.classList.contains('open')) closeWishlist(); });
updateWishlist();

const cartDrawer = document.querySelector('.cart-drawer');
const checkoutModal = document.querySelector('.checkout-modal');
const checkoutForm = document.querySelector('.checkout-form');
const checkoutConfirmation = document.querySelector('.checkout-confirmation');
const checkoutOrderNumber = document.querySelector('.order-number');
const accountPanel = document.querySelector('.account-panel');
const trackModal = document.querySelector('.track-modal');

function getOrders() {
  return JSON.parse(localStorage.getItem('noxar-orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('noxar-orders', JSON.stringify(orders));
}

function ensureDemoAccount() {
  const savedUser = JSON.parse(localStorage.getItem('noxar-account') || 'null');
  if (!savedUser) {
    const demoUser = {
      name: 'Demo foydalanuvchi',
      email: 'demo@noxar.com',
      password: '123456',
      loggedIn: false
    };
    localStorage.setItem('noxar-account', JSON.stringify(demoUser));
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('noxar-account') || 'null');
}

function updateCheckoutSummary() {
  const { subtotal, discount, shipping, total } = calculateCartTotals();
  const itemsContainer = document.querySelector('.checkout-items');

  itemsContainer.innerHTML = cartItems.length ? cartItems.map((item) => `
    <div class="checkout-item-line">
      <span>${item.name} × ${item.quantity}</span>
      <strong>${formatPrice(item.amount * item.quantity)}</strong>
    </div>
  `).join('') : '<p class="checkout-empty">Savat bo‘sh.</p>';

  document.querySelector('.checkout-subtotal').textContent = formatPrice(subtotal);
  const checkoutDiscount = document.querySelector('.checkout-discount');
  checkoutDiscount.classList.toggle('hidden', discount === 0);
  checkoutDiscount.querySelector('.checkout-discount-value').textContent = `−${formatPrice(discount)}`;
  document.querySelector('.checkout-shipping').textContent = shipping ? formatPrice(shipping) : 'Bepul';
  document.querySelector('.checkout-grand-total').textContent = formatPrice(total);
}

function openCheckout() {
  if (!cartItems.length) {
    showToast('Avval mahsulot tanlang');
    return;
  }
  updateCheckoutSummary();
  checkoutForm.classList.remove('hidden');
  checkoutConfirmation.classList.add('hidden');
  checkoutModal.classList.add('open');
  checkoutModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('checkout-open');
}

function closeCheckout() {
  checkoutModal.classList.remove('open');
  checkoutModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('checkout-open');
}

function openCart() {
  updateCart();
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}
document.querySelector('.cart-button').addEventListener('click', openCart);
cartDrawer.querySelectorAll('[data-close-cart]').forEach((element) => element.addEventListener('click', closeCart));
checkoutModal.querySelectorAll('[data-close-checkout]').forEach((element) => element.addEventListener('click', closeCheckout));
cartDrawer.querySelector('.cart-items').addEventListener('click', (event) => {
  const action = event.target.closest('[data-cart-action]')?.dataset.cartAction;
  const itemElement = event.target.closest('.cart-item');
  if (!action || !itemElement) return;
  const item = cartItems.find((entry) => entry.id === itemElement.dataset.cartId);
  if (!item) return;
  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;
  if (action === 'remove' || item.quantity <= 0) cartItems = cartItems.filter((entry) => entry.id !== item.id);
  updateCart();
});
cartDrawer.querySelector('.cart-items').addEventListener('click', (event) => {
  if (event.target.closest('.continue-shopping')) closeCart();
});
cartDrawer.querySelector('.checkout-demo').addEventListener('click', openCheckout);
cartDrawer.querySelector('.promo-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  const status = event.currentTarget.querySelector('.promo-status');
  const code = input.value.trim().toUpperCase();
  const adminCodes = getAdminPromoCodes();
  const validCodes = { NOXAR10: { type: 'percent', value: 10, minOrder: 0, active: true } };
  adminCodes.forEach((promo) => { validCodes[promo.code] = promo; });

  if (!code) {
    status.textContent = 'Promo-kodni kiriting.';
    status.className = 'promo-status error';
    return;
  }
  const promo = validCodes[code];
  const expired = promo?.expires && new Date(`${promo.expires}T23:59:59`) < new Date();
  const limitReached = Number(promo?.limit) > 0 && Number(promo?.used || 0) >= Number(promo.limit);
  const minOrderFailed = Number(promo?.minOrder || 0) > calculateCartTotals().subtotal;
  if (!promo || promo.active === false || expired || limitReached || minOrderFailed) {
    appliedPromo = null;
    savePromo();
    updateCart();
    status.textContent = 'Promo-kod noto‘g‘ri yoki muddati tugagan.';
    status.className = 'promo-status error';
    return;
  }

  appliedPromo = { code, type: promo.type || 'percent', value: Number(promo.value), percent: promo.type === 'fixed' ? 0 : Number(promo.value) };
  savePromo();
  updateCart();
  status.textContent = `${code} qo‘llandi: ${promo.type === 'fixed' ? `${Number(promo.value).toLocaleString('uz-UZ')} so‘m` : `${promo.value}%`} chegirma.`;
  status.className = 'promo-status success';
});
checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(checkoutForm);
  const fullName = String(formData.get('fullName') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const shippingMethod = String(formData.get('shippingMethod') || 'standart');
  const paymentMethod = String(formData.get('paymentMethod') || 'cash');

  if (!fullName || !phone || !address) {
    showToast('Iltimos, barcha maydonlarni to‘ldiring');
    return;
  }

  const orderNumber = `NOX-${Date.now().toString().slice(-6)}`;
  const orders = getOrders();
  const { subtotal, discount, shipping, total } = calculateCartTotals();

  orders.unshift({
    orderNumber,
    customer: fullName,
    phone,
    address,
    shippingMethod,
    paymentMethod,
    subtotal,
    discount,
    promoCode: appliedPromo?.code || null,
    total,
    status: 'Qabul qilindi',
    items: cartItems.map((item) => ({ ...item })),
    createdAt: new Date().toISOString()
  });

  saveOrders(orders);
  checkoutOrderNumber.textContent = orderNumber;
  checkoutForm.reset();
  checkoutForm.classList.add('hidden');
  checkoutConfirmation.classList.remove('hidden');
  cartItems = [];
  updateCart();
  updateCheckoutSummary();
  updateAccountDashboard();
  showToast('Buyurtma muvaffaqiyatli qabul qilindi');
});
checkoutConfirmation.querySelector('.view-tracking').addEventListener('click', () => {
  closeCheckout();
  openTracking();
  const currentOrder = getOrders()[0];
  if (currentOrder) {
    fillTrackingResult(currentOrder.orderNumber, currentOrder.status, currentOrder.items.length, currentOrder.total);
  }
});

function renderTrackingResult(orderNumber, status, count, total) {
  const panel = document.querySelector('.track-result');
  panel.querySelector('.track-order-number').textContent = orderNumber;
  panel.querySelector('.track-order-status').textContent = status;
  panel.querySelector('.track-items-count').textContent = count;
  panel.querySelector('.track-total').textContent = formatPrice(total);
  panel.classList.remove('hidden');
}

function fillTrackingResult(orderNumber, status, count, total) {
  renderTrackingResult(orderNumber, status, count, total);
}

function openTracking() {
  trackModal.classList.add('open');
  trackModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('track-open');
}

function closeTracking() {
  trackModal.classList.remove('open');
  trackModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('track-open');
}

function updateAccountDashboard() {
  const user = getCurrentUser();
  const authPanels = document.querySelectorAll('.account-auth');
  const dashboard = document.querySelector('.account-dashboard');
  const userName = document.querySelector('#account-user-name');
  const userEmail = document.querySelector('#account-user-email');
  const ordersList = document.querySelector('.account-orders');

  if (!user || !user.loggedIn) {
    authPanels.forEach((panel) => panel.classList.remove('active'));
    document.querySelector('[data-auth-panel="login"]').classList.add('active');
    dashboard.classList.add('hidden');
    return;
  }

  userName.textContent = user.name;
  userEmail.textContent = user.email;
  dashboard.classList.remove('hidden');
  authPanels.forEach((panel) => panel.classList.remove('active'));

  const orders = getOrders();
  ordersList.innerHTML = orders.length ? orders.map((order) => `
    <div class="history-item">
      <div><span class="history-code">${order.orderNumber}</span><small>${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</small></div>
      <div><strong>${order.status}</strong><small>${formatPrice(order.total)}</small></div>
    </div>
  `).join('') : '<div class="empty-order">Buyurtma mavjud emas</div>';
}

function openAccount() {
  ensureDemoAccount();
  updateAccountDashboard();
  accountPanel.classList.add('open');
  accountPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('account-open');
}

function closeAccount() {
  accountPanel.classList.remove('open');
  accountPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('account-open');
}

document.querySelector('.account-button').addEventListener('click', openAccount);
document.querySelector('.inline-link').addEventListener('click', openTracking);
accountPanel.querySelectorAll('[data-close-account]').forEach((element) => element.addEventListener('click', closeAccount));
trackModal.querySelectorAll('[data-close-track]').forEach((element) => element.addEventListener('click', closeTracking));
document.querySelector('.logout-button').addEventListener('click', () => {
  const user = getCurrentUser();
  if (user) {
    user.loggedIn = false;
    localStorage.setItem('noxar-account', JSON.stringify(user));
  }
  updateAccountDashboard();
});

const accountTabs = document.querySelectorAll('.account-tab');
accountTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    accountTabs.forEach((item) => item.classList.toggle('active', item === tab));
    const target = tab.dataset.accountTab;
    document.querySelectorAll('.account-auth').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.authPanel === target);
    });
  });
});

document.querySelector('[data-form="login"]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const user = getCurrentUser();

  if (!user || user.email !== email || user.password !== password) {
    showToast('Email yoki parol noto‘g‘ri');
    return;
  }

  user.loggedIn = true;
  localStorage.setItem('noxar-account', JSON.stringify(user));
  updateAccountDashboard();
  showToast('Kabinetga kirish muvaffaqiyatli');
});

document.querySelector('[data-form="register"]').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!name || !email || password.length < 6) {
    showToast('Ma‘lumotlarni to‘g‘ri kiriting');
    return;
  }

  const user = { name, email, password, loggedIn: true };
  localStorage.setItem('noxar-account', JSON.stringify(user));
  updateAccountDashboard();
  showToast('Ro‘yxatdan o‘tish muvaffaqiyatli');
});

document.querySelector('.track-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const orderCode = String(new FormData(event.currentTarget).get('orderNumber') || '').trim().toUpperCase();
  if (!orderCode) {
    showToast('Buyurtma raqamini kiriting');
    return;
  }

  const matched = getOrders().find((order) => order.orderNumber.toUpperCase() === orderCode);
  if (!matched) {
    document.querySelector('.track-result').classList.remove('hidden');
    document.querySelector('.track-order-number').textContent = orderCode;
    document.querySelector('.track-order-status').textContent = 'Topilmadi';
    document.querySelector('.track-items-count').textContent = '0';
    document.querySelector('.track-total').textContent = '0 so‘m';
    showToast('Bunday buyurtma topilmadi');
    return;
  }

  fillTrackingResult(matched.orderNumber, matched.status, matched.items.length, matched.total);
  showToast('Buyurtma ma‘lumotlari ko‘rsatildi');
});

ensureDemoAccount();
updateAccountDashboard();
renderRecentlyViewed();
renderCompare();
updateCart();
if (appliedPromo) {
  const promoInput = document.querySelector('#promo-code');
  const promoStatus = document.querySelector('.promo-status');
  promoInput.value = appliedPromo.code;
  promoStatus.textContent = `${appliedPromo.code} qo‘llandi: ${appliedPromo.percent}% chegirma.`;
  promoStatus.className = 'promo-status success';
}

const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelector('#scent-quiz')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = new FormData(event.currentTarget);
  const mood = String(answers.get('mood'));
  const gender = String(answers.get('gender'));
  const budget = String(answers.get('budget'));
  const match = allProducts
    .filter((product) => product.family === mood)
    .filter((product) => gender === 'unisex' || product.categories.includes(gender) || product.categories.includes('unisex'))
    .filter((product) => budget !== 'under900' || product.amount <= 900000)[0] || allProducts[0];
  const result = document.querySelector('.quiz-result');
  result.hidden = false;
  result.innerHTML = `<div class="quiz-result-art ${match.art}"><div class="mini-bottle"><b>N</b></div></div><div><p class="eyebrow">Siz uchun tavsiya</p><h3>${match.name}</h3><p>${match.notes}</p><strong>${match.price}</strong><button type="button" class="button button-gold quiz-product" data-quiz-product="${match.id}">Batafsil ko‘rish <span>↗</span></button></div>`;
});
document.querySelector('.quiz-result')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quiz-product]');
  if (button) openProductModal(allProducts.find((product) => product.id === button.dataset.quizProduct));
});

let selectedGiftAmount = 100000;
document.querySelectorAll('[data-gift-amount]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedGiftAmount = Number(button.dataset.giftAmount);
    document.querySelectorAll('[data-gift-amount]').forEach((item) => item.classList.toggle('active', item === button));
  });
});
document.querySelector('.gift-generate')?.addEventListener('click', () => {
  const code = `GIFT-${selectedGiftAmount / 1000}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  localStorage.setItem('noxar-gift', JSON.stringify({ code, amount: selectedGiftAmount }));
  document.querySelector('.gift-result').textContent = `Sertifikat tayyor: ${code} — ${formatPrice(selectedGiftAmount)}`;
  showToast('Sovg‘a sertifikati yaratildi');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (cartDrawer.classList.contains('open')) closeCart();
    if (checkoutModal.classList.contains('open')) closeCheckout();
    if (wishlistDrawer.classList.contains('open')) closeWishlist();
    if (productModal.classList.contains('open')) closeProductModal();
    if (trackModal.classList.contains('open')) closeTracking();
    if (accountPanel.classList.contains('open')) closeAccount();
  }
});

document.querySelector('.category-select').addEventListener('change', (event) => {
  document.querySelectorAll('[data-department]').forEach((item) => item.classList.toggle('active', item.dataset.department === 'all' && event.target.value === 'all'));
  renderCatalog(event.target.value);
});
document.querySelectorAll('[data-category-link]').forEach((button) => button.addEventListener('click', () => {
  document.querySelector('.category-select').value = button.dataset.categoryLink;
  renderCatalog(button.dataset.categoryLink);
  document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.querySelector('.mobile-checkout-button')?.addEventListener('click', () => document.querySelector('.checkout-demo')?.click());
document.querySelector('.mobile-profile-button')?.addEventListener('click', () => document.querySelector('.account-button')?.click());

document.querySelector('.sort-select').addEventListener('change', (event) => {
  activeSort = event.target.value;
  renderCatalog();
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
menuToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', mobileNav.classList.contains('active'));
});
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => mobileNav.classList.remove('active')));

const searchPanel = document.querySelector('.search-panel');
const searchInput = document.querySelector('#search-input');
const searchToggle = document.querySelector('.search-toggle');
const results = document.querySelector('.search-results');
searchToggle.addEventListener('click', () => {
  searchPanel.classList.toggle('active');
  if (searchPanel.classList.contains('active')) searchInput.focus();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') searchPanel.classList.remove('active');
});
searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));
results.addEventListener('click', (event) => {
  const result = event.target.closest('.search-result');
  if (!result) return;
  searchPanel.classList.remove('active');
  searchInput.value = '';
  results.innerHTML = '';
  const product = allProducts.find((item) => item.id === result.dataset.productId);
  if (product) openProductPage(product);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  event.currentTarget.querySelector('.form-status').textContent = 'Xabaringiz qabul qilindi. Tez orada bog‘lanamiz.';
});

document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector('input').value.trim();
  const status = form.querySelector('.newsletter-status');
  if (!email) return;
  localStorage.setItem('noxar-newsletter', email);
  status.textContent = 'Obuna muvaffaqiyatli yakunlandi. Rahmat!';
  form.querySelector('input').value = '';
  showToast('NOXAR yangiliklariga obuna bo‘ldingiz');
});

const track = document.querySelector('.testimonial-track');
document.querySelector('.slide-next')?.addEventListener('click', () => track?.scrollBy({ left: track.clientWidth * 0.9, behavior: 'smooth' }));
document.querySelector('.slide-prev')?.addEventListener('click', () => track?.scrollBy({ left: -track.clientWidth * 0.9, behavior: 'smooth' }));
