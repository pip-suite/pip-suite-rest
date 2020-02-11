import { IDataModelService, IDataModelProvider } from './IDataModelService';
import { IRestService } from '../rest/IRestService'

declare var async: any;

// Todo: Shall it be just an abstract class?
// Todo: Use generics to make it type-safe
class DataModel implements IDataModelService {
    public save;
    public remove;
    public query;
    public get;
    public readPage;
    public queryPage;

    constructor(
        private $stateParams: angular.ui.IStateParamsService,
        private pipRest: IRestService
    ) {
        "ngInject";
        
        this.save = this.update;
        this.remove = this.delete;
        this.query = this.read;
        this.get = this.readOne;
        this.readPage = this.page;
        this.queryPage = this.page;
    }

    // Execute request to REST API
    public execute(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        let t = params.transaction, tid;

        if (t && !params.skipTransactionBegin) {
            tid = params.transactionId = t.begin(
                params.transactionOperation || 'PROCESSING'
            );
            if (!tid) return;
        }

        // return this.pipRest.resources[params.resource]()[params.operation](
        return this.pipRest.getResource(params.resource)[params.operation](
            params.item,
            (result: any) => {
                if (t && tid && t.aborted(tid)) return;
                if (t && !params.skipTransactionEnd) t.end();
                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (t) t.end(error);
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Create an object and add it to object collection
    public create(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'save';

        return this.execute(
            params,
            (result: any) => {
                if (params.itemCollection)
                    params.itemCollection.push(result);

                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Update an object and replace it in object collection
    public update(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'update';

        return this.execute(
            params,
            (result: any) => {
                if (params.itemCollection)
                    var index = _.findIndex(params.itemCollection, function (item: any) {
                        return item.id == result.id;
                    });
                if (index > -1) {
                    params.itemCollection[index] = result;
                }

                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Update an object and remove it from object collection
    public delete(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'remove';

        return this.execute(
            params,
            (result: any) => {
                if (params.itemCollection)
                    _.remove(params.itemCollection, { id: result.id || (params.object || {}).id || (params.item || {}).id });

                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Read a collection of objects
    public read(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'query';

        return this.execute(
            params,
            (result: any) => {
                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Read a single object and add it into collection
    public readOne(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'page';

        return this.execute(
            params,
            (result: any) => {
                if (params.itemCollection && result) {
                    var index = _.findIndex(params.itemCollection, { id: result.id });
                    if (index >= 0) params.itemCollection[index] = result;
                    else params.itemCollection.push(result);
                }

                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Read a page and add results into object collection
    public page(params: any, successCallback?: (result: any) => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'page';

        return this.execute(
            params,
            (result: any) => {
                if (params.itemCollection && result.data) {
                    for (var i = 0; i < result.data.length; i++)
                        params.itemCollection.push(result.data[i]);
                }

                if (successCallback) successCallback(result);
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }

    // Save picture and document files
    public uploadFiles(params: any, successCallback?: () => void,
        errorCallback?: (error: any) => void): ng.IPromise<{}> {

        var t = params.transaction, tid;

        // Start transaction if necessary
        if (t && !params.skipTransactionBegin) {
            tid = params.transactionId = t.begin(
                params.transactionOperation || 'SAVING'
            );
            if (!tid) return;
        }

        var uploadFiles = [{
            pictures: params.pictures,
            documents: params.documents
        }];

        // from content
        if (params.item && params.item.content) {
            var saveResult = true;
            async.eachSeries(_.union(params.item.content, uploadFiles),
                (obj, callback) => {
                    // не выбран - пропускаем этот item  || нет этого события action
                    if (!obj.pictures && !obj.documents) {
                        callback();
                    } else {
                        if (obj.pictures) {
                            // Save pictures first
                            obj.pictures.save(
                                () => {
                                    if (t && tid && t.aborted(tid)) {
                                        saveResult = false;
                                        callback('aborted');
                                    }
                                    // Save documents second
                                    if (obj.documents) {
                                        obj.documents.save(
                                            () => {
                                                if (t && tid && t.aborted(tid)) {
                                                    saveResult = false;
                                                    callback('aborted');
                                                }
                                                callback();
                                            },
                                            (error: any) => {
                                                saveResult = false;
                                                callback(error);
                                            }
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                                (error: any) => {
                                    saveResult = false;
                                    callback(error);
                                }
                            );
                        } else {
                            if (obj.documents) {
                                // Save documents first
                                obj.documents.save(
                                    () => {
                                        if (t && tid && t.aborted(tid)) {
                                            saveResult = false;
                                            callback('aborted');
                                        }
                                        callback();
                                    },
                                    (error: any) => {
                                        saveResult = false;
                                        callback(error);
                                    }
                                );
                            }
                        }
                    }
                },
                (error: any) => {
                    if (!error && saveResult) {
                        // удаляем ненужные объекты перед сохранением
                        // вызываем колбек
                        if (t && !params.skipTransactionEnd) t.end();
                        _.each(params.item.content, function (item) {
                            delete item.pictures;
                            delete item.documents;
                        });
                        if (successCallback) successCallback();
                    } else {
                        // вызываем ошибочный колбек
                        if (t) t.end(error);
                        if (errorCallback) {
                            errorCallback(error);
                        }
                    }
                }
            );
        } else {
            if (params.pictures) {
                // Save pictures first
                params.pictures.save(
                    () => {
                        if (t && tid && t.aborted(tid)) return;

                        // Save documents second
                        if (params.documents) {
                            params.documents.save(
                                () => {
                                    if (t && tid && t.aborted(tid)) return;
                                    // Do everything else
                                    if (t && !params.skipTransactionEnd) t.end();
                                    if (successCallback) successCallback();
                                },
                                (error: any) => {
                                    if (t) t.end(error);
                                    if (errorCallback) errorCallback(error);
                                }
                            );
                        } else {
                            // Do everything else
                            if (t && !params.skipTransactionEnd) t.end();
                            if (successCallback) successCallback();
                        }
                    },
                    (error: any) => {
                        if (t) t.end(error);
                        if (errorCallback) errorCallback(error);
                    }
                );
            } else if (params.documents) {
                // Save documents first
                params.documents.save(
                    () => {
                        if (t && tid && t.aborted(tid)) return;
                        // Do everything else
                        if (t && !params.skipTransactionEnd) t.end();
                        if (successCallback) successCallback();
                    },
                    (error: any) => {
                        if (t) t.end(error);
                        if (errorCallback) errorCallback(error);
                    }
                );
            } else {
                // Do everything else
                if (t && !params.skipTransactionEnd) t.end();
                if (successCallback) successCallback();
            }
        }
    }

    // Abort transaction with file upload
    public abortFilesUpload(params) {
        if (params.pictures)
            params.pictures.abort();
        if (params.documents)
            params.documents.abort();
        if (params.transaction)
            params.transaction.abort();
    }
}

class DataModelProvider implements IDataModelProvider {
    private _service: IDataModelService;

    constructor(
    ) {
        "ngInject";

    }

    public $get(
        $stateParams: angular.ui.IStateParamsService,
        pipRest: IRestService
    ) {
        "ngInject";
        
        if (this._service == null) {
            this._service = new DataModel($stateParams, pipRest);
        }

        return this._service;
    }
}

angular
    .module('pipDataModel')
    .provider('pipDataModel', DataModelProvider);