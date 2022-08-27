import _ from 'underscore';
import { jest } from '@jest/globals';

describe('Collections', () => {

    describe('each', () => {

        test('should be able to iterate on array', () => {
            const iteratee = jest.fn();
            const myArray = [1, 2, 3];

            _.each(myArray, iteratee);

            expect(iteratee).toHaveBeenCalledWith(1, 0, myArray);
            expect(iteratee).toHaveBeenCalledWith(2, 1, myArray);
            expect(iteratee).toHaveBeenCalledWith(3, 2, myArray);
            expect(iteratee).toHaveBeenCalledTimes(3);
        });

        test('should not iterate if no elements in array', () => {
            const iteratee = jest.fn();

            _.each([], iteratee);

            expect(iteratee).not.toHaveBeenCalled();
        });

        test('should be able to iterate on array', () => {
            const iteratee = jest.fn();
            const myObject = { firstName: 'Bob', lastName: 'TheSponge' };

            _.each(myObject, iteratee);

            expect(iteratee).toHaveBeenCalledWith('Bob', 'firstName', myObject);
            expect(iteratee).toHaveBeenCalledWith('TheSponge', 'lastName', myObject);
            expect(iteratee).toHaveBeenCalledTimes(2);
        });

        test('should not iterate if no elements in object', () => {
            const iteratee = jest.fn();

            _.each({}, iteratee);

            expect(iteratee).not.toHaveBeenCalled();
        });

    });

    describe('map', () => {

        test('should be able to iterate on array', () => {
            const iteratee = jest.fn(value => value + 1);
            const myArray = [1, 2, 3];

            const transformedArray = _.map(myArray, iteratee);

            expect(iteratee).toHaveBeenCalledWith(1, 0, myArray);
            expect(iteratee).toHaveBeenCalledWith(2, 1, myArray);
            expect(iteratee).toHaveBeenCalledWith(3, 2, myArray);
            expect(iteratee).toHaveBeenCalledTimes(3);
            expect(transformedArray).toEqual([2, 3, 4])
        });

        test('should not iterate if no elements in array', () => {
            const iteratee = jest.fn(value => value + 1);

            _.map([], iteratee);

            expect(iteratee).not.toHaveBeenCalled();
        });

        test('should be able to iterate on array', () => {
            const iteratee = jest.fn(value => `${value} <3`);
            const myObject = { firstName: 'Bob', lastName: 'TheSponge' };

            const transformedObject = _.map(myObject, iteratee);

            expect(iteratee).toHaveBeenCalledWith('Bob', 'firstName', myObject);
            expect(iteratee).toHaveBeenCalledWith('TheSponge', 'lastName', myObject);
            expect(iteratee).toHaveBeenCalledTimes(2);
            expect(transformedObject).toEqual(['Bob <3', 'TheSponge <3']);
        });

        test('should not iterate if no elements in object', () => {
            const iteratee = jest.fn();

            _.map({}, iteratee);

            expect(iteratee).not.toHaveBeenCalled();
        });

    });

    describe('every', () => {

        test('should return false if the predicate return false', () => {
            const isGreaterThanTen = jest.fn(value => value > 10);

            expect(_.every([11, 45, 2, 93], isGreaterThanTen)).toBe(false);
            expect(isGreaterThanTen).toHaveBeenCalledTimes(3);
        });

        test('should return true if the predicate return true', () => {
            const isGreaterThanTen = jest.fn(value => value > 10);

            expect(_.every([11, 45, 21, 93], isGreaterThanTen)).toBe(true);
            expect(isGreaterThanTen).toHaveBeenCalledTimes(4);
        });
    });

    describe('reduce', () => {

        test('should do the sum if no init accumulator', () => {
            expect(_.reduce([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, value) => acc + value)).toBe(55);
        });

        test('should do the sum if there is an init accumulator', () => {
            expect(_.reduce([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, value) => acc + value, 0)).toBe(55);
        });

    });

});
