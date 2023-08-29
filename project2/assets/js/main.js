// Filter functions
function applyFilters(filterTab) {
    let keyword = $("#filterKeyword").val().toLowerCase(); // from input field
    let departmentId = $("#filterDepartment option:selected").data("departmentid"); // from select menu
    let locationId = $("#filterLocation").val(); // from select menu
    let departmentFilterId = $("#departmentFilterDepartment option:selected").data("departmentid"); // from select menu
    let locationFilterId = parseInt($("#departmentFilterLocation").val()); // from select menu
    console.log("locationFilterId:", locationFilterId);

    // Loop through rows and apply filter for Personnel tab
    $("#personnel-tab-pane tbody tr").each(function () {
        var row = $(this);
        var shouldShow = false;

        row.find("td").each(function () {
            var cellText = $(this).text().toLowerCase();
            if (cellText.includes(keyword)) {
                shouldShow = true;
                return false;
            }
        });

        var department = row.find("td[data-tddpid]").data("tddpid"); // from table
        var location = row.find("td[data-tdloid]").data("tdloid"); // from table

        if ($("#personnelBtn").hasClass("active")) {
            if (parseInt(departmentId) && parseInt(department) !== parseInt(departmentId)) {
                shouldShow = false;
            }
            if (parseInt(locationId) && parseInt(location) !== parseInt(locationId)) {
                shouldShow = false;
            }
        }

        row.toggle(shouldShow);
    });

    // Loop through rows and apply filter for Departments tab
    $("#department-tab-pane tbody tr").each(function () {
        var row = $(this);
        var shouldShow = true;

        if ($("#departmentsBtn").hasClass("active")) {
            var departmentIdInRow = row.find("td[data-tddepartmentid]").data("tddepartmentid");
            var locationIdInRow = row.find("td[data-tdlocationid]").data("tdlocationid");
            console.log("locationIdInRow:", locationIdInRow);
            
            if (parseInt(departmentFilterId) && parseInt(departmentIdInRow) !== parseInt(departmentFilterId)) {
                shouldShow = false;
            }
            if (parseInt(locationFilterId) && parseInt(locationIdInRow) != parseInt(locationFilterId)) {
                shouldShow = false;
            }
        }

        row.toggle(shouldShow);
    });

    var isAnyFilterApplied = keyword || departmentId || locationId || departmentFilterId || locationFilterId;
    var filterBtn = $("#filterBtn");

    if (isAnyFilterApplied) {
        filterBtn.addClass("btn-danger");
    } else {
        filterBtn.removeClass("btn-danger");
    }
}


function clearFiltersPersonnel() {
    $("#filterKeyword").val(""); // Clear the input field
    $("#filterDepartment").val(""); // Clear the department filter
    $("#filterLocation").val(""); // Clear the location filter
    applyFilters(); // Apply filters to reset the table
}

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
function populateAndShowAlertModal(message, type = "success") {
    var alertModal = $("#genericAlertModal");
    alertModal.find(".modal-body").text(message);

    if (type === "success") {
        // Clear any previous alert classes and add the new alert class
        alertModal.find(".modal-dialog").removeClass("modal-success modal-warning modal-danger").addClass("text-white bg text-center");
        var modalContent = alertModal.find(".modal-content");
        modalContent.removeClass("bg-success bg-warning bg-danger").addClass("bg-success");

        alertModal.modal("show");
        setTimeout(function () {
            alertModal.modal("hide");
        }, 2000);
    } else {
        let activeTab = $(".nav-link.active").attr("id");

        if (activeTab === "personnelBtn") {
            // Refresh personnel table

        } else if (activeTab === "departmentsBtn") {
            // Refresh departments table
            $("#deleteDepartmentModal").modal("hide");
        } else if (activeTab === "locationsBtn") {
            // Refresh locations table
            $("#deleteLocationModal").modal("hide");
        }
        $("#deleteDepartmentModal").modal("hide");
        // Clear any previous alert classes and add the new alert class
        alertModal.find(".modal-dialog").removeClass("modal-success modal-warning modal-danger").addClass("text-white bg text-center");
        var modalContent = alertModal.find(".modal-content");
        modalContent.removeClass("bg-success bg-warning bg-danger").addClass("bg-danger");

        alertModal.modal("show");
        setTimeout(function () {
            alertModal.modal("hide");
        }
            , 3000);
    }

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
    var departmentsTable = $("#department-tab-pane");
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

// Functions to populate each specific table
async function populateLocationsTable() {
    $(".loading-spinner").show();

    try {
        let response = await fetch(`${baseUrl}/locations`);
        let result = await response.json();
        let data = result.data.locations;

        // Clear the existing content
        const locationsTable = $("#locations-tab-pane");
        locationsTable.empty();

        // Create the table and table body using jQuery
        const table = $("<table>").addClass("table table-hover");
        const tbody = $("<tbody>");

        // Loop through the data and create rows for the table body
        data.forEach(location => {
            const row = $("<tr>");

            // Populate the row with data using jQuery
            row.html(`
                <td class="align-middle text-nowrap">${location.name}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-location-id="${location.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-location-id="${location.id}">
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
        locationsTable.html(table);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        $(".loading-spinner").hide();
    }
}

async function populateDeparmentsTable() {
    $(".loading-spinner").show();
    try {
        let response = await fetch(`${baseUrl}/departments`);
        let result = await response.json();
        let data = result.data.departments;

        // Clear the existing content
        const departmentsTable = $("#department-tab-pane");
        departmentsTable.empty();

        // Create the table and table body using jQuery
        const table = $("<table>").addClass("table table-hover");
        const tbody = $("<tbody>");

        // Loop through the data and create rows for the table body
        data.forEach(department => {
            const row = $("<tr>");

            // Populate the row with data using jQuery
            row.html(`
                <td style="display: none;" data-tddepartmentid="${department.id}"></td>
                <td style="display: none;" data-tdlocationid="${department.locationID}"></td>
                <td class="align-middle text-nowrap">${department.name}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${department.location}</td>
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
                <td style="display: none;" data-tdid="${person.id}"></td>
                <td style="display: none;" data-tddpid="${person.departmentID}"></td>
                <td style="display: none;" data-tdloid="${person.locationID}"></td>
                <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
                <td>${person.jobTitle}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
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
        clearFiltersPersonnel()
        populatePersonnelTable();


    } else {

        if ($("#departmentsBtn").hasClass("active")) {

            alert("refresh department table");
            clearFiltersPersonnel()
            populateDeparmentsTable();

        } else {

            alert("refresh location table");
            clearFiltersPersonnel()
            populateLocationsTable();

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

// department-tab-pane
document.addEventListener("DOMContentLoaded", function () {
    const departmentsTable = document.getElementById("department-tab-pane");
    populateDeparmentsTable();
});

// locations-tab-pane

document.addEventListener("DOMContentLoaded", function () {
    const locationsTable = document.getElementById("locations-tab-pane");
    populateLocationsTable();
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

    $("#addDepartmentModal").on("show.bs.modal", function () {

        var addDepartmentLocationSelect = $("#addDepartmentLocation");
        addDepartmentLocationSelect.empty(); // Limpa as opções antes de preencher
        populateLocationsSelect(addDepartmentLocationSelect);
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
        var departmentID = $("#editPersonnelDepartment option:selected").data("departmentid");

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

        if (!isValidDepartmentID(parseInt(departmentID))) {
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
        var departmentID = parseInt($("#addPersonnelDepartment").val());

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

// Create department add
$(document).ready(function () {
    // When the "ADD" button is clicked
    $("#createDepartmentBtn").click(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous error states and messages
        clearErrors();

        // Get the values from the modal inputs
        var departmentName = $("#addDepartmentName").val();
        var locationID = $("#addDepartmentLocation").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(departmentName)) {
            handleValidationError($("#addDepartmentName"), "Invalid character");
            isValid = false;
        }

        if (!isValid) {
            return; // Exit if any validation failed
        }

        // Create the JSON data to be sent in the POST request
        var jsonData = {
            name: departmentName,
            locationID: locationID
        };

        // Send the POST request
        $.ajax({
            url: "http://localhost:3000/api/departments/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {
                // Handle the successful response
                console.log("Department data created successfully:", response);
                // Close the modal
                $("#addDepartmentModal").modal("hide");
                // Populate and show the alert modal
                populateAndShowAlertModal("Department record saved successfully.");
                // Update the department-related elements (e.g., table, etc.)
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error creating department data:", error);
            }
        });

    });
});

// Delete department
$(document).ready(function () {
    var deleteDepartmentId; // Variable to store the ID of the department to be deleted
    let deleteDepartmentName = "";

    $("#deleteDepartmentModal").on("show.bs.modal", function (e) {
        clearErrors();
        var button = $(e.relatedTarget);
        deleteDepartmentId = button.data("department-id"); // Store the ID of the department to be deleted

        console.log("delete departmentId:", deleteDepartmentId);

        $.get("http://localhost:3000/api/departments/" + deleteDepartmentId, function (data) {
            var department = data; // Assuming data directly represents the department object
            deleteDepartmentName = department.name;

            $("#deleteDepartmentModalMessage").text("Are you sure you want to delete department " + department.name + "?");
        });
    });

    // When the "Yes" button in the delete department modal is clicked
    $("#confirmDeleteDepartmentBtn").click(function () {
        // Send the DELETE request
        $.ajax({
            url: "http://localhost:3000/api/departments/" + deleteDepartmentId,
            type: "DELETE",
            success: function (response) {
                // Handle the successful response
                console.log("Department deleted successfully:", deleteDepartmentName);
                // Close the delete department modal
                $("#deleteDepartmentModal").modal("hide");
                // Populate and show the success alert modal
                populateAndShowAlertModal("Department deleted successfully.");
                // Update the department-related elements (e.g., table, etc.)
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error deleting department:", error);
                // Display the error message in the alert modal
                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });
    });

});

// * Locations modal/tab

// Edit location modal

$("#editLocationModal").on("show.bs.modal", function (e) {
    clearErrors();
    const button = $(e.relatedTarget);
    let locationId = button.data("location-id");

    // Make a GET request to the endpoint with the location ID
    $.get("http://localhost:3000/api/locations/" + locationId, function (data) {
        let location = data; // Assuming data directly represents the location object
        // Populate the modal fields with the retrieved information
        $("#editLocationID").val(location.id);
        $("#editLocationName").val(location.name);
    });
});

// Edit location save
$(document).ready(function () {
    // When the "SAVE" button is clicked
    $("#saveLocationBtn").click(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous error states and messages
        clearErrors();

        // Get the values from the modal inputs
        var locationId = $("#editLocationID").val();
        var locationName = $("#editLocationName").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(locationName)) {
            handleValidationError($("#editLocationName"), "Invalid character");
            isValid = false;
        }

        if (!isValid) {
            return; // Exit if any validation failed
        }

        // Create the JSON data to be sent in the PUT request
        var jsonData = {
            name: locationName
        };

        // Send the PUT request
        $.ajax({
            url: "http://localhost:3000/api/locations/" + locationId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {
                // Handle the successful response
                console.log("Location updated successfully:", response);
                // Close the modal
                $("#editLocationModal").modal("hide");
                // Populate and show the alert modal
                populateAndShowAlertModal("Location record saved successfully.");
                // Update the location-related elements (e.g., table, etc.)
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error updating location data:", error);
            }
        });

    });
});

// Add location save
$(document).ready(function () {
    // When the "ADD" button is clicked
    $("#createLocationBtn").click(function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Clear previous error states and messages
        clearErrors();

        // Get the values from the modal inputs
        var locationName = $("#addLocationName").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(locationName)) {
            handleValidationError($("#addLocationName"), "Invalid character");
            isValid = false;
        }

        if (!isValid) {
            return; // Exit if any validation failed
        }

        // Create the JSON data to be sent in the POST request
        var jsonData = {
            name: locationName
        };

        // Send the POST request
        $.ajax({
            url: "http://localhost:3000/api/locations/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {
                // Handle the successful response
                console.log("Location data created successfully:", response);
                // Close the modal
                $("#addLocationModal").modal("hide");
                // Populate and show the alert modal
                populateAndShowAlertModal("Location record saved successfully.");
                // Update the location-related elements (e.g., table, etc.)
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error creating location data:", error);
            }
        });

    });
});

// Delete location
$(document).ready(function () {
    var deleteLocationId; // Variable to store the ID of the location to be deleted
    let deleteLocationName = "";

    $("#deleteLocationModal").on("show.bs.modal", function (e) {
        clearErrors();
        var button = $(e.relatedTarget);
        deleteLocationId = button.data("location-id"); // Store the ID of the location to be deleted

        console.log("delete locationId:", deleteLocationId);

        $.get("http://localhost:3000/api/locations/" + deleteLocationId, function (data) {
            var location = data; // Assuming data directly represents the location object
            deleteLocationName = location.name;

            $("#deleteLocationModalMessage").text("Are you sure you want to delete location " + location.name + "?");
        });
    });

    // When the "Yes" button in the delete location modal is clicked
    $("#confirmDeleteLocationBtn").click(function () {
        // Send the DELETE request
        $.ajax({
            url: "http://localhost:3000/api/locations/" + deleteLocationId,
            type: "DELETE",
            success: function (response) {
                // Handle the successful response
                console.log("Location deleted successfully:", deleteLocationName);
                // Close the delete location modal
                $("#deleteLocationModal").modal("hide");
                // Populate and show the success alert modal
                populateAndShowAlertModal("Location deleted successfully.");
                // Update the location-related elements (e.g., table, etc.)
                updateTable();
            },
            error: function (error) {
                // Handle the error, if needed
                console.error("Error deleting location:", error);
                // Display the error message in the alert modal
                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });
    });

});

// * Filters and search

$(document).ready(function () {
    var timer; // Timer for search delay

    // Populate departments and locations selects
    populateDepartmentsSelect($("#filterDepartment"));
    populateLocationsSelect($("#filterLocation"));

    // Open the filter modal when the filter button is clicked
    $("#filterBtn").click(function () {
        if ($("#personnelBtn").hasClass("active")) {
            openPersonnelFilterModal();
        } else if ($("#departmentsBtn").hasClass("active")) {
            openDepartmentFilterModal();
        } else if ($("#locationsBtn").hasClass("active")) {
            openLocationFilterModal();
        }
    });

    // on personnel modal
    // When the input field changes (user types)
    $("#filterKeyword").on("input", function () {
        clearTimeout(timer);
        timer = setTimeout(applyFilters, 300);
    });

    // on personnel modal
    // When the "Clear Filters" button is clicked
    $("#clearFiltersBtn").click(function () {
        clearFiltersPersonnel();
    });

    // on personnel modal
    // When the department filter changes
    $("#filterDepartment").change(function () {
        applyFilters();
    });

    // on personnel modal
    // When the location filter changes
    $("#filterLocation").change(function () {
        applyFilters();
    });

    // on department modal
    // When location filter changes
    $("#departmentFilterLocation").change(function () {
        applyFilters();
    });

    // on department modal
    //when department filter changes
    $("#departmentFilterDepartment").change(function () {
        applyFilters();
    });
});

function openPersonnelFilterModal() {
    populateDepartmentsSelect($("#filterDepartment"));
    populateLocationsSelect($("#filterLocation"));
    $("#filterModal").modal("show");
}

function openDepartmentFilterModal() {
    populateDepartmentsSelect($("#departmentFilterDepartment"));
    populateLocationsSelect($("#departmentFilterLocation"));
    $("#departmentFilterModal").modal("show");
}

function openLocationFilterModal() {
    // Handle opening location filter modal if needed
}