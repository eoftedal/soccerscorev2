import { toCanvas } from "html-to-image";

export const saveBlob = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  return function (blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

export const sanitizeName = (str: string) =>
  str.replace(/\s+/g, "-").replace(/[^a-zæøåÆØÅA-Z0-9-_.]/g, "_");

type CaptureOptions = {
  width: number;
  height: number;
  canvasWidth?: number;
  canvasHeight?: number;
  pixelRatio?: number;
  cacheBust?: boolean;
};

type Box = { x: number; y: number; width: number; height: number };

/**
 * html-to-image renders the node as an <svg><foreignObject>, where every <img>
 * inside it is a subresource the browser loads asynchronously. The outer SVG
 * image can finish decoding before those subresources are painted, which is why
 * a logo now and then goes missing from the capture. Drawing the images onto
 * the finished canvas ourselves makes the result deterministic.
 */
export async function toPngWithImages(node: HTMLElement, options: CaptureOptions) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
  const canvas = await toCanvas(node, options);
  drawImages(canvas, node, options, images);
  return canvas.toDataURL();
}

function drawImages(
  canvas: HTMLCanvasElement,
  node: HTMLElement,
  options: CaptureOptions,
  images: HTMLImageElement[],
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  // The SVG is rendered at options.width x options.height and then stretched to
  // fill the canvas, so this is the scale from page pixels to canvas pixels.
  const scaleX = canvas.width / options.width;
  const scaleY = canvas.height / options.height;
  const nodeRect = node.getBoundingClientRect();
  for (const img of images) {
    if (!img.complete || img.naturalWidth === 0) continue;
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const box = fitImage(img, {
      x: (rect.left - nodeRect.left) * scaleX,
      y: (rect.top - nodeRect.top) * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
    });
    context.drawImage(img, box.x, box.y, box.width, box.height);
  }
}

/** Mirrors `object-fit: contain` with the default, centered object-position. */
function fitImage(img: HTMLImageElement, box: Box): Box {
  if (window.getComputedStyle(img).objectFit !== "contain") return box;
  const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}
