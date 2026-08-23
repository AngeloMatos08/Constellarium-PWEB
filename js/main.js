console.log("Jogo Iniciado");

const canvas = document.getElementById("sky"); // quadro
const ctx = canvas.getContext("2d"); // pincel

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [
  { "id": 0, "x": 206, "y": 317, "name": "Alkaid" },
  { "id": 1, "x": 465, "y": 254, "name": "Mizar" },
  { "id": 2, "x": 622, "y": 296, "name": "Alioth" },
  { "id": 3, "x": 806, "y": 348, "name": "Megrez" },
  { "id": 4, "x": 891, "y": 521, "name": "Phecda" },
  { "id": 5, "x": 1175, "y": 510, "name": "Merak" },
  { "id": 6, "x": 1208, "y": 311, "name": "Dubhe" }
];

let selectedStar = null;
const connections = [];


canvas.addEventListener("pointerdown", handlePointerDown);


function addConnection(starA, starB) {

    if (starA === starB) {
        return; // Evita conectar a mesma estrela
    }

    const alreadyConnected = connections.some(connection => {
        return (connection[0] === starA && connection[1] === starB) ||
               (connection[0] === starB && connection[1] === starA);
    });

    if (!alreadyConnected) {
        connections.push([starA, starB]);
    }
}
// capta o clique do mouse pela coordenada x e y, e verifica se o clique foi dentro do raio da estrela
function handlePointerDown(event) {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const clickRadius = 15;
    console.log(`Clique detectado em: (${clickX}, ${clickY})`);

    for (const star of stars) {
        const distance = Math.sqrt((clickX - star.x) ** 2 + (clickY - star.y) ** 2);
        if (distance <= clickRadius) {
            if (selectedStar === null) {
            selectedStar = star.id;
            } else {
                addConnection(selectedStar, star.id);
                selectedStar = star.id;
            }
            console.log(`Clique detectado em: (${clickX}, ${clickY})`);
            draw();
            break;
        }
    }
}

// desenhar estrela
function drawStars() {
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 5, 0, Math.PI * 2); //x, y, raio, angulo inicial, angulo final
        ctx.fillStyle = "white";
        ctx.fill();
        //contorno selecionada
        if (star.id === selectedStar) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

drawStars();

function drawConnections() {
    for (const connection of connections) {
        const starA = stars.find(star => star.id === connection[0]);
        const starB = stars.find(star => star.id === connection[1]);

        ctx.beginPath();
        ctx.moveTo(starA.x, starA.y);
        ctx.lineTo(starB.x, starB.y);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    drawStars();
}

draw();