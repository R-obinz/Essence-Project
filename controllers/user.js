const Item = require('../models/Item');
const Cart = require('../models/cart');
const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');
const User = require('../models/User');
const mongoose = require('mongoose');
const Order = require('../models/order');
const res = require('express/lib/response');
const Coupons = require('../models/coupons');
const Wishlist = require('../models/wishlist');

module.exports ={
    addtoCart:(owner,itemId)=>{
       
        return new Promise(async(resolve,reject)=>{
           try{
            const cart = await Cart.findOne({ owner });
            const item = await Item.findOne({ _id: itemId });
            const quantity = 1;
        if (!item) {
            res.status(404).send({ message: "item not found" });
            return;
        }   
           if(item.status){
            const price = item.offerPrice;
            }else{
                const price = item.price;
            }
           
            const productname = item.productname;
            const image = item.image;
                
            //If cart already exists for user,
            if (cart) {
              console.log('b');
                const itemIndex = cart.items.findIndex((item) => item.itemId ==  itemId);
            //check if product exists or not
            if (itemIndex > -1) {
                let product = cart.items[itemIndex];
                product.quantity += quantity;
            
            cart.items[itemIndex] = product;
               await cart.save().then((response)=>{
                resolve(response)
            })
               
            } else {
               cart.items.push({ itemId, productname, quantity,image });
            
               await cart.save().then((response)=>{resolve(response)})
    
            }
            }else{
                
            const cart = await Cart.create({
                owner,
                items:[{itemId,productname,quantity,image}],
                // bill:quantity*price
            }).then((data)=>resolve(data))
            }
           }catch(err){
            reject(err)
           }
       
        })
    },
    getCart:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let items =await Cart.aggregate([
                    {$match:{owner:mongoose.Types.ObjectId(userId)}},
                    
                    {$unwind:'$items'},
                    {
                        $project:{
                            item:'$items.itemId',
                            quantity:'$items.quantity',
                            method:'$paymentMethod',
    
                        }
                    },{
                        $lookup:{
                            from:Item.collection.name,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {$project:{
                        method:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }},
                    {
                        $project:
                    {   
                        method:1,item:1,quantity:1,product:1,
                        subtotal:{
                            $cond:{
                                if:('$product.status'),then:{
                                    
                                         $sum:{$multiply:['$quantity','$product.offerPrice']}
                        
                                    
                                },else: {
                                   
                                      $sum:{$multiply:['$quantity','$product.price']}
                        
                                    
                                }
                                    
                                
                            }
                        }
                      
                    }}
                   
    
                ])
                
                resolve(items)
            }catch(err){
                reject(err)
            }
           
        })
    },
   


    changeQuantity:(data)=>{
  
        data.count= parseInt(data.count)
        data.quantity = parseInt(data.quantity)
        
        console.log(data);
        return new Promise(async(resolve,reject)=>{
            try{
                if(data.count ==-1 && data.quantity ==1){
                    console.log('sssssdjgdigdyugyj');
                    await Cart.updateOne({_id:data.cart},{
                       $pull:{
                        items:{
                            itemId:data.product
                        }
                       }
                    }).then((response)=>{
                        console.log(response);
                        resolve({removeProduct:true})
                    })
                }else{
                    await Cart.updateOne({_id:data.cart,'items.itemId':data.product},{
                        $inc:{
                            
                            'items.$.quantity':data.count
                        },
    
                    }).then(()=>{
                        resolve({status:true})
                    })
                }
            }catch(err){
                reject(err)
            }
        
          
        })


    },
    totalPrice:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let total = await Cart.aggregate([
                
                    {$match:{owner:mongoose.Types.ObjectId(userid)}},
             
                    {$unwind:'$items'},
                    {
                        $project:{
                            
                            item:'$items.itemId',
                            quantity:'$items.quantity',
                            owner:'$owner'
                        }
                    },{
                        $lookup:{
                            from:Item.collection.name,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:1, subtotal:{
                            $cond:{
                                if:('$product.status'),then:{
                                    
                                         $sum:{$multiply:['$quantity','$product.offerPrice']}
                        
                                    
                                },else: {
                                   
                                      $sum:{$multiply:['$quantity','$product.price']}
                        
                                    
                                }
                                    
                                
                            }
                        }
            
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:'$subtotal'
                               }
                        } 
                    }
                ])
                
                if(total[0]){
                    resolve(total[0].total)
                }else{
                    resolve(0)
                }
            }catch(error){
                reject(error)
            }
            
        })
    },
    checkOut:(owner)=>{
         return new Promise(async(resolve,reject)=>{
            try{
                let products =await Cart.aggregate([
                    {$match:{owner:mongoose.Types.ObjectId(owner)}},
                    {$unwind:'$items'},
                    {
                        $project:{
                            item:'$items.itemId',
                            quantity:'$items.quantity',
                            status:'$status',
                            orderType:'$paymentMethod'
                        }
                    },{
                        $lookup:{
                            from:Item.collection.name,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {$project:{
                        paymentMethod:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }},
            
                    {
                        $project:{
                            paymentMethod:1,item:1,quantity:1,product:1, subtotal:{
                            $cond:{
                                if:('$product.status'),then:{
                                    
                                         $sum:{$multiply:['$quantity','$product.offerPrice']}
                        
                                    
                                },else: {
                                   
                                      $sum:{$multiply:['$quantity','$product.price']}
                        
                                    
                                }
                                    
                                
                            }
                        }
            
                        }
                    }
                    
    
                ])
                
                resolve(products)
            }catch(error){
                reject(error)
            }
      
        })
    },
    getSingleOrder:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let orders = await Order.aggregate([
                    {$match:{_id:mongoose.Types.ObjectId(id)}},
                
                    {
                        $unwind:'$products'
                    },{
                        $project:{
                            item:'$products.itemId',
                            quantity:'$products.quantity',
                            status:'$status',
                            paymentMethod:'$paymentMethod',
                            address:'$deliveryDetails.address',
                            phone:'$deliveryDetails.mobilenumber',
                            created: { $dateToString: {
                                format: "%d-%m-%Y",
                                date: "$createdAt"
                              }},
                        
                            updated: { $dateToString: {
                                format: "%d-%m-%Y",
                                date: "$updatedAt"
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
                        $project:{
                            created:1,updated:1,phone:1,address:1,paymentMethod:1,status:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    }, {
                        $project:{
                            created:1,updated:1,phone:1,address:1,paymentMethod:1,status:1, item:1,quantity:1,product:1, subtotal:{$sum:{$multiply:['$quantity','$product.price']}}
            
                        }
                    }
                ])
                console.log(orders);
                resolve(orders)
            }catch(error){
                reject(error)
            }
            
        })
    },


    getOrder:(owner)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let orders = await Order.aggregate([
                    {$match:{user:mongoose.Types.ObjectId(owner)}},
                
                    {
                        $unwind:'$products'
                    },{
                        $project:{
                            item:'$products.itemId',
                            quantity:'$products.quantity',
                            status:'$status',
                            paymentMethod:'$paymentMethod',
                            address:'$deliveryDetails.address',
                            phone:'$deliveryDetails.mobilenumber',
                            created: { $dateToString: {
                                format: "%d-%m-%Y",
                                date: "$createdAt"
                              }},
                        
                            updated: { $dateToString: {
                                format: "%d-%m-%Y",
                                date: "$updatedAt"
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
                        $project:{
                            created:1,updated:1,phone:1,address:1,paymentMethod:1,status:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    }, {
                        $project:{
                            created:1,updated:1,phone:1,address:1,paymentMethod:1,status:1, item:1,quantity:1,product:1, subtotal:{$sum:{$multiply:['$quantity','$product.price']}}
            
                        }
                    }
                ]).sort({_id:-1})
                console.log(orders);
                resolve(orders)
            }catch(error){
                reject(error)
            }
            
        })
    },

    changePassword:(data,person)=>{
       
     return new Promise(async(resolve,reject)=>{
        try{
            const oldpassword = data.oldpassword
            console.log(oldpassword);
            newpassword = await bcrypt.hash(data.newpassword,3) 
           const password = person.password
           const user = person._id
            console.log(password);
            const isMatch = await bcrypt.compare(oldpassword,password)
            if(isMatch){
                console.log('yessssssssssssssssssssssssssssss')
                await User.findByIdAndUpdate(user,{
                    $set: {
                        password:newpassword
                    }
                }).then((response)=>{resolve(response)})
            }
        }catch(error){
            reject(error)
        }
        
      
            
        
     })

    },

    updateProfile:(data,person)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                newName = data.name
            newMail = data.email
            newMobile = data.mobilenumber
            oldName = person.name
            oldMail = person.email
            oldMobile =person.mobilenumber
            address = data.address
           
           
            user = person._id

            await User.findByIdAndUpdate(user,{
                $set:{
                    name:newName,
                    email:newMail,
                    mobilenumber:newMobile,
                    address:address
                }
            }).then((response)=>{
                resolve(response)
            })

            }catch(error){
                reject(error)
            }

            
        })
    },

    getInvoice:(data)=>{
        return new Promise(async(res,rej)=>{
            try{
                let details = await Order.aggregate([
                    {
                        $match:{_id:mongoose.Types.ObjectId(data)}
                    },{
                        $unwind:'$products'
                    },{
                        $project:{
                            firstname:'$deliveryDetails.firstname',
                            lastname:'$deliveryDetails.lastname',
                            email:'$deliveryDetails.email',
                            address:'$deliveryDetails.address',
                            mobile:'$deliveryDetails.mobilenumber',
                            paymentMethod:'$paymentMethod',
                            item:'$products.itemId',
                            quantity:'$products.quantity',
                            productname:'$product.productname',
                            discount:'$Discount',
                            total:'$bill'
    
                        }
                    },{
                        $lookup:{
                            from:Item.collection.name,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                        
                    },
                    {
                        $project:{
                           discount:1, firstname:1,lastname:1,email:1,address:1,mobile:1,paymentMethod:1,productname:1,quantity:1,total:1,product:{$arrayElemAt:['$product',0]}
                        }
                    },{
                        
                            $project:{
                                discount:1,firstname:1,lastname:1,email:1,address:1, mobile:1,address:1,paymentMethod:1,status:1, item:1,quantity:1,total:1,product:1, subtotal:{$sum:{$multiply:['$quantity','$product.price']}}
                
                            }
                        
                    }
                ])
              
                res(details)
            }
           catch(error){
            reject(error)
           }
        })
    },

    removeFromCart:(data)=>{
        return new Promise(async(res,rej)=>{
            try{
                await Cart.updateOne({_id:data.cart},{
                    $pull:{
                     items:{
                         itemId:data.product
                     }
                    }
                 }).then((response)=>{
                    res(response)
                 })
            }catch(error){
                rej(error)
            }
           
            
           
        })
    },

    applyCoupon:(Data,id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
              let coupon =  await Coupons.findOne({couponCode:Data.coupon}).then(async(coup)=>{
                console.log('54a5');
                if(!coup){
                    resolve(0)
                    
                    
                }
                else{

                    await User.updateOne({_id:id},{
                        $set:{
                            Coupon:true,
                            discount: coup.discount,
                            Code:Data.coupon
                        }
                    })
                   discount = coup.discount;
                }
                console.log(discount);
                resolve(discount)
              })
            
              

             
            }catch(error){
                reject(error)
            }
        })
    },
    removeCopon:(Data,id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
              let coupon =  await Coupons.findOne({couponCode:Data.coupon}).then((coup)=>{
                console.log('54a5');
                let remove= User.updateOne({_id:id},{
                        $unset:{
                            Coupon:1,
                            discount: 1,
                            Code:1
                        }
                    })
                   console.log(remove);
                resolve(remove)
              })
            
              

             
            }catch(error){
                reject(error)
            }
        })
    },

    coupon:(Data)=>{
        return new Promise(async(resolve,reject)=>{
            try{    
                await User.findOne({_id:Data},{Coupon:{$exists:true}}).then((result)=>{
                    resolve(result)
                })
            }catch(error){
                reject(error)
            }
        })
    },
    search:(Data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                console.log(Data);
               let pro= await Item.find({productname:{$regex:Data,$options:'$i'}})
                resolve(pro)
            }catch(err){
                reject(err)
            }
        })
    },
    addAddress:(Data)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                await User.updateOne({
                    _id:Data.id
                },{
                
                        $push:{addresses:{
                            Name:Data.name,
                            Number:Data.number,
                            Email:Data.Email,
                            address:Data.address,
                            city:Data.city,
                            pincode:Data.pincode
                        }
                    
                }
                }).then((response)=>{
                    resolve(response)
                })
            }catch(error){
                reject(error)
            }
        })
    },
    addtoWishList:(Id,userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let wishlist = await Wishlist.findOne({user:userId})
                if(wishlist){
                
                    await Wishlist.updateOne(wishlist,{
                        $push:{
                            product:{
                                productId:Id
                            }
                        }
                    }).then((response)=>{
                        console.log(response);
                        resolve(response)
                    })
                }else{
                    const list = await Wishlist.create({
                        user:userId,
                        product:[{productId:Id}],
                        
                    }).then((response)=>{
                        resolve(response)
                    })
                    
                    
                }
            }catch(error){
                reject(error)
            }
        })
    },
    getWishlist:(Id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
               let list= await Wishlist.aggregate([
                    {$match:{
                        user:mongoose.Types.ObjectId(Id)
                    }},
                    {
                        $unwind:'$product'
                    },
                    {
                        $project:{
                            product:'$product.productId'
                        }
                    },{
                        $lookup:{
                            from:Item.collection.name,
                            localField:'product',
                            foreignField:'_id',
                            as:'products'
                        }
                    },{
                        $project:{
                            product:{$arrayElemAt:['$products',0]}
                        }
                    }
                ])
                    console.log(list);
                    resolve(list)
                
            }catch(error){
                reject(error)
            }
        })
    },
    addDefaultAddress:(Id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
               let addres= await User.aggregate([
                    {
                        $unwind:'$addresses'
                    },{
                        $project:{
                            Name:'$addresses.Name',
                            Email:'$addresses.Email',
                            Number:'$addresses.Number',
                            address:'$addresses.address',
                            city:'$addresses.city',
                            pincode:'$addresses.pincode'
                        }
                    }
                ])
                console.log(addres);
                resolve(addres[0])
            }catch(error){
                reject(error)
            }
        })

    }
}