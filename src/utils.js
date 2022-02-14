import { CLASS_NAMES, CLASS_COLORS, FONT } from "./constants";

export const prepareCanvas = id => {
  const canvas = document.getElementById(id);
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const ctx = canvas.getContext("2d");
  // Font options.
  ctx.font = FONT;
  ctx.textBaseline = "top";
  return { canvas, ctx };
};

export const cropToCanvas = (video, canvas, ctx) => {
  const naturalWidth = video.videoWidth;
  const naturalHeight = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ratio = Math.min(
    canvas.width / naturalWidth,
    canvas.height / naturalHeight
  );

  const newWidth = Math.round(naturalWidth * ratio);
  const newHeight = Math.round(naturalHeight * ratio);
  const newX = (canvas.width - newWidth) / 2;
  const newY = (canvas.height - newHeight) / 2;
  ctx.drawImage(video, newX, newY, newWidth, newHeight);
};

export const drawDetections = ({
  canvas,
  ctx,
  boxesData,
  scoresData,
  classesData,
  validCount,
}) => {
  let i;
  for (i = 0; i < validCount; ++i) {
    const score = scoresData[i].toFixed(2);
    if (score < 0.6) {
      continue;
    }
    let [x1, y1, x2, y2] = boxesData.slice(i * 4, (i + 1) * 4);
    x1 *= canvas.width;
    x2 *= canvas.width;
    y1 *= canvas.height;
    y2 *= canvas.height;
    const width = x2 - x1;
    const height = y2 - y1;
    const klass = CLASS_NAMES[classesData[i]];

    // Draw the bounding box.
    ctx.strokeStyle = CLASS_COLORS[classesData[i]];
    ctx.lineWidth = 4;
    ctx.strokeRect(x1, y1, width, height);

    // Draw the label background.
    ctx.fillStyle = CLASS_COLORS[classesData[i]];
    const textWidth = ctx.measureText(klass + ":" + score).width;
    const textHeight = parseInt(FONT, 10); // base 10
    ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);
  }
  for (i = 0; i < validCount; ++i) {
    const score = scoresData[i].toFixed(2);
    if (score < 0.6) {
      continue;
    }
    let [x1, y1, ,] = boxesData.slice(i * 4, (i + 1) * 4);
    x1 *= canvas.width;
    y1 *= canvas.height;
    const klass = CLASS_NAMES[classesData[i]];
    // Draw the text last to ensure it's on top.
    ctx.fillStyle = "#000000";
    ctx.fillText(klass + ":" + score, x1, y1);
  }
};
