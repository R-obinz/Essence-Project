const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    owner : {
      type: ObjectID,
       required: true,
       ref: 'User'
     },
    items: [{
      itemId: {
       type: ObjectID,
       ref: 'Item',
       required: true
    },
    productname:{
      type:String,
    },
    image:{
      type:String
    },
    quantity: {
       type: Number,
       required: true,
       min: 1,
       default: 1},
       price: Number
     }],
    // bill: {
    //     type: Number,
    //     required: true,
    //     default: 0
    //   }
    }, {
    timestamps: true
    })

const Cart = mongoose.model('Cart', cartSchema)
module.exports = Cart

// let cart = null;

// module.exports = class Cart {

//     static save(product) {

//         if (cart === null) {
//             cart = { products: [], totalPrice: 0 };
//         }

//         const existingProductIndex = cart.products.findIndex(p => p.id == product.id); // to check product is existing in cart
//         if (existingProductIndex >= 0) { // exist in cart already
//             const exsitingProduct = cart.products[existingProductIndex];
//             exsitingProduct.qty += 1;
//         } else { //not exist
//             product.qty = 1;
//             cart.products.push(product);
//         }

//         cart.totalPrice += product.price;
//     }

//     static getCart() {
//         return cart;
//     }

//     static delete(productId) {
//         const isExisting = cart.products.findIndex(p => p.id == productId);
//         if (isExisting >= 0) {
//             cart.products.splice(isExisting, 1);
//         }
//     }

// }