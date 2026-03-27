import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/chatbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import clsx from "clsx";

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar?: boolean;
  primaryColor?: string;
  textColor?: string;
  chatbotAvatar?: string | null;
}

export function ChatMessage({
  message,
  showAvatar = true,
  primaryColor = "#007bff",
  chatbotAvatar = null,
}: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const avatarVisible = !!showAvatar;

  return (
    <div
      className={clsx(
        "flex gap-3 mb-6 group animate-slideIn",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {/* Avatar for assistant messages */}
      {isAssistant && avatarVisible && (
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden"
            style={{ backgroundColor: primaryColor }}
          >
            {chatbotAvatar ? (
              <img src={chatbotAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              "AI"
            )}
          </div>
          {/* Online pulse indicator */}
          {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div> */}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={clsx(
          "relative max-w-[75%] rounded-2xl px-4 py-3 shadow-md overflow-hidden group transition-all duration-300",
          isAssistant
            ? "bg-white text-gray-800 rounded-tl-none"
            : "text-white rounded-tr-none",
        )}
        style={!isAssistant ? { backgroundColor: primaryColor } : {}}
      >
        {/* Message content with markdown formatting */}
        <div
          className={clsx(
            "prose prose-sm max-w-none",
            isAssistant ? "prose-gray" : "prose-invert",
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Code blocks with syntax highlighting
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const inline = !className;
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg my-2"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={clsx(
                      "px-1.5 py-0.5 rounded text-sm font-mono",
                      isAssistant
                        ? "bg-gray-100 text-red-600"
                        : "bg-white/20 text-white",
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Style paragraphs
              p({ children }) {
                return (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                );
              },
              // Style lists
              ul({ children }) {
                return (
                  <ul className="my-2 space-y-1 list-disc list-inside">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="my-2 space-y-1 list-decimal list-inside">
                    {children}
                  </ol>
                );
              },
              // Style links
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      "underline hover:no-underline",
                      isAssistant
                        ? "text-blue-600"
                        : "text-white font-semibold",
                    )}
                  >
                    {children}
                  </a>
                );
              },
              // Style headings
              h1({ children }) {
                return (
                  <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>
                );
              },
              // Style blockquotes
              blockquote({ children }) {
                return (
                  <blockquote
                    className={clsx(
                      "border-l-4 pl-4 py-1 my-2 italic",
                      isAssistant
                        ? "border-gray-300 bg-gray-50"
                        : "border-white/30 bg-white/10",
                    )}
                  >
                    {children}
                  </blockquote>
                );
              },
              // Style tables
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-3 py-2 bg-gray-100 text-left text-sm font-semibold">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 border-t border-gray-200 text-sm">
                    {children}
                  </td>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Timestamp */}
        <div
          className={clsx(
            "text-xs mt-2 opacity-70",
            isAssistant ? "text-gray-500" : "text-white",
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Message tail */}
        {isAssistant ? (
          <div
            className="absolute -left-2 top-0 w-4 h-4 bg-white transform rotate-45"
            style={{ borderRadius: "0 0 0 4px" }}
          />
        ) : (
          <div
            className="absolute -right-2 top-0 w-4 h-4 transform rotate-45"
            style={{
              backgroundColor: primaryColor,
              borderRadius: "0 0 4px 0",
            }}
          />
        )}

        {/* Shimmer effect for hover */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>

      {/* Spacer for visitor messages to push them right */}
      {!isAssistant && avatarVisible && <div className="w-10 shrink-0" />}
    </div>
  );
}
