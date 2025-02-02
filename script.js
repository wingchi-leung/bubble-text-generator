// script.js: 渲染 Bubble 字体效果的主逻辑

// 全局变量用于保存加载的字体和当前文本图形
let loadedFont = null;
let textItem = null;

// 设置字体文件路径，你需要将字体文件放在此路径下
const fontPath = 'assets/fonts/Roboto-Regular.ttf';

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
  
  const word = wordInput.value.trim() || 'Bubble';
  const fontSize = parseInt(fontSizeInput.value, 10);

  // 使用 opentype.js 获取文字的路径（x:0, y:0 为基线，后续调整居中显示）
  const path = loadedFont.getPath(word, 0, 0, fontSize);
  const pathData = path.toPathData();

  // 构建 SVG 字符串，并通过 Paper.js 导入路径
  const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><path d="' + pathData + '"/></svg>';

  // 清空 Paper.js 当前内容
  paper.project.clear();

  // 导入 SVG 得到一个图形对象
  textItem = paper.project.importSVG(svgString);
  
  // 如果导入后得到的是一个 Group，则合并为 CompoundPath 便于后续操作
  if (textItem.children && textItem.children.length > 0) {
    textItem = new paper.CompoundPath({
      children: textItem.children,
      fillColor: null,
      strokeColor: null
    });
  }
  
  // 将生成的文字图形居中于视图
  let bounds = textItem.bounds;
  let offset = paper.view.center.subtract(bounds.center);
  textItem.position = textItem.position.add(offset);

  // 对路径进行平滑处理，效果更圆润
  if (textItem.flatten) {
    textItem.flatten(1);
    textItem.smooth();
  } else if (textItem.children) {
    textItem.children.forEach(child => {
      child.flatten(1);
      child.smooth();
    });
  }

  // 获取用户选择的字体颜色，作为渐变填充的外侧颜色（内侧为白色，模拟反光效果）
  const selectedTextColor = textColorInput.value || "#a0d8ef";

  // 添加渐变填充，模拟气泡内反光效果
  textItem.fillColor = {
    gradient: {
      stops: ['white', selectedTextColor]
    },
    origin: textItem.bounds.topLeft,
    destination: textItem.bounds.bottomRight
  };

  // 添加描边效果，让文字边缘更清晰
  textItem.strokeColor = new paper.Color('#6495ED');
  textItem.strokeWidth = fontSize * 0.05;

  paper.view.draw();
}

// 为控件绑定事件，实现动态更新效果
wordInput.addEventListener('input', renderText);
fontSizeInput.addEventListener('input', function() {
  fontSizeValue.textContent = this.value + 'px';
  renderText();
});

// 当背景颜色发生变化时实时更新 canvas 背景
bgColorInput.addEventListener('input', function() {
  canvasEl.style.backgroundColor = this.value;
});

// 当字体颜色动态变化时，仅更新当前文本的填充颜色使之实时响应
textColorInput.addEventListener('input', function() {
  const selectedTextColor = this.value || "#a0d8ef";
  if (textItem) {
    textItem.fillColor = {
      gradient: {
        stops: ['white', selectedTextColor]
      },
      origin: textItem.bounds.topLeft,
      destination: textItem.bounds.bottomRight
    };
    paper.view.draw();
  }
});

// 当窗口尺寸变化时，重新渲染以保持居中显示
paper.view.onResize = function() {
  renderText();
}; 