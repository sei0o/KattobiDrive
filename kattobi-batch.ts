namespace KattobiBatch {
  export const WE_MUSIC_COUNT = 41
  export const MUSIC_COUNT = [-1, 8, 77, 234, 76, 161, 127, 60, 122, 163, 89, 152, 167, 72, 4]

  export function generateMusicData() {
    KattobiMachine.getHigherLvMusics(musics => {
      let datalist = []
      console.log(musics)
      musics.forEach((m, i) => {
        setTimeout(() => {
          console.log(`Fetching: ${i}`)
          KattobiMachine.getArtwork(m.musicId, url => {
            datalist.push({
              artworkURL: url,
              name: m.name,
              musicId: m.musicId,
              level: m.level,
              constant: m.constant
            })

            if (i >= MUSIC_COUNT[11] + MUSIC_COUNT[12] + MUSIC_COUNT[13] + MUSIC_COUNT[14] - 1) {
              console.log(JSON.stringify(datalist))
            }
          })
        }, 500 * i)
      })
    })
  }

  export function generateWEData() {
    KattobiMachine.getWEMusics(musics => {
      let datalist = []
      musics.forEach((m, i) => {
        setTimeout(() => {
          console.log(`Fetching: ${i}`)
          KattobiMachine.getArtwork(m.musicId, url => {
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