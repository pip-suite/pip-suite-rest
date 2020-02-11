import { CacheParams, IDataCacheService, IDataCacheProvider } from './IDataCacheService';
import { IDataModelService } from '../data/IDataModelService';

class DataCache implements IDataCacheService {
    private CACHE_TIMEOUT = 10 * 60000; // 10 mins or make it configurable
    private _cache: any;
    private _timeout: number;

    public constructor(
        private $q: ng.IQService, 
        private pipDataModel: IDataModelService
    ) {
        "ngInject";

        this._cache = {};
    }

    // Converts a string value into a numeric hash code
    private hash(data: CacheParams): number {
        let filteredData: CacheParams = <CacheParams>{};

        // Filter only the generic parameters that can be relevant to the query
        if (data != null) {
            // filteredData.item = data.item;
            // filteredData.id = data.id;
            filteredData.filter = data.filter;
            filteredData.search = data.search;
            filteredData.start = data.start;
            filteredData.take = data.take;
            filteredData.skip = data.skip;
            // filteredData.status = data.status;
        }

        let serializedFilter = angular.toJson(filteredData);

        if (serializedFilter == null || serializedFilter.length === 0)
            return 0;

        let h: number = 0;
        for (let i = 0, len = serializedFilter.length; i < len; i++) {
            let chr = serializedFilter.charCodeAt(i);
            h = ((h << 5) - h) + chr;
            h |= 0; // Convert to 32bit integer
        }

        return h;
    }

    // Generates parameterized key
    private generateKey(resource: string, params?: CacheParams): string {
        let h: number = this.hash(params);
        return resource + (h != 0 ? '_' + h : '');
    };

    // Clear the cache, globally or selectively
    public clear(resource?: string): void {
        if (resource == null) {
            this._cache = {};
        } else {
            for (let key in this._cache) {
                if (key == resource || key.startsWith(resource + '_')) {
                    delete this._cache[key];
                }
            }
        }
    }

    // Try to retrieve collection from the cache
    public retrieve(resource: string, params?: CacheParams): any {
        if (resource == null) throw new Error('Resource cannot be null');
        if (resource == '') throw new Error('Resource cannot be empty');

        let key: string = this.generateKey(resource, params);
        let holder: any = this._cache[key];
        if (holder == null) return null;

        // If expired then cleanup and return null
        if (holder.expire && _.now() - holder.expire > this.CACHE_TIMEOUT) {
            delete this._cache[key];
            return null;
        }

        return holder.data;
    }

    // Store collection into the cache
    public store(resource: string, data: any, params?: CacheParams): void {
        if (resource == null) throw new Error('Resource cannot be null');
        if (resource == '') throw new Error('Resource cannot be empty');

        this._cache[this.generateKey(resource, params)] = {
            expire: _.now(),
            data: data
        };
    }

    // Store collection into the cache without expiration
    public storePermanently(resource: string, data: any, params?: CacheParams): void {
        if (resource == null) throw new Error('Resource cannot be null');
        if (resource == '') throw new Error('Resource cannot be empty');

        this._cache[this.generateKey(resource, params)] = {
            expire: null,
            data: data
        };
    }

    // Remove collection from the cache
    public remove(resource: string, params?: CacheParams): void {
        if (resource == null) throw new Error('Resource cannot be null');
        if (resource == '') throw new Error('Resource cannot be empty');

        delete this._cache[this.generateKey(resource, params)];
    };

    public updateOne(resource: string, item: any, params?: CacheParams): void {
        if (resource == null) throw new Error('Resource cannot be null');
        if (item == null) return;

        let data: any = this.retrieve(resource, params);

        if (data != null) {
            let isAdded = false;
            let size = data.length;
            for (let i = 0; i < size; i++) {
                if (data[i].id == item.id) {
                    data[i] = item;
                    isAdded = true;

                    return;
                }
            }
            if (!isAdded) data.push(item);
            this.store(resource, data, params);
        }
    }

    // Tries to retrieve collection from the cache, otherwise load it from server
    public retrieveOrLoad(params: CacheParams, successCallback?: (data: any) => void, errorCallback?: (err: any) => void): any {
        if (params == null) throw new Error('params cannot be null');

        let resource: string = params.resource; //(params.cache || params.resource);

        // Retrieve data from cache
        let filter: Function = params.filter;
        let force: boolean = !!params.force;
        let result: any = !force ? this.retrieve(resource, params) : null;
        let deferred: any = this.$q.defer();
        let method: string;
        if (!!params.paging) {
            method = 'page';
        } else {
            method = params.singleResult ? 'readOne' : 'read';
        }
        // Return result if it exists
        if (result) {
            if (filter) {
                if (result.data) {
                    result.data = filter(result.data);
                } else {
                    result = filter(result);
                }
            }
            if (_.isFunction(successCallback)) { successCallback(result); }
            deferred.resolve(result);

            return deferred.promise;
        }

        this.pipDataModel[method](
            params,
            (data: any) => {
                // Store data in cache and return
                params.updatedItem ?
                    this.updateOne(resource, data, params) :
                    this.store(resource, data, params);
                if (filter) data = filter(data);
                deferred.resolve(data);

                if (_.isFunction(successCallback)) { successCallback(data); }
            },
            (err: any) => {
                // Return error
                deferred.reject(err);
                if (_.isFunction(errorCallback)) errorCallback(err);
            }
        );

        // Return deferred object
        return deferred.promise;
    }

    public removeOne(resource: string, item: any): void {
        if (resource == null) throw new Error('Resource cannot be null');
        if (item == null) return;

        for (let key in this._cache) {
            if (key == resource || key.startsWith(resource + '_')) {
                let data: any = this._cache[key].data;
                if (angular.isArray(data)) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].id == item.id) {
                            data.splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }
    }

    // OBSOLETE - WILL BE REMOVED ONCE CODE IS REFACTORED
    public decorateAddCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function {
        return (item: any) => {
            if (!params || !params.notClearedCache) { this.clear(resource); }
            if (_.isFunction(successCallback)) { successCallback(item); }
        };
    }

    public decorateRemoveCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function {
        return (item: any) => {
            this.removeOne(resource, params);
            if (_.isFunction(successCallback)) { successCallback(item); }
        };
    }

    public decorateUpdateCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function {
        return (item: any) => {
            for (var key in this._cache) {
                if (key == resource || key.startsWith(resource + '_')) {
                    let data: any = this._cache[key].data;
                    if (angular.isArray(data)) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].id == item.id) {
                                data[i] = item;
                            }
                        }
                    }
                }
            }

            if (_.isFunction(successCallback)) { successCallback(item); }
        };
    }

    public setTimeout(newTimeout: number): number {
        if (newTimeout) {
            this.CACHE_TIMEOUT = newTimeout;
        }
        return this.CACHE_TIMEOUT;
    }
 
}

class DataCacheProvider implements IDataCacheProvider {
    private _service: DataCache;

    constructor() {
    }

    public $get($q: ng.IQService, pipDataModel: IDataModelService) {
        "ngInject";

        if (this._service == null) {
            this._service = new DataCache($q, pipDataModel);
        }
        return this._service;
    }
}

angular
    .module('pipDataCache', [])
    .provider('pipDataCache', DataCacheProvider);


