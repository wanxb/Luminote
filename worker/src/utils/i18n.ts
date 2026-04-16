export type SiteLocale = "zh-CN" | "zh-TW" | "en";

type LocaleMessages = {
  adminPasswordIncorrect: string;
  tooManyRequests: string;
  adminLoginRequired: string;
  invalidLanguage: string;
  siteTitleRequired: string;
  siteTitleTooLong: (limit: number) => string;
  siteDescriptionInvalid: string;
  siteDescriptionTooLong: (limit: number) => string;
  invalidHomeLayout: string;
  invalidWatermarkDefault: string;
  watermarkTextRequired: string;
  watermarkTextTooLong: (limit: number) => string;
  invalidWatermarkPosition: string;
  adminPasswordTooShort: string;
  adminPasswordTooLong: (limit: number) => string;
  invalidOriginalUploadSwitch: string;
  invalidMaxTagPoolSize: string;
  invalidMaxTotalPhotos: string;
  invalidMaxUploadFiles: string;
  invalidMaxTagsPerPhoto: string;
  invalidPhotoMetadataSwitch: string;
  invalidShowDateInfo: string;
  invalidShowCameraInfo: string;
  invalidShowImageInfo: string;
  invalidShowAdvancedCameraInfo: string;
  invalidShowLocationInfo: string;
  invalidShowHistogramInfo: string;
  invalidShowDetailedExifInfo: string;
  invalidPhotographerAvatarUrl: string;
  photographerAvatarUrlTooLong: (limit: number) => string;
  invalidPhotographerName: string;
  photographerNameTooLong: (limit: number) => string;
  invalidPhotographerBio: string;
  photographerBioTooLong: (limit: number) => string;
  invalidPhotographerEmail: string;
  photographerEmailTooLong: (limit: number) => string;
  invalidXiaohongshuAccount: string;
  xiaohongshuAccountTooLong: (limit: number) => string;
  invalidXiaohongshuUrl: string;
  xiaohongshuUrlTooLong: (limit: number) => string;
  invalidDouyinAccount: string;
  douyinAccountTooLong: (limit: number) => string;
  invalidDouyinUrl: string;
  douyinUrlTooLong: (limit: number) => string;
  invalidInstagramAccount: string;
  instagramAccountTooLong: (limit: number) => string;
  invalidInstagramUrl: string;
  instagramUrlTooLong: (limit: number) => string;
  invalidCustomAccount: string;
  customAccountTooLong: (limit: number) => string;
  invalidCustomAccountUrl: string;
  customAccountUrlTooLong: (limit: number) => string;
  saveSettingsFailed: string;
  settingsUpdated: string;
  invalidRequestBody: string;
  photoDescriptionTooLong: (limit: number) => string;
  tagTooLong: (limit: number) => string;
  photoDescriptionOrTagTooLong: (
    descriptionLimit: number,
    tagLimit: number,
  ) => string;
  noImageFilesReceived: string;
  batchUploadLimit: (limit: number) => string;
  totalPhotoLimit: (limit: number) => string;
  existingPhotosLoadFailed: string;
  missingPhotoId: string;
  photoNoteInvalid: string;
  tagsInvalid: string;
  updatePhotoFailed: string;
  chooseAvatarFirst: string;
  avatarMustBeImage: string;
  avatarUploadStorageMissing: string;
  avatarSaveFailed: string;
  tagNameRequired: string;
  tagNameTooLong: (limit: number) => string;
  tagPoolLimit: (limit: number) => string;
  createTagFailed: string;
  missingTagId: string;
  deleteTagFailed: string;
  duplicatePhotoSkipped: string;
  photoMissingOrDeleted: string;
  d1ConfigMissing: string;
  d1UpdateMissing: string;
  photoNotFound: string;
};

const messages: Record<SiteLocale, LocaleMessages> = {
  "zh-CN": {
    adminPasswordIncorrect: "管理员密码错误。",
    tooManyRequests: "登录失败次数过多，请稍后再试。",
    adminLoginRequired: "请先完成管理员登录。",
    invalidLanguage: "语言格式错误。",
    siteTitleRequired: "站点标题不能为空。",
    siteTitleTooLong: (limit) => `站点标题不能超过 ${limit} 个字符。`,
    siteDescriptionInvalid: "站点简介格式错误。",
    siteDescriptionTooLong: (limit) => `站点简介不能超过 ${limit} 个字符。`,
    invalidHomeLayout: "首页样式格式错误。",
    invalidWatermarkDefault: "水印默认开关格式错误。",
    watermarkTextRequired: "水印文本不能为空。",
    watermarkTextTooLong: (limit) => `水印文本不能超过 ${limit} 个字符。`,
    invalidWatermarkPosition: "水印位置格式错误。",
    adminPasswordTooShort: "管理员密码至少需要 6 个字符。",
    adminPasswordTooLong: (limit) => `管理员密码不能超过 ${limit} 个字符。`,
    invalidOriginalUploadSwitch: "原图上传开关格式错误。",
    invalidMaxTagPoolSize: "标签总数上限必须是正整数。",
    invalidMaxTotalPhotos: "图片总数上限必须是正整数。",
    invalidMaxUploadFiles: "批量上传数量上限必须是正整数。",
    invalidMaxTagsPerPhoto: "单张图片标签上限必须是正整数。",
    invalidPhotoMetadataSwitch: "图片参数显示总开关格式错误。",
    invalidShowDateInfo: "拍摄时间显示开关格式错误。",
    invalidShowCameraInfo: "相机参数显示开关格式错误。",
    invalidShowImageInfo: "图像信息显示开关格式错误。",
    invalidShowAdvancedCameraInfo: "进阶拍摄参数显示开关格式错误。",
    invalidShowLocationInfo: "位置信息显示开关格式错误。",
    invalidShowHistogramInfo: "直方图显示开关格式错误。",
    invalidShowDetailedExifInfo: "完整参数显示开关格式错误。",
    invalidPhotographerAvatarUrl: "摄影师头像链接格式错误。",
    photographerAvatarUrlTooLong: (limit) =>
      `摄影师头像链接不能超过 ${limit} 个字符。`,
    invalidPhotographerName: "摄影师姓名格式错误。",
    photographerNameTooLong: (limit) => `摄影师姓名不能超过 ${limit} 个字符。`,
    invalidPhotographerBio: "摄影师简介格式错误。",
    photographerBioTooLong: (limit) => `摄影师简介不能超过 ${limit} 个字符。`,
    invalidPhotographerEmail: "邮箱格式错误。",
    photographerEmailTooLong: (limit) => `邮箱不能超过 ${limit} 个字符。`,
    invalidXiaohongshuAccount: "小红书账号格式错误。",
    xiaohongshuAccountTooLong: (limit) =>
      `小红书账号不能超过 ${limit} 个字符。`,
    invalidXiaohongshuUrl: "小红书链接格式错误。",
    xiaohongshuUrlTooLong: (limit) => `小红书链接不能超过 ${limit} 个字符。`,
    invalidDouyinAccount: "抖音账号格式错误。",
    douyinAccountTooLong: (limit) => `抖音账号不能超过 ${limit} 个字符。`,
    invalidDouyinUrl: "抖音链接格式错误。",
    douyinUrlTooLong: (limit) => `抖音链接不能超过 ${limit} 个字符。`,
    invalidInstagramAccount: "Instagram 账号格式错误。",
    instagramAccountTooLong: (limit) =>
      `Instagram 账号不能超过 ${limit} 个字符。`,
    invalidInstagramUrl: "Instagram 链接格式错误。",
    instagramUrlTooLong: (limit) => `Instagram 链接不能超过 ${limit} 个字符。`,
    invalidCustomAccount: "自定义账号名称格式错误。",
    customAccountTooLong: (limit) => `自定义账号名称不能超过 ${limit} 个字符。`,
    invalidCustomAccountUrl: "自定义账号链接格式错误。",
    customAccountUrlTooLong: (limit) =>
      `自定义账号链接不能超过 ${limit} 个字符。`,
    saveSettingsFailed: "保存配置失败。",
    settingsUpdated: "站点配置已更新。",
    invalidRequestBody: "请求格式错误。",
    photoDescriptionTooLong: (limit) => `照片备注不能超过 ${limit} 个字符。`,
    tagTooLong: (limit) => `单个标签不能超过 ${limit} 个字符。`,
    photoDescriptionOrTagTooLong: (descriptionLimit, tagLimit) =>
      `照片备注不能超过 ${descriptionLimit} 个字符，单个标签不能超过 ${tagLimit} 个字符。`,
    noImageFilesReceived: "未接收到任何图片文件。",
    batchUploadLimit: (limit) => `单次最多上传 ${limit} 张照片。`,
    totalPhotoLimit: (limit) =>
      `图片总数最多 ${limit} 张，当前上传会超出限制。`,
    existingPhotosLoadFailed: "加载现有照片失败。",
    missingPhotoId: "缺少照片 ID。",
    photoNoteInvalid: "照片备注格式错误。",
    tagsInvalid: "标签格式错误。",
    updatePhotoFailed: "更新照片失败。",
    chooseAvatarFirst: "请先选择头像图片。",
    avatarMustBeImage: "头像必须是图片文件。",
    avatarUploadStorageMissing: "头像上传失败，当前环境未绑定对象存储。",
    avatarSaveFailed: "头像保存失败。",
    tagNameRequired: "标签名称不能为空。",
    tagNameTooLong: (limit) => `标签名称不能超过 ${limit} 个字符。`,
    tagPoolLimit: (limit) => `标签总数最多 ${limit} 个。`,
    createTagFailed: "创建标签失败。",
    missingTagId: "缺少标签 ID。",
    deleteTagFailed: "删除标签失败。",
    duplicatePhotoSkipped: "图片内容重复，已跳过。",
    photoMissingOrDeleted: "照片不存在或已被删除。",
    d1ConfigMissing: "当前环境未绑定 D1，无法保存配置。",
    d1UpdateMissing: "当前环境未绑定 D1，无法执行更新。",
    photoNotFound: "照片不存在。",
  },
  "zh-TW": {
    adminPasswordIncorrect: "管理員密碼錯誤。",
    tooManyRequests: "登入失敗次數過多，請稍後再試。",
    adminLoginRequired: "請先完成管理員登入。",
    invalidLanguage: "語言格式錯誤。",
    siteTitleRequired: "站點標題不能為空。",
    siteTitleTooLong: (limit) => `站點標題不能超過 ${limit} 個字元。`,
    siteDescriptionInvalid: "站點簡介格式錯誤。",
    siteDescriptionTooLong: (limit) => `站點簡介不能超過 ${limit} 個字元。`,
    invalidHomeLayout: "首頁樣式格式錯誤。",
    invalidWatermarkDefault: "浮水印預設開關格式錯誤。",
    watermarkTextRequired: "浮水印文字不能為空。",
    watermarkTextTooLong: (limit) => `浮水印文字不能超過 ${limit} 個字元。`,
    invalidWatermarkPosition: "浮水印位置格式錯誤。",
    adminPasswordTooShort: "管理員密碼至少需要 6 個字元。",
    adminPasswordTooLong: (limit) => `管理員密碼不能超過 ${limit} 個字元。`,
    invalidOriginalUploadSwitch: "原圖上傳開關格式錯誤。",
    invalidMaxTagPoolSize: "標籤總數上限必須是正整數。",
    invalidMaxTotalPhotos: "圖片總數上限必須是正整數。",
    invalidMaxUploadFiles: "批次上傳數量上限必須是正整數。",
    invalidMaxTagsPerPhoto: "單張圖片標籤上限必須是正整數。",
    invalidPhotoMetadataSwitch: "圖片參數顯示總開關格式錯誤。",
    invalidShowDateInfo: "拍攝時間顯示開關格式錯誤。",
    invalidShowCameraInfo: "相機參數顯示開關格式錯誤。",
    invalidShowImageInfo: "圖像資訊顯示開關格式錯誤。",
    invalidShowAdvancedCameraInfo: "進階拍攝參數顯示開關格式錯誤。",
    invalidShowLocationInfo: "位置資訊顯示開關格式錯誤。",
    invalidShowHistogramInfo: "直方圖顯示開關格式錯誤。",
    invalidShowDetailedExifInfo: "完整參數顯示開關格式錯誤。",
    invalidPhotographerAvatarUrl: "攝影師頭像連結格式錯誤。",
    photographerAvatarUrlTooLong: (limit) =>
      `攝影師頭像連結不能超過 ${limit} 個字元。`,
    invalidPhotographerName: "攝影師姓名格式錯誤。",
    photographerNameTooLong: (limit) => `攝影師姓名不能超過 ${limit} 個字元。`,
    invalidPhotographerBio: "攝影師簡介格式錯誤。",
    photographerBioTooLong: (limit) => `攝影師簡介不能超過 ${limit} 個字元。`,
    invalidPhotographerEmail: "信箱格式錯誤。",
    photographerEmailTooLong: (limit) => `信箱不能超過 ${limit} 個字元。`,
    invalidXiaohongshuAccount: "小紅書帳號格式錯誤。",
    xiaohongshuAccountTooLong: (limit) =>
      `小紅書帳號不能超過 ${limit} 個字元。`,
    invalidXiaohongshuUrl: "小紅書連結格式錯誤。",
    xiaohongshuUrlTooLong: (limit) => `小紅書連結不能超過 ${limit} 個字元。`,
    invalidDouyinAccount: "抖音帳號格式錯誤。",
    douyinAccountTooLong: (limit) => `抖音帳號不能超過 ${limit} 個字元。`,
    invalidDouyinUrl: "抖音連結格式錯誤。",
    douyinUrlTooLong: (limit) => `抖音連結不能超過 ${limit} 個字元。`,
    invalidInstagramAccount: "Instagram 帳號格式錯誤。",
    instagramAccountTooLong: (limit) =>
      `Instagram 帳號不能超過 ${limit} 個字元。`,
    invalidInstagramUrl: "Instagram 連結格式錯誤。",
    instagramUrlTooLong: (limit) => `Instagram 連結不能超過 ${limit} 個字元。`,
    invalidCustomAccount: "自訂帳號名稱格式錯誤。",
    customAccountTooLong: (limit) => `自訂帳號名稱不能超過 ${limit} 個字元。`,
    invalidCustomAccountUrl: "自訂帳號連結格式錯誤。",
    customAccountUrlTooLong: (limit) =>
      `自訂帳號連結不能超過 ${limit} 個字元。`,
    saveSettingsFailed: "儲存設定失敗。",
    settingsUpdated: "站點設定已更新。",
    invalidRequestBody: "請求格式錯誤。",
    photoDescriptionTooLong: (limit) => `照片備註不能超過 ${limit} 個字元。`,
    tagTooLong: (limit) => `單個標籤不能超過 ${limit} 個字元。`,
    photoDescriptionOrTagTooLong: (descriptionLimit, tagLimit) =>
      `照片備註不能超過 ${descriptionLimit} 個字元，單個標籤不能超過 ${tagLimit} 個字元。`,
    noImageFilesReceived: "未接收到任何圖片檔案。",
    batchUploadLimit: (limit) => `單次最多上傳 ${limit} 張照片。`,
    totalPhotoLimit: (limit) =>
      `圖片總數最多 ${limit} 張，目前上傳會超出限制。`,
    existingPhotosLoadFailed: "載入現有照片失敗。",
    missingPhotoId: "缺少照片 ID。",
    photoNoteInvalid: "照片備註格式錯誤。",
    tagsInvalid: "標籤格式錯誤。",
    updatePhotoFailed: "更新照片失敗。",
    chooseAvatarFirst: "請先選擇頭像圖片。",
    avatarMustBeImage: "頭像必須是圖片檔案。",
    avatarUploadStorageMissing: "頭像上傳失敗，目前環境未綁定物件儲存。",
    avatarSaveFailed: "頭像儲存失敗。",
    tagNameRequired: "標籤名稱不能為空。",
    tagNameTooLong: (limit) => `標籤名稱不能超過 ${limit} 個字元。`,
    tagPoolLimit: (limit) => `標籤總數最多 ${limit} 個。`,
    createTagFailed: "建立標籤失敗。",
    missingTagId: "缺少標籤 ID。",
    deleteTagFailed: "刪除標籤失敗。",
    duplicatePhotoSkipped: "圖片內容重複，已跳過。",
    photoMissingOrDeleted: "照片不存在或已被刪除。",
    d1ConfigMissing: "目前環境未綁定 D1，無法儲存設定。",
    d1UpdateMissing: "目前環境未綁定 D1，無法執行更新。",
    photoNotFound: "照片不存在。",
  },
  en: {
    adminPasswordIncorrect: "Incorrect admin password.",
    tooManyRequests: "Too many failed login attempts. Please try again later.",
    adminLoginRequired: "Please sign in as an admin first.",
    invalidLanguage: "Invalid language format.",
    siteTitleRequired: "Site title is required.",
    siteTitleTooLong: (limit) =>
      `Site title must be at most ${limit} characters.`,
    siteDescriptionInvalid: "Invalid site description format.",
    siteDescriptionTooLong: (limit) =>
      `Site description must be at most ${limit} characters.`,
    invalidHomeLayout: "Invalid home layout format.",
    invalidWatermarkDefault: "Invalid watermark default switch format.",
    watermarkTextRequired: "Watermark text is required.",
    watermarkTextTooLong: (limit) =>
      `Watermark text must be at most ${limit} characters.`,
    invalidWatermarkPosition: "Invalid watermark position format.",
    adminPasswordTooShort: "Admin password must be at least 6 characters.",
    adminPasswordTooLong: (limit) =>
      `Admin password must be at most ${limit} characters.`,
    invalidOriginalUploadSwitch: "Invalid original upload switch format.",
    invalidMaxTagPoolSize: "Tag pool limit must be a positive integer.",
    invalidMaxTotalPhotos: "Total photo limit must be a positive integer.",
    invalidMaxUploadFiles: "Batch upload limit must be a positive integer.",
    invalidMaxTagsPerPhoto: "Per-photo tag limit must be a positive integer.",
    invalidPhotoMetadataSwitch: "Invalid photo metadata switch format.",
    invalidShowDateInfo: "Invalid date info switch format.",
    invalidShowCameraInfo: "Invalid camera info switch format.",
    invalidShowImageInfo: "Invalid image info switch format.",
    invalidShowAdvancedCameraInfo:
      "Invalid advanced camera info switch format.",
    invalidShowLocationInfo: "Invalid location info switch format.",
    invalidShowHistogramInfo: "Invalid histogram switch format.",
    invalidShowDetailedExifInfo: "Invalid detailed EXIF switch format.",
    invalidPhotographerAvatarUrl: "Invalid photographer avatar URL format.",
    photographerAvatarUrlTooLong: (limit) =>
      `Photographer avatar URL must be at most ${limit} characters.`,
    invalidPhotographerName: "Invalid photographer name format.",
    photographerNameTooLong: (limit) =>
      `Photographer name must be at most ${limit} characters.`,
    invalidPhotographerBio: "Invalid photographer bio format.",
    photographerBioTooLong: (limit) =>
      `Photographer bio must be at most ${limit} characters.`,
    invalidPhotographerEmail: "Invalid email format.",
    photographerEmailTooLong: (limit) =>
      `Email must be at most ${limit} characters.`,
    invalidXiaohongshuAccount: "Invalid Xiaohongshu account format.",
    xiaohongshuAccountTooLong: (limit) =>
      `Xiaohongshu account must be at most ${limit} characters.`,
    invalidXiaohongshuUrl: "Invalid Xiaohongshu URL format.",
    xiaohongshuUrlTooLong: (limit) =>
      `Xiaohongshu URL must be at most ${limit} characters.`,
    invalidDouyinAccount: "Invalid Douyin account format.",
    douyinAccountTooLong: (limit) =>
      `Douyin account must be at most ${limit} characters.`,
    invalidDouyinUrl: "Invalid Douyin URL format.",
    douyinUrlTooLong: (limit) =>
      `Douyin URL must be at most ${limit} characters.`,
    invalidInstagramAccount: "Invalid Instagram account format.",
    instagramAccountTooLong: (limit) =>
      `Instagram account must be at most ${limit} characters.`,
    invalidInstagramUrl: "Invalid Instagram URL format.",
    instagramUrlTooLong: (limit) =>
      `Instagram URL must be at most ${limit} characters.`,
    invalidCustomAccount: "Invalid custom account name format.",
    customAccountTooLong: (limit) =>
      `Custom account name must be at most ${limit} characters.`,
    invalidCustomAccountUrl: "Invalid custom account URL format.",
    customAccountUrlTooLong: (limit) =>
      `Custom account URL must be at most ${limit} characters.`,
    saveSettingsFailed: "Failed to save settings.",
    settingsUpdated: "Site settings updated.",
    invalidRequestBody: "Invalid request body.",
    photoDescriptionTooLong: (limit) =>
      `Photo note must be at most ${limit} characters.`,
    tagTooLong: (limit) => `Each tag must be at most ${limit} characters.`,
    photoDescriptionOrTagTooLong: (descriptionLimit, tagLimit) =>
      `Photo note must be at most ${descriptionLimit} characters, and each tag must be at most ${tagLimit} characters.`,
    noImageFilesReceived: "No image files were received.",
    batchUploadLimit: (limit) =>
      `You can upload up to ${limit} photos per batch.`,
    totalPhotoLimit: (limit) =>
      `The gallery can contain up to ${limit} photos, and this upload would exceed that limit.`,
    existingPhotosLoadFailed: "Failed to load existing photos.",
    missingPhotoId: "Missing photo ID.",
    photoNoteInvalid: "Invalid photo note format.",
    tagsInvalid: "Invalid tag format.",
    updatePhotoFailed: "Failed to update the photo.",
    chooseAvatarFirst: "Please choose an avatar image first.",
    avatarMustBeImage: "Avatar must be an image file.",
    avatarUploadStorageMissing:
      "Avatar upload failed because object storage is not configured.",
    avatarSaveFailed: "Failed to save the avatar.",
    tagNameRequired: "Tag name is required.",
    tagNameTooLong: (limit) => `Tag name must be at most ${limit} characters.`,
    tagPoolLimit: (limit) => `You can create up to ${limit} tags.`,
    createTagFailed: "Failed to create the tag.",
    missingTagId: "Missing tag ID.",
    deleteTagFailed: "Failed to delete the tag.",
    duplicatePhotoSkipped: "Duplicate photo content was skipped.",
    photoMissingOrDeleted:
      "The photo does not exist or has already been deleted.",
    d1ConfigMissing:
      "D1 is not bound in the current environment, so settings cannot be saved.",
    d1UpdateMissing:
      "D1 is not bound in the current environment, so updates cannot be applied.",
    photoNotFound: "Photo not found.",
  },
};

export function normalizeLocale(value: string | null | undefined): SiteLocale {
  if (value === "zh-TW" || value === "zh-CN" || value === "en") {
    return value;
  }
  return "zh-CN";
}

export function getLocaleMessages(locale: string | null | undefined) {
  return messages[normalizeLocale(locale)];
}

/**
 * Maps SiteLocale to standard BCP 47 language tags for Date/Intl APIs
 */
export function getLocaleTag(siteLocale: SiteLocale | string): string {
  const normalized = normalizeLocale(siteLocale);
  if (normalized === "zh-TW") return "zh-TW";
  if (normalized === "en") return "en-US";
  return "zh-CN";
}
