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
  return {
    type: 'div',
    props: {
      className: 'wrapper',
      children: [
        {
          type: Header,
          props: {},
        },
        {
          type: Items,
          props: { items: state.items },
        },
      ],
    },
  };
}

function Header() {
  return {
    type: 'header',
    props: {
      className: 'header',
      children: [
        {
          type: Logo,
          props: {},
        },
        {
          type: Clock,
          props: { time: state.time },
        },
      ],
    },
  };
}

function Logo() {
  return {
    type: 'img',
    props: {
      className: 'logo',
      src: 'images/logo.png',
    },
  };
}

function Clock({ time }) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;

  return {
    type: 'div',
    props: {
      className: 'clock',
      children: [
        {
          type: 'span',
          props: {
            className: 'value',
            children: time.toLocaleTimeString(),
          },
        },
        {
          type: 'img',
          props: {
            className: 'icon',
            src: isDay ? 'images/sun.png' : 'images/moon.png',
          },
        },
      ],
    },
  };
}

function Placeholder({ placeholder }) {
  return {
    type: placeholder.tagName,
    props: {
      className: placeholder.className,
      children: placeholder.innerText,
    },
  };
}

function Loading({ placeholders }) {
  return {
    type: 'div',
    props: {
      className: 'placeholder',
      children: placeholders.map((placeholder) => ({
        type: Placeholder,
        props: { placeholder },
      })),
    },
  };
}

function Items({ items }) {
  if (items === null) {
    return {
      type: Loading,
      props: { placeholders: state.placeholders },
    };
  }

  return {
    type: 'div',
    props: {
      className: 'items',
      children: items.map((item) => ({
        type: Item,
        props: { item },
      })),
    },
  };
}

function Item({ item }) {
  return {
    type: 'article',
    props: {
      className: 'item',
      children: [
        {
          type: 'h2',
          props: {
            className: 'item_name',
            children: item.name,
          },
        },
        {
          type: 'div',
          props: {
            className: 'item_price',
            children: item.price,
          },
        },
      ],
    },
  };
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
  const virtualDomRoot = {
    type: realDomRoot.tagName.toLowerCase(),
    props: {
      ...realDomRoot.attributes,
      children: [evaluatedVirtualDom],
    },
  };

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
