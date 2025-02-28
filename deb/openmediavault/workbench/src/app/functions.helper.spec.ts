import * as _ from 'lodash';

import {
  binaryUnit,
  decodeURIComponentDeep,
  encodeURIComponentDeep,
  format,
  formatDeep,
  isFormatable,
  isUUID,
  notAvailable,
  toBoolean,
  toBytes
} from '~/app/functions.helper';

describe('functions.helper', () => {
  it('should decode object [1]', () => {
    const result = decodeURIComponentDeep({
      foo: encodeURIComponent('/dev/sda'),
      bar: { xyz: encodeURIComponent('/dev/vdb'), abc: 1 }
    });
    expect(_.get(result, 'foo')).toBe('/dev/sda');
    expect(_.get(result, 'bar.xyz')).toBe('/dev/vdb');
    expect(_.get(result, 'bar.abc')).toBe(1);
  });

  it('should decode object [2]', () => {
    expect(decodeURIComponentDeep(undefined)).toBeUndefined();
  });

  it('should encode object [1]', () => {
    const result = encodeURIComponentDeep({ foo: '/dev/sda', bar: { xyz: '/dev/vdb', abc: 1 } });
    expect(result.foo).toBe(encodeURIComponent('/dev/sda'));
    expect(result.bar.xyz).toBe(encodeURIComponent('/dev/vdb'));
    expect(result.bar.abc).toBe(1);
  });

  it('should encode object [2]', () => {
    expect(encodeURIComponentDeep(undefined)).toBeUndefined();
  });

  it('should check if value is formatable', () => {
    expect(isFormatable('foo')).toBeTruthy();
    expect(isFormatable({ foo: 'bar', xyz: 3 })).toBeTruthy();
    expect(isFormatable(['foo', 2])).toBeTruthy();
    expect(isFormatable(undefined)).toBeFalsy();
    expect(isFormatable(null)).toBeFalsy();
    expect(isFormatable(4)).toBeFalsy();
  });

  it('should format string [1]', () => {
    const data = { foo: { bar: 'xyz' }, baz: 2, qux: ['a', 'b'], xyz: [{ x: 1 }, { x: 2 }] };
    expect(format('aaa {{ foo.bar }} bbb', data)).toBe('aaa xyz bbb');
    expect(format('aaa {{ baz }}', data)).toBe('aaa 2');
    expect(format('{{ qux[1] }}', data)).toBe('b');
    expect(format('{{ xyz }}', {})).toBe('');
    expect(format('{{ foo.bar | substr(1) }}', data)).toBe('yz');
    expect(format('{{ foo.bar | substr(1,1) }}', data)).toBe('y');
    expect(format('{{ xyz[1].x }}', data)).toBe('2');
    expect(format('{{ qux | string }}', data)).toBe('a,b');
  });

  it('should format string [2]', () => {
    const data = { foo: 4, bar: 4.1234, baz: -1, qux: 'abc' };
    expect(format('{{ foo | tofixed(2) }}', data)).toBe('4.00');
    expect(format('{{ bar | tofixed(3) }}', data)).toBe('4.123');
    expect(format('{{ bar | tofixed(0) }}', data)).toBe('4');
    expect(format('{{ qux | tofixed(1) }}', data)).toBe('NaN');
    expect(format('{{ baz | min(0) }}', data)).toBe('-1');
    expect(format('{{ foo | min(10) }}', data)).toBe('4');
    expect(format('{{ baz | max(0) }}', data)).toBe('0');
    expect(format('{{ foo | max(10) }}', data)).toBe('10');
  });

  it('should format string [3]', () => {
    expect(_.isString(format('{{ moment("H:mm:ss") }}', {}))).toBeTruthy();
    expect(format('{{ "17:29:59" | split(":") }}', {})).toBe('17,29,59');
    expect(format('{{ items | get(0) }}', { items: ['17', '29', '59'] })).toBe('17');
    expect(format('{{ items | get(2) }}', { items: ['17', '29', '59'] })).toBe('59');
    expect(format('{{ devicefile | encodeuricomponent }}', { devicefile: '/dev/sda' })).toBe(
      '%2Fdev%2Fsda'
    );
  });

  it('should format string [4]', () => {
    const data = { status: 'BAD_STATUS' };
    expect(
      format(
        '{% set desc = { "GOOD": "Good", "BAD_STATUS": "Unknown" } %}{{ desc[status] | translate }}',
        data
      )
    ).toBe('Unknown');
  });

  it('should format string [5]', () => {
    const data = {
      port: 1234,
      location: {
        protocol: 'http:',
        hostname: 'foo'
      }
    };
    expect(
      format(
        '/externalRedirect/{{ [location | get("protocol"), "//", location | get("hostname"), ":", port] | join | encodeuricomponent }}',
        data
      )
    ).toBe('/externalRedirect/http%3A%2F%2Ffoo%3A1234');
  });

  it('should format deep [1]', () => {
    const data = { foo: { bar: 'xyz' } };
    expect(formatDeep('My name is {{ foo.bar }}', data)).toEqual('My name is xyz');
  });

  it('should format deep [2]', () => {
    const data = { foo: { bar: 'xyz' }, baz: 2, qux: ['a', 'b'] };
    expect(formatDeep(['aaa {{ foo.bar }}'], data)).toEqual(['aaa xyz']);
    expect(formatDeep({ x: 'aaa {{ baz }}', y: { z: ['{{ qux[0] }}'] } }, data)).toEqual({
      x: 'aaa 2',
      y: { z: ['a'] }
    });
  });

  it('should be UUIDv4', () => {
    expect(isUUID('b3d2d83e-1aa7-11ea-a5e4-4b0fbf15b696')).toBeTruthy();
  });

  it('should be no UUIDv4 [1]', () => {
    expect(isUUID('')).toBeFalsy();
  });

  it('should be no UUIDv4 [2]', () => {
    expect(isUUID('foo')).toBeFalsy();
  });

  it('should be no UUIDv4 [3]', () => {
    expect(isUUID(2)).toBeFalsy();
  });

  it('should be no UUIDv4 [4]', () => {
    expect(isUUID(undefined)).toBeFalsy();
  });

  it('should be true [1]', () => {
    expect(toBoolean(true)).toBe(true);
  });

  it('should be true [2]', () => {
    expect(toBoolean(1)).toBe(true);
  });

  it('should be true [3]', () => {
    expect(toBoolean('y')).toBe(true);
  });

  it('should be true [4]', () => {
    expect(toBoolean('yes')).toBe(true);
  });

  it('should be true [5]', () => {
    expect(toBoolean('t')).toBe(true);
  });

  it('should be true [6]', () => {
    expect(toBoolean('true')).toBe(true);
  });

  it('should be true [7]', () => {
    expect(toBoolean('on')).toBe(true);
  });

  it('should be true [8]', () => {
    expect(toBoolean('1')).toBe(true);
  });

  it('should be false [1]', () => {
    expect(toBoolean('n')).toBe(false);
  });

  it('should be false [2]', () => {
    expect(toBoolean(false)).toBe(false);
  });

  it('should be false [3]', () => {
    expect(toBoolean('foo')).toBe(false);
  });

  it('should be false [4]', () => {
    expect(toBoolean(4711)).toBe(false);
  });

  it('should convert binary unit [1]', () => {
    expect(binaryUnit(2097152)).toBe('2.00 MiB');
  });

  it('should convert binary unit [2]', () => {
    expect(binaryUnit(-1)).toBe('');
  });

  it('should convert binary unit [3]', () => {
    expect(binaryUnit('')).toBe('');
  });

  it('should convert binary unit [4]', () => {
    expect(binaryUnit('2048')).toBe('2.00 KiB');
  });

  it('should convert binary unit [5]', () => {
    expect(binaryUnit('0')).toBe('0.00 B');
  });

  it('should convert binary unit [6]', () => {
    expect(binaryUnit(0.0, 0)).toBe('0 B');
  });

  it('should convert value to bytes [1]', () => {
    expect(toBytes(512)).toBe(512);
  });

  it('should convert value to bytes [2]', () => {
    expect(toBytes('1 KiB')).toBe(1024);
  });

  it('should convert value to bytes [3]', () => {
    expect(toBytes('1M')).toBe(1048576);
  });

  it('should be not available [1]', () => {
    expect(notAvailable('')).toBe('n/a');
  });

  it('should be not available [2]', () => {
    expect(notAvailable(null)).toBe('n/a');
  });

  it('should be not available [3]', () => {
    expect(notAvailable(undefined)).toBe('n/a');
  });

  it('should be not available [4]', () => {
    expect(notAvailable(NaN, '-')).toBe('-');
  });

  it('should be not available [5]', () => {
    expect(notAvailable('foo')).toBe('foo');
  });

  it('should be not available [6]', () => {
    expect(notAvailable(10)).toBe(10);
  });
});
