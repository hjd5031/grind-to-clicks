const form = document.querySelector("#grind-form");
const grinder = document.querySelector("#grinder");
const microns = document.querySelector("#microns");
const spec = document.querySelector("#model-spec");
const error = document.querySelector("#calc-error");
const calculate = document.querySelector("#calculate");
const next = document.querySelector("#next");
const value = document.querySelector("#gauge-value");
const summary = document.querySelector("#result-summary");
const reference = document.querySelector("#spec-link");
const idleMessage = summary.textContent;

for (const brand of new Set(grinderProfiles.map((profile) => profile.brand))) {
  const group = document.createElement("optgroup");
  group.label = brand;
  for (const profile of grinderProfiles.filter((entry) => entry.brand === brand)) {
    group.append(new Option(profile.model, profile.id));
  }
  grinder.append(group);
}

function updateInput() {
  const profile = grinderProfiles.find((entry) => entry.id === grinder.value);
  spec.hidden = !profile;
  if (profile) {
    spec.textContent = (profile.approximate ? "About " : "") + profile.step + " µm of burr travel per click";
  }
  error.hidden = true;
  value.textContent = "—";
  summary.textContent = idleMessage;
  reference.hidden = true;
  calculate.hidden = false;
  next.hidden = true;
}

form.addEventListener("input", updateInput);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = grinderProfiles.find((entry) => entry.id === grinder.value);
  if (!profile) return;

  const clicks = Math.round(microns.valueAsNumber / profile.step);
  if (!Number.isSafeInteger(clicks) || clicks < 1 || clicks > (profile.maxClicks ?? 999)) {
    error.textContent = "This target falls outside the supported click range for this profile.";
    error.hidden = false;
    microns.focus();
    return;
  }

  value.textContent = String(clicks);
  summary.textContent = clicks + (clicks === 1 ? " click" : " clicks") + " from zero on " + grinderName(profile) + ". Check your grinder’s adjustment range before setting it.";
  reference.href = profile.source ?? grinderReference;
  reference.hidden = false;
  next.href = "./timer/?" + new URLSearchParams({ grinder: profile.id, clicks });
  next.hidden = false;
  calculate.hidden = true;
  next.focus();
});
updateInput();

