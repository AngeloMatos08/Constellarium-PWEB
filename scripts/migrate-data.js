require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const mongoose = require("mongoose");

const connectDatabase = require("../config/database.js");

const Star = require("../models/Star.js");
const Constellation = require("../models/Constellation.js");

// Caminhos dos arquivos JSON.
const starsPath = path.join(
    __dirname,
    "../data/stars.json"
);

const constellationsPath = path.join(
    __dirname,
    "../data/constellations.json"
);

// Ler os dados originais.
function readJSON(filePath) {

    const content = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(content);

}

// Validar referências das estrelas.
function validateReferences(stars, constellations) {

    const starIds = new Set(
        stars.map(star => star.id)
    );

    for (const constellation of constellations) {

        for (const star of constellation.stars) {

            if (!starIds.has(star.id)) {

                throw new Error(
                    `A estrela "${star.id}" da constelação "${constellation.name}" não existe no catálogo.`
                );

            }

        }

    }

}

// Inserir ou atualizar documentos.
async function migrateCollection(Model, documents) {

    if (documents.length === 0) {
        return;
    }

    const operations = documents.map(document => ({

        updateOne: {

            filter: {
                id: document.id
            },

            update: {
                $set: document
            },

            upsert: true

        }

    }));

    await Model.bulkWrite(operations);

}

// Executar migração.
async function migrateData() {

    try {

        await connectDatabase();

        console.log("\nLendo arquivos JSON...");

        const starsData = readJSON(starsPath);
        const constellationsData = readJSON(
            constellationsPath
        );

        const stars = starsData.stars;
        const constellations = constellationsData.constellations;

        console.log(`Estrelas encontradas: ${stars.length}`);
        console.log(
            `Constelações encontradas: ${constellations.length}`
        );

        console.log("\nValidando referências...");

        validateReferences(stars, constellations);

        console.log("Referências validadas!");

        console.log("\nMigrando estrelas...");

        await migrateCollection(Star, stars);

        console.log("Estrelas migradas!");

        console.log("\nMigrando constelações...");

        await migrateCollection(
            Constellation,
            constellations
        );

        console.log("Constelações migradas!");

        console.log("\nMigração concluída com sucesso!");

    } catch (error) {

        console.error("\nErro durante a migração:");
        console.error(error);

        process.exitCode = 1;

    } finally {

        await mongoose.disconnect();

    }

}

migrateData();
