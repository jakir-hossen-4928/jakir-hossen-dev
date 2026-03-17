
import json

with open('c:/Jakir Hossen/jakir-hossen-dev/src/assets/design-theme/themes.json', 'r') as f:
    data = json.load(f)

themes = data['portfolio']['themes']

with open('c:/Jakir Hossen/jakir-hossen-dev/src/assets/design-theme/only-themes.json', 'w') as f:
    json.dump(themes, f, indent=2)

print(f"Extracted {len(themes)} themes to only-themes.json")
