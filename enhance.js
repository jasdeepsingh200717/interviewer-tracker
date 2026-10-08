

(function () {
    "use strict";

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const STATUS_ORDER = ["Pending", "In Progress", "Completed"];
    const KEY_NAME = "enh_name";
    const KEY_DONE = "enh_completed";
    const DAY = 864e5;

    
    function load(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (e) {
            return fallback;
        }
    }
    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }
    const readQuestions = () => load("questions", []);

 
    function escapeHtml(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function decodeHtml(s) {
        const t = document.createElement("textarea");
        t.innerHTML = s;
        return t.value;
    }

    const toastHost = document.createElement("div");
    toastHost.className = "enh-toast-host";
    toastHost.setAttribute("aria-live", "polite");
    document.body.appendChild(toastHost);

    function toast(message) {
        const el = document.createElement("div");
        el.className = "enh-toast";
        el.textContent = message;
        toastHost.appendChild(el);
        requestAnimationFrame(() => el.classList.add("show"));
        setTimeout(() => {
            el.classList.remove("show");
            setTimeout(() => el.remove(), 250);
        }, 2200);
    }

   
    $$(".nav-item").forEach((item) => {
        if (item.getAttribute("href") !== "#") return;

        item.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                const label = item.textContent.trim();
                if (label === "Settings") {
                    openSettings();
                } else {
                    $$(".nav-item").forEach((n) => n.classList.remove("active"));
                    item.classList.add("active");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            },
            true
        );
    });


    const sections = [
        { link: $('.nav-item[href="#questionsSection"]'), el: $("#questionsSection") },
        { link: $('.nav-item[href="#progressSection"]'), el: $("#progressSection") }
    ];
    window.addEventListener("scroll", () => {
        let current = $$(".nav-item")[0]; // Dashboard
        sections.forEach(({ link, el }) => {
            if (link && el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = link;
        });
        if (!current) return;
        $$(".nav-item").forEach((n) => n.classList.toggle("active", n === current && n.textContent.trim() !== "Settings"));
    }, { passive: true });

    
    const profileNameEl = $(".profile > span:not(.arrow)");
    const avatarEl = $(".avatar");
    const greetingEl = $(".header h1");

    function applyName() {
        const name = load(KEY_NAME, null) || (profileNameEl ? profileNameEl.textContent.trim() : "Aspirant");
        if (profileNameEl) profileNameEl.textContent = name;
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
        const hour = new Date().getHours();
        const part = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
        if (greetingEl) greetingEl.textContent = `Good ${part}, ${name.split(" ")[0]}! 👋`;
    }
    applyName();
    $(".profile").addEventListener("click", openSettings);

    
    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.id = "enhSettings";
    overlay.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true" aria-label="Settings">
            <div class="modal-header">
                <h2>Settings</h2>
                <button type="button" class="enh-x" aria-label="Close settings">&times;</button>
            </div>

            <div class="enh-field">
                <label for="enhName">Your name</label>
                <input type="text" id="enhName" maxlength="40">
            </div>
            <button type="button" class="enh-btn" id="enhSaveName">Save name</button>

            <div class="enh-section">
                <h3>Backup</h3>
                <p>Download your questions as a file, or load a backup you saved earlier.</p>
                <div class="enh-row">
                    <button type="button" class="enh-btn secondary" id="enhExport">Export JSON</button>
                    <button type="button" class="enh-btn secondary" id="enhImport">Import JSON</button>
                    <input type="file" id="enhFile" accept="application/json,.json" hidden>
                </div>
            </div>

            <div class="enh-section">
                <h3>Reset</h3>
                <p>Replace everything with the original sample questions.</p>
                <button type="button" class="enh-btn danger" id="enhReset">Reset to sample data</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    function openSettings() {
        $("#enhName").value = profileNameEl ? profileNameEl.textContent.trim() : "";
        overlay.classList.add("show");
        setTimeout(() => $("#enhName").focus(), 30);
    }
    function closeSettings() {
        overlay.classList.remove("show");
    }

    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSettings(); });
    $(".enh-x", overlay).addEventListener("click", closeSettings);

    $("#enhSaveName").addEventListener("click", () => {
        const name = $("#enhName").value.trim();
        if (!name) { toast("Enter a name first"); return; }
        save(KEY_NAME, name);
        applyName();
        closeSettings();
        toast("Name saved");
    });
    $("#enhName").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#enhSaveName").click(); });

    $("#enhExport").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(readQuestions(), null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "interview-questions.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast("Backup downloaded");
    });

    $("#enhImport").addEventListener("click", () => $("#enhFile").click());
    $("#enhFile").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                const valid =
                    Array.isArray(data) &&
                    data.every((q) => q && typeof q.title === "string" && q.category && q.difficulty && q.status);
                if (!valid) throw new Error("bad format");
                const cleaned = data.map((q, i) => ({
                    id: Number(q.id) || Date.now() + i,
                    title: escapeHtml(decodeHtml(q.title)),
                    category: q.category,
                    difficulty: q.difficulty,
                    status: q.status
                }));
                localStorage.setItem("questions", JSON.stringify(cleaned));
                localStorage.removeItem(KEY_DONE);
                location.reload();
            } catch (err) {
                toast("That file isn't a valid backup");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    });

    $("#enhReset").addEventListener("click", () => {
        if (!confirm("Reset all questions to the sample data? This can't be undone.")) return;
        localStorage.removeItem("questions");
        localStorage.removeItem(KEY_DONE);
        location.reload();
    });

    
    let silent = false; // suppress the generic "saved" toast for badge clicks

    document.addEventListener("click", (event) => {
        const badge = event.target.closest(".badge.status-completed, .badge.status-progress, .badge.status-pending");
        if (!badge) return;

        const row = badge.closest(".question-row");
        const editBtn = row && $(".edit-btn", row);
        if (!editBtn) return;

        const id = Number(editBtn.dataset.id);
        const q = readQuestions().find((item) => item.id === id);
        if (!q) return;

        const next = STATUS_ORDER[(STATUS_ORDER.indexOf(q.status) + 1) % STATUS_ORDER.length];
        const rect = badge.getBoundingClientRect();

        editBtn.click();                       // opens the edit modal, fills the fields
        $("#questionStatus").value = next;
        silent = true;
        $("#questionForm").requestSubmit();    // runs script.js's own save logic
        silent = false;

        if (next === "Completed") celebrate(rect);
        toast(`${decodeHtml(q.title)} → ${next}`);
    });

    function celebrate(rect) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const colors = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#eab308"];
        for (let i = 0; i < 24; i++) {
            const bit = document.createElement("span");
            bit.className = "enh-confetti";
            bit.style.left = rect.left + rect.width / 2 + "px";
            bit.style.top = rect.top + rect.height / 2 + "px";
            bit.style.background = colors[i % colors.length];
            bit.style.setProperty("--dx", (Math.random() - 0.5) * 220 + "px");
            bit.style.setProperty("--dy", -60 - Math.random() * 140 + "px");
            document.body.appendChild(bit);
            setTimeout(() => bit.remove(), 900);
        }
    }

    
    function watchCounter(el) {
        if (!el) return;
        let shown = 0;
        let frame = 0;

        const observer = new MutationObserver(run);
        const watch = () => observer.observe(el, { childList: true, characterData: true, subtree: true });

        function run() {
            const match = el.textContent.trim().match(/^(\d+)(.*)$/s); // "12", "3 / 5", "40%"
            if (!match) return;
            const target = Number(match[1]);
            const suffix = match[2];
            if (target === shown) return;

            cancelAnimationFrame(frame);
            const from = shown;
            const start = performance.now();

            function tick(now) {
                const t = Math.min((now - start) / 600, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                shown = Math.round(from + (target - from) * eased);
                observer.disconnect();
                el.textContent = shown + suffix;
                watch();
                if (t < 1) frame = requestAnimationFrame(tick);
            }
            frame = requestAnimationFrame(tick);
        }

        watch();
        run();
    }
    ["totalQuestions", "completedDSA", "completedInterview", "machineCoding", "machinePercent", "overallPercent"]
        .forEach((id) => watchCounter(document.getElementById(id)));

   
    function refreshWeekly() {
        const now = Date.now();
        const qs = readQuestions();
        const firstRun = localStorage.getItem(KEY_DONE) === null;
        const done = load(KEY_DONE, {});

        qs.forEach((q) => {
            if (q.status === "Completed") {
                if (!(q.id in done)) done[q.id] = firstRun ? 0 : now;
            } else {
                delete done[q.id];
            }
        });
        Object.keys(done).forEach((id) => { if (!qs.some((q) => String(q.id) === id)) delete done[id]; });
        save(KEY_DONE, done);

        const recent = (q) => now - done[q.id] < 7 * DAY;
        const added = qs.filter((q) => q.id > 1e12 && now - q.id < 7 * DAY).length;
        const dsa = qs.filter((q) => q.category === "DSA" && q.status === "Completed" && recent(q)).length;
        const tech = qs.filter((q) => q.category === "Technical" && q.status === "Completed" && recent(q)).length;

        const set = (sel, n) => { const el = $(sel + " .increase"); if (el) el.textContent = `↗ +${n} this week`; };
        set(".blue-card", added);
        set(".green-card", dsa);
        set(".purple-card", tech);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (overlay.classList.contains("show")) closeSettings();
            else if ($("#questionModal").classList.contains("show")) $("#closeModal").click();
            return;
        }
        const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
        if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

        if (event.key === "/") {
            event.preventDefault();
            $("#searchInput").focus();
        } else if (event.key.toLowerCase() === "n") {
            event.preventDefault();
            $("#addQuestionBtn").click();
        }
    });

    $("#addQuestionBtn").addEventListener("click", () => setTimeout(() => $("#questionTitle").focus(), 30));

    
    [
        { selector: ".blue-card", category: "All" },
        { selector: ".green-card", category: "DSA" },
        { selector: ".purple-card", category: "Technical" },
        { selector: ".orange-card", category: "Machine Coding" }
    ].forEach(({ selector, category }) => {
        const card = $(selector);
        if (!card) return;
        card.classList.add("enh-clickable");
        card.title = category === "All" ? "Show all questions" : `Show ${category} questions`;
        card.addEventListener("click", () => {
            const select = $("#categoryFilter");
            select.value = category;
            select.dispatchEvent(new Event("change"));
            $("#questionsSection").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

   
    const filterIds = ["categoryFilter", "statusFilter", "difficultyFilter"];
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "enh-clear";
    clearBtn.textContent = "Clear filters";
    $(".filters").appendChild(clearBtn);

    clearBtn.addEventListener("click", () => {
        $("#searchInput").value = "";
        filterIds.forEach((id) => { document.getElementById(id).value = "All"; });
        $("#searchInput").dispatchEvent(new Event("input")); // one re-render covers all filters
    });

    const countEl = document.createElement("p");
    countEl.className = "enh-count";
    $(".table-header").before(countEl);

    function isFiltering() {
        return $("#searchInput").value.trim() !== "" || filterIds.some((id) => document.getElementById(id).value !== "All");
    }
    function updateCount() {
        const shown = $$("#questionsList .question-row").length;
        countEl.textContent = `Showing ${shown} of ${readQuestions().length}`;
        clearBtn.style.display = isFiltering() ? "inline-flex" : "none";
    }

    
    new MutationObserver(() => {
        $$("#questionsList .question-row:not(.enh-row-in)").forEach((row, i) => {
            row.style.animationDelay = Math.min(i * 40, 300) + "ms";
            row.classList.add("enh-row-in");
        });
        updateCount();
        setTimeout(refreshWeekly, 0); // after script.js finishes updateDashboard()
    }).observe($("#questionsList"), { childList: true });

    // initial pass (list was already rendered before this file loaded)
    $$("#questionsList .question-row").forEach((row, i) => {
        row.style.animationDelay = Math.min(i * 40, 300) + "ms";
        row.classList.add("enh-row-in");
    });
    updateCount();
    refreshWeekly();

    
    $("#questionForm").addEventListener(
        "submit",
        () => {
            const titleInput = $("#questionTitle");
            titleInput.value = escapeHtml(decodeHtml(titleInput.value.trim()));

            const complete =
                titleInput.value &&
                $("#questionCategory").value &&
                $("#questionDifficulty").value &&
                $("#questionStatus").value;

            if (complete && !silent) {
                const editing = $("#editQuestionId").value !== "";
                toast(editing ? "Changes saved" : `Added "${decodeHtml(titleInput.value)}"`);
            }
        },
        true
    );

    
    $("#questionsList").addEventListener("click", (event) => {
        if (event.target.closest(".edit-btn")) {
            const titleInput = $("#questionTitle");
            titleInput.value = decodeHtml(titleInput.value);
        }
    });

    
    $("#questionsList").addEventListener(
        "click",
        (event) => {
            if (!event.target.closest(".delete-btn")) return;
            const before = readQuestions().length;
            setTimeout(() => {
                if (readQuestions().length < before) toast("Question deleted");
            }, 0);
        },
        true
    );
})();