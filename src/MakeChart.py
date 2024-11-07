import matplotlib.pyplot as plt

# Define the layers and components
layers = {
    "Frontend": ["React", "Bootstrap"],
    "Backend": ["Node.js", "Express"],
    "AI/ML": ["OpenAI", "AWS Rekog"],
    "Deployment": ["AWS Amplify", "AWS API", "AWS Lambda"]
}

# Define positions for each component in a left-to-right layout
positions = {
    "React": (1, 4), "Bootstrap": (1.7, 4),
    "Node.js": (1, 3), "Express": (1.7, 3),
    "AWS Amplify": (0.3, 3.2), "AWS Lambda": (1, 1.8), "AWS API": (1.7, 1.8),
    "AWS Rekog": (1, .7), "OpenAI": (1.7, .7)
}

# Define connections (edges) between components
edges = [
    ("React", "AWS Amplify"),
    ("React", "Node.js"),
    ("Bootstrap", "React"),
    ("Node.js", "Express"),
    ("AWS API", "AWS Lambda"),
    ("Node.js","AWS Lambda"),
    ("AWS Lambda", "AWS Rekog"),
    ("AWS API", "OpenAI")
]

# Set up the plot with a dark background
plt.figure(figsize=(12, 6), facecolor="#2D2D2D")
ax = plt.gca()
ax.set_facecolor("#2D2D2D")
ax.set_xlim(-1, 3)
ax.set_ylim(0, 5)

# Colors for each layer in a light theme for contrast
layer_colors = {
    "Frontend": "#3D0B83",
    "Backend": "#830B16",
    "AI/ML": "#52830B",
    "Deployment":"#0B8379"
}

# Draw nodes (components)
for layer, components in layers.items():
    for component in components:
        x, y = positions[component]
        plt.scatter(x, y, s=3600, color=layer_colors[layer], edgecolors="white", linewidth=1.5, zorder=2)
        plt.text(x, y, component, ha="center", va="center", fontsize=8, color="white", fontweight="bold")

# Draw edges (connections)
for start, end in edges:
    start_pos = positions[start]
    end_pos = positions[end]
    plt.plot([start_pos[0], end_pos[0]], [start_pos[1], end_pos[1]], color="white", linestyle="-", linewidth=1.2, alpha=0.7, zorder=1)

# Add "User" entry point on the left with an arrow
plt.text(-0.5, 4, "User", ha="center", va="center", fontsize=12, color="white", fontweight="bold")
plt.arrow(-0.2, 4, 0.6, 0, color="white", head_width=0.2, head_length=0.1, linewidth=1.5)

# Add a legend with customized colors
for layer, color in layer_colors.items():
    plt.scatter([], [], color=color, label=layer, s=100)
plt.legend(loc="upper right", title="Tech Stack Layers", fontsize="small", labelcolor="white", facecolor="#2D2D2D", edgecolor="white", title_fontsize="medium")

# Set title and remove axes
plt.title("Tech Stack Diagram for MUSE: The AI-Powered Songwriting App", color="white", fontsize=14, pad=20)
plt.axis("off")

# Save the figure as a PNG file
plt.savefig("tech_stack.png", format="png", dpi=300, bbox_inches="tight", facecolor="#2D2D2D")

# Display the plot
plt.show()
