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
        "#ff0000" // SSS
    ]; // rank縺ｮ謨ｰ蛟､縺ｫ蠢懊§縺ｦ繝槭�繧ｯ繧偵▽縺代ｋ(i=8縺郡, i=0縺轡)
    const COLOR_SSPLUS = "#136745";
    const COLOR_AJC = "#e51188";
    const COLOR_EXPERT = "#FF0262";
    const COLOR_FULLCHAIN = "#ff9c52";
    function generateFillTable(onlyMas) {
        let addCanv = () => {
            let canvas = setupCanvas();
            let ctx = canvas.getContext("2d");
            $("#main_menu").append(canvas);
            return [canvas, ctx];
        };
        Promise.resolve()
            .then(() => {
            return new Promise((resolve, reject) => {
                Kattobi.Machine.getMusicsLevel(11, data => {
                    let [canvas, ctx] = addCanv();
                    drawTable(canvas, ctx, 11, onlyMas, data);
                    resolve(data);
                });
            });
        })
            .then(data11 => {
            return new Promise((resolve, reject) => {
                Kattobi.Machine.getMusicsLevel(12, data => {
                    let [canvas, ctx] = addCanv();
                    drawTable(canvas, ctx, 12, onlyMas, data);
                    resolve(data);
                });
            });
        })
            .then(data12 => {
            return new Promise((resolve, reject) => {
                Kattobi.Machine.getMusicsLevel(13, data => {
                    resolve(data);
                });
            });
        })
            .then((data13) => {
            return new Promise((resolve, reject) => {
                Kattobi.Machine.getMusicsLevel(14, data => {
                    let [canvas, ctx] = addCanv();
                    drawTable(canvas, ctx, 13, onlyMas, data13.concat(data));
                });
            });
        });
    }
    Kattobi.generateFillTable = generateFillTable;
    function drawTable(canvas, ctx, diff, onlyMas, results) {
        drawInfo(ctx);
        let usedRow = 0; // 逕ｻ蜒上ｒ蜈･繧後◆讓ｪ縺ｮ陦後�謨ｰ
        let loadedImage = 0;
        const topMargin = 110;
        let allTracksCount = Kattobi.MUSIC_DATA.filter(function (t) {
            if (onlyMas && t.isExpert === true)
                return false;
            if (t.constant == 0.0)
                return false;
            if (diff == 13) {
                return t.level == 13 || t.level == 13.5 || t.level == 14;
            }
            return t.level == diff || t.level == diff + 0.5;
        }).length;
        for (let i = (diff == 13 ? 11 : 9); i >= 0; i--) {
            ctx.fillStyle = "#555";
            ctx.fillText((diff + i * 0.1).toString(10), 10, topMargin + usedRow * 60); // 荳翫↓margin 50, artwork縺ｯ60x60px
            let tracks = Kattobi.MUSIC_DATA.filter(t => { return t.constant === diff + i * 0.1 && (!onlyMas || t.isExpert === undefined); });
            for (let k in tracks) {
                let track = tracks[parseInt(k)];
                let artwork = new Image();
                // 60 * (i % 10): artwork繧定｡ｨ遉ｺ縲�60 + 縺ｯ繝槭�繧ｸ繝ｳ
                // usedRow * 60 縺ｧ縺吶〒縺ｫ菴ｿ繧上ｌ縺溯｡後°繧峨√＆繧峨↓10譖ｲ縺ｧ謾ｹ陦�
                let imgX = 60 + 60 * (parseInt(k) % 10);
                let imgY = topMargin + 60 * (usedRow + Math.floor(parseInt(k) / 10));
                artwork.onload = function () {
                    let result = results.find(a => a.level === track.level && a.musicId == track.musicId);
                    drawArtwork(ctx, artwork, imgX, imgY, result, track.isExpert);
                    loadedImage++;
                    // (縺昴�繝ｬ繝吶Ν縺ｮ)縺吶∋縺ｦ縺ｮ逕ｻ蜒上�隱ｭ縺ｿ霎ｼ縺ｿ縺檎ｵゅｏ縺｣縺溘ｉ
                    console.log(`loaded: ${diff} -> ${loadedImage}/${allTracksCount}`);
                    if (loadedImage === allTracksCount) {
                        displayPNG(canvas);
                    }
                };
                setTimeout(() => {
                    artwork.src = `/mobile/${track.artworkURL}`;
                }, parseInt(k) * 50);
            }
            usedRow += Math.ceil(tracks.length / 10); // 10譖ｲ縺斐→縺ｫ荳九�陦後∈謾ｹ陦�
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
        if (result.scoreMax >= 1005000 && result.scoreMax < 1007500) {
            color = COLOR_SSPLUS;
        }
        if (result.scoreMax == 1010000) {
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
            ctx.arc(x + 30, y + 30, 10, Math.PI / 2, Math.PI * 1.5, false); // 蜊雁�
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
            ctx.globalAlpha = 0.5; // 譛ｪ繝励Ξ繧､譖ｲ縺ｯ蜊企乗�
        ctx.drawImage(artwork, x, y, 60, 60);
        ctx.globalAlpha = 1.0;
        // 繝槭�繧ｯ縺吶ｋ
        if (result.scoreMax !== undefined) {
            putMark(ctx, x, y, result);
        }
        // 襍､隴憺擇縺ｪ繧牙魂繧偵▽縺代ｋ
        if (isExpert) {
            if (result.scoreMax === undefined)
                ctx.globalAlpha = 0.5; // 譛ｪ繝励Ξ繧､譖ｲ縺ｯ蜊企乗�
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
        ctx.fillText("CHUNITHM繝輔ぅ繝ｫ繝��繝悶Ν", 10, 10);
        ctx.font = "15px Helvetica Neue";
        ctx.fillStyle = "#555";
        ctx.fillText("逕滓�: KattobiDrive (http://kattobi.xyz/)", 400, 80);
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
        ctx.fillText("AJ縺ｯ逋ｽ縺�ｸｸ縲：C縺ｯ逋ｽ縺�濠蜀�", 330, 50);
        ctx.fillStyle = COLOR_EXPERT;
        ctx.fillText("荳狗ｷ壹′蠑輔＞縺ｦ縺ゅｋ縺ｮ縺ｯ襍､隴憺擇", 15, 80);
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
    ]; // rank縺ｮ謨ｰ蛟､縺ｫ蠢懊§縺ｦ繝槭�繧ｯ繧偵▽縺代ｋ(i=8縺郡, i=0縺轡)
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
        let usedRow = 0; // 逕ｻ蜒上ｒ蜈･繧後◆讓ｪ縺ｮ陦後�謨ｰ
        let loadedImage = 0;
        const topMargin = 110;
        for (let lv = 9; lv >= 0; lv -= 2) {
            ctx.fillStyle = "#FFF";
            ctx.fillText(`笘� ${(lv - 1) / 2.0 + 1}`, 10, topMargin + usedRow * 60);
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
            usedRow += Math.ceil(tracks.length / 10); // 10譖ｲ縺斐→縺ｫ荳九�陦後∈謾ｹ陦�
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
        ctx.fillText("CHUNITHM WORLD'S END 繝輔ぅ繝ｫ繝��繝悶Ν", 10, 10);
        ctx.font = "15px Helvetica Neue";
        ctx.fillStyle = "#EEE";
        ctx.fillText("逕滓�: KattobiDrive", 550, 80);
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
        ctx.fillText("AJ縺ｯ逋ｽ縺�ｸｸ縲：C縺ｯ逋ｽ縺�濠蜀�", 330, 50);
    }
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    var FriendsVs;
    (function (FriendsVs) {
        function setup() {
            // restoreFavorite(setupFriends)
        }
        FriendsVs.setup = setup;
        // 荳譎ら噪縺ｫUnFavorite縺ｫ縺ｪ縺｣縺ｦ縺�ｋ繝輔Ξ繝ｳ繝峨ｒ謌ｻ縺�
        function restoreFavorite(callback) {
            if (localStorage.getItem("tempFavoriteFriend")) {
                replaceFavorite(localStorage.getItem("tempUnFavoriteFriend"), localStorage.getItem("tempFavoriteFriend"), () => {
                    localStorage.removeItem("tempFavoriteFriend");
                    localStorage.removeItem("tempUnFavoriteFriend");
                    if (callback)
                        callback();
                });
            }
            else {
                if (callback)
                    callback();
            }
        }
        FriendsVs.restoreFavorite = restoreFavorite;
        function setupFriends() {
            Kattobi.Machine.getFriends(friends => {
                $("select[name='friend']")
                    .empty()
                    .on("change", () => {
                    let code = $("select[name='friend']").val();
                    restoreFavorite(() => {
                        // 荳譎ら噪縺ｫ驕ｸ謚槭＆繧後◆繧ゅ�繧偵♀豌励↓蜈･繧翫↓縺吶ｋ
                        replaceFavorite(code, friends[0].code, () => {
                            localStorage.setItem("tempFavoriteFriend", code);
                            localStorage.setItem("tempUnFavoriteFriend", friends[0].code);
                            setupFriends();
                        });
                    });
                });
                friends.forEach(f => {
                    let el = $("<option>")
                        .attr("class", "narrow01 w280 mt_20 option")
                        .val(f.code)
                        .html(f.favorite ? `[Fav] ${f.name}` : f.name)
                        .appendTo("select[name='friend']");
                });
            });
        }
        function replaceFavorite(codeToAdd, codeToRemove, callback) {
            Kattobi.Machine.removeFavoriteFriend(codeToRemove, () => {
                Kattobi.Machine.addFavoriteFriend(codeToAdd, callback);
            });
        }
        FriendsVs.replaceFavorite = replaceFavorite;
    })(FriendsVs = Kattobi.FriendsVs || (Kattobi.FriendsVs = {}));
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    var Batch;
    (function (Batch) {
        Batch.WE_MUSIC_COUNT = 41;
        Batch.MUSIC_COUNT = [-1, 8, 77, 234, 76, 161, 127, 60, 122, 163, 89, 153, 170, 74, 4];
        function generateMusicData() {
            Kattobi.Machine.getHigherLvMusics(musics => {
                let datalist = [];
                console.log(musics);
                musics.forEach((m, i) => {
                    setTimeout(() => {
                        console.log(`Fetching: ${i}`);
                        let existedData = Kattobi.MUSIC_DATA.find(t => { return t.musicId == m.musicId && t.level == m.level; });
                        Kattobi.Machine.getArtwork(m.musicId, url => {
                            datalist.push({
                                artworkURL: url,
                                name: m.name,
                                musicId: m.musicId,
                                level: m.level,
                                constant: existedData !== undefined ? existedData.constant : 0.0,
                                isExpert: existedData !== undefined ? existedData.isExpert : false,
                            });
                            if (i >= Batch.MUSIC_COUNT[11] + Batch.MUSIC_COUNT[12] + Batch.MUSIC_COUNT[13] + Batch.MUSIC_COUNT[14] - 1) {
                                console.log(JSON.stringify(datalist));
                            }
                        });
                    }, 500 * i);
                });
            });
        }
        Batch.generateMusicData = generateMusicData;
        function generateWEData() {
            Kattobi.Machine.getWEMusics(musics => {
                let datalist = [];
                musics.forEach((m, i) => {
                    setTimeout(() => {
                        console.log(`Fetching: ${i}`);
                        Kattobi.Machine.getArtwork(m.musicId, url => {
                            datalist.push({
                                artworkURL: url,
                                name: m.name,
                                musicId: m.musicId,
                                starDifficulty: m.starDifficulty,
                                type: m.type
                            });
                            if (i >= Batch.WE_MUSIC_COUNT - 1) {
                                console.log(JSON.stringify(datalist));
                            }
                        });
                    }, 500 * i);
                });
            });
        }
        Batch.generateWEData = generateWEData;
    })(Batch = Kattobi.Batch || (Kattobi.Batch = {}));
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    var Machine;
    (function (Machine) {
        function getWEMusics(callback) {
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
                callback(records);
            });
        }
        Machine.getWEMusics = getWEMusics;
        function getWEArtwork(musicId, callback) {
            $.post("/mobile/WorldsEndMusic.html", {
                musicId: musicId,
                music_detail: "music_detail"
            }, data => {
                let url = $(data).find(".play_jacket_img img").first().attr("src");
                callback(url);
            });
        }
        Machine.getWEArtwork = getWEArtwork;
        function getHigherLvMusics(callback) {
            let records = [];
            let loaded = [];
            for (let lv of [11, 12, 13, 14]) {
                setTimeout(() => {
                    getMusicsLevel(lv, musics => {
                        loaded.push(lv);
                        console.log(`Fetched Music Data: ${lv} (${loaded})`);
                        records[lv - 11] = musics;
                        if (loaded.length === 4)
                            callback(records.reduce((a, b) => { return a.concat(b); }));
                    });
                }, 500 * (lv - 10));
            }
        }
        Machine.getHigherLvMusics = getHigherLvMusics;
        function getMusicsLevel(level, callback) {
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
                callback(records);
            });
        }
        Machine.getMusicsLevel = getMusicsLevel;
        function getArtwork(musicId, callback) {
            $.post("/mobile/MusicLevel.html", {
                musicId: musicId,
                music_detail: "music_detail"
            }, data => {
                let url = $(data).find(".play_jacket_img img").first().attr("src");
                callback(url);
            });
        }
        Machine.getArtwork = getArtwork;
        function getFriends(callback) {
            $.get("/mobile/Friendlist.html", data => {
                let elms = $(data).find(".box_friend");
                let friends = [];
                elms.map((idx, el) => {
                    friends.push({
                        characterURL: $(el).find(".player_chara img").attr("src"),
                        honor: $(el).find(".player_honor_text span").html(),
                        name: $(el).find(".player_name a").html(),
                        code: $(el).find(".player_name a").attr("onclick").substr(62, 13),
                        familiarStar: $(el).find(".player_rating img").length,
                        favorite: $(el).find(".friend_favorite_off").length > 0 ? true : false,
                        comment: $(el).find(".player_data_comment").html() || ""
                    });
                });
                callback(friends);
            });
        }
        Machine.getFriends = getFriends;
        function addFavoriteFriend(code, callback) {
            $.post("/mobile/Friendlist.html", {
                type: "favorite",
                code: parseInt(code),
                friend_list: "friend_list"
            }, data => {
                callback();
            });
        }
        Machine.addFavoriteFriend = addFavoriteFriend;
        function removeFavoriteFriend(code, callback) {
            $.post("/mobile/Friendlist.html", {
                type: "offfavorite",
                code: parseInt(code),
                friend_list: "friend_list"
            }, data => {
                callback();
            });
        }
        Machine.removeFavoriteFriend = removeFavoriteFriend;
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
        initTools();
        Kattobi.FriendsVs.restoreFavorite();
    }
    Kattobi.setup = setup;
    function initButtons() {
        $("<button>")
            .html("繝輔ぅ繝ｫ繝��繝悶Ν繧堤函謌�")
            .on("click", () => {
            Kattobi.generateFillTable(false);
        })
            .appendTo("#main_menu");
        $("<button>")
            .html("WE繝輔ぅ繝ｫ繝��繝悶Ν繧堤函謌�")
            .on("click", Kattobi.generateWEFillTable)
            .appendTo("#main_menu");
    }
    function initTools() {
        switch (location.pathname) {
            case "/mobile/FriendGenreVs.html":
            case "/mobile/FriendLevelVs.html":
                Kattobi.FriendsVs.setup();
                break;
        }
    }
})(Kattobi || (Kattobi = {}));
Kattobi.setup();
var Kattobi;
(function (Kattobi) {
    Kattobi.MUSIC_DATA = [{ "artworkURL": "common/img/bf9ed3a6cfbffe15.jpg", "name": "MEMORIA", "musicId": 422, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/5c07dede2260aafe.jpg", "name": "MIRU key way", "musicId": 424, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/8ecf57e4db2f6d94.jpg", "name": "螟｢諠ｳ豁�", "musicId": 360, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/15625838f8f00963.jpg", "name": "true my heart -Lovable mix-", "musicId": 363, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/357a07354e3f2187.jpg", "name": "Jumping!!", "musicId": 348, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/e21129db8b503610.jpg", "name": "Daydream cafﾃｩ", "musicId": 343, "level": 11, "constant": 0 }, { "artworkURL": "common/img/23359d965dd6eb4a.jpg", "name": "蜒輔ｉ縺ｮ鄙ｼ", "musicId": 269, "level": 11, "constant": 0 }, { "artworkURL": "common/img/81805f2ef1e58db8.jpg", "name": "縺ｶ縺�∴縺�!!繧峨＞縺ｰ繧�!!", "musicId": 312, "level": 11, "constant": 11, "isExpert": true }, { "artworkURL": "common/img/5ac018495d6f01a5.jpg", "name": "縺ｲ縺�縺ｾ繧翫ョ繧､繧ｺ", "musicId": 313, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/fa70cc77f963cdba.jpg", "name": "繧ｪ繝ｩ繧ｷ繧ｪ繝ｳ", "musicId": 315, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/335dbb14cedb70bf.jpg", "name": "魑･縺ｮ隧ｩ", "musicId": 37, "level": 11, "constant": 0 }, { "artworkURL": "common/img/9bd44690db5375ac.jpg", "name": "secret base �槫菅縺後￥繧後◆繧ゅ��� (10 years after Ver.)", "musicId": 299, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/506f053a80e1b28e.jpg", "name": "螟冗･ｭ繧�", "musicId": 55, "level": 11, "constant": 0 }, { "artworkURL": "common/img/e273c9d64170b575.jpg", "name": "螻翫°縺ｪ縺�° '13", "musicId": 36, "level": 11, "constant": 11 }, { "artworkURL": "common/img/547ba5407b6e7fa0.jpg", "name": "Heart To Heart", "musicId": 126, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/f75a80f9b86eedab.jpg", "name": "Little Busters! �杁V animation ver.��", "musicId": 125, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/429d34fef5fddb02.jpg", "name": "豼諠�ｼ√Α繝ｫ繧ｭ繧｣螟ｧ菴懈姶", "musicId": 255, "level": 11, "constant": 11 }, { "artworkURL": "common/img/5744f4cf66710a56.jpg", "name": "蜷幄牡繧ｷ繧ｰ繝翫Ν", "musicId": 209, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/520c1fef62954ca6.jpg", "name": "繧ｫ繝ｩ繝輔Ν縲�", "musicId": 231, "level": 11, "constant": 0 }, { "artworkURL": "common/img/4bbc4ec5ee9aa0b6.jpg", "name": "讌ｽ蝨偵�鄙ｼ", "musicId": 185, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/4bbc4ec5ee9aa0b6.jpg", "name": "oath sign", "musicId": 42, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/f56cd36303a3239a.jpg", "name": "Hacking to the Gate", "musicId": 129, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/af78dd039a36a4c7.jpg", "name": "繧ｳ繝阪け繝�", "musicId": 14, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/d42200159ef91521.jpg", "name": "Magia", "musicId": 110, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/7ad659a57ef26888.jpg", "name": "staple stable", "musicId": 111, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/3bee1cce7d794f31.jpg", "name": "only my railgun", "musicId": 60, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/3dc05a281c0724f7.jpg", "name": "繝槭ずLOVE1000%", "musicId": 112, "level": 11, "constant": 11 }, { "artworkURL": "common/img/38faf81803b730f3.jpg", "name": "Scatman (Ski Ba Bop Ba Dop Bop)", "musicId": 5, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/ddfafd0206d04707.jpg", "name": "縺�繧薙□繧捺掠縺上↑繧�", "musicId": 375, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/0c6288729e80a1df.jpg", "name": "縺��縺ゅｋ縺ｵ縺√ｓ縺上ｉ縺ｶ", "musicId": 367, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/169a5a5ffa300cb7.jpg", "name": "諢幄ｨ闡�", "musicId": 275, "level": 11, "constant": 0 }, { "artworkURL": "common/img/330e57eeeb0fb2cd.jpg", "name": "繝ｩ繧ｯ繧ｬ繧ｭ繧ｹ繝�", "musicId": 281, "level": 11, "constant": 11.1, "isExpert": true }, { "artworkURL": "common/img/afcce0c85c1f8610.jpg", "name": "Tell Your World", "musicId": 286, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/5f1d7a520a2735d4.jpg", "name": "縺九ｉ縺上ｊ繝斐お繝ｭ", "musicId": 278, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/88f9536c08cb4e3f.jpg", "name": "縺ｿ縺上∩縺上↓縺励※縺ゅ￡繧銀飭縲舌＠縺ｦ繧�ｓ繧医�", "musicId": 316, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/8ec9a26e11ec1a40.jpg", "name": "繧ｫ繝溘し繝槭ロ繧ｸ繝槭く", "musicId": 223, "level": 11, "constant": 0, "isExpert": true }, { "artworkURL": "common/img/b9d170f84c1bb5d3.jpg", "name": "諱区�陬∝愛", "musicId": 224, "level": 11, "constant": 11.1 }, { "artworkURL": "common/img/0e73189a7083e4f4.jpg", "name": "縺吶ｍ縺峨ｂ縺峨＠繧�ｓ", "musicId": 179, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/b33923bd4e6e5609.jpg", "name": "FREELY TOMORROW", "musicId": 156, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/566d55b9b73112d5.jpg", "name": "繧ｷ繝ｪ繝ｧ繧ｯ繧ｱ繝ｳ繧ｵ", "musicId": 133, "level": 11, "constant": 11 }, { "artworkURL": "common/img/b02c3912d1524d5c.jpg", "name": "Sweet Devil", "musicId": 114, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/529d98ad07709ae5.jpg", "name": "螟ｩ繝主ｼｱ", "musicId": 38, "level": 11, "constant": 11.1 }, { "artworkURL": "common/img/3f8eb68a4f6089dc.jpg", "name": "繧ｹ繝医Μ繝ｼ繝溘Φ繧ｰ繝上�繝�", "musicId": 113, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/3c2606abe4dded71.jpg", "name": "蜊�悽譯�", "musicId": 18, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/88124d980ac7eca4.jpg", "name": "M.S.S.Planet", "musicId": 117, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/6c2e56be54f35d83.jpg", "name": "闖ｯ魑･鬚ｨ譛�", "musicId": 426, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/841eecc396c5059a.jpg", "name": "豕｡豐ｫ縲∝凍縺ｮ縺ｾ縺ｻ繧阪�", "musicId": 377, "level": 11, "constant": 0 }, { "artworkURL": "common/img/f5f99bf548dab947.jpg", "name": "Starlight Dance Floor", "musicId": 380, "level": 11, "constant": 0 }, { "artworkURL": "common/img/e6642a96885723c1.jpg", "name": "謔｣驛ｨ縺ｧ豁｢縺ｾ縺｣縺ｦ縺吶＄貅ｶ縺代ｋ�樒汲豌励�蜆ｪ譖�庄髯｢", "musicId": 187, "level": 11, "constant": 11, "isExpert": true }, { "artworkURL": "common/img/266bd38219201fa1.jpg", "name": "蟷ｻ諠ｳ縺ｮ繧ｵ繝�Λ繧､繝�", "musicId": 305, "level": 11, "constant": 11, "isExpert": true }, { "artworkURL": "common/img/cb77a66b62023890.jpg", "name": "Yet Another 窶拇rizzly rain窶�", "musicId": 91, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/f7e67efaf6ced6ea.jpg", "name": "鬲皮炊豐吶�螟ｧ螟峨↑繧ゅ�繧堤尢繧薙〒縺�″縺ｾ縺励◆", "musicId": 98, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/7f17441bc2582ec8.jpg", "name": "sweet little sister", "musicId": 41, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/9165ee58223accc0.jpg", "name": "Dreaming", "musicId": 115, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/1ea73ffbba6d7ead.jpg", "name": "縺｡縺上ｏ繝代ヵ繧ｧ縺�繧遺�CKP", "musicId": 204, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/a2069fdb9d860d36.jpg", "name": "Elemental Creation", "musicId": 232, "level": 11, "constant": 11.3, "isExpert": true }, { "artworkURL": "common/img/a7b85d734fea4749.jpg", "name": "JET", "musicId": 89, "level": 11, "constant": 11 }, { "artworkURL": "common/img/f092ddd9e1fe088b.jpg", "name": "elegante", "musicId": 169, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/0b98b8b4e7cfd997.jpg", "name": "DRAGONLADY", "musicId": 19, "level": 11, "constant": 11, "isExpert": true }, { "artworkURL": "common/img/13a5a9ca35a9b71b.jpg", "name": "Angel dust", "musicId": 137, "level": 11, "constant": 11.4, "isExpert": true }, { "artworkURL": "common/img/13446730e8b99f0e.jpg", "name": "Strahv", "musicId": 302, "level": 11, "constant": 11.0, "isExpert": true }, { "artworkURL": "common/img/c7cf3ce1e858e3f0.jpg", "name": "笘�LittlE HearTs笘�", "musicId": 328, "level": 11, "constant": 11.4, "isExpert": true }, { "artworkURL": "common/img/f7be4abcf8f3e197.jpg", "name": "Name of oath", "musicId": 389, "level": 11, "constant": 11.0, "isExpert": true }, { "artworkURL": "common/img/de02f8c0217d9baa.jpg", "name": "Dengeki Tube", "musicId": 393, "level": 11, "constant": 11.3, "isExpert": true }, { "artworkURL": "common/img/aa0cefb5a0f00457.jpg", "name": "Dance!", "musicId": 176, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/b1d08379f05c706e.jpg", "name": "讙�!蟶晏嵜闖ｯ謦�屮", "musicId": 290, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/e3ce6712e8cddf10.jpg", "name": "繝輔か繝ｫ繝�す繝｢BELL", "musicId": 158, "level": 11, "constant": 11.0 }, { "artworkURL": "common/img/de40692ecc47778b.jpg", "name": "DETARAME ROCK&amp;ROLL THEORY", "musicId": 170, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/630ac5b31e8ab816.jpg", "name": "Help me, 縺ゅ�繧翫ｓ��", "musicId": 245, "level": 11, "constant": 11.4 }, { "artworkURL": "common/img/424b4d3540141967.jpg", "name": "螟｢縺ｨ螟｢�槭≠縺ｮ譌･縺ｮ繝｡繝ｭ繝�ぅ��", "musicId": 488, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/809bf2b3f8effa6f.jpg", "name": "險繝手痩驕頑葦", "musicId": 160, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/74c77deb2f2e5e07.jpg", "name": "豢苓┻", "musicId": 227, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/2c9749de2183879c.jpg", "name": "繧翫�繝ｼ縺ｶ", "musicId": 403, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/3e545c372b926197.jpg", "name": "Like the Wind [Reborn]", "musicId": 397, "level": 11, "constant": 11, "isExpert": true }, { "artworkURL": "common/img/45112e2818cf80a2.jpg", "name": "GEMINI -C-", "musicId": 202, "level": 11, "constant": 11.2, "isExpert": true }, { "artworkURL": "common/img/281f821a06a7da18.jpg", "name": "�ｧ�ｯ��ｼｧ�ｯ�√Λ繝悶Μ繧ｺ繝�笙･", "musicId": 79, "level": 11, "constant": 11.1 }, { "artworkURL": "common/img/cd458a75aa049889.jpg", "name": "Theme of SeelischTact", "musicId": 148, "level": 11, "constant": 11 }, { "artworkURL": "common/img/fd6847e3bb2e3629.jpg", "name": "蟷ｾ蝗幃浹-Ixion-", "musicId": 163, "level": 11, "constant": 11.3 }, { "artworkURL": "common/img/713d52aa40ed7fc4.jpg", "name": "Anemone", "musicId": 65, "level": 11, "constant": 11.1 }, { "artworkURL": "common/img/feef37ed3d91cfbd.jpg", "name": "繝ｪ繝ｪ繝ｼ繧ｷ繧｢", "musicId": 74, "level": 11, "constant": 11 }, { "artworkURL": "common/img/11437ebc94947550.jpg", "name": "譏ｵ諛�Ξ繝輔ぃ繝ｬ繝ｳ繧ｹ", "musicId": 67, "level": 11, "constant": 11.2 }, { "artworkURL": "common/img/145b9b6f4c27d78e.jpg", "name": "荵励ｊ蛻�ｌ蜿鈴ｨ薙え繧ｩ繝ｼ繧ｺ", "musicId": 68, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/a62f975edc860e34.jpg", "name": "Cyberozar", "musicId": 52, "level": 11, "constant": 0, "isExpert": true }, { "artworkURL": "common/img/2ccf97477eaf45ad.jpg", "name": "GOLDEN RULE", "musicId": 61, "level": 11, "constant": 11.0, "isExpert": true }, { "artworkURL": "common/img/a0d03551eb3930e9.jpg", "name": "蠢�ｱ｡陷�ｰ玲･ｼ", "musicId": 267, "level": 11, "constant": 11.5 }, { "artworkURL": "common/img/f29f10a963df60cf.jpg", "name": "First Twinkle", "musicId": 288, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/4d66e5d1669d79a2.jpg", "name": "Oshama Scramble! (Cranky Remix)", "musicId": 259, "level": 11, "constant": 11.3, "isExpert": true }, { "artworkURL": "common/img/cd2aebc19c4fa1cd.jpg", "name": "We Gonna Party -Feline Groove Mix-", "musicId": 414, "level": 11, "constant": 0, "isExpert": true }, { "artworkURL": "common/img/7f2474bda00c94b0.jpg", "name": "鬘倥＞譏�", "musicId": 274, "level": 11, "constant": 11.6 }, { "artworkURL": "common/img/ae93bd84b68781f6.jpg", "name": "隕夐�讌ｽ螂上Γ繧ｿ繝輔ぅ繧ｯ繧ｷ繝ｧ繝ｳ", "musicId": 310, "level": 11, "constant": 0, "isExpert": true }, { "artworkURL": "common/img/3c61434b8cb2aadf.jpg", "name": "Supersonic Generation", "musicId": 335, "level": 11, "constant": 0, "isExpert": true }, { "artworkURL": "common/img/1ab2b7720caa1c34.jpg", "name": "JIGOKU STATION CENTRAL GATE", "musicId": 435, "level": 11, "constant": 11.4, "isExpert": true }, { "artworkURL": "common/img/a3473adab177dea7.jpg", "name": "蜑榊燕蜑堺ｸ�", "musicId": 421, "level": 11, "constant": 11.9 }, { "artworkURL": "common/img/c12cb5d8f49e8d2b.jpg", "name": "My Soul,Your Beats!", "musicId": 358, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/8b7fcdd825264797.jpg", "name": "Thousand Enemies", "musicId": 359, "level": 11, "constant": 0 }, { "artworkURL": "common/img/a852ba21f22efbc1.jpg", "name": "縺舌�縺｡繧�″繝代Ξ繝ｼ繝�", "musicId": 357, "level": 11, "constant": 0 }, { "artworkURL": "common/img/0a458d03f61196d3.jpg", "name": "闍･縺�鴨 -SEGA HARD GIRLS MIX-", "musicId": 394, "level": 11, "constant": 0 }, { "artworkURL": "common/img/fa151f477301a676.jpg", "name": "繝弱�繝昴う繝�!", "musicId": 344, "level": 11, "constant": 0 }, { "artworkURL": "common/img/1c098cdf731eb671.jpg", "name": "繝�繝ｼ繝ｳ繝ｩ繧､繝井ｼ晁ｪｬ", "musicId": 345, "level": 11, "constant": 0 }, { "artworkURL": "common/img/8f359edeac59a511.jpg", "name": "Be My Friend", "musicId": 311, "level": 11, "constant": 0 }, { "artworkURL": "common/img/5fb63e847a057938.jpg", "name": "This game", "musicId": 314, "level": 11, "constant": 0 }, { "artworkURL": "common/img/4c769ae611f83d21.jpg", "name": "繝輔Ξ繝ｳ繧ｺ", "musicId": 238, "level": 11, "constant": 0 }, { "artworkURL": "common/img/f8d3f2e57ae2ff24.jpg", "name": "fake!fake!", "musicId": 308, "level": 11, "constant": 0 }, { "artworkURL": "common/img/f4a2d88c38669f72.jpg", "name": "髱呈丼縺ｯNon-Stop��", "musicId": 214, "level": 11, "constant": 0 }, { "artworkURL": "common/img/58847f9694837c0b.jpg", "name": "邨ｶ荳悶せ繧ｿ繝ｼ繧ｲ繧､繝�", "musicId": 247, "level": 11, "constant": 0 }, { "artworkURL": "common/img/e4df0d48302ccd26.jpg", "name": "繧ｹ繧ｫ繧､繧ｯ繝ｩ繝�ラ縺ｮ隕ｳ貂ｬ閠�", "musicId": 130, "level": 11, "constant": 0 }, { "artworkURL": "common/img/e236f8a08a42923a.jpg", "name": "繧ｨ繝ｬ繧ｯ繝医Ο繧ｵ繝√Η繝ｬ繧､繧ｿ", "musicId": 444, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/d3a5a61b5eb2b8fb.jpg", "name": "繧ｨ繧､繝ｪ繧｢繝ｳ繧ｨ繧､繝ｪ繧｢繝ｳ", "musicId": 369, "level": 11, "constant": 0 }, { "artworkURL": "common/img/98b02f86db4d3fe2.jpg", "name": "譛蛾�ょ､ｩ繝薙ヰ繝ｼ繝√ぉ", "musicId": 272, "level": 11, "constant": 0 }, { "artworkURL": "common/img/4a51a3a5dc24c579.jpg", "name": "繧｢繧ｫ繝�く繧｢繝ｩ繧､繝ｴ繧｡繝ｫ", "musicId": 282, "level": 11, "constant": 0 }, { "artworkURL": "common/img/f78d1487c34efa6e.jpg", "name": "繝ｪ繝｢繧ｳ繝ｳ", "musicId": 280, "level": 11, "constant": 0 }, { "artworkURL": "common/img/604157e2c49d91d7.jpg", "name": "繝薙ヰ繝上ヴ", "musicId": 273, "level": 11, "constant": 0 }, { "artworkURL": "common/img/84ecaebe6bce2a58.jpg", "name": "豺ｱ豬ｷ蟆大･ｳ", "musicId": 279, "level": 11, "constant": 0 }, { "artworkURL": "common/img/5febf5df2b5094f3.jpg", "name": "繝ｭ繝溘が縺ｨ繧ｷ繝ｳ繝�Ξ繝ｩ", "musicId": 287, "level": 11, "constant": 0 }, { "artworkURL": "common/img/015358a0c0580022.jpg", "name": "Hand in Hand", "musicId": 263, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/2b3c90b1dab1ecff.jpg", "name": "讌ｽ蝨偵ヵ繧｡繝ｳ繝輔ぃ繝ｼ繝ｬ", "musicId": 217, "level": 11, "constant": 11.8 }, { "artworkURL": "common/img/c6d494f528391d1c.jpg", "name": "譏溷ｱ代Θ繝ｼ繝医ヴ繧｢", "musicId": 213, "level": 11, "constant": 11.9 }, { "artworkURL": "common/img/5a0ac8501e3b95ce.jpg", "name": "陬剰｡ｨ繝ｩ繝舌�繧ｺ", "musicId": 166, "level": 11, "constant": 11.8 }, { "artworkURL": "common/img/1982767436fc52d8.jpg", "name": "繝阪ヨ繧ｲ蟒�ｺｺ繧ｷ繝･繝励Ξ繝偵さ繝ｼ繝ｫ", "musicId": 168, "level": 11, "constant": 0 }, { "artworkURL": "common/img/7f68ccfecfbf4fc6.jpg", "name": "Calamity Fortune", "musicId": 504, "level": 11, "constant": 11.7, "isExpert": true }, { "artworkURL": "common/img/53862f1d50a76902.jpg", "name": "蟷ｽ髣�↓逶ｮ驢偵ａ縺励�", "musicId": 191, "level": 11, "constant": 0 }, { "artworkURL": "common/img/e26ef92a66d5d07f.jpg", "name": "縺｣縺ｦ繧撰ｼ√�槭∴縺�∴繧薙※繧新er��", "musicId": 186, "level": 11, "constant": 0 }, { "artworkURL": "common/img/c9c2fa20dcd9a46e.jpg", "name": "邱玖牡縺ｮDance", "musicId": 149, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/4f69fb126f579c2f.jpg", "name": "繝翫う繝医�繧ｪ繝悶�繝翫う繝�", "musicId": 21, "level": 11, "constant": 0 }, { "artworkURL": "common/img/9d2ebc847487e01b.jpg", "name": "繝√Ν繝弱�繝代�繝輔ぉ繧ｯ繝医＆繧薙☆縺�蕗螳､", "musicId": 96, "level": 11, "constant": 0 }, { "artworkURL": "common/img/b38eba298df2c6db.jpg", "name": "Unlimited Spark!", "musicId": 48, "level": 11, "constant": 0 }, { "artworkURL": "common/img/d739ba44da6798a0.jpg", "name": "B.B.K.K.B.K.K.", "musicId": 3, "level": 11, "constant": 11.8 }, { "artworkURL": "common/img/08a24ed249ed2eec.jpg", "name": "HAELEQUIN (Original Remaster)", "musicId": 134, "level": 11, "constant": 11.8, "isExpert": true }, { "artworkURL": "common/img/ae6d3a8806e09613.jpg", "name": "Jack-the-Ripper笳�", "musicId": 197, "level": 11, "constant": 11.7, "isExpert": true }, { "artworkURL": "common/img/ed40032f25177518.jpg", "name": "FREEDOM DiVE", "musicId": 196, "level": 11, "constant": 11.9, "isExpert": true }, { "artworkURL": "common/img/0d7bd146ebed6fba.jpg", "name": "All I Want", "musicId": 10, "level": 11, "constant": 0 }, { "artworkURL": "common/img/e10bbd173df15772.jpg", "name": "Signs Of Love (窶廸ever More窶� ver.)", "musicId": 206, "level": 11, "constant": 0 }, { "artworkURL": "common/img/5151993f923b06a5.jpg", "name": "Your Affection (Daisuke Asakura Remix)", "musicId": 207, "level": 11, "constant": 0 }, { "artworkURL": "common/img/16cb8567115a2f2c.jpg", "name": "In The Blue Sky '01", "musicId": 304, "level": 11, "constant": 0 }, { "artworkURL": "common/img/90be66e64c2417cb.jpg", "name": "繝ｬ繝�ヤ繧ｴ繝ｼ!髯ｰ髯ｽ蟶ｫ", "musicId": 395, "level": 11, "constant": 0 }, { "artworkURL": "common/img/0bb58f15b16703ab.jpg", "name": "Change Our MIRAI��", "musicId": 145, "level": 11, "constant": 0 }, { "artworkURL": "common/img/2faebe5b438810f2.jpg", "name": "brilliant better", "musicId": 150, "level": 11, "constant": 0 }, { "artworkURL": "common/img/2faebe5b438810f2.jpg", "name": "Tic Tac DREAMIN窶�", "musicId": 337, "level": 11, "constant": 0 }, { "artworkURL": "common/img/ee332e6fa86661fd.jpg", "name": "險繝手痩繧ｫ繝ｫ繝�", "musicId": 99, "level": 11, "constant": 0 }, { "artworkURL": "common/img/4e7b81501ccdd198.jpg", "name": "螟ｩ蝗ｽ縺ｨ蝨ｰ迯� -險繝手痩繝ｪ繝ｳ繝�-", "musicId": 398, "level": 11, "constant": 11.8 }, { "artworkURL": "common/img/e1454dc2eeae2030.jpg", "name": "Counselor", "musicId": 75, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/0aad2e0ff661e7d1.jpg", "name": "Guilty", "musicId": 140, "level": 11, "constant": 11.9 }, { "artworkURL": "common/img/93abb77776c70b47.jpg", "name": "luna blu", "musicId": 76, "level": 11, "constant": 11.9, "isExpert": true }, { "artworkURL": "common/img/2e6c11edba79d997.jpg", "name": "髢�蕎縺ｮ繝悶Μ繝･繝ｼ繝翫け", "musicId": 141, "level": 11, "constant": 11.7, "isExpert": true }, { "artworkURL": "common/img/2df15f390356067f.jpg", "name": "Gate of Fate", "musicId": 63, "level": 11, "constant": 11.7, "isExpert": true }, { "artworkURL": "common/img/c2c4ece2034eb620.jpg", "name": "The wheel to the right", "musicId": 69, "level": 11, "constant": 11.9, "isExpert": true }, { "artworkURL": "common/img/f63fab30a7b6f160.jpg", "name": "Gustav Battle", "musicId": 152, "level": 11, "constant": 11.8, "isExpert": true }, { "artworkURL": "common/img/d3b40f7b8e0758ff.jpg", "name": "螟墓坩繧後Ρ繝ｳ繝ｫ繝ｼ繝�", "musicId": 146, "level": 11, "constant": 0 }, { "artworkURL": "common/img/19d57f9a7652308a.jpg", "name": "繧ｨ繝ｳ繝峨�繝ｼ繧ｯ縺ｫ蟶梧悍縺ｨ豸吶ｒ豺ｻ縺医※", "musicId": 103, "level": 11, "constant": 11.7, "isExpert": true }, { "artworkURL": "common/img/2e617d713547fe84.jpg", "name": "L'ﾃｩpisode", "musicId": 90, "level": 11, "constant": 0, "isExpert": true }, { "artworkURL": "common/img/2e617d713547fe84.jpg", "name": "縺昴�鄒､髱偵′諢帙＠縺九▲縺溘ｈ縺�□縺｣縺�", "musicId": 254, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/989f4458fb34aa9d.jpg", "name": "Philosopher", "musicId": 250, "level": 11, "constant": 11.8, "isExpert": true }, { "artworkURL": "common/img/65353f99e301c521.jpg", "name": "RevolutionGame", "musicId": 339, "level": 11, "constant": 11.7 }, { "artworkURL": "common/img/bf023d3289459959.jpg", "name": "Paradisus-Paradoxum", "musicId": 525, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/1dee6916940a90cd.jpg", "name": "繧医≧縺薙◎繧ｸ繝｣繝代Μ繝代�繧ｯ縺ｸ", "musicId": 526, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/bbe65bd3f0f984b3.jpg", "name": "繝上Ξ譎ｴ繝ｬ繝ｦ繧ｫ繧､", "musicId": 537, "level": 12, "constant": 12 }, { "artworkURL": "common/img/13f02068575a1ef9.jpg", "name": "Face of Fact", "musicId": 362, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/13e6eb56943f6d00.jpg", "name": "繧ｯ繝ｭ繝ｼ繝舌�笙｣縺九￥繧√�縺励ｇ繧�", "musicId": 356, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/81a50239781153fb.jpg", "name": "繝ｩ繝悶Μ繝ｼ笘�∴繧薙§縺�ｋ!!", "musicId": 354, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/c78c45855db15f7a.jpg", "name": "Star笘�Glitter", "musicId": 352, "level": 12, "constant": 12 }, { "artworkURL": "common/img/b739e3b0af173789.jpg", "name": "Redo", "musicId": 417, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/76535cf4c728f2af.jpg", "name": "縺九￥縺励ｓ逧��繧√◆縺ｾ繧九�縺会ｽ槭●縺｣!", "musicId": 296, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/74ce2f0a4b4f6fe2.jpg", "name": "螟丞ｽｱ", "musicId": 124, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/cee51d69c428f8f5.jpg", "name": "Rising Hope", "musicId": 309, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/81cc90c04676f18b.jpg", "name": "Falling Roses", "musicId": 215, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/e0a700914896ea4a.jpg", "name": "蝗槭Ξ��妛譛郁干", "musicId": 244, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/8b84b06033585428.jpg", "name": "繝輔ぃ繝�→縺励※譯�ｺ宣�", "musicId": 235, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/8872c759bea3bd9f.jpg", "name": "繧ｷ繝･繧ｬ繝ｼ繧ｽ繝ｳ繧ｰ縺ｨ繝薙ち繝ｼ繧ｹ繝�ャ繝�", "musicId": 243, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/e9573b5c6882f25b.jpg", "name": "Palette", "musicId": 445, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/85e49b02887f58c1.jpg", "name": "遐ゅ�諠第弌 feat. HATSUNE MIKU", "musicId": 540, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/9c39b668e99ce253.jpg", "name": "縺吶″縺ｪ縺薙→縺�縺代〒縺�＞縺ｧ縺�", "musicId": 372, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/4f8e04cdc467480d.jpg", "name": "繝�Μ繝倥Ν蜻ｼ繧薙□繧牙菅縺梧擂縺�", "musicId": 373, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/189a65f52bd06239.jpg", "name": "繝√Η繝ｫ繝ｪ繝ｩ繝ｻ繝√Η繝ｫ繝ｪ繝ｩ繝ｻ繝繝�ム繝�ム��", "musicId": 374, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/b1e915b646c9ba08.jpg", "name": "ECHO", "musicId": 376, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/dc09ca21d0647779.jpg", "name": "蝨ｰ逅�怙蠕後�蜻顔區繧�", "musicId": 411, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/f93fba04ff1c0c54.jpg", "name": "陌手ｦ也怦縲�", "musicId": 370, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/c658788de6594b15.jpg", "name": "逾樊峇", "musicId": 283, "level": 12, "constant": 12 }, { "artworkURL": "common/img/62941303552504e8.jpg", "name": "逋ｽ縺�妛縺ｮ繝励Μ繝ｳ繧ｻ繧ｹ縺ｯ", "musicId": 301, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/21dfcd3ae2c5c370.jpg", "name": "繧ｨ繝ｳ繝ｴ繧｣繧ｭ繝｣繝�ヨ繧ｦ繧ｩ繝ｼ繧ｯ", "musicId": 270, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/a7dd6716fcae0cb8.jpg", "name": "繧｢繧ｦ繧ｿ繝ｼ繧ｵ繧､繧ｨ繝ｳ繧ｹ", "musicId": 119, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/e40fceaa1bb587b7.jpg", "name": "繧ｷ繧ｸ繝ｧ繧ｦ繝弱さ繧ｨ VOCALO ver.", "musicId": 336, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/b602913a68fca621.jpg", "name": "蛻晞浹繝溘け縺ｮ豸亥､ｱ", "musicId": 7, "level": 12, "constant": 12 }, { "artworkURL": "common/img/3227722a8345a950.jpg", "name": "謾ｾ隱ｲ蠕碁擠蜻ｽ", "musicId": 216, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/6f86e2a47e9a283c.jpg", "name": "繧ｦ繝溘Θ繝ｪ豬ｷ蠎戊ｭ�", "musicId": 225, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/040cd43234aed57a.jpg", "name": "繧｢繧ｹ繝弱Κ繧ｾ繝ｩ蜩ｨ謌堤少", "musicId": 210, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/457722c9f3ff5473.jpg", "name": "螟ｩ讓�", "musicId": 211, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/457722c9f3ff5473.jpg", "name": "Crazy 竏� nighT", "musicId": 251, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/c3041fd82b0a0710.jpg", "name": "螯よ怦繧｢繝�Φ繧ｷ繝ｧ繝ｳ", "musicId": 220, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/47397105bad447fb.jpg", "name": "螟懷嫡繝�ぅ繧ｻ繧､繝�", "musicId": 240, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/882be51fe439614d.jpg", "name": "縺薙�縺ｵ縺悶￠縺溽ｴ�譎ｴ繧峨＠縺堺ｸ也阜縺ｯ縲∝ヵ縺ｮ轤ｺ縺ｫ縺ゅｋ", "musicId": 228, "level": 12, "constant": 12 }, { "artworkURL": "common/img/1ee29f73ee8f53d0.jpg", "name": "縺�ｍ縺ｯ蜚�", "musicId": 212, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/1c508bbd42d335fe.jpg", "name": "諢幄ｿｷ繧ｨ繝ｬ繧ｸ繝ｼ", "musicId": 252, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/164258c65c714d50.jpg", "name": "繧､繧ｫ繧ｵ繝槭Λ繧､繝輔ご繧､繝�", "musicId": 132, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/5cb17a59f4b8c133.jpg", "name": "繧ｻ繝�リ繝医Μ繝��", "musicId": 94, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/b8ab9573859ebe4f.jpg", "name": "荳隗ｦ蜊ｳ逋ｺ笘�ｦ�ぎ繝ｼ繝ｫ", "musicId": 23, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/5cb17a59f4b8c133.jpg", "name": "蜈ｭ蜈�ｹｴ縺ｨ荳螟懃黄隱�", "musicId": 47, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/17e485acfe11a67f.jpg", "name": "閻舌ｌ螟夜％縺ｨ繝√Ι繧ｳ繝ｬ繧舌ヨ", "musicId": 118, "level": 12, "constant": 12 }, { "artworkURL": "common/img/fdc3bb451f6403d2.jpg", "name": "繧ｿ繧､繧ｬ繝ｼ繝ｩ繝ｳ繝壹う繧ｸ", "musicId": 27, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/b49a0669bb6e3d99.jpg", "name": "繝ｭ繧ｹ繝医Ρ繝ｳ縺ｮ蜿ｷ蜩ｭ", "musicId": 83, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/2cf12519a485d471.jpg", "name": "蜆壹″繧ゅ�莠ｺ髢�", "musicId": 427, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/2cf12519a485d471.jpg", "name": "繧ｭ繝･繧｢繝ｪ繧｢繧ｹ蜈牙翠蜿､迚後�咲･ｭ��", "musicId": 384, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/35f4cdddf050d04c.jpg", "name": "Help me, ERINNNNNN!! -Cranky remix-", "musicId": 382, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/fbc64b4167aebad9.jpg", "name": "莉咎�邨ｶ蜚ｱ縺ｮ繝輔ぃ繝ｳ繧ｿ繧ｸ繧｢", "musicId": 383, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/4ec159d338cfba9e.jpg", "name": "Starlight Vision", "musicId": 192, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/8d15a77198c7b841.jpg", "name": "Club Ibuki in Break All", "musicId": 193, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/8fae9b1861d3f9af.jpg", "name": "豌ｸ驕�縺ｮ繝｡繝ｭ繝�ぅ", "musicId": 195, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/021eef9b80989a2e.jpg", "name": "諢帙″螟憺％ feat. 繝ｩ繝ｳ繧ｳ縲�岑螟ｩ豎ｺ陦�", "musicId": 379, "level": 12, "constant": 12 }, { "artworkURL": "common/img/f489240491c703a5.jpg", "name": "Witches night", "musicId": 381, "level": 12, "constant": 12 }, { "artworkURL": "common/img/012eb1ed09577836.jpg", "name": "No Routine", "musicId": 300, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/bbaa464731ab96a4.jpg", "name": "繧ｨ繝�Ν繝九ち繧ｹ繝ｻ繝ｫ繝峨Ο繧ｸ繝ｼ", "musicId": 190, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/b12c25f87b1d036e.jpg", "name": "譛医↓蜿｢髮ｲ闖ｯ縺ｫ鬚ｨ", "musicId": 292, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/6b40809324937ec9.jpg", "name": "闥ｼ遨ｺ縺ｫ闊槭∴縲∝｢ｨ譟薙�譯�", "musicId": 93, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/101d4e7b03a5a89e.jpg", "name": "FLOWER", "musicId": 203, "level": 12, "constant": 12 }, { "artworkURL": "common/img/5fe5db1d2e40ee7a.jpg", "name": "繧｢繝ｫ繧ｹ繝医Ο繝｡繝ｪ繧｢", "musicId": 233, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/106d9eec68ed84b3.jpg", "name": "蜃帙→縺励※蜥ｲ縺剰干縺ｮ螯ゅ￥", "musicId": 306, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/25abef88cb12af3e.jpg", "name": "XL TECHNO", "musicId": 171, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/7c649691aa0c4b3d.jpg", "name": "PRIVATE SERVICE", "musicId": 298, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/2704dddce9cd4e3c.jpg", "name": "FLOATED CALM", "musicId": 334, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/90dca26c66c5d5b7.jpg", "name": "L9", "musicId": 45, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/a8d181c5442df7d2.jpg", "name": "Altale", "musicId": 142, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/c4f977d264deafb1.jpg", "name": "ﾃёentyr", "musicId": 136, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/e9eeb98572b140bc.jpg", "name": "Lapis", "musicId": 35, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/e9eeb98572b140bc.jpg", "name": "Say A Vengeance", "musicId": 319, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/6b33d4fa539d5adb.jpg", "name": "010", "musicId": 320, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/40cc7a6a264f88c1.jpg", "name": "ERIS -Legend of Gaidelia-", "musicId": 321, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/d51d4ffba9f8d45e.jpg", "name": "STAGER", "musicId": 324, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/97eca622afca0f15.jpg", "name": "Her Majesty", "musicId": 325, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/fd01fc38e38042e3.jpg", "name": "Sakura Fubuki", "musicId": 326, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/9c5e71b3588dbc70.jpg", "name": "Kronos", "musicId": 291, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/8463cebfa120b884.jpg", "name": "鬚ｨ莉�峭莉�", "musicId": 297, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/c23488ff88a819b9.jpg", "name": "Bird Sprite", "musicId": 390, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/90589be457544570.jpg", "name": "Reach for the Stars", "musicId": 6, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/c4223e68340efa41.jpg", "name": "The Concept of Love", "musicId": 88, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/e869980ddd2f9c68.jpg", "name": "STAIRWAY TO GENERATION", "musicId": 329, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/d13c5d162e6fa57e.jpg", "name": "Through The Tower", "musicId": 416, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/569e7b07c0696bc7.jpg", "name": "辟｡謨ｵWe are one!!", "musicId": 200, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/b3ea0fe012eb7ea2.jpg", "name": "繝峨く繝峨くDREAM!!!", "musicId": 330, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/de62556bd83dd21d.jpg", "name": "Still", "musicId": 340, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/4ceb5aed4a4a1c47.jpg", "name": "遘√�荳ｭ縺ｮ蟷ｻ諠ｳ逧�ｸ也阜隕ｳ蜿翫�縺昴�鬘慕樟繧呈Φ襍ｷ縺輔○縺溘≠繧狗樟螳溘〒縺ｮ蜃ｺ譚･莠九↓髢｢縺吶ｋ荳閠�ｯ�", "musicId": 161, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/d76afb63de1417f8.jpg", "name": "繝上�繝医�繝薙�繝�", "musicId": 199, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/ec37e447b91995dd.jpg", "name": "迪幃ｲ繧ｽ繝ｪ繧ｹ繝医Λ繧､繝包ｼ�", "musicId": 331, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/f44c6b628889f8ec.jpg", "name": "My Dearest Song", "musicId": 264, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/23e754d62862c0c4.jpg", "name": "TRUST", "musicId": 277, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/874f9509a5e5707e.jpg", "name": "迪ｫ逾ｭ繧�", "musicId": 265, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/379072a1ddcf1fe2.jpg", "name": "SPICY SWINGY STYLE", "musicId": 338, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/d15d3a298dac3df0.jpg", "name": "縺ゅ�縺ｺ縺｣縺溘ｓ", "musicId": 396, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/eaa5090407bf9aed.jpg", "name": "�ｧ�ｯ��ｼｧ�ｯ�√Λ繝悶Μ繧ｺ繝�笙･ �槭≠繝ｼ繧翫ｓ譖ｸ鬘槫ｯｩ譟ｻ騾夐℃險伜ｿｵVer.��", "musicId": 430, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/41001ddd4214d6b6.jpg", "name": "遨ｺ螽∝ｼｵ繧翫ン繝倥う繝薙い", "musicId": 332, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/2b40dbdabb958a34.jpg", "name": "謔ｪ謌ｯ", "musicId": 402, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/dc67a58e35e06b96.jpg", "name": "Barbed Eye", "musicId": 404, "level": 12, "constant": 12 }, { "artworkURL": "common/img/8c01dde56f3baa9c.jpg", "name": "逶ｸ諤晏卸諢�", "musicId": 406, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/993b5cddb9d9badf.jpg", "name": "Garakuta Doll Play", "musicId": 226, "level": 12, "constant": 12.3, "isExpert": true }, { "artworkURL": "common/img/e03858fb5d391628.jpg", "name": "AMAZING MIGHTYYYY!!!!", "musicId": 538, "level": 12, "constant": 12, "isExpert": true }, { "artworkURL": "common/img/a251c24a3cc4dbf7.jpg", "name": "Contrapasso -inferno-", "musicId": 201, "level": 12, "constant": 12.4, "isExpert": true }, { "artworkURL": "common/img/2bf02bef3051ecaf.jpg", "name": "Infantoon Fantasy", "musicId": 71, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/db38c119e4d8933e.jpg", "name": "遐よｼ�縺ｮ繝上Φ繝�ぅ繝ｳ繧ｰ繧ｬ繝ｼ繝ｫ笙｡", "musicId": 95, "level": 12, "constant": 12.1 }, { "artworkURL": "common/img/73ad66e81061bba3.jpg", "name": "Teriqma", "musicId": 53, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/1ec3213366f4ad57.jpg", "name": "The ether", "musicId": 108, "level": 12, "constant": 12 }, { "artworkURL": "common/img/27ef71f8a76f1e8a.jpg", "name": "Memories of Sun and Moon", "musicId": 82, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/7237488215dbd1d3.jpg", "name": "Alma", "musicId": 151, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/3ccebd87235f591c.jpg", "name": "STAR", "musicId": 70, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/ff945c9cb9e43e83.jpg", "name": "縺ｨ繝ｼ縺阪ｇ繝ｼ蜈ｨ蝓溪�繧｢繧ｭ繝上ヰ繝ｩ��", "musicId": 104, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/9386971505bb20b0.jpg", "name": "蜷阪ｂ辟｡縺�ｳ･", "musicId": 62, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/8219519cc94d5524.jpg", "name": "螳帛沁縲∫ｎ荳奇ｼ�ｼ�", "musicId": 106, "level": 12, "constant": 12.2, "isExpert": true }, { "artworkURL": "common/img/82105b37d18450b6.jpg", "name": "蠕悟､懃･ｭ", "musicId": 276, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/7fc6ae1b488b88de.jpg", "name": "Tuning Rangers", "musicId": 102, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/c22702914849a11a.jpg", "name": "譏弱ｋ縺�悴譚･", "musicId": 66, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/a2fdef9e4b278a51.jpg", "name": "Schrecklicher Aufstand", "musicId": 248, "level": 12, "constant": 12.3, "isExpert": true }, { "artworkURL": "common/img/6e917606db3c5a0e.jpg", "name": "繝ｭ繝懊ャ繝医�繝ｩ繝阪ャ繝医Θ繝ｼ繝医ヴ繧｢", "musicId": 261, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/b59d2b2ab877a77d.jpg", "name": "Hyperion", "musicId": 230, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/73f86aec8d6c7c9b.jpg", "name": "邏�庄蛻�", "musicId": 229, "level": 12, "constant": 12, "isExpert": true }, { "artworkURL": "common/img/20359304f5e0574a.jpg", "name": "繧ｵ繧ｦ繝ｳ繝峨�繝ｬ繧､繝､繝ｼ", "musicId": 218, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/03f1dafe3b08607e.jpg", "name": "D.E.A.D.L.Y.", "musicId": 260, "level": 12, "constant": 12.4 }, { "artworkURL": "common/img/0cece587cced4d3f.jpg", "name": "繧ｦ繧ｽ繝ｩ繧ｻ繝ｩ", "musicId": 289, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/854cf33a2b30f004.jpg", "name": "譛諢帙ユ繝医Λ繧ｰ繝ｩ繝槭ヨ繝ｳ", "musicId": 399, "level": 12, "constant": 12.6 }, { "artworkURL": "common/img/988d8172dbe8b42b.jpg", "name": "髻ｿ", "musicId": 295, "level": 12, "constant": 12 }, { "artworkURL": "common/img/9af4b336821cdcc9.jpg", "name": "Devastating Blaster", "musicId": 234, "level": 12, "constant": 12.2, "isExpert": true }, { "artworkURL": "common/img/94ae59f2fd71e5bd.jpg", "name": "蜈臥ｷ壹メ繝･繝ｼ繝九Φ繧ｰ", "musicId": 432, "level": 12, "constant": 12.3 }, { "artworkURL": "common/img/3c283d55b0bb5031.jpg", "name": "蜩縺励∩髮�ａ", "musicId": 439, "level": 12, "constant": 12 }, { "artworkURL": "common/img/71abc84583b47b72.jpg", "name": "PinqPiq", "musicId": 436, "level": 12, "constant": 12.5 }, { "artworkURL": "common/img/3c1bda8d023fc1fe.jpg", "name": "WE GOTTA SOUL", "musicId": 438, "level": 12, "constant": 12.2 }, { "artworkURL": "common/img/44c1e56a88c144c3.jpg", "name": "Kattobi KEIKYU Rider", "musicId": 441, "level": 12, "constant": 12.5, "isExpert": true }, { "artworkURL": "common/img/44c1e56a88c144c3.jpg", "name": "FEELﾃ輸LIVE", "musicId": 350, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/fb91e08c99009fd4.jpg", "name": "縺ｶ縺峨ｓ�√�縺峨ｓ�√ｉ縺�←繝ｻ縺翫ｓ��", "musicId": 351, "level": 12, "constant": 12.9 }, { "artworkURL": "common/img/cbfb4c6a58342201.jpg", "name": "MY LIBERATION", "musicId": 410, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/2e9fdbbc15ade5cb.jpg", "name": "SAVIOR OF SONG", "musicId": 154, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/7b12d66ee6250e26.jpg", "name": "繝代�繝輔ぉ繧ｯ繝育函蜻ｽ", "musicId": 447, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/ad2ef043b1bd490f.jpg", "name": "繧｢繝ｳ繝上ャ繝斐�繝ｪ繝輔Ξ繧､繝ｳ", "musicId": 371, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/8b14785409866748.jpg", "name": "縺翫％縺｡繧�∪謌ｦ莠�", "musicId": 368, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/c63005195d15922e.jpg", "name": "莠ｺ逕溘Μ繧ｻ繝�ヨ繝懊ち繝ｳ", "musicId": 294, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/99b79d4bd74e476c.jpg", "name": "鬯ｼKYOKAN", "musicId": 271, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/16b25dc6eb7765aa.jpg", "name": "蟷ｸ縺帙↓縺ｪ繧後ｋ髫�縺励さ繝槭Φ繝峨′縺ゅｋ繧峨＠縺�", "musicId": 284, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/38d3c5a5a45c6d07.jpg", "name": "繝√Ν繝峨Ξ繝ｳ繝ｬ繧ｳ繝ｼ繝�", "musicId": 131, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/ad33a423c865bed1.jpg", "name": "Mr. Wonderland", "musicId": 222, "level": 12, "constant": 12.9 }, { "artworkURL": "common/img/1e85c4b6775c84b0.jpg", "name": "縺ｼ縺上ｉ縺ｮ16bit謌ｦ莠�", "musicId": 165, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/24611f2e2374e6a8.jpg", "name": "閼ｳ貍ｿ轤ｸ陬ゅぎ繝ｼ繝ｫ", "musicId": 167, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/573109ca9050f55d.jpg", "name": "繧ｮ繧ｬ繝ｳ繝�ぅ繝�けO.T.N", "musicId": 157, "level": 12, "constant": 12.9 }, { "artworkURL": "common/img/e2a1c87c96de9837.jpg", "name": "taboo tears you up", "musicId": 20, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/9310d07b7e02e73a.jpg", "name": "縺ｲ繧御ｼ上○諢壽ｰ代←繧ゅ▲��", "musicId": 189, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/4196f71ce51620a0.jpg", "name": "譚ｱ譁ｹ螯悶�､｢ �柎he maximum moving about��", "musicId": 121, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/67418ba28151c3ff.jpg", "name": "蟆大･ｳ蟷ｻ闡ｬ謌ｦ諷�峇縲�槭Necro Fantasia", "musicId": 122, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/6e7843f9d831b0ac.jpg", "name": "Jimang Shot", "musicId": 177, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/a84a31e562efd7a0.jpg", "name": "蝗帶ｬ｡蜈�ｷｳ霄肴ｩ滄未", "musicId": 120, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/8205ea9449f1b000.jpg", "name": "逾槫ｨ�", "musicId": 386, "level": 12, "constant": 12.7, "isExpert": true }, { "artworkURL": "common/img/7edc6879319accfd.jpg", "name": "The Formula", "musicId": 128, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/5bab1a38b98d59b5.jpg", "name": "SAMBISTA", "musicId": 208, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/17c363c1fd2fa7d1.jpg", "name": "JULIAN", "musicId": 327, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/e52af2b93636ccea.jpg", "name": "Bang Babang Bang!!!", "musicId": 268, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/d445e4878a818d8b.jpg", "name": "縺ｪ繧九→縺ｪ縺弱�繝代�繝輔ぉ繧ｯ繝医Ο繝�け繝ｳ繝ｭ繝ｼ繝ｫ謨吝ｮ､", "musicId": 246, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/161f13a787a00032.jpg", "name": "My First Phone", "musicId": 51, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/6bf934fede23724d.jpg", "name": "莉翫◇笙｡蟠�ａ螂峨ｌ笘�が繝槭お繧峨ｈ��ｼ�ｽ槫ｧｫ縺ｮ遘倥Γ繧ｿ繝ｫ貂�悍��", "musicId": 64, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/a732d43fd2a11e8f.jpg", "name": "諤呈ｧ�", "musicId": 180, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/9f281db3bcc9353b.jpg", "name": "stella=steLLa", "musicId": 178, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/3d7803669dd3fcb9.jpg", "name": "SNIPE WHOLE", "musicId": 205, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/0c2791f737ce1ff2.jpg", "name": "MUSIC PﾐｯAYER", "musicId": 73, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/01fc7f761272bfb4.jpg", "name": "繧ｱ繝｢繝弱ぎ繝ｫ", "musicId": 77, "level": 12, "constant": 12.8 }, { "artworkURL": "common/img/ff9f70c8c0d9f24e.jpg", "name": "Paqqin", "musicId": 307, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/246f63902c4b0f89.jpg", "name": "邇ｩ蜈ｷ迢ょ･乗峇 -邨らч-", "musicId": 219, "level": 12, "constant": 12.7, "isExpert": true }, { "artworkURL": "common/img/755fb1e2b79ba896.jpg", "name": "譛ｭ莉倥″縺ｮ繝ｯ繝ｫ縲�槭�繧､繧ｱ繝ｫ縺ｮ縺�◆��", "musicId": 256, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/7e82a95c4bfa983a.jpg", "name": "繧ｲ繧ｷ繝･繧ｿ繝ｫ繝茨ｼ√ユ繧ｹ繝域悄髢難ｼ�ｼ�", "musicId": 266, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/1a532b709f9834b6.jpg", "name": "繝峨Λ繧､繝ｴ繝ｻ繧ｪ繝ｳ繝ｻ繧ｶ繝ｻ繝ｬ繧､繝ｳ繝懊�", "musicId": 249, "level": 12, "constant": 12.7 }, { "artworkURL": "common/img/f04c37ecd99f1d8c.jpg", "name": "TiamaT:F minor", "musicId": 258, "level": 12, "constant": 12.8, "isExpert": true }, { "artworkURL": "common/img/deb8448e3b6a2705.jpg", "name": "繧ｭ繝ｩ繝｡繧ｱ竊担hoot it Now!", "musicId": 440, "level": 12, "constant": 12.9 }, { "artworkURL": "common/img/81805f2ef1e58db8.jpg", "name": "縺ｶ縺�∴縺�!!繧峨＞縺ｰ繧�!!", "musicId": 312, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/d5a47266b4fe0bfe.jpg", "name": "繧ｸ繝ｳ繧ｰ繝ｫ繝吶Ν", "musicId": 159, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/638c42b31d057e48.jpg", "name": "縺ｮ縺ｼ繧鯉ｼ√☆縺吶ａ��ｫ倥＞蝪�", "musicId": 448, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/fae01ef5de4069ac.jpg", "name": "螳ｳ陌ｫ", "musicId": 449, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/c58227eb0d14938c.jpg", "name": "繧､繝ｳ繝薙ず繝悶Ν", "musicId": 293, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/330e57eeeb0fb2cd.jpg", "name": "繝ｩ繧ｯ繧ｬ繧ｭ繧ｹ繝�", "musicId": 281, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/b602913a68fca621.jpg", "name": "蛻晞浹繝溘け縺ｮ豸亥､ｱ", "musicId": 7, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/8ec9a26e11ec1a40.jpg", "name": "繧ｫ繝溘し繝槭ロ繧ｸ繝槭く", "musicId": 223, "level": 13, "constant": 13 }, { "artworkURL": "common/img/d483d1ca2a5e10ff.jpg", "name": "Phantasm Brigade", "musicId": 194, "level": 13, "constant": 13 }, { "artworkURL": "common/img/e6642a96885723c1.jpg", "name": "謔｣驛ｨ縺ｧ豁｢縺ｾ縺｣縺ｦ縺吶＄貅ｶ縺代ｋ�樒汲豌励�蜆ｪ譖�庄髯｢", "musicId": 187, "level": 13, "constant": 13.1 }, { "artworkURL": "common/img/8b145fe4cf0c01bb.jpg", "name": "Imperishable Night 2006 (2016 Refine)", "musicId": 322, "level": 13, "constant": 13.6 }, { "artworkURL": "common/img/266bd38219201fa1.jpg", "name": "蟷ｻ諠ｳ縺ｮ繧ｵ繝�Λ繧､繝�", "musicId": 305, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/17315fb464f265bd.jpg", "name": "譛邨るｬｼ逡懷ｦｹ繝ｻ荳驛ｨ螢ｰ", "musicId": 92, "level": 13, "constant": 13 }, { "artworkURL": "common/img/a2069fdb9d860d36.jpg", "name": "Elemental Creation", "musicId": 232, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/82c76a871596142c.jpg", "name": "Evans", "musicId": 385, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/fddc37caee47286d.jpg", "name": "Blue Noise", "musicId": 33, "level": 13, "constant": 13 }, { "artworkURL": "common/img/8b04b9ad2d49850c.jpg", "name": "Aragami", "musicId": 144, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/e7ee14d9fe63d072.jpg", "name": "Vallista", "musicId": 135, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/478e8835e382f740.jpg", "name": "conflict", "musicId": 138, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/2e95529be9118a11.jpg", "name": "Halcyon", "musicId": 173, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/ae6d3a8806e09613.jpg", "name": "Jack-the-Ripper笳�", "musicId": 197, "level": 13, "constant": 13.1 }, { "artworkURL": "common/img/0b98b8b4e7cfd997.jpg", "name": "DRAGONLADY", "musicId": 19, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/db15d5b7aefaa672.jpg", "name": "Air", "musicId": 317, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/f803d578eb4047eb.jpg", "name": "DataErr0r", "musicId": 318, "level": 13, "constant": 13 }, { "artworkURL": "common/img/282cb1cacd4c1bb4.jpg", "name": "Dreadnought", "musicId": 323, "level": 13, "constant": 13.6 }, { "artworkURL": "common/img/13446730e8b99f0e.jpg", "name": "Strahv", "musicId": 302, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/14edd93cf813cdc2.jpg", "name": "GOODTEK", "musicId": 388, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/f7be4abcf8f3e197.jpg", "name": "Name of oath", "musicId": 389, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/b91503d46e39a754.jpg", "name": "蛻�°繧峨↑縺�", "musicId": 405, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/3e545c372b926197.jpg", "name": "Like the Wind [Reborn]", "musicId": 397, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/45112e2818cf80a2.jpg", "name": "GEMINI -C-", "musicId": 202, "level": 13, "constant": 13.1 }, { "artworkURL": "common/img/b43fef626f5b88cd.jpg", "name": "We Gonna Journey", "musicId": 107, "level": 13, "constant": 13.1 }, { "artworkURL": "common/img/93abb77776c70b47.jpg", "name": "luna blu", "musicId": 76, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/2e6c11edba79d997.jpg", "name": "髢�蕎縺ｮ繝悶Μ繝･繝ｼ繝翫け", "musicId": 141, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/2df15f390356067f.jpg", "name": "Gate of Fate", "musicId": 63, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/c2c4ece2034eb620.jpg", "name": "The wheel to the right", "musicId": 69, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/81e347d3b96b2ae1.jpg", "name": "Tango Rouge", "musicId": 101, "level": 13, "constant": 13 }, { "artworkURL": "common/img/f63fab30a7b6f160.jpg", "name": "Gustav Battle", "musicId": 152, "level": 13, "constant": 13 }, { "artworkURL": "common/img/a62f975edc860e34.jpg", "name": "Cyberozar", "musicId": 52, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/ec3a366b4724f8f6.jpg", "name": "Genesis", "musicId": 72, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/19d57f9a7652308a.jpg", "name": "L'ﾃｩpisode", "musicId": 90, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/2ccf97477eaf45ad.jpg", "name": "GOLDEN RULE", "musicId": 61, "level": 13, "constant": 13.6 }, { "artworkURL": "common/img/989f4458fb34aa9d.jpg", "name": "Philosopher", "musicId": 250, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/4d66e5d1669d79a2.jpg", "name": "Oshama Scramble! (Cranky Remix)", "musicId": 259, "level": 13, "constant": 13 }, { "artworkURL": "common/img/73f86aec8d6c7c9b.jpg", "name": "邏�庄蛻�", "musicId": 229, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/676e59847912f5ca.jpg", "name": "Tidal Wave", "musicId": 262, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/bef9b79c637bf4c9.jpg", "name": "BOKUTO", "musicId": 257, "level": 13, "constant": 13 }, { "artworkURL": "common/img/cd2aebc19c4fa1cd.jpg", "name": "We Gonna Party -Feline Groove Mix-", "musicId": 414, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/fc1cec7d2aeb6ca1.jpg", "name": "縺翫∪縺九○��ｼ√ヨ繝ｩ繝悶Ν繝｡繧､螽倪�縺ｨ繧後�縺｡繧�ｓ", "musicId": 341, "level": 13, "constant": 13.1 }, { "artworkURL": "common/img/6905b5ce0d115340.jpg", "name": "繧ｪ繧ｹ繧ｹ繝｡笘�凾笙笘�〒縺�☆縺ｨ縺ｴ縺�", "musicId": 342, "level": 13, "constant": 13.5 }, { "artworkURL": "common/img/a2f5cd53acbfc981.jpg", "name": "Warcry", "musicId": 253, "level": 13, "constant": 13.1 }, { "artworkURL": "common/img/ae93bd84b68781f6.jpg", "name": "隕夐�讌ｽ螂上Γ繧ｿ繝輔ぅ繧ｯ繧ｷ繝ｧ繝ｳ", "musicId": 310, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/3c61434b8cb2aadf.jpg", "name": "Supersonic Generation", "musicId": 335, "level": 13, "constant": 13.4 }, { "artworkURL": "common/img/a9b25545cd935cc9.jpg", "name": "豺ｷ豐後ｒ雜翫∴縺玲�繧峨′逾櫁＊縺ｪ繧玖ｪｿ蠕倶ｸｻ繧定ｮ�∴繧�", "musicId": 407, "level": 13, "constant": 13, "isExpert": true }, { "artworkURL": "common/img/4d043c46fa9f8adc.jpg", "name": "繝医Μ繧ｹ繝｡繧ｮ繧ｹ繝医せ", "musicId": 437, "level": 13, "constant": 13.2 }, { "artworkURL": "common/img/fe3f9913f056f5bc.jpg", "name": "遶句ｷ晄ｵ�ｩ｢謐慕黄蟶ｳ", "musicId": 433, "level": 13, "constant": 13 }, { "artworkURL": "common/img/f5c04b1858f3b79a.jpg", "name": "逵�繧後〓螟懷菅繧呈Φ繝�", "musicId": 434, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/1ab2b7720caa1c34.jpg", "name": "JIGOKU STATION CENTRAL GATE", "musicId": 435, "level": 13, "constant": 13.3 }, { "artworkURL": "common/img/7f68ccfecfbf4fc6.jpg", "name": "Calamity Fortune", "musicId": 504, "level": 13, "constant": 13.7 }, { "artworkURL": "common/img/19f776c8daa51095.jpg", "name": "Finite", "musicId": 409, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/8205ea9449f1b000.jpg", "name": "逾槫ｨ�", "musicId": 386, "level": 13, "constant": 13.9 }, { "artworkURL": "common/img/08a24ed249ed2eec.jpg", "name": "HAELEQUIN (Original Remaster)", "musicId": 134, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/ed40032f25177518.jpg", "name": "FREEDOM DiVE", "musicId": 196, "level": 13, "constant": 13.7 }, { "artworkURL": "common/img/13a5a9ca35a9b71b.jpg", "name": "Angel dust", "musicId": 137, "level": 13, "constant": 13.7 }, { "artworkURL": "common/img/c7cf3ce1e858e3f0.jpg", "name": "笘�LittlE HearTs笘�", "musicId": 328, "level": 13, "constant": 13.7 }, { "artworkURL": "common/img/de02f8c0217d9baa.jpg", "name": "Dengeki Tube", "musicId": 393, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/993b5cddb9d9badf.jpg", "name": "Garakuta Doll Play", "musicId": 226, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/e03858fb5d391628.jpg", "name": "AMAZING MIGHTYYYY!!!!", "musicId": 538, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/a251c24a3cc4dbf7.jpg", "name": "Contrapasso -inferno-", "musicId": 201, "level": 13, "constant": 13.9 }, { "artworkURL": "common/img/3210d321c2700a57.jpg", "name": "繧ｨ繝ｳ繝峨�繝ｼ繧ｯ縺ｫ蟶梧悍縺ｨ豸吶ｒ豺ｻ縺医※", "musicId": 103, "level": 13, "constant": 13.7 }, { "artworkURL": "common/img/8219519cc94d5524.jpg", "name": "螳帛沁縲∫ｎ荳奇ｼ�ｼ�", "musicId": 106, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/a2fdef9e4b278a51.jpg", "name": "Schrecklicher Aufstand", "musicId": 248, "level": 13, "constant": 13.9 }, { "artworkURL": "common/img/9af4b336821cdcc9.jpg", "name": "Devastating Blaster", "musicId": 234, "level": 13, "constant": 13.9 }, { "artworkURL": "common/img/3c1bda8d023fc1fe.jpg", "name": "Kattobi KEIKYU Rider", "musicId": 441, "level": 13, "constant": 13.8 }, { "artworkURL": "common/img/a732d43fd2a11e8f.jpg", "name": "諤呈ｧ�", "musicId": 180, "level": 14, "constant": 14 }, { "artworkURL": "common/img/246f63902c4b0f89.jpg", "name": "邇ｩ蜈ｷ迢ょ･乗峇 -邨らч-", "musicId": 219, "level": 14, "constant": 14 }, { "artworkURL": "common/img/f04c37ecd99f1d8c.jpg", "name": "TiamaT:F minor", "musicId": 258, "level": 14, "constant": 14 }, { "artworkURL": "common/img/a9b25545cd935cc9.jpg", "name": "豺ｷ豐後ｒ雜翫∴縺玲�繧峨′逾櫁＊縺ｪ繧玖ｪｿ蠕倶ｸｻ繧定ｮ�∴繧�", "musicId": 407, "level": 14, "constant": 14.1 }];
})(Kattobi || (Kattobi = {}));
var Kattobi;
(function (Kattobi) {
    Kattobi.WE_DATA = [{ "artworkURL": "common/img/6287164e1401ed99.jpg", "name": "STAR", "musicId": 8092, "starDifficulty": 7, "type": 9 }, { "artworkURL": "common/img/74bb39c1c5bf4690.jpg", "name": "Star笘�Glitter", "musicId": 8093, "starDifficulty": 5, "type": 1 }, { "artworkURL": "common/img/31134fdf6cbb6e36.jpg", "name": "Starlight Dance Floor", "musicId": 8094, "starDifficulty": 3, "type": 28 }, { "artworkURL": "common/img/3348ec734f33c909.jpg", "name": "縺ｲ縺�縺ｾ繧翫ョ繧､繧ｺ", "musicId": 8095, "starDifficulty": 5, "type": 27 }, { "artworkURL": "common/img/334aeafa3b96de60.jpg", "name": "Dengeki Tube", "musicId": 8089, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/dc57afae3307e09f.jpg", "name": "Schrecklicher Aufstand", "musicId": 8080, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/6ce11469fafb79ad.jpg", "name": "Air", "musicId": 8087, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/82bee9dfce16e9fb.jpg", "name": "縺�繧薙□繧捺掠縺上↑繧�", "musicId": 8084, "starDifficulty": 1, "type": 8 }, { "artworkURL": "common/img/576301d1261c992d.jpg", "name": "Blue Noise", "musicId": 8086, "starDifficulty": 3, "type": 1 }, { "artworkURL": "common/img/b5570c700e7bbf75.jpg", "name": "讙�!蟶晏嵜闖ｯ謦�屮", "musicId": 8081, "starDifficulty": 3, "type": 23 }, { "artworkURL": "common/img/061f9e33441b32cf.jpg", "name": "The wheel to the right", "musicId": 8079, "starDifficulty": 7, "type": 21 }, { "artworkURL": "common/img/0d16cf138fd9ef7b.jpg", "name": "Oshama Scramble! (Cranky Remix)", "musicId": 8091, "starDifficulty": 5, "type": 19 }, { "artworkURL": "common/img/d909dbffd6520902.jpg", "name": "Title", "musicId": 8090, "starDifficulty": 5, "type": 1 }, { "artworkURL": "common/img/ccd2deee3f1e5f16.jpg", "name": "笘�LittlE HearTs笘�", "musicId": 8069, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/3aab4ea58851d73f.jpg", "name": "Gate of Fate", "musicId": 8072, "starDifficulty": 7, "type": 16 }, { "artworkURL": "common/img/c9e53bb1959a87c1.jpg", "name": "The Concept of Love", "musicId": 8073, "starDifficulty": 9, "type": 20 }, { "artworkURL": "common/img/eba6432f34a2df6a.jpg", "name": "Counselor", "musicId": 8063, "starDifficulty": 7, "type": 19 }, { "artworkURL": "common/img/aae4a50abd83560f.jpg", "name": "SAMBISTA", "musicId": 8064, "starDifficulty": 3, "type": 28 }, { "artworkURL": "common/img/2d476ed298982205.jpg", "name": "We Gonna Journey", "musicId": 8065, "starDifficulty": 5, "type": 28 }, { "artworkURL": "common/img/187a65abf20cfa4c.jpg", "name": "The ether", "musicId": 8066, "starDifficulty": 9, "type": 10 }, { "artworkURL": "common/img/0cfed5e962a10117.jpg", "name": "DRAGONLADY", "musicId": 8067, "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/18bb06dd0c680555.jpg", "name": "繧ｸ繝ｳ繧ｰ繝ｫ繝吶Ν", "musicId": 8058, "starDifficulty": 7, "type": 12 }, { "artworkURL": "common/img/a2fc66bdebabc961.jpg", "name": "繧ｨ繝ｳ繝峨�繝ｼ繧ｯ縺ｫ蟶梧悍縺ｨ豸吶ｒ豺ｻ縺医※", "musicId": 8059, "starDifficulty": 9, "type": 11 }, { "artworkURL": "common/img/8ee8eeb30163588f.jpg", "name": "Oshama Scramble!", "musicId": 8053, "starDifficulty": 5, "type": 4 }, { "artworkURL": "common/img/1a830afff4c6894a.jpg", "name": "Alma", "musicId": 8048, "starDifficulty": 3, "type": 20 }, { "artworkURL": "common/img/664482b6c02bb903.jpg", "name": "繝√Ν繝弱�繝代�繝輔ぉ繧ｯ繝医＆繧薙☆縺�蕗螳､", "musicId": 8049, "starDifficulty": 3, "type": 21 }, { "artworkURL": "common/img/824982fd305cf43a.jpg", "name": "蝗槭Ξ��妛譛郁干", "musicId": 8051, "starDifficulty": 5, "type": 22 }, { "artworkURL": "common/img/6a409c7abf7d9dc4.jpg", "name": "Genesis", "musicId": 8043, "starDifficulty": 7, "type": 2 }, { "artworkURL": "common/img/049f3b70251fdb7f.jpg", "name": "Elemental Creation", "musicId": 8045, "starDifficulty": 5, "type": 22 }, { "artworkURL": "common/img/d9bbdad3fb44d260.jpg", "name": "縺�ｍ縺ｯ蜚�", "musicId": 8046, "starDifficulty": 3, "type": 23 }, { "artworkURL": "common/img/6e02ab90458fcf6e.jpg", "name": "髱呈丼縺ｯNon-Stop��", "musicId": 8047, "starDifficulty": 1, "type": 1 }, { "artworkURL": "common/img/763b1886954be49d.jpg", "name": "Your Affection (Daisuke Asakura Remix)", "musicId": 8033, "starDifficulty": 1, "type": 21 }, { "artworkURL": "common/img/877573b3f8a206f9.jpg", "name": "荳隗ｦ蜊ｳ逋ｺ笘�ｦ�ぎ繝ｼ繝ｫ", "musicId": 8034, "starDifficulty": 3, "type": 21 }, { "artworkURL": "common/img/5cc569f26459117b.jpg", "name": "FREEDOM DiVE", "musicId": 8026, "starDifficulty": 9, "type": 2 }, { "artworkURL": "common/img/cbf397f330e040e5.jpg", "name": "B.B.K.K.B.K.K.", "musicId": 8020, "starDifficulty": 7, "type": 13 }, { "artworkURL": "common/img/627b95ef3c728b37.jpg", "name": "繝翫う繝医�繧ｪ繝悶�繝翫う繝�", "musicId": 8008, "starDifficulty": 5, "type": 8 }, { "artworkURL": "common/img/92b5382a4b2f9aa8.jpg", "name": "Scatman (Ski Ba Bop Ba Dop Bop)", "musicId": 8005, "starDifficulty": 5, "type": 2 }, { "artworkURL": "common/img/9a8dae637c5172b2.jpg", "name": "elegante", "musicId": 8029, "starDifficulty": 3, "type": 5 }, { "artworkURL": "common/img/c1ff8df1757fedf4.jpg", "name": "Help me, 縺ゅ�繧翫ｓ��", "musicId": 8025, "starDifficulty": 5, "type": 6 }, { "artworkURL": "common/img/971c362a9b65209e.jpg", "name": "Garakuta Doll Play (sasakure.UK clutter remix)", "musicId": 8024, "starDifficulty": 7, "type": 4 }, { "artworkURL": "common/img/e4c034fc74ff62fc.jpg", "name": "蟷ｾ蝗幃浹-Ixion-", "musicId": 8000, "starDifficulty": 1, "type": 3 }];
    Kattobi.WE_TYPE = {
        23: "豁�",
        21: "驕ｿ",
        6: "蝌�",
        19: "��",
        20: "��",
        16: "謨ｷ",
        10: "蜑ｲ",
        1: "諡�",
        2: "迢�",
        3: "豁｢",
        5: "荳｡",
        12: "蠑ｾ",
        13: "謌ｻ",
        11: "霍ｳ",
        4: "謾ｹ",
        9: "蜈�",
        22: "騾�",
        8: "譎�",
        28: "隕�",
        27: "阡ｵ",
    };
})(Kattobi || (Kattobi = {}));
//# sourceMappingURL=kattobi.js.map