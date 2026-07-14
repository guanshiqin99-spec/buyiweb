// 测试启动前置：注册 import.meta.env 改写 loader，并提供占位环境变量
// 通过 --import 引入，确保在任意业务模块被加载前完成注册
import { register } from 'node:module'

globalThis.__VITE_ENV__ = {}

register('./vite-shims.mjs', import.meta.url)
