const baseUrl = "http://localhost/api";

// Filter functions
function applyFilters(filterTab) {
    let locationKeyword = $("#filterLocationKeyword").val().toLowerCase();
    let departmentId = $("#filterDepartment option:selected").data("departmentid");
    let locationId = $("#filterLocation").val();
    let departmentFilterId = $("#departmentFilterDepartment option:selected").data("departmentid");
    let locationFilterId = parseInt($("#departmentFilterLocation").val());

    // Loop through rows and apply filter for Personnel tab
    $("#personnel-tab-pane tbody tr").each(function () {
        var row = $(this);
        var shouldShow = true;

        if ($("#personnelBtn").hasClass("active")) {
            var department = row.find("td[data-tddpid]").data("tddpid");
            var location = row.find("td[data-tdloid]").data("tdloid");

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

            if (parseInt(departmentFilterId) && parseInt(departmentIdInRow) !== parseInt(departmentFilterId)) {
                shouldShow = false;
            }
            if (parseInt(locationFilterId) && parseInt(locationIdInRow) != parseInt(locationFilterId)) {
                shouldShow = false;
            }
        }

        row.toggle(shouldShow);
    });

    $("#locations-tab-pane tbody tr").each(function () {
        var row = $(this);
        var shouldShow = false;

        row.find("td").each(function () {
            var cellText = $(this).text().toLowerCase();
            if (cellText.includes(locationKeyword)) {
                shouldShow = true;
                return false;
            }
        });
        row.toggle(shouldShow);
    });

    var isAnyFilterApplied = departmentId || locationId || departmentFilterId || locationFilterId || locationKeyword;
    var filterBtn = $("#filterBtn");

    if (isAnyFilterApplied) {
        filterBtn.addClass("btn-danger");
    } else {
        filterBtn.removeClass("btn-danger");
    }
}


function clearFilters() {
    $("#filterKeyword").val("");
    $("#filterDepartment").val("");
    $("#filterLocation").val("");
    $("#departmentFilterDepartment").val("");
    $("#departmentFilterLocation").val("");
    $("#filterLocationKeyword").val("");
    $("#searchInp").val("");
    $("#filterLocationKeyword").val("");
    applyFilters();
}

// Validation functions
function handleValidationError(field, errorMessage) {
    field.addClass("is-invalid");
    field.get(0).setCustomValidity(errorMessage);
    field.siblings(".invalid-feedback").text(errorMessage);
}

function handleValidationSuccess(field) {
    field.addClass("is-valid");
}

function clearValidationClasses() {
    $(".form-control").removeClass("is-invalid");
    $(".invalid-feedback").text("");
    $("#addPersonnelDepartment").removeClass("is-invalid");
    $("#addDepartmentLocation").removeClass("is-invalid");
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

function isValidLocationID(value) {
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
            $("#deletePersonnelModal").modal("hide");
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
        refreshPersonnelTable();
    } else if (activeTab === "departmentsBtn") {
        refreshDepartmentsTable();
    } else if (activeTab === "locationsBtn") {
        refreshLocationsTable();
    }
}

// Define the functions to refresh each specific table
function refreshPersonnelTable() {
    populatePersonnelTable();
}

function refreshDepartmentsTable() {
    populateDeparmentsTable();
}

function refreshLocationsTable() {
    populateLocationsTable();
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

            tbody.append(row);
        });


        table.append(tbody);


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

            tbody.append(row);
        });

        table.append(tbody);

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

            tbody.append(row);
        });


        table.append(tbody);


        personnelTable.html(table);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        $(".loading-spinner").hide();
    }
}

// clear searchInp when click on tab in any tab-pane

$(document).ready(function () {
    $(".nav-link").click(function () {
        $("#searchInp").val("");
        // show all rows
        $("#personnel-tab-pane tbody tr").each(function () {
            $(this).show();
        });
        $("#department-tab-pane tbody tr").each(function () {
            $(this).show();
        });
        $("#locations-tab-pane tbody tr").each(function () {
            $(this).show();
        });
        clearFilters();
    });
});

// Modal Functions

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
    $("#filterLocationModal").modal("show");
}


// Dynamic search
$("#searchInp").on("keyup", async function () {
    const searchTerm = $(this).val();

    if (!searchTerm) {
        updateTable();
    }

    if ($("#personnelBtn").hasClass("active")) {
        let keyword = $("#searchInp").val().toLowerCase();
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

            row.toggle(shouldShow);
        });
        // try {
        //     $(".loading-spinner").show();

        //     let response = await fetch(`${baseUrl}/search-personnel?term=${searchTerm}`);
        //     let result = await response.json();
        //     let data = result;

        //     const personnelTable = $("#personnel-tab-pane");
        //     personnelTable.empty();

        //     const table = $("<table>").addClass("table table-hover");
        //     const tbody = $("<tbody>");

        //     data.forEach(person => {
        //         const row = $("<tr>");
        //         row.html(`
        //         <td style="display: none;" data-tdid="${person.id}"></td>
        //         <td style="display: none;" data-tddpid="${person.departmentID}"></td>
        //         <td style="display: none;" data-tdloid="${person.locationID}"></td>
        //         <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
        //         <td>${person.jobTitle}</td>
        //         <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
        //         <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
        //         <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
        //         <td class="text-end text-nowrap">
        //             <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-personnel-id="${person.id}">
        //                 <i class="fa-solid fa-pencil fa-fw"></i>
        //             </button>
        //             <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-personnel-id="${person.id}">
        //                 <i class="fa-solid fa-trash fa-fw"></i>
        //             </button>
        //         </td>
        //     `);
        //         tbody.append(row);
        //     });

        //     table.append(tbody);
        //     personnelTable.html(table);

        // } catch (error) {
        //     console.error("Error fetching data:", error);
        // } finally {
        //     $(".loading-spinner").hide();
        // }
    } else if ($("#departmentsBtn").hasClass("active")) {
        let keyword = $("#searchInp").val().toLowerCase();
        $("#department-tab-pane tbody tr").each(function () {
            var row = $(this);
            var shouldShow = false;

            row.find("td").each(function () {
                var cellText = $(this).text().toLowerCase();
                if (cellText.includes(keyword)) {
                    shouldShow = true;
                    return false;
                }
            });

            row.toggle(shouldShow);
        });

        // try {
        //     $(".loading-spinner").show();

        //     let response = await fetch(`${baseUrl}/search-department?term=${searchTerm}`);
        //     let result = await response.json();
        //     let data = result;

        //     const locationsTable = $("#department-tab-pane");
        //     locationsTable.empty();

        //     const table = $("<table>").addClass("table table-hover");
        //     const tbody = $("<tbody>");

        //     data.forEach(department => {
        //         const row = $("<tr>");
        //         row.html(`
        //         <td style="display: none;" data-tddepartmentid="${department.id}"></td>
        //         <td style="display: none;" data-tdlocationid="${department.locationID}"></td>
        //         <td class="align-middle text-nowrap">${department.name}</td>
        //         <td class="align-middle text-nowrap d-none d-md-table-cell">${department.location}</td>
        //         <td class="text-end text-nowrap">
        //             <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-department-id="${department.id}">
        //                 <i class="fa-solid fa-pencil fa-fw"></i>
        //             </button>
        //             <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-department-id="${department.id}">
        //                 <i class="fa-solid fa-trash fa-fw"></i>
        //             </button>
        //         </td>
        //     `);
        //         tbody.append(row);
        //     });

        //     table.append(tbody);
        //     locationsTable.html(table);

        // } catch (error) {
        //     console.error("Error fetching data:", error);
        // } finally {
        //     $(".loading-spinner").hide();
        // }
    } else if ($("#locationsBtn").hasClass("active")) {
        let keyword = $("#searchInp").val().toLowerCase();
        $("#locations-tab-pane tbody tr").each(function () {
            var row = $(this);
            var shouldShow = false;

            row.find("td").each(function () {
                var cellText = $(this).text().toLowerCase();
                if (cellText.includes(keyword)) {
                    shouldShow = true;
                    return false;
                }
            });

            row.toggle(shouldShow);
        });

        // try {
        //     $(".loading-spinner").show();

        //     let response = await fetch(`${baseUrl}/search-location?term=${searchTerm}`);
        //     let result = await response.json();
        //     let data = result;

        //     const locationsTable = $("#locations-tab-pane");
        //     locationsTable.empty();

        //     const table = $("<table>").addClass("table table-hover");
        //     const tbody = $("<tbody>");

        //     data.forEach(location => {
        //         const row = $("<tr>");
        //         row.html(`
        //         <td class="align-middle text-nowrap">${location.name}</td>
        //         <td class="text-end text-nowrap">
        //             <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-location-id="${location.id}">
        //                 <i class="fa-solid fa-pencil fa-fw"></i>
        //             </button>
        //             <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-location-id="${location.id}">
        //                 <i class="fa-solid fa-trash fa-fw"></i>
        //             </button>
        //         </td>
        //     `);
        //         tbody.append(row);
        //     });

        //     table.append(tbody);
        //     locationsTable.html(table);

        // } catch (error) {
        //     console.error("Error fetching data:", error);
        // } finally {
        //     $(".loading-spinner").hide();
        // }
    }
});

$("#refreshBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        alert("refresh personnel table");
        clearFilters();
        populatePersonnelTable();


    } else {

        if ($("#departmentsBtn").hasClass("active")) {

            alert("refresh department table");
            clearFilters();
            populateDeparmentsTable();

        } else {

            alert("refresh location table");
            clearFilters();
            populateLocationsTable();

        }

    }

});

$("#addBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        $("#addPersonnelLastName").val("");
        $("#addPersonnelFirstName").val("");
        $("#addPersonnelJobTitle").val("");
        $("#addPersonnelEmailAddress").val("");
        $("#addPersonnelDepartment").val("");

        $("#addPersonnelModal").modal("show");
        clearValidationClasses();
    } else if ($("#departmentsBtn").hasClass("active")) {

        $("#addDepartmentName").val("");
        $("#addDepartmentLocation").val("");

        $("#addDepartmentModal").modal("show");
        clearValidationClasses();
    } else if ($("#locationsBtn").hasClass("active")) {

        $("#addLocationName").val("");

        $("#addLocationModal").modal("show");
        clearValidationClasses();
    }
});

$(document).ready(function () {
    // personnel-tab-pane
    const personnelTable = $("#personnel-tab-pane");
    populatePersonnelTable();

    // department-tab-pane
    const departmentsTable = $("#department-tab-pane");
    populateDeparmentsTable();

    // locations-tab-pane
    const locationsTable = $("#locations-tab-pane");
    populateLocationsTable();
});

// Populate select options for departments
function populateDepartmentsSelect(selectElement, personDepartmentId) {

    $.get(baseUrl + "/departments", function (data) {
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
            console.error("Error fetching departments data", error);
        });
}

// Populate select options for locations
function populateLocationsSelect(selectElement, departmentLocationId) {
    $.get(baseUrl + "/locations", function (data) {
        var locations = data.data.locations;

        for (var i = 0; i < locations.length; i++) {
            var option = $("<option>");
            option.val(locations[i].id);
            option.text(locations[i].name);

            if (parseInt(locations[i].id) === parseInt(departmentLocationId)) {
                option.attr("selected", "selected");
            }

            selectElement.append(option);
        }
    })
        .fail(function (error) {
            console.error("Error fetching locations data:", error);
        });
}


// Fill the select options when the modal is shown
$(document).ready(function () {

    $("#addPersonnelModal").on("show.bs.modal", function () {
        var addPersonnelDepartmentSelect = $("#addPersonnelDepartment");
        addPersonnelDepartmentSelect.empty(); 


        addPersonnelDepartmentSelect.append('<option value="">Select a department</option>');

        populateDepartmentsSelect(addPersonnelDepartmentSelect);
    });

    $("#addDepartmentModal").on("show.bs.modal", function () {

        var addDepartmentLocationSelect = $("#addDepartmentLocation");
        addDepartmentLocationSelect.empty(); 


        addDepartmentLocationSelect.append('<option value="">Select a location</option>');

        populateLocationsSelect(addDepartmentLocationSelect);
    });
});


// * Personnel modal/tab

// Edit personnel modal

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    clearErrors();
    var button = $(e.relatedTarget);
    var personnelId = button.data("personnel-id");

    $.get(baseUrl + "/personnel/" + personnelId, function (data) {
        var personnel = data.data.personnel;
        var personDepartmentId = personnel.departmentID;

        $("#editPersonnelEmployeeID").val(personnel.id);
        $("#editPersonnelFirstName").val(personnel.firstName);
        $("#editPersonnelLastName").val(personnel.lastName);
        $("#editPersonnelJobTitle").val(personnel.jobTitle);
        $("#editPersonnelEmailAddress").val(personnel.email);
        $("#editPersonnelDepartmentID").val(personnel.departmentID);

        var editPersonnelDepartmentSelect = $("#editPersonnelDepartment");
        editPersonnelDepartmentSelect.empty(); 
        populateDepartmentsSelect(editPersonnelDepartmentSelect, personDepartmentId);

    });
});

// Edit personnel save

$(document).ready(function () {
    $("#saveBtn").click(function (e) {
        e.preventDefault();

        
        clearErrors();

        
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
            return;
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
            url: baseUrl + "/personnel/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {

                console.log("Data updated successfully:", response);

                $("#editPersonnelModal").modal("hide");

                populateAndShowAlertModal("Record saved successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error updating data:", error);
            }
        });

    });
});

// Create personnel add
$(document).ready(function () {
    
    $("#createBtn").click(function (e) {
        e.preventDefault();

        
        clearErrors();

        
        var lastName = $("#addPersonnelLastName").val();
        var firstName = $("#addPersonnelFirstName").val();
        var jobTitle = $("#addPersonnelJobTitle").val();
        var email = $("#addPersonnelEmailAddress").val();
        var departmentID = $("#addPersonnelDepartment option:selected").data("departmentid");

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
            return;
        }

        // Create the JSON data to be sent in the PUT request
        var jsonData = {
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID
        };

        // Send the POST request
        $.ajax({
            url: baseUrl + "/personnel",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {

                console.log("Data created successfully:", response);

                $("#addPersonnelModal").modal("hide");

                populateAndShowAlertModal("Record saved successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error updating data:", error);
            }
        });

    });
});

$(document).ready(function () {
    var deletePersonnelId; 
    let deletePersonnelName = "";

    $("#deletePersonnelModal").on("show.bs.modal", function (e) {
        clearErrors();
        var button = $(e.relatedTarget);
        deletePersonnelId = button.data("personnel-id"); 


        $.get(baseUrl + "/personnel/" + deletePersonnelId, function (data) {
            var personnel = data.data.personnel;
            deletePersonnelName = personnel.firstName + " " + personnel.lastName;

            $("#deleteModalMessage").text("Are you sure you want to delete " + personnel.firstName + " " + personnel.lastName + "?");
        });
    });
    
    $("#confirmDeletePersonnelBtn").click(function () {
        // Send the DELETE request
        $.ajax({
            url: baseUrl + "/personnel/" + deletePersonnelId,
            type: "DELETE",
            success: function (response) {

                console.log("Data deleted successfully:", deletePersonnelName);
                
                $("#deletePersonnelModal").modal("hide");

                populateAndShowAlertModal("Record deleted successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error deleting data:", error);
            }
        });
        clearFilters();
    });
});

// * Departments modal/tab

// Edit department modal

$("#editDepartmentModal").on("show.bs.modal", function (e) {
    clearErrors();
    const button = $(e.relatedTarget);
    let departmentId = button.data("department-id");

    $.get(baseUrl + "/departments/" + departmentId, function (data) {
        let department = data;

        $("#editDepartmentID").val(department.id);
        $("#editDepartmentName").val(department.name);
        $("#editDepartmentLocation").val(department.locationID);

        let editDepartmentLocationSelect = $("#editDepartmentLocation");
        editDepartmentLocationSelect.empty(); 
        populateLocationsSelect(editDepartmentLocationSelect, department.locationID);
    });
});

// Edit department save
$(document).ready(function () {

    $("#saveDepartmentBtn").click(function (e) {
        e.preventDefault();

        clearErrors();
        
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
            return;
        }

        // Create the JSON data to be sent in the PUT request
        var jsonData = {
            name: departmentName,
            locationID: locationID
        };

        // Send the PUT request
        $.ajax({
            url: baseUrl + "/departments/" + departmentId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {

                console.log("Data updated successfully:", response);

                $("#editDepartmentModal").modal("hide");

                populateAndShowAlertModal("Department record saved successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error updating department data:", error);
            }
        });

    });
});

// Create department add
$(document).ready(function () {

    $("#createDepartmentBtn").click(function (e) {
        e.preventDefault();

        clearErrors();

        
        var departmentName = $("#addDepartmentName").val();
        var locationID = $("#addDepartmentLocation").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(departmentName)) {
            handleValidationError($("#addDepartmentName"), "Invalid character");
            isValid = false;
        }

        if (!isValidLocationID(parseInt(locationID))) {
            handleValidationError($("#addDepartmentLocation"), "Invalid location");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Create the JSON data to be sent in the POST request
        var jsonData = {
            name: departmentName,
            locationID: locationID
        };

        // Send the POST request
        $.ajax({
            url: baseUrl + "/departments",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {

                console.log("Department data created successfully:", response);

                $("#addDepartmentModal").modal("hide");

                populateAndShowAlertModal("Department record saved successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error creating department data:", error);
            }
        });

    });
});

// Delete department
$(document).ready(function () {
    var deleteDepartmentId; 
    let deleteDepartmentName = "";

    $("#deleteDepartmentModal").on("show.bs.modal", function (e) {
        clearErrors();
        var button = $(e.relatedTarget);
        deleteDepartmentId = button.data("department-id"); 

        $.get(baseUrl + "/departments/" + deleteDepartmentId, function (data) {
            var department = data; 
            deleteDepartmentName = department.name;

            $("#deleteDepartmentModalMessage").text("Are you sure you want to delete department " + department.name + "?");
        });
    });

    // When the "Yes" button in the delete department modal is clicked
    $("#confirmDeleteDepartmentBtn").click(function () {
        // Send the DELETE request
        $.ajax({
            url: baseUrl + "/departments/" + deleteDepartmentId,
            type: "DELETE",
            success: function (response) {

                console.log("Department deleted successfully:", deleteDepartmentName);

                $("#deleteDepartmentModal").modal("hide");

                populateAndShowAlertModal("Department deleted successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error deleting department:", error);

                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });
        clearFilters();
    });

});

// * Locations modal/tab

// Edit location modal

$("#editLocationModal").on("show.bs.modal", function (e) {
    clearErrors();
    const button = $(e.relatedTarget);
    let locationId = button.data("location-id");

    $.get(baseUrl + "/locations/" + locationId, function (data) {
        let location = data; 

        $("#editLocationID").val(location.id);
        $("#editLocationName").val(location.name);
    });
});

// Edit location save
$(document).ready(function () {

    $("#saveLocationBtn").click(function (e) {
        e.preventDefault();

        clearErrors();

        
        var locationId = $("#editLocationID").val();
        var locationName = $("#editLocationName").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(locationName)) {
            handleValidationError($("#editLocationName"), "Invalid character");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Create the JSON data to be sent in the PUT request
        var jsonData = {
            name: locationName
        };

        // Send the PUT request
        $.ajax({
            url: baseUrl + "/locations/" + locationId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {

                console.log("Location updated successfully:", response);

                $("#editLocationModal").modal("hide");

                populateAndShowAlertModal("Location record saved successfully.");
                
                updateTable();
            },
            error: function (error) {

                console.error("Error updating location data:", error);
            }
        });

    });
});

// Add location save
$(document).ready(function () {
    
    $("#createLocationBtn").click(function (e) {
        e.preventDefault();
        
        clearErrors();

        
        var locationName = $("#addLocationName").val();

        // Validation checks
        var isValid = true;

        if (!isValidName(locationName)) {
            handleValidationError($("#addLocationName"), "Invalid character");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Create the JSON data to be sent in the POST request
        var jsonData = {
            name: locationName
        };

        // Send the POST request
        $.ajax({
            url: baseUrl + "/locations",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (response) {

                console.log("Location data created successfully:", response);

                $("#addLocationModal").modal("hide");

                populateAndShowAlertModal("Location record saved successfully.");

                updateTable();
            },
            error: function (error) {

                console.error("Error creating location data:", error);
            }
        });

    });
});

// Delete location
$(document).ready(function () {
    var deleteLocationId; 
    let deleteLocationName = "";

    $("#deleteLocationModal").on("show.bs.modal", function (e) {
        clearErrors();
        var button = $(e.relatedTarget);
        deleteLocationId = parseInt(button.data("location-id")); 

        $.get(baseUrl + "/locations/" + deleteLocationId, function (data) {
            var location = data;
            deleteLocationName = location.name;

            $("#deleteLocationModalMessage").text("Are you sure you want to delete location " + location.name + "?");
        });
    });

    $("#confirmDeleteLocationBtn").click(function () {
        // Send the DELETE request
        $.ajax({
            url: baseUrl + "/locations/" + deleteLocationId,
            type: "DELETE",
            success: function (response) {

                console.log("Location deleted successfully:", deleteLocationName);

                $("#deleteLocationModal").modal("hide");
 
                populateAndShowAlertModal("Location deleted successfully.");
                
                updateTable();
            },
            error: function (error) {

                console.error("Error deleting location:", error);

                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });
        clearFilters();
    });

});

// * Filters and search

$(document).ready(function () {
    var timer; 

    populateDepartmentsSelect($("#filterDepartment"));
    populateLocationsSelect($("#filterLocation"));


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

    $("#filterKeyword").on("input", function () {
        clearTimeout(timer);
        timer = setTimeout(applyFilters, 300);
    });

    // on personnel modal

    $("#clearFiltersBtn").click(function () {
        clearFilters();
    });

    // on personnel modal

    $("#filterDepartment").change(function () {
        applyFilters();
    });

    // on personnel modal

    $("#filterLocation").change(function () {
        applyFilters();
    });

    // on department modal

    $("#departmentClearFiltersBtn").click(function () {
        clearFilters();
    });

    // on department modal

    $("#departmentFilterLocation").change(function () {
        applyFilters();
    });

    // on department modal

    $("#departmentFilterDepartment").change(function () {
        applyFilters();
    });

    // on location modal

    $("#filterLocationKeyword").on("input", function () {
        clearTimeout(timer);
        timer = setTimeout(applyFilters, 300);
    });

    // on location modal

    $("#clearLocationFiltersBtn").click(function () {
        clearFilters();
    });

    // Disable enter key on #filterLocationFilterModal
    $(document).ready(function () {
        $("#filterLocationModal").on("keydown", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault(); 
            }
        });
    });
    
});