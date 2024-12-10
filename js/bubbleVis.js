/* * * * * * * * * * * * * *
*         BubbleVis        *
* * * * * * * * * * * * * */

class BubbleVis {

    // constructor method to initialize BubbleVis object
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
        vis.width = document.getElementById(vis.parentElement).clientWidth;
        vis.height = document.getElementById(vis.parentElement).clientHeight;
        vis.margin = 100; // to avoid clipping the root circle stroke

        // Specify the number format for values.
        vis.format = d3.format(",d");

        // Create a categorical color scale for regions.
        vis.color = d3.scaleOrdinal()
            .domain(Object.keys(vis.regions))
            .range(d3.schemeTableau10);

        // Create the pack layout with increased padding for spacing out the bubbles.
        vis.pack = d3.pack()
            .size([vis.width - vis.margin * 2, vis.height - vis.margin * 2])
            .padding(20); // Increase padding to space out the bubbles

        // Create a scale for the circle radii
        vis.radiusScale = d3.scaleSqrt()
            .domain([d3.min(vis.data, d => +d.fertility_rate), d3.max(vis.data, d => +d.fertility_rate)])
            .range([10, 100]);

        // Select the parent container
        vis.svg = d3.select(`#${vis.parentElement}`)
            .attr("width", vis.width)
            .attr("height", vis.height);

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

        // Filter the data to include only the 2022 fertility_rate for each state
        vis.filteredData = vis.data.filter(d => +d.Year === 2022).map(d => ({
            id: d.State,
            name: d.StateName, // Assuming StateName is the full name of the state
            value: +d.fertility_rate,
            region: vis.getRegion(d.State)
        }));

        // Compute the hierarchy from the (flat) data; expose the values
        // for each node; lastly apply the pack layout.
        vis.root = vis.pack(d3.hierarchy({children: vis.filteredData})
            .sum(d => d.value));

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

        // Center the group element within the SVG
        const centerX = (vis.width - vis.margin * 2) / 2;
        const centerY = (vis.height - vis.margin * 2) / 2;

        // Create a scale to space out the x positions
        const xScale = d3.scaleLinear()
            .domain([0, vis.width - vis.margin * 2])
            .range([-vis.width / 2, vis.width * 1.5]);

        // Place each (leaf) node according to the layout’s x and y values.
        vis.node = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin},${vis.margin})`)
            .selectAll("g")
            .data(vis.root.leaves())
            .join("g")
            .attr("transform", d => `translate(${xScale(d.x)},${d.y})`);
        console.log("VIS", vis.node);

        // Add a title.
        vis.node.append("title")
            .text(d => `${d.data.name}\n${vis.format(d.value)}`);

        // Add a filled circle.
        vis.node.append("circle")
            .attr("fill-opacity", 0.7)
            .attr("fill", d => vis.color(d.data.region))
            .attr("r", d => vis.radiusScale(d.data.value)); // Use the radius scale based on fertility rate

        // Add the full state name inside the bubble.
        vis.node.append("text")
            .attr("dy", "0.3em")
            .style("font-size", "15px")
            .attr("text-anchor", "middle")
            .text(d => d.data.id);

        // Add hover functionality
        vis.node.on("mouseover", function(event, d) {
            // Make other bubbles more transparent
            vis.node.selectAll("circle").attr("fill-opacity", 0.3);
            vis.node.selectAll("text").style("display", "none");

            // Show value and state name of the hovered bubble
            d3.select(this).select("circle")
                .attr("fill-opacity", 1)
                .attr("fill", "orange") // Change color to orange
                .transition().duration(200)
                .attr("r", vis.radiusScale(d.data.value) * 1.2); // Increase the size of the bubble

            d3.select(this).select("text")
                .style("display", "block")
                .style("font-size", "30px")
                .text(`${d.data.id}: ${vis.format(d.value)}`);
        })
            .on("mouseout", function (event, d) {
                // Reset opacity of all bubbles
                vis.node.selectAll("circle").attr("fill-opacity", 0.7);
                vis.node.selectAll("text").style("display", "block");

                // Reset text to full state name
                d3.select(this).select("text")
                    .style("font-size", "15px")
                    .text(d => d.data.id);

                // Reset the size and color of the bubble
                d3.select(this).select("circle")
                    .attr("fill", d => vis.color(d.data.region)) // Reset color to original
                    .transition().duration(200)
                    .attr("r", vis.radiusScale(d.data.value));
            });

        // Add legend
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.margin},${vis.height/2})`); // Position at the bottom

        const legendData = Object.keys(vis.regions);

        legend.selectAll("rect")
            .data(legendData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 60) // Increase spacing between legend items
            .attr("width", 50) // Increase width of legend rectangles
            .attr("height", 50) // Increase height of legend rectangles
            .style("fill", d => vis.color(d));

        legend.selectAll("text")
            .data(legendData)
            .enter().append("text")
            .attr("x", 60) // Adjust x position to match increased rectangle size
            .attr("y", (d, i) => i * 60 + 25) // Adjust y position to match increased rectangle size
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("font-size", "30px") // Increase font size
            .text(d => d);
    }
}
