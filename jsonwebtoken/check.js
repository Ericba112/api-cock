/****import des modules */

const jwt = require ('jsonwebtoken')

/*****decodage token */
const extractBearer =  (authorization) =>{
    if(typeof authorization !== 'string'){
        return false
    }
    //on isole le token du mot bearer
    const matches = authorization.match(/(bearer)\s+(\S+)/i)
    return matches && matches[2]//la position ou il y le token
}


/***verif de la presence du token */

const checkTokenMiddleware= (req,res,next) =>{
    const token =req.headers.authorization && extractBearer(req.headers.authorization)//facon live de comparer 2 resultats
    if(!token){
        return res.status(401).json({message:'Unauthorized'})
    }
    //verif de la validite du token
    jwt.verify(token,process.env.JWT_SECRET,(err, decodedToken)=>{
        if(err){
            return res.status(401).json({message:'bad token'})
        }else{
            req.userId = decodedToken.id
            next()
        }
    })

}
module.exports=checkTokenMiddleware