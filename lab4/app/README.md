# Recipe from Your Ingredients

A web application that suggests one dish and a step-by-step recipe from a list of available ingredients. No data is sent to a cloud API: the page uses Ollama's OpenAI-compatible API on `localhost`.

## Requirements and startup

1. Install [Ollama](https://ollama.com/) and download the model:

   ```powershell
   ollama pull qwen2.5:7b
   ```

2. Make sure Ollama is running (by default, the server is available at `http://localhost:11434`).
3. Start a simple local server from the `app/` folder:

   ```powershell
   python -m http.server 8000
   ```

   Then open `http://localhost:8000`. A local server is required because the interface reads its translations from `i18n.json`.

## Generation parameters

- `temperature = 0.2`: keeps recipes practical and reproducible while allowing a little variety.
- `max_tokens = 600`: enough for a recipe while limiting response length and preventing endlessly long generations.
- The context is the user's ingredient list. The prompt explicitly forbids inventing missing ingredients.
- The answer is streamed. An unavailable server, HTTP errors, and an empty response are shown to the user.
- The language selector supports English and Ukrainian. All interface strings and model prompts are stored separately in `i18n.json`; the selected language is remembered in the browser.
