const express = require("express");
const nodemailer = require("nodemailer");
const { GoogleGenAI } = require("@google/genai");
const router = express.Router();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/predict", async (req, res) => {
  try {
    const { summary, typeSummary, categorySummary } = req.body;

    const categoryBreakdown = categorySummary
      .map((c) => `${c.name}: Rs. ${c.total.toFixed(2)}`)
      .join(", ");

    const prompt = `
You are **SpendWise 🧠**, an Agentic AI-powered personal finance coach designed to help users build financial discipline before investing. 
Your job is not just to analyze numbers, but to understand patterns, detect money leakages, and guide users with personalized insights.

Below is the user's **filtered financial summary** for a specific date range.

📊 **Financial Summary**
- Total Income: Rs. ${summary.totalIncome.toFixed(2)}
- Total Spending: Rs. ${summary.totalSpending.toFixed(2)}
- Average Daily Spend: Rs. ${summary.avgDaily.toFixed(2)}
- Trend Direction: ${summary.trendDirection}
- Days Tracked: ${summary.daysTracked}

💰 **Transaction Types**
${typeSummary}

🧾 Spending Breakdown by Category: ${categoryBreakdown}

---

## 💡 **Context About SpendWise**
SpendWise is built for:
- Gig workers with irregular income  
- Young professionals learning money discipline  
- Informal sector employees lacking structured financial planning  

SpendWise focuses on:
- Improving spending awareness  
- Increasing savings consistency  
- Stabilizing cash flow  
- Nudging users toward healthy financial habits  
- Identifying leakage points (overspending zones)  
- Preparing users for long-term investing  

---

## 🧠 **Your Objective**
Based on the summary and category data, generate insights that:
- Detect overspending patterns  
- Identify cash-flow risks  
- Highlight savings opportunities  
- Provide specific nudges that make sense for the user’s lifestyle  
- Reflect short-term behavior (based on the selected date range)  
- Are supportive, motivational, and actionable  

---

## 📢 **Your Output Format**
Write insights in the following sections:

### Income Insights
Comment on income presence/absence, stability, and patterns.

### Expense Analysis
Detect overspending, leakages, daily spending behavior, and unusual spikes.

### Category Observations
Call out categories where the user is spending more than expected or show balanced behavior.

### Balance Tips
Provide simple, realistic adjustments for better cash-flow stability.

### Smart Recommendations
Give agentic AI-style nudges:
- small habit changes  
- saving triggers  
- ways to reduce frequent leaks  
- goals the user should consider  

### Future Plan
Provide a simple, structured financial roadmap for the next 2–4 weeks based on the user’s current spending patterns.  
Include:
- short-term spending targets  
- saving milestones  
- behavioral improvements  
- habits to build  
- early preparation steps for long-term financial stability (without going into investments yet)

Tone should be **friendly, empathetic, clear, and non-judgmental**, like a personal financial mentor guiding early-stage users before investing.
Remember:
No Markdown formatting. No asterisks. No headings. No numbered lists. Only clean text separated by line breaks.
`;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ type: "text", text: prompt }],
    });

    const message = response.text;
    res.json({ insight: message });
  } catch (err) {
    console.error("AI insight generation failed:", err);
    res.status(500).json({ error: "AI insight generation failed" });
  }
});

router.post("/send-insight-pdf", async (req, res) => {
  const { email, name, pdfBase64 } = req.body;

  if (!email || !pdfBase64) {
    return res.status(400).json({ error: "Email & PDF required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SpendWise Insights" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your SpendWise AI Insights Report (PDF Attached)",
      text: `
Hi ${name},

Your requested SpendWise AI Insights report has been successfully generated.

Attached is your personalized PDF containing:
- Spending summary
- Category-wise breakdown
- Expense & income analysis
- AI-generated financial recommendations

Thank you for using SpendWise to manage your finances smarter.

Regards,
SpendWise Team
      `,
      attachments: [
        {
          filename: "SpendWise_AI_Insights.pdf",
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { userMessage, transactions } = req.body;

    const message = userMessage.toLowerCase();

    // Detect general questions that should NOT trigger finance analysis
    const generalQuestionPatterns = [
      /^what\b/i,
      /^do\b/i,
      /^who\b/i,
      /^when\b/i,
      /^where\b/i,
      /^why\b/i,
      /^how\b/i,
      /convert/i,
      /calculate/i,
      /meaning/i,
      /definition/i,
      /formula/i,
      /\?$/,
    ];

    const isGeneralQuestion = generalQuestionPatterns.some((pattern) =>
      pattern.test(message)
    );

    const financeKeywords = [
      "spend",
      "spent",
      "expenses",
      "income",
      "transactions",
      "budget",
      "save",
      "savings",
      "analysis",
      "report",
      "statement",
      "limit",
      "prediction",
      "predictions",
    ];

    const isFinanceQuestion = financeKeywords.some((word) =>
      message.includes(word)
    );

    // If question is general → directly ask Gemini and return response
    if (isGeneralQuestion && !isFinanceQuestion) {
      const prompt = `
The user asked: "${userMessage}"

Answer clearly and directly.
Do NOT mention finances, budgeting, analytics, or transactions unless the question is actually about that.
Answer as a helpful assistant.
DO NOT use words like large language model.
You are FinBot, a personal financial coach.
  `;

      const ai = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ type: "text", text: prompt }],
      });

      return res.json({ reply: ai.text });
    }

    // Greetings
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey") ||
      message.includes("hii") ||
      message.includes("hi!")
    ) {
      return res.json({
        reply: "Hello! How can I help you today? 😊",
      });
    }

    if (
      message.includes("gemini") ||
      message.includes("chatgpt") ||
      message.includes("gpt")
    ) {
      return res.json({
        reply:
          "I am FinBot, your personal financial coaching agent. How can I help you?",
      });
    }

    // Time-based greetings
    if (message.includes("good morning")) {
      return res.json({ reply: "Good morning! ☀️ How can I help you today?" });
    }

    if (message.includes("good afternoon")) {
      return res.json({ reply: "Good afternoon! 😊 What can I do for you?" });
    }

    if (message.includes("good evening")) {
      return res.json({ reply: "Good evening! 🌙 Need any help?" });
    }

    if (message.includes("good night") || message.includes("gn")) {
      return res.json({ reply: "Good night! 🌙 Sleep well!" });
    }

    if (
      message.includes("thank") ||
      message.includes("thank you") ||
      message.includes("thanks")
    ) {
      return res.json({
        reply:
          "You are welcome. I am always here if you need any help related to finance. 😊",
      });
    }

    const goodbyeKeywords = [
      "bye",
      "goodbye",
      "see you",
      "tata",
      "ok bye",
      "bye bye",
      "good night",
      "good morning",
      "good evening",
      "cya",
      "gn",
      "take care",
    ];

    if (
      goodbyeKeywords.some((word) => userMessage.toLowerCase().includes(word))
    ) {
      return res.json({
        reply: "Bye! Take care 😊",
      });
    }

    /* -------------------------------------------------------------
       0️⃣ SAFE DATE PARSER (supports SMS formats like 24/01/2024)
    ------------------------------------------------------------- */
    function parseDateSafe(input) {
      let d = new Date(input);
      if (!isNaN(d)) return d;

      // dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
        const [dd, mm, yyyy] = input.split("/");
        return new Date(`${yyyy}-${mm}-${dd}`);
      }

      // dd-mm-yyyy
      if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
        const [dd, mm, yyyy] = input.split("-");
        return new Date(`${yyyy}-${mm}-${dd}`);
      }

      // dd-mm-yy
      if (/^\d{2}-\d{2}-\d{2}$/.test(input)) {
        const [dd, mm, yy] = input.split("-");
        return new Date(`20${yy}-${mm}-${dd}`);
      }

      return null;
    }

    /* -------------------------------------------------------------
       1️⃣ NLP DATE PARSING ENGINE
    ------------------------------------------------------------- */

    // const message = userMessage.toLowerCase();
    const now = new Date();
    let mode = "default";
    let from = null;
    let to = null;
    let label = "Full History";

    // --- last X days / next X days ---
    const numDaysRegex =
      /(last|past|previous|next|coming|future)\s+(\d+)\s+days?/;
    let nMatch = message.match(numDaysRegex);

    if (nMatch) {
      const count = parseInt(nMatch[2]);
      if (["next", "coming", "future"].includes(nMatch[1])) {
        mode = "future";
        from = now;
        to = new Date();
        to.setDate(now.getDate() + count);
        label = `Next ${count} days`;
      } else {
        mode = "past";
        to = now;
        from = new Date();
        from.setDate(now.getDate() - count);
        label = `Last ${count} days`;
      }
    }

    // --- last month ---
    if (message.includes("last month")) {
      mode = "past";
      let prevMonth = now.getMonth() - 1;
      from = new Date(now.getFullYear(), prevMonth, 1);
      to = new Date(now.getFullYear(), prevMonth + 1, 0);
      label = "Last Month";
    }

    // --- this month ---
    if (message.includes("this month")) {
      mode = "past";
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = now;
      label = "This Month";
    }

    // --- next month ---
    if (message.includes("next month")) {
      mode = "future";
      let nextM = now.getMonth() + 1;
      from = new Date(now.getFullYear(), nextM, 1);
      to = new Date(now.getFullYear(), nextM + 1, 0);
      label = "Next Month";
    }

    // --- this week ---
    if (message.includes("this week")) {
      mode = "past";
      const day = now.getDay();
      const diff = now.getDate() - day;
      from = new Date(now.getFullYear(), now.getMonth(), diff);
      to = now;
      label = "This Week";
    }

    // --- last week ---
    if (message.includes("last week")) {
      mode = "past";
      const day = now.getDay();
      const diff = now.getDate() - day - 7;
      from = new Date(now.getFullYear(), now.getMonth(), diff);
      to = new Date(now.getFullYear(), now.getMonth(), diff + 6);
      label = "Last Week";
    }

    // --- next week ---
    if (message.includes("next week")) {
      mode = "future";
      const day = now.getDay();
      const diff = now.getDate() - day + 7;
      from = new Date(now.getFullYear(), now.getMonth(), diff);
      to = new Date(now.getFullYear(), now.getMonth(), diff + 6);
      label = "Next Week";
    }

    // --- month name (july, august etc.) ---
    const monthRegex =
      /(january|february|march|april|may|june|july|august|september|october|november|december)/;
    const mMatch = message.match(monthRegex);

    if (mMatch) {
      mode = "month";
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      const idx = monthNames.indexOf(mMatch[1]);
      from = new Date(now.getFullYear(), idx, 1);
      to = new Date(now.getFullYear(), idx + 1, 0);
      label = mMatch[1].toUpperCase();
    }

    // default = full history
    if (!from) {
      from = new Date(2000, 0, 1);
      to = now;
    }

    /* -------------------------------------------------------------
       2️⃣ FILTER TRANSACTIONS BASED ON DATE RANGE
    ------------------------------------------------------------- */
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return !isNaN(d) && d >= from && d <= to;
    });

    /* -------------------------------------------------------------
       3️⃣ NO DATA HANDLING
    ------------------------------------------------------------- */
    if (filtered.length === 0) {
      // If it's a future query → generate a future plan
      if (mode === "future") {
        const prompt = `
The user asked: "${userMessage}"

There are no scheduled future transactions.

Write a detailed, helpful FUTURE SPENDING PLAN for: ${label}

Use the following logic:
- Use **Rs.** everywhere (not $)
- Assume typical user spending based on general patterns (daily needs, groceries, utilities, transport, discretionary spends)
- Estimate daily spending for the next period
- Break the recommendation into categories (Food, Transport, Shopping, Bills, Savings)
- Recommend savings strategy and spending caps
- Create a table with "Rs." prefix for all amounts
- Provide a cash flow stability plan 
- DO NOT say "no data" or "no transactions" 
- DO NOT reference the backend or database
- Sound confident and proactive, like a personal finance coach
`;

        const ai = await client.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ type: "text", text: prompt }],
        });

        return res.json({ reply: ai.text });
      }

      // Past query → normal “no transactions” response
      const prompt = `
The user asked: "${userMessage}"

There are NO transactions for: ${label}

Write a friendly helpful reply:
- Tell them no transactions exist in that period
- Suggest checking another time range
- Give useful budgeting/prediction advice anyway
`;
      const ai = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ type: "text", text: prompt }],
      });

      return res.json({ reply: ai.text });
    }

    /* -------------------------------------------------------------
       4️⃣ CORRECT INCOME & EXPENSE CALCULATION
    ------------------------------------------------------------- */

    const expenses = filtered.filter((t) => t.type === "Expense");
    const incomes = filtered.filter((t) => t.type === "Income");

    const totalSpending = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);

    /* -------------------------------------------------------------
       5️⃣ PROPER DAILY AVERAGE (based on days, not transactions)
    ------------------------------------------------------------- */
    const daysRequested = Math.max(
      Math.ceil((to - from) / (1000 * 60 * 60 * 24)),
      1
    );

    const avgDailySpend = totalSpending / filtered.length;

    /* -------------------------------------------------------------
       6️⃣ PREDICTIVE MODEL (exponential smoothing)
    ------------------------------------------------------------- */
    let smoothed = 0;
    const alpha = 0.5;

    expenses.forEach((t) => {
      smoothed = alpha * t.amount + (1 - alpha) * smoothed;
    });

    const predictedDailySpend = smoothed;

    /* -------------------------------------------------------------
       7️⃣ CATEGORY RATIOS
    ------------------------------------------------------------- */
    const categoryTotals = {};
    expenses.forEach((t) => {
      if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
      categoryTotals[t.category] += t.amount;
    });

    const categoryRatios = {};
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      categoryRatios[cat] = amt / totalSpending;
    });

    /* -------------------------------------------------------------
       8️⃣ OVESPENDING ALERTS
    ------------------------------------------------------------- */
    let alerts = [];

    if (totalSpending > totalIncome) {
      alerts.push("⚠ You are spending more than your income.");
    }

    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > totalSpending * 0.4) {
        alerts.push(`⚠ High spending detected in **${cat}** category.`);
      }
    });

    /* -------------------------------------------------------------
       9️⃣ GOAL DETECTION
    ------------------------------------------------------------- */
    const goalRegex = /(buy|save|afford|get|purchase|plan for)\s+(.+)/i;
    const goalMatch = userMessage.match(goalRegex);
    let detectedGoal = goalMatch ? goalMatch[2] : null;

    /* -------------------------------------------------------------
       🔟 AI RESPONSE GENERATION
    ------------------------------------------------------------- */

    const prompt = `
You are FinBot 🧠, the personal financial coach.

The user asked: "${userMessage}"

📅 Time Range: ${label}

📊 Summary:
- Total Income: Rs ${totalIncome}
- Total Spending: Rs ${totalSpending}
- Average Daily Spend: Rs ${avgDailySpend.toFixed(2)}

📈 Prediction Model:
- Predicted daily spend: Rs ${predictedDailySpend.toFixed(2)}
- Category ratios: ${JSON.stringify(categoryRatios)}

🚨 Alerts:
${alerts.length ? alerts.join("\n") : "No major alerts"}

🎯 Goal Detected: ${detectedGoal || "None"}

💬 Transactions in this range:
${filtered
  .map(
    (t) =>
      `• ${parseDateSafe(t.date).toDateString()} — ${t.category} : Rs ${
        t.amount
      } (${t.type})`
  )
  .join("\n")}

💡 Instructions for AI:
- Give a friendly, conversational breakdown
- If the user asked for future projections, generate them
- If goal detected, create a full actionable savings plan
`;

    const ai = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ type: "text", text: prompt }],
    });

    res.json({ reply: ai.text });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat error" });
  }
});

// router.post("/chat", async (req, res) => {
//   try {
//     const { userMessage, transactions } = req.body;

//     // Extract number + type (past/future)
//     const timeRegex =
//       /last\s+(\d+)\s+days?|past\s+(\d+)\s+days?|previous\s+(\d+)\s+days?|next\s+(\d+)\s+days?|coming\s+(\d+)\s+days?|future\s+(\d+)\s+days?/i;
//     const match = userMessage.match(timeRegex);

//     let days = null;
//     let mode = "default"; // past / future / default

//     if (match) {
//       days =
//         match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

//       days = parseInt(days);

//       if (match[4] || match[5] || match[6]) {
//         mode = "future"; // next X days
//       } else {
//         mode = "past"; // last X days
//       }
//     }

//     // FILTER TRANSACTIONS FOR LAST X DAYS IF REQUESTED
//     let filtered = transactions;

//     if (mode === "past" && days) {
//       const cutoff = new Date();
//       cutoff.setDate(cutoff.getDate() - days);

//       filtered = transactions.filter((t) => new Date(t.date) >= cutoff);
//     }

//     const transactionListText = filtered
//       .map((t) => `• ${t.date} — ${t.category} — Rs. ${t.amount} (${t.type})`)
//       .join("\n");

//     // REBUILD SUMMARY BASED ON FILTERED DATA
//     const totalIncome = filtered
//       .filter((t) => t.type === "income")
//       .reduce((sum, t) => sum + t.amount, 0);

//     const totalSpending = filtered
//       .filter((t) => t.type === "expense")
//       .reduce((sum, t) => sum + t.amount, 0);

//     const daysTracked =
//       days ||
//       Math.max(
//         1,
//         Math.ceil(
//           (new Date() - new Date(transactions[0]?.date)) / (1000 * 60 * 60 * 24)
//         )
//       );

//     const avgDaily = totalSpending / daysTracked;

//     // 1. Extract all unique days from the data (Income + Expense)
//     const allDays = [
//       ...new Set(filtered.map((t) => new Date(t.date).toDateString())),
//     ];

//     // 2. Initialize all days with 0 expense
//     const dailyExpensesMap = allDays.reduce((acc, day) => {
//       acc[day] = 0;
//       return acc;
//     }, {});

//     // 3. Add actual expenses
//     filtered.forEach((t) => {
//       if (t.type !== "Expense") return;

//       const day = new Date(t.date).toDateString();
//       dailyExpensesMap[day] += t.amount;
//     });

//     // 2. Convert to sorted array by date (ascending)
//     const dailyExpenses = Object.entries(dailyExpensesMap)
//       .map(([day, amount]) => ({
//         day,
//         amount,
//         sortDate: new Date(day),
//       }))
//       .sort((a, b) => a.sortDate - b.sortDate);

//     // 3. Detect continuous trend
//     let increasing = true;
//     let decreasing = true;

//     for (let i = 1; i < dailyExpenses.length; i++) {
//       const prev = dailyExpenses[i - 1].amount;
//       const curr = dailyExpenses[i].amount;

//       if (curr <= prev) {
//         increasing = false;
//       }
//       if (curr >= prev) {
//         decreasing = false;
//       }
//     }

//     // 4. Final trend
//     let trendDirection = "irregular";

//     if (increasing === false && decreasing === false)
//       trendDirection = "irregular";
//     else if (increasing) trendDirection = "increasing";
//     else if (decreasing) trendDirection = "decreasing";

//     const summary = {
//       totalIncome,
//       totalSpending,
//       avgDaily,
//       trendDirection,
//       daysTracked,
//     };

//     // CATEGORY SUMMARY
//     const categoryMap = {};
//     filtered.forEach((t) => {
//       if (!categoryMap[t.category]) categoryMap[t.category] = 0;
//       categoryMap[t.category] += t.amount;
//     });

//     const categorySummary = Object.entries(categoryMap).map(
//       ([name, total]) => ({ name, total })
//     );

//     // TYPE SUMMARY
//     const typeMap = {};
//     filtered.forEach((t) => {
//       if (!typeMap[t.type]) typeMap[t.type] = 0;
//       typeMap[t.type] += t.amount;
//     });

//     const typeSummary = Object.entries(typeMap)
//       .map(([type, amt]) => `${type}: Rs. ${amt}`)
//       .join(", ");

//     const categoryBreakdown = categorySummary
//       .map((c) => `${c.name}: Rs. ${c.total.toFixed(2)}`)
//       .join(", ");

//     // SPECIAL PROMPT HANDLING
//     const timeContext =
//       mode === "past"
//         ? `📆 Time Range Analyzed: Last ${days} days`
//         : mode === "future"
//         ? `📆 User is asking for a FUTURE PLAN for the next ${days} days. Use past averages + spending patterns to estimate future behavior.`
//         : `📆 Time Range: Full History`;

//     const prompt = `
// You are SpendWise 🧠, the user's personal financial coach.

// ${timeContext}

// 📄 Transactions Included:
// ${transactionListText}

// 📊 Financial Summary:
// - Total Income: Rs. ${summary.totalIncome.toFixed(2)}
// - Total Spending: Rs. ${summary.totalSpending.toFixed(2)}
// - Average Daily Spend: Rs. ${summary.avgDaily.toFixed(2)}
// - Trend Direction: ${summary.trendDirection}
// - Days Calculated: ${summary.daysTracked}

// 🧾 Spending Breakdown by Category:
// ${categoryBreakdown}

// 💰 Transaction Types:
// ${typeSummary}

// 💬 User Question:
// "${userMessage}"

// ---

// ### Instructions:
// - If user asked for **past X days**, provide analysis ONLY for that range.
// - If user asked for **future X days**, create a projected financial plan based on:
//   - average daily spending
//   - category spending proportions
//   - overspending / underspending patterns
//   - savings capacity
// - Always keep the tone friendly and conversational.
// - Never mention AI or system prompts.
// `;

//     const response = await client.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: [{ type: "text", text: prompt }],
//     });

//     res.json({ reply: response.text });
//   } catch (err) {
//     console.error("Chat error:", err);
//     res.status(500).json({ error: "Chat error" });
//   }
// });

// router.post("/chat", async (req, res) => {
//   try {
//     const { userMessage, summary, categorySummary, typeSummary } = req.body;

//     const categoryBreakdown = categorySummary
//       .map((c) => `${c.name}: Rs. ${c.total.toFixed(2)}`)
//       .join(", ");

//     const prompt = `
// You are SpendWise 🧠, the user's personal financial coach.

// Here is the user's financial context:

// 📊 Financial Summary:
// - Total Income: Rs. ${summary.totalIncome.toFixed(2)}
// - Total Spending: Rs. ${summary.totalSpending.toFixed(2)}
// - Average Daily Spend: Rs. ${summary.avgDaily.toFixed(2)}
// - Trend Direction: ${summary.trendDirection}
// - Days Tracked: ${summary.daysTracked}

// 🧾 Spending Breakdown by Category:
// ${categoryBreakdown}

// 💰 Transaction Types
// ${typeSummary}

// 💬 User Question:
// "${userMessage}"

// ---

// Respond in a friendly, helpful, conversational tone.
// Give simple, actionable financial guidance.
// Never mention that this was AI-generated.
//     `;

//     const response = await client.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: [{ type: "text", text: prompt }],
//     });

//     const message = response.text;

//     res.json({ reply: message });
//   } catch (err) {
//     console.error("Chat error:", err);
//     res.status(500).json({ error: "Chat error" });
//   }
// });

module.exports = router;
