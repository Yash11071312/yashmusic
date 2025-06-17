console.log('lets write java script');
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    // audio = new Audio();
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"

    }

    document.querySelector(".songinformation").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }


    // Attach click listeners after cards are added
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}

Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        // Get songs from selected folder
        await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        // Play the first song (optional)
        playMusic(songs[0], true)

        // Update song list UI
        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li><img class="invert" src="img/music.svg" alt="">
                    <div class="songinfo">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Hitasnhu</div>
                    </div>
                    <div class="playnow">
                        <span>play now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
        }
        // Add click event to each song in new list
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(li => {
            li.addEventListener("click", () => {
                playMusic(li.querySelector(".songinfo").firstElementChild.innerHTML);
            });
        });
    });
}
);



async function main() {


    await getSongs("songs/ncs")
    playMusic(songs[0], true)



    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
     <li><img class="invert" src="img/music.svg" alt="">
                            <div class="songinfo">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Hitasnhu</div>

                            </div>
                            <div class="playnow">
                                <span>play now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                            </li>` ;

    }


    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {


            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML)
        })
    })
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} /${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100
    })
    // add event listener on hamburger
    document.querySelector(".hamburgerCont").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volme to ", e.target.value, "/100");

        currentSong.volume = parseInt(e.target.value) / 100
    })
document.querySelector(".volume img").addEventListener("click",e=>{
    if(e.target.src.includes("volume.svg")){
       e.target.src =  e.target.src.replace("volume.svg","mute.svg")
        currentSong.volume = 0;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
    e.target.src = e.target.src.replace("mute.svg","volume.svg")
        currentSong.volume = 1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
    }
})
}
main()
