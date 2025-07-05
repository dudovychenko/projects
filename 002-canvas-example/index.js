"use strict";

const canvas = document.getElementById("my-canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
let scrollOffset = 0;

const images = [];

// Create 12 images
for (let i = 0; i < 12; i++) {
  const imgObj = {
    id: `image${i + 1}`,
    img: new Image(),
    width: 200,
    height: 200,
    x: Math.random() * (CANVAS_WIDTH - 200),
    y: i * 220, // stacked vertically with some gap
    isHovered: false
  };
  imgObj.img.src = `https://placehold.co/200x200?text=Img+${i + 1}`;
  images.push(imgObj);
}

Promise.all(
  images.map(imgObj => {
    return new Promise((resolve) => {
      imgObj.img.onload = () => resolve();
    });
  })
).then(() => {
  draw();
});

function getVirtualHeight() {
  const ys = images.map(img => img.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys.map((y, i) => y + images[i].height));
  return maxY - minY + 100;
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const virtualHeight = getVirtualHeight();

  for (const imgObj of images) {
    for (let offsetY of [-virtualHeight, 0, virtualHeight]) {
      const drawY = imgObj.y - scrollOffset + offsetY;

      if (drawY + imgObj.height < 0 || drawY > CANVAS_HEIGHT) continue;

      ctx.drawImage(imgObj.img, imgObj.x, drawY, imgObj.width, imgObj.height);

      if (imgObj.isHovered && offsetY === 0) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
        ctx.fillRect(imgObj.x, drawY, imgObj.width, imgObj.height);
      }
    }
  }
}

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const virtualHeight = getVirtualHeight();

  scrollOffset += e.deltaY;
  scrollOffset = ((scrollOffset % virtualHeight) + virtualHeight) % virtualHeight;

  draw();
}, { passive: false });

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const virtualHeight = getVirtualHeight();

  for (const imgObj of images) {
    imgObj.isHovered = false;
  }

  for (const imgObj of images) {
    for (let offsetY of [-virtualHeight, 0, virtualHeight]) {
      const drawY = imgObj.y - scrollOffset + offsetY;

      if (
        mouseX >= imgObj.x &&
        mouseX <= imgObj.x + imgObj.width &&
        mouseY >= drawY &&
        mouseY <= drawY + imgObj.height
      ) {
        imgObj.isHovered = true;
        break;
      }
    }
  }

  draw();
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const virtualHeight = getVirtualHeight();

  for (const imgObj of images) {
    for (let offsetY of [-virtualHeight, 0, virtualHeight]) {
      const drawY = imgObj.y - scrollOffset + offsetY;

      if (
        mouseX >= imgObj.x &&
        mouseX <= imgObj.x + imgObj.width &&
        mouseY >= drawY &&
        mouseY <= drawY + imgObj.height
      ) {
        console.log("Clicked image ID:", imgObj.id);
      }
    }
  }
});
