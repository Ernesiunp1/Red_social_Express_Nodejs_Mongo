const moment = require("moment")
const {request, response} = require("express")
const jwt = require("jwt-simple")

const auth = ( req= request, res = response, next ) => {

    // verificar si viene token en la request
    if (!req.headers.authorization)
    return res.status(403).json({ status: "ERROR", msg: "Unauthorized | bad resquest | no token"})

    // limpiar token
    const jwt_cleaned = req.headers.authorization.replace(/["'\s]|Bearer/g, '')   


    try {
       
        // decodificar JWT
        const payload = jwt.decode(jwt_cleaned, process.env.JWT_SECRET)

        // verificar si esta vencido el JWT
        if (payload.exp <= moment().unix()) 
        return res.status(400).json({ status: "error", msg: "token expirado"})

        // Insertar en la request el objeto usuario
        req.user = payload

        // pasar a la siguente accion
        next()
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "error",
            msg: "ERROR DECODIFICANTO TOKEN",
            error
        })
        
    }


    // decodificar token
   


}


module.exports = auth