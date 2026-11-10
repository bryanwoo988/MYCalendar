// Interface text in English, Bahasa Melayu and 中文.
// Malay holiday names follow the wording of the JPM (BKPP) official list.

export const LANGS = { zh: "中文", en: "English", ms: "BM" };

const T = {
  en: {
    "z.toggle": "Zodiac",
    "z.note": "A sign starts on Chinese New Year, not 1 January. If you were born in January or early February, check the dates below.", "z.age": "turns {n} this year",
    "upd.available": "A new version is available.", "upd.btn": "Update", "about.title": "About", "about.version": "Version", "about.updated": "Last updated", "about.check": "Check for updates", "about.history": "Update history", "about.latest": "You have the latest version.", "about.found": "New version found — tap Update.", "about.offline": "Can't check while offline.",
    "legend.fest": "Lunar festival", "tag.fest": "traditional",
    "lw.except": "All except {list}",
    "legend.part": "Some states only",
    "x.pickState": "Choose a state first: each state has its own holidays.", groupTagA: "Group A", groupTagB: "Group B", groupBoth: "Group A: Kedah, Kelantan, Terengganu · Group B: all other states & Federal Territories", nationalOnly: "National",
    "set.country": "Country", "cat.compare": "Compare", calendarOf: "{c} Calendar",
    "tag.workday": "make-up workday", "tag.bridge": "collective leave", "tag.regional": "regional", "tag.unconfirmed": "unconfirmed",
    noOfficial: "No official {c} holiday list for {y} yet. Only officially published years are shown.",
    "cmp.with": "Compare with", "cmp.home": "You", "cmp.yourBreaks": "Your long weekends — and what's happening there",
    "cmp.busy": "{c} is on holiday too: expect crowds and higher prices; some places may be closed.",
    "cmp.normal": "Normal working days in {c}.", "cmp.workday": "{c} has a make-up working day here.",
    "cmp.both": "Both calendars", "cmp.noData": "No official {c} list for {y} yet.", "cmp.bothOff": "both off",
    "cmp.intro": "Plan a trip: your long weekends (with leave) next to the public holidays where you're going.",
    appTitle: "MY Calendar",
    back: "Back", addToCalendar: "Add to phone calendar", settings: "Settings",
    statePick: "State",
    "cat.public": "Public Holiday", "cat.school": "School Holiday", "cat.long": "Long Weekend",
    "legend.hol": "Public holiday", "legend.school": "School holiday", "legend.evt": "My event",
    memo: "Memorandum", prevMonth: "Previous month", nextMonth: "Next month", close: "Close",
    evtPlaceholder: "Add my event", evtAdd: "Add", delete: "Delete",
    nothingDay: "Nothing on this day.", nothingMonth: "Nothing this month.",
    "tag.est": "estimated", "tag.estUnc": "estimated ±1d", "tag.repl": "replacement", "tag.change": "may change",
    source: "Source",
    notGazetted: "Not yet gazetted. Estimated from the rules in the official {years} lists — for planning only.",
    groupA: "Group A · Kedah, Kelantan, Terengganu", groupB: "Group B · all other states & Federal Territories",
    noSchool: "No official KPM school calendar for {y} in this app yet. Check",
    replFriSat: "Replacement days (cuti ganti) in this state are announced by the state government (Friday rest day) and are not added automatically.",
    replOther: "Replacement days in {s} are appointed by state notification; only gazetted ones are shown.",
    days: "{n} days",
    "lw.allStates": "All states", "lw.noLeave": "No leave", "lw.plusLeave": "+{n} leave",
    "lw.weekend": "Weekend", "lw.holiday": "Public Holiday", "lw.leave": "Annual Leave",
    "lw.showingAll": "Showing every state. Pick your state to see only yours.",
    "lw.estimated": "Based on estimated holidays — not yet gazetted.",
    "lw.daysOff": "{n} days off", "lw.leaveDays": "{n} day leave", "lw.leaveDaysPl": "{n} days leave", "lw.noLeaveNeeded": "No leave needed",
    "lw.none": "No long weekends found.", "lw.allStatesShort": "All states", "lw.only": "{list} only", "lw.more": "+{n}",
    "set.language": "Language", "set.appearance": "Appearance", "set.share": "Share this app", "set.sources": "Data sources",
    "ap.system": "Follow system", "ap.light": "Light", "ap.dark": "Dark",
    "ap.note": "In Follow system mode the app follows your phone: your light theme when the phone is light, your dark theme when it is dark.",
    "ap.lightTheme": "Light theme", "ap.darkTheme": "Dark theme",
    "th.classic": "Classic", "th.paper": "Paper", "th.mint": "Mint", "th.lavender": "Lavender",
    "th.midnight": "Midnight", "th.oled": "OLED Black", "th.slate": "Slate", "th.grape": "Grape",
    "sh.scan": "Scan to open on another phone", "sh.copy": "Copy link", "sh.copied": "Link copied", "sh.native": "Share…", "sh.whatsapp": "WhatsApp",
    "sh.text": "Malaysia calendar: public & school holidays for every state, lunar dates and long weekends",
    "src.note": "Public holidays for 2026 and 2027 come from the Prime Minister's Department (BKPP) lists. Later years are estimates calculated from the same rules and are labelled \"estimated\". Replacement days follow section 3 of the Holidays Act 1951 where it applies automatically; Kedah, Kelantan, Terengganu, Sabah and Sarawak announce theirs separately. School holidays are from the KPM circulars. ",
    "x.title": "Add to phone calendar", "x.what": "{s} · public holidays + school holidays",
    "x.subscribe": "Subscribe (updates automatically)",
    "x.subNote": "Works with iPhone Calendar, Google Calendar and Outlook. New official lists are picked up without doing anything.",
    "x.iphone": "iPhone / Mac: Subscribe", "x.android": "Android: Google Calendar",
    "x.feedOk": "Change state first if you want another state's feed.",
    "x.feedOff": "Subscription links work once the app is published online. Download a file for now.",
    "x.download": "Or download a file", "x.public": "Public holidays", "x.school": "School holidays", "x.mine": "My events",
    "x.estimated": "(estimated)", "x.btn": "Download .ics",
    "x.howto": "On iPhone, open the file and tap \"Add All\". On Android, open it with Google Calendar or Samsung Calendar. A downloaded file does not update; re-download after the official list changes.",
  },
  ms: {
    "z.toggle": "Shio",
    "z.note": "Shio bermula pada Tahun Baharu Cina, bukan 1 Januari. Jika lahir pada Januari atau awal Februari, semak tarikh di bawah.", "z.age": "{n} tahun tahun ini",
    "upd.available": "Versi baharu tersedia.", "upd.btn": "Kemas kini", "about.title": "Perihal", "about.version": "Versi", "about.updated": "Kemas kini terakhir", "about.check": "Semak kemas kini", "about.history": "Sejarah kemas kini", "about.latest": "Anda menggunakan versi terkini.", "about.found": "Versi baharu ditemui — ketik Kemas kini.", "about.offline": "Tidak dapat menyemak semasa di luar talian.",
    "legend.fest": "Perayaan tradisional", "tag.fest": "tradisional",
    "lw.except": "Semua kecuali {list}",
    "legend.part": "Sesetengah negeri sahaja",
    "x.pickState": "Pilih negeri dahulu: setiap negeri ada cuti tersendiri.", groupTagA: "Kumpulan A", groupTagB: "Kumpulan B", groupBoth: "Kumpulan A: Kedah, Kelantan, Terengganu · Kumpulan B: negeri lain & Wilayah Persekutuan", nationalOnly: "Kebangsaan",
    "set.country": "Negara", "cat.compare": "Bandingkan", calendarOf: "Kalendar {c}",
    "tag.workday": "hari kerja ganti", "tag.bridge": "cuti bersama", "tag.regional": "wilayah", "tag.unconfirmed": "belum disahkan",
    noOfficial: "Senarai cuti rasmi {c} bagi {y} belum ada. Hanya tahun yang telah diumumkan secara rasmi dipaparkan.",
    "cmp.with": "Banding dengan", "cmp.home": "Anda", "cmp.yourBreaks": "Cuti panjang anda — dan keadaan di sana",
    "cmp.busy": "{c} juga bercuti: dijangka sesak dan harga lebih tinggi; sesetengah tempat mungkin tutup.",
    "cmp.normal": "Hari bekerja biasa di {c}.", "cmp.workday": "{c} ada hari kerja ganti di sini.",
    "cmp.both": "Kedua-dua kalendar", "cmp.noData": "Senarai rasmi {c} bagi {y} belum ada.", "cmp.bothOff": "kedua-dua cuti",
    "cmp.intro": "Rancang percutian: cuti panjang anda (dengan cuti tahunan) bersebelahan cuti umum di destinasi.",
    appTitle: "Kalendar MY",
    back: "Kembali", addToCalendar: "Tambah ke kalendar telefon", settings: "Tetapan",
    statePick: "Negeri",
    "cat.public": "Cuti Umum", "cat.school": "Cuti Sekolah", "cat.long": "Cuti Panjang",
    "legend.hol": "Cuti umum", "legend.school": "Cuti sekolah", "legend.evt": "Acara saya",
    memo: "Memorandum", prevMonth: "Bulan sebelum", nextMonth: "Bulan berikut", close: "Tutup",
    evtPlaceholder: "Tambah acara saya", evtAdd: "Tambah", delete: "Padam",
    nothingDay: "Tiada apa-apa pada hari ini.", nothingMonth: "Tiada apa-apa bulan ini.",
    "tag.est": "anggaran", "tag.estUnc": "anggaran ±1h", "tag.repl": "cuti ganti", "tag.change": "tertakluk perubahan",
    source: "Sumber",
    notGazetted: "Belum diwartakan. Dianggarkan daripada peraturan dalam senarai rasmi {years} — untuk perancangan sahaja.",
    groupA: "Kumpulan A · Kedah, Kelantan, Terengganu", groupB: "Kumpulan B · negeri lain & Wilayah Persekutuan",
    noSchool: "Belum ada kalendar persekolahan rasmi KPM bagi {y} dalam aplikasi ini. Semak",
    replFriSat: "Cuti ganti di negeri ini diumumkan oleh kerajaan negeri (hari rehat Jumaat) dan tidak ditambah secara automatik.",
    replOther: "Cuti ganti di {s} ditetapkan melalui pemberitahuan negeri; hanya yang diwartakan dipaparkan.",
    days: "{n} hari",
    "lw.allStates": "Semua negeri", "lw.noLeave": "Tanpa cuti", "lw.plusLeave": "+{n} cuti",
    "lw.weekend": "Hujung minggu", "lw.holiday": "Cuti Umum", "lw.leave": "Cuti Tahunan",
    "lw.showingAll": "Memaparkan semua negeri. Pilih negeri anda untuk melihat negeri anda sahaja.",
    "lw.estimated": "Berdasarkan cuti anggaran — belum diwartakan.",
    "lw.daysOff": "{n} hari cuti", "lw.leaveDays": "{n} hari cuti tahunan", "lw.leaveDaysPl": "{n} hari cuti tahunan", "lw.noLeaveNeeded": "Tanpa cuti tahunan",
    "lw.none": "Tiada cuti panjang ditemui.", "lw.allStatesShort": "Semua negeri", "lw.only": "{list} sahaja", "lw.more": "+{n}",
    "set.language": "Bahasa", "set.appearance": "Paparan", "set.share": "Kongsi aplikasi ini", "set.sources": "Sumber data",
    "ap.system": "Ikut sistem", "ap.light": "Cerah", "ap.dark": "Gelap",
    "ap.note": "Dalam mod Ikut sistem, aplikasi mengikut telefon anda: tema cerah apabila telefon cerah, tema gelap apabila telefon gelap.",
    "ap.lightTheme": "Tema cerah", "ap.darkTheme": "Tema gelap",
    "th.classic": "Klasik", "th.paper": "Kertas", "th.mint": "Pudina", "th.lavender": "Lavender",
    "th.midnight": "Tengah Malam", "th.oled": "Hitam OLED", "th.slate": "Batu Loh", "th.grape": "Anggur",
    "sh.scan": "Imbas untuk buka di telefon lain", "sh.copy": "Salin pautan", "sh.copied": "Pautan disalin", "sh.native": "Kongsi…", "sh.whatsapp": "WhatsApp",
    "sh.text": "Kalendar Malaysia: cuti umum & cuti sekolah setiap negeri, tarikh lunar dan cuti panjang",
    "src.note": "Cuti umum 2026 dan 2027 diambil daripada senarai Jabatan Perdana Menteri (BKPP). Tahun seterusnya ialah anggaran yang dikira menggunakan peraturan yang sama dan dilabel \"anggaran\". Cuti ganti mengikut seksyen 3 Akta Hari Kelepasan 1951 jika terpakai secara automatik; Kedah, Kelantan, Terengganu, Sabah dan Sarawak mengumumkannya secara berasingan. Cuti sekolah daripada surat siaran KPM.",
    "x.title": "Tambah ke kalendar telefon", "x.what": "{s} · cuti umum + cuti sekolah",
    "x.subscribe": "Langgan (dikemas kini automatik)",
    "x.subNote": "Berfungsi dengan Kalendar iPhone, Google Calendar dan Outlook. Senarai rasmi baharu dikemas kini sendiri.",
    "x.iphone": "iPhone / Mac: Langgan", "x.android": "Android: Google Calendar",
    "x.feedOk": "Tukar negeri dahulu jika mahu suapan negeri lain.",
    "x.feedOff": "Pautan langganan berfungsi selepas aplikasi diterbitkan dalam talian. Muat turun fail buat masa ini.",
    "x.download": "Atau muat turun fail", "x.public": "Cuti umum", "x.school": "Cuti sekolah", "x.mine": "Acara saya",
    "x.estimated": "(anggaran)", "x.btn": "Muat turun .ics",
    "x.howto": "Di iPhone, buka fail dan tekan \"Add All\". Di Android, buka dengan Google Calendar atau Samsung Calendar. Fail yang dimuat turun tidak dikemas kini; muat turun semula selepas senarai rasmi berubah.",
  },
  zh: {
    "z.toggle": "生肖",
    "z.note": "生肖从农历新年开始算，不是 1 月 1 日。1 月或 2 月初出生的人，请看下面的起止日期。", "z.age": "今年满 {n} 岁",
    "upd.available": "有新版本。", "upd.btn": "更新", "about.title": "关于", "about.version": "版本", "about.updated": "最后更新", "about.check": "检查更新", "about.history": "更新记录", "about.latest": "已经是最新版本。", "about.found": "发现新版本，请点\"更新\"。", "about.offline": "离线时无法检查更新。",
    "legend.fest": "农历节日", "tag.fest": "传统节日",
    "lw.except": "除{list}外全部州属",
    "legend.part": "部分州属假期",
    "x.pickState": "请先选择州属：每个州的假期不同。", groupTagA: "A 组", groupTagB: "B 组", groupBoth: "A 组：吉打、吉兰丹、登嘉楼 · B 组：其他州属及联邦直辖区", nationalOnly: "全国",
    "set.country": "国家", "cat.compare": "对照", calendarOf: "{c}日历",
    "tag.workday": "调休上班", "tag.bridge": "集体休假", "tag.regional": "地区性", "tag.unconfirmed": "待确认",
    noOfficial: "{c} {y} 年官方假期清单尚未公布。只显示已正式公布的年份。",
    "cmp.with": "对照国家", "cmp.home": "你", "cmp.yourBreaks": "你的长假 —— 对方那边的情况",
    "cmp.busy": "{c}同时放假：人多、机票酒店较贵，部分地方可能休息。",
    "cmp.normal": "{c}这几天正常上班。", "cmp.workday": "{c}这天调休上班。",
    "cmp.both": "两地假期一览", "cmp.noData": "{c} {y} 年官方清单尚未公布。", "cmp.bothOff": "两地都放假",
    "cmp.intro": "安排旅行：把你的长假（含请假）和目的地的公共假期放在一起看。",
    appTitle: "马来西亚日历",
    back: "返回", addToCalendar: "加入手机日历", settings: "设置",
    statePick: "州属",
    "cat.public": "公共假期", "cat.school": "学校假期", "cat.long": "长周末",
    "legend.hol": "公共假期", "legend.school": "学校假期", "legend.evt": "我的事件",
    memo: "备忘", prevMonth: "上个月", nextMonth: "下个月", close: "关闭",
    evtPlaceholder: "添加我的事件", evtAdd: "添加", delete: "删除",
    nothingDay: "这天没有事项。", nothingMonth: "这个月没有事项。",
    "tag.est": "推算", "tag.estUnc": "推算 ±1天", "tag.repl": "补假", "tag.change": "或有更改",
    source: "来源",
    notGazetted: "尚未刊宪。按 {years} 年官方清单的规则推算，仅供规划参考。",
    groupA: "A 组 · 吉打、吉兰丹、登嘉楼", groupB: "B 组 · 其他州属及联邦直辖区",
    noSchool: "本 App 暂无 {y} 年教育部官方校历，请查看",
    replFriSat: "本州的补假由州政府另行宣布（周五为休息日），不会自动加入。",
    replOther: "{s}的补假由州政府宪报委任，只显示已刊宪的补假。",
    days: "{n} 天",
    "lw.allStates": "全部州属", "lw.noLeave": "不请假", "lw.plusLeave": "+{n} 天年假",
    "lw.weekend": "周末", "lw.holiday": "公共假期", "lw.leave": "年假",
    "lw.showingAll": "正在显示全部州属。选择你的州属可只看你的。",
    "lw.estimated": "根据推算的假期计算，尚未刊宪。",
    "lw.daysOff": "连休 {n} 天", "lw.leaveDays": "请 {n} 天年假", "lw.leaveDaysPl": "请 {n} 天年假", "lw.noLeaveNeeded": "不用请假",
    "lw.none": "没有找到长周末。", "lw.allStatesShort": "全部州属", "lw.only": "仅{list}", "lw.more": "及另外 {n} 州",
    "set.language": "语言", "set.appearance": "外观", "set.share": "分享这个 App", "set.sources": "资料来源",
    "ap.system": "跟随系统", "ap.light": "浅色", "ap.dark": "深色",
    "ap.note": "跟随系统时，App 会跟着手机设置：手机是浅色就用你的浅色主题，深色就用你的深色主题。",
    "ap.lightTheme": "浅色主题", "ap.darkTheme": "深色主题",
    "th.classic": "经典", "th.paper": "纸张", "th.mint": "薄荷", "th.lavender": "薰衣草",
    "th.midnight": "午夜", "th.oled": "OLED 纯黑", "th.slate": "石板", "th.grape": "葡萄",
    "sh.scan": "用另一部手机扫码打开", "sh.copy": "复制链接", "sh.copied": "链接已复制", "sh.native": "分享…", "sh.whatsapp": "WhatsApp",
    "sh.text": "马来西亚日历：各州公共假期、学校假期、农历和长周末",
    "src.note": "2026 和 2027 年公共假期取自首相署内阁司（BKPP）官方清单。之后的年份按同样规则推算，并标注\"推算\"。补假按《1951 年假期法令》第 3 条自动计算；吉打、吉兰丹、登嘉楼、沙巴和砂拉越的补假由州政府另行宣布。学校假期取自教育部通令。",
    "x.title": "加入手机日历", "x.what": "{s} · 公共假期 + 学校假期",
    "x.subscribe": "订阅（自动更新）",
    "x.subNote": "适用于 iPhone 日历、Google 日历和 Outlook。官方公布新清单后会自动更新。",
    "x.iphone": "iPhone / Mac：订阅", "x.android": "Android：Google 日历",
    "x.feedOk": "如要其他州的日历，请先切换州属。",
    "x.feedOff": "App 放上网后订阅链接才能使用，目前请先下载文件。",
    "x.download": "或下载文件", "x.public": "公共假期", "x.school": "学校假期", "x.mine": "我的事件",
    "x.estimated": "（推算）", "x.btn": "下载 .ics",
    "x.howto": "iPhone：打开文件后点\"Add All\"。Android：用 Google 日历或三星日历打开。下载的文件不会自动更新，官方清单更改后请重新下载。",
  },
};

export const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ms: ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"],
  zh: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
};
export const MONTH_TILE = {
  en: ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"],
  ms: ["JAN", "FEB", "MAC", "APR", "MEI", "JUN", "JULAI", "OGOS", "SEPT", "OKT", "NOV", "DIS"],
  zh: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
};
export const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ms: ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"],
  zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
};
export const LOCALE = { en: "en-MY", ms: "ms-MY", zh: "zh-CN" };

export const STATE_NAMES = {
  zh: { JHR: "柔佛", KDH: "吉打", KTN: "吉兰丹", MLK: "马六甲", NSN: "森美兰", PHG: "彭亨", PRK: "霹雳", PLS: "玻璃市",
    PNG: "槟城", SBH: "沙巴", SWK: "砂拉越", SGR: "雪兰莪", TRG: "登嘉楼", KUL: "吉隆坡", LBN: "纳闽", PJY: "布城" },
  ms: { JHR: "Johor", KDH: "Kedah", KTN: "Kelantan", MLK: "Melaka", NSN: "Negeri Sembilan", PHG: "Pahang", PRK: "Perak", PLS: "Perlis",
    PNG: "Pulau Pinang", SBH: "Sabah", SWK: "Sarawak", SGR: "Selangor", TRG: "Terengganu", KUL: "W.P. Kuala Lumpur", LBN: "W.P. Labuan", PJY: "W.P. Putrajaya" },
};

// English name → [Bahasa Melayu (JPM wording), 中文]
const HOLIDAY = {
  "New Year's Day": ["Tahun Baharu", "元旦"],
  "Birthday of Yang di-Pertuan Besar Negeri Sembilan": ["Hari Keputeraan Yang di-Pertuan Besar Negeri Sembilan", "森美兰州严端诞辰"],
  "Israk and Mikraj": ["Israk dan Mikraj", "先知登霄节"],
  "Federal Territory Day": ["Hari Wilayah Persekutuan", "联邦直辖区日"],
  "Thaipusam": ["Hari Thaipusam", "大宝森节"],
  "Chinese New Year": ["Tahun Baharu Cina", "农历新年"],
  "Awal Ramadan": ["Awal Ramadan", "斋戒月首日"],
  "Declaration of Independence Day (Melaka)": ["Hari Pengisytiharan Tarikh Kemerdekaan", "马六甲独立宣言日"],
  "Anniversary of Installation of Sultan of Terengganu": ["Hari Ulang Tahun Pertabalan Sultan Terengganu", "登嘉楼苏丹登基纪念日"],
  "Nuzul Al-Quran": ["Hari Nuzul Al-Quran", "可兰经降世日"],
  "Hari Raya Aidilfitri": ["Hari Raya Puasa", "开斋节"],
  "Birthday of Sultan of Johor": ["Hari Keputeraan Sultan Johor", "柔佛苏丹诞辰"],
  "Birthday of Yang di-Pertua Negeri Sabah": ["Hari Jadi Yang di-Pertua Negeri Sabah", "沙巴州元首诞辰"],
  "Good Friday": ["Good Friday", "耶稣受难日"],
  "Birthday of Sultan of Terengganu": ["Hari Keputeraan Sultan Terengganu", "登嘉楼苏丹诞辰"],
  "Labour Day": ["Hari Pekerja", "劳动节"],
  "Birthday of Raja of Perlis": ["Hari Ulang Tahun Keputeraan Raja Perlis", "玻璃市拉惹诞辰"],
  "Hol of Almarhum Sultan Ahmad Shah (Pahang)": ["Hari Hol Almarhum Sultan Ahmad Shah", "彭亨已故苏丹阿末沙忌日"],
  "Hari Arafah": ["Hari Arafah", "阿拉法日"],
  "Hari Raya Haji": ["Hari Raya Qurban", "哈芝节"],
  "Pesta Kaamatan": ["Pesta Kaamatan", "丰收节"],
  "Wesak Day": ["Hari Wesak", "卫塞节"],
  "Birthday of Yang di-Pertuan Agong": ["Hari Keputeraan Rasmi Seri Paduka Baginda Yang di-Pertuan Agong", "国家元首诞辰"],
  "Hari Gawai Dayak": ["Perayaan Hari Gawai Dayak", "达雅丰收节"],
  "Awal Muharram": ["Awal Muharam (Maal Hijrah)", "回历新年"],
  "Birthday of Sultan of Kedah": ["Hari Keputeraan Sultan Kedah", "吉打苏丹诞辰"],
  "George Town World Heritage City Day": ["Hari Ulang Tahun Perisytiharan Tapak Warisan Dunia", "乔治市世界遗产日"],
  "Birthday of Yang di-Pertua Negeri Pulau Pinang": ["Hari Jadi Yang di-Pertua Negeri Pulau Pinang", "槟城州元首诞辰"],
  "Hol of Almarhum Sultan Iskandar (Johor)": ["Hari Hol Almarhum Sultan Iskandar", "柔佛已故苏丹依斯干达忌日"],
  "Sarawak Independence Day": ["Hari Kemerdekaan Sarawak", "砂拉越独立日"],
  "Birthday of Sultan of Pahang": ["Hari Keputeraan Sultan Pahang", "彭亨苏丹诞辰"],
  "Birthday of Yang di-Pertua Negeri Melaka": ["Hari Jadi Yang di-Pertua Negeri Melaka", "马六甲州元首诞辰"],
  "Maulidur Rasul": ["Hari Keputeraan Nabi Muhammad S.A.W. (Maulidur Rasul)", "先知穆罕默德诞辰"],
  "National Day (Hari Kebangsaan)": ["Hari Kebangsaan", "国庆日"],
  "Malaysia Day": ["Hari Malaysia", "马来西亚日"],
  "Birthday of Sultan of Kelantan": ["Hari Keputeraan Sultan Kelantan", "吉兰丹苏丹诞辰"],
  "Birthday of Yang di-Pertua Negeri Sarawak": ["Hari Jadi Yang di-Pertua Negeri Sarawak", "砂拉越州元首诞辰"],
  "Birthday of Sultan of Perak": ["Hari Keputeraan Sultan Perak", "霹雳苏丹诞辰"],
  "Deepavali": ["Hari Deepavali", "屠妖节"],
  "Birthday of Sultan of Selangor": ["Hari Keputeraan Sultan Selangor", "雪兰莪苏丹诞辰"],
  "Christmas Eve": ["Christmas Eve", "平安夜"],
  "Christmas Day": ["Hari Krismas", "圣诞节"],
};
const SUFFIX = {
  "2nd day": ["Hari Kedua", "第二天"],
  "3rd day": ["Hari Ketiga", "第三天"],
  "replacement": ["Cuti Ganti", "补假"],
};
const SCHOOL = {
  "Year-end holiday 2025/2026 (ends)": ["Cuti Akhir Persekolahan 2025/2026 (tamat)", "2025/2026 年终假期（结束）"],
  "Term 1 break": ["Cuti Penggal 1", "第一学期假期"],
  "Mid-year holiday": ["Cuti Pertengahan Tahun", "年中假期"],
  "Term 2 break": ["Cuti Penggal 2", "第二学期假期"],
  "Year-end holiday": ["Cuti Akhir Persekolahan", "年终假期"],
  "KPM festive holiday (Chinese New Year)": ["Cuti Perayaan Tambahan KPM (Tahun Baharu Cina)", "教育部节庆加假（农历新年）"],
  "KPM festive holiday (Hari Raya Aidilfitri)": ["Cuti Perayaan Tambahan KPM (Hari Raya Aidilfitri)", "教育部节庆加假（开斋节）"],
  "KPM festive holiday (Deepavali)": ["Cuti Perayaan Tambahan KPM (Deepavali)", "教育部节庆加假（屠妖节）"],
  "KPM holiday (Deepavali, Sarawak)": ["Cuti Peruntukan KPM (Deepavali, Sarawak)", "教育部假期（屠妖节，砂拉越）"],
};

let lang = "en";
export const getLang = () => lang;
export function setLang(l) { if (T[l]) lang = l; }

export function t(key, vars = {}) {
  const s = T[lang][key] ?? T.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

const col = () => (lang === "ms" ? 0 : 1);

export function holidayName(name) {
  if (lang === "en") return name;
  const m = name.match(/^(.*?) \((2nd day|3rd day|replacement)\)$/);
  const base = m ? m[1] : name;
  const tr = HOLIDAY[base]?.[col()] ?? base;
  if (!m) return tr;
  const suf = SUFFIX[m[2]][col()];
  return lang === "zh" ? `${tr}（${suf}）` : `${tr} (${suf})`;
}

export function schoolName(name) {
  return lang === "en" ? name : SCHOOL[name]?.[col()] ?? name;
}

export function stateName(code, fallback) {
  return lang === "en" ? fallback : STATE_NAMES[lang][code] ?? fallback;
}

// Apply translations to elements marked data-i18n / data-i18n-ph / data-i18n-aria.
export function applyStatic(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); el.title = t(el.dataset.i18nAria); });
  document.documentElement.lang = { zh: "zh-Hans", en: "en", ms: "ms" }[lang];
}
