// script.js: Bubble Text Generator Main Logic

// Global variables
let loadedFont = null;
let text = null;
const fontPath = 'assets/fonts/BubbleBobble-rg3rx.ttf';

// Initialize Paper.js on the canvas with ID "myCanvas"
paper.setup('myCanvas');

// Get DOM elements
const wordInput = document.getElementById('wordInput');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const bgColorInput = document.getElementById('bgColor');
const textColorInput = document.getElementById('textColor');
const canvasEl = document.getElementById('myCanvas');

// Load the font using opentype.js
opentype.load(fontPath, function(err, font) {
    if (err) {
        console.error('Font failed to load:', err);
    } else {
        loadedFont = font;
        renderText();
    }
});

// Function to render the text as vector paths into Paper.js
function renderText() {
    if (!loadedFont) return;

    // Clear the current Paper.js project
    paper.project.activeLayer.removeChildren();

    // Get user input and settings
    const word = document.getElementById('wordInput').value.trim() || 'Bubble Text';
    const fontSize = parseInt(document.getElementById('fontSize').value);
    const textColor = document.getElementById('textColor').value;

    // Calculate maximum width for text wrapping
    const maxLineWidth = paper.view.viewSize.width * 0.8;

    // Split text into words and create lines
    const words = word.split(' ');
    let lines = [];
    let currentLine = '';
    let currentLineWidth = 0;

    words.forEach(word => {
        const wordPath = loadedFont.getPath(word + ' ', 0, 0, fontSize);
        const wordWidth = wordPath.getBoundingBox().x2 - wordPath.getBoundingBox().x1;

        if (currentLineWidth + wordWidth > maxLineWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
            currentLineWidth = wordWidth;
        } else {
            currentLine += word + ' ';
            currentLineWidth += wordWidth;
        }
    });
    if (currentLine) {
        lines.push(currentLine.trim());
    }

    // Create text group
    text = new paper.Group();

    // Render each line
    lines.forEach((line, index) => {
        const path = loadedFont.getPath(line, 0, 0, fontSize);
        const pathData = path.toPathData();
        
        // Create SVG path
        const svgString = '<svg><path d="' + pathData + '"/></svg>';
        const textPath = paper.project.importSVG(svgString);

        // Center the line
        const bounds = textPath.bounds;
        textPath.position = new paper.Point(
            paper.view.center.x,
            paper.view.center.y + (index - lines.length/2) * fontSize * 1.2
        );

        // Apply color
        textPath.fillColor = textColor;
        text.addChild(textPath);
    });

    paper.view.draw();
}

// Bind controls for real-time updates
wordInput.addEventListener('input', renderText);
fontSizeInput.addEventListener('input', function() {
  fontSizeValue.textContent = this.value + 'px';
  renderText();
});

// Update background color (both canvas element style and Paper.js project)
bgColorInput.addEventListener('input', function() {
  canvasEl.style.backgroundColor = this.value;
  paper.view.element.style.backgroundColor = this.value;
  renderText();
});

// Update text color in the rendered text
textColorInput.addEventListener('input', renderText);

// Download button: export as PNG
document.getElementById('downloadPNG').addEventListener('click', function() {
  const dataURL = canvasEl.toDataURL("image/png");
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = "bubble_text.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Download button: export as JPG
document.getElementById('downloadJPG').addEventListener('click', function() {
  const dataURL = canvasEl.toDataURL("image/jpeg");
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = "bubble_text.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Download button: export as SVG
document.getElementById('downloadSVG').addEventListener('click', function() {
  const svgContent = paper.project.exportSVG({ asString: true });
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "bubble_text.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// When window is resized, re-render to keep content centered
paper.view.onResize = function() {
  renderText();
};

window.onload = function() {
    paper.setup('myCanvas');

    // Initial background color
    paper.view.element.style.backgroundColor = document.getElementById('bgColor').value;
}; 