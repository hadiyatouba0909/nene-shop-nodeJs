// controllers/productController.js
import Product from "../models/Product.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// Ajouter un produit
export const addProduct = async (req, res) => {
  try {
    console.log("Body reçu:", req.body);
    console.log("Fichiers reçus:", req.files);
    
    const { name, description, price, category, variants } = req.body;
    
    // Parsez les variants si c'est une chaîne JSON
    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Veuillez télécharger au moins une image." });
    }

    const images = await Promise.all(
      req.files.map(async (file) => {
        const imageResult = await uploadImage(file);
        return { url: imageResult.url, public_id: imageResult.public_id };
      })
    );

    const totalQuantity = parsedVariants.reduce(
      (sum, variant) => sum + variant.quantity,
      0
    );

    const product = new Product({
      name,
      description,
      price,
      category,
      variants: parsedVariants,
      images,
      totalQuantity,
    });

    await product.save();
    res.status(201).json({ message: "Produit ajouté avec succès.", product });
  } catch (error) {
    console.error("Erreur complète:", error);
    res.status(500).json({ 
      message: "Erreur lors de l'ajout du produit.",
      error: error.message 
    });
  }
};

// Modifier un produit
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, variants } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    if (req.files && req.files.length > 0) {
      await Promise.all(
        product.images.map(async (image) => {
          await deleteImage(image.public_id);
        })
      );

      const images = await Promise.all(
        req.files.map(async (file) => {
          const imageResult = await uploadImage(file);
          return { url: imageResult.url, public_id: imageResult.public_id };
        })
      );
      product.images = images;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.variants = variants || product.variants;
    product.totalQuantity = product.variants.reduce(
      (sum, variant) => sum + variant.quantity,
      0
    );

    await product.save();
    res
      .status(200)
      .json({ message: "Produit mis à jour avec succès.", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du produit." });
  }
};

// Lister tous les produits
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des produits." });
  }
};

// Supprimer un produit un soft delete
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    // Au lieu de supprimer le produit, on met à jour deletedAt
    product.deletedAt = new Date();
    await product.save();

    res.status(200).json({ message: "Produit supprimé avec succès." });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du produit." });
  }
};

// Ajouter une fonction pour la restauration
export const restoreProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({
      _id: id,
      deletedAt: { $ne: null },
    }).select("+deletedAt");

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    // Réinitialiser deletedAt
    product.deletedAt = null;
    await product.save();

    res.status(200).json({
      message: "Produit restauré avec succès.",
      product,
    });
  } catch (error) {
    console.error("Erreur de restauration:", error);
    res.status(500).json({
      message: "Erreur lors de la restauration du produit.",
    });
  }
};

// Ajouter une fonction pour lister les produits supprimés
export const getDeletedProducts = async (req, res) => {
  try {
    const deletedProducts = await Product.find({
      deletedAt: { $ne: null },
    })
      .select("+deletedAt")
      .populate("category");

    if (!deletedProducts.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(deletedProducts);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des produits supprimés.",
    });
  }
};
