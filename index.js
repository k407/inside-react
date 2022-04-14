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

const wrapper = document.createElement('div');
wrapper.className = 'wrapper';

const header = document.createElement('header');
header.className = 'header';

const logo = document.createElement('img');
logo.className = 'logo';
logo.src = 'images/logo.png';

const clock = document.createElement('div');
clock.className = 'clock';
clock.innerText = state.time.toLocaleTimeString();

const items = document.createElement('div');
items.className = 'items';

state.items.forEach((item) => {
  const node = document.createElement('article');
  node.className = 'item';
  const name = document.createElement('h2');
  name.className = 'lot_name';
  name.innerText = item.name;
  const price = document.createElement('div');
  price.className = 'lot_price';
  price.innerText = item.price;
  node.append(name);
  node.append(price);
  items.append(node);
});

const domRoot = document.querySelector('#app');

header.append(logo);
header.append(clock);
wrapper.append(header);
wrapper.append(items);
domRoot.append(wrapper);
