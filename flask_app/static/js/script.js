document.getElementById('image-query').addEventListener('change', function(e) {
    document.getElementById('file-name').textContent = e.target.files[0].name;
});

async function performSearch() {
    const queryType = document.getElementById('query-type').value;
    const usePca = document.getElementById('use-pca').checked;
    
    const formData = new FormData();
    formData.append('query_type', queryType);
    formData.append('use_pca', usePca);

    if (queryType === 'text' || queryType === 'hybrid') {
        formData.append('text', document.getElementById('text-query').value);
    }
    
    if (queryType === 'image' || queryType === 'hybrid') {
        const imageFile = document.getElementById('image-query').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
    }

    if (queryType === 'hybrid') {
        formData.append('weight', document.getElementById('weight').value);
    }

    try {
        const response = await fetch('/search', {
            method: 'POST',
            body: formData
        });
        
        const results = await response.json();
        displayResults(results);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const img = document.createElement('img');
        img.src = `/static/coco_images_resized/${result.image}`;
        img.alt = 'Search result';
        
        const similarity = document.createElement('div');
        similarity.className = 'similarity-score';
        similarity.textContent = `Similarity: ${result.similarity.toFixed(3)}`;
        
        resultItem.appendChild(img);
        resultItem.appendChild(similarity);
        resultsDiv.appendChild(resultItem);
    });
}

// Update form visibility based on query type
document.getElementById('query-type').addEventListener('change', function(e) {
    const queryType = e.target.value;
    const imageInput = document.getElementById('image-query').parentElement;
    const textInput = document.getElementById('text-query').parentElement;
    const weightInput = document.getElementById('weight').parentElement;
    
    if (queryType === 'text') {
        imageInput.style.display = 'none';
        textInput.style.display = 'block';
        weightInput.style.display = 'none';
    } else if (queryType === 'image') {
        imageInput.style.display = 'block';
        textInput.style.display = 'none';
        weightInput.style.display = 'none';
    } else {  // hybrid
        imageInput.style.display = 'block';
        textInput.style.display = 'block';
        weightInput.style.display = 'block';
    }
});
