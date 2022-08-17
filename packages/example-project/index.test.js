/**
 * @jest-environment redis-timing-tracker/src/CustomTimingNodeEnvironment
 */
import { add, substract } from './index';

describe('maths', () => {
    test('sum should work', async () => {
        expect(add(1, 2)).toBe(3);
    });
    
    test('substract should work', () => {
        expect(substract(3, 2)).toBe(1);
    });
});
