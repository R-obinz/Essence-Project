const Razorpay =require('razorpay');
const paypal = require('paypal-rest-sdk');

var instance = new Razorpay({
    key_id:'rzp_test_cwRINoeD0Nc7V9',
    key_secret:'3ElVpYmQanZVabW5Om3ZP53K'
})

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZh6xdfYW3eFPYffLr6TTDUHVLrGwBOyOxJYcS5PVFwNBA3HekYdtlPla6i7WPwvcwpYvu6emGafMQdh',
    'client_secret': 'ECvAf3Ngj10-a3R00aZnjh815syklyHwcQfB3e9Czkp1x--VpQxczF3C21lvNQwezuOhsiyWfXWV-Paf'
  });

module.exports ={
    generateRazorpay:(order_Id,orderbill)=>{
        console.log('hhh')
        console.log(order_Id)
        return new Promise((resolve,reject)=>{
            var options ={
                amount : orderbill *100,
                currency : "INR",
                receipt :""+order_Id
            };
            instance.orders.create(options, function(err,order){
                resolve(order)
            });
        })
    },
    verifyPayment:(details)=>{
        
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            const hash = crypto.createHmac('sha256','3ElVpYmQanZVabW5Om3ZP53K')
                .update(details['payment[razorpay_order_id]']+'|'+ details['payment[razorpay_payment_id]'])
                .digest('hex');

                if(hash == details['payment[razorpay_signature]']){
                    resolve()
                }else{
                    reject()
                }
        })
    },
    generatePaypal:(details,total)=>{
        console.log('hhhhhhhhhhhhahahahahahaahahhaha');
        console.log(details);
        return new Promise((resolve,reject)=>{

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "d",
                            "sku": "001",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Washing Bar soap"
                }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                resolve(payment)
            }
          });
        })
       
},


}