// 封装axios
import axios from 'axios';
import QS from 'qs';
// 环境的切换
let baseURL = '';
if (process.env.NODE_ENV === 'development') {
  baseURL = 'https://localhost:3000';
}
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

const request = (type, url, params) => new Promise((resolve, reject) => {
  if (type === 'get') {
    axios.get(baseURL + url, {
      params,
    }).then((res) => {
      resolve(res.data);
    }).catch((err) => {
      reject(err.data);
    });
  } else if (type === 'post') {
    axios.post(baseURL + url, QS.stringify(params))
      .then((res) => {
        resolve(res.data);
      }).catch((err) => {
        reject(err.data);
      });
  }
});
module.exports = request;
