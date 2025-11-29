import React, { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import axios from "axios";

export function LiveFinanceNews() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/news"
        );
        setNews(res.data.articles || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div
      className="space-y-10 animate-fadeIn min-h-screen p-4
                    bg-white dark:bg-[#0b0f1c] transition-colors"
    >
      <div className="mt-[40px]"></div>
      <section>
        <h2
          className="text-3xl font-semibold mb-6 
                       text-[#0A0E27] dark:text-purple-500 
                       flex items-center justify-center gap-2"
        >
          <Newspaper className="w-7 h-7 text-[#0A0E27] dark:text-purple-500" />
          Live Finance News
        </h2>

        {news.length === 0 ? (
          <p className="text-sm text-purple-500 dark:text-purple-300">
            No news available right now.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.slice(0, 9).map((n, i) => (
              <div
                key={i}
                className="
    bg-[#8b5cf6]
    dark:from-[#1c1530] dark:via-[#24143a] dark:to-[#2d1650]
    rounded-xl 
    p-5 
    border border-purple-200 dark:border-purple-800
    shadow-[0_4px_15px_rgba(128,128,128,0.45)]
    hover:shadow-[0_6px_25px_rgba(128,128,128,0.8)]
    hover:-translate-y-1 
    transition-all duration-300 ease-out
  "
              >
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg font-semibold 
                             text-white dark:text-purple-200 
                             hover:underline"
                >
                  {n.title}
                </a>

                <p
                  className="text-sm 
                              text-white dark:text-purple-300 
                              mt-2 line-clamp-3"
                >
                  {n.description || "Click to read more..."}
                </p>

                <div
                  className="mt-4 flex justify-between items-center 
                                text-xs text-white dark:text-purple-300"
                >
                  <span>{n.source?.name}</span>
                  <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
