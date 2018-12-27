define([
    'core/global'
    ], function(global) {
    'use strict';

    var path = 'assets/db/';

    function getTables() {
        var tables = [
            'abilities', 'ai',
            'animation', 'battlefields',
            'bgm', 'characters',
            'input', 'items',
            'manual', 'maps',
            'screens', 'soundfx',
            'sprites', 'stats'
        ];

        return tables;
    }

    function preload(queue) {
        $.each(this.getTables(), function(i, table) {
            // Using loadManifest in this case would be better.
            // But unfortunately, you cannot specify a type in it.
            queue.loadFile({
                id:'db_' + table,
                src: table + '.json',
                type: createjs.AbstractLoader.JSON
            }, false, path);
        });

        return queue;
    }

    function setGlobalData(items) {
        var data = {};

        // TODO: This is not a pretty sight!
        // But, for now, we will use this as a workaround.
        // The right way is to use the data inside _loadedResults.
        // But, it needs more research.
        $.each(items, function(i, item) {
            data[item.item.id] = item.result;
        });

        $.each(this.getTables(), function(i, table) {
            var _table = {};
            _table[table] = data['db_' + table];

            global.setData('db', _table, table);
        });
    }

    return {
        getTables: getTables,
        preload: preload,
        setGlobalData: setGlobalData
    };
});
