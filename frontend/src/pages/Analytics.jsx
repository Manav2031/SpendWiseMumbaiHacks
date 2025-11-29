// UPDATED Analytics.jsx WITH DARK MODE SUPPORT
import React, { useEffect, useState, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Same purple palette
const COLORS = [
  "#8b5cf6",
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#e9d5ff",
  "#f3e8ff",
  "#ddd6fe",
  "#e0b3ff",
];

const Analytics = ({ theme }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [filteredError, setFilteredError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi👋, I am FinBot, your personal financial coaching agent.\nHow can I help you?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechObj, setSpeechObj] = useState(null);

  let speech = null;
  const hasStartedRef = useRef(false);

  // Toggle Voice Output
  const toggleSpeech = () => {
    if (!speechObj) {
      console.warn("No speech object available yet.");
      return;
    }

    // Case 1: If speech never started → Start it
    if (!hasStartedRef.current) {
      window.speechSynthesis.cancel(); // reset engine
      window.speechSynthesis.speak(speechObj);
      hasStartedRef.current = true;
      setIsSpeaking(true);
      return;
    }

    // Case 2: Already speaking → Pause
    if (isSpeaking && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
      return;
    }

    // Case 3: Paused → Resume
    if (!isSpeaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      return;
    }

    // Case 4: Finished naturally → Restart from beginning
    if (!window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.speak(speechObj);
      setIsSpeaking(true);
      return;
    }
  };

  const toggleVoiceReply = () => {
    if (speaking) {
      // Stop audio immediately
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const lastBotMsg = [...chatMessages]
      .reverse()
      .find((m) => m.sender === "bot");

    if (!lastBotMsg) return;

    speech = new SpeechSynthesisUtterance(lastBotMsg.text);
    speech.lang = "en-US";

    speech.onend = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.continuous = false;

  const startListening = () => {
    setListening(true);
    recognition.start();

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setChatInput((prev) => prev + " " + transcript);
    };
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  // PDF Styles
  const styles = StyleSheet.create({
    page: {
      fontFamily: "Times-Roman",
      padding: 30,
    },
    title: {
      fontSize: 22,
      textAlign: "center",
      marginBottom: 20,
    },
    text: {
      fontSize: 12,
    },
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const AIInsightsDocument = ({ insights }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>SpendWise AI Insights</Text>

        {fromDate && toDate && (
          <Text
            style={{
              fontSize: 14,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Date Range: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        )}

        <View>
          {insights.split("\n").map((line, i) => (
            <Text
              key={i}
              style={{
                ...styles.text,
                marginBottom: 8, // <-- space after every point
              }}
            >
              {line}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );

  const sendPdfEmail = async () => {
    const blob = await pdf(
      <AIInsightsDocument insights={aiInsight} />
    ).toBlob();

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64PDF = reader.result.split(",")[1];

      try {
        await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/api/ai/send-insight-pdf",
          {
            email: JSON.parse(localStorage.getItem("user")).email,
            name: JSON.parse(localStorage.getItem("user")).name,
            pdfBase64: base64PDF,
          }
        );

        console.log("Email sent successfully");
      } catch (err) {
        console.error("Mail send error:", err);
      }
    };

    reader.readAsDataURL(blob);
  };

  // Fetch transactions
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/transactions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setTransactions(res.data))
      .catch(console.error);
  }, []);

  // Filtering logic
  useEffect(() => {
    if (!fromDate || !toDate) {
      setFiltered([]);
      setSummary(null);
      setAiInsight("");
      setDateError("");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setDateError("Invalid date range");
      setFiltered([]);
      setSummary(null);
      setAiInsight("");
      return;
    }

    setDateError("");

    const filteredData = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });

    if (filteredData.length === 0) {
      setFilteredError("No data available");
      setFiltered([]);
      setSummary(null);
      setAiInsight("");
      return;
    }

    setFilteredError("");
    setFiltered(filteredData);
    calculateSummary(filteredData);
  }, [fromDate, toDate, transactions]);

  // Summary calculation + AI request
  const calculateSummary = async (data) => {
    if (!data.length) return;

    const totalIncome = data
      .filter((t) => t.type === "Income")
      .reduce((a, t) => a + t.amount, 0);

    const totalExpense = data
      .filter((t) => t.type === "Expense")
      .reduce((a, t) => a + t.amount, 0);

    // 1. Extract all unique days from the data (Income + Expense)
    const allDays = [
      ...new Set(data.map((t) => new Date(t.date).toDateString())),
    ];

    // 2. Initialize all days with 0 expense
    const dailyExpensesMap = allDays.reduce((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {});

    // 3. Add actual expenses
    data.forEach((t) => {
      if (t.type !== "Expense") return;

      const day = new Date(t.date).toDateString();
      dailyExpensesMap[day] += t.amount;
    });

    // 2. Convert to sorted array by date (ascending)
    const dailyExpenses = Object.entries(dailyExpensesMap)
      .map(([day, amount]) => ({
        day,
        amount,
        sortDate: new Date(day),
      }))
      .sort((a, b) => a.sortDate - b.sortDate);

    // 3. Detect continuous trend
    let increasing = true;
    let decreasing = true;

    for (let i = 1; i < dailyExpenses.length; i++) {
      const prev = dailyExpenses[i - 1].amount;
      const curr = dailyExpenses[i].amount;

      if (curr <= prev) {
        increasing = false;
      }
      if (curr >= prev) {
        decreasing = false;
      }
    }

    // 4. Final trend
    let trendDirection = "irregular";

    if (increasing === false && decreasing === false)
      trendDirection = "irregular";
    else if (increasing) trendDirection = "increasing";
    else if (decreasing) trendDirection = "decreasing";

    // 5. Summary
    const summaryData = {
      totalIncome: totalIncome,
      totalSpending: totalExpense,
      avgDaily:
        totalExpense /
        new Set(data.map((t) => new Date(t.date).toDateString())).size,
      trendDirection,
      daysTracked: dailyExpenses.length,
    };

    const categorySummary = Object.entries(
      data.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    setSummary(summaryData);

    try {
      const aiRes = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/ai/predict",
        {
          summary: summaryData,
          categorySummary,
        }
      );
      setAiInsight(aiRes.data.insight);
    } catch (err) {
      console.error("AI Error:", err);
    }
  };

  // Chart data helpers
  const incomeExpenseData = [
    {
      name: "Income",
      amount: filtered
        .filter((t) => t.type === "Income")
        .reduce((a, t) => a + t.amount, 0),
    },
    {
      name: "Expense",
      amount: filtered
        .filter((t) => t.type === "Expense")
        .reduce((a, t) => a + t.amount, 0),
    },
  ];

  const dailyData = Object.values(
    filtered.reduce((acc, t) => {
      const dateObj = new Date(t.date);

      // Format label
      const date = dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!acc[date]) acc[date] = { date, Income: 0, Expense: 0 };
      acc[date][t.type] += t.amount;

      // Store actual date to help sorting
      acc[date]._sortDate = dateObj;
      return acc;
    }, {})
  )
    .sort((a, b) => a._sortDate - b._sortDate) // ascending order
    .map((item) => {
      delete item._sortDate; // cleanup
      return item;
    });

  const categoryData = Object.values(
    filtered
      .filter((t) => t.type === "Expense")
      .reduce((acc, t) => {
        acc[t.category] = acc[t.category] || { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
        return acc;
      }, {})
  );

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user message
    const userMessage = { sender: "user", text: chatInput, time: timestamp };
    setChatMessages((prev) => [...prev, userMessage]);

    const userText = chatInput;
    setChatInput("");
    setIsTyping(true); // show AI typing...

    //   // 2. Create category summary for chat
    const categorySummaryForChat = Object.entries(
      filtered.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/ai/chat",
        {
          userMessage: userText,
          transactions: transactions,
          // summary: summary,
          // categorySummary: categorySummaryForChat,
          // typeSummary: `
          //   Income count: ${filtered.filter((t) => t.type === "Income").length},
          //   Expense count: ${
          //     filtered.filter((t) => t.type === "Expense").length
          //   }
          // `,
        }
      );

      const botReply = res.data.reply;
      setIsTyping(false);

      const botTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Add bot message
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, time: botTimestamp },
      ]);

      // Prepare Speech Object — but DO NOT auto-play
      const utterance = new SpeechSynthesisUtterance(botReply);
      utterance.lang = "en-IN";

      setSpeechObj(utterance);
      hasStartedRef.current = false;
      setIsSpeaking(false); // ensure not auto-speaking
    } catch (err) {
      console.error(err);
      setIsTyping(false);

      const errorMsg = "⚠️ Something went wrong. Try again.";

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: errorMsg,
          time: new Date().toLocaleTimeString(),
        },
      ]);

      const speech = new SpeechSynthesisUtterance(errorMsg);
      speech.lang = "en-IN";
      window.speechSynthesis.speak(speech);
    }
  };

  const hasData = filtered.length > 0;

  return (
    <div
      className={`p-6 min-h-screen mt-[70px] transition-all duration-200 
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-[#0A0E27] to-[#1a1f3d] text-white"
            : "bg-gradient-to-b from-purple-50 to-purple-100 text-[#0A0E27]"
        }`}
    >
      {/* Heading */}
      <h2 className="text-3xl font-bold mb-6 text-center">
        📊 SpendWise Analytics
      </h2>

      {/* Filters */}
      <div
        className={`flex flex-wrap justify-center gap-6 mb-8 p-5 rounded-2xl shadow-lg
          ${
            theme === "dark"
              ? "bg-[#11172c] text-white border border-gray-700"
              : "bg-white text-gray-700"
          }`}
      >
        {/* From Date */}
        <div className="flex flex-col">
          <label className="font-semibold">From:</label>
          <input
            type="date"
            className={`border p-2 dark-date rounded-lg transition
              ${
                theme === "dark"
                  ? "bg-[#0d1324] text-white border-gray-600"
                  : "bg-white text-gray-700"
              }`}
            value={fromDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setFromDate(e.target.value);
              localStorage.setItem("fromDate", e.target.value);
            }}
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col">
          <label className="font-semibold">To:</label>
          <input
            type="date"
            className={`border p-2 dark-date rounded-lg transition
              ${
                theme === "dark"
                  ? "bg-[#0d1324] text-white border-gray-600"
                  : "bg-white text-gray-700"
              }`}
            value={toDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setToDate(e.target.value);
              localStorage.setItem("toDate", e.target.value);
            }}
          />
        </div>

        {/* Clear Filter */}
        <button
          className={`text-sm font-semibold px-5 py-2 h-[40px] mt-[25px] rounded-lg transition
            ${
              theme === "dark"
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          onClick={() => {
            setFromDate("");
            setToDate("");
            localStorage.removeItem("fromDate");
            localStorage.removeItem("toDate");
            setFiltered([]);
            setSummary(null);
            setAiInsight("");
            setDateError("");
            setFilteredError("");
          }}
        >
          Clear Filter
        </button>
      </div>

      {/* Date errors */}
      {dateError && (
        <p className="text-center text-red-500 font-semibold mb-4">
          {dateError}
        </p>
      )}

      {filteredError && !dateError && (
        <p className="text-center text-red-500 font-semibold mb-4">
          No data available
        </p>
      )}

      {/* Summary */}
      {summary && (
        <div
          className={`rounded-2xl p-6 shadow-md mb-8
            ${
              theme === "dark"
                ? "bg-[#11172c] text-white border border-gray-700"
                : "bg-white text-gray-700"
            }`}
        >
          <h3 className="text-xl font-semibold mb-3 text-center">📈 Summary</h3>

          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="font-medium">Total Income</p>
              <p className="text-green-500 font-bold">
                Rs. {summary.totalIncome.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="font-medium">Total Expense</p>
              <p className="text-red-500 font-bold">
                Rs. {summary.totalSpending.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="font-medium">Average Daily Expense</p>
              <p className="text-purple-500 font-bold">
                Rs. {summary.avgDaily.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="font-medium">Days Tracked</p>
              <p className="text-purple-400 font-bold">{summary.daysTracked}</p>
            </div>

            <div>
              <p className="font-medium">Expense Trend</p>
              <p
                className={`font-bold ${
                  summary.trendDirection === "increasing"
                    ? "text-red-500"
                    : summary.trendDirection === "decreasing"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {summary.trendDirection === "increasing"
                  ? "Increasing 📈"
                  : summary.trendDirection === "decreasing"
                  ? "Decreasing 📉"
                  : "Irregular 🔀"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {hasData && (
        <>
          {/* Income vs Expense */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div
              className={`rounded-2xl p-6 shadow-md
              ${
                theme === "dark"
                  ? "bg-[#11172c] text-white border border-gray-700"
                  : "bg-white text-gray-800"
              }`}
            >
              <h3 className="font-semibold text-lg mb-4">
                💰 Income vs Expense
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeExpenseData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "dark" ? "#444" : "#ccc"}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={theme === "dark" ? "#fff" : "#000"}
                  />
                  <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
                  <Tooltip
                    contentStyle={{
                      background: theme === "dark" ? "#1a1a1a" : "#fff",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  />
                  <Bar dataKey="amount">
                    {incomeExpenseData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={e.name === "Income" ? "#00c49f" : "#ff6b6b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Trend */}
            <div
              className={`rounded-2xl p-6 shadow-md
              ${
                theme === "dark"
                  ? "bg-[#11172c] text-white border border-gray-700"
                  : "bg-white text-gray-800"
              }`}
            >
              <h3 className="font-semibold text-lg mb-4">
                📅 Daily Financial Trend
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "dark" ? "#444" : "#ccc"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={theme === "dark" ? "#fff" : "#000"}
                  />
                  <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />

                  <Tooltip
                    contentStyle={{
                      background: theme === "dark" ? "#1a1a1a" : "#fff",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
                  />

                  <Line dataKey="Income" stroke="#00c49f" strokeWidth={2} />
                  <Line dataKey="Expense" stroke="#ff6b6b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          {categoryData.length > 0 && (
            <div
              className={`rounded-2xl p-6 shadow-md mt-10
                ${
                  theme === "dark"
                    ? "bg-[#11172c] text-white border border-gray-700"
                    : "bg-white text-gray-800"
                }`}
            >
              <h3 className="font-semibold text-lg mb-4">
                🥧 Category-wise Expense
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={false} // ❌ remove labels from graph
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  {/* Tooltip */}
                  <Tooltip
                    contentStyle={{
                      background: theme === "dark" ? "#1a1a1a" : "#fff",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  />

                  {/* ✔️ Custom Legend: category + value */}
                  <Legend
                    wrapperStyle={{ color: theme === "dark" ? "#fff" : "#000" }}
                    formatter={(value, entry, index) => {
                      const item = categoryData.find((c) => c.name === value);
                      return `${value}: Rs. ${item?.value ?? 0}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Insights */}
          <div
            className={`rounded-2xl p-6 shadow-md mt-10
              ${
                theme === "dark"
                  ? "bg-[#11172c] text-white border border-gray-700"
                  : "bg-white text-gray-800"
              }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold mb-3">
                🤖 SpendWise AI Insights
              </h3>

              {aiInsight && (
                <PDFDownloadLink
                  document={<AIInsightsDocument insights={aiInsight} />}
                  fileName="SpendWise_AI_Insights.pdf"
                  className={`px-4 py-1.5 rounded-lg text-sm transition
                    ${
                      theme === "dark"
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  // onClick={sendPdfEmail}
                >
                  {({ loading }) =>
                    loading ? "Generating PDF..." : "Download PDF"
                  }
                </PDFDownloadLink>
              )}
            </div>

            {aiInsight ? (
              <div className="whitespace-pre-wrap">{aiInsight}</div>
            ) : (
              <p className="italic text-gray-400">
                Loading SpendWise AI Insights…
              </p>
            )}
          </div>
        </>
      )}

      {/* Floating Chat Icon */}
      {summary && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-10 bg-purple-600 text-white p-4 rounded-full shadow-xl hover:bg-purple-700 transition z-50"
        >
          💬
        </button>
      )}

      {/* CHAT WINDOW (Bottom Right) */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setChatOpen(false)}
        >
          {/* Chat Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`
        fixed
        bottom-0 right-0 
        w-full h-[75vh]
        sm:bottom-6 sm:right-6
        sm:w-[90%] sm:max-w-[420px]
        sm:h-[70vh] sm:max-h-[550px]
        rounded-t-2xl sm:rounded-2xl
        shadow-2xl flex flex-col overflow-hidden
        transition-all duration-300
        ${
          theme === "dark"
            ? "bg-[#11172c] text-white"
            : "bg-white text-gray-800"
        }
      `}
          >
            {/* Header */}
            <div className="p-4 text-lg font-semibold flex justify-between items-center border-b border-gray-600">
              FinBot
              <button onClick={() => setChatOpen(false)} className="text-xl">
                ✖
              </button>
            </div>

            {/* CHAT BODY */}
            <div className="chat-container flex-1 p-4 overflow-y-auto">
              <div className="chat-window space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`msg ${msg.sender}`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className="timestamp text-[10px] opacity-70">
                      {msg.time}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="typing-indicator flex gap-1 items-center">
                    <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                    <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-300"></div>
                  </div>
                )}
              </div>
            </div>

            {/* INPUT AREA */}
            <div className="chat-input-area p-3 border-t border-gray-600 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask FinBot..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                className="flex-1 p-2 rounded-lg outline-none text-black text-sm sm:text-base border border-black"
              />

              <button
                className="px-3 py-2 bg-purple-600 text-white rounded-lg"
                onClick={sendChatMessage}
              >
                ➤
              </button>

              <div
                className={`
            p-3 rounded-full cursor-pointer 
            ${listening ? "bg-purple-300 animate-pulse" : "bg-purple-600"}
          `}
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
              >
                🎤
              </div>

              <button
                onClick={toggleSpeech}
                className={`
            px-3 py-2 rounded-lg text-white
            ${isSpeaking ? "bg-purple-300" : "bg-purple-600"}
          `}
              >
                {isSpeaking ? "Pause 🔇" : "Speak 🔊"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
