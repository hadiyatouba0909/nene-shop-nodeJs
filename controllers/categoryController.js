// controllers/categoryController.js
import Category from "../models/Category.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// Ajouter une catégorie
export const addCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Cette catégorie existe déjà." });
    }

    let imageResult = null;
    if (req.file) {
      imageResult = await uploadImage(req.file);
    }

    const category = new Category({
      name,
      description,
      image: imageResult
        ? {
            url: imageResult.url,
            public_id: imageResult.public_id,
          }
        : null,
      deletedAt: null, // S'assurer explicitement que deletedAt est null
    });

    await category.save();
    res.status(201).json({
      message: "Catégorie ajoutée avec succès.",
      category,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      message: "Erreur lors de l'ajout de la catégorie.",
    });
  }
};

// Modifier une catégorie
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    if (req.file) {
      if (category.image?.public_id) {
        await deleteImage(category.image.public_id);
      }
      const imageResult = await uploadImage(req.file);
      category.image = {
        url: imageResult.url,
        public_id: imageResult.public_id,
      };
    }

    category.name = name || category.name;
    category.description = description || category.description;

    await category.save();
    res
      .status(200)
      .json({ message: "Catégorie mise à jour avec succès.", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la catégorie." });
  }
};

// Lister toutes les catégories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des catégories." });
  }
};

// Obtenir une catégorie spécifique
export const getCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la catégorie." });
  }
};

// Modifier la fonction de suppression pour faire un soft delete
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    // Au lieu de supprimer, on met à jour deletedAt
    category.deletedAt = new Date();
    await category.save();

    res.status(200).json({ message: "Catégorie supprimée avec succès." });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la catégorie." });
  }
};

// Ajouter une fonction pour la restauration
export const restoreCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Modifier la requête pour trouver explicitement les catégories supprimées
    const category = await Category.findOne({
      _id: id,
      deletedAt: { $ne: null },
    }).select("+deletedAt");

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    // Réinitialiser deletedAt
    category.deletedAt = null;
    await category.save();

    res.status(200).json({
      message: "Catégorie restaurée avec succès.",
      category,
    });
  } catch (error) {
    console.error("Erreur de restauration:", error);
    res.status(500).json({
      message: "Erreur lors de la restauration de la catégorie.",
    });
  }
};

// Ajouter une fonction pour lister les catégories supprimées
export const getDeletedCategories = async (req, res) => {
  try {
    const deletedCategories = await Category.find({
      deletedAt: { $ne: null },
    }).select("+deletedAt");

    if (!deletedCategories.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(deletedCategories);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories supprimées.",
    });
  }
};
