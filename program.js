const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;



function drawGraph(form) {
    d3.select("svg").selectAll("*").remove();

    let svg = d3.select("svg")
            .attr("width", width + marginX * 2)  
            .attr("height", height + marginY * 2) 
        .append("g") // g - graph
        .attr("transform", `translate(${marginX},${marginY})`);

    // Извлекаем информацию о выбранных параметрах для оси X и Y

    const colors = d3.scaleOrdinal(d3.schemeCategory10);
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


     // Создание шкалы X и Y
    const scaleX = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width]);

    const scaleY = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value)])
        .range([height, 0]);

    let axisX = d3.axisBottom(scaleX); 
    let axisY = d3.axisLeft(scaleY); 


    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(axisX);

    svg.append("g")
        .call(axisY);

  // Отрисовка линий для каждого выбранного типа данных
  oyValues.forEach((key, i) => {
      const lineData = formattedData.filter(d => d.name === key);
      console.log("color = ", colors(i));
      const line = d3.line()
          .x(d => scaleX(d.date))
          .y(d => scaleY(d.value));  // Делает линии более гладкими

      svg.append("path")
          .datum(lineData)
          .attr("fill", "none")
          .attr("stroke", colors(i))
          .attr("stroke-width", 1.5)
          .attr("d", line);
  });

  const legend = svg.selectAll(".legend")
  .data(oyValues)
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", (d, i) => `translate(${width - marginX}, ${marginY + i * 20})`);

legend.append("rect")
    .attr("x", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", (d, i) => colors(i));

legend.append("text")
    .attr("x", -10)
    .attr("y", 5)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);

}