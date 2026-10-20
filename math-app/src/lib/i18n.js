import { createContext, useContext } from "react";

const STRINGS = {
  today: { ko: "오늘", en: "Today" },
  record: { ko: "기록", en: "Record" },
  talk: { ko: "교수님", en: "Professor" },
  archive: { ko: "문제집", en: "Problems" },
  filterAll: { ko: "전체", en: "All" },
  filterRedo: { ko: "다시 풀 것", en: "To redo" },
  allTopics: { ko: "모든 주제", en: "All topics" },
  st_solved: { ko: "해결", en: "Solved" },
  st_afterSolution: { ko: "풀이 보고 해결", en: "Solved after solution" },
  st_gaveUp: { ko: "풀이 봄", en: "Saw solution" },
  st_wrong: { ko: "미해결", en: "Not solved" },
  st_untouched: { ko: "안 풂", en: "Not tried" },
  archiveEmpty: { ko: "아직 문제가 없어요.", en: "No problems yet." },
  nothingToRedo: { ko: "다시 풀 문제가 없어요. 전부 스스로 풀었어요.", en: "Nothing to redo. You solved them all yourself." },
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
  checkScratch: { ko: "연습장 풀이로 채점", en: "Grade my scratchpad" },
  grade: { ko: "채점", en: "Grade" },
  hint: { ko: "힌트", en: "Hint" },
  solution: { ko: "풀이", en: "Solution" },
  showSolution: { ko: "풀이 보기", en: "Show solution" },
  confirmSolution: { ko: "정말 볼까요? 한 번 더 누르세요", en: "Sure? Tap again" },
  next: { ko: "다음 문제", en: "Next problem" },
  oneMore: { ko: "↻ 한 세트 더 풀기", en: "↻ Another set" },
  makingMore: { ko: "AI 교수가 새 문제를 준비하고 있어요… (1~3분)", en: "Your professor is preparing a new set… (1–3 min)" },
  allDone: { ko: "오늘 문제를 모두 마쳤어요. 내일 새벽에 AI 교수가 오늘 기록을 읽고 다음 문제를 준비해요.", en: "All done for today. Tomorrow morning your professor will read today's work and plan what's next." },

  send: { ko: "보내기", en: "Send" },
  close: { ko: "닫기", en: "Close" },
  attach: { ko: "첨부", en: "Attach" },
  photo: { ko: "사진", en: "Photo" },
  photoMsg: { ko: "제 풀이 봐주세요.", en: "Please check my work." },
  talkPlaceholder: { ko: "무엇이든 물어보세요", en: "Ask me anything" },
  talkEmpty: {
    ko: "언제든 편하게 물어보세요. 푼 흔적을 사진으로 올리면 어디서 막혔는지, 맞게 풀었는지 같이 봐요. 여기서 나눈 이야기도 다음 수업 준비에 반영돼요.",
    en: "Ask me anything, anytime. Send a photo of your work and we'll find where you got stuck or check that it's right. What we talk about here shapes your next lessons.",
  },
  loadEarlier: { ko: "지난 대화 보기", en: "Show earlier days" },
  talkNewDay: {
    ko: "새 하루예요. 지난 대화는 위에서 볼 수 있고, 교수님도 다 기억하고 있어요.",
    en: "A new day. Earlier days are above, and your professor remembers all of it.",
  },
  done: { ko: "완료", en: "Done" },
  pen: { ko: "펜", en: "Pen" },
  eraser: { ko: "지우개", en: "Eraser" },
  clear: { ko: "모두 지우기", en: "Clear" },
  undo: { ko: "되돌리기", en: "Undo" },
  scratchTip: { ko: "한 손가락으로 쓰기 · 두 손가락으로 스크롤", en: "One finger to write · two to scroll" },
  listening: { ko: "듣는 중… 탭해서 끝내기", en: "Listening… tap to stop" },


  stage: { ko: "현재 단계", en: "Current stage" },
  goal: { ko: "목표", en: "Goal" },
  mastery: { ko: "실력 지도", en: "Mastery" },
  profile: { ko: "AI 교수의 관찰", en: "Professor's view" },
  journal: { ko: "생활기록", en: "Teacher's record" },
  noJournal: { ko: "아직 기록이 없어요. 첫 문제를 풀고 나면 다음 날 아침부터 기록이 쌓여요.", en: "No records yet. They start the morning after your first session." },
  strengths: { ko: "잘한 점", en: "Strengths" },
  struggles: { ko: "보완할 점", en: "To work on" },
  solved: { ko: "해결", en: "solved" },
  viewingPast: { ko: "지난 날을 보고 있어요", en: "Viewing a past day" },
  backToToday: { ko: "오늘로", en: "Back to today" },

  passTitle: { ko: "비밀번호", en: "Passcode" },
  passEnter: { ko: "입장", en: "Enter" },

  library: { ko: "서재", en: "Library" },
  libraryNote: { ko: "오늘 공부할 과목을 고르세요.", en: "Pick a subject to study today." },
  notStarted: { ko: "시작 전", en: "Not started" },
  todayCount: { ko: "오늘", en: "Today" },
  allClear: { ko: "오늘 완료", en: "Done today" },
  talkEmptyCode: {
    ko: "언제든 편하게 물어보세요. 코드를 붙여넣으면 면접관처럼 리뷰하고, 막힌 곳은 답 대신 힌트로 같이 풀어가요. 여기서 나눈 이야기도 다음 수업 준비에 반영돼요.",
    en: "Ask me anything, anytime. Paste code and I'll review it like an interviewer; when you're stuck we'll work it out with hints, not answers. What we talk about here shapes your next lessons.",
  },

  run: { ko: "▶ 실행", en: "▶ Run" },
  running: { ko: "실행 중…", en: "Running…" },
  loadingPython: { ko: "Python 불러오는 중… (처음 한 번 10~30초)", en: "Loading Python… (10–30s the first time)" },
  submit: { ko: "제출", en: "Submit" },
  codePlaceholder: { ko: "여기에 직접 작성하세요", en: "Write it yourself here" },
  data: { ko: "데이터 보기", en: "Show data" },
  hideData: { ko: "데이터 접기", en: "Hide data" },
  rows: { ko: "행", en: "rows" },
  noRows: { ko: "결과 없음 (0행)", en: "No rows" },
  output: { ko: "실행 결과", en: "Output" },
  printed: { ko: "출력", en: "Printed" },
  submissions: { ko: "제출 기록", en: "Submissions" },
  timeLimit: { ko: "제한", en: "Limit" },
  overTime: { ko: "시간 초과", en: "Over time" },
  gate: { ko: "통과 기준", en: "Pass criterion" },
  passed: { ko: "통과", en: "Passed" },

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
