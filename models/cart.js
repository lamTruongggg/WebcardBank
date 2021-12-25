const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    name:{
        type: String
    },
    price:{
        type:Number
    },
    des:{
        type:String
    },
    currency:{
        type:String
    },
    quantity:{
        type:Number
    },
    author:{
        type:String,
        required:true
    },
    status:{
        type:Number
    }

});
const Cart =  mongoose.model('carts',UserSchema);
module.exports = Cart;