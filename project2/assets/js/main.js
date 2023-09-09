const baseUrl = "http://localhost/api";

// Filter functions
/**
 *
 * This function updates the visibility of rows in different tabs according to applied filters.
 *
 */
function applyFilters() {
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

/**
 * Clear all filter values and trigger the filter application.
 */
function clearFilters() {
    /**
     * Clears the filter values for various filter elements and triggers the filter application.
     * @function
     */
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

/**
 * Populate and display the generic alert modal with the specified message and type.
 * @param {string} message - The message to be displayed in the alert modal.
 * @param {string} [type="success"] - The type of alert (success, warning, or error).
 */
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

/**
 * Update the table content based on the currently active tab.
 */
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

/**
 * Refreshes the personnel table by populating it with updated data.
 */
function refreshPersonnelTable() {
    populatePersonnelTable();
}

/**
 * Refreshes the departments table by populating it with updated data.
 */
function refreshDepartmentsTable() {
    populateDeparmentsTable();
}

/**
 * Refreshes the locations table by populating it with updated data.
 */
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
                    <button type="button" class="btn btn-primary btn-sm delete-location-btn" data-location-id="${location.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                </td>
            `);

            tbody.append(row);
        });


        table.append(tbody);


        locationsTable.html(table);
    } catch (error) {
        //console.error("Error fetching data:", error);
    } finally {
        $(".loading-spinner").hide();
    }
}

/**
 * Populate the locations table with data retrieved from the server.
 */
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
                    <button type="button" class="btn btn-primary btn-sm delete-department-btn" data-department-id="${department.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                </td>
            `);

            tbody.append(row);
        });

        table.append(tbody);

        departmentsTable.html(table);
    } catch (error) {
        //console.error("Error fetching data:", error);
    } finally {
        $(".loading-spinner").hide();
    }

}

/**
 * Populate the personnel table with data retrieved from the server.
 */
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
                <td class="align-middle text-nowrap">${person.jobTitle}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-personnel-id="${person.id}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-sm delete-personnel-btn" data-personnel-id="${person.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                </td>
            `);

            tbody.append(row);
        });


        table.append(tbody);


        personnelTable.html(table);
    } catch (error) {
        //console.error("Error fetching data:", error);
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
/**
 * Open the personnel filter modal and populate select elements with department and location options.
 */
function openPersonnelFilterModal() {
    /**
     * Opens the personnel filter modal, populates department and location select elements,
     * and displays the modal for filtering personnel.
     * @function
     */
    populateDepartmentsSelect($("#filterDepartment"));
    populateLocationsSelect($("#filterLocation"));
    $("#filterModal").modal("show");
}

/**
 * Open the department filter modal and populate select elements with department and location options.
 */
function openDepartmentFilterModal() {
    /**
     * Opens the department filter modal, populates department and location select elements,
     * and displays the modal for filtering departments.
     * @function
     */
    populateDepartmentsSelect($("#departmentFilterDepartment"));
    populateLocationsSelect($("#departmentFilterLocation"));
    $("#departmentFilterModal").modal("show");
}

/**
 * Open the location filter modal.
 */
function openLocationFilterModal() {
    /**
     * Opens the location filter modal and displays it for filtering locations.
     * @function
     */
    $("#filterLocationModal").modal("show");
}


// Dynamic search
$("#searchInp").on("keyup", async function () {
    const searchTerm = $(this).val();

    if (!searchTerm) {
        updateTable();
    } else {
        // Verifique se algum filtro está ativo e limpe-os se necessário
        if ($("#filterLocationKeyword").val() ||
            $("#filterDepartment").val() ||
            $("#filterLocation").val() ||
            $("#departmentFilterDepartment").val() ||
            $("#departmentFilterLocation").val()) {
            // Limpe os filtros aqui, por exemplo:
            $("#filterLocationKeyword").val("");
            $("#filterDepartment").val("");
            $("#filterLocation").val("");
            $("#departmentFilterDepartment").val("");
            $("#departmentFilterLocation").val("");

            // Também redefina a aparência do botão de filtro, se necessário
            $("#filterBtn").removeClass("btn-danger");
        }
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

    }
});

$("#refreshBtn").click(function () {

    if ($("#personnelBtn").hasClass("active")) {

        clearFilters();
        populatePersonnelTable();


    } else {

        if ($("#departmentsBtn").hasClass("active")) {

            clearFilters();
            populateDeparmentsTable();

        } else {

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
    } else if ($("#departmentsBtn").hasClass("active")) {

        $("#addDepartmentName").val("");
        $("#addDepartmentLocation").val("");

        $("#addDepartmentModal").modal("show");
    } else if ($("#locationsBtn").hasClass("active")) {

        $("#addLocationName").val("");

        $("#addLocationModal").modal("show");
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

// Populate select options
/**
 * Populate select options for departments.
 * @param {jQuery} selectElement - The jQuery object representing the select element to be populated.
 * @param {number} [personDepartmentId] - The department ID to be pre-selected (optional).
 */
function populateDepartmentsSelect(selectElement, personDepartmentId) {
    /**
     * Populates the provided select element with options retrieved from the server for departments.
     * @function
     * @param {jQuery} selectElement - The jQuery object representing the select element to be populated.
     * @param {number} [personDepartmentId] - The department ID to be pre-selected (optional).
     */

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
            //console.error("Error fetching departments data", error);
        });
}

/**
 * Populate select options for locations.
 * @param {jQuery} selectElement - The jQuery object representing the select element to be populated.
 * @param {number} [departmentLocationId] - The location ID to be pre-selected (optional).
 */
function populateLocationsSelect(selectElement, departmentLocationId) {
    /**
     * Populates the provided select element with options retrieved from the server for locations.
     * @function
     * @param {jQuery} selectElement - The jQuery object representing the select element to be populated.
     * @param {number} [departmentLocationId] - The location ID to be pre-selected (optional).
     */
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
            //console.error("Error fetching locations data:", error);
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

// Populate edit personnel modal
$("#editPersonnelModal").on("show.bs.modal", function (e) {
    var button = $(e.relatedTarget);
    var personnelId = button.data("personnel-id");

    $.post(baseUrl + "/personnel/" + personnelId, function (data) {
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
$("#editPersonnelForm").on("submit", function (e) {
    e.preventDefault();

    var id = $("#editPersonnelEmployeeID").val();
    var lastName = $("#editPersonnelLastName").val();
    var firstName = $("#editPersonnelFirstName").val();
    var jobTitle = $("#editPersonnelJobTitle").val();
    var email = $("#editPersonnelEmailAddress").val();
    var departmentID = $("#editPersonnelDepartment option:selected").data("departmentid");

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

            $("#editPersonnelModal").modal("hide");

            populateAndShowAlertModal("Personnel saved successfully.");

            updateTable();
        },
        error: function (error) {

            //console.error("Error updating data:", error);
        }
    });

    clearFilters();

});


// Create personnel add
$("#addPersonnelForm").on("submit", function (e) {
    e.preventDefault();

    var lastName = $("#addPersonnelLastName").val();
    var firstName = $("#addPersonnelFirstName").val();
    var jobTitle = $("#addPersonnelJobTitle").val();
    var email = $("#addPersonnelEmailAddress").val();
    var departmentID = $("#addPersonnelDepartment option:selected").data("departmentid");

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

            $("#addPersonnelModal").modal("hide");

            populateAndShowAlertModal("Personnel created successfully.");

            updateTable();
        },
        error: function (error) {

            //console.error("Error updating data:", error);
        }
    });

    clearFilters();

});

// Delete personnel
$(document).ready(function () {
    $(document).on("click", ".delete-personnel-btn", function () {
        let deletePersonneltId = $(this).data("personnel-id");

        $.ajax({
            url: baseUrl + "/personnel/" + deletePersonneltId,
            type: "DELETE",
            success: function (response) {
                populateAndShowAlertModal("Personnel deleted successfully:");
                updateTable();
            },
            error: function (error) {
                //console.error("Error deleting personnel:", error);
                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });

        clearFilters();
    });
});


// * Departments modal/tab

// Populate edit department modal
$("#editDepartmentModal").on("show.bs.modal", function (e) {
    const button = $(e.relatedTarget);
    let departmentId = button.data("department-id");

    $.post(baseUrl + "/departments/" + departmentId, function (data) {
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
$("#editDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    var departmentId = $("#editDepartmentID").val();
    var departmentName = $("#editDepartmentName").val();
    var locationID = $("#editDepartmentLocation").val();

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


            $("#editDepartmentModal").modal("hide");

            populateAndShowAlertModal("Department saved successfully.");

            updateTable();
        },
        error: function (error) {

            //console.error("Error updating department data:", error);
        }
    });
    clearFilters();

});

// Add department
$("#addDepartmentForm").on("submit", function (e) {
    e.preventDefault();

    var departmentName = $("#addDepartmentName").val();
    var locationID = $("#addDepartmentLocation").val();

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

            //console.log("Department data created successfully:", response);

            $("#addDepartmentModal").modal("hide");

            populateAndShowAlertModal("Department created successfully.");

            updateTable();
        },
        error: function (error) {

            //console.error("Error creating department data:", error);
        }
    });
    clearFilters();
});


// Delete department
$(document).ready(function () {
    $(document).on("click", ".delete-department-btn", function () {
        let deleteDepartmentId = $(this).data("department-id");

        $.ajax({
            url: baseUrl + "/departments/" + deleteDepartmentId,
            type: "DELETE",
            success: function (response) {
                populateAndShowAlertModal("Department deleted successfully:");
                updateTable();
            },
            error: function (error) {
                //console.error("Error deleting department:", error);
                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });

        clearFilters();
    });
});

// * Locations modal/tab

// Edit location modal

$("#editLocationModal").on("show.bs.modal", function (e) {
    const button = $(e.relatedTarget);
    let locationId = button.data("location-id");

    $.post(baseUrl + "/locations/" + locationId, function (data) {
        let location = data;

        $("#editLocationID").val(location.id);
        $("#editLocationName").val(location.name);
    });
});

// Edit location save


$("#editLocationForm").on("submit", function (e) {
    e.preventDefault();

    var locationId = $("#editLocationID").val();
    var locationName = $("#editLocationName").val();

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

            $("#editLocationModal").modal("hide");

            populateAndShowAlertModal("Location saved successfully.");

            updateTable();
        },
        error: function (error) {

            //console.error("Error updating location data:", error);
        }
    });

    clearFilters();

});

// Add location save

$("#addLocationForm").on("submit", function (e) {
    e.preventDefault();

    var locationName = $("#addLocationName").val();

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

            $("#addLocationModal").modal("hide");

            populateAndShowAlertModal("Location record saved successfully.");

            updateTable();
        },
        error: function (error) {

            //console.error("Error creating location data:", error);
        }
    });

    clearFilters();

});

// Delete location
$(document).ready(function () {
    $(document).on("click", ".delete-location-btn", function () {
        let deleteLocationtId = $(this).data("location-id");

        $.ajax({
            url: baseUrl + "/locations/" + deleteLocationtId,
            type: "DELETE",
            success: function (response) {
                populateAndShowAlertModal("Location deleted successfully:");
                updateTable();
            },
            error: function (error) {
                //console.error("Error deleting location:", error);
                populateAndShowAlertModal(error.responseJSON.error, "error");
            }
        });

        clearFilters();
    });
});

// * Filters and search

$(document).ready(function () {
    var timer;

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

// Special characters and sql validation
$(document).ready(function () {
    // Array of field IDs to validate
    var fieldIDs = [
        "editPersonnelFirstName",
        "editPersonnelLastName",
        "editPersonnelJobTitle",
        "addPersonnelFirstName",
        "addPersonnelLastName",
        "addPersonnelJobTitle",
        "editDepartmentName",
        "addDepartmentName",
        "editLocationName",
        "addLocationName"
    ];

    // Attach validation to each field
    fieldIDs.forEach(function (fieldID) {
        $("#" + fieldID).on("input", function () {
            var specialCharacters = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|]/;
            var sqlKeywords = /(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE)/i;
            var inputValue = $(this).val();

            if (specialCharacters.test(inputValue) || sqlKeywords.test(inputValue)) {
                $("#error-message").text("Input term are not allowed.");
                $(this).get(0).setCustomValidity("Input term are not allowed.");
            } else {
                $("#error-message").text("");
                $(this).get(0).setCustomValidity(""); // Clear custom error message
            }
        });
    });
});