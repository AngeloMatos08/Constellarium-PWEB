const express = require("express");
const path = require("node:path");

const router = express.Router();
const rootDirectory = path.resolve(__dirname, "..");

const routeTable = new Map([
    ["/", "index.html"],
    ["/index.html", "index.html"],
    ["/como-jogar", "como-jogar.html"],
    ["/como-jogar.html", "como-jogar.html"],
    ["/sobre", "sobre.html"],
    ["/sobre.html", "sobre.html"],
    ["/jogo", "jogo.html"],
    ["/jogo.html", "jogo.html"]
]);

router.get([...routeTable.keys()], (request, response, next) => {
    const filePath = path.join(rootDirectory, routeTable.get(request.path));

    response.sendFile(filePath, (error) => {
        if (error) next(error);
    });
});

module.exports = router;