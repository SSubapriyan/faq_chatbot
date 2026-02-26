class ChatbotUI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.questionChips = document.getElementById('questionChips');
        
        this.apiUrl = 'http://localhost:5000/api';
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadSuggestedQuestions();
    }
    
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    async loadSuggestedQuestions() {
        try {
            const response = await fetch(`${this.apiUrl}/faqs`);
            const data = await response.json();
            
            if (data.faqs) {
                // Show first 5 questions as suggestions
                const suggestions = data.faqs.slice(0, 5);
                this.displaySuggestedQuestions(suggestions);
            }
        } catch (error) {
            console.error('Error loading FAQs:', error);
        }
    }
    
    displaySuggestedQuestions(faqs) {
        this.questionChips.innerHTML = '';
        
        faqs.forEach(faq => {
            const chip = document.createElement('span');
            chip.className = 'question-chip';
            chip.textContent = faq.question;
            chip.addEventListener('click', () => {
                this.userInput.value = faq.question;
                this.sendMessage();
            });
            
            this.questionChips.appendChild(chip);
        });
    }
    
    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message) {
            return;
        }
        
        // Display user message
        this.displayMessage(message, 'user');
        
        // Clear input
        this.userInput.value = '';
        
        // Show loading indicator
        this.showLoading();
        
        try {
            // Send to backend
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            // Remove loading indicator
            this.removeLoading();
            
            if (data.error) {
                this.displayMessage('Sorry, an error occurred. Please try again.', 'bot');
            } else {
                this.displayMessage(data.answer, 'bot', data.confidence);
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.removeLoading();
            this.displayMessage('Sorry, I cannot connect to the server. Please make sure the backend is running.', 'bot');
        }
    }
    
    displayMessage(message, sender, confidence = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        if (confidence && sender === 'bot') {
            const confidenceDiv = document.createElement('div');
            confidenceDiv.className = 'confidence-badge';
            confidenceDiv.textContent = `Confidence: ${Math.round(confidence * 100)}%`;
            contentDiv.appendChild(confidenceDiv);
        }
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message';
        loadingDiv.id = 'loading-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading';
        contentDiv.appendChild(spinner);
        
        loadingDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(loadingDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    removeLoading() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotUI();
});