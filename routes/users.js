const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const async = require('hbs/lib/async');
const Category = require('../models/category');
const controller = require('../controllers/category');
const { getCategories } = require('../controllers/category');
const router = express.Router();
const otp = require('../controllers/otp');
const Cart = require('../models/cart');
require('dotenv').config()
const SSID=process.env.serviseSID
const ASID= process.env.accountSID
const AUID=process.env.authToken
const client = require('twilio')(ASID, AUID)

/* GET users listing. */
const cartController = require('../controllers/cart');
const Order = require('../models/order');
const payment = require('../controllers/payment')
const user = require('../controllers/user');
const Offer = require('../models/offers');
const Coupons = require('../models/coupons');
const Wishlist = require('../models/wishlist');


router.get('/', async(req, res, next)=> {
  try{
    const items = await Item.find({})
    controller.getCategories().then((categoryList)=>{
      req.session.categoryList = categoryList
    if(req.session.loggedIn  ){
      console.log(req.session.loggedIn);
      console.log('haiiiiii');
      
      res.render('user/index', {use:true,user:req.session.userData,items,categoryList})
    }
    else{
      res.render('user/index', {use:true,items,categoryList})
    };
  })
   
  }catch(error){
    res.status(400).send(error)
  }
  
});

router.get('/',getCategories)



router.get('/login',function(req,res,next){
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/User-login');
  }
  
});
router.get('/signup',function(req,res){
  res.render('user/signup');
})
router.post('/signup',async (req,res)=>{
  const user = new User(req.body)
  try{
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password:req.body.password,
          mobilenumber:req.body.mobileNumber,
          status:true
          
        })
        const register = await user.save();
         
        var Number = req.body.mobileNumber
        console.log(Number);
        req.session.phone=Number
        client.verify
        .services(SSID)
        .verifications
        .create({
          to:`+91${Number}`,
          channel:'sms'
        })
        .then((data)=>{
        
         
        
         let user=req.session.user
          
          // res.render('user/otp', { user })
          res.render('user/otp', { user })
        })
       

        // res.redirect('/');
      }catch(error){
        console.log(error);
        res.status(400).render('500')
        
      }
});

router.post('/login',async(req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.name,req.body.password) 

    req.session.userData=user; 
    console.log('55s0');
    console.log(user);
    req.session.loggedIn =true
   
      res.redirect('/');
    
   
  }catch(error){
    res.status(400).redirect('/login');
  }
})

router.get('/productdetails/:id',async(req,res)=>{
  try{
    const product = await Item.findById(req.params.id)
    console.log(product)

  res.render('user/single-product-details',{use:true,product,user:req.session.userData,categoryList:req.session.categoryList});
  
  }catch(error){
    res.status(400).redirect('/')
  }
   
})

router.get('/shop',async(req,res)=>{
  try{
    let cartcount = null;

    const items = await Item.find({})
    controller.getCategories().then((categoryList)=>{
      res.render('user/shop',{use:true,items,user:req.session.userData,categoryList});
    })
  }catch(error){
    res.status(400).render('500')
  }
 
  
})

router.get('/Tops/:id',async(req,res)=>{
  
  let cartcount = null;
console.log(req.params.id);
try{
  const items = await Item.find({subcategory:req.params.id})
  controller.getCategories().then((categoryList)=>{
    res.render('user/Tops',{use:true,items,user:req.session.userData,categoryList});
  })
}
 catch(err){
  res.render('404')
 }
  
})

router.get('/kurtas&kurtis/:id',async(req,res)=>{
  let cartcount = null;
console.log(req.params.id);
try{
  const items = await Item.find({subcategory:req.params.id})
  controller.getCategories().then((categoryList)=>{
    res.render('user/kurtas&kurtis',{use:true,items,user:req.session.userData,categoryList});
  })
}catch(err){
  res.render('404')
}
  
  
})


router.get('/logout',function(req,res){
  req.session.loggedIn=false;
  res.redirect('/login')
  console.log(req.session.loggedIn);
})

router.get('/otp',(req,res)=>{
  res.render('user/otp')
})


router.post('/otp-varify',(req,res)=>{
   var Number = req.session.phone
  console.log( "itho"+Number);
  var otps = req.body.number
  
  

  client.verify
    .services(SSID)
    .verificationChecks.create({
      to: `+91${Number}`,
      code: otps
    })
    .then((data) => {
      console.log(data.status + "otp status/*/*/*/");
      if(data.status=='approved'){
       
        res.redirect('/login')
       
    
      }else{
        
        otpErr = 'Invalid OTP'
        res.render('user/otp',{otpErr,Number})
      }
   
});

})



router.get('/cart',async(req,res)=>{
  if(req.session.loggedIn){
  const owner = req.session.userData._id
  try{
    
    user.getCart(owner).then(async(products)=>{
      console.log('aghgahghghghghghghg');
      console.log(products);
      let total= await user.totalPrice(req.session.userData._id)
      
    
      await User.findOne({_id:owner}).then((coupon)=>{
        if(coupon.Coupon){
          console.log('555555');
          console.log(coupon);
          let tot= total
          let discount =(tot*coupon.discount)/100
          console.log('2222');
          console.log(total);
          discountprice = (tot - discount)
          
          total = discountprice

          

          res.status(200).render('user/cart',{use:true,user:req.session.userData,products,total,categoryList:req.session.categoryList,discountprice,discount})
        }else{
         

          res.status(200).render('user/cart',{use:true,user:req.session.userData,products,total,categoryList:req.session.categoryList,})
        }
      })
      

      
      
    })
   

  }catch(error){
    res.status(500).render('500')
  }
}else{
  res.redirect('/login');
}
})

router.get('/add-to-cart/:id',async (req, res) => {
  try {
    if(req.session.loggedIn){
      console.log('jhjhgjyfytyftyftyfjtty');
    const owner = req.session.userData._id;
    const  itemId = req.params.id;
    await user.addtoCart(owner,itemId).then((result)=>{

      console.log('sssssssssssssssss');
      console.log(result);
      res.json({status:true})
    })
  
  }else{
    console.log('ddfdgyfddytdgfyfdhyc');
    res.json({status:false})
  } 
}catch (error) {
     console.log(error);
     res.status(500).render('500');
  }
});



router.get('/userprofile',async(req,res)=>{
  try{
    const user = req.session.userData;

    res.status(200).render('user/profile',{use:true,user:req.session.userData,categoryList: req.session.categoryList})
  }catch(err){
    res.status(400).render('500')
  }
 
})

router.get('/checkout',(req,res)=>{
  const owner = req.session.userData._id
  try{
    user.checkOut(owner).then(async(products)=>{
   
      let total = await user.totalPrice(req.session.userData._id) 
      
      let owner = req.session.userData._id
      await User.findOne({_id:owner}).then((coupon)=>{
        let address = coupon.address
        if(coupon.Coupon){
          console.log('555555');
          console.log(coupon);
          let tot= total
          let discount =(tot*coupon.discount)/100
          console.log('2222');
          console.log(total);
          discountprice = (tot - discount)
          total = discountprice
          
          res.status(200).render('user/checkout',{products,use:true,user:req.session.userData,total,address,categoryList: req.session.categoryList})
        }else{
          
       res.status(200).render('user/checkout',{products,use:true,user:req.session.userData,total,address, categoryList: req.session.categoryList })
        }})
  
      
     
    }) 
  }catch(error){
    res.status(200).render('400')
  }
  
 
})

router.post('/place-order',async(req,res)=>{
  console.log(req.body)
  
  try{
    req.session.orderdata =req.body
    const users = req.body.userId;
    const cart = await Cart.findOne({users})
    const products = cart.items
    let total = await user.totalPrice(req.session.userData._id)
     
    let usere = req.session.userData
    if(usere.Coupon){
      console.log('555555');
      
      let tot= total
      let discount =(tot*usere.discount)/100
      console.log('2222');
      console.log(total);
      discountprice = (tot - discount)
      total = discountprice

      const order = new Order({
        deliveryDetails:{
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          email:req.body.email,
          address:req.body.address,
          mobilenumber:req.body.mobilenumber,
          postcode:req.body.postcode
        },
        user:req.body.userId,
        paymentMethod:req.body.payment_method,
        products:products,
        bill:total,
      })
      await order.save();
      console.log(order._id)
      req.session.invoice = order._id
      await Cart.findOneAndDelete({user})

    if(req.body.payment_method =='cod'){
      console.log('djd');
      
      res.json({status:'cod'})
    }else if(req.body.payment_method =='razorpay') {
      
      await payment
      .generateRazorpay(order._id,order.bill).then((paymentResponse)=>{
        console.log('22222');
        console.log(paymentResponse);
        paymentResponse.status='razorpay',
        res.json(paymentResponse)
      })
    }else{
      await payment.generatePaypal(order._id,order.bill).then((paymentResponse)=>{
        console.log(paymentResponse);
        paymentResponse.status='paypal',
        res.json(paymentResponse)
      })
    }
    }else{
      const order = new Order({
        deliveryDetails:{
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          email:req.body.email,
          address:req.body.address,
          mobilenumber:req.body.mobilenumber,
          postcode:req.body.postcode
        },
        user:req.body.userId,
        paymentMethod:req.body.payment_method,
        products:products,
        bill:total,
      })
      await order.save();
      console.log(order._id)
      req.session.invoice = order._id
      await Cart.findOneAndDelete({user})

    if(req.body.payment_method =='cod'){
      console.log('djd');
      
      res.json({status:'cod'})
    }else if(req.body.payment_method =='razorpay') {
      
      await payment
      .generateRazorpay(order._id,order.bill).then((paymentResponse)=>{
        console.log('22222');
        console.log(paymentResponse);
        paymentResponse.status='razorpay',
        res.json(paymentResponse)
      })
    }else{
      await payment.generatePaypal(order._id,order.bill).then((paymentResponse)=>{
        console.log(paymentResponse);
        paymentResponse.status='paypal',
        res.json(paymentResponse)
      })
    }
    }

     

  }catch(error){
    console.log(error)
    res.status(400).render('500')
  }
 
})

router.post('/verify-payment',async(req,res)=>{
  console.log('hiiiiiiiiiiiiiiiiiiiii');
  console.log(req.body)
 await payment.verifyPayment(req.body).then(()=>{
    response = {
      orderId:req.body['order[recipt'],
      status:true
    }
    res.status(200).json(response)
  }).catch((err)=>{
    res.json({status:false})
  })
})

router.get('/success',(req,res)=>{
  try{
    let invoice = req.session.invoice
    user.getInvoice(invoice).then((result)=>{
      res.status(200).render('user/success',{use:true,result})
    })
  }catch(error){
    res.status(400).render('500')
  }
  
  
})

router.post('/change-product-quantity',(req,res)=>{
  try{
    user.changeQuantity(req.body).then(async(result)=>{
      result.subtotal = await user.totalPrice(req.session.userData._id)
      result.total = result.subtotal
      owner = req.session.userData._id
      await User.findOne({_id:owner}).then((coupon)=>{
        if(coupon.Coupon){
          console.log('555555');
          console.log(coupon);
          let tot= result.total
          let discount =(tot*coupon.discount)/100
          console.log('2222');
          discountprice = (tot - discount)
         result.discountprice = discountprice
         console.log('cjkjjjjjjjjjjjjjjjjjjjjjjjjjj');
         console.log(result);
         res.status(200).json(result)
        }else{
          console.log('msmamamamamamm');
          res.status(200).json(result)
        }})
      
     
    })
  }catch(error){
    res.status(400).render('500')
  }
 
})
router.post('/changepassword',async(req,res)=>{
  try{
    person = req.session.userData
    console.log(person);
    await user.changePassword(req.body,person).then((result)=>{
      res.status(200).redirect('/userprofile')
    })
  }catch(err){
    res.status(400).render('500')
  }
 
})

router.post('/remove',(req,res)=>{
  try{
    person = req.session.userData
    console.log('vvvvvvvvvvvvvvvvvvvv');
    user.removeFromCart(req.body).then((result)=>{
      res.status(200).json(result)
    })
  }catch(err){
    res.status(400).render('500')
  }
  
})

router.post('/updateprofile',async(req,res)=>{
  try{
    person = req.session.userData
    await user.updateProfile(req.body,person).then((result)=>{
      res.status(200).redirect('/userprofile')
    })
  }catch(error){
    res.status(400).render('500')
  }
 
})

router.get('/orders',(req,res)=>{
  try{
    person = req.session.userData
    owner = person._id
    console.log(owner);
    user.getOrder(owner).then((orders)=>{
      
    res.status(200).render('user/order',{orders,use:true,user:req.session.userData,categoryList:req.session.categoryList})
    })
  }catch(error){
    res.status(400).render('500')
  }
 
  
})


router.get('/cancel-order/:id', async (req, res) => {
  try {
      const order = req.params.id
      console.log(order);
      await Order.findByIdAndUpdate(order,{
        status:'Cancelled'
      })
      console.log(order);
      
      res.status(200).json({status:true})
  } catch (error) {
      res.status(400). render('500');
  }
});

router.post('/applyCoupon',(req,res)=>{
  try{
    console.log(req.body);
    user.applyCoupon(req.body,req.session.userData._id).then(async(response)=>{
    console.log('0020202');
   
      res.status(200).json({status:true})
    })
  }catch(error){
    res.render('500')
  }
})

router.post('/search',(req,res)=>{
  try{
    user.search(req.body.search).then((pro)=>{
      console.log(pro);
      res.status(200).render('user/shop',{categoryList:req.session.categoryList,use:true,pro})
    })
  }catch(error)
  {
    res.render('500')
  }
})

router.get('/AllCollections',async(req,res)=>{
  try{
  let items=  await Item.find()
  res.status(200).render('user/AllProduct',{use:true,items})
  }catch(error){
    res.status(400).render('500')
  }
})

router.get('/whishlist',async(req,res)=>{
 
  try{
    let userid = req.session.userData._id
    user.getWishlist(userid).then((products)=>{
      res.status(200).render('user/wishlist',{user:req.session.userData,use:true,categoryList:req.session.categoryList,products})
    })
  }catch(error){
    res.status(400).render('500')
  }
  
  
})

router.get('/return-order/:id',async(req,res)=>{
  try {
    const order = req.params.id
    console.log(order);
    await Order.findByIdAndUpdate(order,{
      status:'Returned'
    })
    
    
    res.status(200).json({status:true})
} catch (error) {
    res.status(400). render('500');
}
})


router.get('/deliveryAddress/:id',(req,res)=>{
  let Id = req.params.id
  user.getAddress(Id)
})

router.post('/user-profileaddress',(req,res)=>{
  try{
    let address= req.body
    user.addAddress(address).then((response)=>{
      res.status(200).redirect('/userprofile')
    })
  }catch(err){
    res.status(400).render('500')
  }
 
})

router.get('/addtoWishlist/:id',(req,res)=>{
  try{
    let product = req.params.id
    let userid=req.session.userData._id
    user.addtoWishList(product,userid).then((response)=>{
      console.log(response);
      res.status(200).redirect('/')
    })
  }catch(err){
    res.status(400).render('500')
  }
 
})

router.post('/removeFrom-wishlist',async(req,res)=>{
  try {
    
    const pro = req.body.proId
    const id = req.body.id
    console.log(pro);
    console.log(id);
    await Wishlist.updateOne({_id:id},{
      $pull:{
        product:{
          productId:pro
        }
      }
    })
    
    
    res.status(200).json({status:true})
} catch (error) {
    res.status(400). render('500');
}
})

module.exports = router;
