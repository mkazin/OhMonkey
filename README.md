# OhMonkey
A collection of TamperMonkey scripts I wrote




## In Remembrance
Lost but not forgotten are the following scripts I've written but sadly could not keep due to leaving a job:
* Alexa Logs ("Atocha") service filter - extremely simple for its power:  given a list of service names, it searched the dropdown for matching filter elements and moved them to be the first children of the dropdown element. Huge time saved to development time ratio. Colleagues loved it.
  Background: As a developer on the software powering Audible on Alexa, one key tool was "Atocha"- the logs search engine used by the numerous microservices that made up Alexa. One critical feature was a dropdown menu of all microservices allowing us to filter by service. As time went on and more products developed for Alexa (and monolithic services were broken down into microservices) the number of items in the dropdown seemed to grow daily. We at Audible were fortunate to start at the beginning of the alphabet, but even then scrolling was required.
* CircleCI Debugger - helped make sense of Gloo Mesh's massive CI logs(1) by parsing the contents. By default it showed developers only the errors/warnings, and also provided a table of contents of checkboxes to display/hide their areas of interest.
  (1) those familiar with Solo.io will appreciate how this includes Kubernetes config dumps) 
* Don't Make Me Bleeping Click It - Amazon's internal Git platform includes a handy search which is happy to let you search by package names, and will show you a dropdown of any partial matches. The problem is the default behavior required you to click on an item in the dropdown to navigate to the corresponding package name. If you used the keyboard to select one, or typed in an exact package name it would navigate to a search page with that as the term. Again, this wasn't a fancy script, upon detecting a search page where the search term exactly matched a package name, it would redirect to its repository page. 
  Background: making matters worse, Amazon's service framework is very powerful, allowing you to specify the service interface (request and response structures) and a service template (including several programming languages), and it will auto-generate a base service package as well as client packages The result is each service is composed of several packages with the same prefix.
* "OCIT" - several contributions - a browser-based diagnostic request generator for On-Calls created by David Levine.
  Background: think Postman, but with an interface tailored for specific services. And which makes authenticated+authorized requests to services built on Amazon's internal service framework, not REST.


## References, bookmarks, reading list
* HOWTO: [Develop scripts in an IDE](https://stackoverflow.com/questions/41212558/develop-tampermonkey-scripts-in-a-real-ide-with-automatic-deployment-to-openuser) by Neithan Max
* https://link.springer.com/content/pdf/10.1007/978-3-642-13911-6_16.pdf?pdf=inline%20link
