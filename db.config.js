/****************************************/
/*** Chargement des modules nécessaires */
const { Sequelize } = require('sequelize')
/************************************/

/*** Connexion à la base de données */
var sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    }
)


/*******************************************************/
/*** Synchornisation des modèles vers la BDD si besoin */
sequelize.sync()
module.exports = sequelize