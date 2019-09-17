"use strict";
cc._RF.push(module, '97258OmOcZEJIes7LV/pGyQ', 'bcxAdapter');
// SDK/bcx/bcxAdapter.js

'use strict';

// import BCX from 'bcx.min.js' 
require('./core.min');

require('./plugins.min');

//cocos配置
var _configParams = {
    ws_node_list: [{
        url: "ws://39.106.126.54:8049",
        name: "COCOS3.0节点2"
    }],
    networks: [{
        core_asset: "COCOS",
        chain_id: '7d89b84f22af0b150780a2b121aa6c715b19261c8b7fe0fda3a564574ed7d3e9'
    }],
    faucetUrl: 'http://47.93.62.96:8041',
    auto_reconnect: true,
    worker: false,
    real_sub: true,
    check_cached_nodes_data: true
};

var BCXAdpater = cc.Class({
    // onLoad () {},

    start: function start() {
        //console.info("window=1=",window.BcxWeb);
    },
    initSDK: function initSDK(callback) {
        this.contractName = "contract.starproject"; //合约名称
        if (window.BcxWeb) {
            this.bcl = window.BcxWeb;
            console.log("===bcl---");
            if (callback) {
                callback(true);
            }
        } else {
            console.log("===bcl--cocos-");
            var self = this;
            self.bcl = new BCX(_configParams);
            Cocosjs.plugins(new CocosBCX());
            //connect pc-plugin between sdk
            Cocosjs.cocos.connect('My-App').then(function (connected) {
                console.log("connected==" + connected);
                if (!connected) {
                    //检测一下注入
                    self.checkWindowBcx(function (is_success) {
                        console.log("is_success==", is_success);
                        if (is_success) {
                            if (callback) {
                                console.log("is_success==222");
                                callback(true);
                            }
                        } else {
                            console.log("no_cocos_pay");
                            callback(false);
                        }
                    });
                    return false;
                }

                //此时走的是coocspay客户端
                var cocos = Cocosjs.cocos;
                self.bcl = cocos.cocosBcx(self.bcl);
                if (self.bcl) {
                    if (callback) {
                        callback(true);
                    }
                } else {
                    if (callback) {
                        callback(null);
                    }
                }
            }).catch(function (e) {
                console.log("connect error---" + JSON.stringify(e));
            });
        }
    },
    checkWindowBcx: function checkWindowBcx(callback) {
        //目前进来的时候可能还没有吧bcx挂在window 需要个定时器
        var check_count = 0;
        var self = this;
        var sdk_intervral = setInterval(function () {
            console.log("checkWindowBcx", window.BcxWeb);
            if (window.BcxWeb) {
                self.bcl = window.BcxWeb;
                if (callback) {
                    callback(true);
                }
                clearInterval(sdk_intervral);
            }

            if (check_count >= 3) {
                clearInterval(sdk_intervral);
                if (callback) {
                    callback(false);
                }
            }
            check_count = check_count + 1;
        }, 1000);
    },
    login: function login(callback) {
        var _this = this;

        if (this.bcl) {
            try {
                console.log("login===adada=");
                this.bcl.getAccountInfo().then(function (res) {
                    console.log("res.account_name==" + res.account_name);
                    _this.bcl.account_name = res.account_name;
                    if (callback) {
                        callback(res);
                    }
                });
            } catch (e) {
                console.log("login==e====" + e);
                console.log("his.bcl.account_name===" + this.bcl.account_name);
                if (this.bcl.account_name) {
                    if (callback) {
                        callback(this.bcl.account_name);
                    }
                }
            }
        }
    },
    getBalanceByAccount: function getBalanceByAccount(account, callback) {
        this.bcl.queryAccountBalances({
            assetId: 'COCOS',
            account: account

        }).then(function (res) {
            console.info('getBalanceByAccount==', res);

            if (res.code === -25 || res.code === 125) {
                //表示还没有这种代币，先给与赋值为0
                res.code = 1;
                res.data.COCOS = 0;
                if (callback) {
                    callback(res);
                }
            }

            if (res.code === 1) {
                if (callback) {
                    callback(res);
                }
            } else if (callback) {
                callback(res);
            }
        });
    },
    sendWinCocos: function sendWinCocos(account, stars, callback) {
        this.bcl.callContractFunction({
            nameOrId: this.contractName,
            functionName: 'sendstar',
            valueList: [account, stars] ////

        }).then(function (res) {
            console.info("draw res=", res);

            if (res.code === 1) {
                callback(res);
            } else {
                callback(res);
            }
        }).catch(function (e) {
            console.info("sendWinCocos error=", JSON.stringify(e));
        });
    },
    sendNhAsset: function sendNhAsset(account, nhAssetID, callback) {
        this.bcl.callContractFunction({
            nameOrId: this.contractName,
            functionName: 'transfer_nht_from_owner',
            valueList: [account, nhAssetID] ////

        }).then(function (res) {
            console.info("draw res=", res);

            if (res.code === 1) {
                callback(res);
            } else {
                callback(res);
            }
        }).catch(function (e) {
            console.info("sendNhAsset error=", JSON.stringify(e));
        });
    }
});

var bcxAdapter = new BCXAdpater();
bcxAdapter.start();
module.exports = bcxAdapter;

cc._RF.pop();