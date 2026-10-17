import { createContext, useContext } from "react";

const STRINGS = {
  today: { ko: "오늘", en: "Today" },
  record: { ko: "기록", en: "Record" },
  day: { ko: "Day", en: "Day" },
  loading: { ko: "불러오는 중…", en: "Loading…" },
  retry: { ko: "다시 시도", en: "Retry" },
  loadFailed: { ko: "불러오지 못했어요.", en: "Couldn't load." },

  noPlanTitle: { ko: "오늘 문제가 아직 없어요", en: "No problem for today yet" },
  noPlanBody: {
    ko: "AI 교수가 매일 새벽 5시에 문제를 준비해요. 지금 바로 받으려면 아래 버튼을 누르세요.",
    en: "Your professor prepares a problem every day at 5am. Tap below to get one now.",
  },
  firstDayBody: {
    ko: "첫날은 진단부터 시작해요. 지금 어디쯤인지 AI 교수가 파악할 거예요.",
    en: "Day one starts with a diagnostic so your professor can find where you are.",
  },
  makeNow: { ko: "지금 문제 받기", en: "Get today's problem" },
  making: { ko: "AI 교수가 문제를 준비하고 있어요… (1~3분)", en: "Your professor is preparing today… (1–3 min)" },

  problem: { ko: "문제", en: "Problem" },
  role_main: { ko: "본 문제", en: "Main" },
  role_easier: { ko: "쉬운 버전", en: "Easier" },
  role_harder: { ko: "도전", en: "Harder" },
  role_angle: { ko: "다른 각도", en: "New angle" },
  role_retest: { ko: "재확인", en: "Retest" },

  answerPlaceholder: { ko: "답 입력", en: "Your answer" },
  proofPlaceholder: { ko: "증명/풀이를 적어주세요", en: "Write your proof or reasoning" },
  check: { ko: "확인", en: "Check" },
  checking: { ko: "채점 중…", en: "Checking…" },
  correct: { ko: "정답", en: "Correct" },
  wrong: { ko: "다시 생각해 보세요", en: "Not quite" },
  yourAnswers: { ko: "내 답", en: "Your answers" },

  scratch: { ko: "연습장", en: "Scratchpad" },
  ask: { ko: "질문", en: "Ask" },
  lecture: { ko: "강의", en: "Lecture" },
  hint: { ko: "힌트", en: "Hint" },
  solution: { ko: "풀이", en: "Solution" },
  showSolution: { ko: "풀이 보기", en: "Show solution" },
  confirmSolution: { ko: "정말 볼까요? 한 번 더 누르세요", en: "Sure? Tap again" },
  next: { ko: "다음 문제", en: "Next problem" },
  allDone: { ko: "오늘 문제를 모두 마쳤어요. 내일 새벽에 AI 교수가 오늘 기록을 읽고 다음 문제를 준비해요.", en: "All done for today. Tomorrow morning your professor will read today's work and plan what's next." },

  chatTitle: { ko: "질문하기", en: "Ask your professor" },
  chatPlaceholder: { ko: "막힌 곳이나 생각을 적어보세요", en: "Where are you stuck?" },
  chatEmpty: { ko: "어디서 막혔는지, 어떻게 생각하고 있는지 편하게 말해 주세요.", en: "Tell me where you're stuck or what you're thinking." },
  send: { ko: "보내기", en: "Send" },
  attachScratch: { ko: "연습장 보여주기", en: "Show scratchpad" },
  scratchAttached: { ko: "연습장 첨부됨", en: "Scratchpad attached" },
  scratchMsg: { ko: "제 연습장 봐주세요.", en: "Please look at my scratchpad." },
  close: { ko: "닫기", en: "Close" },
  done: { ko: "완료", en: "Done" },
  pen: { ko: "펜", en: "Pen" },
  eraser: { ko: "지우개", en: "Eraser" },
  clear: { ko: "모두 지우기", en: "Clear" },
  undo: { ko: "되돌리기", en: "Undo" },
  scratchTip: { ko: "한 손가락으로 쓰기 · 두 손가락으로 스크롤", en: "One finger to write · two to scroll" },
  listening: { ko: "듣는 중… 탭해서 끝내기", en: "Listening… tap to stop" },

  lectureTitle: { ko: "칠판 강의", en: "Blackboard lecture" },
  play: { ko: "재생", en: "Play" },
  pause: { ko: "일시정지", en: "Pause" },
  prev: { ko: "이전", en: "Back" },
  nextScene: { ko: "다음", en: "Next" },
  voice: { ko: "음성", en: "Voice" },
  askLecture: { ko: "이런 설명이 필요해요…", en: "Explain to me…" },
  makeLecture: { ko: "새 강의 만들기", en: "Make a lecture" },
  makingLecture: { ko: "강의를 만들고 있어요… (30초~1분)", en: "Making your lecture… (30–60s)" },
  todaysLecture: { ko: "오늘의 강의", en: "Today's lecture" },
  myLecture: { ko: "요청한 강의", en: "Requested" },
  videos: { ko: "추천 영상", en: "Recommended videos" },
  sceneOf: { ko: "장면", en: "Scene" },

  stage: { ko: "현재 단계", en: "Current stage" },
  goal: { ko: "목표", en: "Goal" },
  mastery: { ko: "실력 지도", en: "Mastery" },
  profile: { ko: "AI 교수의 관찰", en: "Professor's view" },
  journal: { ko: "생활기록", en: "Teacher's record" },
  history: { ko: "지난 문제", en: "Past days" },
  noJournal: { ko: "아직 기록이 없어요. 첫 문제를 풀고 나면 다음 날 아침부터 기록이 쌓여요.", en: "No records yet. They start the morning after your first session." },
  strengths: { ko: "잘한 점", en: "Strengths" },
  struggles: { ko: "보완할 점", en: "To work on" },
  solved: { ko: "해결", en: "solved" },
  open: { ko: "열기", en: "Open" },
  viewingPast: { ko: "지난 날을 보고 있어요", en: "Viewing a past day" },
  backToToday: { ko: "오늘로", en: "Back to today" },

  passTitle: { ko: "비밀번호", en: "Passcode" },
  passEnter: { ko: "입장", en: "Enter" },

  move_diagnose: { ko: "진단", en: "Diagnostic" },
  move_advance: { ko: "다음 단계로", en: "Moving up" },
  move_hold: { ko: "다지기", en: "Consolidating" },
  move_easier: { ko: "기초 보강", en: "Stepping back" },
  move_new_angle: { ko: "다른 각도로", en: "New angle" },
  move_retest: { ko: "재확인", en: "Retest" },
  move_review: { ko: "복습", en: "Review" },
};

export const LangContext = createContext({ lang: "ko", setLang: () => {} });

export function useT() {
  const { lang } = useContext(LangContext);
  const t = (key) => STRINGS[key]?.[lang] ?? key;
  // Pick the right side of a bilingual { ko, en } value from the professor.
  const bi = (value) => (value ? (value[lang] ?? value.en ?? value.ko ?? "") : "");
  return { t, bi, lang };
}
