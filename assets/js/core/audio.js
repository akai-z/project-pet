define([
    'core/global'
    ], function(global) {
    'use strict';

    var audioPath = 'assets/audio/';

    function getAudio(type, id) {
        var audioData = global.getData('db', type);

        if (typeof id == 'undefined') {
            return audioData;
        }

        var audio     = {};
        var query     = 'SELECT * FROM ? WHERE id = ?';
        var queryData = [audioData, id];

        alasql(
            query,
            queryData,
            function(_audio) {
                audio = _audio[0];
            }
        );

        return audio;
    }

    function preload(queue) {
        createjs.Sound.alternateExtensions = ['mp3'];
        queue.installPlugin(createjs.Sound);

        $.each(getAudio('bgm'), function(i, bgm) {
            // Using loadManifest in this case would be better.
            // But unfortunately, you cannot specify a type in it.
            queue.loadFile({
                id:'bgm_' + bgm.id,
                src: bgm.source,
                type: createjs.AbstractLoader.SOUND
            }, false, audioPath + 'bgm/');
        });

        // SoundFX is temporarily disabled
        /*$.each(getAudio('soundfx'), function(i, soundfx) {
            // Using loadManifest in this case would be better.
            // But unfortunately, you cannot specify a type in it.
            queue.loadFile({
                id:'soundfx_' + soundfx.id,
                src: soundfx.source,
                type: createjs.AbstractLoader.SOUND
            }, false, audioPath + 'soundfx/');
        });*/

        return queue;
    }

    function play(type, id) {
        var audioData = null;
        var loop      = 0;

        audioData = getAudio(type, id);

        if (type == 'bgm') {
            loop = audioData.loop;
        }

        id = type + '_' + id;

        var ppc = new createjs.PlayPropsConfig().set({
            interrupt: createjs.Sound.INTERRUPT_ANY,
            loop: loop
        });

        createjs.Sound.play(id, ppc);
    }

    function stop() {
        createjs.Sound.stop();
    }

    return {
        getAudio: getAudio,
        preload: preload,
        play: play,
        stop: stop
    }
});
