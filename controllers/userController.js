const express =  require('express');
const userModel = require('../models/user');
const path = require('path');
const bcrypt = require('bcryptjs');
const emailcheck = require('email-check');
const countryModel = require('../models/country');
const cardModel = require('../models/card');
const cardNumberModel = require('../models/cardNumber');
const cardCustomerModel = require('../models/cardCustomer');
const activitiesModel = require('../models/activity');
const productModel = require('../models/product');
const connectModel = require('../models/connect');
const currencyModel = require('../models/currency');
const nodemailer = require("nodemailer");
const fs = require('fs');
const app = express();
const isAuth = (req,res, next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/Users');
    }
}
const isAdmin = (req,res, next)=>{
    if(req.session.isAdmin){
        next();
    }else{
        res.redirect('/');
    }
}
const isBusiness = (req,res, next)=>{
    if(req.session.isBusiness){
        next();
    }else{
        res.redirect('/');
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
app.get('/Register',async(req,res)=>{
    const country = await countryModel.find({});
    const card = await cardModel.find({});
    const titles = req.session.viewTitles;
    delete req.session.viewTitles;
    res.render('users/addOrEdit.hbs',{
        countrys: country.map(country => country.toJSON()),
        cards: card.map(card => card.toJSON()),
        viewTitle: titles,
        query:req.session.email,admin:req.session.isAdmin,business:req.session.isBusiness
    }
    );
});
app.get('/manageProduct',isAuth,isBusiness,async(req,res)=>{
    const titles = req.session.status;
    const error = req.session.error;
    delete req.session.error;
    delete req.session.status;
    const products = await productModel.find({author:req.session.email});
    const currencys = await currencyModel.find({});
    res.render('partials/listProduct.hbs',{
        query: req.session.email,admin:req.session.isAdmin,business:req.session.isBusiness,
        products: products.map(products => products.toJSON()),
        currencys: currencys.map(currencys => currencys.toJSON()),
        titles: titles,
        error:error
    });
});
app.post('/add', async(req,res)=>{
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
app.get('/list',isAuth,isAdmin,async(req,res)=>{
    const email = req.session.email;   
    const unactive = await cardCustomerModel.find({status:0});
    const activing = await cardCustomerModel.find({status:1});
    const active = await cardCustomerModel.find({status:2});
     const lock = await cardCustomerModel.find({status:3});
     const list = await activitiesModel.find({});
    res.render('users/view-user.hbs',{
        unactive: unactive.map(unactive => unactive.toJSON()),
         activing: activing.map(activing => activing.toJSON()),
          active: active.map(active => active.toJSON()),
              lock: lock.map(lock => lock.toJSON()),
               activity: list.map(list => list.toJSON()),
              query:req.session.email,admin:req.session.isAdmin,business:req.session.isBusiness
    });
});
function addRecord(req,res)
{
    const body = req.body;
    const users =  new userModel(body);
    try{
        userModel.findOne({email:users.email}).then(user=>{
        if(user){
            res.render('users/addOrEdit.hbs',{
        viewTitle:"Email Already",
    query:req.session.email,admin:req.session.isAdmin,business:req.session.isBusiness});
        }
        else{        
            const hashedPws = bcrypt.hashSync(users.password,12);
           users.password= hashedPws;
           users.isAdmin = 0;
           const date = new Date();
           users.dateCreate = date;
           users.dateUpdate = date;
           cardNumberModel.findOneAndUpdate({country:body.country,cardType:body.cardType,status:0,type:body.typeAccount},{ $set: { "status": 1}},{new:true},(err,number)=>{
               console.log(number);
               if(!number){
                  res.render('users/addOrEdit.hbs',{
        viewTitle:"Number Card is stock up !!!",
    query:req.session.email,admin:req.session.isAdmin,business:req.session.isBusiness});
               }
               else
               { users.save();
                   const date = new Date();
                   const cardC = new cardCustomerModel();
                   cardC.cardType = number.cardType;
                   cardC.country = number.country;
                   cardC.month = number.month;
                   cardC.year = number.year;
                   cardC.ccv = number.ccv;
                   cardC.cardNumber = number.cardNumber;
                   cardC.status = 0;
                   cardC.moneyBank = body.salary;
                   cardC.moneyCheck= 0;
                   cardC.dateBank = date;
                   cardC.dateCheck = date;
                   cardC.dateCreate = date;
                   cardC.dateUpdate = date;
                   cardC.customerId = (users._id).toString();
                   cardC.type= body.typeAccount;
                   console.log(cardC);
                   const rand = makeid(24);
                    cardC.pin=rand;                  
                                    const host=req.get('host');
                const link="http://"+req.get('host')+"/Users/verifyAccount/"+rand;
                const smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "webcardbank74@gmail.com",
                    pass: "card@!1234"
                }
            });
                const msg ={
                    to:users.email,    
                subject:"Please confirm your Email account",
                html: "<div style='background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;'> <div style='display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;'></div> <table border='0' cellpadding='0' cellspacing='0' width='100%'> <tr> <td bgcolor='#FFA73B' align='center'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td align='center' valign='top' style='padding: 40px 10px 40px 10px;'> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#FFA73B' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#ffffff' align='center' valign='top' style='padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;'> <h1 style='font-size: 48px; font-weight: 400; margin: 2;'>Welcome!</h1> <img src=' https://img.icons8.com/clouds/100/000000/handshake.png' width='125' height='120' style='display: block; border: 0px;' /> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#ffffff' align='left' style='padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left'> <table width='100%' border='0' cellspacing='0' cellpadding='0'> <tr> <td bgcolor='#ffffff' align='center' style='padding: 20px 30px 60px 30px;'> <table border='0' cellspacing='0' cellpadding='0'> <tr> <td align='center' style='border-radius: 3px;' bgcolor='#FFA73B'><a href="+link+" target='_blank' style='font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;'>Confirm Account</a></td> </tr> </table> </td> </tr> </table> </td> </tr> <!-- COPY --> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>If that doesn't work, copy and paste the following link in your browser:</p> </td> </tr> <!-- COPY --> <tr> <td bgcolor='#ffffff' align='left' style='padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'><a href='#' target='_blank' style='color: #FFA73B;'>https://bit.li.utlddssdstueincx</a></p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>If you have any questions, just reply to this email—we're always happy to help out.</p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>Cheers,<br>BBB Team</p> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 30px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#FFECD1' align='center' style='padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <h2 style='font-size: 20px; font-weight: 400; color: #111111; margin: 0;'>Need more help?</h2> <p style='margin: 0;'><a href='#' target='_blank' style='color: #FFA73B;'>We&rsquo;re here to help you out</a></p> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#f4f4f4' align='left' style='padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;'> <br> <p style='margin: 0;'>If these emails get annoying, please feel free to <a href='#' target='_blank' style='color: #111111; font-weight: 700;'>unsubscribe</a>.</p> </td> </tr> </table> </td> </tr> </table> </div>",
                }
                smtpTransport.sendMail(msg,function(err,info){
            if(err)
            {console.log("email not send");}
            else
            {  cardC.save(); console.log("email sended");
            }
                });
               }
           })
    //res.send(u);
        req.session.viewTitles =  "Insert User successfull - PLEASE CHECK GMAIL";
        res.redirect('/Users/Register');
        }
    })
    }catch(error)
    {
        res.status(500).send(error);
    }
}
app.get('/verifyAccount/:id',async(req,res)=>{
    try{
          cardCustomerModel.findOneAndUpdate({pin:req.params.id},{ $set: { "status": 1}},{new:true},(err,card)=>{
              console.log(card);
            if(err)
            res.redirect('/Error');
            userModel.findByIdAndUpdate((card.customerId).toString(),{ $set: { "status": 1}},{new:true},(err,user)=>{
                console.log(user);
            if(err)
            {res.redirect('/Error');}
            else
            res.render('partials/login.hbs',{
                email: user.email,
                query:req.session.email,admin:req.session.isAdmin,business:req.session.isBusiness
            });
        });
    });
    }
    catch(error)
    {
        res.status(500).send(error);
    }
});
function updateRecord(req,res)
{
    const date = new Date();
     const rand = makeid(24);
     userModel.findOneAndUpdate({_id:req.body.id},{ $set: { "status": 2, "dateUpdate":date,"pin":rand }},{new:true},(err,user)=>{
        if(!err){
             const host=req.get('host');
                const link="http://"+req.get('host')+"/Users/verifyCard/"+rand;
                const smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "webcardbank74@gmail.com",
                    pass: "card@!1234"
                }
            });
                const msg ={
                    to:req.body.email,    
                subject:"This is Password Your Card",
                html: "<div style='background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;'> <div style='display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;'></div> <table border='0' cellpadding='0' cellspacing='0' width='100%'> <tr> <td bgcolor='#FFA73B' align='center'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td align='center' valign='top' style='padding: 40px 10px 40px 10px;'> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#FFA73B' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#ffffff' align='center' valign='top' style='padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;'> <h1 style='font-size: 48px; font-weight: 400; margin: 2;'> THANKS YOU YOUR ACCOUNT BE ACCEPTED!</h1> <img src=' https://img.icons8.com/clouds/100/000000/handshake.png' width='125' height='120' style='display: block; border: 0px;' /> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#ffffff' align='left' style='padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left'> <table width='100%' border='0' cellspacing='0' cellpadding='0'> <tr> <td bgcolor='#ffffff' align='center' style='padding: 20px 30px 60px 30px;'> <table border='0' cellspacing='0' cellpadding='0'> <tr> <td align='center' style='border-radius: 3px;' bgcolor='#FFA73B'><a href="+link+" target='_blank' style='font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;'>"+req.body.cardpass+"</a></td> </tr> </table> </td> </tr> </table> </td> </tr> <!-- COPY --> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>If that doesn't work, copy and paste the following link in your browser:</p> </td> </tr> <!-- COPY --> <tr> <td bgcolor='#ffffff' align='left' style='padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'><a href='#' target='_blank' style='color: #FFA73B;'>https://bit.li.utlddssdstueincx</a></p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>If you have any questions, just reply to this email—we're always happy to help out.</p> </td> </tr> <tr> <td bgcolor='#ffffff' align='left' style='padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <p style='margin: 0;'>Cheers,<br>BBB Team</p> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 30px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#FFECD1' align='center' style='padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;'> <h2 style='font-size: 20px; font-weight: 400; color: #111111; margin: 0;'>Need more help?</h2> <p style='margin: 0;'><a href='#' target='_blank' style='color: #FFA73B;'>We&rsquo;re here to help you out</a></p> </td> </tr> </table> </td> </tr> <tr> <td bgcolor='#f4f4f4' align='center' style='padding: 0px 10px 0px 10px;'> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'> <tr> <td bgcolor='#f4f4f4' align='left' style='padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;'> <br> <p style='margin: 0;'>If these emails get annoying, please feel free to <a href='#' target='_blank' style='color: #111111; font-weight: 700;'>unsubscribe</a>.</p> </td> </tr> </table> </td> </tr> </table> </div>",
                }
                smtpTransport.sendMail(msg,function(err,info){
            if(err)
            {console.log("email not send");}
            else
            { 
                cardCustomerModel.findOneAndUpdate({customerId:req.body.id, status:1},{$set:{"status":2}},{new:true},(err,changeActive)=>{
            if(!changeActive) res.status(404).send("No item found");
          cardNumberModel.findOneAndUpdate({cardNumber:changeActive.cardNumber},{$set:{"status":2}},{new:true},(err,activeNumber)=>{
          if(!activeNumber) res.status(404).send("No item found");
          });
                });       
                const connect = new connectModel();
                connect.customerId = req.body.id;
                connect.client_id = req.body.client_id;
                connect.client_secret = req.body.client_secret;
                connect.save();
                 console.log("email sended");
            }
                });
               
                res.redirect('/Users/list');
            }
            else
            {
                console.log(err);
            }
        });
}
app.get('/edit/:id',isAuth,isAdmin, (req,res)=>{
    if(req.query.types=="Business")
    {
    userModel.findById(req.params.id,(err,user)=>{
        if(!err){
            res.render('users/addOrEdit.hbs',{
                user:user.toJSON(),
                titles: "INFORMATION USER",
                type:req.query.type,
                country:req.query.country,
                static: 1,
                query:req.session.email,admin:req.session.isAdmin,business:req.query.types
            });
        }
    });}
    else
    {
     userModel.findById(req.params.id,(err,user)=>{
        if(!err){
            res.render('users/addOrEdit.hbs',{
                user:user.toJSON(),
                titles: "INFORMATION USER",
                type:req.query.type,
                country:req.query.country,
                static: 1,
                query:req.session.email,admin:req.session.isAdmin
            });
        }
    });   
    }
});
app.get('/delete/:id',isAuth,isAdmin,async(req,res)=>{
    try{
        const user = await userModel.findByIdAndDelete(req.params.id);
        if(!user) res.status(404).send("No item found");
        const check = await cardCustomerModel.findOne({customerId:req.params.id});
        const changeUnactive = await cardNumberModel.findOneAndUpdate({cardNumber:check.cardNumber},{$set:{"status":0}})
          if(!changeUnactive) res.status(404).send("No item found");
       const cardCustomer = await cardCustomerModel.findOneAndDelete({customerId:req.params.id});
        if(!cardCustomer) res.status(404).send("No item found");
        res.redirect('/Users/list');
        //res.status(200).send();
    }
    catch(error)
    {
        res.status(500).send(error);
    }
});
app.get('/lock/:id',isAuth,isAdmin, async(req,res)=>{
    try{
        
         const changeLock = await cardCustomerModel.findOneAndUpdate({customerId:req.params.id},{$set:{"status":3}});
          if(!changeLock) res.status(404).send("No item found");
        res.redirect('/Users/list');
        //res.status(200).send();
    }
    catch(error)
    {
        res.status(500).send(error);
    }
});
app.get('/unLock/:id',isAuth,isAdmin,async(req,res)=>{
    try{
        
         const changeLock = await cardCustomerModel.findOneAndUpdate({customerId:req.params.id},{$set:{"status":2}});
          if(!changeLock) res.status(404).send("No item found");
        res.redirect('/Users/list');
        //res.status(200).send();
    }
    catch(error)
    {
        res.status(500).send(error);
    }
});
app.get('/', async(req,res)=>{   
     res.render('partials/login.hbs');
});
app.post('/login',(req,res)=>{
       const body = req.body;
    const users =  new userModel(body);
    const date = new Date();
    users.dateCreate = date;
    users.dateUpdate = date;
    const activities = new activitiesModel({user:body.email,login:date});
    userModel.findOne({email:users.email, status:2}).then(user=>{
        console.log(user);
        if(!user){            
        return res.render('partials/login.hbs',{mess: "validate Email or Pasword",query:req.session.email});
    }
    const pass = user.password;
    const validPassword =  bcrypt.compareSync(body.password,pass);
      if (!validPassword) {
        return res.render('partials/login.hbs',{mess: "validate Email or Pasword",query:req.session.email});
      }      
      req.session.isAuth =true;
      if(user.isAdmin==1)
      {
      req.session.isAdmin = true;      
      }
       if(user.isAdmin==0)
      {
     cardCustomerModel.findOne({customerId:(user._id).toString()}).then(checkUser=>{
      if(checkUser.type=="Business")
      {
         req.session.isBusiness = true;
      }
      req.session.email = user.email;
      activities.save();
      return res.redirect('/');
      });
        }
      else
      {
           req.session.email = user.email;
      activities.save();
      return res.redirect('/');
      }
      });
});
app.get('/myProfile',isAuth, async(req,res)=>{
       const email = req.session.email;
    userModel.findOne({email:email}).then(user=>{
        if(!user){            
         return res.redirect('/Users/logout');
    }
        return res.render('partials/about.hbs',{
            users:user.toJSON(),
            query:email,admin:req.session.isAdmin,business:req.session.isBusiness
        })
      });  
});
app.get('/cardManage',isAuth,isAdmin, async(req,res)=>{
       const email = req.session.email;    
       const titles = req.session.viewTitle;
       const error = req.session.error;
       delete req.session.viewTitle;
       delete req.session.error;
       const country = await countryModel.find({});
    const card = await cardModel.find({});
        return res.render('partials/detailCard.hbs',{
            query: email,admin:req.session.isAdmin,business:req.session.isBusiness,
              countrys: country.map(country => country.toJSON()),
        cards: card.map(card => card.toJSON()),
        titles: titles,
        error: error
        });
});
app.get('/mycard',isAuth, async(req,res)=>{
       const email = req.session.email;    
       const user = await userModel.findOne({email:email});
       const checkUser = await cardCustomerModel.findOne({customerId:(user._id).toString()});
       console.log(checkUser);
        return res.render('partials/detailCard.hbs',{
            query: email,admin:req.session.isAdmin,business:req.session.isBusiness,
            card: checkUser.toJSON()
        });
});
app.get('/edit',isAuth, (req,res)=>{
    const email = req.session.email;
   userModel.findOne({email:email}).then(user=>{
        if(!user){            
         return res.redirect('/Users/logout');
    }
        return res.render('users/addOrEdit.hbs',{
            user:user.toJSON(),
            query:email
        })
      });  
});
app.post('/addCard', (req,res)=>{
    const email = req.session.email;
    console.log(req.body);
    const card = new cardNumberModel(req.body);
    card.type = req.body.typeAccount;
    card.status = 0;
    try{
    card.save();
    req.session.viewTitle = "Add Successfull";
    res.redirect('/Users/cardManage');
    }catch(error)
    {
        res.status(500).send(error);
        req.session.error = "Add fail";
        res.redirect('/Users/cardManage');
    }
});
app.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/Users');
    });
});
app.use(express.static('views'));

module.exports = app;