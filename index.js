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

const clockInitialState = {
  time: new Date(),
};

const productsInitialState = {
  items: null,
};

const loadingInitialState = {
  placeholders: [
    {
      id: 1,
      tagName: 'p',
      className: 'placeholder_xsmall',
      innerText: '\u00A0',
    },
    {
      id: 2,
      tagName: 'p',
      className: 'placeholder_large',
      innerText: '\u00A0',
    },
    {
      id: 3,
      tagName: 'p',
      className: 'placeholder_small',
      innerText: '\u00A0',
    },
    {
      id: 4,
      tagName: 'p',
      className: 'placeholder_medium',
      innerText: '\u00A0',
    },
  ],
};

function createSetTimeAction(time) {
  return {
    type: SET_TIME,
    time,
  };
}

function createSetItemsAction(items) {
  return {
    type: SET_ITEMS,
    items,
  };
}

function createChangeItemPriceAction(id, price) {
  return {
    type: CHANGE_ITEM_PRICE,
    id,
    price,
  };
}

const SET_TIME = 'SET_TIME';

function clockReducer(state = clockInitialState, action) {
  switch (action.type) {
    case SET_TIME:
      return {
        ...state,
        time: action.time,
      };
    default:
      return state;
  }
}

const SET_ITEMS = 'SET_ITEMS';
const CHANGE_ITEM_PRICE = 'CHANGE_ITEM_PRICE';

function productsReducer(state = productsInitialState, action) {
  switch (action.type) {
    case SET_ITEMS:
      return {
        ...state,
        items: action.items,
      };
    case CHANGE_ITEM_PRICE:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === action.id) {
            return {
              ...item,
              price: action.price,
            };
          }
          return item;
        }),
      };
    default:
      return state;
  }
}

function loadingReducer(state = loadingInitialState) {
  return state;
}

const store = Redux.createStore(Redux.combineReducers({
  clock: clockReducer,
  products: productsReducer,
  loading: loadingReducer,
}));

function App({ state }) {
  return (
    <div className="wrapper">
      <Header time={state.clock.time} />
      <Items items={state.products.items} placeholders={state.loading.placeholders} />
    </div>
  );
}

function Header({ time }) {
  return (
    <header className="header">
      <Logo />
      <Clock time={time} />
    </header>
  );
}

function Logo() {
  return <img className="logo" src="images/logo.png" alt="" />;
}

function Clock({ time }) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;

  return (
    <div className="clock">
      <span className="value">{time.toLocaleTimeString()}</span>
      <img className="icon" src={isDay ? 'images/sun.png' : 'images/moon.png'} alt="" />
    </div>
  );
}

function Placeholder({ placeholder }) {
  return (
    <placeholder.tagName className={placeholder.className}>
      {placeholder.innerText}
    </placeholder.tagName>
  )
}

function Loading({ placeholders }) {
  return (
    <div className="placeholder">
      {placeholders.map((placeholder) => (
        <Placeholder placeholder={placeholder} key={placeholder.id} />
      ))}
    </div>
  );
}

function Items({items, placeholders}) {
  if (items === null) {
    return <Loading placeholders={placeholders} />;
  }

  return (
    <div className="items">
      {items.map((item) => (
        <Item item={item} key={item.id} />
      ))}
    </div>
  );
}

function Item({ item }) {
  return (
    <article className="item">
      <h2 className="item_name">{item.name}</h2>
      <div className="item_price">{item.price}</div>
    </article>
  );
}

function renderView(state) {
  ReactDOM.render(<App state={state} />, document.querySelector('#app'));
}

renderView(store.getState());

store.subscribe(() => {
  renderView(store.getState());
});

setInterval(() => {
  store.dispatch(createSetTimeAction(new Date()));
}, 1000);

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

api.get('/items').then((items) => {
  store.dispatch(createSetItemsAction(items));

  items.forEach((item) => {
    stream.subscribe(`price-${item.id}`, (data) => {
      store.dispatch(createChangeItemPriceAction(data.id, data.price));
    });
  });
});
