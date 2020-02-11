export interface IDataModelService {
    execute(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    create(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    update(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    delete(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    read(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    readOne(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    page(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    uploadFiles(params: any, successCallback?: () => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;


    save(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    remove(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    query(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    get(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;

    readPage(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;
    
    queryPage(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}>;
}

export interface IDataModelProvider extends ng.IServiceProvider { }
