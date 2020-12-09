const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Elimina espacios en blanco
    },

    lastName: {
        type: String,
        required: true,
        trim: true

    },

    password: {
        type: String,
        required: true,
        trim: true,

    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,

    },

    created: {
        type: Date,
        default: Date.now()

    }


})

module.exports = mongoose.model('User', UsersSchema);