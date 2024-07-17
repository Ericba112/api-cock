/******import des modules nécessaires */

const express = require('express')
const bcrypt = require ('bcrypt')


/****import du model user */
const User = require('../models/user')
const checkTokenMiddleware = require('../jsonwebtoken/check')

//import router
var router = express.Router()

/***middleware pour loger les dates de requetes */
router.use((req,res,next)=>{
    const event = new Date()
    console.log('user time', event.toString())
    next()
})


/*****definition du schema User pour swagger**/

/**
 * @swagger 
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - nom
 *              - prenom
 *              - pseudo
 *              - email
 *              - password
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: Auto Inc pour id user
 *              nom:
 *                  type: string
 *                  description: le nom du user 
 *              prenom:
 *                  type: string
 *                  description: le nom du user
 *              pseudo:
 *                  type: string
 *                  description: le pseudo du user
 *              email:
 *                  type: string
 *                  description: le mail du user
 *              password:
 *                  type: string
 *                  description: le password du user
 */

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: 
 */


//routage de la ressource users

/**
 * @swagger 
 * /users:
 *  get:
 *      description: récup les users
 *      tags: [Users]
 *      responses:
 *          200: 
 *              description: tout va bien
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          item:
 *                               $ref: '#/components/schemas/User'
 *          401: 
 *              description: not auth
 *          500: 
 *              description: internal error
 * 
 */


//liste users
router.get('/', checkTokenMiddleware, (req, res) => {
    User.findAll()
        .then(users => res.json({ data: users }))
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})
/**
 * @swagger
 * /users/{id}
 *  get:
 *      summary: get user by id
 *      tags: [Users]
 *      parameters: 
 *          - in : path
 *            name: id
 *            schema:
 *              type: string
 *              required: true
 *              description: a user id
 *      responses:
 *          200: 
 *              description: tout va bien
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          401: 
 *              description: not auth
 *          404:
 *              description: user not found
 *          500: 
 *              description: internal error
 *  
 *          
 */

//get one user
router.get('/:id', checkTokenMiddleware, (req, res) => {

    let userId = parseInt(req.params.id)//le id dans url c un string
    // si le champ est present
    if (!userId) {
        return res.status(400).json({ message: 'missing param' })
    }
    User.findOne({ where: { id: userId }, raw: true })
        .then(user => {
            if (user === null) {
                return res.status(404).json({ message: 'user not found' })
            }
            //user found
            return res.json({ data: user })
        })
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})

/**
 * @swagger
 * /users:
 *  put:
 *      summary: pour creer user
 *      tags: [Users]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: new user
 *              content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *          400:
 *              description: pas le bon id
 *          401: 
 *              description: non auth
 *          409: 
 *              description: user existe deja
 *          500:
 *              description: Internal error database
 * 
 */

//add user 
router.put('/', (req, res) => {

    //validationdes données recues
    const { nom, prenom, pseudo, email, password } = req.body
    if (!nom || !prenom || !pseudo || !email || !password) {
        return res.status(400).json({ message: 'missing datas' })
    }
    User.findOne({ where: { email: email }, raw: true })
        .then(user => {
            if (user !== null) {
                return res.status(409).json({ message: `user ${nom} existe déjà` })
            }
            bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))//salage du password(+compliqué)
                .then(hash => {
                    req.body.password = hash

                    User.create(req.body)
                        .then(user => res.json({ message: 'user created', data: user }))
                        .catch(err => res.status(500).json({ message: 'database error', error: err }))
                })
                .catch(err => res.status(500).json({ message: 'hash error', error: err }))
        })

        .catch(err => res.status(500).json({ message: 'database error', error: err }))



})

/**
 * @swagger
 * /users/{id}:
 *  patch:
 *      summary: Pour modifier un utilisateur
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *              required: true
 *              description: A user Id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: Nouvel utilisateur
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          400:
 *              description: Il manque des données
 *          401:
 *              description: Non authentifié
 *          409:
 *              description: L'utilisateur existe déjà
 *          500:
 *              description: Internal error (database)
 *          
 */

//modify user
router.patch('/:id', checkTokenMiddleware, (req, res) => {
    let userId = parseInt(req.params.id)

    if (!userId) {
        return res.status(400).json({ message: 'missing param' })
    }

    User.findOne({ where: { id: userId }, raw: true })
        .then(user => {
            if (user === null) {
                return res.status(404).json({ message: 'unknown user' })
            }
            User.update(req.body, { where: { id: userId } })
                .then(user => res.json({ message: 'user updated' }))
                .catch(err => res.status(500).json({ message: 'database error', error: err }))
        })
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})

/**
 * @swagger
 * /users/{id}:
 *  delete:
 *      summary: Remove user
 *      tags: [Users]
 *      parameters: 
 *          - in : path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: a user id
 *      responses:
 *          204: 
 *              description: tout va bien             
 *          400: 
 *              description: not found
 *          500: 
 *              description: internal error
 */

//delete user
router.delete('/:id', checkTokenMiddleware, (req, res) => {
    let userId = parseInt(req.params.id)
    if (!userId) {
        return res.status(400).json({ message: 'missing param' })
    }
    User.destroy({ where: { id: userId } })
        .then(() => res.status(204).json({}))//rien à renvoyer
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})


module.exports = router