declare module pip.rest {

export const UnauthorizedRedirect: string;
export const AccessDenyRedirect: string;




export interface IAuthState extends angular.ui.IState {
    auth?: boolean;
    authenticate?: any;
}
export class AuthStateConfig {
    signinState: string;
    signoutState: string;
    authorizedState: string;
    unauthorizedState: string;
}
export interface IAuthStateService extends ng.ui.IStateService {
    signinState(value?: string): string;
    signoutState(value?: string): string;
    authorizedState(value?: string): string;
    unauthorizedState(value?: string): string;
    redirect(event: ng.IAngularEvent, toState: IAuthState, toParams: any, $rootScope: ng.IRootScopeService): any;
    state(stateName: string, stateConfig: IAuthState): any;
    goToSignin(params: any): void;
    goToSignout(params: any): void;
    goToAuthorized(params: any): void;
    goToUnauthorized(params: any): void;
}
export interface IAuthStateProvider extends ng.IServiceProvider {
    redirect(fromState: string, toState: string): any;
    signinState: string;
    signoutState: string;
    authorizedState: string;
    unauthorizedState: string;
}



export interface IDataModelService {
    execute(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    create(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    update(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    delete(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    read(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    readOne(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    page(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    uploadFiles(params: any, successCallback?: () => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    save(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    remove(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    query(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    get(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    readPage(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    queryPage(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
}
export interface IDataModelProvider extends ng.IServiceProvider {
}



export class CacheParams {
    force?: boolean;
    resource?: string;
    filter?: Function;
    singleResult?: boolean;
    search?: string;
    start?: any;
    take?: number;
    skip?: number;
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
export interface IDataCacheProvider extends ng.IServiceProvider {
}



export interface IRestService {
    serverUrl: string;
    lockServerUrl: boolean;
    setHeaders(headers: any): any;
    getResource(name: string): any;
}
export interface IRestProvider {
    serverUrl: string;
    lockServerUrl: boolean;
    setHeaders(headers: any): any;
    registerResource(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerOperation(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerPagedCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerPartyCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
}


}
