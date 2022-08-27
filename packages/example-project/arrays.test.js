import _ from 'underscore';

describe('Arrays', () => {

    describe('first', () => {

        test('should get the first element if non empty', async () => {
            await new Promise(resolve => setTimeout(resolve, 500));

            expect(_.first([1, 2, 3, 4])).toBe(1);
        });

        test('should get undefined if empty', () => {
            expect(_.first([])).toBeUndefined();
        });

        test('should get undefined if null or undefined', () => {
            expect(_.first(null)).toBeUndefined();
            expect(_.first(undefined)).toBeUndefined();
        });
    });

    describe('last', () => {

        test('should get the last element if non empty', () => {
            expect(_.last([1, 2, 3, 4])).toBe(4);
        });

        test('should get undefined if empty', () => {
            expect(_.last([])).toBeUndefined();
        });

        test('should get undefined if null or undefined', () => {
            expect(_.last(null)).toBeUndefined();
            expect(_.last(undefined)).toBeUndefined();
        });
    });

    
    describe('without', () => {

        test('should return an array without the values', () => {
            expect(_.without([1, 2, 3, 4, 1 , 3, 2], 1, 2)).toEqual([3, 4, 3]);
        });

        test('should return a new array with same values if no value to remove', () => {
            expect(_.without([1, 2, 3, 4, 1 , 3, 2])).toEqual([1, 2, 3, 4, 1 , 3, 2]);
        });

        test('should return an new array with same values if value to remove does not exist', () => {
            expect(_.without([1, 2, 3, 4, 1 , 3, 2], 5, 6, 8)).toEqual([1, 2, 3, 4, 1 , 3, 2]);
        });

    });


    describe('chunk', () => {

        test('should make chunks if more element than the chunk size', () => {
            expect(_.chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
        });

        test('should not do chunks if not enough element to do a second chunk', () => {
            expect(_.chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
        });

        test('should work if no element in the initial array', () => {
            expect(_.chunk([], 2)).toEqual([]);
        });

    });

});
