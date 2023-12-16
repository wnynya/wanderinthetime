'use strict';

import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Crypto from '@wnynya/crypto';
import pug from 'pug';
import { JSDOM } from 'jsdom';

const index = fs
  .readFileSync(path.resolve(__dirname, `../data/index.pug`))
  .toString();
const headscript = fs
  .readFileSync(path.resolve(__dirname, `../data/headscript.mjs`))
  .toString();
const layouts = {};

for (const file of fs.readdirSync(path.resolve(__dirname, '../data/layouts'))) {
  const name = file.replace(/(\.[^.]+)$/, '');
  const ext = file.replace(/.*\.([^.]+)$/, '$1');
  if (!layouts[name]) {
    layouts[name] = {};
  }
  layouts[name][ext] = fs
    .readFileSync(path.resolve(__dirname, `../data/layouts/${name}.${ext}`))
    .toString();
}

console.log(`Layouts Loaded. (${Object.keys(layouts).length})`);

const contents = {};

for (const dir of ['articles', 'products']) {
  for (const file of fs.readdirSync(
    path.resolve(__dirname, `../data/contents/${dir}`)
  )) {
    const name = `${dir}/${file.replace(/(\.[^.]+)$/, '')}`;
    const json = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, `../data/contents/${dir}/${file}`)
      )
    );

    contents[name] = json;
  }
}

console.log(`Contents Loaded. (${Object.keys(contents).length})`);

const images = {};

for (const file of fs.readdirSync(path.resolve(__dirname, `../data/images`))) {
  const name = `${file.replace(/(\.[^.]+)$/, '')}`;
  images[name] = path.resolve(__dirname, `../data/images/${file}`);
}

console.log(`Images Loaded. (${Object.keys(images).length})`);

const exit = {};

for (const file of fs.readdirSync(path.resolve(__dirname, `../data/exit`))) {
  const name = `${file.replace(/(\.[^.]+)$/, '')}`;
  exit[name] = path.resolve(__dirname, `../data/exit/${file}`);
}

console.log(`Exit Signs Loaded. (${Object.keys(exit).length})`);

class Site {
  constructor(value = `${Math.random()}`) {
    this.value = value;
    this.int = -1;
    this.left = -1;
    this.right = -1;

    if (!this.value.match(/^[a-z0-9]{4}$/)) {
      this.from(this.value);
    } else {
      this.#update();
    }
  }

  render(req) {
    const layoutKeys = Object.keys(layouts);
    const layoutName = layoutKeys[this.int % layoutKeys.length];
    const layout = layouts[layoutName];
    const content = this.content();
    const title = content.title;

    const links = [];
    for (let i = 1; i <= 100; i++) {
      const site = this.next(i);
      const siteContent = site.content();
      links.push({
        site: site.value,
        title: siteContent.title,
        content: siteContent.content,
      });
    }

    let data = {
      site: this.value,
      title: title,
      content: content.content,
      links: links,
    };

    if (layoutName == 'random') {
      data = this.random(data);
    }

    let exit = null;

    if (req.session.get('pages') > 10 && Math.random() < 0.1) {
      exit = this.exit();
    }

    const html = pug.render(index, {
      title: title,
      style: layout.css + this.style_distortion(),
      headscript: headscript,
      content: pug.render(layout.pug, data),
      script: layout.mjs,
      exit: exit,
    });
    return html;
  }

  style_distortion() {
    if (this.int % 100 > 50) {
      return '';
    }

    const _this = this;

    let style = '';
    function s(c) {
      style += `${c} {`;
    }
    function p(k, v, p) {
      if (_this.int % 100 < p) {
        style += `  ${k}: ${v};`;
      }
    }
    function e() {
      style += `}`;
    }

    s(':root');
    p('--bg', this.color(), 50);
    p('--title-fs', '1rem', 50);
    p('--title-fs', '15rem', 3);
    p('--content-fs', '3rem', 50);
    p('--content-fs', '4rem', 10);
    e();

    s('body');
    p('transform', `rotate(${(this.int % 20) - 5}deg)`, 10);
    e();

    s('#content-article');
    p('filter', `blur(3px)`, 30);
    e();

    return style;
  }

  random(data) {
    data.title = this.value;
    data.layers = [];

    let document = new JSDOM(``).window.document;

    function block(content, styles, href) {
      let e;
      if (href) {
        e = document.createElement('a');
        e.href = href;
      } else {
        e = document.createElement('div');
      }
      for (const key in styles) {
        e.style[key] = styles[key];
      }
      e.innerHTML = content;
      return e.outerHTML;
    }

    data.layers.push(
      block(`<h1>Example Background</h1>`, {
        background: this.color(),
        width: '100%',
        height: '100%',
      })
    );

    for (let i = 0; i < (this.int % 30) + 5; i++) {
      let con = data.links[i];
      let style = {
        background: this.next(i + 1).color(),
        width: `${100 + ((this.next(i + 2).int % 100) / 100.0) * 500}px`,
        height: `${100 + ((this.next(i + 3).int % 100) / 100.0) * 200}px`,
        borderRadius: `${this.next(i + 6).int % 50}%`,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        fontSize: `${((i + this.int) % 50) + 6}pt`,
      };
      if (this.next(i + 3).int % 100 > 30) {
        style.background = `url("/resources/${
          this.next(i + 3).value
        }/image/image.png")`;
      } else if (this.next(i + 7).int % 100 > 30) {
        style.background = 'none';
      }
      if (this.next(i + 1).int % 19 > 9) {
        style.top = `${this.next(i + 4).int % 80}%`;
      } else {
        style.bottom = `${this.next(i + 4).int % 80}%`;
      }
      if (this.next(i + 2).int % 7 > 3) {
        style.left = `${this.next(i + 5).int % 80}%`;
      } else {
        style.right = `${this.next(i + 5).int % 80}%`;
      }
      data.layers.push(block(`${con.title}`, style, `/${con.site}`));
    }
    //https://picsum.photos/id/237/200/300

    return data;
  }

  exit() {
    let document = new JSDOM(``).window.document;

    let e;
    e = document.createElement('a');
    e.href = `/exit/${this.value}`;

    if (this.left % 2 == 0) {
      e.style.top = `${this.left % 2000}px`;
    } else {
      e.style.bottom = `${this.left % 2000}px`;
    }
    if (this.right % 2 == 0) {
      e.style.left = `${this.right % 2000}px`;
    } else {
      e.style.right = `${this.right % 2000}px`;
    }

    e.style.width = `${100 + ((this.next(1).int % 100) / 100.0) * 200}px`;

    e.innerHTML = `<img src="/resources/${this.value}/exit/${this.value}.jpg" />`;

    return e.outerHTML;
  }

  from(seed) {
    let hash = new Crypto(seed).hash();
    let num = parseInt(hash.substring(0, 10), 16);
    this.value = num.toString(36).padStart(4, '0').substring(0, 4);
    this.#update();

    return this;
  }

  next(n = 1) {
    let nextKey = this;
    for (let i = 0; i < n; i++) {
      nextKey = new Site().from(nextKey.value);
    }
    return nextKey;
  }

  clone() {
    return new Site(this.value);
  }

  #update() {
    this.int = parseInt(this.value, 36);
    this.left = parseInt(this.value.substring(0, 2), 36);
    this.right = parseInt(this.value.substring(2, 4), 36);
  }

  content() {
    const contentKeys = Object.keys(contents);
    const content = contents[contentKeys[this.int % contentKeys.length]];
    return content;
  }

  resources_image() {
    const imageKeys = Object.keys(images);
    const path = images[imageKeys[this.int % imageKeys.length]];
    return path;
  }

  resources_exit() {
    const exitKeys = Object.keys(exit);
    const path = exit[exitKeys[this.int % exitKeys.length]];
    return path;
  }

  color() {
    let r = this.next(1).int % 256;
    let g = this.next(2).int % 256;
    let b = this.next(3).int % 256;
    return `rgb(${r}, ${g}, ${b})`;
  }

  static reverse(seed, layout) {
    let key = new Site().from(seed);
    let index = Layouts.indexOf(layout);
    let typeInt = key.left;
    let dist = index - (typeInt % Layouts.length);
    if (0 <= typeInt - (Layouts.length - dist)) {
      typeInt -= Layouts.length - dist;
    } else {
      typeInt += dist;
    }
    return new Site(
      typeInt.toString(36).padStart(2, '0') + key.value[2] + key.value[3]
    );
  }
}

export default Site;
