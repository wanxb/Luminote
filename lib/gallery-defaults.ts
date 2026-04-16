import type { PhotoDetail, PhotoSummary, SiteLocale } from "@/lib/api/types";
import { defaultPhotoHistograms } from "@/lib/default-photo-histograms";

type LocalizedText = Record<SiteLocale, string>;
type LocalizedTags = Record<SiteLocale, string[]>;

type DefaultPhotoSeed = Omit<
  PhotoDetail,
  "description" | "tags" | "location" | "thumbUrl" | "displayUrl" | "watermarkedDisplayUrl"
> & {
  imageId: string;
  orientation?: "landscape" | "portrait" | "square";
  description: LocalizedText;
  tags: LocalizedTags;
  location: LocalizedText;
};

const commonTags = {
  street: { "zh-CN": "街景", "zh-TW": "街景", en: "street" },
  city: { "zh-CN": "城市", "zh-TW": "城市", en: "city" },
  documentary: { "zh-CN": "纪实", "zh-TW": "紀實", en: "documentary" },
  landscape: { "zh-CN": "风景", "zh-TW": "風景", en: "landscape" },
  nature: { "zh-CN": "自然", "zh-TW": "自然", en: "nature" },
  travel: { "zh-CN": "旅行", "zh-TW": "旅行", en: "travel" },
  portrait: { "zh-CN": "人像", "zh-TW": "人像", en: "portrait" },
  stillLife: { "zh-CN": "静物", "zh-TW": "靜物", en: "still life" },
  blackWhite: { "zh-CN": "黑白", "zh-TW": "黑白", en: "black and white" },
  night: { "zh-CN": "夜景", "zh-TW": "夜景", en: "night" },
  architecture: { "zh-CN": "建筑", "zh-TW": "建築", en: "architecture" },
  animals: { "zh-CN": "动物", "zh-TW": "動物", en: "animals" },
  birds: { "zh-CN": "鸟类", "zh-TW": "鳥類", en: "birds" },
  food: { "zh-CN": "美食", "zh-TW": "美食", en: "food" },
  macro: { "zh-CN": "微距", "zh-TW": "微距", en: "macro" },
} satisfies Record<string, LocalizedText>;

function tagsFor(locale: SiteLocale, keys: Array<keyof typeof commonTags>) {
  return keys.map((key) => commonTags[key][locale]);
}

function localizedTags(keys: Array<keyof typeof commonTags>): LocalizedTags {
  return {
    "zh-CN": tagsFor("zh-CN", keys),
    "zh-TW": tagsFor("zh-TW", keys),
    en: tagsFor("en", keys),
  };
}

function localizedText(zhCN: string, zhTW: string, en: string): LocalizedText {
  return { "zh-CN": zhCN, "zh-TW": zhTW, en };
}

const seeds: DefaultPhotoSeed[] = [
  {
    id: "default_photo_001",
    imageId: "photo-1492691527719-9d1e07e534b4",
    takenAt: "2026-03-01T18:23:00Z",
    description: localizedText("黄昏街头的人群", "黃昏街頭的人群", "A crowd moving through the street at dusk"),
    tags: localizedTags(["street", "city", "documentary"]),
    device: "Leica Q3",
    lens: "Summilux 28mm f/1.7",
    location: localizedText("上海", "上海", "Shanghai"),
    exif: { aperture: "f/2.0", shutter: "1/125s", iso: 800, focalLength: "28mm" },
  },
  {
    id: "default_photo_002",
    imageId: "photo-1500530855697-b586d89ba3ee",
    takenAt: "2026-02-11T06:45:00Z",
    description: localizedText("海边的晨光", "海邊的晨光", "Morning light by the sea"),
    tags: localizedTags(["landscape", "nature", "travel"]),
    device: "Fujifilm X100VI",
    lens: "23mm f/2",
    location: localizedText("青岛", "青島", "Qingdao"),
    exif: { aperture: "f/4.0", shutter: "1/500s", iso: 200, focalLength: "23mm" },
  },
  {
    id: "default_photo_003",
    imageId: "photo-1516035069371-29a1b244cc32",
    orientation: "portrait",
    takenAt: "2026-01-15T09:10:00Z",
    description: localizedText("逆光中的肖像", "逆光中的肖像", "A portrait caught against the light"),
    tags: localizedTags(["portrait", "documentary"]),
    device: "Sony A7C II",
    lens: "85mm f/1.8",
    location: localizedText("杭州", "杭州", "Hangzhou"),
    exif: { aperture: "f/1.8", shutter: "1/320s", iso: 160, focalLength: "85mm" },
  },
  {
    id: "default_photo_004",
    imageId: "photo-1516738901171-8eb4fc13bd20",
    takenAt: "2026-02-03T19:40:00Z",
    description: localizedText("窗边的静物光影", "窗邊的靜物光影", "Still-life light by the window"),
    tags: localizedTags(["stillLife", "blackWhite"]),
    device: "Nikon Zf",
    lens: "40mm f/2",
    location: localizedText("南京", "南京", "Nanjing"),
    exif: { aperture: "f/2.8", shutter: "1/60s", iso: 640, focalLength: "40mm" },
  },
  {
    id: "default_photo_005",
    imageId: "photo-1511285560929-80b456fea0bc",
    takenAt: "2026-03-05T21:08:00Z",
    description: localizedText("霓虹夜色中的转角", "霓虹夜色中的轉角", "A corner washed in neon night light"),
    tags: localizedTags(["night", "city", "street"]),
    device: "Ricoh GR IIIx",
    lens: "40mm equivalent",
    location: localizedText("东京", "東京", "Tokyo"),
    exif: { aperture: "f/2.8", shutter: "1/50s", iso: 1600, focalLength: "26.1mm" },
  },
  {
    id: "default_photo_006",
    imageId: "photo-1466721591366-2d5fba72006d",
    orientation: "portrait",
    takenAt: "2026-03-14T09:45:00Z",
    description: localizedText("林间起伏的徒步路", "林間起伏的徒步路", "A hiking trail rolling through the woods"),
    tags: localizedTags(["nature", "travel", "documentary"]),
    device: "Sony A6700",
    lens: "16-55mm f/2.8",
    location: localizedText("莫干山", "莫干山", "Mogan Mountain"),
    exif: { aperture: "f/5.0", shutter: "1/200s", iso: 320, focalLength: "24mm" },
  },
  {
    id: "default_photo_007",
    imageId: "photo-1470770841072-f978cf4d019e",
    takenAt: "2026-01-21T07:18:00Z",
    description: localizedText("山谷上方的清晨薄雾", "山谷上方的清晨薄霧", "Morning mist above the valley"),
    tags: localizedTags(["landscape", "nature"]),
    device: "Canon EOS R6 Mark II",
    lens: "RF 24-70mm f/2.8",
    location: localizedText("桂林", "桂林", "Guilin"),
    exif: { aperture: "f/5.6", shutter: "1/250s", iso: 100, focalLength: "35mm" },
  },
  {
    id: "default_photo_008",
    imageId: "photo-1441974231531-c6227db76b6e",
    takenAt: "2026-02-18T10:32:00Z",
    description: localizedText("森林深处的绿色层次", "森林深處的綠色層次", "Layers of green deep in the forest"),
    tags: localizedTags(["nature", "landscape"]),
    device: "Nikon Z8",
    lens: "24-120mm f/4",
    location: localizedText("阿尔山", "阿爾山", "Arxan"),
    exif: { aperture: "f/7.1", shutter: "1/160s", iso: 320, focalLength: "58mm" },
  },
  {
    id: "default_photo_009",
    imageId: "photo-1500534623283-312aade485b7",
    orientation: "portrait",
    takenAt: "2026-03-19T16:20:00Z",
    description: localizedText("风穿过荒原上的路", "風穿過荒原上的路", "Wind crossing a road through open land"),
    tags: localizedTags(["travel", "landscape"]),
    device: "Fujifilm GFX 50S II",
    lens: "GF 45mm f/2.8",
    location: localizedText("青海", "青海", "Qinghai"),
    exif: { aperture: "f/8.0", shutter: "1/500s", iso: 200, focalLength: "45mm" },
  },
  {
    id: "default_photo_010",
    imageId: "photo-1472214103451-9374bd1c798e",
    takenAt: "2026-01-29T17:55:00Z",
    description: localizedText("湖边落日后的余温", "湖邊落日後的餘溫", "Afterglow lingering by the lake"),
    tags: localizedTags(["landscape", "travel"]),
    device: "Sony A7R V",
    lens: "24-105mm f/4",
    location: localizedText("大理", "大理", "Dali"),
    exif: { aperture: "f/6.3", shutter: "1/320s", iso: 100, focalLength: "70mm" },
  },
  {
    id: "default_photo_011",
    imageId: "photo-1476514525535-07fb3b4ae5f1",
    takenAt: "2026-02-22T14:12:00Z",
    description: localizedText("旅途中经过的山路", "旅途中經過的山路", "A mountain road met while traveling"),
    tags: localizedTags(["travel", "landscape", "documentary"]),
    device: "Olympus OM-1",
    lens: "12-40mm f/2.8",
    location: localizedText("川西", "川西", "Western Sichuan"),
    exif: { aperture: "f/5.6", shutter: "1/640s", iso: 200, focalLength: "18mm" },
  },
  {
    id: "default_photo_012",
    imageId: "photo-1482192505345-5655af888cc4",
    takenAt: "2026-03-09T11:05:00Z",
    description: localizedText("沙丘上清晰的风纹", "沙丘上清晰的風紋", "Wind lines etched across the dunes"),
    tags: localizedTags(["landscape", "nature"]),
    device: "Canon EOS R5",
    lens: "RF 70-200mm f/4",
    location: localizedText("敦煌", "敦煌", "Dunhuang"),
    exif: { aperture: "f/9.0", shutter: "1/800s", iso: 100, focalLength: "135mm" },
  },
  {
    id: "default_photo_013",
    imageId: "photo-1506744038136-46273834b3fb",
    takenAt: "2026-03-12T06:35:00Z",
    description: localizedText("山水之间的冷色清晨", "山水之間的冷色清晨", "A cool morning between mountains and water"),
    tags: localizedTags(["landscape", "nature"]),
    device: "Hasselblad X2D 100C",
    lens: "XCD 38mm f/2.5",
    location: localizedText("喀纳斯", "喀納斯", "Kanas"),
    exif: { aperture: "f/8.0", shutter: "1/125s", iso: 64, focalLength: "38mm" },
  },
  {
    id: "default_photo_014",
    imageId: "photo-1470071459604-3b5ec3a7fe05",
    takenAt: "2026-02-01T06:28:00Z",
    description: localizedText("云层压低的山脊", "雲層壓低的山脊", "Clouds pressing low over the ridge"),
    tags: localizedTags(["landscape", "nature"]),
    device: "Nikon D850",
    lens: "35mm f/1.8",
    location: localizedText("武功山", "武功山", "Wugong Mountain"),
    exif: { aperture: "f/4.0", shutter: "1/400s", iso: 200, focalLength: "35mm" },
  },
  {
    id: "default_photo_015",
    imageId: "photo-1519681393784-d120267933ba",
    takenAt: "2026-03-22T23:42:00Z",
    description: localizedText("星空下安静的山影", "星空下安靜的山影", "Quiet mountain silhouettes under stars"),
    tags: localizedTags(["night", "landscape", "nature"]),
    device: "Sony A7S III",
    lens: "20mm f/1.8",
    location: localizedText("稻城", "稻城", "Daocheng"),
    exif: { aperture: "f/1.8", shutter: "15s", iso: 3200, focalLength: "20mm" },
  },
  {
    id: "default_photo_016",
    imageId: "photo-1493246507139-91e8fad9978e",
    takenAt: "2026-01-11T08:16:00Z",
    description: localizedText("林地里透进来的晨光", "林地裡透進來的晨光", "Morning light filtering into the woods"),
    tags: localizedTags(["nature", "landscape"]),
    device: "Fujifilm X-T5",
    lens: "33mm f/1.4",
    location: localizedText("长白山", "長白山", "Changbai Mountain"),
    exif: { aperture: "f/2.8", shutter: "1/250s", iso: 400, focalLength: "33mm" },
  },
  {
    id: "default_photo_017",
    imageId: "photo-1491553895911-0055eca6402d",
    orientation: "portrait",
    takenAt: "2026-02-14T15:44:00Z",
    description: localizedText("雨后街边的步伐", "雨後街邊的步伐", "Steps along the street after rain"),
    tags: localizedTags(["street", "documentary"]),
    device: "Ricoh GR III",
    lens: "28mm equivalent",
    location: localizedText("台北", "台北", "Taipei"),
    exif: { aperture: "f/4.0", shutter: "1/250s", iso: 800, focalLength: "18.3mm" },
  },
  {
    id: "default_photo_018",
    imageId: "photo-1487958449943-2429e8be8625",
    takenAt: "2026-01-24T12:07:00Z",
    description: localizedText("玻璃立面上的几何秩序", "玻璃立面上的幾何秩序", "Geometric order across a glass facade"),
    tags: localizedTags(["architecture", "city"]),
    device: "Sony A7 IV",
    lens: "35mm f/1.4",
    location: localizedText("深圳", "深圳", "Shenzhen"),
    exif: { aperture: "f/5.6", shutter: "1/800s", iso: 100, focalLength: "35mm" },
  },
  {
    id: "default_photo_019",
    imageId: "photo-1494526585095-c41746248156",
    takenAt: "2026-02-28T09:30:00Z",
    description: localizedText("安静街区里的白色房子", "安靜街區裡的白色房子", "A white house in a quiet neighborhood"),
    tags: localizedTags(["architecture", "city"]),
    device: "Canon EOS R8",
    lens: "RF 35mm f/1.8",
    location: localizedText("厦门", "廈門", "Xiamen"),
    exif: { aperture: "f/6.3", shutter: "1/500s", iso: 100, focalLength: "35mm" },
  },
  {
    id: "default_photo_020",
    imageId: "photo-1486406146926-c627a92ad1ab",
    orientation: "portrait",
    takenAt: "2026-03-18T13:15:00Z",
    description: localizedText("高楼之间的垂直节奏", "高樓之間的垂直節奏", "Vertical rhythm between high-rises"),
    tags: localizedTags(["architecture", "city"]),
    device: "Nikon Z7 II",
    lens: "24-70mm f/4",
    location: localizedText("香港", "香港", "Hong Kong"),
    exif: { aperture: "f/8.0", shutter: "1/640s", iso: 200, focalLength: "50mm" },
  },
  {
    id: "default_photo_021",
    imageId: "photo-1496307653780-42ee777d4833",
    orientation: "portrait",
    takenAt: "2026-01-31T16:06:00Z",
    description: localizedText("楼梯间里的光线切面", "樓梯間裡的光線切面", "Slices of light inside a stairwell"),
    tags: localizedTags(["architecture", "blackWhite"]),
    device: "Leica M11",
    lens: "Summicron 35mm f/2",
    location: localizedText("重庆", "重慶", "Chongqing"),
    exif: { aperture: "f/4.0", shutter: "1/125s", iso: 640, focalLength: "35mm" },
  },
  {
    id: "default_photo_022",
    imageId: "photo-1519608487953-e999c86e7455",
    takenAt: "2026-03-03T20:18:00Z",
    description: localizedText("城市夜里延伸的车流", "城市夜裡延伸的車流", "Traffic stretching through the city night"),
    tags: localizedTags(["night", "city"]),
    device: "Sony A7C",
    lens: "24mm f/1.4",
    location: localizedText("广州", "廣州", "Guangzhou"),
    exif: { aperture: "f/8.0", shutter: "6s", iso: 100, focalLength: "24mm" },
  },
  {
    id: "default_photo_023",
    imageId: "photo-1500534314209-a25ddb2bd429",
    takenAt: "2026-02-07T18:52:00Z",
    description: localizedText("落日前的开阔地平线", "落日前的開闊地平線", "A wide horizon before sunset"),
    tags: localizedTags(["landscape", "travel"]),
    device: "Fujifilm X-Pro3",
    lens: "18mm f/1.4",
    location: localizedText("内蒙古", "內蒙古", "Inner Mongolia"),
    exif: { aperture: "f/5.6", shutter: "1/500s", iso: 160, focalLength: "18mm" },
  },
  {
    id: "default_photo_024",
    imageId: "photo-1504674900247-0877df9cc836",
    takenAt: "2026-03-07T12:21:00Z",
    description: localizedText("午餐桌上的色彩", "午餐桌上的色彩", "Color gathered on a lunch table"),
    tags: localizedTags(["food", "stillLife"]),
    device: "iPhone 16 Pro",
    lens: "Main camera",
    location: localizedText("成都", "成都", "Chengdu"),
    exif: { aperture: "f/1.8", shutter: "1/120s", iso: 80, focalLength: "24mm" },
  },
  {
    id: "default_photo_025",
    imageId: "photo-1482049016688-2d3e1b311543",
    takenAt: "2026-02-19T09:52:00Z",
    description: localizedText("早餐盘里的细节", "早餐盤裡的細節", "Small details on a breakfast plate"),
    tags: localizedTags(["food", "stillLife"]),
    device: "Canon EOS R50",
    lens: "RF 50mm f/1.8",
    location: localizedText("苏州", "蘇州", "Suzhou"),
    exif: { aperture: "f/2.8", shutter: "1/160s", iso: 400, focalLength: "50mm" },
  },
  {
    id: "default_photo_026",
    imageId: "photo-1494790108377-be9c29b29330",
    orientation: "portrait",
    takenAt: "2026-01-17T10:03:00Z",
    description: localizedText("柔和自然光下的人像", "柔和自然光下的人像", "A portrait in soft natural light"),
    tags: localizedTags(["portrait"]),
    device: "Sony A7 III",
    lens: "55mm f/1.8",
    location: localizedText("北京", "北京", "Beijing"),
    exif: { aperture: "f/2.0", shutter: "1/500s", iso: 200, focalLength: "55mm" },
  },
  {
    id: "default_photo_027",
    imageId: "photo-1507003211169-0a1dd7228f2d",
    orientation: "portrait",
    takenAt: "2026-02-26T17:10:00Z",
    description: localizedText("傍晚窗光中的侧脸", "傍晚窗光中的側臉", "A side profile in evening window light"),
    tags: localizedTags(["portrait", "documentary"]),
    device: "Nikon Z6 III",
    lens: "85mm f/1.8",
    location: localizedText("天津", "天津", "Tianjin"),
    exif: { aperture: "f/1.8", shutter: "1/250s", iso: 500, focalLength: "85mm" },
  },
  {
    id: "default_photo_028",
    imageId: "photo-1529626455594-4ff0802cfb7e",
    orientation: "portrait",
    takenAt: "2026-03-11T15:36:00Z",
    description: localizedText("靠近镜头的一瞬", "靠近鏡頭的一瞬", "A close moment near the lens"),
    tags: localizedTags(["portrait"]),
    device: "Canon EOS R3",
    lens: "RF 85mm f/1.2",
    location: localizedText("武汉", "武漢", "Wuhan"),
    exif: { aperture: "f/1.6", shutter: "1/640s", iso: 160, focalLength: "85mm" },
  },
  {
    id: "default_photo_029",
    imageId: "photo-1517841905240-472988babdf9",
    orientation: "portrait",
    takenAt: "2026-01-27T14:40:00Z",
    description: localizedText("树影旁的安静目光", "樹影旁的安靜目光", "A quiet gaze beside tree shadows"),
    tags: localizedTags(["portrait", "nature"]),
    device: "Fujifilm X-H2",
    lens: "56mm f/1.2",
    location: localizedText("昆明", "昆明", "Kunming"),
    exif: { aperture: "f/1.8", shutter: "1/800s", iso: 125, focalLength: "56mm" },
  },
  {
    id: "default_photo_030",
    imageId: "photo-1535083783855-76ae62b2914e",
    takenAt: "2026-03-16T08:05:00Z",
    description: localizedText("枝头停留的鸟", "枝頭停留的鳥", "A bird resting on a branch"),
    tags: localizedTags(["birds", "nature"]),
    device: "Canon EOS R7",
    lens: "RF 100-500mm f/4.5-7.1",
    location: localizedText("西双版纳", "西雙版納", "Xishuangbanna"),
    exif: { aperture: "f/7.1", shutter: "1/1600s", iso: 800, focalLength: "400mm" },
  },
  {
    id: "default_photo_031",
    imageId: "photo-1456926631375-92c8ce872def",
    orientation: "portrait",
    takenAt: "2026-02-12T13:22:00Z",
    description: localizedText("野地里的安静动物", "野地裡的安靜動物", "A quiet animal in open grassland"),
    tags: localizedTags(["animals", "nature"]),
    device: "Nikon Z9",
    lens: "400mm f/4.5",
    location: localizedText("肯尼亚", "肯亞", "Kenya"),
    exif: { aperture: "f/5.6", shutter: "1/2000s", iso: 640, focalLength: "400mm" },
  },
  {
    id: "default_photo_032",
    imageId: "photo-1490750967868-88aa4486c946",
    takenAt: "2026-01-09T08:48:00Z",
    description: localizedText("花瓣边缘的微小水珠", "花瓣邊緣的微小水珠", "Tiny droplets along the edge of a petal"),
    tags: localizedTags(["macro", "nature"]),
    device: "OM System OM-5",
    lens: "60mm macro",
    location: localizedText("无锡", "無錫", "Wuxi"),
    exif: { aperture: "f/5.6", shutter: "1/200s", iso: 400, focalLength: "60mm" },
  },
  {
    id: "default_photo_033",
    imageId: "photo-1500534314209-a25ddb2bd429",
    orientation: "portrait",
    takenAt: "2026-03-24T17:25:00Z",
    description: localizedText("远行路上的金色黄昏", "遠行路上的金色黃昏", "Golden dusk on a long road"),
    tags: localizedTags(["travel", "landscape"]),
    device: "Panasonic S5 II",
    lens: "20-60mm f/3.5-5.6",
    location: localizedText("甘肃", "甘肅", "Gansu"),
    exif: { aperture: "f/8.0", shutter: "1/640s", iso: 100, focalLength: "28mm" },
  },
  {
    id: "default_photo_034",
    imageId: "photo-1518005020951-eccb494ad742",
    takenAt: "2026-02-04T18:33:00Z",
    description: localizedText("暮色里的城市轮廓", "暮色裡的城市輪廓", "A city silhouette at twilight"),
    tags: localizedTags(["city", "architecture", "night"]),
    device: "Sony RX1R II",
    lens: "35mm f/2",
    location: localizedText("新加坡", "新加坡", "Singapore"),
    exif: { aperture: "f/5.6", shutter: "1/100s", iso: 400, focalLength: "35mm" },
  },
  {
    id: "default_photo_035",
    imageId: "photo-1523413651479-597eb2da0ad6",
    takenAt: "2026-03-27T07:58:00Z",
    description: localizedText("市场清晨的人与摊位", "市場清晨的人與攤位", "People and stalls in an early market"),
    tags: localizedTags(["street", "documentary", "food"]),
    device: "Leica SL3",
    lens: "APO-Summicron 50mm f/2",
    location: localizedText("曼谷", "曼谷", "Bangkok"),
    exif: { aperture: "f/2.8", shutter: "1/320s", iso: 500, focalLength: "50mm" },
  },
];

function getImageDimensions(orientation: DefaultPhotoSeed["orientation"]) {
  switch (orientation) {
    case "portrait":
      return {
        thumb: { width: 760, height: 1180 },
        display: { width: 1520, height: 2360 },
      };
    case "square":
      return {
        thumb: { width: 900, height: 900 },
        display: { width: 1800, height: 1800 },
      };
    case "landscape":
    default:
      return {
        thumb: { width: 900, height: 620 },
        display: { width: 1800, height: 1240 },
      };
  }
}

function getOrientationLabel(orientation: DefaultPhotoSeed["orientation"]) {
  switch (orientation) {
    case "portrait":
      return "Portrait";
    case "square":
      return "Square";
    case "landscape":
    default:
      return "Landscape";
  }
}

function buildUnsplashUrl(
  imageId: string,
  size: { width: number; height: number },
) {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(size.width),
    h: String(size.height),
    q: "80",
  });

  return `https://images.unsplash.com/${imageId}?${params.toString()}`;
}

function localizePhoto(photo: DefaultPhotoSeed, locale: SiteLocale): PhotoDetail {
  const dimensions = getImageDimensions(photo.orientation);
  const displayUrl = buildUnsplashUrl(photo.imageId, dimensions.display);
  const orientationLabel = getOrientationLabel(photo.orientation);

  return {
    ...photo,
    thumbUrl: buildUnsplashUrl(photo.imageId, dimensions.thumb),
    displayUrl,
    watermarkedDisplayUrl: displayUrl,
    watermarkEnabled: true,
    description: photo.description[locale],
    tags: photo.tags[locale],
    location: photo.location[locale],
    exif: {
      fileSize: "2.4 MB",
      mimeType: "image/jpeg",
      width: dimensions.display.width,
      height: dimensions.display.height,
      dimensions: `${dimensions.display.width} x ${dimensions.display.height}`,
      orientation: orientationLabel,
      colorSpace: "sRGB",
      ...photo.exif,
      histogram: defaultPhotoHistograms[photo.id],
      params: {
        Source: "Luminote default gallery",
        Profile: orientationLabel,
        ...(photo.exif?.params ?? {}),
      },
    },
  };
}

export function getDefaultGalleryDetails(locale: SiteLocale): PhotoDetail[] {
  return seeds.map((photo) => localizePhoto(photo, locale));
}

export function getDefaultGalleryPhotos(locale: SiteLocale): PhotoSummary[] {
  return getDefaultGalleryDetails(locale).map((photo) => ({
    id: photo.id,
    thumbUrl: photo.thumbUrl,
    displayUrl: photo.displayUrl,
    watermarkedDisplayUrl: photo.watermarkedDisplayUrl,
    watermarkEnabled: photo.watermarkEnabled,
    takenAt: photo.takenAt,
    description: photo.description,
    tags: photo.tags,
  }));
}

export function isDefaultGalleryPhotoId(id: string) {
  return seeds.some((photo) => photo.id === id);
}

export function getDefaultGalleryPhotoDetail(id: string, locale: SiteLocale) {
  const photo = seeds.find((item) => item.id === id);
  return photo ? localizePhoto(photo, locale) : null;
}
