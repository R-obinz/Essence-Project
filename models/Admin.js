const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcrypt');


const adminSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    // validate(value){
    //     if(!validator.isUsername(value)){
    //         throw new Error('Username is Invalid ')
    //     }
    // }
},
    password:{
        type:String,
        required:true,
        minlength:3,trim:true,
    // validate(value){
    //     if(value.toLowerCae().includes('password')){
    //         throw new Error('password musn\'t contain password')
    //     }
    // }
}
},{timestamps:true})

// adminSchema.methods.generateAuthToken = async function(){
//     const admin = this 
//     const token = jwt.sign({_id:admin._id.toString()},
//     process.env.JWT_SECRET)
//     admin.tokens = admin.tokens.concat({token})
//     await admin.save()
//     return token
// }

adminSchema.statics.findByCredentials= async(username,password)=>{
    const admin = await Admin.findOne({username})
    if(!admin){
        throw new Error('Admin doesnt exsist')
    }
    const isMatch = await bcrypt.compare(password,admin.password)
    if(!isMatch){
        throw new Error('Wrong Password')
    }
    return admin
}


adminSchema.pre('save',async function(next){
    const admin = this
    if(admin.isModified('password')){
        admin.password = await bcrypt.hash(admin.password,3)
    }
    next()
})

const Admin = mongoose.model('Admin',adminSchema)
module.exports= Admin