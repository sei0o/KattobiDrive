/// <reference path="lib/jquery/index.d.ts" />

namespace Kattobi {
  export const SERVER_ENDPOINT = "http://localhost:8000/net"

  export function setup() {
    console.log("Loaded KattobiDrive!")
    $("body").css("backgroundColor", "#09f")

    initButtons()
  }

  function initButtons() {
    $("<button>")
      .html("フィルテーブルを生成")
      .on("click",() => {
        Kattobi.generateFillTable(false)
      })
      .appendTo("#main_menu")
    $("<button>")
      .html("WEフィルテーブルを生成")
      .on("click", Kattobi.generateWEFillTable)
      .appendTo("#main_menu")
    $("<button>")
      .html("OPを計算(Lv13~14) [試験運用]")
      .on("click", () => {
        Kattobi.OverPower.showHigherLevelsOP()
      })
      .appendTo("#main_menu")
  }
}

Kattobi.setup()