namespace Kattobi.Machine {
  export function getWEMusics(callback) {
    $.get("/mobile/WorldsEndMusic.html", (data) => {
      let recordElms = $(data).find(".w388.musiclist_box.bg_worldsend");
      let records = []
      recordElms.each((idx, elm) => {
        let rec: any = {
          name: $(elm).find(".musiclist_worldsend_title").html(),
          musicId: parseInt($(elm).find(".musiclist_worldsend_title").attr("onclick").substr(54, 4)),
          starDifficulty: parseInt($(elm).find(".musiclist_worldsend_star > img").attr("src").substr(26, 1), 10),
          type: parseInt($(elm).find(".musiclist_worldsend_icon > img").attr("src").substr(22, 2))
        }
        if ($(elm).find(".text_b").html()) {
            rec.scoreMax = parseInt($(elm).find(".text_b").html().split(",").join(""))
            rec.rank = parseInt($(elm).find(".play_musicdata_icon img[src*='rank']").attr("src").substr(24, 1))
            rec.isAJ = !!$(elm).find("img[src*='alljustice']").length
            rec.isFC = !!$(elm).find("img[src*='fullcombo']").length
            rec.fullChain = !!$(elm).find("img[src*='fullchain']").length
        }
        records.push(rec)
      })
      
      callback(records)
    })
  }

  export function getWEArtwork(musicId, callback){
    $.post("/mobile/WorldsEndMusic.html", {
      musicId: musicId,
      music_detail: "music_detail"
    }, data => {
      let url = $(data).find(".play_jacket_img img").first().attr("src")
      callback(url)
    })
  }

  export function getHigherLvMusics(callback) {
    let records = []
    let loaded = []
    for(let lv of [11, 12, 13, 14]) {
      setTimeout(() => {
        getMusicsLevel(lv, musics => {
          loaded.push(lv)
          console.log(`Fetched Music Data: ${lv} * ${musics.length} (${loaded})`)
          records[lv-11] = musics
          if (loaded.length === 4) callback(records.reduce((a, b) => { return a.concat(b) }))
        })
      }, 2000 * (lv-10))
    }
  }

  export function getMusicsLevel(level, callback) {
    $.post("/mobile/MusicLevel.html", {
        selected: level,
        changeSelect: "changeSelect"
      }, data => {
      let recordElms = $(data).find(".w388.musiclist_box");
      let records = []
      recordElms.each((idx, elm) => {
        let rec: any = {
          name: $(elm).find(".music_title").html(),
          musicId: parseInt($(elm).find(".music_title").attr("onclick").substr(54, 4)),
          level: level,
        }
        if ($(elm).find(".text_b").html()) {
            rec.scoreMax = parseInt($(elm).find(".text_b").html().split(",").join(""))
            rec.rank = parseInt($(elm).find(".play_musicdata_icon img[src*='rank']").attr("src").substr(24, 2))
            rec.isAJ = !!$(elm).find("img[src*='alljustice']").length
            rec.isFC = !!$(elm).find("img[src*='fullcombo']").length
            rec.fullChain = !!$(elm).find("img[src*='fullchain']").length
        }
        records.push(rec)
      })
      
      callback(records)
    })
  }

  export function getArtwork(musicId, callback) {
    $.post("/mobile/MusicLevel.html", {
      musicId: musicId,
      music_detail: "music_detail"
    }, data => {
      let url = $(data).find(".play_jacket_img img").first().attr("src")
      callback(url)
    })
  }
}