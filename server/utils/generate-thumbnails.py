from PIL import Image
import os
from pathlib import Path
import sys

def generate_thumbnail(image_path, thumb_path, max_size=400):
    """Generate a thumbnail for the given image."""
    try:
        with Image.open(image_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Calculate new dimensions maintaining aspect ratio
            ratio = max_size / max(img.size)
            if ratio < 1:  # Only resize if image is larger than max_size
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, Image.Resampling.LANCZOS)

            # Save with optimized quality
            img.save(thumb_path, 'JPEG', quality=85, optimize=True)
            print(f"Created thumbnail: {thumb_path}")
            return True
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")
        return False

def process_galleries(base_path):
    """Process all galleries except Bat_Mitsva."""
    galleries_path = Path(base_path) / 'client' / 'public' / 'attached_assets' / 'galleries'
    
    if not galleries_path.exists():
        print(f"Error: Galleries path not found: {galleries_path}")
        return

    # Process each gallery
    for gallery in galleries_path.iterdir():
        if gallery.is_dir() and gallery.name != 'Bat_Mitsva':
            print(f"\nProcessing gallery: {gallery.name}")
            
            # Get all jpeg/jpg files
            image_files = []
            for ext in ('*.jpeg', '*.jpg', '*.JPEG', '*.JPG'):
                image_files.extend(gallery.glob(ext))

            if not image_files:
                print(f"No images found in {gallery.name}")
                continue

            # Process each image
            for img_path in image_files:
                # Skip if filename already ends with -thumb
                if '-thumb' in img_path.stem:
                    continue

                # Create thumbnail path
                thumb_path = img_path.parent / f"{img_path.stem}-thumb{img_path.suffix}"
                
                # Generate thumbnail if it doesn't exist or if source is newer
                if not thumb_path.exists() or os.path.getmtime(img_path) > os.path.getmtime(thumb_path):
                    generate_thumbnail(img_path, thumb_path)

def main():
    # Get the root directory of the project
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent.parent

    print("Starting thumbnail generation...")
    process_galleries(project_root)
    print("\nThumbnail generation complete!")

if __name__ == "__main__":
    main()
