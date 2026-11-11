import { useEffect, useState } from "react";

// iPad landscape and up (1024px+): room to keep the scratchpad open beside the problem.
const QUERY = "(min-width: 1024px)";

export function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia?.(QUERY).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}
