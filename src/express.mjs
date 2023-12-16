'use strict';

import config from './config.mjs';
const dev = process.argv.includes('-dev');

/* __dirname and __filename */
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';

const app = express();

/* Body (JSON) parser */
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: 104857600 }));

/* Set middlewares */
import middlewares from '@wanyne/express-middlewares';

app.use(middlewares.headers(config.headers)); // Custom response headers

/* Set static files (src/public) */
app.use(express.static(path.resolve(__dirname, './public')));

app.use(middlewares.cookies()); // Cookie parser
app.use(middlewares.client()); // Client infomations
app.use(middlewares.JSONResponses()); // JSON response functions

import session from './modules/session.mjs';

app.use(session()); // Session

/* Set root router */
import router from './router.mjs';
app.use('/', router);

/* Set 404 */
app.all('*', (req, res) => {
  res.status(404).send('NOTHING HERE');
});

export default app;
