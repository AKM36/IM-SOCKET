const ms = require("ms")
module.exports = {
  apps: [
    {
      name: "IMSOCKET",//应用进程名称
      max_memory_restart: "1024M", //最大内存限制数，超出自动重启
      script: "./socket.js", //启动脚本路径
      cwd: './server/',//应用启动的路径，关于script与cwd的区别举例说明：在/home/polo/目录下运行/data/release/node/index.js，此处script为/data/release/node/index.js，cwd为/home/polo/；
      watch: false,//监听重启，启用情况下，文件夹或子文件夹下变化应用自动重启；
      ignore_watch: './logs/',//忽略监听的文件夹，支持正则表达式
      out_file: "./logs/pm2/out/socket-out.log",//记录标准输出流，$HOME/.pm2/logs/XXXout.log)，如应用打印大量的标准输出，会导致pm2日志过大；
      error_file: "./logs/pm2/error/socket-error.log",//记录标准错误流，$HOME/.pm2/logs/XXXerr.log)，代码错误可在此文件查找；
      instances: 1,//应用启动实例个数，仅在cluster模式有效，默认为fork；
      exec_mode: "cluster",//应用启动模式，支持fork和cluster模式；
      instance_var: 'INSTANCE_ID',//重命名NODE_APP_INSTANCE，process.env.INSTANCE_ID === 0 判断进程
      args: "",//传递给脚本的参数
      restart_delay: ms('1h'),//异常重启情况下，延时重启时间
      min_uptime: ms('2h'),//应用运行少于时间被认为是异常启动
      max_restarts: 5,//最大异常重启次数，即小于min_uptime运行时间重启次数
      env: {//开发环境环境变量，object类型，如{"NODE_ENV":"production", "ID": "42"}；
        "NODE_ENV": "development"
      },
      env_test: {
        "NODE_ENV": "test"
      },
      env_prerelease: {
        "NODE_ENV": "prerelease"
      }
    },
    {
      name: "IMAPI",
      max_memory_restart: "1024M",
      script: "./server.js",
      cwd: './server/',
      watch: false,
      ignore_watch: './logs/',
      out_file: "./logs/pm2/out/api-out.log",
      error_file: "./logs/pm2/error/api-error.log",
      instances: 1,
      exec_mode: "cluster",
      instance_var: 'INSTANCE_ID',
      args: "",
      restart_delay: ms('1h'),
      min_uptime: ms('2h'),
      max_restarts: 5,
      env: {
        "NODE_ENV": "development"
      },
      env_test: {
        "NODE_ENV": "test"
      },
      env_prerelease: {
        "NODE_ENV": "prerelease"
      }
    }
  ]
}
