function initPlayer(volume) {
  var volumeHTML = '<div class="volume"><span class="volume-icon glyphicon glyphicon-volume-up"></span><div class="volume-slider-container"><input class="volume-slider" min="0" max="100" value="50" type="range"></div></div>';
  volumeElement = document.createElement("div");
  volumeElement.innerHTML = volumeHTML;
  volumeElement = volumeElement.firstChild;
  
  var volumeContainer = volumeElement.getElementsByClassName("volume-slider-container")[0];
  var volumeSlider = volumeElement.getElementsByClassName("volume-slider")[0];
  
  volumeSlider.value = volume;
  
  volumeElement.addEventListener("mouseover", function() {
    volumeContainer.style.display = "block";
  });
  volumeElement.addEventListener("mouseout", function () {
    volumeContainer.style.display = "none";
  });
  
  volumeSlider.addEventListener("input", function () {
    if (globalPlayer) {
      globalPlayer.volume = volumeSlider.value / 100;
    }
  });
  
  document.body.appendChild(volumeElement);
}

var globalPlayer;

function createPlayer(json) {

  function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    
    var interval = Math.floor(seconds / 31536000);
    
    var plural = function(amount, interval) {
      var timeString = amount + " " + interval;
      timeString += amount > 1 ? "s" : "";
      return timeString + " ago";
    }
    
    if (interval >= 1) {
      return plural(interval, "year");
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return plural(interval, "month");
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return plural(interval, "day");
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return plural(interval, "hour");
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return plural(interval, "minute");
    }
    return plural(Math.floor(seconds), "second");
  }

  var playerTemplate = '<div class="row customplayer"><div class="uploadtime">{{UPLOADTIME}}</div><div class="albumart" style="background-image:url(\'{{ALBUMART}}\');"></div><div class="player"><button type="button" class="play-button btn btn-default btn-lg"><span class="play glyphicon glyphicon-play"></span><span class="pause glyphicon glyphicon-pause" style="display: none;"></span></button><div class="metadata"><div class="artist"><a target="_blank" href="{{ARTIST_URL}}">{{ARTIST}}</a></div><div class="title"><a target="_blank" href="{{TITLE_URL}}">{{TITLE}}</a></div></div><div class="waveform" style="background-image: url(\'{{WAVEFORM}}\');"><div class="played"></div></div></div><audio class="audioplayer" src=\'{{STREAM}}\' preload="none"></audio></div>';
  
  var formatters = {UPLOADTIME : timeSince(new Date(json.created_at)),
                      ALBUMART : json.artwork_url ? json.artwork_url.replace('-large', '-t200x200')
                               : json.user.avatar_url.replace('-large', '-t200x200'),
                    ARTIST_URL : json.user.permalink_url,
                        ARTIST : json.user.username,
                     TITLE_URL : json.permalink_url,
                         TITLE : json.title,
                      WAVEFORM : json.waveform_url,
                        STREAM : json.stream_url + '?client_id=' + config.sc.clientID};
  
  Object.keys(formatters).map(function(key) {
    playerTemplate = playerTemplate.replace('{{' + key + '}}', formatters[key]);
  });
  
  var playerElement = document.createElement('div');
  playerElement.innerHTML = playerTemplate;
  playerElement = playerElement.firstChild;
  
  registerPlayer(playerElement);
  return playerElement;
  
  function registerPlayer(player) {
    var playButton = player.getElementsByClassName("play-button")[0];
    var playIcon = playButton.getElementsByClassName("play")[0];
    var pauseIcon = playButton.getElementsByClassName("pause")[0];
    var audioPlayer = player.getElementsByClassName("audioplayer")[0];
    var waveform = player.getElementsByClassName("waveform")[0];
    var progressBar = player.getElementsByClassName("played")[0];
    
    audioPlayer.addEventListener("play", function() {
      globalPlayer = audioPlayer;
      audioPlayer.volume = document.getElementsByClassName("volume-slider")[0].value / 100;
      var audioPlayers = document.getElementsByTagName("audio");
      for (var i = 0; i < audioPlayers.length; i++) {
        if (audioPlayers[i] != audioPlayer) {
          audioPlayers[i].pause();
        }
      }
      playIcon.style.display = "none";
      pauseIcon.style.display = "";
    });
    
    audioPlayer.addEventListener("pause", function() {
      pauseIcon.style.display = "none";
      playIcon.style.display = "";
    });
    
    audioPlayer.addEventListener("timeupdate", function() {
      var currentTime = audioPlayer.currentTime;
      var totalTime = audioPlayer.duration;
      progressBar.style.width = (currentTime/totalTime) * 100 + "%";
    })
    
    waveform.addEventListener("click", function(event) {
      var seekPercentage = (event.clientX-this.offsetLeft) / this.offsetWidth;
      var seekAudio = function() {
        var totalTime = audioPlayer.duration;
        progressBar.style.width = seekPercentage * 100 + "%";
        audioPlayer.currentTime = totalTime * seekPercentage;
      }
      if (audioPlayer.readyState == 0) {
        audioPlayer.addEventListener("loadedmetadata", seekAudio);
        audioPlayer.preload = "auto";
      } else {
        seekAudio();
      }
    })
    
    playButton.addEventListener("click", function() {
      var playing = !audioPlayer.paused;
      if (!playing) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    });
  }
}