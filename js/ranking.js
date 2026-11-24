
const podiumElement = document.getElementById("ranking-podium");
const rankingList = document.getElementById("ranking-list");
const rankingCount = document.getElementById("ranking-count");
const rankingMessage = document.getElementById("ranking-message");

const medalSymbols = {
    1: "✦",
    2: "✧",
    3: "✳"
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatScore(score) {
    return numberFormatter.format(score);
}


// CRIAR CARTÃO DO PÓDIO

function createPodiumCard(player) {

    const card = document.createElement("article");

    const position = Number(player.position);

    card.classList.add("podium-card");

    if (position === 1) {
        card.classList.add("first");
        card.style.gridColumn = "2";
    }

    if (position === 2) {
        card.classList.add("second");
        card.style.gridColumn = "1";
    }

    if (position === 3) {
        card.classList.add("third");
        card.style.gridColumn = "3";
    }

    const positionLabel = document.createElement("span");
    positionLabel.className = "podium-position";
    positionLabel.textContent = `${position}º LUGAR`;

    const medal = document.createElement("span");
    medal.className = "podium-medal";
    medal.textContent = medalSymbols[position] ?? "✦";
    medal.setAttribute("aria-hidden", "true");

    const nickname = document.createElement("span");
    nickname.className = "podium-name";
    nickname.textContent = player.nickname;

    const score = document.createElement("span");
    score.className = "podium-score";
    score.textContent = `${formatScore(player.score)} pontos`;

    card.append(
        positionLabel,
        medal,
        nickname,
        score
    );

    return card;
}


// EXIBIR PÓDIO

function renderPodium(ranking) {

    podiumElement.replaceChildren();

    if (ranking.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "ranking-empty";
        emptyMessage.textContent =
            "Ainda não existem exploradores classificados. Seja o primeiro!";

        podiumElement.appendChild(emptyMessage);

        return;
    }

    const topPlayers = ranking
        .filter(player => player.position <= 3)
        .sort((a, b) => a.position - b.position);

    const podiumOrder = [
        topPlayers.find(player => player.position === 2),
        topPlayers.find(player => player.position === 1),
        topPlayers.find(player => player.position === 3)
    ];

    podiumOrder.forEach(player => {

        if (player) {
            podiumElement.appendChild(
                createPodiumCard(player)
            );
        }

    });

}


// EXIBIR TABELA

function renderRankingTable(ranking) {

    rankingList.replaceChildren();

    if (ranking.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.className = "ranking-empty";
        cell.textContent =
            "O ranking ainda está vazio. Complete uma campanha para aparecer aqui!";

        row.appendChild(cell);
        rankingList.appendChild(row);

        return;
    }

    ranking.forEach(player => {

        const row = document.createElement("tr");

        const position = document.createElement("td");
        position.className = "ranking-position";
        position.textContent = `${player.position}º`;

        const nickname = document.createElement("td");
        nickname.className = "ranking-player";
        nickname.textContent = player.nickname;

        const score = document.createElement("td");
        score.className = "ranking-score";
        score.textContent = formatScore(player.score);

        row.append(
            position,
            nickname,
            score
        );

        rankingList.appendChild(row);

    });

}


// BUSCAR RANKING NA API

async function loadRanking() {

    try {

        const response = await fetch("/api/ranking", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Não foi possível consultar o ranking.");
        }

        const data = await response.json();

        if (!Array.isArray(data.ranking)) {
            throw new Error("A resposta do ranking é inválida.");
        }

        renderPodium(data.ranking);
        renderRankingTable(data.ranking);

        rankingCount.textContent =
            `${data.ranking.length} ${data.ranking.length === 1 ? "JOGADOR" : "JOGADORES"}`;

    } catch (error) {

        console.error("Erro ao carregar ranking:", error);

        podiumElement.replaceChildren();

        const podiumError = document.createElement("p");
        podiumError.className = "ranking-empty";
        podiumError.textContent = "Não foi possível carregar o ranking.";

        podiumElement.appendChild(podiumError);

        rankingList.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.className = "ranking-empty";
        cell.textContent = "Verifique sua conexão e tente novamente.";

        row.appendChild(cell);
        rankingList.appendChild(row);

        rankingMessage.textContent =
            "Ocorreu um erro ao consultar os dados do ranking.";

    }

}


// INICIALIZAR PÁGINA

loadRanking();
