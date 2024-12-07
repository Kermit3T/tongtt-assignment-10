import os
from flask import Flask, render_template, request, jsonify
import numpy as np
import pandas as pd
import torch
from utils.clip_utils import load_clip_model, get_image_embedding, get_text_embedding
from utils.pca_utils import get_pca_embeddings

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Load CLIP model and embeddings
print("Loading model and embeddings...")
model, preprocess = load_clip_model()
df = pd.read_pickle('image_embeddings.pickle')

# Convert embeddings to a single numpy array for faster computation
embeddings_array = np.stack(df['embedding'].values)
print("Finished loading!")

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_top_k_similar(query_embedding, k=6, use_pca=False):
    """
    Get top k similar images using vectorized operations
    """
    # Convert query to numpy and flatten
    query_embedding = query_embedding.detach().cpu().numpy().flatten()
    
    if use_pca:
        # Apply PCA (you'll need to modify this based on your PCA implementation)
        query_embedding = get_pca_embeddings(query_embedding)
        database_embeddings = get_pca_embeddings(embeddings_array)
    else:
        database_embeddings = embeddings_array
    
    # Calculate similarities all at once
    similarities = np.dot(database_embeddings, query_embedding)
    
    # Get top k indices
    top_k_idx = np.argsort(similarities)[-k:][::-1]
    
    results = []
    for idx in top_k_idx:
        results.append({
            'image': df.iloc[idx]['file_name'],
            'similarity': float(similarities[idx])
        })
    
    return results

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query_type = request.form['query_type']
    use_pca = request.form.get('use_pca', 'false').lower() == 'true'
    
    if query_type == 'text':
        text = request.form['text']
        query_embedding = get_text_embedding(model, text)
    
    elif query_type == 'image':
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        file = request.files['image']
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(image_path)
        query_embedding = get_image_embedding(model, preprocess, image_path)
        
    else:  # hybrid
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        text = request.form['text']
        weight = float(request.form['weight'])
        
        file = request.files['image']
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(image_path)
        
        image_embedding = get_image_embedding(model, preprocess, image_path)
        text_embedding = get_text_embedding(model, text)
        
        query_embedding = weight * text_embedding + (1.0 - weight) * image_embedding
    
    results = get_top_k_similar(query_embedding, k=6, use_pca=use_pca)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)