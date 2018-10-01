const playerSize = 30;
const playerSpeed = 150;
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('bluePlayer', 'assets/characterBlue (3).png');
  this.load.image('redPlayer', 'assets/characterRed (3).png');
  this.load.spritesheet('ground', 'assets/groundGrass_mown.png',{frameWidth:55,frameHeight:55});
}

function create() {
  back = this.add.tileSprite(400,300, 800,600, 'mushroom').setAlpha(0.2);
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach((id) => {
      if (players[id].playerId === this.socket.id) {
        addPlayer(this, players[id]);
      } else {
        addOtherPlayers(this, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', (playerInfo) => {
    addOtherPlayers(this, playerInfo);
  });
  this.socket.on('playerMoved', (playerInfo) => {
    this.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (otherPlayer.playerId === playerInfo.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
      this.update();
    });
  });
  this.socket.on('disconnect', (playerId) => {
    this.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (this.player) {
    this.physics.world.collide(this.player, this.otherPlayers);
    if (this.cursors.left.isDown) {
      this.player.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.player.setAngularVelocity(150);
    }


    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.player.rotation, 100, this.player.body.velocity);
    }
    if (this.cursors.down.isDown) {
      this.physics.velocityFromRotation(this.player.rotation, -50, this.player.body.velocity);
    }

    this.physics.world.wrap(this.player, 5);
    const x = this.player.x;
    const y = this.player.y;
    const r = this.player.rotation;
    if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || r !== this.player.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
    }

    // save old position data
    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation,
    };
  }
}

function addPlayer(self, playerInfo) {
  if (playerInfo.team === 'red') {
    self.player = self.physics.add.image(playerInfo.x, playerInfo.y, 'redPlayer').setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize);
  } else {
    self.player = self.physics.add.image(playerInfo.x, playerInfo.y, 'bluePlayer').setOrigin(0.5, 0.5).setDisplaySize(playerSize, playerSize);
  }
  self.player.setDrag(100);
  self.player.setAngularDrag(1000);
  self.player.setMaxVelocity(200);
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
