const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String
    },
    likeCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Posts', postSchema);