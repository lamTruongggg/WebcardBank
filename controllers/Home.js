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
app.get('/',(req,res)=>{
     const email = req.session.email;   
     res.render('partials/main.hbs',{query:email});
});
app.get('/about',(req,res)=>{
      const email = req.session.email;  
     res.render('partials/about.hbs',{query:email});
});
app.get('/pricing',async(req,res)=>{
      const email = req.session.email;  
      const products = await productModel.find({});
      const titles = req.session.status;
      const error = req.session.error;
      delete req.session.error;
      delete req.session.status;
     res.render('partials/pricing.hbs',{
         query:email,
         products: products.map(products => products.toJSON()),
         titles:titles,
         error:error
    });
});
app.get('/work',(req,res)=>{
      const email = req.session.email;  
     res.render('partials/work.hbs',{query:email});
});
app.get('/contact',(req,res)=>{
      const email = req.session.email;  
     res.render('partials/contact.hbs',{query:email});
});
app.use(express.static('views'));
module.exports = app;