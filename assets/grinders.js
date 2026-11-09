const onyxSource = "https://onyxcoffeelab.eu/pages/grind-size-calculator";
const grinderReference = "https://1zpresso.coffee/grind-setting/";
const kingrinderReference = "https://www.kingrinder.com/jp";
const comandanteReference = "https://comandantegrinder.com/downloads/C40-Manual-E-Q3-21-web.pdf";

function measuredCurve(points) {
  const blocks = [];
  for (const [clicks, microns] of points) {
    blocks.push({ first: clicks, last: clicks, mean: microns, count: 1 });
    while (blocks.length > 1 && blocks.at(-2).mean >= blocks.at(-1).mean) {
      const right = blocks.pop();
      const left = blocks.pop();
      const count = left.count + right.count;
      blocks.push({ first: left.first, last: right.last, count, mean: (left.mean * left.count + right.mean * right.count) / count });
    }
  }
  return blocks.map(({ first, last, mean }) => [(first + last) / 2, mean]);
}

// Onyx labels these measurements average particle size. Use the rising C40 range;
// the published samples above 29 clicks reverse direction substantially.
const c40Curve = measuredCurve([
  [14,497], [15,480], [16,494], [17,527], [18,494], [19,720], [20,713], [21,685],
  [22,767], [23,805], [24,924], [25,897], [26,1010], [27,1022], [28,1077], [29,1167],
]);
const kUltraCurve = measuredCurve([
  [40,479], [42,487], [44,479], [46,506], [48,505], [50,555], [52,531], [54,600],
  [56,633], [58,576], [60,640], [62,695], [64,614], [66,692], [68,715], [70,742],
  [72,754], [74,760], [76,788], [78,849], [80,743], [82,711], [84,928], [86,853],
  [88,783], [90,998], [92,1051], [94,1053], [96,1181], [98,1156], [100,1127],
  [102,1299], [104,1207], [106,1271], [108,1222], [110,1249], [112,1182],
  [114,1280], [116,1186], [118,1241], [120,1230], [122,1254], [124,1236],
  [126,1229], [128,1293], [130,1302], [132,1335], [134,1393], [136,1332],
  [138,1374], [140,1412],
]);
// Mean D50 of five DiFluid Omni runs per setting from 9 Bar Benchmark.
const k6Curve = measuredCurve([
  [20,350.38], [30,369.22], [40,441.56], [50,582.6], [60,629.8], [70,747.8],
  [80,801.82], [90,943.48], [100,934.68], [110,1151.04], [120,1161.32],
]);
// Same D50 protocol as K6. Timemore's ESP dial uses 30 clicks per turn.
// Start at 0.4 turns to stay outside the manufacturer's finest exclusion zone.
const c3EspProCurve = measuredCurve([
  [12,341.82], [18,405], [24,444.82], [30,530.66], [36,659.18], [42,809.38],
  [48,944.94], [54,1128.7], [60,1255.12], [66,1304.98], [72,1180.5],
  [78,1591.28], [84,1632.3], [90,1619.72],
]);
const benchmarkBasis = "Median particle size (D50) · 9 Bar Benchmark (DiFluid Omni)";
const onyxBasis = "Average particle size · Onyx Coffee Lab (DiFluid Omni)";
const c40Basis = onyxBasis + " · C40 sample, applied to MK4 standard";
const encoreCurve = measuredCurve([
  [4,431], [5,438], [6,461], [7,475], [8,470], [9,478], [10,542], [11,538], [12,541],
  [13,625], [14,577], [15,701], [16,583], [17,664], [18,700], [19,846], [20,889],
  [21,867], [22,842], [23,844], [24,932], [25,1017], [26,1107], [27,1165], [28,1191],
  [29,1275], [30,1139], [31,1210], [32,1198], [33,1458], [34,1341], [35,1110], [36,1405], [37,1311],
]);
const odeCurve = measuredCurve([
  446,451,472,499,494,543,529,627,604,676,644,708,671,689,717,775,827,830,892,848,
  790,821,907,771,864,894,1051,1150,1268,1278,1296,
].map((microns, index) => [index + 1, microns]));
const odeSetting = (step) => {
  const index = step - 1;
  const number = Math.floor(index / 3) + 1;
  return index % 3 ? number + " + " + index % 3 + (index % 3 === 1 ? " notch" : " notches") : String(number);
};

const dcUns = "https://gall.dcinside.com/mgallery/board/view/?id=coffee&no=275747";
const dcK6 = "https://gall.dcinside.com/mgallery/board/view/?id=coffee&no=196804";
const unsBasis = "Community measurement · DCInside / Unspecialty photo guide · author’s zero point";
const decimalDial = (position) => (position / 10).toFixed(1);
const encoreEsp = measuredCurve([[2,390.06],[4,373.36],[6,343.16],[8,374.16],[10,421.46],[12,443.04],[14,547.72],[16,581.08],[18,638.06],[20,753],[22,823.74],[24,1041.5],[26,1030.24],[28,1256.7],[30,1275.6],[32,1459.98],[34,1490.56],[36,1649.74],[38,1724.14],[40,1617.54]]);
const opus = measuredCurve([[1,379.44],[2,437.72],[3,571.54],[4,617.68],[5,697.96],[6,824.62],[7,841.36],[8,1043.36],[9,1152.56],[10,1155.6],[11,1291.68]]);
const gevi = measuredCurve([[1,346.02],[2,382.74],[3,426.04],[4,467.22],[5,539.98],[6,565.8],[7,638.06],[8,713.84],[9,765.3],[10,835.2],[11,826.98]]);
// Use Onyx's whole-mark samples for stepless dials, with tenths as display increments.
const ek43 = measuredCurve([[30,438],[40,479],[50,522],[60,536],[70,622],[80,638],[90,695],[100,707],[110,732],[120,779],[130,745],[140,910],[150,1010],[160,1022]]);
const opus2 = measuredCurve([[20,512],[30,652],[40,675],[50,911],[60,894],[70,955],[80,1059],[90,930],[100,1095]]);
const vario = measuredCurve([[1,428],[2,429],[3,470],[4,520],[5,644],[6,710],[7,790],[8,978],[9,998],[10,1176]]);
const zp6 = measuredCurve([[21,600],[26,650],[31,700],[36,775],[41,850],[46,900]]);
const kUltraCommunity = measuredCurve([[40,650],[50,750],[60,850],[70,900],[80,980],[90,1080],[95,1150],[100,1220]]);
const k6Community = measuredCurve([[70,852],[80,969.5],[90,1069.5],[100,1143.5],[110,1193],[120,1302]]);

const grinderProfiles = [
  { id: "c40", brand: "Comandante", model: "C40 MK4 · Standard", curve: c40Curve, basis: c40Basis, source: onyxSource, guide: comandanteReference },
  { id: "c40-red", brand: "Comandante", model: "C40 MK4 · Red Clix", curve: c40Curve.map(([clicks, microns]) => [clicks * 2, microns]), basis: c40Basis + " · Red Clix clicks inferred at 2×", source: onyxSource, guide: comandanteReference },
  { id: "k-ultra", brand: "1Zpresso", model: "K-Ultra", curve: kUltraCurve, basis: onyxBasis, source: onyxSource, maxClicks: 150, community: { curve: kUltraCommunity, source: dcUns, label: "Unspecialty photo guide, author’s zero point" } },
  { id: "zp6", brand: "1Zpresso", model: "ZP6 Special", curve: zp6, basis: unsBasis, source: dcUns, maxClicks: 90 },
  { id: "j-ultra", brand: "1Zpresso", model: "J-Ultra" },
  { id: "x-ultra", brand: "1Zpresso", model: "X-Ultra", maxClicks: 270 },
  { id: "jx-pro-s", brand: "1Zpresso", model: "JX-Pro S" },
  { id: "k4", brand: "KINGrinder", model: "K4", guide: kingrinderReference },
  { id: "k6", brand: "KINGrinder", model: "K6", curve: k6Curve, basis: benchmarkBasis, source: "https://www.9barbenchmark.com/grinders/kingrinder-k6-review", guide: kingrinderReference, community: { curve: k6Community, source: dcK6, label: "Single-bean photo test, author’s zero five clicks below dial zero" } },
  { id: "q-air", brand: "1Zpresso", model: "Q Air" },
  { id: "k-max", brand: "1Zpresso", model: "K-Max" },
  { id: "c60", brand: "Comandante", model: "C60 Baracuda", guide: "https://comandantegrinder.com/downloads/c60-baracuda.pdf" },
  { id: "k2", brand: "KINGrinder", model: "K2", guide: kingrinderReference },
  { id: "c3", brand: "Timemore", model: "Chestnut C3", guide: "https://www.timemore.com/collections/coffee-grinder-manual/products/c3-series" },
  { id: "c3-esp-pro", brand: "Timemore", model: "Chestnut C3 ESP Pro", curve: c3EspProCurve, basis: benchmarkBasis, source: "https://www.9barbenchmark.com/grinders/c3-esp-pro-review", guide: "https://www.timemore.com/collections/coffee-grinder-manual/products/c3-series", maxClicks: 90 },
  { id: "encore", brand: "Baratza", model: "Encore", curve: encoreCurve, basis: onyxBasis, source: onyxSource, setting: String, maxClicks: 40 },
  { id: "encore-esp", brand: "Baratza", model: "Encore ESP", guide: "https://www.baratza.com/en-us/product/encore-esp-zcg495", curve: encoreEsp, basis: benchmarkBasis, source: "https://www.9barbenchmark.com/grinders/encore-esp", setting: String, maxClicks: 40 },
  { id: "vario-plus", brand: "Baratza", model: "Vario+", guide: "https://www.baratza.com/en-us/product/vario-zcg820", curve: vario, basis: onyxBasis + " · micro lever fixed at M", source: onyxSource, setting: (position) => position + "M", maxClicks: 10 },
  { id: "ode-gen2", brand: "Fellow", model: "Ode Gen 2", curve: odeCurve, basis: onyxBasis, source: onyxSource, setting: odeSetting, maxClicks: 31 },
  { id: "opus-2", brand: "Fellow", model: "Opus 2", guide: "https://help.fellowproducts.com/hc/en-us/articles/48922628360731-What-s-new-with-Opus-2", curve: opus2, basis: onyxBasis + " · stepless dial, whole-mark samples", source: onyxSource, setting: decimalDial, maxClicks: 100 },
  { id: "ek43", brand: "Mahlkönig", model: "EK43", guide: "https://www.mahlkoenig.com/products/ek43", curve: ek43, basis: onyxBasis + " · stepless dial, whole-mark samples", source: onyxSource, setting: decimalDial, maxClicks: 160 },
  { id: "opus", brand: "Fellow", model: "Opus (original)", curve: opus, basis: benchmarkBasis + " · inner ring unchanged", source: "https://www.9barbenchmark.com/grinders/fellow-opus-review", setting: String, maxClicks: 11 },
  { id: "gevi-velpro-400", brand: "Gevi", model: "VelPro 400", curve: gevi, basis: benchmarkBasis, source: "https://www.9barbenchmark.com/grinders/gevi-velpro-400-review", setting: String, maxClicks: 11 },
  { id: "1zpresso-j", brand: "1Zpresso", model: "J", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-j-max-s", brand: "1Zpresso", model: "J-Max S", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-jx-pro", brand: "1Zpresso", model: "JX-Pro", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-x-pro-s", brand: "1Zpresso", model: "X-Pro S", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-q2-s", brand: "1Zpresso", model: "Q2 S", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-k-pro", brand: "1Zpresso", model: "K-Pro", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-k-plus", brand: "1Zpresso", model: "K-Plus", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-je-plus", brand: "1Zpresso", model: "JE-Plus", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-z-pro", brand: "1Zpresso", model: "Z-Pro", guide: "https://1zpresso.coffee/manual/" },
  { id: "1zpresso-diamond-a", brand: "1Zpresso", model: "Diamond A", guide: "https://1zpresso.coffee/manual/" },
  { id: "kingrinder-k0", brand: "KINGrinder", model: "K0", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-k1", brand: "KINGrinder", model: "K1", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-k3", brand: "KINGrinder", model: "K3", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-k5", brand: "KINGrinder", model: "K5", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-k7", brand: "KINGrinder", model: "K7", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-p0", brand: "KINGrinder", model: "P0", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-p1", brand: "KINGrinder", model: "P1", guide: "https://www.kingrinder.com/manual" },
  { id: "kingrinder-p2", brand: "KINGrinder", model: "P2", guide: "https://www.kingrinder.com/manual" },
  { id: "timemore-chestnut-c2", brand: "Timemore", model: "Chestnut C2", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-chestnut-c3s", brand: "Timemore", model: "Chestnut C3S", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-chestnut-c3-esp", brand: "Timemore", model: "Chestnut C3 ESP", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-chestnut-x-lite", brand: "Timemore", model: "Chestnut X Lite", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-sculptor-064", brand: "Timemore", model: "Sculptor 064", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-sculptor-064s", brand: "Timemore", model: "Sculptor 064S", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-sculptor-078", brand: "Timemore", model: "Sculptor 078", guide: "https://www.timemore.co.kr/manual" },
  { id: "timemore-sculptor-078s", brand: "Timemore", model: "Sculptor 078S", guide: "https://www.timemore.co.kr/manual" },
  { id: "comandante-x25-trailmaster", brand: "Comandante", model: "X25 Trailmaster", guide: "https://comandantegrinder.com/pages/faq" },
  { id: "comandante-c40-lab-tigershark", brand: "Comandante", model: "C40 LAB Tigershark", guide: "https://comandantegrinder.com/pages/faq" },
  { id: "comandante-c40-lab-hammerhead", brand: "Comandante", model: "C40 LAB Hammerhead", guide: "https://comandantegrinder.com/pages/faq" },
  { id: "comandante-c40-lab-nitro-blade", brand: "Comandante", model: "C40 LAB Nitro Blade", guide: "https://comandantegrinder.com/pages/faq" },
  { id: "option-o-lagom-casa", brand: "OPTION-O", model: "LAGOM Casa", guide: "https://www.option-o.com/user-guide-manual" },
  { id: "option-o-lagom-01", brand: "OPTION-O", model: "LAGOM 01", guide: "https://www.option-o.com/user-guide-manual" },
  { id: "option-o-lagom-mini-2", brand: "OPTION-O", model: "LAGOM Mini 2", guide: "https://www.option-o.com/user-guide-manual" },
  { id: "option-o-lagom-p64", brand: "OPTION-O", model: "LAGOM P64", guide: "https://www.option-o.com/user-guide-manual" },
  { id: "femobook-a2", brand: "Femobook", model: "A2", guide: "https://www.femobook.com/pages/faq_2026" },
  { id: "femobook-a3", brand: "Femobook", model: "A3", guide: "https://www.femobook.com/pages/faq_2026" },
  { id: "femobook-a4", brand: "Femobook", model: "A4", guide: "https://www.femobook.com/pages/faq_2026" },
  { id: "femobook-a4z", brand: "Femobook", model: "A4Z", guide: "https://www.femobook.com/pages/faq_2026" },
  { id: "femobook-a5", brand: "Femobook", model: "A5", guide: "https://www.femobook.com/pages/faq_2026" },
  { id: "femobook-a68", brand: "Femobook", model: "A68", guide: "https://www.femobook.com/pages/faq_2026" },
  { id: "kinu-m47-classic", brand: "Kinu", model: "M47 Classic", guide: "https://kinu.vn/en/support/downloads" },
  { id: "kinu-m47-phoenix", brand: "Kinu", model: "M47 Phoenix", guide: "https://kinu.vn/en/support/downloads" },
  { id: "kinu-m47-simplicity", brand: "Kinu", model: "M47 Simplicity", guide: "https://kinu.vn/en/support/downloads" },
  { id: "kinu-m47-titan", brand: "Kinu", model: "M47 Titan", guide: "https://kinu.vn/en/support/downloads" },
  { id: "turin-df64-gen-2", brand: "Turin", model: "DF64 Gen 2", guide: "https://dfgrinders.ca/pages/manuals-and-guides" },
  { id: "turin-df64v", brand: "Turin", model: "DF64V", guide: "https://dfgrinders.ca/pages/manuals-and-guides" },
  { id: "turin-df83v", brand: "Turin", model: "DF83V", guide: "https://dfgrinders.ca/pages/manuals-and-guides" },
  { id: "millab-m01", brand: "Millab", model: "M01", guide: "https://millab.com/products/m01" },
  { id: "pietro-m-modal", brand: "Pietro", model: "M-Modal", guide: "https://ep-shopify.s3.amazonaws.com/related-documents/pietro/pietro-manual.pdf" },
  { id: "pietro-b-modal", brand: "Pietro", model: "B-Modal", guide: "https://ep-shopify.s3.amazonaws.com/related-documents/pietro/pietro-manual.pdf" },
  { id: "mazzer-philos", brand: "Mazzer", model: "Philos", guide: "https://www.mazzer.com/wp-content/uploads/2023/10/depliant-Philos-2023-ENG-WEB.pdf" },
];

const brewReferences = {
  "timemore-sculptor-064s": { text: "Pour-over example: dial 15, 20 g coffee / 300 g water, 3:20 total.", source: "https://gall.dcinside.com/mgallery/board/view/?id=coffee&no=210249" },
  "millab-m01": { text: "Pour-over comparison: dial 7.5 on the author’s M01, with a 50 / 150 / 250 g pour schedule.", source: "https://gall.dcinside.com/mgallery/board/view/?id=coffee&no=602260" },
  "comandante-c40-lab-tigershark": { text: "Pour-over comparison: 27 clicks on the author’s Tigershark, with a 50 / 150 / 250 g pour schedule.", source: "https://gall.dcinside.com/mgallery/board/view/?id=coffee&no=602260" },
  "option-o-lagom-casa": { text: "Pour-over comparison: dial 24 on the author’s Casa, matched to a similar drawdown time.", source: "https://gall.dcinside.com/mgallery/board/view/?id=coffee&no=533623" },
};

const grinderName = (profile) => profile.brand + " " + profile.model;
const grinderSetting = (profile, position) => profile.setting ? "dial " + profile.setting(position) : position + (position === 1 ? " click from zero" : " clicks from zero");

function estimateClicks(curve, microns) {
  if (!Number.isFinite(microns)) return null;
  const index = curve.findIndex((point) => point[1] >= microns);
  if (index < 0 || microns < curve[0][1]) return null;
  if (curve[index][1] === microns) return { clicks: Math.round(curve[index][0]), interval: [microns] };
  const [lowerClicks, lowerMicrons] = curve[index - 1];
  const [upperClicks, upperMicrons] = curve[index];
  const clicks = Math.round(lowerClicks + (upperClicks - lowerClicks) * (microns - lowerMicrons) / (upperMicrons - lowerMicrons));
  return { clicks, interval: [lowerMicrons, upperMicrons] };
}
