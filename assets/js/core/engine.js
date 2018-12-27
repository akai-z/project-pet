define([
    'core/compatibilty',
    'core/global',
    'core/db',
    'core/stage',
    'core/map',
    'core/battle',
    'core/character',
    'core/audio',
    'core/sprite'
    ], function(compatibilty, global, db, stage, map, battle, character, audio, sprite) {
    'use strict';

    function init() {
        if (!compatibilty.isCompatible()) {
            //TODO
            return false;
        }

        var queue = new createjs.LoadQueue(true);

        queue = db.preload(queue);
        queue.on('complete', preloadAssets, null, false, db);
        queue.load();
    }

    function preloadAssets(event, db) {
        db.setGlobalData(event.target.getItems());

        var queue = new createjs.LoadQueue(true);

        queue = map.preload(queue);
        queue = battle.preload(queue);
        queue = character.preload(queue);
        queue = audio.preload(queue);

        queue.on('complete', function (event) {
            start();
        });

        queue.load();
    }

    function start() {
        stage.init();

        map.setMap('map');
        map.setMap('edges');

        var mainCharacter = character.getMainPlayableCharacter(true);

        var _sprite = sprite.createSprite(
            mainCharacter,
            'characters',
            {
                "x": 250,
                "y": 250
            },
            {
                "x": 3,
                "y": 3
            },
            character.pcSpriteSheetFrames,
            character.pcSpriteSheetAnimations
        );

        sprite.play(_sprite, 'walk_down');
    }

    return {
        init: init,
        start: start
    };
});
