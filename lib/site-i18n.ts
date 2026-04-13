import type { SiteLocale } from "@/lib/api/types";

type Messages = {
  all: string;
  allWorks: string;
  photographer: string;
  clear: string;
  taggedWith: string;
  photoUnit: string;
  contact: string;
  filterTags: string;
  noPublicContact: string;
  noResults: string;
  noPhotos: string;
  noWorksForTag: string;
  loadingWorks: string;
  filteringWorks: string;
  loadingMoreWorks: string;
  loadMoreFailed: string;
  detailUnavailable: string;
  detailLoadFailed: string;
  galleryIntro: string;
  profileFallbackBio: string;
  email: string;
  instagram: string;
  xiaohongshu: string;
  douyin: string;
  customLink: string;
  customAccount: string;
  openViewerHint: string;
  lightboxAria: string;
  previousPhoto: string;
  nextPhoto: string;
  loadingPhotoDetails: string;
  loadingMoreLabel: string;
  basicInfo: string;
  fileName: string;
  note: string;
  noNote: string;
  watermark: string;
  enabled: string;
  disabled: string;
  location: string;
  locationInfo: string;
  tags: string;
  photoParams: string;
  imageInfo: string;
  advancedCameraInfo: string;
  noExif: string;
  fullParams: string;
  takenAt: string;
  device: string;
  lens: string;
  fileSize: string;
  fileType: string;
  dimensions: string;
  orientation: string;
  colorSpace: string;
  aperture: string;
  shutter: string;
  iso: string;
  focalLength: string;
  focalLengthIn35mm: string;
  exposureCompensation: string;
  exposureProgram: string;
  meteringMode: string;
  whiteBalance: string;
  flash: string;
  exposureMode: string;
  sceneCaptureType: string;
  sensingMethod: string;
  altitude: string;
  coordinates: string;
};

const messages: Record<SiteLocale, Messages> = {
  "zh-CN": {
    all: "全部",
    allWorks: "全部作品",
    photographer: "摄影师",
    clear: "清除",
    taggedWith: "标签",
    photoUnit: "张",
    contact: "联系方式",
    filterTags: "筛选标签",
    noPublicContact: "暂未设置公开联系方式。",
    noResults: "无结果",
    noPhotos: "暂无图片",
    noWorksForTag: "当前标签下还没有作品。",
    loadingWorks: "正在加载作品...",
    filteringWorks: "正在筛选作品...",
    loadingMoreWorks: "正在加载更多作品...",
    loadMoreFailed: "加载更多作品时出现问题，请稍后重试。",
    detailUnavailable: "这张照片的详情暂时不可用。",
    detailLoadFailed: "加载照片详情时出现问题，请稍后重试。",
    galleryIntro: "收纳摄影作品与灵感片段，保持轻盈、专注的观看体验。",
    profileFallbackBio: "用影像记录日常、城市和光线落下来的那几秒。",
    email: "邮箱",
    instagram: "Instagram",
    xiaohongshu: "小红书",
    douyin: "抖音",
    customLink: "自定义链接",
    customAccount: "自定义账号",
    openViewerHint: "点击图片进入查看模式，点击左右留白切换上一张或下一张",
    lightboxAria: "照片详情",
    previousPhoto: "上一张",
    nextPhoto: "下一张",
    loadingPhotoDetails: "正在拉取这张照片的完整信息…",
    loadingMoreLabel: "加载中",
    basicInfo: "基本信息",
    fileName: "文件名",
    note: "备注",
    noNote: "暂无备注",
    watermark: "水印",
    enabled: "已启用",
    disabled: "未启用",
    location: "位置",
    locationInfo: "位置信息",
    tags: "标签",
    photoParams: "拍摄参数",
    imageInfo: "图像信息",
    advancedCameraInfo: "进阶拍摄参数",
    noExif: "这张照片暂时没有可展示的 EXIF 信息。",
    fullParams: "完整参数",
    takenAt: "拍摄时间",
    device: "机身",
    lens: "镜头",
    fileSize: "文件大小",
    fileType: "文件格式",
    dimensions: "分辨率",
    orientation: "方向",
    colorSpace: "色彩空间",
    aperture: "光圈",
    shutter: "快门",
    iso: "ISO",
    focalLength: "焦距",
    focalLengthIn35mm: "35mm 等效",
    exposureCompensation: "曝光补偿",
    exposureProgram: "曝光程序",
    meteringMode: "测光模式",
    whiteBalance: "白平衡",
    flash: "闪光灯",
    exposureMode: "曝光模式",
    sceneCaptureType: "场景类型",
    sensingMethod: "感光方式",
    altitude: "海拔",
    coordinates: "坐标",
  },
  "zh-TW": {
    all: "全部",
    allWorks: "全部作品",
    photographer: "攝影師",
    clear: "清除",
    taggedWith: "標籤",
    photoUnit: "張",
    contact: "聯絡方式",
    filterTags: "篩選標籤",
    noPublicContact: "尚未設定公開聯絡方式。",
    noResults: "無結果",
    noPhotos: "暫無圖片",
    noWorksForTag: "目前標籤下還沒有作品。",
    loadingWorks: "正在載入作品...",
    filteringWorks: "正在篩選作品...",
    loadingMoreWorks: "正在載入更多作品...",
    loadMoreFailed: "載入更多作品時發生問題，請稍後再試。",
    detailUnavailable: "這張照片的詳細資訊暫時不可用。",
    detailLoadFailed: "載入照片詳細資訊時發生問題，請稍後再試。",
    galleryIntro: "收納攝影作品與靈感片段，保持輕盈、專注的觀看體驗。",
    profileFallbackBio: "用影像記錄日常、城市與光線落下的那幾秒。",
    email: "信箱",
    instagram: "Instagram",
    xiaohongshu: "小紅書",
    douyin: "抖音",
    customLink: "自訂連結",
    customAccount: "自訂帳號",
    openViewerHint: "點擊圖片進入查看模式，點擊左右留白切換上一張或下一張",
    lightboxAria: "照片詳情",
    previousPhoto: "上一張",
    nextPhoto: "下一張",
    loadingPhotoDetails: "正在載入這張照片的完整資訊…",
    loadingMoreLabel: "載入中",
    basicInfo: "基本資訊",
    fileName: "檔名",
    note: "備註",
    noNote: "暫無備註",
    watermark: "浮水印",
    enabled: "已啟用",
    disabled: "未啟用",
    location: "位置",
    locationInfo: "位置資訊",
    tags: "標籤",
    photoParams: "拍攝參數",
    imageInfo: "圖像資訊",
    advancedCameraInfo: "進階拍攝參數",
    noExif: "這張照片暫時沒有可顯示的 EXIF 資訊。",
    fullParams: "完整參數",
    takenAt: "拍攝時間",
    device: "機身",
    lens: "鏡頭",
    fileSize: "檔案大小",
    fileType: "檔案格式",
    dimensions: "解析度",
    orientation: "方向",
    colorSpace: "色彩空間",
    aperture: "光圈",
    shutter: "快門",
    iso: "ISO",
    focalLength: "焦距",
    focalLengthIn35mm: "35mm 等效",
    exposureCompensation: "曝光補償",
    exposureProgram: "曝光程式",
    meteringMode: "測光模式",
    whiteBalance: "白平衡",
    flash: "閃光燈",
    exposureMode: "曝光模式",
    sceneCaptureType: "場景類型",
    sensingMethod: "感光方式",
    altitude: "海拔",
    coordinates: "座標",
  },
  en: {
    all: "All",
    allWorks: "All Works",
    photographer: "Photographer",
    clear: "Clear",
    taggedWith: "Tag",
    photoUnit: "photos",
    contact: "Contact",
    filterTags: "Filter tags",
    noPublicContact: "No public contact set.",
    noResults: "No Results",
    noPhotos: "No photos yet",
    noWorksForTag: "There are no works under this tag yet.",
    loadingWorks: "Loading works...",
    filteringWorks: "Filtering works...",
    loadingMoreWorks: "Loading more works...",
    loadMoreFailed: "There was a problem loading more works. Please try again later.",
    detailUnavailable: "Details for this photo are temporarily unavailable.",
    detailLoadFailed: "There was a problem loading the photo details. Please try again later.",
    galleryIntro: "A place for photo work and fragments of inspiration, kept light and focused.",
    profileFallbackBio: "Recording everyday life, cities, and those few seconds when the light lands.",
    email: "Email",
    instagram: "Instagram",
    xiaohongshu: "Xiaohongshu",
    douyin: "Douyin",
    customLink: "Custom Link",
    customAccount: "Custom Account",
    openViewerHint: "Click the photo to open the viewer. Click the empty space on the left or right to switch photos.",
    lightboxAria: "Photo details",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    loadingPhotoDetails: "Loading complete photo details…",
    loadingMoreLabel: "Loading",
    basicInfo: "Basic Info",
    fileName: "File Name",
    note: "Note",
    noNote: "No note",
    watermark: "Watermark",
    enabled: "Enabled",
    disabled: "Disabled",
    location: "Location",
    locationInfo: "Location Info",
    tags: "Tags",
    photoParams: "Photo Params",
    imageInfo: "Image Info",
    advancedCameraInfo: "Advanced Camera Info",
    noExif: "No EXIF information is available for this photo right now.",
    fullParams: "Full Params",
    takenAt: "Taken At",
    device: "Camera Body",
    lens: "Lens",
    fileSize: "File Size",
    fileType: "File Type",
    dimensions: "Dimensions",
    orientation: "Orientation",
    colorSpace: "Color Space",
    aperture: "Aperture",
    shutter: "Shutter",
    iso: "ISO",
    focalLength: "Focal Length",
    focalLengthIn35mm: "35mm Equivalent",
    exposureCompensation: "Exposure Compensation",
    exposureProgram: "Exposure Program",
    meteringMode: "Metering Mode",
    whiteBalance: "White Balance",
    flash: "Flash",
    exposureMode: "Exposure Mode",
    sceneCaptureType: "Scene Type",
    sensingMethod: "Sensing Method",
    altitude: "Altitude",
    coordinates: "Coordinates",
  },
};

export function getSiteMessages(locale: SiteLocale) {
  return messages[locale] ?? messages["zh-CN"];
}
