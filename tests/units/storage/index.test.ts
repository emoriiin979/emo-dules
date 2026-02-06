import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFileOperators } from '../../../src/modules/storage/index.js';
import { createFileOperators as nodeCFO } from '../../../src/modules/storage/concretes/node-storage.js';
import { createFileOperators as httpCFO } from '../../../src/modules/storage/concretes/http-storage.js';

// モック化
vi.mock('../../../src/modules/storage/concretes/node-storage.js', () => ({
    createFileOperators: vi.fn(),
}));

vi.mock('../../../src/modules/storage/concretes/http-storage.js', () => ({
    createFileOperators: vi.fn(),
}));

describe('createFileOperators', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('storageTypeがNodeの場合、Nodeファイルオペレータを作成すること', () => {
        const mockOptions = { baseDir: '/tmp' };
        const mockResult = { read: vi.fn(), write: vi.fn() };
        vi.mocked(nodeCFO).mockReturnValue(mockResult as any);

        const result = createFileOperators('Node', mockOptions);
        expect(nodeCFO).toHaveBeenCalledWith(mockOptions);
        expect(result).toBe(mockResult);
        expect(httpCFO).not.toHaveBeenCalled();
    });

    it('storageTypeがHttpの場合、Httpファイルオペレータを作成すること', () => {
        const mockOptions = { baseUrl: 'http://example.com' };
        const mockResult = { read: vi.fn(), write: vi.fn() };
        vi.mocked(httpCFO).mockReturnValue(mockResult as any);

        const result = createFileOperators('Http', mockOptions);
        expect(httpCFO).toHaveBeenCalledWith(mockOptions);
        expect(result).toBe(mockResult);
        expect(nodeCFO).not.toHaveBeenCalled();
    });
});
