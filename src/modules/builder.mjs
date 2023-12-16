'use strict';

import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Crypto from '@wnynya/crypto';
import { JSDOM } from 'jsdom';

const Layouts = [
  'ARTICLE',
  'ARTICLE_INDEX',
  'POST',
  'POST_INDEX',
  'DOCUMENT',
  'DOCUMENT_INDEX',
  'GALLERY',
  'GALLERY_INDEX',
  'PRODUCT',
  'PRODUCT_INDEX',
  'INTERACTION',
  'RANDOM',
];

const LayoutPool = {
  ARTICLE: 4,
  ARTICLE_INDEX: 0,
  POST: 0,
  POST_INDEX: 0,
  DOCUMENT: 0,
  DOCUMENT_INDEX: 0,
  GALLERY: 0,
  GALLERY_INDEX: 0,
  PRODUCT: 2,
  PRODUCT_INDEX: 0,
  INTERACTION: 0,
  RANDOM: 1,
};

const Builder = new (class {
  #contentPools = {};

  constructor() {
    this.#contentPools.articles = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../data/articles.json'))
    );
  }

  build(key) {
    let data = {};

    data.key = key.value;
    data.layout = key.getLayout();

    switch (key.layout) {
      case 'ARTICLE': {
        let content = key.getContent();
        data.title = content.title;
        data.content = content.content;

        let subs = [];
        for (let i = 0; i < 6; i++) {
          let subKey = Key.reverse(`${key.value}${i}`, key.layout);
          let subContent = subKey.getContent();
          subs.push({
            key: subKey.value,
            title: subContent.title,
            content: subContent.content,
          });
        }
        data.subs = subs;
        break;
      }
      case 'ARTICLE_INDEX': {
        break;
      }
      case 'POST': {
        break;
      }
      case 'POST_INDEX': {
        break;
      }
      case 'DOCUMENT': {
        break;
      }
      case 'DOCUMENT_INDEX': {
        break;
      }
      case 'GALLERY': {
        break;
      }
      case 'GALLERY_INDEX': {
        break;
      }
      case 'PRODUCT': {
        break;
      }
      case 'PRODUCT_INDEX': {
        break;
      }
      case 'INTERACTION': {
        break;
      }
      case 'RANDOM': {
        data = Builder.build_random(key, data);
        break;
      }
      default: {
        data = {
          layout: 'blank',
          title: 'LOST IN THE MAZE',
        };
      }
    }

    return data;
  }

  contentPool(layout) {
    switch (layout) {
      case 'ARTICLE': {
        return articles;
      }
    }
  }

  build_random(key, data) {
    data.key = key.value;
    data.layout = key.getLayout();

    data.title = 'RANDOM PAGE TEST';
    data.layers = {};

    let document = new JSDOM(``).window.document;

    function div(styles, content) {
      let element = document.createElement('div');
      for (const key in styles) {
        element.style[key] = styles[key];
      }
      element.innerHTML = content;
      return element.outerHTML;
    }

    function a(href, styles, content) {
      let element = document.createElement('a');
      element.href = href;
      for (const key in styles) {
        element.style[key] = styles[key];
      }
      element.innerHTML = content;
      return element.outerHTML;
    }

    data.layers.bg1 = div(
      {
        background: key.getColor(),
        width: '100%',
        height: '100%',
      },
      `<h1>Example Background</h1>`
    );

    data.layers.content = div(
      {
        background: key.next(2).getColor(),
        width: '640px',
        height: '480px',
        top: `${key.next(2).int % 50}%`,
        left: `${key.next(3).int % 50}%`,
        position: 'absolute',
      },
      `<h1>Content Area</h1>`
    );

    data.layers.fg1 = a(
      `/${Key.reverse(`${key.value}`, key.layout).value}`,
      {
        background: key.next(7).getColor(),
        width: `${100 + ((key.next(5).int % 100) / 100.0) * 200}px`,
        height: `${100 + ((key.next(7).int % 100) / 100.0) * 200}px`,
        borderRadius: '100%',
        bottom: `${key.next(5).int % 50}%`,
        right: `${key.next(6).int % 50}%`,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      },
      `
      <h1>Click for</h1><h1>another page</h1>`
    );

    data.layers.fg2 = a(
      `/${Key.reverse(`${key.next(2).value}`, key.layout).value}`,
      {
        background: key.next(3).getColor(),
        width: '250px',
        height: '150px',
        borderRadius: '15px',
        top: `${key.next(4).int % 70}%`,
        right: `${key.next(9).int % 50}%`,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      },
      `<img src="https://picsum.photos/id/${key.int % 500}/250/150" />`
    );
    //https://picsum.photos/id/237/200/300

    return data;
  }
})();

class Key {
  constructor(value = `${Math.random()}`) {
    this.value = value;
    this.int = -1;
    this.typeInt = -1;
    this.themeInt = -1;

    if (!this.value.match(/^[a-z0-9]{4}$/)) {
      this.from(this.value);
    } else {
      this.#update();
    }
  }

  from(seed) {
    let hash = new Crypto(seed).hash();
    let num = parseInt(hash.substring(0, 16), 16);
    this.value = num.toString(36).padStart(4, '0').substring(0, 4);
    this.#update();

    return this;
  }

  next(n = 1) {
    let nextKey = this;
    for (let i = 0; i < n; i++) {
      nextKey = new Key().from(nextKey.value);
    }
    return nextKey;
  }

  clone() {
    return new Key(this.value);
  }

  #update() {
    this.int = parseInt(this.value, 36);
    this.typeInt = parseInt(this.value.substring(0, 2), 36);
    this.themeInt = parseInt(this.value.substring(2, 4), 36);

    this.layout = Layouts[this.typeInt % Layouts.length];
  }

  getLayout() {
    return `${this.layout}-${
      (this.int % LayoutPool[this.layout]) + 1
    }`.toLowerCase();
  }

  getContent() {
    const contents = Builder.contentPool(this.layout);
    return contents[this.int % contents.length];
  }

  getColor() {
    let k1 = this.next();
    let k2 = k1.next();
    let k3 = k2.next();
    let r = k1.int % 256;
    let g = k2.int % 256;
    let b = k3.int % 256;
    return `rgb(${r}, ${g}, ${b})`;
  }

  static reverse(seed, layout) {
    let key = new Key().from(seed);
    let index = Layouts.indexOf(layout);
    let typeInt = key.typeInt;
    let dist = index - (typeInt % Layouts.length);
    if (0 <= typeInt - (Layouts.length - dist)) {
      typeInt -= Layouts.length - dist;
    } else {
      typeInt += dist;
    }
    return new Key(
      typeInt.toString(36).padStart(2, '0') + key.value[2] + key.value[3]
    );
  }
}

export default {
  Builder: Builder,
  Key: Key,
  build: Builder.build,
};
