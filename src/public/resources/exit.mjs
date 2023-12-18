let spent = 0;

for (const button of document.querySelectorAll(
  '#exit-confirm .controls .button'
)) {
  button.addEventListener('click', (event) => {
    const element = event.target;
    let value = element.getAttribute('v') * 1;
    spent += value;
    if (spent < 0) {
      spent = 0;
    }
    renderSpent();
  });
}

function renderSpent() {
  let text = '';
  let t = spent;
  if (t >= 86400) {
    let d = Math.floor(t / 86400);
    t -= d * 86400;
    text += `<span>${d} Day${d > 1 ? 's' : ''} </span>`;
  }
  if (t >= 3600) {
    let h = Math.floor(t / 3600);
    t -= h * 3600;
    text += `<span>${h} Hour${h > 1 ? 's' : ''} </span>`;
  }
  if (t >= 60) {
    let m = Math.floor(t / 60);
    t -= m * 60;
    text += `<span>${m} Minute${m > 1 ? 's' : ''} </span>`;
  }
  if ((t > 0 && spent > 0) || spent == 0) {
    let s = t;
    text += `<span>${s} Second${s > 1 ? 's' : ''}</span>`;
  }
  document.querySelector('#exit-confirm .value').innerHTML = text;
}

renderSpent();

document.querySelector('#button-exit').addEventListener('click', () => {
  fetch('/api/spent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({
      spent: spent,
    }),
  }).then(() => {
    window.location.href = '/room/escaped';
  });
});

document.querySelector('#button-back').addEventListener('click', () => {
  history.back();
});
