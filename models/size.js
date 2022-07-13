const mongoose = require('mongoose');

const sizeSchema = mongoose.Schema({
    size:{
        Type:String,
        required:true
    }
})