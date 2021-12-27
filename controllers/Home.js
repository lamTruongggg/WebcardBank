const express =  require('express');
const userModel = require('../models/user');
const path = require('path');
const productModel = require('../models/product');
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
app.get('/',(req,res)=>{
     const email = req.session.email;   
     res.render('partials/main.hbs',{query:email,admin:req.session.isAdmin,business:req.session.isBusiness});
});
app.get('/about',(req,res)=>{
      const email = req.session.email;  
     res.render('partials/about.hbs',{query:email,admin:req.session.isAdmin,business:req.session.isBusiness});
});
app.get('/pricing',async(req,res)=>{
      const email = req.session.email;  
      const products = await productModel.find({});
      const titles = req.session.status;
      const error = req.session.error;
      delete req.session.error;
      delete req.session.status;
     res.render('partials/pricing.hbs',{
         query:email,admin:req.session.isAdmin,business:req.session.isBusiness,
         products: products.map(products => products.toJSON()),
         titles:titles,
         error:error
    });
});
app.get('/work',(req,res)=>{
      const email = req.session.email;  
     res.render('partials/work.hbs',{query:email,admin:req.session.isAdmin,business:req.session.isBusiness});
});
app.get('/contact',(req,res)=>{
      const email = req.session.email;  
     res.render('partials/contact.hbs',{query:email,admin:req.session.isAdmin,business:req.session.isBusiness});
});
app.use(express.static('views'));
module.exports = app;