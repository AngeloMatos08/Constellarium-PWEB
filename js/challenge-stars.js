
export function createChallengeStars(quantity = 150) {

    const stars = [];

    for (let i = 0; i < quantity; i++) {

        const ra = Math.random() * 24;

        const dec = Math.asin(
            Math.random() * 2 - 1
        ) * 180 / Math.PI;

        const magnitude =
            1.5 + Math.random() * 3;

        const colors = [
            "#c7ddff",
            "#b9d3ff",
            "#ffad80",
            "#ffffff"
        ];

        const color =
            colors[
                Math.floor(Math.random() * colors.length)
            ];

        stars.push({

            id: `challenge-${i + 1}`,

            name: `Estrela desconhecida ${i + 1}`,

            ra,
            dec,

            magnitude,
            color,

            challenge: true,
            selectable: true

        });

    }

    return stars;

}
