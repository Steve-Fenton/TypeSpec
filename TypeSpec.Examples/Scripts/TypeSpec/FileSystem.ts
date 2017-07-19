import {ITestReporter} from './Keyword';

declare var require: any;

export interface FileReaderCallback {
    (responseText: string): void;
}

export abstract class FileReader {
    static getInstance(testReporter: ITestReporter) : FileReader {
        if (typeof window !== 'undefined') {
            return new BrowserFileReader(testReporter);
        }

        return new NodeFileReader(testReporter);
    }

    abstract getFile(url: string, successCallback: FileReaderCallback) : void;
}

export class BrowserFileReader extends FileReader {
    constructor(private testReporter: ITestReporter) {
        super();
    }

    getFile(url: string, successCallback: FileReaderCallback) {
        const cacheBust = '?cb=' + new Date().getTime();
        const client = new XMLHttpRequest();
        client.open('GET', url + cacheBust);
        client.onreadystatechange = () => {
            if (client.readyState === 4) {
                if (client.status === 200) {
                    successCallback(client.responseText);
                } else {
                    this.testReporter.error('getFile', url, new Error('Error loading specification: ' + client.statusText + ' (' + client.status + ').'));
                }
            }
        }
        client.send();
    }
}

export class NodeFileReader extends FileReader {
    constructor(private testReporter: ITestReporter) {
        super();
    }

    getFile(url: string, successCallback: FileReaderCallback) {
        let fs: any = require('fs');
        let path: any = require('path');

        // Make the path relative in Node's terms and resolve it
        const resolvedUrl = path.resolve('.' + url);

        fs.readFile(resolvedUrl, 'utf8', (err: any, data: string) => {
            if (err) {
                this.testReporter.error('getNodeFile', url, new Error('Error loading specification: ' + err + ').'));
            }
            successCallback(data);
        });
    }
}
