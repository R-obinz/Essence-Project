const Category = require('../models/category');
const slugify = require('slugify');
const subCategory = require('../models/subcategory');
const { default: mongoose } = require('mongoose');
const Offer = require('../models/offers');

// function createCategories(categories,parentId=null){
//     const categoryList = [];
//     let category;
//     if(parentId == null){
//        category= categories.filter(cat => cat.parentId == undefined);
//     }else{
//         category = categories.filter(cat => cat.parentId ==parentId )
//     }

//     for(let cate of category){
//         categoryList.push({
//             _id:cate._id,
//             categoryname: cate.categoryname,
//             slug:cate.slug,
//             children: createCategories(categories,cate._id)
//         })
//     }
//     return categoryList
// }



exports.addCategory =async(req,res)=>{
    try{

        const cat = new Category({
            categoryname:req.body.categoryname,
            slug:slugify(req.body.categoryname)
            
            
          })
          const create = await cat.save();
          res.status(200).json({status:true})

    }catch(error){
        console.log(error);
        res.json({status:false}).status(400)
    }
}

exports.addsubCategory =async(req,res)=>{
    try{
        console.log(req.body);
        const subCat = new subCategory({
            subcategoryname:req.body.subcategoryname,
            slug:slugify(req.body.subcategoryname),
            parentCategory:req.body.catid
           
        })
       
      const reg= await subCat.save().then(async(result)=>{
        console.log('+++++aaaa');
      console.log(result);
      let ids=result._id
      console.log(ids);
      console.log('ssa255');
      console.log(result.parentCategory);
      let vari= await Category.updateOne(
        { _id: result.parentCategory },  
        { $push: { subcategory:{
            subcatid:ids,
            subcatname:result.subcategoryname
        }}
          } 
        //   {upsert:true}
       );
     console.log(vari);
    console.log('ssssaaallllaa')
    res.status(201).json({status:true})
      })
        
    }catch(error){
        res.status(400).send('already exsists');
    }
}
exports.getCategories = async(req,res)=>{
     
      return new Promise(async(resolve,reject)=>{
//        const categoryList= await Category.aggregate([
//         {
//             $unwind:'$subcategory'
//         },
    
//         {
//             $project:{
                
//                 categoryname:'$categoryname',
//                 subcatid:'$subcategory',
//              }
//         },
//         {
//             $lookup:{
//                 from:subCategory.collection.name,
//                 localField:'subcatid',
//                 foreignField:'_id',
//                 as:'subcat'
//             }
//         },
//         {
//             $project:{
//                 categoryname:1,subcat:{$arrayElemAt:['$subcat',0]}
//             }
//         }
    
// ])
       let categoryList = await Category.find({});

       console.log(categoryList);
        resolve(categoryList);
    })

    
}


exports.editCategory = async(req,res)=>{
    try{
       let catId = req.body.catid
       let name = req.body.categoryname
        await Category.findByIdAndUpdate(catId,
            {$set:{
                categoryname: name
            }})
        
          res.status(200).json({status:true})

    }catch(error){
        console.log(error);
        res.json({status:false}).status(400)
    }
}

exports.subCategory =async(req,res)=>{
    try{
       let subcat= await subCategory.find()
       let offer= await Offer.find({})
       await this.getCategories().then((cat)=>{
        console.log(cat);
        res.status(200).render('admin/admin-subcategory',{admi:true,subcat,cat,offer})
       })
      

    }catch(error){

    }
}

exports.editSubCategory = async(req,res)=>{
    try{
        console.log(req.body);
       let subcatId = req.body.subcatid
       let name = req.body.subcategoryname
        await subCategory.findByIdAndUpdate(subcatId,
            {$set:{
                subcategoryname: name
            }})
        
          res.status(200).json({status:true})

    }catch(error){
        console.log(error);
        res.json({status:false}).status(400)
    }
}

exports.showCategories = async(req,res)=>{
    try{
        await subCategory.aggregate([
            {
                $project:{

                }
            }
        ])
    }catch(error){

    }
}