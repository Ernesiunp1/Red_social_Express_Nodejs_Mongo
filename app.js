require("dotenv").config()
const express = require("express")
const cors = require("cors")
const conection = require("./database/conection")


const app = express()

// conectar a DDBB
conection()

// config cors
app.use(cors())


// parsear informacion recibida
app.use(express.urlencoded({extended: true}))
app.use(express.json())



// Ruta Real

const UserRoutes = require("./routes/user.routes");
const FollowRoutes = require("./routes/follow.routes");
const PublicationRoutes = require("./routes/publication.routes")


app.use("/api/user", UserRoutes)
app.use("/api/follow", FollowRoutes)
app.use("/api/publication", PublicationRoutes)




// ruta de pruebas
app.get('/', (req, res)=>{

    res.status(200).json({
        status: "ok",
        msg: "ruta de pruebas"
    })


})


app.listen(process.env.PORT_EXPRESS, ()=>{
    console.log("Escuchando express en el prueto 3000");
})