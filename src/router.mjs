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

router.get('/exit/:key', (req, res) => {
  if (!req.session.get('entered')) {
    res.redirect('/');
    return;
  } else {
    const data = {
      entered: req.session.data.entered,
      pages: req.session.data.pages,
    };
    let time = '';
    let spend = Date.now() - data.entered;
    if (spend > 1000 * 60 * 60 * 24) {
      let i = Math.floor(spend / (1000 * 60 * 60 * 24));
      time += `${i}일 `;
      spend -= i * 1000 * 60 * 60 * 24;
    }
    if (spend > 1000 * 60 * 60) {
      let i = Math.floor(spend / (1000 * 60 * 60));
      time += `${i}시간 `;
      spend -= i * 1000 * 60 * 60;
    }
    if (spend > 1000 * 60) {
      let i = Math.floor(spend / (1000 * 60));
      time += `${i}분 `;
      spend -= i * 1000 * 60;
    }
    if (spend > 1000) {
      let i = Math.floor(spend / 1000);
      time += `${i}초 `;
      spend -= i * 1000;
    }
    data.spend = time;
    res.send(
      pug.render(exit, {
        data: data,
        events: req.session.get('events'),
      })
    );
  }
});

export default router;
