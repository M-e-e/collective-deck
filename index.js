async function showDeck(){
    // refresh page
    var container_right = document.getElementById("container-right");
    container_right.remove();

    var outer_container_right = document.getElementById("outer-container-right");
    outer_container_right.innerHTML = '<div id="container-right"></div>';

    public_cards_data = await (await fetch('https://server.collective.gg/api/public-cards/')).json();

    var lines = $('textarea').val().split('\n');
    for(var i = 0;i < lines.length;i++){
        if(lines[i].charAt(0) == '#'){
            continue;
        }
        var count = lines[i].charAt(0);

        var link_name = lines[i].substring(2);
        var card_id = '';
        if(link_name.endsWith('.png')){
            card_id = /(?<=\/p\/cards\/)(.*?)(?=...png)/.exec(link_name);
            await createBox(link_name, card_id[0], count);
        }

        else{
            //console.log(public_cards_data);
            for(var card of public_cards_data.cards){
                //console.log('cardname: '+card.name);
                //console.log('linkname: '+link_name);
                if(card.name == link_name){
                    card_id = /(?<=\/p\/cards\/)(.*?)(?=...png)/.exec(card.imgurl);
                    await createBox(card.imgurl, card_id[0], count);
                  }
                }
            }
      }
}

async function createBox(card_url, card_id, count){
    console.log("createBox");
    card_data = await (await fetch('https://server.collective.gg/api/card/'+card_id)).json();

      // find correct Property index
      var props = card_data.card.Text.Properties;
      var url_index = 0;
      for(var i = 0; i < props.length; i++){
        if(props[i].Symbol.Name == 'PortraitUrl'){
          url_index = i;
          break;
        }
      }

      var box = document.createElement("a");
      box.setAttribute("href", card_url);
      box.setAttribute("target", "_blank");
      box.classList.add('card-box');
      box.style.backgroundImage = 'url('+card_data.card.Text.Properties[url_index].Expression.Value+')';
      box.innerHTML = '<img src="'+card_url+'" class="tooltip-image"><div class="card-count-box"><p class="card-count-value">'+count+'</p></div><p class="card-text">'+card_data.card.Text.Name+'</p>';

      document.getElementById('container-right').appendChild(box);
}