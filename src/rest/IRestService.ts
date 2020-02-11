export interface IRestService {
    serverUrl: string;
    lockServerUrl: boolean;

    setHeaders(headers: any);
    getResource(name: string): any;
}

export interface IRestProvider {
    serverUrl: string;
    lockServerUrl: boolean;

    setHeaders(headers: any);

    registerResource(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerOperation(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerPagedCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerPartyCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
}
