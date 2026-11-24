
import { loadConstellations } from "./constellation.js";
import { createRenderer } from "./renderer.js";
import { createReferenceRenderer } from "./reference-renderer.js";
import { projectStar } from "./projection.js";
import { validateConstellation } from "./validator.js";
import { createGame } from "./game.js";
import { createTelescope } from "./telescope.js";
import { createBackgroundStars } from "./background-stars.js";
import { createChallengeStars } from "./challenge-stars.js";
import { createShootingStars } from "./shooting-stars.js";

const game = createGame();
const telescope = createTelescope();
const shootingStars = createShootingStars();

game.setBackgroundStars(
    createBackgroundStars(2500)
);

console.log(
    "Estrelas decorativas:",
    game.getState().backgroundStars.slice(0, 5)
);

game.setChallengeStars(
    createChallengeStars(150)
);

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

const constellationName =
    document.getElementById("constellation-name");

const referenceDiagram =
    document.getElementById("constellation-diagram");

const constellationRA =
    document.getElementById("constellation-ra");

const constellationDEC =
    document.getElementById("constellation-dec");


// CANVAS

const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

const finishButton =
    document.getElementById("finish-button");

const resetButton =
    document.getElementById("reset-button");


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

const zoomInButton =
    document.getElementById("zoom-in");

const zoomOutButton =
    document.getElementById("zoom-out");

const zoomValue =
    document.getElementById("zoom-value");
// PAINEL DE PROGRESSO

const progressPercentage =
    document.getElementById("progress-percentage");

const progressCorrect =
    document.getElementById("progress-correct");

const progressErrors =
    document.getElementById("progress-errors");

const progressRemaining =
    document.getElementById("progress-remaining");

const progressFill =
    document.getElementById("progress-fill");

const progressTrack =
    document.getElementById("progress-track");

const progressDescription =
    document.getElementById("progress-description");

// FORMATAR ASCENSÃO RETA

function formatRA(totalMinutes) {

    const roundedMinutes =
        ((Math.round(totalMinutes) % 1440) + 1440) % 1440;

    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}


// FORMATAR DECLINAÇÃO

function formatDEC(degrees) {

    const totalArcminutes =
        Math.round(Math.abs(degrees) * 60);

    const absoluteDegrees =
        Math.floor(totalArcminutes / 60);

    const minutes = totalArcminutes % 60;

    const signal = degrees >= 0 ? "+" : "-";

    return `${signal}${String(absoluteDegrees).padStart(2, "0")}° ${String(minutes).padStart(2, "0")}′`;
}


// ATUALIZAR INTERFACE DO TELESCÓPIO

function updateTelescopeUI() {

    const position =
        telescope.getPosition();

    raValue.textContent =
        formatRA(position.ra);

    decValue.textContent =
        formatDEC(position.dec);

    zoomValue.textContent =
        `${position.fieldOfView.toFixed(1)}°`;
}

// ATUALIZAR PAINEL DE PROGRESSO

function updateChallengeProgress() {

    const progress =
        game.getState().progress;

    progressCorrect.textContent =
        progress.correct;

    progressErrors.textContent =
        progress.incorrect;

    progressRemaining.textContent =
        progress.remaining;

    progressPercentage.textContent =
        `${progress.percentage}%`;

    progressFill.style.width =
        `${progress.percentage}%`;

    progressTrack.setAttribute(
        "aria-valuenow",
        progress.percentage
    );

    if (progress.complete) {

        progressDescription.textContent =
            "Constelação concluída!";

    } else if (progress.total === 0) {

        progressDescription.textContent =
            "Aguardando carregamento do desafio.";

    } else if (progress.correct === 0 && progress.incorrect === 0) {

        progressDescription.textContent =
            `Encontre as ${progress.total} conexões da constelação.`;

    } else {

        progressDescription.textContent =
            `Você já acertou ${progress.correct} de ${progress.total} conexões.`;

    }

}
// MOVIMENTAÇÃO CONTÍNUA DO TELESCÓPIO

const RA_MOVEMENT_SPEED = 10;
const DEC_MOVEMENT_SPEED = 2;

const DIAGONAL_FACTOR = 1 / Math.sqrt(2);

let activeMovement = null;
let animationFrameId = null;
let previousFrameTime = null;


// TECLAS DE MOVIMENTAÇÃO

const keyboardKeys = {

    ArrowLeft: { axis: "ra", direction: -1 },
    ArrowRight: { axis: "ra", direction: 1 },

    ArrowUp: { axis: "dec", direction: 1 },
    ArrowDown: { axis: "dec", direction: -1 },

    a: { axis: "ra", direction: -1 },
    d: { axis: "ra", direction: 1 },

    w: { axis: "dec", direction: 1 },
    s: { axis: "dec", direction: -1 }

};

const pressedKeys = new Set();


// CALCULAR VELOCIDADE DE ACORDO COM O ZOOM

function getMovementSpeedFactor() {

    const fieldOfView =
        telescope.getPosition().fieldOfView;

    const speedFactor = fieldOfView / 25;

    return Math.max(
        0.35,
        Math.min(1.6, speedFactor)
    );

}


// INICIAR MOVIMENTAÇÃO PELOS BOTÕES

function startTelescopeMovement(axis, direction, event) {

    event.preventDefault();

    if (activeMovement) return;

    activeMovement = {
        axis,
        direction,
        keyboard: false
    };

    previousFrameTime = null;

    event.currentTarget.setPointerCapture(event.pointerId);

    animationFrameId =
        requestAnimationFrame(updateTelescopeMovement);

}


// ATUALIZAR MOVIMENTAÇÃO

function updateTelescopeMovement(timestamp) {

    if (!activeMovement) return;

    if (previousFrameTime === null) {
        previousFrameTime = timestamp;
    }

    const deltaTime = Math.min(
        (timestamp - previousFrameTime) / 1000,
        0.05
    );

    previousFrameTime = timestamp;

    let raDirection = 0;
    let decDirection = 0;


    // MOVIMENTAÇÃO PELO TECLADO

    if (activeMovement.keyboard) {

        for (const key of pressedKeys) {

            const movement = keyboardKeys[key];

            if (!movement) continue;

            if (movement.axis === "ra") {
                raDirection += movement.direction;
            }

            if (movement.axis === "dec") {
                decDirection += movement.direction;
            }

        }

    } else {

        // MOVIMENTAÇÃO PELOS BOTÕES

        if (activeMovement.axis === "ra") {
            raDirection = activeMovement.direction;
        }

        if (activeMovement.axis === "dec") {
            decDirection = activeMovement.direction;
        }

    }


    // VERIFICAR MOVIMENTAÇÃO DIAGONAL

    const isDiagonal =
        raDirection !== 0 && decDirection !== 0;

    const movementFactor =
        isDiagonal ? DIAGONAL_FACTOR : 1;


    // VELOCIDADE ADAPTÁVEL AO ZOOM

    const zoomSpeedFactor =
        getMovementSpeedFactor();


    // MOVIMENTAR ASCENSÃO RETA

    if (raDirection !== 0) {

        telescope.changeRA(
            raDirection *
            RA_MOVEMENT_SPEED *
            zoomSpeedFactor *
            deltaTime *
            movementFactor
        );

    }


    // MOVIMENTAR DECLINAÇÃO

    if (decDirection !== 0) {

        telescope.changeDEC(
            decDirection *
            DEC_MOVEMENT_SPEED *
            zoomSpeedFactor *
            deltaTime *
            movementFactor
        );

    }


    updateTelescopeUI();
    drawGame();

    animationFrameId =
        requestAnimationFrame(updateTelescopeMovement);

}


// PARAR MOVIMENTAÇÃO

function stopTelescopeMovement() {

    activeMovement = null;
    previousFrameTime = null;

    if (animationFrameId !== null) {

        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;

    }

}


// EVENTOS DOS BOTÕES DE MOVIMENTAÇÃO

raLeftButton.addEventListener("pointerdown", event => {
    startTelescopeMovement("ra", -1, event);
});

raRightButton.addEventListener("pointerdown", event => {
    startTelescopeMovement("ra", 1, event);
});

decDownButton.addEventListener("pointerdown", event => {
    startTelescopeMovement("dec", -1, event);
});

decUpButton.addEventListener("pointerdown", event => {
    startTelescopeMovement("dec", 1, event);
});


// SOLTAR BOTÕES DO MOUSE OU TOQUE

window.addEventListener("pointerup", () => {

    if (!activeMovement?.keyboard) {
        stopTelescopeMovement();
    }

});

window.addEventListener("pointercancel", () => {

    if (!activeMovement?.keyboard) {
        stopTelescopeMovement();
    }

});


// CONTROLES DE MOVIMENTAÇÃO PELO TECLADO

window.addEventListener("keydown", event => {

    const key =
        event.key.length === 1
            ? event.key.toLowerCase()
            : event.key;

    const movement = keyboardKeys[key];


    // MOVIMENTAÇÃO

    if (movement) {

        if (
            event.target.matches(
                "input, textarea, select, [contenteditable='true']"
            )
        ) {
            return;
        }

        event.preventDefault();

        if (pressedKeys.has(key)) return;

        pressedKeys.add(key);

        if (!activeMovement) {

            activeMovement = {
                keyboard: true
            };

            previousFrameTime = null;

            animationFrameId =
                requestAnimationFrame(updateTelescopeMovement);

        }

        return;

    }


    // ZOOM IN

    if (key === "+" || key === "=") {

        event.preventDefault();

        if (event.repeat) return;

        telescope.zoomIn();

        updateTelescopeUI();
        drawGame();

    }


    // ZOOM OUT

    if (key === "-") {

        event.preventDefault();

        if (event.repeat) return;

        telescope.zoomOut();

        updateTelescopeUI();
        drawGame();

    }

});


// SOLTAR TECLAS

window.addEventListener("keyup", event => {

    const key =
        event.key.length === 1
            ? event.key.toLowerCase()
            : event.key;

    if (pressedKeys.has(key)) {

        pressedKeys.delete(key);

        if (
            pressedKeys.size === 0 &&
            activeMovement?.keyboard
        ) {
            stopTelescopeMovement();
        }

    }

});


// PERDA DE FOCO DA JANELA

window.addEventListener("blur", () => {

    pressedKeys.clear();
    stopTelescopeMovement();

});

updateTelescopeUI();


// ESTADO E RENDERIZADORES

const state = game.getState();

const renderer = createRenderer(ctx, state);

const referenceRenderer =
    createReferenceRenderer(referenceDiagram);

const projectedPositions = new Map();

let logicalWidth = 1;
let logicalHeight = 1;

let previousSkyFrame = null;
let nextShootingStar = 0;


// ESTRELA SOB O CURSOR

let hoveredStar = null;


// DESENHAR O CÉU

function drawGame() {

    projectedPositions.clear();

    const telescopePosition =
        telescope.getPosition();


    // PROJETAR ESTRELAS REAIS

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


    // PROJETAR ESTRELAS DECORATIVAS

    for (const star of state.backgroundStars) {

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


    // PROJETAR ESTRELAS DE DESAFIO

    for (const star of state.challengeStars) {

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
        game.getState().selectedStar,
        logicalWidth,
        logicalHeight,
        hoveredStar,
        shootingStars.getStars()
    );
    updateChallengeProgress();
}


// CONTROLE DE ZOOM

zoomInButton.addEventListener("click", () => {

    telescope.zoomIn();

    updateTelescopeUI();
    drawGame();

});

zoomOutButton.addEventListener("click", () => {

    telescope.zoomOut();

    updateTelescopeUI();
    drawGame();

});


// REDIMENSIONAR CANVAS

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();
    const styles = getComputedStyle(canvas);

    const borderLeft =
        parseFloat(styles.borderLeftWidth) || 0;

    const borderRight =
        parseFloat(styles.borderRightWidth) || 0;

    const borderTop =
        parseFloat(styles.borderTopWidth) || 0;

    const borderBottom =
        parseFloat(styles.borderBottomWidth) || 0;

    const contentWidth =
        rect.width - borderLeft - borderRight;

    const contentHeight =
        rect.height - borderTop - borderBottom;

    const logicalSize = Math.max(
        1,
        Math.round(Math.min(contentWidth, contentHeight))
    );

    logicalWidth = logicalSize;
    logicalHeight = logicalSize;

    const pixelRatio =
        Math.min(window.devicePixelRatio || 1, 2);

    const bitmapSize =
        Math.round(logicalSize * pixelRatio);

    if (
        canvas.width !== bitmapSize ||
        canvas.height !== bitmapSize
    ) {

        canvas.width = bitmapSize;
        canvas.height = bitmapSize;

    }

    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    drawGame();

}


// LOCALIZAR ESTRELA NA POSIÇÃO DO PONTEIRO

function findStarAtPosition(x, y) {

    const clickRadius = 15;

    for (const star of [...state.stars, ...state.challengeStars]) {

        const position =
            projectedPositions.get(star.id);

        if (
            !position?.visible ||
            !Number.isFinite(position.x) ||
            !Number.isFinite(position.y)
        ) {
            continue;
        }

        const distance = Math.sqrt(
            (x - position.x) ** 2 +
            (y - position.y) ** 2
        );

        if (distance <= clickRadius) {
            return star;
        }

    }

    return null;

}


// CONVERTER POSIÇÃO DO PONTEIRO PARA O CANVAS

function getCanvasCoordinates(event) {

    const rect = canvas.getBoundingClientRect();
    const styles = getComputedStyle(canvas);

    const borderLeft =
        parseFloat(styles.borderLeftWidth) || 0;

    const borderRight =
        parseFloat(styles.borderRightWidth) || 0;

    const borderTop =
        parseFloat(styles.borderTopWidth) || 0;

    const borderBottom =
        parseFloat(styles.borderBottomWidth) || 0;

    const contentWidth =
        rect.width - borderLeft - borderRight;

    const contentHeight =
        rect.height - borderTop - borderBottom;

    const localX =
        event.clientX - rect.left - borderLeft;

    const localY =
        event.clientY - rect.top - borderTop;

    if (
        localX < 0 || localX > contentWidth ||
        localY < 0 || localY > contentHeight
    ) {
        return null;
    }

    return {
        x: localX * logicalWidth / contentWidth,
        y: localY * logicalHeight / contentHeight
    };

}


// ESTADO DO ARRASTAR O CÉU

let skyDrag = null;

const DRAG_THRESHOLD = 5;


// INICIAR ARRASTAR O CÉU

function handleSkyPointerDown(event) {

    if (event.button !== 0) return;

    if (activeMovement) return;

    skyDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        dragging: false
    };

    canvas.setPointerCapture(event.pointerId);

}


// MOVIMENTAR O CÉU AO ARRASTAR

function handleSkyDrag(event) {

    if (
        !skyDrag ||
        skyDrag.pointerId !== event.pointerId
    ) {
        return false;
    }

    const totalX =
        event.clientX - skyDrag.startX;

    const totalY =
        event.clientY - skyDrag.startY;

    const distance = Math.hypot(
        totalX,
        totalY
    );


    // EVITAR CONFUNDIR CLIQUE COM ARRASTO

    if (
        !skyDrag.dragging &&
        distance < DRAG_THRESHOLD
    ) {
        return false;
    }

    skyDrag.dragging = true;


    // CALCULAR DESLOCAMENTO DO PONTEIRO

    const deltaX =
        event.clientX - skyDrag.lastX;

    const deltaY =
        event.clientY - skyDrag.lastY;

    skyDrag.lastX = event.clientX;
    skyDrag.lastY = event.clientY;


    // OBTER POSIÇÃO ATUAL DO TELESCÓPIO

    const position =
        telescope.getPosition();

    const fieldOfView =
        position.fieldOfView;

    const declinationRadians =
        position.dec * Math.PI / 180;


    // CORRIGIR A ESCALA DA ASCENSÃO RETA
    // PRÓXIMO AOS POLOS CELESTES

    const cosDeclination = Math.max(
        Math.abs(Math.cos(declinationRadians)),
        0.15
    );


    // MOVIMENTAR ASCENSÃO RETA

    const raChange =
        -deltaX *
        (fieldOfView / logicalWidth) *
        4 /
        cosDeclination;

    telescope.changeRA(raChange);


    // MOVIMENTAR DECLINAÇÃO

    const decChange =
        deltaY *
        (fieldOfView / logicalHeight);

    telescope.changeDEC(decChange);


    updateTelescopeUI();
    drawGame();

    return true;

}


// FINALIZAR CLIQUE OU ARRASTO

function handleSkyPointerUp(event) {

    if (
        !skyDrag ||
        skyDrag.pointerId !== event.pointerId
    ) {
        return;
    }

    const wasDragging =
        skyDrag.dragging;

    skyDrag = null;


    // SE NÃO ARRASTOU, TRATAR COMO CLIQUE

    if (!wasDragging) {

        const coordinates =
            getCanvasCoordinates(event);

        if (!coordinates) return;

        const star = findStarAtPosition(
            coordinates.x,
            coordinates.y
        );

        if (star) {

            const selectionResult =
                game.selectStar(star.id);

            // CONCLUIR AUTOMATICAMENTE QUANDO O DESAFIO ESTIVER CORRETO
            if (selectionResult.progress?.complete) {
                showResult(true);
            }

            drawGame();

        }

    }

}


// CANCELAR ARRASTO

function handleSkyPointerCancel(event) {

    if (
        skyDrag &&
        skyDrag.pointerId === event.pointerId
    ) {
        skyDrag = null;
    }

}


// IDENTIFICAÇÃO AO PASSAR O MOUSE

function handlePointerMove(event) {

    // PRIMEIRO VERIFICAR SE ESTAMOS ARRASTANDO

    if (handleSkyDrag(event)) {
        return;
    }

    if (event.pointerType !== "mouse") return;

    const coordinates =
        getCanvasCoordinates(event);

    const star = coordinates
        ? findStarAtPosition(
            coordinates.x,
            coordinates.y
        )
        : null;

    const newHoveredStar =
        star?.id ?? null;

    if (hoveredStar !== newHoveredStar) {

        hoveredStar = newHoveredStar;
        drawGame();

    }

}


// EVENTOS DO CANVAS

canvas.addEventListener(
    "pointerdown",
    handleSkyPointerDown
);

canvas.addEventListener(
    "pointermove",
    handlePointerMove
);

canvas.addEventListener(
    "pointerup",
    handleSkyPointerUp
);

canvas.addEventListener(
    "pointercancel",
    handleSkyPointerCancel
);

canvas.addEventListener(
    "pointerleave",
    () => {

        if (hoveredStar !== null) {

            hoveredStar = null;
            drawGame();

        }

    }
);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// ANIMAÇÃO CONTÍNUA DO CÉU

function animateSky(timestamp) {

    // CALCULAR O TEMPO ENTRE OS QUADROS

    if (previousSkyFrame === null) {
        previousSkyFrame = timestamp;
    }

    const deltaTime = Math.min(
        (timestamp - previousSkyFrame) / 1000,
        0.05
    );

    previousSkyFrame = timestamp;


    // CONTROLAR O INTERVALO DAS ESTRELAS CADENTES

    if (timestamp >= nextShootingStar) {

        shootingStars.spawn(
            logicalWidth,
            logicalHeight
        );

        nextShootingStar =
            timestamp + 8000 + Math.random() * 15000;

    }


    // ATUALIZAR MOVIMENTO

    shootingStars.update(
        deltaTime,
        logicalWidth,
        logicalHeight
    );


    // REDESENHAR O CÉU

    drawGame();

    requestAnimationFrame(animateSky);

}

requestAnimationFrame(animateSky);


// INICIALIZAÇÃO DO JOGO

async function startGame() {

    try {

        const data =
            await loadConstellations();

        console.log("Dados carregados:", data);
        console.log("Estrelas do céu:", data.stars);
        console.log("Constelações:", data.constellations);

        game.setConstellations(
            data.constellations
        );

        game.setSkyStars(
            data.stars
        );

        nextConstellation();

    } catch (error) {

        console.error(
            "Erro ao iniciar o jogo:",
            error
        );

    }

}

startGame();


// PRÓXIMA CONSTELAÇÃO

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
    updateChallengeProgress();
    constellationName.textContent =
        currentConstellation.name;


    // ATUALIZAR COORDENADAS DA CONSTELAÇÃO

    if (currentConstellation.center) {

        constellationRA.textContent =
            `RA central: ${formatRA(currentConstellation.center.ra * 60)}`;

        constellationDEC.textContent =
            `DEC central: ${formatDEC(currentConstellation.center.dec)}`;

    } else {

        constellationRA.textContent =
            "RA central: não informada";

        constellationDEC.textContent =
            "DEC central: não informada";

    }

    referenceRenderer.render(currentConstellation);

    drawGame();

    console.log(
        "Nova constelação:",
        currentConstellation.name
    );

}


// FINALIZAR JOGO

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


// REINICIAR JOGO

function resetGame() {

    game.reset();
    updateChallengeProgress();
    drawGame();

}


// EXIBIR RESULTADO

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


// CONTINUAR JOGO

function continueGame() {

    resultScreen.classList.add("hidden");

    nextConstellation();

}


// EVENTOS DOS BOTÕES DO JOGO

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
