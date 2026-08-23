export function validateConstellation(
    playerConnections,
    correctConnections
) {

    // Quantidade de conexões precisa ser igual
    if (
        playerConnections.length !==
        correctConnections.length
    ) {
        return false;
    }


    const normalizedPlayer =
        playerConnections.map(
            normalizeConnection
        );


    const normalizedCorrect =
        correctConnections.map(
            normalizeConnection
        );


    for (const correctConnection of normalizedCorrect) {

        const found =
            normalizedPlayer.some(
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

function normalizeConnection(connection) {

    return [...connection].sort(
        (a, b) => a - b
    );
}