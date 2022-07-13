const mongoose = require('mongoose');
const offerSchema = new  mongoose.Schema({

    offerCode :{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    }

},{
    timestamps:true
})

const Offer = mongoose.model('Offer',offerSchema)
module.exports = Offer