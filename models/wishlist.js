const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId
const Item = require('./Item');
const User = require('./User')

const whishlistSchema = new mongoose.Schema({
    user:{
        type:ObjectID,
        required:true,
        ref:'User'
    },
    product:[{
        productId:{
        type:ObjectID,
        required:true,
        ref:'Item'
        
        }
    }]
})

const Wishlist = mongoose.model('Wishlist',whishlistSchema)
module.exports = Wishlist