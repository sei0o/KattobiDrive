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
    function generateFillTable(onlyMas) {
        // NETの仕様上asyncに全レベルを取得できない
        let data13 = [];
        Promise.resolve()
            .then(() => { return Kattobi.Machine.getMusicsLevel(11); })
            .then(data => { addCanvasAndDrawTable(11, onlyMas, data); })
            .then(() => { return Kattobi.Machine.getMusicsLevel(12); })
            .then(data => { addCanvasAndDrawTable(12, onlyMas, data); })
            .then(() => { return Kattobi.Machine.getMusicsLevel(13); })
            .then(data => {
            data13 = data;
            return Kattobi.Machine.getMusicsLevel(14);
        })
            .then(data => { addCanvasAndDrawTable(13, onlyMas, data.concat(data13)); });
    }
    Kattobi.generateFillTable = generateFillTable;
    function addCanvasAndDrawTable(diff, onlyMas, data) {
        let canvas = setupCanvas();
        let ctx = canvas.getContext("2d");
        $("#main_menu").append(canvas);
        drawTable(canvas, ctx, diff, onlyMas, data);
    }
    function drawTable(canvas, ctx, diff, onlyMas, results) {
        let usedRow = 0; // 画像を入れた横の行の数
        let loadedImage = 0;
        const topMargin = 110;
        let allTracksCount = Kattobi.MUSIC_DATA.filter(t => {
            if (onlyMas && t.isExpert)
                return false;
            if (t.constant == 0.0)
                return false;
            if (diff == 13) {
                return t.level == 13 || t.level == 13.5 || t.level == 14;
            }
            return t.level == diff || t.level == diff + 0.5;
        }).length;
        let tracksFiltered = [];
        let linesToUse = 0;
        for (let i = (diff == 13 ? 11 : 9); i >= 0; i--) {
            let tracks = Kattobi.MUSIC_DATA.filter(t => { return t.constant === diff + i * 0.1 && (!onlyMas || !t.isExpert); });
            tracksFiltered[i] = tracks;
            linesToUse += Math.ceil(tracks.length / 10);
        }
        canvas.height = 150 + linesToUse * 60;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawInfo(ctx);
        for (let i = (diff == 13 ? 11 : 9); i >= 0; i--) {
            ctx.fillStyle = "#555";
            ctx.fillText((diff + i * 0.1).toString(10), 10, topMargin + usedRow * 60); // 上にmargin 50, artworkは60x60px
            //let tracks = MUSIC_DATA.filter(t => { return t.constant === diff + i * 0.1 && (!onlyMas || !t.isExpert) })
            for (let k in tracksFiltered[i]) {
                let track = tracksFiltered[i][parseInt(k)];
                let artwork = new Image();
                // 60 * (i % 10): artworkを表示、60 + はマージン
                // usedRow * 60 ですでに使われた行から、さらに10曲で改行
                let imgX = 60 + 60 * (parseInt(k) % 10);
                let imgY = topMargin + 60 * (usedRow + Math.floor(parseInt(k) / 10));
                artwork.onload = function () {
                    let result = results.find(a => a.level === track.level && a.musicId == track.musicId);
                    if (result === undefined) {
                        console.log(track);
                    }
                    drawArtwork(ctx, artwork, imgX, imgY, result, track.isExpert);
                    loadedImage++;
                    // (そのレベルの)すべての画像の読み込みが終わったら
                    console.log(`loaded: ${diff} -> ${loadedImage}/${allTracksCount}`);
                    if (loadedImage === allTracksCount) {
                        displayPNG(canvas);
                    }
                };
                if (track.artworkURL === undefined) {
                    console.log("Artwork Not Found: ", track);
                }
                setTimeout(() => {
                    artwork.src = `/mobile/${track.artworkURL}`;
                }, parseInt(k) * 50);
            }
            usedRow += Math.ceil(tracksFiltered[i].length / 10); // 10曲ごとに下の行へ改行
        }
    }
    function setupCanvas() {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = 700;
        canvas.height = 1500;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return canvas;
    }
    Kattobi.setupCanvas = setupCanvas;
    function putMark(ctx, x, y, result) {
        let color = COLORS[result.rank];
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
    function drawArtwork(ctx, artwork, x, y, result, isExpert) {
        ctx.globalAlpha = 1.0;
        if (result.scoreMax === undefined)
            ctx.globalAlpha = 0.5; // 未プレイ曲は半透明
        ctx.drawImage(artwork, x, y, 60, 60);
        ctx.globalAlpha = 1.0;
        // マークする
        if (result.scoreMax !== undefined) { // その楽曲のレコードが見つかれば
            putMark(ctx, x, y, result);
        }
        // 赤譜面なら印をつける
        if (isExpert) {
            if (result.scoreMax === undefined)
                ctx.globalAlpha = 0.5; // 未プレイ曲は半透明
            ctx.fillStyle = COLOR_EXPERT;
            ctx.fillRect(x, y + 50, 60, 10);
            ctx.globalAlpha = 1.0;
        }
    }
    Kattobi.drawArtwork = drawArtwork;
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
        ctx.fillText("AJC", 180, 50);
        ctx.fillStyle = COLOR_FULLCHAIN;
        ctx.fillText("FULLCHAIN", 220, 50);
        ctx.fillStyle = "#333";
        ctx.fillText("AJは白い丸、FCは白い半円", 330, 50);
        ctx.fillStyle = COLOR_EXPERT;
        ctx.fillText("下線が引いてあるのは赤譜面", 15, 80);
    }
})(Kattobi || (Kattobi = {}));
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
        let canvas = Kattobi.setupCanvas();
        let ctx = canvas.getContext("2d");
        canvas.height = 800;
        $("#main_menu").append(canvas);
        Kattobi.Machine.getWEMusics(data => {
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
                        Kattobi.displayPNG(canvas);
                };
            });
            usedRow += Math.ceil(tracks.length / 10); // 10曲ごとに下の行へ改行
        }
    }
    Kattobi.drawTableWE = drawTableWE;
    function drawArtworkWE(ctx, artwork, x, y, result, type) {
        Kattobi.drawArtwork(ctx, artwork, x, y, result, false);
        ctx.globalAlpha = result.scoreMax === undefined ? 0.5 : 1.0;
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, 20, 20);
        ctx.font = "16px Helvetica Neue";
        ctx.fillStyle = "white";
        ctx.fillText(Kattobi.WE_TYPE[type], x + 2, y + 2);
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
        ctx.fillText("AJC", 180, 50);
        ctx.fillStyle = COLOR_FULLCHAIN;
        ctx.fillText("FULLCHAIN", 220, 50);
        ctx.fillStyle = "#FFF";
        ctx.fillText("AJは白い丸、FCは白い半円", 330, 50);
    }
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    var Batch;
    (function (Batch) {
        function generateMusicData() {
            Promise.all([Kattobi.Machine.getConstants(), Kattobi.Machine.getHigherLvMusics()])
                .then(([constants, musics]) => {
                return Promise.all(musics.map((m, i) => {
                    let constantTrack = constants.find(t => { return t.musicId == m.musicId && Math.floor(t.level) == m.level; });
                    let constant = constantTrack ? constantTrack.constant : 0.0;
                    let existedData = Kattobi.MUSIC_DATA.find(t => { return t.musicId == m.musicId && Math.floor(t.level) == m.level; });
                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 500 * i); // 間隔を開ければジャケは正しくとれるようになるが…
                    })
                        .then(() => {
                        if (existedData === undefined)
                            return Kattobi.Machine.getArtwork(m.musicId);
                    })
                        .then(url => {
                        console.log(`Got: ${i}`);
                        return {
                            name: m.name,
                            musicId: m.musicId,
                            level: m.level,
                            constant: constant,
                            isExpert: existedData !== undefined ? existedData.isExpert : false,
                            artworkURL: url || existedData.artworkURL
                        };
                    });
                }));
            })
                .then(datalist => {
                showData(JSON.stringify(datalist));
            });
        }
        Batch.generateMusicData = generateMusicData;
        function generateWEData() {
            Kattobi.Machine.getWEMusics().then(musics => {
                return Promise.all(musics.map((m, i) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 500 * i);
                    })
                        .then(() => { return Kattobi.Machine.getArtwork(m.musicId); })
                        .then(url => {
                        console.log(`Got: ${i}`);
                        return {
                            artworkURL: url,
                            name: m.name,
                            musicId: m.musicId,
                            starDifficulty: m.starDifficulty,
                            type: m.type
                        };
                    });
                }));
            })
                .then(datalist => {
                showData(JSON.stringify(datalist));
            });
        }
        Batch.generateWEData = generateWEData;
        function showData(string) {
            let wi = window.open();
            wi.document.open();
            wi.document.write(`<pre>${string}</pre>`);
            wi.document.close();
        }
    })(Batch = Kattobi.Batch || (Kattobi.Batch = {}));
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    var Machine;
    (function (Machine) {
        function getWEMusics() {
            return new Promise((resolve, reject) => {
                $.get("/mobile/WorldsEndMusic.html", (data) => {
                    let recordElms = $(data).find(".w388.musiclist_box.bg_worldsend");
                    let records = [];
                    recordElms.each((idx, elm) => {
                        let rec = {
                            name: $(elm).find(".musiclist_worldsend_title").html(),
                            musicId: parseInt($(elm).find(".musiclist_worldsend_title").attr("onclick").substr(54, 4)),
                            starDifficulty: parseInt($(elm).find(".musiclist_worldsend_star > img").attr("src").substr(26, 1), 10),
                            type: parseInt($(elm).find(".musiclist_worldsend_icon > img").attr("src").substr(22, 2))
                        };
                        if ($(elm).find(".text_b").html()) {
                            rec.scoreMax = parseInt($(elm).find(".text_b").html().split(",").join(""));
                            rec.rank = parseInt($(elm).find(".play_musicdata_icon img[src*='rank']").attr("src").substr(24, 2));
                            rec.isAJ = !!$(elm).find("img[src*='alljustice']").length;
                            rec.isFC = !!$(elm).find("img[src*='fullcombo']").length;
                            rec.fullChain = !!$(elm).find("img[src*='fullchain']").length;
                        }
                        records.push(rec);
                    });
                    resolve(records);
                });
            });
        }
        Machine.getWEMusics = getWEMusics;
        function getWEArtwork(musicId) {
            return new Promise((resolve, reject) => {
                $.post("/mobile/WorldsEndMusic.html", {
                    musicId: musicId,
                    music_detail: "music_detail"
                }, data => {
                    let url = $(data).find(".play_jacket_img img").first().attr("src");
                    resolve(url);
                });
            });
        }
        Machine.getWEArtwork = getWEArtwork;
        function getHigherLvMusics() {
            return new Promise((resolve, reject) => {
                let records = [];
                let loaded = [];
                for (let lv of [11, 12, 13, 14]) {
                    setTimeout(() => {
                        getMusicsLevel(lv).then(musics => {
                            loaded.push(lv);
                            console.log(`Fetched Music Data: ${lv} * ${musics.length} (${loaded})`);
                            records[lv - 11] = musics;
                            if (loaded.length === 4)
                                resolve(records.reduce((a, b) => { return a.concat(b); }));
                        });
                    }, 2000 * (lv - 10));
                }
            });
        }
        Machine.getHigherLvMusics = getHigherLvMusics;
        function getMusicsLevel(level) {
            return new Promise((resolve, reject) => {
                $.post("/mobile/MusicLevel.html", {
                    selected: level,
                    changeSelect: "changeSelect"
                }, data => {
                    let recordElms = $(data).find(".w388.musiclist_box");
                    let records = [];
                    recordElms.each((idx, elm) => {
                        let rec = {
                            name: $(elm).find(".music_title").html(),
                            musicId: parseInt($(elm).find(".music_title").attr("onclick").substr(54, 4)),
                            level: level,
                        };
                        if ($(elm).find(".text_b").html()) {
                            rec.scoreMax = parseInt($(elm).find(".text_b").html().split(",").join(""));
                            rec.rank = parseInt($(elm).find(".play_musicdata_icon img[src*='rank']").attr("src").substr(24, 2));
                            rec.isAJ = !!$(elm).find("img[src*='alljustice']").length;
                            rec.isFC = !!$(elm).find("img[src*='fullcombo']").length;
                            rec.fullChain = !!$(elm).find("img[src*='fullchain']").length;
                        }
                        records.push(rec);
                    });
                    resolve(records);
                });
            });
        }
        Machine.getMusicsLevel = getMusicsLevel;
        function getArtwork(musicId) {
            return new Promise((resolve, reject) => {
                $.post("/mobile/MusicLevel.html", {
                    musicId: musicId,
                    music_detail: "music_detail"
                }, data => {
                    let url = $(data).find(".play_jacket_img img").first().attr("src");
                    resolve(url);
                });
            });
        }
        Machine.getArtwork = getArtwork;
        function getConstants() {
            return new Promise((resolve, reject) => {
                $.post("https://chuniviewer.net/GetMusicConstantValues.php", {}, (data) => {
                    let parsed = [];
                    for (let music of JSON.parse(data)) {
                        if (music.value == null)
                            music.value = `0.0`;
                        if (music.music_name === "VERTeX")
                            console.log(music);
                        parsed.push({
                            musicId: music.music_id,
                            constant: music.value,
                            level: music.level,
                        });
                    }
                    resolve(parsed);
                });
            });
        }
        Machine.getConstants = getConstants;
    })(Machine = Kattobi.Machine || (Kattobi.Machine = {}));
})(Kattobi || (Kattobi = {}));
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
            .html("フィルテーブルを生成")
            .on("click", () => {
            Kattobi.generateFillTable($("#onlymas").prop("checked"));
        })
            .appendTo("#main_menu");
        $("#main_menu")
            .append("<label><input type='checkbox' id='onlymas'>MASTERのみ</label><br>");
        $("<button>")
            .html("WEフィルテーブルを生成")
            .on("click", Kattobi.generateWEFillTable)
            .appendTo("#main_menu");
        $("<button>")
            .html("OPを計算(Lv13~14)")
            .on("click", () => {
            Kattobi.OverPower.showHigherLevelsOP();
        })
            .appendTo("#main_menu");
    }
})(Kattobi || (Kattobi = {}));
Kattobi.setup();
var Kattobi;
(function (Kattobi) {
    Kattobi.MUSIC_DATA = [{ "artworkURL": "common/img/80852f363aa6e54d.jpg", "name": "Bravely You", "musicId": 612, "level": 11, "constant": 11.6, "isExpert": false }, { "name": "adrenaline!!!", "musicId": 542, "level": 11, "constant": 11.6, "isExpert": false, "artworkURL": "common/img/4c6d1aca4ab73ff7.jpg" }, { "name": "全力バタンキュー", "musicId": 545, "level": 11, "constant": 11.4, "isExpert": false, "artworkURL": "common/img/9a55feefea6b3b59.jpg" }, { "name": "星灯", "musicId": 501, "level": 11, "constant": 11.5, "isExpert": false, "artworkURL": "common/img/3b97f64b5329a88a.jpg" }, { "name": "ホシトハナ", "musicId": 475, "level": 11, "constant": 11.6, "isExpert": false, "artworkURL": "common/img/b69204a1c806a2c8.jpg" }, { "name": "オレンジ", "musicId": 530, "level": 11, "constant": 11.5, "isExpert": false, "artworkURL": "common/img/b69204a1c806a2c8.jpg" }, { "name": "MEMORIA", "musicId": 422, "level": 11, "constant": 11.6, "artworkURL": "common/img/bf9ed3a6cfbffe15.jpg" }, { "name": "MIRU key way", "musicId": 424, "level": 11, "constant": 11.6, "artworkURL": "common/img/5c07dede2260aafe.jpg" }, { "name": "夢想歌", "musicId": 360, "level": 11, "constant": 11.3, "artworkURL": "common/img/8ecf57e4db2f6d94.jpg" }, { "name": "true my heart -Lovable mix-", "musicId": 363, "level": 11, "constant": 11.6, "artworkURL": "common/img/15625838f8f00963.jpg" }, { "name": "Jumping!!", "musicId": 348, "level": 11, "constant": 11.3, "artworkURL": "common/img/357a07354e3f2187.jpg" }, { "name": "Daydream café", "musicId": 343, "level": 11, "constant": 11.6, "artworkURL": "common/img/e21129db8b503610.jpg" }, { "name": "僕らの翼", "musicId": 269, "level": 11, "constant": 11.1, "artworkURL": "common/img/23359d965dd6eb4a.jpg" }, { "name": "ぶいえす!!らいばる!!", "musicId": 312, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/81805f2ef1e58db8.jpg" }, { "name": "ひだまりデイズ", "musicId": 313, "level": 11, "constant": 11.4, "artworkURL": "common/img/5ac018495d6f01a5.jpg" }, { "name": "オラシオン", "musicId": 315, "level": 11, "constant": 11.3, "artworkURL": "common/img/fa70cc77f963cdba.jpg" }, { "name": "鳥の詩", "musicId": 37, "level": 11, "constant": 11.3, "artworkURL": "common/img/335dbb14cedb70bf.jpg" }, { "name": "secret base ～君がくれたもの～ (10 years after Ver.)", "musicId": 299, "level": 11, "constant": 11.4, "artworkURL": "common/img/9bd44690db5375ac.jpg" }, { "name": "夏祭り", "musicId": 55, "level": 11, "constant": 11.2, "artworkURL": "common/img/506f053a80e1b28e.jpg" }, { "name": "届かない恋 '13", "musicId": 36, "level": 11, "constant": 11, "artworkURL": "common/img/e273c9d64170b575.jpg" }, { "name": "Heart To Heart", "musicId": 126, "level": 11, "constant": 11.3, "artworkURL": "common/img/547ba5407b6e7fa0.jpg" }, { "name": "Little Busters! ～TV animation ver.～", "musicId": 125, "level": 11, "constant": 11, "isExpert": false, "artworkURL": "common/img/f75a80f9b86eedab.jpg" }, { "name": "激情！ミルキィ大作戦", "musicId": 255, "level": 11, "constant": 11, "artworkURL": "common/img/429d34fef5fddb02.jpg" }, { "name": "君色シグナル", "musicId": 209, "level": 11, "constant": 11.2, "artworkURL": "common/img/5744f4cf66710a56.jpg" }, { "name": "カラフル。", "musicId": 231, "level": 11, "constant": 11, "artworkURL": "common/img/59cfd6c8ebfaf904.jpg" }, { "name": "楽園の翼", "musicId": 185, "level": 11, "constant": 11.2, "artworkURL": "common/img/520c1fef62954ca6.jpg" }, { "name": "コネクト", "musicId": 14, "level": 11, "constant": 11.2, "artworkURL": "common/img/af78dd039a36a4c7.jpg" }, { "name": "crossing field", "musicId": 78, "level": 11, "constant": 11, "isExpert": false, "artworkURL": "common/img/82a643d5d0ab9554.jpg" }, { "name": "アルカリレットウセイ", "musicId": 554, "level": 11, "constant": 11.6, "isExpert": false, "artworkURL": "common/img/0328dba5d965395c.jpg" }, { "name": "フラジール", "musicId": 512, "level": 11, "constant": 11.6, "isExpert": false, "artworkURL": "common/img/139faf69450e65ad.jpg" }, { "name": "だんだん早くなる", "musicId": 375, "level": 11, "constant": 11.5, "artworkURL": "common/img/ddfafd0206d04707.jpg" }, { "name": "いーあるふぁんくらぶ", "musicId": 367, "level": 11, "constant": 11.4, "artworkURL": "common/img/0c6288729e80a1df.jpg" }, { "name": "愛言葉", "musicId": 275, "level": 11, "constant": 11.5, "artworkURL": "common/img/169a5a5ffa300cb7.jpg" }, { "name": "ラクガキスト", "musicId": 281, "level": 11, "constant": 11.1, "isExpert": true, "artworkURL": "common/img/330e57eeeb0fb2cd.jpg" }, { "name": "Tell Your World", "musicId": 286, "level": 11, "constant": 11.5, "artworkURL": "common/img/afcce0c85c1f8610.jpg" }, { "name": "からくりピエロ", "musicId": 278, "level": 11, "constant": 11.4, "artworkURL": "common/img/5f1d7a520a2735d4.jpg" }, { "name": "みくみくにしてあげる♪【してやんよ】", "musicId": 316, "level": 11, "constant": 11.5, "artworkURL": "common/img/88f9536c08cb4e3f.jpg" }, { "name": "カミサマネジマキ", "musicId": 223, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/8ec9a26e11ec1a40.jpg" }, { "name": "恋愛裁判", "musicId": 224, "level": 11, "constant": 11.1, "artworkURL": "common/img/b9d170f84c1bb5d3.jpg" }, { "name": "Mr. Wonderland", "musicId": 222, "level": 11, "constant": 11.1, "isExpert": true, "artworkURL": "common/img/ad33a423c865bed1.jpg" }, { "name": "すろぉもぉしょん", "musicId": 179, "level": 11, "constant": 11.3, "artworkURL": "common/img/0e73189a7083e4f4.jpg" }, { "name": "FREELY TOMORROW", "musicId": 156, "level": 11, "constant": 11.4, "artworkURL": "common/img/b33923bd4e6e5609.jpg" }, { "name": "シリョクケンサ", "musicId": 133, "level": 11, "constant": 11, "artworkURL": "common/img/566d55b9b73112d5.jpg" }, { "name": "Sweet Devil", "musicId": 114, "level": 11, "constant": 11.6, "artworkURL": "common/img/b02c3912d1524d5c.jpg" }, { "name": "天ノ弱", "musicId": 38, "level": 11, "constant": 11.1, "artworkURL": "common/img/529d98ad07709ae5.jpg" }, { "name": "ストリーミングハート", "musicId": 113, "level": 11, "constant": 11.4, "artworkURL": "common/img/3f8eb68a4f6089dc.jpg" }, { "name": "千本桜", "musicId": 18, "level": 11, "constant": 11.4, "artworkURL": "common/img/3c2606abe4dded71.jpg" }, { "name": "M.S.S.Planet", "musicId": 117, "level": 11, "constant": 11.5, "artworkURL": "common/img/88124d980ac7eca4.jpg" }, { "name": "色は匂へど散りぬるを", "musicId": 549, "level": 11, "constant": 11.2, "isExpert": false, "artworkURL": "common/img/031a0545ca9c489b.jpg" }, { "name": "華鳥風月", "musicId": 426, "level": 11, "constant": 11.5, "artworkURL": "common/img/6c2e56be54f35d83.jpg" }, { "name": "Calamity Fortune", "musicId": 504, "level": 11, "constant": 11.5, "isExpert": true, "artworkURL": "common/img/7f68ccfecfbf4fc6.jpg" }, { "name": "泡沫、哀のまほろば", "musicId": 377, "level": 11, "constant": 11.5, "artworkURL": "common/img/841eecc396c5059a.jpg" }, { "name": "Starlight Dance Floor", "musicId": 380, "level": 11, "constant": 11.4, "artworkURL": "common/img/f5f99bf548dab947.jpg" }, { "name": "患部で止まってすぐ溶ける～狂気の優曇華院", "musicId": 187, "level": 11, "constant": 11, "artworkURL": "common/img/e6642a96885723c1.jpg" }, { "name": "Imperishable Night 2006 (2016 Refine)", "musicId": 322, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/8b145fe4cf0c01bb.jpg" }, { "name": "幻想のサテライト", "musicId": 305, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/266bd38219201fa1.jpg" }, { "name": "Yet Another ”drizzly rain”", "musicId": 91, "level": 11, "constant": 11.2, "artworkURL": "common/img/cb77a66b62023890.jpg" }, { "name": "魔理沙は大変なものを盗んでいきました", "musicId": 98, "level": 11, "constant": 11.4, "artworkURL": "common/img/f7e67efaf6ced6ea.jpg" }, { "name": "sweet little sister", "musicId": 41, "level": 11, "constant": 11.6, "artworkURL": "common/img/7f17441bc2582ec8.jpg" }, { "name": "Dreaming", "musicId": 115, "level": 11, "constant": 11.5, "artworkURL": "common/img/9165ee58223accc0.jpg" }, { "name": "ちくわパフェだよ☆CKP", "musicId": 204, "level": 11, "constant": 11.2, "artworkURL": "common/img/1ea73ffbba6d7ead.jpg" }, { "name": "Elemental Creation", "musicId": 232, "level": 11, "constant": 11.3, "isExpert": true, "artworkURL": "common/img/a2069fdb9d860d36.jpg" }, { "name": "JET", "musicId": 89, "level": 11, "constant": 11, "artworkURL": "common/img/a7b85d734fea4749.jpg" }, { "name": "セイクリッド　ルイン", "musicId": 470, "level": 11, "constant": 11.4, "isExpert": true, "artworkURL": "common/img/8205b2bb79af3a09.jpg" }, { "name": "elegante", "musicId": 169, "level": 11, "constant": 11.4, "artworkURL": "common/img/f092ddd9e1fe088b.jpg" }, { "name": "DRAGONLADY", "musicId": 19, "level": 11, "constant": 11.4, "isExpert": true, "artworkURL": "common/img/0b98b8b4e7cfd997.jpg" }, { "name": "FREEDOM DiVE", "musicId": 196, "level": 11, "constant": 11.5, "isExpert": true, "artworkURL": "common/img/ed40032f25177518.jpg" }, { "name": "Angel dust", "musicId": 137, "level": 11, "constant": 11.6, "isExpert": true, "artworkURL": "common/img/13a5a9ca35a9b71b.jpg" }, { "name": "Strahv", "musicId": 302, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/13446730e8b99f0e.jpg" }, { "name": "★LittlE HearTs★", "musicId": 328, "level": 11, "constant": 11.4, "isExpert": true, "artworkURL": "common/img/c7cf3ce1e858e3f0.jpg" }, { "name": "Name of oath", "musicId": 389, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/f7be4abcf8f3e197.jpg" }, { "name": "Dance!", "musicId": 176, "level": 11, "constant": 11.3, "artworkURL": "common/img/aa0cefb5a0f00457.jpg" }, { "name": "檄!帝国華撃団", "musicId": 290, "level": 11, "constant": 11.3, "artworkURL": "common/img/b1d08379f05c706e.jpg" }, { "name": "フォルテシモBELL", "musicId": 158, "level": 11, "constant": 11, "artworkURL": "common/img/e3ce6712e8cddf10.jpg" }, { "name": "DETARAME ROCK&ROLL THEORY", "musicId": 170, "level": 11, "constant": 11.2, "artworkURL": "common/img/de40692ecc47778b.jpg" }, { "name": "ポルカドット", "musicId": 550, "level": 11, "constant": 11.3, "isExpert": false, "artworkURL": "common/img/73612eecde653174.jpg" }, { "name": "Help me, あーりん！", "musicId": 245, "level": 11, "constant": 11.4, "artworkURL": "common/img/630ac5b31e8ab816.jpg" }, { "name": "夢と夢～あの日のメロディ～", "musicId": 488, "level": 11, "constant": 11.3, "artworkURL": "common/img/424b4d3540141967.jpg" }, { "name": "言ノ葉遊戯", "musicId": 160, "level": 11, "constant": 11.6, "artworkURL": "common/img/809bf2b3f8effa6f.jpg" }, { "name": "洗脳", "musicId": 227, "level": 11, "constant": 11.5, "artworkURL": "common/img/74c77deb2f2e5e07.jpg" }, { "name": "りばーぶ", "musicId": 403, "level": 11, "constant": 11.2, "artworkURL": "common/img/2c9749de2183879c.jpg" }, { "name": "Like the Wind [Reborn]", "musicId": 397, "level": 11, "constant": 11, "artworkURL": "common/img/3e545c372b926197.jpg", "isExpert": true }, { "name": "GEMINI -C-", "musicId": 202, "level": 11, "constant": 11.2, "isExpert": true, "artworkURL": "common/img/45112e2818cf80a2.jpg" }, { "name": "ＧＯ！ＧＯ！ラブリズム♥", "musicId": 79, "level": 11, "constant": 11.1, "artworkURL": "common/img/281f821a06a7da18.jpg" }, { "name": "Theme of SeelischTact", "musicId": 148, "level": 11, "constant": 11, "artworkURL": "common/img/cd458a75aa049889.jpg" }, { "name": "幾四音-Ixion-", "musicId": 163, "level": 11, "constant": 11.3, "artworkURL": "common/img/fd6847e3bb2e3629.jpg" }, { "name": "Anemone", "musicId": 65, "level": 11, "constant": 11.1, "artworkURL": "common/img/713d52aa40ed7fc4.jpg" }, { "name": "リリーシア", "musicId": 74, "level": 11, "constant": 11, "artworkURL": "common/img/feef37ed3d91cfbd.jpg" }, { "name": "昵懇レファレンス", "musicId": 67, "level": 11, "constant": 11.2, "artworkURL": "common/img/11437ebc94947550.jpg" }, { "name": "乗り切れ受験ウォーズ", "musicId": 68, "level": 11, "constant": 11.5, "artworkURL": "common/img/145b9b6f4c27d78e.jpg" }, { "name": "Cyberozar", "musicId": 52, "level": 11, "constant": 11.1, "isExpert": true, "artworkURL": "common/img/a62f975edc860e34.jpg" }, { "name": "GOLDEN RULE", "musicId": 61, "level": 11, "constant": 11, "isExpert": true, "artworkURL": "common/img/2ccf97477eaf45ad.jpg" }, { "name": "心象蜃気楼", "musicId": 267, "level": 11, "constant": 11.5, "artworkURL": "common/img/a0d03551eb3930e9.jpg" }, { "name": "First Twinkle", "musicId": 288, "level": 11, "constant": 11.6, "artworkURL": "common/img/f29f10a963df60cf.jpg" }, { "name": "Oshama Scramble! (Cranky Remix)", "musicId": 259, "level": 11, "constant": 11.3, "isExpert": true, "artworkURL": "common/img/4d66e5d1669d79a2.jpg" }, { "name": "We Gonna Party -Feline Groove Mix-", "musicId": 414, "level": 11, "constant": 11.3, "isExpert": true, "artworkURL": "common/img/cd2aebc19c4fa1cd.jpg" }, { "name": "願い星", "musicId": 274, "level": 11, "constant": 11.6, "artworkURL": "common/img/7f2474bda00c94b0.jpg" }, { "name": "覚醒楽奏メタフィクション", "musicId": 310, "level": 11, "constant": 11.2, "isExpert": true, "artworkURL": "common/img/ae93bd84b68781f6.jpg" }, { "name": "Supersonic Generation", "musicId": 335, "level": 11, "constant": 11.2, "isExpert": true, "artworkURL": "common/img/3c61434b8cb2aadf.jpg" }, { "name": "JIGOKU STATION CENTRAL GATE", "musicId": 435, "level": 11, "constant": 11.4, "isExpert": true, "artworkURL": "common/img/1ab2b7720caa1c34.jpg" }, { "name": "Sparking Revolver", "musicId": 551, "level": 11, "constant": 11.4, "isExpert": true, "artworkURL": "common/img/e18b6ede661b48e7.jpg" }, { "name": "Twilight", "musicId": 569, "level": 11, "constant": 11.3, "isExpert": false, "artworkURL": "common/img/31c3a521fea72a26.jpg" }, { "artworkURL": "common/img/3671be7bcc53baf5.jpg", "name": "Sentimental Snow", "musicId": 588, "level": 11, "constant": 11.5, "isExpert": false }, { "artworkURL": "common/img/3671be7bcc53baf5.jpg", "name": "ガヴリールドロップキック", "musicId": 591, "level": 11, "constant": 11.8, "isExpert": false }, { "artworkURL": "common/img/4ab93315456989da.jpg", "name": "羽ばたきのバースデイ", "musicId": 579, "level": 11, "constant": 11.9, "isExpert": false }, { "artworkURL": "common/img/4ab93315456989da.jpg", "name": "Link with U", "musicId": 613, "level": 11, "constant": 11.7, "isExpert": false }, { "name": "未来イマジネーション！", "musicId": 560, "level": 11, "constant": 11.9, "isExpert": false, "artworkURL": "common/img/9018fbf8969ec5c1.jpg" }, { "name": "ヒトリゴト", "musicId": 541, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/fc982764096e1bd2.jpg" }, { "name": "夢路らびりんす", "musicId": 544, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/bceaddf2205c950e.jpg" }, { "name": "虹色のフリューゲル", "musicId": 523, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/fb54f4796323e3a3.jpg" }, { "name": "Philosophyz", "musicId": 522, "level": 11, "constant": 11.9, "isExpert": false, "artworkURL": "common/img/0b6f51cf3dc3d96d.jpg" }, { "name": "Our Fighting", "musicId": 485, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/a5fde36cce796ed3.jpg" }, { "name": "プレパレード", "musicId": 529, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/7155efe094099d50.jpg" }, { "name": "SAKURAスキップ", "musicId": 419, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/6fa8fe3cc9619215.jpg" }, { "name": "Clover Heart's", "musicId": 502, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/a423c93453d32953.jpg" }, { "name": "前前前世", "musicId": 421, "level": 11, "constant": 11.9, "artworkURL": "common/img/a3473adab177dea7.jpg" }, { "name": "My Soul,Your Beats!", "musicId": 358, "level": 11, "constant": 11.7, "artworkURL": "common/img/c12cb5d8f49e8d2b.jpg" }, { "name": "Thousand Enemies", "musicId": 359, "level": 11, "constant": 11.8, "artworkURL": "common/img/8b7fcdd825264797.jpg" }, { "name": "ぐーちょきパレード", "musicId": 357, "level": 11, "constant": 11.7, "artworkURL": "common/img/a852ba21f22efbc1.jpg" }, { "name": "若い力 -SEGA HARD GIRLS MIX-", "musicId": 394, "level": 11, "constant": 11.7, "artworkURL": "common/img/0a458d03f61196d3.jpg" }, { "name": "ノーポイッ!", "musicId": 344, "level": 11, "constant": 11.8, "artworkURL": "common/img/fa151f477301a676.jpg" }, { "name": "ムーンライト伝説", "musicId": 345, "level": 11, "constant": 11.7, "artworkURL": "common/img/1c098cdf731eb671.jpg" }, { "name": "Be My Friend", "musicId": 311, "level": 11, "constant": 11.8, "artworkURL": "common/img/8f359edeac59a511.jpg" }, { "name": "This game", "musicId": 314, "level": 11, "constant": 11.8, "artworkURL": "common/img/5fb63e847a057938.jpg" }, { "name": "フレンズ", "musicId": 238, "level": 11, "constant": 11.9, "artworkURL": "common/img/4c769ae611f83d21.jpg" }, { "name": "fake!fake!", "musicId": 308, "level": 11, "constant": 11.9, "artworkURL": "common/img/f8d3f2e57ae2ff24.jpg" }, { "name": "絶世スターゲイト", "musicId": 247, "level": 11, "constant": 11.7, "artworkURL": "common/img/58847f9694837c0b.jpg" }, { "name": "グラーヴェ", "musicId": 556, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/7dc41f066677953c.jpg" }, { "name": "アマツキツネ", "musicId": 446, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/0faaf515e51805fa.jpg" }, { "name": "スイートマジック", "musicId": 503, "level": 11, "constant": 11.8, "isExpert": false, "artworkURL": "common/img/bdd423f3d0566b32.jpg" }, { "name": "Just Be Friends", "musicId": 476, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/8e9ea2e652dba3fb.jpg" }, { "name": "炉心融解", "musicId": 477, "level": 11, "constant": 11.9, "isExpert": false, "artworkURL": "common/img/ebd25c2a2b4e275e.jpg" }, { "name": "エレクトロサチュレイタ", "musicId": 444, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/e236f8a08a42923a.jpg" }, { "name": "エイリアンエイリアン", "musicId": 369, "level": 11, "constant": 11.7, "artworkURL": "common/img/d3a5a61b5eb2b8fb.jpg" }, { "name": "有頂天ビバーチェ", "musicId": 272, "level": 11, "constant": 11.7, "artworkURL": "common/img/98b02f86db4d3fe2.jpg" }, { "name": "アカツキアライヴァル", "musicId": 282, "level": 11, "constant": 11.7, "artworkURL": "common/img/4a51a3a5dc24c579.jpg" }, { "name": "リモコン", "musicId": 280, "level": 11, "constant": 11.8, "artworkURL": "common/img/f78d1487c34efa6e.jpg" }, { "name": "ビバハピ", "musicId": 273, "level": 11, "constant": 11.9, "artworkURL": "common/img/604157e2c49d91d7.jpg" }, { "name": "深海少女", "musicId": 279, "level": 11, "constant": 11.7, "artworkURL": "common/img/84ecaebe6bce2a58.jpg" }, { "name": "ロミオとシンデレラ", "musicId": 287, "level": 11, "constant": 11.9, "artworkURL": "common/img/5febf5df2b5094f3.jpg" }, { "name": "Hand in Hand", "musicId": 263, "level": 11, "constant": 11.7, "artworkURL": "common/img/015358a0c0580022.jpg" }, { "name": "楽園ファンファーレ", "musicId": 217, "level": 11, "constant": 11.8, "artworkURL": "common/img/2b3c90b1dab1ecff.jpg" }, { "name": "星屑ユートピア", "musicId": 213, "level": 11, "constant": 11.9, "artworkURL": "common/img/c6d494f528391d1c.jpg" }, { "name": "裏表ラバーズ", "musicId": 166, "level": 11, "constant": 11.8, "artworkURL": "common/img/5a0ac8501e3b95ce.jpg" }, { "name": "ネトゲ廃人シュプレヒコール", "musicId": 168, "level": 11, "constant": 11.9, "artworkURL": "common/img/1982767436fc52d8.jpg" }, { "name": "Melody！", "musicId": 505, "level": 11, "constant": 11.9, "isExpert": false, "artworkURL": "common/img/914a1ac5a7d45fe3.jpg" }, { "name": "幽闇に目醒めしは", "musicId": 191, "level": 11, "constant": 11.7, "artworkURL": "common/img/53862f1d50a76902.jpg" }, { "name": "ってゐ！　～えいえんてゐVer～", "musicId": 186, "level": 11, "constant": 11.9, "artworkURL": "common/img/e26ef92a66d5d07f.jpg" }, { "name": "緋色のDance", "musicId": 149, "level": 11, "constant": 11.7, "artworkURL": "common/img/c9c2fa20dcd9a46e.jpg" }, { "name": "ナイト・オブ・ナイツ", "musicId": 21, "level": 11, "constant": 11.9, "artworkURL": "common/img/4f69fb126f579c2f.jpg" }, { "name": "チルノのパーフェクトさんすう教室", "musicId": 96, "level": 11, "constant": 11.9, "artworkURL": "common/img/9d2ebc847487e01b.jpg" }, { "name": "Unlimited Spark!", "musicId": 48, "level": 11, "constant": 11.8, "artworkURL": "common/img/b38eba298df2c6db.jpg" }, { "name": "極圏", "musicId": 471, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/29b703cb5312a4eb.jpg" }, { "name": "Scarlet Lance", "musicId": 472, "level": 11, "constant": 11.9, "isExpert": true, "artworkURL": "common/img/62134ad35e35ea72.jpg" }, { "name": "B.B.K.K.B.K.K.", "musicId": 3, "level": 11, "constant": 11.8, "artworkURL": "common/img/d739ba44da6798a0.jpg" }, { "name": "Jack-the-Ripper◆", "musicId": 197, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/ae6d3a8806e09613.jpg" }, { "name": "Dengeki Tube", "musicId": 393, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/de02f8c0217d9baa.jpg" }, { "name": "AVALON", "musicId": 198, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/9d68467c72426ff7.jpg" }, { "name": "Signs Of Love (“Never More” ver.)", "musicId": 206, "level": 11, "constant": 11.8, "artworkURL": "common/img/e10bbd173df15772.jpg" }, { "name": "Your Affection (Daisuke Asakura Remix)", "musicId": 207, "level": 11, "constant": 11.7, "artworkURL": "common/img/5151993f923b06a5.jpg" }, { "name": "In The Blue Sky '01", "musicId": 304, "level": 11, "constant": 11.7, "artworkURL": "common/img/0bb58f15b16703ab.jpg" }, { "name": "レッツゴー!陰陽師", "musicId": 395, "level": 11, "constant": 11.9, "artworkURL": "common/img/90be66e64c2417cb.jpg" }, { "name": "Change Our MIRAI！", "musicId": 145, "level": 11, "constant": 11.8, "artworkURL": "common/img/0bb58f15b16703ab.jpg" }, { "artworkURL": "common/img/9a2d0a0022dfb29b.jpg", "name": "管弦楽組曲 第3番 ニ長調「第2曲（G線上のアリア）」BWV.1068-2", "musicId": 600, "level": 11, "constant": 11.9, "isExpert": true }, { "name": "brilliant better", "musicId": 150, "level": 11, "constant": 11.8, "artworkURL": "common/img/2a41ad71b77d12c9.jpg" }, { "name": "Tic Tac DREAMIN’", "musicId": 337, "level": 11, "constant": 11.8, "artworkURL": "common/img/2faebe5b438810f2.jpg" }, { "name": "プリズム", "musicId": 500, "level": 11, "constant": 11.7, "isExpert": false, "artworkURL": "common/img/1a32f21c3cdf9951.jpg" }, { "name": "言ノ葉カルマ", "musicId": 99, "level": 11, "constant": 11.7, "artworkURL": "common/img/ee332e6fa86661fd.jpg" }, { "name": "天国と地獄 -言ノ葉リンネ-", "musicId": 398, "level": 11, "constant": 11.8, "artworkURL": "common/img/4e7b81501ccdd198.jpg" }, { "name": "VERTeX", "musicId": 486, "level": 11, "constant": 11.9, "isExpert": true, "artworkURL": "common/img/11e18cb195118151.jpg" }, { "name": "Counselor", "musicId": 75, "level": 11, "constant": 11.7, "artworkURL": "common/img/e1454dc2eeae2030.jpg" }, { "name": "Guilty", "musicId": 140, "level": 11, "constant": 11.9, "artworkURL": "common/img/0aad2e0ff661e7d1.jpg" }, { "name": "閃鋼のブリューナク", "musicId": 141, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/2e6c11edba79d997.jpg" }, { "name": "Gate of Fate", "musicId": 63, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/2df15f390356067f.jpg" }, { "name": "The wheel to the right", "musicId": 69, "level": 11, "constant": 11.9, "isExpert": true, "artworkURL": "common/img/c2c4ece2034eb620.jpg" }, { "name": "夕暮れワンルーム", "musicId": 146, "level": 11, "constant": 11.7, "artworkURL": "common/img/d3b40f7b8e0758ff.jpg" }, { "name": "エンドマークに希望と涙を添えて", "musicId": 103, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/3210d321c2700a57.jpg" }, { "name": "L'épisode", "musicId": 90, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/19d57f9a7652308a.jpg" }, { "name": "その群青が愛しかったようだった", "musicId": 254, "level": 11, "constant": 11.7, "artworkURL": "common/img/2e617d713547fe84.jpg" }, { "name": "Philosopher", "musicId": 250, "level": 11, "constant": 11.8, "isExpert": true, "artworkURL": "common/img/989f4458fb34aa9d.jpg" }, { "name": "RevolutionGame", "musicId": 339, "level": 11, "constant": 11.7, "artworkURL": "common/img/65353f99e301c521.jpg" }, { "name": "Iudicium", "musicId": 466, "level": 11, "constant": 11.9, "isExpert": true, "artworkURL": "common/img/167791d19a6a7957.jpg" }, { "name": "Gate of Doom", "musicId": 552, "level": 11, "constant": 11.7, "isExpert": true, "artworkURL": "common/img/a087d11d9ac3d044.jpg" }, { "name": "popcorn", "musicId": 565, "level": 11, "constant": 11.9, "isExpert": false, "artworkURL": "common/img/2c2245060b464cbd.jpg" }, { "name": "ぶれいくるみるくらぶ！", "musicId": 586, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/ea6cb449d0627a7c.jpg" }, { "artworkURL": "common/img/b540228a9ffbbcec.jpg", "name": "楔", "musicId": 580, "level": 12, "constant": 12.4, "isExpert": false }, { "name": "ゴーゴー幽霊船", "musicId": 577, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/eff4f213a2328a1f.jpg" }, { "artworkURL": "common/img/0dd2681465ca1388.jpg", "name": "SEVENTH HAVEN", "musicId": 611, "level": 12, "constant": 12.1, "isExpert": false }, { "name": "純情-SAKURA-", "musicId": 561, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/d1f48844d9007ec0.jpg" }, { "name": "青春サイダー", "musicId": 562, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/d1f48844d9007ec0.jpg" }, { "name": "ネ！コ！", "musicId": 574, "level": 12, "constant": 12, "isExpert": false, "artworkURL": "common/img/75e430d9acd92efb.jpg" }, { "name": "Last Proof", "musicId": 546, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/adb6f39bb2e780a3.jpg" }, { "name": "Vitalization", "musicId": 509, "level": 12, "constant": 12.1, "isExpert": false, "artworkURL": "common/img/4d5c0d24a0789f8e.jpg" }, { "name": "亡國覚醒カタルシス", "musicId": 34, "level": 12, "constant": 12.2, "isExpert": false, "artworkURL": "common/img/8298659f13bfd504.jpg" }, { "name": "不安定な神様", "musicId": 495, "level": 12, "constant": 12.1, "isExpert": false, "artworkURL": "common/img/692ad75a013b2444.jpg" }, { "name": "セハガガガンバッちゃう！！", "musicId": 482, "level": 12, "constant": 12.6, "isExpert": false, "artworkURL": "common/img/1d6bd35160a2a1fb.jpg" }, { "name": "Cosmic twinkle star", "musicId": 532, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/6b1c980ddab43d1d.jpg" }, { "name": "終わりなき物語", "musicId": 533, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/73a88c557d702b9d.jpg" }, { "name": "Now Loading!!!!", "musicId": 420, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/3b4b23db814af9c3.jpg" }, { "name": "ガチャガチャきゅ～と・ふぃぎゅ@メイト", "musicId": 454, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/623028772c2d51cf.jpg" }, { "name": "Vampire", "musicId": 455, "level": 12, "constant": 12.6, "isExpert": false, "artworkURL": "common/img/3a64aab4594f0885.jpg" }, { "name": "Paradisus-Paradoxum", "musicId": 525, "level": 12, "constant": 12.4, "artworkURL": "common/img/bf023d3289459959.jpg" }, { "name": "ようこそジャパリパークへ", "musicId": 526, "level": 12, "constant": 12.1, "artworkURL": "common/img/1dee6916940a90cd.jpg" }, { "name": "ハレ晴レユカイ", "musicId": 537, "level": 12, "constant": 12, "artworkURL": "common/img/bbe65bd3f0f984b3.jpg" }, { "name": "Face of Fact", "musicId": 362, "level": 12, "constant": 12.1, "artworkURL": "common/img/13f02068575a1ef9.jpg" }, { "name": "クローバー♣かくめーしょん", "musicId": 356, "level": 12, "constant": 12.3, "artworkURL": "common/img/13e6eb56943f6d00.jpg" }, { "name": "ラブリー☆えんじぇる!!", "musicId": 354, "level": 12, "constant": 12.3, "artworkURL": "common/img/81a50239781153fb.jpg" }, { "name": "Star☆Glitter", "musicId": 352, "level": 12, "constant": 12, "artworkURL": "common/img/c78c45855db15f7a.jpg" }, { "name": "Redo", "musicId": 417, "level": 12, "constant": 12.4, "artworkURL": "common/img/b739e3b0af173789.jpg" }, { "name": "かくしん的☆めたまるふぉ～ぜっ!", "musicId": 296, "level": 12, "constant": 12.1, "artworkURL": "common/img/76535cf4c728f2af.jpg" }, { "name": "夏影", "musicId": 124, "level": 12, "constant": 12.2, "artworkURL": "common/img/74ce2f0a4b4f6fe2.jpg" }, { "name": "Rising Hope", "musicId": 309, "level": 12, "constant": 12.5, "artworkURL": "common/img/cee51d69c428f8f5.jpg" }, { "name": "回レ！雪月花", "musicId": 244, "level": 12, "constant": 12.3, "artworkURL": "common/img/e0a700914896ea4a.jpg" }, { "name": "ファッとして桃源郷", "musicId": 235, "level": 12, "constant": 12.5, "artworkURL": "common/img/8b84b06033585428.jpg" }, { "name": "シュガーソングとビターステップ", "musicId": 243, "level": 12, "constant": 12.2, "artworkURL": "common/img/8872c759bea3bd9f.jpg" }, { "artworkURL": "common/img/3aa3a50bd931445d.jpg", "name": "厨病激発ボーイ", "musicId": 592, "level": 12, "constant": 12.5, "isExpert": false }, { "artworkURL": "common/img/f90f38d6d60902f4.jpg", "name": "放課後ストライド", "musicId": 636, "level": 12, "constant": 12.1, "isExpert": false }, { "artworkURL": "common/img/f90f38d6d60902f4.jpg", "name": "StargazeR", "musicId": 593, "level": 12, "constant": 12.2, "isExpert": false }, { "name": "マトリョシカ", "musicId": 575, "level": 12, "constant": 12.2, "isExpert": false, "artworkURL": "common/img/e6fedbae1ea146a5.jpg" }, { "name": "ダンスロボットダンス", "musicId": 553, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/8516df50242a7fed.jpg" }, { "name": "レトロマニア狂想曲", "musicId": 557, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/4f3b604e82c56795.jpg" }, { "name": "キレキャリオン", "musicId": 555, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/bca8c820576da25a.jpg" }, { "name": "アンノウン・マザーグース", "musicId": 626, "level": 12, "constant": 12.6, "isExpert": false, "artworkURL": "common/img/49a1817062873788.jpg" }, { "name": "Absolunote", "musicId": 513, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/2936c70561d05bc8.jpg" }, { "name": "木彫り鯰と右肩ゾンビ", "musicId": 514, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/9734c16a5d211175.jpg" }, { "name": "WAVE", "musicId": 516, "level": 12, "constant": 12.2, "isExpert": false, "artworkURL": "common/img/1aafc024f0f35740.jpg" }, { "name": "Fire◎Flower", "musicId": 478, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/95066fed763db3c9.jpg" }, { "name": "卑怯戦隊うろたんだー", "musicId": 479, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/b3375d608a67f93b.jpg" }, { "name": "Change me", "musicId": 535, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/6c7ae4d5f977c1fb.jpg" }, { "name": "Palette", "musicId": 445, "level": 12, "constant": 12.1, "isExpert": false, "artworkURL": "common/img/e9573b5c6882f25b.jpg" }, { "name": "砂の惑星 feat. HATSUNE MIKU", "musicId": 540, "level": 12, "constant": 12.3, "artworkURL": "common/img/85e49b02887f58c1.jpg" }, { "name": "すきなことだけでいいです", "musicId": 372, "level": 12, "constant": 12.2, "artworkURL": "common/img/9c39b668e99ce253.jpg" }, { "name": "デリヘル呼んだら君が来た", "musicId": 373, "level": 12, "constant": 12.4, "artworkURL": "common/img/4f8e04cdc467480d.jpg" }, { "name": "チュルリラ・チュルリラ・ダッダッダ！", "musicId": 374, "level": 12, "constant": 12.6, "artworkURL": "common/img/189a65f52bd06239.jpg" }, { "name": "ECHO", "musicId": 376, "level": 12, "constant": 12.2, "artworkURL": "common/img/b1e915b646c9ba08.jpg" }, { "name": "地球最後の告白を", "musicId": 411, "level": 12, "constant": 12.3, "artworkURL": "common/img/dc09ca21d0647779.jpg" }, { "name": "虎視眈々", "musicId": 370, "level": 12, "constant": 12.4, "artworkURL": "common/img/f93fba04ff1c0c54.jpg" }, { "name": "神曲", "musicId": 283, "level": 12, "constant": 12, "artworkURL": "common/img/c658788de6594b15.jpg" }, { "name": "白い雪のプリンセスは", "musicId": 301, "level": 12, "constant": 12.2, "artworkURL": "common/img/62941303552504e8.jpg" }, { "name": "エンヴィキャットウォーク", "musicId": 270, "level": 12, "constant": 12.4, "artworkURL": "common/img/21dfcd3ae2c5c370.jpg" }, { "name": "アウターサイエンス", "musicId": 119, "level": 12, "constant": 12.3, "artworkURL": "common/img/a7dd6716fcae0cb8.jpg" }, { "name": "シジョウノコエ VOCALO ver.", "musicId": 336, "level": 12, "constant": 12.2, "artworkURL": "common/img/e40fceaa1bb587b7.jpg" }, { "name": "初音ミクの消失", "musicId": 7, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/b602913a68fca621.jpg" }, { "name": "放課後革命", "musicId": 216, "level": 12, "constant": 12.3, "artworkURL": "common/img/3227722a8345a950.jpg" }, { "name": "ウミユリ海底譚", "musicId": 225, "level": 12, "constant": 12.1, "artworkURL": "common/img/6f86e2a47e9a283c.jpg" }, { "name": "アスノヨゾラ哨戒班", "musicId": 210, "level": 12, "constant": 12.4, "artworkURL": "common/img/040cd43234aed57a.jpg" }, { "name": "天樂", "musicId": 211, "level": 12, "constant": 12.2, "artworkURL": "common/img/d99079fecaa936ab.jpg" }, { "name": "Crazy ∞ nighT", "musicId": 251, "level": 12, "constant": 12.5, "artworkURL": "common/img/457722c9f3ff5473.jpg" }, { "name": "如月アテンション", "musicId": 220, "level": 12, "constant": 12.3, "artworkURL": "common/img/c3041fd82b0a0710.jpg" }, { "name": "夜咄ディセイブ", "musicId": 240, "level": 12, "constant": 12.6, "artworkURL": "common/img/47397105bad447fb.jpg" }, { "name": "このふざけた素晴らしき世界は、僕の為にある", "musicId": 228, "level": 12, "constant": 12, "artworkURL": "common/img/882be51fe439614d.jpg" }, { "name": "いろは唄", "musicId": 212, "level": 12, "constant": 12.1, "artworkURL": "common/img/1ee29f73ee8f53d0.jpg" }, { "name": "愛迷エレジー", "musicId": 252, "level": 12, "constant": 12.3, "artworkURL": "common/img/bb221e3de960de7d.jpg" }, { "name": "イカサマライフゲイム", "musicId": 132, "level": 12, "constant": 12.2, "artworkURL": "common/img/1c508bbd42d335fe.jpg" }, { "name": "セツナトリップ", "musicId": 94, "level": 12, "constant": 12.4, "artworkURL": "common/img/164258c65c714d50.jpg" }, { "name": "六兆年と一夜物語", "musicId": 47, "level": 12, "constant": 12.3, "artworkURL": "common/img/5cb17a59f4b8c133.jpg" }, { "name": "一触即発☆禅ガール", "musicId": 23, "level": 12, "constant": 12.1, "artworkURL": "common/img/b8ab9573859ebe4f.jpg" }, { "name": "腐れ外道とチョコレゐト", "musicId": 118, "level": 12, "constant": 12, "artworkURL": "common/img/17e485acfe11a67f.jpg" }, { "name": "タイガーランペイジ", "musicId": 27, "level": 12, "constant": 12.5, "artworkURL": "common/img/fdc3bb451f6403d2.jpg" }, { "name": "ロストワンの号哭", "musicId": 83, "level": 12, "constant": 12.2, "artworkURL": "common/img/181682bf5b277726.jpg" }, { "name": "物凄い勢いでけーねが物凄いうた", "musicId": 462, "level": 12, "constant": 12.2, "isExpert": false, "artworkURL": "common/img/2dfae86d3b1a6d37.jpg" }, { "name": "WARNING×WARNING×WARNING", "musicId": 572, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/2dfae86d3b1a6d37.jpg" }, { "name": "ゆけむり魂温泉 II", "musicId": 627, "level": 12, "constant": 12.2, "isExpert": false, "artworkURL": "common/img/bb2dc88810a36c8a.jpg" }, { "name": "天狗の落とし文 feat. ｙｔｒ", "musicId": 459, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/dc7c2a37ec2b35a8.jpg" }, { "name": "Last Moments", "musicId": 457, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/91b0f33f1544748c.jpg" }, { "name": "儚きもの人間", "musicId": 427, "level": 12, "constant": 12.5, "artworkURL": "common/img/b49a0669bb6e3d99.jpg" }, { "name": "キュアリアス光吉古牌　－祭－", "musicId": 384, "level": 12, "constant": 12.4, "artworkURL": "common/img/2cf12519a485d471.jpg" }, { "name": "Help me, ERINNNNNN!! -Cranky remix-", "musicId": 382, "level": 12, "constant": 12.2, "artworkURL": "common/img/35f4cdddf050d04c.jpg" }, { "name": "仙酌絶唱のファンタジア", "musicId": 383, "level": 12, "constant": 12.6, "artworkURL": "common/img/fbc64b4167aebad9.jpg" }, { "name": "Starlight Vision", "musicId": 192, "level": 12, "constant": 12.5, "artworkURL": "common/img/4ec159d338cfba9e.jpg" }, { "name": "Club Ibuki in Break All", "musicId": 193, "level": 12, "constant": 12.5, "artworkURL": "common/img/8d15a77198c7b841.jpg" }, { "name": "永遠のメロディ", "musicId": 195, "level": 12, "constant": 12.3, "artworkURL": "common/img/8fae9b1861d3f9af.jpg" }, { "name": "愛き夜道 feat. ランコ、雨天決行", "musicId": 379, "level": 12, "constant": 12, "artworkURL": "common/img/021eef9b80989a2e.jpg" }, { "name": "Witches night", "musicId": 381, "level": 12, "constant": 12, "artworkURL": "common/img/f489240491c703a5.jpg" }, { "name": "No Routine", "musicId": 300, "level": 12, "constant": 12.2, "artworkURL": "common/img/012eb1ed09577836.jpg" }, { "name": "エテルニタス・ルドロジー", "musicId": 190, "level": 12, "constant": 12.6, "artworkURL": "common/img/bbaa464731ab96a4.jpg" }, { "name": "月に叢雲華に風", "musicId": 292, "level": 12, "constant": 12.1, "artworkURL": "common/img/b12c25f87b1d036e.jpg" }, { "name": "蒼空に舞え、墨染の桜", "musicId": 93, "level": 12, "constant": 12.3, "artworkURL": "common/img/6b40809324937ec9.jpg" }, { "name": "FLOWER", "musicId": 203, "level": 12, "constant": 12, "artworkURL": "common/img/101d4e7b03a5a89e.jpg" }, { "name": "アルストロメリア", "musicId": 233, "level": 12, "constant": 12.2, "artworkURL": "common/img/5fe5db1d2e40ee7a.jpg" }, { "name": "凛として咲く花の如く", "musicId": 306, "level": 12, "constant": 12.2, "artworkURL": "common/img/106d9eec68ed84b3.jpg" }, { "name": "XL TECHNO", "musicId": 171, "level": 12, "constant": 12.4, "artworkURL": "common/img/25abef88cb12af3e.jpg" }, { "name": "PRIVATE SERVICE", "musicId": 298, "level": 12, "constant": 12.6, "artworkURL": "common/img/7c649691aa0c4b3d.jpg" }, { "name": "FLOATED CALM", "musicId": 334, "level": 12, "constant": 12.4, "artworkURL": "common/img/2704dddce9cd4e3c.jpg" }, { "name": "L9", "musicId": 45, "level": 12, "constant": 12.6, "artworkURL": "common/img/90dca26c66c5d5b7.jpg" }, { "name": "Altale", "musicId": 142, "level": 12, "constant": 12.6, "artworkURL": "common/img/a8d181c5442df7d2.jpg" }, { "name": "HAELEQUIN (Original Remaster)", "musicId": 134, "level": 12, "constant": 12.2, "isExpert": true, "artworkURL": "common/img/08a24ed249ed2eec.jpg" }, { "name": "Äventyr", "musicId": 136, "level": 12, "constant": 12.5, "artworkURL": "common/img/c4f977d264deafb1.jpg" }, { "name": "Lapis", "musicId": 35, "level": 12, "constant": 12.4, "artworkURL": "common/img/aabf49add818546d.jpg" }, { "name": "010", "musicId": 320, "level": 12, "constant": 12.6, "artworkURL": "common/img/6b33d4fa539d5adb.jpg" }, { "name": "ERIS -Legend of Gaidelia-", "musicId": 321, "level": 12, "constant": 12.5, "artworkURL": "common/img/40cc7a6a264f88c1.jpg" }, { "name": "STAGER", "musicId": 324, "level": 12, "constant": 12.6, "artworkURL": "common/img/d51d4ffba9f8d45e.jpg" }, { "name": "Her Majesty", "musicId": 325, "level": 12, "constant": 12.6, "artworkURL": "common/img/97eca622afca0f15.jpg" }, { "name": "Sakura Fubuki", "musicId": 326, "level": 12, "constant": 12.5, "artworkURL": "common/img/fd01fc38e38042e3.jpg" }, { "name": "Kronos", "musicId": 291, "level": 12, "constant": 12.4, "artworkURL": "common/img/9c5e71b3588dbc70.jpg" }, { "name": "風仁雷仁", "musicId": 297, "level": 12, "constant": 12.3, "artworkURL": "common/img/8463cebfa120b884.jpg" }, { "name": "Bird Sprite", "musicId": 390, "level": 12, "constant": 12.2, "artworkURL": "common/img/c23488ff88a819b9.jpg" }, { "name": "ETERNAL DRAIN", "musicId": 524, "level": 12, "constant": 12.5, "artworkURL": "common/img/000e2ca1e56d9d37.jpg" }, { "name": "G e n g a o z o", "musicId": 506, "level": 12, "constant": 12.4, "isExpert": true, "artworkURL": "common/img/46cd4867e5a494e8.jpg" }, { "name": "Doppelganger", "musicId": 548, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/acda9dc8dc61f6ba.jpg" }, { "name": "La Flesvelka", "musicId": 578, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/4411362dc2d17b55.jpg" }, { "name": "Reach for the Stars", "musicId": 6, "level": 12, "constant": 12.3, "artworkURL": "common/img/90589be457544570.jpg" }, { "name": "The Concept of Love", "musicId": 88, "level": 12, "constant": 12.1, "artworkURL": "common/img/c4223e68340efa41.jpg" }, { "name": "STAIRWAY TO GENERATION", "musicId": 329, "level": 12, "constant": 12.3, "artworkURL": "common/img/e869980ddd2f9c68.jpg" }, { "name": "Through The Tower", "musicId": 416, "level": 12, "constant": 12.4, "artworkURL": "common/img/d13c5d162e6fa57e.jpg" }, { "name": "Burning Hearts ～炎のANGEL～", "musicId": 483, "level": 12, "constant": 12.5, "artworkURL": "common/img/fff34dac8294c221.jpg" }, { "name": "無敵We are one!!", "musicId": 200, "level": 12, "constant": 12.1, "artworkURL": "common/img/569e7b07c0696bc7.jpg" }, { "artworkURL": "common/img/e94e537101cfb694.jpg", "name": "Candyland Symphony", "musicId": 629, "level": 12, "constant": 12.4, "isExpert": false }, { "name": "ドキドキDREAM!!!", "musicId": 330, "level": 12, "constant": 12.1, "artworkURL": "common/img/b3ea0fe012eb7ea2.jpg" }, { "name": "Still", "musicId": 340, "level": 12, "constant": 12.5, "artworkURL": "common/img/de62556bd83dd21d.jpg" }, { "name": "Session High⤴", "musicId": 431, "level": 12, "constant": 12.6, "artworkURL": "common/img/f1c1b5e3b6f67c33.jpg" }, { "name": "私の中の幻想的世界観及びその顕現を想起させたある現実での出来事に関する一考察", "musicId": 161, "level": 12, "constant": 12.5, "artworkURL": "common/img/4ceb5aed4a4a1c47.jpg" }, { "name": "ハート・ビート", "musicId": 199, "level": 12, "constant": 12.1, "artworkURL": "common/img/d76afb63de1417f8.jpg" }, { "name": "猛進ソリストライフ！", "musicId": 331, "level": 12, "constant": 12.2, "artworkURL": "common/img/ec37e447b91995dd.jpg" }, { "name": "My Dearest Song", "musicId": 264, "level": 12, "constant": 12.2, "artworkURL": "common/img/f44c6b628889f8ec.jpg" }, { "name": "TRUST", "musicId": 277, "level": 12, "constant": 12.4, "artworkURL": "common/img/23e754d62862c0c4.jpg" }, { "name": "猫祭り", "musicId": 265, "level": 12, "constant": 12.3, "artworkURL": "common/img/874f9509a5e5707e.jpg" }, { "name": "SPICY SWINGY STYLE", "musicId": 338, "level": 12, "constant": 12.3, "artworkURL": "common/img/379072a1ddcf1fe2.jpg" }, { "name": "イロトリドリのメロディ", "musicId": 481, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/1762bae0f0c65798.jpg" }, { "name": "Very! Merry!! Session!!!", "musicId": 564, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/9b374cf09f2245a7.jpg" }, { "name": "あねぺったん", "musicId": 396, "level": 12, "constant": 12.1, "artworkURL": "common/img/d15d3a298dac3df0.jpg" }, { "artworkURL": "common/img/47d116e0e48b4dad.jpg", "name": "クレッシェンド・ストーリー", "musicId": 587, "level": 12, "constant": 12.4, "isExpert": false }, { "name": "イロドリミドリ杯花映塚全一決定戦公式テーマソング『ウソテイ』", "musicId": 558, "level": 12, "constant": 12.3, "isExpert": false, "artworkURL": "common/img/0bd2f171d0f1fcda.jpg" }, { "name": "ＧＯ！ＧＯ！ラブリズム♥ ～あーりん書類審査通過記念Ver.～", "musicId": 430, "level": 12, "constant": 12.1, "artworkURL": "common/img/eaa5090407bf9aed.jpg" }, { "name": "空威張りビヘイビア", "musicId": 332, "level": 12, "constant": 12.3, "artworkURL": "common/img/41001ddd4214d6b6.jpg" }, { "artworkURL": "common/img/3ee1268cd775ecdf.jpg", "name": "ここで一席！　Oshama Scramble!", "musicId": 601, "level": 12, "constant": 12.5, "isExpert": false }, { "name": "悪戯", "musicId": 402, "level": 12, "constant": 12.2, "artworkURL": "common/img/2b40dbdabb958a34.jpg" }, { "name": "Barbed Eye", "musicId": 404, "level": 12, "constant": 12, "artworkURL": "common/img/dc67a58e35e06b96.jpg" }, { "name": "相思創愛", "musicId": 406, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/8c01dde56f3baa9c.jpg" }, { "artworkURL": "common/img/5b2e31fcc8e36596.jpg", "name": "咲キ誇レ常世ノ華", "musicId": 633, "level": 12, "constant": 12.4, "isExpert": false }, { "name": "Garakuta Doll Play", "musicId": 226, "level": 12, "constant": 12.3, "isExpert": true, "artworkURL": "common/img/993b5cddb9d9badf.jpg" }, { "name": "AMAZING MIGHTYYYY!!!!", "musicId": 538, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/e03858fb5d391628.jpg" }, { "name": "L'épilogue", "musicId": 497, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/6aeb823485473262.jpg" }, { "name": "D✪N’T ST✪P R✪CKIN’ ～[✪_✪] MIX～", "musicId": 498, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/028e821bafc7723a.jpg" }, { "name": "Caliburne ～Story of the Legendary sword～", "musicId": 499, "level": 12, "constant": 12.1, "isExpert": true, "artworkURL": "common/img/4d9c1d8238fd9858.jpg" }, { "name": "ねぇ、壊れタ人形ハ何処へ棄テらレるノ？", "musicId": 570, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/345ff2c66d2cee6c.jpg" }, { "name": "Contrapasso -inferno-", "musicId": 201, "level": 12, "constant": 12.1, "isExpert": true, "artworkURL": "common/img/a251c24a3cc4dbf7.jpg" }, { "name": "Xevel", "musicId": 469, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/bf7110e73e088609.jpg" }, { "name": "otorii INNOVATED -[i]3-", "musicId": 559, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/98f14a4886cbe7cf.jpg" }, { "name": "Infantoon Fantasy", "musicId": 71, "level": 12, "constant": 12.3, "artworkURL": "common/img/2bf02bef3051ecaf.jpg" }, { "name": "砂漠のハンティングガール♡", "musicId": 95, "level": 12, "constant": 12.1, "artworkURL": "common/img/db38c119e4d8933e.jpg" }, { "name": "Teriqma", "musicId": 53, "level": 12, "constant": 12.3, "artworkURL": "common/img/73ad66e81061bba3.jpg" }, { "name": "The ether", "musicId": 108, "level": 12, "constant": 12.2, "artworkURL": "common/img/1ec3213366f4ad57.jpg" }, { "name": "Memories of Sun and Moon", "musicId": 82, "level": 12, "constant": 12.5, "artworkURL": "common/img/27ef71f8a76f1e8a.jpg" }, { "name": "luna blu", "musicId": 76, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/93abb77776c70b47.jpg" }, { "name": "Alma", "musicId": 151, "level": 12, "constant": 12.6, "artworkURL": "common/img/7237488215dbd1d3.jpg" }, { "name": "STAR", "musicId": 70, "level": 12, "constant": 12.4, "artworkURL": "common/img/3ccebd87235f591c.jpg" }, { "name": "Gustav Battle", "musicId": 152, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/f63fab30a7b6f160.jpg" }, { "name": "とーきょー全域★アキハバラ？", "musicId": 104, "level": 12, "constant": 12.5, "artworkURL": "common/img/ff945c9cb9e43e83.jpg" }, { "name": "名も無い鳥", "musicId": 62, "level": 12, "constant": 12.4, "artworkURL": "common/img/9386971505bb20b0.jpg" }, { "name": "宛城、炎上！！", "musicId": 106, "level": 12, "constant": 12.2, "isExpert": true, "artworkURL": "common/img/8219519cc94d5524.jpg" }, { "name": "後夜祭", "musicId": 276, "level": 12, "constant": 12.3, "artworkURL": "common/img/82105b37d18450b6.jpg" }, { "name": "Tuning Rangers", "musicId": 102, "level": 12, "constant": 12.5, "artworkURL": "common/img/7fc6ae1b488b88de.jpg" }, { "name": "明るい未来", "musicId": 66, "level": 12, "constant": 12.3, "artworkURL": "common/img/c22702914849a11a.jpg" }, { "name": "Schrecklicher Aufstand", "musicId": 248, "level": 12, "constant": 12.5, "isExpert": true, "artworkURL": "common/img/a2fdef9e4b278a51.jpg" }, { "name": "ロボットプラネットユートピア", "musicId": 261, "level": 12, "constant": 12.3, "artworkURL": "common/img/6e917606db3c5a0e.jpg" }, { "name": "Hyperion", "musicId": 230, "level": 12, "constant": 12.5, "artworkURL": "common/img/b59d2b2ab877a77d.jpg" }, { "name": "紅華刑", "musicId": 229, "level": 12, "constant": 12, "isExpert": true, "artworkURL": "common/img/73f86aec8d6c7c9b.jpg" }, { "name": "サウンドプレイヤー", "musicId": 218, "level": 12, "constant": 12.4, "artworkURL": "common/img/20359304f5e0574a.jpg" }, { "name": "D.E.A.D.L.Y.", "musicId": 260, "level": 12, "constant": 12.4, "artworkURL": "common/img/03f1dafe3b08607e.jpg" }, { "name": "ウソラセラ", "musicId": 289, "level": 12, "constant": 12.6, "artworkURL": "common/img/0cece587cced4d3f.jpg" }, { "name": "最愛テトラグラマトン", "musicId": 399, "level": 12, "constant": 12.6, "artworkURL": "common/img/854cf33a2b30f004.jpg" }, { "name": "響", "musicId": 295, "level": 12, "constant": 12, "artworkURL": "common/img/988d8172dbe8b42b.jpg" }, { "name": "Devastating Blaster", "musicId": 234, "level": 12, "constant": 12.2, "isExpert": true, "artworkURL": "common/img/9af4b336821cdcc9.jpg" }, { "name": "光線チューニング", "musicId": 432, "level": 12, "constant": 12.3, "artworkURL": "common/img/94ae59f2fd71e5bd.jpg" }, { "name": "哀しみ集め", "musicId": 439, "level": 12, "constant": 12, "artworkURL": "common/img/3c283d55b0bb5031.jpg" }, { "name": "PinqPiq", "musicId": 436, "level": 12, "constant": 12.5, "artworkURL": "common/img/71abc84583b47b72.jpg" }, { "name": "WE GOTTA SOUL", "musicId": 438, "level": 12, "constant": 12.2, "artworkURL": "common/img/f3a23e078d6d8b31.jpg" }, { "name": "Kattobi KEIKYU Rider", "musicId": 441, "level": 12, "constant": 12.5, "isExpert": true, "artworkURL": "common/img/3c1bda8d023fc1fe.jpg" }, { "name": "Glorious Crown (tpz over-Over-OVERCUTE REMIX)", "musicId": 442, "level": 12, "constant": 12.6, "isExpert": true, "artworkURL": "common/img/9d70c048e64fe761.jpg" }, { "name": "Wake up Dreamer", "musicId": 463, "level": 12, "constant": 12.6, "isExpert": false, "artworkURL": "common/img/739a0be5221d5ea6.jpg" }, { "name": "La Baguette Magique", "musicId": 489, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/0f095bacfbc06a04.jpg" }, { "name": "Rendezvous", "musicId": 493, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/00805fbd8e66ff85.jpg" }, { "name": "The Darkness of Valhalla", "musicId": 491, "level": 12, "constant": 12.5, "isExpert": false, "artworkURL": "common/img/ff25671c3fc448b7.jpg" }, { "name": "はちみつアドベンチャー", "musicId": 567, "level": 12, "constant": 12.4, "isExpert": false, "artworkURL": "common/img/febb13e55d6bfe84.jpg" }, { "artworkURL": "common/img/7fd5e7384fbf048b.jpg", "name": "NYAN-NYA, More! ラブシャイン、Chu♥", "musicId": 590, "level": 12, "constant": 12.6, "isExpert": false }, { "artworkURL": "common/img/6c8ed453284cf0f0.jpg", "name": "ラブって♡ジュエリー♪えんじぇる☆ブレイク！！", "musicId": 585, "level": 12, "constant": 12.7, "isExpert": false }, { "name": "FEEL×ALIVE", "musicId": 350, "level": 12, "constant": 12.7, "artworkURL": "common/img/44c1e56a88c144c3.jpg" }, { "name": "ぶぉん！ぶぉん！らいど・おん！", "musicId": 351, "level": 12, "constant": 12.9, "artworkURL": "common/img/fb91e08c99009fd4.jpg" }, { "name": "MY LIBERATION", "musicId": 410, "level": 12, "constant": 12.7, "artworkURL": "common/img/cbfb4c6a58342201.jpg" }, { "name": "SAVIOR OF SONG", "musicId": 154, "level": 12, "constant": 12.8, "artworkURL": "common/img/2e9fdbbc15ade5cb.jpg" }, { "name": "ドーナツホール", "musicId": 24, "level": 12, "constant": 12.7, "isExpert": false, "artworkURL": "common/img/7b12d66ee6250e26.jpg" }, { "name": "パーフェクト生命", "musicId": 447, "level": 12, "constant": 12.7, "isExpert": false, "artworkURL": "common/img/7b12d66ee6250e26.jpg" }, { "artworkURL": "common/img/00036c05e76bc740.jpg", "name": "ゴーストルール", "musicId": 594, "level": 12, "constant": 12.7, "isExpert": false }, { "name": "アンハッピーリフレイン", "musicId": 371, "level": 12, "constant": 12.7, "artworkURL": "common/img/ad2ef043b1bd490f.jpg" }, { "name": "おこちゃま戦争", "musicId": 368, "level": 12, "constant": 12.8, "artworkURL": "common/img/8b14785409866748.jpg" }, { "name": "人生リセットボタン", "musicId": 294, "level": 12, "constant": 12.8, "artworkURL": "common/img/c63005195d15922e.jpg" }, { "name": "鬼KYOKAN", "musicId": 271, "level": 12, "constant": 12.8, "artworkURL": "common/img/99b79d4bd74e476c.jpg" }, { "name": "幸せになれる隠しコマンドがあるらしい", "musicId": 284, "level": 12, "constant": 12.7, "artworkURL": "common/img/16b25dc6eb7765aa.jpg" }, { "name": "チルドレンレコード", "musicId": 131, "level": 12, "constant": 12.7, "artworkURL": "common/img/38d3c5a5a45c6d07.jpg" }, { "name": "Mr. Wonderland", "musicId": 222, "level": 12, "constant": 12.9, "artworkURL": "common/img/ad33a423c865bed1.jpg" }, { "name": "ぼくらの16bit戦争", "musicId": 165, "level": 12, "constant": 12.8, "artworkURL": "common/img/1e85c4b6775c84b0.jpg" }, { "name": "脳漿炸裂ガール", "musicId": 167, "level": 12, "constant": 12.7, "artworkURL": "common/img/24611f2e2374e6a8.jpg" }, { "name": "ギガンティックO.T.N", "musicId": 157, "level": 12, "constant": 12.9, "artworkURL": "common/img/573109ca9050f55d.jpg" }, { "name": "風に乗せた願い", "musicId": 458, "level": 12, "constant": 12.8, "isExpert": false, "artworkURL": "common/img/37bc426ab6202a21.jpg" }, { "name": "ケロ⑨destiny", "musicId": 456, "level": 12, "constant": 12.7, "isExpert": false, "artworkURL": "common/img/a94a8587de9c33ae.jpg" }, { "name": "チルノのパーフェクトさんすう教室　⑨周年バージョン", "musicId": 528, "level": 12, "constant": 12.9, "isExpert": false, "artworkURL": "common/img/4007b85944069e1e.jpg" }, { "name": "taboo tears you up", "musicId": 20, "level": 12, "constant": 12.8, "artworkURL": "common/img/e2a1c87c96de9837.jpg" }, { "name": "ひれ伏せ愚民どもっ！", "musicId": 189, "level": 12, "constant": 12.7, "artworkURL": "common/img/9310d07b7e02e73a.jpg" }, { "name": "東方妖々夢 ～the maximum moving about～", "musicId": 121, "level": 12, "constant": 12.7, "artworkURL": "common/img/4196f71ce51620a0.jpg" }, { "name": "少女幻葬戦慄曲　～　Necro Fantasia", "musicId": 122, "level": 12, "constant": 12.7, "artworkURL": "common/img/67418ba28151c3ff.jpg" }, { "name": "Jimang Shot", "musicId": 177, "level": 12, "constant": 12.7, "artworkURL": "common/img/6e7843f9d831b0ac.jpg" }, { "name": "四次元跳躍機関", "musicId": 120, "level": 12, "constant": 12.7, "artworkURL": "common/img/a84a31e562efd7a0.jpg" }, { "name": "神威", "musicId": 386, "level": 12, "constant": 12.7, "isExpert": true, "artworkURL": "common/img/8205ea9449f1b000.jpg" }, { "name": "The Formula", "musicId": 128, "level": 12, "constant": 12.7, "artworkURL": "common/img/7edc6879319accfd.jpg" }, { "name": "SAMBISTA", "musicId": 208, "level": 12, "constant": 12.7, "artworkURL": "common/img/5bab1a38b98d59b5.jpg" }, { "name": "Say A Vengeance", "musicId": 319, "level": 12, "constant": 12.7, "artworkURL": "common/img/e9eeb98572b140bc.jpg" }, { "name": "JULIAN", "musicId": 327, "level": 12, "constant": 12.7, "artworkURL": "common/img/17c363c1fd2fa7d1.jpg" }, { "name": "Bang Babang Bang!!!", "musicId": 268, "level": 12, "constant": 12.8, "artworkURL": "common/img/e52af2b93636ccea.jpg" }, { "name": "-OutsideR:RequieM-", "musicId": 487, "level": 12, "constant": 12.7, "isExpert": false, "artworkURL": "common/img/9eaf70f8e0d067ae.jpg" }, { "name": "奏者はただ背中と提琴で語るのみ", "musicId": 468, "level": 12, "constant": 12.9, "isExpert": false, "artworkURL": "common/img/cb7fd6bf3b6af48d.jpg" }, { "name": "なるとなぎのパーフェクトロックンロール教室", "musicId": 246, "level": 12, "constant": 12.8, "artworkURL": "common/img/d445e4878a818d8b.jpg" }, { "artworkURL": "common/img/492f35b05bc1c4ea.jpg", "name": "The wheel to the Night ～インド人が夢に!?～", "musicId": 413, "level": 12, "constant": 12.9, "isExpert": false }, { "name": "My First Phone", "musicId": 51, "level": 12, "constant": 12.8, "artworkURL": "common/img/161f13a787a00032.jpg" }, { "name": "今ぞ♡崇め奉れ☆オマエらよ！！～姫の秘メタル渇望～", "musicId": 64, "level": 12, "constant": 12.8, "artworkURL": "common/img/6bf934fede23724d.jpg" }, { "name": "怒槌", "musicId": 180, "level": 12, "constant": 12.7, "isExpert": true, "artworkURL": "common/img/a732d43fd2a11e8f.jpg" }, { "name": "stella=steLLa", "musicId": 178, "level": 12, "constant": 12.7, "artworkURL": "common/img/9f281db3bcc9353b.jpg" }, { "name": "SNIPE WHOLE", "musicId": 205, "level": 12, "constant": 12.7, "artworkURL": "common/img/3d7803669dd3fcb9.jpg" }, { "name": "MUSIC PЯAYER", "musicId": 73, "level": 12, "constant": 12.7, "artworkURL": "common/img/0c2791f737ce1ff2.jpg" }, { "name": "ケモノガル", "musicId": 77, "level": 12, "constant": 12.8, "artworkURL": "common/img/01fc7f761272bfb4.jpg" }, { "name": "Paqqin", "musicId": 307, "level": 12, "constant": 12.7, "artworkURL": "common/img/ff9f70c8c0d9f24e.jpg" }, { "name": "玩具狂奏曲 -終焉-", "musicId": 219, "level": 12, "constant": 12.7, "isExpert": true, "artworkURL": "common/img/246f63902c4b0f89.jpg" }, { "name": "札付きのワル　～マイケルのうた～", "musicId": 256, "level": 12, "constant": 12.7, "artworkURL": "common/img/755fb1e2b79ba896.jpg" }, { "name": "ゲシュタルト！テスト期間！！", "musicId": 266, "level": 12, "constant": 12.7, "artworkURL": "common/img/7e82a95c4bfa983a.jpg" }, { "name": "ドライヴ・オン・ザ・レインボー", "musicId": 249, "level": 12, "constant": 12.7, "artworkURL": "common/img/1a532b709f9834b6.jpg" }, { "name": "TiamaT:F minor", "musicId": 258, "level": 12, "constant": 12.8, "isExpert": true, "artworkURL": "common/img/f04c37ecd99f1d8c.jpg" }, { "name": "キラメケ→Shoot it Now!", "musicId": 440, "level": 12, "constant": 12.9, "artworkURL": "common/img/deb8448e3b6a2705.jpg" }, { "name": "World Vanquisher", "musicId": 464, "level": 12, "constant": 12.7, "isExpert": true, "artworkURL": "common/img/6071c5b99b25daef.jpg" }, { "name": "EXECUTOR", "musicId": 494, "level": 12, "constant": 12.7, "isExpert": false, "artworkURL": "common/img/82aabb2c3712547e.jpg" }, { "name": "bubble attack", "musicId": 490, "level": 12, "constant": 12.9, "isExpert": false, "artworkURL": "common/img/6ce2b51a11a80101.jpg" }, { "name": "時の冒険者", "musicId": 492, "level": 12, "constant": 12.7, "isExpert": false, "artworkURL": "common/img/00a56fe494c51916.jpg" }, { "name": "Pastel Party", "musicId": 566, "level": 12, "constant": 12.9, "isExpert": false, "artworkURL": "common/img/3adf038d6baddc7b.jpg" }, { "artworkURL": "common/img/e930de2a78bbc4df.jpg", "name": "サンシャインサマー☆夏期講習", "musicId": 589, "level": 12, "constant": 12.9, "isExpert": false }, { "name": "ぶいえす!!らいばる!!", "musicId": 312, "level": 13, "constant": 13.2, "artworkURL": "common/img/81805f2ef1e58db8.jpg" }, { "name": "ジングルベル", "musicId": 159, "level": 13, "constant": 13.3, "artworkURL": "common/img/d5a47266b4fe0bfe.jpg" }, { "artworkURL": "common/img/ead0c860ee74d442.jpg", "name": "頓珍漢の宴", "musicId": 595, "level": 13, "constant": 13, "isExpert": false }, { "name": "拝啓ドッペルゲンガー", "musicId": 547, "level": 13, "constant": 13, "isExpert": false, "artworkURL": "common/img/3d2001708e842900.jpg" }, { "name": "のぼれ！すすめ！高い塔", "musicId": 448, "level": 13, "constant": 13.3, "isExpert": false, "artworkURL": "common/img/638c42b31d057e48.jpg" }, { "name": "害虫", "musicId": 449, "level": 13, "constant": 13.2, "isExpert": false, "artworkURL": "common/img/fae01ef5de4069ac.jpg" }, { "name": "インビジブル", "musicId": 293, "level": 13, "constant": 13.2, "artworkURL": "common/img/c58227eb0d14938c.jpg" }, { "name": "ラクガキスト", "musicId": 281, "level": 13, "constant": 13.4, "artworkURL": "common/img/330e57eeeb0fb2cd.jpg" }, { "name": "初音ミクの消失", "musicId": 7, "level": 13, "constant": 13.4, "artworkURL": "common/img/b602913a68fca621.jpg" }, { "name": "カミサマネジマキ", "musicId": 223, "level": 13, "constant": 13, "artworkURL": "common/img/8ec9a26e11ec1a40.jpg" }, { "name": "きゅうりバーにダイブ", "musicId": 637, "level": 13, "constant": 13.3, "isExpert": false, "artworkURL": "common/img/ba8c56cb9054ebfd.jpg" }, { "name": "サドマミホリック", "musicId": 628, "level": 13, "constant": 13.3, "isExpert": false, "artworkURL": "common/img/a8b5fbd39806859f.jpg" }, { "name": "Phantasm Brigade", "musicId": 194, "level": 13, "constant": 13, "artworkURL": "common/img/d483d1ca2a5e10ff.jpg" }, { "name": "患部で止まってすぐ溶ける～狂気の優曇華院", "musicId": 187, "level": 13, "constant": 13.1, "artworkURL": "common/img/e6642a96885723c1.jpg" }, { "name": "Imperishable Night 2006 (2016 Refine)", "musicId": 322, "level": 13, "constant": 13.6, "artworkURL": "common/img/8b145fe4cf0c01bb.jpg" }, { "name": "幻想のサテライト", "musicId": 305, "level": 13, "constant": 13.1, "artworkURL": "common/img/266bd38219201fa1.jpg" }, { "name": "最終鬼畜妹・一部声", "musicId": 92, "level": 13, "constant": 13, "artworkURL": "common/img/17315fb464f265bd.jpg" }, { "name": "Elemental Creation", "musicId": 232, "level": 13, "constant": 13.5, "artworkURL": "common/img/a2069fdb9d860d36.jpg" }, { "name": "Evans", "musicId": 385, "level": 13, "constant": 13.4, "artworkURL": "common/img/82c76a871596142c.jpg" }, { "name": "Blue Noise", "musicId": 33, "level": 13, "constant": 13.1, "artworkURL": "common/img/fddc37caee47286d.jpg" }, { "name": "セイクリッド　ルイン", "musicId": 470, "level": 13, "constant": 13.5, "isExpert": false, "artworkURL": "common/img/8205b2bb79af3a09.jpg" }, { "name": "極圏", "musicId": 471, "level": 13, "constant": 13.6, "isExpert": false, "artworkURL": "common/img/29b703cb5312a4eb.jpg" }, { "name": "Scarlet Lance", "musicId": 472, "level": 13, "constant": 13.6, "isExpert": false, "artworkURL": "common/img/62134ad35e35ea72.jpg" }, { "name": "Aragami", "musicId": 144, "level": 13, "constant": 13.5, "artworkURL": "common/img/8b04b9ad2d49850c.jpg" }, { "name": "Vallista", "musicId": 135, "level": 13, "constant": 13.5, "artworkURL": "common/img/e7ee14d9fe63d072.jpg" }, { "name": "conflict", "musicId": 138, "level": 13, "constant": 13.2, "artworkURL": "common/img/478e8835e382f740.jpg" }, { "name": "Halcyon", "musicId": 173, "level": 13, "constant": 13.3, "artworkURL": "common/img/2e95529be9118a11.jpg" }, { "name": "Jack-the-Ripper◆", "musicId": 197, "level": 13, "constant": 13.1, "artworkURL": "common/img/ae6d3a8806e09613.jpg" }, { "name": "DRAGONLADY", "musicId": 19, "level": 13, "constant": 13.2, "artworkURL": "common/img/0b98b8b4e7cfd997.jpg" }, { "name": "Air", "musicId": 317, "level": 13, "constant": 13.4, "artworkURL": "common/img/db15d5b7aefaa672.jpg" }, { "name": "DataErr0r", "musicId": 318, "level": 13, "constant": 13, "artworkURL": "common/img/f803d578eb4047eb.jpg" }, { "name": "Dreadnought", "musicId": 323, "level": 13, "constant": 13.6, "artworkURL": "common/img/282cb1cacd4c1bb4.jpg" }, { "name": "Strahv", "musicId": 302, "level": 13, "constant": 13.3, "artworkURL": "common/img/13446730e8b99f0e.jpg" }, { "name": "GOODTEK", "musicId": 388, "level": 13, "constant": 13.3, "artworkURL": "common/img/14edd93cf813cdc2.jpg" }, { "name": "Name of oath", "musicId": 389, "level": 13, "constant": 13.5, "artworkURL": "common/img/f7be4abcf8f3e197.jpg" }, { "name": "G e n g a o z o", "musicId": 506, "level": 13, "constant": 13.6, "isExpert": false, "artworkURL": "common/img/46cd4867e5a494e8.jpg" }, { "name": "AVALON", "musicId": 198, "level": 13, "constant": 13.5, "isExpert": false, "artworkURL": "common/img/9d68467c72426ff7.jpg" }, { "artworkURL": "common/img/9a2d0a0022dfb29b.jpg", "name": "管弦楽組曲 第3番 ニ長調「第2曲（G線上のアリア）」BWV.1068-2", "musicId": 600, "level": 13, "constant": 13.5, "isExpert": false }, { "name": "分からない", "musicId": 405, "level": 13, "constant": 13.2, "artworkURL": "common/img/b91503d46e39a754.jpg" }, { "name": "Like the Wind [Reborn]", "musicId": 397, "level": 13, "constant": 13.5, "artworkURL": "common/img/3e545c372b926197.jpg" }, { "name": "Hyper Active", "musicId": 496, "level": 13, "constant": 13.3, "isExpert": false, "artworkURL": "common/img/cce1020b52a5184a.jpg" }, { "name": "GEMINI -C-", "musicId": 202, "level": 13, "constant": 13.1, "artworkURL": "common/img/45112e2818cf80a2.jpg" }, { "name": "We Gonna Journey", "musicId": 107, "level": 13, "constant": 13.1, "artworkURL": "common/img/b43fef626f5b88cd.jpg" }, { "name": "luna blu", "musicId": 76, "level": 13, "constant": 13.5, "artworkURL": "common/img/93abb77776c70b47.jpg" }, { "name": "閃鋼のブリューナク", "musicId": 141, "level": 13, "constant": 13.5, "artworkURL": "common/img/2e6c11edba79d997.jpg" }, { "name": "Gate of Fate", "musicId": 63, "level": 13, "constant": 13.4, "artworkURL": "common/img/2df15f390356067f.jpg" }, { "name": "The wheel to the right", "musicId": 69, "level": 13, "constant": 13.4, "artworkURL": "common/img/c2c4ece2034eb620.jpg" }, { "name": "Tango Rouge", "musicId": 101, "level": 13, "constant": 13, "artworkURL": "common/img/81e347d3b96b2ae1.jpg" }, { "name": "Gustav Battle", "musicId": 152, "level": 13, "constant": 13, "artworkURL": "common/img/f63fab30a7b6f160.jpg" }, { "name": "Cyberozar", "musicId": 52, "level": 13, "constant": 13.2, "artworkURL": "common/img/a62f975edc860e34.jpg" }, { "name": "Genesis", "musicId": 72, "level": 13, "constant": 13.5, "artworkURL": "common/img/ec3a366b4724f8f6.jpg" }, { "name": "L'épisode", "musicId": 90, "level": 13, "constant": 13.5, "artworkURL": "common/img/19d57f9a7652308a.jpg" }, { "name": "GOLDEN RULE", "musicId": 61, "level": 13, "constant": 13.6, "artworkURL": "common/img/2ccf97477eaf45ad.jpg" }, { "name": "Philosopher", "musicId": 250, "level": 13, "constant": 13.5, "artworkURL": "common/img/989f4458fb34aa9d.jpg" }, { "name": "Oshama Scramble! (Cranky Remix)", "musicId": 259, "level": 13, "constant": 13, "artworkURL": "common/img/4d66e5d1669d79a2.jpg" }, { "name": "紅華刑", "musicId": 229, "level": 13, "constant": 13.4, "artworkURL": "common/img/73f86aec8d6c7c9b.jpg" }, { "name": "Tidal Wave", "musicId": 262, "level": 13, "constant": 13.5, "artworkURL": "common/img/676e59847912f5ca.jpg" }, { "name": "BOKUTO", "musicId": 257, "level": 13, "constant": 13, "artworkURL": "common/img/bef9b79c637bf4c9.jpg" }, { "name": "We Gonna Party -Feline Groove Mix-", "musicId": 414, "level": 13, "constant": 13.3, "artworkURL": "common/img/cd2aebc19c4fa1cd.jpg" }, { "name": "おまかせ！！トラブルメイ娘☆とれびちゃん", "musicId": 341, "level": 13, "constant": 13.1, "artworkURL": "common/img/fc1cec7d2aeb6ca1.jpg" }, { "name": "オススメ☆♂♀☆でぃすとぴあ", "musicId": 342, "level": 13, "constant": 13.4, "artworkURL": "common/img/6905b5ce0d115340.jpg" }, { "name": "Warcry", "musicId": 253, "level": 13, "constant": 13.1, "artworkURL": "common/img/a2f5cd53acbfc981.jpg" }, { "name": "覚醒楽奏メタフィクション", "musicId": 310, "level": 13, "constant": 13.3, "artworkURL": "common/img/ae93bd84b68781f6.jpg" }, { "name": "Supersonic Generation", "musicId": 335, "level": 13, "constant": 13.4, "artworkURL": "common/img/3c61434b8cb2aadf.jpg" }, { "name": "混沌を越えし我らが神聖なる調律主を讃えよ", "musicId": 407, "level": 13, "constant": 13.2, "isExpert": true, "artworkURL": "common/img/a9b25545cd935cc9.jpg" }, { "name": "トリスメギストス", "musicId": 437, "level": 13, "constant": 13.2, "artworkURL": "common/img/4d043c46fa9f8adc.jpg" }, { "name": "立川浄穢捕物帳", "musicId": 433, "level": 13, "constant": 13, "artworkURL": "common/img/fe3f9913f056f5bc.jpg" }, { "name": "眠れぬ夜君を想フ", "musicId": 434, "level": 13, "constant": 13.3, "artworkURL": "common/img/f5c04b1858f3b79a.jpg" }, { "name": "JIGOKU STATION CENTRAL GATE", "musicId": 435, "level": 13, "constant": 13.3, "artworkURL": "common/img/1ab2b7720caa1c34.jpg" }, { "name": "Twice up Scenery", "musicId": 467, "level": 13, "constant": 13.2, "isExpert": false, "artworkURL": "common/img/460af44c6ba906ad.jpg" }, { "name": "BlazinG AIR", "musicId": 534, "level": 13, "constant": 13.3, "isExpert": false, "artworkURL": "common/img/e6864fa9727651ee.jpg" }, { "name": "Sparking Revolver", "musicId": 551, "level": 13, "constant": 13.5, "isExpert": false, "artworkURL": "common/img/e18b6ede661b48e7.jpg" }, { "name": "CHOCOLATE BOMB!!!!", "musicId": 568, "level": 13, "constant": 13.4, "isExpert": false, "artworkURL": "common/img/c0db3e4b98b3c871.jpg" }, { "name": "Twilight", "musicId": 569, "level": 13, "constant": 13.6, "isExpert": false, "artworkURL": "common/img/31c3a521fea72a26.jpg" }, { "name": "Calamity Fortune", "musicId": 504, "level": 13, "constant": 13.7, "artworkURL": "common/img/7f68ccfecfbf4fc6.jpg" }, { "name": "Finite", "musicId": 409, "level": 13, "constant": 13.8, "artworkURL": "common/img/19f776c8daa51095.jpg" }, { "name": "神威", "musicId": 386, "level": 13, "constant": 13.9, "artworkURL": "common/img/8205ea9449f1b000.jpg" }, { "name": "HAELEQUIN (Original Remaster)", "musicId": 134, "level": 13, "constant": 13.8, "artworkURL": "common/img/08a24ed249ed2eec.jpg" }, { "name": "FREEDOM DiVE", "musicId": 196, "level": 13, "constant": 13.7, "artworkURL": "common/img/ed40032f25177518.jpg" }, { "name": "Angel dust", "musicId": 137, "level": 13, "constant": 13.7, "artworkURL": "common/img/13a5a9ca35a9b71b.jpg" }, { "name": "★LittlE HearTs★", "musicId": 328, "level": 13, "constant": 13.8, "artworkURL": "common/img/c7cf3ce1e858e3f0.jpg" }, { "name": "Dengeki Tube", "musicId": 393, "level": 13, "constant": 13.8, "artworkURL": "common/img/de02f8c0217d9baa.jpg" }, { "name": "Doppelganger", "musicId": 548, "level": 13, "constant": 13.8, "isExpert": false, "artworkURL": "common/img/acda9dc8dc61f6ba.jpg" }, { "name": "Garakuta Doll Play", "musicId": 226, "level": 13, "constant": 13.8, "artworkURL": "common/img/993b5cddb9d9badf.jpg" }, { "name": "AMAZING MIGHTYYYY!!!!", "musicId": 538, "level": 13, "constant": 13.8, "artworkURL": "common/img/e03858fb5d391628.jpg" }, { "name": "VERTeX", "musicId": 486, "level": 13, "constant": 13.8, "isExpert": false, "artworkURL": "common/img/11e18cb195118151.jpg" }, { "name": "Caliburne ～Story of the Legendary sword～", "musicId": 499, "level": 13, "constant": 13.9, "isExpert": false, "artworkURL": "common/img/4d9c1d8238fd9858.jpg" }, { "name": "ねぇ、壊れタ人形ハ何処へ棄テらレるノ？", "musicId": 570, "level": 13, "constant": 13.8, "isExpert": false, "artworkURL": "common/img/345ff2c66d2cee6c.jpg" }, { "name": "Contrapasso -inferno-", "musicId": 201, "level": 13, "constant": 13.9, "artworkURL": "common/img/a251c24a3cc4dbf7.jpg" }, { "name": "Xevel", "musicId": 469, "level": 13, "constant": 13.9, "isExpert": false, "artworkURL": "common/img/bf7110e73e088609.jpg" }, { "name": "otorii INNOVATED -[i]3-", "musicId": 559, "level": 13, "constant": 13.9, "isExpert": false, "artworkURL": "common/img/98f14a4886cbe7cf.jpg" }, { "name": "エンドマークに希望と涙を添えて", "musicId": 103, "level": 13, "constant": 13.7, "artworkURL": "common/img/3210d321c2700a57.jpg" }, { "name": "宛城、炎上！！", "musicId": 106, "level": 13, "constant": 13.8, "artworkURL": "common/img/8219519cc94d5524.jpg" }, { "name": "Schrecklicher Aufstand", "musicId": 248, "level": 13, "constant": 13.9, "artworkURL": "common/img/a2fdef9e4b278a51.jpg" }, { "name": "Devastating Blaster", "musicId": 234, "level": 13, "constant": 13.9, "artworkURL": "common/img/9af4b336821cdcc9.jpg" }, { "name": "Kattobi KEIKYU Rider", "musicId": 441, "level": 13, "constant": 13.8, "artworkURL": "common/img/3c1bda8d023fc1fe.jpg" }, { "name": "Glorious Crown (tpz over-Over-OVERCUTE REMIX)", "musicId": 442, "level": 13, "constant": 13.9, "isExpert": false, "artworkURL": "common/img/9d70c048e64fe761.jpg" }, { "name": "Iudicium", "musicId": 466, "level": 13, "constant": 13.7, "isExpert": false, "artworkURL": "common/img/167791d19a6a7957.jpg" }, { "name": "Gate of Doom", "musicId": 552, "level": 13, "constant": 13.8, "isExpert": false, "artworkURL": "common/img/a087d11d9ac3d044.jpg" }, { "name": "怒槌", "musicId": 180, "level": 14, "constant": 14, "artworkURL": "common/img/a732d43fd2a11e8f.jpg" }, { "name": "玩具狂奏曲 -終焉-", "musicId": 219, "level": 14, "constant": 14, "artworkURL": "common/img/246f63902c4b0f89.jpg" }, { "name": "TiamaT:F minor", "musicId": 258, "level": 14, "constant": 14, "artworkURL": "common/img/f04c37ecd99f1d8c.jpg" }, { "name": "混沌を越えし我らが神聖なる調律主を讃えよ", "musicId": 407, "level": 14, "constant": 14.1, "artworkURL": "common/img/a9b25545cd935cc9.jpg" }, { "name": "World Vanquisher", "musicId": 464, "level": 14, "constant": 14.1, "isExpert": false, "artworkURL": "common/img/6071c5b99b25daef.jpg" }];
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    var OverPower;
    (function (OverPower) {
        function showHigherLevelsOP(lv = 14, isPlus = false) {
            if (lv == 12)
                return;
            showLevelOP(lv, isPlus, () => {
                isPlus ? showHigherLevelsOP(lv, false) : showHigherLevelsOP(lv - 1, true);
            });
        }
        OverPower.showHigherLevelsOP = showHigherLevelsOP;
        function showLevelOP(lv, isPlus, callback) {
            calcLevelOP(lv, isPlus, (op, max) => {
                let trunOp = Math.floor(op * 100.0) / 100.0;
                let trunMax = Math.floor(max * 100.0) / 100.0;
                let trunPercentage = Math.floor(op / max * 10000) / 100.0;
                let opElm = $("<div>")
                    .css("color", "white")
                    .css("padding", "5px")
                    .css("backgroundColor", "#f4048b")
                    .html(`Lv${lv}${isPlus ? "+" : ""} OP: <strong>${trunOp.toFixed(2)}/${trunMax.toFixed(2)} ${trunPercentage}%</strong>`);
                $("#main_menu").append(opElm);
                callback();
            });
        }
        OverPower.showLevelOP = showLevelOP;
        // 未解禁曲含めて計算するので注意
        function calcLevelOP(lv, isPlus, callback) {
            Kattobi.Machine.getMusicsLevel(lv, (records) => {
                let [op, max] = records.reduce((prev, record) => {
                    let track = Kattobi.MUSIC_DATA.find(t => t.musicId == record.musicId && t.level == record.level);
                    if (track === undefined)
                        console.log(record.name, lv);
                    let fraction = parseFloat("0." + String(track.constant).split(".")[1] || "0");
                    if ((isPlus && fraction >= 0.7) || (!isPlus && fraction <= 0.6)) {
                        if (record.scoreMax === undefined) {
                            return [prev[0], prev[1] + calcMaxOP(track.constant)];
                        }
                        return [prev[0] + calcSongOP(track.constant, record), prev[1] + calcMaxOP(track.constant)];
                    }
                    return prev;
                }, [0, 0]);
                callback(op, max);
            });
        }
        OverPower.calcLevelOP = calcLevelOP;
        function calcSongOP(constant, record) {
            let op = constant;
            if (record.scoreMax == 1010000) {
                op += 0.25;
            }
            else if (record.isAJ) {
                op += 0.2;
            }
            else if (record.isFC) {
                op += 0.1;
            }
            switch (record.rank) {
                case 10: // SSS
                    op += 2;
                    op += 0.75 * (record.scoreMax - 1007500) / 2500;
                    break;
                case 9:
                    if (record.scoreMax >= 1005000) { // SS+
                        op += 1.5;
                        op += 0.5 * (record.scoreMax - 1005000) / 2500;
                    }
                    else { // SS
                        op += 1;
                        op += 0.5 * (record.scoreMax - 1000000) / 5000;
                    }
                    break;
                case 8:
                case 7:
                case 6:
                case 5: // S ~ A
                    op += 1 * (record.scoreMax - 975000) / 25000;
                    break;
                default:
                    op = 0;
                    break;
            }
            console.log(op * 5, constant, record.name);
            return op * 5;
        }
        OverPower.calcSongOP = calcSongOP;
        function calcMaxOP(constant) {
            return (constant + 3) * 5;
        }
        OverPower.calcMaxOP = calcMaxOP;
    })(OverPower = Kattobi.OverPower || (Kattobi.OverPower = {}));
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    Kattobi.WE_DATA = [{ "artworkURL": "common/img/a6d3cbf22648dedf.jpg", "name": "ウソラセラ", "musicId": 8121, "starDifficulty": 9, "type": 5 }, { "artworkURL": "common/img/6082e8215208f71b.jpg", "name": "青春サイダー", "musicId": 8117, "starDifficulty": 5, "type": 15 }, { "artworkURL": "common/img/9525bcf3c4d657e5.jpg", "name": "悪戯", "musicId": 8118, "starDifficulty": 7, "type": 19 }, { "artworkURL": "common/img/f43640795fa6da29.jpg", "name": "adrenaline!!!", "musicId": 8119, "starDifficulty": 5, "type": 11 }, { "artworkURL": "common/img/e870b98b02169e63.jpg", "name": "ロボットプラネットユートピア", "musicId": 8120, "starDifficulty": 5, "type": 8 }, { "artworkURL": "common/img/43bd6cbc31e4c02c.jpg", "name": "イロドリミドリ杯花映塚全一決定戦公式テーマソング『ウソテイ』", "musicId": 8116, "starDifficulty": 7, "type": 6 }, { "artworkURL": "common/img/b0a5e1fe1f91fdcf.jpg", "name": "MIRU key way", "musicId": 8111, "starDifficulty": 3, "type": 1 }, { "artworkURL": "common/img/1e4d6b98af8995d3.jpg", "name": "HAELEQUIN (Original Remaster)", "musicId": 8112, "starDifficulty": 7, "type": 5 }, { "artworkURL": "common/img/65ca7f3b439f7abc.jpg", "name": "Theme of SeelischTact", "musicId": 8113, "starDifficulty": 5, "type": 12 }, { "artworkURL": "common/img/2e0dc3f62fe9d07c.jpg", "name": "Glorious Crown (tpz over-Over-OVERCUTE REMIX)", "musicId": 8114, "starDifficulty": 7, "type": 11 }, { "artworkURL": "common/img/3de34b543415b698.jpg", "name": "若い力 -SEGA HARD GIRLS MIX-", "musicId": 8115, "starDifficulty": 7, "type": 9 }, { "artworkURL": "common/img/25060651b6218ce9.jpg", "name": "G e n g a o z o", "musicId": 8108, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/008619cf7d9ec3a5.jpg", "name": "玩具狂奏曲 -終焉-", "musicId": 8104, "starDifficulty": 9, "type": 27 }, { "artworkURL": "common/img/a7fac0de8422d5ee.jpg", "name": "その群青が愛しかったようだった", "musicId": 8105, "starDifficulty": 9, "type": 10 }, { "artworkURL": "common/img/669f156472f94a07.jpg", "name": "アウターサイエンス", "musicId": 8106, "starDifficulty": 5, "type": 11 }, { "artworkURL": "common/img/e580650b42d4e3a9.jpg", "name": "L'épisode", "musicId": 8107, "starDifficulty": 5, "type": 7 }, { "artworkURL": "common/img/ddb9be5d7658c02d.jpg", "name": "L9", "musicId": 8100, "starDifficulty": 7, "type": 27 }, { "artworkURL": "common/img/347f05302b4a7d5d.jpg", "name": "RevolutionGame", "musicId": 8101, "starDifficulty": 3, "type": 10 }, { "artworkURL": "common/img/b6a77872d3af39cf.jpg", "name": "taboo tears you up", "musicId": 8103, "starDifficulty": 9, "type": 28 }, { "artworkURL": "common/img/8abd044a69fbdbce.jpg", "name": "AMAZING MIGHTYYYY!!!!", "musicId": 8110, "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/b5d63208a5c6fb2c.jpg", "name": "elegante", "musicId": 8097, "starDifficulty": 5, "type": 10 }, { "artworkURL": "common/img/96c9c984f310d558.jpg", "name": "今ぞ♡崇め奉れ☆オマエらよ！！～姫の秘メタル渇望～", "musicId": 8098, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/633dec0d242d44ee.jpg", "name": "Tidal Wave", "musicId": 8099, "starDifficulty": 5, "type": 20 }, { "artworkURL": "common/img/6287164e1401ed99.jpg", "name": "STAR", "musicId": 8092, "starDifficulty": 7, "type": 9 }, { "artworkURL": "common/img/74bb39c1c5bf4690.jpg", "name": "Star☆Glitter", "musicId": 8093, "starDifficulty": 5, "type": 1 }, { "artworkURL": "common/img/31134fdf6cbb6e36.jpg", "name": "Starlight Dance Floor", "musicId": 8094, "starDifficulty": 3, "type": 28 }, { "artworkURL": "common/img/3348ec734f33c909.jpg", "name": "ひだまりデイズ", "musicId": 8095, "starDifficulty": 5, "type": 27 }, { "artworkURL": "common/img/334aeafa3b96de60.jpg", "name": "Dengeki Tube", "musicId": 8089, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/dc57afae3307e09f.jpg", "name": "Schrecklicher Aufstand", "musicId": 8080, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/6ce11469fafb79ad.jpg", "name": "Air", "musicId": 8087, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/f780e214c57543e0.jpg", "name": "神威", "musicId": 8082, "starDifficulty": 9, "type": 1 }, { "artworkURL": "common/img/82bee9dfce16e9fb.jpg", "name": "だんだん早くなる", "musicId": 8084, "starDifficulty": 1, "type": 8 }, { "artworkURL": "common/img/bb85e616b4d88fa6.jpg", "name": "エテルニタス・ルドロジー", "musicId": 8085, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/576301d1261c992d.jpg", "name": "Blue Noise", "musicId": 8086, "starDifficulty": 3, "type": 1 }, { "artworkURL": "common/img/b5570c700e7bbf75.jpg", "name": "檄!帝国華撃団", "musicId": 8081, "starDifficulty": 3, "type": 23 }, { "artworkURL": "common/img/061f9e33441b32cf.jpg", "name": "The wheel to the right", "musicId": 8079, "starDifficulty": 7, "type": 21 }, { "artworkURL": "common/img/a6889b8a729210be.jpg", "name": "あねぺったん", "musicId": 8078, "starDifficulty": 7, "type": 6 }, { "artworkURL": "common/img/0d16cf138fd9ef7b.jpg", "name": "Oshama Scramble! (Cranky Remix)", "musicId": 8091, "starDifficulty": 5, "type": 19 }, { "artworkURL": "common/img/d9674c63866d6cce.jpg", "name": "MUSIC PЯAYER", "musicId": 8074, "starDifficulty": 5, "type": 20 }, { "artworkURL": "common/img/d909dbffd6520902.jpg", "name": "Title", "musicId": 8090, "starDifficulty": 5, "type": 1 }, { "artworkURL": "common/img/ccd2deee3f1e5f16.jpg", "name": "★LittlE HearTs★", "musicId": 8069, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/c22377fa582134cb.jpg", "name": "Paqqin", "musicId": 8070, "starDifficulty": 5, "type": 3 }, { "artworkURL": "common/img/3aab4ea58851d73f.jpg", "name": "Gate of Fate", "musicId": 8072, "starDifficulty": 7, "type": 16 }, { "artworkURL": "common/img/eba6432f34a2df6a.jpg", "name": "Counselor", "musicId": 8063, "starDifficulty": 7, "type": 19 }, { "artworkURL": "common/img/aae4a50abd83560f.jpg", "name": "SAMBISTA", "musicId": 8064, "starDifficulty": 3, "type": 28 }, { "artworkURL": "common/img/2d476ed298982205.jpg", "name": "We Gonna Journey", "musicId": 8065, "starDifficulty": 5, "type": 28 }, { "artworkURL": "common/img/187a65abf20cfa4c.jpg", "name": "The ether", "musicId": 8066, "starDifficulty": 9, "type": 10 }, { "artworkURL": "common/img/0cfed5e962a10117.jpg", "name": "DRAGONLADY", "musicId": 8067, "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/18bb06dd0c680555.jpg", "name": "ジングルベル", "musicId": 8058, "starDifficulty": 7, "type": 12 }, { "artworkURL": "common/img/a2fc66bdebabc961.jpg", "name": "エンドマークに希望と涙を添えて", "musicId": 8059, "starDifficulty": 9, "type": 11 }, { "artworkURL": "common/img/8ee8eeb30163588f.jpg", "name": "Oshama Scramble!", "musicId": 8053, "starDifficulty": 5, "type": 4 }, { "artworkURL": "common/img/ec0e91be45f9e719.jpg", "name": "砂漠のハンティングガール♡", "musicId": 8057, "starDifficulty": 7, "type": 9 }, { "artworkURL": "common/img/1a830afff4c6894a.jpg", "name": "Alma", "musicId": 8048, "starDifficulty": 3, "type": 20 }, { "artworkURL": "common/img/664482b6c02bb903.jpg", "name": "チルノのパーフェクトさんすう教室", "musicId": 8049, "starDifficulty": 3, "type": 21 }, { "artworkURL": "common/img/824982fd305cf43a.jpg", "name": "回レ！雪月花", "musicId": 8051, "starDifficulty": 5, "type": 22 }, { "artworkURL": "common/img/6a409c7abf7d9dc4.jpg", "name": "Genesis", "musicId": 8043, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/049f3b70251fdb7f.jpg", "name": "Elemental Creation", "musicId": 8045, "starDifficulty": 5, "type": 22 }, { "artworkURL": "common/img/d9bbdad3fb44d260.jpg", "name": "いろは唄", "musicId": 8046, "starDifficulty": 3, "type": 23 }, { "artworkURL": "common/img/763b1886954be49d.jpg", "name": "Your Affection (Daisuke Asakura Remix)", "musicId": 8033, "starDifficulty": 1, "type": 21 }, { "artworkURL": "common/img/877573b3f8a206f9.jpg", "name": "一触即発☆禅ガール", "musicId": 8034, "starDifficulty": 3, "type": 21 }, { "artworkURL": "common/img/5cc569f26459117b.jpg", "name": "FREEDOM DiVE", "musicId": 8026, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/cbf397f330e040e5.jpg", "name": "B.B.K.K.B.K.K.", "musicId": 8020, "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/627b95ef3c728b37.jpg", "name": "ナイト・オブ・ナイツ", "musicId": 8008, "starDifficulty": 5, "type": 8 }, { "artworkURL": "common/img/9a8dae637c5172b2.jpg", "name": "elegante", "musicId": 8029, "starDifficulty": 3, "type": 5 }, { "artworkURL": "common/img/c1ff8df1757fedf4.jpg", "name": "Help me, あーりん！", "musicId": 8025, "starDifficulty": 5, "type": 6 }, { "artworkURL": "common/img/971c362a9b65209e.jpg", "name": "Garakuta Doll Play (sasakure.UK clutter remix)", "musicId": 8024, "starDifficulty": 7, "type": 4 }, { "artworkURL": "common/img/e4c034fc74ff62fc.jpg", "name": "幾四音-Ixion-", "musicId": 8000, "starDifficulty": 1, "type": 3 }];
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
        7: "半",
        12: "弾",
        13: "戻",
        15: "布",
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