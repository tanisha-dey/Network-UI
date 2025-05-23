from flask import Flask, request, jsonify, send_from_directory
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Load model and scaler
model = joblib.load('rf_model.pkl')
scaler = joblib.load('scaler.pkl')

# Serve index.html from project root
@app.route('/')
def home():
    return send_from_directory(directory=os.getcwd(), path='index.html')

# Existing prediction API expecting JSON with 10 features
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = data['features']
        if len(features) != 10:
            return jsonify({'error': 'Expected 10 features'}), 400

        features_array = np.array(features).reshape(1, -1)
        features_scaled = scaler.transform(features_array)
        prediction = model.predict(features_scaled)[0]

        return jsonify({'prediction': int(prediction)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New CSV upload prediction endpoint for batch prediction with 78 features
@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Read CSV to dataframe
        df = pd.read_csv(file)

        # Check for 78 features (columns)
        if df.shape[1] != 78:
            return jsonify({'error': f'Expected 78 features, but got {df.shape[1]} columns'}), 400

        # Scale features
        features_scaled = scaler.transform(df)

        # Predict for all rows
        preds = model.predict(features_scaled)

        # Convert predictions to list and send JSON response
        return jsonify({'predictions': preds.tolist()})

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)
