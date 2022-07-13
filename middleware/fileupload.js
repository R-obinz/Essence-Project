
const multer = require("multer");

// const fileStorageEngine = multer.diskStorage({
//     destination:(req,res,cb)=>{
//         cb(null,'./image');
    
//     },
//     filename:(req,file,cb)=>{
//         cb(null,Date.now()+"--" + file.originalname);
//     }
// });

// const upload = multer({storage:fileStorageEngine});
const path =require('path')


const storage = multer.diskStorage({

  destination: (req,file,cb)=>{
     cb(null,'./public/images')
  },
  filename: (req, file, cb) => {
  //  path.extname(file.originalname.substr(file.originalname.lastIndexOf('.')) )
      console.log(file)
    cb(
      // null,  Date.now() + path.extname(file.originalname)
      null,file.fieldname +"_"+Date.now()+path.extname(file.originalname)
    );
  },
});

//init upload

  const upload= multer({
    storage:storage
  })

module.exports= upload
