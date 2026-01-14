"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ikonChatbot from "@/public/assets/img/chat.png";
import { CHATBOT_API_URL } from "@/lib/constants";
import { SendHorizontal } from "lucide-react";

// API endpoint chatbot (uses environment variable)
const CHATBOT_PREDICT_URL = `${CHATBOT_API_URL}/predict`;

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
  time: string;
};

// Function to parse Markdown links [text](url) into clickable elements
const parseMarkdownLinks = (text: string): React.ReactNode[] => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const linkText = match[1];
    const linkUrl = match[2];

    // Check if it's an internal link (localhost or relative path)
    const isInternal =
      linkUrl.includes("localhost:3000") || linkUrl.startsWith("/");

    if (isInternal) {
      // Convert localhost URL to relative path for Next.js Link
      const relativePath = linkUrl.replace("http://localhost:3000", "");
      parts.push(
        <Link
          key={match.index}
          href={relativePath}
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {linkText}
        </Link>
      );
    } else {
      // External link
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          {linkText}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last link
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

const Chatbot = () => {
  const [chat, setChat] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Halo! Ada yang bisa saya bantu tentang produk Era Banyu Packaging?",
      time: "",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mengirim input pengguna dan menerima respon dari chatbot.
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(CHATBOT_PREDICT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.response || "Maaf, terjadi kesalahan.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Maaf, sedang ada gangguan koneksi. Silakan coba lagi nanti.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed flex items-end gap-1 md:gap-4 bottom-0 right-0 mb-8 mr-2 md:mr-8 z-50 pointer-events-none">
      {/* UI ChatBot */}
      <div
        className={`mt-4 w-[300px] md:w-[350px] h-[450px] md:h-[500px] bg-[#f8f8f8] rounded-3xl shadow-xl overflow-hidden flex flex-col border pointer-events-auto transition-all duration-300 ${
          chat
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b flex items-center gap-3">
          <div className="text-xl">🤖</div>
          <h2 className="font-semibold text-lg">Chatbot Era Banyu</h2>
        </div>

        {/* Availability */}
        <div className="p-3 flex flex-col items-center gap-1 text-center text-xs text-gray-500 justify-center">
          <p className="flex gap-1">
            <span>⏱</span>Admin tersedia Senin–Jumat, 08.00–17.00 WIB.
          </p>
          <p>
            Hubungi <Link href="https://wa.me/6281289505095" className="text-blue-500 underline" target="_blank">WhatsApp</Link>
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f6f6f6]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm relative
                    ${
                      msg.sender === "user"
                        ? "bg-gray-300 text-gray-900"
                        : "bg-white text-gray-700"
                    }
                  `}
              >
                {/* Render text with parsed Markdown links */}
                <span>{parseMarkdownLinks(msg.text)}</span>
                <div className="text-[10px] text-gray-500 mt-1 text-right">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-xl text-sm shadow-sm">
                <div className="flex gap-1">
                  <span className="animate-bounce text-gray-300 text-md">
                    ●
                  </span>
                  <span
                    className="animate-bounce text-gray-300 text-md"
                    style={{ animationDelay: "0.1s" }}
                  >
                    ●
                  </span>
                  <span
                    className="animate-bounce text-gray-300 text-md"
                    style={{ animationDelay: "0.2s" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white flex items-center gap-3 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ketik pesan..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendHorizontal />
          </button>
        </div>
      </div>

      {/* Button chatbot */}
      <button
        onClick={() => setChat(!chat)}
        className="cursor-pointer hover:brightness-75 duration-300 pointer-events-auto"
      >
        <Image
          src={ikonChatbot}
          alt="Chatbot"
          className="w-8 md:w-16 drop-shadow-lg"
        />
      </button>
    </div>
  );
};

export default Chatbot;
