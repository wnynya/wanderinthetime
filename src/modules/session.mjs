'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Crypto from '@wnynya/crypto';

const file = path.resolve(__dirname, '../../data/sessions.json');
let sessions = JSON.parse(fs.readFileSync(file));

function update() {
  fs.writeFileSync(file, JSON.stringify(sessions));
}

export default () => {
  let options = {
    name: 's',
    cookie: {
      domain: '.wanderinthetime.amuject.com',
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'None',
    },
  };
  return (req, res, next) => {
    req.session = {};

    // 쿠키에서 세션 ID 가져오기
    let sid = req.cookies[options.name];

    // 세션 ID 가 있는 경우
    if (sessions[sid]) {
      const session = sessions[sid];
      req.session.id = sid;
      req.session.data = session.data;
    } else {
      req.session.id = Crypto.uid();
      req.session.data = {};
    }

    req.session.get = (key) => {
      return req.session.data[key];
    };

    req.session.set = (key, data) => {
      req.session.data[key] = data;
      req.session.save();
    };

    req.session.delete = (key) => {
      delete req.session.data[key];
      req.session.save();
    };

    req.session.save = () => {
      if (!sessions[req.session.id]) {
        sessions[req.session.id] = {};
      }

      sessions[req.session.id].data = req.session.data;

      // 세션 ID 쿠키 설정
      res.cookie('s', req.session.id, {
        domain: '.wanderinthetime.amuject.com',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'None',
      });

      update();
    };

    req.session.destroy = () => {
      delete sessions[req.session.id];

      res.cookie('s', req.session.id, {
        domain: '.wanderinthetime.amuject.com',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'None',
        expires: new Date(0),
      });

      update();
    };

    next();
  };
};
