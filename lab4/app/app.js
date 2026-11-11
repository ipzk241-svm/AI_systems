const API_URL = "http://localhost:11434/v1/chat/completions";
const MODEL = "qwen2.5:7b";
const MAX_TOKENS = 600;
const TEMPERATURE = 0.2

let translations;
let language = localStorage.getItem("recipe-language") || "en";

const ingredients = document.querySelector("#ingredients");
const mealType = document.querySelector("#mealType");
const time = document.querySelector("#time");
const button = document.querySelector("#generate");
const status_ = document.querySelector("#status");
const result = document.querySelector("#result");
const output = document.querySelector("#output");
const languageSelect = document.querySelector("#language");

function t(key) {
  return key.split(".").reduce((value, part) => value?.[part], translations[language]) || key;
}

function makeOptions(select, items, selectedValue) {
  select.replaceChildren(
    ...items.map(({ value, label }) => {
      const option = new Option(t(label), value);
      option.selected = value === selectedValue;
      return option;
    }),
  );
}

function updateInterface() {
  document.documentElement.lang = language;
  document.title = t("ui.documentTitle");
  document.querySelector("#language-label").textContent = t("ui.language");
  document.querySelector("#page-title").textContent = t("ui.title");
  document.querySelector("#page-lead").textContent = t("ui.lead");
  document.querySelector("#ingredients-label").textContent = t("ui.ingredients");
  ingredients.placeholder = t("ui.ingredientsPlaceholder");
  document.querySelector("#meal-type-label").childNodes[0].textContent = t("ui.mealType");
  document.querySelector("#time-label").childNodes[0].textContent = t("ui.cookingTime");
  button.textContent = t("ui.generate");
  document.querySelector("#result-title").textContent = t("ui.resultTitle");

  const selectedMeal = mealType.value || "any";
  const selectedTime = time.value || "40";
  makeOptions(mealType, translations[language].options.meals, selectedMeal);
  makeOptions(time, translations[language].options.times, selectedTime);
  languageSelect.value = language;
}

function setStatus(message, error = false) {
  status_.textContent = message;
  status_.classList.toggle("error", error);
}

function promptForRecipe(text) {
  const prompt = t("prompt.template");
  return prompt
    .replace("{meal}", t(`options.meals.${mealType.selectedIndex}.prompt`))
    .replace("{time}", t(`options.times.${time.selectedIndex}.prompt`))
    .replace("{ingredients}", text);
}

async function generate() {
  const text = ingredients.value.trim();
  if (!text) {
    setStatus(t("messages.noIngredients"), true);
    ingredients.focus();
    return;
  }

  button.disabled = true;
  output.textContent = "";
  result.hidden = false;
  setStatus(t("messages.generating"));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer local",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: promptForRecipe(text) }],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });
    if (!response.ok || !response.body) {
      throw new Error(
        t("messages.httpError").replace("{status}", response.status).replace("{model}", MODEL),
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const token = JSON.parse(data).choices?.[0]?.delta?.content;
          if (token) output.textContent += token;
        } catch {
        }
      }
    }
    if (!output.textContent.trim())
      throw new Error(
        t("messages.emptyResponse"),
      );
    setStatus(t("messages.done"));
  } catch (error) {
    setStatus(
      `${t("messages.errorPrefix")}: ${error.message} ${t("messages.ollamaHint")}`,
      true,
    );
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", generate);

languageSelect.addEventListener("change", () => {
  language = languageSelect.value;
  localStorage.setItem("recipe-language", language);
  updateInterface();
  setStatus("");
});

fetch("i18n.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load localization file.");
    return response.json();
  })
  .then((data) => {
    translations = data;
    if (!translations[language]) language = "en";
    updateInterface();
  })
  .catch((error) => setStatus(error.message, true));
