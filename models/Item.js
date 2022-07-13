const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const itemSchema = new mongoose.Schema({
    owner :{
        type:ObjectId,
        // required:true,
        ref:'Admin'
    },
    productname: {
        type:String,
        required:true,
        
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:ObjectId,
        required:true,
        ref:'category'
    },
    subcategory:{
        type:ObjectId,
        required:true,
        ref:'subcategory'
    },
    price:{
        type:Number,
        
    },
    image:{
        
        type:String,
        required:true
        
    
    },
    Qty:{
        type:Number,
        default:1
    },
    offerPrice:{
        type:Number
    },
    status:{
        type:Boolean
    },
    discountpercentage:{
        type:Number
    }
    
    

},
{timestamps:true})




const Item = mongoose.model('Item', itemSchema)
module.exports = Item