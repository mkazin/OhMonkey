// ==UserScript==
// @name         man7.org (man pages) improved
// @namespace    https://github.com/mkazin/OhMonkey
// @author       Michael Kazin
// @version      1.0
// @description  Readability improvements for command line options section
// @license      BSD-3-Clause
// @match        https://*.man7.org/linux/man-pages/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=man7.org
// @grant        none
// @run-at       document-end
// ==/UserScript==

// Defines the maximum length of text within a section before we set it
// to be initially collapsed to make it easier to get to the options.
const INITIAL_COLLAPSE_LENGTH = 1000;

function parseOptionFromText(text) {
    const optionMatch = text.match(/\s*(--?[a-zA-Z0-9-\.]+)\b/);
    if (optionMatch) {
        return optionMatch[1];
    }
    return null;
}

/**
 * Retrieve every node containing the text of the command's option.

 * WARNING: these may be text nodes (type 3) or element nodes (type 1)
 * This is because unfortunately man pages have different DOM structures,
 * so the return value is only guaranteed to contain the option text
 * @returns {Array} An array of nodes containing the command's options.
*/
function getOptionElements() {
    return Array.from(document.querySelector("h2 a#OPTIONS")
    ?.parentElement?.nextElementSibling?.childNodes || [])
    .filter(n =>
        // This DOM structure uses <b> or <i> elements and we can detect
        // actual options bullets using either a bullet character or EOL
        // in the previous node, e.g. see abicompat(1) and curl(1) respectively
        (n.nodeType == 1 && ["B", "I"].includes(n.tagName)
            && (
                n.previousSibling?.textContent?.replaceAll(" ", "").endsWith("\n")
                || n.previousSibling?.textContent?.replaceAll(" ", "").endsWith("•")
                // Used to detect verbose option names
                || n.previousSibling?.textContent === ", "
            )
            && n.innerText.includes("-"))
        ||
        // This DOM structure places options as only text inside text nodes which begin in the previous option, e.g. hexdump(1)
        (n.nodeType == 3 && n.textContent?.includes("   -"))
    )
}

let optionsAnchor;
let toc;

function run() {
    // Find the options section or bail for other pages
    optionsAnchor = document.querySelector("h2 a#OPTIONS");
    if (!optionsAnchor) {
        return;
    }
    addFunctionalCSS();
    addCollapseFunctionalityToSections();
    buildTOC();
    getOptionElements().forEach(option => {
        const optionText = parseOptionFromText(option.textContent);
        const optionAnchor = addAnchorToOptionElement(option, optionText);
        addOptionToTOC(optionAnchor, optionText);
    });
    buildFilterSection();
}

function buildTOC() {
    toc = document.createElement("div");
    toc.id = "custom-toc";
    toc.style.marginLeft = "20px";
    const heading = document.createElement("h2");
    heading.textContent = "Table of Contents";
    heading.style.marginTop = "0px";
    toc.appendChild(heading);
    optionsAnchor.closest("h2").append(toc);
}

function addOptionToTOC(optionAnchor, optionText) {
    const optionLink = document.createElement("a");
    optionLink.href = `#${optionAnchor.id}`; //`#${optionText.replaceAll('-', '')}`;
    optionLink.textContent = optionText;
    toc.appendChild(optionLink);
}

function addAnchorToOptionElement(optionElement, optionText) {
    const optionAnchor = document.createElement("a");
    optionAnchor.id = optionText.replaceAll('-', '');
    optionElement.parentElement.insertBefore(optionAnchor, optionElement);
    return optionAnchor;
}

function buildFilterSection() {
    const filterSection = document.createElement("div");
    const filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.placeholder = "Filter options...";
    filterInput.style.marginBottom = "10px";
    filterInput.oninput = () => {
        const query = filterInput.value.toLowerCase();
        Array.from(toc.querySelectorAll("a")).forEach(option => {
            if (option.textContent.toLowerCase().includes(query)) {
                option.style.display = "";
            }
            else {
                option.style.display = "none";
            }
        });
    }
    filterSection.appendChild(filterInput);
    toc.insertBefore(filterSection, toc.firstChild.nextSibling);
}

// Adds a collapse mechanism to existing sections in the man page.
// Some are very long, so we'll collapse them by default to make
// it easier to navigate between sections and use the TOC.
function addCollapseFunctionalityToSections() {

    Array.from(document.querySelectorAll("body > h2"))
    .filter(sectionHeading => !sectionHeading.innerText.trim().startsWith("OPTIONS"))
    .forEach(sectionHeading => {
        const collapseButton = document.createElement("span");
        collapseButton.style.fontSize = "1.2em";
        collapseButton.style.color = "blue";
        collapseButton.style.marginLeft = "5px";
        collapseButton.style.marginRight = "5px";
        sectionHeading.style.cursor = "pointer";
        sectionHeading.insertBefore(collapseButton, sectionHeading.firstChild);

        sectionHeading.dataset.collapsed = sectionHeading.nextElementSibling?.textContent?.length > INITIAL_COLLAPSE_LENGTH ? "true" : "false";
        collapseButton.textContent = sectionHeading.dataset.collapsed === "true" ? " [+]" : " [-]";
        collapseButton.onclick = () => {
            sectionHeading.dataset.collapsed = sectionHeading.dataset?.collapsed === "true" ? "false" : "true";
            collapseButton.textContent = sectionHeading.dataset.collapsed === "true" ? " [+]" : " [-]";
        }
    });
}

function addFunctionalCSS() {
    const sheet = document.createElement("style");
    sheet.textContent = `
    h2[data-collapsed="true"] + pre { display: none; }
    #custom-toc a:not(:last-child):after {content: " | "; color: initial; }
    `;
    document.head.append(sheet);
}

run();
