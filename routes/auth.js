/**import des modules nécessaires */

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


/********************* Import du model user */
const User = require('../models/user')

/****import du router */

let router = express.Router()

/***middleware pour loger les dates de requetes */
router.use((req, res, next) => {
    const event = new Date()
    console.log('Auth time:', event.toString())
    next()
})

/***********routage de la ressource(url) auth */
router.post('/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: 'bad email ou password' })
    }
    User.findOne({ where: { email: email }, raw: true })
        .then(user => {
            if (user === null) {
                return res.status(401).json({ message: 'pas le bon compte' })
            }


            bcrypt.compare(password, user.password)
                .then(test => {
                    if (!test) {
                        return res.status(401).json({ message: 'password wrong' })
                    }

                    const token = jwt.sign({
                        id: user.id,
                        // nom: user.nom,
                        // prenom: user.prenom,
                        // email: user.email
                    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURING })
                    return res.json({ access_token: token })
                })
                .catch(err => res.status(500).json({ message: 'loginprocessed failed', error: err }))
        })
        .catch(err => res.status(500).json({ message: 'database error', error: err }))
})

module.exports = router