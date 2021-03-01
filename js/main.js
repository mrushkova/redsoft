'use strict';

const btns = document.querySelectorAll('.btn--shop');
const markupInCart = `
    <img src="img/checked.svg" alt="Готово"> 
    <p>В корзине</p>
    `;
const markupInLoad = `
<img src="img/loader.svg" alt="Загрузка">
`;
const markupInStock = `Купить`;
let cart = [];

const keepItems = function () {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const timeout = function () {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error('Превышено время ожидания запроса'));
    }, 5000);
  });
};

const addItem = async function (id) {
  try {
    const req = await Promise.race([
      fetch(`https://jsonplaceholder.typicode.com/posts/${id}`),
      timeout(),
    ]);
    const data = await req.json();

    const item = {
      id: id,
      title: data.title,
    };

    cart.push(item);
    keepItems();
  } catch (err) {
    console.error(err);
  }
};

const deleteItem = function (id) {
  const index = cart.findIndex(item => item.id === id);
  cart.splice(index, 1);
  keepItems();
};

const renderItems = function () {
  cart.map(item => {
    btns.forEach(btn => {
      if (btn.closest('.shop__item').dataset.id === item.id) {
        btn.innerHTML = markupInCart;
        btn.classList.add('btn--cart');
      }
    });
  });
};

btns.forEach(btn => {
  btn.addEventListener('click', function () {
    // Get item id
    const id = btn.closest('.shop__item').dataset.id;

    if (!btn.classList.contains('btn--cart')) {
      // Loader
      btn.classList.add('btn--disabled');
      btn.innerHTML = markupInLoad;

      addItem(id);

      // Confirm purchase
      btn.innerHTML = markupInCart;
      btn.classList.remove('btn--disabled');
      btn.classList.add('btn--cart');
    } else {
      btn.innerHTML = markupInStock;
      btn.classList.remove('btn--disabled');
      btn.classList.remove('btn--cart');
      deleteItem(id);
    }
  });
});

const init = function () {
  const storage = localStorage.getItem('cart');
  if (storage) cart = JSON.parse(storage);
  renderItems();
};

init();
