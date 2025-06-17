// async-resource.js
const { Zone, ZoneDelegate } = require('zone.js');

// 模拟 Node.js 的 async_hooks 生命周期标识符
const ASYNC_RESOURCE_SYMBOL = Symbol('AsyncResource');
const ASYNC_ID = Symbol('asyncId');
const TRIGGER_ASYNC_ID = Symbol('triggerAsyncId');
const DESTROYED = Symbol('destroyed');
const CONTEXT_FRAME = Symbol('contextFrame');

// 全局存储跟踪所有 AsyncResource 实例
const resources = new Map();
let nextAsyncId = 1;

// 创建新的异步 ID
function createAsyncId() {
  return nextAsyncId++;
}

// AsyncResource 核心类
class AsyncResource {
  constructor(type, options = {}) {
    if (typeof type !== 'string') 
      throw new TypeError('Resource type must be a string');

    // 获取触发上下文 ID（父资源）
    const triggerAsyncId = 
      typeof options === 'number' ? options :
      options.triggerAsyncId || Zone.current.get(ASYNC_ID) || 0;
    
    // 创建资源唯一标识
    this[ASYNC_ID] = createAsyncId();
    this[TRIGGER_ASYNC_ID] = triggerAsyncId;
    this.type = type;
    
    // 初始化状态
    this[DESTROYED] = false;
    this[CONTEXT_FRAME] = this._captureContext();
    
    // 存储实例引用
    resources.set(this[ASYNC_ID], this);
    
    // 模拟 init 钩子
    this._emitInit();
  }

  // 捕获当前 Zone 上下文
  _captureContext() {
    return Zone.current;
  }

  // 模拟 init 生命周期事件
  _emitInit() {
    const { initHooks } = AsyncResource;
    if (initHooks) {
      initHooks.forEach(hook => hook(
        this[ASYNC_ID],
        this.type,
        this[TRIGGER_ASYNC_ID],
        this
      ));
    }
  }

  // 在资源上下文中执行函数
  runInAsyncScope(fn, thisArg, ...args) {
    if (this[DESTROYED]) return;
    
    // 创建专属 Zone 上下文
    const resourceZone = this._createResourceZone();
    
    // 执行前钩子
    this._emitBefore();
    
    let result;
    resourceZone.run(() => {
      try {
        result = fn.apply(thisArg, args);
      } finally {
        // 执行后钩子
        this._emitAfter();
      }
    });
    
    return result;
  }

  // 创建资源关联的 Zone
  _createResourceZone() {
    return this[CONTEXT_FRAME].fork({
      name: `AsyncResource:${this.type}`,
      properties: {
        [ASYNC_ID]: this[ASYNC_ID],
        [TRIGGER_ASYNC_ID]: this[TRIGGER_ASYNC_ID],
        [ASYNC_RESOURCE_SYMBOL]: this
      }
    });
  }

  // 模拟 before 钩子
  _emitBefore() {
    const { beforeHooks } = AsyncResource;
    if (beforeHooks && !this[DESTROYED]) {
      beforeHooks.forEach(hook => hook(this[ASYNC_ID]));
    }
  }

  // 模拟 after 钩子
  _emitAfter() {
    const { afterHooks } = AsyncResource;
    if (afterHooks && !this[DESTROYED]) {
      afterHooks.forEach(hook => hook(this[ASYNC_ID]));
    }
  }

  // 销毁资源
  emitDestroy() {
    if (this[DESTROYED]) return this;
    
    // 模拟 destroy 钩子
    const { destroyHooks } = AsyncResource;
    if (destroyHooks) {
      destroyHooks.forEach(hook => hook(this[ASYNC_ID]));
    }
    
    // 清理引用
    this[DESTROYED] = true;
    resources.delete(this[ASYNC_ID]);
    
    return this;
  }

  // 绑定函数到当前资源上下文
  bind(fn, thisArg) {
    const bound = (...args) => 
      this.runInAsyncScope(fn, thisArg, ...args);
    
    // 附加原函数属性
    Object.defineProperties(bound, {
      name: { value: `bound ${fn.name || this.type}` },
      length: { value: fn.length },
      asyncResource: { value: this }
    });
    
    return bound;
  }

  // 获取异步 ID
  asyncId() {
    return this[ASYNC_ID];
  }

  // 获取触发 ID
  triggerAsyncId() {
    return this[TRIGGER_ASYNC_ID];
  }

  // 静态方法：快速绑定函数
  static bind(fn, type, thisArg) {
    return new this(type || fn.name).bind(fn, thisArg);
  }

  // 静态钩子管理
  static initHooks = new Set();
  static beforeHooks = new Set();
  static afterHooks = new Set();
  static destroyHooks = new Set();
  
  // 创建生命周期钩子
  static createHook({ init, before, after, destroy }) {
    init && this.initHooks.add(init);
    before && this.beforeHooks.add(before);
    after && this.afterHooks.add(after);
    destroy && this.destroyHooks.add(destroy);
    
    return {
      enable: () => this._enableHook(init, before, after, destroy),
      disable: () => this._disableHook(init, before, after, destroy)
    };
  }
  
  static _enableHook(...hooks) {
    hooks.forEach((hook, i) => hook && [
      this.initHooks, 
      this.beforeHooks, 
      this.afterHooks, 
      this.destroyHooks
    ][i].add(hook));
  }
  
  static _disableHook(...hooks) {
    hooks.forEach((hook, i) => hook && [
      this.initHooks, 
      this.beforeHooks, 
      this.afterHooks, 
      this.destroyHooks
    ][i].delete(hook));
  }
}

// Zone.js 拦截器：自动关联异步资源
Zone.current.fork({
  name: 'AsyncResourceGlobal',
  onInvoke: (delegate, current, target, callback, ...args) => {
    const resource = current.get(ASYNC_RESOURCE_SYMBOL);
    return resource 
      ? resource.runInAsyncScope(callback, null, ...args)
      : delegate.invoke(target, callback, ...args);
  }
}).run(() => {});

module.exports = {
    AsyncResource
}