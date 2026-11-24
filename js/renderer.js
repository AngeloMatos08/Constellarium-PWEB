
export function createRenderer(ctx, state) {

    function draw(
        projectedPositions,
        selectedStar,
        width,
        height,
        hoveredStar = null
    ) {

        // LIMPAR O CANVAS

        ctx.fillStyle = "#000814";
        ctx.fillRect(0, 0, width, height);


        // DESENHAR CONEXÕES

        ctx.save();

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();

        ctx.strokeStyle = "#efeeed";
        ctx.lineWidth = 2;

        for (const connection of state.connections) {

            const position1 =
                projectedPositions.get(connection[0]);

            const position2 =
                projectedPositions.get(connection[1]);

            if (
                !position1 ||
                !position2 ||
                !Number.isFinite(position1.x) ||
                !Number.isFinite(position1.y) ||
                !Number.isFinite(position2.x) ||
                !Number.isFinite(position2.y)
            ) {
                continue;
            }

            const clippedLine = clipLine(
                position1,
                position2,
                width,
                height
            );

            if (!clippedLine) continue;

            ctx.beginPath();

            ctx.moveTo(
                clippedLine.x1,
                clippedLine.y1
            );

            ctx.lineTo(
                clippedLine.x2,
                clippedLine.y2
            );

            ctx.stroke();
        }

        ctx.restore();



        // DESENHAR ESTRELAS DECORATIVAS

        for (const star of state.backgroundStars) {

            const position =
                projectedPositions.get(star.id);

            if (
                !position?.visible ||
                !Number.isFinite(position.x) ||
                !Number.isFinite(position.y)
            ) {
                continue;
            }

            ctx.save();

            // INTENSIDADE DO BRILHO

            const glowIntensity =
                star.glow ?? 0.2;

            // TAMANHO DA AURA

            const glowRadius =
                star.radius * 5;

            // GRADIENTE DA AURA

            const gradient =
                ctx.createRadialGradient(
                    position.x,
                    position.y,
                    0,
                    position.x,
                    position.y,
                    glowRadius
                );

            gradient.addColorStop(
                0,
                star.color
            );

            gradient.addColorStop(
                0.25,
                `rgba(255, 255, 255, ${glowIntensity * 0.2})`
            );

            gradient.addColorStop(
                1,
                "rgba(255, 255, 255, 0)"
            );

            // DESENHAR A AURA

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                glowRadius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = gradient;
            ctx.fill();

            // DESENHAR O NÚCLEO

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                star.radius,
                0,
                Math.PI * 2
            );

            ctx.globalAlpha =
                star.opacity ?? 1;

            ctx.fillStyle =
                star.color ?? "#ffffff";

            ctx.fill();

            ctx.restore();

        }



        // DESENHAR ESTRELAS REAIS E DE DESAFIO

        for (const star of [
            ...state.stars,
            ...state.challengeStars
        ]) {

            const position =
                projectedPositions.get(star.id);

            if (
                !position?.visible ||
                !Number.isFinite(position.x) ||
                !Number.isFinite(position.y)
            ) {
                continue;
            }

            // Magnitude menor significa estrela mais brilhante.

            const magnitude = star.magnitude ?? 3;

            // Converte a magnitude em tamanho visual.

            const radius = Math.max(
                1.5,
                Math.min(
                    5,
                    4 - magnitude * 0.7
                )
            );

            // Brilho da aura.

            const glowIntensity = Math.max(
                0.15,
                Math.min(
                    1,
                    1 - magnitude / 4
                )
            );

            // COR DA ESTRELA

            const starColor =
                star.color ?? "#ffffff";


            // AURA LUMINOSA

            const glowRadius = radius * 5;

            const gradient =
                ctx.createRadialGradient(
                    position.x,
                    position.y,
                    0,
                    position.x,
                    position.y,
                    glowRadius
                );

            gradient.addColorStop(
                0,
                starColor
            );

            gradient.addColorStop(
                0.2,
                `rgba(255, 255, 255, ${glowIntensity * 0.25})`
            );

            gradient.addColorStop(
                1,
                "rgba(255, 255, 255, 0)"
            );

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                glowRadius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = gradient;
            ctx.fill();


            // NÚCLEO DA ESTRELA

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = starColor;
            ctx.fill();


            // DESTAQUE DA ESTRELA SELECIONADA

            if (selectedStar === star.id) {

                ctx.beginPath();

                ctx.arc(
                    position.x,
                    position.y,
                    radius + 6,
                    0,
                    Math.PI * 2
                );

                ctx.strokeStyle = "#1adf17";
                ctx.lineWidth = 2;

                ctx.stroke();
            }

        }


        // IDENTIFICAÇÃO DA ESTRELA SOB O CURSOR

        if (hoveredStar !== null) {

            const star = state.stars.find(
                star => star.id === hoveredStar
            );

            const position =
                projectedPositions.get(hoveredStar);

            if (
                star &&
                position?.visible &&
                Number.isFinite(position.x) &&
                Number.isFinite(position.y)
            ) {

                const label =
                    star.name ?? star.id;

                ctx.save();

                // CONFIGURAÇÃO DO TEXTO

                ctx.font = "12px sans-serif";
                ctx.textBaseline = "middle";

                const paddingX = 10;
                const boxHeight = 28;

                const textWidth =
                    ctx.measureText(label).width;

                const boxWidth =
                    textWidth + paddingX * 2;

                // POSIÇÃO INICIAL DA ETIQUETA

                let labelX =
                    position.x + 14;

                let labelY =
                    position.y - 38;

                // EVITAR QUE ULTRAPASSE A BORDA DIREITA

                if (labelX + boxWidth > width) {

                    labelX =
                        position.x - boxWidth - 14;

                }

                // EVITAR QUE ULTRAPASSE A BORDA SUPERIOR

                if (labelY < 0) {

                    labelY =
                        position.y + 18;

                }

                // GARANTIR QUE FIQUE DENTRO DO CANVAS

                labelX = Math.max(
                    4,
                    Math.min(
                        labelX,
                        width - boxWidth - 4
                    )
                );

                labelY = Math.max(
                    4,
                    Math.min(
                        labelY,
                        height - boxHeight - 4
                    )
                );


                // FUNDO DA ETIQUETA

                ctx.beginPath();

                ctx.roundRect(
                    labelX,
                    labelY,
                    boxWidth,
                    boxHeight,
                    6
                );

                ctx.fillStyle =
                    "rgba(5, 15, 35, 0.92)";

                ctx.fill();

                // BORDA COLORIDA

                ctx.strokeStyle =
                    star.color ?? "#ffffff";

                ctx.lineWidth = 1;

                ctx.stroke();


                // NOME DA ESTRELA

                ctx.fillStyle = "#ffffff";

                ctx.fillText(
                    label,
                    labelX + paddingX,
                    labelY + boxHeight / 2
                );

                ctx.restore();

            }

        }

    }

    return {
        draw
    };

}



// RECORTAR UMA LINHA NOS LIMITES DO CANVAS
// Algoritmo Liang-Barsky.

function clipLine(start, end, width, height) {

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    let tMin = 0;
    let tMax = 1;

    const p = [-dx, dx, -dy, dy];

    const q = [
        start.x,
        width - start.x,
        start.y,
        height - start.y
    ];

    for (let i = 0; i < 4; i++) {

        if (p[i] === 0) {

            // Linha paralela ao limite e fora do Canvas.

            if (q[i] < 0) {
                return null;
            }

            continue;
        }

        const t = q[i] / p[i];

        if (p[i] < 0) {
            tMin = Math.max(tMin, t);
        } else {
            tMax = Math.min(tMax, t);
        }

        if (tMin > tMax) {
            return null;
        }
    }

    return {
        x1: start.x + tMin * dx,
        y1: start.y + tMin * dy,
        x2: start.x + tMax * dx,
        y2: start.y + tMax * dy
    };
}
