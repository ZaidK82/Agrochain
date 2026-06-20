# backend/test.py

from assistant.llm_client import LLMClient

if __name__ == "__main__":
    llm = LLMClient()

    response = llm.generate(
        "Explain why heavy rainfall can be risky for soybean crops."
    )

    print("LLM RESPONSE:")

    print(response)
