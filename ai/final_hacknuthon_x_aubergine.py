# -*- coding: utf-8 -*-
"""Final HackNUthon X Aubergine.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1Q5Shl42feeAlKrpbaZ_rdW9smu__yO7Q
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
from sklearn.metrics import accuracy_score, classification_report
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, TensorDataset

"""xgb"""

import xgboost
print(xgboost.__version__)

import numpy as np
import pickle

# Load the trained XGBoost model
with open("xgboost_fraud_model.pkl", "rb") as f:
    model = pickle.load(f)

# Load stored label encoders
with open("label_encoders.pkl", "rb") as f:
    label_encoders = pickle.load(f)

# Define the classification function
def classify_fraud(prob):
    if prob < 0.5:
        return "Non-Fraudulent"
    elif 0.6 <= prob <= 0.8:
        return "Suspicious"
    else:
        return "Fraudulent"

# Define the feature column names (must match those used during training)
feature_columns = [
    "Transaction Type", "Location", "Device", "Merchant Category",
    "City", "Account Type", "Amount", "Old Balance", "New Balance"
]

def predict_fraud(transaction_details):
    """
    Predict fraud for a single transaction input using the trained XGBoost model.

    :param transaction_details: Dictionary containing transaction parameters
    :return: Fraud classification ("Non-Fraudulent", "Suspicious", "Fraudulent")
    """
    input_data = []  # Prepare input array for the model

    for col in feature_columns:  # Iterate through feature columns
        if col in label_encoders:  # Encode categorical values using stored encoders
            input_data.append(label_encoders[col].transform([transaction_details[col]])[0])
        else:
            input_data.append(transaction_details[col])  # Use numerical values directly

    input_data = np.array(input_data).reshape(1, -1)  # Reshape input to match model's expected format

    fraud_prob = model.predict(input_data)[0]  # Predict using the trained model

    # Convert probability to classification label
    return classify_fraud(fraud_prob)

"""neural network"""

import torch
import pickle
import pandas as pd
import torch.nn as nn

with open("feature_names_nn.pkl", "rb") as f:
    feature_names = pickle.load(f)

with open("label_encoders_nn.pkl", "rb") as f:
    label_encoders = pickle.load(f)

with open("scaler_nn.pkl", "rb") as f:
    scaler = pickle.load(f)


class FraudDetectionNN(nn.Module):
    def __init__(self, input_dim):
        super(FraudDetectionNN, self).__init__()
        self.fc1 = nn.Linear(input_dim, 32)
        self.fc2 = nn.Linear(32, 16)
        self.fc3 = nn.Linear(16, 8)
        self.fc4 = nn.Linear(8, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.relu(self.fc3(x))
        x = self.sigmoid(self.fc4(x))
        return x



input_dim = len(feature_names)  # Use loaded feature count
loaded_model = FraudDetectionNN(input_dim)
loaded_model.load_state_dict(torch.load("fraud_detection_nn.pth"))
loaded_model.eval()  # Set to evaluation mode
print("Model loaded successfully!")


# Classification function
def classify_nn(prediction):
    if prediction > 0.8:
        return "Fraudulent"
    elif prediction > 0.6:
        return "Suspicious"
    else:
        return "Non-Fraudulent"


# Updated function to predict fraud
def predict_fraud_nn(transaction_details, model):
    """
    Predict fraud for a single transaction using the trained neural network.
    """
    input_data = {}

    # Encode categorical values using stored encoders
    for col in feature_names:
        if col in label_encoders:
            input_data[col] = label_encoders[col].transform([transaction_details[col]])[0]
        else:
            input_data[col] = transaction_details[col]

    # Convert to DataFrame with correct feature order
    input_df = pd.DataFrame([input_data])[feature_names]  # 🔥 Ensures correct feature order

    # Apply scaling
    numerical_cols = [col for col in input_df.columns if col not in label_encoders]
    input_df[numerical_cols] = scaler.transform(input_df[numerical_cols])

    # Convert to PyTorch tensor
    input_tensor = torch.tensor(input_df.values, dtype=torch.float32)

    # Get prediction
    with torch.no_grad():
        nn_prediction = model(input_tensor).item()

    return classify_nn(nn_prediction)

"""isolationforest"""

import pickle
import pandas as pd

# Load trained Isolation Forest model
with open("isolation_forest_model.pkl", "rb") as f:
    model = pickle.load(f)

# Load label encoders
with open("label_encoders.pkl", "rb") as f:
    label_encoders = pickle.load(f)

# Load feature names from training data (to ensure order is correct)
with open("feature_names.pkl", "rb") as f:
    feature_names = pickle.load(f)  # Feature order saved during training
0

def classify_isolation_forest(score):
    """Classifies the transaction based on Isolation Forest anomaly score."""
    if score < -0.1:
        return "Fraudulent"
    elif -0.1 <= score <= -0.05:
        return "Suspicious"
    else:
        return "Non-Fraudulent"


def predict_fraud(transaction_details):
    """
    Predict fraud for a single transaction using the trained Isolation Forest model.

    :param transaction_details: Dictionary containing transaction parameters
    :return: Fraud classification ("Non-Fraudulent", "Suspicious", "Fraudulent")
    """
    input_data = {}

    # Encode categorical values using stored encoders
    for col in label_encoders.keys():
        input_data[col] = label_encoders[col].transform([transaction_details[col]])[0]

    # Include numerical values directly
    for col in ["Amount", "Old Balance", "New Balance"]:
        input_data[col] = transaction_details[col]

    # Convert to DataFrame with correct feature order
    input_df = pd.DataFrame([input_data])[feature_names]  #  Ensure correct order

    # Get anomaly score
    anomaly_score = model.decision_function(input_df)[0]

    return classify_isolation_forest(anomaly_score)

from collections import Counter

def ensemble_prediction(xgb_pred, nn_pred, iso_pred):
    """
    Perform ensemble voting based on three model predictions.

    Args:
    xgb_pred (str): Prediction from XGBoost model.
    nn_pred (str): Prediction from Neural Network model.
    iso_pred (str): Prediction from Isolation Forest model.

    Returns:
    str: Final decision based on majority voting.
    """
    predictions = [xgb_pred, nn_pred, iso_pred]

    # Count occurrences of each prediction
    pred_counts = Counter(predictions)

    # Get the most common prediction(s)
    most_common = pred_counts.most_common()

    if len(most_common) == 1:
        return most_common[0][0]  # Only one prediction exists

    elif most_common[0][1] > 1:  # If a prediction occurs more than once
        return most_common[0][0]

    else:  # If all three are different, return Neural Network's prediction
        return xgb_pred

import requests
import json
from pymongo import MongoClient

# MongoDB connection URL
mongodb_url = "mongodb+srv://1:1@cluster0.pu885i0.mongodb.net/test?retryWrites=true&w=majority"
# Connect to MongoDB
try:
    # Connect to MongoDB
    client = MongoClient(mongodb_url)
    db = client["test"]  # Replace with your database name
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Access the database and collection
db = client["test"]  # Database name
transactions_collection = db["transections"]  # Collection name

def get_user_transactions(user_id):
    """
    Fetch the last transaction and previous transactions for a specific user.

    :param user_id: The ID of the user.
    :return: A tuple containing the last transaction and a list of previous transactions.
    """
    # Fetch all transactions for the user, sorted by timestamp
    user_transactions = list(transactions_collection.find({"user_id": user_id}).sort("timestamp", -1))

    if not user_transactions:
        raise Exception(f"No transactions found for user_id: {user_id}")

    # Separate the last transaction and previous transactions
    last_transaction = user_transactions[0]
    previous_transactions = user_transactions[1:]

    return last_transaction, previous_transactions

def generate_explanation(transaction, classification, explanation_prompt):
    url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent"
    headers = {"Content-Type": "application/json"}
    params = {"key": "AIzaSyCPjMm9mHT1eT7VNjBrbK4chAszv8mdq5U"}  # Replace with a valid API key


    data = {
        "contents": [
            {
                "parts": [{"text": explanation_prompt}]
            }
        ]
    }

    response = requests.post(url, headers=headers, params=params, json=data)

    if response.status_code == 200:
        return response.json()["candidates"][0]["content"]
    else:
        raise Exception(f"Error in generating explanation: {response.text}")

def analyze_last_transaction(last_transaction):
    """
    Analyze the last transaction for fraud.

    :param last_transaction: The last transaction details.
    :return: Fraud classification result.
    """
    fraud_result = predict_fraud(last_transaction)  # Replace with your fraud detection logic
    return fraud_result

def generate_transaction_explanation(last_transaction, previous_transactions, classification):
    """
    Generate an explanation for the classification of the last transaction, considering previous transactions.

    :param last_transaction: The last transaction details.
    :param previous_transactions: A list of previous transactions.
    :param classification: The fraud classification result.
    :return: Explanation text.
    """
    # Format previous transactions for the explanation
    previous_transactions_summary = "\n".join(
        [f"- Transaction {i+1}: {transaction}" for i, transaction in enumerate(previous_transactions)]
    )

    explanation_prompt = f"""
    The following transaction has been classified as '{classification}'.
    Provide a detailed explanation considering potential fraud indicators such as:
    - Unusual transaction amount compared to typical user behavior.
    - Location inconsistency (transaction from a different country or city than usual).
    - Device mismatch (first-time use of a new device for high-value transactions).
    - Drastic balance reduction (entire balance wiped in a single transaction).
    - Merchant category relevance (unusual spending in a specific category).
    - Type of transaction (wire transfer, often used in fraud due to irreversibility).

    Last Transaction Details:
    - Type: {last_transaction['Transaction Type']}
    - Location: {last_transaction['Location']}
    - Device: {last_transaction['Device']}
    - Merchant Category: {last_transaction['Merchant Category']}
    - City: {last_transaction['City']}
    - Account Type: {last_transaction['Account Type']}
    - Amount: {last_transaction['Amount']}
    - Old Balance: {last_transaction['Old Balance']}
    - New Balance: {last_transaction['New Balance']}

    Previous Transactions Summary:
    {previous_transactions_summary}

    Based on these factors, analyze why the last transaction is classified as '{classification}'. Provide only specific reasoning for classification in 50 words.
    """

    # Call the external API or logic to generate the explanation
    explanation = generate_explanation(last_transaction, classification,explanation_prompt)
    return explanation

def process_user_transactions(user_id):
    """
    Process a specific user's transactions to analyze the last transaction and generate an explanation.

    :param user_id: The ID of the user.
    :return: A dictionary containing the classification, explanation, and previous transactions.
    """
    try:
        # Step 1: Fetch transactions
        last_transaction, previous_transactions = get_user_transactions(user_id)

        # Step 2: Analyze the last transaction
        classification = analyze_last_transaction(last_transaction)

        # Step 3: Generate explanation
        explanation = generate_transaction_explanation(last_transaction, previous_transactions, classification)

        # Return the results as a dictionary
        return {
            "classification": classification,
            "explanation": explanation,
            "previous_transactions": previous_transactions
        }

    except Exception as e:
        print(f"Error: {e}")
        return None

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient

# Initialize FastAPI app
app = FastAPI()

# MongoDB connection URL
mongodb_url = "mongodb+srv://1:1@cluster0.pu885i0.mongodb.net/test?retryWrites=true&w=majority"
client = MongoClient(mongodb_url)
db = client["test"]  # Replace with your database name
transactions_collection = db["transactions"]  # Replace with your collection name

# Define the request model
class TransactionRequest(BaseModel):
    user_id: str
    transaction: dict  # The transaction details sent from the frontend

# Define the endpoint
@app.post("/process_transaction")
async def process_transaction_endpoint(request: TransactionRequest):
    """
    API endpoint to process a transaction.
    Expects a JSON payload with 'user_id' and 'transaction'.
    """
    try:
        # Step 1: Save the transaction in the database
        transaction = request.transaction
        transaction["user_id"] = request.user_id

        # Insert the transaction into the database
        inserted_transaction = transactions_collection.insert_one(transaction)
        transaction_id = inserted_transaction.inserted_id

        # Step 2: Process the transaction for fraud detection
        classification = analyze_last_transaction(transaction)

        # Step 3: Generate explanation only for "Fraudulent" or "Suspicious" classifications
        if classification in ["Fraudulent", "Suspicious"]:
            explanation = generate_transaction_explanation(transaction, [], classification)

            # Ensure explanation is a string
            if isinstance(explanation, dict):
                explanation = json.dumps(explanation, indent=2)

            # Clean the explanation text
            cleaned_text = explanation.replace("* **", "").replace("**", "")

            # Split the text into lines and strip unnecessary whitespace
            lines = [line.strip() for line in cleaned_text.split("\n") if line.strip()]

            # Join the cleaned lines into a human-readable paragraph
            formatted_text = "\n".join(lines)
        else:
            # For "Non-Fraudulent" classification, set explanation to "safe"
            formatted_text = "safe"

        # Step 4: Update the transaction in the database with fraud classification and explanation
        transactions_collection.update_one(
            {"_id": transaction_id},
            {"$set": {"fraud_classification": classification, "explanation": formatted_text}}
        )

        # Return the updated transaction details
        return {
            "transaction_id": str(transaction_id),
            "fraud_classification": classification,
            "explanation": formatted_text,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the app using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6000)