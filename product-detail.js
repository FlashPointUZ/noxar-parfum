/* NOXAR PARFUM — mahsulot sahifasi.
   Mahsulot havoladagi ?id= bo'yicha Supabase'dan olinadi, shuning uchun
   havolani istalgan odamga yuborsa bo'ladi. */

const esc = noxarEscape;
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const root = document.querySelector('#product-detail');
const GENDER_LABEL = { ayollar: 'Ayollar', erkaklar: 'Erkaklar', unisex: 'Uniseks' };

let product = null;
let reviews = [];

function paragraphs(text) {
  return esc(text).replace(/\r?\n/g, '<br>');
}

function volumeLabel(volume) {
  const value = String(volume || '').trim();
  if (!value) return '';
  if (/^\d+$/.test(value)) return `${value} ml`;
  if (/^set$/i.test(value)) return 'To‘plam';
  return value;
}

function starsText(rating) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function stockState() {
  if (product.stock === 0) return { text: '● Hozircha mavjud emas', cls: 'is-out' };
  if (product.stock <= 3) return { text: `● Faqat ${product.stock} ta qoldi`, cls: 'is-low' };
  return { text: '● Do‘konda mavjud', cls: '' };
}

/* ---------- Ma'lumotlarni yuklash ---------- */
async function fetchProduct(id) {
  const result = await noxarSupabase.from('products').select('*').eq('id', id);
  const row = Array.isArray(result.data) ? result.data[0] : null;
  return row || null;
}

async function fetchReviews(id) {
  try {
    const result = await noxarSupabase.from('reviews')
      .select('customer_name,rating,review_text,created_at')
      .eq('product_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('Sharhlarni yuklashda xatolik:', error);
    return [];
  }
}

function rememberViewed() {
  const list = noxarReadJSON('noxar-recent', []).map(String).filter((id) => id !== product.id);
  list.unshift(product.id);
  noxarWriteJSON('noxar-recent', list.slice(0, 8));
}

/* ---------- Holatlar ---------- */
function showEmpty(title, text, withRetry) {
  document.title = 'NOXAR PARFUM';
  root.innerHTML = `<section class="detail-empty"><h1>${esc(title)}</h1><p>${esc(text)}</p>${withRetry ? '<button class="button button-gold detail-retry" type="button">Qayta urinib ko‘rish</button> ' : ''}<a class="button button-gold product-back-button" href="index.html#catalog">← <span>Katalogga qaytish</span></a></section>`;
  root.querySelector('.detail-retry')?.addEventListener('click', init);
}

/* ---------- Sahifani chizish ---------- */
function renderPage() {
  const stock = stockState();
  const soldOut = product.stock === 0;
  const image = noxarSafeUrl(product.image);
  const video = noxarSafeUrl(product.video);
  const volume = volumeLabel(product.volume);
  const department = NOXAR_DEPARTMENT_LABEL[product.department] || 'Atirlar';
  const notes = [
    ['Yuqori nota', product.top],
    ['Yurak nota', product.heart],
    ['Baza nota', product.base]
  ];
  const hasNotes = notes.every(([, value]) => value);
  const features = [
    `Bo‘lim: ${department}`,
    `Kim uchun: ${GENDER_LABEL[product.gender]}`,
    `Brend: ${product.brand}`
  ];
  if (volume) features.push(`Hajmi: ${volume}`);

  document.title = `${product.name} — NOXAR PARFUM`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute('content', `${product.name} — ${noxarFormatPrice(product.amount)}. NOXAR PARFUM.`);

  root.innerHTML = `
    <div class="detail-breadcrumb">⌂ <a href="index.html">Bosh sahifa</a> <span>›</span> <a href="index.html#catalog">Katalog</a> <span>›</span> ${esc(product.name)}</div>
    <section class="detail-main">
      <div class="detail-gallery">
        <div class="detail-visual ${product.art}">${image ? `<img src="${image}" alt="${esc(product.name)}">` : '<div class="mini-bottle"><b>N</b></div>'}<span class="detail-stock ${stock.cls}">${stock.text}</span></div>
        ${video ? `<video class="detail-video" src="${video}" controls playsinline preload="metadata"></video>` : ''}
      </div>
      <article class="detail-content">
        <p class="eyebrow">${esc(department)} · ${GENDER_LABEL[product.gender]}</p><p class="catalog-brand">${esc(product.brand)}</p><h1>${esc(product.name)}</h1>
        <div class="detail-rating">${product.reviewCount ? `${starsText(product.rating)} <b>${product.rating.toFixed(1)}</b> <span>(${product.reviewCount} ta sharh)</span>` : '<span>Hali sharhlar yo‘q</span>'}</div>
        <strong class="detail-price">${product.oldAmount ? `<del class="detail-old-price">${noxarFormatPrice(product.oldAmount)}</del> ` : ''}${noxarFormatPrice(product.amount)}${product.discount ? ` <span class="detail-discount">-${product.discount}%</span>` : ''}</strong>
        ${volume ? `<div class="detail-size"><b>Hajmi</b><div><button type="button" class="selected" tabindex="-1">${esc(volume)}</button></div></div>` : ''}
        <div class="detail-contact-actions" aria-label="Mahsulot bo‘yicha harakatlar">
          <button class="detail-reservation detail-reservation-primary" type="button" data-reservation-type="Ajratib qo‘yish"${soldOut ? ' disabled' : ''}>🛍 Menga ajratib qo‘yish</button>
          <button class="detail-reservation" type="button" data-reservation-type="Do‘konda hidlab ko‘rish"${soldOut ? ' disabled' : ''}>👃 Do‘konda hidlab ko‘raman</button>
          <button class="detail-telegram" type="button">💬 Sotuvchidan so‘rash</button>
        </div>
        ${soldOut ? '<p class="detail-soldout-note">Bu mahsulot hozircha tugagan. Qachon kelishini sotuvchidan so‘rang.</p>' : ''}
        <div class="detail-action-row"><button class="detail-favorite" type="button"></button><button class="detail-share" type="button">↗ Ulashish</button></div>
        <div class="detail-trust"><span>✦ Original mahsulot<small>100% kafolat</small></span><span>↻ 14 kunlik qaytarish<small>Shartlar asosida</small></span></div>
      </article>
      <aside class="detail-aside"><div class="availability"><b class="${stock.cls}">${stock.text}</b><p>Bekbaraka bozori<br>12-qator, 2-blok<br>472-magazin yonida</p><a href="${esc(NOXAR_SHOP.mapsUrl)}" target="_blank" rel="noopener">Xaritada ko‘rish ↗</a></div><div class="aside-card"><b>Nega aynan shu atir?</b><p>◉ Original mahsulot<small>100% kafolat</small></p><p>✦ Do‘konda sinab ko‘ring<small>Real xarid do‘konda amalga oshadi</small></p><p>♧ Professional maslahat<small>Sotuvchilarimiz yordam beradi</small></p></div></aside>
    </section>
    <section class="detail-lower">
      <div class="detail-tabs" role="tablist"><button class="active" type="button" data-detail-tab="description" role="tab">Tavsif</button><button type="button" data-detail-tab="features" role="tab">Xususiyatlar</button><button type="button" data-detail-tab="reviews" role="tab">Sharhlar (<span class="review-count-tab">${product.reviewCount}</span>)</button></div>
      <div class="detail-tab-panel active" data-detail-panel="description"><div class="detail-description"><h2>Mahsulot haqida</h2><p>${product.description ? paragraphs(product.description) : 'Mahsulot haqida batafsil ma’lumotni do‘konda sotuvchidan olishingiz mumkin.'}</p>${!hasNotes && product.notes ? `<p><b>Asosiy notalar:</b> ${esc(product.notes)}</p>` : ''}</div>${hasNotes ? `<section class="detail-notes"><h2>Asosiy notalar</h2>${notes.map(([label, value]) => `<div><span>${label}</span><b>${esc(value)}</b></div>`).join('')}</section>` : ''}</div>
      <div class="detail-tab-panel" data-detail-panel="features"><section class="detail-features"><h2>Xususiyatlari</h2><ul>${features.map((feature) => `<li>${esc(feature)}</li>`).join('')}</ul></section></div>
      <div class="detail-tab-panel" data-detail-panel="reviews"><section class="detail-reviews"><h2>Mijozlar sharhlari (<span class="review-count">0</span>)</h2><div class="detail-review-list"></div>
        <form class="detail-review-form"><h3>Fikringizni qoldiring</h3><input name="name" placeholder="Ismingiz" required minlength="2" maxlength="60"><select name="rating" required><option value="">Bahoni tanlang</option><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select><textarea name="text" rows="4" placeholder="Mahsulot haqidagi fikringiz" required minlength="3" maxlength="800"></textarea><button class="button button-gold" type="submit">Sharh yuborish</button><small>Sharh admin tasdig‘idan keyin ko‘rinadi.</small></form>
      </section></div>
    </section>`;

  bindPage();
  renderReviews();
  updateFavoriteButton();
}

function renderReviews() {
  const section = document.querySelector('.detail-reviews');
  if (!section) return;
  section.querySelector('.detail-review-list').innerHTML = reviews.length
    ? reviews.map((review) => `<article class="detail-review"><div><strong>${esc(review.customer_name || 'Mijoz')}</strong><span>${starsText(Number(review.rating))}</span></div><p>${paragraphs(review.review_text)}</p></article>`).join('')
    : '<p class="reviews-empty">Hali tasdiqlangan sharhlar yo‘q. Birinchi bo‘lib fikr qoldiring.</p>';
  section.querySelector('.review-count').textContent = reviews.length;
  const tabCount = document.querySelector('.review-count-tab');
  if (tabCount) tabCount.textContent = reviews.length;
}

/* ---------- Sevimlilar ---------- */
function isFavorite() {
  return noxarReadJSON('noxar-wishlist', []).map(String).includes(product.id);
}
function toggleFavorite() {
  const list = noxarReadJSON('noxar-wishlist', []).map(String);
  const next = list.includes(product.id) ? list.filter((id) => id !== product.id) : [...list, product.id];
  noxarWriteJSON('noxar-wishlist', next);
}
function updateFavoriteButton() {
  const button = document.querySelector('.detail-favorite');
  if (button) button.textContent = isFavorite() ? '♥ Sevimlilardan olib tashlash' : '♡ Sevimliga qo‘shish';
}

/* ---------- So'rov (ajratib qo'yish / hidlab ko'rish) ---------- */
async function saveReservation(type, customer) {
  await noxarSupabase.from('reservations').insert({
    product_id: product.id,
    product_name: product.name,
    brand: product.brand,
    volume_ml: /^\d+$/.test(product.volume) ? Number(product.volume) : null,
    quantity: customer.quantity,
    request_type: type,
    customer_name: customer.name,
    customer_phone: customer.phone,
    status: 'pending'
  });
  const mine = noxarReadJSON('noxar-my-reservations', []);
  mine.unshift({ productId: product.id, productName: product.name, type, quantity: customer.quantity, createdAt: new Date().toISOString() });
  noxarWriteJSON('noxar-my-reservations', mine.slice(0, 20));
}

function openReservationForm(type, button) {
  document.querySelector('.reservation-dialog')?.remove();
  const maxQuantity = product.stock > 0 ? product.stock : 100;
  const dialog = document.createElement('dialog');
  dialog.className = 'reservation-dialog';
  dialog.innerHTML = `
    <form method="dialog" class="reservation-form">
      <button class="reservation-close" type="button" aria-label="Oynani yopish">×</button>
      <p class="eyebrow">NOXAR PARFUM</p>
      <h2>${esc(type)}</h2>
      <p class="reservation-summary">${esc(product.name)}${volumeLabel(product.volume) ? ` · ${esc(volumeLabel(product.volume))}` : ''}</p>
      <label>Ismingiz<input name="name" type="text" placeholder="Ismingizni kiriting" required minlength="2" maxlength="80" autocomplete="name"></label>
      <label>Telefon raqamingiz<input name="phone" type="tel" value="+998 " placeholder="+998 90 123 45 67" required maxlength="17" autocomplete="tel"></label>
      <label>Nechta olasiz? <span class="optional-label">(ixtiyoriy)</span><input name="quantity" type="number" min="1" max="${maxQuantity}" step="1" value="1"></label>
      <input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0;width:0">
      <button class="button button-gold reservation-submit" value="confirm" type="submit">So‘rov yuborish</button>
      <p class="reservation-note">Xodimimiz siz bilan bog‘lanadi. To‘lov do‘konda amalga oshiriladi.</p>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const phoneInput = form.elements.phone;
  dialog.querySelector('.reservation-close').addEventListener('click', () => dialog.close());
  phoneInput.addEventListener('input', () => {
    if (!phoneInput.value.startsWith('+998 ')) {
      phoneInput.value = `+998 ${phoneInput.value.replace(/^\+?998\s*/, '')}`;
    }
  });
  phoneInput.addEventListener('focus', () => phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length));
  dialog.addEventListener('close', () => dialog.remove(), { once: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('.reservation-submit');
    form.querySelector('.reservation-error')?.remove();
    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    if (phoneDigits.length !== 12) {
      phoneInput.setCustomValidity('Telefon raqamingizni to‘liq kiriting');
      phoneInput.reportValidity();
      phoneInput.setCustomValidity('');
      return;
    }
    const quantity = Math.min(maxQuantity, Math.max(1, Math.floor(Number(form.elements.quantity.value) || 1)));
    if (form.elements.website.value) { dialog.close(); return; } /* bot tuzog'i */
    submit.disabled = true;
    submit.textContent = 'Yuborilmoqda…';
    try {
      await saveReservation(type, { name: form.elements.name.value.trim(), phone: phoneInput.value.trim(), quantity });
    } catch (error) {
      console.error('Reservation save failed:', error);
      submit.disabled = false;
      submit.textContent = 'So‘rov yuborish';
      form.insertAdjacentHTML('beforeend', '<small class="reservation-error">So‘rovni yuborib bo‘lmadi. Qayta urinib ko‘ring yoki “Sotuvchidan so‘rash” tugmasi orqali Telegramda yozing.</small>');
      return;
    }
    dialog.close();
    button.textContent = '✓ So‘rov yuborildi';
    button.classList.add('is-saved');
    button.disabled = true;
  });
  dialog.showModal();
}

/* ---------- Tugmalar ---------- */
function bindPage() {
  document.querySelectorAll('.detail-reservation').forEach((button) => {
    button.addEventListener('click', () => openReservationForm(button.dataset.reservationType, button));
  });

  const tabs = document.querySelectorAll('[data-detail-tab]');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.toggle('active', item === tab));
    document.querySelectorAll('[data-detail-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.detailPanel === tab.dataset.detailTab));
  }));

  const reviewForm = document.querySelector('.detail-review-form');
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    form.querySelector('.review-message')?.remove();
    const name = form.elements.name.value.trim();
    const rating = Number(form.elements.rating.value);
    const text = form.elements.text.value.trim();
    const note = (message, cls) => form.insertAdjacentHTML('beforeend', `<small class="review-message ${cls}">${message}</small>`);
    if (name.length < 2 || !rating || text.length < 3) {
      note('Ism, baho va fikringizni to‘ldiring.', 'review-error');
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await noxarSupabase.from('reviews').insert({ product_id: product.id, customer_name: name, rating, review_text: text, status: 'pending' });
      form.reset();
      note('Sharhingiz yuborildi va admin tasdig‘ini kutmoqda.', 'review-success');
    } catch (error) {
      console.error('Review save failed:', error);
      submit.disabled = false;
      note('Sharhni yuborib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.', 'review-error');
    }
  });

  document.querySelector('.detail-favorite').addEventListener('click', () => {
    toggleFavorite();
    updateFavoriteButton();
  });

  document.querySelector('.detail-share').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const shareData = { title: product.name, text: `${product.name} — ${noxarFormatPrice(product.amount)}`, url: window.location.href };
    const flash = (text) => {
      button.textContent = text;
      window.setTimeout(() => { button.textContent = '↗ Ulashish'; }, 1800);
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        flash('✓ Ulashildi');
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        flash('✓ Havola nusxalandi');
        return;
      } catch (error) { /* Telegram variantiga o'tamiz */ }
    }
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareData.text)}`, '_blank', 'noopener,noreferrer');
  });

  document.querySelector('.detail-telegram').addEventListener('click', () => {
    const volume = volumeLabel(product.volume);
    const message = `Assalomu alaykum. ${product.name}${volume ? ` ${volume}` : ''} haqida ma'lumot olmoqchiman.\nNarxi: ${noxarFormatPrice(product.amount)}\nMavjudmi?\n\nMahsulot havolasi: ${window.location.href}`;
    const telegramUrl = `https://t.me/${NOXAR_SHOP.telegram}?text=${encodeURIComponent(message)}`;
    const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = telegramUrl;
  });
}

/* "Orqaga" — katalogdagi joyga qaytaradi (filtr va aylantirish saqlanadi). */
document.addEventListener('click', (event) => {
  const back = event.target.closest('.product-back-button');
  if (!back || event.ctrlKey || event.metaKey || event.shiftKey) return;
  try {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  } catch (error) { /* oddiy havola bo'yicha o'tadi */ }
});

/* ---------- Ishga tushirish ---------- */
async function init() {
  if (!productId) {
    showEmpty('Mahsulot topilmadi', 'Katalogdan mahsulot tanlang.', false);
    return;
  }
  root.innerHTML = '<section class="detail-empty"><p>Yuklanmoqda…</p></section>';
  try {
    const row = await fetchProduct(productId);
    if (!row) {
      showEmpty('Mahsulot topilmadi', 'Bu mahsulot o‘chirilgan yoki mavjud emas.', false);
      return;
    }
    reviews = await fetchReviews(productId);
    const stats = reviews.length
      ? { [row.id]: { sum: reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0), count: reviews.length } }
      : {};
    product = noxarProductFromRow(row, stats);
    renderPage();
    rememberViewed();
  } catch (error) {
    console.error('Mahsulotni yuklashda xatolik:', error);
    showEmpty('Yuklab bo‘lmadi', 'Internet aloqasini tekshirib, qayta urinib ko‘ring.', true);
  }
}

init();
