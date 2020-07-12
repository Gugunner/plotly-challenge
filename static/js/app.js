let dataset = [];

const init = async() => {
    dataset = await d3.json("samples.json").then(data => data);
};

const initOptions = (ids) => {
    ids.forEach(id => {
        d3.select("#selDataset").append("option").attr("value", id).text(id);
    });
};

const plotBar = (id) => {
        console.log("dataset", dataset);
        const sample = dataset.samples.find(s => s.id === id);
        const values = sample["sample_values"].map(val => val).slice(0,10).reverse();
        const ids = sample["otu_ids"].map(id => "Otu "+id).slice(0,9).reverse();
        const labels = sample["otu_labels"].map(label => label.split(";").join("<br>")).slice(0,9).reverse();

        const trace1 = {
            y: ids,
            x: values,
            text: labels,
            type: "bar",
            orientation: "h"
        };

        const plotData = [trace1];
        Plotly.newPlot("bar", plotData);

};

const bubbleColors = {
    10: "rgb(212,255,0)",
    20: "rgb(0,255,213)",
    50: "rgb(0,85,255)",
    100: "rgb(255,170,0)",
    500: "rgb(255,128,0)"
};


const plotBubbles = (id) => {

    const sortSamples = (id1, id2) => id1 > id2 ? 1 : id2 > id1 ? -1 : 0;
    const sample = dataset.samples.find(s => s.id === id);
    let sampling = [];
    sample["otu_ids"].forEach((val, idx) => {
        sampling = [...sampling,
            {
                id: sample["otu_ids"][idx],
                value: sample["sample_values"][idx],
                label: sample["otu_labels"][idx],
            }
        ]
    });
    sampling.sort((sample1, sample2) => sortSamples(sample1["id"], sample2["id"]));
    const ids = sampling.map(s => "Otu "+s.id);
    const values = sampling.map(s => s.value);
    const labels = sampling.map(s => s.label.split(";").join("<br>"));
    const color = sampling.map(s => s.value > 500 ? bubbleColors[500] : s.value > 100 ? bubbleColors[100] : s.value > 50 ? bubbleColors[50] : s.value > 20 ? bubbleColors[20] : bubbleColors[10]);

    const trace1 = {
        x: ids,
        y: values,
        mode: "markers",
        marker: {
            size: values,
            color: color
        },
        text: labels

    };

    const plotData = [trace1];
    Plotly.newPlot("bubble", plotData);
};

const fillInfo = (id) => {
    const metadata = dataset.metadata.find(m => m.id === +id);
    const ethnicity = metadata.ethnicity;
    const gender = metadata.gender;
    const age = metadata.age;
    const location = metadata.location;
    const bbtype = metadata.bbtype;
    const wfreq = metadata.wfreq;

    const info = d3.select("#sample-metadata");
    if(!info) {
        info.remove;
    }

    info.html(`<ul style="list-style: none; padding: 0">
        <li>Id: ${id}</li>
        <li>ethnicity: ${ethnicity}</li>
        <li>gender: ${gender}</li>
        <li>age: ${age}</li>
        <li>location: ${location}</li>
        <li>bbtype: ${bbtype}</li>
        <li>wfreq: ${wfreq}</li>
    </ul>`)
};

const plotGauge = (id) => {
    const metadata = dataset.metadata.find(m => m.id === +id);
    const wfreq = metadata.wfreq;
    var data_g = [
        {
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            title: { text: `Weekly Washing Frequency ` },
            type: "indicator",
            mode: "gauge+number",
            gauge: { axis: { range: [0, 9] },
            steps: [
                { range: [0, 1], color: "rgb(248,233,243)", name: "0-1"},
                { range: [1, 2], color: "rgb(244,241,229)", name: "1-2" },
                { range: [2, 3], color: "rgb(233,230,202)", name: "2-3" },
                { range: [3, 4], color: "rgb(229,231,179)", name: "3-4" },
                { range: [4, 5], color: "rgb(213,228,157)", name: "4-5" },
                { range: [5, 6], color: "rgb(183,204,146)", name: "5-6" },
                { range: [6, 7], color: "rgb(140,191,136)", name: "6-7" },
                { range: [7, 8], color: "rgb(138,187,143)", name: "7-8" },
                { range: [8, 9], color: "rgb(133,180,138)", name: "8-9"},
            ]},
        }
    ];

    const layout = {
        width: 400,
        height: 380,
    };
    Plotly.newPlot("gauge", data_g, layout);

};

init().then(() => {
    const ids = dataset.samples.map(sample => sample.id);
    initOptions(ids);
    const id1 = dataset.samples[0]["id"];
    plotBar(id1);
    plotBubbles(id1);
    fillInfo(id1);
    plotGauge(id1);

}).catch((err) => {
    console.log("No data could be loaded");
    alert("No data could be loaded");
});


d3.select("body").on("change", function () {
    const option = d3.select("#selDataset").property("value");
    plotBar(option);
    plotBubbles(option);
    fillInfo(option);
    plotGauge(option);
});

