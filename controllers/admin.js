const User = require('../models/User');
const Order = require('../models/order');
const Item = require('../models/Item');
const async = require('hbs/lib/async');
const res = require('express/lib/response');
const Offer = require('../models/offers');
const Coupons = require('../models/coupons');


module.exports={
    
    getusers :()=>async (req, res) => {
        try {
            const users = await User.find({})
            console.log(users)
            res.status(200).render('admin/admin-users', {
                admi: true,
                users
            });
        } catch (error) {
            res.status(400).render('500');
        }
    
    },
    
    getAllOrder:()=>{
    return new Promise(async(response,reject)=>{
        try{
            let order = await Order.aggregate([
                {
                    $unwind:'$products'
                },
            
                {
                    $project:{
                        item:'$products.itemId',
                        quantity:'$products.quantity',
                        status:'$status',
                        paymentMethod:'$paymentMethod',
                        address:'$deliveryDetails.address',
                        user:'$user',
                        email:'$deliveryDetails.email',
                        phone:'$deliveryDetails.mobilenumber',
                        Date: { $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$createdAt"
                          }}
                    }
                },
                {
                    $lookup:{
                        from:Item.collection.name,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },{
                    $lookup:{
                        from:User.collection.name,
                        localField:'user',
                        foreignField:'_id',
                        as:'name'
                    }
                },
                {
                    $project:{
                        Date:1,phone:1,email:1,address:1,paymentMethod:1,status:1,item:1,quantity:1,name:{$arrayElemAt:['$name',0]},product:{$arrayElemAt:['$product',0]}
                    }
                },{
                    $project:{
                       Date:1,phone:1,email:1,address:1,paymentMethod:1,status:1, item:1,quantity:1,product:1,name:1,subtotal:{$sum:{$multiply:['$quantity','$product.price']}}
        
                    }
                }
            
        ]).sort({_id:-1})
        console.log(order.name);
        response(order)
        }catch(error){
            reject(error)
        }
        
    })
},
codAmount:()=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let total = await Order.aggregate([
                {$match:{
                    paymentMethod:'cod'
                }},
                {
                    $group:{
                        _id:null,
                        
                            count:{
                                $sum:1
                            }
                        
                    }
                }
            ])
            console.log(total);
            resolve(total[0].count)
        }catch(err){
            reject(err)
        }
        
    })
},
totalOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let total = await Order.aggregate([
          
                {
                    $group:{
                        _id:null,
                        
                            totalOrders:{
                                $sum:1
                            }
                        
                    }
                }
                
            ])
            console.log(total);
            resolve(total[0].totalOrders)
        }catch(err){
            reject(err)
        }
       
    })
},
razorPay:()=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let total = await Order.aggregate([
                {$match:{
                    paymentMethod:'razorpay'
                }},
                {
                    $group:{
                        _id:null,
                        
                            RazorPay:{
                                $sum:1
                            }
                        
                    }
                }
            ])
            console.log(total);
            resolve(total[0].RazorPay)
        }catch(err){
            reject(err)
        }
        
    })
},
userCount:()=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let total = await User.aggregate([
          
                {
                    $group:{
                        _id:null,
                        
                            TotalUsers:{
                                $sum:1
                            }
                        
                    }
                }
            ])
            console.log(total);
            resolve(total[0].TotalUsers)
        }catch(err){
            reject(err)
        }
        
    })
},
data:()=>{
    return new Promise (async(resolve,reject)=>{
        try{
            let total = await Order.aggregate([
                {
                    $group:{
                        _id:null,
                        totals:{
                            $sum:"$bill"
                        },
                       
                    }
                }
            ])
            resolve(total[0].totals)
        }catch(err){
            reject(err)
        }
       
    })
},

offer:()=>{ 
    async(req,res)=>{
        try{
            return new Promise(async(resolve,reject)=>{

            })
            res.status(200).render('admin/admin-offers')
        }catch{
            res.status(400)
        }
    }
},

createOffer:(Data)=>{
    
    return new Promise(async(resolve,reject)=>{
        try{
            const offer = new Offer({
                offerCode :Data.offercode,
                discount : Data.discount
            })
           await offer.save().then((response)=>{
            console.log(response);
            resolve(offercreated=true)
          })
        }catch(error){
            reject(error)
        }
           
          

       
    })

},



applyoff:(Data)=>{
    
    
        return new Promise(async(resolve,reject)=>{
            try{
                let ds= await Offer.findOne({_id:Data.offerid})
                let discount = ds.discount

         let pPrice =   await Item.findOne({_id:Data.itemid})
            let price = pPrice.price

            let offerPrice = (price*discount)/100
            let discountPrice = (price-offerPrice)
            console.log(discountPrice);

              let ok=  await Item.updateOne({_id:Data.itemid},{
                    $set:{
                     offerPrice:discountPrice,
                     discountpercentage:discount,
                     status:true
                    }
                    
                }).then((response)=>{
                    resolve(response)
                })
            }catch(error){
                reject(error)
            }
           

            
        })
    
},


applyoffer:(Data)=>{
    
    
        return new Promise(async(resolve,reject)=>{
            try{
                let ds= await Offer.findOne({_id:Data.offerid})
                let discount = ds.discount
            console.log(discount);
            console.log('3696');
         let pPrice =   await Item.find({_id:Data.subcat})
            console.log('523');
            console.log(pPrice);
            let price = pPrice.price
            console.log('300');
            console.log(price);
            let offerPrice = (price*discount)/100
            console.log('333');
            console.log(offerPrice);
            let discountPrice = (price-offerPrice)
            console.log(discountPrice);

              let ok=  await Item.updateMany({
                    $set:{
                     offerPrice:discountPrice,
                     discountpercentage:discount,
                     status:true
                    }
                    
                }).then((response)=>{
                    resolve(response)
                })

            }catch(error){
                reject(error)
            }
           
            
        })
    
},

getCoupons:()=>{
    try{
        return new Promise(async(resolve,reject)=>{
            await Coupons.find({}).then((response)=>{
                resolve(response)
            })
        })
    }catch(error){
        reject(error)
    }
},
addCoupons:(Data)=>{
    
    return new Promise(async(resolve,reject)=>{
        try{ let coupons = await new Coupons({
            couponCode: Data.couponcode,
            discount: Data.discount
           })
           await coupons.save().then((response)=>{
            resolve(response)
           })
        }catch(error){
            reject(error)
        }
      
    })
},

getDateReport:(From,To)=>{
    return new Promise(async(res,rej)=>{
        console.log('11');
        console.log(From);
        console.log(To);
        try{
            let reportArray  = await Order.aggregate([
                {$match:{createdAt:{$gte:From,$lte:To}}},
                {
                    $unwind:'$products'
                },
            
                {
                    $project:{
                        item:'$products.itemId',
                        quantity:'$products.quantity',
                        status:'$status',
                        paymentMethod:'$paymentMethod',
                        address:'$deliveryDetails.address',
                        user:'$user',
                        email:'$deliveryDetails.email',
                        phone:'$deliveryDetails.mobilenumber',
                        Date: { $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$createdAt"
                          }}
                    }
                },
                {
                    $lookup:{
                        from:Item.collection.name,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },{
                    $lookup:{
                        from:User.collection.name,
                        localField:'user',
                        foreignField:'_id',
                        as:'name'
                    }
                },
                {
                    $project:{
                        Date:1,phone:1,email:1,address:1,paymentMethod:1,status:1,item:1,quantity:1,name:{$arrayElemAt:['$name',0]},product:{$arrayElemAt:['$product',0]}
                    }
                },{
                    $project:{
                       Date:1,phone:1,email:1,address:1,paymentMethod:1,status:1, item:1,quantity:1,product:1,name:1,subtotal:{$sum:{$multiply:['$quantity','$product.price']}}
        
                    }
                }
            
        ])
        console.log(reportArray);
        res(reportArray)
        }catch(error){
            rej(error)
        }
    })
},
Summ:(From,To)=>{
    return new Promise (async(resolve,reject)=>{
        try{
            let total = await Order.aggregate([
                {$match:{
                    createdAt:{$gte:From,$lte:To}
                }},
                {
                    $group:{
                        _id:null,
                        totals:{
                            $sum:"$bill"
                        },
                       
                    }
                }
            ])
            resolve(total[0].totals)
        }catch(error){
            reject(error)
        }
        
    })
},
TopSelling:()=>{
    
        return new Promise(async(resolve,reject)=>{
            try{
                let top= await Order.aggregate([
                    {$unwind:'$products'},
                    {
                        $group:{
                            _id:'$products.productname',
                            Qty:{$first:'$product.quantity'},
                            
                            sum:{
                                $sum:'$products.quantity'
                            }
                        }
                    },{
                        $sort:{
                            sum:-1
                        }
                    },{
                        $group:{
                            _id:null,
                            top_selling_products:{
                                $push:'$_id',
                               
                            }
                        }
                    },
                ])
                console.log(top);
                resolve(top)
            }
           catch(error){
            reject(error)
           }
        })
   
}

}