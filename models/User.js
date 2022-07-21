const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcrypt');
const Item = require('./Item');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        trim:true,
        lowercase:true
    },
    email: {
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        // validate( value){
        //     if(!validator.isEmail(value)){
        //         throw new Error('Email is invalid')
        //     }
        },
    
    password: {
        type: String,
        required:true,
        minlength:3,
        trim:true,
        // validate(value){
        //     if(value.toLowerCase().includes('password')){
        //         throw new Error('password musn\'t contain password')
        //     }
        // }
    },
    mobilenumber:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    Coupon:{
        type:Boolean
    },
    discount:{
        type:Number
    },
    Code:{
        type:String
    },
    addresses:[{
        Name:{
            type:String
        },
        Number:{
            type:Number
        },
        Email:{
            type:String
        },
        address:{
            type:String
        },
        city:{
            type:String
        },
        pincode:{
            type:Number
        }
    }]
    
    // cart:{
    //     items:[{
    //         itemId:{
    //             type:mongoose.Types.ObjectId,
    //             ref:'Item',
    //             required:true
    //         },
    //         qty:{
    //             type:Number,
    //             required:true
    //         }
    //     }],
    //     totalPrice: Number
    // }
},

{
    timestamps:true
})



userSchema.statics.findByCredentials = async(name,password)=>{
    const user = await User.findOne({name})
    if(!user){
        throw new Error('Invalid Username or Password')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Invalid Username or Password')
    }
    
    return user
}

userSchema.pre('save',async function (next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,3)
    }
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User