
export function createTelescope() {

    // Ascensão reta em minutos (0 a 1439).
    let ra = 0;

    // Declinação em graus (-90 a +90).
    let dec = 0;

    // Campo de visão em graus.
    let fieldOfView = 25;

    const MIN_FIELD_OF_VIEW = 2;
    const MAX_FIELD_OF_VIEW = 40;
    const ZOOM_FACTOR = 1.25;

    // Altera a ascensão reta.
    function changeRA(minutes) {
        const totalMinutes = 1440;

        ra =
            ((ra + minutes) % totalMinutes + totalMinutes) %
            totalMinutes;
    }

    // Altera a declinação.
    function changeDEC(degrees) {
        dec += degrees;

        dec = Math.max(
            -90,
            Math.min(90, dec)
        );
    }

    // Aproxima o campo de visão.
    function zoomIn() {
        fieldOfView = Math.max(
            MIN_FIELD_OF_VIEW,
            fieldOfView / ZOOM_FACTOR
        );
    }

    // Afasta o campo de visão.
    function zoomOut() {
        fieldOfView = Math.min(
            MAX_FIELD_OF_VIEW,
            fieldOfView * ZOOM_FACTOR
        );
    }

    // Retorna o estado atual do telescópio.
    function getPosition() {
        return {
            ra,
            dec,
            fieldOfView
        };
    }

    return {
        changeRA,
        changeDEC,
        zoomIn,
        zoomOut,
        getPosition
    };
}
