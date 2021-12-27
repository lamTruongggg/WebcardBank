const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    cardType:{
        type: String,
        required:true

    },
    country:{
        type:String,
        required:true
    },
    cardNumber:{
        type:Number,
        required:true
    },
    month:{
        type:Number,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    ccv:{
        type:String
    },
    type:{
        type:String,
        required:true

    },
    status:{
        type:Number,
        required:true
    }   

});
const cardNumber =  mongoose.model('card_numbers',UserSchema);
module.exports = cardNumber;