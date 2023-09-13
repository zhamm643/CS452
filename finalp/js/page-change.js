function addOne() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) + 1; // increment the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}

function addTwo() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) + 2; // increment the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}

function addThree() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) + 3; // increment the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}
function addFour() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) + 4; // increment the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}

function minusOne() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) - 1; // decrement the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}
function minusTwo() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) - 2; // decrement the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}
function minusThree() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) - 3; // decrement the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}
function minusFour() {
  var currentUrl = window.location.href; // get the current URL
  var stepNumberRegex = /step(\d+)/; // regular expression to match the step number
  var stepNumber = currentUrl.match(stepNumberRegex)[1]; // extract the step number
  var newStepNumber = parseInt(stepNumber) - 4; // decrement the step number
  var newUrl = currentUrl.replace(stepNumberRegex, 'step' + newStepNumber); // construct the new URL
  window.location.href = newUrl; // navigate to the new URL
}