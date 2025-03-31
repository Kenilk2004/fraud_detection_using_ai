const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router(); // Initialize the router

router.post('/', async (req, res) => {
  const {
    senderId,
    receiverId,
    transactionId,
    timestamp,
    recipient,
    amount,
    transactionType,
    merchantCategory,
    accountType,
    Fraudulent_probability,
  } = req.body;

  try {
    // Convert senderId and receiverId to ObjectId
    const senderObjectId = mongoose.Types.ObjectId.isValid(senderId)
      ? mongoose.Types.ObjectId(senderId)
      : null;

    const receiverObjectId = mongoose.Types.ObjectId.isValid(receiverId)
      ? mongoose.Types.ObjectId(receiverId)
      : null;

    if (!senderObjectId || !receiverObjectId) {
      return res.status(400).json({ error: 'Invalid senderId or receiverId' });
    }

    // Fetch sender and receiver from the database
    const sender = await User.findById(senderObjectId);
    const receiver = await User.findById(receiverObjectId);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if the sender has sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct the amount from the sender's balance
    sender.balance -= amount;

    // Add the amount to the receiver's balance
    receiver.balance += amount;

    // Save the updated balances
    await sender.save();
    await receiver.save();

    // Create and save the transaction
    const transaction = new Transaction({
      transactionId,
      timestamp,
      senderId: sender._id,
      receiverId: receiver._id,
      recipient,
      amount,
      transactionType,
      merchantCategory,
      accountType,
      Fraudulent_probability,
    });

    await transaction.save();

    res.status(201).json({ message: 'Transaction saved successfully', transaction });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

module.exports = router; // Export the router