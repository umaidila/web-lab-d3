const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;
let svg = d3.select("svg")
    .attr("height", height)
    .attr("width", width);




    function drawGraph(form) {
        console.log("drawGraph");
        // Извлекаем информацию о выбранных параметрах для оси X и Y

        const isPriceSelected = form.ox.value === "Цена";  // Проверяем, выбрана ли цена или объем
        const oyValues = Array.from(form.querySelectorAll('input[name="oy"]:checked')).map(checkbox => checkbox.value);
        
        // Предполагаем, что globalData уже загружен и содержит необходимые данные
        // Форматируем данные для графика
        const formattedData = globalData.flatMap(item => 
            item.infoArray.map(info => ({
                date: d3.timeParse("%d-%m-%Y")(info.day),
                name: item.name,
                value: isPriceSelected ? info.price : info.volume
            }))
        ).filter(d => oyValues.includes(d.name));  // Фильтруем по выбранным категориям
    
        // Очищаем предыдущий график
        svg.selectAll('*').remove();
    
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
    
