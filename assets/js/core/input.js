define([
    'core/global',
    ], function(global) {
    'use strict';

    var defaultProfile = 0;

    function getKeys(profile) {
        if (typeof profile == 'undefined') {
            profile = defaultProfile;
        }

        return global.getData('db', 'input')[profile];
    }

    return {
        getKeys: getKeys
    }
});
