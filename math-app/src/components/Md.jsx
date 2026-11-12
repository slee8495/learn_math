import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const inlineParts = { p: ({ children }) => <>{children}</> };

// Markdown (with tables) + LaTeX ($...$, $$...$$) as written by the professor and tutor.
// `inline` renders inside a sentence (no paragraph wrapper).
export default function Md({ children, className = "", inline = false }) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag className={`md ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={inline ? inlineParts : undefined}
      >
        {children || ""}
      </ReactMarkdown>
    </Tag>
  );
}
