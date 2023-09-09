const express = require( "express");
const multer = require('multer');


    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/")
    },

    filename: ( req, file, cb) => {
        cb(null, `pub-${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({ storage })



module.exports = upload