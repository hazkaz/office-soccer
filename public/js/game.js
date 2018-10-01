var playerSize = 30;
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('bluePlayer', 'assets/characterBlue (3).png');
    this.load.image('redPlayer', 'assets/characterRed (3).png');
}

function create() {
    var self = this;
    this.socket = io();
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            }
        });
    });
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
}

function update() { }

function addPlayer(self, playerInfo) {
    if (playerInfo.team === 'red') {
        self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'redPlayer').setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize);
    } else {
        self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'bluePlayer').setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize);
    }
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}
function addOtherPlayers(self, playerInfo) {
    let otherPlayer;
    if (playerInfo.team === 'red') {
        otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'redPlayer').setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize);
    } else {
        otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'bluePlayer').setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}