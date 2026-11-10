// Update history, newest first (Woo Brothers app standard, shared/whatsnew.js format).
// Every release adds an entry at the top: version (fixes bump the last digit, new features
// the middle one), date and time in Malaysia time (YYYY-MM-DD HH:MM), notes in zh / en / ms.
export const RELEASES = [
  {
    v: "1.14.4",
    date: "2026-11-11 07:13",
    notes: {
      zh: ["修好：App 从后台回来时\"今天\"没有更新（例如还停在昨天的日期）。现在每次回到 App 和每天午夜都会按手机时间更新"],
      en: ["Fixed: \"today\" didn't move on when the app was resumed from the background (it could still show yesterday). It now follows the phone's date whenever you return to the app and at midnight"],
      ms: ["Dibaiki: \"hari ini\" tidak dikemas kini apabila aplikasi disambung semula dari latar belakang (boleh masih menunjukkan semalam). Kini ia mengikut tarikh telefon setiap kali kembali ke aplikasi dan pada tengah malam"]
    }
  },
  {
    v: "1.14.3",
    date: "2026-11-10 22:43",
    notes: {
      zh: ["修好：看完\"更新记录\"按\"知道了\"后会回到设置，停在原来的位置，不再跳回首页", "修好：设置等弹出页面有时无法滑回顶部"],
      en: ["Fixed: closing the update history now returns to Settings at the same place instead of the home page", "Fixed: Settings and other sheets sometimes couldn't be scrolled back to the top"],
      ms: ["Dibaiki: menutup sejarah kemas kini kini kembali ke Tetapan di tempat yang sama, bukan ke halaman utama", "Dibaiki: Tetapan dan helaian lain kadangkala tidak boleh ditatal kembali ke atas"]
    }
  },
  {
    v: "1.14.2",
    date: "2026-11-10 22:23",
    notes: {
      zh: ["按钮按下后会显示结果：复制链接显示\"✓ 已复制链接\"，检查更新显示\"检查中…\"再显示结果，下载日历、添加事件也有提示", "分享区的网址不再断行，三个按钮排成一行"],
      en: ["Buttons now confirm what happened: \"✓ Link copied\", \"Checking…\" then the result for updates, and confirmations for downloads and new events", "Share: the link stays on one line and the three buttons sit in one row"],
      ms: ["Butang kini mengesahkan tindakan: \"✓ Pautan disalin\", \"Menyemak…\" kemudian keputusan kemas kini, serta pengesahan muat turun dan acara baharu", "Kongsi: pautan kekal satu baris dan tiga butang dalam satu barisan"]
    }
  },
  {
    v: "1.14.1",
    date: "2026-11-10 18:29",
    notes: {
      zh: ["设置 → 资料来源：现在列出所有 10 个国家的官方来源，按国家分组，并说明哪些是 App 自行计算的"],
      en: ["Settings → Data sources now lists the official sources for all 10 countries, grouped by country, and explains what the app calculates itself"],
      ms: ["Tetapan → Sumber data kini menyenaraikan sumber rasmi bagi kesemua 10 negara, mengikut negara, dan menerangkan apa yang dikira oleh aplikasi sendiri"]
    }
  },
  {
    v: "1.14.0",
    date: "2026-11-10 18:21",
    notes: {
      zh: ["新增：设置 → 日历显示，可以分别关掉农历、伊斯兰历、传统节日和生肖（公共假期照常显示）", "月历标题下的农历和回历改成分行显示，标题的中文月份不再被拆成两行"],
      en: ["New: Settings → Calendar display, to turn the Chinese lunar calendar, Islamic calendar, Chinese festivals and zodiac on or off (public holidays always show)", "Lunar and Hijri dates under the month title now sit on separate labelled lines; the month name no longer wraps"],
      ms: ["Baharu: Tetapan → Paparan kalendar, untuk hidup/matikan kalendar lunar Cina, kalendar Islam, perayaan Cina dan shio (cuti umum sentiasa dipaparkan)", "Tarikh lunar dan Hijrah di bawah tajuk bulan kini pada baris berasingan berlabel; nama bulan tidak lagi terpotong"]
    }
  },
  {
    v: "1.13.0",
    date: "2026-11-10 18:12",
    notes: {
      zh: ["新增：月历页右上角的\"生肖\"开关，可以显示或隐藏生肖", "第一次打开时可以选择语言（默认英文）"],
      en: ["New: a \"Zodiac\" switch at the top right of the month page to show or hide the zodiac signs", "Choose your language the first time you open the app (English by default)"],
      ms: ["Baharu: suis \"Shio\" di kanan atas halaman bulan untuk tunjuk atau sembunyi shio", "Pilih bahasa semasa kali pertama membuka aplikasi (Bahasa Inggeris secara lalai)"]
    }
  },
  {
    v: "1.12.0",
    date: "2026-11-10 18:00",
    notes: {
      zh: [
        "新增：十二生肖（月历页上方），点一下可看该生肖所有出生年份和准确的起止日期（以农历新年为界）及今年岁数",
        "更新方式改成和其他 Woo Brothers App 一样：打开时自动检查新版本，提示\"立即更新 / 稍后\"",
        "更新后第一次打开会显示\"更新了什么\""
      ],
      en: [
        "New: the 12 zodiac signs (top of the month page); tap one for every birth year with exact start–end dates (from Chinese New Year) and this year’s age",
        "Updates now work like the other Woo Brothers apps: the app checks for a new version and offers \"Update now / Later\"",
        "After an update, the first launch shows what changed"
      ],
      ms: [
        "Baharu: 12 shio (atas halaman bulan); ketik untuk semua tahun lahir dengan tarikh mula–tamat tepat (dari Tahun Baharu Cina) dan umur tahun ini",
        "Kemas kini kini sama seperti aplikasi Woo Brothers lain: aplikasi menyemak versi baharu dan menawarkan \"Kemas kini / Nanti\"",
        "Selepas kemas kini, pembukaan pertama menunjukkan apa yang berubah"
      ]
    }
  },
  {
    v: "1.11.0",
    date: "2026-11-10 17:43",
    notes: {
      zh: [
        "新增启动画面",
        "设置里显示版本、最后更新时间和更新记录",
        "有新版本时显示\"更新\"提示，点一下即可更新；离线时继续使用已缓存的版本",
        "新增 Android 和 iPhone 主屏幕图标"
      ],
      en: [
        "Splash screen",
        "Version, last-updated time and update history in Settings",
        "\"Update available\" prompt: tap to update; cached version keeps working offline",
        "Home-screen icons for Android and iPhone"
      ],
      ms: [
        "Skrin pembuka",
        "Versi, masa kemas kini terakhir dan sejarah kemas kini dalam Tetapan",
        "Gesaan \"Kemas kini tersedia\": ketik untuk kemas kini; versi cache terus berfungsi di luar talian",
        "Ikon skrin utama untuk Android dan iPhone"
      ]
    }
  },
  {
    v: "1.10.0",
    date: "2026-11-10 17:38",
    notes: {
      zh: [
        "新增农历节日：除夕、春节、天公诞、元宵、清明、端午、七夕、中元、中秋、重阳、冬至、腊八",
        "修复：只选一个州属时，有假期的月份打不开"
      ],
      en: [
        "Lunar festivals: CNY Eve, CNY, Pai Ti Kong, Chap Goh Mei, Qingming, Dragon Boat, Qixi, Hungry Ghost, Mid-Autumn, Double Ninth, Dongzhi, Laba",
        "Fix: month page failed to open in single-state mode"
      ],
      ms: [
        "Perayaan kalendar Cina: Malam & Tahun Baharu Cina, Pai Ti Kong, Chap Goh Mei, Cheng Beng, Perahu Naga, Qixi, Hantu Lapar, Kuih Bulan, Chung Yeung, Dongzhi, Laba",
        "Pembaikan: halaman bulan gagal dibuka bagi satu negeri"
      ]
    }
  },
  {
    v: "1.9.0",
    date: "2026-11-10 17:33",
    notes: {
      zh: [
        "马来西亚州属选择新增\"全部州属\""
      ],
      en: [
        "\"All states\" option for Malaysia"
      ],
      ms: [
        "Pilihan \"Semua negeri\" untuk Malaysia"
      ]
    }
  },
  {
    v: "1.8.1",
    date: "2026-11-10 16:02",
    notes: {
      zh: [
        "新增日本（内阁府官方资料）"
      ],
      en: [
        "Japan (Cabinet Office official list)"
      ],
      ms: [
        "Jepun (senarai rasmi Pejabat Kabinet)"
      ]
    }
  },
  {
    v: "1.8.0",
    date: "2026-11-10 16:00",
    notes: {
      zh: [
        "新增国家：新加坡、台湾、香港、中国、印尼、韩国、泰国、越南（官方资料）",
        "新增\"对照\"：你的长假 vs 目的地假期"
      ],
      en: [
        "Countries: Singapore, Taiwan, Hong Kong, China, Indonesia, South Korea, Thailand, Vietnam (official lists)",
        "Compare: your long weekends vs the destination's holidays"
      ],
      ms: [
        "Negara: Singapura, Taiwan, Hong Kong, China, Indonesia, Korea Selatan, Thailand, Vietnam (senarai rasmi)",
        "Bandingkan: cuti panjang anda vs cuti di destinasi"
      ]
    }
  },
  {
    v: "1.7.0",
    date: "2026-11-10 15:38",
    notes: {
      zh: [
        "移除发薪日"
      ],
      en: [
        "Removed pay dates"
      ],
      ms: [
        "Tarikh gaji dibuang"
      ]
    }
  },
  {
    v: "1.6.0",
    date: "2026-11-10 15:37",
    notes: {
      zh: [
        "语言切换（中文 / English / BM）",
        "外观：跟随系统 / 浅色 / 深色，8 个主题",
        "分享：QR 码、WhatsApp、复制链接"
      ],
      en: [
        "Language switch (中文 / English / BM)",
        "Appearance: system / light / dark, 8 themes",
        "Share: QR code, WhatsApp, copy link"
      ],
      ms: [
        "Tukar bahasa (中文 / English / BM)",
        "Paparan: sistem / cerah / gelap, 8 tema",
        "Kongsi: kod QR, WhatsApp, salin pautan"
      ]
    }
  },
  {
    v: "1.5.0",
    date: "2026-11-10 10:05",
    notes: {
      zh: [
        "界面整理：更紧凑、更整齐"
      ],
      en: [
        "Cleaner, more compact interface"
      ],
      ms: [
        "Antara muka lebih kemas"
      ]
    }
  },
  {
    v: "1.4.0",
    date: "2026-11-10 10:01",
    notes: {
      zh: [
        "新增长周末（含请假建议）"
      ],
      en: [
        "Long Weekend view with leave suggestions"
      ],
      ms: [
        "Paparan Cuti Panjang dengan cadangan cuti"
      ]
    }
  },
  {
    v: "1.3.0",
    date: "2026-11-10 09:58",
    notes: {
      zh: [
        "公共假期改用首相署官方清单，学校假期改用教育部通令",
        "按州属筛选",
        "加入手机日历（下载 / 订阅）"
      ],
      en: [
        "Public holidays from the official JPM lists, school holidays from KPM circulars",
        "Filter by state",
        "Add to phone calendar (download / subscribe)"
      ],
      ms: [
        "Cuti umum daripada senarai rasmi JPM, cuti sekolah daripada surat siaran KPM",
        "Tapis mengikut negeri",
        "Tambah ke kalendar telefon (muat turun / langgan)"
      ]
    }
  },
  {
    v: "1.2.0",
    date: "2026-11-10 09:46",
    notes: {
      zh: [
        "任何年份都能推算假期（农历、回历、淡米尔历）"
      ],
      en: [
        "Holidays for any year (lunar, Hijri and Tamil calendar rules)"
      ],
      ms: [
        "Cuti bagi mana-mana tahun (kalendar Cina, Hijrah, Tamil)"
      ]
    }
  },
  {
    v: "1.1.0",
    date: "2026-11-09 17:53",
    notes: {
      zh: [
        "农历月历设计：年份、分类卡片、月份格子、传统月历页"
      ],
      en: [
        "Lunar calendar design: years, category cards, month tiles, traditional month page"
      ],
      ms: [
        "Reka bentuk kalendar lunar"
      ]
    }
  },
  {
    v: "1.0.0",
    date: "2026-11-09 17:26",
    notes: {
      zh: [
        "首版：马来西亚公共假期、月历、个人事件"
      ],
      en: [
        "First version: Malaysian public holidays, month view, personal events"
      ],
      ms: [
        "Versi pertama: cuti umum Malaysia, paparan bulan, acara peribadi"
      ]
    }
  }
];
export const VERSION = RELEASES[0].v;
