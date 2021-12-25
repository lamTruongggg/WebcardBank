const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    name:{
        type: String
    }   

});
const Country =  mongoose.model('countrys',UserSchema);
module.exports = Country;