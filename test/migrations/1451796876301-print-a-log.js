module.exports = { 
    
    up: (Schema, Sequelize, Bluebird) => {
        return new Bluebird ((resolve, reject) => {
            console.log("\tUp");
            resolve();
        });
    },
    
    
    down: (Schema, Sequelize, Bluebird) => {
        return new Bluebird ((resolve, reject) => {
            console.log("\tDown");
            resolve();
        });
    }
    
};