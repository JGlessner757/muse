import matplotlib.pyplot as plt

# Define the layers and components
layers = {
    "Frontend": ["React", "Bootstrap"],
    "Backend": ["Node.js", "Express"],
    "AI/ML": ["OpenAI API", "AWS Rekognition"],
    "Deployment": ["AWS Amplify", "AWS API Gateway", "AWS Lambda"]
}

# Define positions for each component
positions = {
    "React": (1, 4), "Bootstrap": (3, 4),
    "Node.js": (1, 3), "Express": (3, 3),
    "AWS API Gateway": (2, 2), "AWS Lambda": (2, 1),
    "AWS Rekognition": (1, 0), "OpenAI API": (3, 0),
    "AWS Amplify": (0, 4)
}

# Define connections (edges) between components
edges = [
    ("React", "AWS API Gateway"), 
    ("Bootstrap", "React"),
    ("Node.js", "Express"), 
    ("Express", "AWS API Gateway"),
    ("AWS API Gateway", "OpenAI API"), 
    ("AWS API Gateway", "AWS Lambda"),
    ("AWS Lambda", "AWS Rekognition"), 
    ("AWS Lambda", "OpenAI API"),
    ("AWS Amplify", "React"), 
    ("AWS Amplify", "AWS API Gateway")
]

# Set up the plot
plt.figure(figsize=(10, 8))
ax = plt.gca()
ax.set_xlim(-1, 4)
ax.set_ylim(-1, 5)

# Colors for each layer
layer_colors = {
    "Frontend": "#1f77b4",
    "Backend": "#ff7f0e",
    "AI/ML": "#2ca02c",
    "Deployment": "#d62728"
}

# Draw nodes (components)
for layer, components in layers.items():
    for component in components:
        x, y = positions[component]
        plt.scatter(x, y, s=1000, color=layer_colors[layer], edgecolors="k", zorder=2)
        plt.text(x, y, component, ha="center", va="center", fontsize=10, color="white", fontweight="bold")

# Draw edges (connections)
for start, end in edges:
    start_pos = positions[start]
    end_pos = positions[end]
    plt.plot([start_pos[0], end_pos[0]], [start_pos[1], end_pos[1]], "gray", linestyle="--", linewidth=1.5, zorder=1)

# Add a legend
for layer, color in layer_colors.items():
    plt.scatter([], [], color=color, label=layer, s=100)
plt.legend(loc="upper left", title="Tech Stack Layers", fontsize="medium")

# Set title and remove axes
plt.title("Tech Stack Diagram for AI-Powered Song Generator App")
plt.axis("off")
plt.show()
