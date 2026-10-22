import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const inlineParts = { p: ({ children }) => <>{children}</> };

// Markdown + LaTeX ($...$, $$...$$) as written by the professor and tutor.
// `inline` renders inside a sentence (no paragraph wrapper).
export default function Md({ children, className = "", inline = false }) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag className={`md ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={inline ? inlineParts : undefined}
      >
        {children || ""}
      </ReactMarkdown>
    </Tag>
  );
}
