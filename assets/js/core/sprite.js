define([
    'exports',
    'core/global',
    'core/stage',
    'core/map',
    'core/battle'
    ], function(exports, global, stage, map, battle) {
    'use strict';

    var spritesPath = 'assets/art/sprites/';

    var sprites = {};

    var keys = {};
    var stopped;
    var _sprite,charcterState;
    var logoMap,logoElem;
    var collision;
    var imgMap,imgElements;

    var movement=[0,0];
    var keyCode;

    var mov1 = 0;
    var mov2 = 0;

    function initKeys() {
        $(document).keydown(function(e) {
            keys[e.keyCode]=true;
            keyCode=e.keyCode;
        });
    
        $(document).keyup(function(e) {
    
            delete keys[e.keyCode];
    
            if (charcterState =="walk_left")
                _sprite.gotoAndStop("still_frame_left");
    
            if (charcterState =="walk_right")
                _sprite.gotoAndStop("still_frame_right");
    
            if (charcterState =="walk_up")
                _sprite.gotoAndStop("still_frame_up");
    
            if (charcterState =="walk_down")
                _sprite.gotoAndStop("still_frame_down");
        });
    }

    function initMovementLimits() {
        mov1 = Math.floor(Math.random() * (1000 - 300 + 1) + 300);
        mov2 = Math.floor(Math.random() * (1000 - 300 + 1) + 300) * -1;
    }

    function setSprite(spriteId, _sprite) {
        sprites[spriteId] = _sprite;
    }

    function getSprite(spriteId) {
        return sprites[spriteId];
    }

    function getSpriteSheet(image, _frames, _animations) {
        var spriteSheetData = {
            "images": [image],
            "frames": _frames
        };

        if (typeof _animations != 'undefined') {
            spriteSheetData.animations = _animations;
        }

        var spriteSheet = new createjs.SpriteSheet(spriteSheetData);

        return spriteSheet;
    }

    // TODO: This function should be reviewed later.
    function createSprite(_sprite, type, position, scale, _frames, _animations) {
        var spriteSource = spritesPath + type + '/' + _sprite.source;
        var spriteSheet  = getSpriteSheet(spriteSource, _frames, _animations);
        var sprite       = new createjs.Sprite(spriteSheet);

        if (typeof position == 'object' && position != {}) {
            sprite.x = position.x;
            sprite.y = position.y;
        }

        if (typeof scale == 'object' && scale != {}) {
            sprite.scaleX = scale.x;
            sprite.scaleY = scale.y;
        } else if (typeof scale == 'integer') {
            sprite.scaleX = sprite.scaleY = scale;
        } else {
            sprite.scaleX = sprite.scaleY = 3;
        }

        stage.addChild(sprite);

        setSprite(_sprite.id, sprite);

        return sprite;
    }

    function play(sprite, animation) {
        if (typeof sprite == 'object') {
            sprite.gotoAndPlay(animation);
        } else {
            sprites[sprite].gotoAndPlay(animation);
        }

        //Must check if there is a better place to create another new listener
        _sprite = getSprite("char_a");

        imgMap  = map.getMap("map").image;
        logoMap = map.setBackground(imgMap);

        imgElements = map.getMap("edges").image;
        logoElem    = map.setBackground(imgElements);

        stage.getStage().addChild(_sprite);
        stage.getStage().update();

        _sprite.gotoAndPlay("still_frame_down");

        createjs.Ticker.addEventListener("tick",handleTick);
    }

    function handleTick() {

       if(keys[37] || keys[38] || keys[39] || keys[40]){
            if (keys[37]) {
                charcterState = "walk_left";

                if (logoMap.x < 0 && _sprite.x > 400)
                    _sprite.x -= 3;

                else
                    if (logoMap.x < 0) {
                        logoMap.x += 3;
                        logoElem.x += 3;
                        movement[0] += 3; //0 index --> walking left
                    }
                    else
                        _sprite.x -= 3;

                if (collision = ndgmr.checkPixelCollision(_sprite, logoElem, 0.1))
                    _sprite.x += 3;
            }

            if(keys[39]){
                charcterState = "walk_right";

                if (logoMap.x >= -1500 && _sprite.x < 400)
                    _sprite.x += 3;

                else
                    if (logoMap.x >= -1590) {
                        logoMap.x -= 3;
                        logoElem.x -= 3;
                        movement[0] -= 3; //1 index --> walking wight
                    }
                    else
                        _sprite.x += 3;

                if (collision = ndgmr.checkPixelCollision(_sprite, logoElem, 0.1))
                    _sprite.x -= 3;

            }

            if (keys[38]) {
                charcterState = "walk_up";

                if (logoMap.y < 0 && _sprite.y > 300)
                   _sprite.y -= 3;

                else
                    if (logoMap.y < 0) {
                        logoMap.y += 3;
                        logoElem.y += 3;
                        movement[1] += 3; //2 index --> walking up
                    }
                    else
                        _sprite.y -= 3;

                if (collision = ndgmr.checkPixelCollision(_sprite, logoElem, 0.1))
                    _sprite.y += 3;

            }

            if (keys[40]) {
                charcterState = "walk_down";

                if (logoMap.y >= -1100 && _sprite.y < 300)
                    _sprite.y += 3;

                else
                    if (logoMap.y >= -1190) {
                        logoMap.y -= 3;
                        logoElem.y -= 3;
                        movement[1] -= 3; //3 index --> walking down
                    }
                    else
                        _sprite.y += 3;

                if (collision = ndgmr.checkPixelCollision(_sprite, logoElem, 0.1))
                    _sprite.y -= 3;
            }

            if (charcterState != _sprite.currentAnimation) {
                _sprite.gotoAndPlay(charcterState);
            }
            if (checkBattleMode()){
                _sprite.gotoAndStop("still_frame_down");
                keys=[];
                // Start Battle Mode
                $(document).off('keydown');
                $(document).off('keyup');
                stage.removeChildren();
                battle.setBattle('rain_forest');
            }

            if (checkMiniBoss()){
                logoMap.x+=10;
                logoMap.y+=10;
                logoElem.x+=10;
                logoElem.y+=10;
                _sprite.gotoAndStop("still_frame_down");
                keys=[];
                // Mini Boss Triggering...
            }

                stage.getStage().update();
        }
    }

    function checkBattleMode() {
        if(movement[0] > mov1 || movement[0] < mov2){
            movement=[0,0];
            return true;
        }

        if(movement[1] > mov1 || movement[1] < mov2){
            movement=[0,0];
            return true;
        }
    }

    function checkMiniBoss(){

        if(logoMap.x< -1590 && logoMap.y < -940)
            return true;
    }

    function stop(sprite, animation) {
        if (typeof sprite == 'object') {
            sprite.gotoAndStop(animation);
        } else {
            sprites[sprite].gotoAndStop(animation);
        }
    }

    initKeys();
    initMovementLimits();

    return {
        setSprite: setSprite,
        getSprite: getSprite,
        getSpriteSheet: getSpriteSheet,
        createSprite: createSprite,
        initKeys: initKeys,
        initMovementLimits: initMovementLimits,
        play: play,
        stop: stop
    }
});
