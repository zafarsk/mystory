angular.module('storyService', [])

    .factory('Story', function ($http) {

        var storyFactory = {};

        storyFactory.createStory = function (storyData) {
            return $http.post('/api', storyData);
        }

        storyFactory.allStory = function () {
            return $http.get('/api');
        }

        storyFactory.allStories = function () {
            return $http.get('/api/all_stories');
        }

        return storyFactory;
    })

    .factory('socketio', function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {


                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },

            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }
        };
    });