
var chartContratti
var chartSoldi

function loadStats() {
  console.log("loadStats");
  $(".Home").hide()
  $(".statistics").show()
  window.history.pushState({}, '', "/");
  window.history.pushState({}, '', "stats");

  if (chartSoldi != undefined || chartContratti != undefined) {
    removeData(chartSoldi)
    removeData(chartContratti)
  }

  $.ajax({
    url: '/api/init/stats?organization=' + localStorage.getItem("organization") + '&token=' + localStorage.getItem("token"),

    success: function(res) {
      if (res.success) {
        if (!res.isStart) {
          alert("No game started!");
        }
        showChartContratti(res.datasetsContratti, res.labels)
        showChartSoldi(res.datasetsSoldi, res.labels)
      }
    },
    error: function(err) {
      console.log("Error: " + err);
    }
  });

}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

function showChartContratti(data, labels) {
  console.log("showChartContratti");
  var ctx = document.getElementById('chartContratti').getContext('2d');

  chartContratti = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: [{
        label: "Contratti",
        backgroundColor: 'lightgreen',
        borderColor: 'lightgreen',
        data: data
      }]
    },

    options: {
      layout: {
            padding: {
                left: 50,
                right: 50,
                top: 100,
                bottom: 100
            }
        }
    }
  });


}

function showChartSoldi(data, labels) {
  var ctx = document.getElementById('chartSoldi').getContext('2d');

  console.log("showChartSoldi");
  chartSoldi = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: [{
        label: "Soldi",
        backgroundColor: 'lightblue',
        borderColor: 'lightblue',
        data: data
      }]
    },

    options: {
      layout: {
            padding: {
              left: 50,
              right: 50,
              top: 100,
              bottom: 100
            }
        }
    }
  });
}
