from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import os
from dotenv import load_dotenv
from prediction_engine import HealthPredictor
from nutrition_engine import NutritionRecommender

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize engines
health_predictor = HealthPredictor()
nutrition_recommender = NutritionRecommender()

@app.route('/api/health-check', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'service': 'ML Service',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict_health():
    try:
        data = request.json
        metrics = data.get('metrics', {})
        user_profile = data.get('userProfile', {})
        
        # Make prediction
        prediction = health_predictor.predict(metrics, user_profile)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nutrition', methods=['POST'])
def get_nutrition_recommendations():
    try:
        data = request.json
        
        recommendations = nutrition_recommender.generate_recommendations(data)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
