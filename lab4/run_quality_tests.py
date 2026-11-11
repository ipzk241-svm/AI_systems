"""Зберігає відповіді локальної моделі на тестові промпти лабораторної."""

import argparse
from pathlib import Path

from openai import OpenAI

PROMPTS_FILE = Path("test_prompts.txt")


def parse_args():
    parser = argparse.ArgumentParser(description="Перевірка якості локальної моделі на тестових промптах.")
    parser.add_argument("--model", default="qwen2.5:3b")
    parser.add_argument("--output", default="quality_results.md")
    parser.add_argument("--max-tokens", type=int, default=120)
    parser.add_argument("--start", type=int, default=1, help="номер першого промпту (від 1)")
    parser.add_argument("--end", type=int, help="номер останнього промпту включно")
    parser.add_argument("--append", action="store_true", help="дописати результати до наявного файлу")
    return parser.parse_args()


def main():
    args = parse_args()
    prompts = [line.strip() for line in PROMPTS_FILE.read_text(encoding="utf-8").splitlines() if line.strip()]
    client = OpenAI(base_url="http://localhost:11434/v1", api_key="local", timeout=120)
    selected = list(enumerate(prompts, start=1))[args.start - 1:args.end]
    blocks = [] if args.append else [f"# Перевірка якості: {args.model}", "", f"Параметри: `temperature=0.2`, `max_tokens={args.max_tokens}`.", ""]
    for number, prompt in selected:
        completion = client.chat.completions.create(
            model=args.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=args.max_tokens,
        )
        answer = completion.choices[0].message.content or "[Порожня відповідь]"
        blocks.extend([f"## {number}. Промпт", prompt, "", "### Відповідь", answer, ""])
        print(f"Готово: {number}/{len(prompts)}")
    output_file = Path(args.output)
    mode = "a" if args.append else "w"
    with output_file.open(mode, encoding="utf-8") as output:
        output.write("\n".join(blocks))
    print(f"Результати записано у {output_file}")


if __name__ == "__main__":
    main()
