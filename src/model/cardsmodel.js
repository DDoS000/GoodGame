CardsModel = function () {

    this.prepareDeckCardsHome = function(){
        var cards_stack = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
        cards_stack.sort((elem1,elem2) => Math.random() - Math.random())
        return cards_stack
    }

    this.prepareDeckCardsMonney = function(){
        var cards_stack = [0,0,2000,2000,3000,3000,4000,4000,5000,5000,6000,6000,7000,7000,8000,8000,9000,9000,10000,10000,11000,11000,12000,12000,13000,13000,14000,14000,15000,15000]
        cards_stack.sort((elem1,elem2) => Math.random() - Math.random())
        return cards_stack
    }

    this.popCard = function(array){
        return array.pop();
    };
}

module.exports = {CardsModel}