module.exports = {
    module: {
        name: 'pipRest',
        styles: 'index',
        export: 'pip.rest',
        standalone: 'pip.rest'
    },
    build: {
        js: false,
        ts: false,
        tsd: true,
        bundle: true,
        html: true,
        sass: true,
        lib: true,
        images: true,
        dist: false
    },
    browserify: {
        entries: [ 
            './src/index.ts'
        ]
    },    
    file: {
        lib: [
            '../node_modules/pip-webui-all/dist/**/*'
        ]
    },
    samples: {
        port: 8050,
        https: false
    },
    api: {
        port: 8051
    }
};
