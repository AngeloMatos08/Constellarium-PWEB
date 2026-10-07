const express = require("express");
const path = require("node:path");
const pagesRouter = require("./routes/pages.js");

const app = express();
const rootDirectory = __dirname;
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");

app.use("/css", express.static(path.join(rootDirectory, "css")));
app.use("/js", express.static(path.join(rootDirectory, "js")));
app.use("/data", express.static(path.join(rootDirectory, "data")));
app.use("/", pagesRouter);

app.use((request, response) => {
    response.status(404).send("Página não encontrada.");
});

app.listen(port, () => {
    console.log(`Constellarium disponível em http://localhost:${port}`);
});