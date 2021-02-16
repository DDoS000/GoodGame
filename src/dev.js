'use strict'

const io = require('socket.io-client')
const socket = io('localhost:3000')

var bool = new Boolean(false);
var Myprofile
var status
var players_in_private_room

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function checkNotifications (){
    return new Promise(function(resolve, reject){
        socket.on('invited_friend',(data) =>{
            resolve(data)
        })
    })
}
function updateProfile(){
    
    return Myprofile
}
function updatePlayerInPrivateRoom(){
    return players_in_private_room
}

function login(profile){
    socket.emit('login',{data:profile})
    Myprofile = profile
}
async function find(profile){
    await socket.emit('findRoomRanking',{data: profile})

}
async function checkStatus(){
    await socket.on( 'connectToRoom',(data)=>{
        if(data){
            bool= true;
        }
    })
    return bool;
}

async function checkStatusOnline(uid){
    return new Promise(function(resolve, reject){
        socket.emit('check_status_online',uid,(data) =>{
            resolve(data)
        })
    })
}

function addFriends(uid){   
    var status = checkStatusOnline(uid)
        db.collection("users").where("user_id", "==", uid).get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // Build doc ref from doc.id
                var friends_req = doc.data().friends_request
                // friends_req.
                friends_req.push(Myprofile.user_id)
                db.collection("users").doc(doc.id).update({friends_request:friends_req});
            });
        })
    // }
}
async function confirmFriends(uid){
    await db.collection("users").where("user_id","==",Myprofile.user_id).get().then((querySnapshot) => {
        Myprofile = querySnapshot.docs[0].data()
        Myprofile.friends.push(uid)
        Myprofile.friends_request.splice(Myprofile.friends_request.findIndex(user_id => user_id == uid), 1)
        
        var res = db.collection("users").doc(querySnapshot.docs[0].id)
        res.update({friends:Myprofile.friends})
        res.update({friends_request:Myprofile.friends_request})

        var res = db.collection("users").doc(querySnapshot.docs[0].id)
    })
    await db.collection("users").where("user_id","==",uid).get().then((querySnapshot) => {
        var friend = querySnapshot.docs[0].data().friends;
        friend.push(Myprofile.user_id)
        db.collection("users").doc(querySnapshot.docs[0].id).update({friends:friend})
    })
}
async function cancelFriends(uid){
    await db.collection("users").where("user_id","==",Myprofile.user_id).get().then((querySnapshot) => {
        Myprofile = querySnapshot.docs[0].data()
        Myprofile.friends_request.splice(Myprofile.friends_request.findIndex(user_id => user_id == uid), 1)
        db.collection("users").doc(querySnapshot.docs[0].id).update({friends_request:Myprofile.friends_request});
    })
}
function inviteFriend(uid,private_room){
    socket.emit('invite_friend',{Myprofile,uid,private_room})
}
function createPrivateRoom(){
    socket.emit('create_private_room',{Myprofile})
}
function joinRoom(private_room,profile,){
    socket.emit('join_room',{private_room,profile})
}
let i = 1
async function play(){
    i++
    socket.emit('newGame')
}

async function dealCard(){
    var val
    socket.emit('randomDealCard')
    socket.on('dealCard',(data) => {
        val = data.card
    })
    await  sleep(500);
    return val
}

socket.on('message', (data)=>{
})
function logout(){
    socket.emit('logout')
}

socket.on('disconnect',()=>{
    socket.on('message', (data)=>{
    }) 
})
module.exports = {
    socket,
    find,
    checkStatus,
    play,
    dealCard,
    login,
    logout,
    checkStatusOnline,
    addFriends,
    confirmFriends,
    cancelFriends,
    updateProfile,
    inviteFriend,
    checkNotifications,
    createPrivateRoom,
    joinRoom,
    updatePlayerInPrivateRoom
}