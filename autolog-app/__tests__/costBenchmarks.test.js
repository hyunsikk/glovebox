import { getBenchmark, compareToBenchmark, NATIONAL_AVERAGE, MAKE_BENCHMARKS } from '../lib/costBenchmarks';

describe('getBenchmark', () => {
  it('returns the national average when make is missing', () => {
    const b = getBenchmark(undefined);
    expect(b.avgAnnualMaintenance).toBe(NATIONAL_AVERAGE.avgAnnualMaintenance);
    expect(b.source).toBe('national average');
  });

  it('matches a known make exactly', () => {
    const b = getBenchmark('Toyota');
    expect(b.matched).toBe(true);
    expect(b.avgAnnualMaintenance).toBe(MAKE_BENCHMARKS.Toyota.avgAnnualMaintenance);
  });

  it('matches case-insensitively and trims whitespace', () => {
    const b = getBenchmark('  toyota ');
    expect(b.matched).toBe(true);
    expect(b.avgAnnualMaintenance).toBe(MAKE_BENCHMARKS.Toyota.avgAnnualMaintenance);
  });

  it('falls back to national average for an unknown make', () => {
    const b = getBenchmark('Wuxi Motors');
    expect(b.matched).toBe(false);
    expect(b.avgAnnualMaintenance).toBe(NATIONAL_AVERAGE.avgAnnualMaintenance);
  });
});

describe('compareToBenchmark', () => {
  const base = MAKE_BENCHMARKS.Toyota.avgAnnualMaintenance;

  it('labels well-below-benchmark spend as excellent', () => {
    const r = compareToBenchmark('Toyota', Math.round(base * 0.6));
    expect(r.verdict).toBe('excellent');
    expect(r.annualDelta).toBeLessThan(0);
  });

  it('labels on-benchmark spend as average', () => {
    expect(compareToBenchmark('Toyota', base).verdict).toBe('average');
  });

  it('labels far-above-benchmark spend as very high', () => {
    expect(compareToBenchmark('Toyota', Math.round(base * 1.4)).verdict).toBe('very high');
  });

  it('returns null mile deltas when cost-per-mile is not provided', () => {
    const r = compareToBenchmark('Toyota', base, null);
    expect(r.mileDelta).toBeNull();
    expect(r.milePct).toBeNull();
  });

  it('computes a positive mile delta when above benchmark per-mile', () => {
    const r = compareToBenchmark('Toyota', base, MAKE_BENCHMARKS.Toyota.avgCostPerMile + 0.05);
    expect(r.mileDelta).toBeCloseTo(0.05, 5);
    expect(r.milePct).toBeGreaterThan(0);
  });
});
