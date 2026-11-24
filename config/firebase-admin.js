
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./firebase/serviceAccountKey.json");

const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth(firebaseApp);

module.exports = auth;
