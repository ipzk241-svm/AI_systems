# Лабораторна 4 — локальна модель і оптимізація

## Склад роботи

- `local_models_demo.ipynb` — демо-ноутбук лекції 5; до нього треба додати відповіді на теоретичні питання та фінальний звіт.
- `bench.py`, `stream_demo.py` — надані скрипти для вимірювань.
- `bench_results.csv` — реальні результати вимірювань Qwen2.5 7B і 3B.
- `test_prompts.txt`, `quality_results_before.md`, `quality_results.md` — 10 тестових промптів і збережені відповіді моделей.
- `app/` — вебзастосунок «Що приготувати з продуктів?». 
- `report_draft.md`, `TEST_SCENARIOS.md` — підготовлений матеріал для звіту та перевірки.

## Відтворення

```powershell
ollama pull qwen2.5:7b
python -m pip install openai
python bench.py --model qwen2.5:7b --label before --requests 8 --concurrency 1 2 4 --max-tokens 50 --prompts test_prompts.txt
```

Для порівняння швидкодії:

```powershell
ollama pull qwen2.5:3b
python bench.py --model qwen2.5:3b --label after --requests 8 --concurrency 1 2 4 --max-tokens 50 --prompts test_prompts.txt
```

Фінальний застосунок використовує `qwen2.5:7b`, оскільки 3B попри вищу швидкість дала гірші відповіді на тестових україномовних технічних запитах.
