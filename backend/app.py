from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import faq_matcher

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages and return matching FAQ answer."""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({
                'error': 'Please enter a message'
            }), 400
        
        # Find best matching FAQ
        match = faq_matcher.find_best_match(user_message)
        
        if match:
            response = {
                'answer': match['answer'],
                'confidence': match['confidence'],
                'matched_question': match['question']
            }
        else:
            response = {
                'answer': "I'm sorry, I couldn't find an answer to your question. Please contact customer support for further assistance.",
                'confidence': 0,
                'matched_question': None
            }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/faqs', methods=['GET'])
def get_faqs():
    """Return all FAQs."""
    try:
        faqs = faq_matcher.get_all_faqs()
        return jsonify({'faqs': faqs})
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)