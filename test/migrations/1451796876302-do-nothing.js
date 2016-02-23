module.exports = { 
    
    up: (Schema, Sequelize, Bluebird) => {
        return new Bluebird ((resolve, reject) => {
            resolve();
        });
    },
    
    
    down: (Schema, Sequelize, Bluebird) => {
        return new Bluebird ((resolve, reject) => {
            resolve();
        });
    }
    
};