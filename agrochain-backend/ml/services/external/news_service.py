import requests

NEWS_API_KEY = "186bfbe50ee04f3da00dab8592a32f9f"

def get_agriculture_news(page=1):
    try:
        url = (
            f"https://newsapi.org/v2/everything?"
            f"q=agriculture OR farming OR crops OR irrigation"
            f"&language=en"
            f"&sortBy=publishedAt"
            f"&pageSize=5"
            f"&apiKey={NEWS_API_KEY}"
        )

        response = requests.get(url)
        data = response.json()

        # 🔴 IMPORTANT: CHECK ERROR
        if data.get("status") != "ok":
            print("NEWS API ERROR:", data)
            return [
                {
                    "title": "News API limit reached or invalid API key",
                    "image": "",
                    "source": "System",
                    "date": "",
                    "url": "#"
                }
            ]

        articles = data.get("articles", [])

        result = []

        for article in articles:
            result.append({
                "title": article.get("title") or "No Title",
                "image": article.get("urlToImage"),
                "source": article.get("source", {}).get("name") or "Unknown",
                "date": article.get("publishedAt"),
                "url": article.get("url") or "#"
            })

        return result

    except Exception as e:
        print("ERROR:", e)
        return [
            {
                "title": "Server error while fetching news",
                "image": "",
                "source": "System",
                "date": "",
                "url": "#"
            }
        ]