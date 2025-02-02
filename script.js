// script.js: Bubble Text Generator Main Logic

// Global variables to hold the loaded font and the current text item
let loadedFont = null;
let textItem = null;

// Font file path – using a preset bubble font
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
    console.error('Font failed to load: ' + err);
  } else {
    loadedFont = font;
    renderText();
  }
});

// Function to render the text as vector paths into Paper.js
function renderText() {
  if (!loadedFont) {
    return;
  }
  
  // Clear the current Paper.js project (both text and background)
  paper.project.clear();
  
  // Create a background rectangle covering the entire view so that exports include background color
  const bgColor = bgColorInput.value || "#e0f7fa";
  const backgroundRect = new paper.Path.Rectangle({
    point: [0, 0],
    size: paper.view.size,
    fillColor: new paper.Color(bgColor)
  });
  backgroundRect.sendToBack();
  
  // Get user input text and font size
  const word = wordInput.value.trim() || 'Bubble Text';
  const fontSize = parseInt(fontSizeInput.value, 10);

  // Use opentype.js to obtain the path (origin at 0,0; adjustment for centering follows)
  const path = loadedFont.getPath(word, 0, 0, fontSize);
  const pathData = path.toPathData();

  // Build an SVG string and import it into Paper.js
  const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + pathData + '"/></svg>';
  textItem = paper.project.importSVG(svgString);

  // Center the generated text
  let bounds = textItem.bounds;
  let offset = paper.view.center.subtract(bounds.center);
  textItem.position = textItem.position.add(offset);

  // Set the fill color to the user-selected text color (without any gradient/stroke)
  const selectedTextColor = textColorInput.value || "#213B45";
  if (textItem.children && textItem.children.length > 0) {
    textItem.children.forEach(child => {
      child.flatten(1);
      child.smooth();
      child.fillColor = new paper.Color(selectedTextColor);
    });
  } else {
    if (textItem.flatten) {
      textItem.flatten(1);
      textItem.smooth();
    }
    textItem.fillColor = new paper.Color(selectedTextColor);
  }

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
textColorInput.addEventListener('input', function() {
  const selectedTextColor = this.value || "#213B45";
  if (textItem) {
    if (textItem.children && textItem.children.length > 0) {
      textItem.children.forEach(child => {
        child.fillColor = new paper.Color(selectedTextColor);
      });
    } else {
      textItem.fillColor = new paper.Color(selectedTextColor);
    }
    paper.view.draw();
  }
});

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