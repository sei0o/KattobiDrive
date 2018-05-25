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

  export function generateWEFillTable() {
    let canvas = setupCanvas();
    let ctx = canvas.getContext("2d");
    canvas.height = 800;
  
    $("#main_menu").append(canvas);

    Machine.getWEMusics(data => {
      drawTableWE(canvas, ctx, data)
    })
  }

  export function drawTableWE(canvas, ctx, results) {
    drawInfoWE(ctx);
  
    let usedRow = 0; // 画像を入れた横の行の数
    let loadedImage = 0;
    const topMargin = 110;
  
    for (let lv = 9; lv >= 0; lv -= 2) {
      ctx.fillStyle = "#FFF";
      ctx.fillText(`★ ${(lv - 1) / 2.0 + 1}`, 10, topMargin + usedRow * 60);
  
      let tracks = WE_DATA.filter(function(t) { return t.starDifficulty == lv; });
      tracks.forEach((track, i) => {
        let artwork = new Image();
        artwork.src = track.artworkURL;
  
        let imgX = 60 + 60 * (i % 10);
        let imgY = topMargin + 60 * (usedRow + Math.floor(i / 10));
  
        artwork.onload = function() {
          let result = results.find(function(a) { return a.musicId == track.musicId });
          drawArtworkWE(ctx, artwork, imgX, imgY, result, track.type);
  
          loadedImage++;
          console.log(`loaded: ${lv} -> ${loadedImage}/${WE_DATA.length}`);
          if (loadedImage === WE_DATA.length) displayPNG(canvas);
        }
      })
  
      usedRow += Math.ceil(tracks.length / 10); // 10曲ごとに下の行へ改行
    }
  }
  
  function drawArtworkWE(ctx, artwork, x, y, result, type) {
    drawArtwork(ctx, artwork, x, y, result, false)
  
    ctx.globalAlpha = result.scoreMax === undefined ? 0.5 : 1.0;
  
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, 20, 20);
  
    ctx.font = "16px Helvetica Neue";
    ctx.fillStyle = "white";
    ctx.fillText(WE_TYPE[type], x + 2, y + 2);
  }

  function drawInfoWE(ctx) {
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    ctx.font = "30px Helvetica Neue";
    ctx.fillStyle = "#EEE";
    ctx.textBaseline = "top";
    ctx.fillText("CHUNITHM WORLD'S END フィルテーブル", 10, 10);
  
    ctx.font = "15px Helvetica Neue";
    ctx.fillStyle = "#EEE";
    ctx.fillText("生成: KattobiDrive", 550, 80);
  
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
  
    ctx.fillStyle = "#FFF";
    ctx.fillText("AJは白い丸、FCは白い半円", 330, 50);
  }
  
}