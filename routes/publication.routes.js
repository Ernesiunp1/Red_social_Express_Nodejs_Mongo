const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication.controllers")
const Auth = require("../middlewares/auth")
const upload = require("../middlewares/upload.post")

 


router.get("/publication", PublicationController.publication);
router.post("/create" , [Auth] ,PublicationController.create);
router.get("/detail/:id" , [Auth] ,PublicationController.detail);
router.get("/list/:id/:page?" , [Auth] ,PublicationController.userPublications);
router.delete("/remove/:id" , [Auth] ,PublicationController.remove);
router.post("/upload/:id" , [Auth, upload.single("file0")] ,PublicationController.upload);
router.get("/media/:image?", [Auth], PublicationController.media);
router.get("/feed/:page?", [Auth], PublicationController.feed);


module.exports = router