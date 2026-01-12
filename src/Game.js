import React, { useEffect, useRef, useState } from "react";

export default function Game() {
  const GRAVITY = 0.3;
  const JUMP_FORCE = -10;
  const JETPACK_FORCE = -6;
  const JETPACK_DURATION = 3000;

  const PLATFORM_TYPES = {
    normal: JUMP_FORCE,
    super: JUMP_FORCE * 4,
  };

  const MAX_JUMP_HEIGHT = (JUMP_FORCE * JUMP_FORCE) / (2 * GRAVITY);

  const gameRef = useRef(null);
  const playerRef = useRef(null);
  const animationRef = useRef(null);
  const mountedRef = useRef(true);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(
    Number(localStorage.getItem("bestScore")) || 0
  );
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    if (!gameRef.current || !playerRef.current) return;

    let player = { x: 180, y: 500, vy: JUMP_FORCE };
    let keys = {};

    let platforms = [];
    let jetpacks = [];
    let shields = [];
    let enemies = [];

    let jetpackActive = false;
    let shieldActive = false;
    let jetpackTimeout = null;

    // 🔊 som de salto
    const jumpSound = new Audio("/jump.mp3");
    jumpSound.volume = 0.2;

    // 🔊 som de morte
    const deathSound = new Audio("/death.mp3");
    deathSound.volume = 0.4;

    // 🔊 música de fundo
    const bgMusic = new Audio("/music.mp3");
    bgMusic.volume = 0.3;
    bgMusic.loop = true;
    bgMusic.play().catch(() => {});

    const powerupSound = new Audio("/powerup.mp3");
    powerupSound.volume = 0.4;

    document.addEventListener(
      "keydown",
      () => {
        jumpSound.play().then(() => jumpSound.pause()).catch(() => {});
      },
      { once: true }
    );

    // plataforma inicial
    platforms.push({
      x: player.x - 20,
      y: player.y + 50,
      type: "normal",
      used: false,
      jetpackGenerated: false,
      shieldGenerated: false,
    });

    // plataformas iniciais
    for (let i = 1; i < 6; i++) {
      const last = platforms[i - 1];
      const gap = Math.random() * MAX_JUMP_HEIGHT * 0.8;

      platforms.push({
        x: Math.random() * 320,
        y: last.y - gap,
        type: Math.random() < 0.2 ? "red" : "normal",
        used: false,
        jetpackGenerated: false,
        shieldGenerated: false,
      });
    }

    function endGame() {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      if (scoreRef.current > bestScore) {
        localStorage.setItem("bestScore", scoreRef.current);
        setBestScore(scoreRef.current);
      }
      try {
        deathSound.currentTime = 0;
        deathSound.play().catch(() => {});
      } catch (e) {}
      gameOverRef.current = true;
      setGameOver(true);
    }

    function loop() {
      if (!mountedRef.current || gameOverRef.current) return;

      // física
      player.vy = jetpackActive ? JETPACK_FORCE : player.vy + GRAVITY;
      player.y += player.vy;

      // movimento horizontal
      if (keys.ArrowLeft) player.x -= 4;
      if (keys.ArrowRight) player.x += 4;
      if (player.x < -40) player.x = 400;
      if (player.x > 400) player.x = -40;

      // colisão plataformas
      platforms.forEach((p) => {
        if (p.type === "red" && p.used) return;

        if (
          player.vy > 0 &&
          player.y + 40 > p.y &&
          player.y + 40 < p.y + 10 &&
          player.x + 40 > p.x &&
          player.x < p.x + 80
        ) {
          player.vy = PLATFORM_TYPES[p.type] || JUMP_FORCE;

          // 🔊 som salto
          jumpSound.currentTime = 0;
          jumpSound.play();

          // jetpack
          if (!p.jetpackGenerated && Math.random() < 0.05) {
            jetpacks.push({
              x: Math.random() * 360,
              y: Math.random() * 400 + 50,
              width: 40,
              height: 20,
            });
            p.jetpackGenerated = true;
          }

          // escudo
          if (!p.shieldGenerated && Math.random() < 0.05) {
            shields.push({
              x: Math.random() * 360,
              y: Math.random() * 400 + 50,
              width: 30,
              height: 30,
            });
            p.shieldGenerated = true;
          }

          if (p.type === "red") p.used = true;
        }
      });

      // colisão jetpack
      jetpacks.forEach((j, i) => {
        if (
          player.x < j.x + j.width &&
          player.x + 40 > j.x &&
          player.y < j.y + j.height &&
          player.y + 40 > j.y
        ) {
          jetpacks.splice(i, 1);
          jetpackActive = true;
          playerRef.current.classList.add("jetpack-active");
          try {
            powerupSound.currentTime = 0;
            powerupSound.play().catch(() => {});
          } catch (e) {}

          clearTimeout(jetpackTimeout);
          jetpackTimeout = setTimeout(() => {
            jetpackActive = false;
            playerRef.current.classList.remove("jetpack-active");
          }, JETPACK_DURATION);
        }
      });

      // colisão escudo
      shields.forEach((s, i) => {
        if (
          player.x < s.x + s.width &&
          player.x + 40 > s.x &&
          player.y < s.y + s.height &&
          player.y + 40 > s.y
        ) {
          shields.splice(i, 1);
          shieldActive = true;
          playerRef.current.classList.add("shield-active");
          try {
            powerupSound.currentTime = 0;
            powerupSound.play().catch(() => {});
          } catch (e) {}
        }
      });

      // inimigos
      enemies.forEach((e, idx) => {
        e.x += e.speed * e.dir;
        if (e.x <= 0 || e.x + e.width >= 400) e.dir *= -1;

        if (
          player.x < e.x + e.width &&
          player.x + 40 > e.x &&
          player.y < e.y + e.height &&
          player.y + 40 > e.y
        ) {
          if (shieldActive) {
            shieldActive = false;
            playerRef.current.classList.remove("shield-active");
            enemies.splice(idx, 1);
          } else {
            endGame();
          }
        }
      });

      // scroll
      if (player.y < 300) {
        player.y = 300;
        platforms.forEach((p) => (p.y += 4));
        jetpacks.forEach((j) => (j.y += 4));
        shields.forEach((s) => (s.y += 4));
        enemies.forEach((e) => (e.y += 4));

        scoreRef.current += 4;
        setScore(scoreRef.current);

        if (platforms[0].y > 600) {
          platforms.shift();
          const last = platforms.at(-1);
          const gap = Math.random() * MAX_JUMP_HEIGHT * 0.8;

          platforms.push({
            x: Math.random() * 320,
            y: last.y - gap,
            type:
              Math.random() < 0.15
                ? "red"
                : Math.random() < 0.05
                ? "super"
                : "normal",
            used: false,
            jetpackGenerated: false,
            shieldGenerated: false,
          });

          if (Math.random() < 0.1 && scoreRef.current > 1000) {
            enemies.push({
              x: Math.random() * 340,
              y: last.y - gap - 200 - Math.random() * 100,
              width: 40,
              height: 40,
              speed: 1 + Math.random(),
              dir: Math.random() < 0.5 ? -1 : 1,
            });
          }
        }
      }

      if (player.y > 650) endGame();

      render();
      animationRef.current = requestAnimationFrame(loop);
    }

    function render() {
      const gameEl = gameRef.current;
      playerRef.current.style.transform = `translate(${player.x}px, ${player.y}px)`;

      gameEl
        .querySelectorAll(".platform,.jetpack,.shield,.enemy")
        .forEach((e) => e.remove());

      platforms.forEach((p) => {
        if (p.type === "red" && p.used) return;
        const el = document.createElement("div");
        el.className = `platform ${p.type}`;
        el.style.left = p.x + "px";
        el.style.top = p.y + "px";
        gameEl.appendChild(el);
      });

      jetpacks.forEach((j) => {
        const el = document.createElement("div");
        el.className = "jetpack";
        el.style.left = j.x + "px";
        el.style.top = j.y + "px";
        el.style.width = j.width + "px";
        el.style.height = j.height + "px";
        gameEl.appendChild(el);
      });

      shields.forEach((s) => {
        const el = document.createElement("div");
        el.className = "shield";
        el.style.left = s.x + "px";
        el.style.top = s.y + "px";
        el.style.width = s.width + "px";
        el.style.height = s.height + "px";
        gameEl.appendChild(el);
      });

      enemies.forEach((e) => {
        const el = document.createElement("div");
        el.className = "enemy";
        el.style.left = e.x + "px";
        el.style.top = e.y + "px";
        el.style.width = e.width + "px";
        el.style.height = e.height + "px";
        gameEl.appendChild(el);
      });
    }

    function handleKeyDown(e) {
      keys[e.key] = true;
    }

    function handleKeyUp(e) {
      keys[e.key] = false;
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    loop();

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearTimeout(jetpackTimeout);
    };
  }, [bestScore, runKey]);

  function restart() {
    gameOverRef.current = false;
    setGameOver(false);
    scoreRef.current = 0;
    setScore(0);
    if (playerRef.current) {
      playerRef.current.classList.remove("jetpack-active");
      playerRef.current.classList.remove("shield-active");
    }
    setRunKey((k) => k + 1);
  }

  return (
    <div className="game" ref={gameRef}>
      <div className="player" ref={playerRef} />

      <div className="hud">
        <div>Score: {score}</div>
        <div>Best: {bestScore}</div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h2>GAME OVER</h2>
          <button onClick={restart} className="restart-btn">
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}