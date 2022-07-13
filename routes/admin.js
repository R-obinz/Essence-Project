const express = require('express');
const async = require('hbs/lib/async');
// const {token} = require('morgan');
const Admin = require('../models/Admin');
// const Auth = require('../middleware/auth');
const res = require('express/lib/response');
const Item = require('../models/Item');
const cookieParser = require('cookie-parser');
const User = require('../models/User');
const router = express.Router();
const session = require('express-session');
const upload = require('../middleware/fileupload');
const fs = require('fs');
const path = require('path');
const {getusers, offer} = require('../controllers/admin');
const Order = require('../models/order');
const admin = require('../controllers/admin');
const controller = require('../controllers/category');
const { addCategory, getCategories,addsubCategory,editCategory,subCategory,editSubCategory } = require('../controllers/category');
const Category = require('../models/category');
const sCategory = require('../models/subcategory');
const Offer = require('../models/offers');
const { off } = require('process');
const Coupons = require('../models/coupons');
const { default: mongoose } = require('mongoose');


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('admin/admin-login');
});

router.post('/', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.username, req.body.password);
        req.session.adminData = admin;
        req.session.loggedIn = true
        res.redirect('admin/adminpanel');
    } catch (error) {
        console.log('e' + error)
        res.render('admin/admin-login',);

    }
});


router.get('/user', getusers());


router.get('/adminpanel', async (req, res) => {
    let COD = await admin.codAmount()
    console.log(COD);
    let orders = await admin.totalOrders()
    let Razorpay = await admin.razorPay()
    let userCount = await admin.userCount()
    let datas = await admin.data()
    let topseller = await admin.TopSelling()
    console.log(datas);
    res.render('admin/admin-index', {
        admi: true,
        ad: true,COD,orders,Razorpay,userCount,datas,topseller
    })
})
const getproducts = async (req, res) => {
    try {
        const items = await Item.aggregate([
            {
                $project:{
                    productid:'$_id',
                    productname:'$productname',
                    description:'$description',
                    catid:'$category',
                    subcatid:'$subcategory',
                    price:'$price',
                    image:'$image',
                    status:'$status'
                }
                
            },{
                $lookup:{
                    from:Category.collection.name,
                    localField:'catid',
                    foreignField:'_id',
                    as:'category'
                }
            },{
                $lookup:{
                    from:sCategory.collection.name,
                    localField:'subcatid',
                    foreignField:'_id',
                    as:'subcategory'
                }
            },
            {
                
                    $project:{
                       status:1,productid:1,productname:1,description:1,price:1,image:1, categoryname:{$arrayElemAt:['$category',0]},subcategoryname:{$arrayElemAt:['$subcategory',0]}
                    }
                
            }
        ])

        console.log(items)

       let offer= await Offer.find({})
        res.status(200).render('admin/admin-products', {
            admi: true,
            items,offer
        });
    } catch (error) {
        res.status(400).render('admin/admin-products', {
            admi: true,
            ad: true
        });
    }
    // res.render('admin/admin-products')
}
 router.get('/products', getproducts)



router.get('/logout', async (req, res) => {
    res.render('admin/admin-login',);
})

// router.post('/logout',Auth,async(req,res)=>{
// try{
//     req.admin.tokens = req.admin.tokens.filter((token)=>{
//       return token.token !==req.toekn
//     })
//     await req.admin.save()
//     res.send().render('admin/admin-login')
// }catch(error){
//     res.status(500).send()
// }
// })
router.get('/addproduct', async (req, res) => {
    try{
        const categories = await Category.find({})
        const subCat = await sCategory.find({})
        res.status(200).render('admin/admin-productadd', {
            admi: true,
            categories,subCat
        });
    }catch(error){
        res.status(400)
    }
   
})

router.post('/addproduct', upload.single('Image'), async (req, res) => { 
    try {
        console.log(req.body);
        const newItem = new Item({

            owner: req.body.owner,
            productname: req.body.productname,
            description: req.body.description,
            category: req.body.catid,
            subcategory:req.body.subcatid,
            price: req.body.price,
            image: req.file.filename,
            Qty:req.body.quantity
            
            // image :{
            //     data:fs.readFileSync(path.join( 'image/' + req.file.filename,'base64')),
            //     Type:'image/png'
            // }
        })
        // let image =req.files.Image
        // image.mv('./images/'+id+'jpg',(err,done)=>{
        // if(!err){
        //     console.log('image uploaded sucessfully');
        // }else{
        //     console.log('not uploaded');
        // }
        // })

        console.log(req.body.name);
        const yes = await newItem.save()
        res.status(201).render('admin/admin-index', {admi: true})
    } catch (error) {
        res.status(400).send({
            message: "error" + error
        })
        console.log(error)
    }
})


router.get('/block/:id', async (req, res, next) => {
    try {
        const user = req.params.id
        await User.findByIdAndUpdate(user, {
            $set: {
                status: "false"
            }
        });
        res.redirect('/admin/user')
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})


router.get('/unblock/:id', async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                status: "true"
            }
        });
        res.status(200).redirect('/admin/user')
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

router.get('/delete-product/:id', async (req, res) => {
    try {
        const product = req.params.id
        await Item.findByIdAndDelete(product);
        res.status(200).redirect('/admin/products');
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/edit-product/:id', async (req, res) => {
    try {
        const items = await Item.findById(req.params.id)
        // const categories = await Category.find({})
        res.status(200).render('admin/admin-editproduct', {items, admi: true});
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/edit-product/:id', upload.single('Image'), async (req, res) => {
    try {

        console.log('\n\nhgfhfhgfghf' + req.params.id)
        console.log(req.body.productname)
        const product = await Item.updateOne({
            _id: req.params.id
        }, {
            $set: {
                productname: req.body.productname,
                price: req.body.price,
                category: req.body.category,
                description: req.body.description,
                image: req.file.filename
            }

        }).then((data) => {
            console.log(data),
            res.status(200).redirect('/admin/products')
        })

    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
})

router.get('/orders',async(req,res)=>{
    // const orders= await Order.find({})
    admin.getAllOrder().then((orders)=>{
        console.log(orders);
        res.status(200).render('admin/admin-orders',{orders,admi:true})
    })

    
})

router.get('/cancel-order/:id', async (req, res) => {
    try {
        const order = req.params.id

        await Order.findByIdAndUpdate(order,{
          status:'Cancelled'
        })
        
        res.status(200).redirect('/admin/orders');
    } catch (error) {
        res.status(400).send(error);
    }
  });
  router.get('/deletecategory/:id',async(req,res)=>{
     
    try{
            
        const category = req.params.id
        await Category.findByIdAndDelete(category);
        res.status(200).json({status:true})   
   
}catch(error){
    console.log(error);
    res.status(400).send(error);
}    
  })

  router.get('/category',async(req,res)=>{
    try{
        controller.getCategories().then((categoryList)=>{
            console.log(categoryList);
             res.status(200).render('admin/admin-category',{admi:true,categoryList})
        })
    }catch(error){
        res.status(400).send(error);
    }
})
// router.get('/addcategory',async(req,res)=>{
//     const categories = await Category.find({})
//     res.render('admin/admin-addnewcategory',{admi:true})
// })

router.post('/addcategory',addCategory);

router.post('/editcategories',editCategory);

router.get('/subcategory',subCategory);

// router.get('/addnewsubcategory',async(req,res)=>{
//     res.status(200).render('admin/admin-addnew-subcategory',{admi:true})
// })

router.post('/addsubcategory',addsubCategory);

router.get('/deleteSubCategory/:id',async(req,res)=>{
    try{
        console.log(req.params.id);
        const subCat = req.params.id
        await sCategory.findByIdAndDelete(subCat)
        res.status(200).json({status:true})   

    }
    catch(error){
        console.log(error);
        res.status(400)
    }
});

router.post('/editSubCategories',editSubCategory);

router.get('/offers',async(req,res)=>{
    try{
        let offer = await Offer.find({});
        res.status(200).render('admin/admin-offers',{admi:true,offer})
    }catch(error){

    }
   
})

router.post('/Offers',async(req,res)=>{
    try{
        console.log(req.body);
        admin.createOffer(req.body).then((result)=>{
            res.status(200).json({result})
        })
    }catch{

    }
})
router.get('/deleteOffer/:id',async(req,res)=>{
    try{
        const offer = req.params.id
        await Offer.findByIdAndDelete(offer)
        res.status(200).json({status:true})   
    }catch(err){
        res.status(400)
    }
})

router.post('/applyOffer',(req,res)=>{
    try{
        console.log(req.body);
        admin.applyoff(req.body).then(()=>{

            res.status(200).redirect('/admin/products')
        })
    }catch(err){

    }
})

router.post('/applyCatOffer',(req,res)=>{
    try{
        console.log(req.body);
        // admin.applyoffer(req.body).then(()=>{

        //     res.status(200).redirect('/admin/subcategory')
        // })
        res.status(200).redirect('admin/subcategory')
    }catch(err){

    }
})

router.get('/couponOffers',(req,res)=>{
    try{
        admin.getCoupons().then((coupons)=>{
            
            res.status(200).render('admin/admin-coupon',{admi:true,coupons})
        })
    }catch(error){
        res.status(400)
    }
})

router.post('/addCoupon',(req,res)=>{
    try{
        
        admin.addCoupons(req.body).then((result)=>{
            res.status(200).json({status:true})
        })
    }catch(error){
        res.status(400)
    }
})

router.get('/deleteCoupon/:id',async(req,res)=>{
    try{
        const coupon = req.params.id
        await Coupons.findByIdAndDelete({_id:coupon})
        res.status(200).json({status:true}) 
    }catch(error){
        res.status(400)
    }
})

router.get('/salesReport',async(req,res)=>{
    try{
        let totalAmount = await admin.data()
        admin.getAllOrder().then((list)=>{

            res.status(200).render('admin/admin-salesReport',{admi:true,list,totalAmount})
        })
    }catch(error){
        res.status(400)
    }
})

router.post('/takeReport',async(req,res)=>{
    try{
        let from = new Date(req.body.start)
        let end = new Date(req.body.end)
        let month = end.getMonth()
console.log("hjhjgjhg");
let sum =await admin.Summ(from,end)
        admin.getDateReport(from,end).then((list)=>{
            
            res.status(200).render('admin/admin-DateReport',{list,admi:true,sum})
        })
    }catch{
res.status(400)
    }
})

router.post('/updateStatus',async(req,res)=>{
    console.log(req.body);
    let stat = req.body.selected
  let update=  await Order.updateOne({_id:mongoose.Types.ObjectId( req.body.ID)},{
        $set:{
            status:stat
        }
    }).then((rep)=>{
    
    res.status(201).json({status:true})
    })

    
})
module.exports = router;
