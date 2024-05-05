const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;
// групировка по месяцам, группировка по кварталам, группировка по годам
// выбирать максимальный, минимальный, средний
// фильтры по времени
// многоуровневая сортировка (тогда надо отбрасывать дроби)

function drawGraph(form, animate = false) {
    if (!globalData || globalData.length === 0) {
        alert("Нужно выбрать файл");
        return;
    }
    d3.select("svg").selectAll("*").remove();

    let svg = d3.select("svg")
        .attr("width", width + marginX * 2)
        .attr("height", height + marginY * 2)
        .append("g")
        .attr("transform", `translate(${marginX}, ${marginY})`);

    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    const selectedProducts = Array.from(form.querySelectorAll('input[name="productSelect"]:checked')).map(checkbox => checkbox.value);
    const groupSelect = form.groupSelect.value;
    const selectedMarker = form.priceSelectedMarker.value;
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;

    // Получение сгруппированных данных
    const aggregatedData = groupAndFilterAndSelectValues(
        selectedProducts, groupSelect, selectedMarker, startDate, endDate
    );

    graphData = [];
    aggregatedData.forEach(item => {
        Object.keys(item.prices).forEach(product => {
            graphData.push({
                date: new Date(item.date), // Преобразование строки даты в объект Date
                name: product,
                value: item.prices[product]
            });
        });
    });

    const scaleX = d3.scaleTime()
        .domain(d3.extent(graphData, d => d.date))
        .range([0, width]);

    const scaleY = d3.scaleLinear()
        .domain([0, d3.max(graphData, d => d.value)])
        .range([height, 0]);

    let axisX = d3.axisBottom(scaleX);
    let axisY = d3.axisLeft(scaleY);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(axisX);

    svg.append("g")
        .call(axisY);

    // Отрисовка линий для каждого продукта
    selectedProducts.forEach((product, i) => {
        const lineData = graphData.filter(d => d.name === product);
        const line = d3.line()
            .x(d => scaleX(d.date))
            .y(d => scaleY(d.value));

        const path = svg.append("path")
            .datum(lineData)
            .attr("fill", "none")
            .attr("stroke", colors(i))
            .attr("stroke-width", 1.5)
            .attr("d", line);

        if (animate) {
            const totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", -totalLength)
                .transition()
                .duration(5000)
                .attr("stroke-dashoffset", 0);
        }
    });

    // Создание легенды
    const legend = svg.selectAll(".legend")
        .data(selectedProducts)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 100}, ${20 + i * 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d, i) => colors(i));

    legend.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
}


d3.select("#showTable").on('click', function () {
    const table = d3.select("div.table").select("table");
    const isTableFilled = !table.select("tbody").selectAll("tr").empty();

    if (isTableFilled) {
        table.select("thead").selectAll("*").remove();
        table.select("tbody").selectAll("*").remove();
        d3.select(this).text("Показать таблицу");
    } else {
        if (!globalData || globalData.length === 0) {
            alert("Нужно выбрать файл");
            return;
        }
        d3.select(this).text("Скрыть таблицу");

        const selectedProducts = Array.from(document.querySelectorAll('input[name="productSelect"]:checked')).map(checkbox => checkbox.value);
        const groupSelect = document.querySelector('input[name="groupSelect"]:checked').value;
        const selectedMarker = document.querySelector('input[name="priceSelectedMarker"]:checked').value;
        const startDate = document.querySelector('input[name="startDate"]').value;
        const endDate = document.querySelector('input[name="endDate"]').value;

        let aggregatedData = groupAndFilterAndSelectValues(
            selectedProducts, groupSelect, selectedMarker, startDate, endDate
        );

        const headers = ["Дата", "Имя продукта", "Цена"];
        const headerRow = table.select("thead").append("tr")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
            .text(d => d)
            .on("click", function (event, header) {
                const sortAscending = !d3.select(this).classed("asc");
                d3.selectAll("th").classed("asc desc", false);
                d3.select(this).classed(sortAscending ? "asc" : "desc", true);

                const key = header.toLowerCase();
                const rows = table.select("tbody").selectAll("tr");
                rows.sort((a, b) => {
                    if (key === "дата") {
                        return sortAscending ? d3.ascending(parseDateWithDots(a.date), parseDateWithDots(b.date)) :
                            d3.descending(parseDateWithDots(a.date), parseDateWithDots(b.date));
                    } else if (key === "цена") {
                        return sortAscending ? d3.ascending(parseFloat(a.value), parseFloat(b.value)) :
                            d3.descending(parseFloat(a.value), parseFloat(b.value));
                    } else {
                        return sortAscending ? d3.ascending(a.name, b.name) : d3.descending(a.name, b.name);
                    }
                });
            });

        updateTable();  // Первоначальное заполнение таблицы

        function updateTable() {
            const rowData = aggregatedData.flatMap(item =>
                Object.keys(item.prices).map(product => ({
                    date: new Date(item.date).toLocaleDateString(),
                    name: product,
                    value: item.prices[product]
                }))
            );

            const rows = table.select("tbody").selectAll("tr")
                .data(rowData, d => d.date + d.name)
                .enter()
                .append("tr");

            rows.selectAll("td")
                .data(d => [d.date, d.name, d.value])
                .enter()
                .append("td")
                .text(d => d);
        }
    }
});

function parseDateWithDots(dateStr) {
    const parts = dateStr.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}




function parseDateDDMMYYYY(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}



function groupAndFilterAndSelectValues(selectedProducts, groupMethod, selectedMarker, startDate, endDate) {
    const filteredDataByProducts = globalData.map(dayInfo => {
        const prices = Object.keys(dayInfo.prices)
            .filter(product => selectedProducts.includes(product))
            .reduce((acc, product) => {
                acc[product] = dayInfo.prices[product];
                return acc;
            }, {});

        return { ...dayInfo, prices };
    }).filter(dayInfo => Object.keys(dayInfo.prices).length > 0);


    let filteredDataByDate = [];

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        filteredDataByDate = filteredDataByProducts.filter(dayInfo => {
            const day = parseDateDDMMYYYY(dayInfo.day);
            return day >= start && day <= end;
        });
    } else {
        filteredDataByDate = filteredDataByProducts;
    }

    const groupedData = d3.groups(
        filteredDataByDate,
        dayInfo => {
            const date = parseDateDDMMYYYY(dayInfo.day);
            switch (groupMethod) {
                case 'week': return d3.timeWeek.floor(date);
                case 'month': return d3.timeMonth.floor(date);
                case 'year': return d3.timeYear.floor(date);
                default: return date;
            }
        }
    );

    const aggregatedData = groupedData.map(([key, values]) => {
        let prices = {};
        selectedProducts.forEach(product => {
            let productPrices = values.map(v => v.prices[product]).filter(p => p !== null);
            let value;
            switch (selectedMarker) {
                case 'min': value = d3.min(productPrices); break;
                case 'mean': value = d3.mean(productPrices); break;
                case 'max': value = d3.max(productPrices); break;
            }
            if (value !== undefined && value !== null) {
                prices[product] = value;
            }
        });

        return { date: key, prices };
    });


    return aggregatedData;
}



