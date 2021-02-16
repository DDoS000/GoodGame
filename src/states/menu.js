'use strict'
import { ListView } from 'phaser-list-view'
var io =  require('../dev')
var findMatch = false
var txtUid = ""
var default_avatar
var avatar_user
var ranking
var profile
var data_ranking
var textLoad = "กำลังค้นหาห้อง"
function Menu() {}

Menu.prototype = {
  init: function(data){
    console.log(data);
    profile = data.profile
    ranking = data.ranking
    io.login(profile)
  },
  preload:async function() {
    default_avatar = this.add.image(0,0,'menu_asset', 'profile-1')
    avatar_user = this.add.image(0,0,'avatar')
  },

  create:async function() {
    console.log("------------MENU---------------");
    findMatch = false
    //TODO: SOCKET.IO
    io.socket.on('invited_friend',(data) =>{
      this.renderConfirmationWindow(data,2,this)
    })
    io.socket.on('create_private_room',data => {
      this.game.state.start('private_room',true,false,{profile:profile,ranking:ranking,private_room:data.private_room});
    })
    io.socket.on('join_room',(data)=>{
      this.game.state.start('private_room',true,false,{profile:profile,ranking:ranking,private_room:data.private_room});
    })
    this.background = this.game.add.image(0,0,'bg_main')

    this.btn_find_match = this.game.add.image(664, 200, 'menu_asset', 'ranking');
    this.btn_find_match.inputEnabled = true;
    this.btn_find_match.input.useHandCursor = true;
    this.btn_find_match.events.onInputDown.add(this.onClickSetScalesFindRoom, this);
    this.btn_find_match.events.onInputUp.add(this.onClickFindMatch, this);

    this.frame_loading = this.game.add.image(685, 380, 'asset_3', 'frame_loading_find_match');
    this.label_loading = this.game.add.text(710, 395, '', { font: "28pt Pattaya", fill: "#ffff", stroke: "#119f4e", strokeThickness: 2 });
    this.frame_loading.scale.set(0)

    this.btn_create_private_room = this.game.add.image(984, 200, 'menu_asset', 'private');
    this.btn_create_private_room.inputEnabled = true;
    this.btn_create_private_room.input.useHandCursor = true;
    this.btn_create_private_room.events.onInputDown.add(this.onClickSetScalesFindRoom, this);
    this.btn_create_private_room.events.onInputUp.add(this.onClickCreatePrivateRoom, this);
    
    this.btn_friends = this.game.add.image(1075, 30, 'menu_asset', 'friends');
    this.btn_friends.scale.setTo(0.8,0.8)
    this.btn_friends.inputEnabled = true;
    this.btn_friends.input.useHandCursor = true;
    this.btn_friends.events.onInputDown.add(this.onClickSetScale,this)
    this.btn_friends.events.onInputUp.add(this.onClickFriends, this);

    this.btn_logout = this.game.add.image(1194, 30, 'menu_asset', 'logout');
    this.btn_logout.scale.setTo(0.8,0.8)
    this.btn_logout.inputEnabled = true;
    this.btn_logout.input.useHandCursor = true;
    this.btn_logout.events.onInputDown.add(this.onClickSetScale,this)
    this.btn_logout.events.onInputUp.add(this.onClickLogout, this);

    this.btn_friends_ranking = this.game.add.image(30,180, 'asset_3', 'btn_friends_ranking');
    this.btn_friends_ranking.inputEnabled = true;
    this.btn_friends_ranking.input.useHandCursor = true;
    this.btn_friends_ranking.events.onInputUp.add(this.onClickRankingInFriends, this);

    this.btn_all_ranking = this.game.add.image(281,180, 'asset_3', 'btn_all_ranking');
    this.btn_all_ranking.inputEnabled = true;
    this.btn_all_ranking.input.useHandCursor = true;
    this.btn_all_ranking.events.onInputUp.add(this.onClickRankingInAll, this);

    this.coins = this.game.add.image(170,88,'menu_asset','icon-coins')
    this.coins.width = 40;
    this.coins.height = 40;

    this.btn_view_profile = this.game.add.image(30,25,'menu_asset', 'profile-3')
    this.btn_view_profile.width = 120;
    this.btn_view_profile.height = 120;
    this.btn_view_profile.inputEnabled = true;
    this.btn_view_profile.input.priorityID = 1;
    this.btn_view_profile.input.useHandCursor = true;
    this.btn_view_profile.events.onInputUp.add(this.onClickViewProfile, this);

    avatar_user.width = 110;
    avatar_user.height = 110;
    default_avatar.width = 110;
    default_avatar.height = 110;
    var avatar = this.game.make.bitmapData(0,0)
    avatar.alphaMask(avatar_user.key == "__missing"?default_avatar:avatar_user,default_avatar)
    this.game.add.image(35, 30, avatar)

    // text
    this.label_user_name =  this.game.add.text(170,34, profile.user_name, { font: "35px Pattaya", fill: "#ffff"});
    this.label_user_name.stroke = "#4F9BD7";
    this.label_user_name.strokeThickness = 8;
    this.label_user_point = this.game.add.text(222,90, profile.user_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '28px Pattaya', fill: '#fff'});
    this.label_user_point.stroke = "#E16E53";
    this.label_user_point.strokeThickness = 8;

    this.game.add.image(30,244,'asset_3','frame_list_view_ranking')
    
    this.loading_ranking = this.game.add.sprite(245, 400, 'loading');
    this.loading_ranking.animations.add('run');
    this.loading_ranking.animations.play('run', 15, true);
    this.loading_ranking.scale.set(0)
    // FIXME: LIST RANKING
    this.ListView_ranking = new ListView(this.game, this.world, new Phaser.Rectangle(45, 255, 504, 390), {
      searchForClicks: true,
      padding: 5
    })
    this.onClickRankingInFriends()

    this.color_overlay = this.game.add.bitmapData(this.game.world.width,this.game.world.height);
    this.color_overlay.ctx.beginPath();
    this.color_overlay.ctx.rect(0,0,this.game.world.width,this.game.world.height);
    this.color_overlay.ctx.fillStyle = '#000000';
    this.color_overlay.ctx.fill();
    this.backgroud_overlay = this.game.add.sprite(0, 0, this.color_overlay);
    this.backgroud_overlay.alpha = 0.7;
    this.backgroud_overlay.scale.set(0)
  
    // FIXME: POPUP VIEW PROFILE
    this.popup_profile = this.add.sprite(this.game.world.centerX,this.game.world.centerY,'asset_3','frame_view_profile')
    this.popup_profile.anchor.set(0.5) 
    this.img_avatar_popup_profile =  this.game.add.image(-210 ,-120, avatar)
    this.popup_profile.addChild(this.img_avatar_popup_profile)

    this.label_user_id_popup_profile = this.make.text(20 ,-127, profile.user_id, {font: '32px Pattaya', fill: '#000'})
    this.popup_profile.addChild(this.label_user_id_popup_profile)

    this.label_user_name_popup_profile = this.make.text(-55 ,-85, profile.user_name.substring(0, 17), {font: '32px Pattaya', fill: '#37659F'})
    this.popup_profile.addChild(this.label_user_name_popup_profile)

    this.label_user_point_popup_profile = this.make.text(-10,-40, profile.user_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '32px Pattaya', fill: '#E16E53'})
    this.popup_profile.addChild(this.label_user_point_popup_profile)

    this.label_user_ranking_friends_popup_profile = this.make.text(-70 ,115, profile.user_ranking_friends, {font: '48px Pattaya', fill: '#fff'})
    this.label_user_ranking_friends_popup_profile.anchor.set(0.5)
    this.label_user_ranking_friends_popup_profile.setShadow(2, 1, "#0A6C07", 0);
    this.popup_profile.addChild(this.label_user_ranking_friends_popup_profile)

    this.label_user_ranking_all_popup_profile = this.make.text(70 ,115, profile.user_ranking_all, {font: '48px Pattaya', fill: '#fff'})
    this.label_user_ranking_all_popup_profile.anchor.set(0.5) 
    this.label_user_ranking_all_popup_profile.setShadow(2, 1, "#DA3601", 0);
    this.popup_profile.addChild(this.label_user_ranking_all_popup_profile)

    this.btn_close_popup_profile = this.make.sprite(220, -180, 'menu_asset','btn_close')
    this.btn_close_popup_profile.scale.setTo(0.7,0.7)
    this.btn_close_popup_profile.inputEnabled = true;
    this.btn_close_popup_profile.input.priorityID = 1;
    this.btn_close_popup_profile.input.useHandCursor = true;
    this.btn_close_popup_profile.events.onInputDown.add(this.onClickClosePopup, this);
    this.popup_profile.addChild(this.btn_close_popup_profile)

    this.popup_profile.scale.set(0);

    // FIXME: POPUP FRIEND LIST
    this.popup_friend_list = this.add.sprite(366,29,'asset_2','frame_list_view_friends')
    this.btn_close_popup_friend_list = this.game.make.sprite(this.popup_friend_list.width-20, -10, 'menu_asset','btn_close');
    this.btn_close_popup_friend_list.scale.setTo(0.6,0.6)
    this.btn_close_popup_friend_list.inputEnabled = true;
    this.btn_close_popup_friend_list.input.priorityID = 1;
    this.btn_close_popup_friend_list.input.useHandCursor = true;
    this.btn_close_popup_friend_list.events.onInputDown.add(this.onClickClosePopup, this);
    this.popup_friend_list.addChild(this.btn_close_popup_friend_list);

    this.btn_find_popup_friend_list = this.game.add.image(435, 600, 'asset_btn','btn_find')
    this.btn_find_popup_friend_list.inputEnabled = true;
    this.btn_find_popup_friend_list.input.priorityID = 1;
    this.btn_find_popup_friend_list.input.useHandCursor = true;
    this.btn_find_popup_friend_list.events.onInputUp.add(this.onClickFindFriend, this);
    this.popup_friend_list.addChild(this.btn_find_popup_friend_list)

    this.btn_friends_popup_friend_list = this.game.add.image(20, 600,'asset_btn','btn_friends')
    this.btn_friends_popup_friend_list.inputEnabled = true;
    this.btn_friends_popup_friend_list.input.priorityID = 1;
    this.btn_friends_popup_friend_list.input.useHandCursor = true;
    this.btn_friends_popup_friend_list.events.onInputUp.add(this.onClickFriendsList, this);
    this.popup_friend_list.addChild(this.btn_friends_popup_friend_list)

    this.btn_friends_request_popup_friend_list = this.game.add.image(150, 600,'asset_btn','btn_friends_request')
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

    this.label_not_found_popup_friend_list = this.game.add.text(300, 290, '',{font: '32px Pattaya', fill: '#fff'});
    this.label_not_found_popup_friend_list.anchor.set(0.5)
    this.popup_friend_list.addChild(this.label_not_found_popup_friend_list)
    
    this.popup_friend_list.scale.set(0);

    // FIXME: FRAME CONFIRM
    this.popup_confirm = this.add.sprite(this.game.world.centerX,this.game.world.centerY,'asset_2','frame_confirm')
    this.popup_confirm.anchor.set(0.5)
    
    this.btn_cancel_popup_confirm = this.make.sprite(10, 5, 'asset_btn','btn_cancel')
    this.btn_cancel_popup_confirm.scale.set(0.8)
    this.btn_cancel_popup_confirm.inputEnabled = true
    this.btn_cancel_popup_confirm.input.useHandCursor = true;
    this.btn_cancel_popup_confirm.events.onInputUp.add(this.onClickCancelled,this);
    this.popup_confirm.addChild(this.btn_cancel_popup_confirm)

    this.popup_confirm.scale.set(0);

    io.socket.on('start_game',data => {
      console.log(data);
      console.log(this.game);
      this.game.state.start('play',true,false,{profile:profile,room:data.public_room,game:data.game});
    })
  },
  
  update: async function() {
  },

  onClickFindMatch: async function(param) {
    param.scale.setTo(1,1)
    param.position.setTo(param.position.x*1.015,param.position.y*1.08)
    if(findMatch == false){
      this.frame_loading.scale.set(1)
      this.nextLine();
      findMatch = !findMatch
      io.socket.emit('findMatchRanking',{profile: profile})
    }else if(findMatch == true){
      this.frame_loading.scale.set(0)
      findMatch = !findMatch
      this.time_loading.timer.removeAll()
      this.label_loading.setText('')
      io.socket.emit('cancelFindMatchRanking',{profile: profile})
    }
  },
  onClickCreatePrivateRoom: async function(param) {
    param.scale.setTo(1,1)
    param.position.setTo(param.position.x*1.015,param.position.y*1.08)
    io.socket.emit('create_private_room',{profile})
  },
  onClickLogout: function(param) {
    param.scale.setTo(0.8,0.8)
    param.position.setTo(param.position.x*1.005,param.position.y*1.05)
    this.renderConfirmationWindow("",1,this)
  },
  onClickFriends:async function(param) {
    param.scale.setTo(0.8,0.8)
    param.position.setTo(param.position.x*1.005,param.position.y*1.05)
    
    // FIXME: LIST FRIENDS
    this.listView_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.onClickPopup()

    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    this.game.add.tween(this.popup_friend_list.scale).to( { x: 1, y: 1 }, 1, Phaser.Easing.Elastic.Out, true);
    await this.onClickFriendsList()
  },
  onClickFriendsList:async function(){
    this.listView_friends.destroy()
    this.listView_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.loading_popup_friend_list.scale.set(0.2)
    this.label_not_found_popup_friend_list.setText('')
    await db.collection("users").where("user_id","==",profile.user_id).get().then(async(querySnapshot) => {
      profile = querySnapshot.docs[0].data()
      await db.collection("users").where("friends", "array-contains", profile.user_id).get().then((querySnapshot) => {
        console.log("friends",querySnapshot.docs);
        if(querySnapshot !== undefined && querySnapshot.docs.length > 0){
          querySnapshot.docs.forEach(async element => {
            var renderListFriends = this.renderListFriends
            console.log("friendElement",element.data());
            
            var status = await io.checkStatusOnline(element.data().user_id)
            console.log(element.data().user_id ,"status >>>", status);
            
            await this.game.load.image(`avatar_friends_${element.data().user_id}`, element.data().user_photoURL )
            await this.game.load.onLoadComplete.addOnce(onLoaded,this)
            await this.game.load.start()
            function onLoaded(){
              this.loading_popup_friend_list.scale.set(0)
              renderListFriends(element.data(),status,this);
            }
          });
        }else{
          this.loading_popup_friend_list.scale.set(0)
          this.label_not_found_popup_friend_list.setText('ไม่พบรายชื่อเพื่อน')
        }
      })
    });
  },
  onClicksSetting: function(param) {
    param.scale.setTo(0.8,0.8)
    param.position.setTo(param.position.x*1.005,param.position.y*1.05)
  },
  onClickFindFriend:function(){

    //FIXME: POPUP FIND FRIENDS
    this.popup_find_friend = this.add.sprite(this.game.world.centerX,this.game.world.centerY,'asset_2','frame_find_uid')
    this.popup_find_friend.anchor.set(0.5);
    this.popup_find_friend.inputEnabled = true;
    this.popup_find_friend.input.enableDrag();

    this.label_uid_popup_find_friend = this.game.add.text(0,-160, txtUid, { font: "28px Pattaya", fill: "#fff", align: "center" });
    this.label_uid_popup_find_friend.anchor.set(0.5)
    this.popup_find_friend.addChild(this.label_uid_popup_find_friend)

    this.btn_close_popup_find_friend = this.game.make.sprite((this.popup_find_friend.width/2)-20,-(this.popup_find_friend.height/2) -10, 'menu_asset','btn_close');
    this.btn_close_popup_find_friend.scale.setTo(0.6,0.6)
    this.btn_close_popup_find_friend.inputEnabled = true;
    this.btn_close_popup_find_friend.input.priorityID = 1;
    this.btn_close_popup_find_friend.input.useHandCursor = true;
    this.btn_close_popup_find_friend.events.onInputDown.add(this.onClickClosePopup, this);
    this.popup_find_friend.addChild(this.btn_close_popup_find_friend);

    this.btn_confirm_popup_find_friend = this.game.make.sprite(0,205, 'asset_btn','btn_confirm');
    this.btn_confirm_popup_find_friend.scale.setTo(0.7,0.7)
    this.btn_confirm_popup_find_friend.anchor.set(0.5)
    this.btn_confirm_popup_find_friend.inputEnabled = true;
    this.btn_confirm_popup_find_friend.input.priorityID = 1;
    this.btn_confirm_popup_find_friend.input.useHandCursor = true;
    this.btn_confirm_popup_find_friend.events.onInputDown.add(this.onClickConfirmFindFriend, this);
    this.popup_find_friend.addChild(this.btn_confirm_popup_find_friend)

    this.btn_no_0_popup_find_friend = this.game.make.sprite(-33,97, 'asset_2','btn_no_0');
    this.btn_no_0_popup_find_friend.inputEnabled = true
    this.btn_no_0_popup_find_friend.input.priorityID = 2;
    this.btn_no_0_popup_find_friend.input.useHandCursor = true;
    this.btn_no_0_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_0_popup_find_friend)

    this.btn_no_1_popup_find_friend = this.game.make.sprite(-103,25, 'asset_2','btn_no_1');
    this.btn_no_1_popup_find_friend.inputEnabled = true
    this.btn_no_1_popup_find_friend.input.priorityID = 2;
    this.btn_no_1_popup_find_friend.input.useHandCursor = true;
    this.btn_no_1_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_1_popup_find_friend)

    this.btn_no_2_popup_find_friend = this.game.make.sprite(-33,25, 'asset_2','btn_no_2');
    this.btn_no_2_popup_find_friend.inputEnabled = true
    this.btn_no_2_popup_find_friend.input.priorityID = 2;
    this.btn_no_2_popup_find_friend.input.useHandCursor = true;
    this.btn_no_2_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_2_popup_find_friend)
    
    this.btn_no_3_popup_find_friend = this.game.make.sprite(37,25, 'asset_2','btn_no_3');
    this.btn_no_3_popup_find_friend.inputEnabled = true
    this.btn_no_3_popup_find_friend.input.priorityID = 2;
    this.btn_no_3_popup_find_friend.input.useHandCursor = true;
    this.btn_no_3_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_3_popup_find_friend)

    this.btn_no_4_popup_find_friend = this.game.make.sprite(-103,-47, 'asset_2','btn_no_4');
    this.btn_no_4_popup_find_friend.inputEnabled = true
    this.btn_no_4_popup_find_friend.input.priorityID = 2;
    this.btn_no_4_popup_find_friend.input.useHandCursor = true;
    this.btn_no_4_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_4_popup_find_friend)

    this.btn_no_5_popup_find_friend = this.game.make.sprite(-33,-47, 'asset_2','btn_no_5');
    this.btn_no_5_popup_find_friend.inputEnabled = true
    this.btn_no_5_popup_find_friend.input.priorityID = 2;
    this.btn_no_5_popup_find_friend.input.useHandCursor = true;
    this.btn_no_5_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_5_popup_find_friend)

    this.btn_no_6_popup_find_friend = this.game.make.sprite(37,-47, 'asset_2','btn_no_6');
    this.btn_no_6_popup_find_friend.inputEnabled = true
    this.btn_no_6_popup_find_friend.input.priorityID = 2;
    this.btn_no_6_popup_find_friend.input.useHandCursor = true;
    this.btn_no_6_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_6_popup_find_friend)

    this.btn_no_7_popup_find_friend = this.game.make.sprite(-103,-119, 'asset_2','btn_no_7');
    this.btn_no_7_popup_find_friend.inputEnabled = true
    this.btn_no_7_popup_find_friend.input.priorityID = 2;
    this.btn_no_7_popup_find_friend.input.useHandCursor = true;
    this.btn_no_7_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_7_popup_find_friend)

    this.btn_no_8_popup_find_friend = this.game.make.sprite(-33,-119, 'asset_2','btn_no_8');
    this.btn_no_8_popup_find_friend.inputEnabled = true
    this.btn_no_8_popup_find_friend.input.priorityID = 2;
    this.btn_no_8_popup_find_friend.input.useHandCursor = true;
    this.btn_no_8_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_8_popup_find_friend)

    this.btn_no_9_popup_find_friend = this.game.make.sprite(37,-119, 'asset_2','btn_no_9');
    this.btn_no_9_popup_find_friend.inputEnabled = true
    this.btn_no_9_popup_find_friend.input.priorityID = 2;
    this.btn_no_9_popup_find_friend.input.useHandCursor = true;
    this.btn_no_9_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_no_9_popup_find_friend)

    this.btn_delete_popup_find_friend = this.game.make.sprite(37,97, 'asset_2','btn_delete');
    this.btn_delete_popup_find_friend.inputEnabled = true
    this.btn_delete_popup_find_friend.input.priorityID = 2;
    this.btn_delete_popup_find_friend.input.useHandCursor = true;
    this.btn_delete_popup_find_friend.events.onInputDown.add(this.onClickNumber, this);
    this.popup_find_friend.addChild(this.btn_delete_popup_find_friend)
    
    this.popup_find_friend.scale.set(0);

    txtUid = ""
    this.label_uid_popup_find_friend.setText(txtUid)

    //  Create a tween that will pop-open the window, but only if it's not already tweening or open
    this.game.add.tween(this.popup_find_friend.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
  },
  onClickNumber:function(sprite){
    if(txtUid.length <= 4){
      if(sprite.frameName == "btn_no_1"){
        txtUid = txtUid+"1" 
      }else if(sprite.frameName == "btn_no_2"){
        txtUid = txtUid+"2"
      }else if(sprite.frameName == "btn_no_3"){
        txtUid = txtUid+"3"
      }else if(sprite.frameName == "btn_no_4"){
        txtUid = txtUid+"4"
      }else if(sprite.frameName == "btn_no_5"){
        txtUid = txtUid+"5"
      }else if(sprite.frameName == "btn_no_6"){
        txtUid = txtUid+"6"
      }else if(sprite.frameName == "btn_no_7"){
        txtUid = txtUid+"7"
      }else if(sprite.frameName == "btn_no_8"){
        txtUid = txtUid+"8"
      }else if(sprite.frameName == "btn_no_9"){
        txtUid = txtUid+"9"
      }else if(sprite.frameName == "btn_no_0"){
        txtUid = txtUid+"0"
      }
    }
    if(sprite.frameName == "btn_delete"){
      if ((txtUid != null) && (txtUid.length > 0)) {
        txtUid = txtUid.substring(0, txtUid.length - 1);
      }
    }
    this.label_uid_popup_find_friend.setText(txtUid)
  },
  onClickConfirmFindFriend:async function(param){
    this.onClickClosePopup(param)
    this.listView_friends.destroy()
    this.listView_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.loading_popup_friend_list.scale.set(0.2)
    this.label_not_found_popup_friend_list.setText('')
    await db.collection("users").where("user_id", "==", txtUid).get().then((querySnapshot) => {
      console.log(querySnapshot.docs)
      if(querySnapshot && querySnapshot !== undefined ){
        if(querySnapshot.docs && querySnapshot.docs !== undefined && querySnapshot.docs.length > 0){
          querySnapshot.docs.forEach(async element => {
            console.log(element.data().user_photoURL);
            var renderListFriends = this.renderListFriends
            var parent = this
            var status = await io.checkStatusOnline(element.data().user_id)
            await this.game.load.image(`avatar_friends_${element.data().user_id}`, element.data().user_photoURL )
            await this.game.load.onLoadComplete.addOnce(onLoaded)
            await this.game.load.start()
            function onLoaded(){ 
              console.log('everything is loaded and ready to be used')
              renderListFriends(element.data(),status,parent);
              parent.loading_popup_friend_list.scale.set(0)
            }
          });
        }else{
          this.loading_popup_friend_list.scale.set(0)
          this.label_not_found_popup_friend_list.setText(`ไม่พบ Uid ${txtUid} ในระบบ`)
        }
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });    
  },
  onClickAddFriend:async function(uid,sprite){
    console.log(sprite);
    await io.addFriends(uid)
    profile = io.updateProfile()
    console.log("profile >>",profile);
  },
  onClickAcceptFriendRequest:async function(uid){
    await io.confirmFriends(uid)
    profile = await io.updateProfile()
    console.log("profile >>",profile);
    this.onClickFriendsRequest()
    
  },
  onClickRejectFriendRequest:async function(uid){
    await io.cancelFriends(uid)
    this.onClickFriendsRequest()
  },
  onClickFriendsRequest:async function(){
    this.listView_friends.destroy()
    this.listView_friends = new ListView(this.game, this.world, new Phaser.Rectangle(396, 60, 538, 538), {
      searchForClicks: true,
      padding: 0
    })
    this.loading_popup_friend_list.scale.set(0.2)
    this.label_not_found_popup_friend_list.setText('')
    await db.collection("users").where("user_id","==",profile.user_id).get().then((querySnapshot) => {
      profile = querySnapshot.docs[0].data()
      if(profile.friends_request.length > 0){
        profile.friends_request.forEach(async user_id => {
          db.collection("users").where("user_id","==",user_id).get().then((query) => {
            query.docs.forEach(async element => {
              var renderListFriends = this.renderListFriends
              var status = await io.checkStatusOnline(element.data().user_id)
              await this.game.load.image(`avatar_friends_${element.data().user_id}`, element.data().user_photoURL )
              await this.game.load.onFileComplete.addOnce(fileComplete,this)
              await this.game.load.onLoadComplete.addOnce(onLoaded,this)
              await this.game.load.start()
              function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
                console.log("File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles);
              }
              function onLoaded(){
                console.log('everything is loaded and ready to be used')
                this.loading_popup_friend_list.scale.set(0)
                renderListFriends(element.data(),status,this);
              }
            });
          })
        });
      }else{
        this.loading_popup_friend_list.scale.set(0)
        this.label_not_found_popup_friend_list.setText("ไม่พบคำร้องขอเป็นเพื่อน")
      }
    })
  },
  onClickConfirmLogout: function(){
    firebase.auth().signOut().then(function() {
      io.logout()
      console.log("Sign-out successful");
    }).catch(function(error) {});
  },
  onClickAcceptInvitation: function(private_room){
    io.socket.emit('join_room',{private_room:private_room,profile:profile})
  },
  onClickCancelled: function(){
    this.game.add.tween(this.popup_confirm.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
  },
  onClickViewProfile:function(){
    this.onClickPopup()
    this.game.add.tween(this.popup_profile.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
  },
  onClickPopup: function() {
    this.backgroud_overlay.scale.set(1)
    this.btn_view_profile.inputEnabled = false
    this.btn_logout .inputEnabled = false
    this.btn_friends.inputEnabled = false
    this.btn_find_match.inputEnabled = false
    this.btn_create_private_room.inputEnabled = false
    this.btn_all_ranking.inputEnabled = false
    this.btn_friends_ranking.inputEnabled = false
  },
  onClickClosePopup:function(param) { 
    if(param.parent.frameName !== "frame_find_uid"){
      if(param.parent.frameName === "frame_list_view_friends"){
        this.listView_friends.destroy()
        //  Create a tween that will close the window, but only if it's not already tweening or closed
        if(this.popup_find_friend && this.popup_find_friend!==undefined){
          this.game.add.tween(this.popup_find_friend.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
        }
        this.game.add.tween(this.popup_friend_list.scale).to( { x: 0, y: 0 }, 1, Phaser.Easing.Elastic.In, true);
        this.backgroud_overlay.scale.set(0)
      }else if(param.parent.frameName === "frame_view_profile"){
        this.game.add.tween(this.popup_profile.scale).to( { x: 0, y: 0 }, 500, Phaser.Easing.Elastic.In, true);    
        setTimeout(() => {
          this.backgroud_overlay.scale.set(0)
        }, 500);
      }
      this.btn_view_profile.inputEnabled = true
      this.btn_view_profile.input.useHandCursor = true
      this.btn_logout .inputEnabled = true
      this.btn_logout .input.useHandCursor = true
      this.btn_friends.inputEnabled = true
      this.btn_friends.input.useHandCursor = true
      this.btn_find_match.inputEnabled = true
      this.btn_find_match.input.useHandCursor = true
      this.btn_create_private_room.inputEnabled = true
      this.btn_create_private_room.input.useHandCursor = true
      this.btn_friends_ranking.inputEnabled = true
      this.btn_friends_ranking.input.useHandCursor = true
      this.btn_all_ranking.inputEnabled = true
      this.btn_all_ranking.input.useHandCursor = true
    }else{
      this.game.add.tween(this.popup_find_friend.scale).to( { x: 0, y: 0 }, 500, Phaser.Easing.Elastic.In, true);
    }
    
  },
  onClickRankingInFriends:async function(){
    this.loading_ranking.scale.set(0.2)
    this.ListView_ranking.removeAll()
    await db.collection("users").where("user_id","==",profile.user_id).get().then(async(querySnapshot) => {
      profile = querySnapshot.docs[0].data()
      await db.collection("users").where("friends", "array-contains", profile.user_id).get().then((querySnapshot) => {
        data_ranking = querySnapshot.docs.map(user => user.data())
        data_ranking.push(profile)
        data_ranking.sort(function(a, b){return b.user_point - a.user_point});
        profile.user_ranking_friends = data_ranking.findIndex(user => user.user_id ==  profile.user_id)+1
        this.label_user_ranking_friends_popup_profile.setText(profile.user_ranking_friends)
        this.label_user_point.setText(profile.user_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
        this.renderListRanking(data_ranking)
      })
    });
    this.loading_ranking.scale.set(0)
  },
  onClickRankingInAll:async function(){
    this.ListView_ranking.removeAll()
    this.loading_ranking.scale.set(0.2)
    await db.collection("users").orderBy("user_point", "desc").get().then((querySnapshot) => {
        data_ranking = querySnapshot.docs.map(user => user.data())
        profile.user_ranking_all = data_ranking.findIndex(user => user.user_id ==  profile.user_id)+1
        this.label_user_ranking_all_popup_profile
        .setText(profile.user_ranking_all)
        this.renderListRanking(data_ranking)
    });
    this.loading_ranking.scale.set(0)
  },
  //TODO: SET SCALE
  onClickSetScale: function(param){
    param.scale.setTo(0.85,0.85)
    console.log(param);
    param.position.setTo(param.position.x/1.005,param.position.y/1.05)
    
  },
  onClickSetScalesFindRoom: function(param){
    param.scale.setTo(1.08,1.08)
    console.log(param);
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
    
    }else if(profile.friends_request.find(user_id => user_id == data.user_id) !== undefined){
      var btn_accept = parent.game.make.sprite(410, 15, 'asset_btn','btn_accept')
      btn_accept.inputEnabled = true
      btn_accept.input.priorityID = 1
      btn_accept.input.useHandCursor = true;
      btn_accept.events.onInputUp.add(function() {parent.onClickAcceptFriendRequest(data.user_id)});
      frame_list_friends.addChild(btn_accept)

      var btn_reject = parent.game.make.sprite(410, 65, 'asset_btn','btn_reject')
      btn_reject.inputEnabled = true
      btn_reject.input.priorityID = 1
      btn_reject.input.useHandCursor = true;
      btn_reject.events.onInputUp.add(function() {parent.onClickRejectFriendRequest(data.user_id)});
      frame_list_friends.addChild(btn_reject)
    }else{
        var btn_add_friends = parent.game.make.sprite(380, 38, 'asset_btn','btn_add_friend')
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
    parent.listView_friends.add(frame_list_friends)
  },
  renderListRanking:function(data_ranking){
    if(data_ranking && data_ranking !=undefined){
      data_ranking.forEach((profile,i) => {
        var text_number = this.game.add.text(30,50, i+1, {font: '32px Pattaya', fill: '#fff'})
        text_number.anchor.set(0.5)
        var img_number = this.game.make.sprite(0,0,'asset_3',i==0?'rank_gold':i==1?'rank_silver':i==2?'rank_bronze':'rank_normal'); 
        var profile_avatar =  this.game.make.sprite(0,0,`avatar_${profile.user_id}`); 
        console.log("avatar",profile_avatar.key);
        
        default_avatar.width = 80;
        default_avatar.height = 80;
        profile_avatar.width = 80;
        profile_avatar.height = 80;
        var avatar = this.game.make.bitmapData(0,0)
        avatar.alphaMask(profile_avatar.key == "__missing"?default_avatar:profile_avatar,default_avatar)
        var photo = this.game.add.image(70,12,avatar)
        
        var friend_name = this.game.add.text(160,15, profile.user_name, {font: '26px Pattaya', fill: '#37659F'})
        var friend_point = this.game.add.text(195,53, profile.user_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), {font: '24px Pattaya', fill: '#E16E53'})
        var iconCoins = this.game.add.image(160,55,'menu_asset','icon-coins')
        iconCoins.scale.setTo(0.4,0.4)
    
        var img = this.game.add.image(0,0,'asset_3','frame_list_ranking')
        img.addChild(photo)
        img.addChild(friend_name)
        img.addChild(friend_point)
        img.addChild(iconCoins)
        img.addChild(img_number)
        img.addChild(text_number)
        this.ListView_ranking.add(img)
      });
    }
  },
  renderConfirmationWindow:function(data,type,parent){

    this.btn_confirm_popup_confirm = parent.make.sprite(-150, 5, 'asset_btn','btn_confirm')
    this.btn_confirm_popup_confirm.scale.set(0.8)
    this.btn_confirm_popup_confirm.inputEnabled = true
    this.btn_confirm_popup_confirm.input.useHandCursor = true;
    this.popup_confirm.addChild(this.btn_confirm_popup_confirm)

    if(type === 1){ //Normal
      this.btn_confirm_popup_confirm.events.onInputUp.add(function() {parent.onClickConfirmLogout()});

      this.label_message_popup_confirm = parent.make.text(0,-45, "ต้องการออกจากระบบ?", {font: '32px Pattaya', fill: '#fff'})
      this.label_message_popup_confirm.anchor.set(0.5)
      this.popup_confirm.addChild(this.label_message_popup_confirm)
    }else if(type === 2){ //Invite
      this.btn_confirm_popup_confirm.events.onInputUp.add(function() {parent.onClickAcceptInvitation(data.private_room)});

      this.label_invite_by_popup_confirm = parent.make.text(0,-55, data.profile.user_name, {font: '28px Pattaya', fill: '#fff'})
      this.label_invite_by_popup_confirm.anchor.set(0.5)
      this.popup_confirm.addChild(this.label_invite_by_popup_confirm)      
      
      this.label_message_popup_confirm = parent.make.text(0,-15, "ได้เชิญคุณเข้าร่วมห้อง", {font: '28px Pattaya', fill: '#fff'})
      this.label_message_popup_confirm.anchor.set(0.5)
      this.popup_confirm.addChild(this.label_message_popup_confirm)
    }
    
    parent.game.add.tween(this.popup_confirm.scale).to( { x: 1, y: 1 }, 1, Phaser.Easing.Elastic.Out, true);
  },
  nextLine: function() {
    this.line = '';
    this.time_loading = this.game.time.events.repeat(100, textLoad.length + 1, this.updateLine, this);
    // this.time_loading.timer.start()
    console.log(this.time_loading);
  },
  updateLine : function() {
    if(findMatch == true){
      if (this.line.length < textLoad.length){
        this.line = textLoad.substr(0, this.line.length + 1);
        this.label_loading.setText(this.line);
      }else{
          //  Wait 2 seconds then start a new line
          this.game.time.events.add(Phaser.Timer.SECOND * 2, this.nextLine, this);
      }
    }
  },
};




export default Menu;
