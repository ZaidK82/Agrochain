import requests
import os
from dotenv import load_dotenv

class LLMService:

    def __init__(self):

        # ==============================
        # 🔥 GROQ CONFIG (PRIMARY)
        # ==============================
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.groq_model = "llama-3.1-8b-instant"

        # ==============================
        # 🐢 OLLAMA CONFIG (FALLBACK)
        # ==============================
        # self.ollama_url = "http://localhost:11434/api/generate"
        # self.ollama_model = "mistral"

    def generate(self, prompt: str):

        # ==============================
        # 🔥 TRY GROQ FIRST
        # ==============================
        try:
            print("[DEBUG] Using Groq")

            headers = {
                "Authorization": f"Bearer {self.groq_api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.groq_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert agricultural advisor helping farmers."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 90,
                "temperature": 0.3
            }

            response = requests.post(
                self.groq_url,
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]

            elif response.status_code == 429:
                print("[INFO] Rate limit hit, retrying...")
                import time
                time.sleep(2)

                retry = requests.post(
                    self.groq_url,
                    headers=headers,
                    json=payload,
                    timeout=30
                )

                if retry.status_code == 200:
                    return retry.json()["choices"][0]["message"]["content"]

                raise Exception(retry.text)
            else:
                print("[WARNING] Groq failed, falling back to Ollama")
                raise Exception(response.text)

        except Exception as e:
            print(f"[ERROR] Groq error: {str(e)}")

        # ==============================
        # 🐢 FALLBACK TO OLLAMA
        # ==============================
        try:
            print("[DEBUG] Using Ollama fallback")

            ollama_payload = {
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            }

            response = requests.post(
                "http://localhost:11434/api/generate",
                json=ollama_payload,
                timeout=180
            )

            if response.status_code != 200:
                return f"Ollama error: {response.text}"

            return response.json().get("response", "")

        except Exception as e:
            return f"Both Groq and Ollama failed: {str(e)}"


llm_service = LLMService()