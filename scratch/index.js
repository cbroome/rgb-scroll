const MAX_OFFSET = 25;

document.addEventListener("DOMContentLoaded", () => {
  let images = document.querySelector("img");

  if (!Array.isArray(images)) {
    images = [images];
  }

  for (const image of images) {
    new SplitImage(image);
  }
});

const channels = {
  red: "#F00",
  green: "#0F0",
  blue: "#00F",
};
class SplitImage {
  currentOffset = 0;
  image;
  canvas;
  RGB;
  currentInterval = 0;
  currentOperation;

  constructor(image) {
    this.image = image;
    this.RGB = this.separatedRGB(this.image);
    this.canvas = this.createCanvas(this.RGB.red.width, this.RGB.red.height);
    document.body.appendChild(this.canvas);

    this.layerImagesInCanvas(this.image, this.RGB, this.canvas, 0);

    this.canvas.addEventListener("mouseover", () => {
      const operation = "mouseover";
      if (this.currentOperation != operation) {
        clearInterval(this.currentInterval);
        this.currentOperation = operation;
      }
      this.currentInterval = setInterval(() => {
        if (this.currentOffset > MAX_OFFSET) {
          clearInterval(this.currentInterval);
        }
        this.layerImagesInCanvas(
          this.image,
          this.RGB,
          this.canvas,
          this.currentOffset++
        );
      }, 50);
    });

    this.canvas.addEventListener("mouseout", () => {
      const operation = "mouseout";
      if (this.currentOperation != operation) {
        clearInterval(this.currentInterval);
        this.currentOperation = operation;
      }
      this.currentInterval = setInterval(() => {
        if (this.currentOffset <= 0) {
          clearInterval(this.currentInterval);
        }
        this.layerImagesInCanvas(
          this.image,
          this.RGB,
          this.canvas,
          this.currentOffset--
        );
      }, 50);
    });
  }

  createCanvas(w, h) {
    const can = document.createElement("canvas");
    can.width = w;
    can.height = h;
    can.ctx = can.getContext("2d");
    return can;
  }

  copyToCanvas(image) {
    const can = document.createElement("canvas");
    can.width = image.naturalWidth || image.width;
    can.height = image.naturalHeight || image.height;

    can.ctx = can.getContext("2d");
    can.ctx.drawImage(image, 0, 0);
    return can;
  }

  getChannel(channelName, image) {
    const copy = this.copyToCanvas(image);
    const ctx = copy.ctx;
    ctx.fillStyle = channels[channelName];
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    return copy;
  }

  separatedRGB(image) {
    return {
      red: this.getChannel("red", image),
      green: this.getChannel("green", image),
      blue: this.getChannel("blue", image),
    };
  }

  layerImagesInCanvas(image, RGB, canvas, offset) {
    const ctx = canvas.ctx;
    const scale = 1 + offset / (MAX_OFFSET * 10);

    // scale up the dimensions slightly to hide any jagged edges
    const height = canvas.height * scale * 1.01;
    const width = canvas.width * scale * 1.01;
    const halfset = Math.ceil(offset / 10);

    ctx.clearRect(0, 0, canvas.height, canvas.width);

    ctx.drawImage(RGB.red, -halfset, -halfset, width - offset, height);
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(RGB.green, -halfset, -halfset, width, height - offset);
    ctx.drawImage(
      RGB.blue,
      -halfset,
      -halfset,
      width - offset,
      height - offset
    );
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, -halfset, -halfset, width, height);
    ctx.globalCompositeOperation = "source-over";
  }
}
