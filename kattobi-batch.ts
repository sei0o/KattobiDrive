namespace Kattobi.Batch {
  export const WE_MUSIC_COUNT = 55

  export function generateMusicData() {
    Promise.all([Machine.getConstants(), Machine.getHigherLvMusics()])
      .then(([constants, musics]) => {
        let musicCount = musics.length
        console.log(`Length: ${musicCount}`)

        let datalist = []
        console.log(musics)
        musics.forEach((m, i) => {
          setTimeout(() => {
            console.log(`Fetching: ${i}`)
            let constantTrack = constants.find(t => { return t.musicId == m.musicId && Math.floor(t.level) == m.level })
            let constant = constantTrack ? constantTrack.constant : 0.0
            let existedData = MUSIC_DATA.find(t => { return t.musicId == m.musicId && Math.floor(t.level) == m.level })
            let dat = {
              name: m.name,
              musicId: m.musicId,
              level: m.level,
              constant: constant,
              isExpert: existedData !== undefined ? existedData.isExpert : false,
              artworkURL: ""
            }
            if (existedData !== undefined) {
              dat.artworkURL = existedData.artworkURL
              datalist.push(dat)
              if (i == musicCount - 1) {
                showData(JSON.stringify(datalist))
              }
            } else {
              Machine.getArtwork(m.musicId).then(url => {
                datalist.push({
                  artworkURL: url,
                  name: m.name,
                  musicId: m.musicId,
                  level: m.level,
                  constant: constant,
                  isExpert: existedData !== undefined ? existedData.isExpert : false,
                })

                if (i == musicCount - 1) {
                  showData(JSON.stringify(datalist))
                }
              })
            }
        }, 500 * i)
      })
    })
  }

  export function generateWEData() {
    Machine.getWEMusics().then(musics => {
      let datalist = []
      musics.forEach((m, i) => {
        setTimeout(() => {
          console.log(`Fetching: ${i}`)
          Machine.getArtwork(m.musicId).then(url => {
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

  function showData(string) {
    let wi = window.open()
    wi.document.open()
    wi.document.write(`<pre>${string}</pre>`)
    wi.document.close()   
  }

}