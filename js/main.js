import { loadConstellations } from "./constellation.js";
import { createRenderer } from "./renderer.js";
import { validateConstellation } from "./validator.js";
import { createGame } from "./game.js";
import {createTelescope} from "./telescope.js";
const game = createGame();
const telescope = createTelescope();

console.log("Jogo Iniciado");
console.log(game.getState());

// ELEMENTOS DO DOM
const resultScreen =
    document.getElementById("result-screen");

const resultTitle =
    document.getElementById("result-title");

const resultMessage =
    document.getElementById("result-message");

const continueButton =
    document.getElementById("continue-button");

// CANVAS
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");


const finishButton = document.getElementById("finish-button");
const resetButton = document.getElementById("reset-button");


// BOTÕES DE CONTROLE DO TELESCÓPIO
const raLeftButton =
    document.getElementById("ra-left");

const raRightButton =
    document.getElementById("ra-right");

const decDownButton =
    document.getElementById("dec-down");

const decUpButton =
    document.getElementById("dec-up");

const raValue =
    document.getElementById("ra-value");

const decValue =
    document.getElementById("dec-value");



// FUNÇÃO CONVERTER MINUTOS EM HORAS/MINUTOS
function formatRA(totalMinutes) {

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

// FUNÇAO DECLINAÇÃO
function formatDEC(degrees) {

    const signal =
        degrees >= 0 ? "+" : "-";

    const absoluteDegrees =
        Math.abs(degrees);

    return `${signal}${String(absoluteDegrees).padStart(2, "0")}° 00'`;
}

// FUNCÇÃO QUE LOCALIZA A POSIÇÃO ATUAL DO TELESCOPIO
function updateTelescopeUI() {

    const position =
        telescope.getPosition();

    raValue.textContent =
        formatRA(position.ra);

    decValue.textContent =
        formatDEC(position.dec);
}


// BOTÕES
raLeftButton.addEventListener(
    "click",
    () => {
        telescope.changeRA(-1);
        updateTelescopeUI();
    }
);

raRightButton.addEventListener(
    "click",
    () => {
        telescope.changeRA(1);
        updateTelescopeUI();
    }
);

decDownButton.addEventListener(
    "click",
    () => {
        telescope.changeDEC(-1);
        updateTelescopeUI();
    }
);

decUpButton.addEventListener(
    "click",
    () => {
        telescope.changeDEC(1);
        updateTelescopeUI();
    }
);

updateTelescopeUI();

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

const state = game.getState();

// RENDERER
const renderer = createRenderer(
    ctx,
    state,
    camera
);

// CONVERTER TELA → MUNDO
function screenToWorld(screenX, screenY) {
    return {
        x: screenX + camera.x,
        y: screenY + camera.y
    };
}

// CLIQUE / TOQUE NAS ESTRELAS
function handlePointerDown(event) {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX =
        (event.clientX - rect.left) * scaleX;

    const clickY =
        (event.clientY - rect.top) * scaleY;

    const worldPosition = screenToWorld(
        clickX,
        clickY
    );

    const clickRadius = 15;

    for (const star of state.stars) {
        const distance = Math.sqrt(
            (worldPosition.x - star.x) ** 2 +
            (worldPosition.y - star.y) ** 2
        );

        if (distance <= clickRadius) {
            game.selectStar(star.id);
            renderer.draw(game.getState().selectedStar);
            break;
        }
    }
}

canvas.addEventListener(
    "pointerdown",
    handlePointerDown
);

// INICIALIZAÇÃO DO JOGO
async function startGame() {
    try {
        const data =
            await loadConstellations();

        game.setConstellations(data);
        nextConstellation();
    } catch (error) {
        console.error(
            "Erro ao iniciar o jogo:",
            error
        );
    }
}

startGame();

function nextConstellation() {
    const state =
        game.getState();

    const randomIndex =
        Math.floor(
            Math.random() *
            state.constellations.length
        );

    const currentConstellation =
        state.constellations[randomIndex];

    game.loadConstellation(
        currentConstellation
    );

    renderer.draw(
        game.getState().selectedStar
    );

    console.log(
        "Nova constelação:",
        currentConstellation.name
    );
}

function finishGame() {
    const state =
        game.getState();

    const result =
        validateConstellation(
            state.connections,
            state.correctConnections
        );

    showResult(result);
}

function resetGame() {

    game.reset();

    renderer.draw(
        game.getState().selectedStar
    );

}

function showResult(isCorrect) {
    resultScreen.classList.remove("hidden");

    if (isCorrect) {
        resultTitle.textContent =
            "Correta";

        resultMessage.textContent =
            "Você encontrou a constelação.";
    } else {
        resultTitle.textContent =
            "Errado";

        resultMessage.textContent =
            "As conexões não correspondem à constelação.";
    }
}

function continueGame() {
    resultScreen.classList.add("hidden");
    nextConstellation();
}

finishButton.addEventListener(
    "click",
    finishGame
);

resetButton.addEventListener(
    "click",
    resetGame
);

continueButton.addEventListener(
    "click",
    continueGame
);

