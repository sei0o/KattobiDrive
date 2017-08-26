namespace KattobiBatch {
  export const WE_MUSIC_COUNT = 41

  export function generateWEData() {
    KattobiMachine.getWEMusics(musics => {
      let datalist = []
      musics.forEach((m, i) => {
        setTimeout(() => {
          console.log(`Fetching: ${i}`)
          KattobiMachine.getWEArtwork(m.musicId, url => {
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