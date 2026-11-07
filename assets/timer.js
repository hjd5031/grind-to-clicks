const guide = [
  { start: 0, title: "Bloom", note: "Pour to 45 g and let the coffee bloom.", target: "45 g total" },
  { start: 45, title: "First pour", note: "Pour slowly in circles until the scale reads 150 g.", target: "150 g total" },
  { start: 75, title: "Final pour", note: "Pour the remaining water up to 250 g.", target: "250 g total" },
  { start: 105, title: "Drawdown", note: "Let the water drain through the coffee bed.", target: "Wait for the bed to drain" },
];
const guideEnd = 180;
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

for (const step of guide) {
  const item = document.createElement("li");
  const heading = document.createElement("strong");
  const detail = document.createElement("span");
  heading.textContent = format(step.start) + " · " + step.title;
  detail.textContent = step.target;
  item.append(heading, detail);
  guideList.append(item);
}

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
  state.textContent = done ? "Remove the dripper once the bed has drained." : isGuide ? (running ? step.note : (elapsed ? "Paused · " : "Ready · ") + step.note) : running ? "Running" : elapsed ? "Paused" : "Ready to start";
  toggle.textContent = done ? "Start again" : running ? "Pause" : elapsed ? "Resume" : "Start";
  lap.disabled = !running;
  reset.disabled = !running && !elapsed;
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
changeMode();

