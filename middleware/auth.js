
const firebaseAuth = require("../config/firebase-admin.js");

async function authenticateUser(request, response, next) {

    try {

        const authorization = request.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {

            return response.status(401).json({
                error: "Autenticação necessária."
            });

        }

        const token = authorization.split(" ")[1];

        const decodedToken = await firebaseAuth.verifyIdToken(token);

        request.user = {
            uid: decodedToken.uid
        };

        next();

    } catch (error) {

        console.error("Erro ao autenticar usuário:", error.message);

        return response.status(401).json({
            error: "Token inválido ou expirado."
        });

    }

}

module.exports = authenticateUser;
