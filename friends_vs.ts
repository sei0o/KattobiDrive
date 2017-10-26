namespace Kattobi.FriendsVs { 
  export function setup() {
    // restoreFavorite(setupFriends)
  }

  // 一時的にUnFavoriteになっているフレンドを戻す
  export function restoreFavorite(callback?: (() => void)) {
    if (localStorage.getItem("tempFavoriteFriend")) {
      replaceFavorite(localStorage.getItem("tempUnFavoriteFriend"), localStorage.getItem("tempFavoriteFriend"), () => {
        localStorage.removeItem("tempFavoriteFriend")
        localStorage.removeItem("tempUnFavoriteFriend")
        if (callback) callback()
      })
    } else {
      if (callback) callback()
    }
  }

  function setupFriends() {
    Machine.getFriends(friends => {
      $("select[name='friend']")
        .empty()
        .on("change", () => {
          let code = $("select[name='friend']").val() as string
          restoreFavorite(() => {
            // 一時的に選択されたものをお気に入りにする
            replaceFavorite(code, friends[0].code, () => {
              localStorage.setItem("tempFavoriteFriend", code)
              localStorage.setItem("tempUnFavoriteFriend", friends[0].code)

              setupFriends()
            })
          })
        })

      friends.forEach(f => {
        let el = $("<option>")
          .attr("class", "narrow01 w280 mt_20 option")
          .val(f.code)
          .html(f.favorite ? `[Fav] ${f.name}` : f.name)
          .appendTo("select[name='friend']")
      }) 
    })
  }

  export function replaceFavorite(codeToAdd: string, codeToRemove: string, callback: (() => void)) {
    Machine.removeFavoriteFriend(codeToRemove, () => {
      Machine.addFavoriteFriend(codeToAdd, callback)
    })
  }
}