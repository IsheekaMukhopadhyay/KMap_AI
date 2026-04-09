import requests
res = requests.get("https://openrouter.ai/api/v1/models")
models = res.json().get("data", [])
for m in models:
    if "free" in m["id"] and "google" in m["id"]:
        print(m["id"])
