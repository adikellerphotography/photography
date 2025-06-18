import os
from PIL import Image

def generate_thumbnails(base_path, max_size=800):
    """
    Generate thumbnails for all images in galleries except Bat_Mitzvah
    base_path: Path to galleries folder
    max_size: Maximum width or height for thumbnails
    """
    # Get all gallery folders
    galleries_path = os.path.join(base_path, 'public/attached_assets/galleries')
    
    # Process each gallery folder
    for gallery in os.listdir(galleries_path):
        # Skip Bat_Mitzvah and any hidden folders
        # if gallery == 'Bat_Mitzvah' or gallery.startswith('.'):
        #     continue
            
        gallery_path = os.path.join(galleries_path, gallery)
        if not os.path.isdir(gallery_path):
            continue
            
        print(f"Processing gallery: {gallery}")
        
        # Process each image in the gallery
        for img_name in os.listdir(gallery_path):
            # Skip if not an image or already a thumbnail
            if not any(img_name.lower().endswith(ext) for ext in ['.jpg', '.jpeg']) or '-thumb' in img_name:
                continue
                
            img_path = os.path.join(gallery_path, img_name)
            thumb_name = img_name.rsplit('.', 1)[0] + '-thumb.jpeg'
            thumb_path = os.path.join(gallery_path, thumb_name)
            
            # Skip if thumbnail already exists
            if os.path.exists(thumb_path):
                continue
                
            try:
                with Image.open(img_path) as img:
                    # Convert to RGB if necessary
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                        
                    # Calculate new dimensions maintaining aspect ratio
                    ratio = max_size / max(img.size)
                    if ratio < 1:
                        new_size = tuple(int(dim * ratio) for dim in img.size)
                        img = img.resize(new_size, Image.Resampling.LANCZOS)
                    
                    # Save thumbnail with quality optimization
                    img.save(thumb_path, 'JPEG', quality=85, optimize=True)
                    print(f"Created thumbnail: {thumb_name}")
                    
            except Exception as e:
                print(f"Error processing {img_name}: {e}")

if __name__ == "__main__":
    # Assuming script is run from the project root
    project_root = os.path.join(os.path.dirname(__file__), '..')
    generate_thumbnails(project_root)
    print("Thumbnail generation complete!")
