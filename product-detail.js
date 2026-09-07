const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const product = productId ? JSON.parse(localStorage.getItem(`noxar-product-${productId}`) || 'null') : null;
const root = document.querySelector('#product-detail');

function price(amount) {
  return `${Number(amount).toLocaleString('uz-UZ')} so'm`;
}

if (!product) {
  root.innerHTML = '<section class="detail-empty"><h1>Mahsulot topilmadi</h1><p>Katalogdan boshqa mahsulot tanlang.</p><a class="button button-gold" href="index.html#catalog">Katalogga qaytish</a></section>';
} else {
  const features = Array.isArray(product.features) ? product.features : [];
  const notes = [
    ['Yuqori nota', product.top || '—'],
    ['Yurak nota', product.heart || '—'],
    ['Baza nota', product.base || '—']
  ];
  root.innerHTML = `
    <div class="detail-visual ${product.art || 'black-art'}">${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="mini-bottle"><b>N</b></div>'}</div>
    <article class="detail-content">
      <p class="eyebrow">${product.categories.join(' · ')}</p>
      <p class="catalog-brand">${product.brand}</p>
      <h1>${product.name}</h1>
      <div class="detail-rating">★ ${product.rating || '—'} <span>${product.reviewCount || 0} ta sharh</span></div>
      <strong class="detail-price">${product.price || price(product.amount)}</strong>
      <p class="detail-description">${product.description || product.notes || 'Mahsulot haqida ma’lumot mavjud emas.'}</p>
      <div class="detail-facts">
        <div><span>Brend</span><b>${product.brand}</b></div>
        <div><span>Kategoriya</span><b>${product.categories.join(', ')}</b></div>
        <div><span>Hajm</span><b>${product.volume || '—'} ml</b></div>
        <div><span>Oila</span><b>${product.family || '—'}</b></div>
      </div>
      <section class="detail-notes"><h2>Kompozitsiya</h2>${notes.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('')}</section>
      <section class="detail-features"><h2>Xususiyatlari</h2><ul>${features.map((feature) => `<li>${feature}</li>`).join('')}</ul></section>
      <p class="detail-usage"><b>Qo‘llash:</b> ${product.usage || 'Mahsulotni ko‘rsatmasiga muvofiq ishlating.'}</p>
      <button class="button button-gold detail-cart">Savatga qo‘shish <span>+</span></button>
    </article>`;
  document.querySelector('.detail-cart').addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('noxar-cart') || '[]');
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, amount: product.amount, art: product.art, quantity: 1 });
    localStorage.setItem('noxar-cart', JSON.stringify(cart));
    document.querySelector('.detail-cart').innerHTML = 'Savatga qo‘shildi <span>✓</span>';
  });
}
