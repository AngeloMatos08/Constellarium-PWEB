
export function createGame() {

    let constellations = [];
    let currentConstellation = null;

    // Catálogo global de estrelas reais.
    const stars = [];

    // Estrelas decorativas do céu.
    const backgroundStars = [];

    // Estrelas falsas de desafio.
    const challengeStars = [];

    let connections = [];
    let selectedStar = null;
    let correctConnections = [];


    function loadConstellation(constellation) {

        connections.length = 0;
        selectedStar = null;

        currentConstellation = constellation;

        correctConnections =
            constellation.connections;
    }


    function addConnection(starA, starB) {

        if (starA === starB) {
            return;
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


        if (!alreadyConnected) {

            connections.push([
                starA,
                starB
            ]);

        }
    }


    function selectStar(starId) {

        if (selectedStar === null) {

            selectedStar = starId;

        } else {

            addConnection(
                selectedStar,
                starId
            );

            selectedStar = starId;

        }
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


    function reset() {

        connections.length = 0;
        selectedStar = null;

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
                correctConnections
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
