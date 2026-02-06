import { describe, it, expect } from 'vitest';
import { addUrlParams, mergeUrl } from '../../src/modules/url.js';

describe('mergeUrl', () => {
    it.each([
        {
            url: 'https://example.com/',
            path: 'users',
            expected: 'https://example.com/users',
        },
        {
            url: 'https://example.com/',
            path: '/users',
            expected: 'https://example.com/users',
        },
        {
            url: 'https://example.com',
            path: 'users',
            expected: 'https://example.com/users',
        },
        {
            url: 'https://example.com',
            path: '/users',
            expected: 'https://example.com/users',
        },
    ])('文字列のベース URL にマージする', ({ url, path, expected }) => {
        const result = mergeUrl(url, path);
        expect(result.toString()).toBe(expected);
    });
});

describe('addUrlParams', () => {
    it.each([
        {
            url: 'https://example.com',
            params: { key: 'value' },
            expected: 'https://example.com/?key=value',
        },
        {
            url: 'https://example.com',
            params: { key: 'value', key2: 'value2' },
            expected: 'https://example.com/?key=value&key2=value2',
        },
        {
            url: 'https://example.com',
            params: { key: ['value', 'value2'] },
            expected: 'https://example.com/?key=value&key=value2',
        },
        {
            url: 'https://example.com',
            params: { key: { key2: 'value2' } },
            expected: 'https://example.com/?key=%7B%22key2%22%3A%22value2%22%7D',
        },
        {
            url: 'https://example.com',
            params: { key: undefined },
            expected: 'https://example.com/',
        },
        {
            url: 'https://example.com',
            params: { key: null },
            expected: 'https://example.com/',
        },
    ])('URL にパラメータを追加する', ({ url, params, expected }) => {
        const result = addUrlParams(url, params);
        expect(result.toString()).toBe(expected);
    });
});
