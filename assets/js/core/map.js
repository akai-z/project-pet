define([
    'core/global',
    'core/stage',
    'core/audio'
    ], function(global, stage, audio) {
    'use strict';

    var mapsPath = 'assets/art/maps/';

    var lastPosition = [];

    function setMap(_map) {
        var map = getMap(_map);
        setBackground(map.image);

        if (typeof map.bgm_id != 'undefined') {
            audio.stop();
            audio.play('bgm', map.bgm_id);
        }
    }

    function getMap(id) {
        var mapData = global.getData('db', 'maps');

        if (typeof id == 'undefined') {
            return mapData;
        }

        var map       = {};
        var query     = 'SELECT * FROM ? WHERE id = ?';
        var queryData = [mapData, id];

        alasql(
            query,
            queryData,
            function(_map) {
                map = _map[0];
            }
        );

        return map;
    }

    function setBackground(background) {
        var image = new createjs.Bitmap(mapsPath + background);
        image.scaleX = image.scaleY = 3;

        //stage.removeChildren();
        stage.addChild(image);
        stage.getStage().update();

        return image;
    }

    function initiateBattle() {
        //TODO
    }

    function getLastPosition() {
        return lastPosition;
    }

    function setCurrentPosition() {
        //TODO
    }

    function preload(queue) {
        $.each(getMap(), function(i, background) {
            // Using loadManifest in this case would be better.
            // But unfortunately, you cannot specify a type in it.
            queue.loadFile({
                id:'map_' + background.id,
                src: background.image,
                type: createjs.AbstractLoader.IMAGE
            }, false, mapsPath);
        });

        return queue;
    }

    return {
        setMap: setMap,
        getMap: getMap,
        setBackground: setBackground,
        preload: preload
    }
});
