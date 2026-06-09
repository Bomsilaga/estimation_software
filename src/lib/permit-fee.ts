/**
 * VIC Building Permit Levy — Building Regulations 2018, Schedule 3
 * Also calculates CoINVEST LSL Levy and standard insurance allowance
 */

export function calcVicPermitFee(constructionCost: number): number {
  if (constructionCost <= 0) return 0;
  if (constructionCost <= 10_000) return 109.60;
  if (constructionCost <= 100_000) return 109.60 + 0.013 * (constructionCost - 10_000);
  if (constructionCost <= 250_000) return 1_279.60 + 0.011 * (constructionCost - 100_000);
  if (constructionCost <= 500_000) return 2_929.60 + 0.009 * (constructionCost - 250_000);
  if (constructionCost <= 1_000_000) return 5_179.60 + 0.007 * (constructionCost - 500_000);
  return 8_679.60 + 0.005 * (constructionCost - 1_000_000);
}

/** CoINVEST Portable Long Service Leave Levy — 0.35% of construction cost */
export function calcLslLevy(constructionCost: number): number {
  return constructionCost * 0.0035;
}

/** Contract Works Insurance — typical 0.20% of insured value */
export function calcContractWorksInsurance(constructionCost: number): number {
  return constructionCost * 0.002;
}

/** Private Building Surveyor fee estimate (tiered) */
export function calcPbsFee(constructionCost: number): number {
  if (constructionCost <= 200_000) return 3_500;
  if (constructionCost <= 500_000) return 4_500;
  if (constructionCost <= 1_000_000) return 6_500;
  if (constructionCost <= 2_000_000) return 9_500;
  return 12_500;
}

/** VIC WorkSafe DBI Insurance Levy — 1.272% of labour component (~40% of cost) */
export function calcWorksafeDbi(constructionCost: number): number {
  const labourComponent = constructionCost * 0.4;
  return labourComponent * 0.01272;
}
