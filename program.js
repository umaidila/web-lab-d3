const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;
// let svg = d3.select("svg")
//     .attr("height", height)
//     .attr("width", width);




function drawGraph(form) {
    const marginX = 50;
    const marginY = 50;
    const height = 400;
    const width = 800;
    let svg = d3.select("svg")
    .attr("height", height)
    .attr("width", width);
    console.log("drawGraph");
    // Извлекаем информацию о выбранных параметрах для оси X и Y

    const isPriceSelected = form.ox.value === "Цена";  // Проверяем, выбрана ли цена или объем
    const oyValues = Array.from(form.querySelectorAll('input[name="oy"]:checked')).map(checkbox => checkbox.value);
    

    // Фильтруем данные для графика
    const formattedData = globalData
    .filter(item => oyValues.includes(item.name))
    .flatMap(item => 
        item.infoArray.map(info => ({
            date: d3.timeParse("%d-%m-%Y")(info.day),
            name: item.name,
            value: isPriceSelected ? info.price : info.volume
        }))
    );  // Фильтруем по выбранным категориям

    // Очищаем предыдущий график
    // svg.selectAll('*').remove();

    let range = d3.extent(formattedData, d => d.value);
    let min = range[0];
    let max = range[1];


            // функция интерполяции значений на оси
    let scaleX = d3.scaleBand()
                .domain(d3.extent(formattedData, d => d.day))
                .range([0, width - 2 * marginX]);
    let scaleY = d3.scaleLinear()
                .domain([min * 0.85, max * 1.1 ])
                .range([height - 2 * marginY, 0]);
    // создание осей
    let axisX = d3.axisBottom(scaleX); // горизонтальная
    let axisY = d3.axisLeft(scaleY); // вертикальная


    // отрисовка осей в SVG-элементе
    svg.append("g")
    .attr("transform", `translate(${marginX}, ${height - marginY})`)
        .call(axisX)
        .selectAll("text") // подписи на оси - наклонные
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", d => "rotate(-45)");
    svg.append("g")
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .call(axisY);
    // Создание шкалы X и Y
    const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value)])
        .range([height, 0]);

    // Добавление оси X
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Добавление оси Y
    svg.append("g")
        .call(d3.axisLeft(y));

    // Отрисовка линий для каждого выбранного типа данных
    oyValues.forEach(key => {
        const lineData = formattedData.filter(d => d.name === key);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value));

        svg.append("path")
            .datum(lineData)
            .attr("fill", "none")
            .attr("stroke", isPriceSelected ? "steelblue" : "red")  // Цвет линии зависит от выбранной категории
            .attr("stroke-width", 1.5)
            .attr("d", line);
    });
}
    
