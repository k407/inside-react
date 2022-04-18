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

const VDom = {
  createElement: (type, config, ...children) => {
    const props = config || {};
    const key = config ? config.key || null : null;

    if (children.length === 1) {
      props.children = children[0];
    } else {
      props.children = children;
    }

    return {
      type,
      key,
      props,
    };
  },
};

function App({ state }) {
  return VDom.createElement(
    'div',
    { className: 'wrapper' },
    VDom.createElement(Header),
    VDom.createElement(Items, { items: state.items })
  );
}

function Header() {
  return VDom.createElement(
    'header',
    { className: 'header' },
    VDom.createElement(Logo),
    VDom.createElement(Clock, { time: state.time })
  );
}

function Logo() {
  return VDom.createElement('img', { className: 'logo', src: 'images/logo.png' });
}

function Clock({ time }) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;

  return VDom.createElement(
    'div',
    { className: 'clock' },
    VDom.createElement('span', { className: 'value' }, time.toLocaleTimeString()),
    VDom.createElement('img', { className: 'icon', src: isDay ? 'images/sun.png' : 'images/moon.png' })
  );
}

function Placeholder({ placeholder }) {
  return VDom.createElement(placeholder.tagName, { className: placeholder.className }, placeholder.innerText);
}

function Loading({ placeholders }) {
  const children = placeholders.map((placeholder) => VDom.createElement(Placeholder, { placeholder }));

  return VDom.createElement('div', { className: 'placeholder' }, children);
}

function Items({ items }) {
  if (items === null) {
    return VDom.createElement(Loading, { placeholders: state.placeholders });
  }

  const children = items.map((item) => VDom.createElement(Item, { item }));

  return VDom.createElement('div', { className: 'items' }, children);
}

function Item({ item }) {
  return VDom.createElement('article', { className: 'item' }, [
    VDom.createElement('h2', { className: 'item_name' }, item.name),
    VDom.createElement('div', { className: 'item_price' }, item.price),
  ]);
}

function evaluate(virtualNode) {
  if (typeof virtualNode !== 'object') {
    return virtualNode;
  }

  if (typeof virtualNode.type === 'function') {
    return evaluate(virtualNode.type(virtualNode.props));
  }

  const props = virtualNode.props || {};

  return {
    ...virtualNode,
    props: {
      ...props,
      children: Array.isArray(props.children) ? props.children.map(evaluate) : [evaluate(props.children)],
    },
  };
}

function render(virtualDom, realDomRoot) {
  const evaluatedVirtualDom = evaluate(virtualDom);
  const virtualDomRoot = VDom.createElement(realDomRoot.tagName.toLowerCase(), { ...realDomRoot.attributes }, [
    evaluatedVirtualDom,
  ]);

  sync(virtualDomRoot, realDomRoot);
}

function createRealNodeFromVirtual(virtual) {
  if (typeof virtual !== 'object') {
    return document.createTextNode('');
  }
  return document.createElement(virtual.type);
}

function sync(virtualNode, realNode) {
  if (virtualNode.props) {
    Object.entries(virtualNode.props).forEach(([name, value]) => {
      if (name === 'children') {
        return;
      }
      if (realNode[name] !== value) {
        realNode[name] = value;
      }
    });
  }

  if (typeof virtualNode !== 'object' && virtualNode !== realNode.nodeValue) {
    realNode.nodeValue = virtualNode;
  }

  const virtualChildren = virtualNode.props ? virtualNode.props.children || [] : [];
  const realChildren = realNode.childNodes;

  for (let i = 0; i < virtualChildren.length || i < realChildren.length; i++) {
    const virtual = virtualChildren[i];
    const real = realChildren[i];

    // add
    if (virtual !== undefined && real === undefined) {
      const newReal = createRealNodeFromVirtual(virtual);
      sync(virtual, newReal);
      realNode.appendChild(newReal);
    }

    // remove
    if (virtual === undefined && real !== undefined) {
      realNode.remove(real);
    }

    // update
    if (virtual !== undefined && real !== undefined && (virtual.type || '') === (real.tagName || '').toLowerCase()) {
      sync(virtual, real);
    }

    // replace
    if (virtual !== undefined && real !== undefined && (virtual.type || '') !== (real.tagName || '').toLowerCase()) {
      const newReal = createRealNodeFromVirtual(virtual);
      sync(virtual, newReal);
      realNode.replaceChild(newReal, real);
    }
  }
}

function renderView(state) {
  render(VDom.createElement(App, { state }), document.querySelector('#app'));
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
