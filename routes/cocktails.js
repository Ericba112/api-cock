/******import des modules nécessaires */

const express = require('express')

/****import du model cocktails */
const Cocktail = require('../models/cocktail')

const checkTokenMiddleware = require('../jsonwebtoken/check')

//import router
var router = express.Router()

/*****definition du schema Cocktail pour swagger**/

/**
 * @swagger 
 * components:
 *  schemas:
 *      Cocktail:
 *          type: object
 *          required:
 *              - nom
 *              - description
 *              - composition
 *          properties:
 *              id: 
 *                  type: integer
 *                  description: Auto Inc pour id cocktail
 *              nom:
 *                  type: string
 *                  description: le nom du cocktail 
 *              description:
 *                  type: string
 *                  description: le nom du cocktail
 *              composition:
 *                  type: string
 *                  description: le pseudo du cocktail
 */

/**
 * @swagger
 * tags:
 *  name: Cocktails
 *  description: 
 */

/**
 * @swagger 
 * /cocktails:
 *  get:
 *      description: récup les cocktails
 *      tags: [Cocktails]
 *      responses:
 *          200: 
 *              description: tout va bien
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          item:
 *                               $ref: '#/components/schemas/Cocktail'
 *          401: 
 *              description: not auth
 *          500: 
 *              description: internal error
 * 
 */

//liste cocktails
router.get('/', (req, res) => {
    Cocktail.findAll()
        .then(cocktails => res.json({ data: cocktails }))
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})

/**
 * @swagger
 * /cocktails/{id}
 *  get:
 *      summary: get cocktail by id
 *      tags: [Cocktails]
 *      parameters: 
 *          - in : path
 *            name: id
 *            schema:
 *              type: string
 *              required: true
 *              description: a cocktail id
 *      responses:
 *          200: 
 *              description: tout va bien
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cocktail'
 *          401: 
 *              description: not auth
 *          404:
 *              description: cocktail not found
 *          500: 
 *              description: internal error
 *  
 *          
 */

//get one cocktail
router.get('/:id',(req, res) => {

    let cocktailId = parseInt(req.params.id)//le id dans url c un string
    // si le champ est present
    if (!cocktailId) {
        return res.status(400).json({ message: 'missing param' })
    }
    Cocktail.findOne({ where: { id: cocktailId }, raw: true })
        .then(cocktail => {
            if (cocktail === null) {
                return res.status(404).json({ message: 'cocktail not found' })
            }
            //cocktail found
            return res.json({ data: cocktail })
        })
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})

/**
 * @swagger
 * /cocktails:
 *  put:
 *      summary: pour creer cocktail
 *      tags: [Cocktails]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cocktail'
 *      responses:
 *          200:
 *              description: new cocktail
 *              content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cocktail'
 *          400:
 *              description: pas le bon id
 *          401: 
 *              description: non auth
 *          409: 
 *              description: cocktail existe deja
 *          500:
 *              description: Internal error database
 * 
 */

//add cocktail 
router.put('/', checkTokenMiddleware,(req, res) => {

    //validationdes données recues
    const userId = req.userId
    const { nom, description, composition } = req.body
    if (!nom || !description || !composition || !userId) {
        return res.status(400).json({ message: 'missing datas' })
    }
    req.body.id_user = userId
    Cocktail.findOne({ where: { nom: nom }, raw: true })
        .then(cocktail => {
            if (cocktail !== null) {
                return res.status(409).json({ message: `cocktail ${nom} existe déjà` })
            }

            Cocktail.create(req.body)
                .then(cocktail => res.json({ message: 'cocktail created', data: cocktail }))
                .catch(err => res.status(500).json({ message: 'database error', error: err }))

        })

        .catch(err => res.status(500).json({ message: 'database error', error: err }))


})

/**
 * @swagger
 * /cocktails/{id}:
 *  patch:
 *      summary: Pour modifier un cocktail
 *      tags: [Cocktails]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *              required: true
 *              description: A cocktail Id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cocktail'
 *      responses:
 *          200:
 *              description: Nouveau cocktail
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cocktail'
 *          400:
 *              description: Il manque des données
 *          401:
 *              description: Non authentifié
 *          409:
 *              description: Le cocktail existe déjà
 *          500:
 *              description: Internal error (database)
 *          
 */

//modify cocktail
router.patch('/:id', checkTokenMiddleware, (req, res) => {
    let cocktailId = parseInt(req.params.id)

    if (!cocktailId) {
        return res.status(400).json({ message: 'missing param' })
    }

    Cocktail.findOne({ where: { id: cocktailId }, raw: true })
        .then(cocktail => {
            if (cocktail === null) {
                return res.status(404).json({ message: 'unknown cocktail' })
            }
            Cocktail.update(req.body, { where: { id: cocktailId } })
                .then(cocktail => res.json({ message: 'cocktail updated' }))
                .catch(err => res.status(500).json({ message: 'database error', error: err }))
        })
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})

/**
 * @swagger
 * /cocktails/{id}:
 *  delete:
 *      summary: Remove cocktail
 *      tags: [Cocktails]
 *      parameters: 
 *          - in : path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: a cocktail id
 *      responses:
 *          204: 
 *              description: tout va bien             
 *          400: 
 *              description: not found
 *          500: 
 *              description: internal error
 */

//delete cocktail
router.delete('/:id', checkTokenMiddleware,(req, res) => {
    const cocktailId = parseInt(req.params.id)
    if (!cocktailId) {
        return res.status(400).json({ message: 'missing param' })
    }
    Cocktail.destroy({ where: { id: cocktailId } })
        .then(() => res.status(204).json({}))//rien à renvoyer
        .catch(err => res.status(500).json({ message: 'database error', error: err }))

})


module.exports = router