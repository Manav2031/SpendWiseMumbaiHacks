const express = require("express");
const router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.get("/", async (req, res) => {
  try {
    const key = process.env.NEWS_API_KEY;
    if (!key)
      return res.status(400).json({ message: "No NEWS_API_KEY in .env" });

    const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=15&apiKey=${key}`;
    const r = await fetch(url);
    const data = await r.json();

    // Filter out invalid articles
    let articles = (data.articles || []).filter(
      (a) => a.title && a.description && a.url
    );

    // Ensure exactly 9 items
    while (articles.length < 9) {
      articles.push({
        title: "More financial updates coming soon…",
        description:
          "Stay tuned for more real-time market and investment insights.",
        url: "#",
        source: { name: "SpendWise" },
        publishedAt: new Date().toISOString(),
      });
    }

    res.json({ articles: articles.slice(0, 9) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "err" });
  }
});

module.exports = router;
