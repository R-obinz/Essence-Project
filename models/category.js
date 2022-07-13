
const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId
const categorySchema = new mongoose.Schema({
    categoryname:{
        type:String,
        required:true,
        trim:true
    },slug:{ 
        type:String,
        required:true,
        unique:true
    },
    subcategory:[
        {  subcatid:{
            type:ObjectID,
            ref:'subCategory'
        },
          subcatname:{
            type:String,
            ref:'subCategory'
        }
        }
    ]

},{timestamps:true});

const Category = mongoose.model('Category',categorySchema)
module.exports = Category