const displayData = (jsonData) => {
    const data = jsonData.slice(jsonData.length - 5);

    const dataHtml = data
        .map((item) => {
            return `
            <div>
                <div class="uk-card uk-card-small uk-card-hover">
                    <div class="uk-card-body">
                        <h3 class="uk-card-title">${item[0]}</h3>
                        <h5 class="">
                            ${item[1]}
                        </h5>
                        <p class="uk-text-meta">
                            ${item[2]}
                        </p>
                    </div>
                    <div class="uk-card-footer">
                        <a
                            href="${item[3]}"
                            class="uk-button uk-button-text uk-text-primary"
                            ><span class="uk-margin-small-right" uk-icon="link"></span>${item[4]}</a
                        >
                    </div>
                </div>
            </div>
            `;
        })
        .join("");

    document.getElementById("data").innerHTML = dataHtml;
};

let publicationsPath = "./data/publications.xlsx";
async function readFile(path) {
    try {
        // Load the XLSX file using fetch
        const response = await fetch(path);
        const data = await response.arrayBuffer();

        // Parse the XLSX file
        const workbook = XLSX.read(data, { type: "arraybuffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils
            .sheet_to_row_object_array(worksheet, { header: 1 })
            .slice(1);

        displayData(jsonData);
    } catch (error) {
        console.error(error);
    }
}

readFile(publicationsPath);
