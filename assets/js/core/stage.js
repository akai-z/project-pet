define([
    'core/global'
    ], function(global) {
    'use strict';

    var canvas = 'stage';
    var stage  = {};
    var fps    = 30;

    function init() {
        stage = new createjs.Stage(canvas);

        var context = stage.canvas.getContext('2d');
        context.webkitImageSmoothingEnabled =
        context.mozImageSmoothingEnabled = false;

        createjs.Ticker.setFPS(fps);
        createjs.Ticker.addEventListener("tick", function(event) {
            stage.update();
        });
    }

    function getStage() {
        return stage;
    }

    function addChild(child) {
        stage.addChild(child);
    }

    function removeChildren(child) {
        if (typeof child != 'undefined') {
            stage.getStage().removeChild(child);
        } else {
            stage.getStage().removeAllChildren();
        }
    }

    return {
        init: init,
        getStage: getStage,
        addChild: addChild,
        removeChildren: removeChildren
    };
});

