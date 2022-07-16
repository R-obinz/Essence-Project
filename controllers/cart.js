const async = require("hbs/lib/async")
const Cart = require("../models/cart")
const product= require('../models/Item')



exports.addToCart = (prod,userId ) => {

    return new Promise(async(resolve,reject)=>{
        try{
            
            req.user.addToCart(req.body.id)
            .then((response) => {
                resolve(response)
            })
        }catch(error){
            reject(error)
        }
       
    })
   
}

exports.getCart = (req, res, next) => {
    req.user
    console.log(req.user)
        .populate('cart.items.itemId')
        .execPopulate()
        .then(user => {
            console.log(user);
            res.render('cart', { cart: user.cart, pageTitle: 'Shopping Cart Detail', path: '/cart', name: 'Edward' });
        })
        .catch(err => res.render('500'));
}

exports.deleteInCart = (req, res, next) => {
    req.user.removeFromCart(req.body.prodId)
        .then(() => {
            res.redirect('/cart');
        }).catch(err => console.log(err));

}
