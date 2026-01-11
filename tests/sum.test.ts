import { describe, it, expect } from 'vitest';
import { sum } from '../src/sum.js';

describe('sum', () => {
    it('正の足し算', () => {
        expect(sum(1, 2)).toBe(3);
    });
    it('負の足し算', () => {
        expect(sum(-1, -2)).toBe(-3);
    });
});
