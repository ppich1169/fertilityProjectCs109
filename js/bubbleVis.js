/* * * * * * * * * * * * * *
*         BubbleVis        *
* * * * * * * * * * * * * */

class BubbleVis {

    // constructor method to initialize BubbleVis object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        console.log(this);

        // Initialize the visualization
        this.initVis();
    }

    // Initialize the visualization
    initVis() {
        let vis = this;

        // Specify the dimensions of the chart.
        vis.width = 928;
        vis.height = vis.width;
        vis.margin = 1; // to avoid clipping the root circle stroke

        // Specify the number format for values.
        vis.format = d3.format(",d");

        // Create a categorical color scale.
        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        // Create the pack layout with increased padding for spacing out the bubbles.
        vis.pack = d3.pack()
            .size([vis.width - vis.margin * 2, vis.height - vis.margin * 2])
            .padding(30); // Increase padding to space out the bubbles

        // Create a scale for the circle radii
        vis.radiusScale = d3.scaleSqrt()
            .domain([d3.min(vis.data, d => +d.fertility_rate), d3.max(vis.data, d => +d.fertility_rate)])
            .range([0, vis.width / 8]);

        // Select the parent container
        vis.svg = d3.select(`#${vis.parentElement}`);

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
            value: +d.fertility_rate
        }));

        // Compute the hierarchy from the (flat) data; expose the values
        // for each node; lastly apply the pack layout.
        vis.root = vis.pack(d3.hierarchy({children: vis.filteredData})
            .sum(d => d.value));

        // Update the visualization
        vis.updateVis();
    }

    // Update the visualization
    updateVis() {
        let vis = this;

        // Place each (leaf) node according to the layout’s x and y values.
        vis.node = vis.svg.append("g")
            .selectAll("g")
            .data(vis.root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Add a title.
        vis.node.append("title")
            .text(d => `${d.data.id}\n${vis.format(d.value)}`);

        // Add a filled circle.
        vis.node.append("circle")
            .attr("fill-opacity", 0.7)
            .attr("fill", d => vis.color(d.data.id))
            .attr("r", d => vis.radiusScale(d.value));

        // Add the state abbreviation inside the bubble.
        vis.node.append("text")
            .attr("dy", "0.3em")
            .attr("text-anchor", "middle")
            .text(d => d.data.id);

        // Add hover functionality
        vis.node.on("mouseover", function(event, d) {
                // Make other bubbles more transparent
                vis.node.selectAll("circle").attr("fill-opacity", 0.3);

                console.log(d)
                // Show value and state name of the hovered bubble
                d3.select(this).select("circle").attr("fill-opacity", 1);
                d3.select(this).select("text")
                    .style("display", "block")
                    .text(`${d.data.id}: ${vis.format(d.value)}`);
            })
            .on("mouseout", function(event, d) {
                // Reset opacity of all bubbles
                vis.node.selectAll("circle").attr("fill-opacity", 0.7);

                // Reset text to state abbreviation
                d3.select(this).select("text")
                    .text(d => d.data.id);
            });
    }
}