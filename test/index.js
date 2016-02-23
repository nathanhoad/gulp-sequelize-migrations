const Async = require('async');
const FS = require('fs');
const exec = require('child_process').execSync;
const Should = require('should');
const Gulp = require('gulp');

const sequelize = require('./models/sequelize');


// NOTE: The lib is loaded in gulpfile.js


describe('Migrations:', function () {
    this.timeout(10000);
    
    
    beforeEach((done) => {
        Async.series({
            database (_done) {
                sequelize.getQueryInterface().dropTable('schema_migrations')
                    .then(() => _done())
                    .catch(() => _done());
            },
            
            migrations (_done) {
                FS.readdirSync(`${__dirname}/migrations`).sort().forEach(function (file) {
                    if (file != '1451796876301-print-a-log.js' && file != '1451796876302-do-nothing.js') {
                        FS.unlinkSync(`${__dirname}/migrations/${file}`);
                    }
                });
                _done();
            },
            
            models (_done) {
                FS.readdirSync(`${__dirname}/models`).sort().forEach(function (file) {
                    if (file != 'sequelize.js') {
                        FS.unlinkSync(`${__dirname}/models/${file}`);
                    }
                });
                _done();
            }
        }, () => {
            done();
        });
    });
    
    
    describe('Gulp migrate', () => {
        it('should run any pending migrations', (done) => {
            var output = exec('gulp migrate').toString();
            
            Should(output).containEql('Running migrations:');
            Should(output).containEql('1451796876301-print-a-log.js');
            Should(output).containEql('1451796876302-do-nothing.js');
            
            done();
        });
    })
    
    
    describe('creating a new migration', () => {
        it('should create a new migration file', (done) => {
            var output = exec('gulp migration --name=do_the_thing').toString();
            
            Should(output).containEql('Created new migration in');
            Should(output).containEql('-do-the-thing.js');
            
            var migration_file_name = output.match(/(\d+\-do-the-thing\.js)/gm)[0];
            FS.access(`${__dirname}/migrations/${migration_file_name}`, FS.F_OK, (err) => {
                Should(err).be.null();
                
                output = exec('gulp migrate').toString();
                
                Should(output).containEql('Running migrations:');
                Should(output).containEql('-do-the-thing.js');
                
                done();
            });
        });
    });
    
    
    describe('creating a new model', () => {
        it('should create a new migration file and a new model file', (done) => {
            sequelize.getQueryInterface().dropTable('things').then(() => {
                var output = exec('gulp migration --model=thing').toString();
                
                Should(output).containEql('Created new migration in');
                Should(output).containEql('-create-things.js');
                
                Should(output).containEql('Created new model in');
                Should(output).containEql('thing.js');
                
                var migration_file_name = output.match(/(\d+\-create-things\.js)/gm)[0];
                FS.access(`${__dirname}/migrations/${migration_file_name}`, FS.F_OK, (err) => {
                    Should(err).be.null();
                    
                    FS.access(`${__dirname}/models/thing.js`, FS.FS_OK, (err) => {
                        Should(err).be.null();
                        
                        output = exec('gulp migrate').toString();
                        
                        Should(output).containEql('Running migrations:');
                        Should(output).containEql('-create-things.js');
                        
                        done();
                    });
                });
            });
        });
    });
});