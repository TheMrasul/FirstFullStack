const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true,
        unique: true
    }
})

const User = module.exports = mongoose.model('User', userSchema);

module.exports.getUserByLogin = (login, callback) => {
    const query = {login: login}
    User.findOne(query, callback);
}

module.exports.getUserById = (id, callback) => {
    const query = {id};
    User.findById(query, callback)
}

module.exports.comparePass = function (passFromUser, userDBPass, callback){
    bcrypt.compare(passFromUser, userDBPass, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    })
}