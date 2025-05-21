class SpriteFrameAnimation {
  constructor(options) {
    this.reset(options);
    this.setup();
  }
  reset(options) {
    const {
      name,
      element,
      width,
      height,
      orient = 'left-right',
      count,
      delay,
      duration = '1000ms',
      spriteWidth,
      spriteHeight,
      frameCount,
      currentKey,
      totalKeyNum,
      autoplay,
      img,
      frameRate = 30,
    } = options;
    this.name = name; //动画名称
    this.width = width; //帧动画每帧的宽度
    this.height = height; //帧动画每帧的高度
    this.img = img; //一个动画的完整序列帧
    this.orient = orient; //关键帧图片的排列方式
    this.count = count; //动画循环次数
    this.delay = delay; //动画延时多久开始
    this.duration = duration; //动画延时多久开始
    this.currentKey = currentKey; //动画延时多久开始
    this.totalKeyNum = totalKeyNum; //动画延时多久开始
    this.autoplay = autoplay; //动画延时多久开始
    this.spriteArray = []; //动画延时多久开始
    this.image = null;
    this.delayFunc = [];
    this.paramMd5 = [];
    this.interval = 0;
    // durationDefault: "1000ms", //一个关键帧的动画的持续时间
    this.element = element;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.frameCount = frameCount;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.interval = null;
  }
  async setup() {
    const imageInstce = await getImgData(this.img);
    console.log('imageInstce', imageInstce);
  }

  updateFrame() {
    const backgroundPositionY = -this.currentFrame * this.spriteHeight;
    this.element.style.backgroundPosition = `0px ${backgroundPositionY}px`;
  }

  play() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.updateFrame();
    }, 1000 / this.frameRate);
  }

  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }

  destroy() {
    this.stop();
    this.element = null;
  }
}
// 获取图片数据
function getImgData(url, isNeedCross) {
  return new Promise((resolve) => {
    let image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = function () {
      resolve(null);
    };
    if (isNeedCross) {
      image.crossOrigin = 'anonymous';
    }
    image.src = `${url}?${Date.now()}`;
  });
}

export default SpriteFrameAnimation;
