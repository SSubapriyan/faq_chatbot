import nltk
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import string
import json

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class FAQMatcher:
    def __init__(self, faq_file_path):
        """Initialize the FAQ matcher with FAQs from a JSON file."""
        with open(faq_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        self.faqs = data['faqs']
        self.questions = [faq['question'] for faq in self.faqs]
        self.vectorizer = TfidfVectorizer(
            tokenizer=self.tokenize,
            lowercase=True,
            stop_words='english'
        )
        self.question_vectors = self.vectorizer.fit_transform(self.questions)
    
    def tokenize(self, text):
        """Tokenize and clean text using NLTK."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Tokenize
        tokens = nltk.word_tokenize(text)
        
        return tokens
    
    def preprocess_text(self, text):
        """Preprocess user input text."""
        # Tokenize and clean
        tokens = self.tokenize(text)
        
        # Join tokens back into string for vectorization
        return ' '.join(tokens)
    
    def find_best_match(self, user_question, threshold=0.3):
        """
        Find the best matching FAQ for a user question using cosine similarity.
        Returns the answer if similarity score is above threshold, otherwise None.
        """
        # Preprocess user question
        processed_question = self.preprocess_text(user_question)
        
        # Vectorize user question
        user_vector = self.vectorizer.transform([processed_question])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(user_vector, self.question_vectors).flatten()
        
        # Find best match
        best_match_idx = np.argmax(similarities)
        best_score = similarities[best_match_idx]
        
        # Check if score meets threshold
        if best_score >= threshold:
            return {
                'question': self.questions[best_match_idx],
                'answer': self.faqs[best_match_idx]['answer'],
                'confidence': float(best_score)
            }
        else:
            return None
    
    def get_all_faqs(self):
        """Return all FAQs."""
        return self.faqs

# Initialize FAQ matcher
faq_matcher = FAQMatcher('faq.json')