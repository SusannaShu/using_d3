const getData = async () => {
  const response = await fetch('http://api.worldbank.org/v2/country/all/indicator/SP.DYN.TFRT.IN?format=json&source=14');
  const data = await response.json();
  return data[1]; // The actual data is in the second element of the array
}

getData().then(data => {
  const filteredData = data.filter(d => d.country.value === 'Africa Eastern and Southern');
  const years = filteredData.map(d => d.date);
  const values = filteredData.map(d => d.value);

  const svgWidth = 600;
  const svgHeight = 400;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3.select('body').append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(values)])
    .range([height, 0]);

  svg.selectAll('.bar')
    .data(values)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d, i) => x(years[i]))
    .attr('y', d => y(d))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d))
    .attr('fill', 'steelblue')
    .on('mouseover', function(event, d) {
      d3.select(this).transition().duration(200)
        .attr('fill', 'orange');
    })
    .on('mouseout', function(event, d) {
      d3.select(this).transition().duration(200)
        .attr('fill', 'steelblue');
    });

  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickValues(years.filter((d, i) => !(i % 5)))); // Show every 5th year for clarity

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(y));

  // Add labels
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .attr('text-anchor', 'middle')
    .text('Year');

  svg.append('text')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 20)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Fertility Rate (births per woman)');
}); 