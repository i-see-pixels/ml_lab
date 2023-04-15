let publicationsPath = "./data/publications.xlsx";
async function readFile() {
    try {
        // Load the XLSX file using fetch
        const response = await fetch(publicationsPath);
        const data = await response.arrayBuffer();

        // Parse the XLSX file
        const workbook = XLSX.read(data, { type: "arraybuffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // return jsonData;
        // console.log(jsonData[1][0]);

        // Display the data in a table
        const dataTable = document.getElementById("dataTable");
        dataTable.innerHTML = "";
        jsonData.forEach((row) => {
            const tr = document.createElement("tr");
            row.forEach((cell) => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            dataTable.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

readFile();
