const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    name:{
        type: String
    },
    price:{
        type:Number
    },
    currency:{
        type:String
    },
    quantity:{
        type:Number
    },
    sku:{
        type:String
    }

});
const Cart =  mongoose.model('cartMModel',UserSchema);
module.exports = Cart;