/* NOXAR PARFUM — admin panel.
   Barcha ma'lumotlar Supabase'da saqlanadi (mahsulotlar, so'rovlar, sharhlar).
   Himoya: bu yerdagi tekshiruv faqat qulaylik uchun; haqiqiy ruxsatni
   Supabase RLS (noxar_is_admin) beradi. */

const esc = noxarEscape;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const loginScreen = $('.admin-login-screen');
const shell = $('.admin-shell');
const loginForm = $('#admin-login-form');
const loginError = $('.admin-login-error');

const DEPARTMENT_LABELS = {
  atirlar: 'Atirlar',
  'body-fragrance': 'Tana parvarishi',
  deodorants: 'Dezodorant',
  'perfume-oils': 'Parfyum moylari',
  'home-fragrance': 'Uy aromati',
  'bath-shower': 'Dush & vanna',
  accessories: 'Aksessuarlar'
};
const GENDER_LABELS = { ayollar: 'Ayollar', erkaklar: 'Erkaklar', unisex: 'Uniseks' };
const RESERVATION_STATUS = { pending: 'Kutilmoqda', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan' };
const RESERVATION_BADGE = { pending: 'pending', confirmed: 'approved', cancelled: 'rejected' };
const REVIEW_STATUS = { pending: 'Kutilmoqda', approved: 'Tasdiqlangan', rejected: 'Rad etilgan' };
const PRODUCTS_PER_PAGE = 8;
const IMAGE_LIMIT = 5 * 1024 * 1024;
const VIDEO_LIMIT = 20 * 1024 * 1024;

let products = [];
let reservations = [];
let reviews = [];
let productsPage = 1;
let adminReady = false;

/* ---------- Yordamchilar ---------- */
function showToast(message) {
  const toast = $('.admin-toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function errorText(error) {
  const message = String(error?.message || '');
  if (error?.status === 401 || error?.status === 403 || /row-level security|permission denied|jwt/i.test(message)) {
    return 'Ruxsat yo‘q. Admin sifatida qayta kiring yoki SQL sozlamalarini tekshiring.';
  }
  if (/failed to fetch|network/i.test(message)) return 'Internet aloqasini tekshiring.';
  return message || 'Noma’lum xatolik';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatToday() {
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()}-${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getThreshold() {
  return Number(localStorage.getItem('noxar-inventory-threshold')) || 3;
}

function stockStatus(stock, threshold = 3) {
  if (stock === 0) return ['soldout', 'Sotilgan'];
  if (stock <= threshold) return ['low', 'Kam qolgan'];
  return ['available', 'Mavjud'];
}

function downloadCsv(filename, header, rows) {
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function productName(id) {
  return products.find((product) => product.id === id)?.name || id;
}

/* ---------- Kirish va admin huquqini tekshirish ---------- */
function showLogin(message = '') {
  shell.hidden = true;
  loginScreen.hidden = false;
  loginError.textContent = message;
}

async function verifyAdmin(session) {
  if (!session?.access_token || !session.user?.id) return false;
  const { data } = await noxarSupabase.from('admin_users').select('user_id').eq('user_id', session.user.id);
  return Array.isArray(data) && data.some((row) => row.user_id === session.user.id);
}

async function startAdmin() {
  const session = noxarAuth.readSession();
  if (!session?.access_token) {
    showLogin();
    return;
  }
  shell.hidden = true;
  loginScreen.hidden = true;
  try {
    if (!(await verifyAdmin(noxarAuth.readSession()))) {
      await noxarAuth.signOut();
      showLogin('Bu akkauntda admin huquqi yo‘q.');
      return;
    }
  } catch (error) {
    console.error('Admin tekshiruvi xatosi:', error);
    showLogin('Admin huquqini tekshirib bo‘lmadi: ' + errorText(error));
    return;
  }
  const user = noxarAuth.currentUser();
  const profileName = $('.admin-profile strong');
  if (profileName && user) profileName.textContent = user.email.split('@')[0] || 'Admin';
  shell.hidden = false;
  adminReady = true;
  $('[data-admin-current-date]').textContent = formatToday();
  const initial = $(`.nav-link[data-view="${window.location.hash.slice(1)}"]`)?.dataset.view || 'dashboard';
  showView(initial);
  await refreshAll();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const button = $('button[type="submit"]', loginForm);
  button.disabled = true;
  try {
    await noxarAuth.signIn(loginForm.elements.email.value.trim().toLowerCase(), loginForm.elements.password.value);
    loginForm.reset();
    await startAdmin();
  } catch (error) {
    loginError.textContent = errorText(error);
  } finally {
    button.disabled = false;
  }
});

/* ---------- Ma'lumotlarni yuklash ---------- */
async function loadProducts() {
  const result = await noxarSupabase.from('products').select('*').order('created_at', { ascending: false });
  products = (Array.isArray(result.data) ? result.data : []).map((row) => ({
    id: String(row.id),
    name: row.name || '',
    brand: row.brand || '',
    amount: Number(row.price) || 0,
    oldAmount: Number(row.old_price) || 0,
    stock: Math.max(0, Number(row.stock) || 0),
    category: Object.hasOwn(DEPARTMENT_LABELS, row.category) ? row.category : 'atirlar',
    gender: Object.hasOwn(GENDER_LABELS, row.gender) ? row.gender : 'unisex',
    family: row.family || 'amber',
    volume: row.volume || '',
    badge: row.badge || '',
    notes: row.notes || '',
    description: row.description || '',
    image: row.image || '',
    video: row.video || '',
    active: row.active !== false
  }));
}

async function loadReservations() {
  const result = await noxarSupabase.from('reservations').select('*').order('created_at', { ascending: false });
  reservations = Array.isArray(result.data) ? result.data : [];
}

async function loadReviews() {
  const result = await noxarSupabase.from('reviews').select('*').order('created_at', { ascending: false });
  reviews = Array.isArray(result.data) ? result.data : [];
}

async function refreshAll(showMessage = false) {
  const results = await Promise.allSettled([loadProducts(), loadReservations(), loadReviews()]);
  const failed = results.find((result) => result.status === 'rejected');
  if (failed) {
    console.error('Yuklashda xatolik:', failed.reason);
    showToast(`Ma’lumotlarni yuklab bo‘lmadi: ${errorText(failed.reason)}`);
  } else if (showMessage) {
    showToast('Ma’lumotlar yangilandi');
  }
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderProducts();
  renderReservations();
  renderInventory();
  renderReviews();
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const threshold = getThreshold();
  const low = products.filter((product) => product.stock <= threshold);
  $('[data-stat="products"]').textContent = products.length;
  $('[data-stat="pending-reservations"]').textContent = reservations.filter((item) => item.status === 'pending').length;
  $('[data-stat="low-stock"]').textContent = low.length;
  $('[data-stat="pending-reviews"]').textContent = reviews.filter((item) => item.status === 'pending').length;

  $('#recent-requests').innerHTML = reservations.slice(0, 5).map((item) => `
    <tr><td>${formatDate(item.created_at)}</td><td>${esc(item.customer_name)}</td><td>${esc(item.customer_phone)}</td><td>${esc(item.product_name)}</td><td>${esc(item.request_type)}</td><td><span class="status ${RESERVATION_BADGE[item.status] || 'pending'}">${RESERVATION_STATUS[item.status] || 'Kutilmoqda'}</span></td></tr>`).join('')
    || '<tr><td colspan="6" class="empty-products">Hozircha so‘rovlar yo‘q.</td></tr>';

  const art = (product) => product.gender === 'erkaklar' ? 'black' : product.gender === 'ayollar' ? 'rose' : 'cream';
  $('#low-stock-list').innerHTML = [...low].sort((a, b) => a.stock - b.stock).slice(0, 5).map((product) => `
    <div class="stock-item">
      <div class="stock-art ${art(product)}">N</div>
      <div><strong>${esc(product.name)}</strong><small>${product.stock === 0 ? 'Sotuvda yo‘q' : 'Omborda oz qoldi'}</small></div>
      <span class="stock-count">${product.stock} ta</span>
    </div>`).join('') || '<p class="muted">Kam qolgan mahsulot yo‘q.</p>';
}

/* ---------- Mahsulotlar ---------- */
function renderProducts() {
  const query = $('#product-search').value.trim().toLowerCase();
  const category = $('#product-category-filter').value;
  const gender = $('#product-gender-filter').value;
  const stockFilter = $('#product-stock-filter').value;
  const visible = products.filter((product) => {
    const [status] = stockStatus(product.stock);
    return `${product.name} ${product.brand}`.toLowerCase().includes(query)
      && (category === 'all' || product.category === category)
      && (gender === 'all' || product.gender === gender)
      && (stockFilter === 'all' || stockFilter === status);
  });
  const totalPages = Math.max(1, Math.ceil(visible.length / PRODUCTS_PER_PAGE));
  productsPage = Math.min(productsPage, totalPages);
  const pageItems = visible.slice((productsPage - 1) * PRODUCTS_PER_PAGE, productsPage * PRODUCTS_PER_PAGE);
  $('#products-table-body').innerHTML = pageItems.map((product) => {
    const [status, label] = stockStatus(product.stock);
    const image = noxarSafeUrl(product.image);
    return `<tr>
      <td class="product-name-cell"><span class="admin-product-art">${image ? `<img src="${image}" alt="">` : esc(product.name.slice(0, 1))}</span><strong>${esc(product.name)}</strong><small>${esc(product.notes)}</small></td>
      <td>${esc(product.brand)}</td><td>${esc(DEPARTMENT_LABELS[product.category])}</td><td>${GENDER_LABELS[product.gender]}</td>
      <td>${noxarFormatPrice(product.amount)}</td><td>${product.stock}</td>
      <td><span class="status ${product.active ? status : 'inactive'}">${product.active ? label : 'Yashirin'}</span></td>
      <td><button class="table-action edit-product" type="button" data-product-id="${esc(product.id)}">Tahrirlash</button><button class="table-action toggle-product" type="button" data-product-id="${esc(product.id)}">${product.active ? 'Yashirish' : 'Ko‘rsatish'}</button><button class="table-action delete-product" type="button" data-product-id="${esc(product.id)}">O‘chirish</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" class="empty-products">Mahsulot topilmadi.</td></tr>';
  $('.products-pagination').innerHTML = totalPages > 1
    ? `<button type="button" data-page-action="prev" ${productsPage === 1 ? 'disabled' : ''}>‹</button><span>${productsPage} / ${totalPages}</span><button type="button" data-page-action="next" ${productsPage === totalPages ? 'disabled' : ''}>›</button>`
    : '';
}

$$('#product-search, #product-category-filter, #product-gender-filter, #product-stock-filter').forEach((control) => {
  control.addEventListener('input', () => { productsPage = 1; renderProducts(); });
});
$('.products-pagination').addEventListener('click', (event) => {
  const action = event.target.closest('[data-page-action]')?.dataset.pageAction;
  if (!action) return;
  productsPage += action === 'next' ? 1 : -1;
  renderProducts();
});

/* Maxsus tanlovlar (bo'lim va jins) */
function setupPicker(pickerSelector, triggerSelector, menuSelector, optionMarkup) {
  const picker = $(pickerSelector);
  const select = $('select', picker);
  const trigger = $(triggerSelector);
  const menu = $(menuSelector);
  menu.innerHTML = [...select.options].map(optionMarkup).join('');
  const sync = () => {
    const selected = $(`[data-value="${select.value}"]`, menu);
    if (!selected) return;
    $('span', trigger).textContent = selected.textContent.replace(/^[^\wА-Яа-я‘'’]+/u, '').trim() || selected.textContent;
    $$('[role="option"]', menu).forEach((item) => item.setAttribute('aria-selected', String(item === selected)));
  };
  const close = () => {
    picker.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  };
  trigger.addEventListener('click', () => {
    const isOpen = picker.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
    menu.hidden = !isOpen;
  });
  menu.addEventListener('click', (event) => {
    const option = event.target.closest('[data-value]');
    if (!option) return;
    select.value = option.dataset.value;
    sync();
    close();
  });
  document.addEventListener('click', (event) => { if (!picker.contains(event.target)) close(); });
  sync();
  return sync;
}
const genderIcons = { unisex: '⚥', erkaklar: '♂', ayollar: '♀' };
const syncCategoryPicker = setupPicker('.admin-category-picker', '.admin-category-trigger', '.admin-category-menu',
  (option) => `<button type="button" role="option" data-value="${esc(option.value)}">${esc(option.textContent)}</button>`);
const syncGenderPicker = setupPicker('.admin-gender-picker', '.admin-gender-trigger', '.admin-gender-menu',
  (option) => `<button type="button" role="option" data-value="${esc(option.value)}"><span aria-hidden="true">${genderIcons[option.value] || '◇'}</span><span class="gender-option-label">${esc(option.textContent)}</span></button>`);

/* Mahsulot formasi */
const productModal = $('.product-modal-admin');
const productForm = $('.admin-product-form');
const mediaState = { image: '', video: '', imageFile: null, videoFile: null, previewUrls: [] };

function renderMediaPreview() {
  const preview = $('.media-preview');
  mediaState.previewUrls.forEach((url) => URL.revokeObjectURL(url));
  mediaState.previewUrls = [];
  const blocks = [];
  const imageSrc = mediaState.imageFile ? URL.createObjectURL(mediaState.imageFile) : noxarSafeUrl(mediaState.image);
  const videoSrc = mediaState.videoFile ? URL.createObjectURL(mediaState.videoFile) : noxarSafeUrl(mediaState.video);
  if (mediaState.imageFile) mediaState.previewUrls.push(imageSrc);
  if (mediaState.videoFile) mediaState.previewUrls.push(videoSrc);
  if (imageSrc) blocks.push(`<figure class="media-item"><img src="${imageSrc}" alt="Mahsulot rasmi"><button type="button" class="media-remove" data-remove-media="image" aria-label="Rasmni olib tashlash">×</button></figure>`);
  if (videoSrc) blocks.push(`<figure class="media-item"><video src="${videoSrc}" controls preload="metadata"></video><button type="button" class="media-remove" data-remove-media="video" aria-label="Videoni olib tashlash">×</button></figure>`);
  preview.innerHTML = blocks.join('') || 'Media fayllar tanlanmagan.';
}

function openProductForm(product) {
  productForm.reset();
  const f = productForm.elements;
  f.id.value = product?.id || '';
  f.name.value = product?.name || '';
  f.brand.value = product?.brand || 'NOXAR';
  f.amount.value = product?.amount || '';
  f.oldAmount.value = product?.oldAmount || '';
  f.stock.value = product?.stock ?? '';
  f.category.value = product?.category || 'atirlar';
  f.gender.value = product?.gender || 'unisex';
  f.family.value = product?.family || 'amber';
  f.volume.value = product?.volume || '';
  f.badge.value = product?.badge || '';
  f.notes.value = product?.notes || '';
  f.description.value = product?.description || '';
  syncCategoryPicker();
  syncGenderPicker();
  Object.assign(mediaState, { image: product?.image || '', video: product?.video || '', imageFile: null, videoFile: null });
  renderMediaPreview();
  $('#product-form-title').textContent = product ? 'Mahsulotni tahrirlash' : 'Mahsulot qo‘shish';
  productModal.classList.add('open');
  productModal.setAttribute('aria-hidden', 'false');
}

function closeProductForm() {
  productModal.classList.remove('open');
  productModal.setAttribute('aria-hidden', 'true');
}

function pickFile(input, type, limit) {
  const file = input.files[0];
  if (!file) return;
  const valid = file.type.startsWith(`${type}/`);
  if (!valid) {
    showToast(type === 'image' ? 'Faqat rasm fayli tanlang.' : 'Faqat video fayli tanlang.');
    input.value = '';
    return;
  }
  if (file.size > limit) {
    showToast(`${type === 'image' ? 'Rasm' : 'Video'} hajmi ${type === 'image' ? '5 MB' : '20 MB'} dan oshmasin.`);
    input.value = '';
    return;
  }
  mediaState[`${type}File`] = file;
  renderMediaPreview();
}
$('input[name="image"]', productForm).addEventListener('change', (event) => pickFile(event.currentTarget, 'image', IMAGE_LIMIT));
$('input[name="video"]', productForm).addEventListener('change', (event) => pickFile(event.currentTarget, 'video', VIDEO_LIMIT));
$('.media-preview').addEventListener('click', (event) => {
  const kind = event.target.closest('[data-remove-media]')?.dataset.removeMedia;
  if (!kind) return;
  mediaState[kind] = '';
  mediaState[`${kind}File`] = null;
  productForm.elements[kind].value = '';
  renderMediaPreview();
});

function makeProductId(name) {
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'mahsulot';
  return `${slug}-${Date.now().toString(36)}`;
}

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const f = productForm.elements;
  const submit = $('button[type="submit"]', productForm);
  const name = f.name.value.trim();
  const amount = Number(f.amount.value);
  const oldAmount = Number(f.oldAmount.value) || 0;
  const stock = Math.floor(Number(f.stock.value));
  if (!name || !f.brand.value.trim() || !(amount >= 0) || !(stock >= 0)) {
    showToast('Nom, brend, narx va stokni to‘g‘ri to‘ldiring.');
    return;
  }
  if (oldAmount && oldAmount <= amount) {
    showToast('Eski narx joriy narxdan katta bo‘lishi kerak (yoki bo‘sh qoldiring).');
    return;
  }
  const existing = products.find((product) => product.id === f.id.value);
  submit.disabled = true;
  submit.textContent = 'Saqlanmoqda…';
  try {
    let image = mediaState.image;
    let video = mediaState.video;
    if (mediaState.imageFile) { submit.textContent = 'Rasm yuklanmoqda…'; image = await noxarStorage.upload(mediaState.imageFile, 'images'); }
    if (mediaState.videoFile) { submit.textContent = 'Video yuklanmoqda…'; video = await noxarStorage.upload(mediaState.videoFile, 'videos'); }
    submit.textContent = 'Saqlanmoqda…';
    await noxarSupabase.from('products').upsert({
      id: existing?.id || makeProductId(name),
      name,
      brand: f.brand.value.trim(),
      price: amount,
      old_price: oldAmount || null,
      stock,
      category: f.category.value,
      gender: f.gender.value,
      family: f.family.value,
      volume: f.volume.value.trim(),
      badge: f.badge.value.trim(),
      notes: f.notes.value.trim(),
      description: f.description.value.trim(),
      image: image || null,
      video: video || null,
      active: existing ? existing.active : true,
      updated_at: new Date().toISOString()
    });
    await loadProducts();
    renderAll();
    closeProductForm();
    showToast(existing ? 'Mahsulot yangilandi' : 'Mahsulot qo‘shildi');
  } catch (error) {
    console.error('Mahsulotni saqlashda xatolik:', error);
    showToast(`Saqlanmadi: ${errorText(error)}`);
  } finally {
    submit.disabled = false;
    submit.textContent = 'Saqlash';
  }
});

$('.add-product-button').addEventListener('click', () => openProductForm());
$$('[data-close-product-modal]').forEach((element) => element.addEventListener('click', closeProductForm));

$('#products-table-body').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-product-id]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.productId);
  if (!product) return;
  if (button.classList.contains('edit-product')) {
    openProductForm(product);
    return;
  }
  button.disabled = true;
  try {
    if (button.classList.contains('toggle-product')) {
      await noxarSupabase.from('products').update({ active: !product.active, updated_at: new Date().toISOString() }).eq('id', product.id);
      product.active = !product.active;
      showToast(product.active ? 'Mahsulot saytda ko‘rinadi' : 'Mahsulot saytdan yashirildi');
    } else if (button.classList.contains('delete-product')) {
      if (!window.confirm(`“${product.name}” mahsulotini o‘chirishni tasdiqlaysizmi?`)) { button.disabled = false; return; }
      await noxarSupabase.from('products').delete().eq('id', product.id);
      products = products.filter((item) => item.id !== product.id);
      showToast('Mahsulot o‘chirildi');
    }
    renderAll();
  } catch (error) {
    console.error('Mahsulot amali xatosi:', error);
    showToast(`Amal bajarilmadi: ${errorText(error)}`);
    button.disabled = false;
  }
});

/* ---------- So'rovlar (ajratish / hidlab ko'rish) ---------- */
function renderReservations() {
  const query = $('#reservation-search')?.value.trim().toLowerCase() || '';
  const status = $('#reservation-status-filter')?.value || 'all';
  const visible = reservations.filter((item) =>
    `${item.customer_name} ${item.customer_phone} ${item.product_name}`.toLowerCase().includes(query)
    && (status === 'all' || item.status === status));
  $('#reservations-table-body').innerHTML = visible.map((item) => {
    const digits = String(item.customer_phone || '').replace(/\D/g, '');
    return `<tr>
      <td>${formatDate(item.created_at)}</td>
      <td class="customer-cell">${esc(item.customer_name)}</td>
      <td>${digits ? `<a href="tel:+${digits}">${esc(item.customer_phone)}</a>` : '—'}</td>
      <td>${esc(item.product_name)}<small>${esc(item.brand || '')}${item.volume_ml ? ` · ${esc(item.volume_ml)} ml` : ''}</small></td>
      <td>${esc(item.quantity || 1)} ta</td>
      <td>${esc(item.request_type)}</td>
      <td><select class="inline-status" data-reservation-id="${esc(item.id)}">${Object.entries(RESERVATION_STATUS).map(([value, label]) => `<option value="${value}" ${value === item.status ? 'selected' : ''}>${label}</option>`).join('')}</select></td>
      <td><button class="table-action delete-product reservation-delete" type="button" data-reservation-id="${esc(item.id)}">O‘chirish</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" class="empty-products">Hozircha so‘rovlar yo‘q.</td></tr>';
}

$$('#reservation-search, #reservation-status-filter').forEach((control) => control.addEventListener('input', renderReservations));
$('[data-refresh-reservations]').addEventListener('click', () => refreshAll(true));
$('#reservations-table-body').addEventListener('change', async (event) => {
  const select = event.target.closest('select[data-reservation-id]');
  if (!select) return;
  const item = reservations.find((entry) => entry.id === select.dataset.reservationId);
  if (!item) return;
  const previous = item.status;
  try {
    await noxarSupabase.from('reservations').update({ status: select.value, updated_at: new Date().toISOString() }).eq('id', item.id);
    item.status = select.value;
    showToast('So‘rov holati yangilandi');
    renderDashboard();
  } catch (error) {
    console.error('Holatni yangilashda xatolik:', error);
    select.value = previous;
    showToast(`Saqlanmadi: ${errorText(error)}`);
  }
});
$('#reservations-table-body').addEventListener('click', async (event) => {
  const button = event.target.closest('.reservation-delete');
  if (!button) return;
  if (!window.confirm('Bu so‘rovni o‘chirishni tasdiqlaysizmi?')) return;
  button.disabled = true;
  try {
    await noxarSupabase.from('reservations').delete().eq('id', button.dataset.reservationId);
    reservations = reservations.filter((item) => item.id !== button.dataset.reservationId);
    renderReservations();
    renderDashboard();
    showToast('So‘rov o‘chirildi');
  } catch (error) {
    button.disabled = false;
    showToast(`O‘chirilmadi: ${errorText(error)}`);
  }
});

/* ---------- Ombor ---------- */
function renderInventory() {
  const query = $('#inventory-search')?.value.trim().toLowerCase() || '';
  const filter = $('#inventory-stock-filter')?.value || 'all';
  const threshold = getThreshold();
  const visible = products.filter((product) => {
    const [status] = stockStatus(product.stock, threshold);
    return `${product.name} ${product.brand}`.toLowerCase().includes(query) && (filter === 'all' || filter === status);
  });
  const lowCount = products.filter((product) => product.stock <= threshold).length;
  $('[data-inventory-stat="sku"]').textContent = products.length;
  $('[data-inventory-stat="units"]').textContent = products.reduce((sum, product) => sum + product.stock, 0);
  $('[data-inventory-stat="low"]').textContent = lowCount;
  $('[data-inventory-stat="value"]').textContent = noxarFormatPrice(products.reduce((sum, product) => sum + product.stock * product.amount, 0));
  const alertBox = $('#inventory-alert');
  alertBox.hidden = !lowCount;
  alertBox.textContent = lowCount ? `Ogohlantirish: ${lowCount} ta mahsulot ${threshold} dona yoki undan kam qolgan.` : '';
  $('#inventory-table-body').innerHTML = visible.map((product) => {
    const [status, label] = stockStatus(product.stock, threshold);
    return `<tr>
      <td class="product-name-cell"><span class="admin-product-art">${esc(product.name.slice(0, 1))}</span><strong>${esc(product.name)}</strong><small>${esc(product.notes || '—')}</small></td>
      <td>${esc(product.brand)}</td><td>${noxarFormatPrice(product.amount)}</td>
      <td><strong class="inventory-stock-number">${product.stock}</strong> dona</td>
      <td><span class="status ${status}">${label}</span></td>
      <td>${noxarFormatPrice(product.stock * product.amount)}</td>
      <td><button type="button" class="table-action inventory-in" data-inventory-id="${esc(product.id)}">+ Kirim</button><button type="button" class="table-action inventory-out" data-inventory-id="${esc(product.id)}">− Chiqim</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty-products">Mahsulot topilmadi.</td></tr>';
}

$('#inventory-threshold').value = String(getThreshold());
$('#inventory-threshold').addEventListener('change', (event) => {
  localStorage.setItem('noxar-inventory-threshold', event.target.value);
  renderInventory();
  renderDashboard();
});
$$('#inventory-search, #inventory-stock-filter').forEach((control) => control.addEventListener('input', renderInventory));
$('[data-refresh-inventory]').addEventListener('click', () => refreshAll(true));
$('[data-export-inventory]').addEventListener('click', () => {
  downloadCsv('ombor.csv', ['Mahsulot', 'Brend', 'Narx', 'Qoldiq', 'Qiymat'],
    products.map((product) => [product.name, product.brand, product.amount, product.stock, product.stock * product.amount]));
});
$('#inventory-table-body').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-inventory-id]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.inventoryId);
  if (!product) return;
  const delta = button.classList.contains('inventory-in') ? 1 : -1;
  const next = Math.max(0, product.stock + delta);
  if (next === product.stock) return;
  button.disabled = true;
  try {
    await noxarSupabase.from('products').update({ stock: next, updated_at: new Date().toISOString() }).eq('id', product.id);
    product.stock = next;
    renderAll();
    showToast(delta > 0 ? 'Omborga kirim qo‘shildi' : 'Ombordan chiqim qilindi');
  } catch (error) {
    button.disabled = false;
    showToast(`Saqlanmadi: ${errorText(error)}`);
  }
});

/* ---------- Sharhlar ---------- */
function renderReviews() {
  const query = $('#review-search')?.value.trim().toLowerCase() || '';
  const status = $('#review-status-filter')?.value || 'all';
  const rating = $('#review-rating-filter')?.value || 'all';
  const visible = reviews.filter((review) =>
    `${review.customer_name} ${productName(review.product_id)} ${review.review_text}`.toLowerCase().includes(query)
    && (status === 'all' || review.status === status)
    && (rating === 'all' || String(review.rating) === rating));
  const approved = reviews.filter((review) => review.status === 'approved');
  $('[data-review-stat="total"]').textContent = reviews.length;
  $('[data-review-stat="pending"]').textContent = reviews.filter((review) => review.status === 'pending').length;
  $('[data-review-stat="approved"]').textContent = approved.length;
  $('[data-review-stat="average"]').textContent = `${(approved.length ? approved.reduce((sum, review) => sum + Number(review.rating), 0) / approved.length : 0).toFixed(1)} ★`;
  $('#reviews-table-body').innerHTML = visible.map((review) => {
    const stars = Number(review.rating) || 0;
    const id = esc(review.id);
    return `<tr>
      <td><strong>${esc(review.customer_name)}</strong><small>${formatDate(review.created_at)}</small></td>
      <td>${esc(productName(review.product_id))}</td>
      <td><span class="review-stars-text">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 5 - stars))}</span></td>
      <td class="review-text-cell">${esc(review.review_text)}</td>
      <td><span class="status ${review.status}">${REVIEW_STATUS[review.status] || ''}</span></td>
      <td>${review.status === 'pending'
        ? `<button type="button" class="table-action review-approve" data-review-id="${id}">Tasdiqlash</button><button type="button" class="table-action review-reject" data-review-id="${id}">Rad etish</button>`
        : `<button type="button" class="table-action review-pending" data-review-id="${id}">Kutilmoqda</button>`}<button type="button" class="table-action delete-product review-delete" data-review-id="${id}">O‘chirish</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-products">Sharh topilmadi.</td></tr>';
}

$$('#review-search, #review-status-filter, #review-rating-filter').forEach((control) => control.addEventListener('input', renderReviews));
$('[data-refresh-reviews]').addEventListener('click', () => refreshAll(true));
$('[data-export-reviews]').addEventListener('click', () => {
  downloadCsv('sharhlar.csv', ['Sana', 'Mijoz', 'Mahsulot', 'Reyting', 'Sharh', 'Holat'],
    reviews.map((review) => [formatDate(review.created_at), review.customer_name, productName(review.product_id), review.rating, review.review_text, REVIEW_STATUS[review.status]]));
});
$('#reviews-table-body').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-review-id]');
  if (!button) return;
  const review = reviews.find((item) => item.id === button.dataset.reviewId);
  if (!review) return;
  button.disabled = true;
  try {
    if (button.classList.contains('review-delete')) {
      if (!window.confirm('Bu sharhni o‘chirishni tasdiqlaysizmi?')) { button.disabled = false; return; }
      await noxarSupabase.from('reviews').delete().eq('id', review.id);
      reviews = reviews.filter((item) => item.id !== review.id);
      showToast('Sharh o‘chirildi');
    } else {
      const next = button.classList.contains('review-approve') ? 'approved' : button.classList.contains('review-reject') ? 'rejected' : 'pending';
      await noxarSupabase.from('reviews').update({ status: next }).eq('id', review.id);
      review.status = next;
      showToast('Sharh holati yangilandi');
    }
    renderReviews();
    renderDashboard();
  } catch (error) {
    button.disabled = false;
    showToast(`Amal bajarilmadi: ${errorText(error)}`);
  }
});

/* ---------- Bo'limlar, menyu, chiqish ---------- */
const menuToggle = $('.menu-toggle');
const sidebar = $('.sidebar');
const sidebarBackdrop = $('.sidebar-backdrop');
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  products: 'Mahsulotlar',
  'reservation-requests': 'Ajratish so‘rovlari',
  inventory: 'Ombor',
  reviews: 'Sharhlar'
};

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
  menuToggle.setAttribute('aria-expanded', 'false');
}

function showView(view) {
  if (!VIEW_TITLES[view]) view = 'dashboard';
  const isDashboard = view === 'dashboard';
  ['.welcome-row', '.stats-grid', '.dashboard-grid'].forEach((selector) => { $(selector).hidden = !isDashboard; });
  $('#products').hidden = view !== 'products';
  $('#reservation-requests-management').hidden = view !== 'reservation-requests';
  $('#inventory-management').hidden = view !== 'inventory';
  $('#reviews-management').hidden = view !== 'reviews';
  $('.topbar-title h1').textContent = VIEW_TITLES[view];
  $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  history.replaceState(null, '', `#${view}`);
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

menuToggle.addEventListener('click', () => {
  if (window.innerWidth > 820) {
    const quickNav = $('.quick-nav');
    const open = quickNav.hasAttribute('hidden');
    quickNav.toggleAttribute('hidden', !open);
    menuToggle.setAttribute('aria-expanded', String(open));
    return;
  }
  const isOpen = sidebar.classList.toggle('open');
  sidebarBackdrop.classList.toggle('show', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
sidebarBackdrop.addEventListener('click', closeSidebar);
$$('.nav-link').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  showView(link.dataset.view || 'dashboard');
}));
$$('.quick-nav [data-view]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  $('.quick-nav').hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  showView(link.dataset.view || 'dashboard');
}));
$('[data-dashboard-requests]').addEventListener('click', () => showView('reservation-requests'));
$('[data-dashboard-inventory]').addEventListener('click', () => showView('inventory'));

const logoutModal = $('.logout-modal');
function openLogoutModal() { logoutModal.classList.add('open'); logoutModal.setAttribute('aria-hidden', 'false'); }
function closeLogoutModal() { logoutModal.classList.remove('open'); logoutModal.setAttribute('aria-hidden', 'true'); }
$('.logout-link').addEventListener('click', openLogoutModal);
$$('[data-close-logout]').forEach((element) => element.addEventListener('click', closeLogoutModal));
$('[data-confirm-logout]').addEventListener('click', async () => {
  closeLogoutModal();
  await noxarAuth.signOut();
  adminReady = false;
  products = []; reservations = []; reviews = [];
  showLogin('Siz tizimdan chiqdingiz.');
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeProductForm();
  closeLogoutModal();
  closeSidebar();
});

startAdmin();
