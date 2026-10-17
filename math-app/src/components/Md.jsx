import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Markdown + LaTeX ($...$, $$...$$) as written by the professor and tutor.
export default function Md({ children, className = "" }) {
  return (
    <div className={`md ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
