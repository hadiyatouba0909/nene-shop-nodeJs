// controllers/cartController.js
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Ajouter au panier
export const addToCart = async (req, res) => {
  const { productId, variantInfo, quantity } = req.body;
  const userId = req.user.id;

  try {
    // Vérifier le produit et sa variante
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    // Vérifier la disponibilité du stock
    const variant = product.variants.find(
      (v) => v.size === variantInfo.size && v.color === variantInfo.color
    );

    if (!variant) {
      return res.status(400).json({ message: "Variante non disponible." });
    }

    // Vérifier le stock total disponible
    if (variant.quantity < quantity) {
      return res.status(400).json({
        message: `Stock insuffisant. Seulement ${variant.quantity} disponible(s).`,
        availableStock: variant.quantity,
      });
    }

    // Trouver ou créer le panier de l'utilisateur
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Vérifier si l'article existe déjà dans le panier
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variant.size === variantInfo.size &&
        item.variant.color === variantInfo.color
    );

    // Calculer la quantité totale dans le panier + nouvelle quantité
    const totalQuantityInCart = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (totalQuantityInCart > variant.quantity) {
      return res.status(400).json({
        message: `Limite de stock dépassée. Seulement ${variant.quantity} disponible(s).`,
        availableStock: variant.quantity,
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price * existingItem.quantity;
    } else {
      cart.items.push({
        productId,
        variant: variantInfo,
        quantity,
        price: product.price * quantity,
      });
    }

    // Calculer le total
    cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Erreur addToCart:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout au panier." });
  }
};

// Obtenir le panier de l'utilisateur
export const getCart = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un client
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du panier.",
    });
  }
};

// Mettre à jour la quantité d'un article
export const updateCartItem = async (req, res) => {
  const { itemId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Panier non trouvé." });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Article non trouvé dans le panier." });
    }

    // Vérifier le stock disponible
    const product = await Product.findById(item.productId);
    const variant = product.variants.find(
      (v) => v.size === item.variant.size && v.color === item.variant.color
    );

    if (variant.quantity < quantity) {
      return res.status(400).json({
        message: `Stock insuffisant. Seulement ${variant.quantity} disponible(s).`,
        availableStock: variant.quantity,
      });
    }

    item.quantity = quantity;
    item.price = product.price * quantity;
    cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du panier." });
  }
};

// Supprimer un article du panier
export const removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Panier non trouvé." });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'article." });
  }
};
