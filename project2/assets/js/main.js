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

// Assuming you want to make the API request to the same domain.
const baseUrl = ''; // Change this to the base URL of your API if needed

document.addEventListener("DOMContentLoaded", function () {
    const personnelTable = document.getElementById("personnelTable");

    // Function to populate the personnel table with data
    function populatePersonnelTable(data) {
        personnelTable.innerHTML = ""; // Clear the existing content

        // Loop through the data and create rows for the table
        data.forEach(person => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${person.lastName}</td>
                <td>${person.firstName}</td>
                <td>${person.jobTitle}</td>
                <td>${person.email}</td>
                <td>${person.department}</td>
                <td>${person.location}</td>
            `;
            personnelTable.appendChild(row);
        });
    }

    // Fetch data from the API and populate the table
    fetch(`${baseUrl}/backend/app/controllers/PersonnelController.php`)
        .then(response => response.json())
        .then(data => {
            populatePersonnelTable(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
});


$("#editPersonnelModal").on("show.bs.modal", function (e) {

    $.ajax({
        url:
            "https://coding.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $(e.relatedTarget).attr("data-id") // Retrieves the data-id attribute from the calling button
        },
        success: function (result) {
            var resultCode = result.status.code;

            if (resultCode == 200) {
                // Update the hidden input with the employee id so that
                // it can be referenced when the form is submitted

                $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

                $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
                $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
                $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
                $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

                $("#editPersonnelDepartment").html("");

                $.each(result.data.department, function () {
                    $("#editPersonnelDepartment").append(
                        $("<option>", {
                            value: this.id,
                            text: this.name
                        })
                    );
                });

                $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);

            } else {
                $("#editPersonnelModal .modal-title").replaceWith(
                    "Error retrieving data"
                );
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#editPersonnelModal .modal-title").replaceWith(
                "Error retrieving data"
            );
        }
    });
});

// Executes when the form button with type="submit" is clicked

$("#editPersonnelForm").on("submit", function (e) {
    // stop the default browser behviour

    e.preventDefault();

    // AJAX call to save form data

});
