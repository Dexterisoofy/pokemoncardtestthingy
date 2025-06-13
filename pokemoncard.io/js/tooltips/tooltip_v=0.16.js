window.TooltipStatus = true; //To allow global control of tooltips
window.isTooltipShown = false; //To handle if a tooltip is currently shown (used for mobile)

function updateTooltipStatus() {
    let tooltipToggle = document.getElementById('tooltipToggle');
    if (tooltipToggle.checked) {
        window.TooltipStatus = true;
        localStorage.setItem('tooltipEnabled', 'true');
    } else {
        window.TooltipStatus = false;
        localStorage.setItem('tooltipEnabled', 'false');
    }
}

//Event listener for checkbox toggle
document.getElementById('tooltipToggle').addEventListener('change', updateTooltipStatus);

//Set initial state on page load
document.addEventListener('DOMContentLoaded', () => {
    let tooltipToggle = document.getElementById('tooltipToggle');
    tooltipToggle.checked = localStorage.getItem('tooltipEnabled') !== 'false';
    window.TooltipStatus = tooltipToggle.checked;
});

//Small helper function to find the closest element when passing multiple attributes
function findNearestLinkWithAttribute(target, attributes) {
    for (const attr of attributes) {
        let link = target.closest(`[${attr}]`);

        if (link) {
            const suppressTooltip = link.closest('[data-trigger-tooltip="false"]');
            if (suppressTooltip) {
                return null;
            }
            return {link, value: link.getAttribute(attr)};
        }
    }
    return null;
}

//Event listener for our Tooltips
document.body.addEventListener('mouseenter', function(event) {
    if (!window.TooltipStatus) return;

    const tooltipTypes = [
        ['deck', ['data-deckurl'], (value) => +(value.split('-').pop())], /* deck by deck url */
        ['card', ['data-cardnumber', 'data-id','data-card'], (value) => value], /* card by card id */
        ['card', ['data-name','data-cardname'], (value) => value], /* card by card name */
        ['user', ['data-userid'], (value) => +value],                     /* user by user id */
    ];

    for (const [tippyType, dataAttributes, valueTransform] of tooltipTypes) {
        const info = findNearestLinkWithAttribute(event.target, dataAttributes);
        if (!info) continue;

        const {link, value} = info;
        if (link._tippy) return;
        initializeTippy(link, tippyType, valueTransform(value));
        break;
    }
}, {capture: true});

function initializeTippy(link, type, id) {
    if (typeof tippy !== 'function') {
        console.error('Tippy.js is not loaded.');
        return;
    }

    if (!link) {
        console.error('No link element found.');
        return;
    }

    window.isTooltipShown = true;

    let forceInteractive = false;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && type === 'deck' || isTouchDevice && type === 'user') return;

    if (type === 'user') {
        forceInteractive = true;
    }

    const tippyOptions = {
        theme: `${type}-preview`,
        content: 'Loading...',
        allowHTML: true,
        maxWidth: 550,
        delay: 150,
        appendTo: document.body,
        interactive: forceInteractive || isTouchDevice,
        trigger: isTouchDevice ? 'click' : 'mouseenter focus',
        onShow(instance) {
            if (type === 'deck') {
                fetchDataForDeck(instance, id);
            } else if (type === 'card') {
                fetchDataForCard(instance, id);
                updateCardViews(id);
            } else if (type === 'user') {
                fetchDataForUser(instance, id);
            }
        },
        onHidden(instance) {
            isTouchDevice && instance.destroy();
            window.isTooltipShown = false;
        }
    };

    if (isTouchDevice) {
        let lastTappedId = null;
        let tooltipInstance = null;

        link.addEventListener('click', function(event) {
            if (lastTappedId === id && tooltipInstance) {
                window.isTooltipShown = false;
                if (!link.href) {
                    link = link.closest('a');
                }
                if (link && link.hasAttribute('href')) {
                    window.location.href = link.href;
                }
                lastTappedId = null;
                if (!tooltipInstance.state.isDestroyed) {
                    tooltipInstance.destroy();
                }
                tooltipInstance = null;
            } else {
                window.isTooltipShown = true;
                event.preventDefault();
                if (tooltipInstance && !tooltipInstance.state.isDestroyed) {
                    tooltipInstance.destroy();
                }
                tooltipInstance = tippy(link, tippyOptions);
                tooltipInstance.show();
                lastTappedId = id;
            }
        });

        tippyOptions.onClickOutside = (instance, event) => {
            if (tooltipInstance) {
                tooltipInstance.hide();
            }
            lastTappedId = null;
            window.isTooltipShown = false;
        };
    } else {
        //Check if there is a href on the link, if not, generate one
        if (!link.href) {
            let alink = link.closest('a');
            if (!alink || !alink.href) {
                link.href = `/card/?search=${id}`;
                link.setAttribute('href', link.href);
            }
        }

        window.isTooltipShown = true;
        tippy(link, tippyOptions);
    }
}

async function fetchDataForDeck(tippyInstance, deckid) {
    try {
        const resp = await fetch(`/api/decks/getDeckInfo.php?deckId=${deckid}`)
        if (!resp.ok) throw `${resp.status} ${resp.statusText}`;
        const html = render_deck_preview(await resp.json());
        tippyInstance.setContent(html);
    } catch (error) {
        tippyInstance.setContent('Failed to load deck data');
        console.error(error);
    }
}

async function fetchDataForCard(tippyInstance, card) {
    try {
        const type = 'card';
        const url = `/api/search.php?num=1&offset=0&${type}=${card}`;

        const resp = await fetch(url);
        if (!resp.ok) throw `${resp.status} ${resp.statusText}`;
        const html = render_card_preview(await resp.json());
        tippyInstance.setContent(html);
    } catch (error) {
        tippyInstance.setContent('Failed to load card data');
        console.error(error);
    }
}

async function fetchDataForUser(tippyInstance, userid) {
    try {
        const resp = await fetch(`/api/users/usersearch.php?id=${userid}`)
        if (!resp.ok) throw `${resp.status} ${resp.statusText}`;
        const html = render_user_preview(await resp.json());
        tippyInstance.setContent(html);
    } catch (error) {
        tippyInstance.setContent('Failed to load user data');
        console.error(error);
    }
}

async function updateCardViews(card) {
    if(!card) return;
    try {
        const url = `/api/card/updateViews.php?card=${card}`;
        const resp = await fetch(url);
        if (!resp.ok) throw `${resp.status} ${resp.statusText}`;
    } catch (error) {
        console.error(error);
    }
}