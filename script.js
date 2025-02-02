// script.js: 渲染 Bubble 字体效果的主逻辑

// 全局变量用于保存加载的字体和当前文本图形
let loadedFont = null;
let textItem = null;

// 设置字体文件路径，这里使用预置的泡泡字体
const fontPath = 'assets/fonts/BubbleBobble-rg3rx.ttf';

// 初始化 Paper.js，使用 id 为 myCanvas 的 canvas 元素
paper.setup('myCanvas');

// 获取控件 DOM 元素
const wordInput = document.getElementById('wordInput');
const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const bgColorInput = document.getElementById('bgColor');
const textColorInput = document.getElementById('textColor');
const canvasEl = document.getElementById('myCanvas');

// 使用 opentype.js 加载字体文件
opentype.load(fontPath, function(err, font) {
  if (err) {
    console.error('字体加载失败: ' + err);
  } else {
    loadedFont = font;
    renderText();
  }
});

// 渲染文字路径的函数，基于 opentype.js 获取文字轮廓数据，并导入到 Paper.js
function renderText() {
  if (!loadedFont) {
    return;
  }

  // 移除之前生成的文字图形
  if (textItem) {
    textItem.remove();
  }
  
  const word = wordInput.value.trim() || 'Bubble Text';
  const fontSize = parseInt(fontSizeInput.value, 10);

  // 使用 opentype.js 获取文字路径（基于 (0,0) 坐标，后续调整居中显示）
  const path = loadedFont.getPath(word, 0, 0, fontSize);
  const pathData = path.toPathData();

  // 构建 SVG 字符串，并通过 Paper.js 导入该路径
  const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + pathData + '"/></svg>';

  // 清空 Paper.js 当前内容
  paper.project.clear();

  // 导入 SVG 得到的图形对象，可以是 Group 或单个 Path
  textItem = paper.project.importSVG(svgString);

  // 将生成的文字图形居中于视图
  let bounds = textItem.bounds;
  let offset = paper.view.center.subtract(bounds.center);
  textItem.position = textItem.position.add(offset);

  // 获取用户选定的字体颜色，直接作为纯色填充（取消反光渐变效果）
  const selectedTextColor = textColorInput.value || "#213B45";

  if (textItem.children && textItem.children.length > 0) {
    textItem.children.forEach(child => {
      // 对路径进行基本处理，保持细节（如需要可保留 flatten 与 smooth）
      child.flatten(1);
      child.smooth();
      // 直接设置纯色填充
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

// 为控件绑定事件，实现实时更新效果
wordInput.addEventListener('input', renderText);
fontSizeInput.addEventListener('input', function() {
  fontSizeValue.textContent = this.value + 'px';
  renderText();
});

// 背景颜色实时更新：同时更新 canvas 原生元素及 Paper.js 使用的 canvas 背景色
bgColorInput.addEventListener('input', function() {
  canvasEl.style.backgroundColor = this.value;
  paper.view.element.style.backgroundColor = this.value;
});

// 字体颜色实时更新，仅修改已存在文本的填充颜色为纯色效果
textColorInput.addEventListener('input', function() {
  const selectedTextColor = this.value || "#509fbe";
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

// 当窗口尺寸发生变化时，重新渲染以保持图形居中显示
paper.view.onResize = function() {
  renderText();
}; 