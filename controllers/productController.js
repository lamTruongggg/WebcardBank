const express =  require('express');
const productModel = require('../models/product');
const app = express();
const isAuth = (req,res, next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/Users');
    }
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
app.use(express.static('views'));

module.exports = app;