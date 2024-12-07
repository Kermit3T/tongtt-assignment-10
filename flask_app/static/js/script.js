document.getElementById('image-query').addEventListener('change', function(e) {
    document.getElementById('file-name').textContent = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
});

async function performSearch() {
    const searchButton = document.getElementById('search-button');
    const loadingIndicator = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    // Disable button and show loading
    searchButton.disabled = true;
    loadingIndicator.style.display = 'block';
    resultsDiv.innerHTML = '';

    const queryType = document.getElementById('query-type').value;
    const usePca = document.getElementById('use-pca').checked;
    
    const formData = new FormData();
    formData.append('query_type', queryType);
    formData.append('use_pca', usePca);

    if (queryType === 'text' || queryType === 'hybrid') {
        const textQuery = document.getElementById('text-query').value;
        if (!textQuery && queryType === 'text') {
            alert('Please enter a text query');
            searchButton.disabled = false;
            loadingIndicator.style.display = 'none';
            return;
        }
        formData.append('text', textQuery);
    }
    
    if (queryType === 'image' || queryType === 'hybrid') {
        const imageFile = document.getElementById('image-query').files[0];
        if (!imageFile && queryType === 'image') {
            alert('Please select an image');
            searchButton.disabled = false;
            loadingIndicator.style.display = 'none';
            return;
        }
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const results = await response.json();
        await displayResults(results);
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    } finally {
        // Re-enable button and hide loading
        searchButton.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}

function createImageElement(src, alt) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
        img.alt = alt;
    });
}

async function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    for (const result of results) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        try {
            const imagePath = `/static/coco_images_resized/${result.image}`;
            const img = await createImageElement(imagePath, 'Search result');
            
            const similarity = document.createElement('div');
            similarity.className = 'similarity-score';
            similarity.textContent = `Similarity: ${result.similarity.toFixed(3)}`;
            
            resultItem.appendChild(img);
            resultItem.appendChild(similarity);
        } catch (error) {
            resultItem.classList.add('error');
            resultItem.innerHTML = `
                <div class="error-message">Failed to load image</div>
                <div class="similarity-score">Similarity: ${result.similarity.toFixed(3)}</div>
            `;
        }
        
        resultsDiv.appendChild(resultItem);
    }
}

// Update form visibility based on query type
document.getElementById('query-type').addEventListener('change', function(e) {
    const queryType = e.target.value;
    const imageInput = document.getElementById('image-query').parentElement.parentElement;
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