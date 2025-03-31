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

# Example transaction
example_transaction = {
    "Transaction Type": "Online",
    "Location": "USA",
    "Device": "Mobile",
    "Merchant Category": "Electronics",
    "City": "New York",
    "Account Type": "Credit",
    "Amount": 5000,
    "Old Balance": 20000,
    "New Balance": 15000
}

fraud_result_xgb = predict_fraud(example_transaction)
print(f"Predicted Classification: {fraud_result_xgb}")

"""neural network"""

import torch
import pickle
import pandas as pd
import torch.nn as nn

# Load feature names
with open("feature_names_nn.pkl", "rb") as f:
    feature_names = pickle.load(f)

# Load label encoders
with open("label_encoders_nn.pkl", "rb") as f:
    label_encoders = pickle.load(f)

# Load the scaler
with open("scaler_nn.pkl", "rb") as f:
    scaler = pickle.load(f)


# Load the saved model
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
        x = self.sigmoid(self.fc4(x))  # Output probability
        return x


# Initialize and load model
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


# Example test case
example_transaction = {
    "Transaction Type": "Wire Transfer",
    "Location": "India",
    "Device": "Mobile",
    "Merchant Category": "Electronics",
    "City": "New York",
    "Account Type": "Savings",
    "Amount": 100000,
    "Old Balance": 100000,
    "New Balance": 0
}

fraud_result_neural = predict_fraud_nn(example_transaction, loaded_model)
print(f"Predicted Classification (Neural Network - PyTorch): {fraud_result_neural}")

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
    input_df = pd.DataFrame([input_data])[feature_names]  # 🔥 Ensure correct order

    # Get anomaly score
    anomaly_score = model.decision_function(input_df)[0]

    return classify_isolation_forest(anomaly_score)


# Example Test Case
example_transaction = {
    "Transaction Type": "Wire Transfer",
    "Location": "India",
    "Device": "Mobile",
    "Merchant Category": "Electronics",
    "City": "New York",
    "Account Type": "Savings",
    "Amount": 50000,
    "Old Balance": 50000,
    "New Balance": 0
}

fraud_result_isolation = predict_fraud(example_transaction)
print(f"Predicted Classification: {fraud_result_isolation}")

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

# Example usage
xgb_output = fraud_result_xgb
nn_output = fraud_result_neural
iso_output = fraud_result_isolation

final_prediction = ensemble_prediction(xgb_output, nn_output, iso_output)
print(f"Final Decision: {final_prediction}")



import sys
import json

def main():
    # Read input from stdin
    input_data = sys.stdin.read()
    transactions = json.loads(input_data)

    # Example: Run fraud detection (replace with actual logic)
    results = []
    for transaction in transactions:
        # Replace this with actual AI model predictions
        if transaction["amount"] > 10000:
            results.append(2)  # Fraud
        elif transaction["amount"] > 5000:
            results.append(1)  # Suspicious
        else:
            results.append(0)  # Safe

    # Output results as JSON
    print(json.dumps(results))

if __name__ == "__main__":
    main()