function themeSelect(select) {
  const details = document.createElement("details");
  const trigger = document.createElement("summary");
  const options = document.createElement("div");
  const label = document.querySelector('label[for="' + select.id + '"]');
  const value = document.createElement("span");
  label.id = select.id + "-label";
  value.id = select.id + "-value";
  trigger.setAttribute("aria-labelledby", label.id + " " + value.id);
  if (select.hasAttribute("aria-describedby")) {
    trigger.setAttribute("aria-describedby", select.getAttribute("aria-describedby"));
  }
  details.className = "coffee-select";
  options.className = "coffee-options";
  trigger.append(value);
  details.append(trigger, options);
  select.after(details);
  select.hidden = true;
  select.required = false;

  function refresh() {
    value.textContent = select.selectedOptions[0]?.textContent ?? "";
    trigger.setAttribute("aria-disabled", String(select.disabled));
    options.replaceChildren();
    for (const option of select.options) {
      if (!option.value) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.textContent;
      button.setAttribute("aria-pressed", String(option.selected));
      button.addEventListener("click", () => {
        select.value = option.value;
        details.open = false;
        select.dispatchEvent(new Event("change"));
        trigger.focus();
      });
      options.append(button);
    }
    if (select.disabled) details.open = false;
  }

  select.addEventListener("change", refresh);
  label.addEventListener("click", (event) => {
    event.preventDefault();
    if (!select.disabled) trigger.focus();
  });
  trigger.addEventListener("click", (event) => {
    if (select.disabled) event.preventDefault();
  });
  details.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && details.open) {
      details.open = false;
      trigger.focus();
    }
  });
  details.addEventListener("focusout", (event) => {
    // Touch browsers can blur the trigger before dispatching the option click.
    if (event.relatedTarget && !details.contains(event.relatedTarget)) details.open = false;
  });
  document.addEventListener("pointerdown", (event) => {
    if (!details.contains(event.target)) details.open = false;
  });
  refresh();
  return refresh;
}
