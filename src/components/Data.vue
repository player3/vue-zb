<template>
  <div>
  <el-table
    :data="table"
    height="250"
    border
    style="width: 100%">
    <el-table-column
      prop="date"
      label="date"
      width="180">
    </el-table-column>
    <el-table-column
      prop="open"
      label="open"
      width="180">
    </el-table-column>
    <el-table-column
      prop="highest"
      label="highest">
    </el-table-column>
    <el-table-column
      prop="lowest"
      label="lowest">
    </el-table-column>
    <el-table-column
      prop="close"
      label="close">
    </el-table-column>
  </el-table>
  
  <el-button type="primary" @click="markets">主要按钮</el-button>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
export default {
  data() {
    return {
      socket: null,
      table: []
    };
  },
  mounted() {
    let since = moment("2017-10-18").valueOf();
    const socket = new WebSocket("wss://api.zb.com:9999/websocket");

    socket.addEventListener("open", event => {
      console.log(event);
    });
    socket.addEventListener("message", event => {
      console.log(event.data);
    });
    this.socket = socket;

    axios
      .get(
        "http://api.zb.com/data/v1/kline?market=btc_usdt&type=1day&size=1000&since=" +
          since
      )
      .then(response => {
        let data = [];
        response.data.data.forEach(item => {
          data.push({
            date: moment(item[0]).format("YYYY-MM-DD HH:mm:ss"),
            open: item[1],
            highest: item[2],
            lowest: item[3],
            close: item[4]
          });
        });
        var sum = data.map(item => item.close).reduce((a, b) => a + b);
        var avg = sum / data.length;

        console.log(sum);
        console.log(data.length);
        console.log(avg);
        this.table = data;
      });
  },
  methods: {
    markets() {
      let data = {
        event: "addChannel",
        channel: "ltcbtc_ticker"
      };
      this.socket.send(JSON.stringify(data));
    }
  }
};
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
