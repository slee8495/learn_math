import { useEffect, useState } from "react";

// A row of code keys that sits on top of the phone keyboard while the editor
// is focused: this problem's names (tables, columns, variables), common
// keywords, and the symbols that are buried on a phone keyboard. Keys only
// type what they say, nothing is suggested, so the code is still the
// student's own. "|" marks where the cursor lands.

const SYMBOLS = {
  sql: ["(", ")", ",", ".", "'", "=", "*", "_", "<", ">", "!=", ";"],
  python: ["(", ")", "[", "]", "'", ",", ".", ":", "=", "_", "==", "{", "}", "<", ">"],
};

const KEYWORDS = {
  sql: [
    "SELECT ", "FROM ", "WHERE ", "JOIN ", "LEFT JOIN ", "ON ", "AND ", "OR ", "GROUP BY ", "ORDER BY ", "HAVING ",
    "AS ", "DESC", "COUNT(|)", "SUM(|)", "AVG(|)", "MIN(|)", "MAX(|)", "ROUND(|, 2)", "DISTINCT ", "CASE WHEN ", "THEN ",
    "ELSE ", "END", "IS NULL", "IS NOT NULL", "COALESCE(|)", "IN (|)", "NOT ", "LIKE '|'", "BETWEEN ", "LIMIT ",
    "WITH ", "OVER (|)", "PARTITION BY ", "ROW_NUMBER()", "RANK()", "DENSE_RANK()", "LAG(|)", "LEAD(|)",
    "UNION ALL ", "EXISTS (|)", "strftime('%Y-%m', |)", "date(|)",
  ],
  python: [
    "result = ", "def ", "return ", "for ", " in ", "if ", "elif ", "else:", "and ", "or ", "not ", "None", "True", "False",
    "lambda x: ", "len(|)", "sorted(|)", "range(|)", ".items()", ".append(|)", "print(|)",
    "pd.", ".groupby(|)", ".agg(|)", ".sum()", ".mean()", ".count()", ".size()", ".reset_index()", ".sort_values(|)",
    "ascending=False", "as_index=False", ".merge(|)", "on=", "how='left'", ".drop_duplicates()", ".dropna(|)",
    ".fillna(|)", ".astype(|)", ".str.", ".replace(|)", ".loc[|]", ".rename(columns={|})", ".apply(|)", ".round(2)",
    ".head()", ".value_counts()", "pd.to_datetime(|)", ".dt.", ".resample(|)", ".rolling(|)", ".shift(|)", ".isna()",
  ],
};

// The keyboard's top edge, from the visual viewport (iOS shrinks it, not the layout).
function useKeyboardTop(active) {
  const [top, setTop] = useState(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () => setTop(vv.offsetTop + vv.height);
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);
  return top;
}

function Key({ label, strong, onPress }) {
  return (
    <button
      // keep the editor focused (and the keyboard up) when a key is tapped
      onMouseDown={(e) => e.preventDefault()}
      onClick={onPress}
      className={`shrink-0 rounded-md px-2.5 py-1.5 font-mono text-[13px] active:bg-neutral-300 ${
        strong ? "bg-neutral-900 text-white" : "bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function CodeKeys({ active, language, names, onType, onMove }) {
  const top = useKeyboardTop(active);
  if (!active || top === null) return null;
  return (
    <div
      className="fixed inset-x-0 z-50 space-y-1.5 border-t border-neutral-300 bg-neutral-100 px-2 py-1.5"
      style={{ top, transform: "translateY(-100%)" }}
    >
      <div className="flex gap-1.5 overflow-x-auto">
        <Key label="◀" onPress={() => onMove(-1)} />
        <Key label="▶" onPress={() => onMove(1)} />
        <Key label="⇥" onPress={() => onType("    ")} />
        {SYMBOLS[language].map((s) => (
          <Key key={s} label={s} onPress={() => onType(s)} />
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto">
        {names.map((n) => (
          <Key key={`n-${n}`} label={n} strong onPress={() => onType(n)} />
        ))}
        {KEYWORDS[language].map((k) => (
          <Key key={k} label={k.replace("|", "").trim()} onPress={() => onType(k)} />
        ))}
      </div>
    </div>
  );
}
