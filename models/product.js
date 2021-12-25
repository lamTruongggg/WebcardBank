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
    author:{
        type:String,
        required:true
    }

});
const Product =  mongoose.model('products',UserSchema);
module.exports = Product;