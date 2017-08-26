namespace KattobiMachine {
  export function getWEMusics(callback) {
    $.get("/mobile/WorldsEndMusic.html", (data) => {
      let recordElms = $(data).find(".w388.musiclist_box.bg_worldsend");
      let records = []
      recordElms.each((idx, elm) => {
        let rec: any = {
          name: $(elm).find(".musiclist_worldsend_title").html(),
          musicId: $(elm).find(".musiclist_worldsend_title").attr("onclick").substr(54, 4),
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

}