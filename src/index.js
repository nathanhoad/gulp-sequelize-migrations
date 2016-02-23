const Gulp = require('gulp');
const Util = require('gulp-util');
const Umzug = require('umzug');
const Sequelize = require('sequelize');
const Bluebird = require('bluebird');
const FS = require('fs');

const Inflect = require('i')();
const Args = require('yargs').argv;


var options = {
    migrations_path: './migrations',
    models_path: './server/models'
};


module.exports = (sequelize_instance, new_options) => {
    options = Object.assign({}, options, new_options);
    
    var umzug = new Umzug({
    	storage: 'sequelize',
    	storageOptions: {
    		sequelize: sequelize_instance,
    		tableName: 'schema_migrations'
    	},
    	migrations: {
    		params: [sequelize_instance.getQueryInterface(), Sequelize, Bluebird],
    		path: options.migrations_path,
    		pattern: /^\d+[\w-]+\.js$/
    	}
    });


    Gulp.task('migrate', () => {
        umzug.up().then((migrations) => {
            if (migrations.length == 0) {
                Util.log(Util.colors.gray('No migrations to run'));
                process.exit();
            } else {
                Util.log(Util.colors.green("Running migrations:"));
                migrations.forEach((migration) => {
                    Util.log("\t" + Util.colors.green(migration.file));
                });
                process.exit();
            }
        });
    });


    Gulp.task('migrate:rollback', () => {
        umzug.down().then((migrations) => {
            if (migrations.length == 0) {
                Util.log(Util.colors.gray('No migrations to run'));
            } else {
                Util.log(Util.colors.yellow("Rolling back:"));
                migrations.forEach((migration) => {
                    Util.log("\t" + Util.colors.yellow(migration.file));
                });
            }
            process.exit();
        });
    });


    Gulp.task('migration', (name) => {
        if (Args.name) {
            // Create migration
            var file_name = `${options.migrations_path}/${Date.now()}-${Inflect.dasherize(Args.name)}.js`;
            var template = TEMPLATE_MIGRATION;
            
            FS.writeFileSync(file_name, template);
            Util.log("Created new migration in " + file_name);
            
        } else if (Args.model) {
    		var table_name = Inflect.tableize(Args.model);
    		
    		// Create migration
            var file_name = `${options.migrations_path}/${Date.now()}-create-${Inflect.dasherize(table_name)}.js`;
            var template = TEMPLATE_MODEL_MIGRATION;
            
            template = template.replace(/{{TABLE}}/g, table_name);
            
            FS.writeFileSync(file_name, template);
            Util.log("Created new migration in " + file_name);
            
            // Write model file
            var file_name = `${options.models_path}/${Inflect.dasherize(Inflect.singularize(table_name))}.js`;
            var template = TEMPLATE_MODEL;
            
            template = template.replace(/{{TABLE}}/g, table_name);
            template = template.replace(/{{MODEL}}/g, Inflect.classify(Args.model));
            
            FS.writeFileSync(file_name, template);
            Util.log("Created new model in " + file_name);
            
        } else {
            Util.log("You need to specify a --name or --model argument");
            return;
        }
        process.exit();
    });
    
    return umzug;
}


const TEMPLATE_MIGRATION = "module.exports = { \n\
    \n\
    up: (Schema, Sequelize, Bluebird) => {\n\
        return new Bluebird ((resolve, reject) => {\n\
            // Do things\n\
            resolve();\n\
        });\n\
    },\n\
    \n\
    \n\
    down: (Schema, Sequelize, Bluebird) => {\n\
        return new Bluebird ((resolve, reject) => {\n\
            // Undo things\n\
            resolve();\n\
        });\n\
    }\n\
    \n\
};";


const TEMPLATE_MODEL_MIGRATION = "module.exports = { \n\
    \n\
    up: (Schema, Sequelize, Bluebird) => {\n\
        return new Bluebird ((resolve, reject) => {\n\
            Schema.createTable('{{TABLE}}', {\n\
                id: {\n\
                    type: Sequelize.UUID,\n\
                    defaultValue: Sequelize.UUIDV4,\n\
                    primaryKey: true\n\
                },\n\
                \n\
                // TODO: add other fields\n\
                \n\
                created_at: {\n\
                    type: Sequelize.DATE,\n\
                    defaultValue: Sequelize.NOW\n\
                },\n\
                updated_at: {\n\
                    type: Sequelize.DATE,\n\
                    defaultValue: Sequelize.NOW\n\
                }\n\
            }).then(() => {\n\
                Schema.addIndex('{{TABLE}}', ['created_at']);\n\
                Schema.addIndex('{{TABLE}}', ['updated_at']);\n\
                \n\
                resolve();\n\
            });\n\
        });\n\
    },\n\
    \n\
    \n\
    down: (Schema, Sequelize, Bluebird) => {\n\
        return new Bluebird ((resolve, reject) => {\n\
            Schema.dropTable('{{TABLE}}');\n\
            resolve();\n\
        });\n\
    }\n\
    \n\
};";


const TEMPLATE_MODEL = "const Sequelize = require('sequelize');\n\
const Model = require('server/models/model');\n\
    \n\
    \n\
var {{MODEL}} = Model.define('{{TABLE}}', {\n\
	id: {\n\
        type: Sequelize.UUID,\n\
        defaultValue: Sequelize.UUIDV4,\n\
        primaryKey: true\n\
    },\n\
    // TODO: define fields\n\
}, {\n\
    createdAt: 'created_at',\n\
    updatedAt: 'updated_at',\n\
});\n\
\n\
\n\
module.exports = {{MODEL}};";