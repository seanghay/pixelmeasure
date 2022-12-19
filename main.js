import 'normalize.css'
import './style.css'

let _image;
let _x = 0;
let _y = 0;

const $ = q => document.querySelector(q)

const $imageX = $('#image_x')
const $imageY = $('#image_y')

const $imageWidth = $('#image_width')
const $imageHeight = $('#image_height')

const $percentX = $('#percent_x')
const $percentY = $('#percent_y')

const $realtime = $("#realtime")

const canvasWrapper = $('#canvas-wrapper')
const canvas = createCanvasElement();

canvasWrapper.innerHTML = '';
canvasWrapper.append(canvas);

function windowSize() {
  const width = window.innerWidth
  const height = window.innerHeight

  return {
    width,
    height
  }
}


function onResize(el) {
  const { width, height } = windowSize();

  el.width = width * window.devicePixelRatio;
  el.height = height * window.devicePixelRatio;

  el.style.width = window.innerWidth + 'px';
  el.style.height = window.innerHeight + 'px';

  /**
   * @type {CanvasRenderingContext2D}
   */
  const ctx = el.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  if (_image) {
    const hRatio = width / _image.width;
    const vRatio = height / _image.height;
    const ratio = Math.min(hRatio, vRatio);

    ctx.drawImage(
      _image,
      0, 0,
      _image.width,
      _image.height,
      0, 0,
      _image.width * ratio,
      _image.height * ratio
    );

    const offsetX = clamp(_x / (ratio * _image.width), 0, 1);
    const offsetY = clamp(_y / (ratio * _image.height), 0, 1);

    const positionX = Math.round(offsetX * parseInt($imageWidth.value));
    const positionY = Math.round(offsetY * parseInt($imageHeight.value));

    $imageX.value = positionX;
    $imageY.value = positionY;
    
    

    $percentX.value = Math.round(offsetX * 100 * 1000) / 1000
    $percentY.value = Math.round(offsetY * 100 * 1000) / 1000
  }
}


function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);

}

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
}

function createCanvasElement() {
  const el = document.createElement('canvas');
  addEventListener('resize', () => onResize(el))
  onResize(el)
  return el
}

/**
 * 
 * @param {HTMLElement} el 
 */
function registerFileDrop(el) {

  el.addEventListener('dragover', e => {
    e.preventDefault()
  })

  el.addEventListener('drop', async e => {
    e.preventDefault();
    const files = fileHandler(e)
    if (files.length == 0) return;
    const file = files[0]
    if (!file.type.startsWith("image/")) {
      return;
    }

    _image = await createImageFromFile(file)
    console.log('image: ' + file.name, {
      width: _image.width,
      height: _image.height,
    })

    $imageWidth.value = _image.width;
    $imageHeight.value = _image.height;
    onResize(canvas)
  })
}

function fileHandler(ev) {
  if (ev.dataTransfer.items) {
    return [...ev.dataTransfer.items].map((item) => {
      if (item.kind === 'file') return item.getAsFile();
    }).filter(Boolean);
  } else {
    return [...ev.dataTransfer.files];
  }
}

async function createImageFromFile(file) {
  return new Promise(r => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    image.onload = () => r(image);
  })
}


function mouseHandler(e) {
  _x = e.x;
  _y = e.y;
  onResize(canvas)
}

addEventListener('mouseup', mouseHandler)

$realtime.addEventListener('change', (e) => {
  if (e.target.checked) {
    addEventListener('mousemove', mouseHandler)
    removeEventListener('mouseup', mouseHandler)
  } else {
    addEventListener('mouseup', mouseHandler)
    removeEventListener('mousemove', mouseHandler)
  }
})

registerFileDrop(window)