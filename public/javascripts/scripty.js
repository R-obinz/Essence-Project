
    $("#checkout-form").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        console.log('ssaaaaaasIIIIIIIIIIIIIIIIIIII');
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/place-order',
            method:'post',
            data:$('#checkout-form').serialize(),
            success:function(response){
                if(response.status=='cod' ){
                    location.href='/success'
                    
                    // swal("proof!order placed",{
                    //     icon:"success",
                    //     buttons:true
                    // }).then(()=>{
                    //     location.href='/'
                    // })
                }else if(response.status=='razorpay'){
                    razorpayPayment(response)
                }else{
                    console.log(response)
                    for(let i = 0;i < response.links.length;i++){
                        if(response.links[i].rel === 'approval_url'){
                           location.href=response.links[i].href
                        }
                      }
                }
            }
        })
    })
    function razorpayPayment(order){
        console.log(order);
    var options = {
        "key": "rzp_test_cwRINoeD0Nc7V9", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "ESSENCE CORP",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature)
            verifyPayment(response,order);
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response){
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
            
    });
    rzp1.open();
    }

    function verifyPayment(payment,order){
        $.ajax({
            url:'/verify-payment',
            data:{
                payment,
                order
            },method:'post',
            success:(response)=>{
                if(response.status){
                    location.href='/success'
                }
            }
        })
    }


    function addtoCart(itemId){
        $.ajax({
            url:'/add-to-cart/'+itemId,
            method:'get',
            success:(response)=>{
                if(response.status ==true){
                    
                }else if(response.status==false) {
                    location.href('/login')
                }
            }
        })
    }

function removeFromCart(cartId,itemId){
    $.ajax({
        url:'/remove',
        data:{
            cart:cartId,
            product:itemId
        },method:'post',
        success:(response)=>{
            location.reload();
        }
    })
}

    function changeQuantity(cartId,itemId,quantity,productname,price,count){
        console.log('ssssssssssssssssssssss');
        let quant = parseInt(document.getElementById(itemId).innerHTML)
        let prices = parseFloat(price)
        console.log(prices);
        console.log(quantity);
        $.ajax({
            url:'/change-product-quantity',
            data:{
                cart:cartId,
                product:itemId,
                quantity:quant,
                owner:productname,
                count:count,
                

            },method:'post',
            success:(response)=>{
                if(response.removeProduct){
                    location.reload();
                }else{
                    console.log(response.total);
                     document.getElementById(itemId).innerHTML=quant+count
                     document.getElementById(productname).innerHTML=prices*(quant+count)
                     document.getElementById('total').innerHTML=response.total
                     document.getElementById('discounttotal').innerHTML=response.discountprice
                }
            }
            
        })
    }

    $("#myForm").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/admin/addcategory',
            method:'post',
            data:$('#myForm').serialize(),
            success:(response)=>{
                if(response.status){
                 swal({
                        title: "Success",
                        text: "Category Added Successfully!",
                        icon: "success",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                    
                }else{
                    swal({

                        text: "Category is Already Exist!",
                        icon: "error",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                }
            }
        })
    })
    
    function deleteCategories(catId){
        swal({
            title: "Are you sure?",
            text: "You want to delete categories!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/admin/deletecategory/'+catId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            swal(" Category has been deleted!", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }
   
    $("#myForms").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/admin/editcategories',
            method:'post',
            data:$('#myForms').serialize(),
            success:(response)=>{
                if(response.status){
                 swal({
                        title: "Success",
                        text: "Category Name Changed Successfully!",
                        icon: "success",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                    
                }
            }
        })
    })

    $("#myForme").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/admin/addsubcategory',
            method:'post',
            data:$('#myForme').serialize(),
            success:(response)=>{
                if(response.status){
                 swal({
                        title: "Success",
                        text: "SubCategory Added Successfully!",
                        icon: "success",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                    
                }else{
                    swal({

                        text: "SubCategory is Already Exist!",
                        icon: "error",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                }
            }
        })
    })


    function deletesubCategories(subcatId){
        swal({
            title: "Are you sure?",
            text: "You want to delete categories!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/admin/deleteSubCategory/'+subcatId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            swal(" SubCategory has been deleted!", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }

    $("#myFormsee").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/admin/editSubCategories',
            method:'post',
            data:$('#myFormsee').serialize(),
            success:(response)=>{
                if(response.status){
                 swal({
                        title: "Success",
                        text: "Category Name Changed Successfully!",
                        icon: "success",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                    
                }
            }
        })
    })

    $("#myForm1").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/admin/Offers',
            method:'post',
            data:$('#myForm1').serialize(),
            success:(response)=>{
                if(response.status=true){
                 swal({
                        title: "Success",
                        text: "Offer Created Successfully!",
                        icon: "success",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                    
                }else{
                    swal({

                        text: "Offer  Already Exist!",
                        icon: "error",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                }
            }
        })
    })
    function deleteOffer(offerId){
        swal({
            title: "Are you sure?",
            text: "You want to delete this Offer !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/admin/deleteOffer/'+offerId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            swal(" Offer has been deleted!", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }

    $("#myForm2").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        $.ajax({
            url:'/admin/addCoupon',
            method:'post',
            data:$('#myForm2').serialize(),
            success:(response)=>{
                if(response.status=true){
                 swal({
                        title: "Success",
                        text: "Offer Created Successfully!",
                        icon: "success",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                    
                }else{
                    swal({

                        text: "Offer  Already Exist!",
                        icon: "error",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                }
            }
        })
    })
    function deleteCoupon(CouponId){
        swal({
            title: "Are you sure?",
            text: "You want to delete this Coupon !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/admin/deleteCoupon/'+CouponId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            swal(" Coupon has been deleted!", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }

    $("#couponCode").submit((e)=>{
        e.preventDefault() // prevent actual form  submission
        //get submit url[replace url here if desired]
        
        $.ajax({
            url:'/applyCoupon',
            method:'post',
            data:$('#couponCode').serialize(),
            success:(response)=>{
                if(response.status){
                    location.reload()
                }else{
                    swal({

                        text: "Offer  Not Valid!",
                        icon: "error",
                        button: "Done",
                      }).then(()=>{
                        location.reload()
                      })
                }
            }
        })
    })
    window.onload=function(){
        console.log('haiiiiiiiiiiiiiiiii');
        document.getElementById('cc').addEventListener('click',()=>{
          const pdf=this.document.getElementById('ada')
          console.log(pdf);
          console.log(window);
          let opt = {
            margin:       1,
            filename:     'Report.pdf',
            image:        { type: 'jpg', quality: 0.98 },
            html2canvas:  { scale: 4 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
          html2pdf().from(pdf).set(opt).save();
        }) 
      }

      window.onload=function(){
        console.log('haiiiiiiiiiiiiiiiii');
        document.getElementById('hello').addEventListener('click',()=>{
          const pdf=this.document.getElementById('report')
          console.log(pdf);
          console.log(window);
          let opt = {
            margin:       0,
            filename:     'Report.pdf',
            image:        { type: 'jpg', quality: 0.98 },
            html2canvas:  { scale: 4 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
          };
          
          html2pdf().from(pdf).set(opt).save();
        }) 
        document.getElementById('EXCEL').addEventListener('click',()=>{ 
            var table2excel = new Table2Excel();
           
            table2excel.export(document.querySelectorAll("#report"));
          })
      }

      function status(selected,ID,userID){
        console.log(selected);
        console.log(ID);
        $.ajax({
            url:'/admin/updateStatus',
            data:{
                selected,ID,userID
            },
            method:'post',
            success:(response)=>{
              if(response){
                location.reload()
              }
               
            }
        
        })
    }

    function cancelOrder(orderId){
        swal({
            title: "Are you sure?",
            text: "You want to cancel order!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/cancel-order/'+orderId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            swal(" Order has been Cancelled!", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }

    function returnOdrer(orderId){
        swal({
            title: "Are you sure?",
            text: "You want to return Product!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/return-order/'+orderId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            swal(" Product has been requested for return", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }

    function removeFromWishlist(proId,id){
        swal({
            title: "Are you sure?",
            text: "You want to remove product !",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          }).then((value)=>{
            if(value){
                $.ajax({
                    url:'/removeFrom-wishlist',
                    data:{proId,id},
                    method:'post',
                    success:(response)=>{
                        if(response.status){
                            swal(" Product has been Removed!", {
                                icon: "success",
                              }).then(()=>{
                                location.reload()
                              })
                              
                        }
                    }
                })
            }
            
          })
      
    }

    function addtoWishlist(itemId){
        $.ajax({
            url:'/addtoWishlist/'+itemId,
            method:'get',
            success:(response)=>{
                if(response.status ==true){
                    alert('Product added successfully')
                }else if(response.status==false) {
                    location.href('/login')
                }
            }
        })
    }
    