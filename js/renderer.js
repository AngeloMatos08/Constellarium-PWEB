export function createRenderer(ctx, state, camera) {

    function draw(selectedStar) {

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

            const star1 =
                state.stars.find(
                    star => star.id === connection[0]
                );

            const star2 =
                state.stars.find(
                    star => star.id === connection[1]
                );


            // Verifica se as duas estrelas existem
            if (star1 && star2) {

                const x1 =
                    star1.x - camera.x;

                const y1 =
                    star1.y - camera.y;

                const x2 =
                    star2.x - camera.x;

                const y2 =
                    star2.y - camera.y;


                ctx.beginPath();

                ctx.moveTo(
                    x1,
                    y1
                );

                ctx.lineTo(
                    x2,
                    y2
                );

                ctx.stroke();
            }
        }


        // DESENHAR ESTRELAS

        for (const star of state.stars) {

            const screenX =
                star.x - camera.x;

            const screenY =
                star.y - camera.y;


            // COR DA ESTRELA

            if (selectedStar === star.id) {

                ctx.fillStyle = "#ffffff";

            } else {

                ctx.fillStyle = "#ffffff";

            }


            // ESTRELA

            ctx.beginPath();

            ctx.arc(
                screenX,
                screenY,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // BORDA DA ESTRELA SELECIONADA

            if (selectedStar === star.id) {

                ctx.beginPath();

                ctx.arc(
                    screenX,
                    screenY,
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