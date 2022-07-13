const async = require("hbs/lib/async");

exports.adminMiddleware = async(req,res,next)=>{
    if(req.user.role!=='admin'){
        
    }
}

