# Gulp Sequelize Migrations

Sets up some basic Gulp tasks for doing Sequelize migrations (and creating migrations).


## Usage

In your Gulp file:

```javascript
const Gulp = require('gulp');
const sequelize = new Sequelize(...blah...);

require('gulp-sequelize-migrations')(Gulp, sequelize);
```


```javascript
const Gulp = require('gulp');
const sequelize = new Sequelize(...blah...);

require('gulp-sequelize-migrations')(Gulp, sequelize, {
    migrations_path: './migrations',
    models_path: './models'
});
```


## Testing

1. Create a Postgres database called `gulp_sequelize_migrations_test`.
2. Run `npm test`.