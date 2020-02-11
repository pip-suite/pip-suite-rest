export class CacheParams {
    force?: boolean;
    resource?: string;
    // cache?: string; cache || resource
    filter?: Function;
    singleResult?: boolean;
    // party_id: string;
    // item?: any;
    // id?: string;
    search?: string;
    start?: any;
    take?: number;
    skip?: number;
    // status?: string;
    notClearedCache?: boolean;
    paging?: boolean;
    updatedItem?: any;
}

export interface IDataCacheService {
    setTimeout(newTimeout: number): number;

    store(resource: string, data: any, params?: CacheParams): void;
    storePermanently(resource: string, data: any, params?: CacheParams): void;
    retrieve(resource: string, params?: CacheParams): any;
    retrieveOrLoad(params: CacheParams, successCallback?: (data: any) => void, errorCallback?: (err: any) => void): any;
    updateOne(resource: string, item: any, params?: CacheParams): void;
    remove(resource: string, params?: CacheParams): void;
    removeOne(resource: string, item: any): void;
    clear(resource?: string): void;

    decorateAddCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function;
    decorateUpdateCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function;
    decorateRemoveCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function;
}

export interface IDataCacheProvider extends ng.IServiceProvider {}