const defaultRecipe = { coffee: 15, steps: [
  { title: "Bloom", duration: 45, water: 45, note: "Wet the grounds evenly and let the coffee bloom." },
  { title: "First pour", duration: 30, water: 105, note: "Pour slowly in circles." },
  { title: "Final pour", duration: 30, water: 100, note: "Pour the remaining water." },
  { title: "Drawdown", duration: 75, water: 0, note: "Let the water drain through the coffee bed." },
] };
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
const stepFields = document.querySelector("#recipe-steps");
const stepTemplate = document.querySelector("#recipe-step-template");
const addStep = document.querySelector("#add-step");
const grams = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

const params = new URLSearchParams(location.search);
const profile = grinderProfiles.find((entry) => entry.id === params.get("grinder"));
const clicks = Number(params.get("clicks"));
if (profile && Number.isInteger(clicks) && clicks >= 1 && clicks <= (profile.maxClicks ?? 999)) {
  const setting = document.querySelector("#brew-setting");
  setting.textContent = grinderName(profile) + " · " + clicks + (clicks === 1 ? " click" : " clicks");
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
try {
  const saved = JSON.parse(localStorage.getItem(recipeKey));
  if (saved && validRecipe(saved)) recipe = saved;
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
  document.querySelector("#recipe-summary").textContent = grams.format(recipe.coffee) + " g coffee · " + grams.format(water) + " g water · " + format(guideEnd);
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
}

function appendStep(step) {
  const field = stepTemplate.content.firstElementChild.cloneNode(true);
  for (const input of field.querySelectorAll("input")) {
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
  state.textContent = done ? "Recipe timer finished." : isGuide ? (running ? instruction : (elapsed ? "Paused · " : "Ready · ") + instruction) : running ? "Running" : elapsed ? "Paused" : "Ready to start";
  toggle.textContent = done ? "Start again" : running ? "Pause" : elapsed ? "Resume" : "Start";
  lap.disabled = !running;
  reset.disabled = !running && !elapsed;
  editRecipe.disabled = running || (elapsed > 0 && !done);
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
updateGuide();
changeMode();

