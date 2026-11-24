
import { auth, googleProvider } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    getIdToken
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ELEMENTOS DA PÁGINA

const tabs = document.querySelectorAll(".account-tab");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const profileForm = document.getElementById("profile-form");

const heading = document.getElementById("account-heading");
const subheading = document.getElementById("account-subheading");

const message = document.getElementById("account-message");

const googleButton = document.getElementById("google-login");
const forgotPassword = document.getElementById("forgot-password");

const accountTabs = document.querySelector(".account-tabs");
const accountDivider = document.querySelector(".account-divider");

const loginButton = loginForm.querySelector('[type="submit"]');
const registerButton = registerForm.querySelector('[type="submit"]');
const profileButton = profileForm.querySelector('[type="submit"]');

let pendingProfileUser = null;


// MENSAGENS

function showMessage(text, type = "info") {

    message.textContent = text;
    message.dataset.type = type;

}


// TRADUZIR ERROS DO FIREBASE

function getFirebaseError(error) {

    const errors = {

        "auth/email-already-in-use":
            "Este e-mail já possui uma conta.",

        "auth/invalid-email":
            "O endereço de e-mail informado é inválido.",

        "auth/weak-password":
            "A senha precisa ter pelo menos 6 caracteres.",

        "auth/user-not-found":
            "Não encontramos uma conta com esse e-mail.",

        "auth/wrong-password":
            "A senha informada está incorreta.",

        "auth/invalid-credential":
            "E-mail ou senha incorretos.",

        "auth/too-many-requests":
            "Muitas tentativas. Aguarde um pouco e tente novamente.",

        "auth/network-request-failed":
            "Falha na conexão. Verifique sua internet.",

        "auth/popup-closed-by-user":
            "A janela de login do Google foi fechada.",

        "auth/popup-blocked":
            "O navegador bloqueou a janela de login. Permita pop-ups para continuar.",

        "auth/cancelled-popup-request":
            "A solicitação de login foi cancelada."

    };

    return errors[error.code] ||
        error.message ||
        "Não foi possível concluir a operação. Tente novamente.";

}


// CONTROLE DE CARREGAMENTO

function setBusy(button, busy, originalText) {

    button.disabled = busy;

    button.textContent = busy
        ? "Aguarde..."
        : originalText;

}


// VALIDAR APELIDO

function validateNickname(nickname) {

    const cleanNickname = nickname
        .replace(/\s+/g, " ")
        .trim();

    if (
        cleanNickname.length < 2 ||
        cleanNickname.length > 16 ||
        !/^[\p{L}\p{N}_ ]+$/u.test(cleanNickname)
    ) {

        throw new Error(
            "O apelido deve ter entre 2 e 16 caracteres e utilizar apenas letras, números, espaços ou underline."
        );

    }

    return cleanNickname;

}


// REQUISIÇÕES AO BACKEND

async function apiRequest(url, user, options = {}) {

    const token = await getIdToken(user);

    const response = await fetch(url, {

        ...options,

        headers: {

            ...(options.headers || {}),

            Authorization: `Bearer ${token}`

        }

    });

    const contentType =
        response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {

        throw new Error(
            "O servidor retornou uma resposta inesperada. Verifique a rota e tente novamente."
        );

    }

    const data = await response.json();

    return {
        response,
        data
    };

}


// VALIDAR AUTENTICAÇÃO COM O BACKEND

async function verifyBackendSession(user) {

    const { response, data } = await apiRequest(
        "/api/session",
        user,
        {
            method: "GET"
        }
    );

    if (!response.ok) {

        throw new Error(
            data.error || "Falha na autenticação com o servidor."
        );

    }

    console.log("Sessão validada pelo backend:", data);

    return data;

}


// CONSULTAR PERFIL NO MONGODB

async function getUserProfile(user) {

    const { response, data } = await apiRequest(
        "/api/profile",
        user,
        {
            method: "GET"
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {

        throw new Error(
            data.error || "Não foi possível consultar seu perfil."
        );

    }

    return data.profile;

}


// CRIAR PERFIL NO MONGODB

async function createUserProfile(user, nickname) {

    const cleanNickname = validateNickname(nickname);

    const { response, data } = await apiRequest(
        "/api/profile",
        user,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nickname: cleanNickname
            })

        }
    );

    if (!response.ok) {

        throw new Error(
            data.error || "Não foi possível registrar seu perfil."
        );

    }

    console.log("Perfil salvo:", data.profile);

    return data.profile;

}


// EXIBIR FORMULÁRIO DE ESCOLHA DE APELIDO

function showProfileForm(user) {

    pendingProfileUser = user;

    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");

    profileForm.classList.remove("hidden");

    accountTabs.classList.add("hidden");
    accountDivider.classList.add("hidden");
    googleButton.classList.add("hidden");

    heading.textContent = "Escolha seu apelido.";

    subheading.textContent =
        "Defina como você aparecerá no ranking do Constellarium.";

    message.textContent = "";
    message.dataset.type = "";

    document.getElementById("profile-nickname").value = "";

}


// RESTAURAR INTERFACE DE LOGIN

function restoreAccountInterface() {

    profileForm.classList.add("hidden");

    accountTabs.classList.remove("hidden");
    accountDivider.classList.remove("hidden");
    googleButton.classList.remove("hidden");

    changeAccountTab("login");

}


// VERIFICAR SE O USUÁRIO POSSUI PERFIL

async function ensureUserProfile(user) {

    const profile = await getUserProfile(user);

    if (profile) {
        return profile;
    }

    // USUÁRIO AINDA NÃO POSSUI APELIDO

    showProfileForm(user);

    showMessage(
        "Escolha um apelido para começar sua jornada.",
        "info"
    );

    return null;

}


// ALTERNAR ENTRE LOGIN E CADASTRO

function changeAccountTab(selectedTab) {

    const isLogin = selectedTab === "login";

    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);

    profileForm.classList.add("hidden");

    accountTabs.classList.remove("hidden");
    accountDivider.classList.remove("hidden");
    googleButton.classList.remove("hidden");

    pendingProfileUser = null;

    tabs.forEach(tab => {

        const isActive =
            tab.dataset.tab === selectedTab;

        tab.classList.toggle("active", isActive);

        tab.setAttribute(
            "aria-selected",
            String(isActive)
        );

    });

    heading.textContent = isLogin
        ? "Bem-vindo de volta."
        : "Comece sua jornada.";

    subheading.textContent = isLogin
        ? "Entre para continuar sua exploração."
        : "Crie sua conta e registre suas descobertas.";

    message.textContent = "";
    message.dataset.type = "";

}


// EVENTOS DAS ABAS

tabs.forEach(tab => {

    tab.addEventListener("click", () => {
        changeAccountTab(tab.dataset.tab);
    });

});


// CADASTRO COM E-MAIL E SENHA

registerForm.addEventListener("submit", async event => {

    event.preventDefault();

    const email =
        document.getElementById("register-email").value.trim();

    const password =
        document.getElementById("register-password").value;

    const confirmPassword =
        document.getElementById("register-confirm-password").value;

    if (password !== confirmPassword) {

        showMessage(
            "As senhas informadas não são iguais.",
            "error"
        );

        return;

    }

    if (password.length < 6) {

        showMessage(
            "A senha precisa ter pelo menos 6 caracteres.",
            "error"
        );

        return;

    }

    setBusy(
        registerButton,
        true,
        "Criar minha conta ↗"
    );

    try {

        // CRIAR USUÁRIO NO FIREBASE

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        // ENVIAR E-MAIL DE VERIFICAÇÃO

        await sendEmailVerification(credential.user);

        // ENCERRAR SESSÃO ATÉ A VERIFICAÇÃO

        await signOut(auth);

        showMessage(
            "Conta criada! Enviamos um link de confirmação para seu e-mail. Verifique sua caixa de entrada antes de entrar.",
            "success"
        );

        registerForm.reset();

    } catch (error) {

        console.error("Erro no cadastro:", error);

        showMessage(
            getFirebaseError(error),
            "error"
        );

    } finally {

        setBusy(
            registerButton,
            false,
            "Criar minha conta ↗"
        );

    }

});


// LOGIN COM E-MAIL E SENHA

loginForm.addEventListener("submit", async event => {

    event.preventDefault();

    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-password").value;

    setBusy(
        loginButton,
        true,
        "Entrar na minha conta ↗"
    );

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        // VALIDAR SESSÃO NO BACKEND

        await verifyBackendSession(user);

        // EXIGIR VERIFICAÇÃO DO E-MAIL

        if (!user.emailVerified) {

            await sendEmailVerification(user);

            await signOut(auth);

            showMessage(
                "Seu e-mail ainda não foi confirmado. Enviamos um novo link de verificação para sua caixa de entrada.",
                "error"
            );

            return;

        }

        // CONSULTAR PERFIL NO MONGODB

        const profile = await ensureUserProfile(user);

        if (!profile) {
            return;
        }

        showMessage(
            `Login realizado com sucesso! Bem-vindo, ${profile.nickname}.`,
            "success"
        );

        console.log("Usuário autenticado:", {

            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            nickname: profile.nickname

        });

    } catch (error) {

        console.error("Erro no login:", error);

        showMessage(
            getFirebaseError(error),
            "error"
        );

    } finally {

        setBusy(
            loginButton,
            false,
            "Entrar na minha conta ↗"
        );

    }

});


// LOGIN COM GOOGLE

googleButton.addEventListener("click", async () => {

    googleButton.disabled = true;

    try {

        const credential =
            await signInWithPopup(auth, googleProvider);

        const user = credential.user;

        // VALIDAR SESSÃO NO BACKEND

        await verifyBackendSession(user);

        // CONSULTAR PERFIL NO MONGODB

        const profile = await ensureUserProfile(user);

        if (!profile) {
            return;
        }

        showMessage(
            `Login com Google realizado! Bem-vindo, ${profile.nickname}.`,
            "success"
        );

        console.log("Usuário autenticado com Google:", {

            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            nickname: profile.nickname

        });

    } catch (error) {

        console.error("Erro no login com Google:", error);

        showMessage(
            getFirebaseError(error),
            "error"
        );

    } finally {

        googleButton.disabled = false;

    }

});


// CONFIRMAR ESCOLHA DO APELIDO

profileForm.addEventListener("submit", async event => {

    event.preventDefault();

    if (!pendingProfileUser) {

        showMessage(
            "Não foi possível identificar sua sessão. Entre novamente.",
            "error"
        );

        return;

    }

    let nickname;

    try {

        nickname = validateNickname(
            document.getElementById("profile-nickname").value
        );

    } catch (error) {

        showMessage(error.message, "error");
        return;

    }

    setBusy(
        profileButton,
        true,
        "Confirmar apelido ↗"
    );

    try {

        // CRIAR PERFIL COM O APELIDO ESCOLHIDO

        const profile = await createUserProfile(
            pendingProfileUser,
            nickname
        );

        pendingProfileUser = null;

        restoreAccountInterface();

        showMessage(
            `Perfil criado com sucesso! Bem-vindo ao Constellarium, ${profile.nickname}.`,
            "success"
        );

        console.log("Novo perfil criado:", profile);

    } catch (error) {

        console.error("Erro ao criar perfil:", error);

        showMessage(
            getFirebaseError(error),
            "error"
        );

    } finally {

        setBusy(
            profileButton,
            false,
            "Confirmar apelido ↗"
        );

    }

});


// RECUPERAÇÃO DE SENHA

forgotPassword.addEventListener("click", async event => {

    event.preventDefault();

    const email =
        document.getElementById("login-email").value.trim();

    if (!email) {

        showMessage(
            "Digite seu e-mail no campo acima para receber o link de recuperação.",
            "error"
        );

        document.getElementById("login-email").focus();

        return;

    }

    try {

        await sendPasswordResetEmail(auth, email);

        showMessage(
            "Enviamos um link para redefinir sua senha. Verifique seu e-mail.",
            "success"
        );

    } catch (error) {

        console.error("Erro na recuperação de senha:", error);

        showMessage(
            getFirebaseError(error),
            "error"
        );

    }

});
