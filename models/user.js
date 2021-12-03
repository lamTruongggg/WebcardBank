const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    firstName:{
        type: String
    },
    lastName:{
        type:String
    },
     address:{
        type:String
    },
     email:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
     salary:{
        type:Number
    },
     image:{
        type:String
    },
    phone:{
        type:Number
    }

});
const User =  mongoose.model('customers',UserSchema);
module.exports = User;