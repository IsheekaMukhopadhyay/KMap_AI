import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

def process_clusters(chunks: list[str], n_clusters: int = 5) -> dict:
    """
    Cluster text chunks using TF-IDF and K-Means.
    Reduces to 2D using PCA for Plotly visualization.
    Returns nodes (coordinates, labels, text) and cluster descriptions.
    """
    if not chunks:
        return {"nodes": [], "clusters": {}}

    # Cap n_clusters at the number of available chunks
    true_clusters = min(n_clusters, len(chunks))

    # Vectorize
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X_tfidf = vectorizer.fit_transform(chunks)

    # Cluster
    kmeans = KMeans(n_clusters=true_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_tfidf)

    # Reduce dimensionality to 2D
    # PCA requires n_components <= min(n_samples, n_features)
    n_samples, n_features = X_tfidf.shape
    if n_samples > 1 and n_features >= 2:
        pca = PCA(n_components=2, random_state=42)
        X_pca = pca.fit_transform(X_tfidf.toarray())
    else:
        # Fallback for 1D data or single sample
        if n_samples > 1 and n_features == 1:
            # If 1D, just use the single feature as X and 0 as Y
            X_pca = np.column_stack([X_tfidf.toarray(), np.zeros(n_samples)])
        else:
            X_pca = np.zeros((n_samples, 2))

    nodes = []
    for i, (chunk, label, coords) in enumerate(zip(chunks, labels, X_pca)):
        nodes.append({
            "id": i,
            "text": chunk[:200] + "...", # snippet for hover
            "full_text": chunk,
            "cluster": int(label),
            "x": float(coords[0]),
            "y": float(coords[1])
        })

    # Basic cluster labeling (top words in cluster)
    order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
    terms = vectorizer.get_feature_names_out()
    
    cluster_metadata = {}
    for i in range(true_clusters):
        # Ensure we don't index beyond terms if vocabulary is somehow smaller than expected
        num_terms = min(3, len(order_centroids[i]))
        top_words = []
        for ind in order_centroids[i, :num_terms]:
             if ind < len(terms):
                 top_words.append(terms[ind])
        
        label_text = f"Topic: {', '.join(top_words)}" if top_words else f"Cluster {i}"
        cluster_metadata[i] = {
            "label": label_text,
            "size": sum(1 for label in labels if label == i)
        }

    return {
        "nodes": nodes,
        "clusters": cluster_metadata
    }
