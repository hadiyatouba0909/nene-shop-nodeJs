// controllers/paymentController.js
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

export const processPayment = async (req, res) => {
  try {
    const { orderId, method, phoneNumber } = req.body;

    // Récupérer la commande
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Créer un ID de transaction unique
    const transactionId = `${method}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Simuler le paiement
    const payment = new Payment({
      orderId,
      amount: order.total,
      method,
      phoneNumber,
      transactionId
    });

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simuler une réussite à 80%
    const isSuccessful = Math.random() < 0.8;

    if (isSuccessful) {
      payment.status = 'completed';
      order.status = 'processing';
      await order.save();
    } else {
      payment.status = 'failed';
    }

    await payment.save();

    res.status(200).json({
      success: isSuccessful,
      message: isSuccessful 
        ? "Paiement effectué avec succès" 
        : "Échec du paiement, veuillez réessayer",
      transactionId: payment.transactionId
    });
  } catch (error) {
    console.error('Erreur processPayment:', error);
    res.status(500).json({ message: "Erreur lors du traitement du paiement" });
  }
};