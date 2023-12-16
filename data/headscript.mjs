'use strict';

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x = this.x + vector.x;
    this.y = this.y + vector.y;
  }

  subtract(vector) {
    this.x = this.x - vector.x;
    this.y = this.y - vector.y;
  }

  multiply(vector) {
    this.x = this.x * vector.x;
    this.y = this.y * vector.y;
  }

  divide(vector) {
    this.x = this.x / vector.x;
    this.y = this.y / vector.y;
  }

  normalize() {
    var s = this.speed();
    if (s > 0) {
      this.divide(new Vector(s, s));
    }
  }

  speed() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  distance(vector) {
    return Math.sqrt(
      Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2)
    );
  }

  clone() {
    return new Vector(this.x, this.y);
  }
}

let update = false;
let data = {
  mouse: {
    clicks: 0,
    move_distance: 0,
    enter: 0,
    leave: 0,
  },
  keyboard: {
    pressed: 0,
  },
};
let datacopy = JSON.parse(JSON.stringify(data));

setInterval(() => {
  if (update) {
    update = false;
    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify(data),
    });
    data = JSON.parse(JSON.stringify(datacopy));
  }
}, 100);

document.addEventListener('click', (event) => {
  update = true;
  data.mouse.clicks += 1;
});

let lastMouseMovePosition = null;
document.addEventListener('mousemove', (event) => {
  update = true;
  const position = new Vector(event.clientX, event.clientY);
  if (lastMouseMovePosition) {
    const distance = Math.floor(lastMouseMovePosition.distance(position));
    data.mouse.move_distance += distance;
  }
  lastMouseMovePosition = position;
});

document.addEventListener('mouseenter', (event) => {
  update = true;
  data.mouse.enter += 1;
});

document.addEventListener('mouseleave', (event) => {
  update = true;
  data.mouse.leave += 1;
});

document.addEventListener('keydown', (event) => {
  update = true;
  data.keyboard.pressed += 1;
});
