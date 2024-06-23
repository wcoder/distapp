var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var parse = function(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  };
  var fmtShort = function(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  };
  var fmtLong = function(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  };
  var plural = function(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  };
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
});

// node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  var setup = function(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      let i;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i = 0;i < len; i++) {
        if (!split[i]) {
          continue;
        }
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i;
      let len;
      for (i = 0, len = createDebug.skips.length;i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = createDebug.names.length;i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  };
  module.exports = setup;
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  var useColors = function() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  };
  var formatArgs = function(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  };
  var save = function(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {
    }
  };
  var load = function() {
    let r;
    try {
      r = exports.storage.getItem("debug");
    } catch (error) {
    }
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  };
  var localstorage = function() {
    try {
      return localStorage;
    } catch (error) {
    }
  };
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  exports.log = console.debug || console.log || (() => {
  });
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// utils/apkparser/binaryxml.js
var debug = require_browser();
var NodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  CDATA_SECTION_NODE: 4
};
var ChunkType = {
  NULL: 0,
  STRING_POOL: 1,
  TABLE: 2,
  XML: 3,
  XML_FIRST_CHUNK: 256,
  XML_START_NAMESPACE: 256,
  XML_END_NAMESPACE: 257,
  XML_START_ELEMENT: 258,
  XML_END_ELEMENT: 259,
  XML_CDATA: 260,
  XML_LAST_CHUNK: 383,
  XML_RESOURCE_MAP: 384,
  TABLE_PACKAGE: 512,
  TABLE_TYPE: 513,
  TABLE_TYPE_SPEC: 514
};
var StringFlags = {
  SORTED: 1 << 0,
  UTF8: 1 << 8
};
var TypedValue = {
  COMPLEX_MANTISSA_MASK: 16777215,
  COMPLEX_MANTISSA_SHIFT: 8,
  COMPLEX_RADIX_0p23: 3,
  COMPLEX_RADIX_16p7: 1,
  COMPLEX_RADIX_23p0: 0,
  COMPLEX_RADIX_8p15: 2,
  COMPLEX_RADIX_MASK: 3,
  COMPLEX_RADIX_SHIFT: 4,
  COMPLEX_UNIT_DIP: 1,
  COMPLEX_UNIT_FRACTION: 0,
  COMPLEX_UNIT_FRACTION_PARENT: 1,
  COMPLEX_UNIT_IN: 4,
  COMPLEX_UNIT_MASK: 15,
  COMPLEX_UNIT_MM: 5,
  COMPLEX_UNIT_PT: 3,
  COMPLEX_UNIT_PX: 0,
  COMPLEX_UNIT_SHIFT: 0,
  COMPLEX_UNIT_SP: 2,
  DENSITY_DEFAULT: 0,
  DENSITY_NONE: 65535,
  TYPE_ATTRIBUTE: 2,
  TYPE_DIMENSION: 5,
  TYPE_FIRST_COLOR_INT: 28,
  TYPE_FIRST_INT: 16,
  TYPE_FLOAT: 4,
  TYPE_FRACTION: 6,
  TYPE_INT_BOOLEAN: 18,
  TYPE_INT_COLOR_ARGB4: 30,
  TYPE_INT_COLOR_ARGB8: 28,
  TYPE_INT_COLOR_RGB4: 31,
  TYPE_INT_COLOR_RGB8: 29,
  TYPE_INT_DEC: 16,
  TYPE_INT_HEX: 17,
  TYPE_LAST_COLOR_INT: 31,
  TYPE_LAST_INT: 31,
  TYPE_NULL: 0,
  TYPE_REFERENCE: 1,
  TYPE_STRING: 3
};

class BinaryXmlParser {
  constructor(buffer, options = {}) {
    this.buffer = buffer;
    this.cursor = 0;
    this.strings = [];
    this.resources = [];
    this.document = null;
    this.parent = null;
    this.stack = [];
    this.debug = options.debug || false;
  }
  readU8() {
    this.debug && console.group("readU8");
    this.debug && console.debug("cursor:", this.cursor);
    const val = this.buffer[this.cursor];
    this.debug && console.debug("value:", val);
    this.cursor += 1;
    this.debug && console.groupEnd();
    return val;
  }
  readU16() {
    this.debug && console.group("readU16");
    this.debug && console.debug("cursor:", this.cursor);
    const val = this.buffer.readUInt16LE(this.cursor);
    this.debug && console.debug("value:", val);
    this.cursor += 2;
    this.debug && console.groupEnd();
    return val;
  }
  readS32() {
    this.debug && console.group("readS32");
    this.debug && console.debug("cursor:", this.cursor);
    const val = this.buffer.readInt32LE(this.cursor);
    this.debug && console.debug("value:", val);
    this.cursor += 4;
    this.debug && console.groupEnd();
    return val;
  }
  readU32() {
    this.debug && console.group("readU32");
    this.debug && console.debug("cursor:", this.cursor);
    const val = this.buffer.readUInt32LE(this.cursor);
    this.debug && console.debug("value:", val);
    this.cursor += 4;
    this.debug && console.groupEnd();
    return val;
  }
  readLength8() {
    this.debug && console.group("readLength8");
    let len = this.readU8();
    if (len & 128) {
      len = (len & 127) << 8;
      len += this.readU8();
    }
    this.debug && console.debug("length:", len);
    this.debug && console.groupEnd();
    return len;
  }
  readLength16() {
    this.debug && console.group("readLength16");
    let len = this.readU16();
    if (len & 32768) {
      len = (len & 32767) << 16;
      len += this.readU16();
    }
    this.debug && console.debug("length:", len);
    this.debug && console.groupEnd();
    return len;
  }
  readDimension() {
    this.debug && console.group("readDimension");
    const dimension = {
      value: null,
      unit: null,
      rawUnit: null
    };
    const value = this.readU32();
    const unit = dimension.value & 255;
    dimension.value = value >> 8;
    dimension.rawUnit = unit;
    switch (unit) {
      case TypedValue.COMPLEX_UNIT_MM:
        dimension.unit = "mm";
        break;
      case TypedValue.COMPLEX_UNIT_PX:
        dimension.unit = "px";
        break;
      case TypedValue.COMPLEX_UNIT_DIP:
        dimension.unit = "dp";
        break;
      case TypedValue.COMPLEX_UNIT_SP:
        dimension.unit = "sp";
        break;
      case TypedValue.COMPLEX_UNIT_PT:
        dimension.unit = "pt";
        break;
      case TypedValue.COMPLEX_UNIT_IN:
        dimension.unit = "in";
        break;
    }
    this.debug && console.groupEnd();
    return dimension;
  }
  readFraction() {
    this.debug && console.group("readFraction");
    const fraction = {
      value: null,
      type: null,
      rawType: null
    };
    const value = this.readU32();
    const type = value & 15;
    fraction.value = this.convertIntToFloat(value >> 4);
    fraction.rawType = type;
    switch (type) {
      case TypedValue.COMPLEX_UNIT_FRACTION:
        fraction.type = "%";
        break;
      case TypedValue.COMPLEX_UNIT_FRACTION_PARENT:
        fraction.type = "%p";
        break;
    }
    this.debug && console.groupEnd();
    return fraction;
  }
  readHex24() {
    this.debug && console.group("readHex24");
    var val = (this.readU32() & 16777215).toString(16);
    this.debug && console.groupEnd();
    return val;
  }
  readHex32() {
    this.debug && console.group("readHex32");
    var val = this.readU32().toString(16);
    this.debug && console.groupEnd();
    return val;
  }
  readTypedValue() {
    this.debug && console.group("readTypedValue");
    const typedValue = {
      value: null,
      type: null,
      rawType: null
    };
    const start = this.cursor;
    let size = this.readU16();
    this.readU8();
    const dataType = this.readU8();
    if (size === 0) {
      size = 8;
    }
    typedValue.rawType = dataType;
    switch (dataType) {
      case TypedValue.TYPE_INT_DEC:
        typedValue.value = this.readS32();
        typedValue.type = "int_dec";
        break;
      case TypedValue.TYPE_INT_HEX:
        typedValue.value = this.readS32();
        typedValue.type = "int_hex";
        break;
      case TypedValue.TYPE_STRING:
        var ref = this.readS32();
        typedValue.value = ref > 0 ? this.strings[ref] : "";
        typedValue.type = "string";
        break;
      case TypedValue.TYPE_REFERENCE:
        var id = this.readU32();
        typedValue.value = `resourceId:0x${id.toString(16)}`;
        typedValue.type = "reference";
        break;
      case TypedValue.TYPE_INT_BOOLEAN:
        typedValue.value = this.readS32() !== 0;
        typedValue.type = "boolean";
        break;
      case TypedValue.TYPE_NULL:
        this.readU32();
        typedValue.value = null;
        typedValue.type = "null";
        break;
      case TypedValue.TYPE_INT_COLOR_RGB8:
        typedValue.value = this.readHex24();
        typedValue.type = "rgb8";
        break;
      case TypedValue.TYPE_INT_COLOR_RGB4:
        typedValue.value = this.readHex24();
        typedValue.type = "rgb4";
        break;
      case TypedValue.TYPE_INT_COLOR_ARGB8:
        typedValue.value = this.readHex32();
        typedValue.type = "argb8";
        break;
      case TypedValue.TYPE_INT_COLOR_ARGB4:
        typedValue.value = this.readHex32();
        typedValue.type = "argb4";
        break;
      case TypedValue.TYPE_DIMENSION:
        typedValue.value = this.readDimension();
        typedValue.type = "dimension";
        break;
      case TypedValue.TYPE_FRACTION:
        typedValue.value = this.readFraction();
        typedValue.type = "fraction";
        break;
      default: {
        const type = dataType.toString(16);
        debug(`Not sure what to do with typed value of type 0x${type}, falling back to reading an uint32.`);
        typedValue.value = this.readU32();
        typedValue.type = "unknown";
      }
    }
    const end = start + size;
    if (this.cursor !== end) {
      const type = dataType.toString(16);
      const diff = end - this.cursor;
      debug(`Cursor is off by ${diff} bytes at ${this.cursor} at supposed end of typed value of type 0x${type}. The typed value started at offset ${start} and is supposed to end at offset ${end}. Ignoring the rest of the value.`);
      this.cursor = end;
    }
    this.debug && console.groupEnd();
    return typedValue;
  }
  convertIntToFloat(int) {
    const buf = new ArrayBuffer(4);
    new Int32Array(buf)[0] = int;
    return new Float32Array(buf)[0];
  }
  readString(encoding) {
    this.debug && console.group("readString", encoding);
    switch (encoding) {
      case "utf-8":
        var stringLength = this.readLength8(encoding);
        this.debug && console.debug("stringLength:", stringLength);
        var byteLength = this.readLength8(encoding);
        this.debug && console.debug("byteLength:", byteLength);
        var value = this.buffer.toString(encoding, this.cursor, this.cursor += byteLength);
        this.debug && console.debug("value:", value);
        if (this.readU8() === 0)
          throw "String must end with trailing zero";
        this.debug && console.groupEnd();
        return value;
      case "ucs2":
        stringLength = this.readLength16(encoding);
        this.debug && console.debug("stringLength:", stringLength);
        byteLength = stringLength * 2;
        this.debug && console.debug("byteLength:", byteLength);
        value = this.buffer.toString(encoding, this.cursor, this.cursor += byteLength);
        this.debug && console.debug("value:", value);
        if (this.readU16() === 0) {
          throw "String must end with trailing zero";
        }
        this.debug && console.groupEnd();
        return value;
      default:
        throw new Error(`Unsupported encoding '${encoding}'`);
    }
  }
  readChunkHeader() {
    this.debug && console.group("readChunkHeader");
    var header = {
      startOffset: this.cursor,
      chunkType: this.readU16(),
      headerSize: this.readU16(),
      chunkSize: this.readU32()
    };
    this.debug && console.debug("startOffset:", header.startOffset);
    this.debug && console.debug("chunkType:", header.chunkType);
    this.debug && console.debug("headerSize:", header.headerSize);
    this.debug && console.debug("chunkSize:", header.chunkSize);
    this.debug && console.groupEnd();
    return header;
  }
  readStringPool(header) {
    this.debug && console.group("readStringPool");
    header.stringCount = this.readU32();
    this.debug && console.debug("stringCount:", header.stringCount);
    header.styleCount = this.readU32();
    this.debug && console.debug("styleCount:", header.styleCount);
    header.flags = this.readU32();
    this.debug && console.debug("flags:", header.flags);
    header.stringsStart = this.readU32();
    this.debug && console.debug("stringsStart:", header.stringsStart);
    header.stylesStart = this.readU32();
    this.debug && console.debug("stylesStart:", header.stylesStart);
    if (header.chunkType !== ChunkType.STRING_POOL) {
      throw new Error("Invalid string pool header");
    }
    const offsets = [];
    for (let i = 0, l = header.stringCount;i < l; ++i) {
      this.debug && console.debug("offset:", i);
      offsets.push(this.readU32());
    }
    const sorted = (header.flags & StringFlags.SORTED) === StringFlags.SORTED;
    this.debug && console.debug("sorted:", sorted);
    const encoding = (header.flags & StringFlags.UTF8) === StringFlags.UTF8 ? "utf-8" : "ucs2";
    this.debug && console.debug("encoding:", encoding);
    const stringsStart = header.startOffset + header.stringsStart;
    this.cursor = stringsStart;
    for (let i = 0, l = header.stringCount;i < l; ++i) {
      this.debug && console.debug("string:", i);
      this.debug && console.debug("offset:", offsets[i]);
      this.cursor = stringsStart + offsets[i];
      this.strings.push(this.readString(encoding));
    }
    this.cursor = header.startOffset + header.chunkSize;
    this.debug && console.groupEnd();
    return null;
  }
  readResourceMap(header) {
    this.debug && console.group("readResourceMap");
    const count = Math.floor((header.chunkSize - header.headerSize) / 4);
    for (let i = 0;i < count; ++i) {
      this.resources.push(this.readU32());
    }
    this.debug && console.groupEnd();
    return null;
  }
  readXmlNamespaceStart() {
    this.debug && console.group("readXmlNamespaceStart");
    this.readU32();
    this.readU32();
    this.readS32();
    this.readS32();
    this.debug && console.groupEnd();
    return null;
  }
  readXmlNamespaceEnd() {
    this.debug && console.group("readXmlNamespaceEnd");
    this.readU32();
    this.readU32();
    this.readS32();
    this.readS32();
    this.debug && console.groupEnd();
    return null;
  }
  readXmlElementStart() {
    this.debug && console.group("readXmlElementStart");
    const node = {
      namespaceURI: null,
      nodeType: NodeType.ELEMENT_NODE,
      nodeName: null,
      attributes: [],
      childNodes: []
    };
    this.readU32();
    this.readU32();
    const nsRef = this.readS32();
    const nameRef = this.readS32();
    if (nsRef > 0) {
      node.namespaceURI = this.strings[nsRef];
    }
    node.nodeName = this.strings[nameRef];
    this.readU16();
    this.readU16();
    const attrCount = this.readU16();
    this.readU16();
    this.readU16();
    this.readU16();
    for (let i = 0;i < attrCount; ++i) {
      node.attributes.push(this.readXmlAttribute());
    }
    if (this.document) {
      this.parent.childNodes.push(node);
      this.parent = node;
    } else {
      this.document = this.parent = node;
    }
    this.stack.push(node);
    this.debug && console.groupEnd();
    return node;
  }
  readXmlAttribute() {
    this.debug && console.group("readXmlAttribute");
    const attr = {
      namespaceURI: null,
      nodeType: NodeType.ATTRIBUTE_NODE,
      nodeName: null,
      name: null,
      value: null,
      typedValue: null
    };
    const nsRef = this.readS32();
    const nameRef = this.readS32();
    const valueRef = this.readS32();
    if (nsRef > 0) {
      attr.namespaceURI = this.strings[nsRef];
    }
    attr.nodeName = attr.name = this.strings[nameRef];
    if (valueRef > 0) {
      attr.value = this.strings[valueRef];
    }
    attr.typedValue = this.readTypedValue();
    this.debug && console.groupEnd();
    return attr;
  }
  readXmlElementEnd() {
    this.debug && console.group("readXmlCData");
    this.readU32();
    this.readU32();
    this.readS32();
    this.readS32();
    this.stack.pop();
    this.parent = this.stack[this.stack.length - 1];
    this.debug && console.groupEnd();
    return null;
  }
  readXmlCData() {
    this.debug && console.group("readXmlCData");
    const cdata = {
      namespaceURI: null,
      nodeType: NodeType.CDATA_SECTION_NODE,
      nodeName: "#cdata",
      data: null,
      typedValue: null
    };
    this.readU32();
    this.readU32();
    const dataRef = this.readS32();
    if (dataRef > 0) {
      cdata.data = this.strings[dataRef];
    }
    cdata.typedValue = this.readTypedValue();
    this.parent.childNodes.push(cdata);
    this.debug && console.groupEnd();
    return cdata;
  }
  readNull(header) {
    this.debug && console.group("readNull");
    this.cursor += header.chunkSize - header.headerSize;
    this.debug && console.groupEnd();
    return null;
  }
  parse() {
    this.debug && console.group("BinaryXmlParser.parse");
    const xmlHeader = this.readChunkHeader();
    if (xmlHeader.chunkType !== ChunkType.XML) {
      throw new Error("Invalid XML header");
    }
    while (this.cursor < this.buffer.length) {
      this.debug && console.group("chunk");
      const start = this.cursor;
      const header = this.readChunkHeader();
      switch (header.chunkType) {
        case ChunkType.STRING_POOL:
          this.readStringPool(header);
          break;
        case ChunkType.XML_RESOURCE_MAP:
          this.readResourceMap(header);
          break;
        case ChunkType.XML_START_NAMESPACE:
          this.readXmlNamespaceStart(header);
          break;
        case ChunkType.XML_END_NAMESPACE:
          this.readXmlNamespaceEnd(header);
          break;
        case ChunkType.XML_START_ELEMENT:
          this.readXmlElementStart(header);
          break;
        case ChunkType.XML_END_ELEMENT:
          this.readXmlElementEnd(header);
          break;
        case ChunkType.XML_CDATA:
          this.readXmlCData(header);
          break;
        case ChunkType.NULL:
          this.readNull(header);
          break;
        default:
          throw new Error(`Unsupported chunk type '${header.chunkType}'`);
      }
      const end = start + header.chunkSize;
      if (this.cursor !== end) {
        const diff = end - this.cursor;
        const type = header.chunkType.toString(16);
        debug(`Cursor is off by ${diff} bytes at ${this.cursor} at supposed end of chunk of type 0x${type}. The chunk started at offset ${start} and is supposed to end at offset ${end}. Ignoring the rest of the chunk.`);
        this.cursor = end;
      }
      this.debug && console.groupEnd();
    }
    this.debug && console.groupEnd();
    return this.document;
  }
}
var binaryxml_default = BinaryXmlParser;

// utils/apkparser/manifest.js
var INTENT_MAIN = "android.intent.action.MAIN";
var CATEGORY_LAUNCHER = "android.intent.category.LAUNCHER";

class ManifestParser {
  constructor(buffer, options = {}) {
    this.buffer = buffer;
    this.xmlParser = new binaryxml_default(this.buffer, options);
  }
  collapseAttributes(element) {
    const collapsed = Object.create(null);
    for (let attr of Array.from(element.attributes)) {
      collapsed[attr.name] = attr.typedValue.value;
    }
    return collapsed;
  }
  parseIntents(element, target) {
    target.intentFilters = [];
    target.metaData = [];
    return element.childNodes.forEach((element2) => {
      switch (element2.nodeName) {
        case "intent-filter": {
          const intentFilter = this.collapseAttributes(element2);
          intentFilter.actions = [];
          intentFilter.categories = [];
          intentFilter.data = [];
          element2.childNodes.forEach((element3) => {
            switch (element3.nodeName) {
              case "action":
                intentFilter.actions.push(this.collapseAttributes(element3));
                break;
              case "category":
                intentFilter.categories.push(this.collapseAttributes(element3));
                break;
              case "data":
                intentFilter.data.push(this.collapseAttributes(element3));
                break;
            }
          });
          target.intentFilters.push(intentFilter);
          break;
        }
        case "meta-data":
          target.metaData.push(this.collapseAttributes(element2));
          break;
      }
    });
  }
  parseApplication(element) {
    const app = this.collapseAttributes(element);
    app.activities = [];
    app.activityAliases = [];
    app.launcherActivities = [];
    app.services = [];
    app.receivers = [];
    app.providers = [];
    app.usesLibraries = [];
    element.childNodes.forEach((element2) => {
      switch (element2.nodeName) {
        case "activity": {
          const activity = this.collapseAttributes(element2);
          this.parseIntents(element2, activity);
          app.activities.push(activity);
          if (this.isLauncherActivity(activity)) {
            app.launcherActivities.push(activity);
          }
          break;
        }
        case "activity-alias": {
          const activityAlias = this.collapseAttributes(element2);
          this.parseIntents(element2, activityAlias);
          app.activityAliases.push(activityAlias);
          if (this.isLauncherActivity(activityAlias)) {
            app.launcherActivities.push(activityAlias);
          }
          break;
        }
        case "service": {
          const service = this.collapseAttributes(element2);
          this.parseIntents(element2, service);
          app.services.push(service);
          break;
        }
        case "receiver": {
          const receiver = this.collapseAttributes(element2);
          this.parseIntents(element2, receiver);
          app.receivers.push(receiver);
          break;
        }
        case "provider": {
          const provider = this.collapseAttributes(element2);
          provider.grantUriPermissions = [];
          provider.metaData = [];
          provider.pathPermissions = [];
          element2.childNodes.forEach((element3) => {
            switch (element3.nodeName) {
              case "grant-uri-permission":
                provider.grantUriPermissions.push(this.collapseAttributes(element3));
                break;
              case "meta-data":
                provider.metaData.push(this.collapseAttributes(element3));
                break;
              case "path-permission":
                provider.pathPermissions.push(this.collapseAttributes(element3));
                break;
            }
          });
          app.providers.push(provider);
          break;
        }
        case "uses-library":
          app.usesLibraries.push(this.collapseAttributes(element2));
          break;
      }
    });
    return app;
  }
  isLauncherActivity(activity) {
    return activity.intentFilters.some(function(filter) {
      const hasMain = filter.actions.some((action) => action.name === INTENT_MAIN);
      if (!hasMain) {
        return false;
      }
      return filter.categories.some((category) => category.name === CATEGORY_LAUNCHER);
    });
  }
  parse() {
    const document2 = this.xmlParser.parse();
    const manifest = this.collapseAttributes(document2);
    manifest.usesPermissions = [];
    manifest.permissions = [];
    manifest.permissionTrees = [];
    manifest.permissionGroups = [];
    manifest.instrumentation = null;
    manifest.usesSdk = null;
    manifest.usesConfiguration = null;
    manifest.usesFeatures = [];
    manifest.supportsScreens = null;
    manifest.compatibleScreens = [];
    manifest.supportsGlTextures = [];
    manifest.application = Object.create(null);
    document2.childNodes.forEach((element) => {
      switch (element.nodeName) {
        case "uses-permission":
          manifest.usesPermissions.push(this.collapseAttributes(element));
          break;
        case "permission":
          manifest.permissions.push(this.collapseAttributes(element));
          break;
        case "permission-tree":
          manifest.permissionTrees.push(this.collapseAttributes(element));
          break;
        case "permission-group":
          manifest.permissionGroups.push(this.collapseAttributes(element));
          break;
        case "instrumentation":
          manifest.instrumentation = this.collapseAttributes(element);
          break;
        case "uses-sdk":
          manifest.usesSdk = this.collapseAttributes(element);
          break;
        case "uses-configuration":
          manifest.usesConfiguration = this.collapseAttributes(element);
          break;
        case "uses-feature":
          manifest.usesFeatures.push(this.collapseAttributes(element));
          break;
        case "supports-screens":
          manifest.supportsScreens = this.collapseAttributes(element);
          break;
        case "compatible-screens":
          element.childNodes.forEach((screen) => {
            return manifest.compatibleScreens.push(this.collapseAttributes(screen));
          });
          break;
        case "supports-gl-texture":
          manifest.supportsGlTextures.push(this.collapseAttributes(element));
          break;
        case "application":
        case "com.stub.StubApp":
          manifest.application = this.parseApplication(element);
          break;
      }
    });
    return manifest;
  }
}
var manifest_default = ManifestParser;
export {
  manifest_default as default
};
