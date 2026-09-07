const demoOrders = [];

const lowStockProducts = [
  { name: 'NO. 01 Obsidian', stock: 3, art: 'black' },
  { name: 'Noir Intense', stock: 2, art: 'black' },
  { name: 'NO. 03 Éclat', stock: 0, art: 'rose' },
  { name: 'NOXAR Ritual Set', stock: 4, art: 'cream' }
];

const defaultProducts = [];

let adminProducts = readAdminProducts();
let productsPage = 1;
const productsPerPage = 6;

function readAdminProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem('noxar-admin-products') || 'null');
    return Array.isArray(saved) ? saved : defaultProducts;
  } catch (error) {
    return defaultProducts;
  }
}

function saveAdminProducts() {
  localStorage.setItem('noxar-admin-products', JSON.stringify(adminProducts));
}

function productStatus(stock) {
  if (stock === 0) return ['soldout', 'Sotilgan'];
  if (stock <= 3) return ['low', 'Kam qolgan'];
  return ['available', 'Mavjud'];
}

function productDepartment(product) {
  return ['erkaklar', 'ayollar', 'unisex', 'sovga'].includes(product.category) ? 'atirlar' : product.category;
}

function productGender(product) {
  return ['erkaklar', 'ayollar', 'unisex'].includes(product.gender) ? product.gender
    : ['erkaklar', 'ayollar', 'unisex'].includes(product.category) ? product.category : 'unisex';
}

const departmentLabels = {
  atirlar: 'Atirlar',
  'body-fragrance': 'Tana uchun hushbo‘y mahsulotlar',
  deodorants: 'Dezodorantlar',
  'perfume-oils': 'Parfyumeriya moylari',
  'home-fragrance': 'Uy uchun hushbo‘y mahsulotlar',
  'bath-shower': 'Dush va vanna mahsulotlari',
  accessories: 'Parfyumeriya aksessuarlari'
};

function renderProducts() {
  const query = document.querySelector('#product-search').value.trim().toLowerCase();
  const category = document.querySelector('#product-category-filter').value;
  const gender = document.querySelector('#product-gender-filter').value;
  const stockFilter = document.querySelector('#product-stock-filter').value;
  const visible = adminProducts.filter((product) => {
    const [status] = productStatus(Number(product.stock));
    return `${product.name} ${product.brand}`.toLowerCase().includes(query)
      && (category === 'all' || productDepartment(product) === category)
      && (gender === 'all' || productGender(product) === gender)
      && (stockFilter === 'all' || stockFilter === status);
  });
  const totalPages = Math.max(1, Math.ceil(visible.length / productsPerPage));
  productsPage = Math.min(productsPage, totalPages);
  const pageItems = visible.slice((productsPage - 1) * productsPerPage, productsPage * productsPerPage);
  document.querySelector('#products-table-body').innerHTML = pageItems.map((product) => {
    const [status, statusLabel] = productStatus(Number(product.stock));
    return `<tr><td class="product-name-cell"><span class="admin-product-art">${product.name.slice(0, 1)}</span><strong>${product.name}</strong><small>${product.notes}</small></td><td>${product.brand}</td><td>${departmentLabels[productDepartment(product)] || productDepartment(product)}</td><td>${productGender(product) === 'ayollar' ? 'Ayollar' : productGender(product) === 'erkaklar' ? 'Erkaklar' : 'Uniseks'}</td><td>${Number(product.amount).toLocaleString('uz-UZ')} so‘m</td><td>${product.stock}</td><td><span class="status ${status}">${statusLabel}</span></td><td><button class="table-action edit-product" type="button" data-product-id="${product.id}">Tahrirlash</button><button class="table-action delete-product" type="button" data-product-id="${product.id}">O‘chirish</button></td></tr>`;
  }).join('') || '<tr><td colspan="8" class="empty-products">Mahsulot topilmadi.</td></tr>';
  document.querySelector('.products-pagination').innerHTML = totalPages > 1
    ? `<button type="button" data-page-action="prev" ${productsPage === 1 ? 'disabled' : ''}>‹</button><span>${productsPage} / ${totalPages}</span><button type="button" data-page-action="next" ${productsPage === totalPages ? 'disabled' : ''}>›</button>`
    : '';
}

function openProductForm(product) {
  const form = document.querySelector('.admin-product-form');
  form.reset();
  form.elements.id.value = product?.id || '';
  form.elements.name.value = product?.name || '';
  form.elements.brand.value = product?.brand || '';
  form.elements.amount.value = product?.amount || '';
  form.elements.stock.value = product?.stock ?? '';
  form.elements.category.value = product ? productDepartment(product) : 'atirlar';
  form.elements.gender.value = product ? productGender(product) : 'unisex';
  form.elements.family.value = product?.family || 'amber';
  form.elements.notes.value = product?.notes || '';
  form.dataset.currentImage = product?.image || '';
  form.dataset.currentVideo = product?.video || '';
  renderMediaPreview(product?.image, product?.video);
  document.querySelector('#product-form-title').textContent = product ? 'Mahsulotni tahrirlash' : 'Mahsulot qo‘shish';
  document.querySelector('.product-modal-admin').classList.add('open');
  document.querySelector('.product-modal-admin').setAttribute('aria-hidden', 'false');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', () => reject(new Error('Faylni o‘qib bo‘lmadi')));
    reader.readAsDataURL(file);
  });
}

function renderMediaPreview(image, video) {
  const preview = document.querySelector('.media-preview');
  preview.innerHTML = '';
  if (image) preview.insertAdjacentHTML('beforeend', `<img src="${image}" alt="Mahsulot rasmi preview">`);
  if (video) preview.insertAdjacentHTML('beforeend', `<video src="${video}" controls preload="metadata"></video>`);
  if (!image && !video) preview.textContent = 'Media fayllar tanlanmagan.';
}

function validateMediaFile(file, type) {
  if (!file || !file.size) return true;
  const limit = type === 'image' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > limit) {
    showToast(`${type === 'image' ? 'Rasm' : 'Video'} hajmi ${type === 'image' ? '5 MB' : '20 MB'} dan oshmasin.`);
    return false;
  }
  return true;
}

function closeProductForm() {
  document.querySelector('.product-modal-admin').classList.remove('open');
  document.querySelector('.product-modal-admin').setAttribute('aria-hidden', 'true');
}

const statusText = {
  paid: 'To‘langan',
  pending: 'Kutilmoqda',
  refunded: 'Qaytarilgan',
  delivered: 'Yetkazilgan',
  processing: 'Jarayonda',
  cancelled: 'Bekor qilingan'
};

function readStoredOrders() {
  try {
    return JSON.parse(localStorage.getItem('noxar-orders') || '[]');
  } catch (error) {
    return [];
  }
}

function renderOrders() {
  const storedOrders = readStoredOrders().map((order) => ({
    id: order.orderNumber,
    customer: order.customer,
    amount: `${Number(order.total || 0).toLocaleString('uz-UZ')} so‘m`,
    payment: getPaymentLabel(order.paymentMethod),
    paymentStatus: order.paymentStatus || 'pending',
    orderStatus: order.adminStatus || (order.status === 'Yetkazildi' ? 'delivered' : 'processing'),
    source: 'storefront',
    raw: order
  }));
  const savedStatuses = JSON.parse(localStorage.getItem('noxar-admin-order-statuses') || '{}');
  const demo = demoOrders.map((order) => ({ ...order, ...(savedStatuses[order.id] || {}), source: 'demo' }));
  const orders = [...storedOrders, ...demo];
  document.querySelector('#recent-orders').innerHTML = orders.map((order) => `
    <tr>
      <td class="order-id">${order.id}</td>
      <td class="customer-cell">${order.customer}<small>O‘zbekiston</small></td>
      <td>${order.amount}</td>
      <td>${order.payment}</td>
      <td><span class="status ${order.paymentStatus}">${statusText[order.paymentStatus]}</span></td>
      <td><span class="status ${order.orderStatus}">${statusText[order.orderStatus]}</span></td>
    </tr>
  `).join('');
  renderManagedOrders(getAllOrders());
}

function getPaymentLabel(payment) {
  return ({ card: 'Karta', payme: 'Payme', click: 'Click', uzum: 'Uzum Bank', cash: 'Naqd' }[payment] || payment || 'Naqd');
}

function getAllOrders() {
  const stored = readStoredOrders().map((order) => ({
    id: order.orderNumber, customer: order.customer, amount: Number(order.total || 0),
    payment: getPaymentLabel(order.paymentMethod), paymentStatus: order.paymentStatus || 'pending',
    orderStatus: order.adminStatus || (order.status === 'Yetkazildi' ? 'delivered' : 'processing'),
    source: 'storefront', raw: order, items: order.items || []
  }));
  const savedStatuses = JSON.parse(localStorage.getItem('noxar-admin-order-statuses') || '{}');
  return [...stored, ...demoOrders.map((order) => ({ ...order, amount: Number(String(order.amount).replace(/[^\d]/g, '')) || 0, ...(savedStatuses[order.id] || {}), source: 'demo', items: [] }))];
}

function renderManagedOrders(orders = getAllOrders()) {
  const query = document.querySelector('#order-search')?.value.trim().toLowerCase() || '';
  const payment = document.querySelector('#order-payment-filter')?.value || 'all';
  const status = document.querySelector('#order-status-filter')?.value || 'all';
  const visible = orders.filter((order) => `${order.id} ${order.customer}`.toLowerCase().includes(query)
    && (payment === 'all' || order.paymentStatus === payment)
    && (status === 'all' || order.orderStatus === status));
  document.querySelector('#orders-table-body').innerHTML = visible.map((order) => `
    <tr>
      <td class="order-id">${order.id}</td><td class="customer-cell">${order.customer}<small>O‘zbekiston</small></td>
      <td>${Number(order.amount).toLocaleString('uz-UZ')} so‘m</td><td>${order.payment}</td>
      <td><select class="inline-status" data-order-field="paymentStatus" data-order-id="${order.id}">${['pending', 'paid'].map((value) => `<option value="${value}" ${value === order.paymentStatus ? 'selected' : ''}>${statusText[value]}</option>`).join('')}</select></td>
      <td><select class="inline-status" data-order-field="orderStatus" data-order-id="${order.id}">${['processing', 'delivered', 'cancelled'].map((value) => `<option value="${value}" ${value === order.orderStatus ? 'selected' : ''}>${statusText[value]}</option>`).join('')}</select></td>
      <td><button type="button" class="table-action view-order" data-order-id="${order.id}">Ko‘rish</button></td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty-products">Buyurtma topilmadi.</td></tr>';
}

function saveOrderStatus(orderId, field, value) {
  const storedOrders = readStoredOrders();
  const stored = storedOrders.find((order) => order.orderNumber === orderId);
  if (stored) {
    if (field === 'paymentStatus') stored.paymentStatus = value;
    if (field === 'orderStatus') {
      stored.adminStatus = value;
      stored.status = statusText[value];
    }
    localStorage.setItem('noxar-orders', JSON.stringify(storedOrders));
  } else {
    const statuses = JSON.parse(localStorage.getItem('noxar-admin-order-statuses') || '{}');
    statuses[orderId] = { ...(statuses[orderId] || {}), [field]: value };
    localStorage.setItem('noxar-admin-order-statuses', JSON.stringify(statuses));
  }
  renderOrders();
  if (document.querySelector('#payments-table-body')) renderPayments();
  showToast('Buyurtma holati yangilandi');
}

function openOrderDetails(order) {
  document.querySelector('#order-detail-title').textContent = order.id;
  document.querySelector('#order-detail-content').innerHTML = `
    <div><span>Mijoz</span><strong>${order.customer}</strong></div>
    <div><span>Summa</span><strong>${Number(order.amount).toLocaleString('uz-UZ')} so‘m</strong></div>
    <div><span>To‘lov</span><strong>${order.payment} · ${statusText[order.paymentStatus]}</strong></div>
    <div><span>Holat</span><strong>${statusText[order.orderStatus]}</strong></div>
    <div class="order-detail-wide"><span>Mahsulotlar</span><strong>${order.items?.length ? order.items.map((item) => `${item.name} (${item.quantity} ta)`).join(', ') : 'Demo buyurtma'}</strong></div>`;
  document.querySelector('.order-modal-admin').classList.add('open');
  document.querySelector('.order-modal-admin').setAttribute('aria-hidden', 'false');
}

function closeOrderDetails() {
  document.querySelector('.order-modal-admin').classList.remove('open');
  document.querySelector('.order-modal-admin').setAttribute('aria-hidden', 'true');
}

function getCustomers() {
  const metadata = JSON.parse(localStorage.getItem('noxar-customer-meta') || '{}');
  const customers = new Map();
  const orders = getAllOrders();
  orders.forEach((order) => {
    const key = String(order.customer || 'Noma’lum').trim().toLowerCase();
    const existing = customers.get(key) || {
      id: key.replace(/\s+/g, '-'),
      name: order.customer || 'Noma’lum',
      phone: order.raw?.phone || '—',
      email: order.raw?.email || '—',
      orders: [],
      total: 0,
      lastOrder: null
    };
    existing.orders.push(order);
    existing.total += Number(order.amount) || 0;
    if (!existing.lastOrder || (order.raw?.createdAt || '') > (existing.lastOrder.raw?.createdAt || '')) existing.lastOrder = order;
    customers.set(key, existing);
  });
  const account = JSON.parse(localStorage.getItem('noxar-account') || 'null');
  if (account?.name) {
    const key = account.name.trim().toLowerCase();
    if (!customers.has(key)) customers.set(key, { id: key.replace(/\s+/g, '-'), name: account.name, phone: '—', email: account.email || '—', orders: [], total: 0, lastOrder: null });
    else if (account.email) customers.get(key).email = account.email;
  }
  return [...customers.values()].map((customer) => ({
    ...customer,
    ...(metadata[customer.id] || {}),
    segment: metadata[customer.id]?.blocked ? 'blocked' : metadata[customer.id]?.vip ? 'vip' : customer.orders.length > 1 ? 'active' : 'new',
    level: metadata[customer.id]?.level || (customer.total >= 3000000 ? 'Gold' : customer.total >= 1500000 ? 'Silver' : 'Bronze')
  }));
}

function renderCustomers() {
  const query = document.querySelector('#customer-search')?.value.trim().toLowerCase() || '';
  const segment = document.querySelector('#customer-segment-filter')?.value || 'all';
  const allCustomers = getCustomers();
  const customers = allCustomers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query)
    && (segment === 'all' || customer.segment === segment)
  );
  const totalSpent = allCustomers.reduce((sum, customer) => sum + customer.total, 0);
  document.querySelector('[data-customer-stat="total"]').textContent = allCustomers.length;
  document.querySelector('[data-customer-stat="vip"]').textContent = allCustomers.filter((customer) => customer.segment === 'vip' || customer.level === 'Gold').length;
  document.querySelector('[data-customer-stat="new"]').textContent = allCustomers.filter((customer) => customer.segment === 'new').length;
  document.querySelector('[data-customer-stat="average"]').textContent = `${Math.round(totalSpent / Math.max(allCustomers.length, 1)).toLocaleString('uz-UZ')} so‘m`;
  document.querySelector('#customers-table-body').innerHTML = customers.map((customer) => `
    <tr>
      <td class="customer-cell"><strong>${customer.name}</strong><small>${customer.orders.length ? 'Mijoz' : 'Ro‘yxatdan o‘tgan akkaunt'}</small></td>
      <td>${customer.email}<small>${customer.phone}</small></td>
      <td>${customer.orders.length} ta</td>
      <td>${customer.total.toLocaleString('uz-UZ')} so‘m</td>
      <td><span class="customer-level ${customer.level.toLowerCase()}">${customer.level}</span></td>
      <td><span class="status ${customer.segment}">${customer.segment === 'active' ? 'Faol' : customer.segment === 'vip' ? 'VIP' : customer.segment === 'blocked' ? 'Bloklangan' : 'Yangi'}</span></td>
      <td><button type="button" class="table-action view-customer" data-customer-id="${customer.id}">Profil</button><button type="button" class="table-action toggle-customer" data-customer-id="${customer.id}">${customer.segment === 'blocked' ? 'Ochish' : 'Bloklash'}</button></td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty-products">Mijoz topilmadi.</td></tr>';
}

function openCustomerDetails(customer) {
  document.querySelector('#customer-detail-title').textContent = customer.name;
  document.querySelector('#customer-detail-content').innerHTML = `
    <div><span>Email</span><strong>${customer.email}</strong></div>
    <div><span>Telefon</span><strong>${customer.phone}</strong></div>
    <div><span>Buyurtmalar</span><strong>${customer.orders.length} ta</strong></div>
    <div><span>Jami xarid</span><strong>${customer.total.toLocaleString('uz-UZ')} so‘m</strong></div>
    <div><span>VIP daraja</span><strong>${customer.level}</strong></div>
    <div><span>Promo-kod</span><strong>${JSON.parse(localStorage.getItem('noxar-customer-meta') || '{}')[customer.id]?.promo || 'Berilmagan'}</strong></div>
    <div class="customer-detail-wide"><span>Buyurtmalar tarixi</span><strong>${customer.orders.length ? customer.orders.map((order) => `${order.id} · ${Number(order.amount).toLocaleString('uz-UZ')} so‘m · ${statusText[order.orderStatus]}`).join('<br>') : 'Hali buyurtma yo‘q'}</strong></div>`;
  const metadata = JSON.parse(localStorage.getItem('noxar-customer-meta') || '{}');
  const saved = metadata[customer.id] || {};
  const form = document.querySelector('#customer-edit-form');
  form.elements.id.value = customer.id; form.elements.name.value = customer.name; form.elements.email.value = customer.email === '—' ? '' : customer.email;
  form.elements.phone.value = customer.phone === '—' ? '' : customer.phone; form.elements.birthday.value = saved.birthday || '';
  form.elements.address.value = saved.address || ''; form.elements.note.value = saved.note || '';
  form.elements.promo.value = saved.promo || ''; form.elements.level.value = customer.level;
  form.elements.vip.checked = Boolean(saved.vip);
  form.dataset.customerId = customer.id;
  document.querySelector('.customer-modal-admin').classList.add('open');
  document.querySelector('.customer-modal-admin').setAttribute('aria-hidden', 'false');
}

function saveCustomerMeta(customerId, data) {
  const metadata = JSON.parse(localStorage.getItem('noxar-customer-meta') || '{}');
  metadata[customerId] = { ...(metadata[customerId] || {}), ...data };
  localStorage.setItem('noxar-customer-meta', JSON.stringify(metadata));
}

function exportCustomers() {
  const rows = getCustomers().map((customer) => [customer.name, customer.email, customer.phone, customer.orders.length, customer.total, customer.level, customer.segment]);
  const csv = [['Ism', 'Email', 'Telefon', 'Buyurtmalar', 'Jami xarid', 'Daraja', 'Segment'], ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'noxar-mijozlar.csv'; link.click(); URL.revokeObjectURL(link.href);
  showToast('Mijozlar CSV fayliga eksport qilindi');
}

function closeCustomerDetails() {
  document.querySelector('.customer-modal-admin').classList.remove('open');
  document.querySelector('.customer-modal-admin').setAttribute('aria-hidden', 'true');
}

function renderLowStock() {
  document.querySelector('#low-stock-list').innerHTML = lowStockProducts.map((product) => `
    <div class="stock-item">
      <div class="stock-art ${product.art}">N</div>
      <div><strong>${product.name}</strong><small>${product.stock === 0 ? 'Sotuvda yo‘q' : 'Omborda mavjud'}</small></div>
      <span class="stock-count">${product.stock} ta</span>
    </div>
  `).join('');
}

function getInventoryThreshold() {
  return Number(localStorage.getItem('noxar-inventory-threshold') || 3);
}

function getInventoryRows() {
  const saved = JSON.parse(localStorage.getItem('noxar-inventory-adjustments') || '{}');
  const thresholds = JSON.parse(localStorage.getItem('noxar-inventory-thresholds') || '{}');
  return adminProducts.map((product) => ({ ...product, stock: Math.max(0, Number(saved[product.id] ?? product.stock) || 0), threshold: Number(thresholds[product.id] ?? getInventoryThreshold()) }));
}

function renderInventory() {
  const query = document.querySelector('#inventory-search')?.value.trim().toLowerCase() || '';
  const filter = document.querySelector('#inventory-stock-filter')?.value || 'all';
  const threshold = getInventoryThreshold();
  const rows = getInventoryRows();
  const visible = rows.filter((product) => {
    const status = Number(product.stock) === 0 ? 'soldout' : Number(product.stock) <= threshold ? 'low' : 'available';
    return `${product.name} ${product.brand}`.toLowerCase().includes(query) && (filter === 'all' || filter === status);
  });
  const units = rows.reduce((sum, product) => sum + Number(product.stock), 0);
  document.querySelector('[data-inventory-stat="sku"]').textContent = rows.length;
  document.querySelector('[data-inventory-stat="units"]').textContent = units;
  document.querySelector('[data-inventory-stat="low"]').textContent = rows.filter((product) => Number(product.stock) <= threshold).length;
  document.querySelector('[data-inventory-stat="value"]').textContent = `${rows.reduce((sum, product) => sum + Number(product.stock) * Number(product.amount), 0).toLocaleString('uz-UZ')} so‘m`;
  const alerts = rows.filter((product) => Number(product.stock) <= product.threshold);
  const alertBox = document.querySelector('#inventory-alert');
  alertBox.hidden = !alerts.length;
  alertBox.textContent = alerts.length ? `Ogohlantirish: ${alerts.length} ta mahsulot minimal qoldiq chegarasiga yetdi.` : '';
  document.querySelector('#inventory-table-body').innerHTML = visible.map((product) => {
    const stock = Number(product.stock);
    const status = stock === 0 ? 'soldout' : stock <= threshold ? 'low' : 'available';
    const label = status === 'soldout' ? 'Sotilgan' : status === 'low' ? 'Kam qolgan' : 'Mavjud';
    return `<tr><td class="product-name-cell"><span class="admin-product-art">${product.name.slice(0, 1)}</span><strong>${product.name}</strong><small>${product.notes || '—'}</small></td><td>${product.brand}</td><td>${Number(product.amount).toLocaleString('uz-UZ')} so‘m</td><td><strong class="inventory-stock-number">${stock}</strong> dona<br><small>Min: <input class="inventory-threshold-input" data-inventory-threshold="${product.id}" type="number" min="0" value="${product.threshold}" aria-label="${product.name} minimal qoldiq"></small></td><td><span class="status ${status}">${label}</span></td><td>${(stock * Number(product.amount)).toLocaleString('uz-UZ')} so‘m</td><td><button type="button" class="table-action inventory-in" data-inventory-id="${product.id}">+ Kirim</button><button type="button" class="table-action inventory-out" data-inventory-id="${product.id}">− Chiqim</button></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty-products">Mahsulot topilmadi.</td></tr>';
  renderInventoryForecast(rows);
}

function renderInventoryForecast(rows) {
  const sales = {};
  getAllOrders().forEach((order) => (order.items || []).forEach((item) => { sales[item.id] = (sales[item.id] || 0) + Number(item.quantity || item.qty || 1); }));
  const ranked = rows.map((product) => ({ ...product, sold: sales[product.id] || 0 })).sort((a, b) => b.sold - a.sold);
  document.querySelector('#inventory-forecast-list').innerHTML = ranked.slice(0, 5).map((product, index) => `<div class="forecast-row"><span class="forecast-rank">0${index + 1}</span><strong>${product.name}</strong><span>${product.sold} dona sotilgan</span><b>${product.sold >= 3 ? 'Talab yuqori' : 'Kuzatuvda'}</b></div>`).join('') || '<p class="muted">Prognoz uchun savdo ma’lumotlari yetarli emas.</p>';
}

function adjustInventory(productId, delta) {
  const product = getInventoryRows().find((item) => item.id === productId);
  if (!product) return;
  const adjustments = JSON.parse(localStorage.getItem('noxar-inventory-adjustments') || '{}');
  const next = Math.max(0, Number(product.stock) + delta);
  adjustments[productId] = next;
  localStorage.setItem('noxar-inventory-adjustments', JSON.stringify(adjustments));
  renderInventory();
  showToast(delta > 0 ? 'Omborga kirim qo‘shildi' : 'Ombordan chiqim qilindi');
}

function exportInventory() {
  const csv = [['Mahsulot', 'Brend', 'Narx', 'Qoldiq', 'Qiymat'], ...getInventoryRows().map((item) => [item.name, item.brand, item.amount, item.stock, Number(item.amount) * Number(item.stock)])]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'noxar-ombor.csv'; link.click(); URL.revokeObjectURL(link.href);
  showToast('Ombor CSV fayliga eksport qilindi');
}

function getPaymentRows() {
  const refunds = JSON.parse(localStorage.getItem('noxar-refunded-payments') || '{}');
  return getAllOrders().map((order) => ({ ...order, paymentStatus: refunds[order.id] ? 'refunded' : order.paymentStatus }));
}

function renderPayments() {
  const query = document.querySelector('#payment-search')?.value.trim().toLowerCase() || '';
  const method = document.querySelector('#payment-method-filter')?.value || 'all';
  const status = document.querySelector('#payment-status-filter')?.value || 'all';
  const rows = getPaymentRows();
  const visible = rows.filter((payment) => `${payment.id} ${payment.customer}`.toLowerCase().includes(query)
    && (method === 'all' || payment.payment === method)
    && (status === 'all' || payment.paymentStatus === status));
  const total = rows.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const paid = rows.filter((payment) => payment.paymentStatus === 'paid').reduce((sum, payment) => sum + Number(payment.amount), 0);
  const pending = rows.filter((payment) => payment.paymentStatus === 'pending').reduce((sum, payment) => sum + Number(payment.amount), 0);
  document.querySelector('[data-payment-stat="total"]').textContent = `${total.toLocaleString('uz-UZ')} so‘m`;
  document.querySelector('[data-payment-stat="paid"]').textContent = `${paid.toLocaleString('uz-UZ')} so‘m`;
  document.querySelector('[data-payment-stat="pending"]').textContent = `${pending.toLocaleString('uz-UZ')} so‘m`;
  document.querySelector('[data-payment-stat="count"]').textContent = rows.length;
  document.querySelector('#payments-table-body').innerHTML = visible.map((payment) => `
    <tr><td class="order-id">PAY-${payment.id.replace(/\D/g, '').slice(-6) || 'DEMO'}</td><td>${payment.id}</td><td class="customer-cell">${payment.customer}<small>${payment.source === 'demo' ? 'Demo buyurtma' : 'Online buyurtma'}</small></td><td>${payment.payment}</td><td>${Number(payment.amount).toLocaleString('uz-UZ')} so‘m</td><td><span class="status ${payment.paymentStatus}">${statusText[payment.paymentStatus]}</span></td><td>${payment.paymentStatus === 'refunded' ? '<span class="muted">Qaytarilgan</span>' : `<button type="button" class="table-action payment-status-action" data-payment-id="${payment.id}" data-payment-status="${payment.paymentStatus === 'paid' ? 'pending' : 'paid'}">${payment.paymentStatus === 'paid' ? 'Kutilmoqda' : 'Tasdiqlash'}</button><button type="button" class="table-action payment-refund-action" data-payment-id="${payment.id}">Qaytarish</button>`}</td></tr>
  `).join('') || '<tr><td colspan="7" class="empty-products">To‘lov topilmadi.</td></tr>';
}

function updatePaymentStatus(orderId, status) {
  if (status === 'refunded') {
    const refunds = JSON.parse(localStorage.getItem('noxar-refunded-payments') || '{}');
    refunds[orderId] = true;
    localStorage.setItem('noxar-refunded-payments', JSON.stringify(refunds));
  } else {
    saveOrderStatus(orderId, 'paymentStatus', status);
    return;
  }
  renderPayments();
  showToast('To‘lov qaytarilgan sifatida belgilandi');
}

function exportPayments() {
  const csv = [['To‘lov ID', 'Buyurtma', 'Mijoz', 'Usul', 'Summa', 'Holat'], ...getPaymentRows().map((item) => [`PAY-${item.id}`, item.id, item.customer, item.payment, item.amount, statusText[item.paymentStatus]])]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'noxar-tolovlar.csv'; link.click(); URL.revokeObjectURL(link.href);
  showToast('To‘lovlar CSV fayliga eksport qilindi');
}

function getPromos() {
  try {
    const saved = JSON.parse(localStorage.getItem('noxar-promo-codes') || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    showToast('Promo-kodlar ma’lumotini o‘qib bo‘lmadi');
  }
  return [{ id: 'promo-noxar10', code: 'NOXAR10', type: 'percent', value: 10, minOrder: 0, expires: '', limit: 0, used: 4, active: true, note: 'Umumiy chegirma' }];
}

function savePromos(promos) {
  localStorage.setItem('noxar-promo-codes', JSON.stringify(promos));
}

function promoState(promo) {
  if (!promo.active) return ['inactive', 'Nofaol'];
  if (promo.expires && new Date(`${promo.expires}T23:59:59`) < new Date()) return ['expired', 'Muddati tugagan'];
  if (Number(promo.limit) > 0 && Number(promo.used) >= Number(promo.limit)) return ['expired', 'Limit tugagan'];
  return ['active', 'Faol'];
}

function renderPromos() {
  const promos = getPromos();
  const query = document.querySelector('#promo-search')?.value.trim().toLowerCase() || '';
  const filter = document.querySelector('#promo-status-filter')?.value || 'all';
  const visible = promos.filter((promo) => {
    const [state] = promoState(promo);
    return `${promo.code} ${promo.note || ''}`.toLowerCase().includes(query) && (filter === 'all' || state === filter);
  });
  const active = promos.filter((promo) => promoState(promo)[0] === 'active').length;
  const used = promos.reduce((sum, promo) => sum + Number(promo.used || 0), 0);
  document.querySelector('[data-promo-stat="total"]').textContent = promos.length;
  document.querySelector('[data-promo-stat="active"]').textContent = active;
  document.querySelector('[data-promo-stat="used"]').textContent = used;
  document.querySelector('[data-promo-stat="discount"]').textContent = `${promos.reduce((sum, promo) => sum + (promo.type === 'fixed' ? Number(promo.value || 0) * Number(promo.used || 0) : 0), 0).toLocaleString('uz-UZ')} so‘m`;
  document.querySelector('#promos-table-body').innerHTML = visible.map((promo) => {
    const [state, label] = promoState(promo);
    const discount = promo.type === 'percent' ? `${promo.value}%` : `${Number(promo.value).toLocaleString('uz-UZ')} so‘m`;
    const usage = Number(promo.limit) > 0 ? `${promo.used || 0} / ${promo.limit}` : `${promo.used || 0} / ∞`;
    return `<tr><td><strong class="promo-code">${promo.code}</strong><small>${promo.note || '—'}</small></td><td>${discount}</td><td>${Number(promo.minOrder) > 0 ? `${Number(promo.minOrder).toLocaleString('uz-UZ')} so‘mdan` : 'Minimal summa yo‘q'}</td><td>${usage}</td><td>${promo.expires || 'Cheklanmagan'}</td><td><span class="status ${state}">${label}</span></td><td><button type="button" class="table-action edit-promo" data-promo-id="${promo.id}">Tahrirlash</button><button type="button" class="table-action toggle-promo" data-promo-id="${promo.id}">${promo.active ? 'O‘chirish' : 'Yoqish'}</button><button type="button" class="table-action delete-product delete-promo" data-promo-id="${promo.id}">O‘chirish</button></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty-products">Promo-kod topilmadi.</td></tr>';
}

function openPromoForm(promo = null) {
  const form = document.querySelector('#promo-form');
  form.reset();
  form.hidden = false;
  form.elements.id.value = promo?.id || '';
  form.elements.code.value = promo?.code || '';
  form.elements.type.value = promo?.type || 'percent';
  form.elements.value.value = promo?.value || '';
  form.elements.minOrder.value = promo?.minOrder || 0;
  form.elements.expires.value = promo?.expires || '';
  form.elements.limit.value = promo?.limit || 0;
  form.elements.note.value = promo?.note || '';
  form.elements.code.focus();
}

function closePromoForm() {
  document.querySelector('#promo-form').hidden = true;
}

function exportPromos() {
  const csv = [['Kod', 'Turi', 'Qiymat', 'Minimal buyurtma', 'Limit', 'Ishlatilgan', 'Muddat', 'Holat'], ...getPromos().map((promo) => [promo.code, promo.type, promo.value, promo.minOrder, promo.limit || 'Cheksiz', promo.used || 0, promo.expires || 'Cheklanmagan', promoState(promo)[1]])]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'noxar-promo-kodlar.csv'; link.click(); URL.revokeObjectURL(link.href);
  showToast('Promo-kodlar CSV fayliga eksport qilindi');
}

function getAdminReviews() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('noxar-reviews') || '{}'); } catch (error) { showToast('Sharhlar ma’lumotini o‘qib bo‘lmadi'); }
  const productMap = new Map([...defaultProducts, ...adminProducts].map((product) => [product.id, product.name]));
  const demo = [
    ['obsidian', 'Sanjar A.', 5, 'Sirli va uzoq saqlanadigan hid.'],
    ['santal', 'Dilnoza K.', 5, 'Yumshoq, nafis va juda esda qolarli.'],
    ['eclat', 'Madina N.', 4, 'Gulli notalari juda chiroyli ochiladi.']
  ].map(([productId, name, rating, text]) => ({ id: `demo-${productId}`, productId, name, rating, text, productName: productMap.get(productId) || productId, status: 'approved', demo: true }));
  const userReviews = Object.entries(saved).flatMap(([productId, reviews]) => (Array.isArray(reviews) ? reviews : []).map((review, index) => ({
    ...review, id: `${productId}-${index}`, productId, productName: productMap.get(productId) || productId, status: review.status || 'pending'
  })));
  return [...demo, ...userReviews];
}

function saveAdminReviews(reviews) {
  const grouped = {};
  reviews.filter((review) => !review.demo).forEach((review) => {
    const item = { name: review.name, rating: review.rating, text: review.text, status: review.status };
    (grouped[review.productId] ||= []).push(item);
  });
  localStorage.setItem('noxar-reviews', JSON.stringify(grouped));
}

function renderReviews() {
  const all = getAdminReviews();
  const query = document.querySelector('#review-search')?.value.trim().toLowerCase() || '';
  const status = document.querySelector('#review-status-filter')?.value || 'all';
  const rating = document.querySelector('#review-rating-filter')?.value || 'all';
  const visible = all.filter((review) => `${review.name} ${review.productName} ${review.text}`.toLowerCase().includes(query)
    && (status === 'all' || review.status === status) && (rating === 'all' || String(review.rating) === rating));
  const approved = all.filter((review) => review.status === 'approved');
  document.querySelector('[data-review-stat="total"]').textContent = all.length;
  document.querySelector('[data-review-stat="pending"]').textContent = all.filter((review) => review.status === 'pending').length;
  document.querySelector('[data-review-stat="approved"]').textContent = approved.length;
  document.querySelector('[data-review-stat="average"]').textContent = `${(all.length ? all.reduce((sum, review) => sum + Number(review.rating), 0) / all.length : 0).toFixed(1)} ★`;
  document.querySelector('#reviews-table-body').innerHTML = visible.map((review) => {
    const label = { pending: 'Kutilmoqda', approved: 'Tasdiqlangan', rejected: 'Rad etilgan' }[review.status];
    return `<tr><td><strong>${review.name}</strong><small>Foydalanuvchi sharhi</small></td><td>${review.productName}</td><td><span class="review-stars-text">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</span></td><td class="review-text-cell">${review.text}</td><td><span class="status ${review.status}">${label}</span></td><td>${review.status === 'pending' ? `<button type="button" class="table-action review-approve" data-review-id="${review.id}">Tasdiqlash</button><button type="button" class="table-action review-reject" data-review-id="${review.id}">Rad etish</button>` : `<button type="button" class="table-action review-pending" data-review-id="${review.id}">Kutilmoqda</button>`}<button type="button" class="table-action delete-product review-delete" data-review-id="${review.id}">O‘chirish</button></td></tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-products">Sharh topilmadi.</td></tr>';
}

function updateReviewStatus(id, status) {
  const reviews = getAdminReviews();
  const review = reviews.find((item) => item.id === id);
  if (!review) return;
  review.status = status;
  saveAdminReviews(reviews);
  renderReviews();
  showToast('Sharh holati yangilandi');
}

function exportReviews() {
  const csv = [['Mijoz', 'Mahsulot', 'Reyting', 'Sharh', 'Holat'], ...getAdminReviews().map((review) => [review.name, review.productName, review.rating, review.text, review.status])]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'noxar-sharhlar.csv'; link.click(); URL.revokeObjectURL(link.href);
  showToast('Sharhlar CSV fayliga eksport qilindi');
}

function getCampaigns() {
  try {
    const saved = JSON.parse(localStorage.getItem('noxar-campaigns') || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) { showToast('Kampaniyalar ma’lumotini o‘qib bo‘lmadi'); }
  return [{ id: 'campaign-private-sale', type: 'offer', title: 'O‘zingizga mos hidni toping', text: '15% chegirma va bepul yetkazib berish', cta: 'Aksiyani ko‘rish', link: '#new', promo: 'NOXAR10', starts: '', ends: '', theme: 'gold', image: '', active: true }];
}

function saveCampaigns(campaigns) {
  localStorage.setItem('noxar-campaigns', JSON.stringify(campaigns));
}

function campaignState(campaign) {
  const now = new Date();
  if (!campaign.active) return ['inactive', 'Nofaol'];
  if (campaign.starts && new Date(`${campaign.starts}T00:00:00`) > now) return ['inactive', 'Boshlanmagan'];
  if (campaign.ends && new Date(`${campaign.ends}T23:59:59`) < now) return ['expired', 'Muddati tugagan'];
  return ['active', 'Faol'];
}

function renderCampaigns() {
  const campaigns = getCampaigns();
  const query = document.querySelector('#campaign-search')?.value.trim().toLowerCase() || '';
  const type = document.querySelector('#campaign-type-filter')?.value || 'all';
  const status = document.querySelector('#campaign-status-filter')?.value || 'all';
  const visible = campaigns.filter((campaign) => {
    const [state] = campaignState(campaign);
    return `${campaign.title} ${campaign.text} ${campaign.promo || ''}`.toLowerCase().includes(query)
      && (type === 'all' || campaign.type === type) && (status === 'all' || state === status);
  });
  document.querySelector('[data-campaign-stat="total"]').textContent = campaigns.length;
  document.querySelector('[data-campaign-stat="active"]').textContent = campaigns.filter((item) => campaignState(item)[0] === 'active').length;
  document.querySelector('[data-campaign-stat="banners"]').textContent = campaigns.filter((item) => item.type === 'banner').length;
  document.querySelector('[data-campaign-stat="offers"]').textContent = campaigns.filter((item) => item.type === 'offer').length;
  document.querySelector('#campaigns-table-body').innerHTML = visible.map((campaign) => {
    const [state, label] = campaignState(campaign);
    return `<tr><td><strong class="campaign-title">${campaign.title}</strong><small>${campaign.text}</small></td><td>${campaign.type === 'banner' ? 'Banner' : 'Aksiya'}</td><td>${campaign.cta || '—'}<small>${campaign.promo || 'Promo-kodsiz'}</small></td><td>${campaign.starts || '—'} → ${campaign.ends || '—'}</td><td><span class="status ${state}">${label}</span></td><td><button type="button" class="table-action edit-campaign" data-campaign-id="${campaign.id}">Tahrirlash</button><button type="button" class="table-action toggle-campaign" data-campaign-id="${campaign.id}">${campaign.active ? 'O‘chirish' : 'Yoqish'}</button><button type="button" class="table-action delete-product delete-campaign" data-campaign-id="${campaign.id}">O‘chirish</button></td></tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-products">Kampaniya topilmadi.</td></tr>';
}

function updateCampaignPreview() {
  const form = document.querySelector('#campaign-form');
  const preview = document.querySelector('#campaign-preview');
  preview.innerHTML = `<strong>${form.elements.title.value || 'Sarlavha'}</strong><span>${form.elements.text.value || 'Aksiya matni'}</span><em>${form.elements.cta.value || 'Batafsil'} ${form.elements.promo.value ? `· ${form.elements.promo.value.toUpperCase()}` : ''}</em>`;
  preview.dataset.theme = form.elements.theme.value;
}

function openCampaignForm(campaign = null) {
  const form = document.querySelector('#campaign-form');
  form.reset(); form.hidden = false;
  form.elements.id.value = campaign?.id || '';
  form.elements.type.value = campaign?.type || 'banner';
  form.elements.title.value = campaign?.title || '';
  form.elements.text.value = campaign?.text || '';
  form.elements.cta.value = campaign?.cta || 'Batafsil';
  form.elements.link.value = campaign?.link || '#new';
  form.elements.promo.value = campaign?.promo || '';
  form.elements.starts.value = campaign?.starts || '';
  form.elements.ends.value = campaign?.ends || '';
  form.elements.theme.value = campaign?.theme || 'gold';
  form.elements.image.value = campaign?.image || '';
  updateCampaignPreview();
  form.elements.title.focus();
}

function exportCampaigns() {
  const csv = [['Sarlavha', 'Turi', 'Matn', 'CTA', 'Havola', 'Promo-kod', 'Boshlanish', 'Tugash', 'Holat'], ...getCampaigns().map((item) => [item.title, item.type, item.text, item.cta, item.link, item.promo, item.starts, item.ends, campaignState(item)[1]])]
    .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  link.download = 'noxar-kampaniyalar.csv'; link.click(); URL.revokeObjectURL(link.href);
  showToast('Kampaniyalar CSV fayliga eksport qilindi');
}

function reportMoney(value) {
  return `${Math.round(value || 0).toLocaleString('uz-UZ')} so‘m`;
}

function getReportOrders(days) {
  const orders = getAllOrders().map((order, index) => {
    const dateValue = order.createdAt || order.date || order.raw?.createdAt;
    const date = dateValue ? new Date(dateValue) : new Date(Date.now() - index * 86400000 * 3);
    return { ...order, reportDate: Number.isNaN(date.getTime()) ? new Date() : date };
  });
  if (days === 'all') return orders;
  const cutoff = Date.now() - Number(days) * 86400000;
  return orders.filter((order) => order.reportDate.getTime() >= cutoff);
}

function renderReportBreakdown(target, entries, total) {
  document.querySelector(target).innerHTML = entries.map(([label, value, color], index) => {
    const percent = total ? Math.round(value / total * 100) : 0;
    return `<div class="breakdown-row"><span class="breakdown-dot dot-${color || index % 4}"></span><strong>${label}</strong><span class="breakdown-track"><i style="width:${percent}%"></i></span><b>${value} <small>(${percent}%)</small></b></div>`;
  }).join('') || '<p class="muted">Ma’lumot mavjud emas.</p>';
}

function renderReports() {
  const days = document.querySelector('#report-period')?.value || '30';
  const orders = getReportOrders(days);
  const revenueOrders = orders.filter((order) => order.paymentStatus !== 'refunded' && order.orderStatus !== 'cancelled');
  const revenue = revenueOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const average = revenueOrders.length ? revenue / revenueOrders.length : 0;
  const delivered = orders.length ? Math.round(orders.filter((order) => order.orderStatus === 'delivered').length / orders.length * 100) : 0;
  document.querySelector('[data-report-stat="revenue"]').textContent = reportMoney(revenue);
  document.querySelector('[data-report-stat="orders"]').textContent = orders.length;
  document.querySelector('[data-report-stat="average"]').textContent = reportMoney(average);
  document.querySelector('[data-report-stat="delivered"]').textContent = `${delivered}%`;
  document.querySelector('[data-report-stat="revenue-change"]').textContent = revenue ? 'Refundlar chiqarib tashlangan' : 'Hali savdo yo‘q';
  document.querySelector('[data-report-stat="orders-change"]').textContent = `${revenueOrders.length} ta hisobga olingan`;
  document.querySelector('[data-report-stat="average-change"]').textContent = 'Buyurtma boshiga';
  document.querySelector('[data-report-stat="delivered-change"]').textContent = 'Yetkazib berilgan ulush';
  document.querySelector('#report-updated').textContent = `Oxirgi yangilanish: ${profileDateTime(new Date())}`;

  const daily = {};
  revenueOrders.forEach((order) => { const key = profileDate(order.reportDate).slice(0, 5); daily[key] = (daily[key] || 0) + Number(order.amount || 0); });
  const chartEntries = Object.entries(daily).slice(-7);
  const max = Math.max(...chartEntries.map(([, value]) => value), 1);
  document.querySelector('#report-revenue-chart').innerHTML = chartEntries.map(([label, value]) => `<div class="report-bar-column"><span>${reportMoney(value).replace(' so‘m', '')}</span><i style="height:${Math.max(8, value / max * 100)}%"></i><small>${label}</small></div>`).join('') || '<p class="muted">Diagramma uchun ma’lumot yetarli emas.</p>';

  const statuses = [['Jarayonda', orders.filter((order) => order.orderStatus === 'processing').length, 'gold'], ['Yetkazilgan', orders.filter((order) => order.orderStatus === 'delivered').length, 'green'], ['Bekor qilingan', orders.filter((order) => order.orderStatus === 'cancelled').length, 'red']];
  renderReportBreakdown('#report-status-breakdown', statuses, orders.length);
  const payments = {};
  orders.forEach((order) => { const label = order.payment || 'Noma’lum'; payments[label] = (payments[label] || 0) + 1; });
  renderReportBreakdown('#report-payment-breakdown', Object.entries(payments), orders.length);

  const products = {};
  orders.forEach((order) => (order.items || []).forEach((item) => { products[item.name || item.id] = (products[item.name || item.id] || 0) + Number(item.quantity || item.qty || 1); }));
  const ranked = Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, 5);
  document.querySelector('#report-products-ranking').innerHTML = ranked.map(([name, count], index) => `<div class="ranking-row"><span>0${index + 1}</span><strong>${name}</strong><b>${count} dona</b></div>`).join('') || adminProducts.slice(0, 5).map((product, index) => `<div class="ranking-row"><span>0${index + 1}</span><strong>${product.name}</strong><b>${product.stock} stok</b></div>`).join('');
}

function exportReports() {
  const days = document.querySelector('#report-period').value;
  const orders = getReportOrders(days);
  const rows = orders.map((order) => [order.id, profileDate(order.reportDate), order.customer, order.amount, order.payment, order.paymentStatus, order.orderStatus]);
  const csv = [['Buyurtma', 'Sana', 'Mijoz', 'Summa', 'To‘lov', 'To‘lov holati', 'Buyurtma holati'], ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' })); link.download = 'noxar-hisobot.csv'; link.click(); URL.revokeObjectURL(link.href); showToast('Hisobot CSV fayliga eksport qilindi');
}

const defaultAdminProfile = {
  fullName: 'Admin', username: 'noxar.admin', email: 'admin@noxar.uz', phone: '+998 90 123 45 67', role: 'Super Admin', status: 'active', bio: 'NOXAR PARFUM boshqaruv panelining asosiy administratori.', avatar: '', createdAt: '2025-01-15T09:00:00', lastLogin: new Date().toISOString(), totalLogins: 128, twoFactor: true,
  notifications: { email: true, push: true, sms: false, marketing: false, security: true },
  preferences: { theme: 'dark', language: 'O‘zbekcha', timezone: 'Asia/Tashkent (UTC+5)', dateFormat: 'DD.MM.YYYY', dashboard: 'compact' },
  sessions: [{ device: 'Windows · Chrome', location: 'Tashkent, UZ', lastActive: 'Hozir', current: true }, { device: 'Android · Chrome', location: 'Tashkent, UZ', lastActive: '2 kun oldin', current: false }],
  logs: [{ action: 'Muvaffaqiyatli kirish', detail: 'Windows · Chrome · Tashkent', time: 'Bugun, 08:48' }, { action: '2FA yoqildi', detail: 'Security settings', time: 'Kecha, 19:22' }], connectedAccounts: {}, tokens: []
};

function getAdminProfile() {
  try { return { ...defaultAdminProfile, ...JSON.parse(localStorage.getItem('noxar-admin-profile') || '{}') }; } catch (error) { return { ...defaultAdminProfile }; }
}
function saveAdminProfile(profile) { localStorage.setItem('noxar-admin-profile', JSON.stringify(profile)); }
function profileDate(value) { if (!value) return '—'; const date = new Date(value); return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`; }
function profileDateTime(value) { if (!value) return '—'; const date = new Date(value); return `${profileDate(value)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; }
function calculateProfileCompletion(profile) {
  return Math.round(['fullName', 'username', 'email', 'phone', 'role', 'bio', 'avatar'].reduce((score, key) => score + (profile[key] ? 1 : 0), 0) / 7 * 100);
}
function profileSecurityScore(profile) { return Math.min(100, (profile.twoFactor ? 35 : 0) + (profile.email ? 20 : 0) + (profile.phone ? 20 : 0) + (profile.preferences?.theme ? 15 : 0) + (profile.sessions?.length ? 10 : 0)); }
function renderAdminProfile() {
  const profile = getAdminProfile();
  const completion = calculateProfileCompletion(profile);
  const score = profileSecurityScore(profile);
  document.querySelectorAll('[data-profile-name], [data-profile-hero-name]').forEach((element) => { element.textContent = profile.fullName; });
  document.querySelector('[data-profile-role]').textContent = profile.role;
  document.querySelector('[data-profile-status]').textContent = profile.status[0].toUpperCase() + profile.status.slice(1);
  document.querySelector('[data-profile-status]').className = `profile-status ${profile.status}`;
  document.querySelector('[data-profile-bio]').textContent = profile.bio || 'Bio hali kiritilmagan.';
  document.querySelector('[data-profile-last-login]').textContent = profileDateTime(profile.lastLogin);
  document.querySelector('[data-profile-created]').textContent = profileDate(profile.createdAt);
  document.querySelector('[data-profile-completion]').textContent = `${completion}%`;
  document.querySelector('[data-profile-progress]').style.width = `${completion}%`;
  document.querySelector('[data-profile-stat="logins"]').textContent = profile.totalLogins || 0;
  document.querySelector('[data-profile-stat="score"]').textContent = `${score}%`;
  document.querySelector('[data-profile-stat="actions"]').textContent = `${Math.round(completion / 20)}/5`;
  document.querySelector('[data-profile-stat="usage"]').textContent = `${Math.min(99, 62 + Math.round(completion / 5))}%`;
  document.querySelector('[data-security-score]').textContent = `${score}%`;
  const avatar = document.querySelector('[data-profile-avatar]'); const fallback = document.querySelector('[data-profile-avatar-fallback]');
  avatar.hidden = !profile.avatar; fallback.hidden = Boolean(profile.avatar); if (profile.avatar) avatar.src = profile.avatar;
  const form = document.querySelector('#profile-details-form');
  Object.entries({ fullName: profile.fullName, username: profile.username, email: profile.email, phone: profile.phone, role: profile.role, status: profile.status, bio: profile.bio }).forEach(([key, value]) => { form.elements[key].value = value || ''; });
  const notificationForm = document.querySelector('#profile-notification-form');
  Object.entries(profile.notifications || defaultAdminProfile.notifications).forEach(([key, value]) => { if (notificationForm.elements[key]) notificationForm.elements[key].checked = Boolean(value); });
  const preferenceForm = document.querySelector('#profile-preferences-form');
  Object.entries(profile.preferences || defaultAdminProfile.preferences).forEach(([key, value]) => { if (preferenceForm.elements[key]) preferenceForm.elements[key].value = value; });
  document.querySelector('[data-security-toggle="twoFactor"]').checked = Boolean(profile.twoFactor);
  document.querySelector('[data-session-list]').innerHTML = (profile.sessions || []).map((session) => `<div class="session-row"><span class="session-icon">⌁</span><div><strong>${session.device}</strong><small>${session.location} · ${session.lastActive}</small></div><b>${session.current ? 'Joriy' : 'Faol'}</b></div>`).join('');
  document.querySelector('[data-security-logs]').innerHTML = (profile.logs || []).map((log) => `<div class="security-log"><span>✓</span><div><strong>${log.action}</strong><small>${log.detail}</small></div><time>${log.time}</time></div>`).join('');
  document.querySelectorAll('[data-connect-account]').forEach((button) => { const connected = Boolean(profile.connectedAccounts?.[button.dataset.connectAccount]); button.previousElementSibling.textContent = connected ? 'Ulangan' : 'Ulanmagan'; button.textContent = connected ? 'Uzish' : 'Ulash'; });
  document.querySelector('[data-token-list]').innerHTML = (profile.tokens || []).map((token) => `<div class="connected-row"><strong>${token.name}</strong><span>${token.created}</span><button class="table-action" data-revoke-token="${token.id}" type="button">Bekor qilish</button></div>`).join('') || '<p class="muted">Hali token yaratilmagan.</p>';
}
function addProfileLog(profile, action, detail) { profile.logs = [{ action, detail, time: 'Hozir' }, ...(profile.logs || [])].slice(0, 8); }
function formatAdminDate(date = new Date()) {
  const weekdays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  return `${weekdays[date.getDay()]}, ${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()}`;
}
function downloadProfileData() {
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(getAdminProfile(), null, 2)], { type: 'application/json' })); link.download = 'noxar-admin-profile.json'; link.click(); URL.revokeObjectURL(link.href); showToast('Shaxsiy ma’lumotlar yuklandi');
}

function renderDashboardDateFilter() {
  const saved = JSON.parse(localStorage.getItem('noxar-dashboard-date-range') || '{"key":"today","label":"Bugun"}');
  const button = document.querySelector('.date-filter');
  if (button) { button.childNodes[0].textContent = `${saved.label} `; button.setAttribute('aria-expanded', 'false'); }
}
function closeDateFilter() { const menu = document.querySelector('.date-filter-menu'); if (menu) { menu.hidden = true; document.querySelector('.date-filter').setAttribute('aria-expanded', 'false'); } }
function applyDashboardDateRange(key) {
  const labels = { today: 'Bugun', yesterday: 'Kecha', 7: 'So‘nggi 7 kun', 30: 'So‘nggi 30 kun', custom: 'Tanlangan davr' };
  if (key === 'custom') {
    const start = document.querySelector('[data-date-start]').value; const end = document.querySelector('[data-date-end]').value;
    if (!start || !end) return showToast('Boshlanish va tugash sanasini tanlang');
    if (end < start) return showToast('Tugash sanasi boshlanish sanasidan oldin bo‘lmasin');
  }
  localStorage.setItem('noxar-dashboard-date-range', JSON.stringify({ key, label: labels[key] }));
  renderDashboardDateFilter(); closeDateFilter(); showToast(`Dashboard davri: ${labels[key]}`);
}

const notificationNow = new Date();
const defaultNotifications = [
  { id: 'low-stock-alert', type: 'warning', title: 'Ombor ogohlantirishi', text: '3 ta mahsulot minimal qoldiq chegarasiga yetdi.', time: `Bugun, ${new Date(notificationNow.getTime() - 6 * 60000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`, read: false, view: 'inventory' },
  { id: 'new-order-alert', type: 'success', title: 'Yangi buyurtma qabul qilindi', text: 'NOX-179996 buyurtmasi muvaffaqiyatli qabul qilindi.', time: `Bugun, ${new Date(notificationNow.getTime() - 17 * 60000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`, read: false, view: 'orders' },
  { id: 'security-alert', type: 'security', title: 'Yangi qurilmadan kirish', text: 'Android qurilmasidan yangi session faollashdi.', time: 'Kecha', read: false, view: 'profile' },
  { id: 'review-alert', type: 'info', title: 'Yangi sharh kutilmoqda', text: 'Moderatsiya uchun yangi mijoz sharhi mavjud.', time: 'Kecha', read: true, view: 'reviews' }
];
function getNotifications() {
  try {
    const saved = JSON.parse(localStorage.getItem('noxar-admin-notifications') || 'null');
    if (!Array.isArray(saved)) return defaultNotifications;
    const defaultsById = Object.fromEntries(defaultNotifications.map((notification) => [notification.id, notification]));
    return saved.map((notification) => defaultsById[notification.id] ? { ...notification, time: defaultsById[notification.id].time } : notification);
  } catch (error) { return defaultNotifications; }
}
function saveNotifications(notifications) { localStorage.setItem('noxar-admin-notifications', JSON.stringify(notifications)); }
function renderNotifications(filter = document.querySelector('[data-notification-filter].active')?.dataset.notificationFilter || 'all') {
  const notifications = getNotifications();
  const visible = notifications.filter((notification) => filter !== 'unread' || !notification.read);
  const list = document.querySelector('[data-notification-list]');
  list.innerHTML = visible.map((notification) => `<article class="notification-item ${notification.read ? '' : 'unread'}" data-notification-id="${notification.id}" data-notification-view="${notification.view || ''}"><span class="notification-item-icon ${notification.type === 'security' ? 'security' : notification.type === 'success' ? 'success' : ''}">${notification.type === 'security' ? '!' : notification.type === 'success' ? '✓' : notification.type === 'warning' ? '!' : '✦'}</span><div class="notification-item-body"><strong>${notification.title}</strong><p>${notification.text}</p><time>${notification.time}</time></div>${notification.read ? '' : '<i class="notification-unread-dot"></i>'}</article>`).join('') || '<p class="notification-empty">Bildirishnomalar mavjud emas.</p>';
  document.querySelector('.notification-button b').textContent = notifications.filter((notification) => !notification.read).length;
  document.querySelector('.notification-button b').hidden = !notifications.some((notification) => !notification.read);
}
function toggleNotifications(open) {
  const panel = document.querySelector('.notification-panel');
  panel.hidden = open === undefined ? !panel.hidden : !open;
  if (!panel.hidden) renderNotifications();
}

function showToast(message) {
  const toast = document.querySelector('.admin-toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarBackdrop = document.querySelector('.sidebar-backdrop');

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('show');
  menuToggle.setAttribute('aria-expanded', 'false');
}

const viewLabels = {
  orders: ['Buyurtmalar', 'Buyurtmalarni ko‘rish, filtrlash va statuslarini boshqarish oynasi.'],
  customers: ['Mijozlar', 'Mijozlar profili va xarid tarixini boshqarish oynasi.'],
  inventory: ['Ombor', 'Mahsulot qoldig‘i va ombor harakatlarini boshqarish oynasi.'],
  payments: ['To‘lovlar', 'Click, Payme, Uzum Bank, karta va naqd demo to‘lovlari oynasi.'],
  promos: ['Promo-kodlar', 'Promo-kodlar va chegirmalarni boshqarish oynasi.'],
  reviews: ['Sharhlar', 'Mijozlar sharhlarini ko‘rib chiqish va moderatsiya qilish oynasi.'],
  campaigns: ['Bannerlar va aksiyalar', 'Banner va aksiyalarni boshqarish oynasi.'],
  reports: ['Hisobotlar', 'Savdo va faoliyat hisobotlari oynasi.'],
  profile: ['Admin profili', 'Shaxsiy ma’lumotlar, xavfsizlik va preferensiyalar oynasi.'],
  settings: ['Sozlamalar', 'Admin panel sozlamalari oynasi.']
};

function showView(view) {
  const main = document.querySelector('#admin-main');
  const dashboardParts = ['.welcome-row', '.stats-grid', '.dashboard-grid'];
  const productsSection = document.querySelector('#products');
  const ordersSection = document.querySelector('#orders-management');
  const customersSection = document.querySelector('#customers-management');
  const inventorySection = document.querySelector('#inventory-management');
  const paymentsSection = document.querySelector('#payments-management');
  const promosSection = document.querySelector('#promos-management');
  const reviewsSection = document.querySelector('#reviews-management');
  const campaignsSection = document.querySelector('#campaigns-management');
  const reportsSection = document.querySelector('#reports-management');
  const profileSection = document.querySelector('#profile-management');
  const placeholder = document.querySelector('#section-placeholder');
  const isDashboard = view === 'dashboard';
  const isProducts = view === 'products';
  const isOrders = view === 'orders';
  const isCustomers = view === 'customers';
  const isInventory = view === 'inventory';
  const isPayments = view === 'payments';
  const isPromos = view === 'promos';
  const isReviews = view === 'reviews';
  const isCampaigns = view === 'campaigns';
  const isReports = view === 'reports';
  const isProfile = view === 'profile';
  const viewTitles = { dashboard: 'Dashboard', products: 'Mahsulotlar', ...Object.fromEntries(Object.entries(viewLabels).map(([key, value]) => [key, value[0]])) };

  main.classList.toggle('view-dashboard', isDashboard);
  main.classList.toggle('view-products', isProducts);
  main.classList.toggle('view-orders', isOrders);
  main.classList.toggle('view-customers', isCustomers);
  main.classList.toggle('view-inventory', isInventory);
  main.classList.toggle('view-payments', isPayments);
  main.classList.toggle('view-promos', isPromos);
  main.classList.toggle('view-reviews', isReviews);
  main.classList.toggle('view-campaigns', isCampaigns);
  main.classList.toggle('view-reports', isReports);
  main.classList.toggle('view-profile', isProfile);
  document.querySelector('.topbar-title h1').textContent = viewTitles[view] || 'Admin panel';
  dashboardParts.forEach((selector) => {
    document.querySelector(selector).hidden = !isDashboard;
  });
  productsSection.hidden = !isProducts;
  ordersSection.hidden = !isOrders;
  customersSection.hidden = !isCustomers;
  inventorySection.hidden = !isInventory;
  paymentsSection.hidden = !isPayments;
  promosSection.hidden = !isPromos;
  reviewsSection.hidden = !isReviews;
  campaignsSection.hidden = !isCampaigns;
  reportsSection.hidden = !isReports;
  profileSection.hidden = !isProfile;
  placeholder.hidden = isDashboard || isProducts || isOrders || isCustomers || isInventory || isPayments || isPromos || isReviews || isCampaigns || isReports || isProfile;
  if (isPromos) renderPromos();
  if (isReviews) renderReviews();
  if (isCampaigns) renderCampaigns();
  if (isReports) renderReports();
  if (isProfile) renderAdminProfile();

  if (!isDashboard && !isProducts) {
    const [title, description] = viewLabels[view] || ['Bo‘lim', 'Bu bo‘lim keyingi bosqichda to‘ldiriladi.'];
    document.querySelector('#placeholder-title').textContent = title;
    document.querySelector('#placeholder-description').textContent = description;
  }

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.view === view);
  });
  history.replaceState(null, '', `#${view}`);
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

menuToggle.addEventListener('click', () => {
  if (window.innerWidth > 820) {
    const quickNav = document.querySelector('.quick-nav');
    const isOpen = quickNav.hasAttribute('hidden');
    quickNav.toggleAttribute('hidden', !isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    return;
  }
  const isOpen = sidebar.classList.toggle('open');
  sidebarBackdrop.classList.toggle('show', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
sidebarBackdrop.addEventListener('click', closeSidebar);
document.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  showView(link.dataset.view || 'dashboard');
}));
document.querySelectorAll('.quick-nav [data-view]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('.quick-nav').hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  showView(link.dataset.view || 'dashboard');
}));
document.querySelector('[data-placeholder-dashboard]').addEventListener('click', () => showView('dashboard'));
function openLogoutModal() { document.querySelector('.logout-modal').classList.add('open'); document.querySelector('.logout-modal').setAttribute('aria-hidden', 'false'); }
function closeLogoutModal() { document.querySelector('.logout-modal').classList.remove('open'); document.querySelector('.logout-modal').setAttribute('aria-hidden', 'true'); }
function completeLogout() {
  const profile = getAdminProfile(); profile.sessions = (profile.sessions || []).filter((session) => !session.current); addProfileLog(profile, 'Admin tizimdan chiqdi', 'Session management'); saveAdminProfile(profile);
  localStorage.setItem('noxar-admin-session', JSON.stringify({ loggedOut: true, loggedOutAt: new Date().toISOString() }));
  closeLogoutModal(); document.querySelector('.admin-shell').hidden = true; document.querySelector('.logged-out-screen').hidden = false; showToast('Tizimdan muvaffaqiyatli chiqildi');
}
document.querySelector('.logout-link').addEventListener('click', openLogoutModal);
document.querySelectorAll('[data-close-logout]').forEach((element) => element.addEventListener('click', closeLogoutModal));
document.querySelector('[data-confirm-logout]').addEventListener('click', completeLogout);
document.querySelector('[data-demo-login]').addEventListener('click', () => { localStorage.removeItem('noxar-admin-session'); document.querySelector('.admin-shell').hidden = false; document.querySelector('.logged-out-screen').hidden = true; showToast('Demo session qayta tiklandi'); });
document.querySelector('.notification-button').addEventListener('click', () => showToast('3 ta yangi bildirishnoma mavjud.'));
document.querySelector('.date-filter').addEventListener('click', () => { const menu = document.querySelector('.date-filter-menu'); menu.hidden = !menu.hidden; document.querySelector('.date-filter').setAttribute('aria-expanded', String(!menu.hidden)); });
document.querySelectorAll('[data-date-range]').forEach((button) => button.addEventListener('click', () => applyDashboardDateRange(button.dataset.dateRange)));
document.addEventListener('click', (event) => { if (!event.target.closest('.date-filter-wrap')) closeDateFilter(); });
document.querySelector('.panel-link').addEventListener('click', () => showToast('Buyurtmalar bo‘limi keyingi bosqichda ulanadi.'));
document.querySelector('[data-dashboard-inventory]').addEventListener('click', () => showView('inventory'));
document.querySelectorAll('#product-search, #product-category-filter, #product-gender-filter, #product-stock-filter').forEach((control) => control.addEventListener('input', () => {
  productsPage = 1;
  renderProducts();
}));
document.querySelector('.products-pagination').addEventListener('click', (event) => {
  const button = event.target.closest('[data-page-action]');
  if (!button || button.disabled) return;
  productsPage += button.dataset.pageAction === 'next' ? 1 : -1;
  renderProducts();
});
document.querySelectorAll('#order-search, #order-payment-filter, #order-status-filter').forEach((control) => control.addEventListener('input', () => renderManagedOrders()));
document.querySelectorAll('#customer-search, #customer-segment-filter').forEach((control) => control.addEventListener('input', renderCustomers));
document.querySelectorAll('#inventory-search, #inventory-stock-filter').forEach((control) => control.addEventListener('input', renderInventory));
document.querySelector('#inventory-threshold').addEventListener('change', (event) => { localStorage.setItem('noxar-inventory-threshold', event.target.value); renderInventory(); });
document.querySelector('[data-refresh-inventory]').addEventListener('click', () => { renderInventory(); showToast('Ombor yangilandi'); });
document.querySelector('[data-export-inventory]').addEventListener('click', exportInventory);
document.querySelector('#inventory-table-body').addEventListener('click', (event) => {
const button = event.target.closest('[data-inventory-id]');
if (button) adjustInventory(button.dataset.inventoryId, button.classList.contains('inventory-in') ? 1 : -1);
});
document.querySelectorAll('#payment-search, #payment-method-filter, #payment-status-filter').forEach((control) => control.addEventListener('input', renderPayments));
document.querySelector('[data-refresh-payments]').addEventListener('click', () => { renderPayments(); showToast('To‘lovlar yangilandi'); });
document.querySelector('[data-export-payments]').addEventListener('click', exportPayments);
document.querySelector('#payments-table-body').addEventListener('click', (event) => {
  const statusButton = event.target.closest('.payment-status-action');
  const refundButton = event.target.closest('.payment-refund-action');
  if (statusButton) updatePaymentStatus(statusButton.dataset.paymentId, statusButton.dataset.paymentStatus);
  if (refundButton && window.confirm('Ushbu to‘lovni qaytarilgan deb belgilaysizmi?')) updatePaymentStatus(refundButton.dataset.paymentId, 'refunded');
});
document.querySelectorAll('#promo-search, #promo-status-filter').forEach((control) => control.addEventListener('input', renderPromos));
document.querySelector('[data-new-promo]').addEventListener('click', () => openPromoForm());
document.querySelector('[data-cancel-promo]').addEventListener('click', closePromoForm);
document.querySelector('[data-export-promos]').addEventListener('click', exportPromos);
document.querySelector('#promo-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const promos = getPromos();
  const promo = { id: String(data.get('id') || `promo-${Date.now()}`), code: String(data.get('code')).trim().toUpperCase(), type: String(data.get('type')), value: Number(data.get('value')), minOrder: Number(data.get('minOrder')) || 0, expires: String(data.get('expires') || ''), limit: Number(data.get('limit')) || 0, note: String(data.get('note') || '').trim(), used: promos.find((item) => item.id === data.get('id'))?.used || 0, active: true };
  if (!promo.code || promo.value <= 0) return showToast('Promo-kod va chegirma qiymatini kiriting');
  if (promos.some((item) => item.code === promo.code && item.id !== promo.id)) return showToast('Bu promo-kod allaqachon mavjud');
  const next = promos.some((item) => item.id === promo.id) ? promos.map((item) => item.id === promo.id ? promo : item) : [promo, ...promos];
  savePromos(next); closePromoForm(); renderPromos(); showToast('Promo-kod saqlandi');
});
document.querySelector('#promos-table-body').addEventListener('click', (event) => {
  const button = event.target.closest('[data-promo-id]');
  if (!button) return;
  const promos = getPromos();
  const promo = promos.find((item) => item.id === button.dataset.promoId);
  if (button.classList.contains('edit-promo')) openPromoForm(promo);
  if (button.classList.contains('toggle-promo')) { promo.active = !promo.active; savePromos(promos); renderPromos(); showToast(promo.active ? 'Promo-kod yoqildi' : 'Promo-kod o‘chirildi'); }
  if (button.classList.contains('delete-promo') && window.confirm('Promo-kodni o‘chirishni tasdiqlaysizmi?')) { savePromos(promos.filter((item) => item.id !== promo.id)); renderPromos(); showToast('Promo-kod o‘chirildi'); }
});
document.querySelectorAll('#review-search, #review-status-filter, #review-rating-filter').forEach((control) => control.addEventListener('input', renderReviews));
document.querySelector('[data-refresh-reviews]').addEventListener('click', () => { renderReviews(); showToast('Sharhlar yangilandi'); });
document.querySelector('[data-export-reviews]').addEventListener('click', exportReviews);
document.querySelector('#reviews-table-body').addEventListener('click', (event) => {
  const button = event.target.closest('[data-review-id]');
  if (!button) return;
  if (button.classList.contains('review-delete') && window.confirm('Sharhni o‘chirishni tasdiqlaysizmi?')) {
    saveAdminReviews(getAdminReviews().filter((review) => review.id !== button.dataset.reviewId));
    renderReviews();
    showToast('Sharh o‘chirildi');
    return;
  }
  const status = button.classList.contains('review-approve') ? 'approved' : button.classList.contains('review-reject') ? 'rejected' : 'pending';
  updateReviewStatus(button.dataset.reviewId, status);
});
document.querySelectorAll('#campaign-search, #campaign-type-filter, #campaign-status-filter').forEach((control) => control.addEventListener('input', renderCampaigns));
document.querySelector('[data-new-campaign]').addEventListener('click', () => openCampaignForm());
document.querySelector('[data-cancel-campaign]').addEventListener('click', () => { document.querySelector('#campaign-form').hidden = true; });
document.querySelector('[data-export-campaigns]').addEventListener('click', exportCampaigns);
document.querySelectorAll('#campaign-form input, #campaign-form select').forEach((control) => control.addEventListener('input', updateCampaignPreview));
document.querySelector('#campaign-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const campaigns = getCampaigns();
  const campaign = { id: String(data.get('id') || `campaign-${Date.now()}`), type: String(data.get('type')), title: String(data.get('title')).trim(), text: String(data.get('text')).trim(), cta: String(data.get('cta') || '').trim(), link: String(data.get('link') || '#new').trim(), promo: String(data.get('promo') || '').trim().toUpperCase(), starts: String(data.get('starts') || ''), ends: String(data.get('ends') || ''), theme: String(data.get('theme')), image: String(data.get('image') || '').trim(), active: true };
  if (!campaign.title || !campaign.text) return showToast('Sarlavha va aksiya matnini kiriting');
  if (campaign.ends && campaign.starts && campaign.ends < campaign.starts) return showToast('Tugash sanasi boshlanish sanasidan oldin bo‘lmasin');
  const next = campaigns.some((item) => item.id === campaign.id) ? campaigns.map((item) => item.id === campaign.id ? { ...item, ...campaign } : item) : [campaign, ...campaigns];
  saveCampaigns(next); form.hidden = true; renderCampaigns(); showToast('Kampaniya saqlandi');
});
document.querySelector('#campaigns-table-body').addEventListener('click', (event) => {
  const button = event.target.closest('[data-campaign-id]');
  if (!button) return;
  const campaigns = getCampaigns();
  const campaign = campaigns.find((item) => item.id === button.dataset.campaignId);
  if (button.classList.contains('edit-campaign')) openCampaignForm(campaign);
  if (button.classList.contains('toggle-campaign')) { campaign.active = !campaign.active; saveCampaigns(campaigns); renderCampaigns(); showToast(campaign.active ? 'Kampaniya yoqildi' : 'Kampaniya o‘chirildi'); }
  if (button.classList.contains('delete-campaign') && window.confirm('Kampaniyani o‘chirishni tasdiqlaysizmi?')) { saveCampaigns(campaigns.filter((item) => item.id !== campaign.id)); renderCampaigns(); showToast('Kampaniya o‘chirildi'); }
});
document.querySelector('#report-period').addEventListener('change', renderReports);
document.querySelector('[data-refresh-reports]').addEventListener('click', () => { renderReports(); showToast('Hisobotlar yangilandi'); });
document.querySelector('[data-export-reports]').addEventListener('click', exportReports);
document.querySelector('.notification-button').addEventListener('click', () => toggleNotifications());
document.querySelector('[data-close-notifications]').addEventListener('click', () => toggleNotifications(false));
document.querySelectorAll('[data-notification-filter]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-notification-filter]').forEach((item) => item.classList.remove('active')); button.classList.add('active'); renderNotifications(button.dataset.notificationFilter);
}));
document.querySelector('[data-mark-notifications]').addEventListener('click', () => { saveNotifications(getNotifications().map((notification) => ({ ...notification, read: true }))); renderNotifications(); showToast('Barcha bildirishnomalar o‘qildi'); });
document.querySelector('[data-clear-notifications]').addEventListener('click', () => { saveNotifications([]); renderNotifications(); showToast('Bildirishnomalar tozalandi'); });
document.querySelector('[data-notification-list]').addEventListener('click', (event) => {
  const item = event.target.closest('[data-notification-id]'); if (!item) return;
  const notifications = getNotifications(); const notification = notifications.find((entry) => entry.id === item.dataset.notificationId);
  if (notification) { notification.read = true; saveNotifications(notifications); renderNotifications(); if (notification.view) { toggleNotifications(false); showView(notification.view); } }
});
document.addEventListener('click', (event) => { const panel = document.querySelector('.notification-panel'); if (!panel.hidden && !event.target.closest('.notification-panel, .notification-button')) toggleNotifications(false); });
document.querySelector('.admin-profile').addEventListener('click', () => showView('profile'));
document.querySelectorAll('[data-profile-tab]').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-profile-tab], [data-profile-panel]').forEach((element) => element.classList.remove('active'));
  document.querySelectorAll('[data-profile-panel]').forEach((panel) => { panel.hidden = panel.dataset.profilePanel !== tab.dataset.profileTab; });
  tab.classList.add('active'); document.querySelector(`[data-profile-panel="${tab.dataset.profileTab}"]`).classList.add('active');
}));
document.querySelector('#profile-details-form').addEventListener('submit', (event) => {
  event.preventDefault(); const form = event.currentTarget; const profile = getAdminProfile();
  Object.assign(profile, { fullName: form.elements.fullName.value.trim(), username: form.elements.username.value.trim(), email: form.elements.email.value.trim(), phone: form.elements.phone.value.trim(), role: form.elements.role.value.trim(), status: form.elements.status.value, bio: form.elements.bio.value.trim() });
  addProfileLog(profile, 'Profil ma’lumotlari yangilandi', 'Profile settings'); saveAdminProfile(profile); renderAdminProfile(); showToast('Profil ma’lumotlari saqlandi');
});
document.querySelector('#profile-password-form').addEventListener('submit', (event) => {
  event.preventDefault(); const form = event.currentTarget;
  if (form.elements.next.value !== form.elements.confirm.value) return showToast('Yangi parollar mos kelmadi');
  const profile = getAdminProfile(); addProfileLog(profile, 'Parol yangilandi', 'Security settings'); saveAdminProfile(profile); form.reset(); renderAdminProfile(); showToast('Parol muvaffaqiyatli yangilandi');
});
document.querySelector('[data-security-toggle="twoFactor"]').addEventListener('change', (event) => { const profile = getAdminProfile(); profile.twoFactor = event.target.checked; addProfileLog(profile, event.target.checked ? '2FA yoqildi' : '2FA o‘chirildi', 'Security settings'); saveAdminProfile(profile); renderAdminProfile(); showToast(event.target.checked ? '2FA yoqildi' : '2FA o‘chirildi'); });
document.querySelector('#profile-notification-form').addEventListener('submit', (event) => { event.preventDefault(); const form = event.currentTarget; const profile = getAdminProfile(); profile.notifications = Object.fromEntries(['email', 'push', 'sms', 'marketing', 'security'].map((key) => [key, form.elements[key].checked])); saveAdminProfile(profile); showToast('Bildirishnoma sozlamalari saqlandi'); });
document.querySelector('#profile-preferences-form').addEventListener('submit', (event) => { event.preventDefault(); const form = event.currentTarget; const profile = getAdminProfile(); profile.preferences = Object.fromEntries(['theme', 'language', 'timezone', 'dateFormat', 'dashboard'].map((key) => [key, form.elements[key].value])); saveAdminProfile(profile); showToast('Preferensiyalar saqlandi'); });
document.querySelector('#profile-avatar-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) return showToast('Avatar hajmi 2 MB dan oshmasin'); const reader = new FileReader(); reader.addEventListener('load', () => { const profile = getAdminProfile(); profile.avatar = String(reader.result); addProfileLog(profile, 'Profil rasmi almashtirildi', 'Profile settings'); saveAdminProfile(profile); renderAdminProfile(); showToast('Profil rasmi yangilandi'); }); reader.readAsDataURL(file); });
document.querySelector('[data-remove-avatar]').addEventListener('click', () => { const profile = getAdminProfile(); profile.avatar = ''; saveAdminProfile(profile); renderAdminProfile(); showToast('Profil rasmi o‘chirildi'); });
document.querySelector('[data-logout-all]').addEventListener('click', () => { const profile = getAdminProfile(); profile.sessions = (profile.sessions || []).filter((session) => session.current); addProfileLog(profile, 'Barcha boshqa qurilmalardan chiqildi', 'Session management'); saveAdminProfile(profile); renderAdminProfile(); showToast('Barcha boshqa sessionlar yopildi'); });
document.querySelector('[data-download-data]').addEventListener('click', downloadProfileData);
document.querySelector('[data-delete-account]').addEventListener('click', () => { if (window.confirm('Account o‘chirish so‘rovini yuborishni tasdiqlaysizmi?')) showToast('Account o‘chirish so‘rovi yuborildi'); });
document.querySelectorAll('[data-connect-account]').forEach((button) => button.addEventListener('click', () => { const profile = getAdminProfile(); profile.connectedAccounts = { ...(profile.connectedAccounts || {}), [button.dataset.connectAccount]: !profile.connectedAccounts?.[button.dataset.connectAccount] }; saveAdminProfile(profile); renderAdminProfile(); showToast(`${button.dataset.connectAccount} akkaunti yangilandi`); }));
document.querySelector('[data-create-token]').addEventListener('click', () => { const profile = getAdminProfile(); profile.tokens = [...(profile.tokens || []), { id: `token-${Date.now()}`, name: `NOXAR API · ${(profile.tokens || []).length + 1}`, created: profileDate(new Date()) }]; saveAdminProfile(profile); renderAdminProfile(); showToast('Yangi API token yaratildi (demo)'); });
document.querySelector('[data-token-list]').addEventListener('click', (event) => { const button = event.target.closest('[data-revoke-token]'); if (!button) return; const profile = getAdminProfile(); profile.tokens = (profile.tokens || []).filter((token) => token.id !== button.dataset.revokeToken); saveAdminProfile(profile); renderAdminProfile(); showToast('API token bekor qilindi'); });
document.querySelector('#inventory-threshold').value = String(getInventoryThreshold());
document.querySelector('#inventory-table-body').addEventListener('change', (event) => {
  const input = event.target.closest('[data-inventory-threshold]');
  if (!input) return;
  const thresholds = JSON.parse(localStorage.getItem('noxar-inventory-thresholds') || '{}');
  thresholds[input.dataset.inventoryThreshold] = Math.max(0, Number(input.value) || 0);
  localStorage.setItem('noxar-inventory-thresholds', JSON.stringify(thresholds));
  renderInventory();
  renderPayments();
  renderPromos();
  renderReviews();
  renderCampaigns();
});
document.querySelector('[data-refresh-customers]').addEventListener('click', () => { renderCustomers(); showToast('Mijozlar yangilandi'); });
document.querySelector('#customers-table-body').addEventListener('click', (event) => {
  const button = event.target.closest('.view-customer');
  if (button) openCustomerDetails(getCustomers().find((customer) => customer.id === button.dataset.customerId));
  const toggle = event.target.closest('.toggle-customer');
  if (toggle) {
    const customer = getCustomers().find((item) => item.id === toggle.dataset.customerId);
    saveCustomerMeta(customer.id, { blocked: customer.segment !== 'blocked' });
    renderCustomers();
    showToast(customer.segment === 'blocked' ? 'Mijoz blokdan chiqarildi' : 'Mijoz bloklandi');
  }
});
document.querySelectorAll('[data-close-customer-modal]').forEach((element) => element.addEventListener('click', closeCustomerDetails));
document.querySelector('[data-export-customers]').addEventListener('click', exportCustomers);
document.querySelector('#customer-edit-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  saveCustomerMeta(form.elements.id.value, {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim() || '—',
    phone: form.elements.phone.value.trim() || '—',
    birthday: form.elements.birthday.value,
    address: form.elements.address.value.trim(),
    note: form.elements.note.value.trim(),
    promo: form.elements.promo.value.trim(),
    level: form.elements.level.value,
    vip: form.elements.vip.checked
  });
  closeCustomerDetails();
  renderCustomers();
  showToast('Mijoz profili saqlandi');
});
document.querySelector('[data-customer-message]').addEventListener('click', () => showToast('Demo xabar yuborildi'));
document.querySelector('[data-refresh-orders]').addEventListener('click', () => { renderOrders(); showToast('Buyurtmalar yangilandi'); });
document.querySelector('#orders-table-body').addEventListener('change', (event) => {
  const control = event.target.closest('[data-order-field]');
  if (control) saveOrderStatus(control.dataset.orderId, control.dataset.orderField, control.value);
});
document.querySelector('#orders-table-body').addEventListener('click', (event) => {
  const button = event.target.closest('.view-order');
  if (button) openOrderDetails(getAllOrders().find((order) => order.id === button.dataset.orderId));
});
document.querySelectorAll('[data-close-order-modal]').forEach((element) => element.addEventListener('click', closeOrderDetails));
document.querySelector('.add-product-button').addEventListener('click', () => openProductForm());
document.querySelector('#products-table-body').addEventListener('click', (event) => {
  const editButton = event.target.closest('.edit-product');
  const deleteButton = event.target.closest('.delete-product');
  if (editButton) openProductForm(adminProducts.find((product) => product.id === editButton.dataset.productId));
  if (deleteButton) {
    if (!window.confirm('Bu mahsulotni o‘chirishni tasdiqlaysizmi?')) return;
    const deletedProducts = JSON.parse(localStorage.getItem('noxar-deleted-products') || '[]');
    if (!deletedProducts.includes(deleteButton.dataset.productId)) deletedProducts.push(deleteButton.dataset.productId);
    localStorage.setItem('noxar-deleted-products', JSON.stringify(deletedProducts));
    adminProducts = adminProducts.filter((product) => product.id !== deleteButton.dataset.productId);
    saveAdminProducts();
    renderProducts();
    renderInventory();
    showToast('Mahsulot o‘chirildi');
  }
});
document.querySelector('.admin-product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const existingId = String(data.get('id') || '');
  const imageFile = data.get('image');
  const videoFile = data.get('video');
  if (!validateMediaFile(imageFile, 'image') || !validateMediaFile(videoFile, 'video')) return;
  const image = imageFile instanceof File && imageFile.size ? await readFileAsDataUrl(imageFile) : form.dataset.currentImage || '';
  const video = videoFile instanceof File && videoFile.size ? await readFileAsDataUrl(videoFile) : form.dataset.currentVideo || '';
  const product = {
    id: existingId || `admin-${Date.now()}`,
    name: String(data.get('name')).trim(),
    brand: String(data.get('brand')).trim(),
    amount: Number(data.get('amount')),
    stock: Number(data.get('stock')),
    category: String(data.get('category')),
    gender: String(data.get('gender')),
    family: String(data.get('family')),
    notes: String(data.get('notes')).trim(),
    image,
    video
  };
  if (existingId) adminProducts = adminProducts.map((item) => item.id === existingId ? product : item);
  else adminProducts.unshift(product);
  const deletedProducts = JSON.parse(localStorage.getItem('noxar-deleted-products') || '[]');
  localStorage.setItem('noxar-deleted-products', JSON.stringify(deletedProducts.filter((id) => id !== product.id)));
  saveAdminProducts();
  renderProducts();
  renderInventory();
  closeProductForm();
  showToast(existingId ? 'Mahsulot yangilandi' : 'Mahsulot qo‘shildi');
});
document.querySelector('input[name="image"]').addEventListener('change', (event) => {
  const file = event.currentTarget.files[0];
  if (validateMediaFile(file, 'image')) renderMediaPreview(file ? URL.createObjectURL(file) : '', document.querySelector('input[name="video"]').files[0] ? URL.createObjectURL(document.querySelector('input[name="video"]').files[0]) : '');
  else event.currentTarget.value = '';
});
document.querySelector('input[name="video"]').addEventListener('change', (event) => {
  const file = event.currentTarget.files[0];
  if (validateMediaFile(file, 'video')) renderMediaPreview(document.querySelector('input[name="image"]').files[0] ? URL.createObjectURL(document.querySelector('input[name="image"]').files[0]) : '', file ? URL.createObjectURL(file) : '');
  else event.currentTarget.value = '';
});
document.querySelectorAll('[data-close-product-modal]').forEach((element) => element.addEventListener('click', closeProductForm));

renderOrders();
renderCustomers();
renderLowStock();
renderProducts();
renderInventory();
renderPayments();
renderReports();
renderAdminProfile();
renderNotifications();
renderDashboardDateFilter();
if (JSON.parse(localStorage.getItem('noxar-admin-session') || '{"loggedOut":false}').loggedOut) { document.querySelector('.admin-shell').hidden = true; document.querySelector('.logged-out-screen').hidden = false; }
document.querySelector('[data-admin-current-date]').textContent = formatAdminDate();
const initialView = document.querySelector(`.nav-link[data-view="${window.location.hash.slice(1)}"]`)?.dataset.view || 'dashboard';
showView(initialView);
