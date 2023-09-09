const { model, Schema} = require("mongoose");
const moment = require("moment");



const UserSchema = Schema({

    nombre: {
        type: String,
        required: true
    },

    apellido: {
        type: String,
        default:"S/A"  
    },
    
    Bio: String,

    nick: {
        type: String,
    },

    password: {
        type: String,
        required: true,

    },

    image: {
        type: String,
        default: "default.png"
    },

    correo: {
        type: String,
        unique: true,
        required: true
    },

    telefono: {
        type: Number,
        required: true
    },

    role: {
        type: String,
        default: "user_role"
    },

    isActive: {
        type: Boolean,
        default: true
    },

    created_at: {
        type: Date,
        default: Date.now()
    }

})


module.exports = model("User", UserSchema, "users")