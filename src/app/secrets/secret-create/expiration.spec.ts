import {Time} from './expiration';


describe('Expiration', () => {
  describe('when converting time from string', () => {
    const testCases: [string, [number, number]][] = [
      ['00:10', [ 0, 10]],
      ['01:01', [ 1,  1]],
      ['02:04', [ 2,  4]],
      ['05:00', [ 5,  0]],
      ['07:52', [ 7, 52]],
      ['09:00', [ 9,  0]],
      ['11:43', [11, 43]],
      ['13:00', [ 1,  0]],
      ['17:00', [ 5,  0]],
      ['19:00', [ 7,  0]],
      ['20:32', [ 8, 32]],
      ['23:00', [11,  0]],
      ['24:19', [ 0, 19]],
    ];
    for (const [input, [expectedHour, expectedMinute]] of testCases) {
      const [actualHour, actualMinute] = Time.fromString(input);
      it(`${input} should return hour ${expectedHour}`, () => {
        expect(actualHour).toBe(expectedHour);
      });
      it(`${input} should return minute ${expectedMinute}`, () => {
        expect(actualMinute).toBe(expectedMinute);
      });
    }
  });
  describe('when converting time to string', () => {
    const testCases: [[number, number], string][] = [
      [[ 0, 10], '12:10'],
      [[ 1,  1], '01:01'],
      [[ 2,  4], '02:04'],
      [[ 5,  0], '05:00'],
      [[ 7, 52], '07:52'],
      [[ 9,  0], '09:00'],
      [[11, 43], '11:43'],
      [[13,  0], '13:00'],
      [[17,  0], '17:00'],
      [[19,  0], '19:00'],
      [[20, 32], '20:32'],
      [[23,  0], '23:00'],
      [[24, 19], '24:19'],
    ];
    for (const [[hour, minute], expected] of testCases) {
      const actual = Time.toString(hour, minute);
      it(`hour: ${hour} and minute: ${minute}  should return time ${expected}`, () => {
        expect(expected).toBe(actual);
      });
    }
  });
});
