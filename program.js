const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;



function drawGraph(form, animate = False) {
    if (!globalData || globalData.length === 0) {
        alert("Нужно выбрать файл");
        return;
    }
    d3.select("svg").selectAll("*").remove();

    let svg = d3.select("svg")
            .attr("width", width + marginX * 2)  
            .attr("height", height + marginY * 2) 
        .append("g") // g - graph
        .attr("transform", `translate(${marginX},${marginY})`);


    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    const isPriceSelected = form.ox.value === "Цена";  
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
    ); 


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


  oyValues.forEach((key, i) => {
      const lineData = formattedData.filter(d => d.name === key);
      console.log("color = ", colors(i));
      const line = d3.line()
          .x(d => scaleX(d.date))
          .y(d => scaleY(d.value));  

      const path =svg.append("path")
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

d3.select("#showTable").on('click', function() {
    if (!globalData || globalData.length === 0) {
        alert("Нужно выбрать файл");
        return;
    }
    // создание таблицы
    const table = d3.select("div.table")
        .select("table")
    const isTableVisible = table.style("display") !== "none";
    const buttonText = isTableVisible ? "Показать таблицу" : "Скрыть таблицу";
    d3.select(this).text(buttonText); 
    table.style("display", isTableVisible ? "none" : "block"); // переключаем видимость


    if (!isTableVisible) {

        const isPriceSelected = d3.select('input[name="ox"]:checked').node().value === "Цена";

        const selectedOyValues = Array.from(document.querySelectorAll('input[name="oy"]:checked')).map(d => d.value);
        const headers = ["Дата"].concat(selectedOyValues);


        table.select("thead").selectAll("*").remove();
        table.select("tbody").selectAll("*").remove();

        table.select("thead").append("tr")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
            .text(d => d);


        const tableData = globalData.flatMap(item => 
            item.infoArray.map(info => ({
                date: info.day,
                name: item.name,
                value: isPriceSelected ? info.price : info.volume
            }))
        );

        const groupedData = d3.groups(tableData, d => d.date);

        const rows = table.select("tbody").selectAll("tr")
            .data(groupedData)
            .enter()
            .append("tr")
            .each(function(d) {
                d3.select(this).append("td").text(d[0]); // дата
                d[1].forEach(val => {
                    d3.select(this).append("td").text(val.value);
                });
            });
    }
});
