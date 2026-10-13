const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const DIAGRAM_PADDING = 12;
const DIAGRAM_SPAN = 100 - DIAGRAM_PADDING * 2;

export function createReferenceRenderer(svg) {
    const document = svg.ownerDocument;
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("focusable", "false");

    function render(constellation) {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        if (!constellation) {
            return;
        }

        svg.setAttribute(
            "aria-label",
            `Desenho de referência: ${constellation.name}`
        );

        const positions = getDiagramPositions(constellation.stars);
        const positionsById = new Map();

        for (const star of constellation.stars) {
            positionsById.set(star.id, positions.get(star.id));
        }

        for (const connection of constellation.connections) {
            const start = positionsById.get(connection[0]);
            const end = positionsById.get(connection[1]);

            if (!start || !end) {
                continue;
            }

            const line = document.createElementNS(SVG_NAMESPACE, "line");
            line.setAttribute("class", "reference-connection");
            line.setAttribute("x1", String(start.x));
            line.setAttribute("y1", String(start.y));
            line.setAttribute("x2", String(end.x));
            line.setAttribute("y2", String(end.y));
            svg.appendChild(line);
        }

        for (const star of constellation.stars) {
            const position = positionsById.get(star.id);
            const circle = document.createElementNS(SVG_NAMESPACE, "circle");
            circle.setAttribute("class", "reference-star");
            circle.setAttribute("cx", String(position.x));
            circle.setAttribute("cy", String(position.y));
            circle.setAttribute("r", "2.2");
            svg.appendChild(circle);
        }
    }

    return { render };
}

function getDiagramPositions(stars) {
    const hasCompleteDiagram = stars.every(star =>
        Number.isFinite(star.diagram?.x) &&
        Number.isFinite(star.diagram?.y) &&
        star.diagram.x >= 0 && star.diagram.x <= 1 &&
        star.diagram.y >= 0 && star.diagram.y <= 1
    );

    if (hasCompleteDiagram) {
        return new Map(stars.map(star => [
            star.id,
            {
                x: DIAGRAM_PADDING + star.diagram.x * DIAGRAM_SPAN,
                y: DIAGRAM_PADDING + star.diagram.y * DIAGRAM_SPAN
            }
        ]));
    }

    return new Map(stars.map((star, index) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / stars.length;
        const radius = DIAGRAM_SPAN * 0.38;

        return [
            star.id,
            {
                x: 50 + Math.cos(angle) * radius,
                y: 50 + Math.sin(angle) * radius
            }
        ];
    }));
}