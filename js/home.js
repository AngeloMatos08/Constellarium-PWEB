const charts = document.querySelectorAll("[data-sky-chart]");

const stars = [
    [0.12, 0.22, 1.2], [0.22, 0.61, 1], [0.31, 0.15, 1.1],
    [0.37, 0.38, 2.5], [0.42, 0.7, 1], [0.5, 0.23, 1.4],
    [0.54, 0.52, 1.1], [0.61, 0.3, 1.8], [0.65, 0.78, 1],
    [0.73, 0.57, 2.2], [0.81, 0.2, 1], [0.88, 0.42, 1.3],
    [0.28, 0.84, 1], [0.92, 0.77, 1.1], [0.16, 0.45, 1]
];

const constellation = [3, 5, 7, 9, 6, 4];

function drawChart(canvas) {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * pixelRatio);
    canvas.height = Math.round(bounds.height * pixelRatio);

    const context = canvas.getContext("2d");
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const points = stars.map(([x, y, radius]) => ({
        x: x * bounds.width,
        y: y * bounds.height,
        radius
    }));

    context.lineWidth = 1;
    context.strokeStyle = "rgba(105, 210, 207, 0.42)";
    context.beginPath();
    constellation.forEach((starIndex, index) => {
        const point = points[starIndex];
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
    });
    context.stroke();

    points.forEach((point, index) => {
        context.beginPath();
        context.fillStyle = constellation.includes(index) ? "#e9f4ed" : "rgba(191, 213, 218, 0.6)";
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();

        if (constellation.includes(index) && point.radius > 1.5) {
            context.beginPath();
            context.fillStyle = "rgba(242, 183, 124, 0.16)";
            context.arc(point.x, point.y, point.radius * 4, 0, Math.PI * 2);
            context.fill();
        }
    });
}

charts.forEach(drawChart);
window.addEventListener("resize", () => charts.forEach(drawChart));