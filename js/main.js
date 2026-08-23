import { loadConstellations } from "./constellation.js";
import { createRenderer } from "./renderer.js";

console.log("Jogo Iniciado");

// CANVAS

const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// MUNDO

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;


// CÂMERA

const camera = {
    x: 0,
    y: 0
};


// ESTADO DO JOGO

let stars = [];
let connections = [];
let selectedStar = null;


// RENDERER

const renderer = createRenderer(
    ctx,
    stars,
    connections,
    camera
);


// CONVERTER TELA → MUNDO

function screenToWorld(screenX, screenY) {

    return {
        x: screenX + camera.x,
        y: screenY + camera.y
    };
}


// ADICIONAR CONEXÃO

function addConnection(starA, starB) {

    // Não permite conectar uma estrela nela mesma
    if (starA === starB) {
        return;
    }

    // Verifica se a conexão já existe
    const alreadyConnected = connections.some(connection => {

        return (
            (connection[0] === starA && connection[1] === starB) ||
            (connection[0] === starB && connection[1] === starA)
        );

    });

    if (!alreadyConnected) {

        connections.push([
            starA,
            starB
        ]);

    }
}


// CLIQUE / TOQUE NAS ESTRELAS

function handlePointerDown(event) {

    const rect = canvas.getBoundingClientRect();

    // Corrige diferença entre tamanho interno
    // do Canvas e tamanho visual
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX =
        (event.clientX - rect.left) * scaleX;

    const clickY =
        (event.clientY - rect.top) * scaleY;


    // Converte coordenada da tela
    // para coordenada do mundo
    const worldPosition = screenToWorld(
        clickX,
        clickY
    );


    const clickRadius = 15;


    // Procura uma estrela próxima do clique
    for (const star of stars) {

        const distance = Math.sqrt(

            (worldPosition.x - star.x) ** 2 +
            (worldPosition.y - star.y) ** 2

        );


        if (distance <= clickRadius) {

            // Primeira estrela selecionada
            if (selectedStar === null) {

                selectedStar = star.id;

            }

            // Segunda estrela em diante
            else {

                addConnection(
                    selectedStar,
                    star.id
                );

                selectedStar = star.id;

            }


            // Atualiza o desenho
            renderer.draw(selectedStar);

            break;
        }
    }
}


// EVENTO DE CLIQUE / TOQUE

canvas.addEventListener(
    "pointerdown",
    handlePointerDown
);


// INICIALIZAÇÃO DO JOGO

async function startGame() {

    try {

        // Carrega as constelações do JSON
        const constellations =
            await loadConstellations();


        // Por enquanto usamos
        // a primeira constelação
        const currentConstellation =
            constellations[0];


        // Coloca as estrelas no nosso array
        stars.push(
            ...currentConstellation.stars
        );


        console.log(
            "Constelação atual:",
            currentConstellation
        );


        // Primeiro desenho
        renderer.draw(selectedStar);

    }

    catch (error) {

        console.error(
            "Erro ao iniciar o jogo:",
            error
        );

    }
}


// INICIAR

startGame();