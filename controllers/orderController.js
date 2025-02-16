// controllers/orderController.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

export const submitOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { adresse, additionalInfo } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Le panier est vide" });
    }

    const order = new Order({
      userId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      total: cart.total,
      adresse,
      additionalInfo,
      paymentStatus: "payé",
    });

    await order.save({ session });

    // Vider le panier après la commande
    cart.items = [];
    cart.total = 0;
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      orderId: order._id,
      message: "Commande créée avec succès",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur submitOrder:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la commande" });
  } finally {
    session.endSession();
  }
};
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const orders = await Order.find()
      .populate("userId", "name email phone")
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Erreur getAllOrders:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des commandes" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name price images");

    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la commande" });
  }
};
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Erreur getUserOrders:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
    });
  }
};

// Annuler une commande
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({
        message: "Commande non trouvée",
      });
    }

    // Vérifier si la commande a moins de 24h
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const diffHours = (now - orderTime) / (1000 * 60 * 60);

    if (diffHours > 24) {
      return res.status(400).json({
        message: "Le délai d'annulation de 24h est dépassé",
      });
    }

    // Mettre à jour le statut de la commande
    order.status = "annulée";
    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: "Commande annulée avec succès",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur cancelOrder:", error);
    res.status(500).json({
      message: "Erreur lors de l'annulation de la commande",
    });
  } finally {
    session.endSession();
  }
};
