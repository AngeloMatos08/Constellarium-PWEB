
import { auth, googleProvider } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    signOut,
    getIdToken
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ELEMENTOS DA PÁGINA

const tabs = document.querySelectorAll(".account-tab");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const heading = document.getElementById("account-heading");
const subheading = document.getElementById("account-subheading");

const message = document.getElementById("account-message");

const googleButton = document.getElementById("google-login");
const forgotPassword = document.getElementById("forgot-password");

const loginButton = loginForm.querySelector('[type="submit"]');
const registerButton = registerForm.querySelector('[type="submit"]');


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
        "Não foi possível concluir a operação. Tente novamente.";

}


// CONTROLE DE CARREGAMENTO

function setBusy(button, busy, originalText) {

    button.disabled = busy;

    button.textContent = busy
        ? "Aguarde..."
        : originalText;

}


// TESTAR AUTENTICAÇÃO COM O BACKEND

async function verifyBackendSession(user) {

    const token = await getIdToken(user);

    const response = await fetch("/api/session", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Falha na autenticação com o servidor."
        );
    }

    console.log("Sessão validada pelo backend:", data);

    return data;
}

// ALTERNAR ENTRE LOGIN E CADASTRO

function changeAccountTab(selectedTab) {

    const isLogin = selectedTab === "login";

    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);

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

    const nickname =
        document.getElementById("register-nickname").value.trim();

    const email =
        document.getElementById("register-email").value.trim();

    const password =
        document.getElementById("register-password").value;

    const confirmPassword =
        document.getElementById("register-confirm-password").value;

    if (nickname.length < 2) {

        showMessage(
            "Seu apelido precisa ter pelo menos 2 caracteres.",
            "error"
        );

        return;

    }

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

        // SALVAR APELIDO NO PERFIL DO FIREBASE

        await updateProfile(credential.user, {
            displayName: nickname
        });

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

        showMessage(
            `Login realizado com sucesso! Bem-vindo${user.displayName ? `, ${user.displayName}` : ""}.`,
            "success"
        );

        console.log("Usuário autenticado:", {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName
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
        await verifyBackendSession(user);

        showMessage(
            `Login com Google realizado! Bem-vindo${user.displayName ? `, ${user.displayName}` : ""}.`,
            "success"
        );

        console.log("Usuário autenticado com Google:", {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName
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
