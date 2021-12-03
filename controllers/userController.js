const express =  require('express');
const userModel = require('../models/user');
const path = require('path');
const bcrypt = require('bcryptjs');
const emailcheck = require('email-check');
const app = express();

const isAuth = (req,res, next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/Users');
    }
}
app.get('/Register',(req,res)=>{
    res.render('users/addOrEdit.hbs'
    );
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
/** 
app.get('/list',(req,res)=>{
    res.render('users/view-user.hbs',{viewTitle:"List User Information"}
    );
});
*/
app.get('/list', isAuth,(req,res)=>{
   
    userModel.find({}).then(users =>{
    res.render('users/view-user.hbs',{
        users: users.map(user => user.toJSON())
    });
    })
});
function addRecord(req,res)
{
    const body = req.body;
    const users =  new userModel(body);
    try{
        userModel.findOne({email:users.email}).then(user=>{
        if(user){
            res.render('users/addOrEdit.hbs',{
        viewTitle:"Email Already"});
        }
        else{        
            const hashedPws = bcrypt.hashSync(users.password,12);
           users.password= hashedPws;
            users.save();
    //res.send(u);
        res.render('users/addOrEdit.hbs',{
        viewTitle:"Insert User successfull"});
        }
    })
    }catch(error)
    {
        res.status(500).send(error);
    }
}
function updateRecord(req,res)
{
    
     userModel.findOneAndUpdate({_id:req.body.id},req.body,{new:true},(err,user)=>{
        if(!err){
                res.redirect('/Users/list');
            }
            else
            {
                console.log(err);
            }
        });
}
app.get('/edit/:id', (req,res)=>{
    userModel.findById(req.params.id,(err,user)=>{
        if(!err){
            res.render('users/addOrEdit.hbs',{
                user:user.toJSON()
            });
        }
    });
});
app.get('/delete/:id', async(req,res)=>{
    try{
        const user = await userModel.findByIdAndDelete(req.params.id,req.body);
        if(!user) res.status(404).send("No item found");
        else
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
app.post('/login', async(req,res)=>{
       const body = req.body;
    const users =  new userModel(body);
    userModel.findOne({email:users.email}).then(user=>{
        if(!user){            
        return res.render('/Users',{view: "validate Email or Pasword"});
    }
    const pass = user.password;
    const validPassword =  bcrypt.compareSync(body.password,pass);
      if (!validPassword) {
        return res.render('/Users',{view: "validate Email or Pasword"});
      }
      req.session.isAuth =true;
      req.session.email = user.email;
      res.redirect('/Home');
      });  
});
app.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/Users');
    });
});
app.use(express.static('views'));

module.exports = app;