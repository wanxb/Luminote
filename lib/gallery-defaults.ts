import type { PhotoDetail, PhotoSummary } from "@/lib/api/types";

const DEFAULT_GALLERY_DETAILS: PhotoDetail[] = [
  {
    id: "default_photo_001",
    thumbUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-01T18:23:00Z",
    description: "黄昏街头的人群",
    tags: ["街景", "城市", "纪实"],
    device: "Leica Q3",
    lens: "Summilux 28mm f/1.7",
    location: "上海",
    exif: {
      aperture: "f/2.0",
      shutter: "1/125s",
      iso: 800,
      focalLength: "28mm",
    },
  },
  {
    id: "default_photo_002",
    thumbUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-11T06:45:00Z",
    description: "海边的晨光",
    tags: ["风景", "自然", "旅行"],
    device: "Fujifilm X100VI",
    lens: "23mm f/2",
    location: "青岛",
    exif: {
      aperture: "f/4.0",
      shutter: "1/500s",
      iso: 200,
      focalLength: "23mm",
    },
  },
  {
    id: "default_photo_003",
    thumbUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-15T09:10:00Z",
    description: "逆光中的肖像",
    tags: ["人像", "纪实"],
    device: "Sony A7C II",
    lens: "85mm f/1.8",
    location: "杭州",
    exif: {
      aperture: "f/1.8",
      shutter: "1/320s",
      iso: 160,
      focalLength: "85mm",
    },
  },
  {
    id: "default_photo_004",
    thumbUrl:
      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-03T19:40:00Z",
    description: "窗边的静物光影",
    tags: ["静物", "黑白"],
    device: "Nikon Zf",
    lens: "40mm f/2",
    location: "南京",
    exif: {
      aperture: "f/2.8",
      shutter: "1/60s",
      iso: 640,
      focalLength: "40mm",
    },
  },
  {
    id: "default_photo_005",
    thumbUrl:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-27T05:55:00Z",
    description: "雾气中的山谷",
    tags: ["风景", "自然"],
    device: "Canon EOS R6 Mark II",
    lens: "70-200mm f/4",
    location: "阿坝",
    exif: {
      aperture: "f/5.6",
      shutter: "1/250s",
      iso: 400,
      focalLength: "135mm",
    },
  },
  {
    id: "default_photo_006",
    thumbUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-05T21:08:00Z",
    description: "霓虹夜色中的转角",
    tags: ["夜景", "城市", "街景"],
    device: "Ricoh GR IIIx",
    lens: "40mm equivalent",
    location: "东京",
    exif: {
      aperture: "f/2.8",
      shutter: "1/50s",
      iso: 1600,
      focalLength: "26.1mm",
    },
  },
  {
    id: "default_photo_007",
    thumbUrl:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-20T16:32:00Z",
    description: "木梁和玻璃之间的建筑线条",
    tags: ["建筑", "城市"],
    device: "Sony A7R V",
    lens: "24-70mm f/2.8",
    location: "深圳",
    exif: {
      aperture: "f/8.0",
      shutter: "1/200s",
      iso: 250,
      focalLength: "35mm",
    },
  },
  {
    id: "default_photo_008",
    thumbUrl:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-01-09T07:18:00Z",
    description: "湖面的倒影与清晨色温",
    tags: ["风景", "旅行", "自然"],
    device: "Panasonic S5 II",
    lens: "20-60mm",
    location: "大理",
    exif: {
      aperture: "f/7.1",
      shutter: "1/320s",
      iso: 100,
      focalLength: "24mm",
    },
  },
  {
    id: "default_photo_009",
    thumbUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-02-26T11:42:00Z",
    description: "枝头短暂停留的鸟",
    tags: ["鸟类", "动物", "自然"],
    device: "Canon EOS R7",
    lens: "RF 100-500mm",
    location: "昆明",
    exif: {
      aperture: "f/7.1",
      shutter: "1/1600s",
      iso: 500,
      focalLength: "500mm",
    },
  },
  {
    id: "default_photo_010",
    thumbUrl:
      "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=900&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1800&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=1800&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-08T14:12:00Z",
    description: "旅行途中短暂停留的餐桌",
    tags: ["美食", "旅行", "静物"],
    device: "iPhone 16 Pro",
    lens: "26mm",
    location: "厦门",
    exif: {
      aperture: "f/1.8",
      shutter: "1/240s",
      iso: 80,
      focalLength: "26mm",
    },
  },
  {
    id: "default_photo_011",
    thumbUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=780&h=1180&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1560&h=2360&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1560&h=2360&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-10T15:10:00Z",
    description: "高层窗面的冷色反光",
    tags: ["建筑", "城市", "极简"],
    device: "Sony A7R V",
    lens: "35mm f/1.4",
    location: "深圳",
    exif: {
      aperture: "f/5.6",
      shutter: "1/250s",
      iso: 160,
      focalLength: "35mm",
    },
  },
  {
    id: "default_photo_012",
    thumbUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=980&h=720&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1960&h=1440&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1960&h=1440&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-11T08:22:00Z",
    description: "工作台上的光和键盘",
    tags: ["静物", "室内", "纪实"],
    device: "Fujifilm X-T5",
    lens: "33mm f/1.4",
    location: "成都",
    exif: {
      aperture: "f/2.8",
      shutter: "1/125s",
      iso: 400,
      focalLength: "33mm",
    },
  },
  {
    id: "default_photo_013",
    thumbUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=820&h=1120&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1640&h=2240&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1640&h=2240&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-12T06:04:00Z",
    description: "雪线之上的晨雾",
    tags: ["风景", "自然", "旅行"],
    device: "Canon EOS R5",
    lens: "24-105mm f/4",
    location: "川西",
    exif: {
      aperture: "f/8.0",
      shutter: "1/320s",
      iso: 200,
      focalLength: "50mm",
    },
  },
  {
    id: "default_photo_014",
    thumbUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=840&h=840&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1680&h=1680&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1680&h=1680&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-12T19:26:00Z",
    description: "餐桌一角的暖调静物",
    tags: ["静物", "美食"],
    device: "Leica SL2-S",
    lens: "50mm f/2",
    location: "广州",
    exif: {
      aperture: "f/2.8",
      shutter: "1/100s",
      iso: 320,
      focalLength: "50mm",
    },
  },
  {
    id: "default_photo_015",
    thumbUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1020&h=760&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2040&h=1520&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2040&h=1520&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-13T05:40:00Z",
    description: "浪面翻起的银边",
    tags: ["自然", "风景", "旅行"],
    device: "Nikon Z8",
    lens: "70-200mm f/2.8",
    location: "三亚",
    exif: {
      aperture: "f/4.0",
      shutter: "1/1600s",
      iso: 100,
      focalLength: "135mm",
    },
  },
  {
    id: "default_photo_016",
    thumbUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=920&h=700&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1840&h=1400&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1840&h=1400&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-13T13:08:00Z",
    description: "桌面物件的秩序感",
    tags: ["静物", "极简", "室内"],
    device: "Sigma fp L",
    lens: "45mm f/2.8",
    location: "北京",
    exif: {
      aperture: "f/4.0",
      shutter: "1/80s",
      iso: 250,
      focalLength: "45mm",
    },
  },
  {
    id: "default_photo_017",
    thumbUrl:
      "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=760&h=1180&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=1520&h=2360&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=1520&h=2360&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-14T09:45:00Z",
    description: "林间起伏的徒步路",
    tags: ["自然", "旅行", "纪实"],
    device: "Sony A6700",
    lens: "16-55mm f/2.8",
    location: "莫干山",
    exif: {
      aperture: "f/5.0",
      shutter: "1/200s",
      iso: 320,
      focalLength: "24mm",
    },
  },
  {
    id: "default_photo_018",
    thumbUrl:
      "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=820&h=980&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1640&h=1960&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1640&h=1960&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-14T18:02:00Z",
    description: "候车月台上的红色雨伞",
    tags: ["街景", "城市", "纪实"],
    device: "Ricoh GR III",
    lens: "28mm equivalent",
    location: "大阪",
    exif: {
      aperture: "f/2.8",
      shutter: "1/125s",
      iso: 1000,
      focalLength: "18.3mm",
    },
  },
  {
    id: "default_photo_019",
    thumbUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1040&h=760&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2080&h=1520&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2080&h=1520&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-15T10:18:00Z",
    description: "玻璃幕墙中的办公层次",
    tags: ["建筑", "城市", "极简"],
    device: "Nikon Zf",
    lens: "24-120mm f/4",
    location: "上海",
    exif: {
      aperture: "f/6.3",
      shutter: "1/320s",
      iso: 180,
      focalLength: "48mm",
    },
  },
  {
    id: "default_photo_020",
    thumbUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=780&h=1040&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1560&h=2080&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1560&h=2080&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-15T17:34:00Z",
    description: "回头瞬间的自然表情",
    tags: ["人像", "纪实"],
    device: "Canon EOS R6 Mark II",
    lens: "85mm f/2",
    location: "苏州",
    exif: {
      aperture: "f/2.0",
      shutter: "1/400s",
      iso: 125,
      focalLength: "85mm",
    },
  },
  {
    id: "default_photo_021",
    thumbUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=880&h=1180&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1760&h=2360&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1760&h=2360&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-16T07:12:00Z",
    description: "松林深处的清晨雾气",
    tags: ["自然", "风景"],
    device: "Panasonic S5 II",
    lens: "50mm f/1.8",
    location: "延边",
    exif: {
      aperture: "f/5.6",
      shutter: "1/250s",
      iso: 200,
      focalLength: "50mm",
    },
  },
  {
    id: "default_photo_022",
    thumbUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=860&h=860&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1720&h=1720&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1720&h=1720&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-16T12:36:00Z",
    description: "桌前冒着热气的咖啡",
    tags: ["静物", "美食", "室内"],
    device: "iPhone 16 Pro",
    lens: "24mm",
    location: "青岛",
    exif: {
      aperture: "f/1.8",
      shutter: "1/120s",
      iso: 160,
      focalLength: "24mm",
    },
  },
  {
    id: "default_photo_023",
    thumbUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=980&h=720&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1960&h=1440&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1960&h=1440&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-17T16:18:00Z",
    description: "落日前的草地和长风",
    tags: ["风景", "自然", "旅行"],
    device: "Leica Q3",
    lens: "28mm f/1.7",
    location: "呼伦贝尔",
    exif: {
      aperture: "f/4.0",
      shutter: "1/1000s",
      iso: 100,
      focalLength: "28mm",
    },
  },
  {
    id: "default_photo_024",
    thumbUrl:
      "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=760&h=1100&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=1520&h=2200&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=1520&h=2200&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-18T09:20:00Z",
    description: "港口边缘的猫和阳光",
    tags: ["动物", "纪实"],
    device: "Sony A7C II",
    lens: "55mm f/1.8",
    location: "厦门",
    exif: {
      aperture: "f/2.2",
      shutter: "1/640s",
      iso: 125,
      focalLength: "55mm",
    },
  },
  {
    id: "default_photo_025",
    thumbUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1020&h=760&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2040&h=1520&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2040&h=1520&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-18T18:48:00Z",
    description: "山脊尽头的晚霞层次",
    tags: ["风景", "旅行", "自然"],
    device: "Canon EOS R7",
    lens: "RF 24-240mm",
    location: "香格里拉",
    exif: {
      aperture: "f/8.0",
      shutter: "1/250s",
      iso: 200,
      focalLength: "70mm",
    },
  },
  {
    id: "default_photo_026",
    thumbUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=920&h=680&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1840&h=1360&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1840&h=1360&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-19T11:15:00Z",
    description: "屏幕光源里的夜间工作区",
    tags: ["室内", "纪实", "极简"],
    device: "Nikon Z6 II",
    lens: "35mm f/1.8",
    location: "武汉",
    exif: {
      aperture: "f/2.0",
      shutter: "1/80s",
      iso: 500,
      focalLength: "35mm",
    },
  },
  {
    id: "default_photo_027",
    thumbUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&h=1040&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&h=2080&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&h=2080&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-19T14:28:00Z",
    description: "花束边缘的轻微色差",
    tags: ["静物", "自然"],
    device: "Fujifilm X100VI",
    lens: "23mm f/2",
    location: "杭州",
    exif: {
      aperture: "f/2.8",
      shutter: "1/250s",
      iso: 200,
      focalLength: "23mm",
    },
  },
  {
    id: "default_photo_028",
    thumbUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1020&h=760&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2040&h=1520&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2040&h=1520&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-20T06:18:00Z",
    description: "湖岸边的冷暖过渡",
    tags: ["风景", "自然", "城市"],
    device: "Panasonic S9",
    lens: "28-200mm",
    location: "喀纳斯",
    exif: {
      aperture: "f/7.1",
      shutter: "1/400s",
      iso: 100,
      focalLength: "32mm",
    },
  },
  {
    id: "default_photo_029",
    thumbUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=820&h=1120&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1640&h=2240&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1640&h=2240&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-20T21:02:00Z",
    description: "夜幕下的桥面车流",
    tags: ["夜景", "城市", "建筑"],
    device: "Sony A7 IV",
    lens: "24mm f/1.4",
    location: "重庆",
    exif: {
      aperture: "f/2.0",
      shutter: "1/20s",
      iso: 1600,
      focalLength: "24mm",
    },
  },
  {
    id: "default_photo_030",
    thumbUrl:
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=840&h=840&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1680&h=1680&q=80",
    watermarkedDisplayUrl:
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1680&h=1680&q=80",
    watermarkEnabled: true,
    takenAt: "2026-03-21T12:30:00Z",
    description: "地铁车厢里短暂的对视",
    tags: ["纪实", "城市", "人像"],
    device: "Ricoh GR IIIx",
    lens: "40mm equivalent",
    location: "香港",
    exif: {
      aperture: "f/2.8",
      shutter: "1/100s",
      iso: 1250,
      focalLength: "26.1mm",
    },
  },
];

const DEFAULT_GALLERY_DETAIL_MAP = new Map(
  DEFAULT_GALLERY_DETAILS.map((photo) => [photo.id, photo]),
);

export const defaultGalleryPhotos: PhotoSummary[] = DEFAULT_GALLERY_DETAILS.map(
  (photo) => ({
    id: photo.id,
    thumbUrl: photo.thumbUrl,
    displayUrl: photo.displayUrl,
    watermarkedDisplayUrl: photo.watermarkedDisplayUrl,
    watermarkEnabled: photo.watermarkEnabled,
    takenAt: photo.takenAt,
    description: photo.description,
    tags: photo.tags,
  }),
);

export function isDefaultGalleryPhotoId(id: string) {
  return DEFAULT_GALLERY_DETAIL_MAP.has(id);
}

export function getDefaultGalleryPhotoDetail(id: string) {
  return DEFAULT_GALLERY_DETAIL_MAP.get(id) ?? null;
}
