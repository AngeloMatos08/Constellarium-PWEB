
const mongoose = require("mongoose");

// HISTÓRICO DE AÇÕES DO JOGADOR
const attemptSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ["connection", "reset"]
    },

    starA: {
        type: String,
        trim: true
    },

    starB: {
        type: String,
        trim: true
    }

}, {
    _id: false
});

const campaignSchema = new mongoose.Schema({

    // IDENTIFICAÇÃO DO JOGADOR NO FIREBASE
    userId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    // RESULTADOS INDIVIDUAIS DAS CONSTELAÇÕES
    results: [{

        _id: false,

        constellationId: {
            type: String,
            required: true,
            trim: true
        },

        constellationName: {
            type: String,
            required: true,
            trim: true
        },

        // HISTÓRICO USADO PARA VALIDAR A PONTUAÇÃO
        attempts: {
            type: [attemptSchema],
            default: []
        },

        score: {
            type: Number,
            required: true,
            min: 0
        },

        errors: {
            type: Number,
            required: true,
            min: 0
        },

        completed: {
            type: Boolean,
            required: true
        }

    }],

    // PONTUAÇÃO TOTAL DA CAMPANHA
    totalScore: {
        type: Number,
        required: true,
        min: 0
    }

}, {
    timestamps: true,
    collection: "campaigns"
});

module.exports = mongoose.model(
    "Campaign",
    campaignSchema
);
