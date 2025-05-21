const SPRITE_FRAME_ANIMATION_VERSION = '1.0.0';
const SPRITE_FRAME_ANIMATION_NAME = 'SPRITE_FRAME_ANIMATION_NAME';

class SpriteFrameAnimation {
  constructor(options) {
    this.version = SPRITE_FRAME_ANIMATION_VERSION;
    this.initParam();
    this.reset(options);
  }
  initParam() {
    this.name = ''; //动画名称
    this.width = 0; //帧动画每帧的宽度
    this.height = 0; //帧动画每帧的高度
    this.img = 0; //一个动画的完整序列帧url
    this.orient = 'left-right'; //关键帧图片的排列方式
    this.count = 0; //动画循环次数
    this.delay = 0; //动画延时多久开始
    this.duration = '1000ms'; //动画持续时间
    this.autoplay = true;
    this.currentKey = 0; //开始索引帧
    this.totalKeyNum = 0; //总帧数据
    this.paramMd5 = [];
    this.delayFunc = [];
    this.spriteArray = [];
    this.interval = 0;
    this.isAnimating = false;
    this.isLoadingImage = true;
    this.image = null; // 图片实例
  }
  reset(options) {
    // this.emitEnd();
    // this.resetAnimation();
    //ani上的属性，全部赋值一遍

    for (let attr in options) {
      this[attr] = options[attr];
    }
    const key = SPRITE_FRAME_ANIMATION_NAME + this.name;
    this.key = key;
    const oldInstace = window[key];
    if (this.name && !oldInstace) {
      window[this.key] = this;
    } else {
      return console.warn('动画名称已存在', oldInstace);
    }
    if (!this.canvasRef) {
      const { container } = options;
      this.canvasRef = document.createElement('canvas');
      this.canvasRef.width = this.width;
      this.canvasRef.height = this.height;
      this.canvasRef.style.width = '100%';
      this.canvasRef.style.height = '100%';
      container.appendChild(this.canvasRef);
    }
    this.clearFrame();
    this.init(options);
  }
  async init(options) {
    let optionsString = '';
    for (let attr in options) {
      optionsString += `${attr}:${options[attr]}`;
    }
    this.paramMd5 = optionsString;
    const randomNum = Math.random();
    if (!this.img) {
      return false;
    }
    const imageInstce = await getImgData(this.img);
    const curMd5 = getOptionsMd5(options, randomNum);
    // console.log('this.paramMd5', this.paramMd5, curMd5);
    console.log('this.paramMd5', this.paramMd5 === curMd5);
    if (curMd5 !== this.paramMd5) {
      return false;
    }
    if (!imageInstce) {
      console.error(`${this.img} load failed`);
      return false;
    }
    this.image = imageInstce;
    //持续时间
    if (typeof this.duration === 'string') {
      let duration = this.duration.match(/^([\d|.]+)ms|([\d|.]+)s$/i);
      duration = duration[1] || duration[2] * 1000;
      this.duration = duration;
    }
    //每帧的坐标信息
    for (let idx = 0; idx < this.totalKeyNum; ++idx) {
      if (this.orient === 'left-right') {
        this.spriteArray.push({ x: idx * this.width, y: 0 });
      } else {
        this.spriteArray.push({ x: 0, y: idx * this.height });
      }
    }
    this.showCover();
    if (this.autoplay) {
      this.start();
    } else {
      this.delayFunc.forEach((fn) => {
        fn();
      });
    }
  }
  start() {
    if (!this.image) {
      this.delayFunc.push(this.start);
      return;
    }
    const ctx = this.canvasRef.getContext('2d');
    let aniTimes = 0;
    //开始动画吧
    if (this.isAnimating) {
      console.log('已启动');
      return; // 防止重复启动
    }
    this.isAnimating = true;
    this[this.key] = setTimeout(() => {
      console.log('执行几次');
      drawImg(this, ctx);
    }, this.delay);
    function drawImg(self, ctx) {
      let end = false;
      ctx.clearRect(0, 0, self.width, self.height);
      ctx.drawImage(
        self.image,
        self.spriteArray[self.currentKey].x,
        self.spriteArray[self.currentKey].y,
        self.width,
        self.height,
        0,
        0,
        self.width,
        self.height,
      );
      if (self.currentKey !== self.totalKeyNum - 1) {
        //到了最后一帧
        self.currentKey++;
      } else {
        self.currentKey = 2;
        aniTimes++;
        if (self.count && aniTimes >= self.count) {
          //动画结束
          // emitEnd();
          return;
        }
      }
      self[self.key] = setTimeout(
        () => {
          drawImg(self, ctx);
        },
        end && self.interval
          ? self.interval * 1000
          : self.duration / self.totalKeyNum,
      );
    }
  }
  showCover() {
    const canvas = this.canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    //先画封面
    ctx.drawImage(
      this.image,
      0,
      0,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height,
    );
  }

  stop() {
    this.clearFrame();
  }
  clearFrame() {
    console.log('clearFrame');
    this.isAnimating = false;
    clearTimeout(this[this.key]);
  }
  destroy() {
    this.stop();
    this.canvasRef.remove();
    window[this.key] = null;
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
function getOptionsMd5(options, random) {
  let optionsString = '';
  for (let attr in options) {
    optionsString += `${attr}:${options[attr]}`;
  }
  console.log('random', random);
  return optionsString;
}
export default SpriteFrameAnimation;
