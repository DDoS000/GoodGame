let ranking
var profile = []
function Preload() {
    this.asset = null;
    this.ready = false;
  }
  
Preload.prototype = {
    init:  function(data){
        profile = data.profile
        ranking = data.ranking
    },

    preload:async function() {
        console.log("-----------Preload--------------");
        //create and position preloader UI
        this.asset = this.add.sprite(this.game.width/2,this.game.height/2, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);

        this.game.load.crossOrigin = 'anonymous';

        //listen for loadComplete
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.setPreloadSprite(this.asset);

        //load used assets
        this.load.image('avatar', profile.user_photoURL); 

        this.load.image('bg_game_play', './assets/images/background2.jpg');
        this.load.image('bg_main', './assets/images/background_main.jpg');
        this.load.image('bg_private_room', './assets/images/background_private_room.jpg');
        this.load.spritesheet('loading','./assets/images/loading-sprite.png',360,360)
        
        this.load.spritesheet('card_1','assets/images/card-1.png',133, 170);
        this.load.spritesheet('card_2','assets/images/card-2.png',133, 170);
        this.load.spritesheet('card_3','assets/images/card-3.png',134, 170);
        this.load.spritesheet('card_4','assets/images/card-4.png',133, 170);
        this.load.spritesheet('card_5','assets/images/card-5.png',134, 170);
        this.load.spritesheet('card_6','assets/images/card-6.png',133, 170);
        this.load.spritesheet('card_7','assets/images/card-7.png',133, 170);
        this.load.spritesheet('card_8','assets/images/card-8.png',133, 170);
        this.load.spritesheet('card_9','assets/images/card-9.png',134, 170);
        this.load.spritesheet('card_10','assets/images/card-10.png',134, 170);
        this.load.spritesheet('card_11','assets/images/card-11.png',133, 170);
        this.load.spritesheet('card_12','assets/images/card-12.png',134, 170);
        this.load.spritesheet('card_13','assets/images/card-13.png',133, 170);
        this.load.spritesheet('card_14','assets/images/card-14.png',134, 170);
        this.load.spritesheet('card_15','assets/images/card-15.png',133, 170);
        this.load.spritesheet('card_16','assets/images/card-16.png',134, 170);
        this.load.spritesheet('card_17','assets/images/card-17.png',134, 170);
        this.load.spritesheet('card_18','assets/images/card-18.png',134, 170);
        this.load.spritesheet('card_19','assets/images/card-19.png',134, 170);
        this.load.spritesheet('card_20','assets/images/card-20.png',134, 170);
        this.load.spritesheet('card_21','assets/images/card-21.png',134, 170);
        this.load.spritesheet('card_22','assets/images/card-22.png',134, 170);
        this.load.spritesheet('card_23','assets/images/card-23.png',134, 170);
        this.load.spritesheet('card_24','assets/images/card-24.png',134, 170);
        this.load.spritesheet('card_25','assets/images/card-25.png',134, 170);
        this.load.spritesheet('card_26','assets/images/card-26.png',133, 170);
        this.load.spritesheet('card_27','assets/images/card-27.png',133, 170);
        this.load.spritesheet('card_28','assets/images/card-28.png',134, 170);
        this.load.spritesheet('card_29','assets/images/card-29.png',134, 170);
        this.load.spritesheet('card_30','assets/images/card-30.png',134, 170);


        this.load.spritesheet('monney_0','assets/images/card-monney-0.png',134, 170);
        this.load.spritesheet('monney_2000','assets/images/card-monney-2000.png',134, 170);
        this.load.spritesheet('monney_3000','assets/images/card-monney-3000.png',134, 170);
        this.load.spritesheet('monney_4000','assets/images/card-monney-4000.png',134, 170);
        this.load.spritesheet('monney_5000','assets/images/card-monney-5000.png',134, 170);
        this.load.spritesheet('monney_6000','assets/images/card-monney-6000.png',134, 170);
        this.load.spritesheet('monney_7000','assets/images/card-monney-7000.png',134, 170);
        this.load.spritesheet('monney_8000','assets/images/card-monney-8000.png',134, 170);
        this.load.spritesheet('monney_9000','assets/images/card-monney-9000.png',134, 170);
        this.load.spritesheet('monney_10000','assets/images/card-monney-10000.png',134, 170);
        this.load.spritesheet('monney_11000','assets/images/card-monney-11000.png',134, 170);
        this.load.spritesheet('monney_12000','assets/images/card-monney-12000.png',134, 170);
        this.load.spritesheet('monney_13000','assets/images/card-monney-13000.png',134, 170);
        this.load.spritesheet('monney_14000','assets/images/card-monney-14000.png',134, 170);
        this.load.spritesheet('monney_15000','assets/images/card-monney-15000.png',134, 170);
        
        this.load.spritesheet('button', 'assets/images/button.png', 49, 64);
        this.load.atlas('menu_asset', 'assets/images/asset_menu.png', 'assets/json/asset_menu.json');
        this.load.atlas('asset_game_play', 'assets/images/asset_game_play.png', 'assets/json/asset_game_play.json');
        this.load.atlas('asset_2', 'assets/images/asset_2.png', 'assets/json/asset_2.json')
        this.load.atlas('asset_3', 'assets/images/asset_3.png', 'assets/json/asset_3.json')
        this.load.atlas('asset_4', 'assets/images/asset_4.png', 'assets/json/asset_4.json')
        this.load.atlas('asset_btn','assets/images/asset_btn.png', 'assets/json/asset_btn.json')
        this.load.atlas('asset_card', 'assets/images/card_home_all.png', 'assets/json/asset_card_home.json')
        this.load.image('btn_friends_request', './assets/images/btn_friends_request.png');
        this.load.image('btn_friends', './assets/images/btn_friends.png');

        if(ranking && ranking !=undefined){
            ranking.forEach(player => {
                this.load.image(`avatar_${player.user_id}`, player.user_photoURL);
            });
        }
    },

    create: function() {
        this.asset.cropEnabled = false;
    },

    update: function() {
        if(!!this.ready) {
            this.game.state.start('menu',true,false,{profile:profile,ranking:ranking});
        }
    },

    onLoadComplete: function() {
        this.ready = true;
    }
};

module.exports = Preload;
