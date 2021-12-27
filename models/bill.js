const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({   
        name_items : {
            type:String        
            },
             sku_items : {
                 type:String
             },
             price_items :{
                 type:Number
             },
             currency_items : {
                   type:String
             },
             quantity_items : {
                 type:Number
             },
              seller :{
                   type:String
              },                      
              buyer : { 
                   type:String
              },
              fname :{
                   type:String
              },
              lname :{
                   type:String
              },
                recipient_name : {
                       type:String
                },
              line1 :{
                   type:String
              },
              city : {
                   type:String
              },
              state :{
                type:String
              },
              postal_code : {
                   type:String
              },
              country_code : {
                   type:String
              },
               total :{
                type:Number
            },
             fee_payment : {
                 type:Number
             },
             subTotal:{
                 type:Number
             },
              status :{
                   type:String
             },
             dateCreate :{
                   type:Date
             },
             dateUpdate :{
                   type:Date
             }, 

});
const Bill =  mongoose.model('transactions',UserSchema);
module.exports = Bill;