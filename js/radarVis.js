/* * * * * * * * * * * * * *
*        RadarVis         *
* * * * * * * * * * * * * */

class RadarVis {

    // constructor method to initialize RadarVis object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    // Initialize the visualization
    initVis() {
        let vis = this;

        // Set up margin conventions
        vis.margin = { top: 50, right: 50, bottom: 50, left: 50 };
        vis.width = document.getElementById(vis.parentElement).clientWidth - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).clientHeight - vis.margin.top - vis.margin.bottom;
        vis.radius = Math.min(vis.width, vis.height) / 4; // Adjust radius to fit four charts

        // Create SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Create scales
        vis.angleScale = d3.scaleBand().range([0, 2 * Math.PI]);
        vis.radiusScale = d3.scaleLinear().range([0, vis.radius]);

        // Create a line generator for the radar chart
        vis.line = d3.lineRadial()
            .angle(d => vis.angleScale(d.axis))
            .radius(d => vis.radiusScale(d.value))
            .curve(d3.curveLinearClosed);

        // Wrangle data
        vis.wrangleData();
    }

    // Process the data
    wrangleData() {
        let vis = this;

        // Prepare data for radar chart
        vis.radarData = vis.data.map(d => {
            const variables = JSON.parse(d.Variables.replace(/'/g, '"'));
            const values = JSON.parse(d.Values);
            const units = d.Units ? JSON.parse(d.Units.replace(/'/g, '"')) : []; // Handle missing units
            return {
                region: d.Region,
                data: variables.map((variable, i) => ({
                    axis: variable,
                    value: values[i],
                    unit: units[i] || '' // Add unit to each data point, handle missing units
                }))
            };
        });

        console.log(vis.radarData);

        // Update the visualization
        vis.updateVis();
    }

    // Update the visualization
    updateVis() {
        let vis = this;

        // Define positions for the four quadrants
        const positions = [
            { x: vis.width / 4, y: vis.height / 4 },
            { x: 3 * vis.width / 4+50, y: vis.height / 4 },
            { x: vis.width / 4, y: 3 * vis.height / 4 +50},
            { x: 3 * vis.width / 4+50, y: 3 * vis.height / 4 +50}
        ];

        // Draw radar charts for each region
        vis.radarData.forEach((regionData, i) => {
            const pos = positions[i];

            const radarGroup = vis.svg.append("g")
                .attr("transform", `translate(${pos.x},${pos.y})`);

            // Define domains for each radar chart
            vis.angleScale.domain(regionData.data.map(d => d.axis));
            vis.radiusScale.domain([0, d3.max(regionData.data, d => d.value)]);

            radarGroup.append("text")
                .attr("x", 0)
                .attr("y", -vis.radius + vis.margin.top-60)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text(regionData.region);

            // Draw concentric circles
            const levels = 5;
            for (let level = 0; level <= levels; level++) {
                radarGroup.append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", vis.radius / levels * level)
                    .style("fill", "none")
                    .style("stroke", "grey")
                    .style("stroke-dasharray", "2,2");
            }

            // Draw axis lines
            radarGroup.selectAll(".axis-line")
                .data(regionData.data)
                .enter().append("line")
                .attr("class", "axis-line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", d => vis.radiusScale(d.value) * Math.cos(vis.angleScale(d.axis) - Math.PI / 2))
                .attr("y2", d => vis.radiusScale(d.value) * Math.sin(vis.angleScale(d.axis) - Math.PI / 2))
                .style("stroke", "grey")
                .style("stroke-width", "1px");

            // Draw radar chart background
            radarGroup.append("path")
                .datum(regionData.data)
                .attr("class", "radar-background")
                .attr("d", vis.line)
                .style("fill", "#D49999")
                .style("opacity", 0.5)
                .style("stroke", "none");

            // Draw radar chart
            radarGroup.append("path")
                .datum(regionData.data)
                .attr("class", "radar-area")
                .attr("d", vis.line)
                .style("fill", "none")
                .style("stroke", "#CC5500")
                .style("opacity", 1)
                .style("stroke-width", 2);

            // Add units to each data point
            radarGroup.selectAll(".unit-label")
                .data(regionData.data)
                .enter().append("text")
                .attr("class", "unit-label")
                .attr("x", d => vis.radiusScale(d.value) * Math.cos(vis.angleScale(d.axis) - Math.PI / 2))
                .attr("y", d => vis.radiusScale(d.value) * Math.sin(vis.angleScale(d.axis) - Math.PI / 2) * 1.5)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text(d => {
                    console.log(d); // Log the value of d
                    return `${d.axis} ${d.unit}`;
                });
        });
    }
}