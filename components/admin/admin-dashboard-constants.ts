import type { HomeLayout, WatermarkPosition } from "@/lib/api/types";

export const DEFAULT_MAX_QUEUE_ITEMS = 20;
export const DEFAULT_MAX_TAGS_PER_PHOTO = 5;
export const DEFAULT_MAX_TAG_POOL_SIZE = 20;
export const DEFAULT_HOME_LAYOUT: HomeLayout = "editorial";
export const DEFAULT_WATERMARK_POSITION: WatermarkPosition = "bottom-right";
export const PHOTO_PAGE_SIZE = 10;

export const WATERMARK_POSITION_OPTIONS: Array<{ value: WatermarkPosition; label: string }> = [
  { value: "top-left", label: "宸︿笂" },
  { value: "top", label: "涓?" },
  { value: "top-right", label: "鍙充笂" },
  { value: "left", label: "宸?" },
  { value: "center", label: "灞呬腑" },
  { value: "right", label: "鍙?" },
  { value: "bottom-left", label: "宸︿笅" },
  { value: "bottom", label: "涓?" },
  { value: "bottom-right", label: "鍙充笅" },
];

export const HOME_LAYOUT_OPTIONS: Array<{ value: HomeLayout; label: string; description: string }> = [
  { value: "masonry", label: "浣滃搧娴佽鐗?", description: "棣栭〉鐩存帴杩涘叆鐎戝竷寮忓浘鐗囨祻瑙堬紝閫傚悎杩炵画鐪嬪浘銆?" },
  { value: "editorial", label: "渚ф爮妗ｆ鐗?", description: "宸︿晶灞曠ず鎽勫奖甯堜俊鎭笌鏍囩锛屽彸渚ц繘琛屽鍥炬。妗堝紡娴忚銆?" },
  { value: "spotlight", label: "鍗曞睆鑱氱劍鐗?", description: "宸︿晶灞曠ず鎽勫奖甯堜俊鎭笌鏍囩锛屽彸渚ц疆鎾崟寮犲ぇ鍥俱€?" },
];
