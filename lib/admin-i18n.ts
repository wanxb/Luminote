import type { SiteLocale } from "@/lib/api/types";

type AdminMessages = {
  adminTitle: string;
  adminSubtitle: string;
  photosTab: string;
  settingsTab: string;
  logout: string;
  siteSettings: string;
  loadingSettings: string;
  language: string;
  homeLayout: string;
  siteTitle: string;
  siteDescription: string;
  siteDescriptionPlaceholder: string;
  watermarkEnabled: string;
  watermarkEnabledDescription: string;
  storeOriginalFiles: string;
  storeOriginalFilesDescription: string;
  watermarkText: string;
  watermarkPosition: string;
  limits: string;
  limitsDescription: string;
  totalPhotos: string;
  totalPhotosDescription: string;
  uploadBatch: string;
  uploadBatchDescription: string;
  tagPool: string;
  tagPoolDescription: string;
  tagsPerPhoto: string;
  tagsPerPhotoDescription: string;
  photoMetadata: string;
  photoMetadataDescription: string;
  enableMetadata: string;
  enableMetadataDescription: string;
  dateInfo: string;
  dateInfoDescription: string;
  cameraInfo: string;
  cameraInfoDescription: string;
  locationInfo: string;
  locationInfoDescription: string;
  detailedExif: string;
  detailedExifDescription: string;
  photographerProfile: string;
  photographerProfileDescription: string;
  photographerAvatar: string;
  photographerName: string;
  photographerNamePlaceholder: string;
  photographerBio: string;
  photographerBioPlaceholder: string;
  email: string;
  customAccount: string;
  xiaohongshu: string;
  douyin: string;
  instagram: string;
  accountNamePlaceholder: string;
  profileUrlPlaceholder: string;
  adminPassword: string;
  adminPasswordDescription: string;
  newPasswordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  saving: string;
  saveSettings: string;
  uploadPhotosTitle: string;
  loadingTags: string;
  newTagPlaceholder: string;
  addTagButton: string;
  addPhotosButton: string;
  removeButton: string;
  finishEditingTags: string;
  manageTags: string;
  waitingToUpload: string;
  uploading: string;
  loadingConfig: string;
  uploadButton: string;
  photoLibraryTitle: string;
  filterByTag: string;
  searchButton: string;
  clearButton: string;
  selectPageButton: string;
  clearPageButton: string;
  hideSelectedButton: string;
  unhideSelectedButton: string;
  deleteSelectedButton: string;
  deletingButton: string;
  masonry: string;
  editorial: string;
  spotlight: string;
  masonryDescription: string;
  editorialDescription: string;
  spotlightDescription: string;
  topLeft: string;
  top: string;
  topRight: string;
  left: string;
  center: string;
  right: string;
  bottomLeft: string;
  bottom: string;
  bottomRight: string;
  working: string;
  unhideButton: string;
  doneButton: string;
  savingButton: string;
  deletingConfirmButton: string;
};

const messages: Record<SiteLocale, AdminMessages> = {
  "zh-CN": {
    adminTitle: "管理后台",
    adminSubtitle: "Luminote Admin",
    photosTab: "照片",
    settingsTab: "设置",
    logout: "退出",
    siteSettings: "站点设置",
    loadingSettings: "正在加载设置...",
    language: "语言",
    homeLayout: "首页布局",
    siteTitle: "站点标题",
    siteDescription: "站点简介",
    siteDescriptionPlaceholder: "描述你的站点氛围、主题或浏览体验。",
    watermarkEnabled: "默认启用水印",
    watermarkEnabledDescription: "上传后默认对展示图应用水印，除非单独关闭。",
    storeOriginalFiles: "保存原图",
    storeOriginalFilesDescription: "除了展示图外，同时在对象存储中保留原始上传文件。",
    watermarkText: "水印文本",
    watermarkPosition: "水印位置",
    limits: "限制设置",
    limitsDescription: "配置画廊规模、上传行为与标签限制。",
    totalPhotos: "图片总数",
    totalPhotosDescription: "整个画廊的上限",
    uploadBatch: "单次上传",
    uploadBatchDescription: "每次最多上传",
    tagPool: "标签池",
    tagPoolDescription: "可用标签总数",
    tagsPerPhoto: "单图标签数",
    tagsPerPhotoDescription: "每张照片最多标签数",
    photoMetadata: "图片参数",
    photoMetadataDescription: "控制查看器中展示哪些图片参数。",
    enableMetadata: "启用参数显示",
    enableMetadataDescription: "灯箱中所有参数的总开关。",
    dateInfo: "拍摄时间",
    dateInfoDescription: "显示拍摄日期和时间。",
    cameraInfo: "相机参数",
    cameraInfoDescription: "显示机身、镜头、光圈、快门、ISO 和焦距。",
    locationInfo: "位置信息",
    locationInfoDescription: "显示位置字段和 GPS 相关信息。",
    detailedExif: "完整 EXIF",
    detailedExifDescription: "显示常用字段以外的扩展参数列表。",
    photographerProfile: "摄影师资料",
    photographerProfileDescription: "这些字段会显示在公开站点上。",
    photographerAvatar: "摄影师头像",
    photographerName: "名称",
    photographerNamePlaceholder: "你的名字",
    photographerBio: "简介",
    photographerBioPlaceholder: "介绍你的创作方向、城市或长期关注的主题。",
    email: "邮箱",
    customAccount: "自定义账号",
    xiaohongshu: "小红书",
    douyin: "抖音",
    instagram: "Instagram",
    accountNamePlaceholder: "账号名称",
    profileUrlPlaceholder: "资料链接",
    adminPassword: "管理员密码",
    adminPasswordDescription: "如果不想修改当前密码，可以留空。",
    newPasswordPlaceholder: "新密码",
    confirmPasswordPlaceholder: "确认新密码",
    saving: "保存中...",
    saveSettings: "保存设置",
    uploadPhotosTitle: "上传照片",
    loadingTags: "正在加载标签...",
    newTagPlaceholder: "新标签",
    addTagButton: "添加",
    addPhotosButton: "添加照片",
    removeButton: "移除",
    finishEditingTags: "完成编辑标签",
    manageTags: "管理标签",
    waitingToUpload: "等待上传",
    uploading: "上传中",
    loadingConfig: "加载配置中",
    uploadButton: "上传",
    photoLibraryTitle: "图片库",
    filterByTag: "按标签筛选",
    searchButton: "搜索",
    clearButton: "清除",
    selectPageButton: "选择此页",
    clearPageButton: "清除此页",
    hideSelectedButton: "隐藏选中",
    unhideSelectedButton: "显示选中",
    deleteSelectedButton: "删除选中",
    deletingButton: "删除中",
    masonry: "砌体",
    editorial: "编辑",
    spotlight: "聚焦",
    masonryDescription: "用砌体图片源打开网站。",
    editorialDescription: "在编辑存档布局右侧显示资料和标签。",
    spotlightDescription: "在聚焦英雄演示右侧显示资料和标签。",
    topLeft: "左上",
    top: "顶部",
    topRight: "右上",
    left: "左侧",
    center: "中心",
    right: "右侧",
    bottomLeft: "左下",
    bottom: "底部",
    bottomRight: "右下",
    working: "处理中",
    unhideButton: "显示",
    doneButton: "完成",
    savingButton: "保存中",
    deletingConfirmButton: "确认删除",
  },
  "zh-TW": {
    adminTitle: "管理後台",
    adminSubtitle: "Luminote Admin",
    photosTab: "照片",
    settingsTab: "設定",
    logout: "登出",
    siteSettings: "站點設定",
    loadingSettings: "正在載入設定...",
    language: "語言",
    homeLayout: "首頁版型",
    siteTitle: "站點標題",
    siteDescription: "站點簡介",
    siteDescriptionPlaceholder: "描述你的站點氛圍、主題或瀏覽體驗。",
    watermarkEnabled: "預設啟用浮水印",
    watermarkEnabledDescription: "除非另外關閉，否則預設會對展示圖套用浮水印。",
    storeOriginalFiles: "保留原圖",
    storeOriginalFilesDescription: "除了展示圖外，也在物件儲存中保留原始上傳檔案。",
    watermarkText: "浮水印文字",
    watermarkPosition: "浮水印位置",
    limits: "限制設定",
    limitsDescription: "設定畫廊規模、上傳行為與標籤限制。",
    totalPhotos: "圖片總數",
    totalPhotosDescription: "整個畫廊的上限",
    uploadBatch: "單次上傳",
    uploadBatchDescription: "每次最多上傳",
    tagPool: "標籤池",
    tagPoolDescription: "可用標籤總數",
    tagsPerPhoto: "單圖標籤數",
    tagsPerPhotoDescription: "每張照片最多標籤數",
    photoMetadata: "圖片參數",
    photoMetadataDescription: "控制檢視器中顯示哪些圖片參數。",
    enableMetadata: "啟用參數顯示",
    enableMetadataDescription: "燈箱中所有參數的總開關。",
    dateInfo: "拍攝時間",
    dateInfoDescription: "顯示拍攝日期與時間。",
    cameraInfo: "相機參數",
    cameraInfoDescription: "顯示機身、鏡頭、光圈、快門、ISO 與焦距。",
    locationInfo: "位置資訊",
    locationInfoDescription: "顯示位置欄位與 GPS 相關資訊。",
    detailedExif: "完整 EXIF",
    detailedExifDescription: "顯示常用欄位以外的擴充參數列表。",
    photographerProfile: "攝影師資料",
    photographerProfileDescription: "這些欄位會顯示在公開站點上。",
    photographerAvatar: "攝影師頭像",
    photographerName: "名稱",
    photographerNamePlaceholder: "你的名字",
    photographerBio: "簡介",
    photographerBioPlaceholder: "介紹你的創作方向、城市或長期關注的主題。",
    email: "信箱",
    customAccount: "自訂帳號",
    xiaohongshu: "小紅書",
    douyin: "抖音",
    instagram: "Instagram",
    accountNamePlaceholder: "帳號名稱",
    profileUrlPlaceholder: "資料連結",
    adminPassword: "管理員密碼",
    adminPasswordDescription: "如果不想修改目前密碼，可以留空。",
    newPasswordPlaceholder: "新密碼",
    confirmPasswordPlaceholder: "確認新密碼",
    saving: "儲存中...",
    saveSettings: "儲存設定",
    uploadPhotosTitle: "上傳照片",
    loadingTags: "正在載入標籤...",
    newTagPlaceholder: "新標籤",
    addTagButton: "新增",
    addPhotosButton: "新增照片",
    removeButton: "移除",
    finishEditingTags: "完成編輯標籤",
    manageTags: "管理標籤",
    waitingToUpload: "等候上傳",
    uploading: "上傳中",
    loadingConfig: "載入設定中",
    uploadButton: "上傳",
    photoLibraryTitle: "圖片庫",
    filterByTag: "按標籤篩選",
    searchButton: "搜尋",
    clearButton: "清除",
    selectPageButton: "選擇此頁",
    clearPageButton: "清除此頁",
    hideSelectedButton: "隱藏選中",
    unhideSelectedButton: "顯示選中",
    deleteSelectedButton: "刪除選中",
    deletingButton: "刪除中",
    masonry: "砌體",
    editorial: "編輯",
    spotlight: "聚焦",
    masonryDescription: "用砌體圖片源打開網站。",
    editorialDescription: "在編輯存檔版型右側顯示資料和標籤。",
    spotlightDescription: "在聚焦英雄呈現右側顯示資料和標籤。",
    topLeft: "左上",
    top: "頂部",
    topRight: "右上",
    left: "左側",
    center: "中心",
    right: "右側",
    bottomLeft: "左下",
    bottom: "底部",
    bottomRight: "右下",
    working: "處理中",
    unhideButton: "顯示",
    doneButton: "完成",
    savingButton: "儲存中",
    deletingConfirmButton: "確認刪除",
  },
  en: {
    adminTitle: "Admin Console",
    adminSubtitle: "Luminote Admin",
    photosTab: "Photos",
    settingsTab: "Settings",
    logout: "Logout",
    siteSettings: "Site Settings",
    loadingSettings: "Loading settings...",
    language: "Language",
    homeLayout: "Home Layout",
    siteTitle: "Site Title",
    siteDescription: "Site Description",
    siteDescriptionPlaceholder: "Describe the mood, theme, or viewing experience of your site.",
    watermarkEnabled: "Watermark Enabled by Default",
    watermarkEnabledDescription: "Apply watermarks to gallery display assets unless disabled.",
    storeOriginalFiles: "Store Original Files",
    storeOriginalFilesDescription: "Keep original uploads in object storage in addition to generated display assets.",
    watermarkText: "Watermark Text",
    watermarkPosition: "Watermark Position",
    limits: "Limits",
    limitsDescription: "Configure gallery scale, upload behavior, and tag limits.",
    totalPhotos: "Total Photos",
    totalPhotosDescription: "Gallery-wide cap",
    uploadBatch: "Upload Batch",
    uploadBatchDescription: "Per upload",
    tagPool: "Tag Pool",
    tagPoolDescription: "Total available tags",
    tagsPerPhoto: "Tags Per Photo",
    tagsPerPhotoDescription: "Per photo",
    photoMetadata: "Photo Metadata",
    photoMetadataDescription: "Control which photo parameters appear in the viewer.",
    enableMetadata: "Enable Metadata",
    enableMetadataDescription: "Master switch for all metadata in the lightbox.",
    dateInfo: "Date Info",
    dateInfoDescription: "Show capture date and time.",
    cameraInfo: "Camera Info",
    cameraInfoDescription: "Show camera body, lens, aperture, shutter, ISO, and focal length.",
    locationInfo: "Location Info",
    locationInfoDescription: "Show location fields and GPS-related metadata.",
    detailedExif: "Detailed EXIF",
    detailedExifDescription: "Show the extended parameter list beyond the common fields.",
    photographerProfile: "Photographer Profile",
    photographerProfileDescription: "These fields are displayed on the public site.",
    photographerAvatar: "Photographer Avatar",
    photographerName: "Name",
    photographerNamePlaceholder: "Your name",
    photographerBio: "Bio",
    photographerBioPlaceholder: "Describe your focus, city, or long-term interests.",
    email: "Email",
    customAccount: "Custom Account",
    xiaohongshu: "Xiaohongshu",
    douyin: "Douyin",
    instagram: "Instagram",
    accountNamePlaceholder: "Account name",
    profileUrlPlaceholder: "Profile URL",
    adminPassword: "Admin Password",
    adminPasswordDescription: "Leave these blank if you do not want to change the current password.",
    newPasswordPlaceholder: "New password",
    confirmPasswordPlaceholder: "Confirm new password",
    saving: "Saving...",
    saveSettings: "Save Settings",
    uploadPhotosTitle: "Upload Photos",
    loadingTags: "Loading tags...",
    newTagPlaceholder: "New tag",
    addTagButton: "Add",
    addPhotosButton: "Add photos",
    removeButton: "Remove",
    finishEditingTags: "Finish editing tags",
    manageTags: "Manage tags",
    waitingToUpload: "Waiting to upload",
    uploading: "Uploading",
    loadingConfig: "Loading config",
    uploadButton: "Upload",
    photoLibraryTitle: "Photo Library",
    filterByTag: "Filter by tag",
    searchButton: "Search",
    clearButton: "Clear",
    selectPageButton: "Select page",
    clearPageButton: "Clear page",
    hideSelectedButton: "Hide selected",
    unhideSelectedButton: "Unhide selected",
    deleteSelectedButton: "Delete selected",
    deletingButton: "Deleting",
    masonry: "Masonry",
    editorial: "Editorial",
    spotlight: "Spotlight",
    masonryDescription: "Open the site with a masonry image feed.",
    editorialDescription: "Show profile and tags beside an editorial archive layout.",
    spotlightDescription: "Show profile and tags beside a spotlight hero presentation.",
    topLeft: "Top left",
    top: "Top",
    topRight: "Top right",
    left: "Left",
    center: "Center",
    right: "Right",
    bottomLeft: "Bottom left",
    bottom: "Bottom",
    bottomRight: "Bottom right",
    working: "Working",
    unhideButton: "Unhide",
    doneButton: "Done",
    savingButton: "Saving",
    deletingConfirmButton: "Confirm delete",
  },
};

export function getAdminMessages(locale: SiteLocale) {
  return messages[locale] ?? messages["zh-CN"];
}
