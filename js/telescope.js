export function createTelescope() {

    // RA é armazenada em minutos.
    // 24 horas = 1440 minutos.
    let ra = 0;

    // DEC é armazenada em graus.
    // Limites: -90° até +90°.
    let dec = 0;


    // ALTERAR ASCENSÃO RETA

    function changeRA(minutes) {

        ra += minutes;

        // Mantém RA entre 0h e 24h.
        const totalMinutes = 24 * 60;

        ra =
            ((ra % totalMinutes) + totalMinutes) %
            totalMinutes;
    }


    // ALTERAR DECLINAÇÃO

    function changeDEC(degrees) {

        dec += degrees;

        // Mantém DEC entre -90° e +90°.
        dec = Math.max(
            -90,
            Math.min(90, dec)
        );
    }


    // OBTER POSIÇÃO ATUAL

    function getPosition() {

        return {
            ra,
            dec
        };
    }


    return {
        changeRA,
        changeDEC,
        getPosition
    };
}