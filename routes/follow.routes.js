const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow.controllers")
const Auth = require("../middlewares/auth")


router.get("/follow", FollowController.follow);
router.post("/save", [Auth] ,FollowController.save);
router.delete("/unfollow/:unfollowId", [Auth] ,FollowController.unFollow);
router.get("/following/:id?/:page?", [Auth] ,FollowController.following);
router.get("/followers/:id?/:page?", [Auth] ,FollowController.followers);



module.exports = router