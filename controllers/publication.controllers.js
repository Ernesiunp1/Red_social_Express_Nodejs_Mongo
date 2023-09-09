const express = require("express");
const { request, response } = require("express");
const Publication = require("../models/publication.model");
const fs = require("fs");
const path = require("path");
const usersImFollow = require("../services/followService")

const publication = async (req, res) => {
  res.status(200).json({
    status: "success",
    msg: "Accion de publicar",
  });
};

const create = async (req = request, res = respuesta) => {
  // Obtener valores del Usuario qu desea crear la publicacion
  const userId = req.user.id;

  // recoger valores del la publicacion
  const payload = req.body;

  // evaluar si viene el body correcto
  if (!payload) {
    return res.status(400).json({
      status: "Bad Request",
      msg: "Faltan datos en la request",
    });
  }

  // crear objeto a guardar
  const publication = new Publication(payload);
  // asignar usuario creador al objeto
  publication.user = userId;

  // guardar en base de datos
  try {
    const newPublication = await publication.save();

    res.status(201).json({
      status: "success",
      msg: "created",
      newPublication,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      msg: "Internal Server Error | Error al crear la publicación",
      error: error,
    });
  }
};

const userPublications = async (req, res) => {
  // extraer id del usuario
  const publicacionId = req.params.id;
  let itemsPerPage = 2;
  let page = 1;
  if (req.params.page) page = parseInt(req.params.page)


  try {

    const total = await Publication.countDocuments({ user : publicacionId })
    // crear un find de las publicaciones del usario
    const publicaciones = await Publication.find({ user : publicacionId })
                                            .sort("-created_at")
                                            .populate("user", "-__v -password -role -isActive -telefono -correo")
                                            .paginate(page, itemsPerPage)
                                            
    // si no hay publicaciones devolver un error
    if (publicaciones.length == 0) {
        return res.status(404).json({
            status: "OK",
            msg: "Not Found | No se encontraron publicaciones"
        });
    }
          
        

    //  devolver publicaciones del usuario
    return res.status(200).json({
      status: "OK",     
      total_publicaciones: total,
      page,
      publicaciones
    });


  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      msg: "Internal Server Error | Error al buscar publicaciones",
    });
  }
};

const detail = async (req, res) => {
  // capturar el id
  const id = req.params.id;
  console.log("este es el id", id);
  // si no existe devolver respuesta
  if (!id) {
    return res.status(400).json({
      status: "error",
      msg: "Bad Request | Falta Id en la request",
    });
  }

  // si existe hacer un find
  try {
    const publicacion = await Publication.findById(id);

    if (!publicacion) {
      return res.status(404).json({
        status: "error",
        msg: " Publication was not Found",
      });
    }
    // devolver Publicacion

    res.status(201).json({
      status: "success",
      publicacion,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      msg: "Internal Server Error | Error al buscar la publicación",
      error,
    });
  }
};

const remove = async (req = request, res = response) => {
  // extraer id a borrar
  const publicacionId = req.params.id;

  // extraer datos del identity
  const userId = req.user.id;

  // chequear que venga el id de la publicacion
  if (!publicacionId) {
    return res.status(400).json({
      status: "error",
      msg: "Bad request | falta id en la request",
    });
  }

  try {
    // hacer un find con el usuarioid y el id de la publicacion
    const publicacion = await Publication.findOneAndRemove({
      user: userId,
      _id: publicacionId,
    });

    // devolver error si no se consigio la publicacion
    if (!publicacion || publicacion.length == 0) {
      return res.status(404).json({
        status: "error",
        msg: "Publication Not Found",
      });
    }

    // devolver respuesta de borrado exitoso
    res.json({
      status: "success",
      msg: `publicacion con id: ${publicacionId} ha sido Eliminada`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      msg: "Internal Server Error | Error al eliminar la publicación",
    });
  }
};

const upload = async (req, res) => {

  // Obtener id de la publicacion
  const publicationId = req.params.id;

  // Recoger fichero de imagen y comprobar si llaga el file

  if (!req.file)
    return res.status(400).json({
      status: "Error",
      msg: " Bad Request | Falta imagen",
    });

  //  conseguir el nombre del archivo
  let image = req.file.originalname;

  //  sacar la extension del archivo
  const imageSplit = image.split(".");
  const extension = imageSplit[1];
  const extPermitidas = ["jpg", "jpeg", "png", "gif", "ico"];

  // comprobar extension
  if (!extPermitidas.includes(extension)) {
    const filePath = req.file.path;

    // si no es correcta borrar  erl archivo
    const fileDeleted = fs.unlinkSync(filePath);

    // Devolver respuesta
    return res.status(400).json({
      status: "error",
      msg: `Bad Request: extension ${extension} no permitida`,
    });
  }

  // si es correcta guardar imagen en base de datos
  try {
    const publicationToUpdate = await Publication.findByIdAndUpdate(
      {user: req.user.id, _id: publicationId},
      { file: req.file.filename },
      { new: true }
    );

    res.json({
      status: "Uploaded",
      publicacion: publicationToUpdate,
      file: req.file
    });

  } catch (error) {

    console.log(error);
    return res.status(500).json({
      status: " error",
      msg: "Internal Server Error",
    });

  }

};

const media = async (req =request, res = response) => {

  // obtener Parametro de imagen
  const imageParams = req.params.image

  // montar el path
  const imagePath = `./uploads/publications/${imageParams}`

  // comprobar que existe el archivo
  const existFile = fs.existsSync(imagePath)

  if (!existFile) {
      return res.status(404).json({
          status: "Error",
          msg: "Not Found | No extiste el archivo"
      });
  }

  // devolver el file
  return res.sendFile(path.resolve(imagePath))

}

const feed = async ( req = request, res = response ) => {
  
  let page = 1;
  // sacar pagina de la request
  if (req.params.page) page = req.params.page;

  // establecer items per page
  let itemsPerPage =  5;

  try {
    // sacar los ids de los usuarios que yo sigo como usuario logueado
    const followedByMe = await usersImFollow.follow_UserId(req.user.id);

    
    // Find a publicaciones con operador (in) , ordenar, popular, paginar
    const publicaciones = await Publication.find({ user: followedByMe.following})                                           
    .populate("user", "-password -role -__v -correo").sort({ created_at: -1})
    .skip((page - 1) * itemsPerPage) // Saltar las páginas anteriores
    .limit(itemsPerPage); // Limita
    
    // consultar cantidad de documento que se encuentran
    
    if (publicaciones.length === 0) {
      return res.status(404).json({
        status: "success",
        msg: "Not Found | No hay publicaciones para mostrar"    
      })
      
    }
    
    const totalDocuments = await Publication.countDocuments({user: followedByMe.following})
    const totalPages = Math.ceil(totalDocuments/itemsPerPage)   
    
    

    return res.status(200).json({
      status: " success",
      msg: "metodo feed",
      total: totalDocuments,
      actualPage: page,
      totalPages: totalPages,
      followByMe: followedByMe.following,
      publicaciones
    });



  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      msg: "Internal Server Exception | Error en el feed",
      error
    })
  }


 
}




module.exports = {
  publication,
  create,
  detail,
  userPublications,
  remove,
  upload,
  media,
  feed
};
