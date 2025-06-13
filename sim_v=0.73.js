let totalCardValue = 0;
var collection = [];
var boosterarray = [];
var boosterselection = [];
var customdraftmode = 0;
var revcount = 0;
var packcount = 0;
var curpackquant = 1;
var currentpack = 1;
var server = "origin";
var curset;
var curtype;
var curalias;
var packselection = 0;
var custommode = 0;
var endgamestatus = false;
var chaos = false;
var chaospicked = false;
var box = "Unassign";
var searchTimer;
let viewMode = 'image';
jQuery(document).ready(function() {
    loadPackTypes();
    loadBoosterPacks();
    jQuery('#packtype_custom_user').autocomplete({
        serviceUrl: '/api/pack-sim/getCustomUsers.php',
        onSelect: function(suggestion) {
            jQuery(this).val(suggestion.value);
        }
    });
});
window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '';
});
function loadPackTypes() {
    jQuery.ajax({
        url: "/api/pack-sim/getPackRegions.php",
        type: "POST",
        success: function(data) {
            jQuery.each(data, function(i, item) {
                jQuery("#packtype_select").append('<option value="' + item.series + '">' + item.series + '</option>');
            });
        }
    });
}
function loadBoosterPacks() {
    jQuery('#pack-selection').empty().html('<div class="spinner-border text-primary" role="status"<span class="sr-only"></span></div>');
    let boosterhtml = '';
    let packname = jQuery('#packname_input').val();
    packname = packname ? packname : null;
    let packtype = jQuery('#packtype_select').val();
    packtype = packtype != 'all' ? packtype : null;
    let packsort = jQuery('#packtype_sort').val();
    packsort = packsort != 'sort' ? packsort : null;
    let custommodechoice = jQuery('#packtype_custom').val();
    custommodechoice = custommodechoice != 'OFF' ? custommodechoice : null;
    if (custommodechoice == "ON") {
        var customuser = jQuery('#packtype_custom_user').val();
        customuser = customuser ? customuser : null;
        custommode = 1;
    } else {
        var customuser = null;
        custommode = 0;
    }
    return jQuery.ajax({
        url: '/api/pack-sim/searchPacks.php',
        type: 'GET',
        data: {
            search: packname,
            region: packtype,
            sort: packsort,
            customPack: custommodechoice,
            customPackUser: customuser
        }
    }).done(function(data) {
        jQuery('#pack-selection').empty();
        boosterarray = data;
        boosterhtml = outputBoosters(data, 0);
        jQuery('#pack-selection').html(boosterhtml);
        jQuery('.lazy').Lazy({
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
    }).fail(function(data) {
        boosterarray = [];
        jQuery('#pack-selection').empty().html('<div class="alert alert-danger" role="alert">No Packs Found</div>');
    });
}
function outputBoosters(array, offset) {
    let boosterhtml = '';
    let count = 0;
    array.splice(0, offset);
    jQuery.each(array, function(key, item) {
        var packurl = '#';
        if (custommode == 1) {
            var imgurl = 'https://images.pokemoncard.io/images/' + (item.img_code).split("-")[0] + '/' + item.img_code + '.png';
        } else {
            var imgurl = 'https://images.pokemoncard.io/images/' + item.code + '/icons/' + item.code + '_logo.png';
        }
        packurl = "/pack/" + encodeURIComponent(item.alias);
        boosterhtml += '<div class="pack-selection-card m-2 shadow">' + '<div class="card h-100 card-bg">' + '<a href="' + packurl + '" target="_blank"><img class="lazy card-img-top" data-src="' + imgurl + '" title="' + item.name + '" alt="' + item.name + '">' + '<div class="card-body"><p class="set-title text-truncate">' + item.name + '</p></a>' + '<p class="set-text">' + ((item.series && item.release_date_pretty) ? ('<span class="d-block">' + item.series + '</span>' + '<span class="d-block">' + item.release_date_pretty + '</span>') : '<button type="button" class="btn btn-primary btn-sm ml-2 view-pack-btn" data-packid="' + item.pack_id + '">View Pack</button>') + '</p>' + '<div><span>Count: <input class="pack-num-input" data-date="' + (item.release_date ?? null) + '" data-set="' + item.name + '" data-type="' + item.code + '" data-alias="' + item.alias + '" data-quantity="0" type="number" name="Pack Quantity" min="0" max="99"></span></div>' + '</div>' + '</div>' + '</div>';
        count++;
        if (count == 25) {
            return false;
        }
    });
    return boosterhtml;
}
jQuery(document).on('click', '.view-pack-btn', function() {
    let packid = jQuery(this).data('packid');
    if (!packid) {
        return;
    }
    jQuery.ajax({
        url: '/api/pack-sim/getPackInfo.php',
        type: 'GET',
        data: {
            id: packid
        },
        success: function(data) {
            if (!data) {
                return false;
            }
            jQuery('#customPackModallbl').html(data[0].pack_name + ' by ' + data[0].username + ' - <span>(' + (data[0].pack_views).toLocaleString() + ' views)</span>');
            var packhtml = '';
            packhtml += '<p class="text-center">' + data[0].pack_description + '</p>';
            packhtml += '<div class="row justify-content-start flex flex-wrap p-4 card-flex-container m-auto">';
            jQuery.each(data, function(key, item) {
                packhtml += '<div class="pulled-card-row m-2 text-center">' + '<figure>' + '<img data-name="' + item.card_id + '" src="https://images.pokemoncard.io/images/cards_small/' + item.id + '.jpg" alt="' + item.id + '" class="pulled-card" loading="lazy">' + '<figcaption>' + '<span class="d-block text-truncate text-center small common">' + item.name + '</span>' + '<span class="d-block text-truncate text-center small common">' + item.card_rarity + '</span>' + '</figcaption>' + '</figure>' + '</div>';
            });
            packhtml += '</div>';
            jQuery('#customPackModal .modal-body').html(packhtml);
            jQuery('#customPackModal').modal('show');
        },
        error: function(data) {
            console.log(data);
        }
    });
});
jQuery(window).scroll(function() {
    if (jQuery(window).scrollTop() + jQuery(window).height() > jQuery('#pack-selection').height() - 400) {
        offset = 25;
        output = outputBoosters(boosterarray, offset);
        jQuery('#pack-selection').append(output);
        jQuery('.lazy').Lazy({
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
});
function toggleMultiPackSelection() {}
jQuery('#packname_input, #packtype_custom_user').on('input', function() {
    var input = jQuery(this);
    var is_name = input.val();
    clearTimeout(searchTimer);
    if (is_name.length >= 3) {
        searchTimer = setTimeout(function() {
            loadBoosterPacks();
        }, 300);
    } else if (is_name.length == 0) {
        loadBoosterPacks();
    }
});
jQuery('#packname_input').keyup(function(e) {
    if (e.keyCode == 13) {
        loadBoosterPacks();
    }
});
jQuery('#openPacks').on('click', function() {
    start_pack_draft();
});
jQuery('#autoOpen').on('click', function() {
    autoOpen();
});
jQuery('#nextPack').on('click', function() {
    if (chaos && !chaospicked) {
        alert('Please select a card before opening the next pack.');
        return;
    }
    start_pack_draft();
});
jQuery('#addCollection').on('click', function() {
    jQuery('#addCollection').prop('disabled', true);
    uploadCollection();
});
jQuery('#import_config').on('click', function() {
    jQuery('#import_config').prop('disabled', true);
    importConfig();
});
jQuery('#export_config').on('click', function() {
    jQuery('#export_config').prop('disabled', true);
    exportConfig();
});
jQuery('#random_pack').on('click', async function() {
    if (boosterarray.length === 0) {
        await loadBoosterPacks();
    }
    let randompack = boosterarray[Math.floor(Math.random() * boosterarray.length)];
    if (boosterselection.some(e => e.set === randompack.name)) {
        boosterselection.forEach(function(item) {
            if (item.set == randompack.name) {
                item.amount++;
            }
        });
    } else {
        boosterselection.push({
            'set': randompack.name,
            'type': randompack.code,
            'alias': randompack.alias,
            'amount': 1,
            'date': randompack.release_date
        });
    }
    updatePackDisplay();
});
jQuery('#sort_packs').on('click', (function() {
    let sortState = 0;
    return function() {
        if (boosterselection.length == 0) {
            return false;
        }
        if (sortState == 0) {
            boosterselection.sort(function(a, b) {
                if (a.set < b.set) {
                    return -1;
                }
                if (a.set > b.set) {
                    return 1;
                }
                return 0;
            });
            sortState = 1;
        } else {
            boosterselection.sort(function(a, b) {
                let dateA = Date.parse(a.date);
                let dateB = Date.parse(b.date);
                dateA = isNaN(dateA) ? Infinity : dateA;
                dateB = isNaN(dateB) ? Infinity : dateB;
                return dateA - dateB;
            });
            sortState = 0;
        }
        updatePackDisplay();
    }
    ;
}
)());
jQuery('#openDeckbuilder').on('click', function() {
    let ydkArray = [];
    let maindeck = [];
    let extradeck = [];
    jQuery.each(collection, function(key, item) {
        if (item[2] == 'Normal Monster' || item[2] == 'Normal Tuner Monster' || item[2] == 'Effect Monster' || item[2] == 'Tuner Monster' || item[2] == 'Flip Monster' || item[2] == 'Flip Effect Monster' || item[2] == 'Flip Tuner Effect Monster' || item[2] == 'Spirit Monster' || item[2] == 'Union Effect Monster' || item[2] == 'Gemini Monster' || item[2] == 'Pendulum Effect Monster' || item[2] == 'Pendulum Normal Monster' || item[2] == 'Pendulum Tuner Effect Monster' || item[2] == 'Ritual Monster' || item[2] == 'Ritual Effect Monster' || item[2] == 'Toon Monster' || item[2] == 'Spell Card' || item[2] == 'Trap Card') {
            maindeck.push(item[0]);
        } else {
            extradeck.push(item[0]);
        }
    });
    ydkArray.push("#main \r\n");
    ydkArray.push(maindeck.join(' \r\n') + ' \r\n');
    ydkArray.push("#extra \r\n");
    ydkArray.push(extradeck.join(' \r\n') + ' \r\n');
    ydkArray.push("!side \r\n");
    var jsonString = JSON.stringify(ydkArray);
    jQuery.ajax({
        type: "POST",
        url: "/api/pack-sim/packsimDraft.php",
        data: {
            data: jsonString
        },
        cache: false,
        success: function(data) {
            window.open(data.url);
        }
    });
});
jQuery('#draftScreenshot').on('click', function() {
    if (collection.length === 0) {
        jQuery('#notifyToast .toast-body').html('<i class="fas fa-times-circle"></i> No draft to screenshot!');
        jQuery('#notifyToast').toast('show');
        return false;
    }
    jQuery('#draftScreenshot').prop('disabled', true);
    var jsonString = JSON.stringify(collection);
    jQuery.ajax({
        type: "POST",
        url: "/api/image-generator/draft.php",
        data: {
            data: jsonString
        },
        cache: false,
        success: function(data) {
            const base64Image = data.image;
            const decodedImage = atob(base64Image);
            const byteArray = new Uint8Array(decodedImage.length);
            for (let i = 0; i < decodedImage.length; i++) {
                byteArray[i] = decodedImage.charCodeAt(i);
            }
            const blob = new Blob([byteArray],{
                type: 'image/jpeg'
            });
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = img.src;
            link.download = 'draft.jpg';
            link.click();
            jQuery('#draftScreenshot').prop('disabled', false);
        },
        error: function(data) {
            jQuery('#draftScreenshot').prop('disabled', false);
        }
    });
});
jQuery('#chaosDraft').on('click', function() {
    chaos = true;
    start_pack_draft();
});
jQuery('#downloadYDK').on('click', function() {
    let ydkhtml = '';
    let maindeck = '';
    let extradeck = '';
    jQuery.each(collection, function(key, item) {
        if (item[2] == 'Normal Monster' || item[2] == 'Normal Tuner Monster' || item[2] == 'Effect Monster' || item[2] == 'Tuner Monster' || item[2] == 'Flip Monster' || item[2] == 'Flip Effect Monster' || item[2] == 'Flip Tuner Effect Monster' || item[2] == 'Spirit Monster' || item[2] == 'Union Effect Monster' || item[2] == 'Gemini Monster' || item[2] == 'Pendulum Effect Monster' || item[2] == 'Pendulum Normal Monster' || item[2] == 'Pendulum Tuner Effect Monster' || item[2] == 'Ritual Monster' || item[2] == 'Ritual Effect Monster' || item[2] == 'Toon Monster' || item[2] == 'Spell Card' || item[2] == 'Trap Card') {
            maindeck += item[0] + "\r\n";
        } else {
            extradeck += item[0] + "\r\n";
        }
    });
    ydkhtml += "#created by pokemoncard.io\r\n#main\r\n";
    ydkhtml += maindeck;
    ydkhtml += "#extra\r\n";
    ydkhtml += extradeck;
    download("draft.txt", ydkhtml);
});
function chaosDraft(card) {
    chaospicked = true;
    let id = jQuery(card).attr('data-id');
    let name = jQuery(card).attr('data-name');
    let type = jQuery(card).attr('data-type');
    let setname = jQuery(card).attr('data-setname');
    let edition = jQuery(card).attr('data-edition');
    let rarity = jQuery(card).attr('data-rarity');
    let price = jQuery(card).attr('data-price');
    let setcode = jQuery(card).attr('data-setcode');
    jQuery('.add-builder').remove();
    let carddetails = {
        id: id,
        name: name,
        type: type,
        setname: setname,
        edition: edition,
        rarity: rarity,
        price: price,
        setCode: setcode
    };
    jQuery.each(carddetails, function(key, item) {
        carddetails[key] = decodeURIComponent(item);
    });
    add_to_collection_array(carddetails, carddetails.setname);
    showPulls();
}
async function importConfig() {
    let config = jQuery('#import_config_text').val();
    config = config.trim();
    if (config.length === 0) {
        jQuery('#notifyToast .toast-body').html('<i class="fas fa-times-circle"></i> Config is empty!');
        jQuery('#notifyToast').toast('show');
        jQuery('#import_config').prop('disabled', false);
        return false;
    }
    let configarray = config.split("\n");
    let promises = [];
    jQuery.each(configarray, function(key, item) {
        let itemarray = item.split("|");
        if (itemarray[0] !== undefined && itemarray[1] !== undefined) {
            let promise = new Promise( (resolve, reject) => {
                jQuery.ajax({
                    type: 'GET',
                    url: "/api/pack-sim/searchPacks.php?limit=1&search=" + itemarray[0],
                    success: function(data) {
                        if (data !== '') {
                            boosterselection.push({
                                'set': data[0].name,
                                'type': data[0].code,
                                'alias': data[0].alias,
                                'amount': itemarray[1],
                                'date': data[0].release_date ?? null
                            });
                            updatePackDisplay();
                        }
                        resolve();
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        jQuery.ajax({
                            type: 'GET',
                            url: "/api/pack-sim/searchPacks.php?limit=1&customPack=ON&search=" + itemarray[0],
                            success: function(data) {
                                if (data !== '') {
                                    boosterselection.push({
                                        'set': data[0].name,
                                        'type': data[0].code,
                                        'alias': data[0].alias,
                                        'amount': itemarray[1],
                                        'date': data[0].release_date ?? null
                                    });
                                    updatePackDisplay();
                                } else {
                                    jQuery('#notifyToast .toast-body').html('<i class="fas fa-times-circle"></i> Pack ' + itemarray[0] + ' is invalid!');
                                    jQuery('#notifyToast').toast('show');
                                }
                            }
                        });
                        resolve();
                    }
                });
            }
            );
            promises.push(promise);
        }
    });
    await Promise.all(promises);
    jQuery('#import_config').prop('disabled', false);
    if (boosterselection.length !== 0) {
        jQuery('#import_config_text').val('');
        jQuery('#importConfigModal').modal('hide');
    }
}
function exportConfig() {
    if (boosterselection.length === 0) {
        jQuery('#notifyToast .toast-body').html('<i class="fas fa-times-circle"></i> No packs selected!');
        jQuery('#notifyToast').toast('show');
        jQuery('#export_config').prop('disabled', false);
        return false;
    }
    let config = '';
    jQuery.each(boosterselection, function(key, item) {
        config += item.set + '|' + item.amount + "\r\n";
    });
    download("config.txt", config);
    jQuery('#export_config').prop('disabled', false);
}
function uploadCollection() {
    if (collection.length === 0) {
        jQuery('#notifyToast .toast-body').html('<i class="fas fa-times-circle"></i> Collection is empty!');
        jQuery('#notifyToast').toast('show');
        return false;
    }
    jQuery('#pulled-cards').before('<div class="spinner-border text-primary text-center ml-auto mr-auto d-block mt-2 mb-2" id="collectionSpinner" role="status"><span class="sr-only">Loading...</span></div>');
    var chunkSize = 300;
    var chunks = [];
    for (var i = 0; i < collection.length; i += chunkSize) {
        chunks.push(collection.slice(i, i + chunkSize));
    }
    var totalCount = 0;
    var p = Promise.resolve();
    chunks.reduce( (p, chunk) => {
        return p.then(_ => new Promise( (resolve, reject) => {
            jQuery.ajax({
                type: 'POST',
                url: "/api/collection/addCardDraft.php",
                data: {
                    draft: chunk,
                    box: box
                },
                dataType: "json",
                success: function(response) {
                    if (response.status === "success") {
                        var count = parseInt(response.message.split(' ')[0]);
                        totalCount += count;
                        resolve();
                    } else {
                        reject(new Error('Error uploading collection! ' + response.message));
                    }
                },
                error: function(xhr, status, error) {
                    reject(new Error('Ajax error: ' + error));
                }
            });
        }
        ));
    }
    , p).then( () => {
        jQuery('#notifyToast .toast-body').html('<i class="fas fa-check-circle"></i> Collection Uploaded Successfully with ' + totalCount + ' cards added to collection');
        jQuery('#notifyToast').toast('show');
        jQuery('#collectionSpinner').remove();
    }
    ).catch(err => {
        jQuery('#notifyToast .toast-body').html('<i class="fas fa-times-circle"></i> ' + err.message);
        jQuery('#notifyToast').toast('show');
        jQuery('#collectionSpinner').remove();
        jQuery('#addCollection').prop('disabled', false);
    }
    );
}
function start_pack_draft() {
    if (boosterselection.length === 0) {
        alert("Please select at least one pack to open.");
        return false;
    } else if (boosterselection.length > 300) {
        alert("You cannot open more than 300 packs at a time.");
        return false;
    }
    jQuery('#nextPack').attr("disabled", true).css("background-color", "#ddd").css("cursor", "not-allowed");
    let packcount = 0;
    boosterselection.forEach(function(item) {
        packcount += parseInt(item.amount);
    });
    jQuery('#remaining-pack-count').html(currentpack + '/' + packcount);
    let packquantity = boosterselection[packselection].amount;
    let selectedname = boosterselection[packselection].set;
    let typing = boosterselection[packselection].type;
    let alias = boosterselection[packselection].alias;
    let url;
    url = "/pack/" + encodeURIComponent(alias);
    jQuery('#selected-packs-area').hide();
    jQuery('#start-area').removeClass('d-block').addClass('d-none');
    jQuery('#play-area, #pulled-cards').removeClass('d-none').addClass('d-block');
    scroll_to_play_area();
    jQuery('#pack-name').html(selectedname + ' <a href="' + url + '" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square ml-2" title="View Card List"></i></a>');
    jQuery("#pack-sim-area").html('<div class="loader"></div>');
    var setname = selectedname;
    setname = setname.replace(" (European)", "");
    setname = setname.replace(" (OCG)", "");
    curset = setname;
    curtype = typing;
    curalias = alias;
    packOpen(setname, typing, server, true);
    currentpack++;
    if (curpackquant == packquantity) {
        packselection++;
        curpackquant = 1;
        if (!boosterselection[packselection]) {
            endgamestatus = true;
        }
    } else {
        curpackquant++;
    }
}
function outputPack(multiarray, setname=null) {
    var output = '';
    jQuery.each(multiarray, function(key, item) {
        const raritycolor = item.rarity.toLowerCase().replace(/ /g, '');
        var rarityhtml;
        if (!item.rarity.includes("Common")) {
            rarityhtml = '<span class="rare-card">';
        } else {
            rarityhtml = '<span>';
        }
        output += '<div class="flip-box" data-cardname="' + item.name + '" data-type="' + item.type + '" data-cardid="' + item.id + '" data-rarity="' + item.rarity + '">' + '<div class="flip-box-inner" onclick="revealCard(this)">' + '<div class="flip-box-front"><img class="card-style" src="https://images.pokemoncard.io/images/assets/CardBack.jpg" title="Flip Card"></div>' + '<div class="flip-box-back" title="' + item.name + '" data-name="' + item.id + '">' + '<figure><a href="/card?search=' + item.id + '" target="_blank" style="pointer-events:none;" class="cardanchor">' + rarityhtml + '' + '<img class="card-style" loading=lazy src="https://images.pokemoncard.io/images/' + (item.id).split("-")[0] + '/' + item.id + '_hiresopt.jpg" title="' + item.name + ' - Rarity: ' + item.rarity + '">' + '</span></a>' + '<figcaption style="display:none;">' + '<span class="flip-meta-name text-truncate">' + item.name + '</span>' + '<span class="flip-meta"><span class="add-builder"><i class="fas fa-plus-square" aria-hidden="true" title="Select this Card for Chaos Draft" data-id="' + item.id + '" data-name="' + encodeURIComponent(item.name) + '" data-type="' + item.type + '" data-setname="' + encodeURIComponent(setname) + '" data-edition="' + item.edition + '" data-rarity="' + item.rarity + '" data-price="' + item.price + '" data-setcode="' + item.setCode + '" onClick="chaosDraft(this)"></i></span>' + '<span class="' + raritycolor + '">' + item.rarity + '</span> - <a href="' + item.url + '" target="_blank" style="colorvar(--primary);">$' + item.price + '</a></span>' + '</figcaption></figure></div></div></div>';
    });
    jQuery('#pack-sim-area').empty().html(output);
    jQuery('#flip').attr("disabled", false).css("background-color", "").css("cursor", "pointer");
    if (chaos !== false) {
        jQuery('.add-builder').css('display', 'inline-block');
        jQuery('#chaos-draft-message').removeClass('d-none').addClass('d-block');
        chaospicked = false;
    }
}
function add_to_collection_array(card, setname=null) {
    let tempcollection = [];
    tempcollection.push(card.id, card.name, card.type, setname, card.edition, card.rarity, card.price, card.setCode);
    collection.push(tempcollection);
}
function changeBox() {
    box = jQuery('#collection_box_choice').val();
}
function serverSelect() {
    server = jQuery('#pack_sim_server').val();
}
jQuery(function() {
    revealCard = function(elm) {
        jQuery(elm).prop("onclick", null).off("click");
        jQuery(".flip-box-back figure figcaption", elm).css('display', 'block');
        let price = parseFloat(jQuery(elm).find('.add-builder i').attr('data-price'));
        if (!isNaN(price)) {
            totalCardValue += price;
            jQuery('#total-price').text(totalCardValue.toFixed(2));
        }
        revcount = revcount - 1;
        jQuery(elm).css('-webkit-transform', 'rotateY(-180deg)').css('-moz-transform', 'rotateY(-180deg)').css('transform', 'rotateY(-180deg)');
        if (revcount <= 0) {
            jQuery('#flip').attr("disabled", true).css("background-color", "#ddd").css("cursor", "not-allowed");
            jQuery('#nextPack').attr("disabled", false).css("background-color", "").css("cursor", "pointer");
            jQuery(".flip-box-inner").prop("onclick", null).off("click");
            showPulls();
            if (endgamestatus === true) {
                show_end_screen();
            }
        }
        jQuery(".flip-box-back figure a", elm).css('pointer-events', 'auto');
    }
    ;
});
function endGame() {
    jQuery('#nextPack').attr("disabled", true).css("background-color", "#ddd").css("cursor", "not-allowed");
}
jQuery(document).on('click', '#flip', function() {
    jQuery(".flip-box-inner").prop("onclick", null).off("click");
    jQuery('.flip-box-inner').css('-webkit-transform', 'rotateY(-180deg)').css('-moz-transform', 'rotateY(-180deg)').css('transform', 'rotateY(-180deg)');
    jQuery("figcaption").css('display', 'block');
    jQuery("figure a").css('pointer-events', 'auto');
    jQuery('#flip').attr("disabled", true).css("background-color", "#ddd").css("cursor", "not-allowed");
    jQuery('#nextPack').attr("disabled", false).css("background-color", "").css("cursor", "pointer");
    showPulls();
    if (endgamestatus === true) {
        show_end_screen();
    }
});
jQuery(document).on('click', '#returnToPackSelect', function() {
    resetAll();
});
function resetAll() {
    totalCardValue = 0;
    customdraftmode = 0;
    revcount = 0;
    packcount = 0;
    curpackquant = 1;
    currentpack = 1;
    cardcount = 0;
    packselection = 0;
    collection = [];
    boosterselection = [];
    endgamestatus = false;
    chaos = false;
    jQuery('input[type=number]').val(0);
    jQuery('#flip, #retry, #nextPack').attr("disabled", false).css("background-color", "").css("cursor", "default");
    jQuery('#selected-packs-area').show();
    jQuery('#selected-packs, #pulled-cards-container').empty();
    jQuery('#addCollection').prop('disabled', false);
    jQuery('#import_config').prop('disabled', false);
    jQuery('#start-area').removeClass('d-none').addClass('d-block');
    jQuery('#finish-area, #play-area, #pulled-cards, #chaos-draft-message').removeClass('d-block').addClass('d-none');
    jQuery('#total-price').text('0.00');
}
jQuery(document).on('click', '#float-menu-item', function() {
    jQuery('#selected-packs-area').toggleClass('float-menu-open');
    if (jQuery('#float-menu-toggle').hasClass('fa-circle-arrow-right')) {
        jQuery('#float-menu-toggle').removeClass('fa-circle-arrow-right').addClass('fa-circle-arrow-left');
    } else {
        jQuery('#float-menu-toggle').removeClass('fa-circle-arrow-left').addClass('fa-circle-arrow-right');
    }
});
jQuery(document).on('input', '.pack-num-input', function() {
    var packname = jQuery(this).attr('data-set');
    var packtype = jQuery(this).attr('data-type');
    var packalias = jQuery(this).attr('data-alias');
    var packamount = jQuery(this).val();
    var packdate = jQuery(this).attr('data-date');
    if (packamount > 0) {
        var packexists = 0;
        for (var i = 0; i < boosterselection.length; i++) {
            if (boosterselection[i]['set'] == packname && boosterselection[i]['type'] == packtype && boosterselection[i]['alias'] == packalias) {
                boosterselection[i]['amount'] = packamount;
                packexists = 1;
            }
        }
        if (packexists == 0) {
            boosterselection.push({
                'set': packname,
                'type': packtype,
                'alias': packalias,
                'amount': packamount,
                'date': packdate
            });
        }
    } else {
        for (var i = 0; i < boosterselection.length; i++) {
            if (boosterselection[i]['set'] == packname && boosterselection[i]['type'] == packtype && boosterselection[i]['alias'] == packalias) {
                boosterselection.splice(i, 1);
            }
        }
    }
    updatePackDisplay();
});
function updatePackDisplay() {
    jQuery('#selected-packs').html('');
    if (boosterselection.length == 0) {
        jQuery('#selected-packs').append('<div class="float-menu-item"><span class="float-menu-item-name">No Packs Selected</span></div>');
    } else {
        for (var i = 0; i < boosterselection.length; i++) {
            jQuery('#selected-packs').append('<div class="float-menu-item text-truncate d-block" title="' + boosterselection[i]['set'] + '"><span class="float-menu-item-amount">' + boosterselection[i]['amount'] + 'x </span><span class="float-menu-item-name">' + boosterselection[i]['set'] + '</span></div>');
        }
    }
}
function showPulls() {
    if (collection.length > 0) {
        let pullhtml = '';
        const cardSets = [...new Set(collection.map( (card) => card[3]))];
        for (let set of cardSets) {
            const cardsInSet = collection.filter( (card) => card[3] === set);
            cardsInSet.sort( (a, b) => {
                if (a[5] === b[5]) {
                    return a[2].localeCompare(b[2]);
                } else {
                    return a[5].localeCompare(b[5]);
                }
            }
            );
            let cardCounts = {};
            for (let card of cardsInSet) {
                const cardKey = card[0] + "-" + card[5];
                cardCounts[cardKey] = (cardCounts[cardKey] || 0) + 1;
            }
            pullhtml += '<div class="set-container">';
            pullhtml += '<h4>' + set + '</h4>';
            pullhtml += '<div id="pulled-card-rowparent" class="row justify-content-start flex flex-wrap card-flex-container m-auto">';
            for (let i = 0; i < cardsInSet.length; i++) {
                const rarity = cardsInSet[i][5].toLowerCase().replace(/ /g, '');
                const cardKey = cardsInSet[i][0] + "-" + cardsInSet[i][5];
                if (cardCounts[cardKey] > 0) {
                    if (viewMode === 'image') {
                        pullhtml += '<div class="pulled-card-row m-2 text-center position-relative"><figure><img data-name="' + cardsInSet[i][0] + '" src="https://images.pokemoncard.io/images/' + (cardsInSet[i][0]).split("-")[0] + '/' + cardsInSet[i][0] + '_hiresopt.jpg" alt="' + cardsInSet[i][1] + '" class="pulled-card" loading="lazy"><figcaption><span class="d-block text-truncate text-center small">' + cardsInSet[i][1] + '</span><span class="d-block text-truncate text-center small ' + rarity + '">' + cardsInSet[i][5] + '</span></figcaption><div class="card-quantity-overlay">' + cardCounts[cardKey] + '</div></figure></div>';
                    } else {
                        pullhtml += '<div class="w-100 text-left justify-content-start">' + '<a href="#" data-name="' + cardsInSet[i][0] + '">' + cardsInSet[i][1] + '</a>' + ' (<span class="' + rarity + '">' + cardsInSet[i][5] + '</span>) x' + cardCounts[cardKey] + '</div>';
                    }
                    cardCounts[cardKey] = 0;
                }
            }
            pullhtml += '</div>';
            pullhtml += '</div>';
        }
        jQuery('#pulled-cards-container').html(pullhtml);
    }
}
async function autoOpen() {
    if (boosterselection.length === 0) {
        alert("Please select at least one pack to open.");
        return false;
    } else if (boosterselection.length > 300) {
        alert("You cannot open more than 300 packs at a time.");
        return false;
    }
    show_loader_overlay();
    for (var i = 0; i < boosterselection.length; i++) {
        var packamount = boosterselection[i]["amount"];
        for (var j = 0; j < packamount; j++) {
            var packdata = boosterselection[i];
            let response = await packOpen(packdata["set"], packdata["type"], server);
            var overallProgress = i * packamount + j + 1;
            update_loader_overlay(overallProgress, packdata["set"]);
        }
    }
    hide_loader_overlay();
    showPulls();
    show_end_screen();
}
function packOpen(cardset, settype, server, auto=null, retry=5, backoff=1000) {
    return new Promise(function(resolve, reject) {
        if (cardset != '' && settype != '' && server != '') {
            let setname = cardset;
            setname = setname.replace(" (European)", "");
            setname = setname.replace(" (OCG)", "");
            url = "/api/pack-sim/pack-open.php?format=" + encodeURIComponent(setname) + "&server=" + server;
            console.log(settype);
            if (settype == 500 || settype == 501 || settype == 502) {
                url += "&settype=" + settype;
            } else {
                url += "&settype=2";
            }
            jQuery.ajax({
                cache: false,
                url: url,
                dataType: "json",
                success: function(data) {
                    if (chaos === false) {
                        data.forEach(card => add_to_collection_array(card, setname));
                    }
                    if (auto != null) {
                        revcount = data[0].length;
                        outputPack(data, setname);
                    }
                    resolve();
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    if (retry > 0) {
                        setTimeout( () => {
                            packOpen(cardset, settype, server, auto, retry - 1, backoff * 2).then(resolve).catch(reject);
                        }
                        , backoff);
                    } else {
                        jQuery('#pack-sim-area').html('<div class="alert alert-danger" role="alert">Failed to load pack contents</div>');
                        reject(thrownError);
                    }
                }
            });
        } else {
            jQuery('#pack-sim-area').html('<div class="alert alert-danger" role="alert">Error: Missing parameters</div>');
            reject('Missing parameters');
        }
    }
    );
}
function show_end_screen(auto=false) {
    jQuery('#nextPack').attr("disabled", true).css("background-color", "#ddd").css("cursor", "not-allowed");
    if (auto === true) {
        jQuery('#play-area').removeClass('d-block').addClass('d-none');
    }
    jQuery('#start-area').removeClass('d-block').addClass('d-none');
    jQuery('#finish-area, #pulled-cards').removeClass('d-none').addClass('d-block');
    jQuery('html, body').animate({
        scrollTop: jQuery("#finish-area").offset().top
    }, 1000);
    if (!jQuery('#pulledCardsCollapse').hasClass('show')) {
        jQuery('#pulledCardsCollapse').collapse('show');
    }
}
function show_loader_overlay() {
    var packcount = 0;
    for (var i = 0; i < boosterselection.length; i++) {
        packcount += parseInt(boosterselection[i]['amount']);
    }
    jQuery('#selected-packs-area').hide();
    jQuery('#auto-open-progress').attr('max', packcount);
    jQuery('#auto-open-progress').attr('value', 0);
    jQuery('#auto-open-progress').css('width', '0%');
    jQuery('#auto-open-progress').html('0%');
    jQuery('#autoOpenModal').modal({
        backdrop: 'static',
        keyboard: false
    }).modal('show');
}
function hide_loader_overlay() {
    jQuery('#autoOpenModal').modal('hide');
}
function update_loader_overlay(packnumber, packname) {
    var max = jQuery('#auto-open-progress').attr('max');
    var percentage = (packnumber / max) * 100;
    jQuery('#auto-open-progress').attr('value', packnumber);
    jQuery('#auto-open-progress').css('width', percentage + '%');
    jQuery('#auto-open-progress').html(Math.round(percentage) + '%');
    jQuery('#auto-open-text').html('Opening Pack ' + packnumber + ' of ' + max + ' (' + packname + ')');
}
function scroll_to_play_area() {
    var distanceThreshold = 400;
    var playAreaPosition = jQuery("#play-area").offset().top;
    var currentScrollPosition = jQuery(document).scrollTop();
    if (Math.abs(currentScrollPosition - playAreaPosition) > distanceThreshold) {
        jQuery('html, body').animate({
            scrollTop: playAreaPosition
        }, 500);
    }
}
jQuery('#toggleViewModeButton').on('click', function() {
    if (viewMode === 'image') {
        viewMode = 'text';
    } else {
        viewMode = 'image';
    }
    showPulls();
});