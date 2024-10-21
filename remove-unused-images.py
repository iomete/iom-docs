import os
import re

# Set the paths to your docs, blog, glossary, and src folders
docs_paths = ['./docs', './blog', './glossary', './src']
assets_path = './static/img'  # Adjust this if your images are in a different directory

# Function to get all PNG and SVG image files (recursively) in the assets directory
def get_all_image_files(assets_dir):
    image_files = set()
    for root, _, files in os.walk(assets_dir):
        for file in files:
            if file.lower().endswith(('.png', '.svg')):  # Corrected to a tuple for multiple file types
                # Get the relative path from the assets directory (e.g., 'img/blog/list.png')
                relative_path = os.path.relpath(os.path.join(root, file), './static')
                image_files.add(relative_path)
    return image_files

# Function to check if an image is referenced in any of the docs, blog, glossary, or src files
def is_image_used(image_path, docs_paths):
    image_pattern = re.compile(re.escape(image_path))  # Escape special characters in image path
    for docs_path in docs_paths:
        for root, _, files in os.walk(docs_path):
            for file in files:
                # Handle .md, .mdx, .js, .jsx, .ts, .tsx files
                if file.endswith(('.md', '.mdx', '.js', '.jsx', '.ts', '.tsx')):  
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        if re.search(image_pattern, content):
                            return True  # Image is found in this file, no need to check further
    return False  # Image is not found in any file

# Function to remove an image and its corresponding '-dark' version if it exists
def remove_image_and_dark_version(image):
    # Build paths for the dark version of the image
    image_dark = image.replace('.png', '-dark.png').replace('.svg', '-dark.svg')

    # Remove the original image
    image_path = os.path.join('./static', image)
    print(f"Removing unused image: {image}")
    try:
        os.remove(image_path)
    except OSError as e:
        print(f"Error removing {image}: {e}")

    # Check if the dark version exists and remove it
    image_dark_path = os.path.join('./static', image_dark)
    if os.path.exists(image_dark_path):
        print(f"Removing corresponding dark image: {image_dark}")
        try:
            os.remove(image_dark_path)
        except OSError as e:
            print(f"Error removing {image_dark}: {e}")

# Get all PNG and SVG image files in the assets directory
all_image_files = get_all_image_files(assets_path)

# Iterate over each image file and check if it's referenced in any of the docs, blog, glossary, or src files
for image in all_image_files:
    # Skip any image that already ends with 'dark.png' or 'dark.svg'
    if image.lower().endswith(('-dark.png', '-dark.svg')):
        print(f"Skipping image: {image} (ends with 'dark')")
        continue

    # Check if the image is used in any of the docs, blog, glossary, or src files
    if not is_image_used(image, docs_paths):
        # If the image is not used, remove it and check for '-dark' version
        remove_image_and_dark_version(image)

print("Unused images removal completed.")
