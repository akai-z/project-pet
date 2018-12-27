'use string';

require.config({
    baseUrl: 'assets/js',
    paths: {
        jquery: 'lib/jquery',
        easeljs: 'lib/easeljs',
        soundjs: 'lib/soundjs',
        preloadjs: 'lib/preloadjs'
    }
});

require([
    'core/engine',
    'jquery',
    'easeljs',
    'soundjs',
    'preloadjs'
    ], function(engine, $, easeljs, soundjs, preloadjs) {
        engine.init();
    }
);

