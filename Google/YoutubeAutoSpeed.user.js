// ==UserScript==
// @name         YouTube Auto Speed
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.2
// @description  Automatically adjusts playback speed by analyzing the video's transcript
// @license      BSD-3-Clause
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

const WPM_TABLE = [
    { wpm_max: 300 , speed: 0.25 },
    { wpm_max: 250 , speed: 0.5 },
    { wpm_max: 200 , speed: 0.75 },
    { wpm_max: 160 , speed: 1.0 },
    { wpm_max: 130 , speed: 1.25 },
    { wpm_max: 115 , speed: 1.50 },
    { wpm_max: 110 , speed: 1.75 },
    { wpm_max: 100 , speed: 2.0 },
]

const MUSIC_TERMS = [
    "music video",
    "official video",
    "official music",
    "official hd video",
    "unplugged",
    "music awards",
    "cover",
    "acoustic"
]
function wpmToSpeed(wpm) {
    for (let step of WPM_TABLE) {
        if (wpm >= step.wpm_max) {
            return step.speed
        }
    }
    return 1.0
}

// Using common terms used to label music content, tries to identify videos
// which should not have their speed adjusted
// Note: unfortunately the presense of music metadata isn't good enough to indicate that
// the content *is* music, rather than only *has* music.
function isMusic() {
    const title = document.title.toLocaleLowerCase()
    const description = document.querySelector("div#description ytd-text-inline-expander#description-inline-expander")?.innerText.toLocaleLowerCase() || ""
    return MUSIC_TERMS.some(
        (term) => (title + description).includes(term)
    )
}

// Thanks for showing me how to do this, https://mkg20001.io/yt-music-playback-speed/
function setSpeed(speed) {
    document.querySelector('video').playbackRate = speed
    console.log(`${GM_info.script.name}: Speed set to ${speed}`)
}

// Builds the 'params' attribute of the body request, which encodes the
// video identifier YouTube's transcript API actually uses as its parameter
function buildParams(videoId) {
    return btoa(`\n\x0b${videoId}\x12\x12CgNhc3ISAmVuGgA%3D\x18\x01*3engagement-panel-searchable-transcript-search-panel0\x008\x01@\x01`)
}
// Builds the body for transcript requests
function buildBody(context) {
    const videoId = context.client.originalUrl.split('=')[1].replace("&t", "")
    return {
       "context": context,
       // This field is required. It's a Base64-encoded composite of several values. My initial effort only partially decoded it."
       "params": buildParams(videoId)
    }
}

function createNormalSpeedButton(currentSpeed) {
    const container = document.querySelector("div#start")
    const button = document.createElement("button")
    button.onclick = () => {
        setSpeed(1.0)
        button.textContent = `Speed = 1.0x`
    }
    button.textContent = `Speed = ${currentSpeed}x`
    container.appendChild(button)
}

function run() {
    'use strict';
    // console.log(`${GM_info.script.name} started`)

    if (isMusic()) {
        console.info(`${GM_info.script.name}: detected music. Aborting.`)
        return
    }

    fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=${ytcfg.data_.INNERTUBE_API_KEY}&prettyPrint=false`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-ch-ua-wow64": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "same-origin",
            "sec-fetch-site": "same-origin",
            "x-goog-authuser": "0",
            "x-origin": "https://www.youtube.com",
            "x-youtube-bootstrap-logged-in": "true",
            "x-youtube-client-name": "1",
            "x-youtube-client-version": `${ytcfg.data_.INNERTUBE_CONTEXT_CLIENT_VERSION}`
        },
        "referrer": `${window.location.href}`,
        "referrerPolicy": "origin-when-cross-origin",
        "body": JSON.stringify(buildBody(yt.config_.INNERTUBE_CONTEXT)),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })
    .then(resp => resp.json())
    .then(data => {

        const countWords = text => text.split(" ").length
        const transcriptSegments = data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.content.transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer.initialSegments
        // console.log(transcriptSegments)
        if (data.actions.length != 1) {
            // What's going on with the actions array? Should I be iterating over it too?
            console.warn(`${GM_info.script.name}: data.actions is longer than 1 => ${data.actions.length}`)
            // debugger
        }

        const transcriptTotals = Array.from(transcriptSegments).reduce( (acc, segment ) => {
            // YT Transcript contains multiple ways of encoding text:
            const renderer = segment.transcriptSegmentRenderer || segment.transcriptSectionHeaderRenderer
            const text = renderer.snippet?.simpleText || renderer.snippet?.runs[0].text
            let wordCount = countWords(text)
            acc.words += wordCount
            acc.ms += renderer.endMs - renderer.startMs;
            return acc
        }, { "words": 0, "ms": 0} )

        let wpm = transcriptTotals.words / (transcriptTotals.ms/60000.0)
        console.log(`${GM_info.script.name}: Total words: ${transcriptTotals.words} ; Total time: ${transcriptTotals.ms} ms ; wpm: ${wpm}`)
        const newSpeed = wpmToSpeed(wpm)
        setSpeed(newSpeed)
        createNormalSpeedButton(newSpeed)
    })

    console.log(`${GM_info.script.name}: Transcript request sent`)
}

run()
