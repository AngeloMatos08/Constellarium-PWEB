
const mongoose = require("mongoose");

async function connectDatabase() {

    const databaseURI = process.env.MONGODB_URI;

    if (!databaseURI) {
        throw new Error(
            "A variável MONGODB_URI não foi definida no .env"
        );
    }

    try {

        await mongoose.connect(databaseURI);

        console.log("MongoDB conectado com sucesso!");
        console.log(`Banco: ${mongoose.connection.name}`);

    } catch (error) {

        console.error("Erro ao conectar ao MongoDB:");
        console.error(error.message);

        throw error;

    }

}

module.exports = connectDatabase;
