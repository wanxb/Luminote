type ImageVariantOptions = {
  maxWidth?: number;
  watermarkText?: string;
  includeWatermark?: boolean;
  watermarkPosition?:
    | "top-left"
    | "top"
    | "top-right"
    | "left"
    | "center"
    | "right"
    | "bottom-left"
    | "bottom"
    | "bottom-right";
};

export async function createDisplayVariant(
  file: File,
  {
    maxWidth = 1800,
    watermarkText,
    includeWatermark = false,
    watermarkPosition = "bottom-right",
  }: ImageVariantOptions = {}
): Promise<File> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(imageUrl);
    const scale = Math.min(1, maxWidth / image.width);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("2D canvas context is unavailable.");
    }

    context.drawImage(image, 0, 0, width, height);

    if (includeWatermark && watermarkText) {
      drawWatermark(context, width, height, watermarkText, watermarkPosition);
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (nextBlob) => {
          if (nextBlob) {
            resolve(nextBlob);
            return;
          }

          reject(new Error("Failed to create display blob."));
        },
        "image/jpeg",
        0.9
      );
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "display";
    const suffix = includeWatermark ? "-watermarked" : "-display";

    return new File([blob], `${baseName}${suffix}.jpg`, {
      type: "image/jpeg"
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function drawWatermark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  watermarkText: string,
  watermarkPosition: NonNullable<ImageVariantOptions["watermarkPosition"]>
) {
  const fontSize = Math.max(18, Math.round(width * 0.026));
  const paddingX = Math.max(20, Math.round(width * 0.032));
  const paddingY = Math.max(18, Math.round(height * 0.04));
  const centerX = width / 2;
  const centerY = height / 2;

  const positionMap = {
    "top-left": { x: paddingX, y: paddingY, textAlign: "left", textBaseline: "top" },
    top: { x: centerX, y: paddingY, textAlign: "center", textBaseline: "top" },
    "top-right": { x: width - paddingX, y: paddingY, textAlign: "right", textBaseline: "top" },
    left: { x: paddingX, y: centerY, textAlign: "left", textBaseline: "middle" },
    center: { x: centerX, y: centerY, textAlign: "center", textBaseline: "middle" },
    right: { x: width - paddingX, y: centerY, textAlign: "right", textBaseline: "middle" },
    "bottom-left": { x: paddingX, y: height - paddingY, textAlign: "left", textBaseline: "bottom" },
    bottom: { x: centerX, y: height - paddingY, textAlign: "center", textBaseline: "bottom" },
    "bottom-right": { x: width - paddingX, y: height - paddingY, textAlign: "right", textBaseline: "bottom" },
  } as const;

  const { x, y, textAlign, textBaseline } = positionMap[watermarkPosition];

  context.save();
  context.font = `600 ${fontSize}px Georgia, serif`;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;
  context.shadowColor = "rgba(0, 0, 0, 0.35)";
  context.shadowBlur = 18;
  context.lineWidth = Math.max(1.5, fontSize * 0.06);
  context.strokeStyle = "rgba(0, 0, 0, 0.22)";
  context.fillStyle = "rgba(255, 255, 255, 0.58)";
  context.strokeText(watermarkText, x, y);
  context.fillText(watermarkText, x, y);
  context.restore();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = src;
  });
}
