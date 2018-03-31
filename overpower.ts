namespace Kattobi.OverPower {
  export function showHigherLevelsOP(lv: number = 14, isPlus: boolean = false) {
    if (lv == 12) return
    showLevelOP(lv, isPlus, () => {
      isPlus ? showHigherLevelsOP(lv, false) : showHigherLevelsOP(lv - 1, true)
    })
  }

  export function showLevelOP(lv: number, isPlus: boolean, callback) {
    calcLevelOP(lv, isPlus, (op: number, max: number) => {
      let trunOp = Math.floor(op * 100.0) / 100.0
      let trunMax = Math.floor(max * 100.0) / 100.0
      let trunPercentage = Math.floor(op / max * 10000) / 100.0

      let opElm = $("<div>")
        .css("color", "white")
        .css("padding", "5px")
        .css("backgroundColor", "#f4048b")
        .html(`Lv${lv}${isPlus ? "+" : ""} OP: <strong>${trunOp.toFixed(2)}/${trunMax.toFixed(2)} ${trunPercentage}%</strong>`)
      $("#main_menu").append(opElm)

      callback()
    })
  }

  // 未解禁曲含めて計算するので注意
  export function calcLevelOP(lv: number, isPlus: boolean, callback) {
    Machine.getMusicsLevel(lv, (records: any[]) => {
      let [op, max] = records.reduce((prev, record) => {
        let track = MUSIC_DATA.find(t => t.musicId == record.musicId && t.level == record.level)
        if (track === undefined) console.log(record.name, lv)

        let fraction = parseFloat("0." + String(track.constant).split(".")[1] || "0")
        if ((isPlus && fraction >= 0.7) || (!isPlus && fraction <= 0.6)) {
          if (record.scoreMax === undefined) {
            return [prev[0], prev[1] + calcMaxOP(track.constant)]
          }
          return [prev[0] + calcSongOP(track.constant, record), prev[1] + calcMaxOP(track.constant)]
        }
        return prev
      }, [0, 0])

      callback(op, max)
    })
  }

  export function calcSongOP(constant, record) {
    let op = constant

    if (record.scoreMax == 1010000) {
      op += 0.25
    } else if (record.isAJ) {
      op += 0.2
    } else if (record.isFC) {
      op += 0.1
    }

    switch (record.rank) {
      case 10: // SSS
        op += 2
        op += 0.75 * (record.scoreMax - 1007500) / 2500
        break
      case 9: 
        if (record.scoreMax >= 1005000) { // SS+
          op += 1.5
          op += 0.5 * (record.scoreMax - 1005000) / 2500
        } else { // SS
          op += 1
          op += 0.5 * (record.scoreMax - 1000000) / 5000
        }
        break
      case 8:
      case 7:
      case 6:
      case 5: // S ~ A
        op += 1 * (record.scoreMax - 975000) / 25000
        break
      default:
        op = 0
        break
    }

    console.log(op * 5, constant, record.name)

    return op * 5
  }

  export function calcMaxOP(constant) {
    return (constant + 3) * 5
  }
}