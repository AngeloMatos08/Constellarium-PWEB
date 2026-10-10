
const FIELD_OF_VIEW_RA = 10;
const FIELD_OF_VIEW_DEC = 10;

// Converte graus para radianos.
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Converte RA em horas decimais para graus.
function raHoursToDegrees(hours) {
    return hours * 15;
}

// Converte a diferença de RA para o intervalo [-180°, 180°).
function normalizeRA(degrees) {
    return ((degrees + 180) % 360 + 360) % 360 - 180;
}

/**
 * Projeta uma estrela no campo de visão do telescópio.
 *
 * star:
 *   { id, ra } -> RA em horas decimais
 *   { id, dec } -> DEC em graus
 *
 * telescopePosition:
 *   { ra }  -> RA em minutos
 *   { dec } -> DEC em graus
 *
 * width e height:
 *   dimensões lógicas do Canvas, em pixels.
 */
export function projectStar(
    star,
    telescopePosition,
    width,
    height
) {
    const starRA = toRadians(
        raHoursToDegrees(star.ra)
    );

    const starDEC = toRadians(star.dec);

    const telescopeRA = toRadians(
        (telescopePosition.ra / 60) * 15
    );

    const telescopeDEC = toRadians(
        telescopePosition.dec
    );

    // Diferença de RA considerando a passagem por 24h/0h.
    const deltaRA = toRadians(
        normalizeRA(
            raHoursToDegrees(star.ra) -
            (telescopePosition.ra / 60) * 15
        )
    );

    const sinStarDEC = Math.sin(starDEC);
    const cosStarDEC = Math.cos(starDEC);

    const sinTelescopeDEC = Math.sin(telescopeDEC);
    const cosTelescopeDEC = Math.cos(telescopeDEC);

    // Denominador da projeção gnomônica.
    const denominator =
        sinTelescopeDEC * sinStarDEC +
        cosTelescopeDEC *
        cosStarDEC *
        Math.cos(deltaRA);

    // A estrela está no horizonte do plano tangente
    // ou atrás dele: não pode ser projetada.
    if (denominator <= 0) {
        return {
            x: null,
            y: null,
            visible: false
        };
    }

    const projectedX =
        (cosStarDEC * Math.sin(deltaRA)) /
        denominator;

    const projectedY =
        (
            cosTelescopeDEC * sinStarDEC -
            sinTelescopeDEC *
            cosStarDEC *
            Math.cos(deltaRA)
        ) / denominator;

    const halfWidth = toRadians(
        FIELD_OF_VIEW_RA / 2
    );

    const halfHeight = toRadians(
        FIELD_OF_VIEW_DEC / 2
    );

    // Limites do campo no plano tangente.
    const limitX = Math.tan(halfWidth);
    const limitY = Math.tan(halfHeight);

    const visible =
        Math.abs(projectedX) <= limitX &&
        Math.abs(projectedY) <= limitY;

    // Converte o plano tangente para pixels.
    const x =
        width / 2 +
        (projectedX / limitX) * (width / 2);

    const y =
        height / 2 -
        (projectedY / limitY) * (height / 2);

    return {
        x,
        y,
        visible
    };
}
