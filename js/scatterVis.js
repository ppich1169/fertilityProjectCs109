/* * * * * * * * * * * * * *
*         ScatterVis       *
* * * * * * * * * * * * * */

class ScatterVis {

    // constructor method to initialize ScatterVis object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        console.log(this);

        // Define regions
        this.regions = {
            "Northeast": ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "Rhode Island", "Vermont", "New Jersey", "New York", "Pennsylvania"],
            "Midwest": ["Illinois", "Indiana", "Michigan", "Ohio", "Wisconsin", "Iowa", "Kansas", "Minnesota", "Missouri", "Nebraska", "North Dakota", "South Dakota"],
            "South": ["Delaware", "Florida", "Georgia", "Maryland", "North Carolina", "South Carolina", "Virginia", "District of Columbia", "West Virginia", "Alabama", "Kentucky", "Mississippi", "Tennessee", "Arkansas", "Louisiana", "Oklahoma", "Texas"],
            "West": ["Arizona", "Colorado", "Idaho", "Montana", "Nevada", "New Mexico", "Utah", "Wyoming", "Alaska", "California", "Hawaii", "Oregon", "Washington"]
        };

        // Initialize the visualization
        this.initVis();
    }

    // Initialize the visualization
    initVis() {
        let vis = this;

        // Specify the dimensions of the chart.
        vis.margin = {top: 100, right: 20, bottom: 50, left: 50};
        vis.width = document.getElementById(vis.parentElement).clientWidth - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).clientHeight - vis.margin.top - vis.margin.bottom;

        // Create SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Create scales
        vis.xScale = d3.scaleLinear().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        // Create axes
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append axes
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis");

        // Append axis labels
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Poverty Measure");

        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 20)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Fertility Rate");

        // Append title text
        vis.title = vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -vis.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Hover over a state:");

        // Create a categorical color scale for regions.
        vis.color = d3.scaleOrdinal()
            .domain(Object.keys(vis.regions))
            .range(d3.schemeTableau10);

        // Wrangle data
        vis.wrangleData();
    }

    // Process the data
    wrangleData() {
        let vis = this;

        // Ensure data is defined and accessible
        if (!vis.data) {
            console.error("Data is not defined or accessible.");
            return;
        }

        // Filter the data to include only the 2022 poverty_measure and fertility_rate for each state
        vis.filteredData = vis.data.filter(d => +d.Year === 2022).map(d => ({
            id: d.State,
            name: d.StateName, // Assuming StateName is the full name of the state
            poverty: +d.poverty_measure,
            fertility: +d.fertility_rate,
            region: vis.getRegion(d.State)
        }));

        // Update the visualization
        vis.updateVis();
    }

    // Get the region for a given state
    getRegion(state) {
        for (const [region, states] of Object.entries(this.regions)) {
            if (states.includes(state)) {
                return region;
            }
        }
        return "Unknown";
    }

    // Update the visualization
    updateVis() {
        let vis = this;

        // Update scales
        vis.xScale.domain([d3.min(vis.filteredData, d => d.poverty)-1, d3.max(vis.filteredData, d => d.poverty)]);
        vis.yScale.domain([d3.min(vis.filteredData, d => d.fertility)-5, d3.max(vis.filteredData, d => d.fertility)]);

        // Update axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        // Bind data to circles
        vis.circles = vis.svg.selectAll("circle")
            .data(vis.filteredData);

        // Enter new circles
        vis.circles.enter().append("circle")
            .attr("cx", d => vis.xScale(d.poverty))
            .attr("cy", d => vis.yScale(d.fertility))
            .attr("r", 10)
            .attr("fill", d => vis.color(d.region))
            .attr("fill-opacity", 0.7)
            .on("mouseover", function(event, d) {
                console.log(d); // Print the data object
                d3.select(this).attr("r", 12).attr("fill-opacity", 1);
                vis.title.text(d.id); // Change the title to the state name
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("r", 10).attr("fill-opacity", 0.7);
                vis.title.text("Hover over a circle to see which state:"); // Reset the title
            });

        // Update existing circles
        vis.circles
            .attr("cx", d => vis.xScale(d.poverty))
            .attr("cy", d => vis.yScale(d.fertility))
            .attr("r", 10)
            .attr("fill", d => vis.color(d.region))
            .attr("fill-opacity", 0.7);

        // Remove old circles
        vis.circles.exit().remove();
    }

    // Update category
    updateCategory(category) {
        let vis = this;

        // Update the x-axis label
        vis.svg.select(".x-axis-label").text(category.replace(/_/g, " "));

        // Update the filtered data based on the selected category
        vis.filteredData = vis.data.filter(d => +d.Year === 2022).map(d => ({
            id: d.State,
            name: d.StateName, // Assuming StateName is the full name of the state
            xValue: +d[category],
            fertility: +d.fertility_rate,
            region: vis.getRegion(d.State)
        }));

        // Update scales
        vis.xScale.domain([d3.min(vis.filteredData, d => d.xValue)*0.8, d3.max(vis.filteredData, d => d.xValue)]);
        vis.yScale.domain([d3.min(vis.filteredData, d => d.fertility)-5, d3.max(vis.filteredData, d => d.fertility)]);

        // Update axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        // Bind data to circles
        vis.circles = vis.svg.selectAll("circle")
            .data(vis.filteredData);

        // Enter new circles
        vis.circles.enter().append("circle")
            .attr("cx", d => vis.xScale(d.xValue))
            .attr("cy", d => vis.yScale(d.fertility))
            .attr("r", 10)
            .attr("fill", d => vis.color(d.region))
            .attr("fill-opacity", 0.7)
            .on("mouseover", function(event, d) {
                console.log(d.id); // Print the data object
                d3.select(this).attr("r", 10).attr("fill-opacity", 1);
                vis.title.text(d.id); // Change the title to the state name
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("r", 5).attr("fill-opacity", 0.7);
                vis.title.text("State Chosen"); // Reset the title
            });

        // Update existing circles
        vis.circles
            .attr("cx", d => vis.xScale(d.xValue))
            .attr("cy", d => vis.yScale(d.fertility))
            .attr("r", 10)
            .attr("fill", d => vis.color(d.region))
            .attr("fill-opacity", 0.7);

        // Remove old circles
        vis.circles.exit().remove();
    }
}