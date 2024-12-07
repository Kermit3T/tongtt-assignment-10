import numpy as np
from sklearn.decomposition import PCA
import pandas as pd

def fit_pca(embeddings_df, n_components=50):
    """
    Fit PCA on the embeddings dataset
    """
    # Convert embeddings to numpy array
    embeddings = np.vstack(embeddings_df['embedding'].values)
    
    # Fit PCA
    pca = PCA(n_components=n_components)
    pca.fit(embeddings)
    
    return pca

def get_pca_embeddings(embedding, pca=None, n_components=50):
    """
    Transform embeddings using PCA
    If no PCA model is provided, fits a new one
    """
    # Reshape embedding if necessary
    if len(embedding.shape) == 1:
        embedding = embedding.reshape(1, -1)
    
    # If no PCA model provided, fit new one
    if pca is None:
        # Load embeddings dataset
        df = pd.read_pickle('image_embeddings.pickle')
        pca = fit_pca(df, n_components)
    
    # Transform embedding
    transformed = pca.transform(embedding)
    
    return transformed

def get_cumulative_variance_ratio(embeddings_df, max_components=100):
    """
    Get cumulative explained variance ratio for different numbers of components
    """
    # Convert embeddings to numpy array
    embeddings = np.vstack(embeddings_df['embedding'].values)
    
    # Fit PCA
    pca = PCA(n_components=max_components)
    pca.fit(embeddings)
    
    # Get cumulative variance ratio
    cumulative_variance_ratio = np.cumsum(pca.explained_variance_ratio_)
    
    return cumulative_variance_ratio