async function showDeck(){
    // disable button until finished
    var show_deck_btn = document.getElementById("show-deck-btn");
    show_deck_btn.disabled = true;

    // refresh page
    var container_right = document.getElementById("container-right");
    container_right.remove();

    // card counter
    var card_counter = 0;

    var outer_container_right = document.getElementById("outer-container-right");
    outer_container_right.innerHTML = '<div id="container-right"></div>';

    public_cards_data = await (await fetch('https://server.collective.gg/api/public-cards/')).json();

    var lines = $('textarea').val().split('\n');
    for(var i = 0;i < lines.length;i++){
        if(lines[i].charAt(0) == '#'){
            continue;
        }
        var count = lines[i].charAt(0);
        card_counter += parseInt(count);
        document.getElementById("card-count").innerHTML = "Card Count: " + card_counter;

        var link_name = lines[i].substring(2);
        var card_id = '';
        if(link_name.endsWith('.png')){
            card_id = /(?<=\/p\/cards\/)(.*?)(?=...png)/.exec(link_name);
            await createBox(link_name, card_id[0], count);
        }
        else if(/([a-z]|[0-9]){8}-([a-z]|[0-9]){4}-([a-z]|[0-9]){4}-([a-z]|[0-9]){4}-([a-z]|[0-9]){12}/.test(link_name)){
            card_data = await (await fetch('https://server.collective.gg/api/card/'+link_name)).json();
            var externals_suffix = "";
            if(Object.keys(card_data.externals).length > 0)
                externals_suffix = "-m";
            else{
                externals_suffix = "-s";
            }

            var link = 'https://files.collective.gg/p/cards/' + link_name + externals_suffix + '.png';

            await createBox(link, link_name,count);
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

      //enable button again when finished
      show_deck_btn.disabled = false;
}

// TODO: figure out px for tooltip size increase

async function createBox(card_url, card_id, count){
    console.log("createBox");
    card_data = await (await fetch('https://server.collective.gg/api/card/'+card_id)).json();

      
      var url_properties = findProperty(card_data.card.Text.Properties, 'PortraitUrl');
      
      var tooltip_width = adjustedTooltipSize();

      var box = document.createElement("a");
      box.setAttribute("href", card_url);
      box.setAttribute("target", "_blank");
      box.classList.add('card-box');
      box.style.backgroundImage = 'url('+url_properties.Expression.Value+')';
      box.innerHTML = '<img src="'+card_url+'" class="tooltip-image" width="'+tooltip_width+'"><div class="card-count-box"><p class="card-count-value">'+count+'</p></div><p class="card-text">'+card_data.card.Text.Name+'</p>';

      document.getElementById('container-right').appendChild(box);
}

function findProperty(parent_node, symbol_name){
    // find correct Property index
    var property = 0;
    for(var i = 0; i < parent_node.length; i++){
        if(parent_node[i].Symbol.Name == symbol_name){
            return parent_node[i];
        }
    }
    return "";
}

// TODO: numbers need to be adjusted more but it's good enough now
// Rockslide is a good example of a card with predefines in blocks but not in text
function adjustedTooltipSize(){
    var tooltip_width = 340;
    
    // use externals count
    var externals_count = Object.keys(card_data.externals).length;
    tooltip_width += 140 * externals_count;
    //console.log(externals_count);
        
    // use flavor text OR keyword
    var flavor_properties = findProperty(card_data.card.Text.Properties, 'FlavorText');
    if(flavor_properties){
      tooltip_width += 60;
      return tooltip_width;
      //console.log("Flavored: " + flavor_properties.Expression.Value);
    }
      
    // idea: stringify json and check if it contains 'Predefines'
    // exclude Predefines.PlayUnit & Predefines.PlaySpell
    var temp_json = JSON.stringify(card_data);
    temp_json = temp_json.replace('Predefines.PlaySpell', '');
    temp_json = temp_json.replace('Predefines.PlayAbility', '');
    //console.log(temp_json.includes('Predefines'));

    
    if(temp_json.includes('Predefines')){
        tooltip_width += 60;  
        //console.log(card_url);
    }
    else{
      var parent_node = card_data.card.Text.Abilities;
      for(var i = 0; i < parent_node.length; i++){
          if(parent_node[i].$type.startsWith('Predefines')){
              tooltip_width += 60;
              break;
              //console.log(card_url);         
          }
      }
    }
    

    return tooltip_width;
}