// init global variables & switches
let myMapVis;
let myBubbleVis;
let myScatterVis;
let myRadarVis;
let selectedCategory = document.getElementById('categorySelector').value;
let selectedYear = document.getElementById('yearSlider').value;


let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
}

function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    myMapVis.selectedCategory = selectedCategory;
    myMapVis.wrangleData(); // Update the map visualization
}

function scatterCategoryChange() {
    const selectedCategory = document.getElementById("scatterCategorySelector").value;
    // Update the scatter chart based on the selected category
    myScatterVis.updateCategory(selectedCategory);
    updateScatterDescription(selectedCategory);
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
    updateBubbleDescription(selectedCategory);
});

// Event listeners for year changes
d3.select("#yearSlider").on("input", function() {
    selectedYear = d3.select(this).property("value");
    d3.select("#yearValue").text(selectedYear);
    myMapVis.selectedYear = selectedYear;
    myMapVis.wrangleData();
});

function updateBubbleDescription(selectedCategory) {
    if(selectedCategory === "fertility_rate") {
        d3.select("#bubble-description")
            .html("The fertility rate measures the average number of children a woman is expected to have in her lifetime based on current age-specific fertility rates. It is calculated by summing the number of births per 1,000 women in each age group (usually 15-44) and dividing by 1,000. The fertility rate is an important indicator of population growth and demographic trends. A high fertility rate indicates a growing population, while a low fertility rate indicates a shrinking population. <br> <br> Southern and Midwestern states, marked by darker shades, exhibit the highest fertility rates, reflecting family-centric cultures, younger populations, and fewer barriers to having children. States like North Dakota, Nebraska, and Alaska particularly stand out, likely influenced by rural lifestyles and larger family norms. In contrast, Western and Northeastern states, with lighter shades, have lower fertility rates, often tied to urbanization, higher living costs, and delayed family formation.");
    } else if(selectedCategory === "religousness_rate"){
        d3.select("#bubble-description")
            .html("This map illustrates the religiousness rate across the United States, with varying shades of orange representing different levels of religiosity. Darker shades indicate states with higher religiousness rates, while lighter shades represent states with lower rates. <br> <br> The southeastern region, commonly referred to as the 'Bible Belt,' stands out with its darker hues, reflecting the strong religious presence and high church attendance typical of states like Mississippi, Alabama, and Louisiana. <br> <br> In contrast, states in the western and northeastern parts of the country, such as Colorado, Oregon, Vermont, and Massachusetts, are depicted in lighter shades, signifying lower levels of religiousness and a more secular population. <br> <br> The Midwest and parts of the central U.S. exhibit moderate rates, as indicated by the medium orange tones. ");
    } else if(selectedCategory === "percent_white"){
        d3.select("#bubble-description").html("States in the Midwest and Mountain West regions, such as North Dakota, Montana, and Wyoming, are often known for having the highest percentages of white populations, which likely correspond to the darker shading on the map. <br><br> Conversely, states in the South, Southwest, and coastal areas, such as California, Texas, and New York, tend to have more diverse populations, reflected by the lighter shading. Nationwide, according to the 2020 U.S. Census, approximately 57.8% of the total population identifies as 'White alone, not Hispanic or Latino.'");
    } else if(selectedCategory === "percent_black"){
        d3.select("#bubble-description").html("States in the southeastern region of the United States, such as Mississippi, Alabama, Georgia, and South Carolina, are historically known for having the highest concentrations of Black populations, which correspond to the darkest shades on this map. <br><br> Conversely, states in the western and northern regions, such as Montana, Idaho, and Wyoming, have significantly smaller Black populations, reflected by the lightest shades. Nationally, the U.S. Census reports that approximately 13.6% of the population identifies as Black or African American alone or in combination with another race.");
    } else if(selectedCategory === "percent_hispanic"){
        d3.select("#bubble-description").html(" States in the southwestern region, such as Texas, New Mexico, Arizona, and California, are known for having the highest concentrations of Hispanic populations, which align with the darkest shades on this map. This is largely attributed to their proximity to Latin America and long-standing Hispanic cultural influences in the region. <br> <br> In contrast, states in the northern and central parts of the country, such as North Dakota, South Dakota, and Vermont, have smaller Hispanic populations, reflected by the lighter shades. Nationwide, according to the U.S. Census, approximately 18.9% of the population identifies as Hispanic or Latino, making it the largest ethnic minority group in the United States. ");
    } else if(selectedCategory === "percent_asian"){
        d3.select("#bubble-description").html("States such as Hawaii and California, known for their significant Asian populations due to historical migration and cultural ties to Asia, are shown with the darkest shades on this map. <br><br> Other states with relatively high Asian populations, such as Washington and New York, also display darker tones. In contrast, states in the central and southern regions, such as Montana and Mississippi, are characterized by lighter shades, reflecting lower percentages of Asian residents.");
    } else if(selectedCategory === "percent_mixed_race"){
        d3.select("#bubble-description").html("States such as Hawaii and Alaska, known for their diverse populations and significant mixed-race communities due to historical and geographic factors, are shown with the darkest shading. Oklahoma also stands out on this map, likely due to its unique demographic history, including a significant number of individuals with mixed Native American heritage. <br><br> In contrast, states in the central and northeastern regions, such as North Dakota and Maine, are characterized by lighter shading, indicating lower percentages of mixed-race individuals. Nationally, the U.S. Census reports that about 10.2% of the population identifies as being of two or more races.");
    } else if(selectedCategory === "poverty_measure"){
        d3.select("#bubble-description").html("States in the South, such as Mississippi, Louisiana, and Arkansas, are shown with the darkest shading, reflecting historically high poverty rates in these areas due to economic and structural challenges. Similarly, states like New Mexico and West Virginia also display significant poverty levels, aligning with their longstanding economic struggles. <br><br> In contrast, states in the Northeast, Midwest, and parts of the West, such as New Hampshire, Minnesota, and Utah, are characterized by lighter shading, representing relatively lower poverty rates. According to the most recent data from the U.S. Census Bureau, the national poverty rate is approximately 11.4%, but it varies significantly by state and region due to differences in income levels, employment opportunities, and access to social services. This map visually highlights the stark regional disparities in poverty levels across the United States.");
    } else if(selectedCategory === "foreign_born"){
        d3.select("#bubble-description").html("States like California, New York, Florida, and Texas stand out with the darkest shading, reflecting their long history as major destinations for immigrants and their significant foreign-born populations. These states host large urban centers that serve as hubs for employment and cultural communities, attracting immigrants from around the world. <br><br> In contrast, states in the Midwest and parts of the South, such as North Dakota, West Virginia, and Mississippi, have much lighter shading, signifying lower percentages of foreign-born residents. Nationwide, as of recent data from the U.S. Census Bureau, approximately 13.5% of the total U.S. population is foreign-born, though this figure varies considerably by state. <br><br> This map vividly illustrates the concentration of immigrant communities in specific states, particularly along the coasts and in states with strong economic and cultural ties to immigrant populations.");
    } else if(selectedCategory === "percent_bachelors_or_higher"){
        d3.select("#bubble-description").html("States in the Northeast, such as Massachusetts and Connecticut, as well as states with major urban centers and strong education systems, such as Maryland and Virginia, show the darkest shading. These regions are known for their high concentrations of highly educated populations, likely influenced by the presence of prestigious universities, research institutions, and knowledge-based industries. <br><br> In contrast, states in the South and parts of the Midwest, such as Mississippi and Arkansas, have lighter shading, reflecting lower percentages of residents with a bachelor's degree or higher. Nationwide, according to the U.S. Census Bureau, approximately 37.9% of adults aged 25 and older hold a bachelor's degree or higher.");
    } else if(selectedCategory === "percent_less_than_high_school"){
        d3.select("#bubble-description").html("States in the South, such as Texas, Mississippi, and Arkansas, as well as parts of the Southwest, show the darkest shading, reflecting the highest percentages of individuals who have not completed high school. These regions often face challenges such as higher poverty rates, limited access to quality education, and economic disparities, which contribute to lower educational attainment. <br><br> In contrast, states in the Northeast and Midwest, such as Massachusetts, Minnesota, and Vermont, display the lightest shading, signifying lower percentages of residents with less than a high school education. These states generally benefit from stronger public education systems and more access to educational resources. Nationwide, according to U.S. Census data, approximately 10% of adults aged 25 and older have not completed high school, though this figure varies widely by state. ");
    } else if(selectedCategory === "percent_high_school_or_some_college"){
        d3.select("#bubble-description").html("States in the South and Southwest, such as Nevada, New Mexico, and Texas, as well as parts of the Midwest, such as Oklahoma, exhibit darker shading. This reflects regions where a significant portion of the population has completed high school or attended some college but may not have obtained a bachelor's degree or higher. <br> <br> In contrast, states in the Northeast and some in the upper Midwest, such as Massachusetts and Vermont, display lighter shading, likely reflecting a more evenly distributed educational attainment spectrum, with higher proportions of individuals holding bachelor's degrees or higher rather than stopping at high school or some college.");
    } else if(selectedCategory === "political_ranking"){
        d3.select("#bubble-description").html("States like California, Texas, and New York are among the darkest, reflecting their strong political significance or partisan leanings. California and New York are well-known Democratic strongholds, while Texas has historically been a Republican bastion. These states play pivotal roles in national elections due to their size, population, and influence on the political landscape. <br><br> In contrast, lighter-shaded states in the Midwest and Mountain West, such as Wyoming or the Dakotas, may reflect less population influence or more moderate political engagement compared to larger, more populous states. Regionally, the Northeast and West Coast are predominantly Democratic, while the South and Mountain West tend to lean Republican. However, shifting dynamics in states like Arizona and Georgia signal evolving political landscapes in recent years. ");
    }  else if(selectedCategory === "latest_abortion"){
        d3.select("#bubble-description").html(" States in the South and Midwest, such as Texas, Arkansas, and North Dakota, are shaded the darkest, which corresponds to their recent trends of enacting restrictive abortion laws, particularly following the overturning of Roe v. Wade. These states often have fewer abortion providers and greater legal hurdles for those seeking services.<br><br> In contrast, states on the West Coast, such as California, Oregon, and Washington, as well as in the Northeast, such as New York and Massachusetts, exhibit lighter shades. These states are known for maintaining more permissive abortion laws and providing broader access to reproductive healthcare. Many of these states have become destinations for individuals seeking abortion care from neighboring regions with stricter regulations.");
    }  else if(selectedCategory === "no_abortion_law"){
        d3.select("#bubble-description").html("States such as California, New York, and others in the Northeast and the West Coast are marked with darker shading, reflecting their well-established and protective abortion laws, which often ensure broad access and codify reproductive rights into state law. <br><br> In contrast, states with lighter or no shading, particularly in parts of the South and Midwest, may have minimal or no abortion laws currently in effect. This could reflect a lack of protective legislation following the overturning of Roe v. Wade, leaving the legal status of abortion largely undefined or restricted by default through older statutes or trigger bans. <br> <br> This map highlights the division in abortion legislation across the United States, where some states have proactively codified access to abortion, while others have chosen to leave it unregulated or rely on restrictive measures.");
    } else {
        d3.select("#bubble-description").text("The second visualization is a map of the US that shows the poverty rates for each state in the US for the year 2020. The color of the state represents the poverty rate, with darker colors indicating higher poverty rates. The map also includes a slider that allows the user to select a different year to view the poverty rates for that year.");
    }
}

function updateScatterDescription(selectedCategory) {
    if(selectedCategory === "religousness_rate") {
        d3.select("#scatter-description")
            .html("In the Northeast, states generally exhibit lower fertility rates regardless of their religiousness, likely influenced by factors such as urbanization, economic conditions, and cultural norms that prioritize smaller family sizes. The Midwest shows moderate fertility and religiousness rates, with states clustering toward the middle of the spectrum, reflecting a balance between traditional family values and socioeconomic conditions. <br> <br> The South stands out with a noticeable positive correlation, where higher religiousness rates strongly align with higher fertility rates, emphasizing the cultural and social significance of religion and family in the region. Meanwhile, the West demonstrates greater variation, with some states showing higher fertility rates despite lower religiousness, potentially due to immigration and cultural diversity. Overall, while the South displays the strongest link between religiousness and fertility, other regions appear to be influenced by a broader range of factors.");
    } else if(selectedCategory === "percent_white"){
        d3.select("#scatter-description").html("In the Northeast, states generally cluster toward the lower end of the fertility rate spectrum, regardless of the percentage of white population, suggesting that factors such as urbanization and socioeconomic conditions likely play a more dominant role in shaping fertility rates in this region. The Midwest displays a more dispersed pattern, with fertility rates spanning a wide range but often corresponding to moderate percentages of white population, reflecting the region’s demographic diversity. <br><br> The South demonstrates relatively higher fertility rates across a broad range of white population percentages, hinting at the influence of cultural, economic, and social factors that encourage larger family sizes. Meanwhile, the West shows significant variability, with some states having lower fertility rates despite a higher percentage of white population, potentially due to the region's ethnic diversity and unique socio-cultural dynamics. ");
    } else if(selectedCategory === "percent_black"){
        d3.select("#scatter-description").html(" In the Northeast, states tend to cluster at lower fertility rates and lower percentages of Black population, suggesting that demographic composition in this region is relatively uniform and that other factors, such as socioeconomic or cultural influences, may drive fertility rates. The Midwest shows a moderate spread in fertility rates, with states generally having lower percentages of Black population, indicating that this demographic variable has less pronounced influence on fertility patterns in this region. <br> <br> The South, with higher percentages of Black population, generally exhibits higher fertility rates, reflecting the influence of cultural, historical, and economic factors that may encourage larger family sizes in this region. The West demonstrates significant variation, with states showing a broad range of fertility rates but consistently lower percentages of Black population, which may highlight the region's unique demographic diversity.");
    } else if(selectedCategory === "percent_hispanic"){
        d3.select("#scatter-description").html(" In the Northeast, states generally have lower fertility rates and lower percentages of Hispanic population, indicating that this demographic variable has minimal influence in this region. The Midwest demonstrates a moderate range in fertility rates, with most states clustering at lower percentages of Hispanic population, suggesting that other factors, such as socioeconomic or cultural influences, may play a more significant role. <br><br> The South exhibits a broader range of fertility rates, with some states having moderate percentages of Hispanic population, but the relationship appears less pronounced compared to other regions. The West shows the most significant variation, with states having both higher fertility rates and higher percentages of Hispanic population.");
    } else if(selectedCategory === "percent_asian"){
        d3.select("#scatter-description").html("In the South, states tend to have low percentages of Asian population and show a broader range of fertility rates, reflecting the diversity of factors influencing family size in this region. The West, however, stands out with states having the highest percentages of Asian population <br><br> In the Northeast, states cluster at lower fertility rates and lower percentages of Asian population, indicating that this demographic variable does not have a significant influence on fertility rates in this region. The Midwest similarly shows a low percentage of Asian population, with most states exhibiting moderate to low fertility rates, suggesting that fertility patterns here are shaped more by cultural or socioeconomic factors than by demographic composition.");
    } else if(selectedCategory === "percent_mixed_race"){
        d3.select("#scatter-description").html(" In the South, there is a broader range of fertility rates, but the percentage of mixed-race population remains relatively low, suggesting that racial demographics have less influence compared to other factors like cultural norms or economic conditions. The West exhibits the highest variation, with one state having both a higher percentage of mixed-race population and relatively high fertility rates. However, for most states in the West, the percentage of mixed-race population remains low, and fertility rates are moderate. <br><br> n the Northeast, states tend to have lower fertility rates and lower percentages of mixed-race population, suggesting that this demographic factor has minimal influence on fertility patterns in the region. The Midwest displays a similar trend, with most states showing moderate to low fertility rates and consistently low percentages of mixed-race population, indicating other cultural or socioeconomic factors as key drivers of fertility in this region. <br><br> In the South, there is a broader range of fertility rates, but the percentage of mixed-race population remains relatively low, suggesting that racial demographics have less influence compared to other factors like cultural norms or economic conditions. The West exhibits the highest variation, with one state having both a higher percentage of mixed-race population and relatively high fertility rates. However, for most states in the West, the percentage of mixed-race population remains low, and fertility rates are moderate.");
    } else if(selectedCategory === "poverty_measure"){
        d3.select("#scatter-description").html("In the Northeast, states generally cluster toward lower fertility rates and lower poverty levels, reflecting the region's higher socioeconomic status and lower poverty rates. The Midwest displays a moderate range in fertility rates, with poverty levels spanning the mid to lower range, indicating that while poverty may play a role, other cultural or economic factors also significantly influence fertility patterns in this region. <br> <br> The South demonstrates a noticeable spread in both fertility rates and poverty measures, with some states showing higher poverty levels paired with relatively higher fertility rates. The West shows significant variability, with states exhibiting a range of fertility rates and poverty measures.");
    } else if(selectedCategory === "foreign_born"){
        d3.select("#scatter-description").html("In the Northeast, states generally cluster at lower fertility rates, even as the percentage of the foreign-born population varies. This suggests that the influence of immigration on fertility in this region may be moderated by other factors, such as urbanization and economic conditions. The Midwest shows a relatively narrow range of foreign-born population percentages, with most states displaying moderate to low fertility rates, indicating that immigration has a limited impact on fertility patterns in this region. <br> <br> In the South, there is a broader spread in fertility rates, with some states having higher foreign-born percentages correlating with moderate to high fertility rates, reflecting the potential influence of immigrant communities with cultural norms favoring larger families. The West shows the most variability, with states having the highest percentages of foreign-born populations often aligning with higher fertility rates.");
    } else if(selectedCategory === "percent_bachelors_or_higher"){
        d3.select("#scatter-description").html("In the Northeast, states generally cluster toward lower fertility rates and higher levels of educational attainment, suggesting a potential inverse relationship between education and fertility, influenced by factors such as career prioritization and delayed family planning in highly educated populations. The Midwest shows moderate fertility rates across a range of education levels, indicating that while education plays a role, it is less strongly correlated with fertility patterns compared to other factors in this region. <br> <br> In the South, there is a broad range of fertility rates, but the percentage of the population with bachelor’s degrees or higher remains lower compared to other regions, reflecting the influence of cultural and socioeconomic factors that may encourage higher fertility rates even with lower education levels. The West demonstrates significant variability, with states exhibiting higher percentages of educated populations often corresponding to moderate fertility rates. This may highlight a balance in the West between educational attainment and cultural diversity, with education having a tempered effect on fertility");
    } else if(selectedCategory === "percent_less_than_high_school"){
        d3.select("#scatter-description").html(" In the Northeast, states generally cluster toward lower fertility rates and lower percentages of people with less than a high school education. This indicates that higher education attainment in the region may correlate with lower fertility rates. The Midwest exhibits moderate fertility rates across a range of lower education levels, suggesting that other factors, such as cultural and economic influences, moderate the impact of education on fertility in this region. <br> <br> The South shows a broader spread of fertility rates, often paired with higher percentages of the population with less than a high school education. This trend reflects socioeconomic disparities and cultural factors that may encourage higher fertility rates despite lower educational attainment. The West demonstrates variability, with some states having higher fertility rates and higher percentages of people with less than a high school education, likely influenced by immigration and cultural diversity unique to the region. ");
    } else if(selectedCategory === "percent_high_school_or_some_college"){
        d3.select("#scatter-description").html("In the Northeast, states generally cluster at lower fertility rates with a narrower range of educational attainment in this category, indicating that other factors, such as urbanization and socioeconomic conditions, may have a stronger influence on fertility in this region. The Midwest shows a moderate spread of fertility rates and higher percentages of individuals with this level of education, suggesting that this demographic group represents a significant portion of the population and may influence fertility patterns. <br> <br> The South exhibits higher fertility rates paired with a broader range of educational attainment in this category, reflecting the region's diverse socioeconomic conditions and cultural norms that encourage larger family sizes. The West demonstrates variability, with some states showing moderate fertility rates despite a relatively higher percentage of individuals in this educational group.");
    } else if(selectedCategory === "political_ranking"){
        d3.select("#scatter-description").html("In the Northeast, states generally have lower fertility rates and political rankings that lean more liberal, suggesting a potential inverse relationship between progressive political ideologies and fertility. The Midwest exhibits a broader range of fertility rates with moderate political rankings, indicating a balance of political ideologies and other socioeconomic factors influencing fertility in this region. <br> <br> The South tends to cluster at higher fertility rates and more conservative political rankings, reflecting cultural and ideological factors that may encourage larger family sizes. In the West, there is significant variability, with some states showing higher fertility rates alongside moderate political rankings, reflecting the region's diversity in both political ideology and demographic composition. ");
    }  else if(selectedCategory === "latest_abortion"){
        d3.select("#scatter-description").html("In the Northeast, states generally exhibit lower fertility rates and less restrictive abortion policies, suggesting that more accessible abortion options may contribute to lower fertility rates in this region. The Midwest shows a range of fertility rates with varying levels of abortion restrictions, reflecting the region's diversity in policy and socioeconomic factors influencing family planning. <br> <br> The South clusters at higher fertility rates with more restrictive abortion policies, highlighting the influence of cultural and legislative norms that may limit access to abortion and encourage larger family sizes. In the West, there is notable variability, with states showing both moderate fertility rates and a wide range of abortion restrictions, reflecting the region's diversity in policy and population demographics.");
    }  else if(selectedCategory === "no_abortion_law"){
        d3.select("#scatter-description").html("In the Northeast, states tend to exhibit lower fertility rates and are clustered toward regions with fewer restrictive abortion laws or states that might not impose specific abortion regulations. This reflects the region's progressive stance on reproductive rights and its correlation with lower fertility rates. The Midwest shows a mix of fertility rates, with some states aligned with less restrictive abortion policies but varying levels of fertility, suggesting a more moderate interplay of cultural and socioeconomic factors. <br> <br> The South is characterized by higher fertility rates and a lower proportion of states without abortion laws, highlighting the region's conservative legislative landscape, which may restrict access to abortion and contribute to higher fertility rates. In contrast, the West displays significant variability, with states showing both moderate fertility rates and varying levels of abortion law enforcement. This diversity likely reflects a mix of cultural, demographic, and policy factors unique to the region. ");
    } else {
        d3.select("#scatter-description").text("This visualization explores the relationship between fertility rates and poverty measures across U.S. regions, highlighting distinct patterns. ");
    }
}