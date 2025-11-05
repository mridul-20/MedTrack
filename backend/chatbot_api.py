from flask import Flask, request, jsonify
from flask_cors import CORS  # 👈 add this
import pickle
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# NLTK downloads
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)  # 👈 add this
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

def clean_text(text):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return " ".join(tokens)

# Load model
with open("../health_chatbot_model.pkl", "rb") as f:
    model, vectorizer = pickle.load(f)

@app.route("/predict", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    cleaned_input = clean_text(user_input)
    vectorized_input = vectorizer.transform([cleaned_input])
    prediction = model.predict(vectorized_input)[0]
    return jsonify({"response": prediction})

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Health Chatbot API is running 🚀"})

if __name__ == "__main__":
    app.run(debug=True)
