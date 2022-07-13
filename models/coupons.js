const mongoose = require('mongoose')
const couponSchema = mongoose.Schema({
    couponCode:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    }
})

const Coupons = mongoose.model('Coupons',couponSchema)
module.exports = Coupons
