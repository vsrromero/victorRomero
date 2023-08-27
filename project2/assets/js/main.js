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
    console.log("Add button clicked"); // Add this line to check if the event is triggered

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
    
    // Function to populate the personnel table with data
    function populatePersonnelTable(data) {
        personnelTable.innerHTML = ""; // Clear the existing content
        
        // Create the table and table body
        const table = document.createElement("table");
        table.classList.add("table", "table-hover");
        const tbody = document.createElement("tbody");
        
        // Loop through the data and create rows for the table body
        data.forEach(person => {
            const row = document.createElement("tr");
            
            // Populate the row with data
            row.innerHTML = `
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
        `;
            
            // Append the row to the table body
            tbody.appendChild(row);
        });
        
        // Append the table body to the table
        table.appendChild(tbody);
        
        // Replace the existing content with the new table
        personnelTable.innerHTML = "";
        personnelTable.appendChild(table);
    }
    
    $(".loading-spinner").show();

    // Fetch data from the API and populate the table
    fetch(`${baseUrl}/personnel`)
        .then(response => response.json())
        .then(result => {
            populatePersonnelTable(result.data.personnel);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            $(".loading-spinner").hide();
        });
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
    console.log("person department id:", personDepartmentId);
    console.log("selectElement:", selectElement);
    $.get("http://localhost:3000/api/departments", function(data) {
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
    .fail(function(error) {
        console.error("Erro ao obter a lista de departamentos:", error);
    });
}


// Chama a função para preencher os <select> dos modais quando eles forem abertos
$(document).ready(function() {


    $("#addPersonnelModal").on("show.bs.modal", function () {
        var addPersonnelDepartmentSelect = $("#addPersonnelDepartment");
        addPersonnelDepartmentSelect.empty(); // Limpa as opções antes de preencher
        populateDepartmentsSelect(addPersonnelDepartmentSelect);
    });
});


// Edit personnel modal

$("#editPersonnelModal").on("show.bs.modal", function (e) {
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

$(document).ready(function() {
    // When the "SAVE" button is clicked
    $("#saveBtn").click(function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Get the values from the modal inputs
        var id = $("#editPersonnelEmployeeID").val();
        var lastName = $("#editPersonnelLastName").val();
        var firstName = $("#editPersonnelFirstName").val();
        var jobTitle = $("#editPersonnelJobTitle").val();
        var email = $("#editPersonnelEmailAddress").val();
        
        // Get the selected option's data-departmentid attribute
        var selectedDepartmentOption = $("#editPersonnelDepartment option:selected");
        var departmentID = selectedDepartmentOption.data("departmentid");

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
            success: function(response) {
                // Handle the successful response
                console.log("Data updated successfully:", response);
                // Close the modal
                $("#editPersonnelModal").modal("hide");
                // Show success message using Bootstrap's "alert" component
                var successAlert = $('<div class="alert alert-success" role="alert">Record saved successfully.</div>');
                $("#editPersonnelModal .modal-content").prepend(successAlert);
                setTimeout(function() {
                    successAlert.remove(); // Remove the success message after 2 seconds
                }, 2000);
                // Update the table (you will need to implement this part)
                // updateTable();
            },
            error: function(error) {
                // Handle the error, if needed
                console.error("Error updating data:", error);
            }
        });
    });
    
});
