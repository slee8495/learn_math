// ── Concept sequence ──────────────────────────────────────────
// Ordered from elementary arithmetic through Algebra I.
// Each concept is taught once (see curriculum.js for day-mapping),
// then reinforced via problems + worked solutions on the following days.
//
// Planned future units (not yet authored — natural next expansion):
//   Geometry (triangles, trig ratios, circles, solids)
//   Algebra II (rational exponents, complex numbers, logs, sequences)
//   Precalculus (unit circle, trig graphs/identities, vectors, matrices, limits)
//   Calculus I (derivatives, applications, intro integrals)
//   Calculus II / intro college math (integration techniques, series, linear algebra, probability)

export const concepts = [
  // ── Unit 1: Whole Numbers & Operations ──────────────────────
  {
    id: 1, unit: "Whole Numbers & Operations", level: "Elementary", title: "Place Value & Rounding",
    explain: [
      "Each digit in a number has a value based on its position (ones, tens, hundreds, thousands...).",
      "To round to a place, look at the digit just to the right of it.",
      "If that digit is 5 or more, round up. If it's 4 or less, round down.",
      "Rounding makes big numbers easier to estimate with.",
    ],
    example: { problem: "Round 4,672 to the nearest hundred.", steps: ["The hundreds digit is 6 (4,672 → 4,6[6]72).", "Look at the tens digit: 7. Since 7 ≥ 5, round up.", "4,672 → 4,700."], answer: "4,700" },
  },
  {
    id: 2, unit: "Whole Numbers & Operations", level: "Elementary", title: "Adding & Subtracting Multi-Digit Numbers",
    explain: [
      "Line up numbers by place value (ones under ones, tens under tens).",
      "Add or subtract one column at a time, starting from the ones place.",
      "Carry a 1 to the next column when a sum is 10 or more.",
      "Borrow from the next column when subtracting a bigger digit from a smaller one.",
    ],
    example: { problem: "586 + 347", steps: ["Ones: 6+7=13, write 3 carry 1.", "Tens: 8+4+1=13, write 3 carry 1.", "Hundreds: 5+3+1=9."], answer: "933" },
  },
  {
    id: 3, unit: "Whole Numbers & Operations", level: "Elementary", title: "Multiplication Basics",
    explain: [
      "Multiplication is repeated addition: 4 × 3 means 4 groups of 3.",
      "For multi-digit numbers, multiply by each digit separately and add the results (partial products).",
      "Knowing multiplication facts up to 12 × 12 makes everything later much faster.",
    ],
    example: { problem: "23 × 6", steps: ["6 × 3 = 18 → write 8, carry 1.", "6 × 2 = 12, plus the carried 1 = 13."], answer: "138" },
  },
  {
    id: 4, unit: "Whole Numbers & Operations", level: "Elementary", title: "Division Basics",
    explain: [
      "Division splits a number into equal groups: 12 ÷ 3 asks 'how many 3s fit into 12?'",
      "Long division works one digit at a time from left to right.",
      "The leftover amount after dividing as evenly as possible is called the remainder.",
    ],
    example: { problem: "84 ÷ 4", steps: ["4 goes into 8 twice (2), 2×4=8, remainder 0.", "Bring down 4: 4 goes into 4 once (1)."], answer: "21" },
  },
  {
    id: 5, unit: "Whole Numbers & Operations", level: "Elementary", title: "Order of Operations (PEMDAS)",
    explain: [
      "Do Parentheses first, then Exponents, then Multiplication/Division (left to right), then Addition/Subtraction (left to right).",
      "Multiplication and division have equal priority — do whichever comes first, left to right.",
      "Same rule for addition and subtraction.",
    ],
    example: { problem: "3 + 4 × (2 + 1)²", steps: ["Parentheses: (2+1) = 3.", "Exponent: 3² = 9.", "Multiply: 4 × 9 = 36.", "Add: 3 + 36 = 39."], answer: "39" },
  },
  {
    id: 6, unit: "Whole Numbers & Operations", level: "Elementary", title: "Factors & Multiples",
    explain: [
      "A factor of a number divides into it evenly (no remainder).",
      "A multiple of a number is what you get by multiplying it by a whole number.",
      "Every number is both a factor and a multiple of itself.",
    ],
    example: { problem: "List all factors of 24.", steps: ["1×24, 2×12, 3×8, 4×6 all work evenly.", "Check nothing between 4 and 6 divides evenly."], answer: "1, 2, 3, 4, 6, 8, 12, 24" },
  },

  // ── Unit 2: Fractions & Decimals ─────────────────────────────
  {
    id: 7, unit: "Fractions & Decimals", level: "Elementary", title: "What Fractions Are",
    explain: [
      "A fraction a/b means a out of b equal parts. The top is the numerator, the bottom is the denominator.",
      "Equivalent fractions represent the same amount (1/2 = 2/4 = 3/6).",
      "To simplify a fraction, divide the top and bottom by their greatest common factor.",
    ],
    example: { problem: "Simplify 8/12.", steps: ["GCF of 8 and 12 is 4.", "8÷4 = 2, 12÷4 = 3."], answer: "2/3" },
  },
  {
    id: 8, unit: "Fractions & Decimals", level: "Elementary", title: "Adding & Subtracting Fractions",
    explain: [
      "Fractions need a common denominator before you can add or subtract them.",
      "Find the least common denominator, convert each fraction, then add/subtract the numerators.",
      "Simplify the final answer if possible.",
    ],
    example: { problem: "1/4 + 1/6", steps: ["LCD of 4 and 6 is 12.", "1/4 = 3/12, 1/6 = 2/12.", "3/12 + 2/12 = 5/12."], answer: "5/12" },
  },
  {
    id: 9, unit: "Fractions & Decimals", level: "Elementary", title: "Multiplying & Dividing Fractions",
    explain: [
      "To multiply fractions, multiply the numerators together and the denominators together — no common denominator needed.",
      "To divide by a fraction, multiply by its reciprocal (flip the second fraction).",
      "Simplify before or after multiplying, whichever is easier.",
    ],
    example: { problem: "2/3 ÷ 3/4", steps: ["Flip the second fraction: 3/4 → 4/3.", "Multiply: 2/3 × 4/3 = 8/9."], answer: "8/9" },
  },
  {
    id: 10, unit: "Fractions & Decimals", level: "Elementary", title: "Decimal Place Value",
    explain: [
      "Digits after the decimal point represent tenths, hundredths, thousandths, and so on.",
      "Comparing decimals: line up the decimal points and compare digit by digit, left to right.",
      "Adding zeros after the last decimal digit doesn't change the value (0.5 = 0.50).",
    ],
    example: { problem: "Which is bigger: 0.45 or 0.5?", steps: ["Write as 0.45 and 0.50 for equal length.", "Compare tenths: 4 vs 5 → 5 is bigger."], answer: "0.5 is bigger" },
  },
  {
    id: 11, unit: "Fractions & Decimals", level: "Elementary", title: "Adding, Subtracting, Multiplying Decimals",
    explain: [
      "For adding/subtracting, line up the decimal points first.",
      "For multiplying, ignore the decimal points, multiply as whole numbers, then count total decimal places from both factors and place the point.",
    ],
    example: { problem: "1.2 × 0.4", steps: ["12 × 4 = 48.", "Total decimal places: 1 + 1 = 2.", "Place point: 0.48."], answer: "0.48" },
  },
  {
    id: 12, unit: "Fractions & Decimals", level: "Elementary", title: "Converting Fractions, Decimals & Percents",
    explain: [
      "Fraction → decimal: divide the numerator by the denominator.",
      "Decimal → percent: multiply by 100 (move the decimal point two places right).",
      "Percent → fraction: write over 100 and simplify.",
    ],
    example: { problem: "Convert 3/4 to a percent.", steps: ["3 ÷ 4 = 0.75.", "0.75 × 100 = 75%."], answer: "75%" },
  },

  // ── Unit 3: Ratios, Percents & Geometry Basics ───────────────
  {
    id: 13, unit: "Ratios, Percents & Geometry Basics", level: "Elementary", title: "Ratios & Rates",
    explain: [
      "A ratio compares two quantities, written a:b or a/b.",
      "A rate is a ratio comparing two different units (e.g. miles per hour).",
      "Simplify ratios the same way you simplify fractions.",
    ],
    example: { problem: "A recipe uses 2 cups flour for 3 cups sugar. Simplify the ratio.", steps: ["Ratio is 2:3.", "GCF of 2 and 3 is 1, so it's already simplified."], answer: "2:3" },
  },
  {
    id: 14, unit: "Ratios, Percents & Geometry Basics", level: "Elementary", title: "Basic Percentages",
    explain: [
      "'Percent' means 'per hundred'. 25% means 25 out of 100.",
      "To find a percent of a number, convert the percent to a decimal and multiply.",
      "To find what percent one number is of another, divide and multiply by 100.",
    ],
    example: { problem: "What is 20% of 60?", steps: ["20% = 0.20.", "0.20 × 60 = 12."], answer: "12" },
  },
  {
    id: 15, unit: "Ratios, Percents & Geometry Basics", level: "Elementary", title: "Perimeter & Area of Rectangles/Triangles",
    explain: [
      "Perimeter is the distance around a shape — add up all the side lengths.",
      "Area of a rectangle = length × width.",
      "Area of a triangle = (base × height) ÷ 2.",
    ],
    example: { problem: "A triangle has base 8 and height 5. Find its area.", steps: ["Area = (base × height) ÷ 2.", "= (8 × 5) ÷ 2 = 40 ÷ 2."], answer: "20" },
  },
  {
    id: 16, unit: "Ratios, Percents & Geometry Basics", level: "Elementary", title: "Circles: Area & Circumference",
    explain: [
      "Circumference (distance around) = 2πr, where r is the radius.",
      "Area = πr².",
      "π (pi) is approximately 3.14.",
    ],
    example: { problem: "Find the area of a circle with radius 3 (use π ≈ 3.14).", steps: ["Area = πr² = 3.14 × 3².", "3² = 9, so 3.14 × 9."], answer: "28.26" },
  },
  {
    id: 17, unit: "Ratios, Percents & Geometry Basics", level: "Elementary", title: "Angles & Shapes",
    explain: [
      "A full circle is 360°, a straight line is 180°, a right angle is 90°.",
      "The interior angles of any triangle always add up to 180°.",
      "Complementary angles add to 90°; supplementary angles add to 180°.",
    ],
    example: { problem: "A triangle has angles 50° and 70°. Find the third angle.", steps: ["Angles sum to 180°.", "180 − 50 − 70 = 60."], answer: "60°" },
  },
  {
    id: 18, unit: "Ratios, Percents & Geometry Basics", level: "Elementary", title: "Mean, Median & Mode",
    explain: [
      "Mean (average) = sum of all values ÷ number of values.",
      "Median = the middle value when data is sorted (average the two middle values if there's an even count).",
      "Mode = the value that appears most often.",
    ],
    example: { problem: "Find the mean of 4, 8, 6, 10, 2.", steps: ["Sum = 4+8+6+10+2 = 30.", "Count = 5.", "30 ÷ 5 = 6."], answer: "6" },
  },

  // ── Unit 4: Negative Numbers & Exponents ─────────────────────
  {
    id: 19, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Negative Numbers & the Number Line",
    explain: [
      "Negative numbers sit to the left of zero on the number line.",
      "The further left a number is, the smaller its value.",
      "Absolute value is a number's distance from zero, always positive: |−5| = 5.",
    ],
    example: { problem: "Order −3, 5, −8, 0 from least to greatest.", steps: ["Picture the number line: further left = smaller.", "−8 is furthest left, then −3, then 0, then 5."], answer: "−8, −3, 0, 5" },
  },
  {
    id: 20, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Adding & Subtracting Negative Numbers",
    explain: [
      "Adding a negative is the same as subtracting: 5 + (−3) = 5 − 3.",
      "Subtracting a negative is the same as adding: 5 − (−3) = 5 + 3.",
      "Same signs → add and keep the sign. Different signs → subtract and keep the sign of the larger absolute value.",
    ],
    example: { problem: "−7 + 4", steps: ["Different signs, so subtract: 7 − 4 = 3.", "Keep the sign of the larger absolute value (−7), so the answer is negative."], answer: "−3" },
  },
  {
    id: 21, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Multiplying & Dividing Negative Numbers",
    explain: [
      "Same signs (both positive or both negative) → the result is positive.",
      "Different signs → the result is negative.",
      "This rule applies to both multiplication and division.",
    ],
    example: { problem: "(−6) × (−3)", steps: ["Same signs (both negative).", "6 × 3 = 18, result is positive."], answer: "18" },
  },
  {
    id: 22, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Exponents & Powers",
    explain: [
      "An exponent tells you how many times to multiply the base by itself: 2⁴ = 2×2×2×2.",
      "Any nonzero number to the power of 0 equals 1.",
      "A negative exponent means 'take the reciprocal': x⁻ⁿ = 1/xⁿ.",
    ],
    example: { problem: "Evaluate 2⁵.", steps: ["2×2 = 4.", "4×2 = 8.", "8×2 = 16.", "16×2 = 32."], answer: "32" },
  },
  {
    id: 23, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Square Roots",
    explain: [
      "The square root of x is the number that, multiplied by itself, gives x.",
      "√25 = 5 because 5×5 = 25.",
      "Perfect squares (1, 4, 9, 16, 25, 36...) have whole-number square roots.",
    ],
    example: { problem: "Find √81.", steps: ["Think: what number times itself is 81?", "9 × 9 = 81."], answer: "9" },
  },
  {
    id: 24, unit: "Negative Numbers & Exponents", level: "Middle School", title: "Prime Factorization",
    explain: [
      "A prime number has exactly two factors: 1 and itself (2, 3, 5, 7, 11...).",
      "Prime factorization breaks a number down into a product of only prime numbers.",
      "A factor tree is a common way to find it.",
    ],
    example: { problem: "Find the prime factorization of 60.", steps: ["60 = 6 × 10.", "6 = 2 × 3, 10 = 2 × 5.", "60 = 2 × 3 × 2 × 5 = 2² × 3 × 5."], answer: "2² × 3 × 5" },
  },
  {
    id: 25, unit: "Negative Numbers & Exponents", level: "Middle School", title: "GCF & LCM",
    explain: [
      "GCF (greatest common factor) is the largest number that divides evenly into two or more numbers.",
      "LCM (least common multiple) is the smallest number that two or more numbers all divide into evenly.",
      "Prime factorization makes both easy to find for larger numbers.",
    ],
    example: { problem: "Find the LCM of 4 and 6.", steps: ["Multiples of 4: 4, 8, 12, 16...", "Multiples of 6: 6, 12, 18...", "Smallest shared multiple: 12."], answer: "12" },
  },

  // ── Unit 5: Expressions & Equations ──────────────────────────
  {
    id: 26, unit: "Expressions & Equations", level: "Middle School", title: "Variables & Expressions",
    explain: [
      "A variable is a letter that stands for an unknown number (commonly x or y).",
      "An expression combines numbers, variables, and operations, but has no equals sign (e.g. 3x + 2).",
      "'Evaluating' an expression means substituting a number for the variable and simplifying.",
    ],
    example: { problem: "Evaluate 3x + 2 when x = 4.", steps: ["Substitute: 3(4) + 2.", "3×4 = 12.", "12 + 2 = 14."], answer: "14" },
  },
  {
    id: 27, unit: "Expressions & Equations", level: "Middle School", title: "Combining Like Terms",
    explain: [
      "Like terms have the exact same variable part (3x and 5x are like terms; 3x and 3x² are not).",
      "Add or subtract the coefficients of like terms, keep the variable part unchanged.",
      "Simplifying an expression usually means combining all like terms.",
    ],
    example: { problem: "Simplify 4x + 3 − 2x + 7.", steps: ["Group like terms: (4x − 2x) + (3 + 7).", "4x − 2x = 2x.", "3 + 7 = 10."], answer: "2x + 10" },
  },
  {
    id: 28, unit: "Expressions & Equations", level: "Middle School", title: "The Distributive Property",
    explain: [
      "a(b + c) = ab + ac — multiply the outside term by everything inside the parentheses.",
      "This works for subtraction too: a(b − c) = ab − ac.",
      "Watch signs carefully when the outside term is negative.",
    ],
    example: { problem: "Expand 3(2x − 5).", steps: ["3 × 2x = 6x.", "3 × (−5) = −15."], answer: "6x − 15" },
  },
  {
    id: 29, unit: "Expressions & Equations", level: "Middle School", title: "Solving One-Step Equations",
    explain: [
      "An equation says two expressions are equal; solving means finding the value of the variable.",
      "Whatever you do to one side, you must do to the other, to keep it balanced.",
      "Undo the operation: if x + 5 = 9, subtract 5 from both sides.",
    ],
    example: { problem: "Solve x − 7 = 12.", steps: ["Add 7 to both sides: x − 7 + 7 = 12 + 7."], answer: "x = 19" },
  },
  {
    id: 30, unit: "Expressions & Equations", level: "Middle School", title: "Solving Two-Step Equations",
    explain: [
      "Undo addition/subtraction first, then undo multiplication/division (reverse order of operations).",
      "Keep both sides balanced at every step.",
    ],
    example: { problem: "Solve 3x + 4 = 19.", steps: ["Subtract 4 from both sides: 3x = 15.", "Divide both sides by 3: x = 5."], answer: "x = 5" },
  },
  {
    id: 31, unit: "Expressions & Equations", level: "Middle School", title: "Solving Multi-Step Equations",
    explain: [
      "First distribute and combine like terms on each side.",
      "Then get all variable terms on one side and constants on the other.",
      "Finally divide to isolate the variable.",
    ],
    example: { problem: "Solve 2(x + 3) = 4x − 2.", steps: ["Distribute: 2x + 6 = 4x − 2.", "Subtract 2x from both sides: 6 = 2x − 2.", "Add 2: 8 = 2x.", "Divide by 2: 4 = x."], answer: "x = 4" },
  },
  {
    id: 32, unit: "Expressions & Equations", level: "Middle School", title: "Solving & Graphing Inequalities",
    explain: [
      "Inequalities use <, >, ≤, ≥ instead of =, and are solved just like equations.",
      "Key rule: if you multiply or divide both sides by a negative number, flip the inequality sign.",
      "On a number line, use an open circle for < or > and a filled circle for ≤ or ≥.",
    ],
    example: { problem: "Solve −2x > 6.", steps: ["Divide both sides by −2 (flip the sign): x < −3."], answer: "x < −3" },
  },
  {
    id: 33, unit: "Expressions & Equations", level: "Middle School", title: "Proportions",
    explain: [
      "A proportion says two ratios are equal: a/b = c/d.",
      "Cross-multiply to solve: a×d = b×c.",
      "Proportions are used to scale recipes, maps, models, and more.",
    ],
    example: { problem: "Solve x/4 = 6/8.", steps: ["Cross-multiply: 8x = 4×6 = 24.", "Divide by 8: x = 3."], answer: "x = 3" },
  },
  {
    id: 34, unit: "Expressions & Equations", level: "Middle School", title: "Percent Change",
    explain: [
      "Percent change = (change in value ÷ original value) × 100.",
      "If the new value is bigger, it's a percent increase; if smaller, a percent decrease.",
    ],
    example: { problem: "A $40 item increases to $50. Find the percent increase.", steps: ["Change = 50 − 40 = 10.", "10 ÷ 40 = 0.25.", "0.25 × 100 = 25%."], answer: "25% increase" },
  },
  {
    id: 35, unit: "Expressions & Equations", level: "Middle School", title: "Simple Interest",
    explain: [
      "Simple interest formula: I = P × r × t (Principal × rate × time).",
      "Rate must be written as a decimal (5% = 0.05).",
      "Total amount owed/earned = Principal + Interest.",
    ],
    example: { problem: "Find the interest on $500 at 4% for 3 years.", steps: ["I = P × r × t = 500 × 0.04 × 3.", "500 × 0.04 = 20.", "20 × 3 = 60."], answer: "$60" },
  },

  // ── Unit 6: Coordinate Plane & Solids ────────────────────────
  {
    id: 36, unit: "Coordinate Plane & Solids", level: "Middle School", title: "The Coordinate Plane",
    explain: [
      "The coordinate plane has a horizontal x-axis and vertical y-axis meeting at the origin (0,0).",
      "A point is written (x, y): move x units horizontally, then y units vertically.",
      "The plane is divided into 4 quadrants, numbered counterclockwise starting from the top-right.",
    ],
    example: { problem: "Which quadrant is the point (−3, 5) in?", steps: ["x is negative (left), y is positive (up).", "Left and up is the top-left region: Quadrant II."], answer: "Quadrant II" },
  },
  {
    id: 37, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Graphing Points & Basic Relations",
    explain: [
      "To plot (x, y), start at the origin, move x units left/right, then y units up/down.",
      "A set of ordered pairs can be graphed to see patterns or relationships between two quantities.",
    ],
    example: { problem: "Plot and describe the pattern: (1,2), (2,4), (3,6).", steps: ["Each y-value is double the x-value.", "This is a straight-line pattern through the origin."], answer: "y = 2x" },
  },
  {
    id: 38, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Volume of Rectangular Prisms",
    explain: [
      "Volume of a rectangular prism = length × width × height.",
      "Volume is measured in cubic units (like cm³ or ft³).",
    ],
    example: { problem: "Find the volume of a box 4 × 3 × 5.", steps: ["4 × 3 = 12.", "12 × 5 = 60."], answer: "60 cubic units" },
  },
  {
    id: 39, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Surface Area",
    explain: [
      "Surface area is the total area of all the faces of a 3D shape added together.",
      "For a rectangular prism, there are 3 pairs of identical faces: top/bottom, front/back, left/right.",
    ],
    example: { problem: "Find the surface area of a cube with side 3.", steps: ["Each face area = 3×3 = 9.", "A cube has 6 identical faces: 6 × 9 = 54."], answer: "54 square units" },
  },
  {
    id: 40, unit: "Coordinate Plane & Solids", level: "Middle School", title: "Pythagorean Theorem",
    explain: [
      "For a right triangle with legs a, b and hypotenuse c: a² + b² = c².",
      "The hypotenuse is always the longest side, opposite the right angle.",
      "Used to find a missing side when the other two are known.",
    ],
    example: { problem: "A right triangle has legs 3 and 4. Find the hypotenuse.", steps: ["a² + b² = c²: 3² + 4² = c².", "9 + 16 = 25 = c².", "√25 = 5."], answer: "5" },
  },

  // ── Unit 7: Linear Equations & Functions ─────────────────────
  {
    id: 41, unit: "Linear Equations & Functions", level: "Algebra I", title: "Slope",
    explain: [
      "Slope measures steepness: rise over run, or (change in y) ÷ (change in x).",
      "Formula from two points (x₁,y₁) and (x₂,y₂): m = (y₂ − y₁)/(x₂ − x₁).",
      "Positive slope rises left to right; negative slope falls left to right.",
    ],
    example: { problem: "Find the slope between (1,2) and (4,11).", steps: ["m = (11 − 2)/(4 − 1) = 9/3."], answer: "3" },
  },
  {
    id: 42, unit: "Linear Equations & Functions", level: "Algebra I", title: "Slope-Intercept Form",
    explain: [
      "y = mx + b, where m is the slope and b is the y-intercept (where the line crosses the y-axis).",
      "This is the most common way to write a linear equation.",
    ],
    example: { problem: "A line has slope 2 and y-intercept −3. Write its equation.", steps: ["Plug into y = mx + b: m=2, b=−3."], answer: "y = 2x − 3" },
  },
  {
    id: 43, unit: "Linear Equations & Functions", level: "Algebra I", title: "Graphing Linear Equations",
    explain: [
      "Plot the y-intercept first, then use the slope (rise/run) to find a second point.",
      "Draw a straight line through the two points, extending in both directions.",
    ],
    example: { problem: "Describe how to graph y = (1/2)x + 1.", steps: ["Start at (0,1) — the y-intercept.", "Slope 1/2 means: from that point, go up 1, right 2.", "Plot that point and draw the line through both."], answer: "Line through (0,1) and (2,2)" },
  },
  {
    id: 44, unit: "Linear Equations & Functions", level: "Algebra I", title: "Writing Equations of Lines",
    explain: [
      "Point-slope form: y − y₁ = m(x − x₁), useful when you know a point and the slope.",
      "To write an equation from two points: find the slope first, then use point-slope form.",
    ],
    example: { problem: "Write the equation of the line through (2,3) with slope 4.", steps: ["y − 3 = 4(x − 2).", "Distribute: y − 3 = 4x − 8.", "Add 3: y = 4x − 5."], answer: "y = 4x − 5" },
  },
  {
    id: 45, unit: "Linear Equations & Functions", level: "Algebra I", title: "Systems of Equations: Substitution",
    explain: [
      "A system of equations is two or more equations with the same variables, solved together.",
      "Substitution: solve one equation for a variable, then plug that expression into the other equation.",
    ],
    example: { problem: "Solve: y = x + 2 and 2x + y = 11.", steps: ["Substitute y: 2x + (x + 2) = 11.", "3x + 2 = 11 → 3x = 9 → x = 3.", "y = 3 + 2 = 5."], answer: "x = 3, y = 5" },
  },
  {
    id: 46, unit: "Linear Equations & Functions", level: "Algebra I", title: "Systems of Equations: Elimination",
    explain: [
      "Elimination: add or subtract the equations to cancel out one variable.",
      "You may need to multiply one or both equations first so the coefficients match.",
    ],
    example: { problem: "Solve: 2x + y = 10 and x − y = 2.", steps: ["Add the equations: (2x + x) + (y − y) = 10 + 2.", "3x = 12 → x = 4.", "Plug in: 4 − y = 2 → y = 2."], answer: "x = 4, y = 2" },
  },
  {
    id: 47, unit: "Linear Equations & Functions", level: "Algebra I", title: "Graphing Systems of Equations",
    explain: [
      "Graph both lines — the solution is the point where they cross.",
      "Parallel lines (same slope, different intercept) mean no solution.",
      "Identical lines mean infinitely many solutions.",
    ],
    example: { problem: "Lines y = x + 1 and y = x − 2 — how many solutions?", steps: ["Both have slope 1 (parallel).", "Different y-intercepts, so they never cross."], answer: "No solution" },
  },
  {
    id: 48, unit: "Linear Equations & Functions", level: "Algebra I", title: "Linear Inequalities in Two Variables",
    explain: [
      "Graph the boundary line as if it were an equation (dashed for < or >, solid for ≤ or ≥).",
      "Shade the side of the line that makes the inequality true — test the point (0,0) if it's not on the line.",
    ],
    example: { problem: "Which side do you shade for y > x + 1?", steps: ["Test (0,0): is 0 > 0 + 1? 0 > 1 is false.", "Since it's false, shade the side NOT containing (0,0)."], answer: "Shade above the line" },
  },
  {
    id: 49, unit: "Linear Equations & Functions", level: "Algebra I", title: "Introduction to Functions",
    explain: [
      "A function assigns exactly one output to each input.",
      "The vertical line test: if a vertical line crosses a graph more than once, it's not a function.",
      "Domain = all possible inputs; range = all possible outputs.",
    ],
    example: { problem: "Is {(1,2), (2,4), (1,5)} a function?", steps: ["Input 1 has two different outputs (2 and 5)."], answer: "No — not a function" },
  },
  {
    id: 50, unit: "Linear Equations & Functions", level: "Algebra I", title: "Function Notation",
    explain: [
      "f(x) is read 'f of x' and means 'the output of function f when the input is x'.",
      "To evaluate f(3), substitute 3 everywhere you see x in the function's rule.",
    ],
    example: { problem: "If f(x) = 2x + 5, find f(3).", steps: ["Substitute: f(3) = 2(3) + 5.", "= 6 + 5."], answer: "11" },
  },

  // ── Unit 8: Polynomials & Factoring ───────────────────────────
  {
    id: 51, unit: "Polynomials & Factoring", level: "Algebra I", title: "Adding & Subtracting Polynomials",
    explain: [
      "A polynomial is a sum of terms with whole-number exponents (e.g. 3x² + 2x − 1).",
      "Add or subtract polynomials by combining like terms.",
      "When subtracting, distribute the negative sign to every term in the second polynomial.",
    ],
    example: { problem: "(3x² + 2x) − (x² − 5)", steps: ["Distribute the negative: 3x² + 2x − x² + 5.", "Combine like terms: (3x² − x²) + 2x + 5."], answer: "2x² + 2x + 5" },
  },
  {
    id: 52, unit: "Polynomials & Factoring", level: "Algebra I", title: "Multiplying Polynomials (FOIL)",
    explain: [
      "FOIL stands for First, Outer, Inner, Last — the four products when multiplying two binomials.",
      "Multiply each term in the first polynomial by each term in the second, then combine like terms.",
    ],
    example: { problem: "(x + 3)(x + 5)", steps: ["First: x·x = x².", "Outer: x·5 = 5x.", "Inner: 3·x = 3x.", "Last: 3·5 = 15.", "Combine: x² + 5x + 3x + 15."], answer: "x² + 8x + 15" },
  },
  {
    id: 53, unit: "Polynomials & Factoring", level: "Algebra I", title: "Factoring: Greatest Common Factor",
    explain: [
      "Find the GCF of all terms, then divide it out of each term.",
      "Write as GCF times the remaining expression in parentheses.",
    ],
    example: { problem: "Factor 6x² + 9x.", steps: ["GCF of 6x² and 9x is 3x.", "6x² ÷ 3x = 2x, 9x ÷ 3x = 3."], answer: "3x(2x + 3)" },
  },
  {
    id: 54, unit: "Polynomials & Factoring", level: "Algebra I", title: "Factoring Trinomials",
    explain: [
      "For x² + bx + c, find two numbers that multiply to c and add to b.",
      "Write as (x + first number)(x + second number).",
    ],
    example: { problem: "Factor x² + 7x + 12.", steps: ["Need two numbers that multiply to 12 and add to 7.", "3 and 4 work: 3×4=12, 3+4=7."], answer: "(x + 3)(x + 4)" },
  },
  {
    id: 55, unit: "Polynomials & Factoring", level: "Algebra I", title: "Difference of Squares",
    explain: [
      "a² − b² always factors as (a + b)(a − b).",
      "Recognize it by two perfect-square terms separated by a minus sign.",
    ],
    example: { problem: "Factor x² − 16.", steps: ["x² is a square (x·x), 16 is a square (4·4).", "Apply the pattern: (x + 4)(x − 4)."], answer: "(x + 4)(x − 4)" },
  },
  {
    id: 56, unit: "Polynomials & Factoring", level: "Algebra I", title: "Solving Quadratics by Factoring",
    explain: [
      "Set the equation equal to 0, factor the left side, then use the zero product property.",
      "Zero product property: if A × B = 0, then A = 0 or B = 0.",
    ],
    example: { problem: "Solve x² + 7x + 12 = 0.", steps: ["Factor: (x + 3)(x + 4) = 0.", "Set each factor to 0: x + 3 = 0 or x + 4 = 0."], answer: "x = −3 or x = −4" },
  },

  // ── Unit 9: Quadratics, Exponents & Radicals ──────────────────
  {
    id: 57, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "The Quadratic Formula",
    explain: [
      "For ax² + bx + c = 0, x = (−b ± √(b² − 4ac)) / (2a).",
      "Works for every quadratic, even ones that don't factor nicely.",
      "b² − 4ac is called the discriminant — it tells you how many real solutions exist.",
    ],
    example: { problem: "Solve x² − 5x + 6 = 0 using the quadratic formula.", steps: ["a=1, b=−5, c=6.", "Discriminant: (−5)² − 4(1)(6) = 25 − 24 = 1.", "x = (5 ± √1)/2 = (5 ± 1)/2."], answer: "x = 3 or x = 2" },
  },
  {
    id: 58, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "Graphing Quadratics (Parabolas)",
    explain: [
      "The graph of y = ax² + bx + c is a U-shaped curve called a parabola.",
      "If a > 0, it opens upward; if a < 0, it opens downward.",
      "The vertex (turning point) x-coordinate is at x = −b/(2a).",
    ],
    example: { problem: "Find the vertex x-coordinate of y = x² − 4x + 1.", steps: ["a=1, b=−4.", "x = −(−4)/(2·1) = 4/2."], answer: "x = 2" },
  },
  {
    id: 59, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "Exponent Rules",
    explain: [
      "Multiplying same base: xᵃ · xᵇ = xᵃ⁺ᵇ.",
      "Dividing same base: xᵃ / xᵇ = xᵃ⁻ᵇ.",
      "Power to a power: (xᵃ)ᵇ = xᵃᵇ.",
    ],
    example: { problem: "Simplify x⁵ · x³.", steps: ["Same base, add exponents: 5 + 3 = 8."], answer: "x⁸" },
  },
  {
    id: 60, unit: "Quadratics, Exponents & Radicals", level: "Algebra I", title: "Simplifying Radical Expressions",
    explain: [
      "Break the number under the root into a perfect square times a remainder, then pull the perfect square out.",
      "√(a·b) = √a · √b — this is the key rule used to simplify.",
    ],
    example: { problem: "Simplify √50.", steps: ["50 = 25 × 2, and 25 is a perfect square.", "√50 = √25 · √2 = 5√2."], answer: "5√2" },
  },
];
