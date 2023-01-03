// ==UserScript==
// @namespace   https://openuserjs.org/users/mkazin
// @name        Remove BostonGlobe sports
// @description Hides sports from the Boston Globe
// @version     1.0.0
// @author      Michael Kazin
// @license     BSD-3-Clause
// @include     http://*.bostonglobe.com/*
// @include     https://www.bostonglobe.com/*
// ==/UserScript==

function removeElement(element, navigator) {
    navigator = navigator || undefined;
    var targetElement = element;
    if (navigator) {
        targetElement = navigator(element);
    }
    targetElement.style.display="none";
}

function removeById(id) {
    var element = document.getElementById(id);
    removeElement(element);
    console.log('Sponsored element with id: ' + id);
}
function removeBySelector(selector) {
    var element = document.querySelector(selector);
    removeElement(element);
    console.log("Removed element for selector: " + selector);
}
function removeMatchingElementsContainingText(search, text, navigator) {
    var elements = document.querySelectorAll(search);
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].textContent.toUpperCase().indexOf(text.toUpperCase()) >= 0) {
            removeElement(elements[i], navigator);
        }
    }
}

/** Navigators provides a DOM traversal of a selected element to the element desired to be removed */
function parentNavigator(element) {
    return element.parentElement;
}
function grandparentNavigator(element) {
    return parentNavigator(parentNavigator(element));
}

window.cleanSportsPosts = function() {
    // <div class=iframe-container id=scoreEmbedContainer  --> obnoxious score at very top of page
    removeById("scoreEmbedContainer");

    // <a class="nav_item | border border_black border_left color_black hover_color_gray_90>Sports</a>  --> Sports header
    removeMatchingElementsContainingText("#primary_nav_links > a", "Sports");

    // <div class="s_c_f | align_items_start container column col ws-3 desktop-3 tablet-6 grid width_full">  which contains
    //     <h4 style="font-size: 14px; line-height: inherit; padding-top: initial;">Sports</h4>  --> story "cards" at bottom of page
    removeMatchingElementsContainingText("h4", "Sports", grandparentNavigator);

    // While we're at it, kill "From Our Partners" junk articles
    // <section id="hp-lower-fw" class="hp | lower-fw col grid width_full"> containing
    //   <div class="sponsored_content_ads | margin_vertical_16 margin_bottom_32--mobile width_full"/>
    removeBySelector("#hp-lower-fw");
};

// Observe changes in the page and reapply.
// Taken from Navneet Khare's fantastic "Remove Sponsored Posts" TamperMonkey script at:
// https://openuserjs.org/install/finitenessofinfinity/Remove_Sponsored_Posts.user.js
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var target = document.getElementsByTagName("body")[0];
var config = { attributes: true, childList: true, characterData: true };

var mutationObserver = new MutationObserver(function(mutations) {
  cleanSportsPosts();
});

mutationObserver.observe(target, config);
cleanSportsPosts();

