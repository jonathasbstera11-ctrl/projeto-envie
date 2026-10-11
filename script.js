// =========================================================
// ENVIE — ESCOLA MISSIONÁRIA
// TAREFAS 04 E 05
// =========================================================

const STUDENTS_STORAGE_KEY = "envie_alunos";
const APPOINTMENTS_STORAGE_KEY = "envie_agendamentos";

const SUPABASE_URL = "https://lgdjroylobyhaifkitvk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_K_cEBXE3WAfGMF4MV0wVDg_ljKc5gLU";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// =========================================================
// INICIALIZAÇÃO
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    initLogin();
    initNavigation();
    initMaterials();
    initStudents();
    initSchedule();

    loadStudents();
    loadAppointments();
    updateScheduleStudentSelect();
    setMinimumDate();
});

// =========================================================
// LOGIN
// =========================================================

function initLogin() {
    const loginForm = document.getElementById("login-form");
    const loginScreen = document.getElementById("login-screen");
    const app = document.getElementById("app");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("login-email");
        const passwordInput = document.getElementById("login-password");

        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";

        if (!email || !password) {
            showToast("Preencha e-mail e senha.");
            return;
        }

        if (loginScreen) {
            loginScreen.classList.add("hidden");
        }

        if (app) {
            app.classList.remove("hidden");
        }

        const userName = document.getElementById("user-name");
        const userProfile = document.getElementById("user-profile");
        const avatar = document.querySelector(".user-avatar");

        const name = getNameFromEmail(email);

        if (userName) {
            userName.textContent = name;
        }

        if (userProfile) {
            userProfile.textContent = email.toLowerCase().includes("professor")
                ? "Professor"
                : "Aluno";
        }

        if (avatar) {
            avatar.textContent = name.charAt(0).toUpperCase();
        }

        showToast("Login realizado com sucesso.");
    });

    const demoButtons = document.querySelectorAll(".demo-btn");

    demoButtons.forEach(button => {
        button.addEventListener("click", () => {
            const email = button.dataset.email || "";
            const password = button.dataset.password || "";

            const emailInput = document.getElementById("login-email");
            const passwordInput = document.getElementById("login-password");

            if (emailInput) {
                emailInput.value = email;
            }

            if (passwordInput) {
                passwordInput.value = password;
            }

            if (typeof loginForm.requestSubmit === "function") {
                loginForm.requestSubmit();
            } else {
                loginForm.dispatchEvent(
                    new Event("submit", {
                        bubbles: true,
                        cancelable: true
                    })
                );
            }
        });
    });

    const logoutButton = document.getElementById("logout-btn");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (app) {
                app.classList.add("hidden");
            }

            if (loginScreen) {
                loginScreen.classList.remove("hidden");
            }

            loginForm.reset();

            showToast("Você saiu do sistema.");
        });
    }
}

// =========================================================
// NOME DO USUÁRIO
// =========================================================

function getNameFromEmail(email) {
    if (!email) {
        return "Aluno ENVIE";
    }

    const part = email.split("@")[0];

    return part
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

// =========================================================
// NAVEGAÇÃO
// =========================================================

function initNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const screens = document.querySelectorAll(".screen");

    menuItems.forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();

            const targetScreen = item.dataset.screen;

            if (!targetScreen) {
                return;
            }

            menuItems.forEach(menu => {
                menu.classList.remove("active");
            });

            item.classList.add("active");

            screens.forEach(screen => {
                screen.classList.remove("active-screen");
            });

            const target = document.getElementById(targetScreen);

            if (target) {
                target.classList.add("active-screen");
            }
        });
    });

    const goButtons = document.querySelectorAll("[data-go-screen]");

    goButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetScreen = button.dataset.goScreen;

            const targetMenu = document.querySelector(
                `.menu-item[data-screen="${targetScreen}"]`
            );

            if (targetMenu) {
                targetMenu.click();
            }
        });
    });
}

// =========================================================
// MATERIAIS
// =========================================================

function initMaterials() {
    const searchInput = document.getElementById("material-search");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {
        const search = searchInput.value.toLowerCase().trim();

        const materials = document.querySelectorAll(".material-card");

        materials.forEach(material => {
            const title = material.dataset.title
                ? material.dataset.title.toLowerCase()
                : material.textContent.toLowerCase();

            material.style.display = title.includes(search)
                ? "flex"
                : "none";
        });
    });
}

// =========================================================
// TAREFA 04 — CADASTRO DE ALUNOS
// =========================================================

function initStudents() {
    const newStudentButton = document.getElementById("new-student-btn");
    const modal = document.getElementById("student-modal");
    const closeModal = document.getElementById("close-student-modal");
    const cancelButton = document.getElementById("cancel-student-btn");
    const form = document.getElementById("student-form");

    const cpfInput = document.getElementById("student-cpf");
    const phoneInput = document.getElementById("student-phone");
    const searchInput = document.getElementById("student-search");

    if (newStudentButton) {
        newStudentButton.addEventListener("click", () => {
            openStudentModal();
        });
    }

    if (closeModal) {
        closeModal.addEventListener("click", closeStudentModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeStudentModal);
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeStudentModal();
            }
        });
    }

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            saveStudent();
        });
    }

    if (cpfInput) {
        cpfInput.addEventListener("input", () => {
            cpfInput.value = formatCPF(cpfInput.value);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            phoneInput.value = formatPhone(phoneInput.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderStudents(searchInput.value);
        });
    }
}

// =========================================================
// ABRIR MODAL DE ALUNO
// =========================================================

function openStudentModal(student = null) {
    const modal = document.getElementById("student-modal");
    const form = document.getElementById("student-form");
    const title = document.getElementById("student-modal-title");

    if (!modal || !form) {
        return;
    }

    form.reset();

    const idInput = document.getElementById("student-id");

    if (idInput) {
        idInput.value = "";
    }

    if (student) {
        if (title) {
            title.textContent = "Editar aluno";
        }

        document.getElementById("student-id").value = student.id;
        document.getElementById("student-name").value = student.name;
        document.getElementById("student-cpf").value = student.cpf;
        document.getElementById("student-birth").value = student.birth;
        document.getElementById("student-phone").value = student.phone;
        document.getElementById("student-email").value = student.email;
        document.getElementById("student-address").value = student.address;
    } else {
        if (title) {
            title.textContent = "Novo aluno";
        }
    }

    modal.classList.remove("hidden");

    setTimeout(() => {
        const nameInput = document.getElementById("student-name");

        if (nameInput) {
            nameInput.focus();
        }
    }, 100);
}

// =========================================================
// FECHAR MODAL
// =========================================================

function closeStudentModal() {
    const modal = document.getElementById("student-modal");
    const form = document.getElementById("student-form");

    if (modal) {
        modal.classList.add("hidden");
    }

    if (form) {
        form.reset();
    }
}

// =========================================================
// SALVAR ALUNO
// =========================================================

function saveStudent() {
    const id = document.getElementById("student-id").value;
    const name = document.getElementById("student-name").value.trim();
    const cpf = document.getElementById("student-cpf").value.trim();
    const birth = document.getElementById("student-birth").value;
    const phone = document.getElementById("student-phone").value.trim();
    const email = document.getElementById("student-email").value.trim();
    const address = document.getElementById("student-address").value.trim();

    if (!name || !cpf || !birth || !phone || !email || !address) {
        showToast("Preencha todos os campos obrigatórios.");
        return;
    }

    const cpfNumbers = cpf.replace(/\D/g, "");

    if (cpfNumbers.length !== 11) {
        showToast("Digite um CPF válido com 11 números.");
        return;
    }

    if (!validateEmail(email)) {
        showToast("Digite um e-mail válido.");
        return;
    }

    let students = getStudents();

    const duplicate = students.find(student => {
        return (
            String(student.cpf).replace(/\D/g, "") === cpfNumbers &&
            student.id !== id
        );
    });

    if (duplicate) {
        showToast("Já existe um aluno cadastrado com esse CPF.");
        return;
    }

    if (!id) {
        const student = {
            id: generateId(),
            name: name,
            cpf: formatCPF(cpf),
            birth: birth,
            phone: formatPhone(phone),
            email: email,
            address: address,
            createdAt: new Date().toISOString()
        };

        students.push(student);

        saveStudents(students);
        closeStudentModal();
        renderStudents();
        updateScheduleStudentSelect();

        showToast("Aluno cadastrado com sucesso.");

        return;
    }

    const index = students.findIndex(student => student.id === id);

    if (index === -1) {
        showToast("Aluno não encontrado.");
        return;
    }

    students[index] = {
        ...students[index],
        name: name,
        cpf: formatCPF(cpf),
        birth: birth,
        phone: formatPhone(phone),
        email: email,
        address: address
    };

    saveStudents(students);
    closeStudentModal();
    renderStudents();
    updateScheduleStudentSelect();

    showToast("Aluno atualizado com sucesso.");
}

// =========================================================
// CARREGAR ALUNOS
// =========================================================

function loadStudents() {
    renderStudents();
}

// =========================================================
// OBTER ALUNOS
// =========================================================

function getStudents() {
    try {
        const data = localStorage.getItem(STUDENTS_STORAGE_KEY);

        if (!data) {
            return [];
        }

        const students = JSON.parse(data);

        return Array.isArray(students) ? students : [];
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        return [];
    }
}

// =========================================================
// SALVAR ALUNOS
// =========================================================

function saveStudents(students) {
    localStorage.setItem(
        STUDENTS_STORAGE_KEY,
        JSON.stringify(students)
    );
}

// =========================================================
// RENDERIZAR ALUNOS
// =========================================================

function renderStudents(searchTerm = "") {
    const tbody = document.getElementById("students-table-body");
    const emptyState = document.getElementById("students-empty");

    if (!tbody || !emptyState) {
        return;
    }

    const students = getStudents();
    const search = searchTerm.toLowerCase().trim();

    const filteredStudents = students.filter(student => {
        const text = `
            ${student.name}
            ${student.cpf}
            ${student.phone}
            ${student.email}
        `.toLowerCase();

        return text.includes(search);
    });

    tbody.innerHTML = "";

    if (filteredStudents.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.cpf)}</td>

            <td>${escapeHTML(student.phone)}</td>

            <td>${escapeHTML(student.email)}</td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="action-button edit"
                        data-action="edit"
                        data-id="${student.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="action-button delete"
                        data-action="delete"
                        data-id="${student.id}"
                    >
                        Excluir
                    </button>

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    tbody.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            const id = button.dataset.id;

            if (action === "edit") {
                editStudent(id);
            }

            if (action === "delete") {
                deleteStudent(id);
            }
        });
    });
}

// =========================================================
// EDITAR ALUNO
// =========================================================

function editStudent(id) {
    const students = getStudents();

    const student = students.find(item => item.id === id);

    if (!student) {
        showToast("Aluno não encontrado.");
        return;
    }

    openStudentModal(student);
}

// =========================================================
// EXCLUIR ALUNO
// =========================================================

function deleteStudent(id) {
    const students = getStudents();

    const student = students.find(item => item.id === id);

    if (!student) {
        showToast("Aluno não encontrado.");
        return;
    }

    const confirmed = confirm(
        `Deseja realmente excluir o aluno "${student.name}"?`
    );

    if (!confirmed) {
        return;
    }

    const updatedStudents = students.filter(item => item.id !== id);

    saveStudents(updatedStudents);
    renderStudents();
    updateScheduleStudentSelect();

    showToast("Aluno excluído com sucesso.");
}

// =========================================================
// TAREFA 05 — AGENDAMENTO
// =========================================================

function initSchedule() {
    const form = document.getElementById("schedule-form");
    const clearButton = document.getElementById("clear-schedule-btn");

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            createAppointment();
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", clearScheduleForm);
    }

    const fields = [
        "schedule-student",
        "schedule-service",
        "schedule-date",
        "schedule-time",
        "schedule-notes"
    ];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);

        if (!field) {
            return;
        }

        field.addEventListener("change", updateScheduleSummary);
        field.addEventListener("input", updateScheduleSummary);
    });
}

// =========================================================
// DATA MÍNIMA
// =========================================================

function setMinimumDate() {
    const dateInput = document.getElementById("schedule-date");

    if (!dateInput) {
        return;
    }

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.min = `${year}-${month}-${day}`;
}

// =========================================================
// PREENCHER ALUNOS NO AGENDAMENTO
// =========================================================

function updateScheduleStudentSelect() {
    const select = document.getElementById("schedule-student");

    if (!select) {
        return;
    }

    const students = getStudents();

    select.innerHTML = `
        <option value="">Selecione o aluno</option>
    `;

    students
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .forEach(student => {
            const option = document.createElement("option");

            option.value = student.id;
            option.textContent = student.name;

            select.appendChild(option);
        });

    updateScheduleSummary();
}

// =========================================================
// ATUALIZAR RESUMO
// =========================================================

function updateScheduleSummary() {
    const summary = document.getElementById("schedule-summary");

    if (!summary) {
        return;
    }

    const studentSelect = document.getElementById("schedule-student");
    const serviceSelect = document.getElementById("schedule-service");
    const dateInput = document.getElementById("schedule-date");
    const timeSelect = document.getElementById("schedule-time");
    const notesInput = document.getElementById("schedule-notes");

    const studentId = studentSelect ? studentSelect.value : "";
    const service = serviceSelect ? serviceSelect.value : "";
    const date = dateInput ? dateInput.value : "";
    const time = timeSelect ? timeSelect.value : "";
    const notes = notesInput ? notesInput.value.trim() : "";

    const students = getStudents();

    const student = students.find(item => item.id === studentId);

    if (!studentId && !service && !date && !time && !notes) {
        summary.innerHTML = `
            <div class="summary-empty">
                <div class="summary-icon">◷</div>

                <p>
                    Preencha os campos para visualizar
                    o resumo do agendamento.
                </p>
            </div>
        `;

        return;
    }

    const formattedDate = date
        ? formatDate(date)
        : "Não informada";

    summary.innerHTML = `
        <div class="summary-content">

            <div class="summary-title">
                Dados do agendamento
            </div>

            <div class="summary-row">
                <span>Aluno</span>

                <strong>
                    ${escapeHTML(
                        student
                            ? student.name
                            : "Não selecionado"
                    )}
                </strong>
            </div>

            <div class="summary-row">
                <span>Atividade / Serviço</span>

                <strong>
                    ${escapeHTML(
                        service || "Não selecionada"
                    )}
                </strong>
            </div>

            <div class="summary-row">
                <span>Data</span>

                <strong>
                    ${formattedDate}
                </strong>
            </div>

            <div class="summary-row">
                <span>Horário</span>

                <strong>
                    ${escapeHTML(
                        time || "Não selecionado"
                    )}
                </strong>
            </div>

            <div class="summary-row">
                <span>Observações</span>

                <strong>
                    ${escapeHTML(
                        notes || "Nenhuma"
                    )}
                </strong>
            </div>

        </div>
    `;
}

// =========================================================
// CRIAR AGENDAMENTO
// =========================================================

function createAppointment() {
    const studentElement = document.getElementById("schedule-student");
    const serviceElement = document.getElementById("schedule-service");
    const dateElement = document.getElementById("schedule-date");
    const timeElement = document.getElementById("schedule-time");
    const notesElement = document.getElementById("schedule-notes");

    if (
        !studentElement ||
        !serviceElement ||
        !dateElement ||
        !timeElement
    ) {
        showToast("Formulário de agendamento não encontrado.");
        return;
    }

    const studentId = studentElement.value;
    const service = serviceElement.value;
    const date = dateElement.value;
    const time = timeElement.value;
    const notes = notesElement
        ? notesElement.value.trim()
        : "";

    if (!studentId || !service || !date || !time) {
        showToast(
            "Preencha aluno, atividade, data e horário."
        );

        return;
    }

    const students = getStudents();

    const student = students.find(
        item => item.id === studentId
    );

    if (!student) {
        showToast("Selecione um aluno válido.");
        return;
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showToast(
            "A data do agendamento não pode ser anterior a hoje."
        );

        return;
    }

    const appointments = getAppointments();

    const conflict = appointments.find(appointment => {
        return (
            appointment.studentId === studentId &&
            appointment.date === date &&
            appointment.time === time
        );
    });

    if (conflict) {
        showToast(
            "Esse aluno já possui um agendamento nesse horário."
        );

        return;
    }

    const appointment = {
        id: generateId(),
        studentId: studentId,
        studentName: student.name,
        service: service,
        date: date,
        time: time,
        notes: notes,
        createdAt: new Date().toISOString()
    };

    appointments.push(appointment);

    saveAppointments(appointments);
    loadAppointments();
    clearScheduleForm();

    showToast(
        "Agendamento confirmado com sucesso."
    );
}

// =========================================================
// LIMPAR AGENDAMENTO
// =========================================================

function clearScheduleForm() {
    const form = document.getElementById("schedule-form");

    if (form) {
        form.reset();
    }

    updateScheduleSummary();
}

// =========================================================
// CARREGAR AGENDAMENTOS
// =========================================================

function loadAppointments() {
    renderAppointments();
}

// =========================================================
// OBTER AGENDAMENTOS
// =========================================================

function getAppointments() {
    try {
        const data = localStorage.getItem(
            APPOINTMENTS_STORAGE_KEY
        );

        if (!data) {
            return [];
        }

        const appointments = JSON.parse(data);

        return Array.isArray(appointments)
            ? appointments
            : [];
    } catch (error) {
        console.error(
            "Erro ao carregar agendamentos:",
            error
        );

        return [];
    }
}

// =========================================================
// SALVAR AGENDAMENTOS
// =========================================================

function saveAppointments(appointments) {
    localStorage.setItem(
        APPOINTMENTS_STORAGE_KEY,
        JSON.stringify(appointments)
    );
}

// =========================================================
// RENDERIZAR AGENDAMENTOS
// =========================================================

function renderAppointments() {
    const list = document.getElementById("appointments-list");
    const emptyState = document.getElementById("appointments-empty");

    if (!list || !emptyState) {
        return;
    }

    const appointments = getAppointments();

    list.innerHTML = "";

    if (appointments.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    appointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);

        return dateA - dateB;
    });

    saveAppointments(appointments);

    appointments.forEach(appointment => {
        const card = document.createElement("div");

        card.className = "appointment-card";

        const date = new Date(
            `${appointment.date}T00:00:00`
        );

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const month = date
            .toLocaleDateString("pt-BR", {
                month: "short"
            })
            .replace(".", "");

        card.innerHTML = `
            <div class="appointment-date">

                <strong>
                    ${day}
                </strong>

                <span>
                    ${escapeHTML(month)}
                </span>

            </div>

            <div class="appointment-info">

                <strong>
                    ${escapeHTML(
                        appointment.studentName
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        appointment.service
                    )}
                </span>

                ${
                    appointment.notes
                        ? `
                            <span>
                                Obs:
                                ${escapeHTML(
                                    appointment.notes
                                )}
                            </span>
                        `
                        : ""
                }

            </div>

            <div class="appointment-time">
                ${escapeHTML(
                    appointment.time
                )}
            </div>

            <button
                type="button"
                class="cancel-appointment"
                data-appointment-id="${appointment.id}"
            >
                Cancelar
            </button>
        `;

        list.appendChild(card);
    });

    list.querySelectorAll(
        ".cancel-appointment"
    ).forEach(button => {
        button.addEventListener("click", () => {
            cancelAppointment(
                button.dataset.appointmentId
            );
        });
    });
}

// =========================================================
// CANCELAR AGENDAMENTO
// =========================================================

function cancelAppointment(id) {
    const appointments = getAppointments();

    const appointment = appointments.find(
        item => item.id === id
    );

    if (!appointment) {
        showToast(
            "Agendamento não encontrado."
        );

        return;
    }

    const confirmed = confirm(
        `Deseja cancelar o agendamento de ${appointment.studentName}?`
    );

    if (!confirmed) {
        return;
    }

    const updatedAppointments =
        appointments.filter(
            item => item.id !== id
        );

    saveAppointments(updatedAppointments);
    renderAppointments();

    showToast(
        "Agendamento cancelado."
    );
}

// =========================================================
// FORMATAR CPF
// =========================================================

function formatCPF(value) {
    let numbers = value.replace(/\D/g, "");

    numbers = numbers.substring(0, 11);

    if (numbers.length <= 3) {
        return numbers;
    }

    if (numbers.length <= 6) {
        return (
            numbers.substring(0, 3) +
            "." +
            numbers.substring(3)
        );
    }

    if (numbers.length <= 9) {
        return (
            numbers.substring(0, 3) +
            "." +
            numbers.substring(3, 6) +
            "." +
            numbers.substring(6)
        );
    }

    return (
        numbers.substring(0, 3) +
        "." +
        numbers.substring(3, 6) +
        "." +
        numbers.substring(6, 9) +
        "-" +
        numbers.substring(9, 11)
    );
}

// =========================================================
// FORMATAR TELEFONE
// =========================================================

function formatPhone(value) {
    let numbers = value.replace(/\D/g, "");

    numbers = numbers.substring(0, 11);

    if (numbers.length <= 2) {
        return numbers;
    }

    if (numbers.length <= 7) {
        return (
            "(" +
            numbers.substring(0, 2) +
            ") " +
            numbers.substring(2)
        );
    }

    if (numbers.length <= 10) {
        return (
            "(" +
            numbers.substring(0, 2) +
            ") " +
            numbers.substring(2, 6) +
            "-" +
            numbers.substring(6)
        );
    }

    return (
        "(" +
        numbers.substring(0, 2) +
        ") " +
        numbers.substring(2, 7) +
        "-" +
        numbers.substring(7, 11)
    );
}

// =========================================================
// FORMATAR DATA
// =========================================================

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );
}

// =========================================================
// VALIDAR E-MAIL
// =========================================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =========================================================
// GERAR ID
// =========================================================

function generateId() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}

// =========================================================
// ESCAPAR HTML
// =========================================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================================
// TOAST
// =========================================================

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
