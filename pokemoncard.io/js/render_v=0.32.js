function renderArticleCard(data, widths = {w1: '50%', w2: '50%'}) {
    let article_card = `<div class="p-2 deck_article-card-container" style="--w1: ${widths.w1}; --w2: ${widths.w2};">
            <div class="d-flex position-relative rounded deck_article-card lazy" data-src="${data.article_image || data.image_card}" title="${data.deck_name || data.title}">
                <div class="d-flex flex-column justify-content-between w-100 rounded deck_article-card-overlay">
                    <span class="align-self-start m-2 text-center rounded-pill article-type-badge">${(data.format || data.type) || 'Article'}</span>
                    <div class="d-flex flex-column text-white text-left p-2 rounded-bottom deck_article-card-details">
                        <a href="/article/${data.pretty_url}/" class="stretched-link text-decoration-none text-reset text-truncate deck_article-card-title">${data.deck_name || data.title}</a>
                        ${data.excerpt ? `<span class="text-truncate deck_article-card-excerpt">${data.excerpt}</span>` : ''}
                        <div class="d-flex align-items-baseline">
                            <span class="deck_article-avatar mr-1"><img src="${data.img_url}" loading="lazy"></span>
                            <div class="d-flex flex-wrap flex-grow-1 deck_article-card-stats">
                                <span class="text-truncate mr-1">${data.username}</span>
                                <div class="d-flex justify-content-between flex-wrap flex-grow-1" style="column-gap: 8px;">
                                    <span class="text-nowrap">- ${data.submit_date}</span>
                                    <div class="d-flex align-items-center">
                                        <span class="mr-2"><i class="fa-solid fa-eye"></i> ${data.deck_views || data.deck_views === 0 ? data.deck_views.toLocaleString() : data.views.toLocaleString()}</span>
                                        <span><i class="fa-solid fa-messages"></i> ${data.comments}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    return article_card;
}

// Used in search modal
function renderArticleListItem(data) {
    let article_list_item = `<a class="text-decoration-none w-100" href="/article/${data.pretty_url}">
            <div class="d-flex align-items-center s_m-article-li">
                <div class="d-flex justify-content-center align-items-center s_m-article-li-img-frame">
                    <img data-src="${data.image_card}" class="article-li-img-lazy">
                </div>
                <div class="d-flex flex-column" style="padding: 8px; gap: 8px;">
                    <span class="s_m-article-li-title" style="font-weight: 700;">${data.title}</span>
                    <div class="d-flex align-items-center text-primary" style="gap: 2px; font-size: 13px;">
                        <span class="deck_article-avatar"><img src="${data.img_url ? data.img_url : ''}" title="${data.username} avatar" loading="lazy"></span>
                        ${data.username}
                    </div>
                    <div class="d-flex s_m-article-li-stats" style="gap: 8px; font-size: 13px;">
                        <span><i class="fa-solid fa-eye"></i> ${data.views.toLocaleString()}</span>
                        <span><i class="fa-solid fa-messages"></i> ${data.comments}</span>
                        <span><i class="fa-solid fa-clock"></i> ${data.submit_date}</span>
                    </div>
                </div>
            </div>
        </a>`;
    return article_list_item;
}

function renderGridDeckCards(container, decks, {mode, clearContainer = true, widths = {w1: '50%', w2: '50%'}} = {}) {
    const ctr = jQuery(container);

    if (clearContainer === true) {
        ctr.empty();
    }
    
    for (const deck of decks) {
        const elem = jQuery(
            '<div class="p-2 deck_article-card-container" style="--w1: ' + widths.w1 + '; --w2: ' + widths.w2 + ';">'+
                '<div class="d-flex position-relative rounded deck_article-card lazy">'+
                    '<div class="d-flex flex-column justify-content-between w-100 rounded deck_article-card-overlay">'+
                        '<div class="d-flex flex-wrap p-2" style="gap: 4px;">'+
                            '<div class="d-flex flex-grow-1"><span class="rounded-pill deck-type-badge text-center"></span></div>'+
                            '<div class="d-flex align-items-start flex-wrap text-white" style="gap: 4px;">'+
                                '<div class="px-1 rounded-pill deck-cost-badge"><i class="fa-solid fa-cart-shopping"></i></div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="d-flex flex-column text-white text-left p-2 rounded-bottom deck_article-card-details">'+
                            '<a class="stretched-link text-decoration-none text-reset text-truncate deck_article-card-title"></a>'+
                            '<span class="text-truncate deck_article-card-excerpt"></span>'+
                            '<div class="d-flex align-items-baseline">'+
                                '<span class="deck_article-avatar mr-1"></span>'+
                                '<div class="d-flex flex-wrap flex-grow-1 deck_article-card-stats">'+
                                    '<span class="text-truncate mr-1"></span>'+
                                    '<div class="d-flex justify-content-between flex-wrap flex-grow-1" style="column-gap: 8px;">'+
                                        '<span class="text-nowrap"></span>'+
                                        '<div class="d-flex align-items-center">'+
                                            '<span class="mr-2"><i class="fa-solid fa-eye"></i> </span>'+
                                            '<span><i class="fa-solid fa-messages"></i> </span>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'
        ).appendTo(ctr);

        // determine if format is tournament (useful in pages where "mode" can't be used because format is varied. E.g., card pages, deck search, etc.)
        const isTournament = deck.format.toLowerCase().includes('tournament meta decks');

        // if there's no cover_card, use a card from main_deck
        let coverCard = '';
        if (deck.cover_card) {
            coverCard = deck.cover_card;
        } else if (deck.main_deck) {
            const maindeckarray = JSON.parse(deck.main_deck);
            coverCard = maindeckarray[0];
        }

        elem.find('a').attr('href', '/deck/' + deck.pretty_url);
        elem.find('.deck_article-card').attr('title', deck.deck_name).attr('data-src', 'https://images.pokemoncard.io/images/' + coverCard.split("-")[0] + '/' + coverCard + '_hiresopt.jpg');
        elem.find('.deck_article-card-title').text(deck.deck_name);
        if (mode === 'tournament' || isTournament) {
            elem.find('.deck_article-card-overlay').children().first().children().eq(1).remove(); // removes deck price
            if (deck.tournamentName) {
                elem.find('.deck-type-badge').text(deck.tournamentName);
                elem.find('.deck_article-card-excerpt').remove();
                elem.find('.deck_article-avatar').remove();
                elem.find('.deck_article-card-stats').removeClass('d-flex flex-wrap flex-grow-1');

                const placement = '<i class="fa-solid fa-trophy" aria-hidden="true"></i> ' + deck.tournamentPlacement;
                const playerCount = '(' + (deck.tournamentPlayerCountIsApproximate ? '~' : '') + deck.tournamentPlayerCount + ' players)';
                const tournamentDate = '<i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + deck.submit_date;
                elem.find('.deck_article-card-stats').html(placement + ' ' + playerCount + ' ' + tournamentDate);
                if (deck.tournamentPlayerName) {
                    elem.find('.deck_article-card-stats').append(' piloted by <i class="fa-solid fa-user" aria-hidden="true"></i> ' + deck.tournamentPlayerName);
                }
            } else {
                elem.find('.deck-type-badge').parent().remove(); // removes deck format
                elem.find('.deck_article-card-excerpt').text(deck.deck_excerpt);
                elem.find('.deck_article-card-details').children('div').remove(); // removes everything below deck excerpt
            }
        } else {
            elem.find('.deck-type-badge').text(deck.format);
            elem.find('.deck-cost-badge').first().appendText(deck.deck_price ? ' $' + deck.deck_price : ' -');
            elem.find('.deck_article-card-excerpt').text(deck.deck_excerpt);
            elem.find('.deck_article-avatar').html('<img src="' + deck.img_url + '" loading="lazy">');

            elem.find('.deck_article-card-stats').children('span').text(deck.username);
            elem.find('.deck_article-card-stats').children('div').children('span').text('- ' + deck.submit_date);
            elem.find('.deck_article-card-stats').children('div').children('div').children().first().appendText(deck.deck_views.toLocaleString());
            elem.find('.deck_article-card-stats').children('div').children('div').children().eq(1).appendText(deck.comments);
        }
    }
    
    ctr.find('.lazy').Lazy({
        // your configuration goes here
        defaultImage: "https://images.pokemoncard.io/images/assets/CardBack.jpg",
        scrollDirection: 'vertical',
        effect: "fadeIn",
        effectTime: 500,
        threshold: 0,
        visibleOnly: true,
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    }); 
}

function getPieChart(sel) {
    let elm = sel;
    if (typeof(sel) === 'string')
        elm = document.querySelector(sel);
    if (!elm) { console.warn('Piechart with selector \''+sel+'\' not found.'); return null; }
    if (!elm.classList.contains('piechart-container')) {
        console.log('Element with selector \''+sel+'\' is not a pie chart (.piechart-container missing).');
        return null;
    }
    return elm;
}

function initPiechart(sel, total) {
    const pie = getPieChart(sel);
    if (!pie) return;
    jQuery(pie).empty();
    pie.piechartCurrent = 0;
    pie.piechartTotal = total;
}

function getPiechartRenderProgress(sel) {
    const pie = getPieChart(sel);
    if (!pie) return { current: 0, total: 0 };
    return { current: pie.piechartCurrent, total: pie.piechartTotal };
}

function renderPieSlice(sel, label, img, value, onClick) {
    const pie = getPieChart(sel);
    if (!pie) return;
    
    const slice = 
      jQuery('<span class="piechart-slice"></span>')
        .prop('title', label+' ('+value+')')
        .css('background-image', img);
        
    if (value < pie.piechartTotal) {

        // pie chart math; we go from -pi/2 to 3pi/2
        let startingRadians = 2*Math.PI * ((pie.piechartCurrent / pie.piechartTotal)-.25);
        pie.piechartCurrent += value;
        let endingRadians = 2*Math.PI * ((pie.piechartCurrent / pie.piechartTotal)-.25);
        
        // sector 0: top-right, sector 1: bottom-right, sector 2: bottom-left, sector 3: top-left
        const extremesPerSector = ['calc(100% - 2px) 0%','calc(100% - 2px) calc(100% - 2px)','0% calc(100% - 2px)','0% 0%'];
        
        /* transforms a x,y pair in [-1,1] to a polygon point; d is the pixel offset clockwise */
        const pointForXY = ((x,y,d) => ('calc('+((1+x)*50)+'% - '+d*y+'px) calc('+((1+y)*50)+'% + '+d*x+'px)'));
        
        /* maps a x,y pair in [-1,1] to a sector index from 0 to 3 (clockwise starting at the top, so 0 = top-right) */
        const sectorForXY = ((x,y) => ((x >= 0) ? ((y <= 0) ? 0 : 1) : ((y >= 0) ? 2 : 3)));
        const startingX = Math.cos(startingRadians);
        const startingY = Math.sin(startingRadians);
        const startingSector = sectorForXY(startingX, startingY);
        const endingX = Math.cos(endingRadians);
        const endingY = Math.sin(endingRadians);
        const endingSector = sectorForXY(endingX, endingY);
        
        const middleX = Math.cos((startingRadians + endingRadians) / 2);
        const middleY = Math.sin((startingRadians + endingRadians) / 2);
        
        let clipPath = ['calc(50% + '+middleX*2+'px) calc(50% + '+middleY*2+'px)'];
        clipPath.push(pointForXY(startingX, startingY, +2));
        for (let i=startingSector; i<=endingSector; ++i) {
            clipPath.push(extremesPerSector[i]);
        }
        clipPath.push(pointForXY(endingX, endingY, -2));
        
        // background position
        const leftEdge = (((startingSector <= 2) && (2 < endingSector)) ? -1 : Math.min(startingX, endingX, 0))/2+.5;
        const rightEdge = (((startingSector <= 0) && (0 < endingSector)) ? 1 : Math.max(startingX, endingX, 0))/2+.5;
        const topEdge = Math.min(startingY, endingY, 0)/2+.5;
        const bottomEdge = (((startingSector <= 1) && (1 < endingSector)) ? 1 : Math.max(startingY, endingY, 0))/2+.5;
        
        const backgroundSize = Math.max(rightEdge-leftEdge, bottomEdge-topEdge);
        const leftBackgroundImageEdge = (leftEdge+rightEdge-backgroundSize)/2;
        const topBackgroundImageEdge = (topEdge+bottomEdge-backgroundSize)/2;
        
        slice
          .css('clip-path','polygon('+clipPath.join(',')+')')
          .css('background-size', backgroundSize*100+'% '+backgroundSize*100+'%')
          .css('background-position-x', 'calc('+leftBackgroundImageEdge+' * var(--piechart-size))') /* these aren't relative units because relative units have non-obvious behavior with background-position */
          .css('background-position-y', 'calc('+topBackgroundImageEdge+' * var(--piechart-size))');
    } else {
        /* special case for full circle, no border slice at top needed */
        slice.css('background-size', '100% 100%');
    }
        
    
    if (onClick)
        slice.click(onClick);
    
    slice.appendTo(pie);
    
    return slice;
}

//Render Tiny MCE
function render_comments_tinymce(){
    tinymce.init({
        selector: '#text-tinymce, #edit-text-tinymce',
        branding: false,
        content_style: ".card-editor-tooltip { color: var(--primary); font-weight: bold; } .card-editor-tooltip-image { width: 100%;max-width: 200px;display: block;margin-left: auto;margin-right: auto;border-radius: 10px;border: 1px solid #7c7c7c;}",
        menubar: 'edit view format',
        plugins: 'wordcount emoticons paste',
        paste_data_images: false,
        toolbar: 'undo redo | styleselect | bold italic underline strikethrough link unlink | alignleft aligncenter alignjustify | bullist numlist outdent indent alignright | PokemonCardcardButton emoticons',
        menu: {
            format: {
                title: 'Format',
                items: 'bold italic underline strikethrough | formats | align | removeformat'
            }
        },
        setup: function (editor) {

            var onAction = function (autocompleteApi, rng, value) {
                editor.selection.setRng(rng);
                editor.insertContent(value);
                autocompleteApi.hide();
            };
            var getMatchedChars = function (pattern) {

                return specialChars.filter(function (char) {
                    return char.text.indexOf(pattern) !== -1;
                });

            };
            editor.ui.registry.addAutocompleter('specialchars_cardmenuitems', {
                ch: '-',
                minChars: 3,
                columns: 1,
                highlightOn: ['char_name'],
                onAction: onAction,
                fetch: function (pattern) {
                    return new tinymce.util.Promise(function (resolve) {

                        // call the lookup
                        fetch('/api/search.php?n=' + pattern+'&sort=name&limit=10')
                            .then(response => response.json())
                            .then(function (data) {
                                var results = [];

                                // only perform the check if there are results
                                if (data[0].hasOwnProperty('name'))
                                {
                                    // create our own results array
                                    for (var i = 0; i < data.length; i++)
                                    {
                                        var result = data[i].name;

                                        var tempElement = document.createElement('div');
                                        tempElement.innerHTML = result;

                                        results.push({
                                            value: '<a href="https://pokemoncard.io/card/?search='+data[i].id+'" target="_blank"><span class="card-editor-tooltip" title="" data-image="https://images.pokemoncard.io/images/'+(data[i].id).split("-")[0]+'/'+data[i].id+'_hiresopt.jpg" data-card="'+data[i].id+'" data-name="'+data[i].name+'">'+result+' ('+data[i].setName+')</span></a> ',
                                            text: tempElement.innerText+' ('+data[i].setName+')'
                                        });
                                    }

                                }

                                // resolve the initial promise
                                resolve(results);
                            });

                    });
                }
            });

            editor.ui.registry.addAutocompleter('specialchars_cardmenuitems2', {
                ch: '@',
                minChars: 3,
                columns: 1,
                highlightOn: ['char_name'],
                onAction: onAction,
                fetch: function (pattern) {
                    return new tinymce.util.Promise(function (resolve) {

                        // call the lookup
                        fetch('/api/users/usersearch.php?search=' + pattern)
                            .then(response => response.json())
                            .then(function (data) {
                                var results = [];

                                // only perform the check if there are results
                                if (data[0].hasOwnProperty('username'))
                                {
                                    // create our own results array
                                    for (var i = 0; i < data.length; i++)
                                    {
                                        var result = data[i].username;

                                        var tempElement = document.createElement('div');
                                        tempElement.innerHTML = result;

                                        results.push({
                                            value: '<span class="mention-tooltip-author" data-userid="'+data[i].id+'"><a href="https://pokemoncard.io/author/?author='+data[i].id+'" title="User: '+quoteattr(data[i].username)+'">'+data[i].username+'</a></span> ',
                                            text: tempElement.innerText+' ('+data[i].id+')'
                                        });
                                    }

                                }

                                // resolve the initial promise
                                resolve(results);
                            });

                    });
                }
            });

            editor.ui.registry.addButton('pokemoncardButton', {
                text: 'Pokémon Card (ID)',
                onAction: function () {
                    editor.focus();
                    if(editor.selection.getContent() !== ''){

                        //Ajax Request for Card Info
                        tooltipurl = '/api/search.php?card='+encodeURIComponent((editor.selection.getContent()).trim());
                        //JSON Request
                        jQuery.getJSON(
                            tooltipurl,
                            function(data) {
                                //Card Data
                                if (data[0].name) {
                                    editor.selection.setContent('<a href="https://pokemoncard.io/card/?search='+data[0].id+'" target="_blank"><span class="card-editor-tooltip" title="" data-image="https://images.pokemoncard.io/images/'+(data[0].id).split("-")[0]+'/'+data[0].id+'_hiresopt.jpg" data-card="'+data[0].id+'"  data-name="'+data[0].name+'">' + data[0].name + ' ('+data[0].setName+')</span></a>');
                                }else{
                                    alert("Card ID Unknown. Please highlight a valid Card ID (example: base1-43).");
                                }
                            }).fail(function() {
                            alert("Card ID Unknown. Please highlight a valid Card ID (example: base1-43).");
                        });
                    }else{
                        alert("Highlight a Card ID first to use this button (example: base1-43).");
                    }
                }
            });

        }

    });
}


//Render Deck Preview Tooltip
function render_deck_preview(data) {
    function generateCardHtml(deck) {
        const cards = [];

        deck.forEach(cardId => {
            const existingCard = cards.find(card => card.id === cardId);
            if (existingCard) {
                existingCard.quantity++;
            } else {
                cards.push({ id: cardId, quantity: 1 });
            }
        });

        return cards.map(card => {
            const quantityDisplay = card.quantity > 1 ? `<span class="quantity-badge" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); color: white; font-weight: bold; text-shadow: 1px 1px 2px black;">x${card.quantity}</span>` : '';
            return `
            <div class="deck-preview-tooltip-card" data-card="${card.id}" style="position: relative;">
                <img src="https://images.digimoncard.io/images/cards/${card.id}.jpg" loading="lazy" alt="${card.id}" title="${card.id}">
                ${quantityDisplay}
            </div>
        `;
        }).join('');
    }

    data.extradeck = data.eggdeck;

    let extraDeckHtml = data.extradeck.length > 0 ? `
        <div class="deck-preview-tooltip-extra">
            <span class="deck-preview-tooltip-extra-title">Egg Deck</span>
            <div class="deck-preview-tooltip-extra-cards ${data.sidedeck.length === 0 ? 'deck-preview-full-width' : 'deck-preview-half-width'}">
                ${generateCardHtml(data.extradeck)}
            </div>
        </div>
    ` : '';

    let sideDeckHtml = data.sidedeck.length > 0 ? `
        <div class="deck-preview-tooltip-side">
            <span class="deck-preview-tooltip-side-title">Side Deck</span>
            <div class="deck-preview-tooltip-side-cards ${data.extradeck.length === 0 ? 'deck-preview-full-width' : 'deck-preview-half-width'}">
                ${generateCardHtml(data.sidedeck)}
            </div>
        </div>
    ` : '';

    let deckClasses = `deck-preview-tooltip-${data.extradeck.length > 0 && data.sidedeck.length > 0 ? 'two-column' : 'full-width'}`;

    let decksContainer = '';
    if (data.extradeck.length > 0 || data.sidedeck.length > 0) {
        decksContainer = `<div class="${deckClasses}">
            ${extraDeckHtml}
            ${sideDeckHtml}
        </div>`;
    }

    let deck_preview = `<div class="deck-preview-tooltip">
        <div class="deck-preview-tooltip-header d-flex">
            <span class="deck-preview-tooltip-title mr-auto">${data.deckname}</span>
            <span class="deck-preview-tooltip-deckcount justify-content-end mr-3">${data.decksize} cards</span>
        </div>
        <div class="deck-preview-tooltip-body">
            <div class="deck-preview-tooltip-maindeck">
                <div class="deck-preview-tooltip-maindeck-cards deck-preview-full-width">
                    ${generateCardHtml(data.maindeck)}
                </div>
            </div>
            ${decksContainer}
        </div>
    </div>`;
    return deck_preview;
}


//Render Card Preview Tooltip
function render_card_preview(data) {
    data = data[0];
    let isMonster = data.type !== "Spell Card" && data.type !== "Trap Card" && data.type !== "Skill Card";  // Determine if it's a monster card
    let isLink = data.type === "Link Monster";  // Determine if it's a link monster

    let banIcons = {
        "Banned": 'https://images.ygoprodeck.com/images/assets/ban/limited_0.png',
        "Limited": 'https://images.ygoprodeck.com/images/assets/ban/limited_1.png',
        "Semi-Limited": 'https://images.ygoprodeck.com/images/assets/ban/limited_2.png'
    };

    let colorIcons = {
        "Blue": '<i class="fa-solid fa-hexagon mr-1" style="color: #3498db;"></i>',
        "Green": '<i class="fa-solid fa-hexagon mr-1" style="color: #2ecc71;"></i>',
        "Purple": '<i class="fa-solid fa-hexagon mr-1" style="color: #9b59b6;"></i>',
        "Red": '<i class="fa-solid fa-hexagon mr-1" style="color: #e74c3c;"></i>',
        "Yellow": '<i class="fa-solid fa-hexagon mr-1" style="color: #f1c40f;"></i>',
        "Black": '<i class="fa-solid fa-hexagon mr-1" style="color: #34495e;"></i>',
        "White": '<i class="fa-solid fa-hexagon mr-1" style="color: #ecf0f1;"></i>',
        "Colorless": '<i class="fa-solid fa-hexagon mr-1" style="color: #bdc3c7;"></i>',
    };

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    //Banlist Information
    let tcgBanStatus = data.banlist_info && data.banlist_info.ban_tcg ? data.banlist_info.ban_tcg : '';
    let ocgBanStatus = data.banlist_info && data.banlist_info.ban_ocg ? data.banlist_info.ban_ocg : '';
    let tcgBan = tcgBanStatus && banIcons[tcgBanStatus] ? `<div class="tooltip-ban-status"><img src="${banIcons[tcgBanStatus]}" class="tooltip-card-icon mr-1">TCG: ${tcgBanStatus}</div>` : '';
    let ocgBan = ocgBanStatus && banIcons[ocgBanStatus] ? `<div class="tooltip-ban-status"><img src="${banIcons[ocgBanStatus]}" class="tooltip-card-icon mr-1">OCG: ${ocgBanStatus}</div>` : '';

    //Card Prices
    let cardMarketPrice = data.card_prices && data.card_prices[0] && data.card_prices[0].cardmarket_price ? data.card_prices[0].cardmarket_price : '';
    let cardTcgPlayerPrice = data.card_prices && data.card_prices[0] && data.card_prices[0].tcgplayer_price ? data.card_prices[0].tcgplayer_price : '';

    /*
    let card_preview = `
    <div class="card-preview-tooltip">
        ${!isTouchDevice ? `
        <img class="tooltip-card" src="https://images.pokemoncard.io/images/${data.id.split('-')[0]}/${data.id}_hiresopt.jpg" loading="lazy">
        ` : ''}
        <div class="card-preview-tooltip-details">
            <div class="card-preview-header d-flex flex-wrap">
                <div class="card-preview-tooltip-title mr-auto">${data.name}</div>
                ${isMonster ? `
                <div class="card-preview-tooltip-attribute justify-content-end mr-3">
                    ${data.id}
                </div>` : `
                <div class="card-preview-tooltip-attribute justify-content-end mr-3">${data.type}</div>
                <div class="card-preview-tooltip-attribute justify-content-end mr-3">
                    <img src="https://images.pokemoncard.io/images/cards/icons/${data.race}.png" class="tooltip-card-icon mr-1">${data.race}
                </div>`}
            </div>
            ${isMonster ? `
            <div class="card-preview-header d-flex flex-wrap">
                <div class="card-preview-tooltip-text card-preview-tooltip-type mr-auto">[${data.stage ? `${data.stage}/` : ``}${data.type}${data.attribute ? `/${data.attribute}` : ``}]</div>
                ${data.color ? `
                <div class="card-preview-tooltip-attribute justify-content-end mr-3">
                    ${colorIcons[data.color]}${data.color}
                </div>
                ` : ''}
                ${data.color2 ? `
                <div class="card-preview-tooltip-attribute justify-content-end mr-3">
                    ${colorIcons[data.color2]}${data.color2}
                </div>
                ` : ''}                
            </div>
            ` : ''}
            <div class="card-preview-tooltip-text card-preview-tooltip-stats">
                ${data.dp ? `DP/${data.dp}` : ``}  ${data.play_cost ? `Cost/${data.play_cost}` : ``}  ${data.level ? `Level/${data.level}` : ``}
            </div>
            ${data.main_effect ? `
                <div class="card-preview-tooltip-text card-preview-tooltip-desc">${data.main_effect.replace(/\n/g, '<br>')}</div>
            ` : ''}         
            ${data.source_effect ? `
                <div class="card-preview-tooltip-text card-preview-tooltip-desc">${data.source_effect.replace(/\n/g, '<br>')}</div>
            ` : ''}
            ${data.alt_effect ? `
                <div class="card-preview-tooltip-text card-preview-tooltip-desc">${data.alt_effect.replace(/\n/g, '<br>')}</div>
            ` : ''}                                        
            <div class="card-preview-tooltip-text d-flex">${tcgBan}${ocgBan}</div>
            <footer class="card-preview-tooltip-footer">
                <div class="card-preview-tooltip-text d-flex">
                    <div class="card-preview-tooltip-price mr-3">
                        ${cardMarketPrice ? `
                            <img src="https://images.pokemoncard.io/images/cards/icons/cardmarket1.png" class="tooltip-card-icon mr-1">€${cardMarketPrice}
                        ` : ''}                          
                    </div>
                    <div class="card-preview-tooltip-price">
                        ${cardTcgPlayerPrice ? `
                            <img src="https://images.pokemoncard.io/images/cards/icons/tcgplayer.png" class="tooltip-card-icon mr-1">$${cardTcgPlayerPrice}
                        ` : ''}                       
                    </div>
                </div>
            </footer>
        </div>
    </div>`;
     */

    let card_preview = `
    <div class="card-preview-tooltip">
        <img class="tooltip-card-full" src="https://images.pokemoncard.io/images/${data.id.split('-')[0]}/${data.id}_hiresopt.jpg" loading="lazy">
    </div>`;

    return card_preview;
}


//Render User Tooltip
function render_user_preview(data) {
    data = data[0];

    let decks = data.deck_count ?? 0;
    let followers = data.followers ?? 0;
    let following = data.following ?? 0;

    let user_preview = `
    <div class="user-preview-tooltip">
        <div class="user-preview-tooltip-body">
            <div class="position-relative">
                <div class="user-preview-tooltip-avatar user-item">
                    <img src="${data.img_url}" loading="lazy">
                </div>
                <div class="user-preview-tooltip-socials position-absolute" style="top: 5px; right: 10px;">
                    ${data.youtube ? `
                        <span class="user-preview-tooltip-social"><a href="${data.youtube}" target="_blank" rel="noopener" class="user-preview-tooltip-color-override"><i
                                    class="fab fa-youtube"></i></a></span>
                    ` : ''}
                    ${data.twitter ? `
                        <span class="user-preview-tooltip-social"><a href="https://twitter.com/${data.twitter}" target="_blank" rel="noopener" class="user-preview-tooltip-color-override"><i
                                    class="fab fa-x-twitter"></i></a></span>
                    ` : ''}
                    ${data.twitch ? `
                        <span class="user-preview-tooltip-social"><a href="${data.twitch}" target="_blank" rel="noopener" class="user-preview-tooltip-color-override"><i
                                    class="fab fa-twitch"></i></a></span>
                    ` : ''}
                    ${data.website ? `
                        <span class="user-preview-tooltip-social"><a href="${data.website}" target="_blank" rel="noopener" class="user-preview-tooltip-color-override"><i
                                    class="fa fa-link"></i></a></span>
                    ` : ''}
                </div>
            </div>
            <div class="user-preview-tooltip-details">
                <div class="user-preview-tooltip-username font-weight-bold font-size-lg mb-1">${data.username}</div>
                <div class="user-preview-tooltip-stats mb-1">
                    <span class="user-preview-tooltip-stat"><a href="/deck-search/?author=${data.id}&offset=0" class="font-weight-bold user-preview-tooltip-color-override">${decks}</a> Decks</span>
                    <span class="user-preview-tooltip-stat"><a href="/users/${data.author_url}" class="font-weight-bold user-preview-tooltip-color-override">${followers}</a> Followers</span>
                    <span class="user-preview-tooltip-stat"><a href="/users/${data.author_url}" class="font-weight-bold user-preview-tooltip-color-override">${following}</a> Following</span>
                </div>`;

    if (data.bio) {
        user_preview += `<div class="user-preview-tooltip-bio mb-1">${data.bio}</div>`;
    }

    user_preview += `
            </div>
        </div>
    </div>`;

    return user_preview;
}
