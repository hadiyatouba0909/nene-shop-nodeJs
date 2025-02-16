// models/Category.js
import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: {
    url: { type: String },
    public_id: { type: String }
  },
  deletedAt: { type: Date, default: null }, // S'assurer que c'est bien null par défaut
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Modifier le middleware pour qu'il fonctionne correctement
categorySchema.pre(['find', 'findOne'], function(next) {
  // Ne pas appliquer le filtre sur la route /deleted
  if (this.getQuery().includeDeleted) {
    return next();
  }
  
  // S'assurer que le filtre est correctement appliqué
  if (!this.getQuery().hasOwnProperty('deletedAt')) {
    this.where({ deletedAt: null });
  }
  next();
});

export default mongoose.model('Category', categorySchema);
