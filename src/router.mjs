'use strict';

import express from 'express';
const router = express.Router();

import Site from './site.mjs';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import pug from 'pug';

const enter = fs
  .readFileSync(path.resolve(__dirname, '../data/enter.pug'))
  .toString();

const exit = fs
  .readFileSync(path.resolve(__dirname, '../data/exit.pug'))
  .toString();

const escaped = fs
  .readFileSync(path.resolve(__dirname, '../data/escaped.pug'))
  .toString();

router.get('/', (req, res) => {
  req.session.destroy();

  req.session.set('entered', Date.now());
  req.session.set('pages', 1);
  req.session.set('events', {
    mouse: {
      clicks: 0,
      move_distance: 0,
      enter: 0,
      leave: 0,
    },
    keyboard: {
      pressed: 0,
    },
  });
  req.session.set('spent', 0);

  res.send(pug.render(enter, {}));
});

router.post('/api/events', (req, res) => {
  let data = req.body;
  let events = req.session.get('events');

  events.mouse.clicks += data.mouse.clicks;
  events.mouse.move_distance += data.mouse.move_distance;
  events.mouse.enter += data.mouse.enter;
  events.mouse.leave += data.mouse.leave;
  events.keyboard.pressed += data.keyboard.pressed;

  req.session.set('events', events);
  res.end();
});

router.post('/api/spent', (req, res) => {
  req.session.set('spent', req.body.spent * 1);
  res.end();
});

router.get('/resources/:key/image/:filename', (req, res) => {
  const site = new Site(req.params.key);
  res.sendFile(site.resources_image());
});

router.get('/resources/:key/exit/:filename', (req, res) => {
  const site = new Site(req.params.key);
  res.sendFile(site.resources_exit());
});

router.get('/resources/:key/ad/:filename', (req, res) => {
  const site = new Site(req.params.key);
  res.sendFile(site.resources_exit());
});

router.get('/favicon.ico', (req, res) => {
  res.status(404).end();
});

router.get('/:key', (req, res) => {
  if (!req.session.get('entered')) {
    res.redirect('/');
    return;
  } else {
    const site = new Site(req.params.key);
    if (req.params.key != site.value) {
      res.redirect(`/${site.value}`);
    } else {
      req.session.set('pages', req.session.get('pages') + 1);
      res.send(site.render(req));
    }
  }
});

router.get('/room/exit', (req, res) => {
  if (!req.session.get('entered')) {
    res.redirect('/');
    return;
  } else {
    res.send(pug.render(exit));
  }
});

router.get('/room/escaped', (req, res) => {
  if (!req.session.get('entered')) {
    res.redirect('/');
    return;
  } else {
    const data = {
      entered: req.session.data.entered,
      pages: req.session.data.pages,
    };
    data.spend = Math.floor((Date.now() - data.entered) / 1000);
    data.spent = req.session.data.spent;
    function renderSpent(spent) {
      let text = '';
      let t = spent;
      if (t >= 86400) {
        let d = Math.floor(t / 86400);
        t -= d * 86400;
        text += `<span>${d} Day${d > 1 ? 's' : ''} </span>`;
      }
      if (t >= 3600) {
        let h = Math.floor(t / 3600);
        t -= h * 3600;
        text += `<span>${h} Hour${h > 1 ? 's' : ''} </span>`;
      }
      if (t >= 60) {
        let m = Math.floor(t / 60);
        t -= m * 60;
        text += `<span>${m} Minute${m > 1 ? 's' : ''} </span>`;
      }
      if ((t > 0 && spent > 0) || spent == 0) {
        let s = t;
        text += `<span>${s} Second${s > 1 ? 's' : ''}</span>`;
      }
      return text;
    }
    data.textspend = renderSpent(data.spend);
    data.textspent = renderSpent(data.spent);
    res.send(
      pug.render(escaped, {
        data: data,
        events: req.session.get('events'),
      })
    );
  }
});

export default router;
