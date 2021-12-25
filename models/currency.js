const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    name:{
        type: String
    },
    type:{
        type:String
    }

});
const Currency =  mongoose.model('currencys',UserSchema);
module.exports = Currency;