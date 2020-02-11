
import {
    IRestProvider,
    IRestService,
} from './IRestService';

class RestResourceConfig {
    operation: string;
    name: string;
    path: string;
    defaultParams: any;
    actions: any
};

class RestService implements IRestService {
    private _resources: any = {};
    private _serverUrl: string;
    private _lockServerUrl: boolean;

    constructor(
        private $resource: ng.resource.IResourceService,
        private $http: ng.IHttpService,
        private $stateParams: ng.ui.IStateParamsService,
        serverUrl: string,
        lockServerUrl: boolean,
        private resourceConfigs: RestResourceConfig[]
    ) {
        "ngInject";

        this._serverUrl = serverUrl;
        this._lockServerUrl = lockServerUrl;
        this.initResources(resourceConfigs);
    }

    private reInitResource() {
        this._resources = {};
        this.initResources(this.resourceConfigs);        
    }

    private initResources(resourceConfigs: RestResourceConfig[]): void {
        _.each(resourceConfigs, (resourceConfig) => {
            let resource: any;
            switch (resourceConfig.operation) {
                case 'createResource':
                    resource = this.createResource(this._serverUrl, resourceConfig.path, resourceConfig.defaultParams, resourceConfig.actions);
                    break;
                case 'createOperation':
                    resource = this.createOperation(this._serverUrl, resourceConfig.path);
                    break;
                case 'createCollection':
                    resource = this.createCollection(this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
                case 'createPagedCollection':
                    resource = this.createPagedCollection(this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);

                    break;
                case 'createPartyCollection':
                    resource = this.createPartyCollection(this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
            }

            if (resource) {
                this._resources[resourceConfig.name] = resource;
            }
        });
    }

    private createResource(url: string, path: string, defaultParams?: any, actions?: any) {
        url = url || this._serverUrl;
        return this.$resource(this._serverUrl + path, defaultParams, actions);
    }

    private createOperation(url: string, path: string) {
        url = url || this._serverUrl;
        return this.$resource(
            url + path,
            {},
            {
                call: { method: 'POST' }
            }
        );
    }

    private createCollection(url: string, path: string, defaultParams?: any) {
        url = url || this._serverUrl;
        return this.$resource(url + path,
            defaultParams || { id: '@id' },
            {
                update: { method: 'PUT' }
            }
        );
    }

    private createPagedCollection(url: string, path: string, defaultParams?: any) {
        url = url || this._serverUrl;
        return this.$resource(url + path,
            defaultParams || { id: '@id' },
            {
                page: { method: 'GET', isArray: false },
                update: { method: 'PUT' }
            }
        );
    }

    private createPartyCollection(url: string, path: string, paramDefaults?: any) {
        return this.createPagedCollection(url, path, paramDefaults ||
            {
                id: '@id',
                party_id: '@party_id'
            }
        );
    }

    public get serverUrl(): string {
        return this._serverUrl;
    }

    public set serverUrl(value: string) {
        this._serverUrl = value;
        this.reInitResource();
    }

    public get lockServerUrl(): boolean {
        return this._lockServerUrl;
    }

    public set lockServerUrl(value: boolean) {
        this._lockServerUrl = value;
    }

    public setHeaders(headers: any) {
        for (let header in headers) {
            if (headers.hasOwnProperty(header) && !_.isObject(headers[header])) {
                this.$http.defaults.headers.common[header] = headers[header];
            }
        }
    }

    public getResource(name: string): any {
        let resource = this._resources[name];
        if (!resource)
            throw new Error('Resource not found');

        return resource;
    }

}

class RestProvider implements IRestProvider {
    private _service: IRestService;

    private _http: ng.IHttpProvider;
    private _serverUrl: string;
    private _lockServerUrl: boolean;
    private _resourceConfigs: RestResourceConfig[] = [];

    constructor($httpProvider: ng.IHttpProvider) {
        this._http = $httpProvider;
    }

    public get serverUrl(): string {
        return this._serverUrl;
    }

    public set serverUrl(value: string) {
        this._serverUrl = value;
    }

    public get lockServerUrl(): boolean {
        return this._lockServerUrl;
    }

    public set lockServerUrl(value: boolean) {
        this._lockServerUrl = value;
    }

    public setHeaders(headers: any) {
        for (let header in headers) {
            if (headers.hasOwnProperty(header))
                this._http.defaults.headers.common[header] = headers[header];
        }
    }

    public registerResource(name: string, path: string, defaultParams?: any, actions?: any): void {
        this._resourceConfigs.push({
            operation: 'createResource',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    }
    public registerOperation(name: string, path: string, defaultParams?: any, actions?: any): void {
        this._resourceConfigs.push({
            operation: 'createOperation',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    }

    public registerCollection(name: string, path: string, defaultParams?: any, actions?: any): void {
        this._resourceConfigs.push({
            operation: 'createCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    }

    public registerPagedCollection(name: string, path: string, defaultParams?: any, actions?: any): void {
        this._resourceConfigs.push({
            operation: 'createPagedCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    }

    public registerPartyCollection(name: string, path: string, defaultParams?: any, actions?: any): void {
        this._resourceConfigs.push({
            operation: 'createPartyCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    }

    public $get(
        $resource: ng.resource.IResourceService,
        $http: ng.IHttpService,
        $stateParams: angular.ui.IStateParamsService
    ) {
        "ngInject";

        if (this._service == null)
            this._service = new RestService($resource, $http, $stateParams, this._serverUrl, this._lockServerUrl, this._resourceConfigs);

        return this._service;
    }
}

angular
    .module('pipRest')
    .provider('pipRest', RestProvider);


