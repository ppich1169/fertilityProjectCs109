// init global variables & switches
let myMapVis;
let myBubbleVis;
let myScatterVis;
let myRadarVis;
let selectedCategory = document.getElementById('categorySelector').value;
let selectedYear = document.getElementById('yearSlider').value;

function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    myMapVis.selectedCategory = selectedCategory;
    myMapVis.wrangleData(); // Update the map visualization
}

function scatterCategoryChange() {
    const selectedCategory = document.getElementById("scatterCategorySelector").value;
    // Update the scatter chart based on the selected category
    myScatterVis.updateCategory(selectedCategory);
}

function yearChange() {
    selectedYear = document.getElementById('yearSlider').value;
    document.getElementById('yearValue').textContent = selectedYear;
    myMapVis.selectedYear = selectedYear;
    myMapVis.wrangleData(); // Update the map visualization
}

// load data using promises
let promises = [
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to fit your browser window
    d3.csv("combined_dfs/combined_2018_to_2022.csv"),
    d3.csv("data/top_5_variables_per_region.csv") // Load the top 5 variables per region
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

    // init map
    console.log('this is what data[0] looks like', dataArray[0])
    console.log('this is what data[1] looks like', dataArray[1][0])
    myMapVis = new MapVis('chart-area1', dataArray[1], dataArray[0]);

    // init bubble chart
    console.log('this is what bubble chart data looks like', dataArray[1])
    myBubbleVis = new BubbleVis('chart-area2', dataArray[1]);

    // init scatter chart
    console.log('this is what scatter chart data looks like', dataArray[1])
    myScatterVis = new ScatterVis('chart-area3', dataArray[1]);

    // init radar chart
    console.log('this is what top 5 variables per region data looks like', dataArray[2])
    myRadarVis = new RadarVis('chart-area4', dataArray[2]); // Assuming 'chart-area4' is the container for the radar chart
}

// Event listeners for category changes
d3.select("#categorySelector").on("change", function() {
    selectedCategory = d3.select(this).property("value");
    myMapVis.selectedCategory = selectedCategory;
    myMapVis.wrangleData();
});

// Event listeners for year changes
d3.select("#yearSlider").on("input", function() {
    selectedYear = d3.select(this).property("value");
    d3.select("#yearValue").text(selectedYear);
    myMapVis.selectedYear = selectedYear;
    myMapVis.wrangleData();
});