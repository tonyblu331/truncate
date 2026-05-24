import { createCanvas } from "canvas";

class OffscreenCanvasPolyfill {
  canvas: ReturnType<typeof createCanvas>;

  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
  }

  getContext(type: string) {
    return this.canvas.getContext(type as "2d") as unknown as OffscreenCanvasRenderingContext2D;
  }

  convertToBlob() {
    return Promise.resolve(new Blob());
  }
  transferToImageBitmap() {
    throw new Error("not implemented");
  }
}

globalThis.OffscreenCanvas = OffscreenCanvasPolyfill as unknown as typeof OffscreenCanvas;
