
export function validateConstellation(
    playerConnections,
    correctConnections
) {

    // A quantidade de conexões precisa ser igual.
    if (
        playerConnections.length !==
        correctConnections.length
    ) {
        return false;
    }

    // Normaliza todas as conexões do jogador.
    const normalizedPlayer =
        playerConnections.map(normalizeConnection);

    // Normaliza todas as conexões corretas.
    const normalizedCorrect =
        correctConnections.map(normalizeConnection);

    // Confere se todas as conexões esperadas foram feitas.
    for (const correctConnection of normalizedCorrect) {

        const found = normalizedPlayer.some(
            playerConnection =>
                playerConnection[0] === correctConnection[0] &&
                playerConnection[1] === correctConnection[1]
        );

        if (!found) {
            return false;
        }
    }

    return true;
}


// Organiza os identificadores para ignorar
// a direção da conexão.
function normalizeConnection(connection) {

    return [...connection].sort((a, b) => {

        // Mantém compatibilidade com IDs numéricos.
        if (
            typeof a === "number" &&
            typeof b === "number"
        ) {
            return a - b;
        }

        // Ordena IDs textuais.
        return String(a).localeCompare(String(b));
    });
}
