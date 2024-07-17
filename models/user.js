
/****import des modules necessaires */
const {DataTypes} = require('sequelize')
const bdd = require('../db.config') 

/****definition du model user */

const User = bdd.define('User', {
    id:{
        type:DataTypes.INTEGER(10),
        primaryKey:true,
        autoIncrement:true
    },
    nom:{
        type:DataTypes.STRING(100),
        defaultValue:'',
        allowNull:false
    },
    prenom:{
        type:DataTypes.STRING(100),
        defaultValue:'',
        allowNull:false
    },
    pseudo: {
        type: DataTypes.STRING(100),
        allowNull:false,
        unique:true
    },
    email:{
        type:DataTypes.STRING,
        validate:{
            isEmail:true //ici validation
        }
    },
    password:{
        type:DataTypes.STRING(64),
        is:/^[0-9a-f]{64}$/i   //ici contrainte par rapport au hachage
    }

}, {paranoid:true})

module.exports =User
 