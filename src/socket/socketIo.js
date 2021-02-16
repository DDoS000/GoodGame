'use strict'

const server = require('http').createServer()
const io = require('socket.io')(server)
require('../model/cardsmodel');

const firebase = require("firebase/app");
// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
var firebaseConfig = {
  apiKey: "AIzaSyDVBA_RUI16zSurjxWpff1UwDb4-hcKbQg",
  authDomain: "bidding-war-online.firebaseapp.com",
  databaseURL: "https://bidding-war-online.firebaseio.com",
  projectId: "bidding-war-online",
  storageBucket: "bidding-war-online.appspot.com",
  messagingSenderId: "937086445333",
  appId: "1:937086445333:web:d360436cd3f0f19bf4eb1c",
  measurementId: "G-TDGF4T2GD0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
/**
 * List all connections
 * @type {string: SocketIO.Socket}
 */
var roomno = 1
var client = []
var public_room = {
  room_id : "",
  players : []
}
const sockets = {}
var cardsModel = new CardsModel()
io.on('connection', (socket) => {
  // Save the list of all connections to a variable
  socket.on('check_socket_id',() =>{
    socket.emit('check_socket_id',{id:socket.id})
  })

  socket.on('login',function(data){
    sockets[socket.id] = data.data.user_id

  })
  socket.on('check_status_online', function(uid,callback){
    var players = Object.values(sockets)
    callback(players.filter(id => id == uid).length > 0?true:false)
  })
  // // After connection - send a list of all files
  io.sockets.emit('message',{message: client + ' clients connected!'})

  socket.on('invite_friend',function(data){
    data.Myprofile
    io.to(`${getKeyByValue(sockets,data.uid)}`).emit('invited_friend',{profile:data.Myprofile,private_room:data.private_room})
  })

  socket.on('create_private_room',function(data){
    socket.join("private-room-"+data.profile.user_id);
    var private_room = {}
    private_room.room_id = `private-room-${data.profile.user_id}`
    private_room.players = []
    private_room.players.push({
      user_id: data.profile.user_id,
      user_name: data.profile.user_name,
      user_photoURL: data.profile.user_photoURL,
      status_player: "owner",
    })
    io.nsps['/'].adapter.rooms[private_room.room_id].players = []
    io.nsps['/'].adapter.rooms[private_room.room_id].players.push({
      user_id: data.profile.user_id,
      user_name: data.profile.user_name,
      user_photoURL: data.profile.user_photoURL,
      status_player: "owner",
    })
    socket.emit('create_private_room',{private_room:private_room})
    setTimeout(() => {
      io.in(`${private_room.room_id}`).emit('players_in_private_room',{private_room:private_room,players:io.nsps['/'].adapter.rooms[private_room.room_id].players})
    }, 200);
  })
  socket.on('join_room',function(data){
    socket.join(data.private_room.room_id)
    io.nsps['/'].adapter.rooms[data.private_room.room_id].players.push({
      user_id: data.profile.user_id,
      user_name: data.profile.user_name,
      user_photoURL: data.profile.user_photoURL,
      status_player: "invited"
    })
    socket.emit('join_room',{private_room:data.private_room})
    setTimeout(() => {
      io.in(`${data.private_room.room_id}`).emit('players_in_private_room',{private_room:data.private_room,players:io.nsps['/'].adapter.rooms[data.private_room.room_id].players})
    }, 200);

  })
  socket.on('leave_room',data=>{
    if(data.profile && data.profile !== undefined){
      io.nsps['/'].adapter.rooms[data.private_room.room_id].players.forEach((player,i) => {
        if(player.user_id == data.profile.user_id) {
          if(player.status_player == "owner"){
            io.nsps['/'].adapter.rooms[data.private_room.room_id].players = []
            io.in(data.private_room.room_id).emit('closed_room')
          }else{
            io.nsps['/'].adapter.rooms[data.private_room.room_id].players.splice(i,1);
            io.in(data.private_room.room_id).emit('players_in_private_room',{private_room:data.private_room,players:io.nsps['/'].adapter.rooms[data.private_room.room_id].players})
          }
        }
      })
    }
    socket.leave(data.private_room.room_id)
  });
  socket.on('leave',data=>{
    socket.leave(data.room_id)
  });
  socket.on('start_game',data =>{
    var game = {}
    game.cards_stack = cardsModel.prepareDeckCardsHome()
    game.players = data.private_room.players.map((p,i) => {
      return {
          key:i,
          user_id: p.user_id,
          user_name: p.user_name,
          coins: 14000,
          cards: [],
          bid_price: 0,
          offer_card: 0,
          active: true
        }
    })
    game.phase = 1
    game.around = []
    game.bid = []
    var temp_cards = []
    for(var i=0;i<5;i++){
        temp_cards.push(game.cards_stack.pop())
    }
    game.around.push(temp_cards)
    game.player_bidding = Math.floor(Math.random() * 4)
    game.start_bid_price = 1000
    game.player_before = game.player_bidding
    io.in(data.private_room.room_id).emit('start_game',{private_room:data.private_room,game:game})
    setTimeout(() => {
      startGame(data.private_room.room_id,game)
    }, 200);
  })

  socket.on('dealCard',data =>{
    data.game.players.forEach(p=>{
      p.bid_price = 0
      p.offer_card = 0
      p.active = true
    })
    data.game.start_bid_price = 1000
    var temp_cards = []
    for(var i=0;i<5;i++){
      if(data.game.cards_stack.length>0){
        temp_cards.push(data.game.cards_stack.pop())
      }
    }
    data.game.around.push(temp_cards)
    io.in(data.room_id).emit('dealCard',{game:data.game})
  })

  socket.on('bid',data =>{
    data.game.player_before = data.game.player_bidding
    for(var i = data.game.player_bidding+1;i<5+data.game.player_bidding+1;i++){
      if (data.game.players[i%5].active == true) {
        data.game.player_bidding = i%5
        break
      }
    }
    io.in(data.room_id).emit('bid',{game:data.game})
  })

  socket.on('pass',data=> {
    // clearInterval(io.nsps['/'].adapter.rooms[data.room_id].countdown);
    data.game.player_before = data.game.player_bidding
    for(var i = data.game.player_bidding;i<5+data.game.player_bidding;i++){
      if (data.game.players[i%5].active == true) {
        data.game.player_bidding = i%5
        break
      }
    } 
    io.in(data.room_id).emit('pass',{game:data.game})
  })

  socket.on('offer',data=> {
    io.in(data.room_id).emit('offer',{game:data.game})
  })

  socket.on('phase_2',data =>{
    data.game.cards_stack = cardsModel.prepareDeckCardsMonney()
    data.game.players.forEach(p=>{
      p.cards = p.cards.slice(0)
      p.cards.sort(function(a,b) {
        return  a-b;
      });
      p.bid_price = 0
      p.offer_card = 0
      p.active = true
    })
    data.game.around = []
    var temp_cards = []
    for(var i=0;i<5;i++){
      if(data.game.cards_stack.length>0){
        temp_cards.push(data.game.cards_stack.pop())
      }
    }
    data.game.around.push(temp_cards)
    data.game.phase = 2
    setTimeout(() => {
      io.in(data.room_id).emit('dealCard',{game:data.game})
    }, 2000);
  })

  socket.on('score_summary',data => {
    io.in(data.room_id).emit('score_summary',{game:data.game})
    data.game.players.forEach(player => {
      db.collection("users").where("user_id", "==", player.user_id).get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // Build doc ref from doc.id
              var user_point = doc.data().user_point + (player.coins/10)
              db.collection("users").doc(doc.id).update({user_point:user_point});
          });
      })
    })
  })

  socket.on('players_before_join',data =>{
    io.to(`${getKeyByValue(sockets,data.private_room.players[0].user_id)}`).emit('players_now',{profile:data.profile})

  })
  socket.on('players_now',data => {
    io.to(`${getKeyByValue(sockets,data.profile.user_id)}`).emit('players_before_join',{private_room:data.private_room})
  })
  socket.on('players_in_private_room',data =>{
    if(data.private_room.room_id && io.nsps['/'].adapter.rooms[data.private_room.room_id] !== undefined){
      if(io.nsps['/'].adapter.rooms[data.private_room.room_id].length !== data.private_room.players.length){
        var playersSocketsId = getKeyRoom(io.nsps['/'].adapter.rooms[data.private_room.room_id].sockets)
        var playersId = playersSocketsId.map(socketId => sockets[socketId])
        data.private_room.players = data.private_room.players.filter(function(item) {
          return playersId.includes(item.user_id) ? true : false;
        });
        if(data.private_room.players.findIndex(player => player.status_player == 'owner') == -1){
          io.in(data.private_room.room_id).emit('closed_room')
        }else{
          io.in(data.private_room.room_id).emit('players_in_private_room',{private_room:data.private_room})
        }
      } 
    }
  })
  socket.on('chat',function(data){
    io.in(data.room_id).emit('chat',{message:data.message})
  })
  socket.on('findMatchRanking', function(data){
    if(io.nsps['/'].adapter.rooms["public-room-"+roomno] && io.nsps['/'].adapter.rooms["public-room-"+roomno].length > 4){
      roomno++;
    }
    socket.join("public-room-"+roomno);
    var room_id =  `public-room-${roomno}`
    if(io.nsps['/'].adapter.rooms["public-room-"+roomno].length == 1){
      io.nsps['/'].adapter.rooms["public-room-"+roomno].players = []
    }
    io.nsps['/'].adapter.rooms["public-room-"+roomno].players.push({
      user_id: data.profile.user_id,
      user_name: data.profile.user_name,
      user_photoURL: data.profile.user_photoURL
    })
    public_room.room_id = `public-room-${roomno}`
    if(io.nsps['/'].adapter.rooms["public-room-"+roomno].length == 5){
      public_room.players = io.nsps['/'].adapter.rooms["public-room-"+roomno].players
      var game = {}
      game.cards_stack = cardsModel.prepareDeckCardsHome()
      game.players = public_room.players.map((p,i) => {
        return {
            key:i,
            user_id: p.user_id,
            user_name: p.user_name,
            coins: 14000,
            cards: [],
            bid_price: 0,
            offer_card: 0,
            active: true
          }
      })
      game.phase = 1
      game.around = []
      game.bid = []
      game.start_bid_price = 1000
      var temp_cards = []
      for(var i=0;i<5;i++){
          temp_cards.push(game.cards_stack.pop())
      }
      game.around.push(temp_cards)
      //TODO:
      game.player_bidding = Math.floor(Math.random() * 4)
      game.player_before = game.player_bidding
      io.in(room_id).emit('start_game',{public_room:public_room,game:game})
      setTimeout(() => {
        startGame(room_id,game)
      }, 200);
      roomno++;
      player = 0
      // public_room = {
      //   room_id : "",
      //   // players : []
      // }
    }
  })
  socket.on('cancelFindMatchRanking', function(data){
    io.nsps['/'].adapter.rooms["public-room-"+roomno].players.splice(io.nsps['/'].adapter.rooms["public-room-"+roomno].players.findIndex(player => player.user_id == data.profile.user_id),1);
    socket.leave("public-room-"+roomno)
  })

  // When disconnect, delete the socket with the variable
  socket.on('logout',function(){
    delete sockets[socket.id]
  })
  socket.on('disconnect', (data) => {
    delete sockets[socket.id]
    io.sockets.emit('message',{message: client + ' clients connected!'})
  })
})

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function getKeyRoom(object) {
  if ( !(object && typeof object === 'object') ) {
    return null;
  }
  var result = [];
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      result.push(key)
    }
  }
  return result;
}
function startGame(room_id,game){
  var timeLeft = 3;
  var countdown = setInterval(function(){
    if (timeLeft == -1) {
      clearInterval(countdown);
      io.in(room_id).emit('dealCard',{game:game})
    } else {
      io.in(room_id).emit('startGame',{game:game,time:timeLeft})
      timeLeft--;
    }
  },1500);
}

server.listen(3000)

module.exports = {
  sockets,
  server,
  io
}
