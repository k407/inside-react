console.log('hello world');

const state = {
  time: new Date(),
  items: [
    {
      id: 1,
      name: 'item_1',
      price: 7,
    },
    {
      id: 2,
      name: 'item_2',
      price: 9,
    },
  ],
};

function App({ state }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.append(Header());
  wrapper.append(Items({items: state.items}));
  return wrapper;
}

function Header() {
  const header = document.createElement('header');
  header.className = 'header';
  header.append(Logo());
  header.append(Clock({ time: state.time }));
  return header;
}

function Logo() {
  const logo = document.createElement('img');
  logo.className = 'logo';
  logo.src = 'images/logo.png';
  return logo;
}

function Clock({ time }) {
  const clock = document.createElement('div');
  clock.className = 'clock';
  clock.innerText = time.toLocaleTimeString();
  return clock;
}

function Items({ items }) {
  const list = document.createElement('div');
  list.className = 'items';
  items.forEach((item) => {
    list.append(Item({ item }));
  });
  return list;
}

function Item({ item }) {
  const node = document.createElement('article');
  node.className = 'item';
  const name = document.createElement('h2');
  name.className = 'item_name';
  name.innerText = item.name;
  const price = document.createElement('div');
  price.className = 'item_price';
  price.innerText = item.price;
  node.append(name);
  node.append(price);
  return node;
}

function render(newDom, realDomRoot) {
  realDomRoot.append(newDom)
}

render(App({ state }), document.querySelector('#app'));
