# Man7.org Scripts

## man pages

### [ManPage Options](./man7.user.js)
Improvements to UX to help finding/browsing command-line options

Adds:
* A table-of-contents with links to each command-line option.
* Collapsible sections. Long sections are collapsed on load to make scrolling through options faster.

#### Demo:
Compare the following local copies running the script with the original pages:
* [hexdump(1) with script-enabled](./demo/hexdump.1.html) vs [Official](https://www.man7.org/linux/man-pages/man1/hexdump.1.html)
* [curl(1) with script-enabled](./demo/curl.1.html) vs [Official](https://www.man7.org/linux/man-pages/man1/curl.1.html)

#### Possible future development
* I only sampled a few man pages and discovered two different DOM structures. There may be more that aren't supported by the current code.
* Extend filter to allow searching through option text?
* Reorder sections? For example on the curl(1) page Options appears below other less interesting sections like "Url" and "Globbing", neither of which is unique to this tool, and "Version" which isn't remotely interesting in most cases.
* Possibly make the Options text collapsable, but uncollapse if the TOC is used? It might not be what the user is interested in reading and in the case of curl(1) it is ridiculously long.
