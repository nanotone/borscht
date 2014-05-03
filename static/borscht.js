angular.module('borscht', [])
.controller('BorschtCtrl', ['$http', '$scope', function($http, $scope) {

    var normalizeName = function(name) {
        name = name.toLowerCase();
        if (name.indexOf('the ') === 0) {
            name = name.substr(4);
        }
        var initialRomanized = ({'\u30D1': 'pa'})[name.substr(0, 1)];
        if (initialRomanized) {
            name = initialRomanized + name.substr(1);
        }
        return name;
    };

    $http.get('/albums').then(function(response) {
        var albumsByArtist = {};
        $scope.artists = [];
        $scope.albums = response.data.albums;
        for (var i = 0; i < $scope.albums.length; i++) {
            var album = $scope.albums[i];
            var artist = album.artist;
            if (!albumsByArtist[artist]) {
                $scope.artists.push(albumsByArtist[artist] = {name: artist, albums: []});
            }
            albumsByArtist[artist].albums.push(album);
        }
        $scope.artists.sort(function(a, b) {
            a = normalizeName(a.name);
            b = normalizeName(b.name);
            if      (a < b) { return -1; }
            else if (a > b) { return  1; }
            return 0;
        });
    });

    $scope.showAlbum = function(album) {
        $scope.thisAlbum = album;
        if (!album.tracks) {
            $http.get('/album/' + album.id).then(function(response) {
                album.tracks = response.data.tracks;
            });
        }
    };

    var playing = null;
    var $audio = angular.element(document.getElementById('audioPlayer'));
    $audio.on('ended', function(e) {
        $scope.$apply(function() {
            if (playing.album !== $scope.thisAlbum
                || playing.idx + 1 >= $scope.thisAlbum.tracks.length) {
                playing.track.playing = false;
                playing = null;
            }
            else {
                $scope.playTrack(playing.idx + 1);
            }
        });
    });
    $scope.playTrack = function(idx) {
        if (playing) {
            if (playing.album === $scope.thisAlbum && idx === playing.idx) { return; }
            playing.track.playing = false;
        }
        var track = $scope.thisAlbum.tracks[idx];
        console.log("playing " + track.title);
        $audio.attr('src', '/file/' + track.itemid);
        $audio[0].pause();
        $audio[0].load();
        $audio[0].play();
        playing = {album: $scope.thisAlbum, idx: idx, track: track};
        track.playing = true;
    };
}])

.directive('fillWindowHeight', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            console.log("link");
            element.css({height: $window.innerHeight - element[0].getBoundingClientRect().top - 8});
        }
    };
}])
