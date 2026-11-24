
const mongoose = require("mongoose");

const starSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    ra: {
        type: Number,
        required: true,
        min: 0,
        max: 24
    },

    dec: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },

    magnitude: {
        type: Number,
        required: true
    },

    color: {
        type: String,
        required: true,
        match: /^#[0-9A-Fa-f]{6}$/
    }

}, {
    timestamps: true,
    collection: "stars"
});

module.exports = mongoose.model("Star", starSchema);
