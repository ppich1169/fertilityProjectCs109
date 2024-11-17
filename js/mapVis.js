/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    // constructor method to initialize MapVis object
    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.data = data;
        this.geoData = geoData;
        this.selectedYear = document.getElementById('yearSlider').value;
        this.selectedCategory = 'fertility_rate'; // Default category

        // Group data by year
        this.dataByYear = {};
        data.forEach(d => {
            const year = +d.Year;
            if (!this.dataByYear[year]) {
                this.dataByYear[year] = [];
            }
            this.dataByYear[year].push({
                year: year,
                state: d.State,
                fertility_rate: +d.fertility_rate,
                covid_year: +d.covid_year,
                religousness_rate: +d.religousness_rate,
                percent_white: +d.percent_white,
                percent_black: +d.percent_black,
                percent_hispanic: +d.percent_hispanic,
                percent_asian: +d.percent_asian,
                percent_mixed_race: +d.percent_mixed_race,
                poverty_measure: +d.poverty_measure,
                foreign_born: +d.foreign_born,
                percent_bachelors_or_higher: +d.percent_bachelors_or_higher,
                percent_less_than_high_school: +d.percent_less_than_high_school,
                percent_high_school_or_some_college: +d.percent_high_school_or_some_college,
                political_ranking: +d.political_ranking,
                latest_abortion: +d.latest_abortion,
                no_abortion_law: +d.no_abortion_law
            });
        });

        console.log("dataByYear", this.dataByYear[2018][0]);

        // Initialize the visualization
        this.initVis();
    }

    // Initialize the visualization
    initVis() {
        let vis = this;

        // Set up margin conventions
        vis.margin = { top: 50, right: 20, bottom: 20, left: 100 };
        vis.width = document.getElementById(vis.parentElement).clientWidth - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).clientHeight - vis.margin.top - vis.margin.bottom;

        // Create SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Add title
        vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text('State Data Visualization')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip')
            .style("opacity", 0)
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px");

        // Set up path generator
        vis.path = d3.geoPath();

        // Define projection
        vis.projection = d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2])
            .scale(1000);

        // Create a group for the map and apply scaling and translation
        vis.mapGroup = vis.svg.append("g")
            .attr("class", "map-group")
            .attr("transform", `scale(0.6) translate(${vis.width * 0.1}, ${vis.height * 0.1})`);

        // Draw the map
        vis.states = vis.mapGroup.selectAll(".state")
            .data(topojson.feature(vis.geoData, vis.geoData.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", vis.path)
            .style("fill", "lightgray")
            .style("stroke", "white")
            .style("stroke-width", "1px");

        // Initialize color scale
        vis.colorScale = d3.scaleSequential(d3.interpolateBlues);

        // Create legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width-100}, ${vis.height/2-100})`);

        vis.legend.append("rect")
            .attr("width", 20)
            .attr("height", 200)
            .style("fill", "url(#gradient)");

        vis.legend.append("text")
            .attr("x", 25)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text("Legend");

        vis.svg.append("defs").append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data([
                { offset: "0%", color: "white" },
                { offset: "100%", color: "blue" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        vis.legendScale = d3.scaleLinear()
            .range([200, 0]);

        vis.legendAxis = d3.axisRight(vis.legendScale)
            .ticks(5);

        vis.legend.append("g")
            .attr("class", "legend-axis")
            .attr("transform", "translate(20, 0)")
            .call(vis.legendAxis);

        // Wrangle data
        vis.wrangleData();
    }

    // Process the data
    wrangleData() {
        let vis = this;

        // Filter data based on the selected year
        vis.filteredData = vis.dataByYear[vis.selectedYear] || [];

        // Update the visualization
        vis.updateVis();
    }

    // Update the visualization
    updateVis() {
        let vis = this;

        // Define color scale domain
        vis.colorScale.domain(d3.extent(vis.filteredData, d => d[vis.selectedCategory]));

        // Update the legend scale domain
        vis.legendScale.domain(d3.extent(vis.filteredData, d => d[vis.selectedCategory]));

        // Update the legend axis
        vis.legend.select(".legend-axis")
            .call(vis.legendAxis);

        // Update the states with the new color scale
        vis.states
            .style("fill", d => {
                const stateData = vis.filteredData.find(data => data.state === d.properties.name);
                return stateData ? vis.colorScale(stateData[vis.selectedCategory]) : '#bababa';
            })
            .on("mouseover", function(event, d) {
                const stateData = vis.filteredData.find(data => data.state === d.properties.name);
                if (stateData) {
                    console.log(stateData); // Print state information to the console
                    vis.tooltip.transition().duration(200).style("opacity", .9);
                    vis.tooltip.html(`${stateData.state}: ${stateData[vis.selectedCategory]}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mousemove", function(event) {
                vis.tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                vis.tooltip.transition().duration(500).style("opacity", 0);
            });
    }
}