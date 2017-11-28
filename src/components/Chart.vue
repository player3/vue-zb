<template>
<div>
  Ticker, Vol: {{ticker.vol}}, Last: {{ticker.last}}, Sell: {{ticker.sell}}, Buy: {{ticker.buy}}, High: {{ticker.high}}, Low: {{ticker.low}}
  <chart :options="polar"></chart>
  <el-form ref="form" :model="form" label-width="80px" style="width: 480px; padding:24px; text-align:left;">
  <el-form-item label="TradeType">
    <el-radio-group v-model="form.tradeType">
      <el-radio label="1">Buy</el-radio>
      <el-radio label="0">Sell</el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="Currency">
    <el-select v-model="form.currency" placeholder="Currency">
      <el-option label="ltc_btc" value="ltc_btc"></el-option>
      <el-option label="ltc_usdt" value="ltc_usdt"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="Amount">
    <el-input v-model="form.amount" placeholder="amount"></el-input>
  </el-form-item>
  <el-form-item label="Price">
    <el-input v-model="form.price" placeholder="price"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="submitOrder">提交</el-button>
  </el-form-item>
</el-form>
</div>
</template>

<script>
import axios from "axios";
import moment from "moment";

function calculateMA(dayCount, data) {
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push("-");
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum += data[i - j][1];
    }
    result.push(sum / dayCount);
  }
  return result;
}

export default {
  mounted() {
    axios
      .get("http://api.zb.com/data/v1/kline?market=ltc_usdt&type=1day")
      .then(response => {
        let rawData = response.data.data;
        let dates = rawData.map(item => moment(item[0]).format("YYYY/MM/DD"));
        let data = rawData.map(item => {
          return [item[1], item[4], item[3], item[2]];
        });
        this.polar = getOption(data, dates);
      });

    const socket = new WebSocket("wss://api.zb.com:9999/websocket");

    socket.addEventListener("open", event => {
      //console.log(event);
      console.log("open");
      let data = {
        event: "addChannel",
        channel: "ltcusdt_ticker"
      };
      this.socket.send(JSON.stringify(data));
    });
    socket.addEventListener("message", event => {
      let data = JSON.parse(event.data);
      this.ticker = data.ticker;
    });
    this.socket = socket;
  },
  data: function() {
    return {
      polar: {},
      ticker: {},
      form: {
        currency: "ltc_usdt",
        price: "",
        amount: "",
        tradeType: "1"
      }
    };
  },
  methods: {
    submitOrder() {
      console.log('submit order');
      console.log(this.form);
    }
  }
};

function getOption(data, dates) {
  var option = {
    backgroundColor: "#21202D",
    legend: {
      data: ["日K", "MA5"],
      inactiveColor: "#777",
      textStyle: {
        color: "#fff"
      }
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false,
        type: "cross",
        lineStyle: {
          color: "#376df4",
          width: 2,
          opacity: 1
        }
      }
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: "#8392A5" } }
    },
    yAxis: {
      scale: true,
      axisLine: { lineStyle: { color: "#8392A5" } },
      splitLine: { show: false }
    },
    grid: {
      bottom: 80
    },
    dataZoom: [
      {
        textStyle: {
          color: "#8392A5"
        },
        handleIcon:
          "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        dataBackground: {
          areaStyle: {
            color: "#8392A5"
          },
          lineStyle: {
            opacity: 0.8,
            color: "#8392A5"
          }
        },
        handleStyle: {
          color: "#fff",
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.6)",
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      },
      {
        type: "inside"
      }
    ],
    animation: false,
    series: [
      {
        type: "candlestick",
        name: "日K",
        data: data,
        itemStyle: {
          normal: {
            color: "#FD1050",
            color0: "#0CF49B",
            borderColor: "#FD1050",
            borderColor0: "#0CF49B"
          }
        }
      },
      {
        name: "MA5",
        type: "line",
        data: calculateMA(5, data),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          normal: {
            width: 1
          }
        }
      }
    ]
  };
  return option;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
