// Validation functions
function handleValidationError(field, errorMessage) {
    field.addClass("is-invalid");
    field.get(0).setCustomValidity(errorMessage); // Set custom validation message
    field.siblings(".invalid-feedback").text(errorMessage);
}

function isValidName(value) {
    return /^[A-Za-zÀ-ÿ\s]{1,50}$/.test(value);
}

function isValidJobTitle(value) {
    return /^[A-Za-zÀ-ÿ\s]{1,50}$/.test(value);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDepartmentID(value) {
    return /^\d+$/.test(value);
}

// function handleValidationError(field, errorMessage) {
//     field.addClass("is-invalid");
//     field.siblings(".invalid-feedback").text(errorMessage);
// }

function clearErrors() {
    $(".form-control").removeClass("is-invalid");
    $(".invalid-feedback").text("");
}

// Function to populate and show the generic alert modal
function populateAndShowAlertModal(message) {
    var alertModal = $("#genericAlertModal");
    alertModal.find(".modal-body").text(message);

    // Clear any previous alert classes and add the new alert class
    alertModal.find(".modal-dialog").removeClass("modal-success modal-warning modal-danger").addClass("text-white bg text-center");
    var modalContent = alertModal.find(".modal-content");
    modalContent.removeClass("bg-success bg-warning bg-danger").addClass("bg-success");

    alertModal.modal("show");
    setTimeout(function () {
        alertModal.modal("hide");
    }, 2000);
}

// Functions to update the table

function updateTable() {
    // Determine which tab is currently active
    var activeTab = $(".nav-link.active").attr("id");

    if (activeTab === "personnelBtn") {
        // Refresh personnel table
        refreshPersonnelTable();
    } else if (activeTab === "departmentsBtn") {
        // Refresh departments table
        refreshDepartmentsTable();
    } else if (activeTab === "locationsBtn") {
        // Refresh locations table
        refreshLocationsTable();
    }
}

// Define the functions to refresh each specific table
function refreshPersonnelTable() {
    var personnelTable = $("#personnel-tab-pane");
    // Fetch data from the API and repopulate the personnel table
    fetch(`${baseUrl}/personnel`)
        .then(response => response.json())
        .then(result => {
            populatePersonnelTable(result.data.personnel);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

function refreshDepartmentsTable() {
    var departmentsTable = $("#departments-tab-pane");
    // Fetch data from the API and repopulate the departments table
    fetch(`${baseUrl}/departments`)
        .then(response => response.json())
        .then(result => {
            populateDepartmentsTable(result.data.departments);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

function refreshLocationsTable() {
    var locationsTable = $("#locations-tab-pane");
    // Fetch data from the API and repopulate the locations table
    fetch(`${baseUrl}/locations`)
        .then(response => response.json())
        .then(result => {
            populateLocationsTable(result.data.locations);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

async function populatePersonnelTable() {
    $(".loading-spinner").show();

    try {
        const response = await fetch(`${baseUrl}/personnel`);
        const result = await response.json();
        const data = result.data.personnel;

        // Clear the existing content
        const personnelTable = $("#personnel-tab-pane");
        personnelTable.empty();

        // Create the table and table body using jQuery
        const table = $("<table>").addClass("table table-hover");
        const tbody = $("<tbody>");

        // Loop through the data and create rows for the table body
        data.forEach(person => {
            const row = $("<tr>");

            // Populate the row with data using jQuery
            row.html(`
                <td style="display: none;" data-tdID="${person.id}"></td>
                <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
                <td>${person.jobTitle}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
                <td style="display: none;" data-tdID="${person.departmentID}"></td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-personnel-id="${person.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${person.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                </td>
            `);

            // Append the row to the table body
            tbody.append(row);
        });

        // Append the table body to the table
        table.append(tbody);

        // Replace the existing content with the new table using jQuery
        personnelTable.html(table);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        $(".loading-spinner").hide();
    }
}


$("#searchInp").on("keyup", function () {

    // your code

});

$("#refreshBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        alert("refresh personnel table");

    } else {

        if ($("#departmentsBtn").hasClass("active")) {

            alert("refresh department table");

        } else {

            alert("refresh location table");

        }

    }

});

$("#addBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {
        $("#addPersonnelModal").modal("show");
    } else if ($("#departmentsBtn").hasClass("active")) {
        $("#addDepartmentModal").modal("show");
    } else if ($("#locationsBtn").hasClass("active")) {
        $("#addLocationModal").modal("show");
    }
});

const baseUrl = 'http://localhost:3000/api';

// personnel-tab-pane
document.addEventListener("DOMContentLoaded", function () {
    const personnelTable = document.getElementById("personnel-tab-pane");

    populatePersonnelTable();

});

// departments-tab-pane

document.addEventListener("DOMContentLoaded", function () {
    const departmentsTable = document.getElementById("departments-tab-pane");

    // Function to populate the departments table with data
    function populateDepartmentsTable(data) {
        departmentsTable.innerHTML = ""; // Clear the existing content

        // Create the table and table body
        const table = document.createElement("table");
        table.classList.add("table", "table-hover");
        const tbody = document.createElement("tbody");

        // Loop through the data and create rows for the table body
        data.forEach(department => {
            const row = document.createElement("tr");

            // Populate the row with data
            row.innerHTML = `
                <td class="align-middle text-nowrap">${department.name}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${department.location}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${department.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                </td>
            `;

            // Append the row to the table body
            tbody.appendChild(row);
        });

        // Append the table body to the table
        table.appendChild(tbody);

        // Replace the existing content with the new table
        departmentsTable.innerHTML = "";
        departmentsTable.appendChild(table);
    }

    $(".loading-spinner").show();

    // Fetch data from the API and populate the table
    fetch(`${baseUrl}/departments`)
        .then(response => response.json())
        .then(result => {
            populateDepartmentsTable(result.data.departments);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            $(".loading-spinner").hide();
        });
});

// locations-tab-pane

document.addEventListener("DOMContentLoaded", function () {
    const locationsTable = document.getElementById("locations-tab-pane");

    // Function to populate the locations table with data
    function populateLocationsTable(data) {
        locationsTable.innerHTML = ""; // Clear the existing content

        // Create the table and table body
        const table = document.createElement("table");
        table.classList.add("table", "table-hover");
        const tbody = document.createElement("tbody");

        // Loop through the data and create rows for the table body
        data.forEach(location => {
            const row = document.createElement("tr");

            // Populate the row with data
            row.innerHTML = `
                <td class="align-middle text-nowrap">${location.name}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-id="${location.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                </td>
            `;

            // Append the row to the table body
            tbody.appendChild(row);
        });

        // Append the table body to the table
        table.appendChild(tbody);

        // Replace the existing content with the new table
        locationsTable.innerHTML = "";
        locationsTable.appendChild(table);
    }

    $(".loading-spinner").show();

    // Fetch data from the API and populate the table
    fetch(`${baseUrl}/locations`)
        .then(response => response.json())
        .then(result => {
            populateLocationsTable(result.data.locations);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            $(".loading-spinner").hide();
        });
});

// Populate select options for departments
function populateDepartmentsSelect(selectElement, personDepartmentId) {
    
    $.get("http://localhost:3000/api/departments", function (data) {
        var departments = data.data.departments;

        // Preenche o <select> com as opções de departamento
        for (var i = 0; i < departments.length; i++) {
            var option = $("<option>");
            option.val(departments[i].locationID);
            option.text(departments[i].name);
            option.attr("data-departmentid", departments[i].id); // Use the correct property name

            if (parseInt(departments[i].id) === personDepartmentId) {
                option.attr("selected", "selected"); // Define a opção como selecionada
            }

            selectElement.append(option);
        }
    })
        .fail(function (error) {
            console.error("Erro ao obter a lista de departamentos:", error);
        });
}


// Chama a função para preencher os <select> dos modais quando eles forem abertos
$(document).ready(function () {

    $("#addPersonnelModal").on("show.bs.modal", function () {
        var addPersonnelDepartmentSelect = $("#addPersonnelDepartment");
        addPersonnelDepartmentSelect.empty(); // Limpa as opções antes de preencher
        populateDepartmentsSelect(addPersonnelDepartmentSelect);
    });
});


// Edit personnel modal

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    clearErrors();
    var button = $(e.relatedTarget);
    var personnelId = button.data("personnel-id");

    // Faz uma requisição GET ao endpoint com o ID do pessoal
    $.get("http://localhost:3000/api/personnel/" + personnelId, function (data) {
        var personnel = data.data.personnel;
        var personDepartmentId = personnel.departmentID;

        // Preenche os campos do modal com as informações obtidas
        $("#editPersonnelEmployeeID").val(personnel.id);
        $("#editPersonnelFirstName").val(personnel.firstName);
        $("#editPersonnelLastName").val(personnel.lastName);
        $("#editPersonnelJobTitle").val(personnel.jobTitle);
        $("#editPersonnelEmailAddress").val(personnel.email);
        $("#editPersonnelDepartmentID").val(personnel.departmentID);

        var editPersonnelDepartmentSelect = $("#editPersonnelDepartment");
        editPersonnelDepartmentSelect.empty(); // Limpa as opções antes de preencher
        populateDepartmentsSelect(editPersonnelDepartmentSelect, personDepartmentId);

    });
});

// Edit personnel save

$(document).ready(function () {
    // When the "SAVE" button is clicked
    $("#saveBtn").click(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous error states and messages
        clearErrors();

        // Get the values from the modal inputs
        var id = $("#editPersonnelEmployeeID").val();
        var lastName = $("#editPersonnelLastName").val();
        var firstName = $("#editPersonnelFirstName").val();
        var jobTitle = $("#editPersonnelJobTitle").val();
        var email = $("#editPersonnelEmailAddress").val();
        var departmentID = $("#editPersonnelDepartment").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(firstName)) {
            handleValidationError($("#editPersonnelFirstName"), "Invalid character");
            isValid = false;
        }

        if (!isValidName(lastName)) {
            handleValidationError($("#editPersonnelLastName"), "Invalid character");
            isValid = false;
        }

        if (!isValidJobTitle(jobTitle)) {
            handleValidationError($("#editPersonnelJobTitle"), "Invalid character");
            isValid = false;
        }

        if (!isValidEmail(email)) {
            handleValidationError($("#editPersonnelEmailAddress"), "Invalid email");
            isValid = false;
        }

        if (!isValidDepartmentID(departmentID)) {
            handleValidationError($("#editPersonnelDepartment"), "Invalid department");
            isValid = false;
        }

        if (!isValid) {
            return; // Exit if any validation failed
        }

        // Create the JSON data to be sent in the PUT request
        var jsonData = {
            lastName: lastName,
            firstName: firstName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID
        };
        
        // Send the PUT request
        $.ajax({
            url: "http://localhost:3000/api/personnel/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {
                // Handle the successful response
                console.log("Data updated successfully:", response);
                // Close the modal
                $("#editPersonnelModal").modal("hide");
                // Populate and show the alert modal
                populateAndShowAlertModal("Record saved successfully.");
                // Update the table 
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error updating data:", error);
            }
        });

    });
});

