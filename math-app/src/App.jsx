import { useCallback, useContext, useEffect, useState } from "react";
import TodayView from "./components/TodayView.jsx";
import RecordView from "./components/RecordView.jsx";
import TalkView from "./components/TalkView.jsx";
import { LangContext, useT } from "./lib/i18n.js";
import { api, PasscodeError, setPasscode } from "./lib/api.js";

const LANG_KEY = "mp_lang";

function readLang() {
  try {
    return localStorage.getItem(LANG_KEY) || "ko";
  } catch {
    return "ko";
  }
}

function Passcode({ onDone }) {
  const { t } = useT();
  const [value, setValue] = useState("");
  return (
    <div className="mx-auto max-w-xs pt-32">
      <p className="mb-3 font-semibold">{t("passTitle")}</p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (setPasscode(value), onDone())}
        className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-[16px] outline-none focus:border-neutral-900"
        autoFocus
      />
      <button
        onClick={() => {
          setPasscode(value);
          onDone();
        }}
        className="mt-3 w-full rounded-xl bg-neutral-900 py-3 font-medium text-white"
      >
        {t("passEnter")}
      </button>
    </div>
  );
}

function NoPlan({ firstDay, onMade, compact = false }) {
  const { t } = useT();
  const [making, setMaking] = useState(false);
  const [error, setError] = useState("");

  async function make() {
    setMaking(true);
    setError("");
    try {
      await api.makePlan();
      await onMade();
    } catch (err) {
      // 409: another request is already generating; wait for it
      setError(err.message === "already generating" ? t("making") : t("loadFailed"));
    } finally {
      setMaking(false);
    }
  }

  if (compact) {
    return (
      <div className="mb-6 rounded-xl bg-neutral-100 px-4 py-3 text-sm">
        <p className="font-semibold">{t("noPlanTitle")}</p>
        {making ? (
          <p className="mt-1 text-neutral-500">{t("making")}</p>
        ) : (
          <button onClick={make} className="mt-2 rounded-full bg-neutral-900 px-4 py-1.5 font-medium text-white">
            {t("makeNow")}
          </button>
        )}
        {error && <p className="mt-1 text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="pt-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("noPlanTitle")}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">{firstDay ? t("firstDayBody") : t("noPlanBody")}</p>
      {making ? (
        <p className="mt-8 text-[15px] text-neutral-500">{t("making")}</p>
      ) : (
        <button onClick={make} className="mt-8 w-full rounded-xl bg-neutral-900 py-3.5 font-medium text-white">
          {t("makeNow")}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Shell() {
  const { t } = useT();
  const { lang, setLang } = useContext(LangContext);
  const [tab, setTab] = useState("today");
  // The talk tab stays mounted once opened so its thread and draft survive tab switches.
  const [talkOpened, setTalkOpened] = useState(false);
  const [data, setData] = useState(null);
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | passcode

  const load = useCallback(async (date) => {
    try {
      const d = await api.today(date);
      setData(d);
      setSession(d.session || null);
      setStatus("ready");
    } catch (err) {
      setStatus(err instanceof PasscodeError ? "passcode" : "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const viewingPast = data?.date && data.dates?.length && data.date !== data.dates.filter((d) => d <= data.today).at(-1);

  return (
    <div className="mx-auto max-w-xl px-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[15px]">
          {["today", "talk", "record"].map((key) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                if (key === "talk") setTalkOpened(true);
              }} className={tab === key ? "font-bold" : "text-neutral-400"}>
              {key === "today" && data?.dayNum ? `${t("day")} ${data.dayNum}` : t(key)}
            </button>
          ))}
        </div>
        <button onClick={() => setLang(lang === "ko" ? "en" : "ko")} className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium">
          {lang === "ko" ? "EN" : "한국어"}
        </button>
      </header>

      {status === "loading" && <p className="pt-16 text-neutral-400">{t("loading")}</p>}
      {status === "passcode" && <Passcode onDone={() => (setStatus("loading"), load())} />}
      {status === "error" && (
        <div className="pt-16">
          <p className="text-neutral-600">{t("loadFailed")}</p>
          <button onClick={() => (setStatus("loading"), load())} className="mt-4 rounded-full border border-neutral-300 px-4 py-2 text-sm">
            {t("retry")}
          </button>
        </div>
      )}

      {status === "ready" && tab === "today" && (
        <>
          {viewingPast && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-neutral-100 px-4 py-2.5 text-sm">
              <span>
                {t("viewingPast")} · {data.date}
              </span>
              <button onClick={() => load()} className="font-semibold">
                {t("backToToday")}
              </button>
            </div>
          )}
          {data.plan && !viewingPast && data.date < data.today && <NoPlan compact onMade={() => load()} />}
          {data.plan ? (
            <TodayView key={data.date} date={data.date} plan={data.plan} session={session} onSession={setSession} />
          ) : (
            <NoPlan firstDay={!data.dates?.length} onMade={() => load()} />
          )}
        </>
      )}

      {status === "ready" && talkOpened && (
        <div hidden={tab !== "talk"}>
          <TalkView active={tab === "talk"} />
        </div>
      )}

      {status === "ready" && tab === "record" && (
        <RecordView
          state={data.state}
          journals={data.journals}
          dates={data.dates || []}
          currentDate={data.date}
          onOpenDay={(d) => {
            setTab("today");
            setStatus("loading");
            load(d);
          }}
        />
      )}
    </div>
  );
}

// Lang lives in context so every component can render { ko, en } content.
export default function App() {
  const [lang, setLangState] = useState(readLang);
  const setLang = (value) => {
    setLangState(value);
    document.documentElement.lang = value;
    try {
      localStorage.setItem(LANG_KEY, value);
    } catch {
      // not remembered, still switches
    }
  };
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Shell />
    </LangContext.Provider>
  );
}
