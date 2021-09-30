let month = "", year = "", token = "", resultObject = JSON, internNamesHolder = [], internTIDHolder = [], projectDetails = [], divflag = 0;


// *********************************** Functions to work with API ***************************************//
function APIGenerate() {    //Generate cURL request content
    month = document.getElementById("month").value;
    year = document.getElementById("year").value;
    token = document.getElementById("notion_token").value;

    let cURL = `curl -X POST 'https://api.notion.com/v1/databases/f3343825482b44d8a802c53bc2a0e2ab/query' \
    -H 'Authorization: Bearer '${token}'' \
    -H 'Notion-Version: 2021-08-16' \
    -H "Content-Type: application/json" \
        --data '{
          "filter": {
                "property": "Month",
                        "select": {
                            "equals": "${month} ${year}"
                        }
            }
    }'`;
    console.log(cURL);
    document.getElementById("cURL").value = cURL;
    console.log("MMYY: " + month + year);
}

function APICleanup() { //cleans up the API by removing blank spaces from Key values
    console.log("API CLeanup called");
    let result = document.getElementById("apiResult").value;
    result = result.replaceAll("Client Name", "ClientName");
    result = result.replaceAll("Fee (INR)", "Fee");
    result = result.replaceAll("Assigned To", "AssignedTo");

    resultObject = JSON.parse(result);
    internNames(resultObject);

    resultObject.results.forEach(function (data) {
        for (let i = 0; i < projectDetails.length; ++i) {
            if (data.properties.AssignedTo.select.name == projectDetails[i][0]) {
                let obj = {};
                obj["Project"] = data.properties.ClientName.title[0].text.content;
                obj["Fee"] = data.properties.Fee.number;
                projectDetails[i].push(obj);
                break;
            }
        }
    })

    // resultObject.results.forEach(function (data) {
    //     data.properties.ClientName.title[0].text.content = data.properties.ClientName.title[0].text.content.replaceAll(",", "_");
    //     // console.log(data.properties.ClientName.title[0].text.content);
    // })

    const initForm = document.querySelector(".input-form");
    initForm.parentNode.removeChild(initForm);
    document.querySelector(".details-display").style.display = "";

}


// ********************************* Miscellaneous Functions ***********************************//
function internNames(data) {   //create an array of intern names from the API response

    data.results.forEach(function (objectData) {
        let flag = 1;
        let val = objectData.properties.AssignedTo.select.name;
        for (let i = 0; i < internNamesHolder.length; ++i) {
            if (val === internNamesHolder[i]) {
                flag = 0;
                break;
            }
        }
        if (flag)
            internNamesHolder.push(val);
    })
    //adds the intern names as the first element of the Project Details array
    for (let i = 0; i < internNamesHolder.length; ++i) {
        console.log("Intern names called");
        projectDetails[i] = [internNamesHolder[i]];
    }
}

function divSwap(num) {     // A function to swap which of the divs is enabled (fee details or stub)
    if (num === 1) {
        document.querySelector(".stub-box-print").style.display = "none";
        document.querySelector(".fee-details-box-print").style.display = "";
        document.querySelector(".tids").style.display = "none";
    }
    else if (num === 2) {
        document.querySelector(".stub-box-print").style.display = "none";
        document.querySelector(".fee-details-box-print").style.display = "none";
        document.querySelector(".tids").style.display = "";
        downloadButtonState("Clear");
    } else if (num === 3) {
        document.querySelector(".stub-box-print").style.display = "";
        document.querySelector(".fee-details-box-print").style.display = "none";
        document.querySelector(".tids").style.display = "none";
    }

}

function todayDate() {  //return a string of current date in DD/MM/YYYY Format
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    return (today);
}

function getTransactionIDs() {  //Display fields to enter payment transaction IDs and input the values
    divSwap(2);
    let container = "<p>Enter the Transaction numbers and bonus (optional) of the interns whose stubs should be generated</p><table id='TID-table'><thead class='TID-header'><tr><th>Intern Name</th><th>Transaction #</th> <th>Bonus</th></tr></thead><tbody>";
    for (let i = 0; i < internNamesHolder.length; ++i) {
        container += `<tr><td class="TID-intern-name">${internNamesHolder[i]}:</td><td><input type="number" id="intern-TID-${i}" max="999999999999999999"></td><td><input type="number" id="intern-Bonus-${i}"></td></tr>`;
    }
    container += '</tbody></table><button id="intern-TID-Submit">Submit</button>';
    document.querySelector(".tids").innerHTML = container;
    document.querySelector(".tids").style.display = "";

    document.querySelector("#intern-TID-Submit").addEventListener("click", function () {
        let nullctr = 0;
        for (let i = 0; i < internNamesHolder.length; ++i) {
            internTIDHolder[i] = [document.querySelector(`#intern-TID-${i}`).value, document.querySelector(`#intern-Bonus-${i}`).value];
            console.log("TID value of " + i + " " + internTIDHolder[i]);
            if (internTIDHolder[i][0] == 0)
                nullctr++;
        }
        if (nullctr == internTIDHolder.length) {
            alert("Enter at least 1 ID, you bitch!");
            getTransactionIDs();
        } else {
            console.log("length of TID holder: " + internTIDHolder.length);
            document.querySelector(".tids").style.display = "none";
            console.log("pass");
            internStubDetails();
        }
    });
}

function feeDetailsDownload() {  //Function to download the Fee-Details tables as PNG files
    console.log(document.querySelector("#fd-download").name);
    switch (document.querySelector("#fd-download").name) {

        case "FD":
            console.log("FD triggered");
            for (let i = 0; i < internNamesHolder.length; ++i) {
                console.log("Downloading: " + i);
                var node = document.querySelector(`#table-display-print-${i}`);
                domtoimage.toBlob(node).then(function (blob) {
                    saveAs(blob, `${internNamesHolder[i]}-Fee-Details-${month}-${year}.png`);
                });
            }
            break;
        case "PS":
            console.log("PS triggered");
            for (let i = 0; i < internNamesHolder.length; ++i) {
                console.log("Downloading: " + i);
                var node = document.querySelector(`#stub-display-print-${i}`);
                domtoimage.toBlob(node).then(function (blob) {
                    saveAs(blob, `${internNamesHolder[i]}-PayStub-${month}-${year}.png`);
                });
            }
            break;
        default:
            console.log("Neither");
    }
}

function downloadButtonState(value) {   //Alter the download button state and content
    let FDButton = document.querySelectorAll("#fd-download");
    FDButton.forEach(function (data) {
        switch (value) {
            case "Fee-Details":
                data.setAttribute("name", "FD");
                data.style.display = "";
                data.innerHTML = "Download Fee Details";
                break;
            case "Stub":
                data.setAttribute("name", "PS");
                data.style.display = "";
                data.innerHTML = "Download Stubs";
                break;
            case "Clear":
                data.style.display = "none";
                break;
            default:
                console.log("downloadButtonState -> unknown input parameter");

        }

    });
}

//******************************** Fee details and Stub Functions *******************************//
function internProjectDetails() { //Prepare intern fee details
    divSwap(1);
    let tableContainer = "";
    console.log("Proj details: " + projectDetails);
    for (let i = 0; i < projectDetails.length; ++i) {
        tableContainer += feeDetailsGenerator(projectDetails[i], i);
    }
    document.getElementById(`table-display-print`).innerHTML = tableContainer;
    downloadButtonState("Fee-Details");
}

function internStubDetails() {  //Prepare intern stub details
    divSwap(3);
    let tableContainer = "";

    console.log("Proj details length: " + projectDetails[0].length)
    for (let i = 0; i < projectDetails.length; ++i) {
        if (internTIDHolder[i][0] === "") continue;
        console.log("Proj Details [i]: ", projectDetails[i]);
        tableContainer += stubGenerator(projectDetails[i], i);
    }
    document.getElementById(`stub-display-print`).innerHTML = tableContainer;
    downloadButtonState("Stub");
}

function feeDetailsGenerator(tableContent, num) {   //Generate table for displaying Fee Details
    // console.log(tableContent);
    console.log(month, year);
    let total = 0;
    let table = `<div class="table-div" id ="table-display-print-${num}"><table border = 1em class="fee-detail">`;
    tableContent.forEach(function (data) {
        console.log(typeof data);
        if (typeof data === "string") {
            console.log("Theader: " + data + " " + month + " " + year);
            // table += `<thead><tr><th>Name: ${data}</th><th>Details for: ${month} ${year}</th></tr><tr><th>Project Name</th><th  colspan=2>Fee</th></tr></thead>`;
            table += `
            <thead>
                <tr>
                    <th class="header-value">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name: ${data}</th>
                                    <th>Details for: ${month} ${year}</th>
                                </tr>
                                <tr>
                                    <th colspan=3 style="padding: 0;"><hr></th>
                                </tr>
                                <tr>
                                    <th>Project Name</th>
                                    <th colspan=1>Fee</th>
                                </tr>
                            </thead>
                        </table>
                    </th></tr></thead> <tbody><tr><td style="border: none;"><table class="fee-content">`
            // table += '<tr><th colspan=3 style="padding: 0;"><hr></th></tr>'
        } else {
            table += `<tr> <td class = "row-item">${data.Project}</td> <td  class = "row-value" colspan=1">${data.Fee}</td> </tr>`;
            total += parseInt(data.Fee);
        }
    })
    table += `<tr><td  colspan=3 class="value-last" style="text-align: center;"><b>Total:   Rs. ${total}</b></td></tr> </table></td></tr></tbody></table></div>`;
    return table;
}

function stubGenerator(tableContent, num) { //Generate table for displaying stubs
    let total = 0;
    console.log("total at start of iteration " + num + ": " + total);
    let stub = `<div class="stub-container-div" id ="stub-display-print-${num}">
    <table style="width: 100%;">
    <thead>
        <tr>
            <td style="width: 100px;">
                <img id="hophead-logo" src="Assets/Images/Logo.png" alt="logo-in-full-glory">
            </td>
            <td class="pay-stub-heading">
                PAY STUB
            </td>
            <td style="text-align: right; padding-right: 2em;">
                Date: ${todayDate()}
            </td>
        </tr>
        <tr>
            <td class="hh-details" colspan="2" style="vertical-align: top;">
                <h4>Hophead Media</h4>Building No: 109/3 <br> Poothole - Aranattukara Road <br> Thrissur | 680004 <br>
                <img id="email-icon" src="Assets/Images/email.png" alt="email-icon">business@hophead.in
            </td>
            <td class="payment-details">
                <h4>PAYMENT DETAILS: </h4>
                <table style="width:100%;">
                    <tr>
                        <td>Name:</td>
                        <td>${internNamesHolder[num]}</td>
                    </tr>
                    <tr>
                        <td>Mode of pay:</td>
                        <td>UPI</td>
                    </tr>
                    <tr>
                        <td>Transaction #:</td>
                        <td>${internTIDHolder[num][0]}</td>
                    </tr>
                    <tr>
                        <td>Payment for:</td>
                        <td>${month} ${year}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </thead>
    <tbody>
        <tr> <td colspan=3 style="padding: none;"> <hr> </td></tr>
        <tr>
            <td class= "stub-table-container" colspan="3">
                <table class="stub-fee-content">
                    <thead>
                        <tr>
                            <th>Project Name</th> <th>Fee</th>
                        </tr>
                    </thead>
                    <tbody>`;
    tableContent.forEach(function (data) {
        if (typeof data != "string") {
            // console.log(data);
            // console.log("not string");
            stub += `<tr><td class = "stub-row-item">${data.Project}</td> <td  class = "stub-row-value" colspan=1 style="text-align: center;">${data.Fee}</td> </tr>`;
            total += parseInt(data.Fee);
            // console.log("total at end of foEach loop 1" + num + ": " + total);
        }
    })
    if (internTIDHolder[num][1] != 0) {
        stub += `<tr><td class = "stub-row-item"><b>Bonus</td> <td  class = "stub-row-value" colspan=1 style="text-align: center;">${internTIDHolder[num][1]}</td> </tr>`
        total += parseInt(internTIDHolder[num][1]);
    }
    stub += `<tr><td></td><td class="stub-value-last" colspan="1">Total: Rs. ${total}</td></tr>`;
    stub += '<tr><td class="stub-footer" colspan="2">www.hophead.in</td></tr><tr><td colspan="2"><hr></td></tr>'
    stub += '</tbody></table></td></tr></tbody></table></div>';
    console.log("total at end of iteration " + num + ": " + total);
    return stub;
}

