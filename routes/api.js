
const express = require("express");

const User = require("../models/User.js");
const Star = require("../models/Star.js");
const Constellation = require("../models/Constellation.js");
const Campaign = require("../models/Campaign.js");

const authenticateUser = require("../middleware/auth.js");

const router = express.Router();

const POINTS_PER_CORRECT = 100;
const POINTS_PER_ERROR = 25;
const PERFECT_BONUS = 100;

const MAX_ATTEMPTS = 500;


// NORMALIZAR CONEXÕES

function normalizeConnection(a, b) {
    return [a, b].sort().join("|");
}


// CALCULAR RESULTADO NO SERVIDOR

function calculateResult(constellation, attempts, registeredStarIds) {

    // ESTRELAS QUE PERTENCEM À CONSTELAÇÃO ATUAL

    const validStarIds = new Set(
        constellation.stars.map(star => star.id)
    );

    // CONEXÕES CORRETAS DA CONSTELAÇÃO

    const correctConnections = new Set(
        constellation.connections.map(connection =>
            normalizeConnection(connection[0], connection[1])
        )
    );

    const activeConnections = new Set();

    let totalErrors = 0;

    for (const attempt of attempts) {

        // LIMPAR TABULEIRO

        if (attempt.type === "reset") {
            activeConnections.clear();
            continue;
        }

        // VALIDAR FORMATO DA CONEXÃO

        if (
            attempt.type !== "connection" ||
            typeof attempt.starA !== "string" ||
            typeof attempt.starB !== "string" ||
            !attempt.starA.trim() ||
            !attempt.starB.trim() ||
            attempt.starA === attempt.starB
        ) {
            throw new Error("Tentativa de conexão inválida.");
        }

        // VERIFICAR SE AS ESTRELAS EXISTEM NO BANCO

        if (
            !registeredStarIds.has(attempt.starA) ||
            !registeredStarIds.has(attempt.starB)
        ) {
            throw new Error("Estrela não encontrada.");
        }

        // VERIFICAR SE AS ESTRELAS PERTENCEM À CONSTELAÇÃO

        const starsBelongToConstellation =
            validStarIds.has(attempt.starA) &&
            validStarIds.has(attempt.starB);

        const connectionId = normalizeConnection(
            attempt.starA,
            attempt.starB
        );

        // IMPEDIR CONEXÕES DUPLICADAS SEM RESET

        if (activeConnections.has(connectionId)) {
            throw new Error("Conexão duplicada.");
        }

        activeConnections.add(connectionId);

        // CONTABILIZAR ERROS

        if (
            !starsBelongToConstellation ||
            !correctConnections.has(connectionId)
        ) {
            totalErrors++;
        }

    }

    // CONTAR CONEXÕES CORRETAS QUE PERMANECERAM NO TABULEIRO

    let correctCount = 0;

    for (const connectionId of activeConnections) {

        if (correctConnections.has(connectionId)) {
            correctCount++;
        }

    }

    // VERIFICAR CONCLUSÃO

    const completed =
        correctConnections.size > 0 &&
        correctCount === correctConnections.size;

    // CALCULAR PONTUAÇÃO

    const correctPoints =
        correctCount * POINTS_PER_CORRECT;

    const errorPenalty =
        totalErrors * POINTS_PER_ERROR;

    const perfectBonus =
        completed && totalErrors === 0
            ? PERFECT_BONUS
            : 0;

    const score = Math.max(
        0,
        correctPoints - errorPenalty + perfectBonus
    );

    return {
        score,
        errors: totalErrors,
        completed
    };

}


// GET /api/stars

router.get("/stars", async (request, response) => {

    try {

        const stars = await Star.find()
            .select("-_id -__v -createdAt -updatedAt")
            .lean();

        response.json({ stars });

    } catch (error) {

        console.error("Erro ao buscar estrelas:", error);

        response.status(500).json({
            error: "Não foi possível buscar as estrelas."
        });

    }

});


// GET /api/constellations

router.get("/constellations", async (request, response) => {

    try {

        const constellations = await Constellation.find()
            .select("-_id -__v -createdAt -updatedAt")
            .lean();

        response.json({ constellations });

    } catch (error) {

        console.error("Erro ao buscar constelações:", error);

        response.status(500).json({
            error: "Não foi possível buscar as constelações."
        });

    }

});


// POST /api/campaigns
// Validar e salvar uma campanha.

router.post("/campaigns", authenticateUser, async (request, response) => {

    try {

        const { results } = request.body ?? {};

        // VALIDAR QUANTIDADE DE RESULTADOS

        if (!Array.isArray(results) || results.length !== 5) {

            return response.status(400).json({
                error: "A campanha deve conter exatamente cinco constelações."
            });

        }

        // VALIDAR IDENTIFICADORES

        const constellationIds = results.map(
            result => result?.constellationId
        );

        if (
            constellationIds.some(id =>
                typeof id !== "string" || !id.trim()
            ) ||
            new Set(constellationIds).size !== 5
        ) {

            return response.status(400).json({
                error: "As constelações enviadas são inválidas ou repetidas."
            });

        }

        // BUSCAR TODAS AS CONSTELAÇÕES OFICIAIS

        const existingConstellations = await Constellation.find()
            .select("id name stars connections")
            .lean();

        if (existingConstellations.length !== 5) {

            return response.status(500).json({
                error: "A configuração das constelações da campanha está incorreta."
            });

        }

        const officialIds = new Set(
            existingConstellations.map(item => item.id)
        );

        // GARANTIR QUE A CAMPANHA CONTENHA AS CINCO CONSTELAÇÕES OFICIAIS

        if (
            constellationIds.some(id => !officialIds.has(id))
        ) {

            return response.status(400).json({
                error: "A campanha deve conter as cinco constelações oficiais."
            });

        }

        // BUSCAR IDENTIFICADORES DE TODAS AS ESTRELAS CADASTRADAS

        const registeredStars = await Star.find()
            .select("id")
            .lean();

        const registeredStarIds = new Set(
            registeredStars.map(star => star.id)
        );

        // VALIDAR E RECALCULAR CADA RESULTADO

        const verifiedResults = [];

        for (const result of results) {

            const constellation = existingConstellations.find(
                item => item.id === result.constellationId
            );

            if (
                !Array.isArray(result.attempts) ||
                result.attempts.length > MAX_ATTEMPTS
            ) {

                return response.status(400).json({
                    error: "Histórico de tentativas inválido."
                });

            }

            // VALIDAR ESTRUTURA DAS CONEXÕES OFICIAIS

            if (
                !Array.isArray(constellation.stars) ||
                !Array.isArray(constellation.connections) ||
                constellation.connections.length === 0
            ) {

                return response.status(500).json({
                    error: "Dados da constelação estão incompletos."
                });

            }

            const validConnections = constellation.connections.every(
                connection =>
                    Array.isArray(connection) &&
                    connection.length === 2 &&
                    typeof connection[0] === "string" &&
                    typeof connection[1] === "string" &&
                    connection[0] !== connection[1]
            );

            if (!validConnections) {

                return response.status(500).json({
                    error: "As conexões oficiais da constelação são inválidas."
                });

            }

            // VALIDAR EVENTOS DO HISTÓRICO

            const validAttempts = result.attempts.every(attempt => {

                if (!attempt || typeof attempt !== "object") {
                    return false;
                }

                if (attempt.type === "reset") {
                    return true;
                }

                return (
                    attempt.type === "connection" &&
                    typeof attempt.starA === "string" &&
                    typeof attempt.starB === "string"
                );

            });

            if (!validAttempts) {

                return response.status(400).json({
                    error: "O histórico contém tentativas inválidas."
                });

            }

            // RECALCULAR PONTUAÇÃO NO SERVIDOR

            const calculated = calculateResult(
                constellation,
                result.attempts,
                registeredStarIds
            );

            // ARMAZENAR RESULTADO VALIDADO

            verifiedResults.push({

                constellationId: constellation.id,
                constellationName: constellation.name,

                attempts: result.attempts.map(attempt => {

                    if (attempt.type === "reset") {
                        return { type: "reset" };
                    }

                    return {
                        type: "connection",
                        starA: attempt.starA,
                        starB: attempt.starB
                    };

                }),

                score: calculated.score,
                errors: calculated.errors,
                completed: calculated.completed

            });

        }

        // SOMAR PONTUAÇÃO CALCULADA PELO SERVIDOR

        const totalScore = verifiedResults.reduce(
            (total, result) => total + result.score,
            0
        );

        // SALVAR CAMPANHA

        const campaign = await Campaign.create({

            userId: request.user.uid,
            results: verifiedResults,
            totalScore

        });

        return response.status(201).json({

            message: "Campanha salva com sucesso.",

            campaign: {
                id: campaign._id,
                totalScore: campaign.totalScore,
                results: campaign.results,
                createdAt: campaign.createdAt
            }

        });

    } catch (error) {

        if (
            error.message === "Tentativa de conexão inválida." ||
            error.message === "Estrela não encontrada." ||
            error.message === "Conexão duplicada."
        ) {

            return response.status(400).json({
                error: error.message
            });

        }

        console.error("Erro ao salvar campanha:", error);

        return response.status(500).json({
            error: "Não foi possível salvar a campanha."
        });

    }

});


// POST /api/profile
// Registrar perfil do jogador.

router.post("/profile", authenticateUser, async (request, response) => {

    try {

        const nickname = request.body?.nickname;

        // VALIDAR A ENTRADA

        if (typeof nickname !== "string") {

            return response.status(400).json({
                error: "Informe um apelido válido."
            });

        }

        const normalizedNickname = nickname
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        const cleanNickname = nickname
            .replace(/\s+/g, " ")
            .trim();

        // VALIDAR TAMANHO E CARACTERES
        // Permite letras, números, espaços e underline.

        if (
            cleanNickname.length < 2 ||
            cleanNickname.length > 16 ||
            !/^[\p{L}\p{N}_ ]+$/u.test(cleanNickname)
        ) {

            return response.status(400).json({
                error: "O apelido deve ter entre 2 e 16 caracteres e utilizar apenas letras, números, espaços ou underline."
            });

        }

        // VERIFICAR SE O JOGADOR JÁ POSSUI PERFIL

        const existingUser = await User.findOne({
            userId: request.user.uid
        });

        if (existingUser) {

            return response.json({
                message: "Perfil já cadastrado.",
                profile: {
                    nickname: existingUser.nickname
                }
            });

        }

        // CRIAR PERFIL

        const user = await User.create({

            userId: request.user.uid,
            nickname: cleanNickname,
            normalizedNickname

        });

        return response.status(201).json({

            message: "Perfil criado com sucesso.",

            profile: {
                nickname: user.nickname
            }

        });

    } catch (error) {

        // APELIDO JÁ UTILIZADO

        if (error.code === 11000) {

            return response.status(409).json({
                error: "Este apelido já está sendo utilizado."
            });

        }

        console.error("Erro ao criar perfil:", error);

        return response.status(500).json({
            error: "Não foi possível criar o perfil."
        });

    }

});


// GET /api/profile
// Consultar perfil do jogador autenticado.

router.get("/profile", authenticateUser, async (request, response) => {

    try {

        const user = await User.findOne({
            userId: request.user.uid
        })
        .select("nickname")
        .lean();

        if (!user) {

            return response.status(404).json({
                error: "Perfil não encontrado."
            });

        }

        return response.json({
            profile: {
                nickname: user.nickname
            }
        });

    } catch (error) {

        console.error("Erro ao buscar perfil:", error);

        return response.status(500).json({
            error: "Não foi possível buscar o perfil."
        });

    }

});


// GET /api/ranking
// Consultar o ranking público dos jogadores.

router.get("/ranking", async (request, response) => {

    try {

        // BUSCAR A MELHOR CAMPANHA DE CADA JOGADOR

        const bestCampaigns = await Campaign.aggregate([

            {
                $sort: {
                    totalScore: -1,
                    createdAt: -1
                }
            },

            {
                $group: {
                    _id: "$userId",
                    totalScore: {
                        $first: "$totalScore"
                    }
                }
            },

            // ASSOCIAR À COLEÇÃO DE USUÁRIOS

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "userId",
                    as: "user"
                }
            },

            // IGNORAR JOGADORES SEM PERFIL

            {
                $unwind: "$user"
            },

            // RETORNAR SOMENTE DADOS PÚBLICOS

            {
                $project: {
                    _id: 0,
                    nickname: "$user.nickname",
                    score: "$totalScore"
                }
            },

            // ORDENAR PONTUAÇÕES

            {
                $sort: {
                    score: -1,
                    nickname: 1
                }
            }

        ]);

        // ADICIONAR POSIÇÃO NO RANKING

        const ranking = bestCampaigns.map((player, index) => ({
            position: index + 1,
            nickname: player.nickname,
            score: player.score
        }));

        return response.json({
            ranking
        });

    } catch (error) {

        console.error("Erro ao buscar ranking:", error);

        return response.status(500).json({
            error: "Não foi possível carregar o ranking."
        });

    }

});


// GET /api/session
// Verificar sessão autenticada.

router.get("/session", authenticateUser, (request, response) => {

    response.json({
        authenticated: true,
        uid: request.user.uid
    });

});


// EXIBIR ROTAS REGISTRADAS

console.log(
    "ROTAS REGISTRADAS:",
    router.stack
        .filter(layer => layer.route)
        .map(layer => ({
            path: layer.route.path,
            methods: Object.keys(layer.route.methods)
        }))
);


// EXPORTAR ROTAS

module.exports = router;
