
function clipLineToCanvas(x1, y1, x2, y2, width, height) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    let t0 = 0;
    let t1 = 1;

    const p = [-dx, dx, -dy, dy];
    const q = [x1, width - x1, y1, height - y1];

    for (let i = 0; i < 4; i++) {

        if (p[i] === 0) {

            if (q[i] < 0) {
                return null;
            }

            continue;
        }

        const t = q[i] / p[i];

        if (p[i] < 0) {
            t0 = Math.max(t0, t);
        } else {
            t1 = Math.min(t1, t);
        }

        if (t0 > t1) {
            return null;
        }
    }

    return {
        x1: x1 + t0 * dx,
        y1: y1 + t0 * dy,
        x2: x1 + t1 * dx,
        y2: y1 + t1 * dy
    };
}

export function createRenderer(ctx, state) {

    function draw(
        projectedPositions,
        selectedStar,
        width,
        height,
        hoveredStar = null,
        shootingStars = []
    ) {

        // LIMPAR O CANVAS

        ctx.fillStyle = "#000814";
        ctx.fillRect(0, 0, width, height);



        // DESENHAR CONEXÕES

        for (const connection of state.connections) {

            const start = projectedPositions.get(connection[0]);
            const end = projectedPositions.get(connection[1]);

            if (
                !start ||
                !end ||
                !Number.isFinite(start.x) ||
                !Number.isFinite(start.y) ||
                !Number.isFinite(end.x) ||
                !Number.isFinite(end.y)
            ) {
                continue;
            }

            // RECORTAR A CONEXÃO NOS LIMITES DO CANVAS

            const clipped = clipLineToCanvas(
                start.x,
                start.y,
                end.x,
                end.y,
                width,
                height
            );

            if (!clipped) {
                continue;
            }

            ctx.save();

            ctx.beginPath();

            ctx.moveTo(clipped.x1, clipped.y1);
            ctx.lineTo(clipped.x2, clipped.y2);

            ctx.strokeStyle = "rgba(76, 201, 240, 0.65)";
            ctx.lineWidth = 1.5;

            ctx.shadowBlur = 5;
            ctx.shadowColor = "#4cc9f0";

            ctx.stroke();

            ctx.restore();
        }


        // DESENHAR ESTRELAS CADENTES

        for (const star of shootingStars) {

            const speed = Math.hypot(star.vx, star.vy);

            if (
                !Number.isFinite(speed) ||
                speed === 0 ||
                !Number.isFinite(star.x) ||
                !Number.isFinite(star.y)
            ) {
                continue;
            }

            const dx = star.vx / speed;
            const dy = star.vy / speed;

            ctx.save();

            const gradient =
                ctx.createLinearGradient(
                    star.x - dx * star.length,
                    star.y - dy * star.length,
                    star.x,
                    star.y
                );

            gradient.addColorStop(
                0,
                "rgba(255, 255, 255, 0)"
            );

            gradient.addColorStop(
                1,
                `rgba(255, 255, 255, ${star.opacity * star.brightness})`
            );

            ctx.beginPath();

            ctx.moveTo(
                star.x - dx * star.length,
                star.y - dy * star.length
            );

            ctx.lineTo(star.x, star.y);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = star.thickness;
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#ffffff";

            ctx.stroke();

            // CABEÇA DA ESTRELA CADENTE

            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);

            ctx.fillStyle =
                `rgba(255, 255, 255, ${star.opacity * star.brightness})`;

            ctx.fill();

            ctx.restore();
        }


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

            // CINTILAÇÃO

            const currentTime = performance.now() / 1000;

            const twinkle =
                (
                    Math.sin(
                        currentTime * star.twinkleSpeed +
                        star.twinklePhase
                    ) + 1
                ) / 2;

            const animatedOpacity =
                star.opacity * (0.55 + twinkle * 0.45);

            const glowIntensity =
                (star.glow ?? 0.2) * (0.5 + twinkle * 0.8);


            // AURA DA ESTRELA

            const glowRadius =
                star.highlighted
                    ? star.radius * 8
                    : star.radius * 5;

            const gradient =
                ctx.createRadialGradient(
                    position.x,
                    position.y,
                    0,
                    position.x,
                    position.y,
                    glowRadius
                );

            gradient.addColorStop(0, star.color);

            gradient.addColorStop(
                0.15,
                `rgba(255, 255, 255, ${glowIntensity * 0.35})`
            );

            gradient.addColorStop(
                0.45,
                `rgba(255, 255, 255, ${glowIntensity * 0.12})`
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

            ctx.globalAlpha = animatedOpacity;

            ctx.beginPath();
            ctx.arc(
                position.x,
                position.y,
                star.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = star.color ?? "#ffffff";
            ctx.fill();


            // RAIOS DAS ESTRELAS DE DESTAQUE

            if (star.highlighted) {

                ctx.save();

                ctx.globalAlpha = glowIntensity * 0.5;

                ctx.strokeStyle = star.color;
                ctx.lineWidth = 1;

                const rayLength = star.radius * 5;

                ctx.beginPath();

                ctx.moveTo(
                    position.x - rayLength,
                    position.y
                );

                ctx.lineTo(
                    position.x + rayLength,
                    position.y
                );

                ctx.moveTo(
                    position.x,
                    position.y - rayLength
                );

                ctx.lineTo(
                    position.x,
                    position.y + rayLength
                );

                ctx.stroke();

                ctx.restore();
            }

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


            // MAGNITUDE

            const magnitude = star.magnitude ?? 3;


            // IDENTIFICAR O TIPO DE ESTRELA

            const isChallengeStar =
                star.challenge === true;


            // TAMANHO VISUAL

            const radius = Math.max(
                1.5,
                Math.min(
                    5,
                    4 - magnitude * 0.7
                )
            );


            // INTENSIDADE DA AURA

            const baseGlow = Math.max(
                0.15,
                Math.min(
                    1,
                    1 - magnitude / 4
                )
            );

            const glowIntensity = isChallengeStar
                ? baseGlow * 0.8
                : baseGlow * 1.15;


            // CORES

            const starColor =
                star.color ?? "#ffffff";

            const glowColor = isChallengeStar
                ? "#b9a5ff"
                : starColor;


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

            gradient.addColorStop(0, glowColor);

            gradient.addColorStop(
                0.2,
                isChallengeStar
                    ? `rgba(185, 165, 255, ${glowIntensity * 0.25})`
                    : `rgba(255, 255, 255, ${glowIntensity * 0.25})`
            );

            gradient.addColorStop(
                1,
                "rgba(255, 255, 255, 0)"
            );

            ctx.save();

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

                ctx.shadowBlur = 8;
                ctx.shadowColor = "#1adf17";

                ctx.stroke();
            }

            ctx.restore();
        }


        // IDENTIFICAR ESTRELAS SOB O MOUSE

        if (hoveredStar) {

            const star = [
                ...state.stars,
                ...state.challengeStars
            ].find(
                item => item.id === hoveredStar
            );

            if (star) {

                const position =
                    projectedPositions.get(star.id);

                if (
                    position?.visible &&
                    Number.isFinite(position.x) &&
                    Number.isFinite(position.y)
                ) {

                    const label =
                        star.name ?? "Estrela desconhecida";

                    ctx.save();

                    ctx.font = "14px Arial";

                    const textWidth =
                        ctx.measureText(label).width;

                    const boxWidth = textWidth + 20;
                    const boxHeight = 30;

                    const boxX = position.x + 12;
                    const boxY = position.y - 38;

                    // FUNDO DO TOOLTIP

                    ctx.fillStyle = "rgba(5, 15, 35, 0.92)";

                    ctx.strokeStyle = isChallengeStarColor(star)
                        ? "rgba(185, 165, 255, 0.6)"
                        : "rgba(76, 201, 240, 0.5)";

                    ctx.lineWidth = 1;

                    ctx.beginPath();

                    ctx.roundRect(
                        boxX,
                        boxY,
                        boxWidth,
                        boxHeight,
                        6
                    );

                    ctx.fill();
                    ctx.stroke();

                    // TEXTO

                    ctx.fillStyle = "#ffffff";

                    ctx.fillText(
                        label,
                        boxX + 10,
                        boxY + 19
                    );

                    ctx.restore();
                }
            }
        }
    }

    return { draw };
}


// IDENTIFICAR ESTRELA DE DESAFIO

function isChallengeStarColor(star) {
    return star.challenge === true;
}
