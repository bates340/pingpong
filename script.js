document.addEventListener('DOMContentLoaded', () => {
  const mainMenu = document.getElementById('mainMenu');
  const difficultyMenu = document.getElementById('difficultyMenu');
  const optionsMenu = document.getElementById('optionsMenu');
  const gameCanvas = document.getElementById('gameCanvas');
  const c = document.querySelector("canvas").getContext("2d");
  
  c.canvas.width = 300;
  c.canvas.height = 200;
  let ballX = 150, ballY = 100, dx = 2, dy = 2;
  let paddle1Y = 80, paddle2Y = 80;
  let score1 = 0, score2 = 0;
  let gameMode = '';
  let isGameRunning = false;

  // Paddle renkleri
  let paddle1Color = "#000000";
  let paddle2Color = "#000000";

  // Ses efektleri
  const hitSound = new Audio('hit.wav');
  let volume = 0.5; // Varsayılan ses seviyesi

  // Ana menü butonları
  document.getElementById('startGame').addEventListener('click', () => {
      mainMenu.style.display = 'none';
      difficultyMenu.style.display = 'block';
  });

  document.getElementById('options').addEventListener('click', () => {
      mainMenu.style.display = 'none';
      optionsMenu.style.display = 'block';
  });

  // Zorluk seviyeleri
  document.getElementById('easy').addEventListener('click', () => startGame('easy'));
  document.getElementById('medium').addEventListener('click', () => startGame('medium'));
  document.getElementById('hard').addEventListener('click', () => startGame('hard'));

  // Geri butonları
  document.querySelectorAll('.back').forEach(button => {
      button.addEventListener('click', () => {
          difficultyMenu.style.display = 'none';
          optionsMenu.style.display = 'none';
          mainMenu.style.display = 'block';
      });
  });

  // Ses ayarı
  const volumeSlider = document.getElementById('volumeSlider');
  volumeSlider.addEventListener('input', () => {
      setVolume(volumeSlider.value / 100);
  });

  function setVolume(value) {
      volume = value;
      hitSound.volume = volume;
  }

  // Paddle renk ayarları
  document.getElementById('paddle1Color').addEventListener('input', (e) => {
      paddle1Color = e.target.value;
  });

  document.getElementById('paddle2Color').addEventListener('input', (e) => {
      paddle2Color = e.target.value;
  });

  // Gece modu
  document.getElementById('nightMode').addEventListener('change', (e) => {
      document.body.classList.toggle('night-mode', e.target.checked);
  });

  function startGame(mode) {
      difficultyMenu.style.display = 'none';
      gameCanvas.style.display = 'block';
      gameMode = mode;
      isGameRunning = true;
      resetGame();
      animate();
      document.getElementById('pauseButton').textContent = 'Duraklat';
  }

  // Duraklat ve Çıkış butonları
  const pauseButton = document.getElementById('pauseButton');
  pauseButton.addEventListener('click', pauseGame);
  document.getElementById('quitButton').addEventListener('click', quitGame);

  function pauseGame() {
      isGameRunning = !isGameRunning;
      if (isGameRunning) {
          animate();
          pauseButton.textContent = 'Duraklat';
      } else {
          pauseButton.textContent = 'Devam Et';
      }
  }

  function quitGame() {
      gameCanvas.style.display = 'none';
      mainMenu.style.display = 'block';
      isGameRunning = false;
      resetGame();
  }

  function resetGame() {
      ballX = 150;
      ballY = 100;
      dx = 2;
      dy = 2;
      paddle1Y = 80;
      paddle2Y = 80;
      score1 = 0;
      score2 = 0;
  }

  window.addEventListener("mousemove", e => {
      const rect = c.canvas.getBoundingClientRect();
      paddle1Y = e.clientY - rect.top - 17.5;
  });

  function animate() {
      if (!isGameRunning) return;
      
      requestAnimationFrame(animate);
      c.clearRect(0, 0, 300, 200);
      c.beginPath();
      c.arc(ballX, ballY, 4, 0, Math.PI*2);
      c.fill();
      c.fillStyle = paddle1Color;
      c.fillRect(0, paddle1Y, 3, 35);
      c.fillStyle = paddle2Color;
      c.fillRect(297, paddle2Y, 3, 35);
      c.fillStyle = "#000000";
      c.fillText(score1, 100, 10);
      c.fillText(score2, 200, 10);

      ballX += dx;
      ballY += dy;

      if (ballX < 4 && ballY >= paddle1Y && ballY <= paddle1Y + 35) {
          dx = -dx;
          hitSound.play();
      }
      else if (ballX > 296 && ballY >= paddle2Y && ballY <= paddle2Y + 35) {
          dx = -dx;
          hitSound.play();
      }
      else if (ballX < 0 || ballX > 300) {
          ballX < 0 ? score2++ : score1++;
          ballX = 150;
          ballY = 100;
          dx = Math.sign(dx) * 2;
          dy = Math.sign(dy) * 2;
      }

      if (ballY < 4 || ballY > 196) dy = -dy;
      paddle1Y = Math.max(0, Math.min(paddle1Y, 165));
      
      // AI zorluk seviyeleri
      let aiSpeed;
      switch(gameMode) {
          case 'easy':
              aiSpeed = 1;
              break;
          case 'medium':
              aiSpeed = 1.5;
              break;
          case 'hard':
              aiSpeed = 2;
              break;
      }
      
      let paddleCenter = paddle2Y + 17.5;
      if (Math.abs(ballY - paddleCenter) > 2) {
          if (ballY > paddleCenter) {
              paddle2Y += aiSpeed;
          } else {
              paddle2Y -= aiSpeed;
          }
      }
      
      paddle2Y = Math.max(0, Math.min(paddle2Y, 165));

      checkGameOver();
  }

  function checkGameOver() {
      if (score1 >= 10 || score2 >= 10) {
          isGameRunning = false;
          showGameOverScreen();
      }
  }

  function showGameOverScreen() {
      const winner = score1 >= 10 ? "Oyuncu 1" : "Oyuncu 2";
      const gameOverScreen = document.createElement('div');
      gameOverScreen.id = 'gameOverScreen';
      gameOverScreen.innerHTML = `
          <h2>Oyun Bitti!</h2>
          <p>Kazanan: ${winner}</p>
          <button id="playAgain">Tekrar Oyna</button>
          <button id="returnToMenu">Ana Menüye Dön</button>
      `;
      document.body.appendChild(gameOverScreen);

      document.getElementById('playAgain').addEventListener('click', () => {
          document.body.removeChild(gameOverScreen);
          resetGame();
          startGame(gameMode);
      });

      document.getElementById('returnToMenu').addEventListener('click', () => {
          document.body.removeChild(gameOverScreen);
          quitGame();
      });
  }
});