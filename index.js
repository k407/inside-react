console.log('hello world');

const api = {
  get(url) {
    switch (url) {
      case '/items':
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve([
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
              {
                id: 3,
                name: 'item_3',
                price: 11,
              },
            ]);
          }, 1000);
        });
      default:
        throw new Error('404');
    }
  },
};

const stream = {
  subscribe(channel, listener) {
    const match = /price-(\d+)/.exec(channel);
    if (match) {
      setInterval(() => {
        listener({
          id: parseInt(match[1]),
          price: Math.floor(Math.random() * 10 + 1),
        });
      }, 1000);
    }
  },
};

let state = {
  time: new Date(),
  items: null,
  placeholders: [
    {
      tagName: 'p',
      className: 'placeholder_xsmall',
      innerText: '\u00A0',
    },
    {
      tagName: 'p',
      className: 'placeholder_large',
      innerText: '\u00A0',
    },
    {
      tagName: 'p',
      className: 'placeholder_small',
      innerText: '\u00A0',
    },
    {
      tagName: 'p',
      className: 'placeholder_medium',
      innerText: '\u00A0',
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

function Placeholder({ placeholder }) {
  const node = document.createElement(placeholder.tagName);
  node.className = placeholder.className;
  node.innerText = placeholder.innerText;
  return node;
}
function Loading({ placeholders }) {
  const node = document.createElement('div');
  node.className = 'placeholder';

  placeholders.forEach((placeholder) => {
    node.append(Placeholder({ placeholder }));
  });
  return node;
}

function Items({ items }) {
  if (items === null) {
    return Loading({ placeholders: state.placeholders });
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

api.get('/items').then((items) => {
  state = {
    ...state,
    items,
  };
  renderView(state);

  const onPrice = (data) => {
    state = {
      ...state,
      items: state.items.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            price: data.price,
          };
        }
        return item;
      }),
    };
    renderView(state);
  };

  items.forEach((item) => {
    stream.subscribe(`price-${item.id}`, onPrice);
  });
});

setInterval(() => {
  state = {
    ...state,
    time: new Date(),
  };
  renderView(state);
}, 1000);

renderView(state);
