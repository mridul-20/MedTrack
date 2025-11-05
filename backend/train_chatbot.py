import pandas as pd
import nltk
import string
import pickle
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Download NLTK data
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

# Initialize lemmatizer and stopwords
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

# Clean text function
def clean_text(text):
    if pd.isnull(text):
        return ""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return " ".join(tokens)

# Load dataset
print("📦 Loading dataset...")
data = pd.read_csv("../chatbot_data/medquad.csv")

# Drop null values in question or answer
data = data.dropna(subset=["question", "answer"])

# Remove duplicates
data = data.drop_duplicates(subset=["question", "answer"])

# Limit to 1000 entries for now (optional)
data = data.head(500)

# Clean the input questions
print("🧹 Cleaning questions...")
data["clean_question"] = data["question"].apply(clean_text)

# Vectorize cleaned questions
print("🔠 Vectorizing text...")
vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(data["clean_question"])

# Labels
y = data["answer"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
print("🤖 Training Logistic Regression model...")
model = LogisticRegression(max_iter=500)
model.fit(X_train, y_train)

# Evaluate model
print("📊 Evaluation:")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Save model + vectorizer
print("💾 Saving model and vectorizer...")
with open("../health_chatbot_model.pkl", "wb") as f:
    pickle.dump((model, vectorizer), f)

print("✅ Training complete! Saved as 'health_chatbot_model.pkl'")
