import exifr from "exifr";

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
  };
};

type RawExif = {
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

export async function extractExif(file: File): Promise<ExtractedExif> {
  const raw = (await exifr.parse(file, {
    translateValues: false,
    tiff: true,
    exif: true,
    gps: true
  })) as RawExif | null;

  if (!raw) {
    return { exif: {} };
  }

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
      longitude: raw.longitude
    }
  };
}
