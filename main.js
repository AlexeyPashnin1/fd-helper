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
	if (document.querySelector('.clear-quotes').classList.contains('quotes-show')) {
		document.querySelector('.clear-quotes').classList.add('quotes-hide');
		document.querySelector('.clear-quotes').classList.remove('quotes-show');
		document.querySelector('.clear-quotes').innerText = 'SHOW QUOTES';
	} else {
		document.querySelector('.clear-quotes').classList.remove('quotes-hide');
		document.querySelector('.clear-quotes').classList.add('quotes-show');
		document.querySelector('.clear-quotes').innerText = 'CLEAR QUOTES';
	}
	setTimeout(function () {
		if (document.querySelector('.quotes-hide') && !document.querySelector('.quotes-hidden')) {
			document.querySelector('body').classList.add('quotes-hidden');
			document.querySelector('body').classList.remove('quotes-shown');
		} else if (document.querySelector('.quotes-show') && !document.querySelector('.quotes-shown')) {
			document.querySelector('body').classList.add('quotes-shown');
			document.querySelector('body').classList.remove('quotes-hidden');
		}
	}, 0);
}

function addSysClearQuotes() {
	if (
		document.querySelector('.surveys:not(.fixed) .ticket-editor__action')
		&& !document.querySelector('.surveys .ticket-editor__action').classList.contains('ticket-editor__action--active')
	) {
		document.querySelector('.surveys').classList.add('fixed');
		setTimeout(function () {
			document.querySelector('.surveys button').click();
		}, 2000)
	}
	if (!document.querySelector('.conversation-dotted-loader')) {
		document.querySelectorAll('div[data-test-id="conversation-wrapper"], .requestor-wrap').forEach(function (e) {
			let noteID = e.getAttribute('data-album').replace('note_', '').replace('ticket_', '');
			if (e.querySelector('.created-time') && !e.querySelector('.show-raw')) {
				if (!e.classList.contains('requestor-wrap')) {
					e.querySelector('.created-time').appendChild(document.createElement("span"))
						.outerHTML = `<span class="copy-note-link">
                        <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit'" style="color: inherit; cursor: pointer;">${noteID}</a>
                        <a class="check" style="opacity: 0; transition-duration: 0.1s;"> ✔</a>
                        </span>`;
				}
				e.querySelector('.created-time').appendChild(document.createElement("span"))
					.outerHTML = `<span class="show-raw" html-id="${noteID} "onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit'" style="cursor: pointer; color: inherit; position: absolute; top: 18px; left: 0px;">show raw HTML</span>`;
				e.querySelector('.created-time .show-raw').addEventListener('click', function (event) {
					if (!document.querySelector('.raw-html')) {
						if (!e.classList.contains('requestor-wrap')) {
							fetch(`https://searchanise.freshdesk.com/api/_/conversations/${event.target.getAttribute('html-id')}`)
								.then(d => d.json())
								.then(function (text) {
									document.querySelector('body')
										.appendChild(document.createElement('div'))
										.outerHTML = `<div class="raw-html raw-html-main" style="overflow-y: scroll;position: fixed;height: auto;max-height: 80%;width: 50%;top: 10%;left: 10%;z-index: 9;background: white;padding: 25px 15px;box-shadow: 0 0 10px 5px black;word-wrap: break-word;"></div>`;
									document.querySelector('.raw-html-main').innerText = text.conversation.body;
									if (text.conversation.attachments.length > 0 && !document.querySelector('.raw-html-main a')) {
										document.querySelector('.raw-html-main').appendChild(document.createElement('span'))
											.outerHTML = `<span style="display: flex;flex-direction: column;"></span>`;
										text.conversation.attachments.forEach(function (attachment, i) {
											document.querySelector('.raw-html-main span').appendChild(document.createElement('a'))
												.outerHTML = `<a class="raw-html" target="_blank" href=${attachment.attachment_url}>[${i}] ${attachment.name}</a>`;
										})
									}
								})
						} else {
							fetch(`https://searchanise.freshdesk.com/api/_/tickets/${noteID}`)
								.then(d => d.json())
								.then(function (text) {
									document.querySelector('body')
										.appendChild(document.createElement('div'))
										.outerHTML = `<div class="raw-html raw-html-main" style="overflow-y: scroll;position: fixed;height: auto;max-height: 80%;width: 50%;top: 10%;left: 10%;z-index: 9;background: white;padding: 25px 15px;box-shadow: 0 0 10px 5px black;word-wrap: break-word;"></div>`;
									document.querySelector('.raw-html-main').innerText = text.ticket.description;
									if (text.ticket.attachments.length > 0 && !document.querySelector('.raw-html-main a')) {
										document.querySelector('.raw-html-main').appendChild(document.createElement('span'))
											.outerHTML = `<span style="display: flex;flex-direction: column;"></span>`;
										text.ticket.attachments.forEach(function (attachment, i) {
											document.querySelector('.raw-html-main span').appendChild(document.createElement('a'))
												.outerHTML = `<a class="raw-html" target="_blank" href=${attachment.attachment_url}>[${i}] ${attachment.name}</a>`;
										})
									}
								})
						}
					}
				})
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
		if (
			document.querySelector('[data-test-id="requester-info-contact-client_notes"]')
			&& !document.querySelector('.links-added')
		) {
			let clientNotesContent = document.querySelector('[data-test-id="requester-info-contact-client_notes"] .info-details-content');
			clientNotesContent.classList.add('links-added');
			clientNotesContent.innerText.split(/\\n|\s/)
				.forEach(function (el) {
					if (el.match(/http.*\\|http.*$/g)) {
						let textToReplace = el.match(/http.*\\|http.*$/g)[0];
						let textWithLink = `<a target="_blank" href="${textToReplace}">${textToReplace}</a>`
						clientNotesContent.innerHTML = clientNotesContent.innerHTML.replace(textToReplace, textWithLink);
						if (
							!engineIDFromText
							&& el.match(/syspanel\.searchserverapi\.com/)
						) {
							engineIDFromText = el.match(/\d+/)[0];
						}
					}
				})
		}
		let quotesText = document.querySelector('.quotes-hidden') ? 'SHOW QUOTES' : 'CLEAR QUOTES';
		let quotesClass = document.querySelector('.quotes-hidden') ? 'quotes-hide' : 'quotes-show';
		if (engineIDFromText) {
			let engineID = engineIDFromText.match(/[0-9]{5,}/);
			document.querySelector('.status-cards-container')
				.appendChild(document.createElement("span"))
				.outerHTML = `<span class='snize-fd-helper app-icon-btn--text' style="display: flex;flex-direction: column;align-content: flex-start;font-weight: bold;font-size: larger;padding: 0;"'>
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href=https://syspanel.searchserverapi.com/resources/engines/${engineID} target="_blank" rel="noopener noreferrer">SYSPANEL&nbsp;</a>
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href=https://syspanel.searchserverapi.com/see/${engineID} target="_blank" rel="noopener noreferrer">ADMIN PANEL&nbsp;</a>
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href="https://syspanel.searchserverapi.com/resources/engines?engines_page=1&engines_search=${clientsEmail}" target="_blank" rel="noopener noreferrer">FIND ENGINES</a>
                    <a class="clear-quotes ${quotesClass}" onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit'" style="cursor: pointer;">${quotesText}</a>
                    </span>`;
		} else {
			document.querySelector('.status-cards-container')
				.appendChild(document.createElement("span"))
				.outerHTML = `<span class="snize-fd-helper app-icon-btn--text" style="display: flex;flex-direction: column;align-content: flex-start;font-weight: bold;font-size: larger; padding: 0;">
                    <a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href="https://syspanel.searchserverapi.com/resources/engines?engines_page=1&engines_search=${clientsEmail}" target="_blank" rel="noopener noreferrer">FIND ENGINES</a>
                    <a class="clear-quotes ${quotesClass}" onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" style="cursor: pointer;">${quotesText}</a>
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
		if (!engineID.match(/\D/)) {
			document.querySelector('.main-custom-properties .right-column').appendChild(document.createElement("a"));
			document.querySelector('.main-custom-properties .right-column a').outerHTML = `<a onmouseover="this.style.color='red';" onmouseout="this.style.color='inherit';" href=https://syspanel.searchserverapi.com/resources/engines/${engineID} target="_blank" rel="noopener noreferrer" style="color: inherit; font-weight: bold; font-size: larger;">SYSPANEL</a>`;
		}
	}
}

function waitForLog() {
	if (document.querySelector('button[aria-label="Log time"]')) {
		document.querySelector('button[aria-label="Log time"]').click();
	} else {
		setTimeout(waitForLog, 100);
	}
}

function waitToRemoveTimer() {
	if (!document.querySelector('.ticket-editor__bodytext')) {
		localStorage.removeItem(`snizeTimer${ticketID}`);
	} else {
		setTimeout(waitToRemoveTimer, 100);
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
		waitToRemoveTimer();
		// localStorage.removeItem(`snizeTimer${ticketID}`);
		localStorage.setItem(`snizeSpentTime${ticketID}`, `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`);
		document.querySelector('.timer-pop-up button').addEventListener('click', function () {
			document.querySelector('.timer-pop-up').remove();
		});
		document.querySelector('.timer-log-time').addEventListener('click', function () {
			document.querySelector('#time-entries div[data-test-id="time-entries_title"]').click();
			waitForLog();
			document.querySelector('.timer-pop-up').remove();
		});
	}
}

addSysClearQuotes();

document.addEventListener('keydown', function (e) {
	if (e.keyCode === 27) {
		if (document.querySelector('.timer-pop-up') && !document.querySelector('.modal-overlay')) {
			document.querySelector('.timer-pop-up').remove();
		} else if (document.querySelector('.raw-html')) {
			document.querySelector('.raw-html').remove();
		}
	}
});

document.addEventListener('mousedown', function (e) {
	if (!e.target.classList.contains('tpu')
		&& document.querySelector('.timer-pop-up')
		&& !document.querySelector('.modal-overlay')
	) {
		document.querySelector('.timer-pop-up').remove();
	} else if (!e.target.classList.contains('raw-html')
		&& document.querySelector('.raw-html')) {
		document.querySelector('.raw-html').remove();
	}
});

let allConversations;
async function getConversationsData() {
	ticketID = document.querySelector('.requestor-wrap').getAttribute('data-album').replace('ticket_', '');
	await new Promise(function (resolve, reject) {
		if (allConversations) {
			addReplyAfterText();
			return;
		}

		fetch(`https://searchanise.freshdesk.com/api/_/tickets/${ticketID}`)
			.then(first_response => first_response.json())
			.then(function (ticket_description) {
				fetch(`https://searchanise.freshdesk.com/api/_/tickets/${ticketID}/conversations?per_page=100`)
					.then(second_response => second_response.json())
					.then(function (ticket_conversations) {
						allConversations = ticket_conversations.conversations
						allConversations.unshift(ticket_description.ticket);
						resolve(allConversations);
					})
			})
	});

	addReplyAfterText();
}

function addReplyAfterText() {
	allConversations.forEach(function (message, index) {
		if (conversation = document.querySelector(`[data-album="note_${message.id}"]:not(.after-added)`)) {
			let conversationStatus = conversation.querySelector('span[data-test-id="conversation-status"]');
			let currentTime = new Date(message.created_at);
			let prevNoteMainText = '';
			let mainText = '';
			let additionalText = '';
			if (allConversations[index - 1]) {
				if (allConversations[index - 1].private) {
					if (message.private) {
						for (let k = index - 1; k > 0; k--) {
							if (allConversations[k].private) {
								let prevNote = allConversations[k];
								let prevNoteTime = new Date(prevNote.created_at);
								let timeDiffDays = Math.floor((currentTime - prevNoteTime) / (1000 * 60 * 60 * 24));
								let timeDiffHours = Math.floor((currentTime - prevNoteTime) / (1000 * 60 * 60));
								let timeDiffMinutes = Math.floor((currentTime - prevNoteTime) / (1000 * 60)) % 60;
								mainText = timeDiffDays > 0 ? `${timeDiffDays}d ${timeDiffHours % 24}h ${timeDiffMinutes}m` : timeDiffHours > 0 ? `${timeDiffHours}h ${timeDiffMinutes}m` : '';
								additionalText = mainText != '' ? `(${timeDiffMinutes + timeDiffHours * 60} minutes)` : `${timeDiffMinutes + timeDiffHours * 60} minutes`
								conversationStatus.innerText = `note to note after ${mainText} ${additionalText}`;
								break;
							}
						}
					} else {
						let prevConversation;
						let prevConversationTime;
						let timeDiffDays;
						let timeDiffHours;
						let timeDiffMinutes;
						let prevNote;
						let prevNoteTime;
						let timeNoteDiffDays;
						let timeNoteDiffHours;
						let timeNoteDiffMinutes;
						for (let k = index - 1; k >= 0; k--) {
							if (!allConversations[k].private || allConversations[k].description) {
								prevConversation = allConversations[k];
								prevConversationTime = new Date(prevConversation.created_at);
								timeDiffDays = Math.floor((currentTime - prevConversationTime) / (1000 * 60 * 60 * 24));
								timeDiffHours = Math.floor((currentTime - prevConversationTime) / (1000 * 60 * 60));
								timeDiffMinutes = Math.floor((currentTime - prevConversationTime) / (1000 * 60)) % 60;
								break;
							} else if (!prevNote) {
								prevNote = allConversations[k];
								prevNoteTime = new Date(prevNote.created_at);
								timeNoteDiffDays = Math.floor((currentTime - prevNoteTime) / (1000 * 60 * 60 * 24));
								timeNoteDiffHours = Math.floor((currentTime - prevNoteTime) / (1000 * 60 * 60));
								timeNoteDiffMinutes = Math.floor((currentTime - prevNoteTime) / (1000 * 60)) % 60;
							}
						}
						let prevNoteText = timeNoteDiffDays > 0 ? `${timeNoteDiffDays}d ${timeNoteDiffHours % 24}h ${timeNoteDiffMinutes}m` : timeNoteDiffHours > 0 ? `${timeNoteDiffHours}h ${timeNoteDiffMinutes}m` : '';
						let prevNoteAdditionalText = prevNoteText != '' ? `(${timeNoteDiffMinutes + timeNoteDiffHours * 60} minutes)` : `${timeNoteDiffMinutes + timeNoteDiffHours * 60} minutes`;
						prevNoteMainText = `(${prevNoteText} ${prevNoteAdditionalText} after note)`;

						mainText = timeDiffDays > 0 ? `${timeDiffDays}d ${timeDiffHours % 24}h ${timeDiffMinutes}m` : timeDiffHours > 0 ? `${timeDiffHours}h ${timeDiffMinutes}m` : '';
						additionalText = mainText != '' ? `(${timeDiffMinutes + timeDiffHours * 60} minutes)` : `${timeDiffMinutes + timeDiffHours * 60} minutes`;
						conversationStatus.innerText = `replied after ${mainText} ${additionalText} ` + prevNoteMainText;
					}
				} else if (!message.private) {
					let prevConversation = allConversations[index - 1];
					if (!mainText) {
						let prevTime = new Date(prevConversation.created_at);
						let timeDiffDays = Math.floor((currentTime - prevTime) / (1000 * 60 * 60 * 24));
						let timeDiffHours = Math.floor((currentTime - prevTime) / (1000 * 60 * 60));
						let timeDiffMinutes = Math.round((currentTime - prevTime) / (1000 * 60)) % 60;
						mainText = timeDiffDays > 0 ? `${timeDiffDays}d ${timeDiffHours % 24}h ${timeDiffMinutes}m` : timeDiffHours > 0 ? `${timeDiffHours}h ${timeDiffMinutes}m` : '';
						additionalText = mainText != '' ? `(${timeDiffMinutes + timeDiffHours * 60} minutes)` : `${timeDiffMinutes + timeDiffHours * 60} minutes`;
						conversationStatus.innerText = `replied after ${mainText} ${additionalText} ` + prevNoteMainText;
					}
				}
			}
			conversation.classList.add("after-added");
		}
	})
}

function waitForObserve() {
	if (document.querySelector('.ember-application')) {
		if (document.querySelector('.requestor-wrap')) {
			ticketID = document.querySelector('.requestor-wrap').getAttribute('data-album').replace('ticket_', '');
		}
		let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		function trackChange(element) {
			var observer = new MutationObserver(function (mutations, observer) {
				if (document.querySelector('[data-test-id="tags_test_label"]')) {
					document.querySelectorAll('[data-test-id="tags_test_label"]:not(.custom)').forEach(el => {
						let tagsCounter = el.querySelector('.list-items-left-count');
						if (tagsCounter) {
							let ticketID = el.parentNode.parentNode.getAttribute('data-test-id').match(/\d+/)[0];
							el.classList.add('custom');
							fetch(`https://searchanise.freshdesk.com/api/_/tickets/${ticketID}`)
								.then(d => d.json())
								.then(data => {
									let tagsCont = el.querySelector('[data-test-list-items]');
									tagsCont.innerHTML = '';
									data.ticket.tags.forEach(tag => {
										tagsCounter.classList.add('hidden');
										el.querySelector('.list-items-left').classList.add('hidden');
										tagsCont.appendChild(document.createElement("span"))
											.outerHTML = `<span data-test-list-item="" class="list-item">${tag}</span>`;
									})
								});
						}
					})
				}
				if (document.querySelector('#ember-basic-dropdown-wormhole div')
					&& document.querySelector('.ticket-overlay-content-text')
					&& document.querySelector('.ticket-overlay-content-text').innerText.match(/\.\.\.$/)
				) {
					let ticketHoveredID = document.querySelector('table div.trigger-shortcuts[aria-expanded="true"]')
						.getAttribute('data-test-id')
						.replace('ticket-subject-hover-', '');
					document.querySelector('.ticket-overlay-content-text')
						.appendChild(document.createElement("a"))
						.outerHTML = `<a class="hovered-show-more" style="cursor: pointer;float: right;" ticket-hovered-id="${ticketHoveredID}">Show more</a>`;
					document.querySelector('.hovered-show-more').addEventListener('click', function (event) {
						fetch(`https://searchanise.freshdesk.com/api/_/tickets/${event.target.getAttribute('ticket-hovered-id')}/latest_note`)
							.then(d => d.json())
							.then(text => document.querySelector('.ticket-overlay-content-text').innerHTML = text.conversation.body_text);
					});
				}
				if (document.querySelectorAll('span[data-test-id="conversation-status"]').length >= 1) {
					getConversationsData();
				}
				if (document.querySelector('.clear-quotes') && !document.querySelector('.quotes-style')) {
					var css = `.quotes-hidden .gmail_quote,.quotes-hidden .x_freshdesk_quote,.quotes-hidden blockquote,.quotes-hidden #Zm-_Id_-Sgn1,.quotes-hidden .mb_sig { display: none; }
                    .quotes-shown .gmail_quote,.quotes-shown .x_freshdesk_quote,.quotes-shown blockquote,.quotes-shown #Zm-_Id_-Sgn1,.quotes-shown .mb_sig { display: block; }`,
						head = document.head || document.getElementsByTagName('head')[0],
						style = document.createElement('style');

					head.appendChild(style);

					style.type = 'text/css';
					style.classList.add('quotes-style');
					if (style.styleSheet) {
						style.styleSheet.cssText = css;
					} else {
						style.appendChild(document.createTextNode(css));
					}
				}
				if (document.querySelector('.fr-recentCode')) {
					document.querySelectorAll('.fr-recentCode, [rel="highlighter"]').forEach(function (el) {
						if (el.parentNode.tagName == 'DIV' && el.innerHTML.split('\n').length > 30)
							el.outerHTML = '<details>' + el.outerHTML + '</details>';
					});
				}
				if (document.querySelector('[data-test-id="Platform"] .ember-power-select-selected-item')) {
					let selectedPlatform = document.querySelector('[data-test-id="Platform"] .ember-power-select-selected-item').innerText;
					if (
						['Woocommerce', 'Wix'].includes(selectedPlatform)
						&& document.querySelector('.ticket-editor__footer')
						&& !document.querySelector('.review-request')
					) {
						document.querySelector('.ticket-editor__footer').insertAdjacentHTML('afterend', `<span style="
                            float: right;
                            color: white;
                            background: red;
                            text-align: center;
                            width: 100%;
                            font-weight: 700;" class="review-request">
                            This is a ${selectedPlatform} platform, you can request positive or 5-star review directly or in exchange for something from our side
                            </span>`);
					}
				}
				addSysClearQuotes();
				if (document.querySelector('.ticket-editor__bodytext')
					&& ticketID
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
				if (document.querySelector('.ticket-editor__bodytext')
					&& document.querySelector('.ticket-action__btn')
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
				if (!localStorage.getItem(`snizeTimer${ticketID}`)) {
					$('.ticket-details-header .check').css('background', 'red');
				} else {
					$('.ticket-details-header .check').css('background', 'lightgreen');
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
