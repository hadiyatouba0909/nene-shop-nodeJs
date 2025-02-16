// utils/cleanBlacklistedTokens.js
import BlacklistedToken from '../models/BlacklistedToken.js';

const cleanBlacklistedTokens = async () => {
  try {
    await BlacklistedToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log('Tokens expirés supprimés.');
  } catch (error) {
    console.error('Erreur lors du nettoyage des tokens expirés:', error);
  }
};

export default cleanBlacklistedTokens;