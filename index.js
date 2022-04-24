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
                favorite: true,
              },
              {
                id: 2,
                name: 'item_2',
                price: 9,
                favorite: false,
              },
              {
                id: 3,
                name: 'item_3',
                price: 11,
                favorite: false,
              },
            ]);
          }, 1000);
        });
      default:
        throw new Error('404');
    }
  },
  post(url) {
    if (/^\/items\/(\d+)\/favorite$/.exec(url)) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({});
        }, 500);
      });
    }
    if (/^\/items\/(\d+)\/unfavorite$/.exec(url)) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({});
        }, 500);
      });
    }
    throw new Error('Unknown address');
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
      }, 400);
    }
  },
};

const clockInitialState = {
  time: new Date(),
};

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

function createSetTimeAction(time) {
  return {
    type: SET_TIME,
    time,
  };
}

const productsInitialState = {
  items: null,
};

const SET_ITEMS = 'SET_ITEMS';
const CHANGE_ITEM_PRICE = 'CHANGE_ITEM_PRICE';
const FAVORITE_ITEM = 'FAVORITE_ITEM';
const UNFAVORITE_ITEM = 'UNFAVORITE_ITEM';

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
    case FAVORITE_ITEM:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === action.id) {
            return {
              ...item,
              favorite: true,
            };
          }
          return item;
        }),
      };
    case UNFAVORITE_ITEM:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === action.id) {
            return {
              ...item,
              favorite: false,
            };
          }
          return item;
        }),
      };
    default:
      return state;
  }
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

function createFavoriteItemAction(id) {
  return {
    type: FAVORITE_ITEM,
    id,
  };
}

function createUnfavoriteItemAction(id) {
  return {
    type: UNFAVORITE_ITEM,
    id,
  };
}

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

function loadingReducer(state = loadingInitialState) {
  return state;
}

const store = Redux.createStore(
  Redux.combineReducers({
    loading: loadingReducer,
    clock: clockReducer,
    products: productsReducer,
  })
);

function App({ store }) {
  return (
    <div className="wrapper">
      <Header store={store} />
      <ItemsConnected store={store} />
    </div>
  );
}

function Header({ store }) {
  return (
    <header className="header">
      <Logo />
      <ClockConnected store={store} />
    </header>
  );
}

function Logo() {
  return <img className="logo" src="images/logo.png" alt="" />;
}

function ClockConnected({ store }) {
  const state = store.getState();
  const time = state.clock.time;

  return <Clock time={time} />;
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

function ItemsConnected({ store }) {
  const state = store.getState();
  const items = state.products.items;
  const placeholders = state.loading.placeholders;

  return (
    <Items
      items={items}
      placeholders={placeholders}
      store={store}
    />
  );
}

function Items({ items, placeholders, store }) {
  if (items === null) {
    return <Loading placeholders={placeholders} />;
  }

  return (
    <div className="items">
      {items.map((item) => (
        <ItemConnected item={item} store={store} key={item.id} />
      ))}
    </div>
  );
}

function ItemConnected({ store, item }) {
  const dispatch = store.dispatch;

  const favorite = (id) => {
    api.post(`/items/${id}/favorite`).then(() => {
      dispatch(createFavoriteItemAction(id));
    });
  };

  const unfavorite = (id) => {
    api.post(`/items/${id}/unfavorite`).then(() => {
      dispatch(createUnfavoriteItemAction(id));
    });
  };

  return <Item item={item} favorite={favorite} unfavorite={unfavorite} key={item.id} />;
}

function Item({ item, favorite, unfavorite }) {
  return (
    <article className={'item' + (item.favorite ? ' item_favorite' : '')}>
      <h2 className="item_name">{item.name}</h2>
      <div className="item_price">{item.price}</div>
      <Favorite
        active={item.favorite}
        id={item.id}
        favorite={() => favorite(item.id)}
        unfavorite={() => unfavorite(item.id)}
      />
    </article>
  );
}

function Favorite({ active, favorite, unfavorite }) {
  return active ? (
    <button type="button" className="unfavorite" onClick={unfavorite}>
      <img className="favorite_icon" src="images/heart-sharp.png" alt="" /> Unfavorite
    </button>
  ) : (
    <button type="button" className="favorite" onClick={favorite}>
      <img className="favorite_icon" src="images/heart-outline.png" alt="" /> Favorite
    </button>
  );
}

function renderView(store) {
  ReactDOM.render(
    <App store={store} />,
    document.querySelector('#app')
  );
}

store.subscribe(() => {
  renderView(store);
});

renderView(store);

setInterval(() => {
  store.dispatch(createSetTimeAction(new Date()));
}, 1000);

api.get('/items').then((items) => {
  store.dispatch(createSetItemsAction(items));

  items.forEach((item) => {
    stream.subscribe(`price-${item.id}`, (data) => {
      store.dispatch(createChangeItemPriceAction(data.id, data.price));
    });
  });
});
