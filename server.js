import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// Stockage des utilisateurs
const users = [
  {
    id: 1,
    username: "admin",
    password: "1234"
  }
];

// Stockage des jetons en mémoire
const tokens = new Map();

// Durée de validité : 5 minutes
const TOKEN_DURATION = 5 * 60 * 1000;

// =========================
// POST /auth/login
// =========================

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    user => user.username === username && user.password === password
  );

  // Identifiants incorrects
  if (!user) {
    return res.status(401).json({
      message: "Identifiants invalides"
    });
  }

  // Génération d'un jeton aléatoire
  const token = crypto.randomBytes(32).toString("hex");

  // Enregistrement du jeton
  tokens.set(token, {
    userId: user.id,
    expiresAt: Date.now() + TOKEN_DURATION
  });

  return res.status(200).json({
    accessToken: token,
    expiresIn: 300
  });
});

// =========================
// Middleware d'authentification
// =========================

function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  // Aucun header Authorization
  if (!authorization) {
    return res.status(401).json({
      message: "Jeton manquant"
    });
  }

  // Format attendu : Bearer TOKEN
  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Format du jeton invalide"
    });
  }

  const session = tokens.get(token);

  // Jeton inexistant
  if (!session) {
    return res.status(401).json({
      message: "Jeton invalide"
    });
  }

  // Jeton expiré
  if (Date.now() > session.expiresAt) {
    tokens.delete(token);

    return res.status(401).json({
      message: "Jeton expiré"
    });
  }

  // L'utilisateur est authentifié
  req.userId = session.userId;

  next();
}

// =========================
// GET public
// =========================

app.get("/users", (req, res) => {
  res.json(users.map(user => ({
    id: user.id,
    username: user.username
  })));
});

// =========================
// POST protégé
// =========================

app.post("/users", authenticateToken, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "username et password sont obligatoires"
    });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password
  };

  users.push(newUser);

  return res.status(201).json({
    id: newUser.id,
    username: newUser.username
  });
});

// =========================
// PUT protégé
// =========================

app.put("/users/:id", authenticateToken, (req, res) => {
  const user = users.find(user => user.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({
      message: "Utilisateur introuvable"
    });
  }

  if (req.body.username) {
    user.username = req.body.username;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  res.status(200).json({
    message: "Utilisateur modifié"
  });
});

// =========================
// DELETE protégé
// =========================

app.delete("/users/:id", authenticateToken, (req, res) => {
  const index = users.findIndex(
    user => user.id === Number(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Utilisateur introuvable"
    });
  }

  users.splice(index, 1);

  res.status(204).send();
});

// =========================
// Démarrage
// =========================

app.listen(3000, () => {
  console.log("API démarrée sur http://localhost:3000");
});