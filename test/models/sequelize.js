const Sequelize = require('sequelize');

module.exports = new Sequelize('postgres://localhost:5432/gulp_sequelize_migrations_test', {
    logging: false
});