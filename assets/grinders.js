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

const grinderProfiles = [
  { id: "c40", brand: "Comandante", model: "C40 MK4 · Standard", curve: c40Curve, basis: c40Basis, source: onyxSource, guide: comandanteReference },
  { id: "c40-red", brand: "Comandante", model: "C40 MK4 · Red Clix", curve: c40Curve.map(([clicks, microns]) => [clicks * 2, microns]), basis: c40Basis + " · Red Clix clicks inferred at 2×", source: onyxSource, guide: comandanteReference },
  { id: "k-ultra", brand: "1Zpresso", model: "K-Ultra", curve: kUltraCurve, basis: onyxBasis, source: onyxSource, maxClicks: 150 },
  { id: "zp6", brand: "1Zpresso", model: "ZP6 Special" },
  { id: "j-ultra", brand: "1Zpresso", model: "J-Ultra" },
  { id: "x-ultra", brand: "1Zpresso", model: "X-Ultra", maxClicks: 270 },
  { id: "jx-pro-s", brand: "1Zpresso", model: "JX-Pro S" },
  { id: "k4", brand: "KINGrinder", model: "K4", guide: kingrinderReference },
  { id: "k6", brand: "KINGrinder", model: "K6", curve: k6Curve, basis: "Median particle size (D50) · 9 Bar Benchmark (DiFluid Omni)", source: "https://www.9barbenchmark.com/grinders/kingrinder-k6-review", guide: kingrinderReference },
  { id: "q-air", brand: "1Zpresso", model: "Q Air" },
  { id: "k-max", brand: "1Zpresso", model: "K-Max" },
  { id: "c60", brand: "Comandante", model: "C60 Baracuda", guide: "https://comandantegrinder.com/downloads/c60-baracuda.pdf" },
  { id: "k2", brand: "KINGrinder", model: "K2", guide: kingrinderReference },
  { id: "c3", brand: "Timemore", model: "Chestnut C3", guide: "https://www.timemore.com/collections/coffee-grinder-manual/products/c3-series" },
  { id: "c3-esp-pro", brand: "Timemore", model: "Chestnut C3 ESP Pro", guide: "https://www.timemore.com/collections/coffee-grinder-manual/products/c3-series" },
  { id: "encore", brand: "Baratza", model: "Encore", curve: encoreCurve, basis: onyxBasis, source: onyxSource, setting: String, maxClicks: 40 },
  { id: "encore-esp", brand: "Baratza", model: "Encore ESP", guide: "https://www.baratza.com/en-us/product/encore-esp-zcg495" },
  { id: "vario-plus", brand: "Baratza", model: "Vario+", guide: "https://www.baratza.com/en-us/product/vario-zcg820" },
  { id: "ode-gen2", brand: "Fellow", model: "Ode Gen 2", curve: odeCurve, basis: onyxBasis, source: onyxSource, setting: odeSetting, maxClicks: 31 },
  { id: "opus-2", brand: "Fellow", model: "Opus 2", guide: "https://help.fellowproducts.com/hc/en-us/articles/48922628360731-What-s-new-with-Opus-2" },
  { id: "ek43", brand: "Mahlkönig", model: "EK43", guide: "https://www.mahlkoenig.com/products/ek43" },
];

const grinderName = (profile) => profile.brand + " " + profile.model;
const grinderSetting = (profile, position) => profile.setting ? "dial " + profile.setting(position) : position + (position === 1 ? " click from zero" : " clicks from zero");

function estimateClicks(curve, microns) {
  const index = curve.findIndex((point) => point[1] >= microns);
  if (index < 0 || microns < curve[0][1]) return null;
  if (index === 0) return Math.round(curve[0][0]);
  const [lowerClicks, lowerMicrons] = curve[index - 1];
  const [upperClicks, upperMicrons] = curve[index];
  return Math.round(lowerClicks + (upperClicks - lowerClicks) * (microns - lowerMicrons) / (upperMicrons - lowerMicrons));
}
