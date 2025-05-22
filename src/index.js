const SPRITE_FRAME_ANIMATION_VERSION = '1.0.0';
const SPRITE_FRAME_ANIMATION_NAME = '_SPRITE_FRAME_ANIMATION_NAME_';

class SpriteFrameAnimation {
  constructor(options) {
    this.version = SPRITE_FRAME_ANIMATION_VERSION;
    this.initParam();
    this.reset(options);
    this.init(options);
    this.validateName();
  }
  validateName() {
    const key = SPRITE_FRAME_ANIMATION_NAME + this.name;
    this.key = key;
    const oldInstace = window[key];
    if (this.name && !oldInstace) {
      window[this.key] = this;
    } else {
      console.warn('The animation name already exists', oldInstace);
    }
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
    this.paramMd5 = '';
    this.delayFunc = [];
    this.spriteArray = [];
    this.interval = 0; //动画执行间隔时间
    this.isAnimating = false;
    this.isLoadingImage = true;
    this.image = null; // 图片实例
    this.fImage = null; // 首次渲染图片实例
    this.eventMap = new Map();
  }
  reset(options) {
    const isReload = options.img && this.img && options.img !== this.img;
    //ani上的属性，全部赋值一遍
    for (let attr in options) {
      this[attr] = options[attr];
    }
    if (isReload) {
      console.log('Reload animation resources', options.img);
      this.init(options);
    }
  }
  async initElement(options) {
    if (!this.canvasRef) {
      const { container } = options;
      if (options.firstImg && !this.image) {
        const fImg = document.createElement('img');
        fImg.style.width = '100%';
        fImg.style.height = '100%';
        fImg.src = options.firstImg;
        container.appendChild(fImg);
        this.fImage = fImg;
      }
      this.canvasRef = document.createElement('canvas');
      this.canvasRef.width = this.width;
      this.canvasRef.height = this.height;
      this.canvasRef.style.width = '100%';
      this.canvasRef.style.height = '100%';
      container.appendChild(this.canvasRef);
    }
  }
  async getCurrentImage() {
    if (this.image && this.image.src === this.img) {
      return this.image;
    }
    return this.image || (await getImgData(this.img));
  }
  async init(options) {
    this.initElement(options);
    this.clearFrame();
    if (!this.img) {
      return false;
    }
    let imageInstce;
    imageInstce = await this.getCurrentImage();
    if (!imageInstce) {
      console.error(`${this.img} load failed`);
      return false;
    }
    this.isLoadingImage = false;
    this.image = imageInstce;
    //持续时间
    if (typeof this.duration === 'string') {
      let duration = this.duration.match(/^([\d|.]+)ms|([\d|.]+)s$/i);
      duration = duration[1] || duration[2] * 1000;
      this.duration = +duration;
    }
    //持续时间
    if (typeof this.interval === 'string') {
      let interval = this.interval.match(/^([\d|.]+)ms|([\d|.]+)s$/i);
      interval = interval[1] || interval[2] * 1000;
      this.interval = +interval;
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
        fn.call(this);
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
      return; // 防止重复启动
    }
    this.isAnimating = true;
    this[this.key] = setTimeout(() => {
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
        end = true;
        if (self.count && aniTimes >= self.count) {
          //动画结束
          self.emitEnd();
          return;
        }
      }
      self[self.key] = setTimeout(
        () => {
          drawImg(self, ctx);
        },
        end && self.interval ? self.interval : self.duration / self.totalKeyNum,
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
    // 显示完封面，删除
    if (this.fImage) {
      this.fImage.remove();
    }
  }
  stop() {
    this.clearFrame();
  }
  clearFrame() {
    console.log('clearFrame');
    this.isLoadingImage = true;
    this.isAnimating = false;
    clearTimeout(this[this.key]);
  }
  destroy() {
    this.stop();
    this.canvasRef.remove();
    if (this.fImage) {
      this.fImage.remove();
    }
    window[this.key] = null;
  }
  /**
   * 简单实现事件监听
   * @param {*} type
   * @param {*} fn
   */
  on(type, fn) {
    const oldEvents = this.eventMap.get(type);
    if (oldEvents) {
      oldEvents.push(fn);
    } else {
      const events = [fn];
      this.eventMap.set(type, events);
    }
  }
  emitEnd() {
    this.eventMap.get('end') && this.eventMap.get('end').forEach((fn) => fn());
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
// function getOptionsMd5(options, random) {
//   let optionsString = '';
//   for (let attr in options) {
//     optionsString += `${attr}:${options[attr]}`;
//   }
//   return optionsString + random;
// }
export default SpriteFrameAnimation;
