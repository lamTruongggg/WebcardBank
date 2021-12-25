const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    name:{
        type: String
    }   

});
const Card =  mongoose.model('card_types',UserSchema);
module.exports = Card;