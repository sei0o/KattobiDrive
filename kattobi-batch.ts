namespace Kattobi.Batch {
  export function generateMusicData() {
    Promise.all([Machine.getConstants(), Machine.getHigherLvMusics()])
    .then(([constants, musics]) => {
      return Promise.all(musics.map((m, i) => {
        let constantTrack = constants.find(t => { return t.musicId == m.musicId && Math.floor(t.level) == m.level })
        let constant = constantTrack ? constantTrack.constant : 0.0
        let existedData = MUSIC_DATA.find(t => { return t.musicId == m.musicId && Math.floor(t.level) == m.level })

        return new Promise((resolve, reject) => {
          setTimeout(resolve, 500 * i) // 間隔を開ければジャケは正しくとれるようになるが…
        })
        .then(() => {
          if (existedData === undefined) return Machine.getArtwork(m.musicId)
        })
        .then(url => {
          console.log(`Got: ${i}`)
          return {
            name: m.name,
            musicId: m.musicId,
            level: m.level,
            constant: constant,
            isExpert: existedData !== undefined ? existedData.isExpert : false,
            artworkURL: url || existedData.artworkURL
          }
        })
      }))
    })
    .then(datalist => {
      showData(JSON.stringify(datalist))
    })
  }

  export function generateWEData() {
    Machine.getWEMusics().then(musics => {
      return Promise.all(musics.map((m, i) => {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, 500 * i)
        })
        .then(() => { return Machine.getArtwork(m.musicId) })
        .then(url => {
          console.log(`Got: ${i}`)
          return {
            artworkURL: url,
            name: m.name,
            musicId: m.musicId,
            starDifficulty: m.starDifficulty,
            type: m.type
          }
        })
      }))
    })
    .then(datalist => {
      showData(JSON.stringify(datalist))
    })
  }

  function showData(string) {
    let wi = window.open()
    wi.document.open()
    wi.document.write(`<pre>${string}</pre>`)
    wi.document.close()   
  }

}