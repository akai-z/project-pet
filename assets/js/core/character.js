define([
    'core/global',
    'core/db',
    'core/sprite'
    ], function(global, db, sprite) {
    'use strict';

    var spritesPath = 'assets/art/sprites/characters/';

    // TODO: This is temporary hardcoded for the demo.
    // It will be removed later.
    var pcSpriteSheetFrames = {width: 16, height: 24, count:12, regX: 0, regY: 0, spacing: 8};
    var pcSpriteSheetAnimations = {
        still_frame_up: 1,
        still_frame_down: 4,
        still_frame_left: 7,
        still_frame_right: 10,
        walk_up: {
            frames: [0,1,2,1],
            speed: .1
        },
        walk_down: {
            frames: [3,4,5,4],
            speed: .1
        },
        walk_left: {
            frames: [6,7,8,7],
            speed: .1
        },
        walk_right: {
            frames: [9,10,11,10],
            speed: .1
        }
    };

    function getCharacter(id, includeSprite) {
        var characterData = global.getData('db', 'characters');

        if (typeof id == 'undefined') {
            return characterData;
        }

        var character = {};
        var query     = 'SELECT * FROM ? WHERE id = ?';
        var queryData = [characterData, id];

        if (typeof includeSprite != 'undefined' && includeSprite) {
            var spriteData = global.getData('db', 'sprites');

            query = 'SELECT * FROM ? AS char JOIN ? AS sprt '
                  + 'ON sprite_id = sprt.id';
            queryData = [characterData, spriteData, id];

            if (id != '') {
                query += ' AND id = ?';
                queryData.push(id);
            }
        }

        alasql(
            query,
            queryData,
            function(_character) {
                character = _character;
            }
        );

        return character;
    }

    function getCharactersByType(type) {
        var charactersData = global.getData('db', 'characters');

        var characters = {};
        var query      = 'SELECT * FROM ? WHERE type = ?';
        var queryData  = [charactersData, type];

        alasql(
            query,
            queryData,
            function(_characters) {
                characters = _characters;
            }
        );

        return characters;
    }

    function getPlayableCharacters(includeSprites) {
        var charactersData = global.getData('db', 'characters');
        var queryData      = [charactersData];
        var spritesQuery   = '';

        if (includeSprites) {
            var spritesData = global.getData('db', 'sprites');
            spritesQuery = ' AS char JOIN ? AS sprt '
                         + 'ON sprite_id = sprt.id';
            queryData.push(spritesData);
        }

        var characters = {};
        var query      = 'SELECT * FROM ?'
                       + spritesQuery + ' WHERE is_npc = 0';

        alasql(
            query,
            queryData,
            function(_characters) {
                characters = _characters;
            }
        );

        return characters;
    }

    function getEnemyNpc(isBoss, includeSprites) {
        var charactersData = global.getData('db', 'characters');
        var queryData      = [charactersData];
        var spritesQuery   = '';
        var includeBoss    = 0;

        if (includeSprites) {
            var spritesData = global.getData('db', 'sprites');
            spritesQuery = ' AS char JOIN ? AS sprt '
                         + 'ON sprite_id = sprt.id';
            queryData.push(spritesData);
        }

        var characters = {};
        var query      = 'SELECT * FROM ?'
                       + spritesQuery + ' WHERE is_enemy = 1'
                       + ' AND is_boss = ?';

        if (isBoss) {
            includeBoss = 1;
        }

        queryData.push(includeBoss);

        alasql(
            query,
            queryData,
            function(_characters) {
                characters = _characters;
            }
        );

        return characters;
    }

    function getStillFrame(character) {
        var frame = [
            character.still_frame.x,
            character.still_frame.y,
            character.still_frame.width,
            character.still_frame.height,
            character.still_frame.index,
            character.still_frame.regX,
            character.still_frame.regY
        ];

        return frame;
    }

    function getMainPlayableCharacter(includeSprite) {
        var characterData = global.getData('db', 'characters');

        var character = {};
        var query = 'SELECT * FROM ? WHERE is_main = 1';
        var queryData = [characterData];

        if (typeof includeSprite != 'undefined' && includeSprite) {
            var spriteData = global.getData('db', 'sprites');

            query = 'SELECT * FROM ? AS char JOIN ? AS sprt '
                  + 'ON sprite_id = sprt.id AND is_main = 1';
            queryData.push(spriteData);
        }

        alasql(
            query,
            queryData,
            function(_character) {
                character = _character[0];
            }
        );

        return character;
    }

    function preload(queue) {
        var addedItems = [];

        $.each(getCharacter('', true), function(i, character) {
            if (addedItems.indexOf(character.source) != -1) {
                return true;
            }

            // Using loadManifest in this case would be better.
            // But unfortunately, you cannot specify a type in it.
            queue.loadFile({
                id: 'character_' + character.id,
                src: character.source,
                type: createjs.AbstractLoader.IMAGE
            }, false, spritesPath);

            addedItems.push(character.source);
        });

        return queue;
    }

    return {
        spritesPath: spritesPath,
        pcSpriteSheetFrames: pcSpriteSheetFrames,
        pcSpriteSheetAnimations: pcSpriteSheetAnimations,
        getCharacter: getCharacter,
        getCharactersByType: getCharactersByType,
        getPlayableCharacters: getPlayableCharacters,
        getEnemyNpc: getEnemyNpc,
        getStillFrame: getStillFrame,
        getMainPlayableCharacter: getMainPlayableCharacter,
        preload: preload
    };
});
