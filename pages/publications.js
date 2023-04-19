const pageNumbers = (total, max, current) => {
    const half = Math.floor(max / 2);
    let to = max;

    if (current + half >= total) {
        to = total;
    } else if (current > half) {
        to = current + half;
    }

    let from = Math.max(to - max, 0);

    return Array.from({ length: Math.min(total, max) }, (_, i) => i + 1 + from);
};

function PaginationButton(
    totalPages,
    maxPagesVisible = 10,
    currentPage = 1,
    itemsPerPage,
    jsonData
) {
    displayData(currentPage, itemsPerPage, jsonData);

    let pages = pageNumbers(totalPages, maxPagesVisible, currentPage);
    let currentPageBtn = null;
    const buttons = new Map();
    const disabled = {
        start: () => pages[0] === 1,
        prev: () => currentPage === 1 || currentPage > totalPages,
        end: () => pages.slice(-1)[0] === totalPages,
        next: () => currentPage >= totalPages,
    };
    const frag = document.createDocumentFragment();
    const paginationButtonContainer = document.createElement("div");
    paginationButtonContainer.className = "pagination-buttons";

    const createAndSetupButton = (
        label = "",
        cls = "",
        disabled = false,
        handleClick
    ) => {
        const buttonElement = document.createElement("button");
        buttonElement.textContent = label;
        buttonElement.className = `page-btn ${cls}`;
        buttonElement.disabled = disabled;
        buttonElement.addEventListener("click", (e) => {
            handleClick(e);
            this.update();
            paginationButtonContainer.value = currentPage;
            paginationButtonContainer.dispatchEvent(
                new CustomEvent("change", { detail: { currentPageBtn } })
            );
        });

        return buttonElement;
    };

    const onPageButtonClick = (e) =>
        (currentPage = Number(e.currentTarget.textContent));

    const onPageButtonUpdate = (index) => (btn) => {
        btn.textContent = pages[index];

        if (pages[index] === currentPage) {
            currentPageBtn.classList.remove("active");
            btn.classList.add("active");
            currentPageBtn = btn;
            currentPageBtn.focus();
        }
    };

    buttons.set(
        createAndSetupButton(
            "start",
            "start-page",
            disabled.start(),
            () => (currentPage = 1)
        ),
        (btn) => (btn.disabled = disabled.start())
    );

    buttons.set(
        createAndSetupButton(
            "prev",
            "prev-page",
            disabled.prev(),
            () => (currentPage -= 1)
        ),
        (btn) => (btn.disabled = disabled.prev())
    );

    pages.map((pageNumber, index) => {
        const isCurrentPage = currentPage === pageNumber;
        const button = createAndSetupButton(
            pageNumber,
            isCurrentPage ? "active" : "",
            false,
            onPageButtonClick
        );

        if (isCurrentPage) {
            currentPageBtn = button;
        }

        buttons.set(button, onPageButtonUpdate(index));
    });

    buttons.set(
        createAndSetupButton(
            "next",
            "next-page",
            disabled.next(),
            () => (currentPage += 1)
        ),
        (btn) => (btn.disabled = disabled.next())
    );

    buttons.set(
        createAndSetupButton(
            "end",
            "end-page",
            disabled.end(),
            () => (currentPage = totalPages)
        ),
        (btn) => (btn.disabled = disabled.end())
    );

    buttons.forEach((_, btn) => frag.appendChild(btn));
    paginationButtonContainer.appendChild(frag);

    this.render = (container = document.body) => {
        container.appendChild(paginationButtonContainer);
    };

    this.update = (newPageNumber = currentPage) => {
        currentPage = newPageNumber;
        pages = pageNumbers(totalPages, maxPagesVisible, currentPage);
        buttons.forEach((updateButton, btn) => updateButton(btn));
    };

    this.onChange = (handler) => {
        paginationButtonContainer.addEventListener("change", handler);
    };
}

const displayData = (pageNum, itemsPerPage, jsonData) => {
    const startIndex = (pageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const data = jsonData.slice(startIndex, endIndex);

    const dataHtml = data
        .map((item) => {
            return `<div>${item[0]} - ${item[1]}</div>`;
        })
        .join("");

    document.getElementById("data").innerHTML = dataHtml;
};

let publicationsPath = "../data/publications.xlsx";
async function readFile(path) {
    try {
        // Load the XLSX file using fetch
        const response = await fetch(path);
        const data = await response.arrayBuffer();

        // Parse the XLSX file
        const workbook = XLSX.read(data, { type: "arraybuffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        return jsonData;
    } catch (error) {
        console.error(error);
    }
}

readFile(publicationsPath).then((jsonData) => {
    console.log(jsonData);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(jsonData.length / itemsPerPage);
    // const currData = jsonData.slice(0, limitPerPage);

    const paginationButtons = new PaginationButton(
        totalPages,
        5,
        1,
        itemsPerPage,
        jsonData
    );

    paginationButtons.render(document.querySelector("#pagination"));

    paginationButtons.onChange((e) => {
        console.log("-- changed", e.target.value);

        displayData(e.target.value, itemsPerPage, jsonData);
    });
});
