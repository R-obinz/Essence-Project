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
            res.status(400).send(error);
        }
    
    },
    
    getAllOrder:()=>{
    return new Promise(async(response,reject)=>{
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
    })
},
codAmount:()=>{
    return new Promise(async(resolve,reject)=>{
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
    })
},
totalOrders:()=>{
    return new Promise(async(resolve,reject)=>{
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
    })
},
razorPay:()=>{
    return new Promise(async(resolve,reject)=>{
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
    })
},
userCount:()=>{
    return new Promise(async(resolve,reject)=>{
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
    })
},
data:()=>{
    return new Promise (async(resolve,reject)=>{
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
    try{
    return new Promise(async(resolve,reject)=>{
      
            const offer = new Offer({
                offerCode :Data.offercode,
                discount : Data.discount
            })
           await offer.save().then((response)=>{
            console.log(response);
            resolve(offercreated=true)
          })
          

       
    })
}catch(err){

}
},



applyoff:(Data)=>{
    
    try{
        return new Promise(async(resolve,reject)=>{
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

            
        })
    }catch(error){

    }
},


applyoffer:(Data)=>{
    
    try{
        return new Promise(async(resolve,reject)=>{
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

            
        })
    }catch(error){
        res.status(400)
    }
},

getCoupons:()=>{
    try{
        return new Promise(async(resolve,reject)=>{
            await Coupons.find({}).then((response)=>{
                resolve(response)
            })
        })
    }catch(error){
        res.status(400)
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
            res.status(400)
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
            res.status(400)
        }
    })
},
Summ:(From,To)=>{
    return new Promise (async(resolve,reject)=>{
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
    })
},
TopSelling:()=>{
    try{
        return new Promise(async(resolve,reject)=>{
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
        })
    }catch(error){
        res.status(400).send('something went wrong')
    }
}

}