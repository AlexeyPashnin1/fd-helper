let ticketID;

function copyLink(event) {
    let tmpInput = document.createElement("input");
    document.querySelector("body").appendChild(tmpInput);
    if (event.target.tagName == "A") {
        tmpInput.value = location.origin + location.pathname + '?note=' + event.target.innerText;
    } else {
        tmpInput.value = event.target.innerText;
        localStorage.setItem(`snizeSpentTime${ticketID}`, event.target.innerText);
    }
    tmpInput.select();
    document.execCommand("copy");
    document.querySelector("body").removeChild(tmpInput);
    event.target.nextElementSibling.style.opacity = 1;
}

function clearQuotes() {
    document.querySelectorAll(`.gmail_quote,
            .x_freshdesk_quote,
            blockquote,
            #Zm-_Id_-Sgn1,
            .mb_sig`)
        .forEach((e) => { e.style.display = 'none' });
}

function addSysClearQuotes() {
    if (!document.querySelector('.conversation-dotted-loader')) {
        document.querySelectorAll('div[data-test-id="conversation-wrapper"]').forEach(function (e) {
            let noteID = e.getAttribute('data-album').replace('note_', '');
            if (e.querySelector('.created-time') && !e.querySelector('.copy-note-link')) {
                e.querySelector('.created-time').appendChild(document.createElement("span"))
                    .outerHTML = `<span class="copy-note-link">
                        <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit'" style="color: inherit; cursor: pointer;">${noteID}</a>
                        <a class="check" style="opacity: 0; transition-duration: 0.1s;"> ✔</a>
                        </span>`;
            }
        })
    }
    if (document.querySelector('input[data-test-text-field="timeSpentDisp"]')) {
        if (localStorage.getItem(`snizeSpentTime${ticketID}`)) {
            document.querySelector('input[data-test-text-field="timeSpentDisp"]').value = localStorage.getItem(`snizeSpentTime${ticketID}`);
            document.querySelector('input[data-test-text-field="timeSpentDisp"]').dispatchEvent(new Event('change', { 'bubbles': true }));
            localStorage.removeItem(`snizeSpentTime${ticketID}`)
        }
    }
    document.querySelectorAll('.copy-note-link, .timer-pop-up span:not(.timer-log-time)').forEach(function (e) {
        e.removeEventListener('click', copyLink);
        e.addEventListener('click', copyLink);
    });

    if (window.location.href.includes('https://searchanise.freshdesk.com/')) {
        if (!document.querySelector('.status-cards-container')
            || !document.querySelector('.info-details-widget .info-details-content')
            || document.querySelector('.snize-fd-helper')
        ) {
            return;
        }
        let clientsEmail;
        document.querySelectorAll('.text__infotext').forEach(function (e) {
            if (e.innerText == 'Email') {
                clientsEmail = encodeURIComponent(e.nextElementSibling.innerText);
            }
        });
        let engineIDFromText = document.querySelector('#ticket_original_request').innerText.split('Engine id:')[1] || false;
        if (engineIDFromText) {
            let engineID = engineIDFromText.match(/[0-9]{5,}/);
            document.querySelector('.status-cards-container')
                .appendChild(document.createElement("span"))
                .outerHTML = `<span class='snize-fd-helper app-icon-btn--text' style="display: flex;flex-direction: column;align-content: flex-start;font-weight: bold;font-size: larger;padding: 0;"'>
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href=https://syspanel.searchserverapi.com/resources/engines/${engineID} target="_blank" rel="noopener noreferrer">SYSPANEL&nbsp;</a>
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href=https://syspanel.searchserverapi.com/see/${engineID} target="_blank" rel="noopener noreferrer">ADMIN PANEL&nbsp;</a>
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href="https://syspanel.searchserverapi.com/resources/engines?engines_page=1&engines_search=${clientsEmail}" target="_blank" rel="noopener noreferrer">FIND ENGINES</a>
                    <a class="clear-quotes" onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit'" style="cursor: pointer;">CLEAR QUOTES</a>
                    </span>`;
        } else {
            document.querySelector('.status-cards-container')
                .appendChild(document.createElement("span"))
                .outerHTML = `<span class="snize-fd-helper app-icon-btn--text" style="display: flex;flex-direction: column;align-content: flex-start;font-weight: bold;font-size: larger; padding: 0;">
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href="https://syspanel.searchserverapi.com/resources/engines?engines_page=1&engines_search=${clientsEmail}" target="_blank" rel="noopener noreferrer">FIND ENGINES</a>
                    <a class="clear-quotes" onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" style="cursor: pointer;">CLEAR QUOTES</a>
                    </span>`;
        }
        document.querySelector('.clear-quotes').removeEventListener('click', clearQuotes);
        document.querySelector('.clear-quotes').addEventListener('click', clearQuotes);
    } else if (window.location.href.includes('https://searchanise.freshchat.com/')) {
        if (!document.querySelector('.main-custom-properties .right-column')
            || document.querySelector('.main-custom-properties .right-column a')
        ) {
            return;
        }
        let engineID = document.querySelectorAll('.main-custom-properties .ember-tooltip-target')[1].innerText;     
        document.querySelector('.main-custom-properties .right-column').appendChild(document.createElement("a"));
        document.querySelector('.main-custom-properties .right-column a').outerHTML = `<a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href=https://syspanel.searchserverapi.com/resources/engines/${engineID} target="_blank" rel="noopener noreferrer" style="color: inherit; font-weight: bold; font-size: larger;">SYSPANEL</a>`;
    }
}

function waitForLog() {
    if(document.querySelector('button[aria-label="Log time"]')) {
        document.querySelector('button[aria-label="Log time"]').click();
    } else {
        setTimeout(waitForLog, 100);
    }
}

function showTimer() {
    if (localStorage.getItem(`snizeTimer${ticketID}`)) {
        let timerStarted = new Date(localStorage.getItem(`snizeTimer${ticketID}`));
        let timerStopped = new Date();
        let hours = Math.floor((timerStopped - timerStarted) / (1000 * 60 * 60));
        let minutes = Math.round((timerStopped - timerStarted) / (1000 * 60)) % 60;
        document.querySelector('body.ember-application').appendChild(document.createElement("div"))
            .outerHTML = `<div class="tpu timer-pop-up" style="font-weight: bold;padding:10px;background: white;height: 80px;width: 150px;position: fixed;top: 50%;right: 50%;z-index: 9;font-size: 20px;display: flex;align-content: center;flex-wrap: wrap;color:black;justify-content: space-between;align-items: center;box-shadow: 0 0 7px 1px;border-radius: 10px;">
                <span class="tpu timer-time" style="cursor: pointer;"onmouseover="this.style.color='red';"onmouseout="this.style.color='black';">${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}</span>
                <span class="tpu check" style="opacity: 0;transition-duration: 0.1s;position: absolute;top: 10px;left: 43%;color: green;"> ✔</span>
                <button style="padding: 0px 8px;height: 100%;position: absolute;right: 0;border-left: 1px solid black!important;cursor: pointer; font-size: 25px;border: none; background: none;"onmouseover="this.style.color='red';"onmouseout="this.style.color='black'">X</button>
                <span class="tpu timer-log-time" style="cursor: pointer; color: black;" onmouseover="this.style.color='red';" onmouseout="this.style.color='black'">LOG TIME</span>
                </div>`;
        localStorage.setItem(`snizeSpentTime${ticketID}`, `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`);
        document.querySelector('.timer-pop-up button').addEventListener('click', function () {
            document.querySelector('.timer-pop-up').remove();
        });
        document.querySelector('.timer-log-time').addEventListener('click', function () {
            document.querySelector('#time-entries div[data-test-id="time-entries_title"]').click();
            // setTimeout(function () {
            //     document.querySelector('button[aria-label="Log time"]').click();
            // }, 500);
            waitForLog();
            document.querySelector('.timer-pop-up').remove();
        });
        localStorage.removeItem(`snizeTimer${ticketID}`);
    }
}

addSysClearQuotes();

document.addEventListener('keydown', function (e) {
    if (e.keyCode === 27 && document.querySelector('.timer-pop-up'))
        document.querySelector('.timer-pop-up').remove();
});

document.addEventListener('mousedown', function (e) {
    if (!e.target.classList.contains('tpu') && document.querySelector('.timer-pop-up'))
        document.querySelector('.timer-pop-up').remove();
});

function waitForObserve() {
    if (document.querySelector('.user-meta')
        || document.querySelector('.ember-application')
        && document.querySelector('.requestor-wrap')
    ) {
        ticketID = document.querySelector('.requestor-wrap').getAttribute('data-album').replace('ticket_', '');
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        function trackChange(element) {
            var observer = new MutationObserver(function (mutations, observer) {
                addSysClearQuotes();
                if (document.querySelector('.ticket-editor__bodytext')
                    && !document.querySelector('.timer-pop-up')
                    && !localStorage.getItem(`snizeTimer${ticketID}`))
                    localStorage.setItem(`snizeTimer${ticketID}`, new Date());
                if (document.querySelector('button[aria-label="Reply"]')) {
                    document.querySelectorAll('button[aria-label="Reply"], button[aria-label="Add note"], .ticket-actions-container button[data-test-conversation-actions="edit"]')
                        .forEach(function (e) {
                            e.addEventListener('click', function () {
                                if (!localStorage.getItem(`snizeTimer${ticketID}`))
                                    localStorage.setItem(`snizeTimer${ticketID}`, new Date());
                            });
                        });
                }
                if (document.querySelector('.ticket-action__btn')
                    && document.querySelector('.ticket-editor__bodytext')
                ) {
                    document.querySelectorAll('.ticket-action__btn .btn--primary:not(.dropdown-toggle), .ticket-action__btn .btn--secondary, .ticket-action__btn .discard-draft, .ticket-actions-container button[data-test-conversation-actions="delete"]')
                        .forEach(function (e) {
                            e.addEventListener('click', showTimer);
                        })
                }
                if (document.querySelector('ul.dropdown-normal li.app-dropdown__item')) {
                    document.querySelectorAll('ul.dropdown-normal li.app-dropdown__item').forEach(function (e) {
                        e.removeEventListener('click', showTimer);
                        e.addEventListener('click', showTimer);
                    });
                }
                if ($('.ticket-details-header').length
                    && !$('.ticket-details-header .check').length
                ) {
                    $('.ticket-details-header').prepend(`<span class="check" style="height: 1px;width: 100%;position: absolute;top: 0;"></span>`)
                }
                if (localStorage.getItem(`snizeTimer${ticketID}`)) {
                    $('.ticket-details-header .check').css('background', 'lightgreen');
                } else {
                    $('.ticket-details-header .check').css('background', 'red');
                }
            });
            observer.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        }
        trackChange(document.querySelector('.ember-application'));
    } else {
        setTimeout(waitForObserve, 100);
    }
}
waitForObserve();
