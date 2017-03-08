/**
 * Created by Muc on 17/3/7.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
    username: String,
    password: String
});

module.exports=mongoose.model('accounts', Account);