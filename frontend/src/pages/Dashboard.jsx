import React, { useEffect, useState, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import axios from "axios";
import toast from "react-hot-toast";

export default function Dashboard({ theme }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi👋, I am FinBot, your personal financial coaching agent.\nHow can I help you?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

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

  const api = import.meta.env.VITE_BACKEND_URL + "/api/transactions";
  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const confirmToast = (message) => {
    return new Promise((resolve) => {
      const t = toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <span>{message}</span>

            <div className="flex gap-2 justify-center">
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Yes
              </button>

              <button
                className="px-3 py-1 bg-gray-300 text-black rounded"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                No
              </button>
            </div>
          </div>
        ),
        { duration: Infinity } // stays until user clicks
      );
    });
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(api, { headers: authHeader });
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (newTx) => {
    try {
      const res = await axios.post(api, newTx, { headers: authHeader });
      setTransactions((prev) => [res.data, ...prev]);
      toast.success("Transaction added successfully!");
    } catch (e) {
      toast.error("Add failed");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmToast(
      "Are you sure you want to delete this transaction?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${api}/${id}`, { headers: authHeader });

      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success("Transaction deleted successfully!");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const res = await axios.put(`${api}/${id}`, updatedData, {
        headers: authHeader,
      });

      setTransactions((prev) =>
        prev.map((tx) => (tx._id === id ? res.data : tx))
      );
      toast.success("Transaction updated successfully!");
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div>
      <h1
        className="text-3xl font-extrabold mb-4
        bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent mt-[70px]"
      >
        Dashboard
      </h1>

      {/* Add Transaction Card */}
      <div
        className="bg-purple-50 dark:bg-gray-800 border border-purple-200
          dark:border-gray-700 p-5 rounded-2xl shadow-sm mb-6"
      >
        <h2 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Add Transaction
        </h2>
        <TransactionForm onAdd={handleAddTransaction} />
      </div>

      {/* Recent Transactions */}
      <div
        className="bg-purple-50 dark:bg-gray-800 border border-purple-200
          dark:border-gray-700 p-5 rounded-2xl shadow-sm"
      >
        <h2 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">
          Recent Transactions
        </h2>

        <TransactionList
          transactions={transactions}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Floating Chat Icon */}
      {!chatOpen && (
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
}
