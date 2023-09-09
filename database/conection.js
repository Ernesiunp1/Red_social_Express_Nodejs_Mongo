const mongoose = require("mongoose")


const conection = async ()=>{

    try {
       await mongoose.connect("mongodb://localhost:27017/newRedSocial")

        console.log("Conectado a DDBB MongoDB");
        
    } catch (error) {
        console.log(error);
    }

}



module.exports = conection