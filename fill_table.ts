namespace Kattobi {
  const COLORS = [
    "rgba(0,0,0,0)", // D
    "rgba(0,0,0,0)", // C
    "rgba(0,0,0,0)", // B
    "rgba(0,0,0,0)", // BB
    "rgba(0,0,0,0)", // BBB
    "rgba(0,0,0,0)", // A
    "rgba(0,0,0,0)", // AA
    "rgba(0,0,0,0)", // AAA
    "#6146d2", // S
    "#20af75", // SS
    "red" // SSS
  ] // rankの数値に応じてマークをつける(i=8がS, i=0がD)

  const COLOR_SSPLUS = "#136745"
  const COLOR_AJC = "#e51188"
  const COLOR_EXPERT = "#FF0262"
  const COLOR_FULLCHAIN = "#ff9c52"

  export function generateFillTable(onlyMas) { // 難易度ごとに分けて生成
    // NETの仕様上asyncに全レベルを取得できない
    let data13 = []
    Promise.resolve()
      .then(() => { return Machine.getMusicsLevel(11) })
      .then(data => { addCanvasAndDrawTable(11, onlyMas, data) })
      .then(() => { return Machine.getMusicsLevel(12) })
      .then(data => { addCanvasAndDrawTable(12, onlyMas, data) })
      .then(() => { return Machine.getMusicsLevel(13) })
      .then(data => {
        data13 = data
        return Machine.getMusicsLevel(14)
      })
      .then(data => { addCanvasAndDrawTable(13, onlyMas, data.concat(data13)) })
   }

  function addCanvasAndDrawTable(diff, onlyMas, data) {
    let canvas = setupCanvas()
    let ctx = canvas.getContext("2d")
    $("#main_menu").append(canvas)

    drawTable(canvas, ctx, diff, onlyMas, data)
  }
  
  function drawTable(canvas, ctx, diff, onlyMas, results) {
    let usedRow = 0; // 画像を入れた横の行の数
    let loadedImage = 0
    const topMargin = 110
    let allTracksCount = MUSIC_DATA.filter(t => {
      if (onlyMas && t.isExpert) return false
      if (t.constant == 0.0) return false
      if (diff == 13) {
        return t.level == 13 || t.level == 13.5 || t.level == 14
      }
      return t.level == diff || t.level == diff + 0.5
    }).length

    let tracksFiltered = []
    let linesToUse = 0
    for (let i = (diff == 13 ? 11 : 9); i >= 0; i--) {
      let tracks = MUSIC_DATA.filter(t => { return t.constant === diff + i * 0.1 && (!onlyMas || !t.isExpert) })
      tracksFiltered[i] = tracks
      linesToUse += Math.ceil(tracks.length / 10)
    }
    canvas.height = 150 + linesToUse * 60
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawInfo(ctx)

    for (let i = (diff == 13 ? 11 : 9); i >= 0; i--) {
      ctx.fillStyle = "#555"
      ctx.fillText((diff + i * 0.1).toString(10), 10, topMargin + usedRow * 60) // 上にmargin 50, artworkは60x60px
  
      //let tracks = MUSIC_DATA.filter(t => { return t.constant === diff + i * 0.1 && (!onlyMas || !t.isExpert) })
      for (let k in tracksFiltered[i]) {
        let track = tracksFiltered[i][parseInt(k)]
        let artwork = new Image()
  
        // 60 * (i % 10): artworkを表示、60 + はマージン
        // usedRow * 60 ですでに使われた行から、さらに10曲で改行
        let imgX = 60 + 60 * (parseInt(k) % 10)
        let imgY = topMargin + 60 * (usedRow + Math.floor(parseInt(k) / 10))

        artwork.onload = function() {
          let result = results.find(a => a.level === track.level && a.musicId == track.musicId)
          if (result === undefined) {
            console.log(track)
          }
          drawArtwork(ctx, artwork, imgX, imgY, result, track.isExpert)
  
          loadedImage++;
          // (そのレベルの)すべての画像の読み込みが終わったら
          console.log(`loaded: ${diff} -> ${loadedImage}/${allTracksCount}`);
          if (loadedImage === allTracksCount) {
            displayPNG(canvas)
          }
        }
        
        if (track.artworkURL === undefined) { console.log("Artwork Not Found: ", track) }
        setTimeout(() => {
          artwork.src = `/mobile/${track.artworkURL}`
        }, parseInt(k) * 50)
      }

      usedRow += Math.ceil(tracksFiltered[i].length / 10) // 10曲ごとに下の行へ改行
    }
  }

  export function setupCanvas() {
    let canvas = document.createElement("canvas")
    let ctx = canvas.getContext("2d")
    canvas.width = 700
    canvas.height = 1500
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return canvas
  }

  export function putMark(ctx, x, y, result) {
    let color = COLORS[result.rank]

    if (result.scoreMax >= 1005000 && result.scoreMax < 1007500) { // SS+
      color = COLOR_SSPLUS;
    }

    if (result.scoreMax == 1010000) { // AJC
      color = COLOR_AJC;
    }

    ctx.fillStyle = color;
    ctx.fillRect(x + 15, y + 15, 30, 30);

    if (result.fullChain) {
      ctx.fillStyle = COLOR_FULLCHAIN;
    } else {
      ctx.fillStyle = "white";
    }

    if (result.isFC) {
      ctx.beginPath();
      ctx.arc(x + 30, y + 30, 10, Math.PI/2, Math.PI * 1.5, false); // 半円
      ctx.fill();
    }

    if (result.isAJ) {
      ctx.beginPath();
      ctx.arc(x + 30, y + 30, 10, 0, Math.PI * 2, false);
      ctx.fill();
    }
  }

  export function displayPNG(canv) {
    $("#main_menu > canvas").remove();
    let elm = $("<img>")
      .attr("src", canv.toDataURL())
      .css("margin-top", "10px")
      .css("width", "100%");
    $("#main_menu").append("<br>").append(elm);
  }

  export function drawArtwork(ctx, artwork, x, y, result, isExpert) { 
    ctx.globalAlpha = 1.0
    if (result.scoreMax === undefined) ctx.globalAlpha = 0.5 // 未プレイ曲は半透明
    ctx.drawImage(artwork, x, y, 60, 60)
    ctx.globalAlpha = 1.0
  
    // マークする
    if (result.scoreMax !== undefined) { // その楽曲のレコードが見つかれば
      putMark(ctx, x, y, result)
    }
  
    // 赤譜面なら印をつける
    if (isExpert) {
      if (result.scoreMax === undefined) ctx.globalAlpha = 0.5 // 未プレイ曲は半透明
      ctx.fillStyle = COLOR_EXPERT
      ctx.fillRect(x, y + 50, 60, 10)
      ctx.globalAlpha = 1.0
    }
  }
  
  function drawInfo(ctx) {
    ctx.font = "30px Helvetica Neue";
    ctx.fillStyle = "#333";
    ctx.textBaseline = "top";
    ctx.fillText("CHUNITHMフィルテーブル", 10, 10);
  
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "#555";
    ctx.fillText("生成: KattobiDrive (@kattobidrive)", 430, 20);
  
    ctx.font = "18px Helvetica Neue";
    ctx.fillStyle = COLORS[8];
    ctx.fillText("S", 20, 50);
  
    ctx.fillStyle = COLORS[9];
    ctx.fillText("SS", 60, 50);
  
    ctx.fillStyle = COLOR_SSPLUS;
    ctx.fillText("SS+", 100, 50);
  
    ctx.fillStyle = COLORS[10];
    ctx.fillText("SSS", 140, 50);
  
    ctx.fillStyle = COLOR_AJC;
    ctx.fillText("AJC", 180, 50)
  
    ctx.fillStyle = COLOR_FULLCHAIN;
    ctx.fillText("FULLCHAIN", 220, 50);
  
    ctx.fillStyle = "#333";
    ctx.fillText("AJは白い丸、FCは白い半円", 330, 50);
  
    ctx.fillStyle = COLOR_EXPERT;
    ctx.fillText("下線が引いてあるのは赤譜面", 15, 80);
  }  
}