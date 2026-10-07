const FIELD_OF_VIEW_RA = 60;
const FIELD_OF_VIEW_DEC = 60;


export function projectStar(
    star,
    telescopePosition
) {

    // Diferença entre a posição
    // da estrela e a posição do telescópio.

    const deltaRA =
        star.ra -
        telescopePosition.ra;

    const deltaDEC =
        star.dec -
        telescopePosition.dec;


    // Tamanho da lente.

    const canvasSize = 600;


    // Centro da lente.

    const centerX =
        canvasSize / 2;

    const centerY =
        canvasSize / 2;


    // Converte a posição relativa
    // para pixels.

    const x =
        centerX +
        (deltaRA / FIELD_OF_VIEW_RA) *
        canvasSize;

    const y =
        centerY -
        (deltaDEC / FIELD_OF_VIEW_DEC) *
        canvasSize;


    // Verifica se a estrela
    // está dentro do campo de visão.

    const visible =
        x >= 0 &&
        x <= canvasSize &&
        y >= 0 &&
        y <= canvasSize;


    return {
        x,
        y,
        visible
    };
}