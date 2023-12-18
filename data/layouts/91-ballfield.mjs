class BallfieldVector {
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
      this.divide(new BallfieldVector(s, s));
    }
  }

  speed() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  distence(vector) {
    return Math.sqrt(
      Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2)
    );
  }

  clone() {
    return new BallfieldVector(this.x, this.y);
  }
}

/**
 * BallField
 */
class Ball {
  constructor(element, position, velocity, radius, mass = 1) {
    this.element = element;
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.mass = mass;
    this.boost = new BallfieldVector(0, 0);
  }

  move() {
    this.position.add(this.velocity);
  }

  moveElement() {
    this.element.style.left = this.position.x - this.radius + 'px';
    this.element.style.top = this.position.y - this.radius + 'px';
  }

  distence(ball) {
    return this.position.distence(ball.position);
  }

  speed() {
    return this.velocity.speed();
  }

  angle() {
    return this.velocity.angle();
  }

  //collision source: https://github.com/miskimit/miskimit.github.io
  boxCollision(width, height) {
    if (
      this.position.x - this.radius < 0 ||
      this.position.x + this.radius > width
    ) {
      this.velocity.multiply(new BallfieldVector(-1, 1));
      if (this.position.x - this.radius + this.velocity.x < 0) {
        this.position.x = this.radius;
      }
      if (this.position.x + this.radius + this.velocity.x > width) {
        this.position.x = width - this.radius;
      }
    }

    if (
      this.position.y - this.radius < 0 ||
      this.position.y + this.radius > height
    ) {
      this.velocity.multiply(new BallfieldVector(1, -1));
      if (this.position.y - this.radius + this.velocity.y < 0) {
        this.position.y = this.radius;
      }
      if (this.position.y + this.radius + this.velocity.y > height) {
        this.position.y = height - this.radius;
      }
    }
  }

  staticCollision(ball2) {
    let overlap = this.radius + ball2.radius - this.distence(ball2);
    let theta = Math.atan2(
      this.position.y - ball2.position.y,
      this.position.x - ball2.position.x
    );
    var dx = overlap * Math.cos(theta);
    var dy = overlap * Math.sin(theta);
    this.position.add(new BallfieldVector(dx, dy));
    ball2.position.subtract(new BallfieldVector(dx, dy));
  }

  cursorShadow(cursor) {
    var shadow = this.element.querySelector('.shadow');
    if (!shadow) {
      return;
    }
    var cx = this.position.x - cursor.x;
    var cy = this.position.y - cursor.y;
    var cr = this.radius - 15;
    shadow.style.left = cx / 20 + cr + 'px';
    shadow.style.top = cy / 20 + cr + 'px';
    var blur = (Math.abs(cx) + Math.abs(cy)) / 2 / 40 + 2;
    var rrr = this.radius - 20;
    var bg = window
      .getComputedStyle(shadow)
      .getPropertyValue('background-color');
    shadow.style.boxShadow = '0px 0px ' + blur + 'px ' + rrr + 'px ' + bg;
  }
}

class BallField {
  constructor() {
    this.balls = new Array();
    this.small;
    this.cursor = new BallfieldVector(0, 0);
    this.onResize();
    var _this = this;
    window.addEventListener('resize', function (event) {
      _this.onResize();
    });
    document.addEventListener('keydown', function (event) {
      if (
        (event.altKey || event.metaKey) &&
        event.key.toLocaleLowerCase() == 'b'
      ) {
        var ballsElement = document.querySelector('#ballfield .field');
        var nb = document.createElement('div');
        nb.classList.add('ball');
        nb.classList.add('no4');
        nb.style.backgroundColor =
          'rgb(' +
          Math.floor(Math.random() * 255) +
          ',' +
          Math.floor(Math.random() * 255) +
          ',' +
          Math.floor(Math.random() * 255) +
          ')';
        ballsElement.appendChild(nb);
        _this.newBall(nb, 100);
      } else if (
        (event.altKey || event.metaKey) &&
        event.key.toLocaleLowerCase() == 'v'
      ) {
        var ballsElement = document.querySelector('#ballfield .field');
        if (ballsElement.childElementCount <= 0) {
          return;
        }
        ballsElement.removeChild(ballsElement.lastChild);
        _this.balls.pop();
      } else if (
        (event.altKey || event.metaKey) &&
        event.key.toLocaleLowerCase() == 'h'
      ) {
        for (var i = 0; i < 10; i++) {
          var ballsElement = document.querySelector('#ballfield .field');
          var nb = document.createElement('div');
          nb.classList.add('ball');
          nb.classList.add('no4');
          nb.style.backgroundColor =
            'rgb(' +
            Math.floor(Math.random() * 255) +
            ',' +
            Math.floor(Math.random() * 255) +
            ',' +
            Math.floor(Math.random() * 255) +
            ')';
          ballsElement.appendChild(nb);
          _this.newBall(nb, 100);
        }
      } else if (
        (event.altKey || event.metaKey) &&
        event.key.toLocaleLowerCase() == 'g'
      ) {
        for (var i = 0; i < 10; i++) {
          var ballsElement = document.querySelector('#ballfield .field');
          if (ballsElement.childElementCount <= 3) {
            return;
          }
          ballsElement.removeChild(ballsElement.lastChild);
          _this.balls.pop();
        }
      } else if (event.altKey && event.key.toLocaleLowerCase() == 'r') {
        var ballsElement = document.querySelector('#ballfield .field');
        ballsElement.classList.toggle('real');
      }
    });
    /*document.addEventListener('mousemove', function (event) {
      _this.cursor = new Vector(event.clientX, event.clientY);
    });*/

    function f() {
      _this.frame();
      window.requestAnimationFrame(f);
    }
    window.requestAnimationFrame(f);

    this.onResize();

    if (Math.random() * 100 < 1.0) {
      document.querySelector('#ballfield').classList.toggle('real');
    }

    setTimeout(() => {
      _this.onResize();
    }, 500);
  }

  frame() {
    this.collision();
    for (var ball of this.balls) {
      ball.move();
      ball.moveElement();
    }
  }

  collision() {
    var ballsClone = this.balls.filter(() => true);

    for (let n = 0; n < ballsClone.length; n++) {
      for (let m = n + 1; m < ballsClone.length; m++) {
        var ball1 = ballsClone[n];
        var ball2 = ballsClone[m];
        var distence = ball1.distence(ball2);

        if (distence < ball1.radius + ball2.radius) {
          let theta1 = ball1.angle();
          let theta2 = ball2.angle();
          let phi = Math.atan2(
            ball2.position.y - ball1.position.y,
            ball2.position.x - ball1.position.x
          );
          let m1 = ball1.mass;
          let m2 = ball2.mass;
          let v1 = ball1.speed();
          let v2 = ball2.speed();

          let dx1F =
            ((v1 * Math.cos(theta1 - phi) * (m1 - m2) +
              2 * m2 * v2 * Math.cos(theta2 - phi)) /
              (m1 + m2)) *
              Math.cos(phi) +
            v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
          let dy1F =
            ((v1 * Math.cos(theta1 - phi) * (m1 - m2) +
              2 * m2 * v2 * Math.cos(theta2 - phi)) /
              (m1 + m2)) *
              Math.sin(phi) +
            v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);
          let dx2F =
            ((v2 * Math.cos(theta2 - phi) * (m2 - m1) +
              2 * m1 * v1 * Math.cos(theta1 - phi)) /
              (m1 + m2)) *
              Math.cos(phi) +
            v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
          let dy2F =
            ((v2 * Math.cos(theta2 - phi) * (m2 - m1) +
              2 * m1 * v1 * Math.cos(theta1 - phi)) /
              (m1 + m2)) *
              Math.sin(phi) +
            v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);

          this.balls[n].velocity.x = dx1F;
          this.balls[n].velocity.y = dy1F;
          this.balls[m].velocity.x = dx2F;
          this.balls[m].velocity.y = dy2F;

          this.balls[n].staticCollision(this.balls[m]);
        }
      }

      this.balls[n].boxCollision(window.innerWidth, window.innerHeight);
    }
  }

  onResize() {
    var percent = 15;
    var s = (window.innerWidth + window.innerHeight) / 2;
    var diameter = Math.max((s / 100.0) * percent, 90);
    var radius = diameter / 2;
    for (var ball of this.balls) {
      ball.radius = radius;
      ball.element.style.width = diameter + 'px';
      ball.element.style.height = diameter + 'px';
    }
  }

  newBall(element, radius, mass = 1) {
    var position = new BallfieldVector(
      Math.floor(Math.random() * window.innerWidth),
      Math.floor(Math.random() * window.innerHeight)
    );
    var velocity = new BallfieldVector(
      Math.max(0.5, Math.random() * 2),
      Math.max(0.5, Math.random() * 2)
    );
    if (Math.random() > 0.5) {
      velocity.multiply(new BallfieldVector(-1, 1));
    }
    if (Math.random() > 0.5) {
      velocity.multiply(new BallfieldVector(1, -1));
    }
    //var velocity = new Vector(0, 0);
    var b = new Ball(element, position, velocity, radius, mass);

    b.dragmovement = [
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
      new BallfieldVector(0, 0),
    ];

    b.lastpos = new BallfieldVector(0, 0);

    element.addEventListener('mousedown', function (event) {
      element.classList.add('dragging');
      event.preventDefault();
    });

    document.addEventListener('mouseup', function (event) {
      element.classList.remove('dragging');
    });

    document.addEventListener('mousemove', function (event) {
      if (!element.classList.contains('dragging')) {
        return;
      }
      b.position.x = event.clientX; // + window.pageXOffset;
      b.position.y = event.clientY; // + window.pageYOffset;
      b.dragmovement.pop();
      b.dragmovement.unshift(
        new BallfieldVector(event.movementX / 30, event.movementY / 30)
      );
      var movement = b.dragmovement[5].clone();
      movement.add(b.dragmovement[4]);
      movement.add(b.dragmovement[3]);
      b.velocity = movement;
    });

    element.addEventListener(
      'touchstart',
      function (event) {
        element.classList.add('dragging');
        b.lastpos = new BallfieldVector(0, 0);
        b.lastpos.x = event.changedTouches[0].clientX;
        +window.pageXOffset;
        b.lastpos.y = event.changedTouches[0].clientY;
        +window.pageYOffset;
        event.preventDefault();
      },
      false
    );

    document.addEventListener(
      'touchmove',
      function (event) {
        if (!element.classList.contains('dragging')) {
          return;
        }
        b.position.x = event.changedTouches[0].clientX; // + window.pageXOffset;
        b.position.y = event.changedTouches[0].clientY; // + window.pageYOffset;
        var move = new BallfieldVector(
          (b.position.x - b.lastpos.x) / 10.0,
          (b.position.y - b.lastpos.y) / 10.0
        );
        b.dragmovement.pop();
        b.dragmovement.unshift(move);
        var movement = b.dragmovement[5].clone();
        movement.add(b.dragmovement[4]);
        movement.add(b.dragmovement[3]);
        b.velocity = movement;
        b.lastpos = b.position.clone();
      },
      false
    );

    document.addEventListener(
      'touchcancel',
      function (event) {
        element.classList.remove('dragging');
      },
      false
    );

    document.addEventListener(
      'touchend',
      function (event) {
        element.classList.remove('dragging');
      },
      false
    );

    this.balls.push(b);
    this.onResize();
  }
}

window.ballfield = new BallField();

function newBall(href) {
  var ballsElement = document.querySelector('#ballfield .field');
  var nb = document.createElement('div');
  nb.classList.add('ball');
  nb.innerHTML = '<p><b>doubleclick this</b><br><i>or drag me...</i></p>';
  nb.style.backgroundColor =
    'rgb(' +
    Math.floor(Math.random() * 255) +
    ',' +
    Math.floor(Math.random() * 255) +
    ',' +
    Math.floor(Math.random() * 255) +
    ')';
  nb.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
  nb.addEventListener('dblclick', () => {
    window.location.href = href;
  });
  ballsElement.appendChild(nb);
  ballfield.newBall(nb, 100);
}
