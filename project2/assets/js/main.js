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
            <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
            <td>${person.jobTitle}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
            <td style="display: none;">${person.departmentID}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
            <td class="text-end text-nowrap">
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-personnel-id="${person.id}" data-department-id="${person.departmentID}">
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
        .then(data => {
            populateDepartmentsTable(data);
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
        .then(data => {
            populateLocationsTable(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            $(".loading-spinner").hide();
        });
});

// Edit personnel modal

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    var button = $(e.relatedTarget);
    var personnelId = button.data("personnel-id");
    var departmentId = button.data("department-id");

    // Faz uma requisição GET ao endpoint com o ID do pessoal
    $.get("http://localhost:3000/api/personnel/" + personnelId, function (data) {
        var personnel = data.data.personnel;
        console.log(personnel);

        // Preenche os campos do modal com as informações obtidas
        $("#editPersonnelEmployeeID").val(personnel.id);
        $("#editPersonnelFirstName").val(personnel.firstName);
        $("#editPersonnelLastName").val(personnel.lastName);
        $("#editPersonnelJobTitle").val(personnel.jobTitle);
        $("#editPersonnelEmailAddress").val(personnel.email);
        
        // Define o valor selecionado no <select> como a foreign key do departamento
        $("#editPersonnelDepartment").val(departmentId);

        // Atualiza o campo de seleção do departamento (caso necessário)
        // Exemplo: $("#editPersonnelDepartment").val(personnel.departmentId);
    });
});



// Populate select options for departments
function populateDepartmentsSelect(selectElement) {
    $.get("http://localhost:3000/api/departments", function(data) {
        var departments = data.data.departments;

        // Preenche o <select> com as opções de departamento
        for (var i = 0; i < departments.length; i++) {
            var option = $("<option>");
            option.val(departments[i].locationID); // Define o value como locationID
            option.text(departments[i].name); // Define o texto da opção como o nome do departamento
            option.attr("data-departmentID", departments[i].departmentID); // Atributo de dados para departmentID
            selectElement.append(option);
        }
    })
    .fail(function(error) {
        console.error("Erro ao obter a lista de departamentos:", error);
    });
}


// Chama a função para preencher os <select> dos modais quando eles forem abertos
$(document).ready(function() {
    $("#editPersonnelModal").on("show.bs.modal", function () {
        var editPersonnelDepartmentSelect = $("#editPersonnelDepartment");
        editPersonnelDepartmentSelect.empty(); // Limpa as opções antes de preencher
        populateDepartmentsSelect(editPersonnelDepartmentSelect);
    });

    $("#addPersonnelModal").on("show.bs.modal", function () {
        var addPersonnelDepartmentSelect = $("#addPersonnelDepartment");
        addPersonnelDepartmentSelect.empty(); // Limpa as opções antes de preencher
        populateDepartmentsSelect(addPersonnelDepartmentSelect);
    });
});


// Executes when the form button with type="submit" is clicked

$("#editPersonnelForm").on("submit", function (e) {
    // stop the default browser behviour

    e.preventDefault();

    // AJAX call to save form data

});
