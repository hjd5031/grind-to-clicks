const grinderProfiles = [
  { id: "c40", brand: "Comandante", model: "C40 MK4 · Standard", step: 30, approximate: true, source: "https://notchbook.coffee/grinders/comandante-c40" },
  { id: "c40-red", brand: "Comandante", model: "C40 MK4 · Red Clix", step: 15, approximate: true, source: "https://notchbook.coffee/grinders/comandante-c40" },
  { id: "k-ultra", brand: "1Zpresso", model: "K-Ultra", step: 20, maxClicks: 150 },
  { id: "zp6", brand: "1Zpresso", model: "ZP6 Special", step: 22 },
  { id: "j-ultra", brand: "1Zpresso", model: "J-Ultra", step: 8 },
  { id: "x-ultra", brand: "1Zpresso", model: "X-Ultra", step: 12.5, maxClicks: 270 },
  { id: "jx-pro-s", brand: "1Zpresso", model: "JX-Pro S", step: 12.5 },
  { id: "k4", brand: "KINGrinder", model: "K4", step: 16, source: "https://www.kingrinder.com/exterior-adjustment" },
  { id: "k6", brand: "KINGrinder", model: "K6", step: 16, source: "https://www.kingrinder.com/store/products/k6" },
];

const grinderReference = "https://1zpresso.coffee/grind-setting/";
const grinderName = (profile) => profile.brand + " " + profile.model;

