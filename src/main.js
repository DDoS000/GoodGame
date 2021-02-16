import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
import ListView from 'phaser-list-view'
import private_room from './states/private_room'
import menu from './states/menu'
import boot from './states/boot'

window.onload = async function () {
  
  var game = new Phaser.Game(1334, 750, Phaser.AUTO, '');
  // Game States
  game.state.add('boot', boot);
  game.state.add('preload', require('./states/preload'));
  game.state.add('login', require('./states/login'));
  game.state.add('play', require('./states/play'));
  game.state.add('menu', menu);
  game.state.add('private_room', private_room);
  game.state.start('boot',true,true,{profile: "xxx"});
};