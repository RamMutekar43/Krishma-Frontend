import os

project_dir = "./"  # set to your project root

# Folders to skip
skip_dirs = ["node_modules", ".git"]

for root, dirs, files in os.walk(project_dir):
    # Skip unwanted directories
    dirs[:] = [d for d in dirs if d not in skip_dirs]

    for file in files:
        old = os.path.join(root, file)

        if file.endswith(".tsx"):
            new = os.path.join(root, file.replace(".tsx", ".jsx"))
            if not os.path.exists(new):
                os.rename(old, new)

        elif file.endswith(".ts") and not file.endswith(".d.ts"):
            new = os.path.join(root, file.replace(".ts", ".js"))
            if not os.path.exists(new):
                os.rename(old, new)

# Remove TypeScript configs
for fname in ["tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "src/vite-env.d.ts"]:
    path = os.path.join(project_dir, fname)
    if os.path.exists(path):
        os.remove(path)

print("✅ Conversion complete! Now zip the folder manually.")
