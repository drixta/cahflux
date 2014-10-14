var fs = require('fs');
var allCard= JSON.parse(fs.readFileSync('cards.json','utf8'));
var WCard = allCard.filter(function(elem){
  return elem.cardType === 'W';
});
var BCard = allCard.filter(function(elem){
  return elem.cardType === 'B';
});
var shuffle = function(deck){
  var m = deck.length,
      temp,
      i;
  while(m) {
    i = Math.floor(Math.random() * m--);
    t = deck[m];
    deck[m] = deck[i];
    deck[i] = t;
  }
  return deck;
};

var getNAmountOfCards = function(n, type, nextSet){
  var i,
      deck = [];
  if (typeof nextSet === 'undefined') {
    nextSet = 0;
  }
  switch (type) {
    case 'W':
      return shuffle(WCard.slice(nextSet * n, n));
    case 'B':
      return shuffle(BCard.slice(nextSet * n, n));
    default:
      throw new Error('There are no such ' + type + ' of cards');
  }
};
module.exports = {
  getNAmountOfCards: getNAmountOfCards
};