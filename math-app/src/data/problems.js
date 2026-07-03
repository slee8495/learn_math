// ── Practice problem bank ─────────────────────────────────────
// Keyed by concept id. Each concept has a small pool of problems;
// curriculum.js picks a seeded subset per day so repeat visits to
// the same concept show a different combination.

export const problemsByConcept = {
  1: [
    { q: "Round 3,851 to the nearest hundred.", steps: ["Hundreds digit is 8 (3,8[5]1).", "Tens digit is 5, which is ≥ 5, so round up.", "3,851 → 3,900."], a: "3,900" },
    { q: "Round 62,340 to the nearest thousand.", steps: ["Thousands digit is 2 (62,[3]40 rounds the thousands place).", "Hundreds digit is 3, which is < 5, so round down.", "62,340 → 62,000."], a: "62,000" },
    { q: "Round 749 to the nearest ten.", steps: ["Tens digit is 4 (74[9]).", "Ones digit is 9, which is ≥ 5, so round up.", "749 → 750."], a: "750" },
  ],
  2: [
    { q: "672 + 259", steps: ["Ones: 2+9=11, write 1 carry 1.", "Tens: 7+5+1=13, write 3 carry 1.", "Hundreds: 6+2+1=9."], a: "931" },
    { q: "845 − 378", steps: ["Ones: 5−8, borrow: 15−8=7.", "Tens: 3 (after borrow)−7, borrow: 13−7=6.", "Hundreds: 7 (after borrow)−3=4."], a: "467" },
    { q: "1,204 + 3,689", steps: ["Ones: 4+9=13, write 3 carry 1.", "Tens: 0+8+1=9.", "Hundreds: 2+6=8.", "Thousands: 1+3=4."], a: "4,893" },
  ],
  3: [
    { q: "34 × 7", steps: ["7×4=28, write 8 carry 2.", "7×3=21, plus carried 2 = 23."], a: "238" },
    { q: "56 × 8", steps: ["8×6=48, write 8 carry 4.", "8×5=40, plus carried 4 = 44."], a: "448" },
    { q: "23 × 15", steps: ["23×5=115.", "23×10=230.", "115+230=345."], a: "345" },
  ],
  4: [
    { q: "96 ÷ 4", steps: ["4 into 9 → 2 (2×4=8), remainder 1.", "Bring down 6 → 16; 4 into 16 → 4."], a: "24" },
    { q: "132 ÷ 6", steps: ["6 into 13 → 2 (2×6=12), remainder 1.", "Bring down 2 → 12; 6 into 12 → 2."], a: "22" },
    { q: "77 ÷ 5", steps: ["5 into 7 → 1, remainder 2.", "Bring down 7 → 27; 5 into 27 → 5 (25), remainder 2."], a: "15 remainder 2" },
  ],
  5: [
    { q: "6 + 2 × (5 − 2)²", steps: ["Parentheses: 5−2=3.", "Exponent: 3²=9.", "Multiply: 2×9=18.", "Add: 6+18=24."], a: "24" },
    { q: "(8 − 3) × 4 + 6 ÷ 2", steps: ["Parentheses: 8−3=5.", "Multiply: 5×4=20.", "Divide: 6÷2=3.", "Add: 20+3=23."], a: "23" },
    { q: "5² − 3 × (2 + 1)", steps: ["Parentheses: 2+1=3.", "Exponent: 5²=25.", "Multiply: 3×3=9.", "Subtract: 25−9=16."], a: "16" },
  ],
  6: [
    { q: "List all factors of 36.", steps: ["1×36, 2×18, 3×12, 4×9, 6×6.", "No other whole-number pairs multiply to 36."], a: "1, 2, 3, 4, 6, 9, 12, 18, 36" },
    { q: "List the first five multiples of 7.", steps: ["7×1, 7×2, 7×3, 7×4, 7×5."], a: "7, 14, 21, 28, 35" },
    { q: "Is 51 prime or composite?", steps: ["Check small factors: 51 ÷ 3 = 17 exactly.", "Since it has a factor other than 1 and itself, it's composite."], a: "Composite (3 × 17)" },
  ],
  7: [
    { q: "Simplify 10/15.", steps: ["GCF of 10 and 15 is 5.", "10÷5=2, 15÷5=3."], a: "2/3" },
    { q: "Simplify 18/24.", steps: ["GCF of 18 and 24 is 6.", "18÷6=3, 24÷6=4."], a: "3/4" },
    { q: "Are 3/4 and 9/12 equivalent?", steps: ["Simplify 9/12: GCF is 3, giving 3/4.", "3/4 = 3/4."], a: "Yes, equivalent" },
  ],
  8: [
    { q: "1/3 + 1/6", steps: ["LCD of 3 and 6 is 6.", "1/3 = 2/6.", "2/6 + 1/6 = 3/6 = 1/2."], a: "1/2" },
    { q: "3/4 − 1/3", steps: ["LCD of 4 and 3 is 12.", "3/4 = 9/12, 1/3 = 4/12.", "9/12 − 4/12 = 5/12."], a: "5/12" },
    { q: "2/5 + 1/2", steps: ["LCD of 5 and 2 is 10.", "2/5 = 4/10, 1/2 = 5/10.", "4/10 + 5/10 = 9/10."], a: "9/10" },
  ],
  9: [
    { q: "3/5 × 2/7", steps: ["Multiply numerators: 3×2=6.", "Multiply denominators: 5×7=35."], a: "6/35" },
    { q: "5/6 ÷ 1/2", steps: ["Flip the second fraction: 1/2 → 2/1.", "Multiply: 5/6 × 2/1 = 10/6 = 5/3."], a: "5/3" },
    { q: "4/9 × 3/8", steps: ["Multiply: (4×3)/(9×8) = 12/72.", "Simplify: GCF of 12 and 72 is 12 → 1/6."], a: "1/6" },
  ],
  10: [
    { q: "Which is bigger: 0.7 or 0.68?", steps: ["Write as 0.70 and 0.68 for equal length.", "Compare tenths: 7 vs 6 → 0.70 is bigger."], a: "0.7" },
    { q: "Order 0.3, 0.25, 0.4 from least to greatest.", steps: ["Write as 0.30, 0.25, 0.40.", "0.25 < 0.30 < 0.40."], a: "0.25, 0.3, 0.4" },
    { q: "What is the value of the 6 in 4.267?", steps: ["Position after the decimal: tenths (2), hundredths (6), thousandths (7).", "The 6 is in the hundredths place."], a: "6 hundredths (0.06)" },
  ],
  11: [
    { q: "3.6 + 2.45", steps: ["Line up decimal points: 3.60 + 2.45.", "Add: 6.05."], a: "6.05" },
    { q: "5.2 × 0.3", steps: ["Multiply ignoring decimals: 52 × 3 = 156.", "Total decimal places: 1+1=2.", "Place point: 1.56."], a: "1.56" },
    { q: "7.8 − 3.45", steps: ["Line up: 7.80 − 3.45.", "Subtract: 4.35."], a: "4.35" },
  ],
  12: [
    { q: "Convert 0.6 to a fraction and simplify.", steps: ["0.6 = 6/10.", "Simplify: GCF 2 → 3/5."], a: "3/5" },
    { q: "Convert 45% to a decimal.", steps: ["Divide by 100: 45 ÷ 100 = 0.45."], a: "0.45" },
    { q: "Convert 1/8 to a percent.", steps: ["1 ÷ 8 = 0.125.", "0.125 × 100 = 12.5%."], a: "12.5%" },
  ],
  13: [
    { q: "Simplify the ratio 15:20.", steps: ["GCF of 15 and 20 is 5.", "15÷5=3, 20÷5=4."], a: "3:4" },
    { q: "A car travels 180 miles in 3 hours. Find the rate in mph.", steps: ["Rate = distance ÷ time = 180 ÷ 3."], a: "60 mph" },
    { q: "Simplify the ratio 24:36.", steps: ["GCF of 24 and 36 is 12.", "24÷12=2, 36÷12=3."], a: "2:3" },
  ],
  14: [
    { q: "What is 35% of 80?", steps: ["35% = 0.35.", "0.35 × 80 = 28."], a: "28" },
    { q: "15 is what percent of 60?", steps: ["15 ÷ 60 = 0.25.", "0.25 × 100 = 25%."], a: "25%" },
    { q: "What is 150% of 20?", steps: ["150% = 1.5.", "1.5 × 20 = 30."], a: "30" },
  ],
  15: [
    { q: "Find the area of a rectangle 7 by 5.", steps: ["Area = length × width = 7 × 5."], a: "35 square units" },
    { q: "Find the area of a triangle with base 10 and height 6.", steps: ["Area = (base × height) ÷ 2 = (10×6)÷2 = 60÷2."], a: "30 square units" },
    { q: "Find the perimeter of a rectangle 9 by 4.", steps: ["Perimeter = 2(length + width) = 2(9+4) = 2(13)."], a: "26 units" },
  ],
  16: [
    { q: "Find the circumference of a circle with radius 5 (π ≈ 3.14).", steps: ["Circumference = 2πr = 2 × 3.14 × 5."], a: "31.4" },
    { q: "Find the area of a circle with radius 4 (π ≈ 3.14).", steps: ["Area = πr² = 3.14 × 4² = 3.14 × 16."], a: "50.24" },
    { q: "Find the circumference of a circle with diameter 10 (π ≈ 3.14).", steps: ["Radius = diameter ÷ 2 = 5.", "Circumference = 2πr = 2 × 3.14 × 5."], a: "31.4" },
  ],
  17: [
    { q: "A triangle has angles 90° and 35°. Find the third angle.", steps: ["Angles sum to 180°.", "180 − 90 − 35 = 55."], a: "55°" },
    { q: "Two angles are complementary. One is 62°. Find the other.", steps: ["Complementary angles sum to 90°.", "90 − 62 = 28."], a: "28°" },
    { q: "Two angles are supplementary. One is 110°. Find the other.", steps: ["Supplementary angles sum to 180°.", "180 − 110 = 70."], a: "70°" },
  ],
  18: [
    { q: "Find the median of 3, 9, 5, 1, 7.", steps: ["Sort: 1, 3, 5, 7, 9.", "Middle value (3rd of 5) is 5."], a: "5" },
    { q: "Find the mode of 2, 4, 4, 6, 4, 8.", steps: ["4 appears three times, more than any other value."], a: "4" },
    { q: "Find the mean of 10, 12, 14, 16.", steps: ["Sum = 10+12+14+16 = 52.", "52 ÷ 4 = 13."], a: "13" },
  ],
  19: [
    { q: "Order −5, 2, −1, −9 from least to greatest.", steps: ["Further left on the number line = smaller.", "−9 is smallest, then −5, then −1, then 2."], a: "−9, −5, −1, 2" },
    { q: "Find |−12|.", steps: ["Absolute value = distance from 0, always positive."], a: "12" },
    { q: "Which is smaller: −4 or −7?", steps: ["−7 is further left on the number line."], a: "−7" },
  ],
  20: [
    { q: "−9 + 3", steps: ["Different signs, subtract: 9−3=6.", "Keep sign of larger absolute value (−9): negative."], a: "−6" },
    { q: "8 − (−5)", steps: ["Subtracting a negative = adding: 8 + 5."], a: "13" },
    { q: "−4 + (−6)", steps: ["Same signs, add and keep sign: 4+6=10, negative."], a: "−10" },
  ],
  21: [
    { q: "(−8) × 5", steps: ["Different signs → negative result.", "8 × 5 = 40."], a: "−40" },
    { q: "(−36) ÷ (−4)", steps: ["Same signs → positive result.", "36 ÷ 4 = 9."], a: "9" },
    { q: "7 × (−6)", steps: ["Different signs → negative result.", "7 × 6 = 42."], a: "−42" },
  ],
  22: [
    { q: "Evaluate 3⁴.", steps: ["3×3=9.", "9×3=27.", "27×3=81."], a: "81" },
    { q: "Evaluate 5⁰.", steps: ["Any nonzero number to the power 0 is 1."], a: "1" },
    { q: "Evaluate 2⁻³.", steps: ["Negative exponent → reciprocal: 1/2³.", "2³=8."], a: "1/8" },
  ],
  23: [
    { q: "Find √49.", steps: ["7 × 7 = 49."], a: "7" },
    { q: "Find √144.", steps: ["12 × 12 = 144."], a: "12" },
    { q: "Find √121.", steps: ["11 × 11 = 121."], a: "11" },
  ],
  24: [
    { q: "Find the prime factorization of 84.", steps: ["84 = 4 × 21.", "4 = 2×2, 21 = 3×7.", "84 = 2² × 3 × 7."], a: "2² × 3 × 7" },
    { q: "Find the prime factorization of 45.", steps: ["45 = 9 × 5.", "9 = 3×3.", "45 = 3² × 5."], a: "3² × 5" },
    { q: "Find the prime factorization of 100.", steps: ["100 = 4 × 25.", "4 = 2², 25 = 5².", "100 = 2² × 5²."], a: "2² × 5²" },
  ],
  25: [
    { q: "Find the GCF of 18 and 24.", steps: ["Factors of 18: 1,2,3,6,9,18.", "Factors of 24: 1,2,3,4,6,8,12,24.", "Largest shared factor: 6."], a: "6" },
    { q: "Find the LCM of 6 and 8.", steps: ["Multiples of 6: 6,12,18,24...", "Multiples of 8: 8,16,24...", "Smallest shared: 24."], a: "24" },
    { q: "Find the GCF of 12 and 30.", steps: ["Factors of 12: 1,2,3,4,6,12.", "Factors of 30: 1,2,3,5,6,10,15,30.", "Largest shared: 6."], a: "6" },
  ],
  26: [
    { q: "Evaluate 5x − 3 when x = 6.", steps: ["Substitute: 5(6)−3.", "30−3."], a: "27" },
    { q: "Evaluate 2x² when x = 3.", steps: ["Substitute: 2(3)².", "3²=9, 2×9=18."], a: "18" },
    { q: "Evaluate (x + 4)/2 when x = 10.", steps: ["Substitute: (10+4)/2.", "14/2."], a: "7" },
  ],
  27: [
    { q: "Simplify 5x + 2x − 3.", steps: ["Combine like terms: 5x+2x=7x.", "7x − 3."], a: "7x − 3" },
    { q: "Simplify 6y − 4 + 2y + 9.", steps: ["Group: (6y+2y) + (−4+9).", "8y + 5."], a: "8y + 5" },
    { q: "Simplify 3x² + 5x − x² + 2x.", steps: ["Group: (3x²−x²) + (5x+2x).", "2x² + 7x."], a: "2x² + 7x" },
  ],
  28: [
    { q: "Expand 5(x + 4).", steps: ["5×x=5x.", "5×4=20."], a: "5x + 20" },
    { q: "Expand −2(3x − 6).", steps: ["−2×3x=−6x.", "−2×(−6)=12."], a: "−6x + 12" },
    { q: "Expand 4(2x + 3y − 1).", steps: ["4×2x=8x.", "4×3y=12y.", "4×(−1)=−4."], a: "8x + 12y − 4" },
  ],
  29: [
    { q: "Solve x + 9 = 15.", steps: ["Subtract 9 from both sides: x = 6."], a: "x = 6" },
    { q: "Solve x/4 = 7.", steps: ["Multiply both sides by 4: x = 28."], a: "x = 28" },
    { q: "Solve x − 11 = 3.", steps: ["Add 11 to both sides: x = 14."], a: "x = 14" },
  ],
  30: [
    { q: "Solve 5x − 3 = 22.", steps: ["Add 3 to both sides: 5x = 25.", "Divide by 5: x = 5."], a: "x = 5" },
    { q: "Solve 2x + 7 = 19.", steps: ["Subtract 7: 2x = 12.", "Divide by 2: x = 6."], a: "x = 6" },
    { q: "Solve x/3 − 2 = 4.", steps: ["Add 2: x/3 = 6.", "Multiply by 3: x = 18."], a: "x = 18" },
  ],
  31: [
    { q: "Solve 3(x − 2) = x + 8.", steps: ["Distribute: 3x − 6 = x + 8.", "Subtract x: 2x − 6 = 8.", "Add 6: 2x = 14.", "Divide by 2: x = 7."], a: "x = 7" },
    { q: "Solve 4x + 5 = 2x + 13.", steps: ["Subtract 2x: 2x + 5 = 13.", "Subtract 5: 2x = 8.", "Divide by 2: x = 4."], a: "x = 4" },
    { q: "Solve 2(x + 1) − 3 = 9.", steps: ["Distribute: 2x + 2 − 3 = 9.", "Simplify: 2x − 1 = 9.", "Add 1: 2x = 10.", "Divide: x = 5."], a: "x = 5" },
  ],
  32: [
    { q: "Solve x + 4 < 10.", steps: ["Subtract 4 from both sides: x < 6."], a: "x < 6" },
    { q: "Solve −3x ≤ 12.", steps: ["Divide by −3, flip the sign: x ≥ −4."], a: "x ≥ −4" },
    { q: "Solve 2x − 1 > 5.", steps: ["Add 1: 2x > 6.", "Divide by 2: x > 3."], a: "x > 3" },
  ],
  33: [
    { q: "Solve x/5 = 8/10.", steps: ["Cross-multiply: 10x = 40.", "Divide by 10: x = 4."], a: "x = 4" },
    { q: "Solve 3/x = 9/12.", steps: ["Cross-multiply: 9x = 36.", "Divide by 9: x = 4."], a: "x = 4" },
    { q: "A map scale is 1 inch = 20 miles. How many miles is 3.5 inches?", steps: ["Set up proportion: 1/20 = 3.5/x.", "Cross-multiply: x = 20 × 3.5."], a: "70 miles" },
  ],
  34: [
    { q: "A $80 jacket drops to $60. Find the percent decrease.", steps: ["Change = 80−60 = 20.", "20 ÷ 80 = 0.25.", "0.25 × 100 = 25%."], a: "25% decrease" },
    { q: "A population grows from 200 to 250. Find the percent increase.", steps: ["Change = 50.", "50 ÷ 200 = 0.25 = 25%."], a: "25% increase" },
    { q: "A $30 shirt is now $45. Find the percent increase.", steps: ["Change = 15.", "15 ÷ 30 = 0.5 = 50%."], a: "50% increase" },
  ],
  35: [
    { q: "Find the simple interest on $1,000 at 5% for 2 years.", steps: ["I = P×r×t = 1000 × 0.05 × 2.", "1000×0.05=50, 50×2=100."], a: "$100" },
    { q: "Find the simple interest on $2,400 at 3% for 5 years.", steps: ["I = 2400 × 0.03 × 5.", "2400×0.03=72, 72×5=360."], a: "$360" },
    { q: "Find the total amount owed on a $500 loan at 6% for 1 year.", steps: ["Interest = 500×0.06×1=30.", "Total = 500 + 30."], a: "$530" },
  ],
  36: [
    { q: "Which quadrant is (4, −2) in?", steps: ["x positive (right), y negative (down).", "Right and down is Quadrant IV."], a: "Quadrant IV" },
    { q: "Which quadrant is (−6, −3) in?", steps: ["x negative (left), y negative (down).", "Left and down is Quadrant III."], a: "Quadrant III" },
    { q: "What are the coordinates of the origin?", steps: ["The origin is where both axes meet."], a: "(0, 0)" },
  ],
  37: [
    { q: "Describe the pattern: (1,3), (2,6), (3,9).", steps: ["Each y-value is 3 times the x-value."], a: "y = 3x" },
    { q: "Describe the pattern: (0,2), (1,3), (2,4).", steps: ["Each y-value is 2 more than the x-value."], a: "y = x + 2" },
    { q: "Describe the pattern: (1,1), (2,4), (3,9).", steps: ["Each y-value is the x-value squared."], a: "y = x²" },
  ],
  38: [
    { q: "Find the volume of a box 6 × 2 × 4.", steps: ["6×2=12.", "12×4=48."], a: "48 cubic units" },
    { q: "Find the volume of a cube with side 5.", steps: ["Volume = side³ = 5×5×5.", "5×5=25, 25×5=125."], a: "125 cubic units" },
    { q: "A box has volume 60 and base 6×5. Find its height.", steps: ["Base area = 6×5=30.", "Height = volume ÷ base area = 60÷30."], a: "2" },
  ],
  39: [
    { q: "Find the surface area of a rectangular prism 4×3×2.", steps: ["Faces: 2(4×3) + 2(4×2) + 2(3×2).", "2(12) + 2(8) + 2(6) = 24+16+12."], a: "52 square units" },
    { q: "Find the surface area of a cube with side 4.", steps: ["Each face: 4×4=16.", "6 faces: 6×16."], a: "96 square units" },
    { q: "Find the surface area of a cube with side 2.", steps: ["Each face: 2×2=4.", "6 faces: 6×4."], a: "24 square units" },
  ],
  40: [
    { q: "A right triangle has legs 6 and 8. Find the hypotenuse.", steps: ["6²+8²=36+64=100.", "√100=10."], a: "10" },
    { q: "A right triangle has legs 5 and 12. Find the hypotenuse.", steps: ["5²+12²=25+144=169.", "√169=13."], a: "13" },
    { q: "A right triangle has hypotenuse 10 and one leg 6. Find the other leg.", steps: ["6²+b²=10².", "36+b²=100 → b²=64.", "√64=8."], a: "8" },
  ],
  41: [
    { q: "Find the slope between (2,3) and (5,9).", steps: ["m=(9−3)/(5−2)=6/3."], a: "2" },
    { q: "Find the slope between (0,4) and (2,0).", steps: ["m=(0−4)/(2−0)=−4/2."], a: "−2" },
    { q: "Find the slope between (−1,2) and (3,10).", steps: ["m=(10−2)/(3−(−1))=8/4."], a: "2" },
  ],
  42: [
    { q: "A line has slope −3 and y-intercept 5. Write its equation.", steps: ["Plug into y=mx+b: m=−3, b=5."], a: "y = −3x + 5" },
    { q: "Find the slope and y-intercept of y = 4x − 7.", steps: ["Compare to y=mx+b: m=4, b=−7."], a: "slope 4, y-intercept −7" },
    { q: "A line has slope 1/2 and y-intercept −2. Write its equation.", steps: ["Plug in: m=1/2, b=−2."], a: "y = (1/2)x − 2" },
  ],
  43: [
    { q: "Describe how to graph y = 3x − 2.", steps: ["Start at y-intercept (0,−2).", "Slope 3 = 3/1: go up 3, right 1 to next point (1,1)."], a: "Line through (0,−2) and (1,1)" },
    { q: "Describe how to graph y = −x + 4.", steps: ["Start at y-intercept (0,4).", "Slope −1: go down 1, right 1 to (1,3)."], a: "Line through (0,4) and (1,3)" },
    { q: "Describe how to graph y = (2/3)x.", steps: ["Y-intercept is (0,0).", "Slope 2/3: go up 2, right 3 to (3,2)."], a: "Line through (0,0) and (3,2)" },
  ],
  44: [
    { q: "Write the equation of the line through (1,5) with slope 2.", steps: ["y−5=2(x−1).", "y−5=2x−2.", "y=2x+3."], a: "y = 2x + 3" },
    { q: "Write the equation of the line through (3,−2) with slope −1.", steps: ["y−(−2)=−1(x−3).", "y+2=−x+3.", "y=−x+1."], a: "y = −x + 1" },
    { q: "Write the equation of the line through (0,4) and (2,10).", steps: ["Slope = (10−4)/(2−0)=3.", "y-intercept is 4 (given the point (0,4))."], a: "y = 3x + 4" },
  ],
  45: [
    { q: "Solve: y = 2x and x + y = 9.", steps: ["Substitute: x + 2x = 9.", "3x=9 → x=3.", "y=2(3)=6."], a: "x = 3, y = 6" },
    { q: "Solve: y = x − 1 and 3x + y = 11.", steps: ["Substitute: 3x + (x−1) = 11.", "4x−1=11 → 4x=12 → x=3.", "y=3−1=2."], a: "x = 3, y = 2" },
    { q: "Solve: x = y + 4 and 2y + x = 10.", steps: ["Substitute: 2y + (y+4) = 10.", "3y+4=10 → 3y=6 → y=2.", "x=2+4=6."], a: "x = 6, y = 2" },
  ],
  46: [
    { q: "Solve: x + y = 8 and x − y = 2.", steps: ["Add the equations: 2x = 10 → x = 5.", "Plug in: 5 + y = 8 → y = 3."], a: "x = 5, y = 3" },
    { q: "Solve: 3x + y = 13 and x − y = 3.", steps: ["Add: 4x = 16 → x = 4.", "Plug in: 4 − y = 3 → y = 1."], a: "x = 4, y = 1" },
    { q: "Solve: 2x + y = 7 and 2x − y = 1.", steps: ["Add: 4x = 8 → x = 2.", "Plug in: 2(2)+y=7 → y=3."], a: "x = 2, y = 3" },
  ],
  47: [
    { q: "Lines y = 2x + 1 and y = 2x − 3 — how many solutions?", steps: ["Both have slope 2 (parallel).", "Different intercepts, so they never meet."], a: "No solution" },
    { q: "Lines y = x and y = 3x — where do they cross?", steps: ["Set equal: x = 3x → −2x = 0 → x = 0.", "y = 0."], a: "(0, 0)" },
    { q: "Lines y = x + 2 and y = x + 2 — how many solutions?", steps: ["Identical equations describe the same line.", "Every point on the line is a solution."], a: "Infinitely many solutions" },
  ],
  48: [
    { q: "Which side do you shade for y < x − 1?", steps: ["Test (0,0): is 0 < 0 − 1? 0 < −1 is false.", "Shade the side NOT containing (0,0)."], a: "Shade below the line" },
    { q: "Which side do you shade for y ≥ 2x?", steps: ["Test (0,1): is 1 ≥ 2(0)=0? True.", "Shade the side containing (0,1) — above the line."], a: "Shade above the line (solid boundary)" },
    { q: "Is the boundary line dashed or solid for y > x + 3?", steps: ["Strict inequality (> not ≥) means points on the line aren't included."], a: "Dashed" },
  ],
  49: [
    { q: "Is {(1,2), (2,2), (3,5)} a function?", steps: ["Each input (1, 2, 3) has exactly one output.", "Two inputs mapping to the same output (2) is fine — that's still a function."], a: "Yes — it's a function" },
    { q: "Does the graph of a circle pass the vertical line test?", steps: ["A vertical line through the middle crosses the circle twice."], a: "No — a circle is not a function" },
    { q: "Is {(1,3), (1,5)} a function?", steps: ["Input 1 maps to two different outputs (3 and 5)."], a: "No — not a function" },
  ],
  50: [
    { q: "If f(x) = 4x − 1, find f(2).", steps: ["Substitute: 4(2)−1.", "8−1."], a: "7" },
    { q: "If g(x) = x² + 3, find g(4).", steps: ["Substitute: 4²+3.", "16+3."], a: "19" },
    { q: "If f(x) = 2x + 7, find f(−3).", steps: ["Substitute: 2(−3)+7.", "−6+7."], a: "1" },
  ],
  51: [
    { q: "(4x² + 3x) + (2x² − x)", steps: ["Combine like terms: (4x²+2x²) + (3x−x).", "6x² + 2x."], a: "6x² + 2x" },
    { q: "(5x + 2) − (3x − 4)", steps: ["Distribute negative: 5x+2−3x+4.", "Combine: (5x−3x)+(2+4)."], a: "2x + 6" },
    { q: "(x² − 2x + 3) + (2x² + x − 1)", steps: ["Combine like terms: (x²+2x²)+(−2x+x)+(3−1)."], a: "3x² − x + 2" },
  ],
  52: [
    { q: "(x + 2)(x + 6)", steps: ["First: x·x=x².", "Outer: x·6=6x.", "Inner: 2·x=2x.", "Last: 2·6=12.", "Combine: x²+6x+2x+12."], a: "x² + 8x + 12" },
    { q: "(x − 3)(x + 5)", steps: ["First: x².", "Outer: 5x.", "Inner: −3x.", "Last: −15.", "Combine: x²+5x−3x−15."], a: "x² + 2x − 15" },
    { q: "(2x + 1)(x + 4)", steps: ["First: 2x².", "Outer: 8x.", "Inner: x.", "Last: 4.", "Combine: 2x²+8x+x+4."], a: "2x² + 9x + 4" },
  ],
  53: [
    { q: "Factor 8x² + 12x.", steps: ["GCF of 8x² and 12x is 4x.", "8x²÷4x=2x, 12x÷4x=3."], a: "4x(2x + 3)" },
    { q: "Factor 15x³ − 5x².", steps: ["GCF is 5x².", "15x³÷5x²=3x, 5x²÷5x²=1."], a: "5x²(3x − 1)" },
    { q: "Factor 6x + 9.", steps: ["GCF of 6 and 9 is 3.", "6x÷3=2x, 9÷3=3."], a: "3(2x + 3)" },
  ],
  54: [
    { q: "Factor x² + 9x + 20.", steps: ["Need two numbers multiplying to 20, adding to 9.", "4 and 5 work: 4×5=20, 4+5=9."], a: "(x + 4)(x + 5)" },
    { q: "Factor x² − 2x − 15.", steps: ["Need two numbers multiplying to −15, adding to −2.", "−5 and 3 work: −5×3=−15, −5+3=−2."], a: "(x − 5)(x + 3)" },
    { q: "Factor x² − 8x + 15.", steps: ["Need two numbers multiplying to 15, adding to −8.", "−3 and −5 work."], a: "(x − 3)(x − 5)" },
  ],
  55: [
    { q: "Factor x² − 25.", steps: ["x² and 25 are both perfect squares (x·x, 5·5).", "Apply the pattern: (x+5)(x−5)."], a: "(x + 5)(x − 5)" },
    { q: "Factor 4x² − 9.", steps: ["4x² = (2x)², 9 = 3².", "(2x+3)(2x−3)."], a: "(2x + 3)(2x − 3)" },
    { q: "Factor x² − 1.", steps: ["x² = x², 1 = 1².", "(x+1)(x−1)."], a: "(x + 1)(x − 1)" },
  ],
  56: [
    { q: "Solve x² − x − 6 = 0.", steps: ["Factor: (x−3)(x+2)=0.", "x−3=0 or x+2=0."], a: "x = 3 or x = −2" },
    { q: "Solve x² + 6x + 8 = 0.", steps: ["Factor: (x+2)(x+4)=0.", "x+2=0 or x+4=0."], a: "x = −2 or x = −4" },
    { q: "Solve x² − 9 = 0.", steps: ["Factor: (x+3)(x−3)=0.", "x+3=0 or x−3=0."], a: "x = −3 or x = 3" },
  ],
  57: [
    { q: "Solve x² + 3x − 4 = 0 using the quadratic formula.", steps: ["a=1,b=3,c=−4.", "Discriminant: 9+16=25.", "x=(−3±5)/2."], a: "x = 1 or x = −4" },
    { q: "Solve 2x² − 5x + 2 = 0 using the quadratic formula.", steps: ["a=2,b=−5,c=2.", "Discriminant: 25−16=9.", "x=(5±3)/4."], a: "x = 2 or x = 1/2" },
    { q: "Solve x² − 4x + 4 = 0 using the quadratic formula.", steps: ["a=1,b=−4,c=4.", "Discriminant: 16−16=0.", "x=(4±0)/2."], a: "x = 2 (one repeated solution)" },
  ],
  58: [
    { q: "Find the vertex x-coordinate of y = x² + 6x + 5.", steps: ["a=1,b=6.", "x=−6/(2·1)=−3."], a: "x = −3" },
    { q: "Does y = −2x² + x + 1 open up or down?", steps: ["a=−2, which is negative."], a: "Opens downward" },
    { q: "Find the vertex x-coordinate of y = 2x² − 8x + 3.", steps: ["a=2,b=−8.", "x=8/(2·2)=8/4."], a: "x = 2" },
  ],
  59: [
    { q: "Simplify x⁶ / x².", steps: ["Same base, subtract exponents: 6−2."], a: "x⁴" },
    { q: "Simplify (x³)⁴.", steps: ["Power to a power, multiply exponents: 3×4."], a: "x¹²" },
    { q: "Simplify x² · x⁷.", steps: ["Same base, add exponents: 2+7."], a: "x⁹" },
  ],
  60: [
    { q: "Simplify √72.", steps: ["72 = 36 × 2, and 36 is a perfect square.", "√72 = √36 · √2 = 6√2."], a: "6√2" },
    { q: "Simplify √32.", steps: ["32 = 16 × 2.", "√32 = √16 · √2 = 4√2."], a: "4√2" },
    { q: "Simplify √98.", steps: ["98 = 49 × 2.", "√98 = √49 · √2 = 7√2."], a: "7√2" },
  ],
};
