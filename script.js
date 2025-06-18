console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    let text = await res.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.getElementsByTagName("a");
    songs = [];

    for (let a of links) {
        if (a.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(a.href.split(`/songs/${folder}/`)[1]));
        }
    }

    // Display song list
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Hitanshu</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Add click event to each list item
    document.querySelectorAll(".songlist li").forEach(li => {
        li.addEventListener("click", ()=> {
            let track = li.querySelector(".info div").innerText.trim();
            playMusic(track);
            
        });
    });

    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `/songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinformation").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let res = await fetch(`http://127.0.0.1:3000/songs/`);
    let text = await res.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = Array.from(div.getElementsByTagName("a"));
    let cardContainer = document.querySelector(".cardContainer");
    // cardContainer.innerHTML = "";

    for (let anchor of anchors) {
        if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
            let folder = anchor.href.split("/").filter(Boolean).pop();
            try {
                let metaRes = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let meta = await metaRes.json();
                cardContainer.innerHTML += `
                <div class="card" data-folder="${folder}">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`info.json not found for ${folder}`);
            }
        }
    }

    // Handle album card click
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(folder);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {
    await getSongs("fav");
    playMusic(songs[0], true);
    await displayAlbums();

    // Play/Pause
    play.addEventListener("click", ()=> {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Progress bar update
    currentSong.addEventListener("timeupdate", ()=> {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = (percent * 100) + "%";
        currentSong.currentTime = currentSong.duration * percent;
    });

    // Side menu
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-120%";
    });

    // Next / Previous
    previous.addEventListener("click", () => {
    let current = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.findIndex(song => song === current);
    if (index > 0) playMusic(songs[index - 1]);
});

next.addEventListener("click", () => {
    let current = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.findIndex(song => song === current);
    if (index !== -1 && index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});

    // Volume slider
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    });

    // Mute button
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
    document.addEventListener("keydown", function (e) {
  // Check if spacebar is pressed and no input field is focused
  if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    e.preventDefault(); // Prevent scrolling
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg"; // update play button to pause icon
    } else {
      currentSong.pause();
      play.src = "img/play.svg"; // update play button to play icon
    }
  }
});


}
window.onload = () => {
  main();
};
