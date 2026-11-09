const form = document.querySelector("#grind-form");
const brand = document.querySelector("#brand");
const grinder = document.querySelector("#grinder");
const microns = document.querySelector("#microns");
const spec = document.querySelector("#model-spec");
const error = document.querySelector("#calc-error");
const calculate = document.querySelector("#calculate");
const next = document.querySelector("#next");
const value = document.querySelector("#gauge-value");
const unit = document.querySelector("#gauge-unit");
const summary = document.querySelector("#result-summary");
const note = document.querySelector("#result-note");
const comparisonNote = document.querySelector("#comparison-note");
const comparisonTimer = document.querySelector("#comparison-timer");
const reference = document.querySelector("#spec-link");
const idleMessage = summary.textContent;
const formatMicrons = (value) => new Intl.NumberFormat("en").format(value);

for (const name of new Set(grinderProfiles.map((profile) => profile.brand))) {
  brand.append(new Option(name, name));
}

function updateModels() {
  grinder.disabled = !brand.value;
  grinder.replaceChildren(new Option(brand.value ? "Select a model" : "Select a brand first", ""));
  for (const profile of grinderProfiles.filter((entry) => entry.brand === brand.value)) {
    grinder.append(new Option(profile.model, profile.id));
  }
  updateInput();
  refreshModels();
}

function updateInput() {
  const profile = grinderProfiles.find((entry) => entry.id === grinder.value);
  const curve = profile?.curve;
  spec.hidden = !profile;
  error.hidden = true;
  value.textContent = "—";
  unit.textContent = profile?.setting ? "Dial setting" : "Clicks from zero";
  summary.textContent = idleMessage;
  note.hidden = true;
  comparisonNote.hidden = true;
  comparisonTimer.hidden = true;
  reference.hidden = true;
  calculate.hidden = false;
  next.hidden = true;
  const missingData = Boolean(profile && !curve);
  microns.disabled = missingData;
  calculate.disabled = !curve;

  if (curve) {
    spec.textContent = "Supported range: " + formatMicrons(Math.ceil(curve[0][1])) + "–" + formatMicrons(Math.floor(curve.at(-1)[1])) + " µm";
  } else if (missingData) {
    spec.textContent = "This model needs more measured settings to estimate clicks.";
    summary.textContent = "Use the manufacturer’s setting guide for this grinder.";
    reference.href = profile.guide ?? grinderReference;
    reference.textContent = "View manufacturer’s guide";
    reference.hidden = false;
  }
}

brand.addEventListener("change", updateModels);
grinder.addEventListener("change", updateInput);
microns.addEventListener("input", updateInput);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = grinderProfiles.find((entry) => entry.id === grinder.value);
  if (!profile?.curve) return;

  const clicks = estimateClicks(profile.curve, microns.valueAsNumber);
  if (clicks === null) {
    error.textContent = "This target is outside the supported range. " + spec.textContent + ".";
    error.hidden = false;
    microns.focus();
    return;
  }

  value.textContent = profile.setting ? profile.setting(clicks).split(" + ")[0] : String(clicks);
  unit.textContent = profile.setting ? "Dial " + profile.setting(clicks) : "Clicks from zero";
  summary.textContent = "Starting point for " + grinderName(profile) + ": " + grinderSetting(profile, clicks) + ".";
  note.textContent = profile.basis;
  note.hidden = false;
  const showComparison = profile.id === "k-ultra" && microns.valueAsNumber === 750;
  comparisonNote.hidden = !showComparison;
  comparisonTimer.hidden = !showComparison;
  reference.href = profile.source;
  reference.textContent = "View measurement source";
  reference.hidden = false;
  next.href = "./timer/?" + new URLSearchParams({ grinder: profile.id, clicks });
  next.hidden = false;
  calculate.hidden = true;
  next.focus();
});
const refreshModels = themeSelect(grinder);
themeSelect(brand);
updateModels();

