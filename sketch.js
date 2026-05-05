// 資料陣列：存放各週次的名稱與對應網址
let works = [
  { title: "第一個", url: "https://gofanyi123-blip.github.io/0505/" },
  { title: "第二個", url: "https://gofanyi123-blip.github.io/20260121/" },
  { title: "第三個", url: "https://gofanyi123-blip.github.io/0407/" },
  { title: "第四個", url: "https://gofanyi123-blip.github.io/0413-/" },
  { title: "第五個", url: "https://gofanyi123-blip.github.io/20260414/" }
];

let seeds = [];
let displayIframe;
let canvasWidth;

function setup() {
  // 畫布佔據左側 40% 的空間
  canvasWidth = windowWidth * 0.4;
  createCanvas(canvasWidth, windowHeight);

  // 使用 p5.dom 建立 Iframe，佔據右側 60% 空間
  displayIframe = createElement('iframe');
  displayIframe.position(canvasWidth, 0);
  displayIframe.size(windowWidth * 0.6, windowHeight);
  displayIframe.attribute('src', works[0].url); // 預設顯示第一個作品

  // 根據作品數量，利用 For 迴圈產生種子(週次節點)
  // 由下往上生長，因此 Y 座標從 bottom 開始遞減
  let spacing = height / (works.length + 1);
  for (let i = 0; i < works.length; i++) {
    // 利用 sin 函數讓節點在 X 軸產生波浪狀的分佈
    let y = height - spacing * (i + 1);
    let x = canvasWidth / 2 + sin(i * 1.2) * 60;
    
    seeds.push(new SeedNode(x, y, works[i].title, works[i].url, i));
  }
}

function draw() {
  // 清除背景，帶有一點透明度可以製造殘影，但這裡直接畫深色背景
  background(26, 43, 30);
  
  // 裝飾背景：畫一些漂浮的光點 (選做挑戰：結合陣列)
  drawBackgroundParticles();

  // 繪製生長的藤蔓脈絡
  drawVine();

  // 更新並顯示所有的種子節點
  let isHoveringAny = false;
  for (let seed of seeds) {
    seed.update();
    seed.display();
    if (seed.hovered) isHoveringAny = true;
  }
  
  // 如果有懸停在任何種子上，游標變成手部符號
  if (isHoveringAny) cursor(HAND);
  else cursor(ARROW);
}

// 當滑鼠點擊時，觸發種子節點的點擊事件
function mousePressed() {
  for (let seed of seeds) {
    seed.checkClick();
  }
}

// 繪製主藤蔓脈絡
function drawVine() {
  noFill();
  stroke(80, 180, 90);
  strokeWeight(6);
  
  // 視差效果：藤蔓會跟隨滑鼠輕微反向移動
  let parallaxX = map(mouseX, 0, width, 10, -10);
  
  beginShape();
  // 起點在正下方
  curveVertex(canvasWidth / 2 + parallaxX, height + 50); 
  curveVertex(canvasWidth / 2 + parallaxX, height);
  
  // 經過每一個種子的座標
  for (let seed of seeds) {
    curveVertex(seed.x + parallaxX, seed.y);
  }
  
  // 終點延伸出畫面
  curveVertex(canvasWidth / 2 + parallaxX, -50);
  curveVertex(canvasWidth / 2 + parallaxX, -50);
  endShape();
}

// Class：定義每一個「程式種子」節點
class SeedNode {
  constructor(x, y, title, url, index) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.title = title;
    this.url = url;
    this.index = index;
    this.r = 15;
    this.hovered = false;
    this.timeOffset = random(100); // 讓每個種子的呼吸頻率不同
  }

  update() {
    // 動態效果：節點輕微上下浮動 (生長的生命力)
    this.y = this.baseY + sin(frameCount * 0.05 + this.timeOffset) * 5;
    
    // 檢查滑鼠是否懸停
    let d = dist(mouseX, mouseY, this.x, this.y);
    this.hovered = (d < this.r * 2);
  }

  display() {
    push();
    // 視差效果：節點也跟著一起輕微移動
    let parallaxX = map(mouseX, 0, width, 10, -10);
    translate(this.x + parallaxX, this.y);

    // 當滑鼠懸停時：產生「開花/發光」的效果
    if (this.hovered) {
      scale(1.5 + sin(frameCount * 0.2) * 0.1); // 跳動放大
      fill(255, 230, 100); // 發出溫暖的光芒
      stroke(255, 200, 50, 150);
      strokeWeight(8);
    } else {
      fill(120, 220, 120);
      noStroke();
    }

    // 技術結合點：利用 vertex 畫出具備幾何感的種子/花朵
    beginShape();
    for (let a = 0; a < TWO_PI; a += PI / 3) {
      // 如果被懸停，外型會因為 sin 變化產生開花的錯覺
      let rOff = this.hovered ? sin(frameCount * 0.1 + a) * 5 : 0;
      let vx = cos(a) * (this.r + rOff);
      let vy = sin(a) * (this.r + rOff);
      vertex(vx, vy);
    }
    endShape(CLOSE);

    // 繪製週次文字標籤
    fill(255);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    textStyle(BOLD);
    // 根據索引決定文字放左邊還是右邊，避免被藤蔓擋住
    let textXOffset = this.index % 2 === 0 ? 30 : -90; 
    text(this.title, textXOffset, 0);
    pop();
  }

  checkClick() {
    if (this.hovered) {
      // 切換 Iframe 的網址
      displayIframe.attribute('src', this.url);
      // 可以在這裡加入 p5.sound 的音效，例如： playBubbleSound();
    }
  }
}

// 簡易的背景裝飾粒子
function drawBackgroundParticles() {
  noStroke();
  fill(255, 255, 255, 30);
  for (let i = 0; i < 20; i++) {
    let px = noise(i, frameCount * 0.005) * canvasWidth;
    let py = noise(i + 100, frameCount * 0.005) * height;
    circle(px, py, noise(i) * 5 + 2);
  }
}

// 當視窗改變大小時，自適應調整畫布與 iframe
function windowResized() {
  canvasWidth = windowWidth * 0.4;
  resizeCanvas(canvasWidth, windowHeight);
  displayIframe.position(canvasWidth, 0);
  displayIframe.size(windowWidth * 0.6, windowHeight);
}