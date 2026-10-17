// The road to a Duke math degree. Topic ids are what mastery is tracked against.
export default {
  "goal": {
    "ko": "듀크대학교 수학과 졸업생 수준",
    "en": "Duke University math graduate level"
  },
  "stages": [
    {
      "id": "s0",
      "name": { "ko": "기초 다지기", "en": "Foundations" },
      "topics": [
        { "id": "alg-basics", "ko": "대수 기초 (식, 방정식, 부등식)", "en": "Algebra basics (expressions, equations, inequalities)" },
        { "id": "functions", "ko": "함수와 그래프", "en": "Functions and graphs" },
        { "id": "polynomials", "ko": "다항식과 인수분해", "en": "Polynomials and factoring" },
        { "id": "exp-log", "ko": "지수와 로그", "en": "Exponentials and logarithms" },
        { "id": "trig", "ko": "삼각함수", "en": "Trigonometry" },
        { "id": "sequences", "ko": "수열과 합", "en": "Sequences and sums" }
      ]
    },
    {
      "id": "s1",
      "name": { "ko": "미적분 I·II", "en": "Calculus I & II" },
      "topics": [
        { "id": "limits", "ko": "극한과 연속", "en": "Limits and continuity" },
        { "id": "derivatives", "ko": "미분과 그 활용", "en": "Derivatives and applications" },
        { "id": "integrals", "ko": "적분과 그 활용", "en": "Integrals and applications" },
        { "id": "integration-techniques", "ko": "적분 기법", "en": "Integration techniques" },
        { "id": "series", "ko": "수열·급수와 테일러 급수", "en": "Sequences, series, Taylor series" }
      ]
    },
    {
      "id": "s2",
      "name": { "ko": "다변수 미적분", "en": "Multivariable calculus" },
      "topics": [
        { "id": "vectors", "ko": "벡터와 공간기하", "en": "Vectors and space geometry" },
        { "id": "partials", "ko": "편미분과 그래디언트", "en": "Partial derivatives and gradients" },
        { "id": "multiple-integrals", "ko": "중적분", "en": "Multiple integrals" },
        { "id": "vector-calculus", "ko": "벡터 미적분 (그린·스토크스·발산 정리)", "en": "Vector calculus (Green, Stokes, divergence)" }
      ]
    },
    {
      "id": "s3",
      "name": { "ko": "선형대수", "en": "Linear algebra" },
      "topics": [
        { "id": "linear-systems", "ko": "연립방정식과 행렬", "en": "Linear systems and matrices" },
        { "id": "vector-spaces", "ko": "벡터공간, 기저, 차원", "en": "Vector spaces, basis, dimension" },
        { "id": "linear-maps", "ko": "선형변환", "en": "Linear transformations" },
        { "id": "eigen", "ko": "고윳값과 대각화", "en": "Eigenvalues and diagonalization" },
        { "id": "inner-product", "ko": "내적공간과 직교성", "en": "Inner product spaces and orthogonality" }
      ]
    },
    {
      "id": "s4",
      "name": { "ko": "증명 입문", "en": "Introduction to proof" },
      "topics": [
        { "id": "logic", "ko": "논리와 증명 기법", "en": "Logic and proof techniques" },
        { "id": "sets-functions", "ko": "집합, 함수, 관계", "en": "Sets, functions, relations" },
        { "id": "induction", "ko": "수학적 귀납법", "en": "Mathematical induction" },
        { "id": "number-theory", "ko": "정수론 기초", "en": "Elementary number theory" },
        { "id": "cardinality", "ko": "무한과 기수", "en": "Infinity and cardinality" }
      ]
    },
    {
      "id": "s5",
      "name": { "ko": "확률론과 미분방정식", "en": "Probability and differential equations" },
      "topics": [
        { "id": "probability", "ko": "확률론", "en": "Probability theory" },
        { "id": "random-variables", "ko": "확률변수와 분포", "en": "Random variables and distributions" },
        { "id": "limit-theorems", "ko": "큰수의 법칙과 중심극한정리", "en": "Law of large numbers and CLT" },
        { "id": "odes", "ko": "상미분방정식", "en": "Ordinary differential equations" }
      ]
    },
    {
      "id": "s6",
      "name": { "ko": "실해석학과 추상대수", "en": "Real analysis and abstract algebra" },
      "topics": [
        { "id": "real-numbers", "ko": "실수의 완비성", "en": "Completeness of the reals" },
        { "id": "analysis-sequences", "ko": "수열과 급수의 엄밀한 이론", "en": "Rigorous sequences and series" },
        { "id": "analysis-continuity", "ko": "연속성과 균등연속", "en": "Continuity and uniform continuity" },
        { "id": "analysis-differentiation-integration", "ko": "엄밀한 미분과 리만 적분", "en": "Rigorous differentiation and Riemann integration" },
        { "id": "groups", "ko": "군론", "en": "Group theory" },
        { "id": "rings-fields", "ko": "환과 체", "en": "Rings and fields" }
      ]
    },
    {
      "id": "s7",
      "name": { "ko": "심화", "en": "Advanced" },
      "topics": [
        { "id": "complex-analysis", "ko": "복소해석", "en": "Complex analysis" },
        { "id": "topology", "ko": "위상수학", "en": "Topology" },
        { "id": "numerical-analysis", "ko": "수치해석", "en": "Numerical analysis" },
        { "id": "stochastic", "ko": "확률과정", "en": "Stochastic processes" }
      ]
    }
  ]
};
