export function createRenderer(ctx, stars, connections, camera) {

    function worldToScreen(worldX, worldY) {

        return {
            x: worldX - camera.x,
            y: worldY - camera.y
        };
    }

    function drawStars(selectedStar) {

        for (const star of stars) {

            const position = worldToScreen(
                star.x,
                star.y
            );

            ctx.beginPath();

            ctx.arc(
                position.x,
                position.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "white";
            ctx.fill();

            if (star.id === selectedStar) {

                ctx.beginPath();

                ctx.arc(
                    position.x,
                    position.y,
                    12,
                    0,
                    Math.PI * 2
                );

                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    function drawConnections() {

        for (const connection of connections) {

            const starA = stars.find(
                star => star.id === connection[0]
            );

            const starB = stars.find(
                star => star.id === connection[1]
            );

            if (!starA || !starB) continue;

            const positionA = worldToScreen(
                starA.x,
                starA.y
            );

            const positionB = worldToScreen(
                starB.x,
                starB.y
            );

            ctx.beginPath();

            ctx.moveTo(
                positionA.x,
                positionA.y
            );

            ctx.lineTo(
                positionB.x,
                positionB.y
            );

            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function draw(selectedStar) {

        ctx.clearRect(
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height
        );

        drawConnections();
        drawStars(selectedStar);
    }

    return {
        draw,
        worldToScreen
    };
}