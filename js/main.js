import { loadConstellations } from "./constellation.js";
import { createRenderer } from "./renderer.js";
import { projectStar } from "./projection.js";
import { validateConstellation } from "./validator.js";
import { createGame } from "./game.js";
import { createTelescope } from "./telescope.js";
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
        drawGame();
    }
);

raRightButton.addEventListener(
    "click",
    () => {
        telescope.changeRA(1);
        updateTelescopeUI();
        drawGame();
    }
);

decDownButton.addEventListener(
    "click",
    () => {
        telescope.changeDEC(-1);
        updateTelescopeUI();
        drawGame();
    }
);

decUpButton.addEventListener(
    "click",
    () => {
        telescope.changeDEC(1);
        updateTelescopeUI();
        drawGame();
    }
);

updateTelescopeUI();

const state = game.getState();
const renderer = createRenderer(ctx, state);
const projectedPositions = new Map();
let logicalWidth = 1;
let logicalHeight = 1;

function drawGame() {
    projectedPositions.clear();

    const telescopePosition = telescope.getPosition();

    for (const star of state.stars) {
        projectedPositions.set(
            star.id,
            projectStar(
                star,
                telescopePosition,
                logicalWidth,
                logicalHeight
            )
        );
    }

    renderer.draw(
        projectedPositions,
        game.getState().selectedStar
    );
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const styles = getComputedStyle(canvas);
    const borderLeft = parseFloat(styles.borderLeftWidth) || 0;
    const borderRight = parseFloat(styles.borderRightWidth) || 0;
    const borderTop = parseFloat(styles.borderTopWidth) || 0;
    const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
    const contentWidth = rect.width - borderLeft - borderRight;
    const contentHeight = rect.height - borderTop - borderBottom;

    const logicalSize = Math.max(
        1,
        Math.round(Math.min(contentWidth, contentHeight))
    );
    logicalWidth = logicalSize;
    logicalHeight = logicalSize;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const bitmapSize = Math.round(logicalSize * pixelRatio);

    if (canvas.width !== bitmapSize || canvas.height !== bitmapSize) {
        canvas.width = bitmapSize;
        canvas.height = bitmapSize;
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    drawGame();
}

// CLIQUE / TOQUE NAS ESTRELAS
function handlePointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    const styles = getComputedStyle(canvas);
    const borderLeft = parseFloat(styles.borderLeftWidth) || 0;
    const borderRight = parseFloat(styles.borderRightWidth) || 0;
    const borderTop = parseFloat(styles.borderTopWidth) || 0;
    const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
    const contentWidth = rect.width - borderLeft - borderRight;
    const contentHeight = rect.height - borderTop - borderBottom;
    const localX = event.clientX - rect.left - borderLeft;
    const localY = event.clientY - rect.top - borderTop;

    if (
        localX < 0 || localX > contentWidth ||
        localY < 0 || localY > contentHeight
    ) {
        return;
    }

    const clickX = localX * logicalWidth / contentWidth;
    const clickY = localY * logicalHeight / contentHeight;

    const clickRadius = 15;

    for (const star of state.stars) {
        const position = projectedPositions.get(star.id);

        if (
            !position?.visible ||
            !Number.isFinite(position.x) ||
            !Number.isFinite(position.y)
        ) {
            continue;
        }

        const distance = Math.sqrt(
            (clickX - position.x) ** 2 +
            (clickY - position.y) ** 2
        );

        if (distance <= clickRadius) {
            game.selectStar(star.id);
            renderer.draw(
                projectedPositions,
                game.getState().selectedStar
            );
            break;
        }
    }
}

canvas.addEventListener(
    "pointerdown",
    handlePointerDown
);

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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

    drawGame();

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

    drawGame();

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

