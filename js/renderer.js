export function createRenderer(ctx, state) {

    function draw(projectedPositions, selectedStar) {

        // LIMPAR O CANVAS

        ctx.fillStyle = "#000814";

        ctx.fillRect(
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );


        // DESENHAR CONEXÕES

        ctx.strokeStyle = "#efeeed";
        ctx.lineWidth = 2;

        for (const connection of state.connections) {

            const position1 =
                projectedPositions.get(connection[0]);

            const position2 =
                projectedPositions.get(connection[1]);

            if (
                position1?.visible &&
                position2?.visible &&
                Number.isFinite(position1.x) &&
                Number.isFinite(position1.y) &&
                Number.isFinite(position2.x) &&
                Number.isFinite(position2.y)
            ) {


                ctx.beginPath();

                ctx.moveTo(
                    position1.x,
                    position1.y
                );

                ctx.lineTo(
                    position2.x,
                    position2.y
                );

                ctx.stroke();
            }
        }


        // DESENHAR ESTRELAS

        for (const star of state.stars) {

            const position =
                projectedPositions.get(star.id);

            if (
                !position?.visible ||
                !Number.isFinite(position.x) ||
                !Number.isFinite(position.y)
            ) {
                continue;
            }


            // COR DA ESTRELA

            if (selectedStar === star.id) {

                ctx.fillStyle = "#ffffff";

            } else {

                ctx.fillStyle = "#ffffff";

            }


            // ESTRELA

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // BORDA DA ESTRELA SELECIONADA

            if (selectedStar === star.id) {

                ctx.beginPath();

                ctx.arc(
                    position.x,
                    position.y,
                    10,
                    0,
                    Math.PI * 2
                );

                ctx.strokeStyle = "#1adf17";
                ctx.lineWidth = 3;

                ctx.stroke();
            }
        }
    }

    // FUNÇÕES PÚBLICAS DO RENDERER
    return {
        draw
    };
}