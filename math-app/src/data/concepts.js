// ── Concept sequence ──────────────────────────────────────────
// Ordered from pre-algebra through the start of Precalculus.
// Each concept is taught once (see curriculum.js for day-mapping),
// then reinforced via problems + worked solutions on the following days.
//
// Planned future units (not yet authored — natural next expansion):
//   Precalculus, continued (trig identities, inverse trig, vectors, matrices, conics, limits)
//   Calculus I (derivatives, applications, intro integrals)
//   Calculus II / intro college math (integration techniques, series, linear algebra, probability)

export const concepts = [
  // ── Unit 1: Negative Numbers & Exponents ─────────────────────
  {
    id: 1, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Negative Numbers & the Number Line",
    explain: [
      "Negative numbers sit to the left of zero on the number line.",
      "The further left a number is, the smaller its value.",
      "Absolute value is a number's distance from zero, always positive: |−5| = 5.",
    ],
    example: { problem: "Order −3, 5, −8, 0 from least to greatest.", steps: ["Picture the number line: further left = smaller.", "−8 is furthest left, then −3, then 0, then 5."], answer: "−8, −3, 0, 5" },
  },
  {
    id: 2, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Adding & Subtracting Negative Numbers",
    explain: [
      "Adding a negative is the same as subtracting: 5 + (−3) = 5 − 3.",
      "Subtracting a negative is the same as adding: 5 − (−3) = 5 + 3.",
      "Same signs → add and keep the sign. Different signs → subtract and keep the sign of the larger absolute value.",
    ],
    example: { problem: "−7 + 4", steps: ["Different signs, so subtract: 7 − 4 = 3.", "Keep the sign of the larger absolute value (−7), so the answer is negative."], answer: "−3" },
  },
  {
    id: 3, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Multiplying & Dividing Negative Numbers",
    explain: [
      "Same signs (both positive or both negative) → the result is positive.",
      "Different signs → the result is negative.",
      "This rule applies to both multiplication and division.",
    ],
    example: { problem: "(−6) × (−3)", steps: ["Same signs (both negative).", "6 × 3 = 18, result is positive."], answer: "18" },
  },
  {
    id: 4, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Exponents & Powers",
    explain: [
      "An exponent tells you how many times to multiply the base by itself: 2⁴ = 2×2×2×2.",
      "Any nonzero number to the power of 0 equals 1.",
      "A negative exponent means 'take the reciprocal': x⁻ⁿ = 1/xⁿ.",
    ],
    example: { problem: "Evaluate 2⁵.", steps: ["2×2 = 4.", "4×2 = 8.", "8×2 = 16.", "16×2 = 32."], answer: "32" },
  },
  {
    id: 5, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Square Roots",
    explain: [
      "The square root of x is the number that, multiplied by itself, gives x.",
      "√25 = 5 because 5×5 = 25.",
      "Perfect squares (1, 4, 9, 16, 25, 36...) have whole-number square roots.",
    ],
    example: { problem: "Find √81.", steps: ["Think: what number times itself is 81?", "9 × 9 = 81."], answer: "9" },
  },
  {
    id: 6, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Prime Factorization",
    explain: [
      "A prime number has exactly two factors: 1 and itself (2, 3, 5, 7, 11...).",
      "Prime factorization breaks a number down into a product of only prime numbers.",
      "A factor tree is a common way to find it.",
    ],
    example: { problem: "Find the prime factorization of 60.", steps: ["60 = 6 × 10.", "6 = 2 × 3, 10 = 2 × 5.", "60 = 2 × 3 × 2 × 5 = 2² × 3 × 5."], answer: "2² × 3 × 5" },
  },
  {
    id: 7, unit: "Negative Numbers & Exponents", level: "Middle School", title: "GCF & LCM",
    explain: [
      "GCF (greatest common factor) is the largest number that divides evenly into two or more numbers.",
      "LCM (least common multiple) is the smallest number that two or more numbers all divide into evenly.",
      "Prime factorization makes both easy to find for larger numbers.",
    ],
    example: { problem: "Find the LCM of 4 and 6.", steps: ["Multiples of 4: 4, 8, 12, 16...", "Multiples of 6: 6, 12, 18...", "Smallest shared multiple: 12."], answer: "12" },
  },

  // ── Unit 2: Expressions & Equations ──────────────────────────
  {
    id: 8, unit: "Expressions & Equations", level: "Middle School", title: "Variables & Expressions",
    explain: [
      "A variable is a letter that stands for an unknown number (commonly x or y).",
      "An expression combines numbers, variables, and operations, but has no equals sign (e.g. 3x + 2).",
      "'Evaluating' an expression means substituting a number for the variable and simplifying.",
    ],
    example: { problem: "Evaluate 3x + 2 when x = 4.", steps: ["Substitute: 3(4) + 2.", "3×4 = 12.", "12 + 2 = 14."], answer: "14" },
  },
  {
    id: 9, unit: "Expressions & Equations", level: "Middle School", title: "Combining Like Terms",
    explain: [
      "Like terms have the exact same variable part (3x and 5x are like terms; 3x and 3x² are not).",
      "Add or subtract the coefficients of like terms, keep the variable part unchanged.",
      "Simplifying an expression usually means combining all like terms.",
    ],
    example: { problem: "Simplify 4x + 3 − 2x + 7.", steps: ["Group like terms: (4x − 2x) + (3 + 7).", "4x − 2x = 2x.", "3 + 7 = 10."], answer: "2x + 10" },
  },
  {
    id: 10, unit: "Expressions & Equations", level: "Middle School", title: "The Distributive Property",
    explain: [
      "a(b + c) = ab + ac — multiply the outside term by everything inside the parentheses.",
      "This works for subtraction too: a(b − c) = ab − ac.",
      "Watch signs carefully when the outside term is negative.",
    ],
    example: { problem: "Expand 3(2x − 5).", steps: ["3 × 2x = 6x.", "3 × (−5) = −15."], answer: "6x − 15" },
  },
  {
    id: 11, unit: "Expressions & Equations", level: "Middle School", title: "Solving One-Step Equations",
    explain: [
      "An equation says two expressions are equal; solving means finding the value of the variable.",
      "Whatever you do to one side, you must do to the other, to keep it balanced.",
      "Undo the operation: if x + 5 = 9, subtract 5 from both sides.",
    ],
    example: { problem: "Solve x − 7 = 12.", steps: ["Add 7 to both sides: x − 7 + 7 = 12 + 7."], answer: "x = 19" },
  },
  {
    id: 12, unit: "Expressions & Equations", level: "Middle School", title: "Solving Two-Step Equations",
    explain: [
      "Undo addition/subtraction first, then undo multiplication/division (reverse order of operations).",
      "Keep both sides balanced at every step.",
    ],
    example: { problem: "Solve 3x + 4 = 19.", steps: ["Subtract 4 from both sides: 3x = 15.", "Divide both sides by 3: x = 5."], answer: "x = 5" },
  },
  {
    id: 13, unit: "Expressions & Equations", level: "Middle School", title: "Solving Multi-Step Equations",
    explain: [
      "First distribute and combine like terms on each side.",
      "Then get all variable terms on one side and constants on the other.",
      "Finally divide to isolate the variable.",
    ],
    example: { problem: "Solve 2(x + 3) = 4x − 2.", steps: ["Distribute: 2x + 6 = 4x − 2.", "Subtract 2x from both sides: 6 = 2x − 2.", "Add 2: 8 = 2x.", "Divide by 2: 4 = x."], answer: "x = 4" },
  },
  {
    id: 14, unit: "Expressions & Equations", level: "Middle School", title: "Solving & Graphing Inequalities",
    explain: [
      "Inequalities use <, >, ≤, ≥ instead of =, and are solved just like equations.",
      "Key rule: if you multiply or divide both sides by a negative number, flip the inequality sign.",
      "On a number line, use an open circle for < or > and a filled circle for ≤ or ≥.",
    ],
    example: { problem: "Solve −2x > 6.", steps: ["Divide both sides by −2 (flip the sign): x < −3."], answer: "x < −3" },
  },
  {
    id: 15, unit: "Expressions & Equations", level: "Middle School", title: "Proportions",
    explain: [
      "A proportion says two ratios are equal: a/b = c/d.",
      "Cross-multiply to solve: a×d = b×c.",
      "Proportions are used to scale recipes, maps, models, and more.",
    ],
    example: { problem: "Solve x/4 = 6/8.", steps: ["Cross-multiply: 8x = 4×6 = 24.", "Divide by 8: x = 3."], answer: "x = 3" },
  },
  {
    id: 16, unit: "Expressions & Equations", level: "Middle School", title: "Percent Change",
    explain: [
      "Percent change = (change in value ÷ original value) × 100.",
      "If the new value is bigger, it's a percent increase; if smaller, a percent decrease.",
    ],
    example: { problem: "A $40 item increases to $50. Find the percent increase.", steps: ["Change = 50 − 40 = 10.", "10 ÷ 40 = 0.25.", "0.25 × 100 = 25%."], answer: "25% increase" },
  },
  {
    id: 17, unit: "Expressions & Equations", level: "Middle School", title: "Simple Interest",
    explain: [
      "Simple interest formula: I = P × r × t (Principal × rate × time).",
      "Rate must be written as a decimal (5% = 0.05).",
      "Total amount owed/earned = Principal + Interest.",
    ],
    example: { problem: "Find the interest on $500 at 4% for 3 years.", steps: ["I = P × r × t = 500 × 0.04 × 3.", "500 × 0.04 = 20.", "20 × 3 = 60."], answer: "$60" },
  },

  // ── Unit 3: Coordinate Plane & Solids ────────────────────────
  {
    id: 18, unit: "Coordinate Plane & Solids", level: "Middle School", title: "The Coordinate Plane",
    explain: [
      "The coordinate plane has a horizontal x-axis and vertical y-axis meeting at the origin (0,0).",
      "A point is written (x, y): move x units horizontally, then y units vertically.",
      "The plane is divided into 4 quadrants, numbered counterclockwise starting from the top-right.",
    ],
    example: { problem: "Which quadrant is the point (−3, 5) in?", steps: ["x is negative (left), y is positive (up).", "Left and up is the top-left region: Quadrant II."], answer: "Quadrant II" },
  },
  {
    id: 19, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Graphing Points & Basic Relations",
    explain: [
      "To plot (x, y), start at the origin, move x units left/right, then y units up/down.",
      "A set of ordered pairs can be graphed to see patterns or relationships between two quantities.",
    ],
    example: { problem: "Plot and describe the pattern: (1,2), (2,4), (3,6).", steps: ["Each y-value is double the x-value.", "This is a straight-line pattern through the origin."], answer: "y = 2x" },
  },
  {
    id: 20, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Volume of Rectangular Prisms",
    explain: [
      "Volume of a rectangular prism = length × width × height.",
      "Volume is measured in cubic units (like cm³ or ft³).",
    ],
    example: { problem: "Find the volume of a box 4 × 3 × 5.", steps: ["4 × 3 = 12.", "12 × 5 = 60."], answer: "60 cubic units" },
  },
  {
    id: 21, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Surface Area",
    explain: [
      "Surface area is the total area of all the faces of a 3D shape added together.",
      "For a rectangular prism, there are 3 pairs of identical faces: top/bottom, front/back, left/right.",
    ],
    example: { problem: "Find the surface area of a cube with side 3.", steps: ["Each face area = 3×3 = 9.", "A cube has 6 identical faces: 6 × 9 = 54."], answer: "54 square units" },
  },
  {
    id: 22, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Pythagorean Theorem",
    explain: [
      "For a right triangle with legs a, b and hypotenuse c: a² + b² = c².",
      "The hypotenuse is always the longest side, opposite the right angle.",
      "Used to find a missing side when the other two are known.",
    ],
    example: { problem: "A right triangle has legs 3 and 4. Find the hypotenuse.", steps: ["a² + b² = c²: 3² + 4² = c².", "9 + 16 = 25 = c².", "√25 = 5."], answer: "5" },
  },

  // ── Unit 4: Linear Equations & Functions ─────────────────────
  {
    id: 23, unit: "Linear Equations & Functions", level: "Algebra I", title: "Slope",
    explain: [
      "Slope measures steepness: rise over run, or (change in y) ÷ (change in x).",
      "Formula from two points (x₁,y₁) and (x₂,y₂): m = (y₂ − y₁)/(x₂ − x₁).",
      "Positive slope rises left to right; negative slope falls left to right.",
    ],
    example: { problem: "Find the slope between (1,2) and (4,11).", steps: ["m = (11 − 2)/(4 − 1) = 9/3."], answer: "3" },
  },
  {
    id: 24, unit: "Linear Equations & Functions", level: "Algebra I", title: "Slope-Intercept Form",
    explain: [
      "y = mx + b, where m is the slope and b is the y-intercept (where the line crosses the y-axis).",
      "This is the most common way to write a linear equation.",
    ],
    example: { problem: "A line has slope 2 and y-intercept −3. Write its equation.", steps: ["Plug into y = mx + b: m=2, b=−3."], answer: "y = 2x − 3" },
  },
  {
    id: 25, unit: "Linear Equations & Functions", level: "Algebra I", title: "Graphing Linear Equations",
    explain: [
      "Plot the y-intercept first, then use the slope (rise/run) to find a second point.",
      "Draw a straight line through the two points, extending in both directions.",
    ],
    example: { problem: "Describe how to graph y = (1/2)x + 1.", steps: ["Start at (0,1) — the y-intercept.", "Slope 1/2 means: from that point, go up 1, right 2.", "Plot that point and draw the line through both."], answer: "Line through (0,1) and (2,2)" },
  },
  {
    id: 26, unit: "Linear Equations & Functions", level: "Algebra I", title: "Writing Equations of Lines",
    explain: [
      "Point-slope form: y − y₁ = m(x − x₁), useful when you know a point and the slope.",
      "To write an equation from two points: find the slope first, then use point-slope form.",
    ],
    example: { problem: "Write the equation of the line through (2,3) with slope 4.", steps: ["y − 3 = 4(x − 2).", "Distribute: y − 3 = 4x − 8.", "Add 3: y = 4x − 5."], answer: "y = 4x − 5" },
  },
  {
    id: 27, unit: "Linear Equations & Functions", level: "Algebra I", title: "Systems of Equations: Substitution",
    explain: [
      "A system of equations is two or more equations with the same variables, solved together.",
      "Substitution: solve one equation for a variable, then plug that expression into the other equation.",
    ],
    example: { problem: "Solve: y = x + 2 and 2x + y = 11.", steps: ["Substitute y: 2x + (x + 2) = 11.", "3x + 2 = 11 → 3x = 9 → x = 3.", "y = 3 + 2 = 5."], answer: "x = 3, y = 5" },
  },
  {
    id: 28, unit: "Linear Equations & Functions", level: "Algebra I", title: "Systems of Equations: Elimination",
    explain: [
      "Elimination: add or subtract the equations to cancel out one variable.",
      "You may need to multiply one or both equations first so the coefficients match.",
    ],
    example: { problem: "Solve: 2x + y = 10 and x − y = 2.", steps: ["Add the equations: (2x + x) + (y − y) = 10 + 2.", "3x = 12 → x = 4.", "Plug in: 4 − y = 2 → y = 2."], answer: "x = 4, y = 2" },
  },
  {
    id: 29, unit: "Linear Equations & Functions", level: "Algebra I", title: "Graphing Systems of Equations",
    explain: [
      "Graph both lines — the solution is the point where they cross.",
      "Parallel lines (same slope, different intercept) mean no solution.",
      "Identical lines mean infinitely many solutions.",
    ],
    example: { problem: "Lines y = x + 1 and y = x − 2 — how many solutions?", steps: ["Both have slope 1 (parallel).", "Different y-intercepts, so they never cross."], answer: "No solution" },
  },
  {
    id: 30, unit: "Linear Equations & Functions", level: "Algebra I", title: "Linear Inequalities in Two Variables",
    explain: [
      "Graph the boundary line as if it were an equation (dashed for < or >, solid for ≤ or ≥).",
      "Shade the side of the line that makes the inequality true — test the point (0,0) if it's not on the line.",
    ],
    example: { problem: "Which side do you shade for y > x + 1?", steps: ["Test (0,0): is 0 > 0 + 1? 0 > 1 is false.", "Since it's false, shade the side NOT containing (0,0)."], answer: "Shade above the line" },
  },
  {
    id: 31, unit: "Linear Equations & Functions", level: "Algebra I", title: "Introduction to Functions",
    explain: [
      "A function assigns exactly one output to each input.",
      "The vertical line test: if a vertical line crosses a graph more than once, it's not a function.",
      "Domain = all possible inputs; range = all possible outputs.",
    ],
    example: { problem: "Is {(1,2), (2,4), (1,5)} a function?", steps: ["Input 1 has two different outputs (2 and 5)."], answer: "No — not a function" },
  },
  {
    id: 32, unit: "Linear Equations & Functions", level: "Algebra I", title: "Function Notation",
    explain: [
      "f(x) is read 'f of x' and means 'the output of function f when the input is x'.",
      "To evaluate f(3), substitute 3 everywhere you see x in the function's rule.",
    ],
    example: { problem: "If f(x) = 2x + 5, find f(3).", steps: ["Substitute: f(3) = 2(3) + 5.", "= 6 + 5."], answer: "11" },
  },

  // ── Unit 5: Polynomials & Factoring ───────────────────────────
  {
    id: 33, unit: "Polynomials & Factoring", level: "Algebra I", title: "Adding & Subtracting Polynomials",
    explain: [
      "A polynomial is a sum of terms with whole-number exponents (e.g. 3x² + 2x − 1).",
      "Add or subtract polynomials by combining like terms.",
      "When subtracting, distribute the negative sign to every term in the second polynomial.",
    ],
    example: { problem: "(3x² + 2x) − (x² − 5)", steps: ["Distribute the negative: 3x² + 2x − x² + 5.", "Combine like terms: (3x² − x²) + 2x + 5."], answer: "2x² + 2x + 5" },
  },
  {
    id: 34, unit: "Polynomials & Factoring", level: "Algebra I", title: "Multiplying Polynomials (FOIL)",
    explain: [
      "FOIL stands for First, Outer, Inner, Last — the four products when multiplying two binomials.",
      "Multiply each term in the first polynomial by each term in the second, then combine like terms.",
    ],
    example: { problem: "(x + 3)(x + 5)", steps: ["First: x·x = x².", "Outer: x·5 = 5x.", "Inner: 3·x = 3x.", "Last: 3·5 = 15.", "Combine: x² + 5x + 3x + 15."], answer: "x² + 8x + 15" },
  },
  {
    id: 35, unit: "Polynomials & Factoring", level: "Algebra I", title: "Factoring: Greatest Common Factor",
    explain: [
      "Find the GCF of all terms, then divide it out of each term.",
      "Write as GCF times the remaining expression in parentheses.",
    ],
    example: { problem: "Factor 6x² + 9x.", steps: ["GCF of 6x² and 9x is 3x.", "6x² ÷ 3x = 2x, 9x ÷ 3x = 3."], answer: "3x(2x + 3)" },
  },
  {
    id: 36, unit: "Polynomials & Factoring", level: "Algebra I", title: "Factoring Trinomials",
    explain: [
      "For x² + bx + c, find two numbers that multiply to c and add to b.",
      "Write as (x + first number)(x + second number).",
    ],
    example: { problem: "Factor x² + 7x + 12.", steps: ["Need two numbers that multiply to 12 and add to 7.", "3 and 4 work: 3×4=12, 3+4=7."], answer: "(x + 3)(x + 4)" },
  },
  {
    id: 37, unit: "Polynomials & Factoring", level: "Algebra I", title: "Difference of Squares",
    explain: [
      "a² − b² always factors as (a + b)(a − b).",
      "Recognize it by two perfect-square terms separated by a minus sign.",
    ],
    example: { problem: "Factor x² − 16.", steps: ["x² is a square (x·x), 16 is a square (4·4).", "Apply the pattern: (x + 4)(x − 4)."], answer: "(x + 4)(x − 4)" },
  },
  {
    id: 38, unit: "Polynomials & Factoring", level: "Algebra I", title: "Solving Quadratics by Factoring",
    explain: [
      "Set the equation equal to 0, factor the left side, then use the zero product property.",
      "Zero product property: if A × B = 0, then A = 0 or B = 0.",
    ],
    example: { problem: "Solve x² + 7x + 12 = 0.", steps: ["Factor: (x + 3)(x + 4) = 0.", "Set each factor to 0: x + 3 = 0 or x + 4 = 0."], answer: "x = −3 or x = −4" },
  },

  // ── Unit 6: Quadratics, Exponents & Radicals ──────────────────
  {
    id: 39, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "The Quadratic Formula",
    explain: [
      "For ax² + bx + c = 0, x = (−b ± √(b² − 4ac)) / (2a).",
      "Works for every quadratic, even ones that don't factor nicely.",
      "b² − 4ac is called the discriminant — it tells you how many real solutions exist.",
    ],
    example: { problem: "Solve x² − 5x + 6 = 0 using the quadratic formula.", steps: ["a=1, b=−5, c=6.", "Discriminant: (−5)² − 4(1)(6) = 25 − 24 = 1.", "x = (5 ± √1)/2 = (5 ± 1)/2."], answer: "x = 3 or x = 2" },
  },
  {
    id: 40, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "Graphing Quadratics (Parabolas)",
    explain: [
      "The graph of y = ax² + bx + c is a U-shaped curve called a parabola.",
      "If a > 0, it opens upward; if a < 0, it opens downward.",
      "The vertex (turning point) x-coordinate is at x = −b/(2a).",
    ],
    example: { problem: "Find the vertex x-coordinate of y = x² − 4x + 1.", steps: ["a=1, b=−4.", "x = −(−4)/(2·1) = 4/2."], answer: "x = 2" },
  },
  {
    id: 41, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "Exponent Rules",
    explain: [
      "Multiplying same base: xᵃ · xᵇ = xᵃ⁺ᵇ.",
      "Dividing same base: xᵃ / xᵇ = xᵃ⁻ᵇ.",
      "Power to a power: (xᵃ)ᵇ = xᵃᵇ.",
    ],
    example: { problem: "Simplify x⁵ · x³.", steps: ["Same base, add exponents: 5 + 3 = 8."], answer: "x⁸" },
  },
  {
    id: 42, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "Simplifying Radical Expressions",
    explain: [
      "Break the number under the root into a perfect square times a remainder, then pull the perfect square out.",
      "√(a·b) = √a · √b — this is the key rule used to simplify.",
    ],
    example: { problem: "Simplify √50.", steps: ["50 = 25 × 2, and 25 is a perfect square.", "√50 = √25 · √2 = 5√2."], answer: "5√2" },
  },

  // ── Unit 7: Geometry ───────────────────────────────────────────
  {
    id: 43, unit: "Geometry", level: "Geometry", title: "Triangle Congruence & Similarity",
    explain: [
      "Congruent triangles are identical in shape and size — all corresponding sides and angles match.",
      "Similar triangles have the same shape but not necessarily the same size — corresponding angles are equal and sides are proportional.",
      "Common congruence tests: SSS, SAS, ASA. Common similarity test: AA (two matching angles).",
    ],
    example: { problem: "Two triangles are similar with a scale factor of 2. One side of the smaller triangle is 5. Find the corresponding side of the larger triangle.", steps: ["Similar triangles scale every side by the same factor.", "5 × 2 = 10."], answer: "10" },
  },
  {
    id: 44, unit: "Geometry", level: "Geometry", title: "Special Right Triangles",
    explain: [
      "45-45-90 triangle: legs are equal, and the hypotenuse = leg × √2.",
      "30-60-90 triangle: sides are in the ratio 1 : √3 : 2 (short leg : long leg : hypotenuse).",
      "These patterns let you find all sides instantly once you know the triangle type and one side.",
    ],
    example: { problem: "A 45-45-90 triangle has legs of length 6. Find the hypotenuse.", steps: ["Hypotenuse = leg × √2.", "6 × √2."], answer: "6√2" },
  },
  {
    id: 45, unit: "Geometry", level: "Geometry", title: "Trigonometric Ratios (SOH-CAH-TOA)",
    explain: [
      "In a right triangle, sine = opposite/hypotenuse, cosine = adjacent/hypotenuse, tangent = opposite/adjacent.",
      "SOH-CAH-TOA is a memory trick for these three ratios.",
      "Used to find a missing side or angle in any right triangle.",
    ],
    example: { problem: "A right triangle has an angle of 30°, opposite side 4, and hypotenuse h. Find h using sine.", steps: ["sin(30°) = opposite/hypotenuse = 4/h.", "sin(30°) = 0.5, so 0.5 = 4/h.", "h = 4/0.5."], answer: "8" },
  },
  {
    id: 46, unit: "Geometry", level: "Geometry", title: "Circles: Arcs, Angles & Sectors",
    explain: [
      "A central angle's measure equals the measure of the arc it cuts off.",
      "An inscribed angle is half the measure of the arc it cuts off.",
      "A sector's area = (central angle/360°) × πr².",
    ],
    example: { problem: "Find the area of a sector with radius 6 and central angle 90° (π ≈ 3.14).", steps: ["Sector area = (angle/360) × πr².", "(90/360) × 3.14 × 36 = 0.25 × 113.04."], answer: "28.26" },
  },
  {
    id: 47, unit: "Geometry", level: "Geometry", title: "Volume & Surface Area of Cylinders, Cones & Spheres",
    explain: [
      "Cylinder: volume = πr²h, surface area = 2πr² + 2πrh.",
      "Cone: volume = (1/3)πr²h.",
      "Sphere: volume = (4/3)πr³, surface area = 4πr².",
    ],
    example: { problem: "Find the volume of a cylinder with radius 3 and height 5 (π ≈ 3.14).", steps: ["Volume = πr²h = 3.14 × 3² × 5.", "3.14 × 9 = 28.26.", "28.26 × 5."], answer: "141.3" },
  },
  {
    id: 48, unit: "Geometry", level: "Geometry", title: "Coordinate Geometry: Distance & Midpoint",
    explain: [
      "Distance formula between (x₁,y₁) and (x₂,y₂): d = √[(x₂−x₁)² + (y₂−y₁)²] — it's the Pythagorean theorem in disguise.",
      "Midpoint formula: M = ((x₁+x₂)/2, (y₁+y₂)/2) — average the x's and average the y's.",
    ],
    example: { problem: "Find the distance between (1,2) and (4,6).", steps: ["d = √[(4−1)² + (6−2)²] = √[3² + 4²].", "= √[9+16] = √25."], answer: "5" },
  },

  // ── Unit 8: Algebra II ───────────────────────────────────────────
  {
    id: 49, unit: "Algebra II", level: "Algebra II", title: "Rational Exponents & Radical Equations",
    explain: [
      "A rational exponent x^(a/b) means the b-th root of x, raised to the a-th power: x^(1/2) = √x.",
      "To solve an equation with a radical, isolate the radical, then raise both sides to the matching power to remove it.",
      "Always check solutions in the original equation — squaring both sides can introduce false solutions.",
    ],
    example: { problem: "Evaluate 8^(2/3).", steps: ["8^(1/3) = 2 (cube root of 8).", "Then square it: 2² = 4."], answer: "4" },
  },
  {
    id: 50, unit: "Algebra II", level: "Algebra II", title: "Complex Numbers",
    explain: [
      "i is defined as √−1, so i² = −1.",
      "A complex number has the form a + bi, where a is the real part and b is the imaginary part.",
      "Add/subtract complex numbers by combining real parts and imaginary parts separately.",
    ],
    example: { problem: "Simplify (3 + 2i) + (1 − 5i).", steps: ["Combine real parts: 3 + 1 = 4.", "Combine imaginary parts: 2i − 5i = −3i."], answer: "4 − 3i" },
  },
  {
    id: 51, unit: "Algebra II", level: "Algebra II", title: "Completing the Square",
    explain: [
      "To turn x² + bx into a perfect square, add (b/2)² — then it factors as (x + b/2)².",
      "Used to solve quadratics, and to convert a quadratic into vertex form.",
      "Whatever you add to one side of an equation, you must add to the other side too.",
    ],
    example: { problem: "Solve x² + 6x + 5 = 0 by completing the square.", steps: ["Move constant: x² + 6x = −5.", "Add (6/2)²=9 to both sides: x² + 6x + 9 = 4.", "(x+3)² = 4 → x + 3 = ±2."], answer: "x = −1 or x = −5" },
  },
  {
    id: 52, unit: "Algebra II", level: "Algebra II", title: "Polynomial Long Division",
    explain: [
      "Divide polynomials the same way you divide numbers: divide, multiply, subtract, bring down.",
      "The result is a quotient plus a remainder over the divisor.",
      "Useful for factoring higher-degree polynomials once one root is known.",
    ],
    example: { problem: "Divide x² + 5x + 6 by x + 2.", steps: ["x² ÷ x = x; multiply: x(x+2)=x²+2x; subtract: 3x+6.", "3x ÷ x = 3; multiply: 3(x+2)=3x+6; subtract: 0."], answer: "x + 3 (no remainder)" },
  },
  {
    id: 53, unit: "Algebra II", level: "Algebra II", title: "Rational Functions & Asymptotes",
    explain: [
      "A rational function is a ratio of two polynomials, like f(x) = 1/(x−2).",
      "A vertical asymptote occurs where the denominator equals zero (and the numerator doesn't).",
      "A horizontal asymptote describes the function's behavior as x gets very large or very negative.",
    ],
    example: { problem: "Find the vertical asymptote of f(x) = 3/(x − 4).", steps: ["Set the denominator to 0: x − 4 = 0."], answer: "x = 4" },
  },
  {
    id: 54, unit: "Algebra II", level: "Algebra II", title: "Exponential Functions: Growth & Decay",
    explain: [
      "Exponential growth/decay has the form y = a(1 + r)ᵗ (growth) or y = a(1 − r)ᵗ (decay), where a is the starting amount.",
      "The base being greater than 1 means growth; between 0 and 1 means decay.",
      "These model things like population growth, compound interest, and radioactive decay.",
    ],
    example: { problem: "A population of 100 grows 20% per year. Find the population after 2 years.", steps: ["y = 100(1.2)².", "1.2² = 1.44.", "100 × 1.44."], answer: "144" },
  },
  {
    id: 55, unit: "Algebra II", level: "Algebra II", title: "Logarithms: Introduction & Rules",
    explain: [
      "A logarithm answers 'what exponent gives this result': log_b(x) = y means bʸ = x.",
      "log_b(mn) = log_b(m) + log_b(n), and log_b(m/n) = log_b(m) − log_b(n).",
      "log_b(mⁿ) = n·log_b(m).",
    ],
    example: { problem: "Evaluate log₂(8).", steps: ["Ask: 2 to what power gives 8?", "2³ = 8."], answer: "3" },
  },
  {
    id: 56, unit: "Algebra II", level: "Algebra II", title: "Solving Exponential & Logarithmic Equations",
    explain: [
      "To solve an exponential equation, take the log of both sides (or match bases if possible).",
      "To solve a logarithmic equation, rewrite it in exponential form.",
      "Always check that the answer keeps any logarithm's input positive.",
    ],
    example: { problem: "Solve 2^x = 32.", steps: ["Rewrite 32 as a power of 2: 32 = 2⁵.", "So 2^x = 2⁵ means x = 5."], answer: "x = 5" },
  },

  // ── Unit 9: Precalculus Foundations ───────────────────────────────
  {
    id: 57, unit: "Precalculus Foundations", level: "Precalculus", title: "Arithmetic & Geometric Sequences",
    explain: [
      "An arithmetic sequence adds the same amount (common difference d) each step: aₙ = a₁ + (n−1)d.",
      "A geometric sequence multiplies by the same amount (common ratio r) each step: aₙ = a₁·r^(n−1).",
      "Identify which type by checking: constant difference → arithmetic; constant ratio → geometric.",
    ],
    example: { problem: "Find the 6th term of the arithmetic sequence 3, 7, 11, 15...", steps: ["First term a₁=3, common difference d=4.", "a₆ = 3 + (6−1)(4) = 3 + 20."], answer: "23" },
  },
  {
    id: 58, unit: "Precalculus Foundations", level: "Precalculus", title: "Series & Summation Notation",
    explain: [
      "A series is the sum of the terms of a sequence.",
      "Sigma notation Σ compactly represents a sum: Σ (from i=1 to n) of a term expression.",
      "Sum of an arithmetic series: S_n = n(a₁ + aₙ)/2.",
    ],
    example: { problem: "Find the sum of the first 5 terms of 2, 4, 6, 8, 10.", steps: ["S_n = n(a₁+aₙ)/2 = 5(2+10)/2.", "5 × 12 / 2."], answer: "30" },
  },
  {
    id: 59, unit: "Precalculus Foundations", level: "Precalculus", title: "The Unit Circle & Radian Measure",
    explain: [
      "The unit circle has radius 1, centered at the origin — it's the foundation for defining trig functions for any angle.",
      "Radians measure angles by arc length: 360° = 2π radians, so 180° = π radians.",
      "To convert degrees to radians, multiply by π/180. To convert radians to degrees, multiply by 180/π.",
    ],
    example: { problem: "Convert 90° to radians.", steps: ["Multiply by π/180: 90 × π/180.", "= π/2."], answer: "π/2 radians" },
  },
  {
    id: 60, unit: "Precalculus Foundations", level: "Precalculus", title: "Graphing Sine & Cosine Functions",
    explain: [
      "y = sin(x) and y = cos(x) are wave-shaped, repeating every 2π (their period).",
      "Both oscillate between −1 and 1 (their amplitude is 1).",
      "sin(0) = 0 and starts rising; cos(0) = 1 and starts falling — that's the key difference between the two graphs.",
    ],
    example: { problem: "What is the amplitude and period of y = sin(x)?", steps: ["Amplitude is the max distance from the midline: 1.", "Period is how long before the pattern repeats: 2π."], answer: "Amplitude 1, period 2π" },
  },
];
