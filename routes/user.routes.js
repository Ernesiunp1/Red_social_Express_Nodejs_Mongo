const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controllers");
const Auth = require("../middlewares/auth");
const upload = require("../middlewares/upload.mid");
 


router.get("/users", [Auth], UserController.user);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", [Auth], UserController.profile);
router.get("/list/:page?/:limit?", [Auth], UserController.list);
router.put("/update", [Auth], UserController.update);
router.post("/upload", [Auth, upload.single("file0")], UserController.upload);
router.get("/avatar/:image?", [Auth], UserController.avatar);



module.exports = router;
