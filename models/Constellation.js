
const mongoose = require("mongoose");

const constellationSchema = new mongoose.Schema({

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

    difficulty: {
        type: Number,
        required: true,
        min: 1
    },

    center: {
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
        }
    },

    stars: [{
        _id: false,

        id: {
            type: String,
            required: true,
            ref: "Star"
        },

        diagram: {
            x: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },

            y: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            }
        }
    }],

    connections: {
        type: [[String]],
        default: []
    }

}, {
    timestamps: true,
    collection: "constellations"
});

module.exports = mongoose.model(
    "Constellation",
    constellationSchema
);
