const jwt = require("jwt-simple")
const moment = require("moment")



const createToken = (user) => {   
    
    const payload ={
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        nick: user.nick,
        correo: user.correo,
        created_at: user.created_at,
        image: user.image,
        role: user.role,
        isActive: user.isActive,
        iat: moment().unix(),
        exp: moment().add(5, "hours").unix()
    }

    const token = jwt.encode(payload, process.env.JWT_SECRET)

    return token

}




module.exports =  {createToken}