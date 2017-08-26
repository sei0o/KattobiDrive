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
      .html("WEフィルテーブルを生成")
      .on("click", Kattobi.generateWEFillTable)
      .appendTo("#main_menu")
  }
}

Kattobi.setup()