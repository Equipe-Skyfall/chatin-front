"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeMathDelimiters } from "@/lib/latex";

interface ApostilaMarkdownProps {
  content: string;
}

/** Markdown com tipografia de leitura longa (corpo serifado, títulos em destaque). */
export function ApostilaMarkdown({ content }: ApostilaMarkdownProps) {
  return (
    <div className="break-words font-serif text-[17px] leading-[1.8] text-charcoal [&_.katex]:text-[1.05em] [&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: "ignore" }]]}
        components={{
          p: ({ children }) => <p className="my-5 text-pretty first:mt-0 last:mb-0">{children}</p>,
          h1: ({ children }) => (
            <h1 className="mb-4 mt-12 font-display text-[26px] font-bold leading-tight first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-12 border-b border-line pb-2 font-display text-[22px] font-semibold leading-snug first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-9 font-display text-[18px] font-semibold leading-snug first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-7 font-display text-[16px] font-semibold first:mt-0">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="mb-2 mt-6 font-display text-[14px] font-semibold uppercase tracking-wide text-gray first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="mb-2 mt-6 font-display text-[14px] font-semibold uppercase tracking-wide text-gray first:mt-0">
              {children}
            </h6>
          ),
          ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 marker:text-orange">{children}</ul>,
          ol: ({ children }) => (
            <ol className="my-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-orange">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1 [&>p]:my-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-orange underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-[8px] border-l-4 border-orange/60 bg-orange/5 px-5 py-3 italic [&>p]:my-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-line" />,
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-[8px] border border-line bg-surface p-4 font-mono text-[14px] leading-[1.6] [&_code]:bg-transparent [&_code]:p-0">
              {children}
            </pre>
          ),
          code: ({ children, className }) => (
            <code className={`rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] ${className ?? ""}`}>
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse font-sans text-[14px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-line bg-surface px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border border-line px-3 py-2 align-top">{children}</td>,
        }}
      >
        {normalizeMathDelimiters(content)}
      </ReactMarkdown>
    </div>
  );
}
