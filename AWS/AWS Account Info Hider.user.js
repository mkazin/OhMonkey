// ==UserScript==
// @name         AWS Account Info Hider
// @description  Hides sensitive information on AWS Console
// @version      0.2
// @author       https://github.com/mkazin
// @copyright    2020, mkazin (https://openuserjs.org/users/mkazin)
// @license      BSD-3-Clause
// @match        https://*.console.aws.amazon.com/*
// @grant        none
// @run-at       document-start
// @namespace    https://openuserjs.org/users/mkazin
// ==/UserScript==

// ==OpenUserJS==
// @author mkazin
// ==/OpenUserJS==

function hideSensitiveInformation() {

  'use strict';

  var accountIdentifier = document.querySelector('a#nav-usernameMenu');
  //console.log(accountIdentifier);
  if (accountIdentifier) {
    //console.log('Hiding: ' + accountIdentifier.text);
    accountIdentifier.text = "[HIDDEN]";
  }

  accountIdentifier = document.querySelector('div.nav-elt-label');
  //console.log(accountIdentifier);
  if (accountIdentifier) {
    //console.log('Hiding: ' + accountIdentifier.text);
    accountIdentifier.text = "[HIDDEN]";
  }

  // Hide the IAM User label and Account Identifier in the Username Menu
  document.querySelectorAll('div.awsc-username-display-name').forEach(function (menuUsername) {
    //console.log('menuUsername: ', menuUsername);
    if (menuUsername) {
      //console.log('Hiding: ' + menuUsername.title);
      menuUsername.title = "[HIDDEN]";
      menuUsername.textContent = "[HIDDEN]";
    }
  });
}

hideSensitiveInformation();
document.addEventListener("DOMContentLoaded", hideSensitiveInformation);
window.addEventListener("load", hideSensitiveInformation);

