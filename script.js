
const totalQuestions =
    document.querySelector("#totalQuestions");

const completedDSA =
    document.querySelector("#completedDSA");

const completedInterview =
    document.querySelector("#completedInterview");

const machineCoding =
    document.querySelector("#machineCoding");

const machinePercent =
    document.querySelector("#machinePercent");

const machineProgressBar =
    document.querySelector("#machineProgressBar");

const overallProgressText =
    document.querySelector("#overallProgressText");

const overallPercent =
    document.querySelector("#overallPercent");

const overallProgressBar =
    document.querySelector("#overallProgressBar");

const questionsList =
    document.querySelector("#questionsList");

const searchInput =
    document.querySelector("#searchInput");

const categoryFilter =
    document.querySelector("#categoryFilter");

const statusFilter =
    document.querySelector("#statusFilter");

const difficultyFilter =
    document.querySelector("#difficultyFilter");

const navItems =
    document.querySelectorAll(".nav-item");

const addQuestionBtn =
    document.querySelector("#addQuestionBtn");

const questionModal =
    document.querySelector("#questionModal");

const closeModal =
    document.querySelector("#closeModal");

const questionForm =
    document.querySelector("#questionForm");

const modalTitle =
    document.querySelector("#modalTitle");

const editQuestionId =
    document.querySelector("#editQuestionId");

const questionTitle =
    document.querySelector("#questionTitle");

const questionCategory =
    document.querySelector("#questionCategory");

const questionDifficulty =
    document.querySelector("#questionDifficulty");

const questionStatus =
    document.querySelector("#questionStatus");



let questions =
    JSON.parse(localStorage.getItem("questions")) || [

        {
            id: 1,
            title: "Two Sum",
            category: "DSA",
            difficulty: "Easy",
            status: "Completed"
        },

        {
            id: 2,
            title: "Binary Tree Traversal",
            category: "DSA",
            difficulty: "Medium",
            status: "In Progress"
        },

        {
            id: 3,
            title: "Git Branching",
            category: "Git",
            difficulty: "Easy",
            status: "Pending"
        },

        {
            id: 4,
            title: "System Design - LLD",
            category: "Technical",
            difficulty: "Hard",
            status: "Pending"
        },

        {
            id: 5,
            title: "Zigzag Conversion",
            category: "DSA",
            difficulty: "Medium",
            status: "Completed"
        },

        {
            id: 6,
            title: "Build a Calculator",
            category: "Machine Coding",
            difficulty: "Medium",
            status: "In Progress"
        }

    ];


// ========================================
// SAVE QUESTIONS
// ========================================

function saveQuestions() {

    localStorage.setItem(
        "questions",
        JSON.stringify(questions)
    );

}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    const total =
        questions.length;


    const completed =
        questions.filter(
            question =>
                question.status === "Completed"
        ).length;


    const dsaCompleted =
        questions.filter(
            question =>
                question.category === "DSA" &&
                question.status === "Completed"
        ).length;


    const interviewCompleted =
        questions.filter(
            question =>
                question.category === "Technical" &&
                question.status === "Completed"
        ).length;


    const machineQuestions =
        questions.filter(
            question =>
                question.category === "Machine Coding"
        );


    const machineCompleted =
        machineQuestions.filter(
            question =>
                question.status === "Completed"
        ).length;


    // Total questions

    totalQuestions.textContent =
        total;


    // DSA

    completedDSA.textContent =
        dsaCompleted;


    // Interview

    completedInterview.textContent =
        interviewCompleted;


    // Machine coding

    machineCoding.textContent =
        `${machineCompleted} / 5`;


    const machinePercentage =
        Math.min(
            Math.round(
                (machineCompleted / 5) * 100
            ),
            100
        );


    machinePercent.textContent =
        `${machinePercentage}%`;


    machineProgressBar.style.width =
        `${machinePercentage}%`;


    // Overall progress

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    overallPercent.textContent =
        `${percentage}%`;


    overallProgressText.textContent =
        `${completed} of ${total} questions completed`;


    overallProgressBar.style.width =
        `${percentage}%`;

}


// ========================================
// RENDER QUESTIONS
// ========================================

function renderQuestions() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter.value;


    const selectedStatus =
        statusFilter.value;


    const selectedDifficulty =
        difficultyFilter.value;


    const filteredQuestions =
        questions.filter(question => {

            const matchesSearch =
                question.title
                    .toLowerCase()
                    .includes(searchValue);


            const matchesCategory =
                selectedCategory === "All" ||
                question.category === selectedCategory;


            const matchesStatus =
                selectedStatus === "All" ||
                question.status === selectedStatus;


            const matchesDifficulty =
                selectedDifficulty === "All" ||
                question.difficulty === selectedDifficulty;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus &&
                matchesDifficulty
            );

        });


    questionsList.innerHTML = "";


    // No results

    if (filteredQuestions.length === 0) {

        questionsList.innerHTML = `

            <div class="empty-state">

                <h3>
                    No questions found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    // Create rows

    filteredQuestions.forEach(question => {

        const row =
            document.createElement("div");


        row.className =
            "question-row";


        row.innerHTML = `

            <div class="question-title">

                <span class="file-icon">
                    ▱
                </span>

                <span>
                    ${question.title}
                </span>

            </div>


            <div>

                <span
                    class="badge ${getCategoryClass(question.category)}">

                    ${question.category}

                </span>

            </div>


            <div>

                <span
                    class="badge ${getDifficultyClass(question.difficulty)}">

                    ${question.difficulty}

                </span>

            </div>


            <div>

                <span
                    class="badge ${getStatusClass(question.status)}">

                    ● ${question.status}

                </span>

            </div>


            <div class="actions">

                <button
                    class="edit-btn"
                                    
                    data-id="${question.id}">

                    ✎

                </button>


                <button
                    class="delete-btn"
                    data-id="${question.id}">

                    ♢

                </button>

            </div>

        `;


        questionsList.appendChild(row);

    });

}


// ========================================
// CATEGORY CLASS
// ========================================

function getCategoryClass(category) {

    if (category === "DSA") {

        return "category-dsa";

    }


    if (category === "Git") {

        return "category-git";

    }


    if (category === "Technical") {

        return "category-technical";

    }


    return "category-machine";

}


// ========================================
// DIFFICULTY CLASS
// ========================================

function getDifficultyClass(difficulty) {

    if (difficulty === "Easy") {

        return "difficulty-easy";

    }


    if (difficulty === "Medium") {

        return "difficulty-medium";

    }


    return "difficulty-hard";

}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(status) {

    if (status === "Completed") {

        return "status-completed";

    }


    if (status === "In Progress") {

        return "status-progress";

    }


    return "status-pending";

}


// ========================================
// ADD QUESTION
// ========================================

addQuestionBtn.addEventListener(
    "click",
    () => {

        modalTitle.textContent =
            "Add Question";


        questionForm.reset();


        editQuestionId.value =
            "";


        questionModal.classList.add(
            "show"
        );

    }
);


// ========================================
// CLOSE MODAL
// ========================================

closeModal.addEventListener(
    "click",
    () => {

        questionModal.classList.remove(
            "show"
        );

    }
);


// ========================================
// CLOSE MODAL OUTSIDE
// ========================================

questionModal.addEventListener(
    "click",
    event => {

        if (
            event.target === questionModal
        ) {

            questionModal.classList.remove(
                "show"
            );

        }

    }
);


// ========================================
// FORM SUBMIT
// ========================================

questionForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const title =
            questionTitle.value.trim();


        const category =
            questionCategory.value;


        const difficulty =
            questionDifficulty.value;


        const status =
            questionStatus.value;


        // Validation

        if (
            title === "" ||
            category === "" ||
            difficulty === "" ||
            status === ""
        ) {

            alert(
                "Please fill all fields."
            );

            return;

        }


        // EDIT

        if (editQuestionId.value !== "") {

            const id =
                Number(
                    editQuestionId.value
                );


            const question =
                questions.find(
                    question =>
                        question.id === id
                );


            if (question) {

                question.title =
                    title;

                question.category =
                    category;

                question.difficulty =
                    difficulty;

                question.status =
                    status;

            }

        }


        // ADD

        else {

            const newQuestion = {

                id: Date.now(),

                title: title,

                category: category,

                difficulty: difficulty,

                status: status

            };


            questions.push(
                newQuestion
            );

        }


        saveQuestions();

        renderQuestions();

        updateDashboard();


        questionModal.classList.remove(
            "show"
        );


        questionForm.reset();

    }
);


// ========================================
// EDIT / DELETE BUTTONS
// ========================================

questionsList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("button");


        if (!button) {

            return;

        }


        const id =
            Number(button.dataset.id);


        // EDIT

        if (
            button.classList.contains(
                "edit-btn"
            )
        ) {

            editQuestion(id);

        }


        // DELETE

        if (
            button.classList.contains(
                "delete-btn"
            )
        ) {

            deleteQuestion(id);

        }

    }
);


// ========================================
// EDIT QUESTION
// ========================================

function editQuestion(id) {

    const question =
        questions.find(
            question =>
                question.id === id
        );


    if (!question) {

        return;

    }


    modalTitle.textContent =
        "Edit Question";


    editQuestionId.value =
        question.id;


    questionTitle.value =
        question.title;


    questionCategory.value =
        question.category;


    questionDifficulty.value =
        question.difficulty;


    questionStatus.value =
        question.status;


    questionModal.classList.add(
        "show"
    );

}


// ========================================
// DELETE QUESTION
// ========================================

function deleteQuestion(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this question?"
        );


    if (!confirmed) {

        return;

    }


    questions =
        questions.filter(
            question =>
                question.id !== id
        );


    saveQuestions();

    renderQuestions();

    updateDashboard();

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    renderQuestions
);


// ========================================
// FILTERS
// ========================================

categoryFilter.addEventListener(
    "change",
    renderQuestions
);


statusFilter.addEventListener(
    "change",
    renderQuestions
);


difficultyFilter.addEventListener(
    "change",
    renderQuestions
);


// ========================================
// SIDEBAR ACTIVE COLOR
// ========================================

navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(nav => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );

        }
    );

});


// ========================================
// SMOOTH SCROLL
// ========================================

navItems.forEach(item => {

    item.addEventListener(
        "click",
        event => {

            const target =
                item.getAttribute("href");


            if (
                target &&
                target.startsWith("#")
            ) {

                const section =
                    document.querySelector(
                        target
                    );


                if (section) {

                    event.preventDefault();


                    section.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                }

            }

        }
    );

});


// ========================================
// INITIAL LOAD
// ========================================

saveQuestions();

renderQuestions();

updateDashboard();
