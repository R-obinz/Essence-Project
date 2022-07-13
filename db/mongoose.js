const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/Shopping", {
useNewUrlParser: true,
}).then(()=>{
    console.log('connection successful');
}).catch((error)=>{
    console.log('no connection');
})