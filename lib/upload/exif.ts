import exifr from "exifr";

export type SerializedExifParams = Record<string, string>;

export type ExtractedExif = {
  takenAt?: string;
  device?: string;
  lens?: string;
  location?: string;
  exif: {
    fileSize?: string;
    mimeType?: string;
    width?: number;
    height?: number;
    dimensions?: string;
    orientation?: string;
    colorSpace?: string;
    aperture?: string;
    shutter?: string;
    iso?: number;
    focalLength?: string;
    focalLengthIn35mm?: string;
    exposureCompensation?: string;
    exposureProgram?: string;
    meteringMode?: string;
    whiteBalance?: string;
    flash?: string;
    exposureMode?: string;
    sceneCaptureType?: string;
    sensingMethod?: string;
    latitude?: number;
    longitude?: number;
    altitude?: string;
    histogram?: number[];
    params?: SerializedExifParams;
  };
};

type RawExif = Record<string, unknown> & {
  DateTimeOriginal?: Date;
  Make?: string;
  Model?: string;
  LensModel?: string;
  FocalLength?: number;
  FocalLengthIn35mmFormat?: number;
  FNumber?: number;
  ExposureTime?: number;
  ExposureBiasValue?: number;
  ISO?: number;
  ExifImageWidth?: number;
  ExifImageHeight?: number;
  ImageWidth?: number;
  ImageHeight?: number;
  Orientation?: number;
  ColorSpace?: number;
  ExposureProgram?: number;
  MeteringMode?: number;
  WhiteBalance?: number;
  Flash?: number;
  ExposureMode?: number;
  SceneCaptureType?: number;
  SensingMethod?: number;
  latitude?: number;
  longitude?: number;
  GPSAltitude?: number;
};

const MAX_PARAM_VALUE_LENGTH = 240;

function formatDevice(make?: string, model?: string) {
  return [make, model].filter(Boolean).join(" ").trim() || undefined;
}

function formatAperture(value?: number) {
  return value ? `f/${value}` : undefined;
}

function formatShutter(value?: number) {
  if (!value) {
    return undefined;
  }

  if (value >= 1) {
    return `${value}s`;
  }

  const reciprocal = Math.round(1 / value);
  return reciprocal > 0 ? `1/${reciprocal}s` : undefined;
}

function formatFocalLength(value?: number) {
  return value ? `${value}mm` : undefined;
}

function formatExposureCompensation(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  if (value === 0) {
    return "0 EV";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value)} EV`;
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) {
    return undefined;
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted =
    value >= 100 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(2);

  return `${formatted.replace(/\.00$/, "")} ${units[unitIndex]}`;
}

function formatDimensions(width?: number, height?: number) {
  if (!width || !height) {
    return undefined;
  }

  return `${width} × ${height}`;
}

function formatOrientation(value?: number) {
  const map: Record<number, string> = {
    1: "normal",
    2: "mirrored-horizontal",
    3: "rotated-180",
    4: "mirrored-vertical",
    5: "mirrored-horizontal-rotated-270",
    6: "rotated-90",
    7: "mirrored-horizontal-rotated-90",
    8: "rotated-270",
  };

  return value ? map[value] : undefined;
}

function formatColorSpace(value?: number) {
  const map: Record<number, string> = {
    1: "sRGB",
    2: "Adobe RGB",
    65535: "uncalibrated",
  };

  return value !== undefined ? map[value] ?? String(value) : undefined;
}

function formatExposureProgram(value?: number) {
  const map: Record<number, string> = {
    1: "manual",
    2: "program",
    3: "aperture-priority",
    4: "shutter-priority",
    5: "creative",
    6: "action",
    7: "portrait",
    8: "landscape",
  };

  return value ? map[value] : undefined;
}

function formatMeteringMode(value?: number) {
  const map: Record<number, string> = {
    1: "average",
    2: "center-weighted",
    3: "spot",
    4: "multi-spot",
    5: "multi-segment",
    6: "partial",
  };

  return value ? map[value] ?? String(value) : undefined;
}

function formatWhiteBalance(value?: number) {
  const map: Record<number, string> = {
    0: "auto",
    1: "manual",
  };

  return value !== undefined ? map[value] : undefined;
}

function formatFlash(value?: number) {
  if (value === undefined) {
    return undefined;
  }

  if ((value & 0x1) === 0) {
    return "not-fired";
  }

  return (value & 0x4) !== 0 ? "fired-return-detected" : "fired";
}

function formatExposureMode(value?: number) {
  const map: Record<number, string> = {
    0: "auto",
    1: "manual",
    2: "auto-bracket",
  };

  return value !== undefined ? map[value] : undefined;
}

function formatSceneCaptureType(value?: number) {
  const map: Record<number, string> = {
    0: "standard",
    1: "landscape",
    2: "portrait",
    3: "night-scene",
  };

  return value !== undefined ? map[value] : undefined;
}

function formatSensingMethod(value?: number) {
  const map: Record<number, string> = {
    1: "not-defined",
    2: "one-chip-color-area",
    3: "two-chip-color-area",
    4: "three-chip-color-area",
    5: "color-sequential-area",
    7: "trilinear",
    8: "color-sequential-linear",
  };

  return value ? map[value] ?? String(value) : undefined;
}

function formatAltitude(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${formatNumber(value)} m`
    : undefined;
}

function formatLocation(latitude?: number, longitude?: number) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return undefined;
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value
    .toFixed(5)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
}

function stringifyExifValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => stringifyExifValue(item))
      .filter((item): item is string => Boolean(item));

    return items.length > 0 ? items.join(", ") : undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? formatNumber(value) : undefined;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === "object") {
    try {
      const serialized = JSON.stringify(value, (_key, currentValue) => {
        if (currentValue instanceof Date) {
          return currentValue.toISOString();
        }

        if (typeof currentValue === "number") {
          return Number.isFinite(currentValue)
            ? Number(formatNumber(currentValue))
            : null;
        }

        return currentValue;
      });

      return serialized && serialized !== "{}" ? serialized : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function collectExifParams(raw: RawExif): SerializedExifParams | undefined {
  const entries = Object.entries(raw)
    .map(([key, value]) => {
      const serializedValue = stringifyExifValue(value);

      if (!serializedValue) {
        return null;
      }

      return [key, serializedValue.slice(0, MAX_PARAM_VALUE_LENGTH)] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

async function createHistogram(file: File) {
  if (typeof createImageBitmap !== "function") {
    return undefined;
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const size = 128;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return undefined;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Array(64).fill(0) as number[];

    for (let index = 0; index < pixels.length; index += 4) {
      const luminance =
        0.2126 * pixels[index] +
        0.7152 * pixels[index + 1] +
        0.0722 * pixels[index + 2];
      const bucket = Math.min(63, Math.floor((luminance / 256) * buckets.length));
      buckets[bucket] += 1;
    }

    const max = Math.max(...buckets);
    return max > 0
      ? buckets.map((value) => Number((value / max).toFixed(3)))
      : undefined;
  } catch {
    return undefined;
  } finally {
    bitmap?.close();
  }
}

export async function extractExif(file: File): Promise<ExtractedExif> {
  const [raw, histogram] = await Promise.all([
    exifr.parse(file, {
      translateValues: false,
      tiff: true,
      exif: true,
      gps: true,
    }) as Promise<RawExif | null>,
    createHistogram(file),
  ]);

  if (!raw) {
    return { exif: { histogram } };
  }

  const params = collectExifParams(raw);
  const width = raw.ExifImageWidth ?? raw.ImageWidth;
  const height = raw.ExifImageHeight ?? raw.ImageHeight;

  return {
    takenAt: raw.DateTimeOriginal?.toISOString(),
    device: formatDevice(raw.Make, raw.Model),
    lens: raw.LensModel,
    location: formatLocation(raw.latitude, raw.longitude),
    exif: {
      fileSize: formatFileSize(file.size),
      mimeType: file.type || undefined,
      width,
      height,
      dimensions: formatDimensions(width, height),
      orientation: formatOrientation(raw.Orientation),
      colorSpace: formatColorSpace(raw.ColorSpace),
      aperture: formatAperture(raw.FNumber),
      shutter: formatShutter(raw.ExposureTime),
      iso: raw.ISO,
      focalLength: formatFocalLength(raw.FocalLength),
      focalLengthIn35mm: formatFocalLength(raw.FocalLengthIn35mmFormat),
      exposureCompensation: formatExposureCompensation(raw.ExposureBiasValue),
      exposureProgram: formatExposureProgram(raw.ExposureProgram),
      meteringMode: formatMeteringMode(raw.MeteringMode),
      whiteBalance: formatWhiteBalance(raw.WhiteBalance),
      flash: formatFlash(raw.Flash),
      exposureMode: formatExposureMode(raw.ExposureMode),
      sceneCaptureType: formatSceneCaptureType(raw.SceneCaptureType),
      sensingMethod: formatSensingMethod(raw.SensingMethod),
      latitude: raw.latitude,
      longitude: raw.longitude,
      altitude: formatAltitude(raw.GPSAltitude),
      histogram,
      params,
    },
  };
}
