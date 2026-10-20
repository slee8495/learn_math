// The data-interview track from CAREER_ROADMAP.md, split into the three
// subjects the app teaches next to math. Stage ids follow that document
// (c0..c5); topic ids are what mastery is tracked against. `gate` is the
// stage's pass criterion: the professor marks it passed (state.passed) once
// the student meets it under its conditions.

const mockStage = (topics) => ({
  id: "c5",
  name: { ko: "모의 면접", en: "Mock interviews" },
  gate: {
    ko: "실제 면접처럼 시간 안에 풀고, 설명하고, 질문에 답한다.",
    en: "Solves, explains and answers follow-ups in time, as in a real interview.",
  },
  topics,
});

export const sql = {
  goal: {
    ko: "AI 없이 데이터 직무 SQL 면접 통과",
    en: "Pass data-role SQL interviews without AI",
  },
  stages: [
    {
      id: "c0",
      name: { ko: "SQL 기초", en: "SQL foundations" },
      gate: {
        ko: "3–4개 테이블에 걸친 조인과 집계 문제를 15분 안에 혼자 푼다.",
        en: "Solves a join + aggregation problem across 3–4 tables alone in 15 minutes.",
      },
      topics: [
        { id: "sql-select", ko: "SELECT, WHERE, ORDER BY, LIMIT", en: "SELECT, WHERE, ORDER BY, LIMIT" },
        { id: "sql-aggregate", ko: "집계 함수와 GROUP BY, HAVING", en: "Aggregates, GROUP BY, HAVING" },
        { id: "sql-joins", ko: "INNER/LEFT/FULL JOIN, 셀프 조인", en: "Inner/left/full joins, self joins" },
        { id: "sql-subqueries", ko: "서브쿼리와 IN/EXISTS", en: "Subqueries, IN/EXISTS" },
        { id: "sql-case-null", ko: "CASE WHEN, NULL 처리, COALESCE", en: "CASE WHEN, NULL handling, COALESCE" },
      ],
    },
    {
      id: "c1",
      name: { ko: "SQL 심화", en: "Advanced SQL" },
      gate: {
        ko: "윈도우 함수가 필요한 Medium 문제를 20분 안에 푼다.",
        en: "Solves a medium problem that needs window functions in 20 minutes.",
      },
      topics: [
        { id: "sql-cte", ko: "CTE와 단계별 쿼리 구성", en: "CTEs and stepwise queries" },
        { id: "sql-window-rank", ko: "윈도우 함수: ROW_NUMBER, RANK, DENSE_RANK", en: "Window functions: ranking" },
        { id: "sql-window-agg", ko: "윈도우 함수: 누적합, 이동평균, LAG/LEAD", en: "Window functions: running totals, moving averages, LAG/LEAD" },
        { id: "sql-dates", ko: "날짜/시간 처리, 기간별 집계", en: "Date/time handling, period aggregation" },
        { id: "sql-patterns", ko: "실전 패턴: 리텐션, 퍼널, 코호트, 연속 일수, Top-N per group", en: "Patterns: retention, funnel, cohort, streaks, top-N per group" },
      ],
    },
    {
      id: "c2",
      name: { ko: "SQL 면접 실전", en: "SQL interview practice" },
      gate: {
        ko: "처음 보는 Hard 문제의 70% 이상을 30분 안에 푼다.",
        en: "Solves 70%+ of unseen hard problems within 30 minutes.",
      },
      topics: [
        { id: "sql-timed", ko: "시간 제한 Medium/Hard 문제", en: "Timed medium/hard problems" },
        { id: "sql-optimize", ko: "쿼리 성능 기초: 인덱스, 실행 계획 읽기", en: "Query performance basics: indexes, reading plans" },
        { id: "sql-explain", ko: "쿼리를 말로 설명하기, 가정 확인 질문하기", en: "Explaining queries aloud, clarifying assumptions" },
      ],
    },
    mockStage([{ id: "mock-sql", ko: "SQL 라이브 코딩 모의 면접", en: "Mock SQL live coding" }]),
  ],
};

export const python = {
  goal: {
    ko: "AI 없이 pandas 데이터 과제와 라이브 코딩 통과",
    en: "Pass pandas take-homes and live coding without AI",
  },
  stages: [
    {
      id: "c3",
      name: { ko: "Python 데이터 처리", en: "Python data wrangling" },
      gate: {
        ko: "지저분한 CSV를 받아 정리하고 집계한 뒤 결론을 내는 과제를 30분 안에 끝낸다.",
        en: "Cleans a messy CSV, aggregates it and draws a conclusion in 30 minutes.",
      },
      topics: [
        { id: "py-basics", ko: "Python 기본기: 리스트/딕셔너리/컴프리헨션", en: "Python fundamentals: lists, dicts, comprehensions" },
        { id: "py-functions", ko: "함수 잘 쓰기: def, 인자/기본값, return, 작은 함수로 나누기", en: "Writing functions well: def, parameters/defaults, return, splitting into small functions" },
        { id: "pd-io-clean", ko: "pandas: 불러오기, 타입 정리, 결측치/중복 처리", en: "pandas: loading, dtypes, missing values, duplicates" },
        { id: "pd-groupby", ko: "pandas: groupby, agg, transform, pivot", en: "pandas: groupby, agg, transform, pivot" },
        { id: "pd-merge", ko: "pandas: merge/join/concat, SQL과 대응시키기", en: "pandas: merge/join/concat, mapping to SQL" },
        { id: "pd-timeseries", ko: "pandas: 시계열, resample, rolling", en: "pandas: time series, resample, rolling" },
        { id: "py-algo-light", ko: "가벼운 알고리즘: 해시맵, 정렬, 투포인터", en: "Light algorithms: hashmaps, sorting, two pointers" },
      ],
    },
    mockStage([{ id: "mock-python", ko: "pandas 과제 모의 면접", en: "Mock pandas take-home/live" }]),
  ],
};

export const stats = {
  goal: {
    ko: "통계·실험·케이스 면접에서 구조적으로 답하기",
    en: "Answer stats, experiment and case interviews with structure",
  },
  stages: [
    {
      id: "c4",
      name: { ko: "통계 · 실험 · 케이스", en: "Stats, experiments, cases" },
      gate: {
        ko: "A/B 테스트 설계 질문에 5분 동안 막힘없이 설명하고, 케이스 문제에서 구조적으로 답한다.",
        en: "Explains an A/B test design for 5 minutes without stalling and answers cases with structure.",
      },
      topics: [
        { id: "stat-foundations", ko: "분포, 기댓값/분산, 중심극한정리 직관", en: "Distributions, expectation/variance, CLT intuition" },
        { id: "stat-testing", ko: "가설검정, p-value, 신뢰구간, 검정력", en: "Hypothesis testing, p-values, CIs, power" },
        { id: "stat-ab", ko: "A/B 테스트 설계: 표본 크기, 지표 선택, 함정", en: "A/B test design: sample size, metrics, pitfalls" },
        { id: "stat-regression", ko: "회귀분석 해석, 교란변수, 인과 vs 상관", en: "Regression interpretation, confounding, causation vs correlation" },
        { id: "case-product", ko: "제품/비즈니스 지표 케이스", en: "Product/business metric cases" },
        { id: "case-invest", ko: "투자 데이터 케이스: 대체데이터 평가, 백테스트 함정", en: "Investment data cases: alt-data evaluation, backtest pitfalls" },
      ],
    },
    mockStage([
      { id: "mock-stats", ko: "통계/케이스 모의 면접", en: "Mock stats/case interview" },
      { id: "mock-project", ko: "내 프로젝트 설명하기", en: "Explaining my projects" },
    ]),
  ],
};
