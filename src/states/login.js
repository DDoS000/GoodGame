function Login() {}
Login.prototype = {
    preload: function() {
        //load used assets
        this.load.image('bg_main', './assets/images/background_main.jpg');
    },

    create: function() {
        this.background = this.game.add.image(0,0,'bg_main')
        this.background_login = this.game.add.image(440, 210, 'menu_asset', 'bg-white');

        this.btn_login_fb = this.game.add.image(480, 281, 'menu_asset', 'login_fb');        
        this.btn_login_fb.inputEnabled = true;
        this.btn_login_fb.events.onInputUp.add(this.onClickLoginFacebook, this);

        this.btn_login_google = this.game.add.image(480, 399, 'menu_asset', 'login_google');
        this.btn_login_google.inputEnabled = true;
        this.btn_login_google.events.onInputDown.add(this.onClickLoginGoogle, this);
    },

    onClickLoginGoogle: function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        this.signInWithPopup(provider)
    },

    onClickLoginFacebook:function(){
        var provider = new firebase.auth.FacebookAuthProvider();
        this.signInWithPopup(provider)
    },
    signInWithPopup:function(provider){
      provider.setCustomParameters({'display': 'popup'});
      firebase.auth().signInWithPopup(provider).then(async function(result) {
        var user = result.user;
        await db.doc(`users/${user.uid}`).get().then((querySnapshot) => {
          if(querySnapshot._document == null){
            const userRef = db.doc(`users/${user.uid}`);
            const userData = {
              user_id: Math.random().toString(10).substr(2, 5),
              user_email: user.email,
              user_name: user.displayName,
              user_photoURL: user.photoURL,
              user_point: 0,
              friends: [],
              friends_request:[]
            }
            userRef.set(userData,{merge: true});
          }
        });
      }).catch(function(error) {});
    }
};
module.exports = Login;
