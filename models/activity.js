const mongoose = require('mongoose');
const UserSchema =  new mongoose.Schema({
    user:{
        type: String
    },
    login:{
        type:Date
    }

});
const Activity =  mongoose.model('activities',UserSchema);
module.exports = Activity;