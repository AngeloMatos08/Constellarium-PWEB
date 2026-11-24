
export function createGame() {

    let constellations = [];
    let currentConstellation = null;

    const stars = [];
    const backgroundStars = [];
    const challengeStars = [];

    let connections = [];
    let selectedStar = null;
    let correctConnections = [];

    let connectionFeedback = [];
    let feedbackMessage = null;


    // NORMALIZAR CONEXÕES PARA COMPARAÇÃO
    function normalizeConnection(a, b) {
        return [a, b].sort().join("|");
    }


    // VERIFICAR SE UMA CONEXÃO É CORRETA
    function isCorrectConnection(starA, starB) {

        const attempted =
            normalizeConnection(starA, starB);

        return correctConnections.some(connection => {

            return normalizeConnection(
                connection[0],
                connection[1]
            ) === attempted;

        });

    }


    // CALCULAR PROGRESSO DO DESAFIO
    function getProgress() {

        const correctCount =
            connectionFeedback.filter(
                item => item.status === "correct"
            ).length;

        const incorrectCount =
            connectionFeedback.filter(
                item => item.status === "incorrect"
            ).length;

        const total = correctConnections.length;

        const remaining = Math.max(
            total - correctCount,
            0
        );

        return {
            correct: correctCount,
            incorrect: incorrectCount,
            total,
            remaining,

            percentage: total > 0
                ? Math.round(correctCount / total * 100)
                : 0,

            complete:
                total > 0 &&
                correctCount === total
        };

    }


    // CARREGAR CONSTELAÇÃO
    function loadConstellation(constellation) {

        connections.length = 0;
        connectionFeedback.length = 0;

        selectedStar = null;
        feedbackMessage = null;

        currentConstellation = constellation;

        correctConnections =
            constellation.connections ?? [];

    }


    // ADICIONAR CONEXÃO
    function addConnection(starA, starB) {

        if (starA === starB) {
            return null;
        }

        const alreadyConnected =
            connections.some(connection => {

                return (
                    (connection[0] === starA &&
                     connection[1] === starB) ||

                    (connection[0] === starB &&
                     connection[1] === starA)
                );

            });

        if (alreadyConnected) {
            return null;
        }

        connections.push([starA, starB]);

        const correct =
            isCorrectConnection(starA, starB);

        const result = {
            starA,
            starB,
            status: correct ? "correct" : "incorrect",
            timestamp: Date.now()
        };

        connectionFeedback.push(result);

        feedbackMessage = {
            type: result.status,
            text: correct
                ? "Conexão correta!"
                : "Essa conexão não pertence à constelação.",
            timestamp: Date.now()
        };

        return result;

    }


    // SELECIONAR ESTRELA
    function selectStar(starId) {

        if (selectedStar === null) {

            selectedStar = starId;

            feedbackMessage = {
                type: "info",
                text: "Selecione outra estrela para conectar.",
                timestamp: Date.now()
            };

            return {
                selected: true,
                progress: getProgress()
            };

        }

        const result = addConnection(
            selectedStar,
            starId
        );

        selectedStar = starId;

        return {
            selected: true,
            connection: result,
            progress: getProgress()
        };

    }


    function setConstellations(data) {
        constellations = data;
    }


    function setSkyStars(data) {
        stars.length = 0;
        stars.push(...data);
    }


    function setBackgroundStars(data) {
        backgroundStars.length = 0;
        backgroundStars.push(...data);
    }


    function setChallengeStars(data) {
        challengeStars.length = 0;
        challengeStars.push(...data);
    }


    // LIMPAR TENTATIVA
    function reset() {

        connections.length = 0;
        connectionFeedback.length = 0;

        selectedStar = null;
        feedbackMessage = null;

    }


    return {

        getState() {

            return {
                constellations,
                currentConstellation,
                stars,
                backgroundStars,
                challengeStars,
                connections,
                selectedStar,
                correctConnections,
                connectionFeedback,

                // Getters mantêm os dados atualizados
                get feedbackMessage() {
                    return feedbackMessage;
                },

                get progress() {
                    return getProgress();
                }
            };

        },

        loadConstellation,
        selectStar,
        setBackgroundStars,
        setChallengeStars,
        setConstellations,
        setSkyStars,
        reset

    };

}
