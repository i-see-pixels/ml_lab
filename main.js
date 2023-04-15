let publicationsPath = "./data/publications.xlsx";

(async () => {
    let workbook = XLSX.read(
        await (await fetch(publicationsPath)).arrayBuffer()
    );
    console.log(workbook);
})();
