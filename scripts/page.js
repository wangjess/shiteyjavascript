////  Page-scoped globals  ////

// Counters
let throwingItemIdx = 1;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

// Create Candy + Beads
let candy = './img/candy.png';
let beads = './img/beads.png';

// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;

////  Functional Code  ////

// Main
$(document).ready( function() {
  console.log("Ready!");

  maxItemPosX = $('.game-window').width() - 50;
  maxItemPosY = $('.game-window').height() - 40;
  // Set global handles (now that the page is loaded)
  gwhGame = $('#actualGame');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  player = $('#player');  // set the global player handle
  paradeRoute = $("#paradeRoute");
  paradeFloat1 = $("#paradeFloat1");
  paradeFloat2 = $("#paradeFloat2");
  // Set styling for candy + beads 
  beads = $(".beads");
  candy = $(".candy");


  // Set global positions
  maxPersonPosX = $('.game-window').width() - player.width();
  maxPersonPosY = $('.game-window').height() - player.height();

  $(window).keydown(keydownRouter);
  
  // Periodically check for collisions
  setInterval( function() {
    checkCollisions();
  }, 100);

  startParade();

  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
});


function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

function checkCollisions() {
  // TODO! When candy and user collide
}

function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

function willCollide(o1, o2, o1_xChange, o1_yChange){
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

function isOrWillCollide(o1, o2, o1_xChange, o1_yChange){
  const o1D = { 'left': o1.offset().left + o1_xChange,
        'right': o1.offset().left + o1.width() + o1_xChange,
        'top': o1.offset().top + o1_yChange,
        'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = { 'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
     // collision detected!
     return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max){
  return (Math.random() * (max - min)) + min;
}

function createThrowingItem(){
  console.log('Creating item to throw...');
  if (throwingItemIdx % 3 == 0) { // every 3rd item is candy

    var itemToBeThrown = createItemDivString(throwingItemIdx, 'candy', 'candy.png');
  }
  else {
 
    var itemToBeThrown = createItemDivString(throwingItemIdx, 'beads', 'beads.png');
  }

  gwhGame.append(itemToBeThrown);
  var updateItemToBeThrown = $('#i-' + throwingItemIdx); // required to fade this distinct object properly
  throwingItemIdx++;

  // get the xChange + yChange
  // var xChange = getRandomNumber(500, 0);
  var xChange = 0;
  // var yChange = getRandomNumber(500, 0);
  var yChange = 50;
  var numIterations = getRandomNumber(10, 0); // random number of iterations as described in spec

  updateThrownItemPosition(updateItemToBeThrown, xChange, yChange, numIterations);
}

// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString){
  return "<div id='i-" + itemIndex + "' class='throwingItem " + type + "'><img src='img/" + imageString + "'/></div>";
}

function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft){
  console.log("Going to throw item...");

  // always throw it from the alligator float's center
  let startPosition = parseInt(paradeFloat2.css('left') + (paradeFloat2.width() / 2));
  let throwSpeed = getRandomNumber(20, 5);
  elementObj.css('left', startPosition);

  // set a timer so it moves the candy
  let throwTimer = setInterval( function() {
    // elementObj = startPosition; // restart position
    let xThrow = parseInt(elementObj.css('left'))+xChange;
    let yThrow = parseInt(elementObj.css('top'))+yChange;

    if (iterationsLeft = 0) {
      clearInterval(throwTimer); // finish the animation after 2 seconds
    }

    elementObj.css('left', xThrow);
    elementObj.css('top', yThrow);
    iterationsLeft--;
}, OBJECT_REFRESH_RATE); // does this every 50 ms

    // todo: sit for 5 seconds then fade
    graduallyFadeAndRemoveElement(elementObj);
}

function graduallyFadeAndRemoveElement(elementObj){
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function(){
    $(this).remove();
  });
}

function startParade(){
  console.log("Starting parade...");
  paradeTimer = setInterval( function() {
      // (Depending on current position) update left value for each parade float
      let Float1 = parseInt(paradeFloat1.css('left'))+FLOAT_SPEED;
      let Float2 = parseInt(paradeFloat2.css('left'))+FLOAT_SPEED;
      if (Float1 > 500 && Float2 > 500) { // game window is 500 px
        Float1 = -300; // restart positions
        Float2 = -150; // restart positions
      }
      if (willCollide(paradeFloat1, player, FLOAT_SPEED, 0)) { // if it hits the lady
        Float1 = parseInt(paradeFloat1.css('left'));
        Float2 = parseInt(paradeFloat2.css('left'));
      }
      if (willCollide(paradeFloat2, player, FLOAT_SPEED, 0)) { // if it hits the alligator
        Float1 = parseInt(paradeFloat1.css('left'));
        Float2 = parseInt(paradeFloat2.css('left'));
      }
      paradeFloat1.css('left', Float1);
      paradeFloat2.css('left', Float2);
  }, OBJECT_REFRESH_RATE); // does this every 50 ms
}

// Handle player movement events
function movePerson(arrow) {
  switch (arrow) {
    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, -PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      if (willCollide(player, paradeFloat2, -PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left'))+PERSON_SPEED;
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      if (willCollide(player, paradeFloat2, PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, 0, -PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      if (willCollide(player, paradeFloat2, 0, -PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top'))+PERSON_SPEED;
      if (newPos > maxPersonPosY) {
        newPos = maxPersonPosY;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, 0, PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      if (willCollide(player, paradeFloat2, 0, PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
  }
}