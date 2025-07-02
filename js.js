const play = {
  NEXT: 1,
  PREV: -1,
  PREV_THROTTLE: 2,

  _playlistElement: document.querySelector(".playlist"),
  _togglePlayElement: document.querySelector(".btn-toggle-play"),
  _playingTitleElement: document.querySelector(".js-current-song-title"),
  _audioElement: document.querySelector("#audio"),
  _playIconElement: document.querySelector(".play-icon"),
  _btnPrevElement: document.querySelector(".btn-prev"),
  _btnNextElement: document.querySelector(".btn-next"),
  _loopElement: document.querySelector(".btn-loop"),
  _randomElement: document.querySelector(".btn-shuffle"),
  _progressElement: document.querySelector(".progress-bar"),
  _backgroundVideoElement: document.querySelector(".background-video"),
  _currentTimeElement: document.querySelector(".current-time"),
  _durationElement: document.querySelector(".duration"),
  _song: [
    {
      id: 1,
      path: "songs/Dancinginthedark.mp3",
      author: "Soobin Hoàng Sơn",
      name: "Dancing in the dark",
      video: "video/Dancinginthedark.mp4",
      images: "images/soobin.png",
    },

    {
      id: 2,
      path: "songs/Emdungkhoc.mp3",
      author: "Chillies",
      name: "Em đừng khóc",
      video: "video/Emdungkhoc.mp4",
      images: "images/Chillies.png",
    },

    {
      id: 3,
      path: "songs/Dalab.mp3",
      author: "Dalab",
      name: "Sinh ra đã là thứ đối lập nhau",
      images: "images/Dalab.png",
      video: "video/Dalab.mp4",
    },
    {
      id: 4,
      path: "songs/Trongemgiodangnghigi.mp3",
      author: "Hoàng Tôn",
      name: "Trong em giờ đang nghĩ gì",
      images: "images/HoangTon.png",
      video: "video/Trongemgiodangnghigi.mp4",
    },
    {
      id: 5,
      path: "songs/Daydreams.mp3",
      author: "Soobin Hoàng Sơn",
      name: "DAY Dreams",
      images: "images/soobin.png",
      video: "video/Daydreams.mp4",
    },
  ],
  _currentIndex: 0,
  _isPlaying: false,
  _isLoop: localStorage.getItem("loop") === "true",
  _isRandom: localStorage.getItem("random") === "true",
  start() {
    // console.log(this.song);
    this._render();

    // load current song
    this._handlePlayback();

    //Dom event
    this._togglePlayElement.onclick = this._togglePlay.bind(this);

    // hien thi nut
    this._audioElement.onplay = () => {
      console.log("playing..........");
      this._isPlaying = true;
      this._playIconElement.classList.remove("fa-play");
      this._playIconElement.classList.add("fa-pause");
      this._backgroundVideoElement.play();
      this._render();
    };
    // stop
    this._audioElement.onpause = () => {
      console.log("paused");
      this._isPlaying = false;
      this._playIconElement.classList.remove("fa-pause");
      this._playIconElement.classList.add("fa-play");
      this._backgroundVideoElement.pause();
      this._render();
    };
    // previous
    this._btnPrevElement.onclick = this._handleControl.bind(this, this.PREV);
    // next
    this._btnNextElement.onclick = this._handleControl.bind(this, this.NEXT);

    // loop
    this._loopElement.onclick = () => {
      this._isLoop = !this._isLoop;
      console.log(this._isLoop);
      this._setLoopState();
      localStorage.setItem("loop", this._isLoop);
    };
    //random
    this._randomElement.onclick = () => {
      this._isRandom = !this._isRandom;
      this._setRandomState();
      localStorage.setItem("random", this._isRandom);

      // this._handleForNewIndex();
    };
    // progess
    this._audioElement.ontimeupdate = () => {
      if (this._progressElement.seeking) return;
      const progress =
        (this._audioElement.currentTime / this._audioElement.duration) * 100;
      this._progressElement.value = progress || 0;

      const current = this._audioElement.currentTime;
      const duration = this._audioElement.duration;
      // cập nhật thời gian
      if (!isNaN(duration)) {
        this._currentTimeElement.textContent = this._formatTime(current);
        this._durationElement.textContent = this._formatTime(duration);
      }
      // range color
      this._progressElement.style.background = `linear-gradient(to right, #1db954 ${progress}%, #555 ${progress}%)`;
    };
    // tua
    this._progressElement.onmousedown = () => {
      this._progressElement.seeking = true;
    };
    // tua
    this._progressElement.onmouseup = () => {
      const nextStep = +this._progressElement.value;
      const seekTime = (this._audioElement.duration / 100) * nextStep;
      this._audioElement.currentTime = seekTime;
      this._backgroundVideoElement.currentTime = seekTime;
      this._progressElement.seeking = false;
    };

    //auto next
    this._audioElement.onended = () => {
      // when the next song is played, it will automatically play
      this._isPlaying = true;
      this._handleControl(this.NEXT);
    };
    // chon bai
    this._playlistElement.onclick = (e) => {
      const songNode = e.target.closest(".song");
      if (!songNode) return;

      const nodes = [...this._playlistElement.querySelectorAll(".song")];
      const clickedIndex = nodes.indexOf(songNode);

      if (clickedIndex === this._currentIndex) {
        this._togglePlay(); // Nếu đang phát bài đó thì chỉ toggle
      } else {
        this._currentIndex = clickedIndex;
        this._handleForNewIndex();
      }
    };
    // keydown
    document.addEventListener("keydown", this._handleKeyboard.bind(this));
  },
  _handleControl(step) {
    this._isPlaying = true;
    const shouldReset = this._audioElement.currentTime <= this.PREV_THROTTLE;
    if (step === this.PREV && shouldReset) {
      this._audioElement.currentTime = 0;
      return;
    }
    if (this._isRandom) {
      // lay index de chay 1 vong
      this._currentIndex = this._getRandomIndex();
    } else {
      this._currentIndex += step;
    }
    this._handleForNewIndex();
  },
  _getRandomIndex() {
    if (this._song.length === 1) {
      return this._currentIndex;
    }
    let randomIndex = null;
    do {
      randomIndex = Math.floor(Math.random() * this._song.length);
    } while (randomIndex === this._currentIndex);
    return randomIndex;
  },
  _handleForNewIndex() {
    this._currentIndex =
      (this._currentIndex + this._song.length) % this._song.length;
    this._render();
    this._handlePlayback();
  },
  _handleKeyboard(event) {
    const key = event.code;

    switch (key) {
      case "Space":
        event.preventDefault();
        this._togglePlay();
        break;
      case "ArrowRight":
        this._handleControl(this.NEXT);
        break;
      case "ArrowLeft":
        this._handleControl(this.PREV);
        break;
    }
  },
  _setLoopState() {
    this._loopElement.classList.toggle("active", this._isLoop);

    this._audioElement.loop = this._isLoop;
  },
  _setRandomState() {
    this._randomElement.classList.toggle("active", this._isRandom);
  },
  _handlePlayback() {
    const currentSong = this._getCurrentSong();
    this._playingTitleElement.textContent = currentSong.name;
    this._audioElement.src = currentSong.path;
    this._setLoopState();
    this._setRandomState();

    // video
    if (currentSong.video) {
      this._backgroundVideoElement.src = currentSong.video;
      this._backgroundVideoElement.style.display = "block";
    } else {
      this._backgroundVideoElement.removeAttribute("src");
      this._backgroundVideoElement.style.display = "none";
    }

    // play song
    this._audioElement.oncanplay = () => {
      if (play._isPlaying) {
        this._audioElement.play();
      }
    };
  },
  _getCurrentSong() {
    return this._song[this._currentIndex];
  },
  _togglePlay() {
    // trang thai cua paused
    if (this._audioElement.paused) {
      this._audioElement.play();
    } else {
      this._audioElement.pause();
    }
    this._render();
  },
  _handlePlay() {},
  _render() {
    const html = this._song
      .map((song, index) => {
        const isActive = index === this._currentIndex;
        return `
  <div class="song ${isActive ? "active" : ""}">
    <div class="thumb">
      <img src="${song.images || "./images/default.png"}" alt="thumb" />
    </div>
    <div class="body">
      <div class="title">${song.name}</div>
      <div class="author">${song.author}</div>
    </div>
    <div class="option">
      ${
        isActive
          ? `<i class="fas ${
              this._isPlaying ? "fa-pause" : "fa-play"
            } play-icon-small"></i>`
          : ""
      }
    </div>
  </div>
`;
      })
      .join("");
    this._playlistElement.innerHTML = html;
  },

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  },
};

play.start();
