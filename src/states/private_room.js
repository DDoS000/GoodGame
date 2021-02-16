'use strict'
import { ListView } from 'phaser-list-view'

var io =  require('../dev')
var popup_find_friend;
var tween = null;
let txtUid = ""
var default_avatar
var popup_confirm
var ranking
var private_room
var players = [{},{},{},{},{}]
var profile = []

function Private() {
}

Private.prototype = {
  init: function(data){
    profile = data.profile
    ranking = data.ranking
    private_room = data.private_room
  },
  preload: function() {
    this.load.image('my_avatar', profile.user_photoURL); 
    default_avatar = this.add.image(0,0,'menu_asset', 'profile-1')
  },
  create:async function() {
    console.log("------------PRIVATE---------------");
    
    // TODO: SOCKET.IO 
    io.socket.on('closed_room',()=>{
      io.socket.emit('leave_room',{private_room})
      this.game.state.start('menu',true,false,{profile:profile,ranking:ranking});
    })
    io.socket.on('join_room',(data)=>{
      this.game.state.start('private_room',true,false,{profile:profile,ranking:ranking,private_room:data.private_room});
    })
    io.socket.on('players_in_private_room',async (data)=>{
      data.private_room.players = data.players
      private_room = data.private_room
      
      data.private_room.players.forEach(async (player,i)=> {
        await this.game.load.image(`avatar_player_${i}`, player.user_photoURL )
        await this.game.load.onLoadComplete.addOnce(onLoaded,this)
        await this.game.load.start()
        function onLoaded(){
          default_avatar.width = 120;
          default_avatar.height = 120;
          
          var x = i==0?457:i==1?747:i==2?312:i==3?602:892
          var y = i==0 || i==1?255:425
          var username = player.user_name.split(" ")
          players[i].name.setText(username[0])
          var avatar_player =  this.game.make.sprite(0,0,`avatar_player_${i}`); 
          avatar_player.width = 120;
          avatar_player.height = 120;
          var avatar = this.game.make.bitmapData(0,0)
          avatar.alphaMask(avatar_player,default_avatar)
          players[i].avatar = this.game.add.image(x+5,y+5, avatar)
          mid_layer.add(players[i].avatar)
          if(i != 0){
            players[i].btn_invite.inputEnabled = false
          }
        }
      })
      for(var i = data.private_room.players.length;i<5;i++){
        var x = i==0?457:i==1?747:i==2?312:i==3?602:892
        var y = i==0 || i==1?255:425  
        default_avatar.width = 120;
        default_avatar.height = 120;
        players[i].name.setText('')
        var avatar = this.game.make.bitmapData(0,0)
        avatar.alphaMask(default_avatar,default_avatar)
        players[i].avatar = this.game.add.image(x+5,y+5, avatar)
        mid_layer.add(players[i].avatar)
        if(i != 0){
          players[i].btn_invite = this.game.add.image(x+40,y+40,'asset_2','btn_plus')
          players[i].btn_invite.scale.setTo(0.8,0.8)
          players[i].btn_invite.inputEnabled = true
          players[i].btn_invite.input.useHandCursor = true;
          players[i].btn_invite.events.onInputUp.add(this.onClickInviteFriend, this);
          mid_layer.add(players[i].btn_invite) 
        }
      }
      if(data.private_room.players.length < 5){
        this.btn_start_game.inputEnabled = false
        this.btn_start_game.tint = 0x565656;
      }else{
        this.btn_start_game.inputEnabled = true
        this.btn_start_game.input.useHandCursor = true;
        this.btn_start_game.tint = 0xffffff;
      }

    })

    io.socket.on('invited_friend',(data) =>{
      this.renderConfirmationWindow(data,2,this)
    })
    
    io.socket.on('start_game',data => {
      this.game.state.start('play',true,false,{profile:profile,room:data.private_room,game:data.game});
    })

    var style_name = { font: "32px Pattaya", fill: "#fff", align: "center" };
    var style_rank = { font: "30px Pattaya", fill: "#fff", align: "center" };

    this.background = this.game.add.image(0,0,'bg_private_room')
    
    this.btn_friends = this.game.add.image(1204, 30, 'menu_asset', 'friends')
    this.btn_friends.scale.setTo(0.8,0.8)
    this.btn_friends.inputEnabled = true;
    this.btn_friends.input.useHandCursor = true;
    this.btn_friends.events.onInputDown.add(this.onClickSetScale,this)
    this.btn_friends.events.onInputUp.add(this.onClickFriends, this);

    this.btn_back = this.game.add.image(30, 30, 'menu_asset', 'back')
    this.btn_back.scale.setTo(0.8,0.8)
    this.btn_back.inputEnabled = true;
    this.btn_back.input.useHandCursor = true;
    this.btn_back.events.onInputDown.add(this.onClickSetScale,this)
    this.btn_back.events.onInputUp.add(this.onClickBack, this);

    var mid_layer = this.game.add.group();
    for(var i = 0;i<5;i++){
      var x = i==0?457:i==1?747:i==2?312:i==3?602:892
      var y = i==0 || i==1?255:425
      mid_layer.add(this.game.add.image(x,y,'menu_asset', 'profile-3'))
      players[i].name = this.game.add.text(x+68,y-20, '', style_name);
      players[i].name.anchor.set(0.5)
      players[i].name.stroke = "#4F9BD7";
      players[i].name.strokeThickness = 8;
      if(i != 0){
        players[i].btn_invite = this.game.add.image(x+40,y+40,'asset_2','btn_plus')
        players[i].btn_invite.scale.setTo(0.8,0.8)
        mid_layer.add(players[i].btn_invite)
      }
    }
    if(private_room.players[0].user_id === profile.user_id){
      this.btn_start_game = this.game.add.image(this.game.world.centerX,670,'asset_btn','btn_start_game')
      this.btn_start_game.anchor.set(0.5)
      this.btn_start_game.inputEnabled = true
      this.btn_start_game.input.useHandCursor = true;
      this.btn_start_game.events.onInputUp.add(this.onClickStartGame, this);
    }

    this.color_overlay = this.game.add.bitmapData(this.game.world.width,this.game.world.height);
    this.color_overlay.ctx.beginPath();
    this.color_overlay.ctx.rect(0,0,this.game.world.width,this.game.world.height);
    this.color_overlay.ctx.fillStyle = '#000000';
    this.color_overlay.ctx.fill();
    this.backgroud_overlay = this.game.add.sprite(0, 0, this.color_overlay);
    this.backgroud_overlay.alpha = 0.7;
    this.backgroud_overlay.scale.set(0)
    // render



    // FIXME: POPUP FRIEND LIST
    this.popup_friend_list = this.add.sprite(366,29,'asset_2','frame_list_view_friends')

    this.btn_close_popup_friend_list = this.game.make.sprite(this.popup_friend_list.width-20, -10, 'menu_asset','btn_close');
    this.btn_close_popup_friend_list.scale.setTo(0.6,0.6)
    this.btn_close_popup_friend_list.inputEnabled = true;
    this.btn_close_popup_friend_list.input.priorityID = 1;
    this.btn_close_popup_friend_list.input.useHandCursor = true;
    this.btn_close_popup_friend_list.events.onInputDown.add(this.onClickClosePopup, this);
    this.popup_friend_list.addChild(this.btn_close_popup_friend_list);

    this.btn_find_friend_popup_friend_list = this.game.add.image(435, 600, 'asset_btn','btn_find')
    this.btn_find_friend_popup_friend_list.inputEnabled = true;
    this.btn_find_friend_popup_friend_list.input.priorityID = 1;
    this.btn_find_friend_popup_friend_list.input.useHandCursor = true;
    this.btn_find_friend_popup_friend_list.events.onInputUp.add(this.onClickFindFriend, this);  
    this.popup_friend_list.addChild(this.btn_find_friend_popup_friend_list)

    this.btn_friends_popup_friend_list = this.game.add.image(20, 600,'asset_btn','btn_friends')
    this.btn_friends_popup_friend_list.inputEnabled = true;
    this.btn_friends_popup_friend_list.input.priorityID = 1;
    this.btn_friends_popup_friend_list.input.useHandCursor = true;
    this.btn_friends_popup_friend_list.events.onInputUp.add(this.onClickFriendsList, this);
    this.popup_friend_list.addChild(this.btn_friends_popup_friend_list)

    this.btn_friends_request_popup_friend_list = this.game.add.image(150, 600,'asset_btn', 'btn_friends_request')
    this.btn_friends_request_popup_friend_list.inputEnabled = true;
    this.btn_friends_request_popup_friend_list.input.priorityID = 1;
    this.btn_friends_request_popup_friend_list.input.useHandCursor = true;
    this.btn_friends_request_popup_friend_list.events.onInputUp.add(this.onClickFriendsRequest, this);  
    this.popup_friend_list.addChild(this.btn_friends_request_popup_friend_list)

    this.loading_popup_friend_list = this.game.add.sprite(265, 250, 'loading');
    this.loading_popup_friend_list.animations.add('run');
    this.loading_popup_friend_list.animations.play('run', 15, true);
    this.loading_popup_friend_list.scale.set(0)
    this.popup_friend_list.addChild(this.loading_popup_friend_list)

    this.label_not_found = this.game.add.text(300, 290, '',{font: '32px Pattaya', fill: '#fff'});
    this.label_not_found.anchor.set(0.5)
    this.popup_friend_list.addChild(this.label_not_found)

    this.popup_friend_list.scale.set(0);
    
  },
  onClickBack: function(param) {
    param.scale.setTo(0.8,0.8)
    param.position.setTo(param.position.x*1.005,param.position.y*1.05)
    io.socket.emit('leave_room',{private_room:private_room,profile:profile})
    this.game.state.start('menu',true,false,{profile:profile,ranking:ranking});
  },
  //TODO: Actions On Click
  onClickStartGame: async function(param) {
    io.socket.emit('start_game',{private_room})
  },

  onClickInviteFriend:async function(param) {
    // FIXME: LIST FRIENDS
    this.list_view_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.popup_friend_list.children[2].scale.set(0)
    this.popup_friend_list.children[3].scale.set(0)
    this.onClickPopup()
    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    tween = this.game.add.tween(this.popup_friend_list.scale).to( { x: 1, y: 1 }, 1, Phaser.Easing.Elastic.Out, true);
    await this.onClickFriendsList()
  },
  onClickFriends:async function(param) {
    param.scale.setTo(0.8,0.8)
    param.position.setTo(param.position.x*1.005,param.position.y*1.05)
    
    // FIXME: LIST FRIENDS
    this.list_view_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.popup_friend_list.children[2].scale.set(1)
    this.popup_friend_list.children[3].scale.set(1)
    this.onClickPopup()
    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    this.game.add.tween(this.popup_friend_list.scale).to( { x: 1, y: 1 }, 1, Phaser.Easing.Elastic.Out, true);
    await this.onClickFriendsList()
  },
  onClickFriendsList:async function(){
    this.list_view_friends.destroy()
    this.list_view_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.loading_popup_friend_list.scale.set(0.2)
    this.label_not_found.setText('')
    await db.collection("users").where("user_id","==",profile.user_id).get().then(async(querySnapshot) => {
      profile = querySnapshot.docs[0].data()
      await db.collection("users").where("friends", "array-contains", profile.user_id).get().then((querySnapshot) => {
        if(querySnapshot.docs.length > 0){
          querySnapshot.docs.forEach(async element => {
            var renderListFriends = this.renderListFriends
            var parent = this
            var status = await io.checkStatusOnline(element.data().user_id)
            await this.game.load.image(`avatar_friends_${element.data().user_id}`, element.data().user_photoURL )
            await this.game.load.onLoadComplete.addOnce(onLoaded,this)
            await this.game.load.start()
            function onLoaded(){
              renderListFriends(element.data(),status,parent);
              parent.loading_popup_friend_list.scale.set(0)
            }
          });
        }else{
          this.loading_popup_friend_list.scale.set(0)
          this.label_not_found.setText('ไม่พบรายชื่อเพื่อน')
        }
      })
    });
  },
  onClickAddFriend:async function(uid,sprite){
    await io.addFriends(uid)
    profile = io.updateProfile()
  },
  onClickConfirmFriends:async function(uid){
    await io.confirmFriends(uid)
    profile = await io.updateProfile()
    this.onClickFriendsRequest()
    
  },
  onClickCancelFriends:async function(uid){
    await io.cancelFriends(uid)
    this.onClickFriendsRequest()
  },
  onClickFriendsRequest:async function(){
    this.list_view_friends.destroy()
    this.list_view_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.loading_popup_friend_list.scale.set(0.2)
    this.label_not_found.setText('')
    await db.collection("users").where("user_id","==",profile.user_id).get().then((querySnapshot) => {
      profile = querySnapshot.docs[0].data()
      if(profile.friends_request.length > 0){
        profile.friends_request.forEach(async user_id => {
          db.collection("users").where("user_id","==",user_id).get().then((query) => {
            query.docs.forEach(async element => {
              var renderListFriends = this.renderListFriends
              var status = await io.checkStatusOnline(element.data().user_id)
              await this.game.load.image(`avatar_friends_${element.data().user_id}`, element.data().user_photoURL )
              await this.game.load.onLoadComplete.addOnce(onLoaded,this)
              await this.game.load.start()
              function onLoaded(){
                renderListFriends(element.data(),status,this);
                this.loading_popup_friend_list.scale.set(0)
              }
            });
          })
        });
      }else{
        this.loading_popup_friend_list.scale.set(0)
        this.label_not_found.setText("ไม่พบคำร้องขอเป็นเพื่อน")
      }
    })
  },
  onClickConfirmInvite:function(uid,param){
    param.scale.setTo(1,1)
    param.position.setTo(400, 40)
    io.inviteFriend(uid,private_room)
  },
  onClickFindFriend:function(param){
    //FIXME: POPUP FIND FRIENDS
    popup_find_friend = this.add.sprite(this.game.world.centerX,this.game.world.centerY,'asset_2','frame_find_uid')
    popup_find_friend.anchor.set(0.5);
    popup_find_friend.inputEnabled = true;
    popup_find_friend.input.enableDrag();

    this.labelUid = this.game.add.text(0,-160, txtUid, { font: "28px Pattaya", fill: "#fff", align: "center" });
    this.labelUid.anchor.set(0.5)

    var btn_close2 = this.game.make.sprite((popup_find_friend.width/2)-20,-(popup_find_friend.height/2) -10, 'menu_asset','btn_close');
    btn_close2.scale.setTo(0.6,0.6)
    btn_close2.inputEnabled = true;
    btn_close2.input.priorityID = 1;
    btn_close2.input.useHandCursor = true;
    btn_close2.events.onInputDown.add(this.onClickClosePopup, this);

    var btn_confirm = this.game.make.sprite(0,205, 'asset_btn','btn_confirm');
    btn_confirm.scale.setTo(0.7,0.7)
    btn_confirm.anchor.set(0.5)
    btn_confirm.inputEnabled = true;
    btn_confirm.input.priorityID = 1;
    btn_confirm.input.useHandCursor = true;
    btn_confirm.events.onInputDown.add(this.onClickFindConfirm, this);

    var btn_no_0 = this.game.make.sprite(-33,97, 'asset_2','btn_no_0');
    btn_no_0.inputEnabled = true
    btn_no_0.input.priorityID = 2;
    btn_no_0.input.useHandCursor = true;
    btn_no_0.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_1 = this.game.make.sprite(-103,25, 'asset_2','btn_no_1');
    btn_no_1.inputEnabled = true
    btn_no_1.input.priorityID = 2;
    btn_no_1.input.useHandCursor = true;
    btn_no_1.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_2 = this.game.make.sprite(-33,25, 'asset_2','btn_no_2');
    btn_no_2.inputEnabled = true
    btn_no_2.input.priorityID = 2;
    btn_no_2.input.useHandCursor = true;
    btn_no_2.events.onInputDown.add(this.onClickNumber, this);
    
    var btn_no_3 = this.game.make.sprite(37,25, 'asset_2','btn_no_3');
    btn_no_3.inputEnabled = true
    btn_no_3.input.priorityID = 2;
    btn_no_3.input.useHandCursor = true;
    btn_no_3.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_4 = this.game.make.sprite(-103,-47, 'asset_2','btn_no_4');
    btn_no_4.inputEnabled = true
    btn_no_4.input.priorityID = 2;
    btn_no_4.input.useHandCursor = true;
    btn_no_4.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_5 = this.game.make.sprite(-33,-47, 'asset_2','btn_no_5');
    btn_no_5.inputEnabled = true
    btn_no_5.input.priorityID = 2;
    btn_no_5.input.useHandCursor = true;
    btn_no_5.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_6 = this.game.make.sprite(37,-47, 'asset_2','btn_no_6');
    btn_no_6.inputEnabled = true
    btn_no_6.input.priorityID = 2;
    btn_no_6.input.useHandCursor = true;
    btn_no_6.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_7 = this.game.make.sprite(-103,-119, 'asset_2','btn_no_7');
    btn_no_7.inputEnabled = true
    btn_no_7.input.priorityID = 2;
    btn_no_7.input.useHandCursor = true;
    btn_no_7.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_8 = this.game.make.sprite(-33,-119, 'asset_2','btn_no_8');
    btn_no_8.inputEnabled = true
    btn_no_8.input.priorityID = 2;
    btn_no_8.input.useHandCursor = true;
    btn_no_8.events.onInputDown.add(this.onClickNumber, this);

    var btn_no_9 = this.game.make.sprite(37,-119, 'asset_2','btn_no_9');
    btn_no_9.inputEnabled = true
    btn_no_9.input.priorityID = 2;
    btn_no_9.input.useHandCursor = true;
    btn_no_9.events.onInputDown.add(this.onClickNumber, this);

    var btn_delete = this.game.make.sprite(37,97, 'asset_2','btn_delete');
    btn_delete.inputEnabled = true
    btn_delete.input.priorityID = 2;
    btn_delete.input.useHandCursor = true;
    btn_delete.events.onInputDown.add(this.onClickNumber, this);



    popup_find_friend.addChild(btn_close2);
    popup_find_friend.addChild(btn_confirm)
    popup_find_friend.addChild(btn_no_1)
    popup_find_friend.addChild(btn_no_2)
    popup_find_friend.addChild(btn_no_3)
    popup_find_friend.addChild(btn_no_4)
    popup_find_friend.addChild(btn_no_5)
    popup_find_friend.addChild(btn_no_6)
    popup_find_friend.addChild(btn_no_7)
    popup_find_friend.addChild(btn_no_8)
    popup_find_friend.addChild(btn_no_9)
    popup_find_friend.addChild(btn_no_0)
    popup_find_friend.addChild(btn_delete)
    popup_find_friend.addChild(this.labelUid)
    popup_find_friend.scale.set(0);

    txtUid = ""
    this.labelUid.setText(txtUid)
    if ((tween !== null && tween.isRunning) || popup_find_friend.scale.x === 1)
    {    
        return;
    }
    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    tween = this.game.add.tween(popup_find_friend.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
  },
  onClickNumber:function(param){
    if(txtUid.length <= 4){
      if(param.frameName == "btn_no_1"){
        txtUid = txtUid+"1" 
      }else if(param.frameName == "btn_no_2"){
        txtUid = txtUid+"2"
      }else if(param.frameName == "btn_no_3"){
        txtUid = txtUid+"3"
      }else if(param.frameName == "btn_no_4"){
        txtUid = txtUid+"4"
      }else if(param.frameName == "btn_no_5"){
        txtUid = txtUid+"5"
      }else if(param.frameName == "btn_no_6"){
        txtUid = txtUid+"6"
      }else if(param.frameName == "btn_no_7"){
        txtUid = txtUid+"7"
      }else if(param.frameName == "btn_no_8"){
        txtUid = txtUid+"8"
      }else if(param.frameName == "btn_no_9"){
        txtUid = txtUid+"9"
      }else if(param.frameName == "btn_no_0"){
        txtUid = txtUid+"0"
      }
    }
    if(param.frameName == "btn_delete"){
      if ((txtUid != null) && (txtUid.length > 0)) {
        txtUid = txtUid.substring(0, txtUid.length - 1);
      }
    }
    this.labelUid.setText(txtUid)
  },
  onClickFindConfirm:async function(param){
    this.onClickClosePopup(param)
    this.list_view_friends.destroy()
    this.list_view_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.loading_popup_friend_list.scale.set(0.2)
    this.label_not_found.setText('')
    await db.collection("users").where("user_id", "==", txtUid).get().then((querySnapshot) => {
      if(querySnapshot && querySnapshot !== undefined ){
        if(querySnapshot.docs && querySnapshot.docs !== undefined && querySnapshot.docs.length > 0){
          querySnapshot.docs.forEach(async element => {
            var renderListFriends = this.renderListFriends
            var parent = this
            var status = await io.checkStatusOnline(element.data().user_id)
            await this.game.load.image(`avatar_friends_${element.data().user_id}`, element.data().user_photoURL )
            await this.game.load.onLoadComplete.addOnce(onLoaded)
            await this.game.load.start()
            function onLoaded(){
              renderListFriends(element.data(),status,parent);
              parent.loading_popup_friend_list.scale.set(0)
            }
          });
        }else{
          this.loading_popup_friend_list.scale.set(0)
          this.label_not_found.setText(`ไม่พบ Uid ${txtUid} ในระบบ`)
        }
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });    
  },
  onClickConfirmJoin: function(private_room){
    popup_confirm_counter = 0
    io.socket.emit('join_room',{private_room:private_room,profile:profile})
  },
  onClickCancelled: function(){
    this.game.add.tween(popup_confirm.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
    popup_confirm_counter = 0
    
  },
  onClickPopup: function() {
    this.backgroud_overlay.scale.set(1)
    this.btn_back.inputEnabled = false
    this.btn_friends.inputEnabled = false
    this.btn_start_game.inputEnabled = false
    private_room.players.forEach(player => {
      if(player.btn_invite&& player.btn_invite != undefined)
        player.btn_invite.inputEnabled = false
    })
  },
  onClickClosePopup:function(param) { 
    if(param.parent.frameName === "frame_list_view_friends"){
      this.list_view_friends.destroy()
      if (tween && tween.isRunning || this.popup_friend_list.scale.x === 0)
      {
          return;
      }
      //  Create a tween that will close the window, but only if it's not already tweening or closed
      if(popup_find_friend && popup_find_friend!==undefined){
        this.game.add.tween(popup_find_friend.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
      }
      tween = this.game.add.tween(this.popup_friend_list.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
    }else{
      if (tween && tween.isRunning || popup_find_friend.scale.x === 0)
      {
          return;
      }
      //  Create a tween that will close the window, but only if it's not already tweening or closed
      tween = this.game.add.tween(popup_find_friend.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
    }
    this.backgroud_overlay.scale.set(0)
    this.btn_back.inputEnabled = true
    this.btn_back.input.useHandCursor = true
    this.btn_friends.inputEnabled = true
    this.btn_friends.input.useHandCursor = true
    this.btn_start_game.inputEnabled = true
    this.btn_start_game.input.useHandCursor = true
    private_room.players.forEach(player => {
      if(player.btn_invite && player.btn_invite != undefined){
        player.btn_invite.inputEnabled = true
        player.btn_invite.input.useHandCursor = true
      }
    })
  },

  //TODO: SET SCALE
  onClickSetScale: function(param){
    param.scale.setTo(0.85,0.85)
    param.position.setTo(param.position.x/1.005,param.position.y/1.05)
    
  },
  onClickSetScalesFindRoom: function(param){
    param.scale.setTo(1.08,1.08)
    param.position.setTo(param.position.x/1.015,param.position.y/1.08)
  },
  //TODO: LIST FUNCTION
  renderListFriends:function(data,status,parent){
    var frame_list_friends = parent.game.add.image(0,0,'asset_2','frame_list_friends')

    var avatar_friend =  parent.game.make.sprite(0,0,`avatar_friends_${data.user_id}`); 
    default_avatar.width = 90;
    default_avatar.height = 90;
    avatar_friend.width = 90;
    avatar_friend.height = 90;
    var avatar = parent.game.make.bitmapData(0,0)
    avatar.alphaMask(avatar_friend,default_avatar)
    var photo = parent.game.add.image(15,17, avatar)
    frame_list_friends.addChild(photo)

    var friend_name = parent.game.add.text(120,15, data.user_name, {font: '26px Pattaya', fill: '#fff'})
    frame_list_friends.addChild(friend_name)
    
    var friend_point = parent.game.add.text(150,50, data.user_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '22px Pattaya', fill: '#fff'})
    frame_list_friends.addChild(friend_point)

    var friend_stetus = parent.game.add.text(150,77, status?"Online":"Offline", {font: '20px Pattaya', fill: '#fff'})
    frame_list_friends.addChild(friend_stetus)
    var iconCoins = parent.game.add.image(120,50,'menu_asset','icon-coins')
    iconCoins.scale.setTo(0.4,0.4)
    frame_list_friends.addChild(iconCoins)

    var graphics = parent.game.add.graphics(0, 0);
    graphics.beginFill(status?0x3CC23C:0xFF0000, 1);
    graphics.drawCircle(130,90, 20);
    frame_list_friends.addChild(graphics)

    if(profile.friends.filter(id => id == data.user_id).length > 0){
      if( status && private_room.players.filter(p => p.user_id == data.user_id).length == 0){
        var btn_invite = parent.game.make.sprite(400, 40, 'asset_btn','btn_invite')
        btn_invite.inputEnabled = true
        btn_invite.input.priorityID = 1;
        btn_invite.input.useHandCursor = true
        btn_invite.events.onInputUp.add(function() {parent.onClickConfirmInvite(data.user_id,btn_invite)});
        frame_list_friends.addChild(btn_invite)
      }
    }else if(profile.friends_request.find(user_id => user_id == data.user_id) !== undefined){
      var btn_confirm = parent.game.make.sprite(410, 15, 'asset_btn','btn_accept')
      btn_confirm.inputEnabled = true
      btn_confirm.input.priorityID = 1
      btn_confirm.input.useHandCursor = true;
      btn_confirm.events.onInputUp.add(function() {parent.onClickConfirmFriends(data.user_id)});
      frame_list_friends.addChild(btn_confirm)

      var btn_cancel = parent.game.make.sprite(410, 65, 'asset_btn','btn_reject')
      btn_cancel.inputEnabled = true
      btn_cancel.input.priorityID = 1
      btn_cancel.input.useHandCursor = true;
      btn_cancel.events.onInputUp.add(function() {parent.onClickCancelFriends(data.user_id)});
      frame_list_friends.addChild(btn_cancel)
    }else{
      if(parent.popup_friend_list.children[3].scale.x == 0){
        if( status && private_room.players.filter(p => p.user_id == data.user_id).length == 0){
          var btn_invite = parent.game.make.sprite(400, 40, 'asset_btn','btn_invite')
          btn_invite.inputEnabled = true
          btn_invite.input.priorityID = 1;
          btn_invite.input.useHandCursor = true
          btn_invite.events.onInputUp.add(function() {parent.onClickConfirmInvite(data.user_id,btn_invite)});
          frame_list_friends.addChild(btn_invite)
        }
      }else{
        var btn_add_friends = parent.game.make.sprite(380, 35, 'asset_btn','btn_add_friend')
        if(data.friends_request.find(user_id => user_id == profile.user_id) !== undefined){
          btn_add_friends.tint = 0x565656;
        }else{
          btn_add_friends.inputEnabled = true
          btn_add_friends.input.priorityID = 1
          btn_add_friends.input.useHandCursor = true;
        }
        btn_add_friends.events.onInputUp.add(function() {parent.onClickAddFriend(data.user_id,this)});
        frame_list_friends.addChild(btn_add_friends)
      }
    }
    parent.list_view_friends.add(frame_list_friends)
  },
  renderConfirmationWindow:function(data,type,parent){
    // FIXME: FRAME CONFIRM
    popup_confirm = parent.add.sprite(parent.game.world.centerX,parent.game.world.centerY,'asset_2','frame_confirm')
    popup_confirm.anchor.set(0.5)
    
    var btn_cancel = parent.make.sprite(10, 15, 'asset_btn','btn_cancel')
    btn_cancel.scale.setTo(0.8,0.8)
    btn_cancel.inputEnabled = true
    btn_cancel.input.useHandCursor = true;
    btn_cancel.events.onInputUp.add(parent.onClickCancelled,parent);

    popup_confirm.addChild(btn_cancel)
    popup_confirm.scale.set(0);
    popup_confirm_counter  = 0

    var btn_confirm = parent.make.sprite(-150, 15, 'asset_btn','btn_confirm')
    btn_confirm.scale.setTo(0.8,0.8)
    btn_confirm.inputEnabled = true
    btn_confirm.input.useHandCursor = true;

    if(type === 1){ //Normal
      btn_confirm.events.onInputUp.add(function() {parent.onClickConfirmLogout()});
      var mess_1 = parent.make.text(0,-30, "ต้องการออกจากระบบ?", {font: '32px Pattaya', fill: '#fff'})
      mess_1.anchor.set(0.5)
      popup_confirm.addChild(mess_1)
    }else if(type === 2){ //Invite
      btn_confirm.events.onInputUp.add(function() {parent.onClickConfirmJoin(data.private_room)});
      var mess_1 = parent.make.text(0,-55, data.profile.user_name, {font: '28px Pattaya', fill: '#fff'})
      mess_1.anchor.set(0.5)
      var mess_2 = parent.make.text(0,-15, "ได้เชิญคุณเข้าร่วมห้อง", {font: '28px Pattaya', fill: '#fff'})
      mess_2.anchor.set(0.5)

      popup_confirm.addChild(mess_1)
      popup_confirm.addChild(mess_2)
    }
    popup_confirm.addChild(btn_confirm)
    
    parent.game.add.tween(popup_confirm.scale).to( { x: 1, y: 1 }, 1, Phaser.Easing.Elastic.Out, true);
  }
};


export default Private;
