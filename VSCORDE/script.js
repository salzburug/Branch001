const hands = ['グー','チョキ','パー'];
let playerScore = 0, cpuScore = 0;

const playerScoreEl = document.getElementById('player-score');
const cpuScoreEl = document.getElementById('cpu-score');
const playerChoiceEl = document.getElementById('player-choice');
const cpuChoiceEl = document.getElementById('cpu-choice');
const outcomeEl = document.getElementById('outcome');
const handButtons = document.querySelectorAll('.hand');
const resetBtn = document.getElementById('reset');

function cpuPick(){
  return Math.floor(Math.random()*3);
}

function decide(player, cpu){
  const diff = (player - cpu + 3) % 3;
  if(diff === 0) return 'tie';
  if(diff === 1) return 'lose';
  return 'win';
}

function updateScore(outcome){
  if(outcome === 'win') playerScore++;
  if(outcome === 'lose') cpuScore++;
  playerScoreEl.textContent = playerScore;
  cpuScoreEl.textContent = cpuScore;
}

function play(player){
  const cpu = cpuPick();
  const result = decide(player, cpu);

  playerChoiceEl.textContent = `あなた: ${hands[player]}`;
  cpuChoiceEl.textContent = `コンピュータ: ${hands[cpu]}`;

  outcomeEl.className = '';
  if(result === 'win'){
    outcomeEl.textContent = 'あなたの勝ち！';
    outcomeEl.classList.add('win');
  } else if(result === 'lose'){
    outcomeEl.textContent = 'あなたの負け…';
    outcomeEl.classList.add('lose');
  } else {
    outcomeEl.textContent = '引き分け';
    outcomeEl.classList.add('tie');
  }

  updateScore(result);
}

handButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const hand = Number(btn.dataset.hand);
    play(hand);
  });
});

resetBtn.addEventListener('click', () => {
  playerScore = 0; cpuScore = 0;
  playerScoreEl.textContent = '0';
  cpuScoreEl.textContent = '0';
  playerChoiceEl.textContent = 'あなた: -';
  cpuChoiceEl.textContent = 'コンピュータ: -';
  outcomeEl.textContent = '選んでください';
  outcomeEl.className = '';
});
