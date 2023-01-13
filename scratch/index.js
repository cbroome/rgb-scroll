const MAX_OFFSET = 15;

function copyToCanvas(image) {
  const can = document.createElement("canvas");
  can.width = image.naturalWidth || image.width;
  can.height = image.naturalHeight || image.height;

  can.ctx = can.getContext("2d");
  can.ctx.drawImage(image, 0, 0);
  return can;
}

const channels = {
  red: "#F00",
  green: "#0F0",
  blue: "#00F",
};

function getChannel(channelName, image) {
  const copy = copyToCanvas(image);
  const ctx = copy.ctx;
  ctx.fillStyle = channels[channelName];
  ctx.globalCompositeOperation = "multiply";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  return copy;
}

function separatedRGB(image) {
  return {
    red: getChannel("red", image),
    green: getChannel("green", image),
    blue: getChannel("blue", image),
  };
}

function createCanvas(w, h) {
  const can = document.createElement("canvas");
  can.width = w;
  can.height = h;
  can.ctx = can.getContext("2d");
  return can;
}

function layerImagesInCanvas(image, RGB, canvas, offset) {
  const ctx = canvas.ctx;

  ctx.clearRect(0, 0, canvas.height, canvas.width);
  ctx.drawImage(RGB.red, -offset, -offset);
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(RGB.green, offset, offset);
  ctx.drawImage(RGB.blue, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

document.addEventListener("DOMContentLoaded", () => {
  let images = document.querySelector("img");

  if (!Array.isArray(images)) {
    images = [images];
  }

  for (const image of images) {
    const RGB = separatedRGB(image);
    const canvas = createCanvas(RGB.red.width, RGB.red.height);
    document.body.appendChild(canvas);

    layerImagesInCanvas(image, RGB, canvas, 0);

    canvas.addEventListener("mouseover", (event) => {
      layerImagesInCanvas(image, RGB, canvas, 20);
      let offset = 0;
      const interval = setInterval(() => {
        if (offset > MAX_OFFSET) {
          clearInterval(interval);
        }
        layerImagesInCanvas(image, RGB, canvas, offset++);
      }, 100);
    });

    canvas.addEventListener("mouseout", (event) => {
      layerImagesInCanvas(image, RGB, canvas, 0);
    });
  }
});
