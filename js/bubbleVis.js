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
            .padding(10); // Increase padding to space out the bubbles

        // Create a scale for the circle radii
        vis.radiusScale = d3.scaleSqrt()
            .domain([d3.min(vis.data, d => +d.fertility_rate), d3.max(vis.data, d => +d.fertility_rate)])
            .range([10, vis.width / 8]);

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

        // Place each (leaf) node according to the layout’s x and y values.
        vis.node = vis.svg.append("g")
            .selectAll("g")
            .data(vis.root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

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
                d3.select(this).select("circle").attr("fill-opacity", 1)
                    .transition().duration(200)
                    .attr("r", vis.radiusScale(d.data.value) * 1.2); // Increase the size of the bubble

                d3.select(this).select("text")
                    .style("display", "block")
                    .style("font-size", "30px")
                    .text(`${d.data.id}: ${vis.format(d.value)}`);
            })
            .on("mouseout", function(event, d) {
                // Reset opacity of all bubbles
                vis.node.selectAll("circle").attr("fill-opacity", 0.7);
                vis.node.selectAll("text").style("display", "block");

                // Reset text to full state name
                d3.select(this).select("text")
                    .style("font-size", "15px")
                    .text(d => d.data.id);

                // Reset the size of the bubble
                d3.select(this).select("circle")
                    .transition().duration(200)
                    .attr("r", vis.radiusScale(d.data.value));
            });
    }
}