const searchInput = document.getElementById("publications-search");

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
        console.log("Child ", container.children.length);
        if (container.children.length === 0)
            container.appendChild(paginationButtonContainer);
        else {
            container.replaceChild(
                paginationButtonContainer,
                container.lastChild
            );
        }
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
            return `
            <div>
                <div class="uk-card uk-card-default ">
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

const search = (jsonData, query) => {
    if (query === "") return jsonData;

    const filteredData = jsonData.filter((item) => {
        const values = Object.values(item);
        for (let i = 0; i < values.length; i++) {
            const str = String(values[i]).toLowerCase();
            if (str.includes(query.toLowerCase())) {
                return true;
            }
        }
        return false;
    });

    return filteredData;
};

let publicationsPath = "../data/publications.xlsx";
async function readFile(path, query = "") {
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
        const filteredData = search(jsonData, query);

        // console.log(filteredData);

        // jsonData.forEach((item) => console.log(item));
        const itemsPerPage = 5;
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);

        const paginationButtons = new PaginationButton(
            totalPages,
            5,
            1,
            itemsPerPage,
            filteredData
        );

        paginationButtons.render(document.querySelector(".pagination"));

        paginationButtons.onChange((e) => {
            console.log("-- changed", e.target.value);

            displayData(e.target.value, itemsPerPage, filteredData);
        });
    } catch (error) {
        console.error(error);
    }
}

readFile(publicationsPath);

searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    console.log(searchTerm);
    if (searchTerm !== "") {
        readFile(publicationsPath, searchTerm);
    } else {
        readFile(publicationsPath);
    }
});
