namespace Kattobi.Batch {
  export const WE_MUSIC_COUNT = 41
  // Lv11-14以外はまともに更新していない
  export const MUSIC_COUNT = [-1, 8, 77, 234, 76, 161, 127, 60, 122, 163, 93, 156, 182, 77, 5]

  export function generateMusicData() {
    Machine.getHigherLvMusics(musics => {
      let datalist = []
      console.log(musics)
      musics.forEach((m, i) => {
        setTimeout(() => {
          console.log(`Fetching: ${i}`)
          let existedData = MUSIC_DATA.find(t => { return t.musicId == m.musicId && t.level == m.level })
          let dat = {
            name: m.name,
            musicId: m.musicId,
            level: m.level,
            constant: existedData !== undefined ? existedData.constant : 0.0,
            isExpert: existedData !== undefined ? existedData.isExpert : false,
            artworkURL: ""
          }
          if (existedData !== undefined) {
            dat.artworkURL = existedData.artworkURL
            datalist.push(dat)
            if (i == MUSIC_COUNT[11] + MUSIC_COUNT[12] + MUSIC_COUNT[13] + MUSIC_COUNT[14] - 1) {
              console.log(JSON.stringify(datalist))
            }
          } else {
            Machine.getArtwork(m.musicId, url => {
              datalist.push({
                artworkURL: url,
                name: m.name,
                musicId: m.musicId,
                level: m.level,
                constant: existedData !== undefined ? existedData.constant : 0.0,
                isExpert: existedData !== undefined ? existedData.isExpert : false,
              })

              if (i == MUSIC_COUNT[11] + MUSIC_COUNT[12] + MUSIC_COUNT[13] + MUSIC_COUNT[14] - 1) {
                console.log(JSON.stringify(datalist))
              }
            })
          }
        }, 500 * i)
      })
    })
  }

  export function generateWEData() {
    Machine.getWEMusics(musics => {
      let datalist = []
      musics.forEach((m, i) => {
        setTimeout(() => {
          console.log(`Fetching: ${i}`)
          Machine.getArtwork(m.musicId, url => {
            datalist.push({
              artworkURL: url,
              name: m.name,
              musicId: m.musicId,
              starDifficulty: m.starDifficulty,
              type: m.type
            })

            if (i >= WE_MUSIC_COUNT - 1) {
              console.log(JSON.stringify(datalist))
            }
          })
        }, 500 * i)
      })
    })
  }

}