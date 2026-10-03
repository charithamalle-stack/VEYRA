const state = {
    emails: [],
    currentView: "dashboard",
    currentFilter: "All",
    currentEmail: null,
    searchQuery: ""
};


const elements = {
    onboarding: document.getElementById("onboarding"),
    app: document.getElementById("app"),
    enterVeyra: document.getElementById("enterVeyra"),
    skipOnboarding: document.getElementById("skipOnboarding"),

    dashboardView: document.getElementById("dashboardView"),
    todayView: document.getElementById("todayView"),
    inboxView: document.getElementById("inboxView"),

    recentEmails: document.getElementById("recentEmails"),
    attentionEmails: document.getElementById("attentionEmails"),
    laterEmails: document.getElementById("laterEmails"),
    handledEmails: document.getElementById("handledEmails"),
    inboxList: document.getElementById("inboxList"),
    categoryBreakdown: document.getElementById("categoryBreakdown"),

    globalSearch: document.getElementById("globalSearch"),

    emailModal: document.getElementById("emailModal"),
    closeEmail: document.getElementById("closeEmail"),

    detailAvatar: document.getElementById("detailAvatar"),
    detailSender: document.getElementById("detailSender"),
    detailEmail: document.getElementById("detailEmail"),
    detailSubject: document.getElementById("detailSubject"),
    detailDate: document.getElementById("detailDate"),
    detailBody: document.getElementById("detailBody"),
    detailImportant: document.getElementById("detailImportant"),

    aiSummary: document.getElementById("aiSummary"),
    aiCategory: document.getElementById("aiCategory"),
    aiPriority: document.getElementById("aiPriority"),
    aiAction: document.getElementById("aiAction"),
    aiDeadline: document.getElementById("aiDeadline"),
    aiSuggestedAction: document.getElementById("aiSuggestedAction"),
    aiSource: document.getElementById("aiSource"),

    markReadButton: document.getElementById("markReadButton"),
    markImportantButton: document.getElementById("markImportantButton"),
    addTaskButton: document.getElementById("addTaskButton"),
    archiveButton: document.getElementById("archiveButton"),

    toastContainer: document.getElementById("toastContainer"),

    infoModal: document.getElementById("infoModal"),
    securityInfo: document.getElementById("securityInfo"),
    closeInfo: document.getElementById("closeInfo"),
    closeInfoButton: document.getElementById("closeInfoButton"),

    openMobileSidebar: document.getElementById("openMobileSidebar"),
    closeMobileSidebar: document.getElementById("closeMobileSidebar")
};


document.addEventListener("DOMContentLoaded", initialize);


async function initialize() {
    bindEvents();

    const seen = localStorage.getItem("veyra_onboarding_seen");

    if (seen === "true") {
        showApp();
    }

    await loadEmails();
}


function bindEvents() {
    elements.enterVeyra.addEventListener("click", finishOnboarding);
    elements.skipOnboarding.addEventListener("click", finishOnboarding);

    elements.closeEmail.addEventListener("click", closeEmailModal);

    elements.emailModal
        .querySelector(".modal-backdrop")
        .addEventListener("click", closeEmailModal);

    elements.securityInfo.addEventListener("click", openInfoModal);
    elements.closeInfo.addEventListener("click", closeInfoModal);
    elements.closeInfoButton.addEventListener("click", closeInfoModal);

    elements.infoModal
        .querySelector(".modal-backdrop")
        .addEventListener("click", closeInfoModal);

    elements.markReadButton.addEventListener("click", markCurrentRead);
    elements.markImportantButton.addEventListener("click", toggleCurrentImportant);
    elements.detailImportant.addEventListener("click", toggleCurrentImportant);
    elements.addTaskButton.addEventListener("click", addCurrentTask);
    elements.archiveButton.addEventListener("click", archiveCurrentEmail);

    elements.globalSearch.addEventListener("input", handleSearch);

    document.querySelectorAll(".nav-item").forEach(button => {
        button.addEventListener("click", () => {
            showView(button.dataset.view);
        });
    });

    document.querySelectorAll("[data-view-target]").forEach(button => {
        button.addEventListener("click", () => {
            showView(button.dataset.viewTarget);
        });
    });

    document.querySelectorAll(".filter-button").forEach(button => {
        button.addEventListener("click", () => {
            setFilter(button.dataset.filter);
        });
    });

    document.querySelectorAll(".category-nav").forEach(button => {
        button.addEventListener("click", () => {
            showView("inbox");
            setFilter(button.dataset.filter);
        });
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
        elements.globalSearch.value = "";
        state.searchQuery = "";
        setFilter("All");
    });

    document.getElementById("refreshDashboard").addEventListener("click", () => {
        renderAll();
        showToast("Dashboard refreshed", "Your attention view is up to date.");
    });

    document.getElementById("demoInfo").addEventListener("click", openInfoModal);

    elements.openMobileSidebar.addEventListener("click", () => {
        document.querySelector(".sidebar").classList.add("mobile-open");
    });

    elements.closeMobileSidebar.addEventListener("click", () => {
        document.querySelector(".sidebar").classList.remove("mobile-open");
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "/" &&
            document.activeElement.tagName !== "INPUT"
        ) {
            event.preventDefault();
            elements.globalSearch.focus();
        }

        if (event.key === "Escape") {
            closeEmailModal();
            closeInfoModal();
        }
    });
}


async function loadEmails() {
    try {
        const response = await fetch("/api/emails");

        if (!response.ok) {
            throw new Error("Unable to load demo data.");
        }

        state.emails = await response.json();
        renderAll();

    } catch (error) {
        showToast(
            "Something went wrong",
            "VEYRA could not load the demo inbox."
        );
    }
}


function finishOnboarding() {
    localStorage.setItem("veyra_onboarding_seen", "true");
    showApp();
}


function showApp() {
    elements.onboarding.classList.add("hidden");
    elements.app.classList.remove("hidden");
}


function showView(viewName) {
    state.currentView = viewName;

    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active-view");
    });

    const view = document.getElementById(`${viewName}View`);

    if (view) {
        view.classList.add("active-view");
    }

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    document.querySelector(".sidebar").classList.remove("mobile-open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (viewName === "inbox") {
        renderInbox();
    }

    if (viewName === "today") {
        renderToday();
    }
}


function setFilter(filter) {
    state.currentFilter = filter;

    document.querySelectorAll(".filter-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    renderInbox();
}


function handleSearch(event) {
    state.searchQuery = event.target.value.toLowerCase().trim();

    if (state.searchQuery) {
        showView("inbox");
    }

    renderInbox();
}


function activeEmails() {
    return state.emails.filter(email => !email.archived);
}


function getFilteredEmails() {
    let emails = activeEmails();

    if (state.currentFilter === "Unread") {
        emails = emails.filter(email => !email.read);
    }

    if (state.currentFilter === "Important") {
        emails = emails.filter(email => email.important);
    }

    if (state.currentFilter === "Needs Action") {
        emails = emails.filter(email => email.actionRequired);
    }

    if (
        [
            "College",
            "Work",
            "Personal",
            "Finance",
            "Shopping",
            "Promotions",
            "Other"
        ].includes(state.currentFilter)
    ) {
        emails = emails.filter(
            email => email.category === state.currentFilter
        );
    }

    if (state.searchQuery) {
        emails = emails.filter(email => {
            const searchable = [
                email.sender,
                email.senderEmail,
                email.subject,
                email.preview,
                email.body,
                email.category
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(state.searchQuery);
        });
    }

    return emails;
}


function renderAll() {
    renderStats();
    renderRecentEmails();
    renderCategoryBreakdown();
    renderToday();
    renderInbox();
}


function renderStats() {
    const emails = activeEmails();

    const total = emails.length;
    const unread = emails.filter(email => !email.read).length;
    const important = emails.filter(email => email.important).length;
    const action = emails.filter(email => email.actionRequired).length;

    const urgent = emails.filter(
        email => email.actionRequired && email.priority === "Urgent"
    ).length;

    const importantAction = emails.filter(
        email =>
            email.actionRequired &&
            email.priority === "Important"
    ).length;

    const other = emails.filter(
        email => !email.actionRequired
    ).length;

    document.getElementById("totalEmails").textContent = total;
    document.getElementById("unreadEmails").textContent = unread;
    document.getElementById("importantEmails").textContent = important;
    document.getElementById("actionEmails").textContent = action;

    document.getElementById("attentionCount").textContent = action;
    document.getElementById("todayActionCount").textContent = action;

    document.getElementById("urgentCount").textContent = urgent;
    document.getElementById("importantCount").textContent = importantAction;
    document.getElementById("otherCount").textContent = other;

    document.getElementById("todayBadge").textContent = action;
    document.getElementById("inboxBadge").textContent = unread;

    document.getElementById("attentionSectionCount").textContent =
        action;

    document.getElementById("laterSectionCount").textContent =
        emails.filter(email => !email.actionRequired && !email.read).length;

    document.getElementById("handledSectionCount").textContent =
        emails.filter(email => email.read).length;
}


function renderRecentEmails() {
    const emails = activeEmails()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    elements.recentEmails.innerHTML = emails
        .map(emailRowHTML)
        .join("");

    attachEmailOpenHandlers(elements.recentEmails);
}


function renderCategoryBreakdown() {
    const categories = [
        "College",
        "Work",
        "Personal",
        "Finance",
        "Promotions"
    ];

    const emails = activeEmails();

    elements.categoryBreakdown.innerHTML = categories
        .map(category => {
            const count = emails.filter(
                email => email.category === category
            ).length;

            const percentage = emails.length
                ? Math.round((count / emails.length) * 100)
                : 0;

            return `
                <div class="category-card">
                    <div class="category-card-top">
                        <strong>${escapeHTML(category)}</strong>
                        <span>${count}</span>
                    </div>

                    <div class="category-line">
                        <span style="width:${percentage}%"></span>
                    </div>
                </div>
            `;
        })
        .join("");
}


function renderToday() {
    const emails = activeEmails();

    const attention = emails
        .filter(email => email.actionRequired)
        .sort(prioritySort);

    const later = emails
        .filter(email => !email.actionRequired && !email.read)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const handled = emails
        .filter(email => email.read)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    elements.attentionEmails.innerHTML = attention.length
        ? attention.map(attentionCardHTML).join("")
        : emptyState(
            "Nothing needs your attention",
            "Your action queue is clear."
        );

    elements.laterEmails.innerHTML = later.length
        ? later.map(miniEmailHTML).join("")
        : emptyState(
            "No unread messages waiting",
            "Your read-later queue is empty."
        );

    elements.handledEmails.innerHTML = handled.length
        ? handled.map(miniEmailHTML).join("")
        : emptyState(
            "Nothing handled yet",
            "Processed messages will appear here."
        );

    attachEmailOpenHandlers(elements.attentionEmails);
    attachEmailOpenHandlers(elements.laterEmails);
    attachEmailOpenHandlers(elements.handledEmails);
}


function renderInbox() {
    const emails = getFilteredEmails();

    document.getElementById("inboxResultCount").textContent =
        `${emails.length} ${emails.length === 1 ? "message" : "messages"}`;

    if (!emails.length) {
        elements.inboxList.innerHTML = emptyState(
            "No emails found",
            "Try another search term or filter."
        );

        return;
    }

    elements.inboxList.innerHTML = emails
        .map(emailRowHTML)
        .join("");

    attachEmailOpenHandlers(elements.inboxList);
}


function prioritySort(a, b) {
    const order = {
        Urgent: 0,
        Important: 1,
        Normal: 2,
        Low: 3
    };

    return order[a.priority] - order[b.priority];
}


function emailRowHTML(email) {
    const avatarClass = categoryClass(email.category);

    return `
        <div
            class="email-row ${email.read ? "" : "unread-row"}"
            data-email-id="${email.id}"
            role="button"
            tabindex="0"
            aria-label="Open email from ${escapeHTML(email.sender)}"
        >

            <div class="sender-avatar ${avatarClass}">
                ${escapeHTML(getInitials(email.sender))}
            </div>

            <div class="email-main">

                <div class="email-topline">
                    <span class="email-sender">
                        ${escapeHTML(email.sender)}
                    </span>

                    ${
                        email.actionRequired
                            ? `<span class="priority-badge ${email.priority.toLowerCase()}">
                                ${escapeHTML(email.priority)}
                               </span>`
                            : ""
                    }
                </div>

                <div class="email-subject">
                    ${escapeHTML(email.subject)}
                </div>

                <div class="email-preview">
                    ${escapeHTML(email.preview)}
                </div>

            </div>

            <div class="email-meta">

                <span class="email-time">
                    ${formatTime(email.date)}
                </span>

                <div class="email-badges">
                    <span class="category-badge">
                        ${escapeHTML(email.category)}
                    </span>
                </div>

            </div>

            <span class="star-mini ${email.important ? "important" : ""}">
                ★
            </span>

        </div>
    `;
}


function attentionCardHTML(email) {
    return `
        <article
            class="attention-card ${email.priority.toLowerCase()}"
            data-email-id="${email.id}"
            role="button"
            tabindex="0"
        >

            <div class="attention-card-top">

                <div>
                    <h3>${escapeHTML(email.subject)}</h3>

                    <p>
                        ${escapeHTML(email.preview)}
                    </p>
                </div>

                <span class="priority-badge ${email.priority.toLowerCase()}">
                    ${escapeHTML(email.priority)}
                </span>

            </div>

            <div class="attention-reason">
                ${
                    email.deadline
                        ? `◷ Deadline: ${escapeHTML(email.deadline)}`
                        : "→ Action required"
                }
            </div>

        </article>
    `;
}


function miniEmailHTML(email) {
    return `
        <article
            class="mini-email-card"
            data-email-id="${email.id}"
            role="button"
            tabindex="0"
        >

            <div class="email-topline">
                <span class="email-sender">
                    ${escapeHTML(email.sender)}
                </span>

                <span class="category-badge">
                    ${escapeHTML(email.category)}
                </span>
            </div>

            <h3>${escapeHTML(email.subject)}</h3>

            <p>${escapeHTML(email.preview)}</p>

        </article>
    `;
}


function emptyState(title, message) {
    return `
        <div class="empty-state" style="
            grid-column:1/-1;
            padding:30px;
            text-align:center;
            color:#777d89;
        ">
            <div style="
                font-size:25px;
                margin-bottom:8px;
            ">○</div>

            <strong style="
                display:block;
                color:#31343b;
                font-size:12px;
                margin-bottom:4px;
            ">
                ${escapeHTML(title)}
            </strong>

            <span style="font-size:10px;">
                ${escapeHTML(message)}
            </span>
        </div>
    `;
}


function attachEmailOpenHandlers(container) {
    container
        .querySelectorAll("[data-email-id]")
        .forEach(element => {
            const handler = () => {
                const id = Number(element.dataset.emailId);
                openEmail(id);
            };

            element.addEventListener("click", handler);

            element.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handler();
                }
            });
        });
}


async function openEmail(id) {
    const email = state.emails.find(item => item.id === id);

    if (!email) {
        showToast(
            "Email unavailable",
            "That demo message could not be found."
        );
        return;
    }

    state.currentEmail = email;

    if (!email.read) {
        email.read = true;
        renderAll();
    }

    populateEmailDetail(email);

    elements.emailModal.classList.remove("hidden");

    await analyzeCurrentEmail(email);
}


function populateEmailDetail(email) {
    elements.detailAvatar.textContent = getInitials(email.sender);
    elements.detailAvatar.className =
        `sender-avatar ${categoryClass(email.category)}`;

    elements.detailSender.textContent = email.sender;
    elements.detailEmail.textContent = email.senderEmail;
    elements.detailSubject.textContent = email.subject;
    elements.detailDate.textContent = formatFullDate(email.date);
    elements.detailBody.textContent = email.body;

    elements.detailImportant.classList.toggle(
        "active",
        email.important
    );

    elements.markImportantButton.textContent =
        email.important ? "★ Important" : "☆ Mark important";

    elements.markReadButton.textContent =
        email.read ? "✓ Read" : "✓ Mark as read";

    elements.aiSummary.textContent = "Analyzing message...";
    elements.aiCategory.textContent = "—";
    elements.aiPriority.textContent = "—";
    elements.aiAction.textContent = "—";
    elements.aiDeadline.textContent = "—";
    elements.aiSuggestedAction.textContent =
        "VEYRA is preparing an attention summary...";
    elements.aiSource.textContent = "Analyzing";
}


async function analyzeCurrentEmail(email) {
    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subject: email.subject,
                body: email.body
            })
        });

        if (!response.ok) {
            throw new Error("AI unavailable");
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error("AI unavailable");
        }

        const analysis = result.analysis;

        elements.aiSummary.textContent = analysis.summary;
        elements.aiCategory.textContent = analysis.category;
        elements.aiPriority.textContent = analysis.priority;
        elements.aiAction.textContent =
            analysis.action_required ? "Yes" : "No";
        elements.aiDeadline.textContent =
            analysis.deadline || "None detected";
        elements.aiSuggestedAction.textContent =
            analysis.suggested_action;
        elements.aiSource.textContent =
            analysis.source || "VEYRA intelligence";

    } catch (error) {
        elements.aiSummary.textContent =
            "VEYRA could not analyze this message right now.";

        elements.aiCategory.textContent = email.category;
        elements.aiPriority.textContent = email.priority;
        elements.aiAction.textContent =
            email.actionRequired ? "Yes" : "No";
        elements.aiDeadline.textContent =
            email.deadline || "None detected";
        elements.aiSuggestedAction.textContent =
            "Review the message manually and decide what needs attention.";
        elements.aiSource.textContent = "Fallback mode";

        showToast(
            "AI service unavailable",
            "VEYRA switched to its safe fallback."
        );
    }
}


function closeEmailModal() {
    elements.emailModal.classList.add("hidden");
    state.currentEmail = null;
}


function markCurrentRead() {
    if (!state.currentEmail) {
        return;
    }

    state.currentEmail.read = true;

    renderAll();
    populateEmailDetail(state.currentEmail);

    showToast(
        "Marked as read",
        "The message has been processed."
    );
}


function toggleCurrentImportant() {
    if (!state.currentEmail) {
        return;
    }

    state.currentEmail.important =
        !state.currentEmail.important;

    renderAll();
    populateEmailDetail(state.currentEmail);

    showToast(
        state.currentEmail.important
            ? "Marked important"
            : "Removed from important",
        state.currentEmail.important
            ? "VEYRA will keep this message visible as a priority."
            : "The message is no longer flagged."
    );
}


function addCurrentTask() {
    if (!state.currentEmail) {
        return;
    }

    showToast(
        "Added to tasks",
        `"${state.currentEmail.subject}" is now on your task list.`
    );
}


function archiveCurrentEmail() {
    if (!state.currentEmail) {
        return;
    }

    state.currentEmail.archived = true;

    const subject = state.currentEmail.subject;

    closeEmailModal();
    renderAll();

    showToast(
        "Email archived",
        `"${subject}" was removed from your active inbox.`
    );
}


function openInfoModal() {
    elements.infoModal.classList.remove("hidden");
}


function closeInfoModal() {
    elements.infoModal.classList.add("hidden");
}


function showToast(title, message) {
    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}


function categoryClass(category) {
    return String(category)
        .toLowerCase()
        .replace(/\s+/g, "-");
}


function getInitials(name) {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2);

    return parts
        .map(part => part[0])
        .join("")
        .toUpperCase();
}


function formatTime(dateString) {
    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}


function formatFullDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}