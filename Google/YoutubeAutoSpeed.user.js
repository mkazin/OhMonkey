// ==UserScript==
// @name         YouTube Auto Speed
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Automatically adjusts playback speed by analyzing the video's transcript
// @license      BSD-3-Clause
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-idle
// ==/UserScript==

const WPM_TABLE = [
    { wpm_max: 350 , speed: 0.25 },
    { wpm_max: 300 , speed: 0.5 },
    { wpm_max: 250 , speed: 0.75 },
    { wpm_max: 190 , speed: 1.0 },
    { wpm_max: 140 , speed: 1.25 },
    { wpm_max: 120 , speed: 1.50 },
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
]
function wpmToSpeed(wpm) {
    for (let step of WPM_TABLE) {
        if (wpm >= step.wpm_max) {
            return step.speed
        }
    }
    return 1.0
}

function isMusic() {
    const title = document.title.toLocaleLowerCase()
    const description = document.querySelector("div#description ytd-text-inline-expander#description-inline-expander")?.innerText.toLocaleLowerCase()
    return MUSIC_TERMS.some(
        (term) => title.includes(term) || description.includes(term)
    )
}

// Thanks for showing me how to do this, https://mkg20001.io/yt-music-playback-speed/
function setSpeed(speed) {
    document.querySelector('video').playbackRate = speed
    console.log(`${GM_info.script.name}: Speed set to ${speed}`)
}

function buildBody() {
    return {
       "context": yt.config_.INNERTUBE_CONTEXT,
       // This field is required. It's a Base64-encoded composite of several values. My initial effort only partially decoded it."
       "params": "CgttY2dDLWt1UEV1bxISQ2dOaGMzSVNBbVZ1R2dBJTNEGAEqM2VuZ2FnZW1lbnQtcGFuZWwtc2VhcmNoYWJsZS10cmFuc2NyaXB0LXNlYXJjaC1wYW5lbDABOAFAAQ%3D%3D"
    }
}

function run() {
    'use strict';
    // console.log(`${GM_info.script.name} started`)


    if (isMusic()) {
        console.info(`${GM_info.script.name}: detected music. Aborting.`)
        return
    }

    const URL_PREFIX = "https://www.youtube.com/watch?v="
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
        "body": JSON.stringify(buildBody()),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })
    .then(resp => resp.json())
    .then(data => {

        const countWords = text => text.split(" ").length
        const transcriptSegments = data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.content.transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer.initialSegments
        if (data.actions.length != 1) {
            // What's going on with the actions array? Should I be iterating over it too?
            console.warn(`${GM_info.script.name}: data.actions is longer than 1 => ${data.actions.length}`)
            // debugger
        }
        const transcriptTotals = Array.from(transcriptSegments).reduce( (acc, segment ) => {
            acc.words += countWords(segment.transcriptSegmentRenderer.snippet.runs[0].text)
            acc.ms += segment.transcriptSegmentRenderer.endMs - segment.transcriptSegmentRenderer.startMs
            return acc
        }, { "words": 0, "ms": 0} )

        let wpm = transcriptTotals.words / (transcriptTotals.ms/60000.0)
        console.log(`${GM_info.script.name}: Total words: ${transcriptTotals.words} ; Total time: ${transcriptTotals.ms} ms ; wpm: ${wpm}`)
        setSpeed(wpmToSpeed(wpm))
    })

    console.log(`${GM_info.script.name}: Transcript request sent`)
}

run()
