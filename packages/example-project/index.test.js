import { add, substract } from './index';

test('outside test', () => {
    expect(true).toBe(true);
});

describe('maths', () => {
    test('sum should work', async () => {
        expect(add(1, 2)).toBe(3);
    });

    test('substract should work', () => {
        expect(substract(3, 2)).toBe(1);
    });

    describe('inside', () => {
        test('test inside', () => {
            expect(true).toBe(true);
        });
    });
});
