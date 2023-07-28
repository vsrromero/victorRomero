async function getPersonnel() {
    console.log('getPersonnel() called');
    const response = await fetch('src/personnel.php');
    const data = await response.json();
    console.log(data)

    return data;
}

// Event listener para o botão de pesquisa
$("#searchInput").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("table tbody tr").filter(function () {
        var rowText = $(this).text().toLowerCase();
        $(this).toggle(matches);
    });
});

// Event listener para o dropdown de departamento
$("#personnelDepartment").on("change", function () {
    var selectedDepartment = $(this).val();
    if (selectedDepartment === "") {
        // If no department is selected, show all table rows
        $("table tbody tr").show();
    } else {
        // Otherwise, filter the rows based on the selected department
        $("table tbody tr").each(function () {
            var department = $(this).find("td:nth-child(4)").text();
            $(this).toggle(department === selectedDepartment);
        });
    }
});

// Event listener para o dropdown de location
$("#personnelLocation").on("change", function () {
    var selectedDepartment = $(this).val();
    if (selectedDepartment === "") {
        // If no location is selected, show all table rows
        $("table tbody tr").show();
    } else {
        // Otherwise, filter the rows based on the selected location
        $("table tbody tr").each(function () {
            var department = $(this).find("td:nth-child(5)").text();
            $(this).toggle(department === selectedDepartment);
        });
    }
});

$("#personnel-tab").on("click", async function () {
    const response = await getPersonnel();
    const data = response.data;
    console.log('data from personnel: ', data);
    renderPersonnelTable(data);
});

//! End Event listener to nav tables


//! Event listener to dropdowns
$("#department").on("change", function () {
    var selectedDepartment = $(this).val();
    if (selectedDepartment === "") {
        // If no department is selected, show all table rows
        $("table tbody tr").show();
    } else {
        // Otherwise, filter the rows based on the selected department
        $("table tbody tr").each(function () {
            var department = $(this).find("td:nth-child(1)").text();
            $(this).toggle(department === selectedDepartment);
        });
    }
});

//! End Event listener to dropdowns


$(document).ready(function () {
    // Add event listener to the button with the class 'btn-primary'
    $(".btn-primary").click(function () {
        // Retrieve the modal ID from the data-target attribute
        var modalId = $(this).data("target");
        // Show the modal using the modal ID
        $(modalId).modal("show");
    });
});

//! Tables
function renderPersonnelTable(data) {
    console.log('renderPersonnelTable() called');
    console.log('data from renderPersonnelTable: ', data[0]);
    var tbody = $('#personnelTable');

    tbody.empty();

    data[0].forEach(function (item) {
        var row = $('<tr>');
        console.log('item: ', item.firstName);
        row.append($('<td>').text(item.firstName));
        row.append($('<td>').text(item.lastName));
        row.append($('<td>').text(item.jobTitle));
        row.append($('<td>').text(item.department));
        row.append($('<td>').text(item.location));
        row.append($('<td>').text(item.email));
        row.append($('<td class="text-center">').append($('<a href="#" id="' + item.id + '">').html('<i class="icon fa-solid fa-trash"></i>')));
        row.append($('<td class="text-center">').append($('<a href="#">').html('<i class="icon fa-solid fa-pen"></i>')));

        tbody.append(row);
    });
}

function renderDepartmentTable(data) {
    console.log('renderDepartmentTable() called');
    console.log('data from renderDepartmentTable: ', data[0]);
    var tbody = $('#departmentTable');

    tbody.empty();

    data[0].forEach(function (item) {
        var row = $('<tr>');
        console.log('item: ', item.firstName);
        row.append($('<td>').text(item.firstName));
        row.append($('<td>').text(item.lastName));

        tbody.append(row);
    });
}

//! End Tables

// on window load
window.addEventListener('load', async () => {
    console.log('window loaded');
    const response = await getPersonnel();
    const data = response.data;
    console.log('data from load: ', data);
    renderPersonnelTable(data);
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    
    let id = $(e.relatedTarget).attr("data-id");
    console.log('id: ', id);
});