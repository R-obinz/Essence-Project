const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Robin:LqsJl6CJ5M8VOks3@essence.8iixx1c.mongodb.net/?retryWrites=true&w=majority", {
useNewUrlParser: true,
}).then(()=>{
    console.log('connection successful');
}).catch((error)=>{
    console.log('no connection');
})