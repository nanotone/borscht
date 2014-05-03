var currentPlay = null;
var makeClickHandler = function(idx, track) {
    return function(e) {
        playTrack(idx);
    };
};
var playTrack = function(idx) {
    var track = tracks[idx];
    /*if (currentPlay) {
        console.log("stopping current track");
        clearTimeout(currentPlay);
    }*/
    console.log("playing " + track.title);
    var $audio = $('audio');
    $audio.attr('src', '/file/' + track.itemid);
    $audio[0].pause();
    $audio[0].load();
    $audio[0].play();
    currentPlay = {idx: idx};
    /*currentPlay = setTimeout(function() {
        currentPlay = null;
        if (idx + 1 < tracks.length) {
            playTrack(idx + 1);
        }
    }, 5000);*/
};
$(function() {
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        var $track = $('<a></a>');
        $track.text(track.title);
        $track.on('click', makeClickHandler(i, track));
        var $div = $('<div></div>');
        $div.append($track);
        $('body').append($div);
    }
    $('audio').on('ended', function(e) {
        console.log("ended");
        if (currentPlay.idx + 1 < tracks.length) {
            playTrack(currentPlay.idx + 1);
        }
    });
});
