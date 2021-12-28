const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    customerId:{
        type: String
    },
    client_id:{
        type:String
    },
    client_secret:{
        type:String
    }

});
const Connect =  mongoose.model('connects',UserSchema);
module.exports = Connect;