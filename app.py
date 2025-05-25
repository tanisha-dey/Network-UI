from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # enable CORS for all domains

# Load models and preprocessing objects
rf_model = joblib.load('rf_model.pkl')
iso_model = joblib.load('iso_model.pkl')
scaler = joblib.load('scaler.pkl')
imputer = joblib.load('imputer.pkl')

@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    try:
        # Get model query param (optional fallback)
        selected_model = request.args.get('model', 'combined')

        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        df = pd.read_csv(file)

        # Step 1: Preprocess input (impute, then scale)
        input_clean = imputer.transform(df)
        input_scaled = scaler.transform(input_clean)

        # Step 2: Predict using both models
        rf_pred = rf_model.predict(input_scaled)
        iso_pred = iso_model.predict(input_scaled)
        iso_binary = [1 if p == -1 else 0 for p in iso_pred]  # 1 = anomaly, 0 = normal

        # Step 3: Combine predictions
        combined_pred = []
        for rf_p, iso_p in zip(rf_pred, iso_binary):
            if rf_p == 1 or iso_p == 1:
                combined_pred.append(1)  # anomaly
            else:
                combined_pred.append(0)  # normal

        # Optional: allow frontend to select only RF or ISO if needed
        if selected_model == 'rf':
            predictions = rf_pred.tolist()
        elif selected_model == 'iso':
            predictions = iso_binary
        else:
            predictions = combined_pred

        return jsonify({'predictions': predictions})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
