from openai import OpenAI

PROMPTS = [
    "Продукти: куряче філе, рис, морква, цибуля, часник, соєвий соус. Запропонуй одну страву й короткий рецепт.",
    "Продукти: яйця, помідори, сир, хліб, зелень. Запропонуй швидкий сніданок і час приготування.",
    "Продукти: картопля, печериці, вершки, цибуля. Запропонуй вегетаріанську вечерю. Не вигадуй продуктів, яких немає.",
]

client = OpenAI(base_url="http://localhost:11434/v1", api_key="local", timeout=120)

for model in ("qwen2.5:7b",):
    print(f"\n===== {model} =====")
    for number, prompt in enumerate(PROMPTS, start=1):
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=140,
        )
        print(f"\n--- Сценарій {number} ---")
        print(response.choices[0].message.content or "[порожня відповідь]")
