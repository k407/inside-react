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
  return React.createElement(
    'div',
    { className: 'wrapper' },
    React.createElement(Header),
    React.createElement(Items, { items: state.items })
  );
}

function Header() {
  return React.createElement(
    'header',
    { className: 'header' },
    React.createElement(Logo),
    React.createElement(Clock, { time: state.time })
  );
}

function Logo() {
  return React.createElement('img', { className: 'logo', src: 'images/logo.png' });
}

function Clock({ time }) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;

  return React.createElement(
    'div',
    { className: 'clock' },
    React.createElement('span', { className: 'value' }, time.toLocaleTimeString()),
    React.createElement('img', { className: 'icon', src: isDay ? 'images/sun.png' : 'images/moon.png' })
  );
}

function Placeholder({ placeholder }) {
  return React.createElement(placeholder.tagName, { className: placeholder.className }, placeholder.innerText);
}

function Loading({ placeholders }) {
  const children = placeholders.map((placeholder) => React.createElement(Placeholder, { placeholder }));

  return React.createElement('div', { className: 'placeholder' }, children);
}

function Items({ items }) {
  if (items === null) {
    return React.createElement(Loading, { placeholders: state.placeholders });
  }

  const children = items.map((item) => React.createElement(Item, { item, key: item.id }));

  return React.createElement('div', { className: 'items' }, children);
}

function Item({ item }) {
  return React.createElement(
    'article',
    { className: 'item' },
    React.createElement('h2', { className: 'item_name' }, item.name),
    React.createElement('div', { className: 'item_price' }, item.price)
  );
}

function renderView(state) {
  ReactDOM.render(React.createElement(App, { state }), document.querySelector('#app'));
}

renderView(state);

setInterval(() => {
  state = {
    ...state,
    time: new Date(),
  };
  renderView(state);
}, 1000);

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
