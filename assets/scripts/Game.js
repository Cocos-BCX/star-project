var bcxAdapter = require("bcxAdapter");
cc.Class({
    extends: cc.Component,

    properties: {
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        maxStarDuration: 0,
        minStarDuration: 0,
        ground: {
            default: null,
            type: cc.Node
        },
        player: {
            default: null,
            type: cc.Node
        },
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        accountDisplay: {
            default: null,
            type: cc.Label
        },
        balanceDisplay: {
            default: null,
            type: cc.Label
        },
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    onLoad: function () {
        this.groundY = this.ground.y + this.ground.height/2;
        this.timer = 0;
        this.starDuration = 0;
        this.spawnNewStar();
        this.score = 0;
        this.account_name = '';
        self = this;
        if(bcxAdapter){
            bcxAdapter.initSDK(function(res){
                console.log("initSDK",res)
              if(res){
                bcxAdapter.login(function(res){
                    console.log("login",res)
                    self.accountDisplay.string = res.account_name;
                    self.account_name = res.account_name;
                    bcxAdapter.getBalanceByAccount(res.account_name,function(res){
                        console.log("getBalanceByAccount",res)
                        self.balanceDisplay.string = res.data.COCOS;
                    }) 
                })
              }
            })
        }
    },

    spawnNewStar: function() {
        var newStar = cc.instantiate(this.starPrefab);
        this.node.addChild(newStar);
        newStar.setPosition(this.getNewStarPosition());
        newStar.getComponent('Star').game = this;
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function () {
        var randX = 0;
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 50;
        var maxX = this.node.width/2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        return cc.v2(randX, randY);
    },

    update: function (dt) {

        if (this.timer > this.starDuration) {
            this.gameOver();
            this.enabled = false;   // disable gameOver logic to avoid load scene repeatedly
            return;
        }
        this.timer += dt;
    },

    gainScore: function () {
        this.score += 1;
        this.scoreDisplay.string = 'Score: ' + this.score;
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function () {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('gameover');
        console.log("account_name",this.account_name)
        if(this.score>0){
            if(this.account_name == 'test1'){
                console.log("you are contract account, can not transfer to self")
                return;
            }
            bcxAdapter.sendWinCocos(this.account_name,this.score,function(res){
                console.log("sendWinCocos",res)
            })
        }
    }
});
