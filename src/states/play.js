// require('../model/cardsmodel');
var io =  require('../dev')
var room
var game
var playerIndex
var card_on_table_sort
var phase = 0
var cards_offer = []
var cardOnTable = []
var cardsMonney = [[],[],[],[],[]]
var temp_score
var tween = null;
var bidPrice = 0
var profile = {}
function Play() {
}
var gameOptions = {

    // flipping speed in milliseconds
    flipSpeed: 250,
  
    // flipping zoom ratio. Simulates the card to be raised when flipping
    flipZoom: 1.2
  }
Play.prototype = {
    init:function(data){
        profile = data.profile
        room = data.room
        game = data.game
        playerIndex = room.players.findIndex(player => player.user_id === profile.user_id)
    },
    preload:function(){
        console.log("-------------------------PLAYING----------------------------");
        room.players.forEach((player,i)=>{
            this.game.load.image(`avatar_player_${i}`, player.user_photoURL )
        })
    },
    create: function() {    
        this.players = []
        this.cards = []
        this.cards_monney = []
        this.my_cards = []
        
        var style_name = { font: "32px Pattaya", fill: "#fff", align: "center" };
        var style_coins = { font: "35px Pattaya", fill: "#FECD4F", align: "center" };
        var style_bid = {font: "28px Pattaya", fill: "#fff", align: "center"}
        this.background = this.game.add.image(0,0,'bg_game_play')

        for(var i = playerIndex;i<room.players.length+playerIndex;i++){
            this.players[i%room.players.length] = {}
            if(i == playerIndex){    
                this.players[i%room.players.length].circle = this.game.add.image(577,532,'asset_game_play',`frame_circle_${i%room.players.length}`)
                var default_avatar = this.make.image(0,0,'menu_asset', 'profile-2')    
                var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${i%room.players.length}`); 
                default_avatar.width = 164;
                default_avatar.height = 164;
                avatar_player.width = 164;
                avatar_player.height = 164;
                var avatar = this.game.make.bitmapData(0,0)
                avatar.alphaMask(avatar_player,default_avatar)
                this.players[i%room.players.length].avatar = this.game.add.image(577+8,532+8, avatar)

                this.game.add.image(515,564,'menu_asset','icon-coins').scale.setTo(0.7,0.7)
                this.label_coins  = this.game.add.text(505,615,`$${game.players[i%room.players.length].coins}`,style_coins)
                this.label_coins.anchor.set(1)
                this.label_coins.stroke = "#0000000";
                this.label_coins.strokeThickness = 2;
                this.players[i%room.players.length].freme_bid = this.game.add.image(this.game.world.centerX,505,'asset_game_play',`frame_bid_${i%room.players.length}`)
                this.players[i%room.players.length].freme_bid.anchor.set(0.5)
                this.players[i%room.players.length].freme_bid.scale.setTo(0,0)
                this.players[i%room.players.length].label_bid_price_freme_bid = this.game.add.text(this.game.world.centerX,507,"0",style_bid)
                this.players[i%room.players.length].label_bid_price_freme_bid.anchor.set(0.5)
                this.players[i%room.players.length].label_bid_price_freme_bid.scale.setTo(0,0)
                
            }else{
                var x = i-playerIndex == 1?66:i-playerIndex == 2?361:i-playerIndex == 3?886:1145
                var y = i-playerIndex == 1 || i-playerIndex == 4?340:60
                var color = i%room.players.length == 0?"#EA0713":i%room.players.length == 1?"#1C80E7":i%room.players.length == 2?"#D3D127":i%room.players.length == 3?"#CE4BF0":"#36E230"
                // this.add.image(x,y,'menu_asset', 'profile-1')
                this.players[i%room.players.length].circle = this.game.add.image(x-5,y-5,'asset_game_play',`frame_circle_${i%room.players.length}`)
                this.players[i%room.players.length].circle.width = 130;
                this.players[i%room.players.length].circle.height = 130;
                var default_avatar = this.make.image(0,0,'menu_asset', 'profile-1')
                var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${i%room.players.length}`); 
                default_avatar.width = 116;
                default_avatar.height = 116;
                avatar_player.width = 116;
                avatar_player.height = 116;
                var avatar = this.game.make.bitmapData(0,0)
                avatar.alphaMask(avatar_player,default_avatar)
                this.players[i%room.players.length].avatar = this.game.add.image(x+2,y+2, avatar)

                var username = room.players[i%room.players.length].user_name.split(" ")
                this.players[i%room.players.length].label_player_name = this.game.add.text(x+60,y-25,username[0],style_name)
                this.players[i%room.players.length].label_player_name.anchor.set(0.5)
                this.players[i%room.players.length].label_player_name.stroke = color;
                this.players[i%room.players.length].label_player_name.strokeThickness = 12;

                // this.game.add.image(x+125,y+20,'menu_asset','icon-coins').scale.setTo(0.4,0.4)
                this.players[i%room.players.length].freme_bid = this.game.add.image(x+60,y+150,'asset_game_play',`frame_bid_${i%room.players.length}`)
                this.players[i%room.players.length].freme_bid.anchor.set(0.5)
                this.players[i%room.players.length].freme_bid.scale.setTo(0,0)

                this.players[i%room.players.length].label_bid_price_freme_bid = this.game.add.text(x+60,y+152,"0",style_bid)
                this.players[i%room.players.length].label_bid_price_freme_bid.anchor.set(0.5)
                this.players[i%room.players.length].label_bid_price_freme_bid.scale.setTo(0,0)
            }
        }

        this.btn_pass = this.game.add.image(470,440,'asset_btn','btn_pass')
        this.btn_pass.inputEnabled = true
        this.btn_pass.input.useHandCursor = true;
        this.btn_pass.events.onInputUp.add(this.onClickPass, this);
        this.btn_pass.scale.setTo(0,0)

        this.btn_bid = this.game.add.image(693,440,'asset_btn','btn_bid')
        this.btn_bid.inputEnabled = true
        this.btn_bid.input.useHandCursor = true;
        this.btn_bid.events.onInputUp.add(this.onClickBid, this);
        this.btn_bid.scale.setTo(0,0)

        this.btn_chat = this.game.add.image(30, 600, 'menu_asset', 'chat')
        this.btn_chat.scale.setTo(0.8,0.8)
        this.btn_chat.inputEnabled = true
        this.btn_chat.input.useHandCursor = true;
        this.btn_chat.events.onInputUp.add(this.onClickChat, this);

        for (let index = 30; index >= 1; index--) {
            this.cards.push({
                value: index,
                img: this.game.add.sprite(this.game.world.centerX-25, -200,`card_${index}`,0)
            })
        }
        for (let i = 15; i >= 1; i--) {
            var value = i==1?0:i*1000
            for(let  j =0;j <2;j++){
                this.cards_monney.push({
                    value: value,
                    img: this.game.add.sprite(this.game.world.centerX-25, -200, 'monney_'+value,0),
                    active: false
                })
            }
        }
    
        //FIXME: POPUP FRAME BID
        this.popup_frame_bid = this.game.add.sprite(this.game.world.centerX,320,'asset_game_play','frame_bid')
        this.popup_frame_bid.anchor.set(0.5)
        
        this.label_bid_price_popup_frame_bid = this.game.add.text(0,-20, "0", { font: "28px Pattaya", fill: "#fff", align: "center" });
        this.label_bid_price_popup_frame_bid.anchor.set(0.5)
        this.popup_frame_bid.addChild(this.label_bid_price_popup_frame_bid)

        this.btn_minus_popup_frame_bid = this.game.add.image(-154,-51.5,'asset_game_play','btn_minus')
        this.btn_minus_popup_frame_bid.inputEnabled = true
        this.btn_minus_popup_frame_bid.input.useHandCursor = true;
        this.btn_minus_popup_frame_bid.events.onInputUp.add(this.onClickBidMinus, this);
        this.popup_frame_bid.addChild(this.btn_minus_popup_frame_bid);

        this.btn_plus_popup_frame_bid = this.game.add.image(103,-51.5,'asset_game_play','btn_plus')
        this.btn_plus_popup_frame_bid.inputEnabled = true
        this.btn_plus_popup_frame_bid.input.useHandCursor = true;
        this.btn_plus_popup_frame_bid.events.onInputUp.add(this.onClickBidPlus, this);
        this.popup_frame_bid.addChild(this.btn_plus_popup_frame_bid);

        this.btn_confirm_bid_popup_frame_bid = this.game.make.sprite(0,40, 'asset_btn','btn_confirm')
        this.btn_confirm_bid_popup_frame_bid.anchor.set(0.5)
        this.btn_confirm_bid_popup_frame_bid.scale.set(0.7)
        this.btn_confirm_bid_popup_frame_bid.inputEnabled = true
        this.btn_confirm_bid_popup_frame_bid.input.useHandCursor = true;
        this.btn_confirm_bid_popup_frame_bid.events.onInputUp.add(this.onClickConfirmBid, this);
        this.popup_frame_bid.addChild(this.btn_confirm_bid_popup_frame_bid)

        this.popup_frame_bid.scale.set(0)

        // FIXME: POPUP CHAT
        this.popup_chat = this.add.sprite(30,700,'asset_3','frame_chat')
        this.popup_chat.anchor.setTo(0,1)
        this.sticker = []
        for(var i = 1;i < 9;i++){
            var x = i%3==1?15:i%3==2?110:i%3==0?195:0;
            var y = i<=3?-270:i<=6?-180:i<=9?-100:0;
            this.sticker[i-0] = this.make.sprite(x, y, 'asset_4',`sticker_0${i}`)
            this.sticker[i-0].scale.setTo(0.4,0.4)
            this.sticker[i-0].inputEnabled = true;
            this.sticker[i-0].input.priorityID = 1;
            this.sticker[i-0].input.useHandCursor = true;
            this.sticker[i-0].events.onInputDown.add(this.onClickSticker, this);
            this.popup_chat.addChild(this.sticker[i-0])
        }

        this.btn_close_popup_chat = this.make.sprite(275, -310, 'menu_asset','btn_close')
        this.btn_close_popup_chat.scale.setTo(0.6,0.6)
        this.btn_close_popup_chat.inputEnabled = true;
        this.btn_close_popup_chat.input.priorityID = 1;
        this.btn_close_popup_chat.input.useHandCursor = true;
        this.btn_close_popup_chat.events.onInputDown.add(this.onClickClosePopup, this);
        this.popup_chat.addChild(this.btn_close_popup_chat)
        this.popup_chat.scale.set(0);


        this.label_countdown_start =  this.game.add.text(this.game.world.centerX,this.game.world.centerY,'',{ font: "100px Pattaya", fill: "#fff", align: "center" })
        this.label_countdown_start.anchor.set(0.5)
        this.label_countdown_start.scale.set(0)

        this.btn_next_phase = this.game.add.text(40,20,'ช่วงที่ :',{ font: "30px Pattaya", fill: "#fff", align: "center" })
        this.game.add.text(40,65,'รอบที่ :',{ font: "30px Pattaya", fill: "#fff", align: "center" })
        this.label_phase =  this.game.add.text(130,20,'1/2',{ font: "30px Pattaya", fill: "#fff", align: "center" })
        this.label_around =  this.game.add.text(130,65,'1/6',{ font: "30px Pattaya", fill: "#fff", align: "center" })


        //TODO: SOCKET.IO
        io.socket.on('startGame',(data) => {
            if(data.time == 0){
                this.label_countdown_start.setText("เริ่มเกม")
            }else{
                this.label_countdown_start.setText(data.time)
            }
            this.game.add.tween(this.label_countdown_start.scale).to( { x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            setTimeout(() => {
                this.game.add.tween(this.label_countdown_start.scale).to( { x: 0, y: 0 }, 1000, Phaser.Easing.Elastic.In, true);
            }, 100);
        })
        io.socket.on('dealCard',(data) => {
            this.btn_bid.scale.set(0)
            this.btn_pass.scale.set(0)
            this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);

            game = data.game
            cardOnTable = []
            this.index_cardOnTable = 0
            this.card = game.around[game.around.length-1]
            phase = game.phase
            if(phase == 2){
                if(game.around.length == 1){
                this.label_phase.setText('2/2')
                game.players.forEach(player => {
                    var x = player.key == playerIndex?577+110-20:player.key-playerIndex == 1 || player.key-playerIndex == -4?66+60:player.key-playerIndex == 2 || player.key-playerIndex == -3?361+60:player.key-playerIndex == 3||player.key-playerIndex == -2?886+60:1145+60
                    var y = player.key == playerIndex?532+110-20:player.key-playerIndex == 1 || player.key-playerIndex == 4 ||player.key-playerIndex == -4 || player.key-playerIndex == -1?340+55:player.key-playerIndex == 2 ||player.key-playerIndex == 3 ||player.key-playerIndex == -2 || player.key-playerIndex == -3?60+55:340+55
                    
                    player.cards.forEach(value => {
                        var card = this.cards.find(c => c.value == value)
                        card.img.destroy()
                        card.img = this.game.add.sprite(x, y,`card_${value}`,0)
                        card.img.anchor.set(0.5)
                        card.img.scale.set(0)
                    })
                })
                this.players.forEach((player,i) => {
                    if(i !== game.player_bidding){
                        player.circle.tint = 0xffffff;
                        player.avatar.tint = 0xffffff;
                    }
                })
                    game.players[playerIndex].cards.forEach((c,i) => {
                        this.my_cards.push({
                          val: c,
                          img: this.game.add.image(1176-((game.players[playerIndex].cards.length-i-1)*60),530,'asset_card',`card-${c}`)
                        })
                        this.my_cards[i].img.inputEnabled = true
                        this.my_cards[i].img.input.useHandCursor = true;
                        var parent = this
                        this.my_cards[i].img.events.onInputUp.add(function() {parent.onClickSelectCard(c)});
                    });
                }else{
                    this.my_cards.forEach(card => {
                        card.img.tint = 0x565656;
                    })
                }
            }
            this.game.time.events.repeat(300, 5,this.dealCard, this);
            this.label_around.setText(`${game.around.length}/6`)
            game.around[game.around.length-1] = game.around[game.around.length-1].slice(0)
            game.around[game.around.length-1].sort(function(a,b) {
                return  b-a;
            });
            setTimeout(() => {
                if(phase == 1){
                    this.label_phase.setText('1/2')
                    this.players.forEach((player,i) => {
                        if(i !== game.player_bidding){
                            player.circle.tint = 0x565656;
                            player.avatar.tint = 0x565656;
                        }
                    })
                    if(game.players[game.player_bidding].user_id === profile.user_id){
                        if(game.players[game.player_bidding].coins >= game.start_bid_price){
                            this.btn_bid.inputEnabled = true
                            this.btn_bid.tint = 0xffffff;
                        }else{
                            this.btn_bid.inputEnabled = false
                            this.btn_bid.tint = 0x565656;
                        }
                        this.btn_bid.scale.set(1)
                        this.btn_pass.scale.set(1)
                        io.socket.emit("countdown",{room_id:room.room_id,game:game})
                    }else{
                        this.btn_bid.scale.set(0)
                        this.btn_pass.scale.set(0)
                        this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
                    }
                }else if(phase == 2){
                    this.my_cards.forEach(card => {
                        card.img.tint = 0xffffff;
                        card.img.inputEnabled = true
                    })
                }
            }, 8000);
        })
        io.socket.on('pass',async data =>{
            this.btn_bid.scale.set(0)
            this.btn_pass.scale.set(0)
            this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
            game = data.game
            var index_player_old = data.game.player_before
            var x = index_player_old == playerIndex?577+110-20:index_player_old-playerIndex == 1 || index_player_old-playerIndex == -4?66+55:index_player_old-playerIndex == 2 || index_player_old-playerIndex == -3?361+55:index_player_old-playerIndex == 3||index_player_old-playerIndex == -2?886+55:1145+55
            var y = index_player_old == playerIndex?532+110-20:index_player_old-playerIndex == 1 || index_player_old-playerIndex == 4 ||index_player_old-playerIndex == -4 || index_player_old-playerIndex == -1?340+55:index_player_old-playerIndex == 2 ||index_player_old-playerIndex == 3 ||index_player_old-playerIndex == -2 || index_player_old-playerIndex == -3?60+55:340+55
            
            this.players[index_player_old].pass = this.game.add.image(x,y,'asset_game_play',`txt_${(game.players[index_player_old].bid_price/1000/2).toFixed(0)*1000}`)
            this.players[index_player_old].pass.anchor.set(0.5)
            var card = cardOnTable.find(c => c.value === data.game.players[index_player_old].cards[data.game.around.length-1])

            this.game.add.tween(card.img).to({ x:x, y:y}, 200, Phaser.Easing.Quadratic.Out, true);
            setTimeout(() => {
                this.flipCardSingle(card.img,2,0)
            }, 200);
            this.players.forEach((player,i) => {
                if(i !== game.player_bidding){
                    player.circle.tint = 0x565656;
                    player.avatar.tint = 0x565656;
                }else{
                    player.circle.tint = 0xffffff
                    player.avatar.tint = 0xffffff
                }
            })

            if(data.game.around[data.game.around.length-1].length > 1){
                if(data.game.players[data.game.player_bidding%5].user_id === profile.user_id){

                    if(game.players[game.player_bidding].coins >= game.start_bid_price){
                        this.btn_bid.inputEnabled = true
                        this.btn_bid.input.useHandCursor = true
                        this.btn_bid.tint = 0xffffff;
                    }else{
                        this.btn_bid.inputEnabled = false
                        this.btn_bid.tint = 0x565656;
                    }
                    this.btn_bid.scale.set(1)
                    this.btn_pass.scale.set(1)
                    io.socket.emit("countdown",{room_id:room.room_id,game:game})
                }else{
                    this.btn_bid.scale.set(0)
                    this.btn_pass.scale.set(0)
                    this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
                }
            }else{
                var index_player_bidding = data.game.player_bidding
                var value = game.around[game.around.length-1].pop()
                game.players[index_player_bidding].cards.push(value)
                
                var x = index_player_bidding == playerIndex?577+110-20:index_player_bidding-playerIndex == 1 || index_player_bidding-playerIndex == -4?66+60:index_player_bidding-playerIndex == 2 || index_player_bidding-playerIndex == -3?361+60:index_player_bidding-playerIndex == 3||index_player_bidding-playerIndex == -2?886+60:1145+60
                var y = index_player_bidding == playerIndex?532+110-20:index_player_bidding-playerIndex == 1 || index_player_bidding-playerIndex == 4 ||index_player_bidding-playerIndex == -4 || index_player_bidding-playerIndex == -1?340+55:index_player_bidding-playerIndex == 2 ||index_player_bidding-playerIndex == 3 ||index_player_bidding-playerIndex == -2 || index_player_bidding-playerIndex == -3?60+55:340+55
                
                this.players[index_player_bidding].pass = this.game.add.image(x,y,'asset_game_play',`txt_${game.players[index_player_bidding].bid_price}`)
                this.players[index_player_bidding].pass.anchor.set(0.5)

                game.players[index_player_bidding].coins = game.players[index_player_bidding].coins-game.players[index_player_bidding].bid_price
                this.label_coins.setText(`$${game.players[playerIndex].coins}`)
                
                
                setTimeout(() => {
                    card = cardOnTable.find(c => c.value === data.game.players[index_player_bidding].cards[data.game.around.length-1])
                    this.game.add.tween(card.img).to( { x:x, y:y}, 200, Phaser.Easing.Quadratic.Out, true);
                    setTimeout(() => {
                        this.flipCardSingle(card.img,2,0)
                    }, 200);
                }, 200);

                setTimeout(() => {
                    this.players.forEach(player => {
                        if(player.pass && player.pass !== undefined){
                            player.pass.scale.setTo(0,0)
                        }
                        player.freme_bid.scale.setTo(0,0)
                        player.label_bid_price_freme_bid.scale.setTo(0,0)
                        player.label_bid_price_freme_bid.setText('0')
                        player.circle.tint = 0xffffff
                        player.avatar.tint = 0xffffff
    
                    })
                    if(game.players[data.game.player_bidding%5].user_id === profile.user_id && game.cards_stack.length > 0 ){
                        io.socket.emit('dealCard',{room_id:room.room_id,game:data.game})
                    }else if(game.players[data.game.player_bidding%5].user_id === profile.user_id && game.around[5] && game.around[5] !== undefined && game.around[5].length == 0 ){
                        io.socket.emit('phase_2',{room_id:room.room_id,game:data.game})
                    }
                }, 1000);
            }
        })
        io.socket.on('bid',data => {
            game = data.game
            this.players.forEach((player,i) => {
                if(i !== game.player_bidding){
                    player.circle.tint = 0x565656;
                    player.avatar.tint = 0x565656;
                }else{
                    player.circle.tint = 0xffffff
                    player.avatar.tint = 0xffffff
                }
            })
            if(game.players[game.player_bidding%5].user_id === profile.user_id){
                if(game.players[game.player_bidding].coins >= game.start_bid_price){
                    this.btn_bid.inputEnabled = true
                    this.btn_bid.input.useHandCursor = true
                    this.btn_bid.tint = 0xffffff;
                }else{
                    this.btn_bid.inputEnabled = false
                    this.btn_bid.tint = 0x565656;
                }
                this.btn_bid.scale.set(1)
                this.btn_pass.scale.set(1)
                io.socket.emit("countdown",{room_id:room.room_id,game:game})
            }else{
                this.btn_bid.scale.set(0)
                this.btn_pass.scale.set(0)
                this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
            }
            var index_player_old = game.player_before
            this.players[index_player_old].freme_bid.scale.setTo(1,1)
            this.players[index_player_old].label_bid_price_freme_bid.scale.setTo(1,1)
            this.players[index_player_old].label_bid_price_freme_bid.setText(`$${game.players[index_player_old].bid_price}`)
        })
        io.socket.on('offer',data => {
            game = data.game

            if(game.players[playerIndex].active == false){
                var index = this.my_cards.findIndex(c => c.val === game.players[playerIndex].offer_card)
                if(index !== undefined && index !== -1){
                    this.my_cards[index].img.scale.set(0)
                    this.my_cards.splice(index, 1);   
                }
                game.players[playerIndex].cards.forEach((c,i) => {
                    this.game.add.tween(this.my_cards[i].img).to( { x:1176-((game.players[playerIndex].cards.length-i-1)*60), y:530}, 200, Phaser.Easing.Quadratic.Out, true);
                })

                this.my_cards.forEach( card => {
                    card.img.tint = 0x565656;
                    card.img.inputEnabled = false
                })

            }

            game.players.forEach(player => {
                if(player.active == false){
                    var card = this.cards.find(c => c.value === player.offer_card)
                    card.img.scale.set(1)
                }
            })

            if(game.players.find(player => player.active == true) == undefined ){
                cards_offer = []
                game.players.forEach(player => {
                        var card = this.cards.find(c => c.value === player.offer_card)
                        card.flipTween = this.game.add.tween(card.img.scale).to({
                            x: 0,
                            y: gameOptions.flipZoom
                        }, gameOptions.flipSpeed / 2, Phaser.Easing.Linear.None);
                        
                        // once the card is flipped, we change its frame and call the second tween
                        card.flipTween.onComplete.add(function(){
                            card.img.frame = 1 - card.img.frame;
                            card.backFlipTween.start();
                        }, this);
                        
                        // second tween: we complete the flip and lower the card
                        card.backFlipTween = this.game.add.tween(card.img.scale).to({
                            x: 1,
                            y: 1
                        }, gameOptions.flipSpeed / 2, Phaser.Easing.Linear.None);
                        cards_offer.push(card)
                })
                cards_offer.forEach(c => {
                    c.flipTween.start()
                })
                cards_offer = cards_offer.slice(0)
                cards_offer.sort(function(a,b) {
                    return  b.value-a.value;
                });
                setTimeout(() => {
                    var index = 4
                    this.moveCardMonney(index)
                }, 3000);
            }
        })
        io.socket.on('score_summary',data => {
            game = data.game

            this.color_overlay = this.game.add.bitmapData(this.game.world.width,this.game.world.height);
            this.color_overlay.ctx.beginPath();
            this.color_overlay.ctx.rect(0,0,this.game.world.width,this.game.world.height);
            this.color_overlay.ctx.fillStyle = '#000000';
            this.color_overlay.ctx.fill();
            this.backgroud_overlay = this.game.add.sprite(0, 0, this.color_overlay);
            this.backgroud_overlay.alpha = 0.7;

            temp_score = data.game.players
            this.frame_score_sumary = this.game.add.image(this.game.world.centerX,350,'asset_game_play','frame_score_summary_123')
            this.frame_score_sumary.anchor.set(0.5)
            this.game.add.image(320,480,'asset_game_play','frame_score_summary_other')
            this.game.add.text(328,505,"4", {font: '40px Pattaya', fill: '#fff'})
            this.game.add.image(682,480,'asset_game_play','frame_score_summary_other')
            this.game.add.text(690,505,"5", {font: '40px Pattaya', fill: '#fff'})
            this.btn_back_to_menu = this.game.add.image(this.game.world.centerX,665,'asset_btn','btn_back_to_menu')
            this.btn_back_to_menu.anchor.set(0.5)
            this.btn_back_to_menu.inputEnabled = true;
            this.btn_back_to_menu.input.priorityID = 1;
            this.btn_back_to_menu.input.useHandCursor = true;
            this.btn_back_to_menu.events.onInputDown.add(this.onClickBackToMenu, this);
            
            temp_score.sort(function(a,b) {
                return  b.coins-a.coins;
            });
            temp_score.forEach((player,i) =>{
                var color = player.key == 0?"#EA0713":player.key == 1?"#1C80E7":player.key == 2?"#D3D127":player.key == 3?"#CE4BF0":"#36E230"
                var username = player.user_name.split(" ")
                if(i == 0){
                    var circle = this.game.add.image(592,75,'asset_game_play',`frame_circle_${player.key}`)
                    circle.width = 150;
                    circle.height = 150;
                    var default_avatar = this.make.image(0,0,'menu_asset', 'profile-2')    
                    var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${player.key}`); 
                    default_avatar.width = 138;
                    default_avatar.height = 138;
                    avatar_player.width = 138;
                    avatar_player.height = 138;
                    var avatar = this.game.make.bitmapData(0,0)
                    avatar.alphaMask(avatar_player,default_avatar)
                    this.game.add.image(592+6,75+6, avatar)
                    var player_name = this.game.add.text(667,50,username[0],{ font: "32px Pattaya", fill: "#fff", align: "center" })
                    player_name.anchor.set(0.5)
                    player_name.stroke = color;
                    player_name.strokeThickness = 8;
                    var player_conis = this.game.add.text(667,260,player.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '32px Pattaya', fill: '#fff'})
                    player_conis.anchor.set(0.5)
                    player_conis.stroke = "#E16E53";;
                    player_conis.strokeThickness = 5;
                }else if(i == 1){
                    var circle = this.game.add.image(430,165,'asset_game_play',`frame_circle_${player.key}`)
                    circle.width = 140;
                    circle.height = 140;
                    var default_avatar = this.make.image(0,0,'menu_asset', 'profile-2')    
                    var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${player.key}`); 
                    default_avatar.width = 130;
                    default_avatar.height = 130;
                    avatar_player.width = 130;
                    avatar_player.height = 130;
                    var avatar = this.game.make.bitmapData(0,0)
                    avatar.alphaMask(avatar_player,default_avatar)
                    this.game.add.image(430+5,165+5, avatar)
                    var player_name = this.game.add.text(500,140,username[0],{ font: "28px Pattaya", fill: "#fff", align: "center" })
                    player_name.anchor.set(0.5)
                    player_name.stroke = color;
                    player_name.strokeThickness = 8;
                    var player_conis = this.game.add.text(500,340,player.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '28px Pattaya', fill: '#fff'})
                    player_conis.anchor.set(0.5)
                    player_conis.stroke = "#E16E53";;
                    player_conis.strokeThickness = 5;
                }else if(i == 2){
                    var circle = this.game.add.image(765,200,'asset_game_play',`frame_circle_${player.key}`)
                    circle.width = 130;
                    circle.height = 130;
                    var default_avatar = this.make.image(0,0,'menu_asset', 'profile-2')    
                    var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${player.key}`); 
                    default_avatar.width = 120;
                    default_avatar.height = 120;
                    avatar_player.width = 120;
                    avatar_player.height = 120;
                    var avatar = this.game.make.bitmapData(0,0)
                    avatar.alphaMask(avatar_player,default_avatar)
                    this.game.add.image(765+5,200+5, avatar)
                    var player_name = this.game.add.text(830,175,username[0],{ font: "26px Pattaya", fill: "#fff", align: "center" })
                    player_name.anchor.set(0.5)
                    player_name.stroke = color;
                    player_name.strokeThickness = 8;
                    var player_conis = this.game.add.text(830,365,player.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '26px Pattaya', fill: '#fff'})
                    player_conis.anchor.set(0.5)
                    player_conis.stroke = "#E16E53";;
                    player_conis.strokeThickness = 5;
                }else if(i == 3){
                    var circle = this.game.add.image(380,490,'asset_game_play',`frame_circle_${player.key}`)
                    circle.width = 105;
                    circle.height = 105;
                    var default_avatar = this.make.image(0,0,'menu_asset', 'profile-2')    
                    var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${player.key}`); 
                    default_avatar.width = 99;
                    default_avatar.height = 99;
                    avatar_player.width = 99;
                    avatar_player.height = 99;
                    var avatar = this.game.make.bitmapData(0,0)
                    avatar.alphaMask(avatar_player,default_avatar)
                    this.game.add.image(380+3,490+3, avatar)
                    this.game.add.text(500,500,username[0],{ font: "26px Pattaya", fill: "#37659F", align: "center" })
                    this.game.add.text(500,545,player.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '24px Pattaya', fill: '#E16E53'})
                }else if(i == 4){
                    var circle = this.game.add.image(742,490,'asset_game_play',`frame_circle_${player.key}`)
                    circle.width = 105;
                    circle.height = 105;
                    var default_avatar = this.make.image(0,0,'menu_asset', 'profile-2')    
                    var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${player.key}`); 
                    default_avatar.width = 99;
                    default_avatar.height = 99;
                    avatar_player.width = 99;
                    avatar_player.height = 99;
                    var avatar = this.game.make.bitmapData(0,0)
                    avatar.alphaMask(avatar_player,default_avatar)
                    this.game.add.image(742+3,490+3, avatar)
                    this.game.add.text(862,500,username[0],{ font: "26px Pattaya", fill: "#37659F", align: "center" })
                    this.game.add.text(862,545,player.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '24px Pattaya', fill: '#E16E53'})
                }
            })
            io.socket.emit('leave',{room_id:room.room_id})
        })
        io.socket.on("countdown",data => {
            this.label_time.setText(data.time)
        })
        io.socket.on("chat",data => {
            var player = game.players.find(player => player.user_id == data.message.message_by)
            var x = player.key == playerIndex?577+110-20:player.key-playerIndex == 1 || player.key-playerIndex == -4?66+55:player.key-playerIndex == 2 || player.key-playerIndex == -3?361+55:player.key-playerIndex == 3||player.key-playerIndex == -2?886+55:1145+55
            var y = player.key == playerIndex?532+110-20:player.key-playerIndex == 1 || player.key-playerIndex == 4 ||player.key-playerIndex == -4 || player.key-playerIndex == -1?340+55:player.key-playerIndex == 2 ||player.key-playerIndex == 3 ||player.key-playerIndex == -2 || player.key-playerIndex == -3?60+55:340+55
            if(this.players[player.key].img_message != undefined){
               this.players[player.key].img_message.destroy()
            }
            this.players[player.key].img_message = this.game.add.image(x,y,'asset_4',data.message.message_content)
            this.players[player.key].img_message.anchor.set(0.5)
            this.players[player.key].img_message.scale.set(0)
            this.game.add.tween(this.players[player.key].img_message.scale).to( { x: 1, y: 1 }, 800, Phaser.Easing.Elastic.Out, true);
            setTimeout(() => {
                this.game.add.tween(this.players[player.key].img_message.scale).to( { x: 0, y: 0 }, 2000, Phaser.Easing.Elastic.In, true);
            }, 1500);
        })
        
    },
    dealCard:async function() {
        val = this.card[this.index_cardOnTable]
        if(phase == 1){
            cardOnTable.push(this.cards.find(c => c.value === val))
        }else if(phase == 2){
            var card = this.cards_monney[this.cards_monney.findIndex(c => c.value === val && c.active == false)]
            card.active = true
            cardOnTable.push(card)
        }

        //animate card
        var tween = this.game.add
        .tween(cardOnTable[this.index_cardOnTable].img)
        .to( { x:350+(150*this.index_cardOnTable), y:340}, 200, Phaser.Easing.Quadratic.Out, true);
        cardOnTable[this.index_cardOnTable].img.anchor.setTo(0.5);
        this.index_cardOnTable++
        //flip card
        if(this.index_cardOnTable == 5){
            this.index_cardOnTable = 0
            this.game.time.events.repeat(Phaser.Timer.SECOND, 5,this.flipCard, this);
        }
    },
    flipCard:function(){
        this.flipTween = this.game.add.tween(cardOnTable[this.index_cardOnTable].img.scale).to({
            x: 0,
            y: gameOptions.flipZoom
        }, gameOptions.flipSpeed / 2, Phaser.Easing.Linear.None);
        
        // once the card is flipped, we change its frame and call the second tween
        this.flipTween.onComplete.add(function(){
            cardOnTable[this.index_cardOnTable].img.frame = 1 - cardOnTable[this.index_cardOnTable].img.frame;
            this.backFlipTween.start();
            this.index_cardOnTable++ 
        }, this);
        
        // second tween: we complete the flip and lower the card
        this.backFlipTween = this.game.add.tween(cardOnTable[this.index_cardOnTable].img.scale).to({
            x: 1,
            y: 1
        }, gameOptions.flipSpeed / 2, Phaser.Easing.Linear.None);
        this.flipTween.start();
    },
    flipCardSingle:function(card,time,scale){
        this.flipTween = this.game.add.tween(card.scale).to({
            x: 0,
            y: gameOptions.flipZoom
        }, time / 2, Phaser.Easing.Linear.None);
        
        // once the card is flipped, we change its frame and call the second tween
        this.flipTween.onComplete.add(function(){
            card.frame = 1 - card.frame;
            this.backFlipTween.start();
        }, this);
        
        // second tween: we complete the flip and lower the card
        this.backFlipTween = this.game.add.tween(card.scale).to({
            x: scale,
            y: scale
        }, time / 2, Phaser.Easing.Linear.None);
        this.flipTween.start();
    },
    scoreSummary: function(){

    },
    onClickPass: function() {
        this.btn_bid.scale.set(0)
        this.btn_pass.scale.set(0)
        if (tween && tween.isRunning || this.popup_frame_bid.scale.x === 1)
        {
            tween = this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
        }

        var value = game.around[game.around.length-1].pop()
        game.players[game.player_bidding].cards.push(value)
        game.players[game.player_bidding].coins = game.players[game.player_bidding].coins-(game.players[game.player_bidding].bid_price/1000/2).toFixed(0)*1000
        
        this.label_coins.setText(`$${game.players[playerIndex].coins}`)
        game.players[game.player_bidding].active = false
        game.bid[game.player_bidding] = 0
        io.socket.emit('pass',{room_id:room.room_id,game:game})

    },
    onClickBid: function() {
        this.btn_bid.inputEnabled = false
        this.btn_bid.tint = 0x565656;
        bidPrice = game.start_bid_price
        this.label_bid_price_popup_frame_bid.setText(bidPrice)
        this.popup_frame_bid.children[1].inputEnabled = false
        this.popup_frame_bid.children[1].tint = 0x565656;
        tween = this.game.add.tween(this.popup_frame_bid.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    },
    onClickBidPlus: function(){
        bidPrice = bidPrice+1000
        this.label_bid_price_popup_frame_bid.setText(bidPrice)

        this.popup_frame_bid.children[1].inputEnabled = true
        this.popup_frame_bid.children[1].tint = 0xffffff;

        if(bidPrice == game.players[game.player_bidding].coins){
            this.popup_frame_bid.children[2].inputEnabled = false
            this.popup_frame_bid.children[2].tint = 0x565656;
        }
    },
    onClickBidMinus: function(){
        bidPrice = bidPrice-1000
        this.label_bid_price_popup_frame_bid.setText(bidPrice)
        
        this.popup_frame_bid.children[2].inputEnabled = true
        this.popup_frame_bid.children[2].tint = 0xffffff;
        
        if(bidPrice == Math.max.apply(Math, game.players.map(function(player) { return player.bid_price; }))+1000){
            this.popup_frame_bid.children[1].inputEnabled = false
            this.popup_frame_bid.children[1].tint = 0x565656;
        }
    },
    onClickConfirmBid: function(){
        this.btn_bid.scale.set(0)
        this.btn_pass.scale.set(0)
        this.game.add.tween(this.popup_frame_bid.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
        game.players[game.player_bidding].bid_price = bidPrice
        game.start_bid_price = Math.max.apply(Math, game.players.map(function(player) { return player.bid_price; }))+1000
        // io.socket.emit('countdown_end')
        io.socket.emit('bid',{room_id:room.room_id,game:game})
    },
    onClickSelectCard: function(val){
        var index = game.players[playerIndex].cards.findIndex(c => c === val)
        if(index !== undefined && index !== -1){
            game.players[playerIndex].cards.splice(index, 1);
        }
        game.players[playerIndex].offer_card = val
        game.players[playerIndex].active = false
        
        io.socket.emit('offer',{room_id:room.room_id,game:game})
    },
    moveCardMonney: function(i){
        var player = game.players.find(player => player.offer_card === cards_offer[i].value)
        var x = player.key == playerIndex?577+110-20:player.key-playerIndex == 1 || player.key-playerIndex == -4?66+60:player.key-playerIndex == 2 || player.key-playerIndex == -3?361+60:player.key-playerIndex == 3||player.key-playerIndex == -2?886+60:1145+60
        var y = player.key == playerIndex?532+110-20:player.key-playerIndex == 1 || player.key-playerIndex == 4 ||player.key-playerIndex == -4 || player.key-playerIndex == -1?340+55:player.key-playerIndex == 2 ||player.key-playerIndex == 3 ||player.key-playerIndex == -2 || player.key-playerIndex == -3?60+55:340+55

        var val = game.around[game.around.length-1].pop()
        var card = cardOnTable.find(c => c.value === val && c.moved == undefined)
        this.game.add.tween(card.img).to({ x:x, y:y}, 300, Phaser.Easing.Quadratic.Out, true);
        card.moved = true
        
        this.game.add.tween(card.img.scale).to({ x:0, y:0}, 600,Phaser.Easing.Quadratic.Out, true);
        game.players[player.key].coins = game.players[player.key].coins+card.value
        cardsMonney[player.key].push(card.value)
        if(player.user_id == profile.user_id){
            this.label_coins.setText(`$${game.players[player.key].coins}`)
        }
        if(game.around[game.around.length-1].length == 0){
            cards_offer.forEach(card => {
                this.flipCardSingle(card.img,2,0)
            })
        }
        setTimeout(() => {
            if(game.around[game.around.length-1].length == 0){
                if(game.cards_stack.length > 0 && playerIndex === player.key){
                    setTimeout(() => {
                        io.socket.emit('dealCard',{room_id:room.room_id,game:game})
                    }, 400);   
                }else if(game.cards_stack.length == 0 && playerIndex === player.key){
                    io.socket.emit('score_summary',{room_id:room.room_id,game:game})
                }
            }else if(game.around[game.around.length-1].length > 0){
                i--
                if(i >= 0){
                    this.moveCardMonney(i)
                }
            }
        }, 600);
    },
    onClickChat:function(){
        if ((tween !== null && tween.isRunning) || this.popup_chat.scale.x === 1){return;}
        //  Create a tween that will pop-open the window, but only if it's not already tweening or open
        tween = this.game.add.tween(this.popup_chat.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    },
    onClickClosePopup:function(sprite) {
        if(sprite.parent.frameName === "frame_chat"){
            if ((tween !== null && tween.isRunning) || this.popup_chat.scale.x === 0){return;}
            tween = this.game.add.tween(this.popup_chat.scale).to( { x: 0, y: 0 }, 500, Phaser.Easing.Elastic.In, true);
        }
    },
    onClickSticker:function(sprite){
        var message = {
            message_by : profile.user_id,
            message_content : sprite.frameName
        }
        io.socket.emit('chat',{room_id:room.room_id,message:message})
    },
    onClickBackToMenu:function(){
        this.game.state.start('menu',true,false,{profile:profile});
    }
};    
module.exports = Play;
    