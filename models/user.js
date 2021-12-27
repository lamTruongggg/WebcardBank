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
    phone:{
        type:Number
    },
    status:{
        type:Number
    },
    dateCreate:{
        type:Date
    },
    dateUpdate:{
        type:Date
    },
    isAdmin:{
        type:Number
    }
    

});
const User =  mongoose.model('customers',UserSchema);
module.exports = User;