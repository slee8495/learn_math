# 커리어 로드맵 — SQL · Python · 통계 트랙 (Duth 병행용)

> 작성: 2026-10-19, `career_roadmap` 레포 세션에서.
> 목적: Duth 앱에 수학 공부와 나란히 돌아갈 **데이터 직무 면접 트랙**을 추가하기 위한 설계 문서.
> 이 문서를 읽는 Claude 세션은 아래 "Duth 반영 가이드"를 따라 앱을 확장하면 된다.

---

## 1. 왜 이 트랙인가

- **현재:** Hyundai Motor America, Manager PLM Data Analytics. 총보상은 약 $150k. MSBA 졸업.
- **목표:** 커리어 점프로 총보상을 단계적으로 올린다. 1–2년 안에 $220–300k, 3–5년 안에 $400k+.
- **노리는 경로:** 모두 코딩 테스트보다 SQL, 데이터 처리, 통계, 케이스를 보는 직무다.
  - **B. 시니어 데이터 사이언티스트 / 애널리틱스** (테크, 핀테크): 1차 점프 대상
  - **C. 투자회사 데이터/리서치** (OC/LA 자산운용사 → NYC 펀드의 대체데이터 분석): 장기 상한
  - **A. AI 솔루션/도입 직무**: 병행
- **핵심 갭:** 프로젝트는 AI와 함께 많이 만들었지만, **면접장에서 AI 없이 SQL과 Python을 직접 쓰는 능력**은 아직 증명되지 않았다. 이 트랙은 그 갭을 메우기 위한 것이다.

## 2. 학습 원칙 (교수 역할의 Claude가 반드시 지킬 것)

1. **AI는 선생님이지 대필자가 아니다.** 정답 코드를 먼저 보여주지 않는다. 힌트는 단계적으로 준다: 개념 → 접근 방향 → 부분 코드.
2. **학생이 직접 타이핑한다.** 자동완성 없이 쓰게 한다. 풀이를 리뷰할 때는 정답 여부뿐 아니라 가독성, 엣지 케이스, 더 나은 방법까지 짚는다.
3. **실전 형식으로 연습한다.** 4주차부터는 문제마다 제한시간을 둔다(Easy 10분, Medium 20분, Hard 30분).
4. **매일 조금씩 한다.** 하루 30–60분. 수학과 같은 날 병행한다(아래 §5).
5. **익숙한 도메인을 섞는다.** 자동차 부품/PLM, 트레이딩 체결 기록, 이커머스 주문 같은 데이터로 출제한다. 면접에서 "내 이야기"로 꺼낼 수 있게 하기 위함이다.
6. **말로 설명하게 한다.** 일주일에 몇 번은 "이 쿼리를 면접관에게 설명하듯 써봐"를 요구한다. 통계 주제에서는 특히 필수다.

## 3. 스테이지와 토픽 (topic id는 숙련도 추적용)

`tutor/roadmap.js`와 같은 구조로 옮길 수 있게 id, ko, en을 붙였다.

### c0 — SQL 기초 (1–2주차)
| id | ko | en |
|---|---|---|
| `sql-select` | SELECT, WHERE, ORDER BY, LIMIT | SELECT, WHERE, ORDER BY, LIMIT |
| `sql-aggregate` | 집계 함수와 GROUP BY, HAVING | Aggregates, GROUP BY, HAVING |
| `sql-joins` | INNER/LEFT/FULL JOIN, 셀프 조인 | Inner/left/full joins, self joins |
| `sql-subqueries` | 서브쿼리와 IN/EXISTS | Subqueries, IN/EXISTS |
| `sql-case-null` | CASE WHEN, NULL 처리, COALESCE | CASE WHEN, NULL handling, COALESCE |

**통과 기준:** 3–4개 테이블에 걸친 조인과 집계 문제를 15분 안에 혼자 푼다.

### c1 — SQL 심화 (3–4주차)
| id | ko | en |
|---|---|---|
| `sql-cte` | CTE와 단계별 쿼리 구성 | CTEs and stepwise queries |
| `sql-window-rank` | 윈도우 함수: ROW_NUMBER, RANK, DENSE_RANK | Window functions: ranking |
| `sql-window-agg` | 윈도우 함수: 누적합, 이동평균, LAG/LEAD | Window functions: running totals, moving averages, LAG/LEAD |
| `sql-dates` | 날짜/시간 처리, 기간별 집계 | Date/time handling, period aggregation |
| `sql-patterns` | 실전 패턴: 리텐션, 퍼널, 코호트, 연속 일수, Top-N per group | Patterns: retention, funnel, cohort, streaks, top-N per group |

**통과 기준:** 윈도우 함수가 필요한 Medium 문제를 20분 안에 푼다.

### c2 — SQL 면접 실전 (5–6주차)
| id | ko | en |
|---|---|---|
| `sql-timed` | 시간 제한 Medium/Hard 문제 | Timed medium/hard problems |
| `sql-optimize` | 쿼리 성능 기초: 인덱스, 실행 계획 읽기 | Query performance basics: indexes, reading plans |
| `sql-explain` | 쿼리를 말로 설명하기, 가정 확인 질문하기 | Explaining queries aloud, clarifying assumptions |

**통과 기준:** 처음 보는 Hard 문제의 70% 이상을 30분 안에 푼다.

### c3 — Python 데이터 처리 (7–9주차)
| id | ko | en |
|---|---|---|
| `py-basics` | Python 기본기: 리스트/딕셔너리/컴프리헨션, 함수 | Python fundamentals: lists, dicts, comprehensions, functions |
| `pd-io-clean` | pandas: 불러오기, 타입 정리, 결측치/중복 처리 | pandas: loading, dtypes, missing values, duplicates |
| `pd-groupby` | pandas: groupby, agg, transform, pivot | pandas: groupby, agg, transform, pivot |
| `pd-merge` | pandas: merge/join/concat, SQL과 대응시키기 | pandas: merge/join/concat, mapping to SQL |
| `pd-timeseries` | pandas: 시계열, resample, rolling | pandas: time series, resample, rolling |
| `py-algo-light` | 가벼운 알고리즘: 해시맵, 정렬, 투포인터 (Easy–Medium) | Light algorithms: hashmaps, sorting, two pointers (easy–medium) |

**통과 기준:** 지저분한 CSV를 받아 정리하고 집계한 뒤 결론을 내는 과제를 30분 안에 끝낸다.

### c4 — 통계 · 실험 · 케이스 (10–11주차)
| id | ko | en |
|---|---|---|
| `stat-foundations` | 분포, 기댓값/분산, 중심극한정리 직관 | Distributions, expectation/variance, CLT intuition |
| `stat-testing` | 가설검정, p-value, 신뢰구간, 검정력 | Hypothesis testing, p-values, CIs, power |
| `stat-ab` | A/B 테스트 설계: 표본 크기, 지표 선택, 함정 | A/B test design: sample size, metrics, pitfalls |
| `stat-regression` | 회귀분석 해석, 교란변수, 인과 vs 상관 | Regression interpretation, confounding, causation vs correlation |
| `case-product` | 제품/비즈니스 지표 케이스 ("지표가 10% 떨어졌다, 왜?") | Product/business metric cases |
| `case-invest` | 투자 데이터 케이스: 대체데이터 평가, 백테스트 함정 | Investment data cases: alt-data evaluation, backtest pitfalls |

**통과 기준:** A/B 테스트 설계 질문에 5분 동안 막힘없이 설명하고, 케이스 문제에서 구조적으로 답한다.

> 수학 로드맵 `s5`(확률론)과 겹치는 부분이 있다. `stat-*` 토픽은 그 숙련도를 참고해 난이도를 조절하면 된다.

### c5 — 모의 면접 (12주차~, 이후 상시)
| id | ko | en |
|---|---|---|
| `mock-sql` | SQL 라이브 코딩 모의 면접 | Mock SQL live coding |
| `mock-python` | pandas 과제 모의 면접 | Mock pandas take-home/live |
| `mock-stats` | 통계/케이스 모의 면접 | Mock stats/case interview |
| `mock-project` | 내 프로젝트 설명 (kalshi 리서치 프로세스, Roun 출시 등) | Explaining my projects |

## 4. 문제 형식 제안

Duth의 기존 문제 구조(`answer` / `accept` / `choice`, 독립 검증)에 맞춘 제안이다.

- **SQL 문제:** 작은 스키마와 샘플 데이터(CREATE TABLE + INSERT)를 함께 준다. 채점은 **학생 쿼리를 SQLite/DuckDB에서 실행한 결과와 정답 쿼리 결과를 비교**한다. 행 순서는 문제에서 ORDER BY를 요구할 때만 따진다.
  - 브라우저: `sql.js`(SQLite WASM) 또는 `duckdb-wasm`
  - 서버: `api/check.js`에서 실행
- **Python/pandas 문제:** 입력 데이터와 기대 출력(값 또는 DataFrame)을 준다. 채점은 **학생 코드를 실행해 출력을 비교**한다.
  - 브라우저: Pyodide
  - 서버: 샌드박스
- **통계/케이스 문제:** 서술형으로 낸다. 교수 Claude가 루브릭(핵심 포인트 체크리스트)으로 채점하고 피드백한다. 계산형이면 기존 `answer` 방식을 쓴다.
- **아침 루틴 검증:** 수학 문제를 sympy로 검증하듯, SQL과 pandas 문제도 정답 코드를 실제로 실행해 기대 출력을 만들고 확인한 뒤에 push한다.
- **연습장:** 코드 문제에는 손글씨 연습장 대신(또는 함께) 코드 입력창이 필요하다. 모노스페이스, 탭 들여쓰기 정도면 충분하다. 자동완성은 넣지 않는다.

## 5. 수학과 병행하는 하루 구성 (제안)

| 구성 | 시간 | 내용 |
|---|---|---|
| 커리어 트랙 | 30–40분 | SQL 또는 Python 문제 2–3개 + 리뷰 |
| 수학 트랙 | 15–20분 | 기존 Duth 흐름 유지 |
| 주 1회 | 30분 | "말로 설명하기" 또는 모의 면접 세션 |

- 앞으로 3개월은 **커리어 트랙을 우선**한다. 면접 일정이 잡히면 그 주는 커리어 트랙 100%로 돌린다.
- 교수 Claude가 두 트랙의 숙련도를 함께 보고 그날의 비중을 정해도 된다.

## 6. 학습 밖에서 병행할 것 (앱 범위 밖, 참고용)

- **1–2주차:** LinkedIn과 이력서를 다시 쓴다. About과 현대 직무 설명을 채우고, 임팩트를 숫자로 적는다.
- **4–6주차:** 지원을 시작한다(B 경로 우선). 실제 면접이 가장 좋은 연습이다.
- **상시:** 현대 안에서 AI/데이터 사이언스 직함으로 옮기거나 AI 프로젝트를 리드할 기회를 찾는다.
- job alert와 로드맵 진척 체크는 `career_roadmap` 레포에서 따로 만든다.

## 7. Duth 반영 가이드 (다음 세션용 체크리스트)

- [ ] `tutor/roadmap.js`에 커리어 트랙 스테이지 `c0`–`c5`를 추가한다. 별도 파일 `tutor/career-roadmap.js`로 분리해도 된다. 숙련도는 수학과 따로 추적한다.
- [ ] `tutor/schema.js`에 문제 유형 `sql`, `python`, `explain`(서술형 루브릭)을 추가한다.
- [ ] 채점: SQL은 `sql.js`/DuckDB 결과 비교, Python은 Pyodide 출력 비교, 서술형은 Claude 루브릭.
- [ ] 코드 입력창 UI를 추가한다. 자동완성 없음, 제한시간 타이머 표시.
- [ ] `tutor/professor.js`에 §2 학습 원칙을 넣는다. 특히 "정답 먼저 주지 않기"와 "단계적 힌트".
- [ ] `tutor/ROUTINE.md` 아침 루틴에서 하루 구성(§5)에 따라 두 트랙 문제를 함께 생성하고, SQL/pandas 정답을 실행해 검증하게 한다.
- [ ] 진척 화면에서 커리어 트랙 스테이지별 통과 기준(§3) 달성 여부를 보여준다.
