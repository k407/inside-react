console.log('hello world');

let state = {
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
  wrapper.append(Items({ items: state.items }));
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
  const node = document.createElement('div');
  node.className = 'clock';
  const value = document.createElement('span');
  value.className = 'value';
  value.innerText = time.toLocaleTimeString();
  const icon = document.createElement('img');
  icon.className = 'icon';
  time.getHours() >= 7 && time.getHours() <= 21
    ? (icon.src = 'images/sun.png')
    : (icon.src = 'images/moon.png');
  node.append(value);
  node.append(icon);
  return node;
}

function Loading() {
  const node = document.createElement('div');
  node.className = 'placeholder';
  const xsmall = document.createElement('p');
  xsmall.className = 'placeholder_xsmall';
  xsmall.innerText = '\u00A0';
  const small = document.createElement('p');
  small.className = 'placeholder_small';
  small.innerText = '\u00A0';
  const medium = document.createElement('p');
  medium.className = 'placeholder_medium';
  medium.innerText = '\u00A0';
  const large = document.createElement('p');
  large.className = 'placeholder_large';
  large.innerText = '\u00A0';
  node.append(xsmall);
  node.append(large);
  node.append(small);
  node.append(medium);
  return node;
}

function Items({ items }) {
  if (items === null) {
    return Loading();
  }
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
  realDomRoot.innerHTML = '';
  realDomRoot.append(newDom);
}

function renderView(state) {
  render(App({ state }), document.querySelector('#app'));
}

setInterval(() => {
  state = {
    ...state,
    time: new Date(),
  };
  renderView(state);
}, 1000);

renderView(state);
