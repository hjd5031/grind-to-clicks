const form = document.querySelector("#grind-form");
const brand = document.querySelector("#brand");
const grinder = document.querySelector("#grinder");
const destination = document.querySelector("#destination");
const destinationNote = document.querySelector("#destination-note");
const microns = document.querySelector("#microns");
const positionInput = document.querySelector("#position");
const positionLabel = document.querySelector("#position-label");
const positionNote = document.querySelector("#position-note");
const sizeField = document.querySelector("#size-field");
const positionField = document.querySelector("#position-field");
const resultTitle = document.querySelector("#result-title");
const gauge = document.querySelector("#setting-gauge");
const progress = document.querySelector("#position-progress");
const spec = document.querySelector("#model-spec");
const error = document.querySelector("#calc-error");
const calculate = document.querySelector("#calculate");
const calculateLabel = document.querySelector("#calculate-label");
const next = document.querySelector("#next");
const value = document.querySelector("#gauge-value");
const unit = document.querySelector("#gauge-unit");
const summary = document.querySelector("#result-summary");
const note = document.querySelector("#result-note");
const comparisonNote = document.querySelector("#comparison-note");
const comparisonTimer = document.querySelector("#comparison-timer");
const communityNote = document.querySelector("#community-note");
const communitySource = document.querySelector("#community-source");
const reference = document.querySelector("#spec-link");
const sourceReference = document.querySelector("#source-spec-link");
const idleMessage = summary.textContent;
const formatMicrons = (value) => new Intl.NumberFormat("en").format(value);
const reverseMode = () => form.elements.direction.value === "reverse";
const settingText = (profile, position) => profile.setting ? profile.setting(position) : String(position);

function parsePosition(profile, text) {
  const normalize = (value) => value.toLowerCase().replace(/\s|notches|notch/g, "");
  const input = normalize(text);
  const first = Math.round(profile.curve[0][0]);
  const last = Math.round(profile.curve.at(-1)[0]);
  if (!input) return null;
  for (let position = first; position <= last; position++) {
    const label = normalize(settingText(profile, position));
    if (input === label || Number(input) === Number(label)) return position;
  }
  return null;
}

function showProgress(profile, position) {
  const range = adjustmentRanges[profile.id];
  if (!range) {
    progress.textContent = "Full adjustment range unverified";
  } else {
    const [min, max] = range;
    const percent = Math.round((position - min) / (max - min) * 100);
    gauge.style.setProperty("--progress", percent + "%");
    progress.textContent = profile.setting
      ? percent + "% of dial range (" + settingText(profile, min) + "–" + settingText(profile, max) + ")"
      : position + " / " + max + " clicks · " + percent + "% of full range";
  }
  progress.hidden = false;
}

for (const name of new Set(grinderProfiles.map((profile) => profile.brand))) {
  brand.append(new Option(name, name));
}
for (const profile of grinderProfiles.filter((entry) => entry.curve).sort((a, b) => grinderName(a).localeCompare(grinderName(b)))) {
  destination.append(new Option(grinderName(profile), profile.id));
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
  const reverse = reverseMode();
  const targetProfile = grinderProfiles.find((entry) => entry.id === destination.value);
  const outputProfile = targetProfile ?? profile;
  spec.hidden = !profile;
  error.hidden = true;
  value.textContent = "—";
  unit.textContent = reverse && !targetProfile ? "µm" : outputProfile?.setting ? "Dial setting" : "Clicks from zero";
  resultTitle.textContent = reverse && !targetProfile ? "Estimated grind size" : "Estimated setting";
  gauge.style.removeProperty("--progress");
  progress.hidden = true;
  summary.textContent = idleMessage;
  note.hidden = true;
  comparisonNote.hidden = true;
  comparisonTimer.hidden = true;
  communityNote.hidden = true;
  communitySource.hidden = true;
  reference.hidden = true;
  sourceReference.hidden = true;
  calculate.hidden = false;
  next.hidden = true;
  const missingData = Boolean(profile && !curve);
  sizeField.hidden = reverse;
  positionField.hidden = !reverse;
  microns.disabled = reverse || Boolean(outputProfile && !outputProfile.curve);
  positionInput.disabled = !reverse || !curve;
  positionInput.required = reverse;
  positionInput.inputMode = profile?.setting ? "text" : "numeric";
  positionLabel.textContent = profile?.setting ? "Dial setting" : "Clicks from zero";
  calculate.disabled = reverse ? !curve : !outputProfile?.curve;
  calculateLabel.textContent = targetProfile ? "Convert grind" : reverse ? "Estimate grind size" : profile?.setting ? "Calculate setting" : "Calculate clicks";
  destinationNote.textContent = targetProfile
    ? "Measured range for " + grinderName(targetProfile) + ": " + sizeRange(targetProfile.curve) + "."
    : "Choose your grinder to get its clicks or dial position.";

  if (curve) {
    const first = settingText(profile, Math.round(curve[0][0]));
    const last = settingText(profile, Math.round(curve.at(-1)[0]));
    positionNote.textContent = "Measured settings: " + first + "–" + last + (profile.setting ? "." : " clicks.");
    positionInput.placeholder = "e.g. " + first;
    spec.textContent = "Measured size range: " + sizeRange(curve);
  } else if (missingData) {
    spec.textContent = "This model needs more measured settings to estimate clicks.";
    if (reverse || !targetProfile) {
      summary.textContent = "Use the manufacturer’s setting guide for this grinder.";
      reference.href = profile.guide ?? grinderReference;
      reference.textContent = "View manufacturer’s guide";
      reference.hidden = false;
    }
  }
  const brewReference = profile && brewReferences[profile.id];
  if (brewReference) {
    communityNote.textContent = brewReference.text;
    communitySource.href = brewReference.source;
    communitySource.textContent = "View DCInside brew report";
    communityNote.hidden = false;
    communitySource.hidden = false;
  }
}

function sizeRange(curve) {
  return formatMicrons(Math.ceil(curve[0][1])) + "–" + formatMicrons(Math.floor(curve.at(-1)[1])) + " µm";
}

brand.addEventListener("change", updateModels);
grinder.addEventListener("change", updateInput);
destination.addEventListener("change", updateInput);
microns.addEventListener("input", updateInput);
positionInput.addEventListener("input", updateInput);
for (const radio of form.elements.direction) radio.addEventListener("change", updateInput);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = grinderProfiles.find((entry) => entry.id === grinder.value);
  const targetProfile = grinderProfiles.find((entry) => entry.id === destination.value);
  const reverse = reverseMode();
  const outputProfile = targetProfile ?? profile;
  if (!outputProfile?.curve || (reverse && !profile?.curve)) return;
  const position = reverse ? parsePosition(profile, positionInput.value) : null;
  const sourceEstimate = reverse ? estimateMicrons(profile.curve, position) : null;
  const target = reverse ? sourceEstimate?.microns : microns.valueAsNumber;
  const showMicrons = reverse && !targetProfile;
  const estimate = showMicrons ? sourceEstimate : estimateClicks(outputProfile.curve, target);
  const community = outputProfile.community;
  const communityEstimate = community && estimateClicks(community.curve, target);
  if (communityEstimate) {
    communityNote.textContent = "DCInside reference: about " + communityEstimate.clicks + " clicks on the tested unit · " + community.label + ".";
    communitySource.href = community.source;
    communitySource.textContent = "View DCInside measurement";
    communityNote.hidden = false;
    communitySource.hidden = false;
  }
  if (!estimate) {
    error.textContent = reverse && !sourceEstimate
      ? "Enter a setting within the recipe grinder’s measured range using its dial notation."
      : "The target falls outside " + grinderName(outputProfile) + "’s measured range (" + sizeRange(outputProfile.curve) + ").";
    error.hidden = false;
    (reverse ? positionInput : microns).focus();
    return;
  }

  const { interval } = estimate;
  const clicks = showMicrons ? position : estimate.clicks;
  value.textContent = showMicrons ? formatMicrons(Math.round(target)) : settingText(outputProfile, clicks).split(" + ")[0];
  unit.textContent = showMicrons ? "µm" : outputProfile.setting ? "Dial " + outputProfile.setting(clicks) : "Clicks from zero";
  summary.textContent = showMicrons
    ? grinderName(profile) + " at " + grinderSetting(profile, clicks) + ": about " + value.textContent + " µm."
    : "Starting point for " + grinderName(outputProfile) + ": " + grinderSetting(outputProfile, clicks) + ".";
  if (reverse && targetProfile) {
    summary.textContent += " Recipe: " + grinderName(profile) + " at " + grinderSetting(profile, position) + " (about " + formatMicrons(Math.round(target)) + " µm).";
  }
  showProgress(outputProfile, clicks);
  const fittedSizes = interval.map((size) => formatMicrons(Math.round(size))).join("–");
  note.textContent = outputProfile.basis + " · Fitted data: " + fittedSizes + " µm";
  note.hidden = false;
  const showComparison = !reverse && outputProfile.id === "k-ultra" && target === 750;
  comparisonNote.hidden = !showComparison;
  comparisonTimer.hidden = !showComparison;
  reference.href = outputProfile.source;
  reference.textContent = "View measurement source";
  reference.hidden = false;
  if (reverse && targetProfile && profile.id !== targetProfile.id) {
    sourceReference.href = profile.source;
    sourceReference.hidden = false;
    note.textContent += " · Recipe grinder data: " + profile.basis;
  }
  next.href = "./timer/?" + new URLSearchParams({ grinder: outputProfile.id, clicks });
  next.hidden = false;
  calculate.hidden = true;
  next.focus();
});
const refreshModels = themeSelect(grinder);
themeSelect(brand);
themeSelect(destination);
updateModels();

