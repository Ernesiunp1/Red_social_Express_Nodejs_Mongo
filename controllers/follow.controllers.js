const express = require("express");
const {request, response} = require("express");
const Follow = require("../models/follow.model");
const { paginate } = require("mongoose-pagination")
const followService = require("../services/followService")




const follow = async (req , res ) => {
    
    res.status(200).json({
        status: 'success',
        msg: "Accion de follow"
    })

}

const save = async (req = request, res = response) => {
  // Obtener usuario a seguir
  const followed = req.body.followed;

  // obtener datos de usuario que sigue
  const user = req.user.id;

  try {
    // Verificando si ya se sigue al usuario
    const validarFollow = await Follow.find({ user, followed });

    if (validarFollow.length > 0)
      return res.status(400).json({
        status: "error",
        msg: `Bad Request | Ya se sigue al usuario ${followed}`,
      });

    // crear el objeto que se va a guardar con el modelo
    const seguimiento = {
      followed,
      user,
    };

    // Preparando instancia del modelo
    const follows = new Follow(seguimiento);

    // guardando en DDBB
    await follows.save();

    res.json({
      status: "success",
      msg: "Accion de salvar follow",
      identity: req.user,
      follows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      msg: "Ha ocurrido un error en el guardado",
    });
  }
};

const unFollow = async (req = request, res = response) => {
  // recibir id del usuario que se dejara de seguir
  const followedId = req.params.unfollowId;

  // obtener id del usuario que esta haciendo la peticion
  const userId = req.user.id;

  try {
    // buscar en DDBB el registro con la conicidencia:

    const registro = await Follow.find({ user: userId, followed: followedId });

    // si no existe coincidencia devolver mensaje
    if (!registro || registro.length <= 0) {
      return res.status(404).json({
        status: "error",
        msg: `Bad Request | no se sigue al usuario ${followedId} `,
      });
    }

    // si existe eliminar registro
    await Follow.deleteOne({ _id: registro[0]._id });

    return res.status(200).json({
      status: "success",
      msg: "Registro Eliminado Exitosamente",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: "error",
      msg: "Internal Server Exception",
    });
  }
};


// Listado de usuarios que cualquier usuario esta siguiendo ( siguiendo )

const following = async (req = request, res = response) => {

  // Obtener identidad del usuario autenticado
  const userId = req.user.id

  // Obtener id del usuario a consultar los seguidos 
  if(req.params.id) user = req.params.id

  // comprobar si me llega la pagina como parametro; sino sera la 1 por defecto
  let page = 1
  if (req.params.page) page =  req.params.page

  // Setear cantidad usuarios por paginas que quiero consultar
  let usersPerPage = 5

  const documentsCounts = await Follow.countDocuments({user: userId})

  // popular los datos de los usuarios en el listado y paginar con mongoose paginate

  const listFolloweds = await Follow.find({user : userId})
                                    .populate("user followed", "-correo -password -role -__v")
                                    .paginate(page, usersPerPage)

  //  listado de usuarios que siguen en comun a un usuario tercero y a mi y cuales yo sigo
  let followUserId = await followService.follow_UserId(req.user.id)
  
  const pages = Math.ceil(documentsCounts/usersPerPage)


  return res.status(200).json({
    status: "success",
    msg: "listado de usuarios que estoy siguiendo",
    total: documentsCounts,
    pages,    
    listFolloweds,
    user_im_follows: followUserId.following,
    user_follow_me : followUserId.follower
  });

}


// Listo de usuarios que siguen a cualquier otro usuario ( seguido )

const followers = async (req = request, res = response) => {
  return res.status(200).json({
    status: "success",
    msg: "listado de usuarios que me siguen"
  });

}





module.exports = {
    follow,
    save,
    unFollow,
    following,
    followers
}