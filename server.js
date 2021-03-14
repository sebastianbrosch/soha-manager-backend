import express from 'express';
import cors from 'cors';
import relations from './src/relations.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

import settings from './settings.js';
import sequelize from './src/sequelize.js';

import authRoutes from './src/routes/auth.js';
import usersRoutes from './src/routes/users.js';
import softwareRoutes from './src/routes/software.js';
import hardwareRoutes from './src/routes/hardware.js';
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

app.use(cors(corsOptions));
app.use(express.json());

app.use('/static', express.static(path.join(path.resolve(), 'uploads')))

app.use('/', authRoutes);
app.use('/users', usersRoutes);
app.use('/software', softwareRoutes);
app.use('/hardware', hardwareRoutes);
app.use('/users', passport.authenticate('jwt', {session: false}), secureRoutes);

relations();
sequelize.sync();
//sequelize.sync({alter: true});
//sequelize.sync({force: true});

//app.listen(settings.server.port, () => console.log(`Server is running on http://localhost:${settings.server.port}`));

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
  apis: ["./src/routes/*.js"],
};

const specs = await swaggerJsdoc(optionsSwagger);
app.use(
  "/swagger",
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true} )
);

http.createServer(app).listen(9000);
https.createServer(options, app).listen(9001);
