import express from 'express';
import cors from 'cors';
import relations from './src/relations.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

import sequelize from './src/sequelize.js';

import authRoutes from './src/routes/auth.js';
import usersRoutes from './src/routes/users.js';
import barcodeRoutes from './src/routes/barcodes.js';
import softwareRoutes from './src/routes/software.js';
import hardwareRoutes from './src/routes/hardware.js';
import orderRoutes from './src/routes/orders.js';
import secureRoutes from './src/routes/secure.js';
import passport from 'passport';

import swaggerUI from "swagger-ui-express";
import swaggerJsdoc from 'swagger-jsdoc';

import './src/auth/auth.js';

const app = express();

const corsOptions = {
		origin: 'https://192.168.0.143:8080',
    optionsSuccessStatus: 200
};

if (!fs.existsSync('./static')) {
	fs.mkdirSync('./static');
}


if (!fs.existsSync('./static/files')){
	fs.mkdirSync('./static/files');
}

if (!fs.existsSync('./static/documents')){
	fs.mkdirSync('./static/documents');
}

app.use(cors(corsOptions));
app.use(express.json());

app.use('/static/documents', express.static(path.join(path.resolve(), 'static/documents')));
app.use('/static/files', express.static(path.join(path.resolve(), 'static/files')));

app.use('/', authRoutes);
app.use('/users', usersRoutes);
app.use('/software', softwareRoutes);
app.use('/hardware', hardwareRoutes);
app.use('/order', orderRoutes);
app.use('/barcodes', barcodeRoutes);
app.use('/users', passport.authenticate('jwt', {session: false}), secureRoutes);

relations();
sequelize.sync({alter: true, force: true});

var key = fs.readFileSync(process.cwd() + '/certs/server.key');
var cert = fs.readFileSync(process.cwd() + '/certs/server.crt');

var options = {
  key: key,
  cert: cert
};
const optionsSwagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Software and Hardware Manager API',
      version: '1.0.0',
    },
  },
  apis: [
		"./src/routes/*.js",
		"./src/models/*.js"
	],
};

const specs = await swaggerJsdoc(optionsSwagger);
app.use(
  "/swagger",
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true} )
);

http.createServer(app).listen(9000);
https.createServer(options, app).listen(9001);
