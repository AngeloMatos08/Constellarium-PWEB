
const express = require("express");

const Star = require("../models/Star.js");
const Constellation = require("../models/Constellation.js");

const router = express.Router();

// GET /api/stars
// Retorna todas as estrelas.
router.get("/stars", async (request, response) => {

    try {

        const stars = await Star.find()
            .select("-_id -__v -createdAt -updatedAt")
            .lean();

        response.json({
            stars
        });

    } catch (error) {

        console.error("Erro ao buscar estrelas:", error);

        response.status(500).json({
            error: "Não foi possível buscar as estrelas."
        });

    }

});

// GET /api/constellations
// Retorna todas as constelações.
router.get("/constellations", async (request, response) => {

    try {

        const constellations = await Constellation.find()
            .select("-_id -__v -createdAt -updatedAt")
            .lean();

        response.json({
            constellations
        });

    } catch (error) {

        console.error("Erro ao buscar constelações:", error);

        response.status(500).json({
            error: "Não foi possível buscar as constelações."
        });

    }

});

module.exports = router;
