<template>
<div style="padding:24px; text-align:left;">


  <chart :options="polar"></chart>
      <el-table
      :data="table" border
      style="width: 600px; text-align:left; margin:24px 0;" height="420">
      <el-table-column
        prop="date"
        label="date"
        width="120">
      </el-table-column>
      <el-table-column
        prop="open"
        label="open">
      </el-table-column>
      <el-table-column
        prop="close"
        label="close">
      </el-table-column>
      <el-table-column
        prop="lowest"
        label="lowest">
      </el-table-column>
      <el-table-column
        prop="highest"
        label="highest">
      </el-table-column>
      <el-table-column
        prop="ma"
        label="MA20">
      </el-table-column>
      <el-table-column
        prop="diff"
        label="diff">
      </el-table-column>
      <el-table-column
        prop="flag"
        label="flag">
      </el-table-column>
    </el-table>
    策略定义：
    <el-form :model="form">
      <el-form-item label="买入">
        <el-input v-model="form.buy_rate"></el-input>
      </el-form-item>
      <el-form-item label="卖出">
        <el-input v-model="form.sell_rate"></el-input>
      </el-form-item>
      <el-form-item label="时间范围">
            <el-date-picker
            format="yyyy/MM/dd"
            value-format="yyyy/MM/dd"
      v-model="form.begin"
      type="date"
      placeholder="开始日期">
    </el-date-picker>
     - 
            <el-date-picker
            format="yyyy/MM/dd"
            value-format="yyyy/MM/dd"
      v-model="form.end"
      type="date"
      placeholder="结束日期">
    </el-date-picker>
      </el-form-item>
    </el-form>

  <el-button type="primary" @click="rollback">回测</el-button>
  <chart :options="rollback_option" style='margin:12px 0;'></chart>
        


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
    this.setSource();
  },
  data: function() {
    return {
      options: [
        { label: "比特币", value: "btc_usdt" },
        { label: "莱特币", value: "ltc_usdt" }
      ],
      source: "ltc_usdt",
      channel: "",
      polar: {},
      ticker: {},
      table: [],
      form: {
        sell_rate: "-0.06",
        buy_rate: "0.04",
        begin: "2017/11/01",
        end: "2017/12/01"
      },
      rollback_option: {}
    };
  },
  methods: {
    rollback() {
      var result = this.test(
        this.table,
        this.form.begin,
        this.form.end,
        this.form.buy_rate,
        this.form.sell_rate
      );
      this.rollback_option = getRollbackData(result);
    },
    test(data, begin_date, end_date, buy_rate, sell_rate) {
      var money = 10000;
      var coin = 0;
      var total = money;
      var result = [];
      var begin = data.findIndex(item => item["date"] == begin_date);
      var end = data.findIndex(item => item["date"] == end_date);
      for (var i = begin; i <= end; i++) {
        if (data[i].diff >= buy_rate && money > 0) {
          coin = money / data[i]["close"];
          money = 0;
        }
        if (data[i].diff <= sell_rate && coin > 0) {
          money = coin * data[i]["close"];
          coin = 0;
        }
        total = money + coin * data[i]["close"];
        result.push({
          date: data[i]["date"],
          money: total
        });
      }
      return result;
    },
    setSource() {
      let source = this.source;
      this.channel = source.replace("_", "") + "_ticker";
      axios
        .get("https://api.bitfinex.com/v2/candles/trade:1D:tBTCUSD/hist")
        .then(response => {
          let rawData = response.data.reverse();
          let dates = rawData.map(item => moment(item[0]).format("YYYY/MM/DD"));
          let data = rawData.map(item => {
            return [item[1], item[2], item[4], item[3]];
          });
          this.table = rawData.map(item => {
            return {
              date: moment(item[0]).format("YYYY/MM/DD"),
              open: item[1],
              close: item[2],
              lowest: item[4],
              highest: item[3]
            };
          });
          var ma20 = calculateMA(20, data);
          this.table.forEach((value, index) => {
            if (ma20[index] == "-") return;
            value["ma"] = ma20[index].toFixed(3);
            value["diff"] = ((value["close"] - ma20[index]) /
              value["close"]
            ).toFixed(3);
            value["flag"] =
              value["diff"] >= 0.04
                ? "buy"
                : value["diff"] <= -0.06 ? "sell" : "";
          });
          window.json = this.table;
          this.polar = getOption(data, dates);
        });

      let data = {
        event: "addChannel",
        channel: this.channel
      };
    }
  }
};

function getRollbackData(data) {
  var category = data.map(m=>m.date);
  var value = data.map(m=>m.money);
  var option = {
    title: {
      text: "回测数据",
      subtext: "BTC-USD"
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: ["资产总值"]
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none"
        },
        dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: category
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} $"
      }
    },
    series: [
      {
        name: "资产总值",
        type: "line",
        data: value,
        markPoint: {
          data: [{ type: "max", name: "最大值" }]
        },
        markLine: {
          data: [{ type: "average", name: "平均值" }]
        }
      }
    ]
  };
  return option;
}

function getOption(data, dates) {
  var option = {
    backgroundColor: "#21202D",
    legend: {
      data: ["日K", "MA20"],
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
        name: "MA20",
        type: "line",
        data: calculateMA(20, data),
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
