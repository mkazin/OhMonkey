# OhMonkey
A collection of Userscripts I've written for my own use

## What's a "Userscript"?
Userscripts are JavaScript programs which are run in a web browser and can modify webpage content, add new features, automate tasks, and enhance the overall user experience in ways the website owner did not provide. Take a look through my scripts to get an idea of the kind of changes I've introduced.

A couple good examples I like to show folks:
* [*America's Test Kitchen Amazon Pricing*](AmericasTestKitchen/README.md) - Adds the current Amazon price of the kitchen products reviewed by ATK.
* [*Amazon Variation Pricer*](Amazon/README.md#amazon-variation-pricer) - displays the prices for each color variation of a product
* [*YouTube No Comment*](Google/README.md#no-comment) - hides the comment section on YouTube videos.

## What's with "Monkey"?
[GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/), [TamperMonkey](https://www.tampermonkey.net/), and [ViolentMonkey](https://violentmonkey.github.io/) are browser extensions that serve as userscript managers. They are responsible for running the appropriate scripts when the user visits a supported website.

 GreaseMonkey is the original and ran only on Mozilla Firefox. TamperMonkey was historically used on Google Chrome and other Chromium-based browsers, but has since been implemented on all browsers and is in more active development. ViolentMonkey is the newest, is open source, and supports many browsers.

 Why are they called that? I never really thought much about it. "Grease Monkey" is an old slang term for an auto mechanic. Today "monkey" is a verb used by engineers to describe tinkering with technology, possibly tracing back to the original term. "Tamper" seems obvious, whereas "violent"...? Beats me.

## Ok... and "Oh Monkey"?
Other than the obvious reference to these browser extensions, it's a phrase I adopted from a colleague I worked with long ago. It was a lovely little phrase he'd often use in place of cursing or as an exclamation of surprise or excitement.

He's a guy I really enjoyed working with, learned a lot from, and still greatly admire as an engineer and human being. So I hope he doesn't mind me stealing and sharing it. Obviously, I didn't name him here out of respect for his privacy.

Anyway, I found his phrase to be both professional and fun. I started using it later jobs and it tends to get positive- if sometimes confused- reactions from the folks I've worked with since.

## Support
Feel free to create an issue to:
* Report a bug
* Suggest a feature
* Request a new script

  If it's something minor and I can access/use the site, I might just throw it together for you.

  If you need something more complex, I might be available for hire. Check out my website for info.

  Another place you can try is the [/r/GreaseMonkey](https://www.reddit.com/r/GreaseMonkey/) subreddit. The folks there will sometimes help create a script if you ask nicely.

* Otherwise, if you like these and find them handy, please let me know! Or feel free to hit that button on the right and buy me a coffee.


## In Remembrance
Lost but not forgotten are the following scripts I've written but sadly could not keep due to leaving a job:
* ***Alexa Logs ("Atocha") service filter*** - the script searched through a dropdown for a list of configured microservice names, and moved those HTML elements to be the first children of the dropdown. In other words: you'd see your services first- no more scrolling and searching. Took almost no time to write. So simple yet highly effective, resulting in significant time savings for developers and on-calls. Colleagues loved it.
  <details>
    <summary>Q: "Really? How bad can a dropdown get?"</summary>
    It's bad. We're talking a three or four-column dropdown with a huge scrollbar.</br>
    Alexa is a sophisticated ecosystem composed of so many microservices/teams/requirements it needs dedicated platform engineering teams to build tools we used in addition to the ones used by all Amazon SDEs.</br> 
    "Atocha" is a logs search engine built to help debug a failed request as it flowed through the many services and the filter provided a clearer signal ratio. <br>
    Over time, with the proliferation of Alexa products, the dropdown seemed to grow daily. Could be six columns by now.</br> 
    Even for us at Audible -at the start of the alphabet- much scrolling was required (we followed both "Alexa", any service that prefixed "Amazon", and this one team to name their service in ALL CAPS... 🙄)
  </details>
* ***CircleCI Debugger*** - helped make sense of Gloo Mesh's massive CI logs* by parsing the contents. By default it showed developers only the errors/warnings, and also provided a table of contents of checkboxes to display/hide their areas of interest.<br>
  *Those familiar with Solo.io will appreciate why this required including Kubernetes config dumps
* ***Don't Make Me Bleeping Click It*** - Amazon's internal Git platform includes a handy search which is happy to let you search by package names, and will show you a dropdown of any partial matches. The problem is the default behavior required you to mouse-click on an item in the dropdown to navigate to the corresponding package name. If you used the keyboard to select one, or typed in an exact package name it would navigate to a search results page, not the desired repository. Again, this wasn't a fancy script, upon detecting a search page where the search term exactly matched a package name, it would redirect to its repository page. 
  <details>
    <summary>Q: "This seems... excessive?"</summary>
      Making matters worse, Amazon's service framework has a neat tool that, when given a service name, will auto-generate the multiple source code repositories necessary for a new service. This include a basic service implementation, a model definition used later to auto-generate code for request&response data  structures in various programming languages, a config package, and a client package for your service's users (an auto-generated SDK for every service- how cool?). The result is each service has several repositories, all with the same prefix. So any search for your code's service yields 4-5 packages, only one of which is changed frequently.<br>
      As to "excessive", we're talking about a mere three-line script to solve a multiple-times-per-day annoyance. And because I'm old enough to know never to use a mouse to do a keyboard's job.
  </details>
* ***"OCIT"*** - several contributions - a browser-based diagnostic request generator for On-Calls created by David Levine.
  <details>
    <summary>Think Postman...</summary>
    ...but with an interface tailored for specific services. And which makes authenticated+authorized requests to services built on Amazon's internal service framework, not REST.
  </details>



## Development
See [Development.md](./DEVELOPMENT.md) for information on how to build scripts or help on how to run scripts located on your disk.
