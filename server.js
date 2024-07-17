//chargement des modules necessaire

const express = require('express')
const cors = require('cors')
const swaggerJsDoc = require ('swagger-jsdoc')
const swaggerUi = require ('swagger-ui-express')
const checkTokenMiddleware = require('./jsonwebtoken/check')

/*****import connexion db** */
var db = require('./db.config')


//démarrage server
const app = express()

// use server
app.use(cors())
//communiquer en json
app.use(express.json())

app.use(express.urlencoded({ extended: true }))

/**mise en place swagger */
const swaggerOptions = {
    definition:{
        openapi:'3.0.0',
        info: {

        version:'1.0.0',
        title: 'Cocktail API',
        description: 'Cocktails API infos',
        contact:{name:'dani'}
    },
    servers:[
        {url: `http://localhost:${process.env.SERVER_PORT}`}
    ]
    
},
apis: ['./routes/*.js']//indiquer ou se trouve l'api
}

const swaggerDocs =swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve,swaggerUi.setup(swaggerDocs))

let user_router=require('./routes/users')
let auth_router=require('./routes/auth')
let cocktail_router=require('./routes/cocktails')
//mise en place du routage
app.get('/', (req, res) => res.send('I\'m online yeahhh'))

app.use('/users', user_router)
app.use('/auth', auth_router)
app.use('/cocktails', cocktail_router)

//et de l'erreur
app.get('*', (req, res) => res.status(501).send('WTF?????'))



/***Démarrage du server avec test BDD préalable */
db.authenticate()//declanche un select bidon mais ca suffit pour verif
    .then(() => {
        console.log('database connexion ok')
    })
    .then(() => {
        //bdd ok on démarre le server
        app.listen(process.env.SERVER_PORT, () => {
            console.log(`the server is running nicely on port ${process.env.SERVER_PORT}`)
        })

    })
    .catch(err => {
        console.log('database error:', err)
    })