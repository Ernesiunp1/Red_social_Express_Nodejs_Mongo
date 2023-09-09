const express = require("express");
const { request, response } = require("express");
const bcrypt = require("bcrypt");
const { createToken } = require("../services/jwt.services");
const { paginate } = require("mongoose-pagination");
const fs = require("fs");
const followService = require ("../services/followService")

const User = require("../models/user.model");

const user = async (req, res) => {
  res.status(200).json({
    status: "success",
    msg: "Accion de usuario",
    user: req.user,
  });
};

const register = async (req = request, res = response) => {
  // recoger datos de la request
  const params = req.body;
  params.correo.toLowerCase();
  params.nick.toLowerCase();

  // validar que los datos lleguen bien
  if (
    !params.nombre ||
    !params.password ||
    !params.correo ||
    !params.telefono
  ) {
    return res.status(400).json({
      status: "Bad request",
      msg: "Faltan datos en la request",
    });
  }

  const user_to_save = new User(params);

  // validar que no exista el usuario en la DDBB

  try {
    const validarUser = await User.find({
      $or: [
        { correo: params.correo.toLowerCase() },
        { nick: params.nick.toLowerCase() },
      ],
    });

    // Validando si el usuario existe
    if (validarUser.length >= 1) {
      return res.status(400).json({
        status: "ERROR",
        msg: "USUARIO YA EXISTE",
      });
    }

    // cifrando contraseña de usuario
    user_to_save.password = bcrypt.hashSync(user_to_save.password, 10);

    // guardando en DDBB
    await user_to_save.save();

    // Objeto a retornar en respuesta
    userData = {
      nombre: user_to_save.nombre,
      apellido: user_to_save.apellido,
      nick: user_to_save.nick,
      telefono: user_to_save.telefono,
      _id: user_to_save._id,
      created_at: user_to_save.created_at,
    };

    // SI TODO SALE BIEN respuesta
    return res.status(200).json({
      status: "success",
      msg: "USUARIO CREADO",
      userData,
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      msg: "ERROR AL REALIZAR LA CONSULTA",
    });
  }
};

const login = async (req = request, res = response) => {
  try {
    // recoger parametros
    const { password, correo } = req.body;

    // Validar que llegue todos los parametros
    if (!password || !correo) {
      return res
        .status(400)
        .json({ status: "Error", msg: "Bad request | faltan datos" });
    }

    // Buscar en base de datos si existe el usuario
    const user = await User.findOne({ correo });
    if (!user)
      return res
        .status(401)
        .json({ status: "Unauthorized", msg: "correo invalido" });

    // Comparar contraseña
    let passValidator = bcrypt.compareSync(password, user.password);
    if (!passValidator)
      return res
        .status(401)
        .json({ status: "Unauthorized", msg: "password invalido" });

    // crear JWT
    const token = createToken(user);

    // devolver usuario y JWT
    // const jwt = false

    const userData = {
      _id: user.id,
      name: user.name,
      nick: user.nick,
      correo: user.correo,
      telefono: user.telefono,
    };

    res.json({
      status: "success",
      msg: "accion de login",
      user: userData,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      msg: "ha ocurrido un error en el login",
      error,
    });
  }
};

const profile = async (req = request, res = response) => {
  try {
    // recoger el id de los params
    const id = req.params.id;    
    console.log(id);

    // buscar usuario en la base de datos y filtrar la respuesta        
      const user = await User.findById(id).select(
        "-role -isActive -created_at -__v -password"
      );

 

    // si no se encuentra el usuario
    if (!user) {
      return res.status(404).send({
        status: "error",
        msg: "User not found",
       
      });
    }

    // devolver informacion de seguimiento

    const followInfo = await followService.followThisUSer(req.user.id, id)

    // si todo sale bien, retornamos el perfil del usuario
    return res.status(200).json({
      status: "success",
      user,
      following: followInfo.following,    
      follower: followInfo.follower
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      msg: "Error al buscar profile",
    });
  }
};

const list = async (req = request, res = response) => {
  try {
    let itemsPerPage = 10;
    params = req.params;

    if (req.params.limit) {
      itemsPerPage = parseInt(req.params.limit);
    }

    let page = 1;
    if (params.page) {
      page = parseInt(params.page);
    }

      // Realizamos la busqueda ordenamos por id y filtramos lo que no queremos
    const totalItems = await User.countDocuments();

    const list = await User.find()
      .sort("_id")
      .skip((page - 1) * itemsPerPage)
      .paginate(page, itemsPerPage)
      .select("-correo -password -isActive -created_at -__v");

    // si la lista esta vacia
    if (list.length == 0)
      return res.status(404).json({
        status: "404 Not found",
        msg: "No hay registros que mostrar",
      });

    res.json({
      total: totalItems,
      page,
      itemsPerPage,
      list,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "internal Server Error",
      error: "Error a listar los usuarios",
    });
  }
};

const update = async (req = request, res = response) => {
  // recoger info a actualizar
  let userIdentity = req.user;
  let userToUpdate = req.body;
  // Eliminar campos sobrantes
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.image;
  delete userToUpdate.role;

  // comprobar si el usuario existe
  try {
    const validarUser = await User.find({
      $or: [
        { correo: userToUpdate.correo.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    let userIsset = false;
    validarUser.forEach((user) => {
      if (user && user.id != userIdentity.id) userIsset = true;
    });

    // Validando si el usuario existe
    if (userIsset) {
      return res.status(400).json({
        status: "ERROR",
        msg: "USUARIO YA EXISTE",
      });
    }

    // cifrando contraseña de usuario
    if (userToUpdate.password) {
      userToUpdate.password = bcrypt.hashSync(userToUpdate.password, 10);
    }

    const newUser = await User.findByIdAndUpdate(
      {_id: userIdentity.id},
      userToUpdate,
      { new: true }
    );

    return res.json({
      status: "success",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      error: "Internal Server Error",
    });
  }
};

const upload = async (req, res) => {
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
    const userToUpdate = await User.findByIdAndUpdate(
      {_id: req.user.id},
      { image: req.file.filename },
      { new: true }
    );

    res.json({
      status: "Uploaded",
      userToUpdate,
    });

  } catch (error) {

    console.log(error);
    return res.status(500).json({
      status: " error",
      msg: "Internal Server Error",
    });

  }

};

const avatar = async (req =request, res = response) => {

    // obtener Parametro de imagen
    const imageParams = req.params.image

    // montar el path
    const imagePath = `./uploads/avatars/${imageParams}`

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




module.exports = {
  user,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar
};
