class SpriteFrameAnimation {
  constructor(options) {
    this.reset(options);
    this.setup(options);
  }
  reset(options) {
    // this.emitEnd();
    // this.resetAnimation();
    //ani上的属性，全部赋值一遍
    const {
      container,
      name,
      width,
      height,
      orient = 'left-right',
      count = 0,
      delay,
      duration = '1000ms',
      frameCount,
      currentKey = 0,
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
    this.frameCount = frameCount;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.interval = null;
    this.canvasRef = document.createElement('canvas');
    this.canvasRef.width = this.width;
    this.canvasRef.height = this.height;
    this.canvasRef.style.width = '100%';
    this.canvasRef.style.height = '100%';
    this.isAnimating = false;
    this.isLoadingImage = true;
    container.appendChild(this.canvasRef);
  }
  async setup(options) {
    let optionsString = '';
    for (let attr in options) {
      this[attr] = options[attr];
      optionsString += `${attr}:${options[attr]}`;
    }
    const randomNum = Math.random();
    this.paramMd5 = optionsString;
    if (!this.img) {
      return false;
    }
    const imageInstce = await getImgData(this.img);
    const curMd5 = getOptionsMd5(options, randomNum);
    if (curMd5 !== this.paramMd5) {
      return false;
    }
    if (!imageInstce) {
      console.error(`${this.img} load failed`);
      return false;
    }
    this.image = imageInstce;
    //持续时间
    let duration = this.durationDefault.match(/^([\d|.]+)ms|([\d|.]+)s$/i);
    duration = duration[1] || duration[2] * 1000;
    this.duration = duration;
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
    console.log('imageInstce', imageInstce);
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
    setTimeout(() => {
      console.log('执行几次');
      drawImg(this, ctx);
    }, this.delay);
    function drawImg(self, ctx) {
      console.log('self', self.currentKey);
      console.log('self', self.spriteArray);

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
        if (self.interval) {
          // showCover()
        }
        if (self.count && aniTimes >= self.count) {
          //动画结束
          // emitEnd();
          return;
        }
      }
      window.initDrawImg = setTimeout(
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
function getOptionsMd5(options, random) {
  let optionsString = '';
  for (let attr in options) {
    optionsString += `${attr}:${options[attr]}`;
  }
  console.log('random', random);
  return optionsString;
}
export default SpriteFrameAnimation;
