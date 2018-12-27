define(function() {
    'use strict';

    // We could also use RequireJS' "require.config()",
    // in order to pass data between modules.
    var data = {};

    function getData(property, sub) {
        var _data = {};

        if (typeof property != 'undefined') {
            if (typeof sub != 'undefined') {
                _data = data[property][sub];
            } else {
                _data = data[property];
            }
        } else {
            _data = data;
        }

        return _data;
    }

    function setData(property, value, sub) {
        if (typeof sub != 'undefined') {
            if (typeof data[property] == 'undefined') {
                data[property] = {};
            }

            // TODO: Not a pretty sight!
            // We can use Object.keys(obj) to change it.
            // But will leave it like this for now.
            // Also, Underscore.js "extend" function
            // should be useful in such cases.
            if (typeof value[sub] != 'undefined') {
                data[property][sub] = value[sub];
            } else {
                data[property][sub] = value;
            }
        } else {
            data[property] = value;
        }
    }

    function deleteData (property, sub) {
        if (typeof property != 'undefined') {
            if (typeof sub != 'undefined') {
                delete data[property][sub];
            } else {
                delete data[property];
            }
        }
    }

    return {
        getData: getData,
        setData: setData,
        deleteData: deleteData
    };
});
