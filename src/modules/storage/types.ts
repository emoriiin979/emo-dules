/**
 * ファイル操作オペレータ
 */
export type FileOperators = {
    readFile: (path: string) => Promise<string>;
    readLines: (path: string) => AsyncIterable<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    appendFile: (path: string, content: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
};
