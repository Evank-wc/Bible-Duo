# BibleDuo

**BibleDuo** is a simple, modern web app to help you read the Bible every day and build a lasting habit. Track your streaks, follow a reading plan, and enjoy the Bible in English (ESV) or Chinese (CUVS).

## What You Can Do

- 📅 **Follow a daily reading plan**  
- 🔥 **Track your reading streaks**  
- 🌗 **Switch between light and dark mode**  
- 🈳 **Read in English (ESV) or Chinese (CUVS)**  
- 📱 **Works great on your phone or computer**  
- ⚙️ **Customize font size and more in Settings**  
- 💾 **Your progress is saved automatically**

> **More reading plans and Bible versions are coming soon!**

---

## Quick Start

1. Open the app in your browser.
2. Pick a reading plan and Bible version in Settings.
3. Start reading and mark each day as complete to keep your streak going!

---

## iOS Widget (Scriptable)

You can add your streak to your iPhone home screen using [Scriptable](https://scriptable.app/) and the `/widget` page.

**Example Scriptable code:**

```javascript
// BibleDuo Widget Example
let url = "https://evank-wc.github.io/bibleduo/#/widget";
let req = new Request(url);
let html = await req.loadString();
let wv = new WebView();
await wv.loadHTML(html);
wv.present();
```

- The widget will show your current streak and progress in a beautiful, motivating style.

---

## More to Come

- More reading plans (e.g., whole Bible in a year, topical plans)
- More Bible versions (other English, Chinese, and more languages)

---

**Happy reading!**  
BibleDuo Team