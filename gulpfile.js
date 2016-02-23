const Gulp = require('gulp');
const sequelize = require('./test/models/sequelize');


require('./lib')(Gulp, sequelize, {
    migrations_path: `${__dirname}/test/migrations`,
    models_path: `${__dirname}/test/models`
});