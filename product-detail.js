const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}
const product = productId ? readStorage(`noxar-product-${productId}`, null) : null;
const root = document.querySelector('#product-detail');

function price(amount) {
  return `${Number(amount).toLocaleString('uz-UZ')} so'm`;
}

function productPrice(item) {
  return item.price || price(item.amount);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function readProductReviews() {
  try {
    const reviews = readStorage('noxar-reviews', {});
    return Array.isArray(reviews[product.id]) ? reviews[product.id] : [];
  } catch (error) {
    return [];
  }
}

function renderProductReviews() {
  const reviews = readProductReviews().filter((review) => (review.status || 'pending') === 'approved');
  const reviewSection = document.querySelector('.detail-reviews');
  if (!reviewSection) return;
  reviewSection.querySelector('.detail-review-list').innerHTML = reviews.length
    ? reviews.map((review) => `<article class="detail-review"><div><strong>${escapeHtml(review.name || 'Mijoz')}</strong><span>${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</span></div><p>${escapeHtml(review.text)}</p></article>`).join('')
    : '<p class="reviews-empty">Hali tasdiqlangan sharhlar yo‘q.</p>';
  reviewSection.querySelector('.review-count').textContent = reviews.length;
}

function saveProductReview(name, rating, text) {
  const saved = readStorage('noxar-reviews', {});
  const reviews = Array.isArray(saved[product.id]) ? saved[product.id] : [];
  reviews.push({ name, rating, text, status: 'pending', createdAt: new Date().toISOString() });
  saved[product.id] = reviews;
  localStorage.setItem('noxar-reviews', JSON.stringify(saved));
}

async function saveReservation(type, customer) {
  const reservations = readStorage('noxar-reservations', []);
  const reservation = {
    id: `reservation-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    volume: product.volume || '50',
    price: productPrice(product),
    type,
    customer,
    quantity: customer.quantity,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  if (window.noxarSupabase) {
    const { error } = await noxarSupabase.from('reservations').insert({
      product_id: reservation.productId,
      product_name: reservation.productName,
      brand: reservation.brand,
      volume_ml: Number(reservation.volume) || null,
      quantity: reservation.quantity,
      request_type: reservation.type,
      customer_name: reservation.customer.name,
      customer_phone: reservation.customer.phone,
      customer_message: reservation.customer.message || null,
      status: 'pending'
    });
    if (error) throw error;
  }
  reservations.push(reservation);
  localStorage.setItem('noxar-reservations', JSON.stringify(reservations));
}

function openReservationForm(type, button) {
  const existing = document.querySelector('.reservation-dialog');
  if (existing) existing.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'reservation-dialog';
  dialog.innerHTML = `
    <form method="dialog" class="reservation-form">
      <button class="reservation-close" type="button" aria-label="Oynani yopish">×</button>
      <p class="eyebrow">NOXAR PARFUM</p>
      <h2>${type}</h2>
      <p class="reservation-summary">${product.name} · ${product.volume || '50'} ml</p>
      <label>Ismingiz<input name="name" type="text" placeholder="Ismingizni kiriting" required></label>
      <label>Telefon raqamingiz<input name="phone" type="tel" value="+998 " placeholder="+998 90 123 45 67" required></label>
      <label>Nechta olasiz? <span class="optional-label">(ixtiyoriy)</span><input name="quantity" type="number" min="1" step="1" value="1"></label>
      <button class="button button-gold reservation-submit" value="confirm" type="submit">So‘rov yuborish</button>
      <p class="reservation-note">Bu demo so‘rov. Xodimimiz siz bilan bog‘lanadi.</p>
    </form>`;
  document.body.append(dialog);
  const phoneInput = dialog.querySelector('input[name="phone"]');
  dialog.querySelector('.reservation-close').addEventListener('click', () => dialog.close());
  phoneInput.addEventListener('input', () => {
    if (!phoneInput.value.startsWith('+998 ')) {
      phoneInput.value = `+998 ${phoneInput.value.replace(/^\+?998\s*/, '')}`;
    }
  });
  phoneInput.addEventListener('focus', () => {
    phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
  });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.addEventListener('submit', async (event) => {
    if (event.submitter?.value !== 'confirm') return;
    event.preventDefault();
    const form = event.currentTarget.querySelector('form');
    if (!form.reportValidity()) return;
    const phoneDigits = form.elements.phone.value.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
      form.elements.phone.setCustomValidity('Telefon raqamingizni to‘liq kiriting');
      form.reportValidity();
      form.elements.phone.setCustomValidity('');
      return;
    }
    try {
      await saveReservation(type, {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        quantity: Math.max(1, Number(form.elements.quantity.value) || 1)
      });
    } catch (error) {
      console.error('Reservation save failed:', error);
      const message = error?.message?.includes('row-level security')
        ? 'Supabase ruxsati sozlanmagan. Admin SQL policy’ni tekshirsin.'
        : 'So‘rovni saqlashda xatolik yuz berdi. Qayta urinib ko‘ring.';
      form.insertAdjacentHTML('beforeend', `<small class="reservation-error">${message}</small>`);
      return;
    }
    dialog.close();
    button.textContent = '✓ So‘rov yuborildi';
    button.classList.add('is-saved');
    button.disabled = true;
  });
  dialog.showModal();
}

function saveDetailWishlist() {
  const wishlist = readStorage('noxar-wishlist', []);
  const next = wishlist.includes(product.id)
    ? wishlist.filter((id) => id !== product.id)
    : [...wishlist, product.id];
  localStorage.setItem('noxar-wishlist', JSON.stringify(next));
  return next.includes(product.id);
}

if (!product) {
  root.innerHTML = '<section class="detail-empty"><h1>Mahsulot topilmadi</h1><p>Katalogdan boshqa mahsulot tanlang.</p><a class="button button-gold product-back-button" href="index.html#catalog">← <span>Orqaga</span></a></section>';
} else {
  const features = Array.isArray(product.features) ? product.features : [];
  const categories = Array.isArray(product.categories) ? product.categories : [];
  const notes = [
    ['Yuqori nota', product.top || '—'],
    ['Yurak nota', product.heart || '—'],
    ['Baza nota', product.base || '—']
  ];
  const image = product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="mini-bottle"><b>N</b></div>';
  root.innerHTML = `
    <div class="detail-breadcrumb">⌂ <a href="index.html">Bosh sahifa</a> <span>›</span> <a href="index.html#catalog">Katalog</a> <span>›</span> ${product.name}</div>
    <section class="detail-main">
      <div class="detail-gallery">
        <div class="detail-visual ${product.art || 'black-art'}">${image}<span class="detail-stock">● Do‘konda mavjud</span></div>
      </div>
      <article class="detail-content">
        <p class="eyebrow">${categories.join(' · ')}</p><p class="catalog-brand">${product.brand}</p><h1>${product.name}</h1>
        <div class="detail-rating">★★★★★ <b>${product.rating || '—'}</b> <span>(${product.reviewCount || 0} ta sharh)</span></div>
        <strong class="detail-price">${productPrice(product)}</strong>
        <div class="detail-size"><b>Hajmi</b><div>${['30', product.volume || '50', '100'].filter((volume, index, list) => list.indexOf(volume) === index).map((volume) => `<button type="button" class="${volume === (product.volume || '50') ? 'selected' : ''}" data-detail-volume="${volume}">${volume} ml</button>`).join('')}</div></div>
        <div class="detail-contact-actions" aria-label="Mahsulot bo‘yicha harakatlar">
          <button class="detail-reservation detail-reservation-primary" type="button" data-reservation-type="Ajratib qo‘yish">🛍 Menga ajratib qo‘yish</button>
          <button class="detail-reservation" type="button" data-reservation-type="Do‘konda hidlab ko‘rish">👃 Do‘konda hidlab ko‘raman</button>
          <button class="detail-telegram" type="button">💬 Sotuvchidan so‘rash</button>
        </div>
        <div class="detail-action-row"><button class="detail-favorite" type="button">${readStorage('noxar-wishlist', []).includes(product.id) ? '♥ Sevimlilardan olib tashlash' : '♡ Sevimliga qo‘shish'}</button><button class="detail-share" type="button">↗ Ulashish</button></div>
        <div class="detail-trust"><span>✦ Original mahsulot<small>100% kafolat</small></span><span>↻ 14 kunlik qaytarish<small>Shartlar asosida</small></span></div>
      </article>
      <aside class="detail-aside"><div class="availability"><b>● Do‘konda mavjud</b><p>Bekbaraka bozori<br>12-qator, 2-blok<br>472-magazin yonida</p><a href="https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin" target="_blank" rel="noopener">Xaritada ko‘rish ↗</a></div><div class="aside-card"><b>Nega aynan shu atir?</b><p>◉ Original mahsulot<small>100% kafolat</small></p><p>✦ Eng yaxshi narxlar<small>Do‘konda ham shu narx</small></p><p>♧ Professional maslahat<small>Sotuvchilarimiz yordam beradi</small></p></div></aside>
    </section>
    <section class="detail-lower"><div class="detail-tabs" role="tablist"><button class="active" type="button" data-detail-tab="description" role="tab">Tavsif</button><button type="button" data-detail-tab="features" role="tab">Xususiyatlar</button><button type="button" data-detail-tab="reviews" role="tab">Sharhlar (<span class="review-count">${product.reviewCount || 0}</span>)</button></div><div class="detail-tab-panel active" data-detail-panel="description"><div class="detail-description"><h2>Mahsulot haqida</h2><p>${product.description || product.notes || 'Mahsulot haqida ma’lumot mavjud emas.'}</p><p><b>Asosiy notalar:</b> ${notes.map((item) => item[1]).join(' · ')}</p></div><section class="detail-notes"><h2>Asosiy notalar</h2>${notes.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('')}</section></div><div class="detail-tab-panel" data-detail-panel="features"><section class="detail-features"><h2>Xususiyatlari</h2><ul>${features.length ? features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('') : '<li>Qo‘shimcha xususiyatlar kiritilmagan.</li>'}</ul></section></div><div class="detail-tab-panel" data-detail-panel="reviews"><section class="detail-reviews"><h2>Mijozlar sharhlari (<span class="review-count">0</span>)</h2><div class="detail-review-list"></div><form class="detail-review-form"><h3>Fikringizni qoldiring</h3><input name="name" placeholder="Ismingiz" required><select name="rating" required><option value="">Bahoni tanlang</option><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select><textarea name="text" rows="4" placeholder="Mahsulot haqidagi fikringiz" required></textarea><button class="button button-gold" type="submit">Sharh yuborish</button><small>Sharh admin tasdig‘idan keyin ko‘rinadi.</small></form></section></div></section>`;
  document.querySelectorAll('.detail-reservation').forEach((button) => {
    button.addEventListener('click', () => {
     openReservationForm(button.dataset.reservationType, button);
    });
  });
  document.querySelectorAll('[data-detail-volume]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-detail-volume]').forEach((item) => item.classList.toggle('selected', item === button));
    });
    const detailTabs = document.querySelectorAll('[data-detail-tab]');
    detailTabs.forEach((tab) => tab.addEventListener('click', () => {
      detailTabs.forEach((item) => item.classList.toggle('active', item === tab));
      document.querySelectorAll('[data-detail-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.detailPanel === tab.dataset.detailTab));
    }));
    renderProductReviews();
    document.querySelector('.detail-review-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      saveProductReview(form.elements.name.value.trim(), Number(form.elements.rating.value), form.elements.text.value.trim());
      form.reset();
      form.insertAdjacentHTML('beforeend', '<small class="review-success">Sharhingiz yuborildi va admin tasdig‘ini kutmoqda.</small>');
    });
  });
  document.querySelector('.detail-favorite').addEventListener('click', (event) => {
    const active = saveDetailWishlist();
    event.currentTarget.textContent = active ? '♥ Sevimlilardan olib tashlash' : '♡ Sevimliga qo‘shish';
  });
  document.querySelector('.detail-share').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const shareData = { title: product.name, text: `${product.name} — ${productPrice(product)}`, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        button.textContent = '✓ Ulashildi';
        window.setTimeout(() => { button.textContent = '↗ Ulashish'; }, 1800);
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        button.textContent = '✓ Havola nusxalandi';
        window.setTimeout(() => { button.textContent = '↗ Ulashish'; }, 1800);
        return;
      } catch (error) {
        // Local file pages may block clipboard access; use Telegram below.
      }
    }
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`${product.name} — ${productPrice(product)}`)}`;
    window.open(telegramShareUrl, '_blank', 'noopener,noreferrer');
  });
  document.querySelector('.detail-telegram').addEventListener('click', () => {
    const message = `Assalomu alaykum. ${product.name} ${product.volume || '50'} ml haqida ma'lumot olmoqchiman.\nNarxi: ${productPrice(product)}\nMavjudmi?\n\nMahsulot havolasi: ${window.location.href}`;
    const telegramUrl = `https://t.me/ITishnikN1?text=${encodeURIComponent(message)}`;

    const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = telegramUrl;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(message).catch(() => {});
    }
  });
}
