

class Snake {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 12;
    this.maxForce = 0.5;
    this.r = 16;
    this.h = 0;


    this.history = [];

  }

  evade(snake) {
    let pursuit = this.pursue(snake);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(snake) {
    let target = snake.pos.copy();
    let prediction = snake.vel.copy();
    prediction.mult(12);
    target.add(prediction);
    // stroke(255, 50);
    // line(snake.pos.x,snake.pos.y, target.x, target.y);
    // fill(0, 255, 0, 50);
    // circle(target.x, target.y, 16);
    return this.seek(target);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  seek(target) {
    let force = p5.Vector.sub(target, this.pos);
    force.setMag(this.maxSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    var v = createVector(this.pos.x,this.pos.y);
    this.history.push(v);

    if(this.history.length > 500){
    this.history.splice(0,1);}


  }

  show() {
    stroke(255);
    fill(this.h,255,0);
    strokeWeight(0);
    beginShape();
    for (let i=0; i <this.history.length; i++){
    let pos = this.history[i];
    //fill(this.h, 255, this.h);
    push();
    //translate(this.pos.x, this.pos.y);
    //rotate(this.vel.heading());
    //circle(-this.r, -this.r/2, this.r*2);
    rect(pos.x, pos.y, i/25);

    pop();
      }
    endShape();
    this.h = this.h + 1;
    if (this.h > 50) {
      this.h = 0;
    }


  }

  edges() {

    /*this.pos.x = constrain (this.pos.x, 50, width-50);
    this.pos.y = constrain (this.pos.y, 50, height-50);*/

    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

class Target extends Snake {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(6);
  }

  show() {
    stroke(255);
    strokeWeight(0);
    fill(255,0,0);
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }

  edges() {
    if (this.pos.x > width - this.r) {
      this.vel.x *= -1;
    } else if (this.pos.x < this.r) {
      this.vel.x *= -1;
    }
    if (this.pos.y > height - this.r) {
      this.vel.y *= -1;
    } else if (this.pos.y < this.r) {
      this.vel.y *= -1;
    }
  }
}
