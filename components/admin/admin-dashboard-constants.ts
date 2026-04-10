import type { HomeLayout, WatermarkPosition, SiteLocale } from "@/lib/api/types";
import { getAdminMessages } from "@/lib/admin-i18n";

export const DEFAULT_MAX_QUEUE_ITEMS = 20;
export const DEFAULT_MAX_TAGS_PER_PHOTO = 5;
export const DEFAULT_MAX_TAG_POOL_SIZE = 20;
export const DEFAULT_HOME_LAYOUT: HomeLayout = "editorial";
export const DEFAULT_WATERMARK_POSITION: WatermarkPosition = "bottom-right";
export const PHOTO_PAGE_SIZE = 10;

export function getWatermarkPositionOptions(
  locale: SiteLocale
): Array<{ value: WatermarkPosition; label: string }> {
  const messages = getAdminMessages(locale);
  return [
    { value: "top-left", label: messages.topLeft },
    { value: "top", label: messages.top },
    { value: "top-right", label: messages.topRight },
    { value: "left", label: messages.left },
    { value: "center", label: messages.center },
    { value: "right", label: messages.right },
    { value: "bottom-left", label: messages.bottomLeft },
    { value: "bottom", label: messages.bottom },
    { value: "bottom-right", label: messages.bottomRight },
  ];
}

export function getHomeLayoutOptions(
  locale: SiteLocale
): Array<{ value: HomeLayout; label: string; description: string }> {
  const messages = getAdminMessages(locale);
  return [
    { value: "masonry", label: messages.masonry, description: messages.masonryDescription },
    { value: "editorial", label: messages.editorial, description: messages.editorialDescription },
    { value: "spotlight", label: messages.spotlight, description: messages.spotlightDescription },
  ];
}

// Backward compatibility exports for non-translated contexts
export const WATERMARK_POSITION_OPTIONS: Array<{ value: WatermarkPosition; label: string }> = getWatermarkPositionOptions("zh-CN");
export const HOME_LAYOUT_OPTIONS: Array<{ value: HomeLayout; label: string; description: string }> = getHomeLayoutOptions("zh-CN");
