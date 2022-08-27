import _ from 'underscore';

describe('Objects', () => {

    describe('keys', () => {

        test('should return the keys', () => {
            expect(_.keys({ firstName: 'Bob', lastName: 'TheSponge' })).toEqual(['firstName', 'lastName']);
        });

        test('should return an empty array if no entries', () => {
            expect(_.keys({})).toEqual([]);
        });

        test('should return an empty array if undefined or null', () => {
            expect(_.keys(undefined)).toEqual([]);
            expect(_.keys(null)).toEqual([]);
        });

    });

    describe('values', () => {

        test('should return the values', () => {
            expect(_.values({ firstName: 'Bob', lastName: 'TheSponge' })).toEqual(['Bob', 'TheSponge']);
        });

        test('should return an empty array if no entries', () => {
            expect(_.values({})).toEqual([]);
        });

        test('should return an empty array if undefined or null', () => {
            expect(_.values(undefined)).toEqual([]);
            expect(_.values(null)).toEqual([]);
        });

    });

    describe('isArray', () => {

        test('should return true if array', () => {
            expect(_.isArray([])).toBe(true);
            expect(_.isArray([1, 2, 3])).toBe(true);
        });

        test('should return false if not an array', () => {
            expect(_.isArray({})).toBe(false);
            expect(_.isArray(null)).toBe(false);
            expect(_.isArray(undefined)).toBe(false);
            expect(_.isArray(1)).toBe(false);
            expect(_.isArray('Bob TheSponge')).toBe(false);
            expect(_.isArray(() => {})).toBe(false);
        });

    });

    describe('isObject', () => {

        test('should return true if object', () => {
            expect(_.isObject({})).toBe(true);
            expect(_.isObject({ firstName: 'Bob', lastName: 'TheSponge' })).toBe(true);
        });

        test('should return true if an array', () => {
            expect(_.isObject([])).toBe(true);
            expect(_.isObject([1, 2, 3])).toBe(true);
        });

        test('should reutrn true if a function', () => {
            expect(_.isObject(() => {})).toBe(true);
        });

        test('should return false if not an object', () => {
            expect(_.isObject(null)).toBe(false);
            expect(_.isObject(undefined)).toBe(false);
            expect(_.isObject(1)).toBe(false);
            expect(_.isObject('Bob TheSponge')).toBe(false);
        });

    });

});
