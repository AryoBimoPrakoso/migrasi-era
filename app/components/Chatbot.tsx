"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ikonChatbot from "@/public/assets/img/chat.png";

const Chatbot = () => {
  type Message = {
    id: number;
    sender: string;
    text: string;
    time: string;
  };

  const [chat, setChat] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "How can I help you?",
      time: "03:45 PM",
    },
    {
      id: 2,
      sender: "user",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit…",
      time: "05:30 PM",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "user",
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
  };

  return (
    <div className="fixed flex items-end gap-4 bottom-0 right-0 mb-8 mr-8">
      {/* UI ChatBot */}
      <div
        className={`mt-4 w-[350px] h-[500px] bg-[#f8f8f8] rounded-3xl shadow-xl overflow-hidden flex flex-col border ${
          chat ? "opacity-100 duration-300" : "opacity-0 duration-300"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b flex items-center gap-3">
          <div className="text-xl">🤖</div>
          <h2 className="font-semibold text-lg">Chatbot</h2>
        </div>

        {/* Availability */}
        <div className="p-3 flex items-center gap-2 text-xs text-gray-500 justify-center">
          <span>⏱</span>
          <p>Replies available Monday–Friday, 8 a.m.–5 p.m.</p>
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
                {msg.text}
                <div className="text-[10px] text-gray-500 mt-1 text-right">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white flex items-center gap-3 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm outline-none"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Button chatbot */}
      <button
        onClick={() => setChat(!chat)}
        className="cursor-pointer hover:brightness-75 duration-300 "
      >
        <Image
          src={ikonChatbot}
          alt="Chatbot"
          className="w-16 drop-shadow-lg"
        />
      </button>
    </div>
  );
};

export default Chatbot;
