// filepath: d:\HACKATHON_25_2\fraud-detection-dashboard\server\controllers\transactionController.js
const Transaction = require('../models/Transaction'); // Import the Transaction model

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body); // Create a new transaction from the request body
    await transaction.save(); // Save the transaction to the database
    res.status(201).json({ message: 'Transaction added successfully', transaction });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
};