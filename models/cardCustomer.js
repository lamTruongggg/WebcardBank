const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    
    customerId:{
        type:String
    },
     cardType:{
        type: String,
        required:true

    },
    country:{
        type:String,
        required:true
    },
    cardNumber:{
        type:Number
    },
    month:{
        type:Number
    },
    year:{
        type:Number
    },
    cvv:{
        type:String
    },
    moneyBank:{
        type:Number
    },
    moneyCheck:{
        type:Number
    },
    dateBank:{
        type:Date
    },
    dateCheck:{
        type:Date
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
    pin:{
        type:String
    }
    ,type:{
        type:String
    }

});
const cardCustomer =  mongoose.model('cards',UserSchema);
module.exports = cardCustomer;