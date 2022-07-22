const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const orderSchema = new mongoose.Schema({
    deliveryDetails:{
        firstname:{type:String,
        required:true},
        lastname:{type:String},
        email:{
            type:String,
            required:true
        },
        address:{type:String,
        required:true},
        mobilenumber:{
            type:Number,
            required:true
        },
        postcode:{
            type:Number,
            required:true
        }
    },
    user:{
        type:ObjectId,
        required:true,
        ref:'User'
    },
    products:{
       
        
    },
    paymentMethod:{
        required:true,
        type:String,
    },
    Discount:{
        type:String
    },
    bill:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:'Placed'
    }
   

},{
    timestamps:true
})

const Order = mongoose.model('Order', orderSchema)
module.exports = Order