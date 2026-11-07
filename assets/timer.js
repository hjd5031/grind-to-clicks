const defaultRecipe = { coffee: 15, steps: [
  { title: "Bloom", duration: 45, water: 45, note: "Wet the grounds evenly and let the coffee bloom." },
  { title: "First pour", duration: 30, water: 105, note: "Pour slowly in circles." },
  { title: "Final pour", duration: 30, water: 100, note: "Pour the remaining water." },
  { title: "Drawdown", duration: 75, water: 0, note: "Let the water drain through the coffee bed." },
] };
function pourSteps(pours) {
  return pours.map(([title, duration, water, note = ""]) => ({ title, duration, water, note }));
}

const ahnStarSource = "https://thorn-dart-59b.notion.site/AhnStar-Recipe-1716bf799cac80acbf20dac921797803";
const ruleSource = "https://thorn-dart-59b.notion.site/2556bf799cac80aa9633dfde607080e6";
const deepBlueSource = "https://thorn-dart-59b.notion.site/Deep-Blue-Lake-Coffee-2436bf799cac80c7885de87cda04bbac";
const recipePresets = {
  default: defaultRecipe,
  kasuya: {
    coffee: 20,
    source: "https://thorn-dart-59b.notion.site/Tetsu-Kasuya-s-Recipe-1716bf799cac804eb9f1f7703e831f92",
    note: "Grind: 1,100–1,200 µm. Water: 93 °C light, 88 °C medium, 83 °C or cooler dark.",
    steps: [45, 45, 45, 45, 30].map((duration, index) => ({ title: "Pour " + (index + 1), duration, water: 60, note: "" })),
  },
  hoffmann: {
    coffee: 30,
    source: "https://thorn-dart-59b.notion.site/James-Hoffmann-Best-V60-Technique-1716bf799cac80e1a792cc769e5b1478",
    note: "Water: 95–100 °C.",
    steps: [
      { title: "Bloom", duration: 45, water: 60, note: "Swirl after wetting the grounds." },
      { title: "First pour", duration: 30, water: 240, note: "Pour steadily to reach 300 g." },
      { title: "Final pour and drawdown", duration: 135, water: 200, note: "Pour to 500 g, swirl and let the bed drain." },
    ],
  },
  "ahnstar-20": {
    coffee: 20,
    source: ahnStarSource,
    note: "92 °C · 1,000–1,100 µm. Aim to finish at 2:10–2:40. The timer marks 2:40.",
    steps: pourSteps([["Bloom", 30, 60], ["First pour", 30, 80], ["Second pour", 30, 80], ["Final pour and drawdown", 70, 80]]),
  },
  "ahnstar-40": {
    coffee: 40,
    source: ahnStarSource,
    note: "86 °C · 1,000–1,100 µm. Aim to finish at 2:10–2:40. The timer marks 2:40.",
    steps: pourSteps([["Bloom", 30, 120], ["First pour", 30, 160], ["Second pour", 30, 160], ["Final pour and drawdown", 70, 160]]),
  },
  "momos-filter": {
    coffee: 20,
    source: "https://thorn-dart-59b.notion.site/Momos-Coffee-Recipe-1716bf799cac80278b72dfb9243e54d8",
    note: "V60 · 93–95 °C · C40 about 8–12 on the recipe card. Add 130–150 g of water after brewing if desired.",
    steps: pourSteps([["Bloom", 30, 40, "Stir with a spoon."], ["Final pour and drawdown", 90, 80, "Stir again and let the bed drain."]]),
  },
  "toch-v60": {
    coffee: 18,
    source: "https://thorn-dart-59b.notion.site/T-O-CH-Coffee-1926bf799cac800eb5e8c9b77d1dc4c2",
    note: "V60 02 · 92 °C · 1,000–1,200 µm. Aim for 2:00–2:20. Add 80–100 g of water after brewing.",
    steps: pourSteps([["Bloom", 30, 40], ["First pour", 30, 40], ["Second pour", 30, 40], ["Center pour and drawdown", 50, 30]]),
  },
  "yongchaem-switch": {
    coffee: 20,
    source: "https://thorn-dart-59b.notion.site/2546bf799cac800f8031e67052e00014",
    note: "Hario Switch iced · 94 °C · 950–1,050 µm.",
    finish: "Open the Switch.",
    steps: pourSteps([["Bloom", 40, 50], ["First pour", 50, 70], ["Second pour", 30, 70, "Close the Switch."], ["Final pour", 20, 10, "Use room-temperature water."]]),
  },
  "rule-484": {
    coffee: 20,
    source: ruleSource,
    note: "94–95 °C · 800–900 µm. Add 120–140 g of bypass water at 2:40.",
    finish: "Add 120–140 g of bypass water.",
    steps: pourSteps([["Bloom", 60, 40], ["First pour", 60, 80], ["Final pour and drawdown", 40, 40]]),
  },
  "rule-8g": {
    coffee: 8,
    source: ruleSource,
    note: "96 °C · 830 ± 58 µm. Finish at 1:40–2:10. The timer marks 2:10.",
    steps: pourSteps([["Bloom", 45, 25, "Preheat the brewer and keep the water hot."], ["Pour and drawdown", 85, 125, "Use a thin stream. Pour in circles to 80–90 g total, then pour in the center."]]),
  },
  "deep-blue-orea-hot": {
    coffee: 15,
    source: deepBlueSource,
    note: "93–94 °C · 700–750 µm. Aim for 2:30–2:40. The timer marks 2:40.",
    steps: pourSteps([["Bloom", 30, 50], ["First pour", 30, 50], ["Second pour", 30, 50], ["Third pour", 30, 50], ["Final pour and drawdown", 40, 40]]),
  },
  "deep-blue-orea-iced": {
    coffee: 22,
    source: deepBlueSource,
    note: "93–94 °C · 650–700 µm. Aim for 2:20–2:30. The timer marks 2:30. Ice is separate from the brew ratio.",
    finish: "Remove the dripper, add 100 g of ice and swirl.",
    steps: pourSteps([["Bloom", 30, 50], ["First pour", 30, 70], ["Second pour", 30, 50], ["Final pour and drawdown", 60, 50]]),
  },
  "deep-blue-v60-hot": {
    coffee: 15,
    source: deepBlueSource,
    note: "93–94 °C · C40 28–30 clicks on the recipe card. Aim for 2:40–2:50. The timer marks 2:50.",
    steps: pourSteps([["Bloom", 30, 50], ["First pour", 30, 50], ["Second pour", 30, 50], ["Third pour", 30, 50], ["Final pour and drawdown", 50, 40]]),
  },
};
const recipeKey = "grind-to-clicks-recipe";
const stepLimit = 20;
const mode = document.querySelector("#mode");
const time = document.querySelector("#time");
const stage = document.querySelector("#stage");
const state = document.querySelector("#timer-state");
const ring = document.querySelector("#timer-ring");
const toggle = document.querySelector("#toggle");
const lap = document.querySelector("#lap");
const reset = document.querySelector("#reset");
const guideList = document.querySelector("#guide-list");
const lapList = document.querySelector("#lap-list");
const lapEmpty = document.querySelector("#lap-empty");
const lapStatus = document.querySelector("#lap-status");
const guidePanel = document.querySelector("#guide-panel");
const lapPanel = document.querySelector("#lap-panel");
const editor = document.querySelector("#recipe-editor");
const editRecipe = document.querySelector("#edit-recipe");
const recipeForm = document.querySelector("#recipe-form");
const coffeeInput = document.querySelector("#coffee-grams");
const editorRatio = document.querySelector("#editor-ratio");
const stepFields = document.querySelector("#recipe-steps");
const stepTemplate = document.querySelector("#recipe-step-template");
const addStep = document.querySelector("#add-step");
const preset = document.querySelector("#recipe-preset");
const presetNote = document.querySelector("#preset-note");
const presetSource = document.querySelector("#preset-source");
const grams = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const ratioFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const brewRatio = (coffee, water) => coffee > 0 && water > 0 ? "1:" + ratioFormat.format(water / coffee) : "—";

const params = new URLSearchParams(location.search);
const profile = grinderProfiles.find((entry) => entry.id === params.get("grinder"));
const clicks = Number(params.get("clicks"));
if (profile && Number.isInteger(clicks) && clicks >= 1 && clicks <= (profile.maxClicks ?? 999)) {
  const setting = document.querySelector("#brew-setting");
  setting.textContent = grinderName(profile) + " · " + grinderSetting(profile, clicks);
  setting.hidden = false;
}

let startedAt = null;
let elapsed = 0;
let interval = null;
let lastLap = 0;
let stageKey = "";
const guided = () => mode.value === "guided";
const elapsedNow = () => elapsed + (startedAt === null ? 0 : performance.now() - startedAt);
const format = (seconds) => String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");

let guide = [];
let guideEnd = 0;
let recipe = defaultRecipe;
let customRecipe;
try {
  const saved = JSON.parse(localStorage.getItem(recipeKey));
  if (saved && validRecipe(saved)) {
    customRecipe = saved;
    recipe = saved;
    preset.append(new Option("My recipe", "custom", false, true));
  }
} catch {
  // The timer still works when browser storage is unavailable.
}

function validRecipe(value) {
  return Number.isFinite(value.coffee) && value.coffee >= 0.1 && value.coffee <= 9999
    && Array.isArray(value.steps) && value.steps.length >= 1 && value.steps.length <= stepLimit
    && value.steps.every((step) => step && typeof step.title === "string" && step.title.trim()
      && step.title.length <= 40 && typeof step.note === "string" && step.note.length <= 160
      && Number.isInteger(step.duration) && step.duration >= 1 && step.duration <= 3600
      && Number.isFinite(step.water) && step.water >= 0 && step.water <= 9999);
}

function updateGuide() {
  let start = 0;
  let water = 0;
  guideList.replaceChildren();
  guide = recipe.steps.map((step) => {
    water += step.water;
    const target = step.water ? grams.format(water) + " g total" : "No water added";
    const item = document.createElement("li");
    const heading = document.createElement("strong");
    const detail = document.createElement("span");
    heading.textContent = format(start) + " · " + step.title;
    detail.textContent = target;
    item.append(heading, detail);
    guideList.append(item);
    const stage = { ...step, start, target };
    start += step.duration;
    return stage;
  });
  guideEnd = start;
  document.querySelector("#recipe-summary").textContent = grams.format(recipe.coffee) + " g coffee · " + grams.format(water) + " g brew water · " + format(guideEnd);
  document.querySelector("#recipe-ratio").textContent = "Coffee : brew water · " + brewRatio(recipe.coffee, water);
  presetNote.textContent = recipe.note ?? "";
  presetNote.hidden = !recipe.note;
  presetSource.hidden = !recipe.source;
  if (recipe.source) presetSource.href = recipe.source;
  stageKey = "";
}

function numberSteps() {
  for (const [index, field] of Array.from(stepFields.children).entries()) {
    field.querySelector("legend").textContent = "Step " + (index + 1);
    const remove = field.querySelector(".remove-step");
    remove.disabled = stepFields.children.length === 1;
    remove.setAttribute("aria-label", "Remove step " + (index + 1));
  }
  addStep.disabled = stepFields.children.length >= stepLimit;
  updateEditorRatio();
}

function updateEditorRatio() {
  const water = Array.from(stepFields.children).reduce((total, field) => {
    return total + (field.querySelector('[name="water"]').valueAsNumber || 0);
  }, 0);
  editorRatio.textContent = "Coffee : brew water · " + brewRatio(coffeeInput.valueAsNumber, water) + " · " + grams.format(water) + " g brew water";
}

function appendStep(step) {
  const field = stepTemplate.content.firstElementChild.cloneNode(true);
  for (const input of field.querySelectorAll("input, textarea")) {
    input.value = step[input.name];
  }
  field.querySelector(".remove-step").addEventListener("click", () => {
    const nextField = field.nextElementSibling ?? field.previousElementSibling;
    field.remove();
    numberSteps();
    nextField.querySelector('[name="title"]').focus();
  });
  stepFields.append(field);
  return field;
}

function fillEditor(value) {
  coffeeInput.value = value.coffee;
  stepFields.replaceChildren();
  for (const step of value.steps) appendStep(step);
  numberSteps();
}

editRecipe.addEventListener("click", () => {
  fillEditor(recipe);
  editor.showModal();
});
document.querySelector("#cancel-recipe").addEventListener("click", () => editor.close());
document.querySelector("#default-recipe").addEventListener("click", () => fillEditor(defaultRecipe));
addStep.addEventListener("click", () => {
  const field = appendStep({ title: "", duration: 30, water: 0, note: "" });
  numberSteps();
  field.querySelector('[name="title"]').focus();
});
stepFields.addEventListener("input", (event) => {
  if (event.target.name === "title") event.target.setCustomValidity("");
});
recipeForm.addEventListener("input", updateEditorRatio);
recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const steps = Array.from(stepFields.children, (field) => {
    const title = field.querySelector('[name="title"]');
    title.setCustomValidity(title.value.trim() ? "" : "Enter a step name.");
    return {
      title: title.value.trim(),
      duration: field.querySelector('[name="duration"]').valueAsNumber,
      water: field.querySelector('[name="water"]').valueAsNumber,
      note: field.querySelector('[name="note"]').value.trim(),
    };
  });
  const updated = { coffee: coffeeInput.valueAsNumber, steps };
  if (!recipeForm.reportValidity() || !validRecipe(updated)) return;
  recipe = updated;
  if (!customRecipe) preset.append(new Option("My recipe", "custom"));
  customRecipe = updated;
  preset.value = "custom";
  try {
    localStorage.setItem(recipeKey, JSON.stringify(recipe));
  } catch {
    // The edited recipe remains available for this page visit.
  }
  updateGuide();
  resetTimer();
  editor.close();
});

function stop() {
  elapsed = elapsedNow();
  startedAt = null;
  clearInterval(interval);
  interval = null;
}

function render() {
  const isGuide = guided();
  const seconds = Math.floor(elapsedNow() / 1000);
  const done = isGuide && seconds >= guideEnd;
  if (done && startedAt !== null) {
    stop();
    elapsed = guideEnd * 1000;
  }

  const running = startedAt !== null;
  const index = guide.findLastIndex((step) => seconds >= step.start);
  const step = guide[index];
  time.textContent = format(isGuide ? Math.min(seconds, guideEnd) : seconds);
  ring.style.setProperty("--progress", (isGuide ? Math.min(seconds / guideEnd, 1) : (seconds % 60) / 60) * 100 + "%");
  const key = [isGuide, done, running, elapsed > 0, index].join("|");
  if (stageKey === key) return;
  stageKey = key;

  stage.textContent = isGuide ? (done ? "Guide complete" : step.title) : "Elapsed time";
  const instruction = [step.note, step.water ? step.target : ""].filter(Boolean).join(" · ") || "Wait for the next step.";
  state.textContent = done ? (recipe.finish ?? "Recipe timer finished.") : isGuide ? (running ? instruction : (elapsed ? "Paused · " : "Ready · ") + instruction) : running ? "Running" : elapsed ? "Paused" : "Ready to start";
  toggle.textContent = done ? "Start again" : running ? "Pause" : elapsed ? "Resume" : "Start";
  lap.disabled = !running;
  reset.disabled = !running && !elapsed;
  editRecipe.disabled = running || (elapsed > 0 && !done);
  preset.disabled = editRecipe.disabled;
  refreshPreset();
  for (const [stepIndex, item] of Array.from(guideList.children).entries()) {
    if (isGuide && !done && stepIndex === index) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  }
}

function resetTimer() {
  stop();
  elapsed = 0;
  lastLap = 0;
  lapList.replaceChildren();
  lapEmpty.hidden = false;
  lapStatus.textContent = "";
  render();
}

function changeMode() {
  guidePanel.hidden = !guided();
  lapPanel.hidden = guided();
  lap.hidden = guided();
  resetTimer();
}

toggle.addEventListener("click", () => {
  if (startedAt !== null) {
    stop();
  } else {
    if (guided() && elapsed >= guideEnd * 1000) resetTimer();
    startedAt = performance.now();
    interval = setInterval(render, 100);
  }
  render();
});
reset.addEventListener("click", () => {
  resetTimer();
  toggle.focus();
});
mode.addEventListener("change", changeMode);
document.addEventListener("visibilitychange", render);
lap.addEventListener("click", () => {
  if (startedAt === null) return;
  const seconds = Math.floor(elapsedNow() / 1000);
  const item = document.createElement("li");
  const heading = document.createElement("strong");
  const detail = document.createElement("span");
  heading.textContent = "Lap " + (lapList.children.length + 1);
  detail.textContent = format(seconds - lastLap) + " split · " + format(seconds) + " total";
  item.append(heading, detail);
  lapList.append(item);
  lapEmpty.hidden = true;
  lapStatus.textContent = heading.textContent + " recorded at " + format(seconds);
  lastLap = seconds;
});
const refreshPreset = themeSelect(preset);
themeSelect(mode);
preset.addEventListener("change", () => {
  recipe = preset.value === "custom" ? customRecipe : recipePresets[preset.value];
  updateGuide();
  resetTimer();
});
updateGuide();
changeMode();

