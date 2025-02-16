// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken.js';

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    // Vérifier si le token est dans la liste noire
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token invalide. Veuillez vous reconnecter.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas admin.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide.' });
  }
};
// middleware/authMiddleware.js (ajoutez cette fonction)
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token invalide. Veuillez vous reconnecter.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assurez-vous que le rôle est inclus dans le token
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide.' });
  }
};
export { isAdmin };