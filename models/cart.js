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
    seller:{
        type:String,
        required:true
    },
        buyer:{
        type:String,
        required:true
    },
    productId:{
        type:String
    },
    status:{
        type:Number
    }

});
const Cart =  mongoose.model('carts',UserSchema);
module.exports = Cart;