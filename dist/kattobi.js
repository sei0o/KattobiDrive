var Kattobi;
(function (Kattobi) {
    const COLORS = [
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0)",
        "#6146d2",
        "#20af75",
        "red" // SSS
    ]; // rankの数値に応じてマークをつける(i=8がS, i=0がD)
    const COLOR_SSPLUS = "#136745";
    const COLOR_AJC = "#e51188";
    const COLOR_EXPERT = "#FF0262";
    const COLOR_FULLCHAIN = "#ff9c52";
    function generateWEFillTable() {
        let canvas = setupCanvas();
        let ctx = canvas.getContext("2d");
        canvas.height = 800;
        $("#main_menu").append(canvas);
        KattobiMachine.getWEMusics(data => {
            drawTableWE(canvas, ctx, data);
        });
    }
    Kattobi.generateWEFillTable = generateWEFillTable;
    function drawTableWE(canvas, ctx, results) {
        drawInfoWE(ctx);
        let usedRow = 0; // 画像を入れた横の行の数
        let loadedImage = 0;
        const topMargin = 110;
        for (let lv = 9; lv >= 0; lv -= 2) {
            ctx.fillStyle = "#FFF";
            ctx.fillText(`★ ${(lv - 1) / 2.0 + 1}`, 10, topMargin + usedRow * 60);
            let tracks = Kattobi.WE_DATA.filter(function (t) { return t.starDifficulty == lv; });
            tracks.forEach((track, i) => {
                let artwork = new Image();
                artwork.src = track.artworkURL;
                let imgX = 60 + 60 * (i % 10);
                let imgY = topMargin + 60 * (usedRow + Math.floor(i / 10));
                artwork.onload = function () {
                    let result = results.find(function (a) { return a.musicId == track.musicId; });
                    drawArtworkWE(ctx, artwork, imgX, imgY, result, track.type);
                    loadedImage++;
                    console.log(`loaded: ${lv} -> ${loadedImage}/${Kattobi.WE_DATA.length}`);
                    if (loadedImage === Kattobi.WE_DATA.length)
                        displayPNG(canvas);
                };
            });
            usedRow += Math.ceil(tracks.length / 10); // 10曲ごとに下の行へ改行
        }
    }
    Kattobi.drawTableWE = drawTableWE;
    function setupCanvas() {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = 700;
        canvas.height = 1400;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return canvas;
    }
    Kattobi.setupCanvas = setupCanvas;
    function putMark(ctx, x, y, result) {
        let color = COLORS[result.rank];
        if (result.scoreMax >= 1005000 && result.scoreMax < 1007500) {
            color = COLOR_SSPLUS;
        }
        if (result.scoreMax == 1010000) {
            color = COLOR_AJC;
        }
        ctx.fillStyle = color;
        ctx.fillRect(x + 15, y + 15, 30, 30);
        if (result.fullChain !== 0) {
            ctx.fillStyle = COLOR_FULLCHAIN;
        }
        else {
            ctx.fillStyle = "white";
        }
        if (result.isFC) {
            ctx.beginPath();
            ctx.arc(x + 30, y + 30, 10, Math.PI / 2, Math.PI * 1.5, false); // 半円
            ctx.fill();
        }
        if (result.isAJ) {
            ctx.beginPath();
            ctx.arc(x + 30, y + 30, 10, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }
    Kattobi.putMark = putMark;
    function displayPNG(canv) {
        $("#main_menu > canvas").remove();
        let elm = $("<img>")
            .attr("src", canv.toDataURL())
            .css("margin-top", "10px")
            .css("width", "100%");
        $("#main_menu").append("<br>").append(elm);
    }
    Kattobi.displayPNG = displayPNG;
    function drawArtworkWE(ctx, artwork, x, y, result, type) {
        drawArtwork(ctx, artwork, x, y, result, false);
        ctx.globalAlpha = result.scoreMax === undefined ? 0.5 : 1.0;
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, 20, 20);
        ctx.font = "16px Helvetica Neue";
        ctx.fillStyle = "white";
        console.log(result.name, type, Kattobi.WE_TYPE[type]);
        ctx.fillText(Kattobi.WE_TYPE[type], x + 2, y + 2);
    }
    function drawArtwork(ctx, artwork, x, y, result, isExp) {
        ctx.globalAlpha = 1.0;
        if (result.scoreMax === undefined)
            ctx.globalAlpha = 0.5; // 未プレイ曲は半透明
        ctx.drawImage(artwork, x, y, 60, 60);
        ctx.globalAlpha = 1.0;
        // マークする
        if (result.scoreMax !== undefined) {
            putMark(ctx, x, y, result);
        }
        // 赤譜面なら印をつける
        if (isExp) {
            if (result.scoreMax === undefined)
                ctx.globalAlpha = 0.5; // 未プレイ曲は半透明
            ctx.fillStyle = COLOR_EXPERT;
            ctx.fillRect(x, y + 50, 60, 10);
            ctx.globalAlpha = 1.0;
        }
    }
    Kattobi.drawArtwork = drawArtwork;
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
        ctx.fillText("AJC", 180, 50);
        ctx.fillStyle = COLOR_FULLCHAIN;
        ctx.fillText("FULLCHAIN", 220, 50);
        ctx.fillStyle = "#FFF";
        ctx.fillText("AJは白い丸、FCは白い半円", 330, 50);
    }
})(Kattobi || (Kattobi = {}));
var KattobiBatch;
(function (KattobiBatch) {
    KattobiBatch.WE_MUSIC_COUNT = 41;
    function generateWEData() {
        KattobiMachine.getWEMusics(musics => {
            let datalist = [];
            musics.forEach((m, i) => {
                setTimeout(() => {
                    console.log(`Fetching: ${i}`);
                    KattobiMachine.getWEArtwork(m.musicId, url => {
                        datalist.push({
                            artworkURL: url,
                            name: m.name,
                            musicId: m.musicId,
                            starDifficulty: m.starDifficulty,
                            type: m.type
                        });
                        if (i >= KattobiBatch.WE_MUSIC_COUNT - 1) {
                            console.log(JSON.stringify(datalist));
                        }
                    });
                }, 500 * i);
            });
        });
    }
    KattobiBatch.generateWEData = generateWEData;
})(KattobiBatch || (KattobiBatch = {}));
var KattobiMachine;
(function (KattobiMachine) {
    function getWEMusics(callback) {
        $.get("/mobile/WorldsEndMusic.html", (data) => {
            let recordElms = $(data).find(".w388.musiclist_box.bg_worldsend");
            let records = [];
            recordElms.each((idx, elm) => {
                let rec = {
                    name: $(elm).find(".musiclist_worldsend_title").html(),
                    musicId: $(elm).find(".musiclist_worldsend_title").attr("onclick").substr(54, 4),
                    starDifficulty: parseInt($(elm).find(".musiclist_worldsend_star > img").attr("src").substr(26, 1), 10),
                    type: parseInt($(elm).find(".musiclist_worldsend_icon > img").attr("src").substr(22, 2))
                };
                if ($(elm).find(".text_b").html()) {
                    rec.scoreMax = parseInt($(elm).find(".text_b").html().split(",").join(""));
                    rec.rank = parseInt($(elm).find(".play_musicdata_icon img[src*='rank']").attr("src").substr(24, 1));
                    rec.isAJ = !!$(elm).find("img[src*='alljustice']").length;
                    rec.isFC = !!$(elm).find("img[src*='fullcombo']").length;
                    rec.fullChain = !!$(elm).find("img[src*='fullchain']").length;
                }
                records.push(rec);
            });
            callback(records);
        });
    }
    KattobiMachine.getWEMusics = getWEMusics;
    function getWEArtwork(musicId, callback) {
        $.post("/mobile/WorldsEndMusic.html", {
            musicId: musicId,
            music_detail: "music_detail"
        }, data => {
            let url = $(data).find(".play_jacket_img img").first().attr("src");
            callback(url);
        });
    }
    KattobiMachine.getWEArtwork = getWEArtwork;
})(KattobiMachine || (KattobiMachine = {}));
/// <reference path="lib/jquery/index.d.ts" />
var Kattobi;
(function (Kattobi) {
    Kattobi.SERVER_ENDPOINT = "http://localhost:8000/net";
    function setup() {
        console.log("Loaded KattobiDrive!");
        $("body").css("backgroundColor", "#09f");
        initButtons();
    }
    Kattobi.setup = setup;
    function initButtons() {
        $("<button>")
            .html("WEフィルテーブルを生成")
            .on("click", Kattobi.generateWEFillTable)
            .appendTo("#main_menu");
    }
})(Kattobi || (Kattobi = {}));
Kattobi.setup();
var Kattobi;
(function (Kattobi) {
    Kattobi.WE_DATA = [{ "artworkURL": "common/img/6287164e1401ed99.jpg", "name": "STAR", "musicId": "8092", "starDifficulty": 7, "type": 9 }, { "artworkURL": "common/img/74bb39c1c5bf4690.jpg", "name": "Star☆Glitter", "musicId": "8093", "starDifficulty": 5, "type": 1 }, { "artworkURL": "common/img/31134fdf6cbb6e36.jpg", "name": "Starlight Dance Floor", "musicId": "8094", "starDifficulty": 3, "type": 28 }, { "artworkURL": "common/img/3348ec734f33c909.jpg", "name": "ひだまりデイズ", "musicId": "8095", "starDifficulty": 5, "type": 27 }, { "artworkURL": "common/img/334aeafa3b96de60.jpg", "name": "Dengeki Tube", "musicId": "8089", "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/dc57afae3307e09f.jpg", "name": "Schrecklicher Aufstand", "musicId": "8080", "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/6ce11469fafb79ad.jpg", "name": "Air", "musicId": "8087", "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/82bee9dfce16e9fb.jpg", "name": "だんだん早くなる", "musicId": "8084", "starDifficulty": 1, "type": 8 }, { "artworkURL": "common/img/576301d1261c992d.jpg", "name": "Blue Noise", "musicId": "8086", "starDifficulty": 3, "type": 1 }, { "artworkURL": "common/img/b5570c700e7bbf75.jpg", "name": "檄!帝国華撃団", "musicId": "8081", "starDifficulty": 3, "type": 23 }, { "artworkURL": "common/img/061f9e33441b32cf.jpg", "name": "The wheel to the right", "musicId": "8079", "starDifficulty": 7, "type": 21 }, { "artworkURL": "common/img/0d16cf138fd9ef7b.jpg", "name": "Oshama Scramble! (Cranky Remix)", "musicId": "8091", "starDifficulty": 5, "type": 19 }, { "artworkURL": "common/img/d909dbffd6520902.jpg", "name": "Title", "musicId": "8090", "starDifficulty": 5, "type": 1 }, { "artworkURL": "common/img/ccd2deee3f1e5f16.jpg", "name": "★LittlE HearTs★", "musicId": "8069", "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/3aab4ea58851d73f.jpg", "name": "Gate of Fate", "musicId": "8072", "starDifficulty": 7, "type": 16 }, { "artworkURL": "common/img/c9e53bb1959a87c1.jpg", "name": "The Concept of Love", "musicId": "8073", "starDifficulty": 9, "type": 20 }, { "artworkURL": "common/img/eba6432f34a2df6a.jpg", "name": "Counselor", "musicId": "8063", "starDifficulty": 7, "type": 19 }, { "artworkURL": "common/img/aae4a50abd83560f.jpg", "name": "SAMBISTA", "musicId": "8064", "starDifficulty": 3, "type": 28 }, { "artworkURL": "common/img/2d476ed298982205.jpg", "name": "We Gonna Journey", "musicId": "8065", "starDifficulty": 5, "type": 28 }, { "artworkURL": "common/img/187a65abf20cfa4c.jpg", "name": "The ether", "musicId": "8066", "starDifficulty": 9, "type": 10 }, { "artworkURL": "common/img/0cfed5e962a10117.jpg", "name": "DRAGONLADY", "musicId": "8067", "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/18bb06dd0c680555.jpg", "name": "ジングルベル", "musicId": "8058", "starDifficulty": 7, "type": 12 }, { "artworkURL": "common/img/a2fc66bdebabc961.jpg", "name": "エンドマークに希望と涙を添えて", "musicId": "8059", "starDifficulty": 9, "type": 11 }, { "artworkURL": "common/img/8ee8eeb30163588f.jpg", "name": "Oshama Scramble!", "musicId": "8053", "starDifficulty": 5, "type": 4 }, { "artworkURL": "common/img/1a830afff4c6894a.jpg", "name": "Alma", "musicId": "8048", "starDifficulty": 3, "type": 20 }, { "artworkURL": "common/img/664482b6c02bb903.jpg", "name": "チルノのパーフェクトさんすう教室", "musicId": "8049", "starDifficulty": 3, "type": 21 }, { "artworkURL": "common/img/824982fd305cf43a.jpg", "name": "回レ！雪月花", "musicId": "8051", "starDifficulty": 5, "type": 22 }, { "artworkURL": "common/img/6a409c7abf7d9dc4.jpg", "name": "Genesis", "musicId": "8043", "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/049f3b70251fdb7f.jpg", "name": "Elemental Creation", "musicId": "8045", "starDifficulty": 5, "type": 22 }, { "artworkURL": "common/img/d9bbdad3fb44d260.jpg", "name": "いろは唄", "musicId": "8046", "starDifficulty": 3, "type": 23 }, { "artworkURL": "common/img/6e02ab90458fcf6e.jpg", "name": "青春はNon-Stop！", "musicId": "8047", "starDifficulty": 1, "type": 1 }, { "artworkURL": "common/img/763b1886954be49d.jpg", "name": "Your Affection (Daisuke Asakura Remix)", "musicId": "8033", "starDifficulty": 1, "type": 21 }, { "artworkURL": "common/img/877573b3f8a206f9.jpg", "name": "一触即発☆禅ガール", "musicId": "8034", "starDifficulty": 3, "type": 21 }, { "artworkURL": "common/img/5cc569f26459117b.jpg", "name": "FREEDOM DiVE", "musicId": "8026", "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/cbf397f330e040e5.jpg", "name": "B.B.K.K.B.K.K.", "musicId": "8020", "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/627b95ef3c728b37.jpg", "name": "ナイト・オブ・ナイツ", "musicId": "8008", "starDifficulty": 5, "type": 8 }, { "artworkURL": "common/img/92b5382a4b2f9aa8.jpg", "name": "Scatman (Ski Ba Bop Ba Dop Bop)", "musicId": "8005", "starDifficulty": 5, "type": 2 }, { "artworkURL": "common/img/9a8dae637c5172b2.jpg", "name": "elegante", "musicId": "8029", "starDifficulty": 3, "type": 5 }, { "artworkURL": "common/img/c1ff8df1757fedf4.jpg", "name": "Help me, あーりん！", "musicId": "8025", "starDifficulty": 5, "type": 6 }, { "artworkURL": "common/img/971c362a9b65209e.jpg", "name": "Garakuta Doll Play (sasakure.UK clutter remix)", "musicId": "8024", "starDifficulty": 7, "type": 4 }, { "artworkURL": "common/img/e4c034fc74ff62fc.jpg", "name": "幾四音-Ixion-", "musicId": "8000", "starDifficulty": 1, "type": 3 }];
    Kattobi.WE_TYPE = {
        23: "歌",
        21: "避",
        6: "嘘",
        19: "？",
        20: "！",
        16: "敷",
        10: "割",
        1: "招",
        2: "狂",
        3: "止",
        5: "両",
        12: "弾",
        13: "戻",
        11: "跳",
        4: "改",
        9: "光",
        22: "速",
        8: "時",
        28: "覚",
        27: "蔵",
    };
})(Kattobi || (Kattobi = {}));
//# sourceMappingURL=kattobi.js.map