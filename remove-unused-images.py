import os
import re

# Set the paths to your docs, blog, and glossary folders
docs_paths = ['./docs', './blog', './glossary']
assets_path = './static/img'  # Adjust this if your images are in a different directory

# Function to get all image files (recursively) in the assets directory
def get_all_image_files(assets_dir):
    image_files = set()
    for root, _, files in os.walk(assets_dir):
        for file in files:
            if file.lower().endswith('.png'):
                # Get the relative path from the assets directory (e.g., 'img/blog/list.png')
                relative_path = os.path.relpath(os.path.join(root, file), './static')
                image_files.add(relative_path)
    return image_files

# Function to check if an image is referenced in any of the docs, blog, or glossary files
def is_image_used(image_path, docs_paths):
    image_pattern = re.compile(re.escape(image_path))  # Escape special characters in image path
    for docs_path in docs_paths:
        for root, _, files in os.walk(docs_path):
            for file in files:
                if file.endswith(('.md', '.mdx')):  # Handle both .md and .mdx
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        if re.search(image_pattern, content):
                            return True  # Image is found in this file, no need to check further
    return False  # Image is not found in any file

# Get all image files in the assets directory
all_image_files = get_all_image_files(assets_path)

# Iterate over each image file and check if it's referenced in any of the docs, blog, or glossary files
for image in all_image_files:
    if not is_image_used(image, docs_paths):
        # If the image is not used, remove it
        image_path = os.path.join('./static', image)
        print(f"Removing unused image: {image}")
        try:
            os.remove(image_path)
        except OSError as e:
            print(f"Error removing {image}: {e}")

print("Unused images removal completed.")
