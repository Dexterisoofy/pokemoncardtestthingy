function getRandomDeck(){
    const getRandomDeckButton = document.querySelector('#getRandomDeck');
    getRandomDeckButton.removeEventListener('click', getRandomDeck);

    const url = '/api/decks/getRandomDeck.php?' + new Date().getTime();

    fetch(url)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error('Failed to load random deck');
        })
        .then(data => {
            if (data.url) {
                window.location.href = data.url;
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function getRandomCard(){
    const getRandomCardButton = document.querySelector('#getRandomCard');
    getRandomCardButton.removeEventListener('click', getRandomCard);

    const url = '/api/card/getRandomCard.php?' + new Date().getTime();

    fetch(url)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error('Failed to load random card');
        })
        .then(data => {
            if (data.url) {
                window.location.href = data.url;
            }
        })
        .catch(error => {
            console.log(error);
        });
}

//Footer Search
const searchbar = document.getElementById('footer-searchbar');
// Attach a keydown event listener
searchbar.addEventListener('keydown', function(event) {
    // Check if the key pressed is the Enter key
    if (event.keyCode === 13) {
        // Get the search term
        const search = searchbar.value;
        // Navigate to the search results page
        window.location.href = `https://pokemoncard.io/deck-search/?&name=${search}`;
    }
});

//Add event listener to search forms
document.body.addEventListener('keydown', function(e) {
    if (e.target.matches('#searchform-cards, #searchform-decks, #searchform-articles') && e.keyCode === 13) {
        const searchType = e.target.getAttribute('data-search-type');
        searchSite(e.target.value, searchType);
    }
});

//Search function
function siteSearch(elementId, type) {
    const searchValue = document.getElementById(elementId).value;
    searchSite(searchValue, type);
}

// Event listeners for modals and tabs
jQuery('#searchSiteModal').on('show.bs.modal', function() {
    const search = document.querySelector('#card-search-form').innerHTML;
    if (search.length === 0) {
        searchSite(search, 'Card');
    }
});

jQuery('#searchSiteModal').on('shown.bs.modal', function () {
    document.querySelector('#searchSiteModal #searchform-cards').focus();
});

const tabs = {
    '#nav-decks-tab': 'Deck',
    '#nav-articles-tab': 'Article'
};

for (const [tab, type] of Object.entries(tabs)) {
    jQuery(tab).on('click', function() {
        const search = document.querySelector(`#${type.toLowerCase()}-search-form`).innerHTML;
        if (search.length === 0) {
            searchSite(search, type);
        }
    });
}

const searchConfig = {
    'Card': {
        apiUrlBase: '/api/search.php?limit=18',
        formSelector: '#card-search-form',
        defaultLoader: '<div class="loader mx-auto" style="left: 0;"></div>',
        params: [
            { id: 's_m-card-type', default: 'Card Type', key: 'supertype' },
            { id: 'card-ms-sort', default: 'Sort By', key: 'sort' }
        ],
        renderResults: renderCardResults,
        redirectBtn: { id: 'carddb-redirect-btn', baseHref: '/card-database/?' }
    },
    'Deck': {
        apiUrlBase: '/api/decks/getDecks.php?',
        formSelector: '#deck-search-form',
        defaultLoader: '<div class="loader" style="left: 0;"></div>',
        params: [
            { id: 's_m-format', default: 'Format', key: '_sft_category' },
            { id: 's_m-deck-sort', default: 'Sort By', key: 'sort' }
        ],
        renderResults: renderDeckResults,
        redirectBtn: { id: 'decksearch-redirect-btn', baseHref: '/deck-search/?' }
    },
    'Article': {
        apiUrlBase: '/api/articles/getArticles.php?',
        formSelector: '#article-search-form',
        defaultLoader: '<div class="loader mx-auto" style="left: 0;"></div>',
        params: [
            { id: 's_m-article-type', default: 'Type', key: '_sft_category' },
            { id: 's_m-article-sort', default: 'Sort By', key: 'sort' }
        ],
        renderResults: renderArticleResults,
        redirectBtn: { id: 'articlesearch-redirect-btn', baseHref: '/article-search/?' }
    }
};

function searchSite(input, type) {
    const config = searchConfig[type];
    if (!config) return;

    let apiUrl = config.apiUrlBase;

    let linkHref = config.redirectBtn.baseHref;

    if (input !== '') {
        apiUrl += `&name=${input}`;
        linkHref += type === 'Card' ? `&n=${input}&desc=${input}` : `&name=${input}`;
    }

    config.params.forEach(param => {
        const element = document.getElementById(param.id);
        if (element.value !== param.default) {
            apiUrl += `&${param.key}=${element.value}`;
            linkHref += param.key === 'supertype' && element.value === 'Pokémon' ? '&supertype=Pokemon' : `&${param.key}=${element.value}`;
        }
    });

    document.querySelector(config.formSelector).innerHTML = config.defaultLoader;

    document.getElementById(config.redirectBtn.id).setAttribute('href', linkHref);

    fetch(apiUrl)
        .then(response => response.json())
        .then(val => config.renderResults(val, config.formSelector))
        .catch(() => {
            document.querySelector(config.formSelector).innerHTML = '<div class="alert alert-warning" role="alert">No Results Found</div>';
        });
}

function renderCardResults(val, selector) {
    let htmlresults = '';
    val.forEach(data => {
        htmlresults += `<span class="search-form-result-item"><a href="/card/${data.pretty_url}"><img src="https://images.pokemoncard.io/images/${data.id.split("-")[0]}/${data.id}.png" loading="lazy" data-name="${data.id}" class="lazy" title="${data.name}"></a></span>`;
    });
    document.querySelector(selector).innerHTML = htmlresults;
}

function renderDeckResults(val, selector) {
    let htmlresults = '';
    if (!val.error) {

        renderGridDeckCards(selector, val);

        jQuery(selector + ' .deck_article-card').Lazy({
            placeholder: "https://images.pokemoncard.io/images/assets/CardBack.jpg",
            scrollDirection: 'vertical',
            effect: "fadeIn",
            effectTime: 500,
            threshold: 0,
            visibleOnly: true,
            appendScroll: jQuery('#searchSiteModal'),
            onError: function(element) {
                console.log('error loading ' + element.data('src'));
            }
        });
    } else {
        document.querySelector(selector).innerHTML = '<div class="alert alert-warning" role="alert">No Results Found</div>';
    }
}

function renderArticleResults(val, selector) {
    let htmlresults = '';
    if (!val.error) {
        for (let index = 0; index < val.length; index++) {
            htmlresults += renderArticleListItem(val[index]);

            //show only 5 results
            if (index === 4) {
                break;
            }
        }
        document.querySelector(selector).innerHTML = htmlresults;

        jQuery(selector + ' .article-li-img-lazy').Lazy({
            defaultImage: "https://images.pokemoncard.io/images/assets/CardBack.jpg",
            scrollDirection: 'vertical',
            effect: "fadeIn",
            effectTime: 500,
            threshold: 0,
            visibleOnly: true,
            appendScroll: jQuery('#searchSiteModal'),
            onError: function(element) {
                console.log('error loading ' + element.data('src'));
            }
        });
    } else {
        document.querySelector(selector).innerHTML = '<div class="alert alert-warning" role="alert">No Results Found</div>';
    }
}

// If #nav-decks-tab is clicked, load images for the grid of decks inside #deck-search-form only
jQuery('#nav-decks-tab').on('click', function () {
    jQuery('#searchSiteModal .deck_article-card').Lazy({
        // your configuration goes here
        placeholder: "https://images.pokemoncard.io/images/assets/CardBack.jpg",
        effect: "fadeIn",
        effectTime: 500,
        appendScroll: jQuery('#searchSiteModal'),
        bind: "event",
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });
});

// If #nav-articles-tab is clicked, load images for the list of articles inside #article-search-form only
jQuery('#nav-articles-tab').on('click', function () {
    jQuery('#searchSiteModal .article-li-img-lazy').Lazy({
        // your configuration goes here
        defaultImage: "https://images.pokemoncard.io/images/assets/CardBack.jpg",
        effect: "fadeIn",
        effectTime: 500,
        appendScroll: jQuery('#searchSiteModal'),
        bind: "event",
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//Function to like/dislike comments
document.addEventListener("click", function(event){
    const votingsystem = event.target.closest(".votingsystem");
    if(votingsystem) {
        let votetypeint;

        //Get the comment id from this click
        const commentid = votingsystem.getAttribute('data-commentid');

        //Get the vote type from this click
        const votetype = votingsystem.getAttribute('data-vote');

        //Get the context from this click
        const context = votingsystem.getAttribute('data-context');

        //if vote type is like then set to 1, if dislike then set to -1
        if(votetype === 'like'){
            votetypeint = 1;
        }else if(votetype === 'dislike'){
            votetypeint = -1;
        }else{
            votetypeint = 0;
        }

        //Submit the vote to the API
        const apiurl = "/api/voting/vote.php";

        //If commentid, votetype, and context are not empty
        if(commentid !== '' && votetype !== '' && context !== ''){
            //Submit Ajax Vote
            fetch(apiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    comment_id: commentid,
                    vote: votetypeint,
                    comment_context: context
                })
            })
                .then(response => response.json())
                .then(data => {
                    if(data.success) {
                        //Remove highlight on all as user may potentially change vote without reloading
                        const allVotingsystems = document.querySelectorAll(`.votingsystem[data-commentid="${commentid}"]`);
                        allVotingsystems.forEach(votingSystem => votingSystem.classList.remove('vote_highlight'));

                        //Highlight the selected vote button to show you've voted
                        const selectedVotingsystem = document.querySelector(`.votingsystem[data-commentid="${commentid}"][data-vote="${votetype}"]`);
                        selectedVotingsystem.classList.add('vote_highlight');

                        //Append the new vote count to the vote count div
                        const totalVotesDiv = document.querySelector(`#totalvotes_${commentid}`);
                        totalVotesDiv.innerHTML = data.total_votes;
                    }
                })
                .catch(error => {
                    const err = JSON.parse(error.responseText);
                    const notifyToast = document.querySelector('#notifyToast');
                    const notifyToastBody = notifyToast.querySelector('.toast-body');
                    notifyToastBody.innerHTML = err.error;
                    notifyToast.toast('show');
                });
        }
    }
});

// Function to React
const reactionPicker = document.querySelector("#reaction-picker");
if (reactionPicker) {
    reactionPicker.addEventListener("click", function (event) {
        var emojiElement = event.target.closest(".reaction-emoji");
        if (emojiElement) {
            // Get the reaction
            var reaction = emojiElement.dataset.reaction;

            // API Call
            fetch("/api/reactions/react.php", {
                method: "POST",
                body: JSON.stringify({
                    item_id: item_id,
                    reaction: reaction,
                    context: context
                })
            })
                .then(response => response.json())
                .then(data => {
                    // If Success, update the reaction count
                    if (data.status == "success") {
                        // Empty the all reaction counts
                        document.querySelectorAll(".reaction-emoji-number").forEach(function (element) {
                            element.textContent = "0";
                        });

                        // Set total reaction count
                        document.querySelector(".reaction-count-int").textContent = data.total;

                        // For each data.reactions, update the reaction count for each reaction
                        data.reactions.forEach(function (reaction) {
                            var reactionEmoji = document.querySelector(".reaction-emoji[data-reaction='" + reaction.reaction + "']");
                            if (reactionEmoji) {
                                reactionEmoji.dataset.reactionCount = reaction.count;
                                reactionEmoji.querySelector(".reaction-emoji-number").textContent = reaction.count;
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    });
}

//Get Reaction Count
function getReactions(page_id, context) {
//API Call
    fetch('/api/reactions/getReactions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            item_id: page_id,
            context: context
        })
    })
        .then(response => response.json())
        .then(data => {
            //If Success, update the reaction count
            if (data.status == "success") {
                //Empty the all reaction counts
                document.querySelectorAll(".reaction-emoji .reaction-emoji-number").forEach(el => el.textContent = "0");
                //Set total reaction count
                document.querySelector(".reaction-count-int").textContent = data.total;

                //Foreach data.reactions, update the reaction count for each reaction
                data.reactions.forEach(function (value) {
                    const reactionEmoji = document.querySelector(".reaction-emoji[data-reaction='" + value.reaction + "']");
                    reactionEmoji.dataset.reactionCount = value.count;
                    reactionEmoji.querySelector(".reaction-emoji-number").textContent = value.count;
                });

            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//Card Filters and Sort on Site Search
function createChoices(selector) {
    return new Choices(selector, {
        removeItemButton: true,
        maxItemCount: 5,
        searchResultLimit: 5,
        renderChoiceLimit: 5,
    }).passedElement.element.addEventListener('change', function (event) {
        siteSearch();
    });
}

//Sort Icon - Site Search
//When card-ms-sort-icon is clicked, toggle between fa-sort-amount-up and fa-sort-amount-down by using the data-state attribute (desc or asc)
const cardSortIcon = document.getElementById("card-ms-sort-icon");
if(cardSortIcon) {
    cardSortIcon.addEventListener("click", function () {
        if (this.getAttribute('data-state') === 'desc') {
            this.setAttribute('data-state', 'asc');
            this.classList.remove('fa-sort-amount-down');
            this.classList.add('fa-sort-amount-up');
        } else {
            this.setAttribute('data-state', 'desc');
            this.classList.remove('fa-sort-amount-up');
            this.classList.add('fa-sort-amount-down');
        }
    });
}

function renderGridOfDecks(container, decks, mode) {
    const ctr = jQuery(container);
    ctr.empty();
    for (const deck of decks) {
        const elm = jQuery('<div class="deck-layout-single-flex">' +
          '<div class="deck-ribbon"><span class="ribbon-deck-text"></span></div>' +
          '<a><div class="card-img-overlay h-100 d-flex flex-column justify-content-end cardimgoverlay-fp lazy">' +
            '<h4 class="card-title deck-layout-title-flex"><span class="deck-layout-title-flex-rounded deck-excerpt"></span><span class="deck-layout-title-flex-rounded deck-information"></span></h4>' +
          '</div></a>' +
        '</div>').appendTo(ctr);
        
        if (mode === 'tournament') {
            if (deck.tournamentName) {
                elm.find('.ribbon-deck-text').text(deck.tournamentName);
                elm.find('a').attr('href', '/deck/'+deck.pretty_url);
                elm.find('.card-img-overlay').attr('alt', deck.deck_name).attr('title', deck.deck_name).attr('data-src', 'https://images.pokemoncard.io/images/cards_cropped/' + deck.cover_card + '.jpg');
                elm.find('.card-title').prependText(deck.deck_name);
                elm.find('.deck-information')
                      .html('<i class="fas fa-trophy" aria-hidden="true"></i> ').appendText(deck.tournamentPlacement)
                      .appendText(' (' + (deck.tournamentPlayerCountIsApproximate ? '~' : '')).appendText(deck.tournamentPlayerCount).appendText(' players)')
                      .append(' <i class="fas fa-calendar" aria-hidden="true"></i> ').appendText(deck.submit_date);
                      
                if (deck.tournamentPlayerName)
                  elm.find('.deck-information').append(' piloted by <i class="fas fa-user" aria-hidden="true"></i> ').appendText(deck.tournamentPlayerName);
            } else {
                elm.find('.deck-ribbon').remove();
                elm.find('a').attr('href', '/deck/'+deck.pretty_url);
                elm.find('.card-img-overlay').attr('alt', deck.deck_name).attr('title', deck.deck_name).attr('data-src', 'https://images.pokemoncard.io/images/cards_cropped/' + deck.cover_card + '.jpg');
                elm.find('.card-title').prependText(deck.deck_name);
                elm.find('.deck-excerpt').text(deck.deck_excerpt);
            }
        } else {
            elm.find('.ribbon-deck-text').text(deck.format);
            elm.find('a').attr('href', '/deck/'+deck.pretty_url);
            elm.find('.card-img-overlay').attr('alt', deck.deck_name).attr('title', deck.deck_name).attr('data-src', 'https://images.pokemoncard.io/images/cards_cropped/' + deck.cover_card + '.jpg');
            elm.find('.card-title').prependText(deck.deck_name);
            elm.find('.deck-excerpt').text(deck.deck_excerpt);
            elm.find('.deck-information')
                  .html('<i class="fas fa-eye" aria-hidden="true"></i> ').appendText(deck.deck_views.toLocaleString())
                  .append(' <i class="fas fa-comment" aria-hidden="true"></i> ').appendText(deck.comments)
                  .append(' <i class="fas fa-calendar" aria-hidden="true"></i> ').appendText(deck.submit_date)
                  .append(' by <i class="fas fa-user" aria-hidden="true"></i> ').appendText(deck.username)
                  .append(' <i class="fa-solid fa-cart-shopping"></i> $').appendText(deck.deck_price)
                  .append(' <img src="https://images.pokemoncard.io/images/cards/icons/master_duel/super_rare.png" class="md-craft-icons" style="margin-left:5px;" title="Master Duel Super Rare Craft Cost"> ')
                    .appendText(deck.super || '-')
                  .append(' <img src="https://images.pokemoncard.io/images/cards/icons/master_duel/ultra_rare.png" class="md-craft-icons" title="Master Duel Ultra Rare Craft Cost"> ')
                    .appendText(deck.ultra || '-');
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

//Reusable Download Function to download a file
function download(filename, data) {
    var element = document.createElement('a');

    // check if data is Blob
    if(data instanceof Blob) {
        // if it's a blob, create an object URL for it
        element.setAttribute('href', URL.createObjectURL(data));
    } else {
        // otherwise it's probably text so encode it as a data URL
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    }

    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('fp-card-container');

    document.querySelectorAll('.quick_tab').forEach(tab => {
        tab.addEventListener('click', function() {
            let endpoint;

            switch(this.dataset.type) {
                case 'fp-card-latest':
                    endpoint = '/api/search.php?&sort=new&limit=14';
                    break;
                case 'fp-card-popular':
                    endpoint = '/api/search.php?&sort=views&limit=14';
                    break;
                case 'fp-card-staple':
                    endpoint = '/api/search.php?&sort=views&limit=14&format=Standard';
                    break;
            }

            //Remove text-primary class from all quick tabs
            document.querySelectorAll('.quick_tab').forEach(tab => {
                tab.classList.remove('text-primary');
            });

            //Add text-primary class to the clicked quick tab
            this.classList.add('text-primary');

            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    let cards;

                    if(this.dataset.type === 'fp-card-staple') {
                        cards = data.slice(0, 14); //Manually cut to 14 cards
                    } else {
                        cards = data;
                    }

                    updateCardContainer(cards, this.dataset.type);
                })
                .catch(error => {
                    console.error("Error fetching cards:", error);
                });
        });
    });

    function updateCardContainer(cards, type) {
        cardContainer.innerHTML = '';

        cards.forEach(card => {
            let cardId, cardName, cardUrl;

            if(type === 'fp-card-staple') {
                cardId = card.id;
                cardName = card.name;
                cardUrl = card.pretty_url;
            } else {
                cardId = card.id;
                cardName = card.name;
                cardUrl = card.pretty_url;
            }

            let cardHtml = `
                <a href="/card/${cardUrl}" class="search-form-result-item">
                    <img class="lazy img-responsive img-rounded m-2" src="https://images.pokemoncard.io/images/${cardId.split("-")[0]}/${cardId}.png" data-name="${cardId}" loading="lazy" alt="${cardName}" style="width:150px;">
                </a>
            `;

            cardContainer.innerHTML += cardHtml;
        });

        // Add the "View More" button
        cardContainer.innerHTML += '<div class="mt-2"><a class="btn btn-primary" href="/card-database/" role="button">View More</a></div>';
    }
});


document.addEventListener('click', function(event) {
    var target = event.target;

    // Check if the clicked element is the button or a child of the button
    if (target.matches('.edit_comment_btn') || target.closest('.edit_comment_btn')) {
        var btn = target.closest('.edit_comment_btn'); // Find the closest .edit_comment_btn ancestor
        var commentId = btn.getAttribute('data-comment-id');
        var context = document.querySelector('#edit-text-tinymce').getAttribute('data-comment-context');

        //Fetch ajax to get the comment at /api/comments/get_comment.php and pass the comment id and context using GET
        fetch(`/api/comments/get_comment.php?commentId=${commentId}&context=${context}`)
            .then(response => response.json())
            .then(data => {
                //If success, update the modal with the comment data
                if (data.content) {
                    //Add response content to #text-tinymce
                    tinymce.get('edit-text-tinymce').setContent(data.content);
                    //Fill the data-comment-id and data-comment-context values on #edit-text-tinymce
                    document.querySelector('#edit-text-tinymce').setAttribute('data-comment-id', commentId);
                    document.querySelector('#edit-text-tinymce').setAttribute('data-comment-context', context);
                    //Show .edit_comment by removing .d-none
                    document.querySelector('.edit_comment').classList.remove('d-none');
                    //Scroll to #edit-text-tinymce
                    document.querySelector('.edit_comment').scrollIntoView({behavior: "smooth"});
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});


//When edit-comment-confirm is clicked, submit the comment edit
document.addEventListener('click', function(event) {
    if (event.target.matches('#edit-comment-confirm')) {
        //Get the comment id from #edit-text-tinymce
        var commentId = document.querySelector('#edit-text-tinymce').getAttribute('data-comment-id');
        //Get the comment context from #edit-text-tinymce
        var context = document.querySelector('#edit-text-tinymce').getAttribute('data-comment-context');
        //Get the comment content from #text-tinymce
        var commentContent = tinymce.get('edit-text-tinymce').getContent();

        //Submit the comment edit to the API
        fetch('/api/comments/edit_comment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commentId: commentId,
                commentContent: commentContent,
                context: context
            })
        })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    //Reload the page
                    location.reload();
                }else if(data.error){
                    //Alert Error
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

function sortComments() {
    const selectVal = document.getElementById('sort-comments').value;
    const containerRef = document.getElementById('comments');

    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    commentsArray.sort((a, b) => {
        if (selectVal === 'oldest') {
            return collator.compare(a.id, b.id);
        } else if (selectVal === 'newest') {
            return collator.compare(b.id, a.id);
        } else if (selectVal === 'votes') {
            return b.totalVotes - a.totalVotes;
        }
    }).forEach(el => containerRef.appendChild(el.itemRef));
}

//Updates the page metadata. Useful for keeping the page title and meta description up to date for SEO purposes.
function updatePageMetadata(title, description) {
    //Update the page title
    if (title) {
        document.title = title;
    }

    //Update meta description
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
        metaDescription.setAttribute("content", description);
    }

    //Update Open Graph and Twitter tags
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
        ogTitle.setAttribute("content", title);
    }

    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) {
        ogDescription.setAttribute("content", description);
    }

    var twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && title) {
        twitterTitle.setAttribute("content", title);
    }

    var twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && description) {
        twitterDescription.setAttribute("content", description);
    }
}