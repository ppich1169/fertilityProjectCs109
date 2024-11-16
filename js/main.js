// SVG drawing area

let margin = {top: 40, right: 10, bottom: 60, left: 60};

let width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Scales
let x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

let y = d3.scaleLinear()
    .range([height, 0]);

// Initialize data
loadData();

// Create a 'data' property under the window object
// to store the coffee chain data
Object.defineProperty(window, 'data', {
    // data getter
    get: function() { return _data; },
    // data setter
    set: function(value) {
        _data = value;
        // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
        updateVisualization()
    }
});

// Load CSV file
function loadData() {
    d3.csv("data/coffee-house-chains.csv").then(csv => {

        csv.forEach(function(d){
            d.revenue = +d.revenue;
            d.stores = +d.stores;
        });

        // Store csv data in global variable
        data = csv;

        // updateVisualization gets automatically called within the data = csv call;
        // basically(whenever the data is set to a value using = operator);
        // see the definition above: Object.defineProperty(window, 'data', { ...
    });
}

// Listen to select box change event
d3.select("#ranking-type").on("change", updateVisualization);

// Render visualization
function updateVisualization() {
    // Get the selected option
    let selectedOption = d3.select("#ranking-type").property("value");

    // Sort data based on the selected option
    data.sort((a, b) => b[selectedOption] - a[selectedOption]);

    // Update the scales
    x.domain(data.map(d => d.company));
    y.domain([0, d3.max(data, d => d[selectedOption])]);

    // Select all bars and bind data
    let bars = svg.selectAll(".bar")
        .data(data, d => d.company);

    // Enter new bars
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.company))
        .attr("y", height) // Start from the bottom of the chart
        .attr("width", x.bandwidth())
        .attr("height", 0) // Start with height 0
        .attr("fill", "steelblue")
        .transition()
        .duration(1000)
        .attr("y", d => y(d[selectedOption]))
        .attr("height", d => height - y(d[selectedOption]));

    // Update existing bars
    bars.transition()
        .duration(1000)
        .attr("x", d => x(d.company))
        .attr("y", d => y(d[selectedOption]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[selectedOption]));

    // Remove old bars
    bars.exit()
        .transition()
        .duration(1000)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    // Append x-axis
    svg.selectAll(".x-axis").remove();
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .transition()
        .duration(1000);

    // Append y-axis
    svg.selectAll(".y-axis").remove();
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .transition()
        .duration(1000);
}