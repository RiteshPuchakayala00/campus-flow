import os
from PyPDF2 import PdfReader

for file in os.listdir('.'):
    if file.endswith('.pdf'):
        try:
            reader = PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            with open(file + '.txt', 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"Extracted {file}")
        except Exception as e:
            print(f"Error extracting {file}: {e}")
