'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { JSDOM } from 'jsdom';

const pool = new (class {
  constructor() {
    this.layouts = [];
  }

  load(dir) {
    if (dir.match(/\.json$/)) {
    } else {
      const files = fs.readdirSync(path.resolve(__dirname, `./pool/${dir}`));
      for (const filename of files) {
        const con = fs.readFileSync(
          path.resolve(__dirname, `./pool/${dir}/${filename}`)
        );
        let name = filename.replace(/\.[^.]+$/, '');
        this[dir] ? null : (this[dir] = {});
        this[dir][name] = new JSDOM(con.toString());
      }
    }
  }
})();

pool.load('layouts');

console.log(pool);
