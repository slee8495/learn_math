// Merges the per-unit review-quiz problem generators (one file per
// curriculum unit, split out so each stays a manageable size) into a
// single id -> generator lookup used by curriculum.js's quiz days.
import unit01 from "./unit01_coordinatePlaneSolids.js";
import unit02 from "./unit02_linearEquations.js";
import unit03 from "./unit03_polynomialsFactoring.js";
import unit04 from "./unit04_quadraticsExponentsRadicals.js";
import unit05 from "./unit05_geometry.js";
import unit06 from "./unit06_algebra2.js";
import unit07 from "./unit07_precalcFoundations.js";
import unit08 from "./unit08_precalcContinued.js";
import unit09 from "./unit09_calculus1.js";
import unit10 from "./unit10_calculus2College.js";

export const reviewGenerators = {
  ...unit01,
  ...unit02,
  ...unit03,
  ...unit04,
  ...unit05,
  ...unit06,
  ...unit07,
  ...unit08,
  ...unit09,
  ...unit10,
};
