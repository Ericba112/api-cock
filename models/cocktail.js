/****import des modules necessaires */
const {DataTypes} = require('sequelize')
const bdd = require('../db.config') 

/****definition du model cocktail */
const Cocktail = bdd.define('Cocktail', {
    id:{
        type:DataTypes.INTEGER(10),
        primaryKey:true,
        autoIncrement:true
    },
    id_user:{
        type:DataTypes.INTEGER(10)
             
    },
    nom:{
        type:DataTypes.STRING(100),
        defaultValue:'',
        allowNull:false
    },
    description:{
        type:DataTypes.STRING(100),
        defaultValue:'',
        allowNull:false
    },
    composition:{
        type:DataTypes.STRING(100),
        defaultValue:'',
        allowNull:false
    }
}, {paranoid:true})

module.exports = Cocktail