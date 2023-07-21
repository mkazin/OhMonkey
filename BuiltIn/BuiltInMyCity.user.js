// ==UserScript==
// @name        BuiltIn My City
// @namespace   http://tampermonkey.net/
// @description Hide job listings on BuiltIn listed in numerous cities
// @version     1.0
// @author      Michael Kazin
// @license     BSD-3-Clause
// @match       https://builtin.com/jobs/office/*/*
// @match       https://builtin.com/jobs/hybrid/office/*/*
// @grant       none
// ==/UserScript==

'use strict';

const MAX_CITIES_ALLOWED = 5
const RUN_INTERVAL = 2500     // Job interval in ms

const JOB_ROW_SELECTOR = "div.job-row"
const EMPLOYER_NAME_SELECTOR = ".company-title"
const POSITION_TITLE_SELECTOR = ".job-title"
const CITY_COUNT_REGEX = /\+(\d+)\ MORE/

function removeMultiCityJobs() {
    Array.from(document.querySelectorAll(JOB_ROW_SELECTOR))
        .filter( el => Number(el.innerText.match(CITY_COUNT_REGEX)?.at(1) || 0) > MAX_CITIES_ALLOWED )
        .forEach( el => { 
            console.log(
                `Removing ${el.querySelector(EMPLOYER_NAME_SELECTOR)?.innerText } :` +
                ` ${el.querySelector(POSITION_TITLE_SELECTOR)?.innerText}` +
                ` (${el.querySelector(".location")?.innerText})`); 

            // Removes the company's <div> when the last job row is removed.
            (el.parentElement.childElementCount <= 2 ? el.parentElement : el).remove()
        } )
};

setInterval(removeMultiCityJobs, RUN_INTERVAL)
