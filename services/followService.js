const Follow = require("../models/follow.model")

const follow_UserId = async (userIdentity) => {

    let following = await Follow.find({ user : userIdentity})
                                .select("-_id followed" )
    let follower = await Follow.find({ followed : userIdentity})
                                .select("-_id user" )

    let followingClean = []
    following.forEach((follow) => {
        followingClean.push(follow.followed)
    })


    let followerClean = []
    follower.forEach( follow => {
        followerClean.push(follow.user)
    })


    return {following: followingClean, follower: followerClean}


}

const followThisUSer = async ( userIdentity, profileUserId) => {

    let following = await Follow.findOne({ user : userIdentity, followed: profileUserId })
    

    let follower = await Follow.findOne({ user: profileUserId , followed : userIdentity })
 

    return { following, follower}

}


module.exports = {
    follow_UserId, 
    followThisUSer
    
}                                       