const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId
const subcategorySchema = new mongoose.Schema({
    parentCategory:{
        type:ObjectID,
        required:true,
        ref:'Category'
    },
    slug:{ 
        type:String,
        required:true,
        unique:true
    },
    subcategoryname:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true});


const subCategory = mongoose.model('subCategory',subcategorySchema)
module.exports = subCategory;