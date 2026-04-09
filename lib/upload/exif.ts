import exifr from "exifr";

export type SerializedExifParams = Record<string, string>;

export type ExtractedExif = {
  takenAt?: string;
  device?: string;
  lens?: string;
  location?: string;
  exif: {
    aperture?: string;
    shutter?: string;
    iso?: number;
    focalLength?: string;
    latitude?: number;
    longitude?: number;
    params?: SerializedExifParams;
  };
};

type RawExif = Record<string, unknown> & {
  DateTimeOriginal?: Date;
  Make?: string;
  Model?: string;
  LensModel?: string;
  FocalLength?: number;
  FNumber?: number;
  ExposureTime?: number;
  ISO?: number;
  latitude?: number;
  longitude?: number;
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

export async function extractExif(file: File): Promise<ExtractedExif> {
  const raw = (await exifr.parse(file, {
    translateValues: false,
    tiff: true,
    exif: true,
    gps: true,
  })) as RawExif | null;

  if (!raw) {
    return { exif: {} };
  }

  const params = collectExifParams(raw);

  return {
    takenAt: raw.DateTimeOriginal?.toISOString(),
    device: formatDevice(raw.Make, raw.Model),
    lens: raw.LensModel,
    location: formatLocation(raw.latitude, raw.longitude),
    exif: {
      aperture: formatAperture(raw.FNumber),
      shutter: formatShutter(raw.ExposureTime),
      iso: raw.ISO,
      focalLength: formatFocalLength(raw.FocalLength),
      latitude: raw.latitude,
      longitude: raw.longitude,
      params,
    },
  };
}
