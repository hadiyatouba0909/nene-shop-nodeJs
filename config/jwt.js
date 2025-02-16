// /home/ba/Bureau/OFMS/nene-shop-nodeJs/config/jwt.js
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export { generateToken };