// script.js: Bubble Text Generator Main Logic

// Global variables
let loadedFont = null;
let text = null;
const fontPath = 'assets/fonts/BubbleBobble-rg3rx.ttf';

// Initialize Paper.js
paper.install(window);

// Load the font using opentype.js
opentype.load(fontPath, function(err, font) {
    if (err) {
        console.error('Font failed to load:', err);
    } else {
        loadedFont = font;
        // 字体加载完成后初始化
        initializeApp();
    }
});

// 将所有初始化逻辑移到这个函数中
function initializeApp() {
    paper.setup('myCanvas');
    
    // 立即进行第一次渲染
    renderText();

    // 添加所有事件监听器
    document.getElementById('wordInput').addEventListener('input', renderText);
    
    document.getElementById('fontSize').addEventListener('input', function(e) {
        document.getElementById('fontSizeValue').textContent = this.value + 'px';
        renderText();
    });

    document.getElementById('textColor').addEventListener('input', renderText);

    document.getElementById('bgColor').addEventListener('input', function(e) {
        paper.view.element.style.backgroundColor = e.target.value;
    });

    // 颜色预设功能
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bgColor = this.dataset.bg;
            const textColor = this.dataset.text;
            
            document.getElementById('bgColor').value = bgColor;
            document.getElementById('textColor').value = textColor;
            
            paper.view.element.style.backgroundColor = bgColor;
            if (text) {
                text.children.forEach(child => {
                    child.fillColor = textColor;
                });
            }
            
            renderText();
        });
    });

    // 设置初始背景色
    paper.view.element.style.backgroundColor = document.getElementById('bgColor').value;

    // 背景图片处理
    let backgroundImage = null;
    const bgImageInput = document.getElementById('bgImage');
    const removeBgImageBtn = document.getElementById('removeBgImage');

    bgImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // 创建图片对象
                const img = new Image();
                img.onload = function() {
                    // 移除旧的背景图片（如果存在）
                    if (backgroundImage) {
                        backgroundImage.remove();
                    }

                    // 创建新的背景图片
                    backgroundImage = new paper.Raster(img);
                    backgroundImage.position = paper.view.center;

                    // 调整图片大小以填充画布
                    const scale = Math.max(
                        paper.view.viewSize.width / img.width,
                        paper.view.viewSize.height / img.height
                    );
                    backgroundImage.scale(scale);

                    // 将背景图片移到最底层
                    backgroundImage.sendToBack();

                    // 显示移除按钮
                    removeBgImageBtn.style.display = 'block';

                    // 重新渲染文本以确保它在图片上方
                    renderText();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 移除背景图片
    removeBgImageBtn.addEventListener('click', function() {
        if (backgroundImage) {
            backgroundImage.remove();
            backgroundImage = null;
            bgImageInput.value = ''; // 清除文件输入
            removeBgImageBtn.style.display = 'none';
            // 恢复背景颜色
            paper.view.element.style.backgroundColor = document.getElementById('bgColor').value;
        }
    });

    // 修改renderText函数以保持背景图片
    const originalRenderText = renderText;
    renderText = function() {
        // 保存背景图片引用
        const tempBg = backgroundImage;
        // 执行原始渲染
        originalRenderText();
        // 如果有背景图片，确保它在最底层
        if (tempBg) {
            backgroundImage = tempBg;
            backgroundImage.sendToBack();
        }
    };
}

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

    // 添加颜色预设功能
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bgColor = this.dataset.bg;
            const textColor = this.dataset.text;
            
            // 更新颜色选择器的值
            document.getElementById('bgColor').value = bgColor;
            document.getElementById('textColor').value = textColor;
            
            // 应用颜色
            paper.view.element.style.backgroundColor = bgColor;
            if (text) {
                text.children.forEach(child => {
                    child.fillColor = textColor;
                });
            }
            
            // 重新渲染文本
            renderText();
        });
    });

}; 