import torch
import open_clip
from PIL import Image
import torch.nn.functional as F

def load_clip_model(model_name="ViT-B/32", pretrained="openai"):
    """
    Load CLIP model and preprocessing transform
    """
    model, _, preprocess = open_clip.create_model_and_transforms(model_name, pretrained=pretrained)
    model = model.eval()
    return model, preprocess

def get_image_embedding(model, preprocess, image_path):
    """
    Get CLIP embedding for an image
    """
    # Load and preprocess image
    image = Image.open(image_path).convert('RGB')
    image_input = preprocess(image).unsqueeze(0)
    
    # Generate embedding
    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features = F.normalize(image_features, p=2, dim=1)
    
    return image_features

def get_text_embedding(model, text):
    """
    Get CLIP embedding for text
    """
    # Tokenize text
    tokenizer = open_clip.get_tokenizer('ViT-B-32')
    text_tokens = tokenizer([text])
    
    # Generate embedding
    with torch.no_grad():
        text_features = model.encode_text(text_tokens)
        text_features = F.normalize(text_features, p=2, dim=1)
    
    return text_features