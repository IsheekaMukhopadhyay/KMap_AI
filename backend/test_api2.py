import requests

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
  "Authorization": "Bearer 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",
  "Content-Type": "application/json"
}
data = {
  "model": "google/gemma-3-12b-it:free",
  "messages": [{"role": "user", "content": "hello"}]
}

response = requests.post(url, headers=headers, json=data)
print("Status Code:", response.status_code)
print("Response:", response.text)
