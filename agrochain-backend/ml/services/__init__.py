self.groq_api_key = os.getenv("GROQ_API_KEY")

if not self.groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables")