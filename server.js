// server.js
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoute.js";
import orderRoutes from './routes/orderRoute.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/products", productRoutes);
app.use('/api/cart', cartRoutes);  // Une seule fois pour les routes du panier
app.use('/api/orders', orderRoutes);  // Routes des commandes séparées

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: "Le serveur fonctionne correctement" });
});

// Connexion à la base de données et démarrage du serveur
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion à la base de données:", err);
    process.exit(1);
  });