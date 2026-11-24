
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    // IDENTIFICAÇÃO NO FIREBASE
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // NOME PÚBLICO NO CONSTELLARIUM
    nickname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 16
    },

    // VERSÃO NORMALIZADA PARA EVITAR DUPLICATAS
    normalizedNickname: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    }

}, {
    timestamps: true,
    collection: "users"
});

module.exports = mongoose.model("User", userSchema);
