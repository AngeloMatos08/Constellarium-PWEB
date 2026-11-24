
export function createBackgroundStars(quantity = 2500) {

    const stars = [];

    // Gerador pseudoaleatório com semente fixa.
    // Assim, as estrelas mantêm suas posições
    // mesmo quando o jogador reinicia o jogo.

    let seed = 123456789;

    function random() {
        seed = (1664525 * seed + 1013904223) % 4294967296;
        return seed / 4294967296;
    }

    // Paleta de cores das estrelas decorativas.

    const colors = [
        "#ffffff",
        "#dce9ff",
        "#b9d3ff",
        "#ffe4c4",
        "#c7ddff"
    ];

    for (let i = 0; i < quantity; i++) {

        // Distribuição uniforme na esfera celeste.

        const ra = random() * 24;

        const dec = Math.asin(
            random() * 2 - 1
        ) * 180 / Math.PI;

        // Variações visuais.

        const radius = 0.5 + random() * 1.5;

        const opacity = 0.2 + random() * 0.65;

        const color =
            colors[
                Math.floor(random() * colors.length)
            ];

        // Intensidade individual do brilho.

        const glow = 0.1 + random() * 0.5;
        // ESTRELAS DE DESTAQUE

        const isHighlighted =
            random() < 0.025;

        const highlightMultiplier =
            isHighlighted ? 2.5 : 1;
        stars.push({

            id: `background-${i}`,

            ra,
            dec,

            // Identifica uma estrela decorativa.

            decorative: true,
            selectable: false,

            // Propriedades visuais.

            radius: radius * highlightMultiplier,

            opacity: isHighlighted
                ? Math.min(1, opacity * 1.3)
                : opacity,

            color,

            glow: glow * highlightMultiplier,

            highlighted: isHighlighted,

            twinkleSpeed: 0.8 + random() * 2.2,
            twinklePhase: random() * Math.PI * 2

        });

    }

    return stars;

}
