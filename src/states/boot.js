var game
var profile = {}
var ranking = []
function Boot() {
}

Boot.prototype = {

  preload: function() {
    console.log("------------BOOT---------------");
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

  	//load the preloader UI
    this.load.image('preloader', './assets/images/preloader.gif');
    this.load.atlas('menu_asset', 'assets/images/asset_menu.png', 'assets/json/asset_menu.json');
  },

  create: function() {
    game = this.game
    this.game.input.maxPointers = 1;
    this.stage.disableVisibilityChange = true;
    this.checkLogin()
  },

  checkLogin : function(){
    firebase.auth().onAuthStateChanged( function(user) {
      if (user) {
        
        db.collection("users").doc(user.uid).update({user_name:user.displayName,user_photoURL:user.photoURL})
        setTimeout(async () => {
        await db.doc(`users/${user.uid}`).get().then((querySnapshot) => {
          profile = querySnapshot.data()
          profile.user_ranking_world = 0
        });
        await db.collection("users").orderBy("user_point", "desc").get().then((querySnapshot) => {
          
          ranking = querySnapshot.docs.map(user => user.data())
          profile.user_ranking_world = ranking.findIndex(user => user.user_id ==  profile.user_id)+1
        });
        return game.state.start('preload',true,false,{profile:profile,ranking:ranking});
        }, 1000);
      } else {
        // No user is signed in.
        return game.state.start('login');
      }
    });
  }
};

module.exports = Boot;
