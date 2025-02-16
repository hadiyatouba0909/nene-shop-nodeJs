// controllers/authController.js
import jwt from "jsonwebtoken";
import BlacklistedToken from '../models/BlacklistedToken.js';
import User from "../models/User.js";
import bcrypt from "bcrypt"; // ou 'bcryptjs'

// Inscription
export const register = async (req, res) => {
  const { name, email, password, role, phone, adresse } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, adresse, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "Compte créé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du compte." });
  }
};

// Connexion
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res
      .status(200)
      .json({
        token,
        user: { id: user._id, name: user.name, role: user.role, phone: user.phone},
      });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
};

// Déconnexion
export const logout = async (req, res) => { 
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token manquant." });
    }

    // Vérifier si le token est déjà dans la liste noire
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(400).json({ message: "Token déjà invalide." });
    }

    // Décoder le token pour obtenir la date d'expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter le token à la liste noire
    const blacklistedToken = new BlacklistedToken({
      token,
      expiresAt: new Date(decoded.exp * 1000), // Convertir en millisecondes
    });

    await blacklistedToken.save();

    res.status(200).json({ message: "Déconnexion réussie." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la déconnexion." });
  }
};
