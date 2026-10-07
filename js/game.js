export function createGame() {

    let constellations = [];
    let currentConstellation = null;

    let stars = [];
    let connections = [];
    let selectedStar = null;
    let correctConnections = [];


    function loadConstellation(constellation) {

        stars.length = 0;
        connections.length = 0;

        selectedStar = null;

        currentConstellation =
            constellation;

        stars.push(
            ...constellation.stars
        );

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
                connections,
                selectedStar,
                correctConnections
            };

        },

        loadConstellation,
        selectStar,
        setConstellations,
        reset

    };
}
