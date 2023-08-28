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
            populateDeparmentsTable(result.data.departments);
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

async function populateDeparmentsTable() {
    $(".loading-spinner").show();
    try {
        let response = await fetch(`${baseUrl}/departments`);
        let result = await response.json();
        let data = result.data.departments;

        // Clear the existing content
        const departmentsTable = $("#departments-tab-pane");
        departmentsTable.empty();

        // Create the table and table body using jQuery
        const table = $("<table>").addClass("table table-hover");
        const tbody = $("<tbody>");

        // Loop through the data and create rows for the table body
        data.forEach(department => {
            const row = $("<tr>");

            // Populate the row with data using jQuery
            row.html(`
                <td style="display: none;" data-tdDepartmentID="${department.id}"></td>
                <td class="align-middle text-nowrap">${department.name}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${department.location}</td>
                <td style="display: none;" data-tdLocationID="${department.locationID}"></td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-department-id="${department.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-department-id="${department.id}">
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
        departmentsTable.html(table);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        $(".loading-spinner").hide();
    }

}

async function populatePersonnelTable() {
    $(".loading-spinner").show();

    try {
        let response = await fetch(`${baseUrl}/personnel`);
        let result = await response.json();
        let data = result.data.personnel;

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
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-personnel-id="${person.id}">
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
        //clear modal fields
        $("#addPersonnelLastName").val("");
        $("#addPersonnelFirstName").val("");
        $("#addPersonnelJobTitle").val("");
        $("#addPersonnelEmailAddress").val("");
        $("#addPersonnelDepartment").val("");

        $("#addPersonnelModal").modal("show");
    } else if ($("#departmentsBtn").hasClass("active")) {
        //clear modal fields
        $("#addDepartmentName").val("");
        $("#addDepartmentLocation").val("");

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
    populateDeparmentsTable();
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
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-location-id="${location.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm deleteLocationBtn" data-location-id="${location.id}">
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

        // Loop through the data and create options for the select
        for (var i = 0; i < departments.length; i++) {
            var option = $("<option>");
            option.val(departments[i].locationID);
            option.text(departments[i].name);
            option.attr("data-departmentid", departments[i].id);

            if (parseInt(departments[i].id) === parseInt(personDepartmentId)) {
                option.attr("selected", "selected"); // mark the option as selected
            }

            selectElement.append(option);
        }
    })
        .fail(function (error) {
            console.error("Erro ao obter a lista de departamentos:", error);
        });
}

// Populate select options for locations
function populateLocationsSelect(selectElement, departmentLocationId) {
    $.get("http://localhost:3000/api/locations", function (data) {
        var locations = data.data.locations;
        console.log("locations:", locations);

        // Preenche o <select> com as opções de localização
        for (var i = 0; i < locations.length; i++) {
            var option = $("<option>");
            option.val(locations[i].id);
            option.text(locations[i].name);

            if (parseInt(locations[i].id) === parseInt(departmentLocationId)) {
                option.attr("selected", "selected"); // Define a opção como selecionada
            }

            selectElement.append(option);
        }
    })
        .fail(function (error) {
            console.error("Erro ao obter a lista de localizações:", error);
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

// * Personnel modal/tab

// Edit personnel modal

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    clearErrors();
    var button = $(e.relatedTarget);
    var personnelId = button.data("personnel-id");

    // Faz uma requisição GET ao endpoint com o ID do pessoal
    $.get("http://localhost:3000/api/personnel/" + personnelId, function (data) {
        console.log("data:", data);
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
        console.log("editPersonnelDepartmentSelect:", editPersonnelDepartmentSelect);
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
        var departmentID = $("option:selected").data("departmentid");

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

// Create personnel add

$(document).ready(function () {
    // When the "ADD" button is clicked
    $("#createBtn").click(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous error states and messages
        clearErrors();

        // Get the values from the modal inputs
        var lastName = $("#addPersonnelLastName").val();
        var firstName = $("#addPersonnelFirstName").val();
        var jobTitle = $("#addPersonnelJobTitle").val();
        var email = $("#addPersonnelEmailAddress").val();
        var departmentID = $("#addPersonnelDepartment").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(firstName)) {
            handleValidationError($("#addPersonnelFirstName"), "Invalid character");
            isValid = false;
        }

        if (!isValidName(lastName)) {
            handleValidationError($("#addPersonnelLastName"), "Invalid character");
            isValid = false;
        }

        if (!isValidJobTitle(jobTitle)) {
            handleValidationError($("#addPersonnelJobTitle"), "Invalid character");
            isValid = false;
        }

        if (!isValidEmail(email)) {
            handleValidationError($("#addPersonnelEmailAddress"), "Invalid email");
            isValid = false;
        }

        if (!isValidDepartmentID(departmentID)) {
            handleValidationError($("#addPersonnelDepartment"), "Invalid department");
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
            url: "http://localhost:3000/api/personnel/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {
                // Handle the successful response
                console.log("Data created successfully:", response);
                // Close the modal
                $("#addPersonnelModal").modal("hide");
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

$(document).ready(function () {
    var deletePersonnelId; // Variável para armazenar o ID da pessoa a ser excluída
    let deletePersonnelName = "";

    $("#deletePersonnelModal").on("show.bs.modal", function (e) {
        clearErrors();
        var button = $(e.relatedTarget);
        deletePersonnelId = button.data("personnel-id"); // Armazena o ID da pessoa a ser excluída

        console.log("delete personnelId:", deletePersonnelId);

        $.get("http://localhost:3000/api/personnel/" + deletePersonnelId, function (data) {
            var personnel = data.data.personnel;
            deletePersonnelName = personnel.firstName + " " + personnel.lastName;

            $("#deleteModalMessage").text("Are you sure you want to delete " + personnel.firstName + " " + personnel.lastName + "?");
        });
    });

    // When the "Yes" button in the delete modal is clicked
    $("#confirmDeletePersonnelBtn").click(function () {
        // Send the DELETE request
        $.ajax({
            url: "http://localhost:3000/api/personnel/" + deletePersonnelId,
            type: "DELETE",
            success: function (response) {
                // Handle the successful response
                console.log("Data deleted successfully:", deletePersonnelName);
                // Close the delete modal
                $("#deletePersonnelModal").modal("hide");
                // Populate and show the alert modal
                populateAndShowAlertModal("Record deleted successfully.");
                // Update the table 
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error deleting data:", error);
            }
        });
    });
});

// * Departments modal/tab

// Edit department modal

$("#editDepartmentModal").on("show.bs.modal", function (e) {
    clearErrors();
    const button = $(e.relatedTarget);
    let departmentId = button.data("department-id");

    // Make a GET request to the endpoint with the department ID
    $.get("http://localhost:3000/api/departments/" + departmentId, function (data) {
        let department = data;
        // Populate the modal fields with the retrieved information
        $("#editDepartmentID").val(department.id);
        $("#editDepartmentName").val(department.name);
        $("#editDepartmentLocation").val(department.locationID);

        let editDepartmentLocationSelect = $("#editDepartmentLocation");
        editDepartmentLocationSelect.empty(); // Clear the options before populating
        populateLocationsSelect(editDepartmentLocationSelect, department.locationID);
    });
});
    
// Edit department save
$(document).ready(function () {
    // When the "SAVE" button is clicked
    $("#saveDepartmentBtn").click(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous error states and messages
        clearErrors();

        // Get the values from the modal inputs
        var departmentId = $("#editDepartmentID").val();
        var departmentName = $("#editDepartmentName").val();
        var locationID = $("#editDepartmentLocation").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(departmentName)) {
            handleValidationError($("#editDepartmentName"), "Invalid character");
            isValid = false;
        }

        if (!isValid) {
            return; // Exit if any validation failed
        }

        console.log("name:", departmentName);
        console.log("locationID:", locationID);
        // Create the JSON data to be sent in the PUT request
        var jsonData = {
            name: departmentName,
            locationID: locationID
        };

        // Send the PUT request
        $.ajax({
            url: "http://localhost:3000/api/departments/" + departmentId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {
                // Handle the successful response
                console.log("Data updated successfully:", response);
                // Close the modal
                $("#editDepartmentModal").modal("hide");
                // Populate and show the alert modal
                populateAndShowAlertModal("Department record saved successfully.");
                // Update the department-related elements (e.g., table, etc.)
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error updating department data:", error);
            }
        });

    });
});
