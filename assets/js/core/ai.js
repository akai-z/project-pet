define([
    'core/ai/easy'
    ], function(easy) {
    'use strict';

    function decideAction() {
        return easy.getAction();
    }

    return {
        decideAction: decideAction
    };
});
