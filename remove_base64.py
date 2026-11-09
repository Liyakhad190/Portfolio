import re
import os

files = ['id-card-front-v2.html', 'id-card-front.html']
for filename in files:
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace large base64 image data with an empty string
        new_content = re.sub(r'src="data:image/[a-zA-Z]+;base64,[^"]+"', 'src=""', content)
        
        if content != new_content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Removed base64 image data from {filename}')
        else:
            print(f'No base64 image data found in {filename}')
