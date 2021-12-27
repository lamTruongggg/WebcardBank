const express =  require('express');
const productModel = require('../models/product');
const cartModel = require('../models/cart');
const cardCustomerModel = require('../models/cardCustomer');
const userModel = require('../models/user');
const paypal = require('paypal-rest-sdk');
const nodemailer = require("nodemailer");
const fs=require('fs');
const app = express();
const isAuth = (req,res, next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/Users');
    }
}
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
app.post('/add',isAuth, async(req,res)=>{
     console.log(req.body);
    if(req.body.id =='')
    {
       addRecord(req,res);
    }
    else
    {
        updateRecord(req,res);
    }
});
app.get('/myCart',isAuth, async(req,res)=>{
   const carts = await cartModel.find({buyer:req.session.email,status:0});
      const numbers = await cartModel.find({buyer:req.session.email,status:0}).count();
      res.render('partials/cart.hbs',{
          query:req.session.email,
            carts: carts.map(carts => carts.toJSON()),
            numbers:numbers
      })

});
app.get('/addCart/:id',isAuth, async(req,res)=>{
     productModel.findById(req.params.id,(err,info)=>{
        if(!err){
       cartModel.findOne({productId:req.params.id, status:0}).then(product=>{
           console.log(product);
        if(product == null){       
    const cart = new cartModel();
    cart.name=info.name;
    cart.price=info.price;
    cart.des=info.des;
    cart.seller = info.author;
    cart.buyer=req.session.email;    
    cart.currency=info.currency;
    cart.quantity = 1;
    cart.status = 0;
    cart.productId = req.params.id;
    console.log(cart);
    cart.save();
                 req.session.status = "Add Successfull";
        res.redirect('/pricing');
   }
   else
   {
       console.log(req.params.id);
       cartModel.findOne({productId:req.params.id,status:0}).then(infoCart =>{
      console.log(infoCart);
        var quantity = parseInt(infoCart.quantity,10) +1;
        cartModel.findOneAndUpdate({productId:req.params.id,status:0},{$set:{"quantity":quantity}},{new:true},(err,cartInfo)=>{
            if(cartInfo)
            {
                 console.log(cartInfo);
                 req.session.status = "Update quantity Successfull";
        res.redirect('/pricing');
            }
            else
            {
 req.session.error = "Update quantity Fail";
        res.redirect('/pricing');
            }
        });
       
             
       });
    }
       });
    }
else{
      res.status(500).send(err);
       req.session.error = "Add Successfull";
        res.redirect('/pricing');
}});
});


function addRecord(req,res)
{
    const body = req.body;
    const email = req.session.email;
    const products =  new productModel(body);
    products.author= email;
    try{
        products.save();
        req.session.status = "Add Successfull";
        res.redirect('/Users/myProduct');
        
    }catch(error)
    {
        res.status(500).send(error);
         req.session.error = "Add Fail";
        res.redirect('/Users/myProduct');
    }
}
var total =0;

app.get('/',async(req,res)=>{
    var fee = [
  {
    sale: {
      id: '45A73278AX5749309',
      state: 'completed',
      amount: [Object],
      payment_mode: 'INSTANT_TRANSFER',
      protection_eligibility: 'ELIGIBLE',
      protection_eligibility_type: 'ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE',
      transaction_fee: [Object],
      parent_payment: 'PAYID-MHEIZJY7FY21352RF7436519',
      create_time: '2021-12-26T15:39:57Z',
      update_time: '2021-12-26T15:39:57Z',
      links: [Array]
    }
  }
] ;
console.log(fee[0].sale.transaction_fee);
});
app.get('/cancel', function(req, res){
  res.render('cancel.handlebars');
});
app.post('/delete',async(req,res)=>{
  console.log(req.body);
  
    const cartCustomer = await cartModel.findOneAndDelete({_id:req.body.id});
        if(!cartCustomer) res.status(404).send("No item found");
        res.redirect('/Products/myCart');
});
app.post('/pay',isAuth,function(req,res){
    cartModel.findOne({buyer:req.session.email,status:0}).then(it => {       
      req.session.seller = it.seller;
       var items = [{
    "name":it.name,
    "sku":it.productId,
    "price": it.price,
    "currency":it.currency,
    "quantity": it.quantity
}
];
        for(let i = 0;i<items.length;i++)
{
  total+=parseFloat(items[i].price)*items[i].quantity;
}
  paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AW1T5-R2qJvdLXBKK4qTYT4urvBIuvmunzyBNoG5Ud2pFEnjsmg8BnWqFHv9Q5jQ1JLflIck0FL0xkbW',
  'client_secret': 'EDCd6la-rJTRrZnurKGdyGzfnZLgxnOT3Th4PePCTGVKE66-Ios9rsBS7cIXQNX-F99l21UNqi_xpkOP'
});
 const link="http://"+req.get('host')+"/Products";
    var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": link+"/review_payment",
        "cancel_url": link+"/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": items
        },
        "amount": {
            "currency": "USD",
            "total": total.toString()
        },
        "description": "This is the payment description."
    }]
};
    paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
});
 });
});
app.get('/review_payment', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  paypal.payment.get(paymentId, function (error, payment) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        const email = payment.payer.payer_info.email;
        const name = payment.payer.payer_info.shipping_address.recipient_name;
        const code = payment.payer.payer_info.shipping_address.postal_code;
        const country = payment.payer.payer_info.shipping_address.country_code;
        const seller = req.session.seller;
        res.render('partials/reviewPayment.hbs',{
        paymentId: paymentId,
        payerId:payerId,
        email:email,
        fname: payment.payer.payer_info.first_name,
        lname:payment.payer.payer_info.last_name,
        line1:payment.payer.payer_info.shipping_address.line1,
        city:payment.payer.payer_info.shipping_address.city,
        state:payment.payer.payer_info.shipping_address.state,
        name:name,
         code:code,
        country:country,
        seller:seller

        });
    }

  
});
});

app.post('/checkBill', async(req, res) => {
     console.log(req.body);
  const payerId = req.body.PayerID;
  const paymentId = req.body.paymentId;
  const user = await userModel.findOne({email:req.session.email});
  const checkUser = await cardCustomerModel.findOne({customerId:(user._id).toString(),status:2});
    if(checkUser)
    {
        var checkMoney = checkUser.moneyBank - total;
        console.log(checkMoney);
     if(checkMoney >=0)   
     {
           const rand = makeid(24);
                      req.session.random = rand; 
                                    const host=req.get('host');
                const link="http://"+req.get('host')+"/Products/verifyAccount/"+rand+"?PayerID="+payerId+"&paymentId="+paymentId;
                const smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "webcardbank74@gmail.com",
                    pass: "card@!1234"
                }
            });
                const msg ={
                    to:req.session.email,    
                subject:"Please confirm for continue to PAY",
                html: "<div style='background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;'> <div style='display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;'></div> <table border='0' cellpadding='0' cellspacing='0' width='100%'> <tr> <td bgcolor='#FFA73B' align='center'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td align='center' valign='top' style='padding: 40px 10px 40px 10px;'> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#FFA73B' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#ffffff' align='center' valign='top' style='padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;'> <h1 style='font-size: 48px; font-weight: 400; margin: 2;'>Welcome!</h1> <img src=' https://img.icons8.com/clouds/100/000000/handshake.png' width='125' height='120' style='display: block; border: 0px;' /> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#ffffff' align='left' style='padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left'> <table width='100%' border='0' cellspacing='0' cellpadding='0'> <tr> <td bgcolor='#ffffff' align='center' style='padding: 20px 30px 60px 30px;'> <table border='0' cellspacing='0' cellpadding='0'> <tr> <td align='center' style='border-radius: 3px;' bgcolor='#FFA73B'><a href="+link+" target='_blank' style='font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;'>Confirm Account</a></td> </tr> </table> </td> </tr> </table> </td> </tr> <!-- COPY --> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>If that doesn't work, copy and paste the following link in your browser:</p> </td> </tr> <!-- COPY --> <tr> <td bgcolor='#ffffff' align='left' style='padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'><a href='#' target='_blank' style='color: #FFA73B;'>https://bit.li.utlddssdstueincx</a></p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>If you have any questions, just reply to this email—we're always happy to help out.</p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>Cheers,<br>BBB Team</p> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 30px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#FFECD1' align='center' style='padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <h2 style='font-size: 20px; font-weight: 400; color: #111111; margin: 0;'>Need more help?</h2> <p style='margin: 0;'><a href='#' target='_blank' style='color: #FFA73B;'>We&rsquo;re here to help you out</a></p> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#f4f4f4' align='left' style='padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;'> <br> <p style='margin: 0;'>If these emails get annoying, please feel free to <a href='#' target='_blank' style='color: #111111; font-weight: 700;'>unsubscribe</a>.</p> </td> </tr> </table> </td> </tr> </table> </div>",
                }
                smtpTransport.sendMail(msg,function(err,info){
            if(err)
            {console.log("email not send");}
            else
            {   console.log("email sended");
                res.redirect('/');
            }
                });
            }
       
    }
      res.redirect('/Users');
});
app.get('/verifyAccount/:id',async(req,res)=>{
    try{
        const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
         const rand = req.session.random;
         delete req.session.random;
         if(rand == req.params.id)
         {
             res.redirect('/Products/success?PayerID='+payerId+'&paymentId='+paymentId);
         }
         else{
         res.redirect('/');}
    }
    catch(error)
    {
        res.status(500).send(error);
    }
});
app.get('/success', (req, res) => {
    console.log(req.body);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

         console.log(payerId);
         console.log(paymentId);
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": total.toString()
        }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
       res.render('cancle');
    } else {
        
            const fee = payment.transactions[0].related_resources;
            cartModel.findOne({buyer:req.session.email,status:0}).then(items=>{     
            const payerInfo = payment.payer.payer_info;        
             const shipping_address = payerInfo.shipping_address;         
             var subTotal = total - fee[0].sale.transaction_fee.value;
        res.render('partials/success.hbs',{
              total : total.toString(),
                name_items : items.name,
             sku_items : items.productId,
             price_items : items.price,
             currency_items : items.currency,
             quantity_items : items.quantity,
              seller : req.session.seller,
             dateCreate : payment.create_time,
             dateUpdate : payment.update_time,
             status : payment.payer.status,              
              email : payerInfo.email,
              fname : payerInfo.first_name,
              lname : payerInfo.last_name,
                recipient_name : shipping_address.recipient_name,
              line1 :shipping_address.line1,
              city : shipping_address.city,
              state : shipping_address.state,
              postal_code : shipping_address.postal_code,
              country_code : shipping_address.country_code,
             fee_payment : fee[0].sale.transaction_fee.value,
             subTotal: subTotal
        });
         });
    }
});
});
app.use(express.static('views'));

module.exports = app;