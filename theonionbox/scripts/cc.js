(function(){
    "use strict";
    var ρσ_iterator_symbol = (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") ? Symbol.iterator : "iterator-Symbol-5d0927e5554349048cf0e3762a228256";
    var ρσ_kwargs_symbol = (typeof Symbol === "function") ? Symbol("kwargs-object") : "kwargs-object-Symbol-5d0927e5554349048cf0e3762a228256";
    var ρσ_cond_temp, ρσ_expr_temp, ρσ_last_exception;
    var ρσ_object_counter = 0;
var ρσ_len;
function ρσ_bool(val) {
    return !!val;
};
if (!ρσ_bool.__argnames__) Object.defineProperties(ρσ_bool, {
    __argnames__ : {value: ["val"]}
});

function ρσ_print() {
    var parts;
    if (typeof console === "object") {
        parts = [];
        for (var i = 0; i < arguments.length; i++) {
            parts.push(ρσ_str(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]));
        }
        console.log(parts.join(" "));
    }
};

function ρσ_int(val, base) {
    var ans;
    if (typeof val === "number") {
        ans = val | 0;
    } else {
        ans = parseInt(val, base || 10);
    }
    if (isNaN(ans)) {
        throw new ValueError("Invalid literal for int with base " + (base || 10) + ": " + val);
    }
    return ans;
};
if (!ρσ_int.__argnames__) Object.defineProperties(ρσ_int, {
    __argnames__ : {value: ["val", "base"]}
});

function ρσ_float(val) {
    var ans;
    if (typeof val === "number") {
        ans = val;
    } else {
        ans = parseFloat(val);
    }
    if (isNaN(ans)) {
        throw new ValueError("Could not convert string to float: " + arguments[0]);
    }
    return ans;
};
if (!ρσ_float.__argnames__) Object.defineProperties(ρσ_float, {
    __argnames__ : {value: ["val"]}
});

function ρσ_arraylike_creator() {
    var names;
    names = "Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" ");
    if (typeof HTMLCollection === "function") {
        names = names.concat("HTMLCollection NodeList NamedNodeMap TouchList".split(" "));
    }
    return (function() {
        var ρσ_anonfunc = function (x) {
            if (Array.isArray(x) || typeof x === "string" || names.indexOf(Object.prototype.toString.call(x).slice(8, -1)) > -1) {
                return true;
            }
            return false;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["x"]}
        });
        return ρσ_anonfunc;
    })();
};

function options_object(f) {
    return function () {
        if (typeof arguments[arguments.length - 1] === "object") {
            arguments[ρσ_bound_index(arguments.length - 1, arguments)][ρσ_kwargs_symbol] = true;
        }
        return f.apply(this, arguments);
    };
};
if (!options_object.__argnames__) Object.defineProperties(options_object, {
    __argnames__ : {value: ["f"]}
});

function ρσ_id(x) {
    return x.ρσ_object_id;
};
if (!ρσ_id.__argnames__) Object.defineProperties(ρσ_id, {
    __argnames__ : {value: ["x"]}
});

function ρσ_dir(item) {
    var arr;
    arr = ρσ_list_decorate([]);
    for (var i in item) {
        arr.push(i);
    }
    return arr;
};
if (!ρσ_dir.__argnames__) Object.defineProperties(ρσ_dir, {
    __argnames__ : {value: ["item"]}
});

function ρσ_ord(x) {
    var ans, second;
    ans = x.charCodeAt(0);
    if (55296 <= ans && ans <= 56319) {
        second = x.charCodeAt(1);
        if (56320 <= second && second <= 57343) {
            return (ans - 55296) * 1024 + second - 56320 + 65536;
        }
        throw new TypeError("string is missing the low surrogate char");
    }
    return ans;
};
if (!ρσ_ord.__argnames__) Object.defineProperties(ρσ_ord, {
    __argnames__ : {value: ["x"]}
});

function ρσ_chr(code) {
    if (code <= 65535) {
        return String.fromCharCode(code);
    }
    code -= 65536;
    return String.fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
};
if (!ρσ_chr.__argnames__) Object.defineProperties(ρσ_chr, {
    __argnames__ : {value: ["code"]}
});

function ρσ_callable(x) {
    return typeof x === "function";
};
if (!ρσ_callable.__argnames__) Object.defineProperties(ρσ_callable, {
    __argnames__ : {value: ["x"]}
});

function ρσ_bin(x) {
    var ans;
    if (typeof x !== "number" || x % 1 !== 0) {
        throw new TypeError("integer required");
    }
    ans = x.toString(2);
    if (ans[0] === "-") {
        ans = "-" + "0b" + ans.slice(1);
    } else {
        ans = "0b" + ans;
    }
    return ans;
};
if (!ρσ_bin.__argnames__) Object.defineProperties(ρσ_bin, {
    __argnames__ : {value: ["x"]}
});

function ρσ_hex(x) {
    var ans;
    if (typeof x !== "number" || x % 1 !== 0) {
        throw new TypeError("integer required");
    }
    ans = x.toString(16);
    if (ans[0] === "-") {
        ans = "-" + "0x" + ans.slice(1);
    } else {
        ans = "0x" + ans;
    }
    return ans;
};
if (!ρσ_hex.__argnames__) Object.defineProperties(ρσ_hex, {
    __argnames__ : {value: ["x"]}
});

function ρσ_enumerate(iterable) {
    var ans, iterator;
    ans = {"_i":-1};
    ans[ρσ_iterator_symbol] = function () {
        return this;
    };
    if (ρσ_arraylike(iterable)) {
        ans["next"] = function () {
            this._i += 1;
            if (this._i < iterable.length) {
                return {'done':false, 'value':[this._i, iterable[this._i]]};
            }
            return {'done':true};
        };
        return ans;
    }
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        ans["_iterator"] = iterator;
        ans["next"] = function () {
            var r;
            r = this._iterator.next();
            if (r.done) {
                return {'done':true};
            }
            this._i += 1;
            return {'done':false, 'value':[this._i, r.value]};
        };
        return ans;
    }
    return ρσ_enumerate(Object.keys(iterable));
};
if (!ρσ_enumerate.__argnames__) Object.defineProperties(ρσ_enumerate, {
    __argnames__ : {value: ["iterable"]}
});

function ρσ_reversed(iterable) {
    var ans;
    if (ρσ_arraylike(iterable)) {
        ans = {"_i": iterable.length};
        ans["next"] = function () {
            this._i -= 1;
            if (this._i > -1) {
                return {'done':false, 'value':iterable[this._i]};
            }
            return {'done':true};
        };
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        return ans;
    }
    throw new TypeError("reversed() can only be called on arrays or strings");
};
if (!ρσ_reversed.__argnames__) Object.defineProperties(ρσ_reversed, {
    __argnames__ : {value: ["iterable"]}
});

function ρσ_iter(iterable) {
    var ans;
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        return (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
    }
    if (ρσ_arraylike(iterable)) {
        ans = {"_i":-1};
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        ans["next"] = function () {
            this._i += 1;
            if (this._i < iterable.length) {
                return {'done':false, 'value':iterable[this._i]};
            }
            return {'done':true};
        };
        return ans;
    }
    return ρσ_iter(Object.keys(iterable));
};
if (!ρσ_iter.__argnames__) Object.defineProperties(ρσ_iter, {
    __argnames__ : {value: ["iterable"]}
});

function ρσ_range_next(step, length) {
    var ρσ_unpack;
    this._i += step;
    this._idx += 1;
    if (this._idx >= length) {
        ρσ_unpack = [this.__i, -1];
        this._i = ρσ_unpack[0];
        this._idx = ρσ_unpack[1];
        return {'done':true};
    }
    return {'done':false, 'value':this._i};
};
if (!ρσ_range_next.__argnames__) Object.defineProperties(ρσ_range_next, {
    __argnames__ : {value: ["step", "length"]}
});

function ρσ_range(start, stop, step) {
    var length, ans;
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    step = arguments[2] || 1;
    length = Math.max(Math.ceil((stop - start) / step), 0);
    ans = {start:start, step:step, stop:stop};
    ans[ρσ_iterator_symbol] = function () {
        var it;
        it = {"_i": start - step, "_idx": -1};
        it.next = ρσ_range_next.bind(it, step, length);
        it[ρσ_iterator_symbol] = function () {
            return this;
        };
        return it;
    };
    ans.count = (function() {
        var ρσ_anonfunc = function (val) {
            if (!this._cached) {
                this._cached = list(this);
            }
            return this._cached.count(val);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["val"]}
        });
        return ρσ_anonfunc;
    })();
    ans.index = (function() {
        var ρσ_anonfunc = function (val) {
            if (!this._cached) {
                this._cached = list(this);
            }
            return this._cached.index(val);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["val"]}
        });
        return ρσ_anonfunc;
    })();
    if (typeof Proxy === "function") {
        ans = new Proxy(ans, (function(){
            var ρσ_d = {};
            ρσ_d["get"] = (function() {
                var ρσ_anonfunc = function (obj, prop) {
                    var iprop;
                    if (typeof prop === "string") {
                        iprop = parseInt(prop);
                        if (!isNaN(iprop)) {
                            prop = iprop;
                        }
                    }
                    if (typeof prop === "number") {
                        if (!obj._cached) {
                            obj._cached = list(obj);
                        }
                        return (ρσ_expr_temp = obj._cached)[(typeof prop === "number" && prop < 0) ? ρσ_expr_temp.length + prop : prop];
                    }
                    return obj[(typeof prop === "number" && prop < 0) ? obj.length + prop : prop];
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["obj", "prop"]}
                });
                return ρσ_anonfunc;
            })();
            return ρσ_d;
        }).call(this));
    }
    return ans;
};
if (!ρσ_range.__argnames__) Object.defineProperties(ρσ_range, {
    __argnames__ : {value: ["start", "stop", "step"]}
});

function ρσ_getattr(obj, name, defval) {
    var ret;
    try {
        ret = obj[(typeof name === "number" && name < 0) ? obj.length + name : name];
    } catch (ρσ_Exception) {
        ρσ_last_exception = ρσ_Exception;
        if (ρσ_Exception instanceof TypeError) {
            if (defval === undefined) {
                throw new AttributeError("The attribute " + name + " is not present");
            }
            return defval;
        } else {
            throw ρσ_Exception;
        }
    }
    if (ret === undefined && !(name in obj)) {
        if (defval === undefined) {
            throw new AttributeError("The attribute " + name + " is not present");
        }
        ret = defval;
    }
    return ret;
};
if (!ρσ_getattr.__argnames__) Object.defineProperties(ρσ_getattr, {
    __argnames__ : {value: ["obj", "name", "defval"]}
});

function ρσ_setattr(obj, name, value) {
    obj[(typeof name === "number" && name < 0) ? obj.length + name : name] = value;
};
if (!ρσ_setattr.__argnames__) Object.defineProperties(ρσ_setattr, {
    __argnames__ : {value: ["obj", "name", "value"]}
});

function ρσ_hasattr(obj, name) {
    return name in obj;
};
if (!ρσ_hasattr.__argnames__) Object.defineProperties(ρσ_hasattr, {
    __argnames__ : {value: ["obj", "name"]}
});

ρσ_len = function () {
    function len(obj) {
        if (ρσ_arraylike(obj)) {
            return obj.length;
        }
        if (typeof obj.__len__ === "function") {
            return obj.__len__();
        }
        if (obj instanceof Set || obj instanceof Map) {
            return obj.size;
        }
        return Object.keys(obj).length;
    };
    if (!len.__argnames__) Object.defineProperties(len, {
        __argnames__ : {value: ["obj"]}
    });

    function len5(obj) {
        if (ρσ_arraylike(obj)) {
            return obj.length;
        }
        if (typeof obj.__len__ === "function") {
            return obj.__len__();
        }
        return Object.keys(obj).length;
    };
    if (!len5.__argnames__) Object.defineProperties(len5, {
        __argnames__ : {value: ["obj"]}
    });

    return (typeof Set === "function" && typeof Map === "function") ? len : len5;
}();
function ρσ_get_module(name) {
    return ρσ_modules[(typeof name === "number" && name < 0) ? ρσ_modules.length + name : name];
};
if (!ρσ_get_module.__argnames__) Object.defineProperties(ρσ_get_module, {
    __argnames__ : {value: ["name"]}
});

function ρσ_pow(x, y, z) {
    var ans;
    ans = Math.pow(x, y);
    if (z !== undefined) {
        ans %= z;
    }
    return ans;
};
if (!ρσ_pow.__argnames__) Object.defineProperties(ρσ_pow, {
    __argnames__ : {value: ["x", "y", "z"]}
});

function ρσ_type(x) {
    return x.constructor;
};
if (!ρσ_type.__argnames__) Object.defineProperties(ρσ_type, {
    __argnames__ : {value: ["x"]}
});

function ρσ_divmod(x, y) {
    var d;
    if (y === 0) {
        throw new ZeroDivisionError("integer division or modulo by zero");
    }
    d = Math.floor(x / y);
    return [d, x - d * y];
};
if (!ρσ_divmod.__argnames__) Object.defineProperties(ρσ_divmod, {
    __argnames__ : {value: ["x", "y"]}
});

function ρσ_max() {
    var kwargs = arguments[arguments.length-1];
    if (kwargs === null || typeof kwargs !== "object" || kwargs [ρσ_kwargs_symbol] !== true) kwargs = {};
    var args = Array.prototype.slice.call(arguments, 0);
    if (kwargs !== null && typeof kwargs === "object" && kwargs [ρσ_kwargs_symbol] === true) args.pop();
    var args, x;
    if (args.length === 0) {
        if (kwargs.defval !== undefined) {
            return kwargs.defval;
        }
        throw new TypeError("expected at least one argument");
    }
    if (args.length === 1) {
        args = args[0];
    }
    if (kwargs.key) {
        args = (function() {
            var ρσ_Iter = ρσ_Iterable(args), ρσ_Result = [], x;
            for (var ρσ_Index = 0; ρσ_Index < ρσ_Iter.length; ρσ_Index++) {
                x = ρσ_Iter[ρσ_Index];
                ρσ_Result.push(kwargs.key(x));
            }
            ρσ_Result = ρσ_list_constructor(ρσ_Result);
            return ρσ_Result;
        })();
    }
    if (!Array.isArray(args)) {
        args = list(args);
    }
    if (args.length) {
        return this.apply(null, args);
    }
    if (kwargs.defval !== undefined) {
        return kwargs.defval;
    }
    throw new TypeError("expected at least one argument");
};
if (!ρσ_max.__handles_kwarg_interpolation__) Object.defineProperties(ρσ_max, {
    __handles_kwarg_interpolation__ : {value: true}
});

var abs = Math.abs, max = ρσ_max.bind(Math.max), min = ρσ_max.bind(Math.min), bool = ρσ_bool, type = ρσ_type;
var float = ρσ_float, int = ρσ_int, arraylike = ρσ_arraylike_creator(), ρσ_arraylike = arraylike;
var print = ρσ_print, id = ρσ_id, get_module = ρσ_get_module, pow = ρσ_pow, divmod = ρσ_divmod;
var dir = ρσ_dir, ord = ρσ_ord, chr = ρσ_chr, bin = ρσ_bin, hex = ρσ_hex, callable = ρσ_callable;
var enumerate = ρσ_enumerate, iter = ρσ_iter, reversed = ρσ_reversed, len = ρσ_len;
var range = ρσ_range, getattr = ρσ_getattr, setattr = ρσ_setattr, hasattr = ρσ_hasattr;function ρσ_equals(a, b) {
    var ρσ_unpack, akeys, bkeys, key;
    if (a === b) {
        return true;
    }
    if (a && typeof a.__eq__ === "function") {
        return a.__eq__(b);
    }
    if (b && typeof b.__eq__ === "function") {
        return b.__eq__(a);
    }
    if (ρσ_arraylike(a) && ρσ_arraylike(b)) {
        if ((a.length !== b.length && (typeof a.length !== "object" || ρσ_not_equals(a.length, b.length)))) {
            return false;
        }
        for (var i=0; i < a.length; i++) {
            if (!((a[(typeof i === "number" && i < 0) ? a.length + i : i] === b[(typeof i === "number" && i < 0) ? b.length + i : i] || typeof a[(typeof i === "number" && i < 0) ? a.length + i : i] === "object" && ρσ_equals(a[(typeof i === "number" && i < 0) ? a.length + i : i], b[(typeof i === "number" && i < 0) ? b.length + i : i])))) {
                return false;
            }
        }
        return true;
    }
    if (typeof a === "object" && typeof b === "object" && a !== null && b !== null && (a.constructor === Object && b.constructor === Object || Object.getPrototypeOf(a) === null && Object.getPrototypeOf(b) === null)) {
        ρσ_unpack = [Object.keys(a), Object.keys(b)];
        akeys = ρσ_unpack[0];
        bkeys = ρσ_unpack[1];
        if (akeys.length !== bkeys.length) {
            return false;
        }
        for (var j=0; j < akeys.length; j++) {
            key = akeys[(typeof j === "number" && j < 0) ? akeys.length + j : j];
            if (!((a[(typeof key === "number" && key < 0) ? a.length + key : key] === b[(typeof key === "number" && key < 0) ? b.length + key : key] || typeof a[(typeof key === "number" && key < 0) ? a.length + key : key] === "object" && ρσ_equals(a[(typeof key === "number" && key < 0) ? a.length + key : key], b[(typeof key === "number" && key < 0) ? b.length + key : key])))) {
                return false;
            }
        }
        return true;
    }
    return false;
};
if (!ρσ_equals.__argnames__) Object.defineProperties(ρσ_equals, {
    __argnames__ : {value: ["a", "b"]}
});

function ρσ_not_equals(a, b) {
    if (a === b) {
        return false;
    }
    if (a && typeof a.__ne__ === "function") {
        return a.__ne__(b);
    }
    if (b && typeof b.__ne__ === "function") {
        return b.__ne__(a);
    }
    return !ρσ_equals(a, b);
};
if (!ρσ_not_equals.__argnames__) Object.defineProperties(ρσ_not_equals, {
    __argnames__ : {value: ["a", "b"]}
});

var equals = ρσ_equals;
function ρσ_list_extend(iterable) {
    var start, iterator, result;
    if (Array.isArray(iterable) || typeof iterable === "string") {
        start = this.length;
        this.length += iterable.length;
        for (var i = 0; i < iterable.length; i++) {
            (ρσ_expr_temp = this)[ρσ_bound_index(start + i, ρσ_expr_temp)] = iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i];
        }
    } else {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        result = iterator.next();
        while (!result.done) {
            this.push(result.value);
            result = iterator.next();
        }
    }
};
if (!ρσ_list_extend.__argnames__) Object.defineProperties(ρσ_list_extend, {
    __argnames__ : {value: ["iterable"]}
});

function ρσ_list_index(val, start, stop) {
    var idx;
    start = start || 0;
    if (start < 0) {
        start = this.length + start;
    }
    if (start < 0) {
        throw new ValueError(val + " is not in list");
    }
    if (stop === undefined) {
        idx = this.indexOf(val, start);
        if (idx === -1) {
            throw new ValueError(val + " is not in list");
        }
        return idx;
    }
    if (stop < 0) {
        stop = this.length + stop;
    }
    for (var i = start; i < stop; i++) {
        if (((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === val || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], val))) {
            return i;
        }
    }
    throw new ValueError(val + " is not in list");
};
if (!ρσ_list_index.__argnames__) Object.defineProperties(ρσ_list_index, {
    __argnames__ : {value: ["val", "start", "stop"]}
});

function ρσ_list_pop(index) {
    var ans;
    if (this.length === 0) {
        throw new IndexError("list is empty");
    }
    if (index === undefined) {
        index = -1;
    }
    ans = this.splice(index, 1);
    if (!ans.length) {
        throw new IndexError("pop index out of range");
    }
    return ans[0];
};
if (!ρσ_list_pop.__argnames__) Object.defineProperties(ρσ_list_pop, {
    __argnames__ : {value: ["index"]}
});

function ρσ_list_remove(value) {
    var idx;
    idx = this.indexOf(value);
    if (idx === -1) {
        throw new ValueError(value + " not in list");
    }
    this.splice(idx, 1);
};
if (!ρσ_list_remove.__argnames__) Object.defineProperties(ρσ_list_remove, {
    __argnames__ : {value: ["value"]}
});

function ρσ_list_to_string() {
    return "[" + this.join(", ") + "]";
};

function ρσ_list_insert(index, val) {
    if (index < 0) {
        index += this.length;
    }
    index = min(this.length, max(index, 0));
    if (index === 0) {
        this.unshift(val);
        return;
    }
    for (var i = this.length; i > index; i--) {
        (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = (ρσ_expr_temp = this)[ρσ_bound_index(i - 1, ρσ_expr_temp)];
    }
    (ρσ_expr_temp = this)[(typeof index === "number" && index < 0) ? ρσ_expr_temp.length + index : index] = val;
};
if (!ρσ_list_insert.__argnames__) Object.defineProperties(ρσ_list_insert, {
    __argnames__ : {value: ["index", "val"]}
});

function ρσ_list_copy() {
    return ρσ_list_constructor(this);
};

function ρσ_list_clear() {
    this.length = 0;
};

function ρσ_list_as_array() {
    return Array.prototype.slice.call(this);
};

function ρσ_list_count(value) {
    return this.reduce((function() {
        var ρσ_anonfunc = function (n, val) {
            return n + (val === value);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["n", "val"]}
        });
        return ρσ_anonfunc;
    })(), 0);
};
if (!ρσ_list_count.__argnames__) Object.defineProperties(ρσ_list_count, {
    __argnames__ : {value: ["value"]}
});

function ρσ_list_sort_key(value) {
    var t;
    t = typeof value;
    if (t === "string" || t === "number") {
        return value;
    }
    return value.toString();
};
if (!ρσ_list_sort_key.__argnames__) Object.defineProperties(ρσ_list_sort_key, {
    __argnames__ : {value: ["value"]}
});

function ρσ_list_sort_cmp(a, b, ap, bp) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return ap - bp;
};
if (!ρσ_list_sort_cmp.__argnames__) Object.defineProperties(ρσ_list_sort_cmp, {
    __argnames__ : {value: ["a", "b", "ap", "bp"]}
});

function ρσ_list_sort() {
    var key = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_list_sort.__defaults__.key : arguments[0];
    var reverse = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_list_sort.__defaults__.reverse : arguments[1];
    var ρσ_kwargs_obj = arguments[arguments.length-1];
    if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "key")){
        key = ρσ_kwargs_obj.key;
    }
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "reverse")){
        reverse = ρσ_kwargs_obj.reverse;
    }
    var mult, keymap, posmap, k;
    key = key || ρσ_list_sort_key;
    mult = (reverse) ? -1 : 1;
    keymap = dict();
    posmap = dict();
    for (var i=0; i < this.length; i++) {
        k = (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
        keymap.set(k, key(k));
        posmap.set(k, i);
    }
    this.sort((function() {
        var ρσ_anonfunc = function (a, b) {
            return mult * ρσ_list_sort_cmp(keymap.get(a), keymap.get(b), posmap.get(a), posmap.get(b));
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["a", "b"]}
        });
        return ρσ_anonfunc;
    })());
};
if (!ρσ_list_sort.__defaults__) Object.defineProperties(ρσ_list_sort, {
    __defaults__ : {value: {key:null, reverse:false}},
    __handles_kwarg_interpolation__ : {value: true},
    __argnames__ : {value: ["key", "reverse"]}
});

function ρσ_list_concat() {
    var ans;
    ans = Array.prototype.concat.apply(this, arguments);
    ρσ_list_decorate(ans);
    return ans;
};

function ρσ_list_slice() {
    var ans;
    ans = Array.prototype.slice.apply(this, arguments);
    ρσ_list_decorate(ans);
    return ans;
};

function ρσ_list_iterator(value) {
    var self;
    self = this;
    return (function(){
        var ρσ_d = {};
        ρσ_d["_i"] = -1;
        ρσ_d["_list"] = self;
        ρσ_d["next"] = function () {
            this._i += 1;
            if (this._i >= this._list.length) {
                return (function(){
                    var ρσ_d = {};
                    ρσ_d["done"] = true;
                    return ρσ_d;
                }).call(this);
            }
            return (function(){
                var ρσ_d = {};
                ρσ_d["done"] = false;
                ρσ_d["value"] = (ρσ_expr_temp = this._list)[ρσ_bound_index(this._i, ρσ_expr_temp)];
                return ρσ_d;
            }).call(this);
        };
        return ρσ_d;
    }).call(this);
};
if (!ρσ_list_iterator.__argnames__) Object.defineProperties(ρσ_list_iterator, {
    __argnames__ : {value: ["value"]}
});

function ρσ_list_len() {
    return this.length;
};

function ρσ_list_contains(val) {
    for (var i = 0; i < this.length; i++) {
        if (((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === val || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], val))) {
            return true;
        }
    }
    return false;
};
if (!ρσ_list_contains.__argnames__) Object.defineProperties(ρσ_list_contains, {
    __argnames__ : {value: ["val"]}
});

function ρσ_list_eq(other) {
    if (!ρσ_arraylike(other)) {
        return false;
    }
    if ((this.length !== other.length && (typeof this.length !== "object" || ρσ_not_equals(this.length, other.length)))) {
        return false;
    }
    for (var i = 0; i < this.length; i++) {
        if (!(((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === other[(typeof i === "number" && i < 0) ? other.length + i : i] || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], other[(typeof i === "number" && i < 0) ? other.length + i : i])))) {
            return false;
        }
    }
    return true;
};
if (!ρσ_list_eq.__argnames__) Object.defineProperties(ρσ_list_eq, {
    __argnames__ : {value: ["other"]}
});

function ρσ_list_decorate(ans) {
    ans.append = Array.prototype.push;
    ans.toString = ρσ_list_to_string;
    ans.inspect = ρσ_list_to_string;
    ans.extend = ρσ_list_extend;
    ans.index = ρσ_list_index;
    ans.pypop = ρσ_list_pop;
    ans.remove = ρσ_list_remove;
    ans.insert = ρσ_list_insert;
    ans.copy = ρσ_list_copy;
    ans.clear = ρσ_list_clear;
    ans.count = ρσ_list_count;
    ans.concat = ρσ_list_concat;
    ans.pysort = ρσ_list_sort;
    ans.slice = ρσ_list_slice;
    ans.as_array = ρσ_list_as_array;
    ans.__len__ = ρσ_list_len;
    ans.__contains__ = ρσ_list_contains;
    ans.__eq__ = ρσ_list_eq;
    ans.constructor = ρσ_list_constructor;
    if (typeof ans[ρσ_iterator_symbol] !== "function") {
        ans[ρσ_iterator_symbol] = ρσ_list_iterator;
    }
    return ans;
};
if (!ρσ_list_decorate.__argnames__) Object.defineProperties(ρσ_list_decorate, {
    __argnames__ : {value: ["ans"]}
});

function ρσ_list_constructor(iterable) {
    var ans, iterator, result;
    if (iterable === undefined) {
        ans = [];
    } else if (ρσ_arraylike(iterable)) {
        ans = new Array(iterable.length);
        for (var i = 0; i < iterable.length; i++) {
            ans[(typeof i === "number" && i < 0) ? ans.length + i : i] = iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i];
        }
    } else if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        ans = ρσ_list_decorate([]);
        result = iterator.next();
        while (!result.done) {
            ans.push(result.value);
            result = iterator.next();
        }
    } else if (typeof iterable === "number") {
        ans = new Array(iterable);
    } else {
        ans = Object.keys(iterable);
    }
    return ρσ_list_decorate(ans);
};
if (!ρσ_list_constructor.__argnames__) Object.defineProperties(ρσ_list_constructor, {
    __argnames__ : {value: ["iterable"]}
});

ρσ_list_constructor.__name__ = "list";
var list = ρσ_list_constructor, list_wrap = ρσ_list_decorate;
function sorted() {
    var iterable = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
    var key = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sorted.__defaults__.key : arguments[1];
    var reverse = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sorted.__defaults__.reverse : arguments[2];
    var ρσ_kwargs_obj = arguments[arguments.length-1];
    if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "key")){
        key = ρσ_kwargs_obj.key;
    }
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "reverse")){
        reverse = ρσ_kwargs_obj.reverse;
    }
    var ans;
    ans = ρσ_list_constructor(iterable);
    ans.pysort(key, reverse);
    return ans;
};
if (!sorted.__defaults__) Object.defineProperties(sorted, {
    __defaults__ : {value: {key:null, reverse:false}},
    __handles_kwarg_interpolation__ : {value: true},
    __argnames__ : {value: ["iterable", "key", "reverse"]}
});

var ρσ_global_object_id = 0, ρσ_set_implementation;
function ρσ_set_keyfor(x) {
    var t, ans;
    t = typeof x;
    if (t === "string" || t === "number" || t === "boolean") {
        return "_" + t[0] + x;
    }
    if (x === null) {
        return "__!@#$0";
    }
    ans = x.ρσ_hash_key_prop;
    if (ans === undefined) {
        ans = "_!@#$" + (++ρσ_global_object_id);
        Object.defineProperty(x, "ρσ_hash_key_prop", (function(){
            var ρσ_d = {};
            ρσ_d["value"] = ans;
            return ρσ_d;
        }).call(this));
    }
    return ans;
};
if (!ρσ_set_keyfor.__argnames__) Object.defineProperties(ρσ_set_keyfor, {
    __argnames__ : {value: ["x"]}
});

function ρσ_set_polyfill() {
    this._store = {};
    this.size = 0;
};

ρσ_set_polyfill.prototype.add = (function() {
    var ρσ_anonfunc = function (x) {
        var key;
        key = ρσ_set_keyfor(x);
        if (!Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size += 1;
            (ρσ_expr_temp = this._store)[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = x;
        }
        return this;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.clear = (function() {
    var ρσ_anonfunc = function (x) {
        this._store = {};
        this.size = 0;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.delete = (function() {
    var ρσ_anonfunc = function (x) {
        var key;
        key = ρσ_set_keyfor(x);
        if (Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size -= 1;
            delete this._store[key];
            return true;
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.has = (function() {
    var ρσ_anonfunc = function (x) {
        return Object.prototype.hasOwnProperty.call(this._store, ρσ_set_keyfor(x));
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.values = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        ans["next"] = function () {
            this._i += 1;
            if (this._i >= this._keys.length) {
                return {'done': true};
            }
            return {'done':false, 'value':this._s[this._keys[this._i]]};
        };
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
if (typeof Set !== "function" || typeof Set.prototype.delete !== "function") {
    ρσ_set_implementation = ρσ_set_polyfill;
} else {
    ρσ_set_implementation = Set;
}
function ρσ_set(iterable) {
    var ans, s, iterator, result, keys;
    if (this instanceof ρσ_set) {
        this.jsset = new ρσ_set_implementation;
        ans = this;
        if (iterable === undefined) {
            return ans;
        }
        s = ans.jsset;
        if (ρσ_arraylike(iterable)) {
            for (var i = 0; i < iterable.length; i++) {
                s.add(iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i]);
            }
        } else if (typeof iterable[ρσ_iterator_symbol] === "function") {
            iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
            result = iterator.next();
            while (!result.done) {
                s.add(result.value);
                result = iterator.next();
            }
        } else {
            keys = Object.keys(iterable);
            for (var j=0; j < keys.length; j++) {
                s.add(keys[(typeof j === "number" && j < 0) ? keys.length + j : j]);
            }
        }
        return ans;
    } else {
        return new ρσ_set(iterable);
    }
};
if (!ρσ_set.__argnames__) Object.defineProperties(ρσ_set, {
    __argnames__ : {value: ["iterable"]}
});

ρσ_set.prototype.__name__ = "set";
Object.defineProperties(ρσ_set.prototype, (function(){
    var ρσ_d = {};
    ρσ_d["length"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = function () {
            return this.jsset.size;
        };
        return ρσ_d;
    }).call(this);
    ρσ_d["size"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = function () {
            return this.jsset.size;
        };
        return ρσ_d;
    }).call(this);
    return ρσ_d;
}).call(this));
ρσ_set.prototype.__len__ = function () {
    return this.jsset.size;
};
ρσ_set.prototype.has = ρσ_set.prototype.__contains__ = (function() {
    var ρσ_anonfunc = function (x) {
        return this.jsset.has(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.add = (function() {
    var ρσ_anonfunc = function (x) {
        this.jsset.add(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.clear = function () {
    this.jsset.clear();
};
ρσ_set.prototype.copy = function () {
    return ρσ_set(this);
};
ρσ_set.prototype.discard = (function() {
    var ρσ_anonfunc = function (x) {
        this.jsset.delete(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype[ρσ_iterator_symbol] = function () {
    return this.jsset.values();
};
ρσ_set.prototype.difference = function () {
    var ans, s, iterator, r, x, has;
    ans = new ρσ_set;
    s = ans.jsset;
    iterator = this.jsset.values();
    r = iterator.next();
    while (!r.done) {
        x = r.value;
        has = false;
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                has = true;
                break;
            }
        }
        if (!has) {
            s.add(x);
        }
        r = iterator.next();
    }
    return ans;
};
ρσ_set.prototype.difference_update = function () {
    var s, remove, iterator, r, x;
    s = this.jsset;
    remove = [];
    iterator = s.values();
    r = iterator.next();
    while (!r.done) {
        x = r.value;
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                remove.push(x);
                break;
            }
        }
        r = iterator.next();
    }
    for (var j = 0; j < remove.length; j++) {
        s.delete(remove[(typeof j === "number" && j < 0) ? remove.length + j : j]);
    }
};
ρσ_set.prototype.intersection = function () {
    var ans, s, iterator, r, x, has;
    ans = new ρσ_set;
    s = ans.jsset;
    iterator = this.jsset.values();
    r = iterator.next();
    while (!r.done) {
        x = r.value;
        has = true;
        for (var i = 0; i < arguments.length; i++) {
            if (!arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                has = false;
                break;
            }
        }
        if (has) {
            s.add(x);
        }
        r = iterator.next();
    }
    return ans;
};
ρσ_set.prototype.intersection_update = function () {
    var s, remove, iterator, r, x;
    s = this.jsset;
    remove = [];
    iterator = s.values();
    r = iterator.next();
    while (!r.done) {
        x = r.value;
        for (var i = 0; i < arguments.length; i++) {
            if (!arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                remove.push(x);
                break;
            }
        }
        r = iterator.next();
    }
    for (var j = 0; j < remove.length; j++) {
        s.delete(remove[(typeof j === "number" && j < 0) ? remove.length + j : j]);
    }
};
ρσ_set.prototype.isdisjoint = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r, x;
        iterator = this.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            if (other.has(x)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.issubset = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r, x;
        iterator = this.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            if (!other.has(x)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.issuperset = (function() {
    var ρσ_anonfunc = function (other) {
        var s, iterator, r, x;
        s = this.jsset;
        iterator = other.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            if (!s.has(x)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.pop = function () {
    var iterator, r;
    iterator = this.jsset.values();
    r = iterator.next();
    if (r.done) {
        throw new KeyError("pop from an empty set");
    }
    this.jsset.delete(r.value);
    return r.value;
};
ρσ_set.prototype.remove = (function() {
    var ρσ_anonfunc = function (x) {
        if (!this.jsset.delete(x)) {
            throw new KeyError(x.toString());
        }
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.symmetric_difference = (function() {
    var ρσ_anonfunc = function (other) {
        return this.union(other).difference(this.intersection(other));
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.symmetric_difference_update = (function() {
    var ρσ_anonfunc = function (other) {
        var common;
        common = this.intersection(other);
        this.update(other);
        this.difference_update(common);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.union = function () {
    var ans;
    ans = ρσ_set(this);
    ans.update.apply(ans, arguments);
    return ans;
};
ρσ_set.prototype.update = function () {
    var s, iterator, r;
    s = this.jsset;
    for (var i=0; i < arguments.length; i++) {
        iterator = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i][ρσ_iterator_symbol]();
        r = iterator.next();
        while (!r.done) {
            s.add(r.value);
            r = iterator.next();
        }
    }
};
ρσ_set.prototype.toString = ρσ_set.prototype.__repr__ = ρσ_set.prototype.__str__ = ρσ_set.prototype.inspect = function () {
    return "{" + list(this).join(", ") + "}";
};
ρσ_set.prototype.__eq__ = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r;
        if (!other instanceof this.constructor) {
            return false;
        }
        if (other.size !== this.size) {
            return false;
        }
        if (other.size === 0) {
            return true;
        }
        iterator = other[ρσ_iterator_symbol]();
        r = iterator.next();
        while (!r.done) {
            if (!this.has(r.value)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
function ρσ_set_wrap(x) {
    var ans;
    ans = new ρσ_set;
    ans.jsset = x;
    return ans;
};
if (!ρσ_set_wrap.__argnames__) Object.defineProperties(ρσ_set_wrap, {
    __argnames__ : {value: ["x"]}
});

var set = ρσ_set, set_wrap = ρσ_set_wrap;
var ρσ_dict_implementation;
function ρσ_dict_polyfill() {
    this._store = {};
    this.size = 0;
};

ρσ_dict_polyfill.prototype.set = (function() {
    var ρσ_anonfunc = function (x, value) {
        var key;
        key = ρσ_set_keyfor(x);
        if (!Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size += 1;
        }
        (ρσ_expr_temp = this._store)[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = [x, value];
        return this;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x", "value"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.clear = (function() {
    var ρσ_anonfunc = function (x) {
        this._store = {};
        this.size = 0;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.delete = (function() {
    var ρσ_anonfunc = function (x) {
        var key;
        key = ρσ_set_keyfor(x);
        if (Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size -= 1;
            delete this._store[key];
            return true;
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.has = (function() {
    var ρσ_anonfunc = function (x) {
        return Object.prototype.hasOwnProperty.call(this._store, ρσ_set_keyfor(x));
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.get = (function() {
    var ρσ_anonfunc = function (x) {
        try {
            return (ρσ_expr_temp = this._store)[ρσ_bound_index(ρσ_set_keyfor(x), ρσ_expr_temp)][1];
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            if (ρσ_Exception instanceof TypeError) {
                return undefined;
            } else {
                throw ρσ_Exception;
            }
        }
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.values = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        ans["next"] = function () {
            this._i += 1;
            if (this._i >= this._keys.length) {
                return {'done': true};
            }
            return {'done':false, 'value':this._s[this._keys[this._i]][1]};
        };
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.keys = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        ans["next"] = function () {
            this._i += 1;
            if (this._i >= this._keys.length) {
                return {'done': true};
            }
            return {'done':false, 'value':this._s[this._keys[this._i]][0]};
        };
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.entries = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = function () {
            return this;
        };
        ans["next"] = function () {
            this._i += 1;
            if (this._i >= this._keys.length) {
                return {'done': true};
            }
            return {'done':false, 'value':this._s[this._keys[this._i]]};
        };
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
if (typeof Map !== "function" || typeof Map.prototype.delete !== "function") {
    ρσ_dict_implementation = ρσ_dict_polyfill;
} else {
    ρσ_dict_implementation = Map;
}
function ρσ_dict() {
    var iterable = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
    var kw = arguments[arguments.length-1];
    if (kw === null || typeof kw !== "object" || kw [ρσ_kwargs_symbol] !== true) kw = {};
    if (this instanceof ρσ_dict) {
        this.jsmap = new ρσ_dict_implementation;
        if (iterable !== undefined) {
            this.update(iterable);
        }
        this.update(kw);
        return this;
    } else {
        return ρσ_interpolate_kwargs_constructor.call(Object.create(ρσ_dict.prototype), false, ρσ_dict, [iterable].concat([ρσ_desugar_kwargs(kw)]));
    }
};
if (!ρσ_dict.__handles_kwarg_interpolation__) Object.defineProperties(ρσ_dict, {
    __handles_kwarg_interpolation__ : {value: true},
    __argnames__ : {value: ["iterable"]}
});

ρσ_dict.prototype.__name__ = "dict";
Object.defineProperties(ρσ_dict.prototype, (function(){
    var ρσ_d = {};
    ρσ_d["length"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = function () {
            return this.jsmap.size;
        };
        return ρσ_d;
    }).call(this);
    ρσ_d["size"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = function () {
            return this.jsmap.size;
        };
        return ρσ_d;
    }).call(this);
    return ρσ_d;
}).call(this));
ρσ_dict.prototype.__len__ = function () {
    return this.jsmap.size;
};
ρσ_dict.prototype.has = ρσ_dict.prototype.__contains__ = (function() {
    var ρσ_anonfunc = function (x) {
        return this.jsmap.has(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.set = ρσ_dict.prototype.__setitem__ = (function() {
    var ρσ_anonfunc = function (key, value) {
        this.jsmap.set(key, value);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "value"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.__delitem__ = (function() {
    var ρσ_anonfunc = function (key) {
        this.jsmap.delete(key);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.clear = function () {
    this.jsmap.clear();
};
ρσ_dict.prototype.copy = function () {
    return ρσ_dict(this);
};
ρσ_dict.prototype.keys = function () {
    return this.jsmap.keys();
};
ρσ_dict.prototype.values = function () {
    return this.jsmap.values();
};
ρσ_dict.prototype.items = ρσ_dict.prototype.entries = function () {
    return this.jsmap.entries();
};
ρσ_dict.prototype[ρσ_iterator_symbol] = function () {
    return this.jsmap.keys();
};
ρσ_dict.prototype.__getitem__ = (function() {
    var ρσ_anonfunc = function (key) {
        var ans;
        ans = this.jsmap.get(key);
        if (ans === undefined && !this.jsmap.has(key)) {
            throw new KeyError(key + "");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.get = (function() {
    var ρσ_anonfunc = function (key, defval) {
        var ans;
        ans = this.jsmap.get(key);
        if (ans === undefined && !this.jsmap.has(key)) {
            return (defval === undefined) ? null : defval;
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "defval"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.set_default = (function() {
    var ρσ_anonfunc = function (key, defval) {
        var j;
        j = this.jsmap;
        if (!j.has(key)) {
            j.set(key, defval);
            return defval;
        }
        return j.get(key);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "defval"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.fromkeys = ρσ_dict.prototype.fromkeys = (function() {
    var ρσ_anonfunc = function () {
        var iterable = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var value = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.value : arguments[1];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "value")){
            value = ρσ_kwargs_obj.value;
        }
        var ans, iterator, r;
        ans = ρσ_dict();
        iterator = iter(iterable);
        r = iterator.next();
        while (!r.done) {
            ans.set(r.value, value);
            r = iterator.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
        __defaults__ : {value: {value:null}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["iterable", "value"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.pop = (function() {
    var ρσ_anonfunc = function (key, defval) {
        var ans;
        ans = this.jsmap.get(key);
        if (ans === undefined && !this.jsmap.has(key)) {
            if (defval === undefined) {
                throw new KeyError(key);
            }
            return defval;
        }
        this.jsmap.delete(key);
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "defval"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.popitem = function () {
    var r;
    r = this.jsmap.entries().next();
    if (r.done) {
        throw new KeyError("dict is empty");
    }
    this.jsmap.delete(r.value[0]);
    return r.value;
};
ρσ_dict.prototype.update = function () {
    var m, iterable, iterator, result, keys;
    if (arguments.length === 0) {
        return;
    }
    m = this.jsmap;
    iterable = arguments[0];
    if (Array.isArray(iterable)) {
        for (var i = 0; i < iterable.length; i++) {
            m.set(iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i][0], iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i][1]);
        }
    } else if (iterable instanceof ρσ_dict) {
        iterator = iterable.items();
        result = iterator.next();
        while (!result.done) {
            m.set(result.value[0], result.value[1]);
            result = iterator.next();
        }
    } else if (typeof Map === "function" && iterable instanceof Map) {
        iterator = iterable.entries();
        result = iterator.next();
        while (!result.done) {
            m.set(result.value[0], result.value[1]);
            result = iterator.next();
        }
    } else if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = iterable[ρσ_iterator_symbol]();
        result = iterator.next();
        while (!result.done) {
            m.set(result.value[0], result.value[1]);
            result = iterator.next();
        }
    } else {
        keys = Object.keys(iterable);
        for (var j=0; j < keys.length; j++) {
            if (keys[(typeof j === "number" && j < 0) ? keys.length + j : j] !== ρσ_iterator_symbol) {
                m.set(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], iterable[ρσ_bound_index(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], iterable)]);
            }
        }
    }
    if (arguments.length > 1) {
        ρσ_dict.prototype.update.call(this, arguments[1]);
    }
};
ρσ_dict.prototype.toString = ρσ_dict.prototype.inspect = ρσ_dict.prototype.__str__ = ρσ_dict.prototype.__repr__ = function () {
    var entries, iterator, r;
    entries = [];
    iterator = this.jsmap.entries();
    r = iterator.next();
    while (!r.done) {
        entries.push(ρσ_repr(r.value[0]) + ": " + ρσ_repr(r.value[1]));
        r = iterator.next();
    }
    return "{" + entries.join(", ") + "}";
};
ρσ_dict.prototype.__eq__ = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r, x;
        if (!(other instanceof this.constructor)) {
            return false;
        }
        if (other.size !== this.size) {
            return false;
        }
        if (other.size === 0) {
            return true;
        }
        iterator = other.items();
        r = iterator.next();
        while (!r.done) {
            x = this.jsmap.get(r.value[0]);
            if (x === undefined && !this.jsmap.has(r.value[0]) || x !== r.value[1]) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.as_object = (function() {
    var ρσ_anonfunc = function (other) {
        var ans, iterator, r;
        ans = {};
        iterator = this.jsmap.entries();
        r = iterator.next();
        while (!r.done) {
            ans[ρσ_bound_index(r.value[0], ans)] = r.value[1];
            r = iterator.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]}
    });
    return ρσ_anonfunc;
})();
function ρσ_dict_wrap(x) {
    var ans;
    ans = new ρσ_dict;
    ans.jsmap = x;
    return ans;
};
if (!ρσ_dict_wrap.__argnames__) Object.defineProperties(ρσ_dict_wrap, {
    __argnames__ : {value: ["x"]}
});

var dict = ρσ_dict, dict_wrap = ρσ_dict_wrap;// }}}
var NameError;
NameError = ReferenceError;
function Exception() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    Exception.prototype.__init__.apply(this, arguments);
}
ρσ_extends(Exception, Error);
Exception.prototype.__init__ = function __init__(message) {
    var self = this;
    self.message = message;
    self.stack = (new Error).stack;
    self.name = self.constructor.name;
};
if (!Exception.prototype.__init__.__argnames__) Object.defineProperties(Exception.prototype.__init__, {
    __argnames__ : {value: ["message"]}
});
Exception.__argnames__ = Exception.prototype.__init__.__argnames__;
Exception.__handles_kwarg_interpolation__ = Exception.prototype.__init__.__handles_kwarg_interpolation__;
Exception.prototype.__repr__ = function __repr__() {
    var self = this;
    return self.name + ": " + self.message;
};
Exception.prototype.__str__ = function __str__ () {
    if(Error.prototype.__str__) return Error.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(Exception.prototype, "__bases__", {value: [Error]});

function AttributeError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    AttributeError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(AttributeError, Exception);
AttributeError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
AttributeError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
AttributeError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(AttributeError.prototype, "__bases__", {value: [Exception]});


function IndexError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    IndexError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(IndexError, Exception);
IndexError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
IndexError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
IndexError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(IndexError.prototype, "__bases__", {value: [Exception]});


function KeyError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    KeyError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(KeyError, Exception);
KeyError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
KeyError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
KeyError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(KeyError.prototype, "__bases__", {value: [Exception]});


function ValueError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    ValueError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(ValueError, Exception);
ValueError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
ValueError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
ValueError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(ValueError.prototype, "__bases__", {value: [Exception]});


function UnicodeDecodeError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    UnicodeDecodeError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(UnicodeDecodeError, Exception);
UnicodeDecodeError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
UnicodeDecodeError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
UnicodeDecodeError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(UnicodeDecodeError.prototype, "__bases__", {value: [Exception]});


function AssertionError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    AssertionError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(AssertionError, Exception);
AssertionError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
AssertionError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
AssertionError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(AssertionError.prototype, "__bases__", {value: [Exception]});


function ZeroDivisionError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    ZeroDivisionError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(ZeroDivisionError, Exception);
ZeroDivisionError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
ZeroDivisionError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
ZeroDivisionError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(ZeroDivisionError.prototype, "__bases__", {value: [Exception]});

var ρσ_in, ρσ_desugar_kwargs, ρσ_exists;
function ρσ_eslice(arr, step, start, end) {
    var is_string;
    if (typeof arr === "string" || arr instanceof String) {
        is_string = true;
        arr = arr.split("");
    }
    if (step < 0) {
        step = -step;
        arr = arr.slice().reverse();
        if (typeof start !== "undefined") {
            start = arr.length - start - 1;
        }
        if (typeof end !== "undefined") {
            end = arr.length - end - 1;
        }
    }
    if (typeof start === "undefined") {
        start = 0;
    }
    if (typeof end === "undefined") {
        end = arr.length;
    }
    arr = arr.slice(start, end).filter((function() {
        var ρσ_anonfunc = function (e, i) {
            return i % step === 0;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["e", "i"]}
        });
        return ρσ_anonfunc;
    })());
    if (is_string) {
        arr = arr.join("");
    }
    return arr;
};
if (!ρσ_eslice.__argnames__) Object.defineProperties(ρσ_eslice, {
    __argnames__ : {value: ["arr", "step", "start", "end"]}
});

function ρσ_delslice(arr, step, start, end) {
    var is_string, ρσ_unpack, indices;
    if (typeof arr === "string" || arr instanceof String) {
        is_string = true;
        arr = arr.split("");
    }
    if (step < 0) {
        if (typeof start === "undefined") {
            start = arr.length;
        }
        if (typeof end === "undefined") {
            end = 0;
        }
        ρσ_unpack = [end, start, -step];
        start = ρσ_unpack[0];
        end = ρσ_unpack[1];
        step = ρσ_unpack[2];
    }
    if (typeof start === "undefined") {
        start = 0;
    }
    if (typeof end === "undefined") {
        end = arr.length;
    }
    if (step === 1) {
        arr.splice(start, end - start);
    } else {
        if (end > start) {
            indices = [];
            for (var i = start; i < end; i += step) {
                indices.push(i);
            }
            for (var i = indices.length - 1; i >= 0; i--) {
                arr.splice(indices[(typeof i === "number" && i < 0) ? indices.length + i : i], 1);
            }
        }
    }
    if (is_string) {
        arr = arr.join("");
    }
    return arr;
};
if (!ρσ_delslice.__argnames__) Object.defineProperties(ρσ_delslice, {
    __argnames__ : {value: ["arr", "step", "start", "end"]}
});

function ρσ_flatten(arr) {
    var ans, value;
    ans = ρσ_list_decorate([]);
    for (var i=0; i < arr.length; i++) {
        value = arr[(typeof i === "number" && i < 0) ? arr.length + i : i];
        if (Array.isArray(value)) {
            ans = ans.concat(ρσ_flatten(value));
        } else {
            ans.push(value);
        }
    }
    return ans;
};
if (!ρσ_flatten.__argnames__) Object.defineProperties(ρσ_flatten, {
    __argnames__ : {value: ["arr"]}
});

function ρσ_unpack_asarray(num, iterable) {
    var ans, iterator, result;
    if (ρσ_arraylike(iterable)) {
        return iterable;
    }
    ans = [];
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        result = iterator.next();
        while (!result.done && ans.length < num) {
            ans.push(result.value);
            result = iterator.next();
        }
    }
    return ans;
};
if (!ρσ_unpack_asarray.__argnames__) Object.defineProperties(ρσ_unpack_asarray, {
    __argnames__ : {value: ["num", "iterable"]}
});

function ρσ_extends(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};
if (!ρσ_extends.__argnames__) Object.defineProperties(ρσ_extends, {
    __argnames__ : {value: ["child", "parent"]}
});

ρσ_in = function () {
    if (typeof Map === "function" && typeof Set === "function") {
        return (function() {
            var ρσ_anonfunc = function (val, arr) {
                if (typeof arr === "string") {
                    return arr.indexOf(val) !== -1;
                }
                if (typeof arr.__contains__ === "function") {
                    return arr.__contains__(val);
                }
                if (arr instanceof Map || arr instanceof Set) {
                    return arr.has(val);
                }
                if (ρσ_arraylike(arr)) {
                    return ρσ_list_contains.call(arr, val);
                }
                return Object.prototype.hasOwnProperty.call(arr, val);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["val", "arr"]}
            });
            return ρσ_anonfunc;
        })();
    }
    return (function() {
        var ρσ_anonfunc = function (val, arr) {
            if (typeof arr === "string") {
                return arr.indexOf(val) !== -1;
            }
            if (typeof arr.__contains__ === "function") {
                return arr.__contains__(val);
            }
            if (ρσ_arraylike(arr)) {
                return ρσ_list_contains.call(arr, val);
            }
            return Object.prototype.hasOwnProperty.call(arr, val);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["val", "arr"]}
        });
        return ρσ_anonfunc;
    })();
}();
function ρσ_Iterable(iterable) {
    var iterator, ans, result;
    if (ρσ_arraylike(iterable)) {
        return iterable;
    }
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        ans = ρσ_list_decorate([]);
        result = iterator.next();
        while (!result.done) {
            ans.push(result.value);
            result = iterator.next();
        }
        return ans;
    }
    return Object.keys(iterable);
};
if (!ρσ_Iterable.__argnames__) Object.defineProperties(ρσ_Iterable, {
    __argnames__ : {value: ["iterable"]}
});

ρσ_desugar_kwargs = function () {
    if (typeof Object.assign === "function") {
        return function () {
            var ans;
            ans = Object.create(null);
            ans[ρσ_kwargs_symbol] = true;
            for (var i = 0; i < arguments.length; i++) {
                Object.assign(ans, arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
            }
            return ans;
        };
    }
    return function () {
        var ans, keys;
        ans = Object.create(null);
        ans[ρσ_kwargs_symbol] = true;
        for (var i = 0; i < arguments.length; i++) {
            keys = Object.keys(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
            for (var j = 0; j < keys.length; j++) {
                ans[ρσ_bound_index(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], ans)] = (ρσ_expr_temp = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i])[ρσ_bound_index(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], ρσ_expr_temp)];
            }
        }
        return ans;
    };
}();
function ρσ_interpolate_kwargs(f, supplied_args) {
    var has_prop, kwobj, args, prop;
    if (!f.__argnames__) {
        return f.apply(this, supplied_args);
    }
    has_prop = Object.prototype.hasOwnProperty;
    kwobj = supplied_args.pop();
    if (f.__handles_kwarg_interpolation__) {
        args = new Array(Math.max(supplied_args.length, f.__argnames__.length) + 1);
        args[args.length-1] = kwobj;
        for (var i = 0; i < args.length - 1; i++) {
            if (i < f.__argnames__.length) {
                prop = (ρσ_expr_temp = f.__argnames__)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                if (has_prop.call(kwobj, prop)) {
                    args[(typeof i === "number" && i < 0) ? args.length + i : i] = kwobj[(typeof prop === "number" && prop < 0) ? kwobj.length + prop : prop];
                    delete kwobj[prop];
                } else if (i < supplied_args.length) {
                    args[(typeof i === "number" && i < 0) ? args.length + i : i] = supplied_args[(typeof i === "number" && i < 0) ? supplied_args.length + i : i];
                }
            } else {
                args[(typeof i === "number" && i < 0) ? args.length + i : i] = supplied_args[(typeof i === "number" && i < 0) ? supplied_args.length + i : i];
            }
        }
        return f.apply(this, args);
    }
    for (var i = 0; i < f.__argnames__.length; i++) {
        prop = (ρσ_expr_temp = f.__argnames__)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
        if (has_prop.call(kwobj, prop)) {
            supplied_args[(typeof i === "number" && i < 0) ? supplied_args.length + i : i] = kwobj[(typeof prop === "number" && prop < 0) ? kwobj.length + prop : prop];
        }
    }
    return f.apply(this, supplied_args);
};
if (!ρσ_interpolate_kwargs.__argnames__) Object.defineProperties(ρσ_interpolate_kwargs, {
    __argnames__ : {value: ["f", "supplied_args"]}
});

function ρσ_interpolate_kwargs_constructor(apply, f, supplied_args) {
    if (apply) {
        f.apply(this, supplied_args);
    } else {
        ρσ_interpolate_kwargs.call(this, f, supplied_args);
    }
    return this;
};
if (!ρσ_interpolate_kwargs_constructor.__argnames__) Object.defineProperties(ρσ_interpolate_kwargs_constructor, {
    __argnames__ : {value: ["apply", "f", "supplied_args"]}
});

function ρσ_getitem(obj, key) {
    if (obj.__getitem__) {
        return obj.__getitem__(key);
    }
    if (typeof key === "number" && key < 0) {
        key += obj.length;
    }
    return obj[(typeof key === "number" && key < 0) ? obj.length + key : key];
};
if (!ρσ_getitem.__argnames__) Object.defineProperties(ρσ_getitem, {
    __argnames__ : {value: ["obj", "key"]}
});

function ρσ_setitem(obj, key, val) {
    if (obj.__setitem__) {
        obj.__setitem__(key, val);
    } else {
        if (typeof key === "number" && key < 0) {
            key += obj.length;
        }
        obj[(typeof key === "number" && key < 0) ? obj.length + key : key] = val;
    }
};
if (!ρσ_setitem.__argnames__) Object.defineProperties(ρσ_setitem, {
    __argnames__ : {value: ["obj", "key", "val"]}
});

function ρσ_delitem(obj, key) {
    if (obj.__delitem__) {
        obj.__delitem__(key);
    } else if (typeof obj.splice === "function") {
        obj.splice(key, 1);
    } else {
        if (typeof key === "number" && key < 0) {
            key += obj.length;
        }
        delete obj[key];
    }
};
if (!ρσ_delitem.__argnames__) Object.defineProperties(ρσ_delitem, {
    __argnames__ : {value: ["obj", "key"]}
});

function ρσ_bound_index(idx, arr) {
    if (typeof idx === "number" && idx < 0) {
        idx += arr.length;
    }
    return idx;
};
if (!ρσ_bound_index.__argnames__) Object.defineProperties(ρσ_bound_index, {
    __argnames__ : {value: ["idx", "arr"]}
});

function ρσ_splice(arr, val, start, end) {
    start = start || 0;
    if (start < 0) {
        start += arr.length;
    }
    if (end === undefined) {
        end = arr.length;
    }
    if (end < 0) {
        end += arr.length;
    }
    Array.prototype.splice.apply(arr, [start, end - start].concat(val));
};
if (!ρσ_splice.__argnames__) Object.defineProperties(ρσ_splice, {
    __argnames__ : {value: ["arr", "val", "start", "end"]}
});

ρσ_exists = (function(){
    var ρσ_d = {};
    ρσ_d["n"] = (function() {
        var ρσ_anonfunc = function (expr) {
            return expr !== undefined && expr !== null;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["d"] = (function() {
        var ρσ_anonfunc = function (expr) {
            if (expr === undefined || expr === null) {
                return Object.create(null);
            }
            return expr;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["c"] = (function() {
        var ρσ_anonfunc = function (expr) {
            if (typeof expr === "function") {
                return expr;
            }
            return function () {
                return undefined;
            };
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["g"] = (function() {
        var ρσ_anonfunc = function (expr) {
            if (expr === undefined || expr === null || typeof expr.__getitem__ !== "function") {
                return (function(){
                    var ρσ_d = {};
                    ρσ_d["__getitem__"] = function () {
                        return undefined;
                    };
                    return ρσ_d;
                }).call(this);
            }
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["e"] = (function() {
        var ρσ_anonfunc = function (expr, alt) {
            return (expr === undefined || expr === null) ? alt : expr;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr", "alt"]}
        });
        return ρσ_anonfunc;
    })();
    return ρσ_d;
}).call(this);
function ρσ_mixin() {
    var seen, resolved_props, p, target, props, name;
    seen = Object.create(null);
    seen.__argnames__ = seen.__handles_kwarg_interpolation__ = seen.__init__ = seen.__annotations__ = seen.__doc__ = seen.__bind_methods__ = seen.__bases__ = seen.constructor = seen.__class__ = true;
    resolved_props = {};
    p = target = arguments[0].prototype;
    while (p && p !== Object.prototype) {
        props = Object.getOwnPropertyNames(p);
        for (var i = 0; i < props.length; i++) {
            seen[ρσ_bound_index(props[(typeof i === "number" && i < 0) ? props.length + i : i], seen)] = true;
        }
        p = Object.getPrototypeOf(p);
    }
    for (var c = 1; c < arguments.length; c++) {
        p = arguments[(typeof c === "number" && c < 0) ? arguments.length + c : c].prototype;
        while (p && p !== Object.prototype) {
            props = Object.getOwnPropertyNames(p);
            for (var i = 0; i < props.length; i++) {
                name = props[(typeof i === "number" && i < 0) ? props.length + i : i];
                if (seen[(typeof name === "number" && name < 0) ? seen.length + name : name]) {
                    continue;
                }
                seen[(typeof name === "number" && name < 0) ? seen.length + name : name] = true;
                resolved_props[(typeof name === "number" && name < 0) ? resolved_props.length + name : name] = Object.getOwnPropertyDescriptor(p, name);
            }
            p = Object.getPrototypeOf(p);
        }
    }
    Object.defineProperties(target, resolved_props);
};

function ρσ_instanceof() {
    var obj, bases, q, cls, p;
    obj = arguments[0];
    bases = "";
    if (obj && obj.constructor && obj.constructor.prototype) {
        bases = obj.constructor.prototype.__bases__ || "";
    }
    for (var i = 1; i < arguments.length; i++) {
        q = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i];
        if (obj instanceof q) {
            return true;
        }
        if ((q === Array || q === ρσ_list_constructor) && Array.isArray(obj)) {
            return true;
        }
        if (q === ρσ_str && (typeof obj === "string" || obj instanceof String)) {
            return true;
        }
        if (bases.length > 1) {
            for (var c = 1; c < bases.length; c++) {
                cls = bases[(typeof c === "number" && c < 0) ? bases.length + c : c];
                while (cls) {
                    if (q === cls) {
                        return true;
                    }
                    p = Object.getPrototypeOf(cls.prototype);
                    if (!p) {
                        break;
                    }
                    cls = p.constructor;
                }
            }
        }
    }
    return false;
};
function sum(iterable, start) {
    var ans, iterator, r;
    if (Array.isArray(iterable)) {
        return iterable.reduce((function() {
            var ρσ_anonfunc = function (prev, cur) {
                return prev + cur;
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["prev", "cur"]}
            });
            return ρσ_anonfunc;
        })(), start || 0);
    }
    ans = start || 0;
    iterator = iter(iterable);
    r = iterator.next();
    while (!r.done) {
        ans += r.value;
        r = iterator.next();
    }
    return ans;
};
if (!sum.__argnames__) Object.defineProperties(sum, {
    __argnames__ : {value: ["iterable", "start"]}
});

function map() {
    var iterators, func, args, ans;
    iterators = new Array(arguments.length - 1);
    func = arguments[0];
    args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
        iterators[ρσ_bound_index(i - 1, iterators)] = iter(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
    }
    ans = {'_func':func, '_iterators':iterators, '_args':args};
    ans[ρσ_iterator_symbol] = function () {
        return this;
    };
    ans["next"] = function () {
        var r;
        for (var i = 0; i < this._iterators.length; i++) {
            r = (ρσ_expr_temp = this._iterators)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i].next();
            if (r.done) {
                return {'done':true};
            }
            (ρσ_expr_temp = this._args)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = r.value;
        }
        return {'done':false, 'value':this._func.apply(undefined, this._args)};
    };
    return ans;
};

function filter(func_or_none, iterable) {
    var func, ans;
    func = (func_or_none === null) ? ρσ_bool : func_or_none;
    ans = {'_func':func, '_iterator':ρσ_iter(iterable)};
    ans[ρσ_iterator_symbol] = function () {
        return this;
    };
    ans["next"] = function () {
        var r;
        r = this._iterator.next();
        while (!r.done) {
            if (this._func(r.value)) {
                return r;
            }
            r = this._iterator.next();
        }
        return {'done':true};
    };
    return ans;
};
if (!filter.__argnames__) Object.defineProperties(filter, {
    __argnames__ : {value: ["func_or_none", "iterable"]}
});

function zip() {
    var iterators, ans;
    iterators = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
        iterators[(typeof i === "number" && i < 0) ? iterators.length + i : i] = iter(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
    }
    ans = {'_iterators':iterators};
    ans[ρσ_iterator_symbol] = function () {
        return this;
    };
    ans["next"] = function () {
        var args, r;
        args = new Array(this._iterators.length);
        for (var i = 0; i < this._iterators.length; i++) {
            r = (ρσ_expr_temp = this._iterators)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i].next();
            if (r.done) {
                return {'done':true};
            }
            args[(typeof i === "number" && i < 0) ? args.length + i : i] = r.value;
        }
        return {'done':false, 'value':args};
    };
    return ans;
};

function any(iterable) {
    var i;
    var ρσ_Iter0 = ρσ_Iterable(iterable);
    for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
        i = ρσ_Iter0[ρσ_Index0];
        if (i) {
            return true;
        }
    }
    return false;
};
if (!any.__argnames__) Object.defineProperties(any, {
    __argnames__ : {value: ["iterable"]}
});

function all(iterable) {
    var i;
    var ρσ_Iter1 = ρσ_Iterable(iterable);
    for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
        i = ρσ_Iter1[ρσ_Index1];
        if (!i) {
            return false;
        }
    }
    return true;
};
if (!all.__argnames__) Object.defineProperties(all, {
    __argnames__ : {value: ["iterable"]}
});
var define_str_func, ρσ_unpack, ρσ_orig_split, ρσ_orig_replace;
function ρσ_repr_js_builtin(x, as_array) {
    var ans, b, keys, key;
    ans = [];
    b = "{}";
    if (as_array) {
        b = "[]";
        for (var i = 0; i < x.length; i++) {
            ans.push(ρσ_repr(x[(typeof i === "number" && i < 0) ? x.length + i : i]));
        }
    } else {
        keys = Object.keys(x);
        for (var k = 0; k < keys.length; k++) {
            key = keys[(typeof k === "number" && k < 0) ? keys.length + k : k];
            ans.push(JSON.stringify(key) + ":" + ρσ_repr(x[(typeof key === "number" && key < 0) ? x.length + key : key]));
        }
    }
    return b[0] + ans.join(", ") + b[1];
};
if (!ρσ_repr_js_builtin.__argnames__) Object.defineProperties(ρσ_repr_js_builtin, {
    __argnames__ : {value: ["x", "as_array"]}
});

function ρσ_html_element_to_string(elem) {
    var attrs, val, attr, ans;
    attrs = [];
    var ρσ_Iter0 = ρσ_Iterable(elem.attributes);
    for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
        attr = ρσ_Iter0[ρσ_Index0];
        if (attr.specified) {
            val = attr.value;
            if (val.length > 10) {
                val = val.slice(0, 15) + "...";
            }
            val = JSON.stringify(val);
            attrs.push("" + ρσ_str.format("{}", attr.name) + "=" + ρσ_str.format("{}", val) + "");
        }
    }
    attrs = (attrs.length) ? " " + attrs.join(" ") : "";
    ans = "<" + ρσ_str.format("{}", elem.tagName) + "" + ρσ_str.format("{}", attrs) + ">";
    return ans;
};
if (!ρσ_html_element_to_string.__argnames__) Object.defineProperties(ρσ_html_element_to_string, {
    __argnames__ : {value: ["elem"]}
});

function ρσ_repr(x) {
    var ans, name;
    if (x === null) {
        return "None";
    }
    if (x === undefined) {
        return "undefined";
    }
    ans = x;
    if (typeof x.__repr__ === "function") {
        ans = x.__repr__();
    } else if (x === true || x === false) {
        ans = (x) ? "True" : "False";
    } else if (Array.isArray(x)) {
        ans = ρσ_repr_js_builtin(x, true);
    } else if (typeof x === "function") {
        ans = x.toString();
    } else if (typeof x === "object" && !x.toString) {
        ans = ρσ_repr_js_builtin(x);
    } else {
        name = Object.prototype.toString.call(x).slice(8, -1);
        if (ρσ_not_equals("Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".indexOf(name), -1)) {
            return name + "([" + x.map((function() {
                var ρσ_anonfunc = function (i) {
                    return str.format("0x{:02x}", i);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["i"]}
                });
                return ρσ_anonfunc;
            })()).join(", ") + "])";
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
            ans = ρσ_html_element_to_string(x);
        } else {
            ans = (typeof x.toString === "function") ? x.toString() : x;
        }
        if (ans === "[object Object]") {
            return ρσ_repr_js_builtin(x);
        }
        try {
            ans = JSON.stringify(x);
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            {
            } 
        }
    }
    return ans + "";
};
if (!ρσ_repr.__argnames__) Object.defineProperties(ρσ_repr, {
    __argnames__ : {value: ["x"]}
});

function ρσ_str(x) {
    var ans, name;
    if (x === null) {
        return "None";
    }
    if (x === undefined) {
        return "undefined";
    }
    ans = x;
    if (typeof x.__str__ === "function") {
        ans = x.__str__();
    } else if (typeof x.__repr__ === "function") {
        ans = x.__repr__();
    } else if (x === true || x === false) {
        ans = (x) ? "True" : "False";
    } else if (Array.isArray(x)) {
        ans = ρσ_repr_js_builtin(x, true);
    } else if (typeof x.toString === "function") {
        name = Object.prototype.toString.call(x).slice(8, -1);
        if (ρσ_not_equals("Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".indexOf(name), -1)) {
            return name + "([" + x.map((function() {
                var ρσ_anonfunc = function (i) {
                    return str.format("0x{:02x}", i);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["i"]}
                });
                return ρσ_anonfunc;
            })()).join(", ") + "])";
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
            ans = ρσ_html_element_to_string(x);
        } else {
            ans = x.toString();
        }
        if (ans === "[object Object]") {
            ans = ρσ_repr_js_builtin(x);
        }
    } else if (typeof x === "object" && !x.toString) {
        ans = ρσ_repr_js_builtin(x);
    }
    return ans + "";
};
if (!ρσ_str.__argnames__) Object.defineProperties(ρσ_str, {
    __argnames__ : {value: ["x"]}
});

define_str_func = (function() {
    var ρσ_anonfunc = function (name, func) {
        var f;
        (ρσ_expr_temp = ρσ_str.prototype)[(typeof name === "number" && name < 0) ? ρσ_expr_temp.length + name : name] = func;
        ρσ_str[(typeof name === "number" && name < 0) ? ρσ_str.length + name : name] = f = func.call.bind(func);
        if (func.__argnames__) {
            Object.defineProperty(f, "__argnames__", (function(){
                var ρσ_d = {};
                ρσ_d["value"] = ['string'].concat(func.__argnames__);
                return ρσ_d;
            }).call(this));
        }
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["name", "func"]}
    });
    return ρσ_anonfunc;
})();
ρσ_unpack = [String.prototype.split.call.bind(String.prototype.split), String.prototype.replace.call.bind(String.prototype.replace)];
ρσ_orig_split = ρσ_unpack[0];
ρσ_orig_replace = ρσ_unpack[1];
define_str_func("format", function () {
    var template, args, kwargs, explicit, implicit, idx, split, ans, pos, in_brace, markup, ch;
    template = this;
    if (template === undefined) {
        throw new TypeError("Template is required");
    }
    args = Array.prototype.slice.call(arguments);
    kwargs = {};
    if (args[args.length-1] && args[args.length-1][ρσ_kwargs_symbol] !== undefined) {
        kwargs = args[args.length-1];
        args = args.slice(0, -1);
    }
    explicit = implicit = false;
    idx = 0;
    split = ρσ_orig_split;
    if (ρσ_str.format._template_resolve_pat === undefined) {
        ρσ_str.format._template_resolve_pat = /[.\[]/;
    }
    function resolve(arg, object) {
        var ρσ_unpack, first, key, rest, ans;
        if (!arg) {
            return object;
        }
        ρσ_unpack = [arg[0], arg.slice(1)];
        first = ρσ_unpack[0];
        arg = ρσ_unpack[1];
        key = split(arg, ρσ_str.format._template_resolve_pat, 1)[0];
        rest = arg.slice(key.length);
        ans = (first === "[") ? object[ρσ_bound_index(key.slice(0, -1), object)] : getattr(object, key);
        if (ans === undefined) {
            throw new KeyError((first === "[") ? key.slice(0, -1) : key);
        }
        return resolve(rest, ans);
    };
    if (!resolve.__argnames__) Object.defineProperties(resolve, {
        __argnames__ : {value: ["arg", "object"]}
    });

    function resolve_format_spec(format_spec) {
        if (ρσ_str.format._template_resolve_fs_pat === undefined) {
            ρσ_str.format._template_resolve_fs_pat = /[{]([a-zA-Z0-9_]+)[}]/g;
        }
        return format_spec.replace(ρσ_str.format._template_resolve_fs_pat, (function() {
            var ρσ_anonfunc = function (match, key) {
                if (!Object.prototype.hasOwnProperty.call(kwargs, key)) {
                    return "";
                }
                return "" + kwargs[(typeof key === "number" && key < 0) ? kwargs.length + key : key];
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["match", "key"]}
            });
            return ρσ_anonfunc;
        })());
    };
    if (!resolve_format_spec.__argnames__) Object.defineProperties(resolve_format_spec, {
        __argnames__ : {value: ["format_spec"]}
    });

    function set_comma(ans, comma) {
        var sep;
        if (comma !== ",") {
            sep = 1234;
            sep = sep.toLocaleString(undefined, {useGrouping: true})[1];
            ans = str.replace(ans, sep, comma);
        }
        return ans;
    };
    if (!set_comma.__argnames__) Object.defineProperties(set_comma, {
        __argnames__ : {value: ["ans", "comma"]}
    });

    function safe_comma(value, comma) {
        try {
            return set_comma(value.toLocaleString(undefined, {useGrouping: true}), comma);
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            {
                return value.toString(10);
            } 
        }
    };
    if (!safe_comma.__argnames__) Object.defineProperties(safe_comma, {
        __argnames__ : {value: ["value", "comma"]}
    });

    function safe_fixed(value, precision, comma) {
        if (!comma) {
            return value.toFixed(precision);
        }
        try {
            return set_comma(value.toLocaleString(undefined, {useGrouping: true, minimumFractionDigits: precision, maximumFractionDigits: precision}), comma);
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            {
                return value.toFixed(precision);
            } 
        }
    };
    if (!safe_fixed.__argnames__) Object.defineProperties(safe_fixed, {
        __argnames__ : {value: ["value", "precision", "comma"]}
    });

    function apply_formatting(value, format_spec) {
        var ρσ_unpack, fill, align, sign, fhash, zeropad, width, comma, precision, ftype, is_numeric, is_int, lftype, code, prec, exp, nval, is_positive, left, right;
        if (format_spec.indexOf("{") !== -1) {
            format_spec = resolve_format_spec(format_spec);
        }
        if (ρσ_str.format._template_format_pat === undefined) {
            ρσ_str.format._template_format_pat = /([^{}](?=[<>=^]))?([<>=^])?([-+\x20])?(\#)?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?/;
        }
        try {
            ρσ_unpack = format_spec.match(ρσ_str.format._template_format_pat).slice(1);
ρσ_unpack = ρσ_unpack_asarray(9, ρσ_unpack);
            fill = ρσ_unpack[0];
            align = ρσ_unpack[1];
            sign = ρσ_unpack[2];
            fhash = ρσ_unpack[3];
            zeropad = ρσ_unpack[4];
            width = ρσ_unpack[5];
            comma = ρσ_unpack[6];
            precision = ρσ_unpack[7];
            ftype = ρσ_unpack[8];
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            if (ρσ_Exception instanceof TypeError) {
                return value;
            } else {
                throw ρσ_Exception;
            }
        }
        if (zeropad) {
            fill = fill || "0";
            align = align || "=";
        } else {
            fill = fill || " ";
            align = align || ">";
        }
        is_numeric = Number(value) === value;
        is_int = is_numeric && value % 1 === 0;
        precision = parseInt(precision, 10);
        lftype = (ftype || "").toLowerCase();
        if (ftype === "n") {
            is_numeric = true;
            if (is_int) {
                if (comma) {
                    throw new ValueError("Cannot specify ',' with 'n'");
                }
                value = parseInt(value, 10).toLocaleString();
            } else {
                value = parseFloat(value).toLocaleString();
            }
        } else if (['b', 'c', 'd', 'o', 'x'].indexOf(lftype) !== -1) {
            value = parseInt(value, 10);
            is_numeric = true;
            if (!isNaN(value)) {
                if (ftype === "b") {
                    value = (value >>> 0).toString(2);
                    if (fhash) {
                        value = "0b" + value;
                    }
                } else if (ftype === "c") {
                    if (value > 65535) {
                        code = value - 65536;
                        value = String.fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
                    } else {
                        value = String.fromCharCode(value);
                    }
                } else if (ftype === "d") {
                    if (comma) {
                        value = safe_comma(value, comma);
                    } else {
                        value = value.toString(10);
                    }
                } else if (ftype === "o") {
                    value = value.toString(8);
                    if (fhash) {
                        value = "0o" + value;
                    }
                } else if (lftype === "x") {
                    value = value.toString(16);
                    value = (ftype === "x") ? value.toLowerCase() : value.toUpperCase();
                    if (fhash) {
                        value = "0x" + value;
                    }
                }
            }
        } else if (['e','f','g','%'].indexOf(lftype) !== -1) {
            is_numeric = true;
            value = parseFloat(value);
            prec = (isNaN(precision)) ? 6 : precision;
            if (lftype === "e") {
                value = value.toExponential(prec);
                value = (ftype === "E") ? value.toUpperCase() : value.toLowerCase();
            } else if (lftype === "f") {
                value = safe_fixed(value, prec, comma);
                value = (ftype === "F") ? value.toUpperCase() : value.toLowerCase();
            } else if (lftype === "%") {
                value *= 100;
                value = safe_fixed(value, prec, comma) + "%";
            } else if (lftype === "g") {
                prec = max(1, prec);
                exp = parseInt(split(value.toExponential(prec - 1).toLowerCase(), "e")[1], 10);
                if (-4 <= exp && exp < prec) {
                    value = safe_fixed(value, prec - 1 - exp, comma);
                } else {
                    value = value.toExponential(prec - 1);
                }
                value = value.replace(/0+$/g, "");
                if (value[value.length-1] === ".") {
                    value = value.slice(0, -1);
                }
                if (ftype === "G") {
                    value = value.toUpperCase();
                }
            }
        } else {
            if (comma) {
                value = parseInt(value, 10);
                if (isNaN(value)) {
                    throw new ValueError("Must use numbers with , or _");
                }
                value = safe_comma(value, comma);
            }
            value += "";
            if (!isNaN(precision)) {
                value = value.slice(0, precision);
            }
        }
        value += "";
        if (is_numeric && sign) {
            nval = Number(value);
            is_positive = !isNaN(nval) && nval >= 0;
            if (is_positive && (sign === " " || sign === "+")) {
                value = sign + value;
            }
        }
        function repeat(char, num) {
            return (new Array(num+1)).join(char);
        };
        if (!repeat.__argnames__) Object.defineProperties(repeat, {
            __argnames__ : {value: ["char", "num"]}
        });

        if (is_numeric && width && width[0] === "0") {
            width = width.slice(1);
            ρσ_unpack = ["0", "="];
            fill = ρσ_unpack[0];
            align = ρσ_unpack[1];
        }
        width = parseInt(width || "-1", 10);
        if (isNaN(width)) {
            throw new ValueError("Invalid width specification: " + width);
        }
        if (fill && value.length < width) {
            if (align === "<") {
                value = value + repeat(fill, width - value.length);
            } else if (align === ">") {
                value = repeat(fill, width - value.length) + value;
            } else if (align === "^") {
                left = Math.floor((width - value.length) / 2);
                right = width - left - value.length;
                value = repeat(fill, left) + value + repeat(fill, right);
            } else if (align === "=") {
                if (ρσ_in(value[0], "+- ")) {
                    value = value[0] + repeat(fill, width - value.length) + value.slice(1);
                } else {
                    value = repeat(fill, width - value.length) + value;
                }
            } else {
                throw new ValueError("Unrecognized alignment: " + align);
            }
        }
        return value;
    };
    if (!apply_formatting.__argnames__) Object.defineProperties(apply_formatting, {
        __argnames__ : {value: ["value", "format_spec"]}
    });

    function parse_markup(markup) {
        var key, transformer, format_spec, pos, state, ch;
        key = transformer = format_spec = "";
        pos = 0;
        state = 0;
        while (pos < markup.length) {
            ch = markup[(typeof pos === "number" && pos < 0) ? markup.length + pos : pos];
            if (state === 0) {
                if (ch === "!") {
                    state = 1;
                } else if (ch === ":") {
                    state = 2;
                } else {
                    key += ch;
                }
            } else if (state === 1) {
                if (ch === ":") {
                    state = 2;
                } else {
                    transformer += ch;
                }
            } else {
                format_spec += ch;
            }
            pos += 1;
        }
        return [key, transformer, format_spec];
    };
    if (!parse_markup.__argnames__) Object.defineProperties(parse_markup, {
        __argnames__ : {value: ["markup"]}
    });

    function render_markup(markup) {
        var ρσ_unpack, key, transformer, format_spec, lkey, nvalue, object, ans;
        ρσ_unpack = parse_markup(markup);
ρσ_unpack = ρσ_unpack_asarray(3, ρσ_unpack);
        key = ρσ_unpack[0];
        transformer = ρσ_unpack[1];
        format_spec = ρσ_unpack[2];
        if (transformer && ['a', 'r', 's'].indexOf(transformer) === -1) {
            throw new ValueError("Unknown conversion specifier: " + transformer);
        }
        lkey = key.length && split(key, /[.\[]/, 1)[0];
        if (lkey) {
            explicit = true;
            if (implicit) {
                throw new ValueError("cannot switch from automatic field numbering to manual field specification");
            }
            nvalue = parseInt(lkey);
            object = (isNaN(nvalue)) ? kwargs[(typeof lkey === "number" && lkey < 0) ? kwargs.length + lkey : lkey] : args[(typeof nvalue === "number" && nvalue < 0) ? args.length + nvalue : nvalue];
            if (object === undefined) {
                if (isNaN(nvalue)) {
                    throw new KeyError(lkey);
                }
                throw new IndexError(lkey);
            }
            object = resolve(key.slice(lkey.length), object);
        } else {
            implicit = true;
            if (explicit) {
                throw new ValueError("cannot switch from manual field specification to automatic field numbering");
            }
            if (idx >= args.length) {
                throw new IndexError("Not enough arguments to match template: " + template);
            }
            object = args[(typeof idx === "number" && idx < 0) ? args.length + idx : idx];
            idx += 1;
        }
        if (typeof object === "function") {
            object = object();
        }
        ans = "" + object;
        if (format_spec) {
            ans = apply_formatting(ans, format_spec);
        }
        return ans;
    };
    if (!render_markup.__argnames__) Object.defineProperties(render_markup, {
        __argnames__ : {value: ["markup"]}
    });

    ans = "";
    pos = 0;
    in_brace = 0;
    markup = "";
    while (pos < template.length) {
        ch = template[(typeof pos === "number" && pos < 0) ? template.length + pos : pos];
        if (in_brace) {
            if (ch === "{") {
                in_brace += 1;
                markup += "{";
            } else if (ch === "}") {
                in_brace -= 1;
                if (in_brace > 0) {
                    markup += "}";
                } else {
                    ans += render_markup(markup);
                }
            } else {
                markup += ch;
            }
        } else {
            if (ch === "{") {
                if (template[ρσ_bound_index(pos + 1, template)] === "{") {
                    pos += 1;
                    ans += "{";
                } else {
                    in_brace = 1;
                    markup = "";
                }
            } else {
                ans += ch;
                if (ch === "}" && template[ρσ_bound_index(pos + 1, template)] === "}") {
                    pos += 1;
                }
            }
        }
        pos += 1;
    }
    if (in_brace) {
        throw new ValueError("expected '}' before end of string");
    }
    return ans;
});
define_str_func("capitalize", function () {
    var string;
    string = this;
    if (string) {
        string = string[0].toUpperCase() + string.slice(1).toLowerCase();
    }
    return string;
});
define_str_func("center", (function() {
    var ρσ_anonfunc = function (width, fill) {
        var left, right;
        left = Math.floor((width - this.length) / 2);
        right = width - left - this.length;
        fill = fill || " ";
        return new Array(left+1).join(fill) + this + new Array(right+1).join(fill);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width", "fill"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("count", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var string, ρσ_unpack, pos, step, ans;
        string = this;
        start = start || 0;
        end = end || string.length;
        if (start < 0 || end < 0) {
            string = string.slice(start, end);
            ρσ_unpack = [0, string.length];
            start = ρσ_unpack[0];
            end = ρσ_unpack[1];
        }
        pos = start;
        step = needle.length;
        if (!step) {
            return 0;
        }
        ans = 0;
        while (pos !== -1) {
            pos = string.indexOf(needle, pos);
            if (pos !== -1) {
                ans += 1;
                pos += step;
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("endswith", (function() {
    var ρσ_anonfunc = function (suffixes, start, end) {
        var string, q;
        string = this;
        start = start || 0;
        if (typeof suffixes === "string") {
            suffixes = [suffixes];
        }
        if (end !== undefined) {
            string = string.slice(0, end);
        }
        for (var i = 0; i < suffixes.length; i++) {
            q = suffixes[(typeof i === "number" && i < 0) ? suffixes.length + i : i];
            if (string.indexOf(q, Math.max(start, string.length - q.length)) !== -1) {
                return true;
            }
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["suffixes", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("startswith", (function() {
    var ρσ_anonfunc = function (prefixes, start, end) {
        var prefix;
        start = start || 0;
        if (typeof prefixes === "string") {
            prefixes = [prefixes];
        }
        for (var i = 0; i < prefixes.length; i++) {
            prefix = prefixes[(typeof i === "number" && i < 0) ? prefixes.length + i : i];
            end = (end === undefined) ? this.length : end;
            if (end - start >= prefix.length && prefix === this.slice(start, start + prefix.length)) {
                return true;
            }
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["prefixes", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("find", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        while (start < 0) {
            start += this.length;
        }
        ans = this.indexOf(needle, start);
        if (end !== undefined && ans !== -1) {
            while (end < 0) {
                end += this.length;
            }
            if (ans >= end - needle.length) {
                return -1;
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("rfind", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        while (end < 0) {
            end += this.length;
        }
        ans = this.lastIndexOf(needle, end - 1);
        if (start !== undefined && ans !== -1) {
            while (start < 0) {
                start += this.length;
            }
            if (ans < start) {
                return -1;
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("index", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        ans = ρσ_str.prototype.find.apply(this, arguments);
        if (ans === -1) {
            throw new ValueError("substring not found");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("rindex", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        ans = ρσ_str.prototype.rfind.apply(this, arguments);
        if (ans === -1) {
            throw new ValueError("substring not found");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("islower", function () {
    return this.length > 0 && this.toLowerCase() === this.toString();
});
define_str_func("isupper", function () {
    return this.length > 0 && this.toUpperCase() === this.toString();
});
define_str_func("isspace", function () {
    return this.length > 0 && /^\s+$/.test(this);
});
define_str_func("join", (function() {
    var ρσ_anonfunc = function (iterable) {
        var ans, r;
        if (Array.isArray(iterable)) {
            return iterable.join(this);
        }
        ans = "";
        r = iterable.next();
        while (!r.done) {
            if (ans) {
                ans += this;
            }
            ans += r.value;
            r = iterable.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["iterable"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("ljust", (function() {
    var ρσ_anonfunc = function (width, fill) {
        var string;
        string = this;
        if (width > string.length) {
            fill = fill || " ";
            string += new Array(width - string.length + 1).join(fill);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width", "fill"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("rjust", (function() {
    var ρσ_anonfunc = function (width, fill) {
        var string;
        string = this;
        if (width > string.length) {
            fill = fill || " ";
            string = new Array(width - string.length + 1).join(fill) + string;
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width", "fill"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("lower", function () {
    return this.toLowerCase();
});
define_str_func("upper", function () {
    return this.toUpperCase();
});
define_str_func("lstrip", (function() {
    var ρσ_anonfunc = function (chars) {
        var string, pos;
        string = this;
        pos = 0;
        chars = chars || ρσ_str.whitespace;
        while (chars.indexOf(string[(typeof pos === "number" && pos < 0) ? string.length + pos : pos]) !== -1) {
            pos += 1;
        }
        if (pos) {
            string = string.slice(pos);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["chars"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("rstrip", (function() {
    var ρσ_anonfunc = function (chars) {
        var string, pos;
        string = this;
        pos = string.length - 1;
        chars = chars || ρσ_str.whitespace;
        while (chars.indexOf(string[(typeof pos === "number" && pos < 0) ? string.length + pos : pos]) !== -1) {
            pos -= 1;
        }
        if (pos < string.length - 1) {
            string = string.slice(0, pos + 1);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["chars"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("strip", (function() {
    var ρσ_anonfunc = function (chars) {
        return ρσ_str.prototype.lstrip.call(ρσ_str.prototype.rstrip.call(this, chars), chars);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["chars"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("partition", (function() {
    var ρσ_anonfunc = function (sep) {
        var idx;
        idx = this.indexOf(sep);
        if (idx === -1) {
            return [this, "", ""];
        }
        return [this.slice(0, idx), sep, this.slice(idx + sep.length)];
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("rpartition", (function() {
    var ρσ_anonfunc = function (sep) {
        var idx;
        idx = this.lastIndexOf(sep);
        if (idx === -1) {
            return ["", "", this];
        }
        return [this.slice(0, idx), sep, this.slice(idx + sep.length)];
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("replace", (function() {
    var ρσ_anonfunc = function (old, repl, count) {
        var string, pos, idx;
        string = this;
        if (count === 1) {
            return ρσ_orig_replace(string, old, repl);
        }
        if (count < 1) {
            return string;
        }
        count = count || Number.MAX_VALUE;
        pos = 0;
        while (count > 0) {
            count -= 1;
            idx = string.indexOf(old, pos);
            if (idx === -1) {
                break;
            }
            pos = idx + repl.length;
            string = string.slice(0, idx) + repl + string.slice(idx + old.length);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["old", "repl", "count"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("split", (function() {
    var ρσ_anonfunc = function (sep, maxsplit) {
        var split, ans, extra, parts;
        if (maxsplit === 0) {
            return ρσ_list_decorate([ this ]);
        }
        split = ρσ_orig_split;
        if (sep === undefined || sep === null) {
            if (maxsplit > 0) {
                ans = split(this, /(\s+)/);
                extra = "";
                parts = [];
                for (var i = 0; i < ans.length; i++) {
                    if (parts.length >= maxsplit + 1) {
                        extra += ans[(typeof i === "number" && i < 0) ? ans.length + i : i];
                    } else if (i % 2 === 0) {
                        parts.push(ans[(typeof i === "number" && i < 0) ? ans.length + i : i]);
                    }
                }
                parts[parts.length-1] += extra;
                ans = parts;
            } else {
                ans = split(this, /\s+/);
            }
        } else {
            if (sep === "") {
                throw new ValueError("empty separator");
            }
            ans = split(this, sep);
            if (maxsplit > 0 && ans.length > maxsplit) {
                extra = ans.slice(maxsplit).join(sep);
                ans = ans.slice(0, maxsplit);
                ans.push(extra);
            }
        }
        return ρσ_list_decorate(ans);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep", "maxsplit"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("rsplit", (function() {
    var ρσ_anonfunc = function (sep, maxsplit) {
        var split, ans, is_space, pos, current, spc, ch, end, idx;
        if (!maxsplit) {
            return ρσ_str.prototype.split.call(this, sep);
        }
        split = ρσ_orig_split;
        if (sep === undefined || sep === null) {
            if (maxsplit > 0) {
                ans = [];
                is_space = /\s/;
                pos = this.length - 1;
                current = "";
                while (pos > -1 && maxsplit > 0) {
                    spc = false;
                    ch = (ρσ_expr_temp = this)[(typeof pos === "number" && pos < 0) ? ρσ_expr_temp.length + pos : pos];
                    while (pos > -1 && is_space.test(ch)) {
                        spc = true;
                        ch = this[--pos];
                    }
                    if (spc) {
                        if (current) {
                            ans.push(current);
                            maxsplit -= 1;
                        }
                        current = ch;
                    } else {
                        current += ch;
                    }
                    pos -= 1;
                }
                ans.push(this.slice(0, pos + 1) + current);
                ans.reverse();
            } else {
                ans = split(this, /\s+/);
            }
        } else {
            if (sep === "") {
                throw new ValueError("empty separator");
            }
            ans = [];
            pos = end = this.length;
            while (pos > -1 && maxsplit > 0) {
                maxsplit -= 1;
                idx = this.lastIndexOf(sep, pos);
                if (idx === -1) {
                    break;
                }
                ans.push(this.slice(idx + sep.length, end));
                pos = idx - 1;
                end = idx;
            }
            ans.push(this.slice(0, end));
            ans.reverse();
        }
        return ρσ_list_decorate(ans);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep", "maxsplit"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("splitlines", (function() {
    var ρσ_anonfunc = function (keepends) {
        var split, parts, ans;
        split = ρσ_orig_split;
        if (keepends) {
            parts = split(this, /((?:\r?\n)|\r)/);
            ans = [];
            for (var i = 0; i < parts.length; i++) {
                if (i % 2 === 0) {
                    ans.push(parts[(typeof i === "number" && i < 0) ? parts.length + i : i]);
                } else {
                    ans[ans.length-1] += parts[(typeof i === "number" && i < 0) ? parts.length + i : i];
                }
            }
        } else {
            ans = split(this, /(?:\r?\n)|\r/);
        }
        return ρσ_list_decorate(ans);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["keepends"]}
    });
    return ρσ_anonfunc;
})());
define_str_func("swapcase", function () {
    var ans, a, b;
    ans = new Array(this.length);
    for (var i = 0; i < ans.length; i++) {
        a = (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
        b = a.toLowerCase();
        if (a === b) {
            b = a.toUpperCase();
        }
        ans[(typeof i === "number" && i < 0) ? ans.length + i : i] = b;
    }
    return ans.join("");
});
define_str_func("zfill", (function() {
    var ρσ_anonfunc = function (width) {
        var string;
        string = this;
        if (width > string.length) {
            string = new Array(width - string.length + 1).join("0") + string;
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width"]}
    });
    return ρσ_anonfunc;
})());
ρσ_str.uchrs = (function() {
    var ρσ_anonfunc = function (string, with_positions) {
        return (function(){
            var ρσ_d = {};
            ρσ_d["_string"] = string;
            ρσ_d["_pos"] = 0;
            ρσ_d[ρσ_iterator_symbol] = function () {
                return this;
            };
            ρσ_d["next"] = function () {
                var length, pos, value, ans, extra;
                length = this._string.length;
                if (this._pos >= length) {
                    return (function(){
                        var ρσ_d = {};
                        ρσ_d["done"] = true;
                        return ρσ_d;
                    }).call(this);
                }
                pos = this._pos;
                value = this._string.charCodeAt(this._pos++);
                ans = "\ufffd";
                if (55296 <= value && value <= 56319) {
                    if (this._pos < length) {
                        extra = this._string.charCodeAt(this._pos++);
                        if ((extra & 56320) === 56320) {
                            ans = String.fromCharCode(value, extra);
                        }
                    }
                } else if ((value & 56320) !== 56320) {
                    ans = String.fromCharCode(value);
                }
                if (with_positions) {
                    return (function(){
                        var ρσ_d = {};
                        ρσ_d["done"] = false;
                        ρσ_d["value"] = ρσ_list_decorate([ pos, ans ]);
                        return ρσ_d;
                    }).call(this);
                } else {
                    return (function(){
                        var ρσ_d = {};
                        ρσ_d["done"] = false;
                        ρσ_d["value"] = ans;
                        return ρσ_d;
                    }).call(this);
                }
            };
            return ρσ_d;
        }).call(this);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["string", "with_positions"]}
    });
    return ρσ_anonfunc;
})();
ρσ_str.uslice = (function() {
    var ρσ_anonfunc = function (string, start, end) {
        var items, iterator, r;
        items = [];
        iterator = ρσ_str.uchrs(string);
        r = iterator.next();
        while (!r.done) {
            items.push(r.value);
            r = iterator.next();
        }
        return items.slice(start || 0, (end === undefined) ? items.length : end).join("");
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["string", "start", "end"]}
    });
    return ρσ_anonfunc;
})();
ρσ_str.ulen = (function() {
    var ρσ_anonfunc = function (string) {
        var iterator, r, ans;
        iterator = ρσ_str.uchrs(string);
        r = iterator.next();
        ans = 0;
        while (!r.done) {
            r = iterator.next();
            ans += 1;
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["string"]}
    });
    return ρσ_anonfunc;
})();
ρσ_str.ascii_lowercase = "abcdefghijklmnopqrstuvwxyz";
ρσ_str.ascii_uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
ρσ_str.ascii_letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
ρσ_str.digits = "0123456789";
ρσ_str.punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
ρσ_str.printable = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ \t\n\r\u000b\f";
ρσ_str.whitespace = " \t\n\r\u000b\f";
define_str_func = undefined;
var str = ρσ_str, repr = ρσ_repr;;
    var ρσ_modules = {};
    ρσ_modules.cards = {};
    ρσ_modules.utils = {};
    ρσ_modules["utils.format_bytes"] = {};
    ρσ_modules["utils.make_id"] = {};
    ρσ_modules.controls = {};
    ρσ_modules.RapydSmoothie = {};
    ρσ_modules["RapydSmoothie.util"] = {};
    ρσ_modules["RapydSmoothie.timeseries"] = {};
    ρσ_modules["RapydSmoothie.smoothie"] = {};
    ρσ_modules["controls.smoothie"] = {};
    ρσ_modules.dialogs = {};
    ρσ_modules["utils.uuid"] = {};
    ρσ_modules["dialogs.base"] = {};
    ρσ_modules["utils.auth"] = {};
    ρσ_modules["dialogs.login"] = {};
    ρσ_modules["controls.base"] = {};
    ρσ_modules["controls.flags"] = {};
    ρσ_modules["controls.connection"] = {};
    ρσ_modules["controls.version_check"] = {};
    ρσ_modules["controls.version"] = {};
    ρσ_modules["utils.variables"] = {};
    ρσ_modules["dialogs.properties"] = {};
    ρσ_modules["cards.node"] = {};
    ρσ_modules["dialogs.launcher"] = {};
    ρσ_modules["dialogs.license"] = {};
    ρσ_modules["dialogs.about"] = {};
    ρσ_modules.controlcenter = {};

    (function(){
        var __name__ = "cards";

    })();

    (function(){
        var __name__ = "utils";

    })();

    (function(){
        var __name__ = "utils.format_bytes";
        function format_bytes() {
            var pBytes = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var pCalc = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? format_bytes.__defaults__.pCalc : arguments[1];
            var pUnits = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? format_bytes.__defaults__.pUnits : arguments[2];
            var separator = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? format_bytes.__defaults__.separator : arguments[3];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "pCalc")){
                pCalc = ρσ_kwargs_obj.pCalc;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "pUnits")){
                pUnits = ρσ_kwargs_obj.pUnits;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "separator")){
                separator = ρσ_kwargs_obj.separator;
            }
            var bytes, orderOfMagnitude, abbreviations, i, result;
            if (separator === null) {
                separator = " ";
            }
            if ((pBytes === 0 || typeof pBytes === "object" && ρσ_equals(pBytes, 0))) {
                return "0 Bytes";
            }
            if ((pBytes === 1 || typeof pBytes === "object" && ρσ_equals(pBytes, 1))) {
                return "1 Byte";
            }
            if ((pBytes === -1 || typeof pBytes === "object" && ρσ_equals(pBytes, -1))) {
                return "-1 Byte";
            }
            bytes = Math.abs(pBytes);
            orderOfMagnitude = Math.pow(2, 10);
            if (pCalc !== null && ρσ_equals(pCalc.toLowerCase(), "si")) {
                orderOfMagnitude = Math.pow(10, 3);
            }
            abbreviations = ρσ_list_decorate([ "Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB" ]);
            if (pUnits !== null && ρσ_equals(pUnits.toLowerCase(), "si")) {
                abbreviations = ρσ_list_decorate([ "Bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" ]);
            }
            i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));
            result = bytes / Math.pow(orderOfMagnitude, i);
            if (pBytes < 0) {
                result *= -1;
            }
            if (result >= 99.995 || (i === 0 || typeof i === "object" && ρσ_equals(i, 0))) {
                if (ρσ_equals(result.toFixed(0), 1)) {
                    return "1 Byte";
                }
                return result.toFixed(0) + separator + abbreviations[(typeof i === "number" && i < 0) ? abbreviations.length + i : i];
            }
            return result.toFixed(2) + separator + abbreviations[(typeof i === "number" && i < 0) ? abbreviations.length + i : i];
        };
        if (!format_bytes.__defaults__) Object.defineProperties(format_bytes, {
            __defaults__ : {value: {pCalc:"iec", pUnits:"si", separator:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["pBytes", "pCalc", "pUnits", "separator"]}
        });

        ρσ_modules["utils.format_bytes"].format_bytes = format_bytes;
    })();

    (function(){
        var __name__ = "utils.make_id";
        function make_id() {
            var id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var tag = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? make_id.__defaults__.tag : arguments[1];
            var jquery = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? make_id.__defaults__.jquery : arguments[2];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "tag")){
                tag = ρσ_kwargs_obj.tag;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "jquery")){
                jquery = ρσ_kwargs_obj.jquery;
            }
            var mid;
            mid = "tobcc." + id;
            if (tag !== null) {
                mid += "." + tag;
            }
            if (jquery) {
                return "#" + mid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
            }
            return mid;
        };
        if (!make_id.__defaults__) Object.defineProperties(make_id, {
            __defaults__ : {value: {tag:null, jquery:true}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["id", "tag", "jquery"]}
        });

        ρσ_modules["utils.make_id"].make_id = make_id;
    })();

    (function(){
        var __name__ = "controls";

    })();

    (function(){
        var __name__ = "RapydSmoothie";

    })();

    (function(){
        var __name__ = "RapydSmoothie.util";
        function DefaultOptionsBase() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            DefaultOptionsBase.prototype.__init__.apply(this, arguments);
        }
        DefaultOptionsBase.prototype.__init__ = function __init__ () {
                    };
        DefaultOptionsBase.prototype.hasOwnProperty = function hasOwnProperty(key) {
            var self = this;
            var rv;
            rv = !ρσ_in(key, ρσ_list_decorate([ "constructor", "__init__", "__repr__", "__str__", "hasOwnProperty" ]));
            return rv;
        };
        if (!DefaultOptionsBase.prototype.hasOwnProperty.__argnames__) Object.defineProperties(DefaultOptionsBase.prototype.hasOwnProperty, {
            __argnames__ : {value: ["key"]}
        });
        DefaultOptionsBase.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        DefaultOptionsBase.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(DefaultOptionsBase.prototype, "__bases__", {value: []});

        function extend() {
            var args = Array.prototype.slice.call(arguments, 0);
            if (arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) args.pop();
            var al, i, keys, key;
            function all_property_keys(o) {
                var keys = [];
                for (var k in o) {
                    keys.push(k); 
                }
                return keys;
            };
            if (!all_property_keys.__argnames__) Object.defineProperties(all_property_keys, {
                __argnames__ : {value: ["o"]}
            });

            args[0] = args[0] || {};
            al = len(args);
            i = 1;
            while (i < al) {
                keys = all_property_keys(args[(typeof i === "number" && i < 0) ? args.length + i : i]);
                var ρσ_Iter0 = ρσ_Iterable(keys);
                for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                    key = ρσ_Iter0[ρσ_Index0];
                    if (args[(typeof i === "number" && i < 0) ? args.length + i : i].hasOwnProperty(key)) {
                        if (typeof(args[i][key]) === 'object' && ρσ_exists.n((ρσ_expr_temp = args[(typeof i === "number" && i < 0) ? args.length + i : i])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key])) {
                            if (Array.isArray((ρσ_expr_temp = args[(typeof i === "number" && i < 0) ? args.length + i : i])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key]) === true) {
                                (ρσ_expr_temp = args[0])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = (ρσ_expr_temp = args[(typeof i === "number" && i < 0) ? args.length + i : i])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key];
                            } else {
                                (ρσ_expr_temp = args[0])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = extend((ρσ_expr_temp = args[0])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key], (ρσ_expr_temp = args[(typeof i === "number" && i < 0) ? args.length + i : i])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key]);
                            }
                        } else {
                            (ρσ_expr_temp = args[0])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = (ρσ_expr_temp = args[(typeof i === "number" && i < 0) ? args.length + i : i])[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key];
                        }
                    }
                }
                i += 1;
            }
            return args[0];
        };
        if (!extend.__handles_kwarg_interpolation__) Object.defineProperties(extend, {
            __handles_kwarg_interpolation__ : {value: true}
        });

        function binarySearch(data, value) {
            var low, high, mid;
            low = 0;
            high = len(data);
            while (low < high) {
                mid = low + high >> 1;
                if (value < data[(typeof mid === "number" && mid < 0) ? data.length + mid : mid][0]) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }
            return low;
        };
        if (!binarySearch.__argnames__) Object.defineProperties(binarySearch, {
            __argnames__ : {value: ["data", "value"]}
        });

        ρσ_modules["RapydSmoothie.util"].DefaultOptionsBase = DefaultOptionsBase;
        ρσ_modules["RapydSmoothie.util"].extend = extend;
        ρσ_modules["RapydSmoothie.util"].binarySearch = binarySearch;
    })();

    (function(){
        var __name__ = "RapydSmoothie.timeseries";
        var extend = ρσ_modules["RapydSmoothie.util"].extend;

        function TimeSeries() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            TimeSeries.prototype.__init__.apply(this, arguments);
        }
        TimeSeries.prototype.__init__ = function __init__() {
            var self = this;
            var options = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.options : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "options")){
                options = ρσ_kwargs_obj.options;
            }
            self.options = extend({}, TimeSeries.prototype.defaultOptions, options);
            self.disabled = false;
            self.clear();
        };
        if (!TimeSeries.prototype.__init__.__annotations__) Object.defineProperties(TimeSeries.prototype.__init__, {
            __annotations__ : {value: {options: dict}},
            __defaults__ : {value: {options:{}}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["options"]}
        });
        TimeSeries.__argnames__ = TimeSeries.prototype.__init__.__argnames__;
        TimeSeries.__handles_kwarg_interpolation__ = TimeSeries.prototype.__init__.__handles_kwarg_interpolation__;
        TimeSeries.prototype.clear = function clear() {
            var self = this;
            self.data = ρσ_list_decorate([]);
            self.maxValue = null;
            self.minValue = null;
        };
        TimeSeries.prototype.resetBounds = function resetBounds() {
            var self = this;
            var pv, p;
            if (len(self.data) > 0) {
                self.minValue = self.data[0][1];
                self.maxValue = self.data[0][1];
                var ρσ_Iter0 = ρσ_Iterable(self.data);
                for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                    p = ρσ_Iter0[ρσ_Index0];
                    pv = p[1];
                    if (pv < self.minValue) {
                        self.minValue = pv;
                    } else if (pv > self.maxValue) {
                        self.maxValue = pv;
                    }
                }
            } else {
                self.maxValue = null;
                self.minValue = null;
            }
        };
        TimeSeries.prototype.append = function append() {
            var self = this;
            var timestamp = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var value = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
            var sumRepeatedTimeStampValues = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? append.__defaults__.sumRepeatedTimeStampValues : arguments[2];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "sumRepeatedTimeStampValues")){
                sumRepeatedTimeStampValues = ρσ_kwargs_obj.sumRepeatedTimeStampValues;
            }
            var i;
            i = len(self.data) - 1;
            while (i >= 0 && (ρσ_expr_temp = self.data)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i][0] > timestamp) {
                i -= 1;
            }
            if ((i === -1 || typeof i === "object" && ρσ_equals(i, -1))) {
                self.data.insert(0, ρσ_list_decorate([ timestamp, value ]));
            } else if (len(self.data) > 0 && ((ρσ_expr_temp = self.data)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i][0] === timestamp || typeof (ρσ_expr_temp = self.data)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i][0] === "object" && ρσ_equals((ρσ_expr_temp = self.data)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i][0], timestamp))) {
                if (sumRepeatedTimeStampValues === true) {
                    (ρσ_expr_temp = self.data)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i][1] += value;
                } else {
                    (ρσ_expr_temp = self.data)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i][1] = value;
                }
            } else if (i < len(self.data) - 1) {
                self.data.insert(i + 1, ρσ_list_decorate([ timestamp, value ]));
            } else {
                self.data.push(ρσ_list_decorate([ timestamp, value ]));
            }
            self.maxValue = (self.maxValue === null) ? value : max(self.maxValue, value);
            self.minValue = (self.minValue === null) ? value : min(self.minValue, value);
        };
        if (!TimeSeries.prototype.append.__defaults__) Object.defineProperties(TimeSeries.prototype.append, {
            __defaults__ : {value: {sumRepeatedTimeStampValues:false}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["timestamp", "value", "sumRepeatedTimeStampValues"]}
        });
        TimeSeries.prototype.dropOldData = function dropOldData(oldestValidTime, maxDataSetLength) {
            var self = this;
            var removeCount, lsd;
            removeCount = 0;
            lsd = len(self.data);
            while (lsd - removeCount >= maxDataSetLength && (ρσ_expr_temp = self.data)[ρσ_bound_index(removeCount + 1, ρσ_expr_temp)][0] < oldestValidTime) {
                removeCount += 1;
            }
            if ((removeCount !== 0 && (typeof removeCount !== "object" || ρσ_not_equals(removeCount, 0)))) {
                self.data.splice(0, removeCount);
            }
        };
        if (!TimeSeries.prototype.dropOldData.__argnames__) Object.defineProperties(TimeSeries.prototype.dropOldData, {
            __argnames__ : {value: ["oldestValidTime", "maxDataSetLength"]}
        });
        TimeSeries.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        TimeSeries.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(TimeSeries.prototype, "__bases__", {value: []});
        TimeSeries.prototype.defaultOptions = (function(){
            var ρσ_d = {};
            ρσ_d["resetBoundsInterval"] = 3e3;
            ρσ_d["resetBounds"] = true;
            return ρσ_d;
        }).call(this);

        window.TimeSeries = TimeSeries;
        ρσ_modules["RapydSmoothie.timeseries"].TimeSeries = TimeSeries;
    })();

    (function(){
        var __name__ = "RapydSmoothie.smoothie";
        var TimeSeries = ρσ_modules["RapydSmoothie.timeseries"].TimeSeries;

        var extend = ρσ_modules["RapydSmoothie.util"].extend;
        var DefaultOptionsBase = ρσ_modules["RapydSmoothie.util"].DefaultOptionsBase;

        Date.now = Date.now || function () {
            return (new Date).getTime();
        };
        function DefaultChartOptions() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            DefaultChartOptions.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(DefaultChartOptions, DefaultOptionsBase);
        DefaultChartOptions.prototype.__init__ = function __init__ () {
            DefaultOptionsBase.prototype.__init__ && DefaultOptionsBase.prototype.__init__.apply(this, arguments);
        };
        DefaultChartOptions.prototype.__repr__ = function __repr__ () {
            if(DefaultOptionsBase.prototype.__repr__) return DefaultOptionsBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        DefaultChartOptions.prototype.__str__ = function __str__ () {
            if(DefaultOptionsBase.prototype.__str__) return DefaultOptionsBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(DefaultChartOptions.prototype, "__bases__", {value: [DefaultOptionsBase]});
        DefaultChartOptions.prototype.minValue = null;
        DefaultChartOptions.prototype.maxValue = null;
        DefaultChartOptions.prototype.maxValueScale = 1;
        DefaultChartOptions.prototype.minValueScale = 1;
        DefaultChartOptions.prototype.yRangeFunction = null;
        DefaultChartOptions.prototype.scaleSmoothing = .125;
        DefaultChartOptions.prototype.millisPerPixel = 20;
        DefaultChartOptions.prototype.enableDpiScaling = true;
        DefaultChartOptions.prototype.yMinFormatter = (function() {
            var ρσ_anonfunc = function (min, precision) {
                return parseFloat(min).toFixed(precision);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["min", "precision"]}
            });
            return ρσ_anonfunc;
        })();
        DefaultChartOptions.prototype.yMaxFormatter = (function() {
            var ρσ_anonfunc = function (max, precision) {
                return parseFloat(max).toFixed(precision);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["max", "precision"]}
            });
            return ρσ_anonfunc;
        })();
        DefaultChartOptions.prototype.yIntermediateFormatter = (function() {
            var ρσ_anonfunc = function (intermediate, precision) {
                return parseFloat(intermediate).toFixed(precision);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["intermediate", "precision"]}
            });
            return ρσ_anonfunc;
        })();
        DefaultChartOptions.prototype.maxDataSetLength = 2;
        DefaultChartOptions.prototype.interpolation = "bezier";
        DefaultChartOptions.prototype.timestampFormatter = null;
        DefaultChartOptions.prototype.scrollBackwards = false;
        DefaultChartOptions.prototype.horizontalLines = ρσ_list_decorate([]);
        DefaultChartOptions.prototype.grid = (function(){
            var ρσ_d = {};
            ρσ_d["fillStyle"] = "#000000";
            ρσ_d["lineWidth"] = 1;
            ρσ_d["strokeStyle"] = "#777777";
            ρσ_d["millisPerLine"] = 1e3;
            ρσ_d["sharpLines"] = false;
            ρσ_d["verticalSections"] = 2;
            ρσ_d["borderVisible"] = true;
            return ρσ_d;
        }).call(this);
        DefaultChartOptions.prototype.labels = (function(){
            var ρσ_d = {};
            ρσ_d["disabled"] = false;
            ρσ_d["fillStyle"] = "#ffffff";
            ρσ_d["fontSize"] = 10;
            ρσ_d["fontFamily"] = "monospace";
            ρσ_d["precision"] = 2;
            ρσ_d["showIntermediateLabels"] = false;
            ρσ_d["intermediateLabelSameAxis"] = true;
            return ρσ_d;
        }).call(this);
        DefaultChartOptions.prototype.title = (function(){
            var ρσ_d = {};
            ρσ_d["text"] = "";
            ρσ_d["fillStyle"] = "#ffffff";
            ρσ_d["fontSize"] = 15;
            ρσ_d["fontFamily"] = "monospace";
            ρσ_d["verticalAlign"] = "middle";
            return ρσ_d;
        }).call(this);
        DefaultChartOptions.prototype.tooltip = false;
        DefaultChartOptions.prototype.tooltipLine = (function(){
            var ρσ_d = {};
            ρσ_d["lineWidth"] = 1;
            ρσ_d["strokeStyle"] = "#BBBBBB";
            return ρσ_d;
        }).call(this);
        DefaultChartOptions.prototype.tooltipFormatter = function () {
            return;
        };
        DefaultChartOptions.prototype.nonRealtimeData = false;
        DefaultChartOptions.prototype.displayDataFromPercentile = 1;
        DefaultChartOptions.prototype.responsive = false;
        DefaultChartOptions.prototype.limitFPS = 25;

        function DefaultSeriesPresentationOptions() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            DefaultSeriesPresentationOptions.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(DefaultSeriesPresentationOptions, DefaultOptionsBase);
        DefaultSeriesPresentationOptions.prototype.__init__ = function __init__ () {
            DefaultOptionsBase.prototype.__init__ && DefaultOptionsBase.prototype.__init__.apply(this, arguments);
        };
        DefaultSeriesPresentationOptions.prototype.__repr__ = function __repr__ () {
            if(DefaultOptionsBase.prototype.__repr__) return DefaultOptionsBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        DefaultSeriesPresentationOptions.prototype.__str__ = function __str__ () {
            if(DefaultOptionsBase.prototype.__str__) return DefaultOptionsBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(DefaultSeriesPresentationOptions.prototype, "__bases__", {value: [DefaultOptionsBase]});
        DefaultSeriesPresentationOptions.prototype.lineWidth = 1;
        DefaultSeriesPresentationOptions.prototype.strokeStyle = "#ffffff";

        function RapydSmoothie() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            RapydSmoothie.prototype.__init__.apply(this, arguments);
        }
        RapydSmoothie.prototype.__init__ = function __init__() {
            var self = this;
            var options = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.options : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "options")){
                options = ρσ_kwargs_obj.options;
            }
            self.options = {};
            self.options = extend(self.options, new DefaultChartOptions, (function(){
                var ρσ_d = {};
                ρσ_d["timestampFormatter"] = RapydSmoothie.timeFormatter;
                return ρσ_d;
            }).call(this), options);
            self.seriesSet = ρσ_list_decorate([]);
            self.currentValueRange = 1;
            self.currentVisMinValue = 0;
            self.lastRenderTimeMillis = 0;
            self.lastChartTimestamp = 0;
            self.mousemove = self.on_mousemove.bind(self);
            self.mouseout = self.on_mouseout.bind(self);
            self.valueRange = (function(){
                var ρσ_d = {};
                ρσ_d["min"] = Number.NaN;
                ρσ_d["max"] = Number.NaN;
                return ρσ_d;
            }).call(this);
            self.canvas = null;
        };
        if (!RapydSmoothie.prototype.__init__.__annotations__) Object.defineProperties(RapydSmoothie.prototype.__init__, {
            __annotations__ : {value: {options: dict}},
            __defaults__ : {value: {options:{}}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["options"]}
        });
        RapydSmoothie.__argnames__ = RapydSmoothie.prototype.__init__.__argnames__;
        RapydSmoothie.__handles_kwarg_interpolation__ = RapydSmoothie.prototype.__init__.__handles_kwarg_interpolation__;
        RapydSmoothie.tooltipFormatter = function tooltipFormatter(timestamp, data) {
            var timestampFormatter, lines, item;
            timestampFormatter = this.options.timestampFormatter || RapydSmoothie.timeFormatter;
            lines = ρσ_list_decorate([ timestampFormatter(new Date(timestamp)) ]);
            var ρσ_Iter0 = ρσ_Iterable(data);
            for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                item = ρσ_Iter0[ρσ_Index0];
                lines.push("<span style=\"color:" + item.series.options.strokeStyle + "\">" + this.options.yMaxFormatter(item.value, this.options.labels.precision) + "</span>");
            }
            return lines.join("<br>");
        };
        if (!RapydSmoothie.tooltipFormatter.__argnames__) Object.defineProperties(RapydSmoothie.tooltipFormatter, {
            __argnames__ : {value: ["timestamp", "data"]}
        });
        RapydSmoothie.prototype.addTimeSeries = function addTimeSeries() {
            var self = this;
            var ts = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var options = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? addTimeSeries.__defaults__.options : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "options")){
                options = ρσ_kwargs_obj.options;
            }
            var opt;
            opt = extend({}, new DefaultSeriesPresentationOptions, options);
            self.seriesSet.push((function(){
                var ρσ_d = {};
                ρσ_d["timeSeries"] = ts;
                ρσ_d["options"] = opt;
                return ρσ_d;
            }).call(this));
            if (ts.options.resetBounds && ts.options.resetBoundsInterval > 0) {
                ts.resetBoundsTimerId = setInterval(function () {
                    ts.resetBounds();
                }, ts.options.resetBoundsInterval);
            }
        };
        if (!RapydSmoothie.prototype.addTimeSeries.__annotations__) Object.defineProperties(RapydSmoothie.prototype.addTimeSeries, {
            __annotations__ : {value: {ts: TimeSeries, options: dict}},
            __defaults__ : {value: {options:{}}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["ts", "options"]}
        });
        RapydSmoothie.prototype.removeTimeSeries = function removeTimeSeries(ts) {
            var self = this;
            var ρσ_unpack, index, serie;
            var ρσ_Iter1 = ρσ_Iterable(enumerate(self.seriesSet));
            for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                ρσ_unpack = ρσ_Iter1[ρσ_Index1];
                index = ρσ_unpack[0];
                serie = ρσ_unpack[1];
                if (serie.timeSeries === ts) {
                    ρσ_delitem(self.seriesSet, index);
                    break;
                }
            }
            if (ts.resetBoundsTimerId) {
                clearInterval(ts.resetBoundsTimerId);
            }
        };
        if (!RapydSmoothie.prototype.removeTimeSeries.__annotations__) Object.defineProperties(RapydSmoothie.prototype.removeTimeSeries, {
            __annotations__ : {value: {ts: TimeSeries}},
            __argnames__ : {value: ["ts"]}
        });
        RapydSmoothie.prototype.getTimeSeriesOptions = function getTimeSeriesOptions(ts) {
            var self = this;
            var serie;
            var ρσ_Iter2 = ρσ_Iterable(self.seriesSet);
            for (var ρσ_Index2 = 0; ρσ_Index2 < ρσ_Iter2.length; ρσ_Index2++) {
                serie = ρσ_Iter2[ρσ_Index2];
                if (serie.timeSeries === ts) {
                    return serie.options;
                }
            }
        };
        if (!RapydSmoothie.prototype.getTimeSeriesOptions.__annotations__) Object.defineProperties(RapydSmoothie.prototype.getTimeSeriesOptions, {
            __annotations__ : {value: {ts: TimeSeries}},
            __argnames__ : {value: ["ts"]}
        });
        RapydSmoothie.prototype.bringToFront = function bringToFront(ts) {
            var self = this;
            var ρσ_unpack, index, serie;
            var ρσ_Iter3 = ρσ_Iterable(enumerate(self.seriesSet));
            for (var ρσ_Index3 = 0; ρσ_Index3 < ρσ_Iter3.length; ρσ_Index3++) {
                ρσ_unpack = ρσ_Iter3[ρσ_Index3];
                index = ρσ_unpack[0];
                serie = ρσ_unpack[1];
                if (serie.timeSeries === ts) {
                    ρσ_delitem(self.seriesSet, index);
                    self.seriesSet.push(serie);
                    break;
                }
            }
        };
        if (!RapydSmoothie.prototype.bringToFront.__annotations__) Object.defineProperties(RapydSmoothie.prototype.bringToFront, {
            __annotations__ : {value: {ts: TimeSeries}},
            __argnames__ : {value: ["ts"]}
        });
        RapydSmoothie.prototype.streamTo = function streamTo(canvas, delayMillis) {
            var self = this;
            self.canvas = canvas;
            self.delay = delayMillis;
            self.start();
        };
        if (!RapydSmoothie.prototype.streamTo.__argnames__) Object.defineProperties(RapydSmoothie.prototype.streamTo, {
            __argnames__ : {value: ["canvas", "delayMillis"]}
        });
        RapydSmoothie.prototype.getTooltipEl = function getTooltipEl() {
            var self = this;
            if (!ρσ_exists.n(self.tooltipEl)) {
                self.tooltipEl = document.createElement("div");
                self.tooltipEl.className = "smoothie-chart-tooltip";
                self.tooltipEl.style.position = "absolute";
                self.tooltipEl.style.display = "none";
                document.body.appendChild(this.tooltipEl);
            }
            return self.tooltipEl;
        };
        RapydSmoothie.prototype.updateTooltip = function updateTooltip() {
            var self = this;
            var el, time, t, data, ts, closeIdx, serie;
            var binarySearch = ρσ_modules["RapydSmoothie.util"].binarySearch;

            el = self.getTooltipEl();
            if (!ρσ_exists.n(self.mouseover) || self.options.tooltip === false) {
                el.style.display = "none";
                return;
            }
            time = self.lastChartTimestamp;
            if (self.options.scrollBackwards === true) {
                t = time - self.mouseX * self.options.millisPerPixel;
            } else {
                t = time - (self.canvas.offsetWidth - self.mouseX) * self.options.millisPerPixel;
            }
            data = ρσ_list_decorate([]);
            var ρσ_Iter4 = ρσ_Iterable(self.seriesSet);
            for (var ρσ_Index4 = 0; ρσ_Index4 < ρσ_Iter4.length; ρσ_Index4++) {
                serie = ρσ_Iter4[ρσ_Index4];
                ts = serie.timeSeries;
                if ((ts.disabled === true || typeof ts.disabled === "object" && ρσ_equals(ts.disabled, true))) {
                    continue;
                }
                closeIdx = binarySearch(ts.data, t);
                if (closeIdx > 0 && closeIdx < ts.data.length) {
                    data.push((function(){
                        var ρσ_d = {};
                        ρσ_d["series"] = serie;
                        ρσ_d["index"] = closeIdx;
                        ρσ_d["value"] = (ρσ_expr_temp = ts.data)[(typeof closeIdx === "number" && closeIdx < 0) ? ρσ_expr_temp.length + closeIdx : closeIdx][1];
                        return ρσ_d;
                    }).call(this));
                }
            }
            if (len(data) > 0) {
                el.innerHTML = self.options.tooltipFormatter.call(self, t, data);
                el.style.display = "block";
            } else {
                el.style.display = "none";
            }
        };
        RapydSmoothie.prototype.on_mousemove = function on_mousemove(event) {
            var self = this;
            var el;
            self.mouseover = true;
            self.mouseX = event.offsetX;
            self.mouseY = event.offsetY;
            self.mousePageX = event.pageX;
            self.mousePageY = event.pageY;
            el = self.getTooltipEl();
            el.style.top = Math.round(this.mousePageY) + "px";
            el.style.left = Math.round(this.mousePageX) + "px";
            self.updateTooltip();
        };
        if (!RapydSmoothie.prototype.on_mousemove.__argnames__) Object.defineProperties(RapydSmoothie.prototype.on_mousemove, {
            __argnames__ : {value: ["event"]}
        });
        RapydSmoothie.prototype.on_mouseout = function on_mouseout() {
            var self = this;
            self.mouseover = false;
            self.mouseX = null;
            self.mouseY = null;
            if (self.tooltipEl !== null) {
                self.tooltipEl.style.display = "none";
            }
        };
        RapydSmoothie.prototype.resize = function resize() {
            var self = this;
            var dpr, width, height;
            dpr = 1;
            if (self.options.enableDpiScaling === true && window !== null) {
                dpr = window.devicePixelRatio;
            }
            width = 0;
            height = 0;
            if (self.options.responsive) {
                width = self.canvas.offsetWidth;
                height = self.canvas.offsetHeight;
                if ((width !== self.lastWidth && (typeof width !== "object" || ρσ_not_equals(width, self.lastWidth)))) {
                    self.lastWidth = width;
                    self.canvas.setAttribute("width", Math.floor(width * dpr).toString());
                }
                if ((height !== self.lastHeight && (typeof height !== "object" || ρσ_not_equals(height, self.lastHeight)))) {
                    self.lastHeight = height;
                    self.canvas.setAttribute("height", Math.floor(height * dpr).toString());
                }
            } else if ((dpr !== 1 && (typeof dpr !== "object" || ρσ_not_equals(dpr, 1)))) {
                width = parseInt(self.canvas.getAttribute("width"));
                height = parseInt(self.canvas.getAttribute("height"));
                if (self.originalWidth === null || ρσ_not_equals(Math.floor(self.originalWidth * dpr), width)) {
                    self.originalWidth = width;
                    self.canvas.setAttribute("width", Math.floor(width * dpr).toString());
                    self.canvas.style.width = width + "px";
                    self.canvas.getContext("2d").scale(dpr, dpr);
                }
                if (self.originalHeight === null || ρσ_not_equals(Math.floor(self.originalHeight * dpr), height)) {
                    self.originalHeight = height;
                    self.canvas.setAttribute("height", Math.floor(height * dpr).toString());
                    self.canvas.style.height = height + "px";
                    self.canvas.getContext("2d").scale(dpr, dpr);
                }
            }
        };
        RapydSmoothie.prototype.start = function start() {
            var self = this;
            var animate;
            if (self.frame) {
                return;
            }
            self.canvas.addEventListener("mousemove", self.mousemove);
            self.canvas.addEventListener("mouseout", self.mouseout);
            animate = function () {
                this.frame = this.AnimateCompatibility.requestAnimationFrame(function () {
                    var dateZero, maxTimeStamp;
                    if (this.options.nonRealtimeData) {
                        dateZero = new Date(0);
                        maxTimeStamp = this.seriesSet.reduce((function() {
                            var ρσ_anonfunc = function (max, series) {
                                var dataSet, lds, indexToCheck, lastDataTimeStamp;
                                dataSet = series.timeSeries.data;
                                lds = len(dataSet);
                                indexToCheck = Math.round(this.options.displayDataFromPercentile * lds) - 1;
                                indexToCheck = max(indexToCheck, 0);
                                indexToCheck = min(indexToCheck, lds - 1);
                                if (dataSet !== null && lds > 0) {
                                    lastDataTimeStamp = dataSet[(typeof indexToCheck === "number" && indexToCheck < 0) ? dataSet.length + indexToCheck : indexToCheck][0];
                                    max = max(max, lastDataTimeStamp);
                                }
                                return max;
                            };
                            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                __argnames__ : {value: ["max", "series"]}
                            });
                            return ρσ_anonfunc;
                        })().bind(this), dateZero);
                        this.render(this.canvas, (maxTimeStamp > dateZero) ? maxTimeStamp : null);
                    } else {
                        this.render();
                    }
                    animate();
                }.bind(this));
            }.bind(this);
            animate();
        };
        RapydSmoothie.prototype.stop = function stop() {
            var self = this;
            if (self.frame) {
                self.AnimateCompatibility.cancelAnimationFrame(self.frame);
                self.frame = null;
                self.canvas.removeEventListener("mousemove", self.mousemove);
                self.canvas.removeEventListener("mouseout", self.mouseout);
            }
        };
        RapydSmoothie.prototype.updateValueRange = function updateValueRange() {
            var self = this;
            var chartOptions, chartMaxValue, chartMinValue, ts, serie, rnge, targetValueRange, valueRangeDiff, minValueDiff;
            chartOptions = self.options;
            chartMaxValue = Number.NaN;
            chartMinValue = Number.NaN;
            var ρσ_Iter5 = ρσ_Iterable(self.seriesSet);
            for (var ρσ_Index5 = 0; ρσ_Index5 < ρσ_Iter5.length; ρσ_Index5++) {
                serie = ρσ_Iter5[ρσ_Index5];
                ts = serie.timeSeries;
                if (ts.disabled === true) {
                    continue;
                }
                if (ts.maxValue === ts.maxValue) {
                    chartMaxValue = (chartMaxValue === chartMaxValue) ? max(chartMaxValue, ts.maxValue) : ts.maxValue;
                }
                if (ts.minValue === ts.minValue) {
                    chartMinValue = (chartMinValue === chartMinValue) ? min(chartMinValue, ts.minValue) : ts.minValue;
                }
            }
            if (ρσ_exists.n(chartOptions.maxValue)) {
                chartMaxValue = chartOptions.maxValue;
            } else {
                chartMaxValue *= chartOptions.maxValueScale;
            }
            if (ρσ_exists.n(chartOptions.minValue)) {
                chartMinValue = chartOptions.minValue;
            } else {
                chartMinValue -= Math.abs(chartMinValue * chartOptions.minValueScale - chartMinValue);
            }
            if (ρσ_exists.n(self.options.yRangeFunction)) {
                rnge = self.options.yRangeFunction((function(){
                    var ρσ_d = {};
                    ρσ_d["min"] = chartMinValue;
                    ρσ_d["max"] = chartMaxValue;
                    return ρσ_d;
                }).call(this));
                chartMinValue = rnge.min;
                chartMaxValue = rnge.max;
            }
            if (chartMaxValue === chartMaxValue && chartMinValue === chartMinValue) {
                targetValueRange = chartMaxValue - chartMinValue;
                valueRangeDiff = targetValueRange - self.currentValueRange;
                minValueDiff = chartMinValue - self.currentVisMinValue;
                self.isAnimatingScale = Math.abs(valueRangeDiff) > .1 || Math.abs(minValueDiff) > .1;
                self.currentValueRange += chartOptions.scaleSmoothing * valueRangeDiff;
                self.currentVisMinValue += chartOptions.scaleSmoothing * minValueDiff;
            }
            self.valueRange = (function(){
                var ρσ_d = {};
                ρσ_d["min"] = chartMinValue;
                ρσ_d["max"] = chartMaxValue;
                return ρσ_d;
            }).call(this);
        };
        RapydSmoothie.prototype.render = function render(canvas, time) {
            var self = this;
            var nowMillis, maxIdleMillis, context, chartOptions, dimensions, oldestValidTime, valueToYPixel;
            nowMillis = Date.now();
            if (self.options.limitFPS > 0) {
                if (nowMillis - self.lastRenderTImeMillis < 1e3 / self.options.limitFPS) {
                    return;
                }
            }
            if (self.isAnimatingScale === false) {
                maxIdleMillis = min(1e3 / 6, self.options.millisPerPixel);
                if (nowMillis - self.lastRenderTimeMillis < maxIdleMillis) {
                    return;
                }
            }
            self.resize();
            self.updateTooltip();
            self.lastRenderTimeMillis = nowMillis;
            canvas = canvas || self.canvas;
            time = time || nowMillis - (self.delay || 0);
            time -= time % self.options.millisPerPixel;
            self.lastChartTimestamp = time;
            context = canvas.getContext("2d");
            chartOptions = self.options;
            dimensions = (function(){
                var ρσ_d = {};
                ρσ_d["top"] = 0;
                ρσ_d["left"] = 0;
                ρσ_d["width"] = canvas.clientWidth;
                ρσ_d["height"] = canvas.clientHeight;
                return ρσ_d;
            }).call(this);
            oldestValidTime = time - dimensions.width * chartOptions.millisPerPixel;
            valueToYPixel = (function() {
                var ρσ_anonfunc = function (value) {
                    var offset;
                    offset = value - self.currentVisMinValue;
                    if ((self.currentValueRange === 0 || typeof self.currentValueRange === "object" && ρσ_equals(self.currentValueRange, 0))) {
                        return dimensions.height;
                    }
                    return dimensions.height - Math.round(offset / self.currentValueRange * dimensions.height);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["value"]}
                });
                return ρσ_anonfunc;
            })().bind(self);
            function timeToXPixel(t) {
                if (chartOptions.scrollBackwards === true) {
                    return Math.round((time - t) / chartOptions.millisPerPixel);
                }
                return Math.round(dimensions.width - (time - t) / chartOptions.millisPerPixel);
            };
            if (!timeToXPixel.__argnames__) Object.defineProperties(timeToXPixel, {
                __argnames__ : {value: ["t"]}
            });

            self.updateValueRange();
            context.font = chartOptions.labels.fontSize + "px " + chartOptions.labels.fontFamily;
            self.render_10(context, chartOptions, dimensions);
            self.render_20(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel);
            self.render_30(context, chartOptions, dimensions, valueToYPixel);
            self.render_40(context, chartOptions, dimensions, oldestValidTime, timeToXPixel, valueToYPixel);
            self.render_50(context, chartOptions, dimensions);
            self.render_60(context, chartOptions, dimensions);
            self.render_70(context, chartOptions, dimensions);
            self.render_80(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel);
        };
        if (!RapydSmoothie.prototype.render.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render, {
            __argnames__ : {value: ["canvas", "time"]}
        });
        RapydSmoothie.prototype.render_10 = function render_10(context, chartOptions, dimensions) {
            var self = this;
            context.save();
            context.translate(dimensions.left, dimensions.top);
            context.beginPath();
            context.rect(0, 0, dimensions.width, dimensions.height);
            context.clip();
            context.save();
            context.fillStyle = chartOptions.grid.fillStyle;
            context.clearRect(0, 0, dimensions.width, dimensions.height);
            context.fillRect(0, 0, dimensions.width, dimensions.height);
            context.restore();
        };
        if (!RapydSmoothie.prototype.render_10.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_10, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions"]}
        });
        RapydSmoothie.prototype.render_20 = function render_20(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel) {
            var self = this;
            var t, gx, v, gy;
            context.save();
            context.lineWidth = chartOptions.grid.lineWidth;
            context.strokeStyle = chartOptions.grid.strokeStyle;
            if (chartOptions.grid.millisPerLine > 0) {
                context.beginPath();
                t = time - time % chartOptions.grid.millisPerLine;
                while (t >= oldestValidTime) {
                    gx = timeToXPixel(t);
                    if (chartOptions.grid.sharpLines) {
                        gx -= .5;
                    }
                    context.moveTo(gx, 0);
                    context.lineTo(gx, dimensions.height);
                    t -= chartOptions.grid.millisPerLine;
                }
                context.stroke();
                context.closePath();
            }
            v = 1;
            while (v < chartOptions.grid.verticalSections) {
                gy = Math.round(v * dimensions.height / chartOptions.grid.verticalSections);
                if (chartOptions.grid.sharpLines) {
                    gy -= .5;
                }
                context.beginPath();
                context.moveTo(0, gy);
                context.lineTo(dimensions.width, gy);
                context.stroke();
                context.closePath();
                v += 1;
            }
            if (chartOptions.grid.borderVisible) {
                context.beginPath();
                context.strokeRect(0, 0, dimensions.width, dimensions.height);
                context.closePath();
            }
            context.restore();
        };
        if (!RapydSmoothie.prototype.render_20.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_20, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "time", "oldestValidTime", "timeToXPixel"]}
        });
        RapydSmoothie.prototype.render_30 = function render_30(context, chartOptions, dimensions, valueToYPixel) {
            var self = this;
            var hly, line;
            context.save();
            var ρσ_Iter6 = ρσ_Iterable(chartOptions.horizontalLines);
            for (var ρσ_Index6 = 0; ρσ_Index6 < ρσ_Iter6.length; ρσ_Index6++) {
                line = ρσ_Iter6[ρσ_Index6];
                hly = Math.round(valueToYPixel(line.value)) - .5;
                context.strokeStyle = line.color || "#ffffff";
                context.lineWidth = line.lineWidth || 1;
                context.beginPath();
                context.moveTo(0, hly);
                context.lineTo(dimensions.width, hly);
                context.stroke();
                context.closePath();
            }
            context.restore();
        };
        if (!RapydSmoothie.prototype.render_30.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_30, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "valueToYPixel"]}
        });
        RapydSmoothie.prototype.render_40 = function render_40(context, chartOptions, dimensions, oldestValidTime, timeToXPixel, valueToYPixel) {
            var self = this;
            var ts, dataSet, seriesOptions, firstX, lastX, lastY, x, y, ρσ_unpack, index, set, serie;
            var ρσ_Iter7 = ρσ_Iterable(self.seriesSet);
            for (var ρσ_Index7 = 0; ρσ_Index7 < ρσ_Iter7.length; ρσ_Index7++) {
                serie = ρσ_Iter7[ρσ_Index7];
                context.save();
                ts = serie.timeSeries;
                if (ts.disabled === true) {
                    continue;
                }
                dataSet = ts.data;
                seriesOptions = serie.options;
                ts.dropOldData(oldestValidTime, chartOptions.maxDataSetLength);
                context.lineWidth = seriesOptions.lineWidth;
                context.strokeStyle = seriesOptions.strokeStyle;
                context.beginPath();
                firstX = 0;
                lastX = 0;
                lastY = 0;
                if (len(dataSet) > 1) {
                    var ρσ_Iter8 = ρσ_Iterable(enumerate(dataSet));
                    for (var ρσ_Index8 = 0; ρσ_Index8 < ρσ_Iter8.length; ρσ_Index8++) {
                        ρσ_unpack = ρσ_Iter8[ρσ_Index8];
                        index = ρσ_unpack[0];
                        set = ρσ_unpack[1];
                        x = timeToXPixel(set[0]);
                        y = valueToYPixel(set[1]);
                        if ((index === 0 || typeof index === "object" && ρσ_equals(index, 0))) {
                            firstX = x;
                            context.moveTo(x, y);
                        } else {
                            if (ρσ_in(chartOptions.interpolation, ρσ_list_decorate([ "linear", "line" ]))) {
                                context.lineTo(x, y);
                            } else if ((chartOptions.interpolation === "step" || typeof chartOptions.interpolation === "object" && ρσ_equals(chartOptions.interpolation, "step"))) {
                                context.lineTo(x, lastY);
                                context.lineTo(x, y);
                            } else {
                                context.bezierCurveTo(Math.round((lastX + x) / 2), lastY, Math.round(lastX + x) / 2, y, x, y);
                            }
                        }
                        lastX = x;
                        lastY = y;
                    }
                }
                if (len(dataSet) > 1) {
                    if (seriesOptions.fillStyle) {
                        context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, lastY);
                        context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, dimensions.height + seriesOptions.lineWidth + 1);
                        context.lineTo(firstX, dimensions.height + seriesOptions.lineWidth);
                        context.fillStyle = seriesOptions.fillStyle;
                        context.fill();
                    }
                    if (seriesOptions.strokeStyle && seriesOptions.strokeStyle !== "none") {
                        context.stroke();
                    }
                    context.closePath();
                }
                context.restore();
            }
        };
        if (!RapydSmoothie.prototype.render_40.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_40, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "oldestValidTime", "timeToXPixel", "valueToYPixel"]}
        });
        RapydSmoothie.prototype.render_50 = function render_50(context, chartOptions, dimensions) {
            var self = this;
            if (chartOptions.tooltip && self.mouseX >= 0) {
                context.save();
                context.lineWidth = chartOptions.tooltipLine.lineWidth;
                context.strokeStyle = chartOptions.tooltipLine.strokeStyle;
                context.beginPath();
                context.moveTo(self.mouseX, 0);
                context.lineTo(self.mouseX, dimensions.height);
                context.closePath();
                context.stroke();
                self.updateTooltip();
                context.restore();
            }
        };
        if (!RapydSmoothie.prototype.render_50.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_50, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions"]}
        });
        RapydSmoothie.prototype.render_60 = function render_60(context, chartOptions, dimensions) {
            var self = this;
            var maxValueString, minValueString, maxLabelPos, minLabelPos;
            if (chartOptions.labels.disabled === false) {
                if (self.valueRange.min === self.valueRange.min) {
                    if (self.valueRange.max === self.valueRange.max) {
                        context.save();
                        maxValueString = chartOptions.yMaxFormatter(self.valueRange.max, chartOptions.labels.precision);
                        minValueString = chartOptions.yMinFormatter(self.valueRange.min, chartOptions.labels.precision);
                        if (chartOptions.scrollBackwards === true) {
                            maxLabelPos = 0;
                            minLabelPos = 0;
                        } else {
                            maxLabelPos = dimensions.width - context.measureText(maxValueString).width - 2;
                            minLabelPos = dimensions.width - context.measureText(minValueString).width - 2;
                        }
                        context.fillStyle = chartOptions.labels.fillStyle;
                        context.fillText(maxValueString, maxLabelPos, chartOptions.labels.fontSize);
                        context.fillText(minValueString, minLabelPos, dimensions.height - 2);
                        context.restore();
                    }
                }
            }
        };
        if (!RapydSmoothie.prototype.render_60.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_60, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions"]}
        });
        RapydSmoothie.prototype.render_70 = function render_70(context, chartOptions, dimensions) {
            var self = this;
            var step, stepPixels, v, gy, yValue, intermediateLabelPos;
            if (chartOptions.labels.showIntermediateLabels === true) {
                if (self.valueRange.min === self.valueRange.min && self.valueRange.max === self.valueRange.max) {
                    if (chartOptions.grid.verticalSections > 0) {
                        context.save();
                        step = (self.valueRange.max - self.valueRange.min) / chartOptions.grid.verticalSections;
                        stepPixels = dimensions.height / chartOptions.grid.verticalSections;
                        v = 1;
                        while (v < chartOptions.grid.verticalSections) {
                            gy = dimensions.height - Math.round(v * stepPixels);
                            if (chartOptions.grid.sharpLines) {
                                gy -= .5;
                            }
                            yValue = chartOptions.yIntermediateFormatter(self.valueRange.min + v * step, chartOptions.labels.precision);
                            if (chartOptions.labels.intermediateLabelSameAxis === true) {
                                if (chartOptions.scrollBackwards === true) {
                                    intermediateLabelPos = 0;
                                } else {
                                    intermediateLabelPos = dimensions.width - context.measureText(yValue).width - 2;
                                }
                            } else {
                                if (chartOptions.scrollBackwards === true) {
                                    intermediateLabelPos = dimensions.width - context.measureText(yValue).width - 2;
                                } else {
                                    intermediateLabelPos = 0;
                                }
                            }
                            context.fillText(yValue, intermediateLabelPos, gy - chartOptions.grid.lineWidth);
                            v += 1;
                        }
                        context.restore();
                    }
                }
            }
        };
        if (!RapydSmoothie.prototype.render_70.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_70, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions"]}
        });
        RapydSmoothie.prototype.render_80 = function render_80(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel) {
            var self = this;
            var minValueString, textUntilX, t, gx, tx, tsf, tsWidth;
            if (ρσ_exists.n(chartOptions.timestampFormatter) && chartOptions.grid.millisPerLine > 0) {
                context.save();
                if (self.valueRange.min === self.valueRange.min) {
                    minValueString = chartOptions.yMinFormatter(self.valueRange.min, chartOptions.labels.precision);
                } else {
                    minValueString = "";
                }
                if (chartOptions.scrollBackwards === true) {
                    textUntilX = context.measureText(minValueString).width;
                } else {
                    textUntilX = dimensions.width - context.measureText(minValueString).width + 4;
                }
                t = time - time % chartOptions.grid.millisPerLine;
                while (t >= oldestValidTime) {
                    gx = timeToXPixel(t);
                    if (chartOptions.scrollBackwards === false && gx < textUntilX || chartOptions.scrollBackwards === true && gx > textUntilX) {
                        tx = new Date(t);
                        tsf = chartOptions.timestampFormatter(tx);
                        tsWidth = context.measureText(tsf).width;
                        textUntilX = (chartOptions.scrollBackwards === true) ? gx + tsWidth + 2 : gx - tsWidth - 2;
                        context.fillStyle = chartOptions.labels.fillStyle;
                        if (chartOptions.scrollBackwards) {
                            context.fillText(tsf, gx, dimensions.height - 2);
                        } else {
                            context.fillText(tsf, gx - tsWidth, dimensions.height - 2);
                        }
                    }
                    t -= chartOptions.grid.millisPerLine;
                }
                context.restore();
            }
        };
        if (!RapydSmoothie.prototype.render_80.__argnames__) Object.defineProperties(RapydSmoothie.prototype.render_80, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "time", "oldestValidTime", "timeToXPixel"]}
        });
        RapydSmoothie.timeFormatter = function timeFormatter(date) {
            function pad2(number) {
                return ((number < 10) ? "0" : "") + number;
            };
            if (!pad2.__argnames__) Object.defineProperties(pad2, {
                __argnames__ : {value: ["number"]}
            });

            return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
        };
        if (!RapydSmoothie.timeFormatter.__argnames__) Object.defineProperties(RapydSmoothie.timeFormatter, {
            __argnames__ : {value: ["date"]}
        });
        RapydSmoothie.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        RapydSmoothie.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(RapydSmoothie.prototype, "__bases__", {value: []});
        
        RapydSmoothie.prototype.AnimateCompatibility = function () {
            var requestAF, cancelAF;
            requestAF = (function() {
                var ρσ_anonfunc = function (callback, element) {
                    var r_AF;
                    r_AF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || (function() {
                        var ρσ_anonfunc = function (callback) {
                            return window.setTimeout((function() {
                                var ρσ_anonfunc = function (callback) {
                                    callback(Date.now());
                                };
                                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                    __argnames__ : {value: ["callback"]}
                                });
                                return ρσ_anonfunc;
                            })(), 16);
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["callback"]}
                        });
                        return ρσ_anonfunc;
                    })();
                    return r_AF.call(window, callback, element);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["callback", "element"]}
                });
                return ρσ_anonfunc;
            })();
            cancelAF = (function() {
                var ρσ_anonfunc = function (id) {
                    var c_AF;
                    c_AF = window.cancelAnimationFrame || (function() {
                        var ρσ_anonfunc = function (id) {
                            clearTimeout(id);
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["id"]}
                        });
                        return ρσ_anonfunc;
                    })();
                    return c_AF.call(window, id);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["id"]}
                });
                return ρσ_anonfunc;
            })();
            return (function(){
                var ρσ_d = {};
                ρσ_d["requestAnimationFrame"] = requestAF;
                ρσ_d["cancelAnimationFrame"] = cancelAF;
                return ρσ_d;
            }).call(this);
        }();
        

        window.RapydSmoothie = RapydSmoothie;
        ρσ_modules["RapydSmoothie.smoothie"].DefaultChartOptions = DefaultChartOptions;
        ρσ_modules["RapydSmoothie.smoothie"].DefaultSeriesPresentationOptions = DefaultSeriesPresentationOptions;
        ρσ_modules["RapydSmoothie.smoothie"].RapydSmoothie = RapydSmoothie;
    })();

    (function(){
        var __name__ = "controls.smoothie";
        var RapydSmoothie = ρσ_modules["RapydSmoothie.smoothie"].RapydSmoothie;
        var DefaultChartOptions = ρσ_modules["RapydSmoothie.smoothie"].DefaultChartOptions;
        var DefaultSeriesPresentationOptions = ρσ_modules["RapydSmoothie.smoothie"].DefaultSeriesPresentationOptions;

        var RSTimeSeries = ρσ_modules["RapydSmoothie.timeseries"].TimeSeries;

        var extend = ρσ_modules["RapydSmoothie.util"].extend;

        function TimeSeries() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            TimeSeries.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(TimeSeries, RSTimeSeries);
        TimeSeries.prototype.__init__ = function __init__ () {
            RSTimeSeries.prototype.__init__ && RSTimeSeries.prototype.__init__.apply(this, arguments);
        };
        TimeSeries.prototype.resetBounds = function resetBounds() {
            var self = this;
            var oldestValidTime = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? resetBounds.__defaults__.oldestValidTime : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "oldestValidTime")){
                oldestValidTime = ρσ_kwargs_obj.oldestValidTime;
            }
            var value, element;
            if (oldestValidTime === null) {
                return RSTimeSeries.prototype.resetBounds.call(self);
            }
            if (ρσ_equals(len(self.data), 0)) {
                self.maxValue = null;
                self.minValue = null;
                return;
            }
            self.maxValue = self.data[0][1];
            self.minValue = self.data[0][1];
            var ρσ_Iter0 = ρσ_Iterable(reversed(self.data));
            for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                element = ρσ_Iter0[ρσ_Index0];
                if (element[0] < oldestValidTime) {
                    break;
                }
                value = element[1];
                if (value > self.maxValue) {
                    self.maxValue = value;
                } else if (value < self.minValue) {
                    self.minValue = value;
                }
            }
        };
        if (!TimeSeries.prototype.resetBounds.__defaults__) Object.defineProperties(TimeSeries.prototype.resetBounds, {
            __defaults__ : {value: {oldestValidTime:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["oldestValidTime"]}
        });
        TimeSeries.prototype.__repr__ = function __repr__ () {
            if(RSTimeSeries.prototype.__repr__) return RSTimeSeries.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        TimeSeries.prototype.__str__ = function __str__ () {
            if(RSTimeSeries.prototype.__str__) return RSTimeSeries.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(TimeSeries.prototype, "__bases__", {value: [RSTimeSeries]});

        function Smoothie() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Smoothie.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Smoothie, RapydSmoothie);
        Smoothie.prototype.__init__ = function __init__() {
            var self = this;
            var options = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.options : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "options")){
                options = ρσ_kwargs_obj.options;
            }
            if (!ρσ_exists.n(options.timeLabelLeftAlign)) {
                options.timeLabelLeftAlign = false;
            }
            if (!ρσ_exists.n(options.timeLabelSeparation)) {
                options.timeLabelSeparation = 0;
            }
            if (!ρσ_exists.n(options.grid.strokeStyleHor)) {
                options.grid.strokeStyleHor = "#d4d4d4";
            }
            RapydSmoothie.prototype.__init__.call(self, options);
            if (!ρσ_exists.n(options.yMinFormatter)) {
                self.options.yMinFormatter = null;
            }
            if (!ρσ_exists.n(options.yMaxFormatter)) {
                self.options.yMaxFormatter = null;
            }
            self.options.sizeToParent = true;
        };
        if (!Smoothie.prototype.__init__.__defaults__) Object.defineProperties(Smoothie.prototype.__init__, {
            __defaults__ : {value: {options:new DefaultChartOptions}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["options"]}
        });
        Smoothie.__argnames__ = Smoothie.prototype.__init__.__argnames__;
        Smoothie.__handles_kwarg_interpolation__ = Smoothie.prototype.__init__.__handles_kwarg_interpolation__;
        Smoothie.prototype.streamTo = function streamTo(canvas, delayMillis) {
            var self = this;
            self.canvas = canvas;
            self.delay = delayMillis;
        };
        if (!Smoothie.prototype.streamTo.__argnames__) Object.defineProperties(Smoothie.prototype.streamTo, {
            __argnames__ : {value: ["canvas", "delayMillis"]}
        });
        Smoothie.prototype.resize = function resize() {
            var self = this;
            var haveResized, width, height, dpr, dprWidth, dprHeight;
            if (!(typeof window !== "undefined" && window !== null)) {
                return false;
            }
            haveResized = false;
            if (self.options.sizeToParent) {
                if (!ρσ_exists.n(self.css_style_parent)) {
                    self.css_style_parent = window.getComputedStyle(self.canvas.parentNode);
                }
                width = parseFloat(self.css_style_parent.getPropertyValue("width"));
                height = parseFloat(self.css_style_parent.getPropertyValue("height"));
            } else {
                if (!ρσ_exists.n(self.css_style)) {
                    self.css_style = window.getComputedStyle(self.canvas);
                }
                width = parseFloat(self.css_style.getPropertyValue("width"));
                height = parseFloat(self.css_style.getPropertyValue("height"));
            }
            dpr = (self.options.enableDpiScaling) ? window.devicePixelRatio : 1;
            dprWidth = Math.floor(parseFloat(self.canvas.getAttribute("width")));
            dprHeight = Math.floor(parseFloat(self.canvas.getAttribute("height")));
            width = Math.floor(width);
            height = Math.floor(height);
            if (!ρσ_exists.n(self.originalWidth) || ρσ_not_equals(Math.floor(self.originalWidth * dpr), dprWidth) || (self.originalWidth !== width && (typeof self.originalWidth !== "object" || ρσ_not_equals(self.originalWidth, width)))) {
                self.originalWidth = width;
                self.canvas.setAttribute("width", Math.floor(width * dpr).toString());
                self.canvas.style.width = width + "px";
                self.canvas.getContext("2d").scale(dpr, dpr);
                haveResized = true;
            }
            if (!ρσ_exists.n(self.originalHeight) || ρσ_not_equals(Math.floor(self.originalHeight * dpr), dprHeight) || (self.originalHeight !== height && (typeof self.originalHeight !== "object" || ρσ_not_equals(self.originalHeight, height)))) {
                self.originalHeight = height;
                self.canvas.setAttribute("height", Math.floor(height * dpr).toString());
                self.canvas.style.height = height + "px";
                self.canvas.getContext("2d").scale(dpr, dpr);
                haveResized = true;
            }
            return haveResized;
        };
        Smoothie.prototype.render = function render(canvas, time) {
            var self = this;
            var nowMillis, maxIdleMillis, context, chartOptions, dimensions, oldestValidTime, valueToYPixel, vertical_dividers, minValueRect, maxValueRect;
            nowMillis = Date.now();
            if (self.options.limitFPS > 0) {
                if (nowMillis - self.lastRenderTImeMillis < 1e3 / self.options.limitFPS) {
                    return;
                }
            }
            if (self.isAnimatingScale === false) {
                maxIdleMillis = min(1e3 / 6, self.options.millisPerPixel);
                if (nowMillis - self.lastRenderTimeMillis < maxIdleMillis) {
                    return;
                }
            }
            self.resize();
            self.updateTooltip();
            self.lastRenderTimeMillis = nowMillis;
            canvas = canvas || self.canvas;
            time = time || nowMillis - (self.delay || 0);
            time -= time % self.options.millisPerPixel;
            self.lastChartTimestamp = time;
            context = canvas.getContext("2d");
            chartOptions = self.options;
            dimensions = (function(){
                var ρσ_d = {};
                ρσ_d["top"] = 0;
                ρσ_d["left"] = 0;
                ρσ_d["width"] = canvas.clientWidth;
                ρσ_d["height"] = canvas.clientHeight;
                return ρσ_d;
            }).call(this);
            oldestValidTime = time - dimensions.width * chartOptions.millisPerPixel;
            valueToYPixel = (function() {
                var ρσ_anonfunc = function (value) {
                    var offset;
                    offset = value - self.currentVisMinValue;
                    if ((this.currentValueRange === 0 || typeof this.currentValueRange === "object" && ρσ_equals(this.currentValueRange, 0))) {
                        return dimensions.height;
                    }
                    return dimensions.height - Math.round(offset / this.currentValueRange * dimensions.height);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["value"]}
                });
                return ρσ_anonfunc;
            })().bind(self);
            function timeToXPixel(t) {
                if (chartOptions.scrollBackwards === true) {
                    return Math.round((time - t) / chartOptions.millisPerPixel);
                }
                return Math.round(dimensions.width - (time - t) / chartOptions.millisPerPixel);
            };
            if (!timeToXPixel.__argnames__) Object.defineProperties(timeToXPixel, {
                __argnames__ : {value: ["t"]}
            });

            self.updateValueRange();
            context.font = chartOptions.labels.fontSize + "px " + chartOptions.labels.fontFamily;
            self.render_10(context, chartOptions, dimensions);
            self.render_25(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel);
            vertical_dividers = self.render_23(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel);
            self.render_30(context, chartOptions, dimensions, valueToYPixel);
            self.render_41(context, chartOptions, dimensions, oldestValidTime, timeToXPixel, valueToYPixel);
            self.render_48(context, chartOptions, dimensions, valueToYPixel);
            self.render_50(context, chartOptions, dimensions);
            minValueRect = (function(){
                var ρσ_d = {};
                ρσ_d["left"] = 0;
                ρσ_d["top"] = 0;
                ρσ_d["width"] = 0;
                ρσ_d["height"] = chartOptions.labels.fontSize;
                return ρσ_d;
            }).call(this);
            maxValueRect = (function(){
                var ρσ_d = {};
                ρσ_d["left"] = 0;
                ρσ_d["top"] = 0;
                ρσ_d["width"] = 0;
                ρσ_d["height"] = chartOptions.labels.fontSize;
                return ρσ_d;
            }).call(this);
            self.render_61(context, chartOptions, dimensions, minValueRect, maxValueRect);
            self.render_81(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel, valueToYPixel, minValueRect, maxValueRect, vertical_dividers);
        };
        if (!Smoothie.prototype.render.__argnames__) Object.defineProperties(Smoothie.prototype.render, {
            __argnames__ : {value: ["canvas", "time"]}
        });
        Smoothie.prototype.render_23 = function render_23(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel) {
            var self = this;
            var vertical_dividers, t, gx, start_time, next_time_div, this_monday, this_month, this_year;
            vertical_dividers = ρσ_list_decorate([]);
            context.save();
            context.lineWidth = chartOptions.grid.lineWidth;
            context.strokeStyle = chartOptions.grid.strokeStyle;
            if (chartOptions.grid.millisPerLine > 0) {
                context.beginPath();
                t = time - time % chartOptions.grid.millisPerLine;
                while (t >= oldestValidTime) {
                    vertical_dividers.push(t);
                    gx = timeToXPixel(t);
                    if (chartOptions.grid.sharpLines) {
                        gx -= .5;
                    }
                    context.moveTo(gx, 0);
                    context.lineTo(gx, dimensions.height);
                    t -= chartOptions.grid.millisPerLine;
                }
                vertical_dividers.push(t);
                context.stroke();
                context.closePath();
            } else if (ρσ_in(chartOptions.grid.timeDividers, ρσ_list_decorate([ "weekly", "monthly", "yearly" ]))) {
                start_time = null;
                next_time_div = null;
                if ((chartOptions.grid.timeDividers === "weekly" || typeof chartOptions.grid.timeDividers === "object" && ρσ_equals(chartOptions.grid.timeDividers, "weekly"))) {
                    function getMonday(date) {
                        var day;
                        day = date.getDay() || 7;
                        if ((day !== 1 && (typeof day !== "object" || ρσ_not_equals(day, 1)))) {
                            date.setHours(-24 * (day - 1));
                        }
                        return date;
                    };
                    if (!getMonday.__argnames__) Object.defineProperties(getMonday, {
                        __argnames__ : {value: ["date"]}
                    });

                    this_monday = new Date(time);
                    this_monday = getMonday(this_monday);
                    this_monday.setHours(0);
                    this_monday.setMinutes(0);
                    this_monday.setSeconds(0);
                    start_time = this_monday.getTime();
                    next_time_div = (function() {
                        var ρσ_anonfunc = function (t) {
                            return t - 6048e5;
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["t"]}
                        });
                        return ρσ_anonfunc;
                    })();
                } else if ((chartOptions.grid.timeDividers === "monthly" || typeof chartOptions.grid.timeDividers === "object" && ρσ_equals(chartOptions.grid.timeDividers, "monthly"))) {
                    this_month = new Date(time);
                    this_month.setMinutes(0);
                    this_month.setHours(0);
                    this_month.setDate(1);
                    start_time = this_month.getTime();
                    next_time_div = (function() {
                        var ρσ_anonfunc = function (t) {
                            var nm, cm;
                            nm = new Date(t);
                            cm = nm.getMonth();
                            if (cm) {
                                nm.setMonth(cm - 1);
                            } else {
                                nm.setFullYear(nm.getFullYear() - 1);
                                nm.setMonth(11);
                            }
                            return nm.getTime();
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["t"]}
                        });
                        return ρσ_anonfunc;
                    })();
                } else if ((chartOptions.grid.timeDividers === "yearly" || typeof chartOptions.grid.timeDividers === "object" && ρσ_equals(chartOptions.grid.timeDividers, "yearly"))) {
                    this_year = new Date(time);
                    this_year.setMinutes(0);
                    this_year.setHours(0);
                    this_year.setDate(1);
                    this_year.setMonth(0);
                    start_time = this_year.getTime();
                    next_time_div = (function() {
                        var ρσ_anonfunc = function (t) {
                            var ny;
                            ny = new Date(t);
                            ny.setFullYear(ny.getFullYear() - 1);
                            return ny.getTime();
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["t"]}
                        });
                        return ρσ_anonfunc;
                    })();
                }
                if (start_time !== null) {
                    context.beginPath();
                    t = start_time;
                    while (t >= oldestValidTime) {
                        vertical_dividers.push(t);
                        gx = timeToXPixel(t);
                        if (chartOptions.grid.sharpLines) {
                            gx -= .5;
                        }
                        context.moveTo(gx, 0);
                        context.lineTo(gx, dimensions.height);
                        t = next_time_div(t);
                    }
                    vertical_dividers.push(t);
                    context.stroke();
                    context.closePath();
                }
            }
            context.restore();
            return vertical_dividers;
        };
        if (!Smoothie.prototype.render_23.__argnames__) Object.defineProperties(Smoothie.prototype.render_23, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "time", "oldestValidTime", "timeToXPixel"]}
        });
        Smoothie.prototype.render_25 = function render_25(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel) {
            var self = this;
            var v, gy;
            context.save();
            context.lineWidth = chartOptions.grid.lineWidth;
            context.strokeStyle = chartOptions.grid.strokeStyleHor;
            v = 1;
            while (v < chartOptions.grid.verticalSections) {
                gy = Math.round(v * dimensions.height / chartOptions.grid.verticalSections);
                if (chartOptions.grid.sharpLines) {
                    gy -= .5;
                }
                context.beginPath();
                context.moveTo(0, gy);
                context.lineTo(dimensions.width, gy);
                context.stroke();
                context.closePath();
                v += 1;
            }
            context.restore();
        };
        if (!Smoothie.prototype.render_25.__argnames__) Object.defineProperties(Smoothie.prototype.render_25, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "time", "oldestValidTime", "timeToXPixel"]}
        });
        Smoothie.prototype.render_27 = function render_27(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel) {
            var self = this;
            var br, dw, dh;
            if (chartOptions.grid.borderVisible) {
                context.save();
                br = $(self.canvas).css("border-radius");
                br = parseFloat(br);
                context.save();
                context.lineWidth = 2;
                if ((br === 0 || typeof br === "object" && ρσ_equals(br, 0))) {
                    context.beginPath();
                    context.strokeRect(0, 0, dimensions.width, dimensions.height);
                    context.closePath();
                } else {
                    dw = dimensions.width;
                    dh = dimensions.height;
                    context.beginPath();
                    context.moveTo(br, 0);
                    context.lineTo(dw - br, 0);
                    context.quadraticCurveTo(dw, 0, dw, br);
                    context.lineTo(dw, dh - br);
                    context.quadraticCurveTo(dw, dh, dw - br, dh);
                    context.lineTo(br, dh);
                    context.quadraticCurveTo(0, dh, 0, dh - br);
                    context.lineTo(0, br);
                    context.quadraticCurveTo(0, 0, br, 0);
                    context.closePath();
                    context.stroke();
                }
                context.restore();
            }
        };
        if (!Smoothie.prototype.render_27.__argnames__) Object.defineProperties(Smoothie.prototype.render_27, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "time", "oldestValidTime", "timeToXPixel"]}
        });
        Smoothie.prototype.render_41 = function render_41(context, chartOptions, dimensions, oldestValidTime, timeToXPixel, valueToYPixel) {
            var self = this;
            var ts, dataSet, seriesOptions, firstX, lastX, lastY, has_null, x, y, y_data, ρσ_unpack, index, set, y0, serie;
            var ρσ_Iter1 = ρσ_Iterable(self.seriesSet);
            for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                serie = ρσ_Iter1[ρσ_Index1];
                context.save();
                ts = serie.timeSeries;
                if (ts.disabled === true) {
                    continue;
                }
                dataSet = ts.data;
                seriesOptions = serie.options;
                ts.dropOldData(oldestValidTime, chartOptions.maxDataSetLength);
                context.lineWidth = seriesOptions.lineWidth;
                context.strokeStyle = seriesOptions.strokeStyle;
                context.beginPath();
                firstX = 0;
                lastX = 0;
                lastY = 0;
                if (len(dataSet) > 1) {
                    var ρσ_Iter2 = ρσ_Iterable(enumerate(dataSet));
                    for (var ρσ_Index2 = 0; ρσ_Index2 < ρσ_Iter2.length; ρσ_Index2++) {
                        ρσ_unpack = ρσ_Iter2[ρσ_Index2];
                        index = ρσ_unpack[0];
                        set = ρσ_unpack[1];
                        has_null = false;
                        x = null;
                        y = null;
                        x = timeToXPixel(set[0]);
                        y_data = set[1];
                        if (y_data !== null) {
                            y = valueToYPixel(y_data);
                        } else if ((seriesOptions.nullTo0 === true || typeof seriesOptions.nullTo0 === "object" && ρσ_equals(seriesOptions.nullTo0, true))) {
                            y = valueToYPixel(0);
                        } else {
                            has_null = true;
                        }
                        if ((index === 0 || typeof index === "object" && ρσ_equals(index, 0))) {
                            firstX = x;
                            context.moveTo(x, (y === null) ? 0 : y);
                        } else if (y !== null) {
                            if (ρσ_in(chartOptions.interpolation, ρσ_list_decorate([ "linear", "line" ]))) {
                                context.lineTo(x, y);
                            } else if ((chartOptions.interpolation === "step" || typeof chartOptions.interpolation === "object" && ρσ_equals(chartOptions.interpolation, "step"))) {
                                if (lastY === null) {
                                    context.moveTo(x, y);
                                } else {
                                    context.lineTo(x, lastY);
                                    context.lineTo(x, y);
                                }
                            } else {
                                context.bezierCurveTo(Math.round((lastX + x) / 2), lastY, Math.round(lastX + x) / 2, y, x, y);
                            }
                        }
                        lastX = x;
                        lastY = y;
                    }
                }
                y0 = valueToYPixel(0);
                if (len(dataSet) > 1) {
                    if (seriesOptions.fillStyle && !has_null) {
                        context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, lastY);
                        context.lineTo(dimensions.width + seriesOptions.lineWidth + 1, y0);
                        context.lineTo(firstX, y0);
                        context.fillStyle = seriesOptions.fillStyle;
                        context.fill();
                    }
                    if (seriesOptions.strokeStyle && seriesOptions.strokeStyle !== "none") {
                        context.stroke();
                    }
                    context.closePath();
                }
                context.restore();
            }
        };
        if (!Smoothie.prototype.render_41.__argnames__) Object.defineProperties(Smoothie.prototype.render_41, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "oldestValidTime", "timeToXPixel", "valueToYPixel"]}
        });
        Smoothie.prototype.render_48 = function render_48(context, chartOptions, dimensions, valueToYPixel) {
            var self = this;
            var y0;
            y0 = valueToYPixel(0);
            context.save();
            context.lineWidth = chartOptions.grid.lineWidth;
            context.strokeStyle = chartOptions.grid.strokeStyleHor;
            context.beginPath();
            context.moveTo(0, y0);
            context.lineTo(dimensions.width, y0);
            context.stroke();
            context.closePath();
            context.restore();
        };
        if (!Smoothie.prototype.render_48.__argnames__) Object.defineProperties(Smoothie.prototype.render_48, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "valueToYPixel"]}
        });
        Smoothie.prototype.render_61 = function render_61(context, chartOptions, dimensions, minValueRect, maxValueRect) {
            var self = this;
            var maxValueString, minValueString, maxLabelPos, minLabelPos;
            maxValueString = "";
            minValueString = "";
            if (chartOptions.labels.disabled === false && self.valueRange.min === self.valueRange.min && self.valueRange.max === self.valueRange.max) {
                context.save();
                if (ρσ_exists.n(chartOptions.yMaxFormatter)) {
                    maxValueString = chartOptions.yMaxFormatter(self.valueRange.max, chartOptions.labels.precision);
                    maxValueRect.width = context.measureText(maxValueString).width;
                }
                if (ρσ_exists.n(chartOptions.yMinFormatter)) {
                    minValueString = chartOptions.yMinFormatter(self.valueRange.min, chartOptions.labels.precision);
                    minValueRect.width = context.measureText(minValueString).width;
                }
                if (chartOptions.scrollBackwards === true) {
                    maxLabelPos = 0;
                    minLabelPos = 0;
                } else {
                    maxLabelPos = dimensions.width - context.measureText(maxValueString).width - 2;
                    minLabelPos = dimensions.width - context.measureText(minValueString).width - 2;
                }
                context.fillStyle = chartOptions.labels.fillStyle;
                if (len(maxValueString) > 0) {
                    context.fillText(maxValueString, maxLabelPos, chartOptions.labels.fontSize);
                    maxValueRect.left += maxLabelPos;
                    maxValueRect.top += chartOptions.labels.fontSize;
                }
                if (len(minValueString) > 0) {
                    context.fillText(minValueString, minLabelPos, dimensions.height - 2);
                    minValueRect.left += minLabelPos;
                    minValueRect.top += dimensions.height - 2;
                }
                context.restore();
            }
        };
        if (!Smoothie.prototype.render_61.__argnames__) Object.defineProperties(Smoothie.prototype.render_61, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "minValueRect", "maxValueRect"]}
        });
        Smoothie.prototype.render_81 = function render_81(context, chartOptions, dimensions, time, oldestValidTime, timeToXPixel, valueToYPixel, minValueRect, maxValueRect, vertical_dividers) {
            var self = this;
            var y0, textUntilX, tx, ts, tsRect, gx, t;
            function intersect(a, b) {
                return a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height;
            };
            if (!intersect.__argnames__) Object.defineProperties(intersect, {
                __argnames__ : {value: ["a", "b"]}
            });

            if (ρσ_exists.n(chartOptions.timestampFormatter) && len(vertical_dividers) > 0) {
                y0 = valueToYPixel(0);
                context.save();
                if (chartOptions.scrollBackwards === true || chartOptions.timeLabelLeftAlign === true) {
                    textUntilX = dimensions.width;
                } else {
                    textUntilX = 0;
                }
                var ρσ_Iter3 = ρσ_Iterable(vertical_dividers);
                for (var ρσ_Index3 = 0; ρσ_Index3 < ρσ_Iter3.length; ρσ_Index3++) {
                    t = ρσ_Iter3[ρσ_Index3];
                    tx = new Date(t);
                    ts = chartOptions.timestampFormatter(tx);
                    tsRect = (function(){
                        var ρσ_d = {};
                        ρσ_d["left"] = 0;
                        ρσ_d["top"] = 0;
                        ρσ_d["width"] = context.measureText(ts).width;
                        ρσ_d["height"] = chartOptions.labels.fontSize;
                        return ρσ_d;
                    }).call(this);
                    gx = timeToXPixel(t);
                    tsRect.top += y0 - 2;
                    if (tsRect.top < tsRect.height) {
                        tsRect.top += tsRect.height + 2 * 2;
                    }
                    if (ρσ_exists.n(chartOptions.scrollBackwards) || chartOptions.timeLabelLeftAlign === true) {
                        tsRect.left = gx + chartOptions.timeLabelSeparation + 2;
                        if (tsRect.left + tsRect.width < textUntilX && intersect(tsRect, minValueRect) === false && intersect(tsRect, maxValueRect) === false) {
                            context.fillStyle = chartOptions.labels.fillStyle;
                            context.fillText(ts, tsRect.left, tsRect.top);
                            textUntilX = tsRect.left + tsRect.width;
                        }
                    } else {
                        tsRect.left = gx - tsRect.width - chartOptions.timeLabelSeparation - 2;
                        if (tsRect.left + tsRect.width > textUntilX && intersect(tsRect, minValueRect) === false && intersect(tsRect, maxValueRect) === false) {
                            context.fillStyle = chartOptions.labels.fillStyle;
                            context.fillText(ts, tsRect.left, tsRect.top);
                            textUntilX = tsRect.left + tsRect.width;
                        }
                    }
                }
                context.restore();
            }
        };
        if (!Smoothie.prototype.render_81.__argnames__) Object.defineProperties(Smoothie.prototype.render_81, {
            __argnames__ : {value: ["context", "chartOptions", "dimensions", "time", "oldestValidTime", "timeToXPixel", "valueToYPixel", "minValueRect", "maxValueRect", "vertical_dividers"]}
        });
        Smoothie.prototype.addTimeSeries = function addTimeSeries() {
            var self = this;
            var ts = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var options = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? addTimeSeries.__defaults__.options : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "options")){
                options = ρσ_kwargs_obj.options;
            }
            var opt, new_series;
            opt = extend({}, new DefaultSeriesPresentationOptions, options);
            new_series = (function(){
                var ρσ_d = {};
                ρσ_d["timeSeries"] = ts;
                ρσ_d["options"] = opt;
                return ρσ_d;
            }).call(this);
            self.seriesSet.push(new_series);
            if (ts.options.resetBounds && ts.options.resetBoundsInterval > 0) {
                ts.resetBounds();
                ts.resetBoundsTimerId = setInterval(function () {
                    var oldestValidTime, now, width;
                    oldestValidTime = null;
                    if (ρσ_exists.n(self.canvas)) {
                        now = (new Date).getTime();
                        width = self.canvas.clientWidth;
                        oldestValidTime = now - width * this.options.millisPerPixel - 1e4;
                    }
                    ts.resetBounds(oldestValidTime);
                }.bind(self), ts.options.resetBoundsInterval);
            }
        };
        if (!Smoothie.prototype.addTimeSeries.__annotations__) Object.defineProperties(Smoothie.prototype.addTimeSeries, {
            __annotations__ : {value: {ts: TimeSeries, options: dict}},
            __defaults__ : {value: {options:{}}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["ts", "options"]}
        });
        Smoothie.prototype.snapshot_to = function snapshot_to(canvas) {
            var self = this;
            var dpr, width, height, context;
            dpr = (self.options.enableDpiScaling) ? window.devicePixelRatio : 1;
            width = self.canvas.getAttribute("width");
            canvas.setAttribute("width", width.toString());
            canvas.style.width = self.canvas.style.width;
            height = self.canvas.getAttribute("height");
            canvas.setAttribute("height", height.toString());
            canvas.style.height = self.canvas.style.height;
            context = canvas.getContext("2d");
            context.scale(dpr, dpr);
            context.drawImage(self.canvas, 0, 0, width / dpr, height / dpr);
        };
        if (!Smoothie.prototype.snapshot_to.__argnames__) Object.defineProperties(Smoothie.prototype.snapshot_to, {
            __argnames__ : {value: ["canvas"]}
        });
        Smoothie.prototype.__repr__ = function __repr__ () {
            if(RapydSmoothie.prototype.__repr__) return RapydSmoothie.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Smoothie.prototype.__str__ = function __str__ () {
            if(RapydSmoothie.prototype.__str__) return RapydSmoothie.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Smoothie.prototype, "__bases__", {value: [RapydSmoothie]});

        ρσ_modules["controls.smoothie"].TimeSeries = TimeSeries;
        ρσ_modules["controls.smoothie"].Smoothie = Smoothie;
    })();

    (function(){
        var __name__ = "dialogs";

    })();

    (function(){
        var __name__ = "utils.uuid";
        function uuid4() {
            var d;
            d = (new Date).getTime();
            if ((typeof performance !== "undefined" && performance !== null) && (typeof performance.now === "function" || typeof typeof performance.now === "object" && ρσ_equals(typeof performance.now, "function"))) {
                d += performance.now();
            }
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function() {
                var ρσ_anonfunc = function (c) {
                    var r;
                    r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (((c === "x" || typeof c === "object" && ρσ_equals(c, "x"))) ? r : r & 3 | 8).toString(16);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["c"]}
                });
                return ρσ_anonfunc;
            })());
        };

        ρσ_modules["utils.uuid"].uuid4 = uuid4;
    })();

    (function(){
        var __name__ = "dialogs.base";
        var uuid4 = ρσ_modules["utils.uuid"].uuid4;

        function Base() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Base.prototype.__init__.apply(this, arguments);
        }
        Base.prototype.__init__ = function __init__() {
            var self = this;
            self.modal = null;
            self.dfd = jQuery.Deferred();
            self.id = uuid4().replace(/-/g, "");
            self.esc_to_dismiss = true;
        };
        Base.__argnames__ = Base.prototype.__init__.__argnames__;
        Base.__handles_kwarg_interpolation__ = Base.prototype.__init__.__handles_kwarg_interpolation__;
        Base.prototype.remove = function remove() {
            var self = this;
            if (self.modal !== null) {
                self.modal.remove();
                delete self.modal;
            }
        };
        Base.prototype.create = function create() {
            var self = this;
            var html = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? create.__defaults__.html : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "html")){
                html = ρσ_kwargs_obj.html;
            }
            self.remove();
            self.modal = $(html).modal((function(){
                var ρσ_d = {};
                ρσ_d["backdrop"] = "static";
                ρσ_d["keyboard"] = false;
                return ρσ_d;
            }).call(this));
            return self.modal;
        };
        if (!Base.prototype.create.__defaults__) Object.defineProperties(Base.prototype.create, {
            __defaults__ : {value: {html:"<div></div>"}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["html"]}
        });
        Base.prototype.show = function show() {
            var self = this;
            var html = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? show.__defaults__.html : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "html")){
                html = ρσ_kwargs_obj.html;
            }
            if (html !== null) {
                self.create(html);
            }
            if (self.modal !== null) {
                $("body").append(self.modal);
                self.modal.on("hidden.bs.modal", (function() {
                    var ρσ_anonfunc = function (event) {
                        self.remove();
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["event"]}
                    });
                    return ρσ_anonfunc;
                })());
                self.modal.on("keydown", (function() {
                    var ρσ_anonfunc = function (event) {
                        if ((event.which === 27 || typeof event.which === "object" && ρσ_equals(event.which, 27))) {
                            if ((self.esc_to_dismiss === true || typeof self.esc_to_dismiss === "object" && ρσ_equals(self.esc_to_dismiss, true))) {
                                self.modal.modal("hide");
                            }
                        }
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["event"]}
                    });
                    return ρσ_anonfunc;
                })());
                self.modal.modal("show");
            }
            return self.dfd.promise();
        };
        if (!Base.prototype.show.__defaults__) Object.defineProperties(Base.prototype.show, {
            __defaults__ : {value: {html:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["html"]}
        });
        Base.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Base.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(Base.prototype, "__bases__", {value: []});

        function Message() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Message.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Message, Base);
        Message.prototype.__init__ = function __init__() {
            var self = this;
            var message = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.message : arguments[0];
            var title = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.title : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "message")){
                message = ρσ_kwargs_obj.message;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "title")){
                title = ρσ_kwargs_obj.title;
            }
            Base.prototype.__init__.call(self);
            self.title = title;
            self.message = message;
        };
        if (!Message.prototype.__init__.__defaults__) Object.defineProperties(Message.prototype.__init__, {
            __defaults__ : {value: {message:null, title:"The Onion Box"}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["message", "title"]}
        });
        Message.__argnames__ = Message.prototype.__init__.__argnames__;
        Message.__handles_kwarg_interpolation__ = Message.prototype.__init__.__handles_kwarg_interpolation__;
        Message.prototype.create = function create() {
            var self = this;
            var html;
            html = "\n            <div class=\"modal fade\" id=\"login_modal\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 id=\"title.{id}\" class=\"modal-title cc-dialog-title\">{title}</h5>\n                            <button type=\"button\" class=\"close cc-dialog-close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n                        <div id=\"message.{id}\" class=\"modal-body\">{message}</div>\n                        <div class=\"modal-footer\">\n                            <button type=\"button\" class=\"btn btn-outline-primary\" data-dismiss=\"modal\" tabIndex=\"2\">\n                                Close\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, title: self.title, message: self.message})]));
            return Base.prototype.create.call(self, html);
        };
        Message.prototype.show = function show() {
            var self = this;
            if (self.modal === null) {
                self.create();
            }
            return Base.prototype.show.call(self);
        };
        Message.prototype.__repr__ = function __repr__ () {
            if(Base.prototype.__repr__) return Base.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Message.prototype.__str__ = function __str__ () {
            if(Base.prototype.__str__) return Base.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Message.prototype, "__bases__", {value: [Base]});

        ρσ_modules["dialogs.base"].Base = Base;
        ρσ_modules["dialogs.base"].Message = Message;
    })();

    (function(){
        var __name__ = "utils.auth";
        function NotImplemetedError() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            NotImplemetedError.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(NotImplemetedError, Exception);
        NotImplemetedError.prototype.__init__ = function __init__(message) {
            var self = this;
            self.name = "NotImplementedError";
            self.message = message;
        };
        if (!NotImplemetedError.prototype.__init__.__argnames__) Object.defineProperties(NotImplemetedError.prototype.__init__, {
            __argnames__ : {value: ["message"]}
        });
        NotImplemetedError.__argnames__ = NotImplemetedError.prototype.__init__.__argnames__;
        NotImplemetedError.__handles_kwarg_interpolation__ = NotImplemetedError.prototype.__init__.__handles_kwarg_interpolation__;
        NotImplemetedError.prototype.__repr__ = function __repr__ () {
            if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        NotImplemetedError.prototype.__str__ = function __str__ () {
            if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(NotImplemetedError.prototype, "__bases__", {value: [Exception]});

        function Base() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Base.prototype.__init__.apply(this, arguments);
        }
        Base.prototype.__init__ = function __init__(header) {
            var self = this;
            self.header = header;
        };
        if (!Base.prototype.__init__.__argnames__) Object.defineProperties(Base.prototype.__init__, {
            __argnames__ : {value: ["header"]}
        });
        Base.__argnames__ = Base.prototype.__init__.__argnames__;
        Base.__handles_kwarg_interpolation__ = Base.prototype.__init__.__handles_kwarg_interpolation__;
        Base.prototype.create_auth_header = function create_auth_header(username, password) {
            var self = this;
            throw new NotImplemetedError("Not implemented.");
        };
        if (!Base.prototype.create_auth_header.__argnames__) Object.defineProperties(Base.prototype.create_auth_header, {
            __argnames__ : {value: ["username", "password"]}
        });
        Base.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Base.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(Base.prototype, "__bases__", {value: []});

        function Basic() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Basic.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Basic, Base);
        Basic.prototype.__init__ = function __init__ () {
            Base.prototype.__init__ && Base.prototype.__init__.apply(this, arguments);
        };
        Basic.prototype.create_auth_header = function create_auth_header(username, password) {
            var self = this;
            var headers, regex, elements, scheme, response;
            headers = self.header.split(",");
            if (headers.length > 1) {
                return null;
            }
            regex = /(.+) realm=(.+)/g;
            elements = regex.exec(headers[0]);
            if (!(typeof elements !== "undefined" && elements !== null) || (elements.length !== 3 && (typeof elements.length !== "object" || ρσ_not_equals(elements.length, 3)))) {
                return null;
            }
            scheme = elements[1];
            response = btoa(username + ":" + password);
            return scheme + " " + response;
        };
        if (!Basic.prototype.create_auth_header.__argnames__) Object.defineProperties(Basic.prototype.create_auth_header, {
            __argnames__ : {value: ["username", "password"]}
        });
        Basic.prototype.__repr__ = function __repr__ () {
            if(Base.prototype.__repr__) return Base.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Basic.prototype.__str__ = function __str__ () {
            if(Base.prototype.__str__) return Base.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Basic.prototype, "__bases__", {value: [Base]});

        function Digest() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Digest.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Digest, Base);
        Digest.prototype.__init__ = function __init__() {
            var self = this;
            var header = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var method = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.method : arguments[1];
            var url = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.url : arguments[2];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "method")){
                method = ρσ_kwargs_obj.method;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "url")){
                url = ρσ_kwargs_obj.url;
            }
            Base.prototype.__init__.call(self, header);
            self.method = method;
            self.url = url;
            self.nc = 1;
        };
        if (!Digest.prototype.__init__.__defaults__) Object.defineProperties(Digest.prototype.__init__, {
            __defaults__ : {value: {method:"GET", url:"login"}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["header", "method", "url"]}
        });
        Digest.__argnames__ = Digest.prototype.__init__.__argnames__;
        Digest.__handles_kwarg_interpolation__ = Digest.prototype.__init__.__handles_kwarg_interpolation__;
        Digest.prototype.create_auth_header = function create_auth_header(username, password) {
            var self = this;
            var headers, hh, auth_method, item, data, realm, nonce, opaque, qop, cnonce, ha1_prep, HA1, ha2_prep, HA2, response;
            function generate_client_nonce() {
                var characters, token, randNum, i;
                characters = "abcdef0123456789";
                token = "";
                for (var ρσ_Index0 = 0; ρσ_Index0 < 16; ρσ_Index0++) {
                    i = ρσ_Index0;
                    randNum = Math.round(Math.random() * characters.length);
                    token += characters.substr(randNum, 1);
                }
                return token;
            };

            headers = self.header.split(", ");
            if ((headers.length === 1 || typeof headers.length === "object" && ρσ_equals(headers.length, 1))) {
                return null;
            }
            hh = headers[0].split(" ");
            if ((!hh.length === 2 || typeof !hh.length === "object" && ρσ_equals(!hh.length, 2))) {
                return null;
            }
            auth_method = hh[0];
            headers[0] = hh[1];
            var ρσ_Iter1 = ρσ_Iterable(headers);
            for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                item = ρσ_Iter1[ρσ_Index1];
                item = item.split(",")[0];
                data = item.split("=");
                if ((data.length !== 2 && (typeof data.length !== "object" || ρσ_not_equals(data.length, 2)))) {
                    continue;
                }
                if ((data[0] === "realm" || typeof data[0] === "object" && ρσ_equals(data[0], "realm"))) {
                    realm = data[1];
                } else if ((data[0] === "nonce" || typeof data[0] === "object" && ρσ_equals(data[0], "nonce"))) {
                    nonce = data[1];
                } else if ((data[0] === "opaque" || typeof data[0] === "object" && ρσ_equals(data[0], "opaque"))) {
                    opaque = data[1];
                } else if ((data[0] === "qop" || typeof data[0] === "object" && ρσ_equals(data[0], "qop"))) {
                    qop = data[1];
                }
            }
            cnonce = generate_client_nonce();
            self.nc += 1;
            ha1_prep = username + ":" + realm + ":" + password;
            HA1 = md5(ha1_prep);
            ha2_prep = self.method + ":" + self.url;
            HA2 = md5(ha2_prep);
            response = (qop) ? md5(HA1 + ":" + nonce + ":" + ("00000000" + self.nc).slice(-8) + ":" + cnonce + ":" + qop + ":" + HA2) : md5(HA1 + ":" + nonce + ":" + HA2);
            if (qop) {
                return auth_method + " " + "username=\"" + username + "\", " + "realm=\"" + realm + "\", " + "nonce=\"" + nonce + "\", " + "uri=\"" + self.url + "\", " + "response=\"" + response + "\", " + "opaque=\"" + opaque + "\", " + "qop=" + qop + "\", " + "nc=" + ("00000000" + self.nc).slice(-8) + ", " + "cnonce=\"" + cnonce + "\"";
            }
            return auth_method + " " + "username=\"" + username + "\", " + "realm=\"" + realm + "\", " + "nonce=\"" + nonce + "\", " + "uri=\"" + self.url + "\", " + "response=\"" + response + "\"";
        };
        if (!Digest.prototype.create_auth_header.__argnames__) Object.defineProperties(Digest.prototype.create_auth_header, {
            __argnames__ : {value: ["username", "password"]}
        });
        Digest.prototype.__repr__ = function __repr__ () {
            if(Base.prototype.__repr__) return Base.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Digest.prototype.__str__ = function __str__ () {
            if(Base.prototype.__str__) return Base.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Digest.prototype, "__bases__", {value: [Base]});

        ρσ_modules["utils.auth"].NotImplemetedError = NotImplemetedError;
        ρσ_modules["utils.auth"].Base = Base;
        ρσ_modules["utils.auth"].Basic = Basic;
        ρσ_modules["utils.auth"].Digest = Digest;
    })();

    (function(){
        var __name__ = "dialogs.login";
        var DialogBase = ρσ_modules["dialogs.base"].Base;

        var Basic = ρσ_modules["utils.auth"].Basic;
        var Digest = ρσ_modules["utils.auth"].Digest;

        function Login_orig() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Login_orig.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Login_orig, DialogBase);
        Login_orig.prototype.__init__ = function __init__() {
            var self = this;
            var server = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var session_id = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
            var base_path = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.base_path : arguments[2];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "base_path")){
                base_path = ρσ_kwargs_obj.base_path;
            }
            DialogBase.prototype.__init__.call(self);
            self.server = server;
            self.base_path = base_path;
            self.session_id = session_id;
        };
        if (!Login_orig.prototype.__init__.__defaults__) Object.defineProperties(Login_orig.prototype.__init__, {
            __defaults__ : {value: {base_path:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["server", "session_id", "base_path"]}
        });
        Login_orig.__argnames__ = Login_orig.prototype.__init__.__argnames__;
        Login_orig.__handles_kwarg_interpolation__ = Login_orig.prototype.__init__.__handles_kwarg_interpolation__;
        Login_orig.prototype.create = function create() {
            var self = this;
            var html;
            html = "\n            <div class=\"modal fade\" id=\"login_modal\" tabindex=\"-1\" role=\"dialog\"\n                aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n                <form onsubmit='return false'>\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 class=\"modal-title cc-dialog-title\">Authentication Request</h5>\n                            <button type=\"button\" class=\"close cc-dialog-close\" data-dismiss=\"modal\"\n                                id=\"bClose{id}\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class='row'>\n                                <label for=\"server\" class=\"col-3 col-form-label\">Tor:</label>\n                                <div class='col-9 col-form-label' id='server'>{server}\n                                </div>\n                            </div>\n                                <div class='row'>\n                                    <label for=\"password\" class=\"col-3 col-form-label\">Password:</label>\n                                    <div class='col-9' id='password'>\n                                        <input type=\"password\" id=\"iPassword{id}\" class=\"form-control\" tabIndex=\"0\"\n                                            aria-describedby=\"labelHelp\"\n                                            value=''>\n                                    </div>\n                                </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <div style=\"margin-right: auto\" id=\"lStatus{id}\"></div>\n                            <button type=\"button\" class=\"btn btn-outline-secondary\" data-dismiss=\"modal\"\n                                id=\"bCancel{id}\">\n                                Cancel\n                            </button>\n                            <button type=\"submit\" id=\"bLogin{id}\" class=\"btn cc-dialog-btn-login\">\n                                Submit\n                            </button>\n                        </div>\n                    </div>\n                </div>\n                </form>\n            </div>\n        ";
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, server: self.server})]));
            DialogBase.prototype.create.call(self, html);
        };
        Login_orig.prototype.show = function show() {
            var self = this;
            var p;
            if (self.modal === null) {
                self.create();
            }
            p = DialogBase.prototype.show.call(self);
            $("#bLogin" + self.id).on("click", (function() {
                var ρσ_anonfunc = function (e) {
                    var pwd, url;
                    $("#bLogin" + self.id).prop("disabled", true);
                    $("#bClose" + self.id).prop("disabled", true);
                    $("#bCancel" + self.id).prop("disabled", true);
                    $("#iPassword" + self.id).prop("disabled", true);
                    self.esc_to_dismiss = false;
                    pwd = $("#iPassword" + self.id).val();
                    if (!(typeof pwd !== "undefined" && pwd !== null)) {
                        self.modal.modal("hide");
                        return;
                    }
                    url = self.base_path + "/" + self.session_id + "/cc/" + "login";
                    $.post((function(){
                        var ρσ_d = {};
                        ρσ_d["url"] = url;
                        ρσ_d["timeout"] = 2e3;
                        return ρσ_d;
                    }).call(this)).fail((function() {
                        var ρσ_anonfunc = function (request, textStatus, errorThrown) {
                            var header, elements, auth, error_html;
                            if ((request.status === 401 || typeof request.status === "object" && ρσ_equals(request.status, 401))) {
                                header = request.getResponseHeader("WWW-Authenticate");
                                elements = header.split(",");
                                if (elements.length > 1) {
                                    auth = new Digest(header, "POST", url);
                                } else {
                                    auth = new Basic(header);
                                }
                                $.post((function(){
                                    var ρσ_d = {};
                                    ρσ_d["url"] = url;
                                    ρσ_d["timeout"] = 2e3;
                                    ρσ_d["headers"] = (function(){
                                        var ρσ_d = {};
                                        ρσ_d["Authorization"] = auth.create_auth_header(self.session_id, pwd);
                                        return ρσ_d;
                                    }).call(this);
                                    return ρσ_d;
                                }).call(this)).fail((function() {
                                    var ρσ_anonfunc = function (request, textStatus, errorThrown) {
                                        var error_html;
                                        error_html = "\n                            <div class=\"text-danger small\">Failed to authenticate.</div>\n                        ";
                                        $("#lStatus" + self.id).html(error_html);
                                        $("#bClose" + self.id).prop("disabled", false);
                                        $("#bCancel" + self.id).prop("disabled", false);
                                        self.esc_to_dismiss = true;
                                        return;
                                    };
                                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                        __argnames__ : {value: ["request", "textStatus", "errorThrown"]}
                                    });
                                    return ρσ_anonfunc;
                                })()).done((function() {
                                    var ρσ_anonfunc = function (data, textStatus, response) {
                                        self.dfd.resolve((function(){
                                            var ρσ_d = {};
                                            ρσ_d["id"] = data;
                                            return ρσ_d;
                                        }).call(this));
                                        self.modal.modal("hide");
                                        return;
                                    };
                                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                        __argnames__ : {value: ["data", "textStatus", "response"]}
                                    });
                                    return ρσ_anonfunc;
                                })());
                            } else {
                                error_html = "\n                        <div class=\"text-danger small\">Failed to launch authentication sequence.</div>\n                    ";
                                $("#lStatus" + self.id).html(error_html);
                                $("#bClose" + self.id).prop("disabled", false);
                                $("#bCancel" + self.id).prop("disabled", false);
                                self.esc_to_dismiss = true;
                                return;
                            }
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["request", "textStatus", "errorThrown"]}
                        });
                        return ρσ_anonfunc;
                    })());
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            return p;
        };
        Login_orig.prototype.__repr__ = function __repr__ () {
            if(DialogBase.prototype.__repr__) return DialogBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Login_orig.prototype.__str__ = function __str__ () {
            if(DialogBase.prototype.__str__) return DialogBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Login_orig.prototype, "__bases__", {value: [DialogBase]});

        function Login() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Login.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Login, DialogBase);
        Login.prototype.__init__ = function __init__(server, session_id) {
            var self = this;
            DialogBase.prototype.__init__.call(self);
            self.server = server;
            self.session_id = session_id;
        };
        if (!Login.prototype.__init__.__argnames__) Object.defineProperties(Login.prototype.__init__, {
            __argnames__ : {value: ["server", "session_id"]}
        });
        Login.__argnames__ = Login.prototype.__init__.__argnames__;
        Login.__handles_kwarg_interpolation__ = Login.prototype.__init__.__handles_kwarg_interpolation__;
        Login.prototype.create = function create() {
            var self = this;
            var html;
            html = "\n            <div class=\"modal fade tobcc-font\" id=\"login_modal\" tabindex=\"-1\" role=\"dialog\"\n                aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n                <form onsubmit='return false'>\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 class=\"modal-title cc-dialog-title\">Authentication Request</h5>\n                            <button type=\"button\" class=\"close cc-dialog-close\" data-dismiss=\"modal\"\n                                id=\"bClose{id}\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class='row'>\n                                <label for=\"server\" class=\"col-3 col-form-label\">Tor:</label>\n                                <div class='col-9 col-form-label' id='server'>{server}\n                                </div>\n                            </div>\n                                <div class='row'>\n                                    <label for=\"password\" class=\"col-3 col-form-label\">Password:</label>\n                                    <div class='col-9' id='password'>\n                                        <input type=\"password\" id=\"iPassword{id}\" class=\"form-control\" tabIndex=\"0\"\n                                            aria-describedby=\"labelHelp\"\n                                            value=''>\n                                    </div>\n                                </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <div style=\"margin-right: auto\" id=\"lStatus{id}\"></div>\n                            <button type=\"button\" class=\"btn btn-outline-secondary\" data-dismiss=\"modal\"\n                                id=\"bCancel{id}\">\n                                Cancel\n                            </button>\n                            <button type=\"submit\" id=\"bLogin{id}\" class=\"btn cc-dialog-btn-login\">\n                                Submit\n                            </button>\n                        </div>\n                    </div>\n                </div>\n                </form>\n            </div>\n        ";
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, server: self.server})]));
            DialogBase.prototype.create.call(self, html);
        };
        Login.prototype.show = function show() {
            var self = this;
            var p;
            if (self.modal === null) {
                self.create();
            }
            p = DialogBase.prototype.show.call(self);
            $("#bLogin" + self.id).on("click", (function() {
                var ρσ_anonfunc = function (e) {
                    var pwd;
                    pwd = $("#iPassword" + self.id).val();
                    self.dfd.resolve((function(){
                        var ρσ_d = {};
                        ρσ_d["password"] = pwd;
                        return ρσ_d;
                    }).call(this));
                    self.modal.modal("hide");
                    return;
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            return p;
        };
        Login.prototype.__repr__ = function __repr__ () {
            if(DialogBase.prototype.__repr__) return DialogBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Login.prototype.__str__ = function __str__ () {
            if(DialogBase.prototype.__str__) return DialogBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Login.prototype, "__bases__", {value: [DialogBase]});

        ρσ_modules["dialogs.login"].Login_orig = Login_orig;
        ρσ_modules["dialogs.login"].Login = Login;
    })();

    (function(){
        var __name__ = "controls.base";
        var MakeID = ρσ_modules["utils.make_id"].make_id;

        function Base() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Base.prototype.__init__.apply(this, arguments);
        }
        Base.prototype.__init__ = function __init__(id, tag) {
            var self = this;
            self.id = id;
            self.tag = tag;
        };
        if (!Base.prototype.__init__.__argnames__) Object.defineProperties(Base.prototype.__init__, {
            __argnames__ : {value: ["id", "tag"]}
        });
        Base.__argnames__ = Base.prototype.__init__.__argnames__;
        Base.__handles_kwarg_interpolation__ = Base.prototype.__init__.__handles_kwarg_interpolation__;
        Base.prototype.update = function update(value) {
            var self = this;
            console.log("Base:update() Not implemented...");
        };
        if (!Base.prototype.update.__argnames__) Object.defineProperties(Base.prototype.update, {
            __argnames__ : {value: ["value"]}
        });
        Base.prototype.make_id = function make_id() {
            var self = this;
            var tag = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? make_id.__defaults__.tag : arguments[0];
            var jquery = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? make_id.__defaults__.jquery : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "tag")){
                tag = ρσ_kwargs_obj.tag;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "jquery")){
                jquery = ρσ_kwargs_obj.jquery;
            }
            return MakeID(self.id, tag, jquery);
        };
        if (!Base.prototype.make_id.__defaults__) Object.defineProperties(Base.prototype.make_id, {
            __defaults__ : {value: {tag:null, jquery:true}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["tag", "jquery"]}
        });
        Base.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Base.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(Base.prototype, "__bases__", {value: []});

        ρσ_modules["controls.base"].Base = Base;
    })();

    (function(){
        var __name__ = "controls.flags";
        var ControlBase = ρσ_modules["controls.base"].Base;

        function Flags() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Flags.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Flags, ControlBase);
        Flags.prototype.__init__ = function __init__(id, tag) {
            var self = this;
            ControlBase.prototype.__init__.call(self, id, tag);
            self.flags = ρσ_list_decorate([]);
            self.known_flags = (function(){
                var ρσ_d = {};
                ρσ_d["Authority"] = "<i class=\"fas fa-shield-alt fa-2x\"></i>";
                ρσ_d["BadExit"] = "\n                    <span class=\"fa-stack \">\n                        <i class=\"fas fa-door-closed fa-stack-1x\"></i>\n                        <i class=\"fas fa-ban fa-stack-2x\" style=\"color:Tomato\"></i>\n                    </span>\n                ";
                ρσ_d["BadDirectory"] = "\n                    <span class=\"fa-stack \">\n                        <i class=\"fas fa-folder fa-stack-1x\"></i>\n                        <i class=\"fas fa-ban fa-stack-2x\" style=\"color:Tomato\"></i>\n                    </span>\n                ";
                ρσ_d["Exit"] = "<i class=\"fas fa-door-open fa-2x\" style=\"color:#000000\"></i>";
                ρσ_d["Fast"] = "<i class=\"fas fa-shipping-fast fa-2x\"></i>";
                ρσ_d["Guard"] = "<i class=\"fas fa-user-shield fa-2x\"></i>";
                ρσ_d["HSDir"] = "<i class=\"fas fa-folder-open fa-2x\"></i>";
                ρσ_d["Named"] = "<i class=\"fas fa-user-tag fa-2x\"></i>";
                ρσ_d["Stable"] = "<i class=\"fas fa-dice-d6 fa-2x\"></i>";
                ρσ_d["Running"] = "<i class=\"fas fa-running fa-2x\"></i>";
                ρσ_d["Unnamed"] = "\n                    <span class=\"fa-stack \">\n                        <i class=\"fas fa-tag fa-stack-1x\"></i>\n                        <i class=\"fas fa-ban fa-stack-2x\" style=\"color:Tomato\"></i>\n                    </span>\n                ";
                ρσ_d["unknown"] = "\n                    <span class=\"fa-stack \">\n                        <i class=\"far fa-square fa-stack-2x\"></i>\n                        <i class=\"fa-stack-1x\" style=\"font-size: 14px;font-family:'LatoLatinWeb';font-style:normal;font-weight:bold;\">B</i>\n                    </span>\n            ";
                ρσ_d["Valid"] = "\n                    <span class=\"fa-stack \">\n                        <i class=\"fas fa-circle fa-stack-2x\" style=\"color:#00FF00\"></i>\n                        <i class=\"fas fa-check-circle fa-stack-2x\"></i>\n                    </span>\n                ";
                ρσ_d["soft"] = "<i class=\"far fa-pause-circle fa-2x\"></i>";
                ρσ_d["hard"] = "<i class=\"fas fa-pause-circle fa-2x\"></i>";
                ρσ_d["mode"] = "<i class=\"fas fa-circle-notch fa-spin fa-2x\"></i>";
                return ρσ_d;
            }).call(this);
        };
        if (!Flags.prototype.__init__.__argnames__) Object.defineProperties(Flags.prototype.__init__, {
            __argnames__ : {value: ["id", "tag"]}
        });
        Flags.__argnames__ = Flags.prototype.__init__.__argnames__;
        Flags.__handles_kwarg_interpolation__ = Flags.prototype.__init__.__handles_kwarg_interpolation__;
        Flags.prototype.create_flag_icon_html = function create_flag_icon_html(flag, tor_mode) {
            var self = this;
            var html, tooltips, tooltip;
            if (ρσ_in(flag, self.known_flags)) {
                html = "\n                <div class=\"col cc-flag align-middle\" id=\"tobcc.{id}.flags.{flag}\"\n                    data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"{tooltip}\">\n                    {html}\n                </div>\n            ";
                tooltips = (function(){
                    var ρσ_d = {};
                    ρσ_d["soft"] = "Hibernating | Soft";
                    ρσ_d["hard"] = "Hibernating | Hard";
                    ρσ_d["mode"] = "";
                    return ρσ_d;
                }).call(this);
                if ((flag === "unknown" || typeof flag === "object" && ρσ_equals(flag, "unknown")) && (tor_mode === "Client" || typeof tor_mode === "object" && ρσ_equals(tor_mode, "Client"))) {
                    tooltip = "Tor @ Client Mode maintains no flags.";
                } else if (ρσ_in(flag, tooltips)) {
                    tooltip = tooltips[(typeof flag === "number" && flag < 0) ? tooltips.length + flag : flag];
                } else {
                    tooltip = flag;
                }
                return ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, flag: flag.toLowerCase(), tooltip: tooltip, html: (ρσ_expr_temp = self.known_flags)[(typeof flag === "number" && flag < 0) ? ρσ_expr_temp.length + flag : flag]})]));
            }
            html = "\n            <div class=\"col\" style=\"margin-top:auto; margin-bottom:auto; font-size:13px;\" id=\"tobcc.{id}.flags.{lflag}\">\n                {flag}\n            </div>\n        ";
            return ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, flag: flag, lflag: flag.toLowerCase()})]));
        };
        if (!Flags.prototype.create_flag_icon_html.__argnames__) Object.defineProperties(Flags.prototype.create_flag_icon_html, {
            __argnames__ : {value: ["flag", "tor_mode"]}
        });
        Flags.prototype.update = function update() {
            var self = this;
            var value = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.value : arguments[0];
            var tor_mode = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.tor_mode : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "value")){
                value = ρσ_kwargs_obj.value;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "tor_mode")){
                tor_mode = ρσ_kwargs_obj.tor_mode;
            }
            var flag_container, f, flag, flag_count, flag_row, flag_row_count, html, flag_check, new_flag;
            flag_container = $(self.make_id(self.tag));
            if (!(typeof value !== "undefined" && value !== null)) {
                value = ρσ_list_decorate([]);
            }
            if ((value !== self.flags && (typeof value !== "object" || ρσ_not_equals(value, self.flags)))) {
                var ρσ_Iter0 = ρσ_Iterable(self.flags);
                for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                    flag = ρσ_Iter0[ρσ_Index0];
                    if (!ρσ_in(flag, value)) {
                        f = $(self.make_id("flags." + flag.toLowerCase()));
                        if (f.length > 0) {
                            f.tooltip("dispose");
                            f.remove();
                        }
                    }
                }
                flag_count = 0;
                flag_row = null;
                flag_row_count = 0;
                var ρσ_Iter1 = ρσ_Iterable(value);
                for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                    flag = ρσ_Iter1[ρσ_Index1];
                    if (ρσ_equals(flag_count % 4, 0)) {
                        flag_row_count += 1;
                        flag_row = $(self.make_id("flags.row." + flag_row_count));
                        if (flag_row.length < 1) {
                            html = "<div class='row cc-flags-row justify-content-around' id='tobcc.{id}.flags.row.{count}'></div>";
                            flag_row = $(ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, count: flag_row_count})]))).appendTo(flag_container);
                        }
                        flag_check = flag_row.children(":first");
                    } else {
                        flag_check = flag_check.next();
                    }
                    flag_count += 1;
                    f = $(self.make_id("flags." + flag.toLowerCase()));
                    if (f.length > 0) {
                        if (f.is(flag_check)) {
                            continue;
                        } else {
                            f.tooltip("dispose");
                            f.remove();
                        }
                    }
                    new_flag = $(self.create_flag_icon_html(flag, tor_mode));
                    if (flag_check.length > 0) {
                        new_flag.insertBefore(flag_check);
                    } else {
                        new_flag.appendTo(flag_row);
                    }
                    new_flag.tooltip((function(){
                        var ρσ_d = {};
                        ρσ_d["container"] = "body";
                        ρσ_d["trigger"] = "click hover";
                        return ρσ_d;
                    }).call(this));
                }
            }
            self.flags = value;
        };
        if (!Flags.prototype.update.__defaults__) Object.defineProperties(Flags.prototype.update, {
            __defaults__ : {value: {value:null, tor_mode:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["value", "tor_mode"]}
        });
        Flags.prototype.__repr__ = function __repr__ () {
            if(ControlBase.prototype.__repr__) return ControlBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Flags.prototype.__str__ = function __str__ () {
            if(ControlBase.prototype.__str__) return ControlBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Flags.prototype, "__bases__", {value: [ControlBase]});

        ρσ_modules["controls.flags"].Flags = Flags;
    })();

    (function(){
        var __name__ = "controls.connection";
        var ControlBase = ρσ_modules["controls.base"].Base;

        function Connection() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Connection.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Connection, ControlBase);
        Connection.prototype.__init__ = function __init__() {
            var self = this;
            var id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var tag = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.tag : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "tag")){
                tag = ρσ_kwargs_obj.tag;
            }
            var html;
            ControlBase.prototype.__init__.call(self, id, tag);
            html = "\n            <i class=\"cc-conn fas fa-home text-primary fa-lg\" id=\"tobcc.{id}.{tag}.home\"\n                style=\"display:None; opacity:0.35\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Home\"></i> \n            <i class=\"cc-conn fas fa-lock fa-sm\" id=\"tobcc.{id}.{tag}.password\"\n                style=\"display:None;\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Authenticated by Password\"></i> \n            <i class=\"cc-conn fas fa-shield-alt fa-sm\" id=\"tobcc.{id}.{tag}.cookie\"\n                style=\"display:None;\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Connection authorized by Cookie\"></i> \n            <i class=\"cc-conn fas fa-project-diagram fa-sm\" id=\"tobcc.{id}.{tag}.proxy\"\n                style=\"display:None;\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Proxied via the Tor network\"></i> \n        ";
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, tag: self.tag})]));
            $(self.make_id(self.tag)).html(html);
            self.last = null;
        };
        if (!Connection.prototype.__init__.__defaults__) Object.defineProperties(Connection.prototype.__init__, {
            __defaults__ : {value: {tag:"connection"}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["id", "tag"]}
        });
        Connection.__argnames__ = Connection.prototype.__init__.__argnames__;
        Connection.__handles_kwarg_interpolation__ = Connection.prototype.__init__.__handles_kwarg_interpolation__;
        Connection.prototype.update = function update(data) {
            var self = this;
            var icons, icon, i;
            if (data === null || (data === self.last || typeof data === "object" && ρσ_equals(data, self.last))) {
                return;
            }
            icons = (function(){
                var ρσ_d = {};
                ρσ_d["h"] = "home";
                ρσ_d["p"] = "password";
                ρσ_d["c"] = "cookie";
                ρσ_d["x"] = "proxy";
                return ρσ_d;
            }).call(this);
            var ρσ_Iter0 = ρσ_Iterable(icons);
            for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                i = ρσ_Iter0[ρσ_Index0];
                icon = $(self.make_id(self.tag + "." + icons[(typeof i === "number" && i < 0) ? icons.length + i : i]));
                if (ρσ_in(i, data)) {
                    if (icon.is(":hidden")) {
                        icon.show(1e3);
                        icon.tooltip((function(){
                            var ρσ_d = {};
                            ρσ_d["container"] = "body";
                            ρσ_d["trigger"] = "click hover";
                            return ρσ_d;
                        }).call(this));
                    }
                } else {
                    if (icon.is(":visible")) {
                        icon.hide(500);
                        icon.tooltip("dispose");
                    }
                }
            }
            self.last = data;
        };
        if (!Connection.prototype.update.__argnames__) Object.defineProperties(Connection.prototype.update, {
            __argnames__ : {value: ["data"]}
        });
        Connection.prototype.__repr__ = function __repr__ () {
            if(ControlBase.prototype.__repr__) return ControlBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Connection.prototype.__str__ = function __str__ () {
            if(ControlBase.prototype.__str__) return ControlBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Connection.prototype, "__bases__", {value: [ControlBase]});

        ρσ_modules["controls.connection"].Connection = Connection;
    })();

    (function(){
        var __name__ = "controls.version_check";
        var ControlBase = ρσ_modules["controls.base"].Base;

        function VersionCheck() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            VersionCheck.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(VersionCheck, ControlBase);
        VersionCheck.prototype.__init__ = function __init__ () {
            ControlBase.prototype.__init__ && ControlBase.prototype.__init__.apply(this, arguments);
        };
        VersionCheck.prototype.update = function update() {
            var self = this;
            var version = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.version : arguments[0];
            var latest = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.latest : arguments[1];
            var flag = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.flag : arguments[2];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "version")){
                version = ρσ_kwargs_obj.version;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "latest")){
                latest = ρσ_kwargs_obj.latest;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flag")){
                flag = ρσ_kwargs_obj.flag;
            }
            var red_flags, $me, html, color, title;
            if ((version === self.version || typeof version === "object" && ρσ_equals(version, self.version)) && (latest === self.latest || typeof latest === "object" && ρσ_equals(latest, self.latest)) && (flag === self.flag || typeof flag === "object" && ρσ_equals(flag, self.flag))) {
                return true;
            }
            red_flags = ρσ_list_decorate([ "obsolete", "old", "unrecommended", "unknown" ]);
            $me = $(self.make_id(self.tag));
            if ($me.length < 1) {
                return false;
            }
            $me.tooltip("dispose");
            if ((version === latest || typeof version === "object" && ρσ_equals(version, latest)) && !ρσ_in(flag, red_flags)) {
                if ($me.is(":visible")) {
                    $me.hide(500);
                }
                return true;
            }
            html = "\n            <i class=\"fas fa-exclamation\" style=\"color:{color};\"></i>\n        ";
            color = "black";
            title = "";
            if (ρσ_in(flag, red_flags)) {
                color = "tomato";
                if (len(title) > 0) {
                    title += "<br>";
                }
                title += "This Tor version is <b>" + flag + "</b>!";
            }
            if (latest !== null) {
                if (len(title) > 0) {
                    title += "<br>";
                }
                title += "Latest stable Tor version is <b>" + latest + "</b>.";
            }
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({color: color})]));
            $me.html(html);
            if ($me.is(":hidden")) {
                $me.show(1e3);
            }
            $me.tooltip((function(){
                var ρσ_d = {};
                ρσ_d["container"] = "body";
                ρσ_d["trigger"] = "click hover";
                ρσ_d["html"] = true;
                ρσ_d["title"] = title;
                return ρσ_d;
            }).call(this));
            self.version = version;
            self.latest = latest;
            self.flag = flag;
            return true;
        };
        if (!VersionCheck.prototype.update.__defaults__) Object.defineProperties(VersionCheck.prototype.update, {
            __defaults__ : {value: {version:null, latest:null, flag:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["version", "latest", "flag"]}
        });
        VersionCheck.prototype.__repr__ = function __repr__ () {
            if(ControlBase.prototype.__repr__) return ControlBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        VersionCheck.prototype.__str__ = function __str__ () {
            if(ControlBase.prototype.__str__) return ControlBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(VersionCheck.prototype, "__bases__", {value: [ControlBase]});

        ρσ_modules["controls.version_check"].VersionCheck = VersionCheck;
    })();

    (function(){
        var __name__ = "controls.version";
        var ControlBase = ρσ_modules["controls.base"].Base;

        function Version() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Version.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Version, ControlBase);
        Version.prototype.__init__ = function __init__(id, tag) {
            var self = this;
            var $me, html;
            ControlBase.prototype.__init__.call(self, id, tag);
            print(self.tag, self.make_id(self.tag));
            $me = $(self.make_id(self.tag));
            html = "\n            <div class=\"col card-text text-center\" id=\"tobcc.{id}.{tag}.container\">\n                <span id=\"tobcc.{id}.{tag}.version\"></span>\n                <span id=\"tobcc.{id}.{tag}.check\" style=\"display:none\"></span>\n            </div>\n            <div class=\"col card-text text-left\" id=\"tobcc.{id}.{tag}.mode\" style=\"display:none\"></div>\n        ";
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({id: self.id, tag: self.tag})]));
            $me.html(html);
        };
        if (!Version.prototype.__init__.__argnames__) Object.defineProperties(Version.prototype.__init__, {
            __argnames__ : {value: ["id", "tag"]}
        });
        Version.__argnames__ = Version.prototype.__init__.__argnames__;
        Version.__handles_kwarg_interpolation__ = Version.prototype.__init__.__handles_kwarg_interpolation__;
        Version.prototype.update = function update() {
            var self = this;
            var version = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var mode = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.mode : arguments[1];
            var latest = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.latest : arguments[2];
            var flag = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? update.__defaults__.flag : arguments[3];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "mode")){
                mode = ρσ_kwargs_obj.mode;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "latest")){
                latest = ρσ_kwargs_obj.latest;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "flag")){
                flag = ρσ_kwargs_obj.flag;
            }
            var red_flags, $version, $check, html, color, title, $mode, $container;
            if ((version === self.version || typeof version === "object" && ρσ_equals(version, self.version)) && (mode === self.mode || typeof mode === "object" && ρσ_equals(mode, self.mode)) && (latest === self.latest || typeof latest === "object" && ρσ_equals(latest, self.latest)) && (flag === self.flag || typeof flag === "object" && ρσ_equals(flag, self.flag))) {
                return true;
            }
            red_flags = ρσ_list_decorate([ "obsolete", "old", "unrecommended", "unknown" ]);
            $version = $(self.make_id(self.tag + ".version"));
            $version.text("Tor " + version);
            $check = $(self.make_id(self.tag + ".check"));
            $check.tooltip("dispose");
            if (latest === null || (version === latest || typeof version === "object" && ρσ_equals(version, latest)) && !ρσ_in(flag, red_flags)) {
                if ($check.is(":visible")) {
                    $check.hide(500);
                }
            } else {
                html = "\n                <i class=\"fas fa-exclamation\" style=\"color:{color};\"></i>\n            ";
                color = "black";
                title = "";
                if (ρσ_in(flag, red_flags)) {
                    color = "tomato";
                    if (len(title) > 0) {
                        title += "<br>";
                    }
                    title += "This Tor version is <b>" + flag + "</b>!";
                }
                if (latest !== null) {
                    if (len(title) > 0) {
                        title += "<br>";
                    }
                    title += "Latest stable Tor version is <b>" + latest + "</b>.";
                }
                html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({color: color})]));
                $check.html(html);
                if ($check.is(":hidden")) {
                    $check.show(1e3);
                }
                $check.tooltip((function(){
                    var ρσ_d = {};
                    ρσ_d["container"] = "body";
                    ρσ_d["trigger"] = "click hover";
                    ρσ_d["html"] = true;
                    ρσ_d["title"] = title;
                    return ρσ_d;
                }).call(this));
            }
            $mode = $(self.make_id(self.tag + ".mode"));
            if ((mode === "" || typeof mode === "object" && ρσ_equals(mode, ""))) {
                if ($mode.is(":visible")) {
                    $mode.hide("slow");
                    $container = $(self.make_id(self.tag + ".container"));
                    $container.addClass("text-center").removeClass("text-right");
                }
            } else {
                $mode.text(mode + " Mode");
                if ($mode.is(":hidden")) {
                    $mode.show("slow");
                    $container = $(self.make_id(self.tag + ".container"));
                    $container.removeClass("text-center").addClass("text-right");
                }
            }
            self.version = version;
            self.mode = mode;
            self.latest = latest;
            self.flag = flag;
            return true;
        };
        if (!Version.prototype.update.__defaults__) Object.defineProperties(Version.prototype.update, {
            __defaults__ : {value: {mode:"", latest:null, flag:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["version", "mode", "latest", "flag"]}
        });
        Version.prototype.__repr__ = function __repr__ () {
            if(ControlBase.prototype.__repr__) return ControlBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Version.prototype.__str__ = function __str__ () {
            if(ControlBase.prototype.__str__) return ControlBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Version.prototype, "__bases__", {value: [ControlBase]});

        ρσ_modules["controls.version"].Version = Version;
    })();

    (function(){
        var __name__ = "utils.variables";
        function TimestampedVariable() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            TimestampedVariable.prototype.__init__.apply(this, arguments);
        }
        Object.defineProperties(TimestampedVariable.prototype,  {
            "value": {
                "enumerable": true, 
                "get": function value() {
                    var self = this;
                    return self.v;
                }, 
                "set": function value(value) {
                    var self = this;
                    if (!(ρσ_equals($.type(value), self.type))) throw new AssertionError;

                    self.v = value;
                    self.modified = (new Date).getTime();
                }
            }, 
        });
        TimestampedVariable.prototype.__init__ = function __init__() {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0);
            if (arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) args.pop();
            if (!(ρσ_equals(len(args), 1))) throw new AssertionError;

            self.v = args[0];
            self.type = $.type(self.v);
            self.modified = (new Date).getTime();
        };
        if (!TimestampedVariable.prototype.__init__.__handles_kwarg_interpolation__) Object.defineProperties(TimestampedVariable.prototype.__init__, {
            __handles_kwarg_interpolation__ : {value: true}
        });
        TimestampedVariable.__argnames__ = TimestampedVariable.prototype.__init__.__argnames__;
        TimestampedVariable.__handles_kwarg_interpolation__ = TimestampedVariable.prototype.__init__.__handles_kwarg_interpolation__;
        TimestampedVariable.prototype.if_modified_since = function if_modified_since(timestamp) {
            var self = this;
            if (self.modified > timestamp) {
                return self.v;
            } else {
                return null;
            }
        };
        if (!TimestampedVariable.prototype.if_modified_since.__argnames__) Object.defineProperties(TimestampedVariable.prototype.if_modified_since, {
            __argnames__ : {value: ["timestamp"]}
        });
        TimestampedVariable.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        TimestampedVariable.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(TimestampedVariable.prototype, "__bases__", {value: []});
        
        

        ρσ_modules["utils.variables"].TimestampedVariable = TimestampedVariable;
    })();

    (function(){
        var __name__ = "dialogs.properties";
        var DialogBase = ρσ_modules["dialogs.base"].Base;

        function Properties() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Properties.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Properties, DialogBase);
        Properties.prototype.__init__ = function __init__() {
            var self = this;
            var session_id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var base_path = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.base_path : arguments[1];
            var config = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.config : arguments[2];
            var title = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.title : arguments[3];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "base_path")){
                base_path = ρσ_kwargs_obj.base_path;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "config")){
                config = ρσ_kwargs_obj.config;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "title")){
                title = ρσ_kwargs_obj.title;
            }
            DialogBase.prototype.__init__.call(self);
            self.session_id = session_id;
            self.base_path = base_path;
            self.title = title;
            if (config === null) {
                self.config = ρσ_list_decorate([]);
                self.remove_button = false;
            } else {
                self.config = config;
                self.remove_button = true;
            }
            self.password_modified = false;
            self.cookie_modified = false;
        };
        if (!Properties.prototype.__init__.__defaults__) Object.defineProperties(Properties.prototype.__init__, {
            __defaults__ : {value: {base_path:"", config:null, title:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["session_id", "base_path", "config", "title"]}
        });
        Properties.__argnames__ = Properties.prototype.__init__.__argnames__;
        Properties.__handles_kwarg_interpolation__ = Properties.prototype.__init__.__handles_kwarg_interpolation__;
        Properties.prototype.create = function create() {
            var self = this;
            var html, trunc_cookie, btn_remove, title;
            html = "\n            <div class=\"modal fade tobcc-font\" id=\"node_property_modal\" tabindex=\"-1\" role=\"dialog\"\n                aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog modal-lg\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 class=\"modal-title cc-dialog-title\">Properties of the Node{title}</h5>\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class='row'>\n                                <label for=\"Label\" class=\"col-sm-2 col-form-label\">Label</label>\n                                <div class='col-sm-10' id='Label'>\n                                    <div class='input-group '>                    \n                                        <input id=\"iLabel\" class=\"form-control\"\n                                            aria-describedby=\"labelHelp\"\n                                            value='$nickname$'>\n                                        <div class=\"input-group-append\">\n                                            <button class=\"btn btn-outline-secondary dropdown-toggle\" type=\"button\"\n                                                data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                                                Add Makro\n                                            </button>\n                                            <div class=\"dropdown-menu\">\n                                                <button class=\"dropdown-item label-makro\" type=\"button\"\n                                                    data-makro=\"$nickname$\">\n                                                    Nickname\n                                                </button>\n                                            </div>\n                                        </div>\n                                    </div>\n                                    <small id=\"labelHelp\" class=\"form-text text-muted\">\n                                        The label of this Tor node for display in the ControlCenter. You can use \n                                        <code>$nickname$</code> as makro value to be automatically filled in.\n                                    </small>\n                                </div>\n                            </div>\n                            <hr>\n                            <div class=\"row\">\n                                <label for=\"Connect\" class=\"col-md-2 col-form-label\">Connect to</label>\n                                <div class='col-md-10' id=\"Connect\">\n                                    <div class=\"row\">\n                                        <div class=\"col-4\">\n                                            <div class=\"list-group\" id=\"connect-tab\" role=\"tablist\">\n                                                <a class=\"list-group-item list-group-item-action list-group-item-light\n                                                    active text-truncate\" id=\"port\" data-toggle=\"list\"\n                                                    href=\"#list-port\" role=\"tab\" aria-controls=\"port\">\n                                                    ControlPort\n                                                </a>\n                                                <a class=\"list-group-item list-group-item-action list-group-item-light\n                                                    text-truncate\" id=\"socket\" data-toggle=\"list\"\n                                                    href=\"#list-socket\" role=\"tab\" aria-controls=\"socket\">\n                                                    ControlSocket\n                                                </a>\n                                                <a class=\"list-group-item list-group-item-action list-group-item-light\n                                                    text-truncate\" id=\"proxy\" data-toggle=\"list\"\n                                                    href=\"#list-proxy\" role=\"tab\" aria-controls=\"proxy\">\n                                                    Hidden Service\n                                                </a>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-8\">\n                                            <div class=\"tab-content\" id=\"nav-tabContent\">\n                                                <div class=\"tab-pane fade show active\" id=\"list-port\" role=\"tabpanel\"\n                                                    aria-labelledby=\"list-port-list\">\n                                                    <small>\n                                                        Choose this option to connect to the ControlPort of a Tor node.\n                                                        <i>Address</i> shall either be defined as IPv4 or by hostname\n                                                        (e.g. my.server.com), yet <b>no hidden service descriptor</b>\n                                                        and (currently) <b>no IPv6</b>.\n                                                        <br><i>Port</i> usually is 9051.\n                                                    </small>\n                                                </div>\n                                                <div class=\"tab-pane fade\" id=\"list-socket\" role=\"tabpanel\"\n                                                    aria-labelledby=\"list-socket-list\">\n                                                    <small>\n                                                        Choose this option to connect to the ControlSocket of a Tor\n                                                        node.\n                                                    </small>\n                                                </div>\n                                                <div class=\"tab-pane fade\" id=\"list-proxy\" role=\"tabpanel\"\n                                                    aria-labelledby=\"list-propxy-list\">\n                                                    <small>\n                                                        Choose this option to connect to the ControlPort of a Tor node\n                                                        by proxying through the Tor network. <i>Address</i> shall be the \n                                                        hidden service descriptor providing access to the ControlPort of\n                                                        this Tor node (e.g. myhiddenservice.onion). Choose <i>Port</i>\n                                                        according to the hidden service setup.\n                                                        <br>You may define the <i>Cookie</i> below as well - \n                                                        to support Tor's \n                                                        <a href='{base_path}/{session_id}/manpage.html#HidServAuth'\n                                                            target='_blank'>HiddenServiceAuthorizeClient</a> option.\n                                                    </small>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                            <hr>\n                            <div class=\"row\">\n                                <label for=\"Address\" class=\"col-sm-2 col-form-label\">Host</label>\n                                <div class='col-sm-10' id=\"Address\">\n                                    <div class='input-group'>\n                                        <input type=\"text\" id=\"iAddress\" class=\"form-control\"\n                                            aria-label=\"Text input to define Address:Port of Node\"\n                                            placeholder='IPv4:Port or URL:Port or Socket e.g. /var/run/tor/control'>\n                                        <div class=\"input-group-append\">\n                                            <button class=\"btn btn-outline-secondary\"\n                                            type=\"button\" id=\"vAddress\" disabled>Verify</button>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                            <hr>\n                            <div class=\"row\">\n                                <label for=\"Password\" class=\"col-sm-2 col-form-label\">Password</label>\n                                <div class='col-sm-10' id='Password'>\n                                    <input type=\"password\" id=\"iPassword\" class=\"form-control\"\n                                        aria-label=\"Text input for password\"\n                                        aria-describedby=\"passwordHelp\"\n                                        placeholder='Password - but not the HashedControlPassword value!'>\n                                    <small id=\"passwordHelp\" class=\"form-text\">\n                                        If the access to the node is protected by a <a \n                                        href='{base_path}/{session_id}/manpage.html#HashedControlPassword' \n                                        target='_blank'>password</a>, you may provide it here. This <i>password</i> will be\n                                        used to establish the connection to the node - <b>without asking the user\n                                        to authenticate</b>.\n                                        <br>A password defined here will <i>not</i> be validated as part of the host\n                                        connection verification process.\n                                    </small>\n                                </div>\n                            </div>\n                            <hr>\n                            <div class=\"row\">\n                                <label for=\"Cookie\" class=\"col-sm-2 col-form-label\">Cookie</label>\n                                <div class='col-sm-10' id=\"Cookie\">\n                                    <input type=\"text\" class=\"form-control\" id=\"iCookie\"\n                                        aria-label=\"Text input for cookie\".\n                                        aria-describedby=\"connectionCookieHelp\"\n                                        placeholder='Hidden Service Authorization Cookie - as created by Tor.'>\n                                    <small id=\"connectionCookieHelp\" class=\"form-text\">\n                                        Hidden Services can be setup to allow access only for clients <a\n                                        href='{base_path}/{session_id}/manpage.html#HidServAuth' target='_blank'>\n                                        providing a valid authorization cookie</a>. To access the ControlPort of a Tor \n                                        node guarded by this method, you need to provide this cookie value here.\n                                        <br>If a cookie is defined here, it will be validated as part of the host\n                                        connection verification process - if connecting to a Hidden Service.\n                                        {trunc_cookie}\n                                    </small>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            {btn_remove}\n                            <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\n                            <button type=\"button\" id=\"bSave\" class=\"btn btn-primary\">Save changes</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
            trunc_cookie = "";
            if (ρσ_exists.n(self.cookie) && ρσ_equals(self.cookie.slice(-3), "...")) {
                trunc_cookie = "<br><b>Please be aware, that the value displayed here was truncated for safety reasons.</b>";
            }
            btn_remove = "";
            if (self.remove_button === true) {
                btn_remove = "<button type=\"button\" id=\"bDelete\" class=\"btn btn-outline-dark mr-auto\"><i class=\"fas fa-trash-alt\"></i> Remove Node</button>";
            }
            title = "";
            if (self.title !== null) {
                title = ": " + self.title;
            }
            html = ρσ_interpolate_kwargs.call(str, str.format, [html].concat([ρσ_desugar_kwargs({base_path: self.base_path, session_id: self.session_id, trunc_cookie: trunc_cookie, btn_remove: btn_remove, title: title})]));
            DialogBase.prototype.create.call(self, html);
        };
        Properties.prototype.host = function host() {
            var self = this;
            var address, match;
            address = $("#iAddress").val();
            match = address.match(/(.*)(?::)(?:[0-9]+)$/);
            if (match === null) {
                return "";
            }
            return (len(match) > 1) ? match[1] : "";
        };
        Properties.prototype.port = function port() {
            var self = this;
            var address, match;
            address = $("#iAddress").val();
            match = address.match(/(?:.*)(?::)([0-9]+)$/);
            if (match === null) {
                return "";
            }
            return (len(match) > 1) ? match[1] : "";
        };
        Properties.prototype.connect = function connect() {
            var self = this;
            var $selected;
            $selected = $("div#connect-tab a.active");
            return $selected.attr("id");
        };
        Properties.prototype.confirm_delete = function confirm_delete() {
            var self = this;
            $("#bDelete").removeClass("btn-outline-dark").addClass("btn-danger").html("<i class=\"fas fa-cog fa-spin\"></i> Confirm: Remove Node").off().on("click", (function() {
                var ρσ_anonfunc = function (e) {
                    $("#bDelete").prop("disabled", true).html("<i class=\"fas fa-spinner fa-spin\"></i> Confirm: Remove Node");
                    $.post((function(){
                        var ρσ_d = {};
                        ρσ_d["url"] = self.base_path + "/" + self.session_id + "/cc/" + "remove";
                        ρσ_d["timeout"] = 5e3;
                        return ρσ_d;
                    }).call(this)).done((function() {
                        var ρσ_anonfunc = function (data) {
                            self.modal.modal("hide");
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })()).fail((function() {
                        var ρσ_anonfunc = function (data) {
                            $("#bDelete").removeClass("btn-danger").addClass("btn-outline-dark").html("<i class=\"far fa-question-circle\"></i> Remove Node").prop("disabled", false).off().on("click", function () {
                                self.confirm_delete();
                            });
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })());
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
        };
        Properties.prototype.show = function show() {
            var self = this;
            var p, connect_to, connect, c;
            if (self.modal === null) {
                self.create();
            }
            p = DialogBase.prototype.show.call(self);
            connect_to = ρσ_list_decorate([ "port", "socket", "proxy" ]);
            connect = self.config.connect || "port";
            var ρσ_Iter0 = ρσ_Iterable(connect_to);
            for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                c = ρσ_Iter0[ρσ_Index0];
                if ((c === connect || typeof c === "object" && ρσ_equals(c, connect))) {
                    $("#" + c).addClass("active");
                } else {
                    $("#" + c).removeClass("active");
                }
            }
            if (ρσ_exists.n(self.config.label)) {
                $("#iLabel").val(self.config.label);
            }
            $(".label-makro").click((function() {
                var ρσ_anonfunc = function (e) {
                    var makro, label, txt, caretPos, caretEnd;
                    makro = $(this).data("makro");
                    console.log(makro);
                    label = $("#iLabel");
                    txt = label.val();
                    caretPos = ρσ_exists.e(label.prop("selectionStart"), len(txt));
                    caretEnd = ρσ_exists.e(label.prop("selectionEnd"), len(txt));
                    label.val(txt.substring(0, caretPos) + makro + txt.substring(caretEnd));
                    label.focus();
                    label.selectionStart = caretPos + len(makro);
                    label.selectionEnd = caretPos + len(makro);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            $("div#connect-tab a").on("show.bs.tab", (function() {
                var ρσ_anonfunc = function (e) {
                    $("#vAddress").removeClass().addClass("btn btn-outline-secondary");
                    $("#vAddress").prop("disabled", ρσ_equals(len($("#iAddress").val()), 0));
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            $("#iAddress").val(self.config.address || null);
            $("#iAddress").on("input", (function() {
                var ρσ_anonfunc = function (e) {
                    $("#vAddress").removeClass().addClass("btn btn-outline-secondary");
                    $("#vAddress").prop("disabled", ρσ_equals(len($("#iAddress").val()), 0));
                    $("#iPassword").val("");
                    self.password_modified = true;
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            $("#vAddress").prop("disabled", ρσ_equals(len($("#iAddress").val()), 0));
            $("#vAddress").on("click", (function() {
                var ρσ_anonfunc = function (e) {
                    var connect, query;
                    $("#vAddress").prop("disabled", true);
                    connect = self.connect();
                    query = (function(){
                        var ρσ_d = {};
                        ρσ_d["connect"] = connect;
                        ρσ_d["host"] = ((connect === "socket" || typeof connect === "object" && ρσ_equals(connect, "socket"))) ? $("#iAddress").val() : self.host();
                        ρσ_d["port"] = ((connect === "socket" || typeof connect === "object" && ρσ_equals(connect, "socket"))) ? "" : self.port();
                        ρσ_d["cookie"] = (self.cookie_modified === false) ? self.config.unmod : $("#iCookie").val();
                        return ρσ_d;
                    }).call(this);
                    $.post(self.base_path + "/" + self.session_id + "/cc/" + "check", query).done((function() {
                        var ρσ_anonfunc = function (data) {
                            if ((data === "250 OK" || typeof data === "object" && ρσ_equals(data, "250 OK"))) {
                                $("#vAddress").removeClass().addClass("btn btn-success");
                            } else {
                                $("#vAddress").removeClass().addClass("btn btn-danger");
                            }
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })()).fail((function() {
                        var ρσ_anonfunc = function (data) {
                            $("#vAddress").removeClass().addClass("btn btn-danger");
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })()).always((function() {
                        var ρσ_anonfunc = function (data) {
                            $("#vAddress").prop("disabled", ρσ_equals(len($("#iAddress").val()), 0));
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })());
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            if (ρσ_exists.n(self.config.pwd)) {
                $("#iPassword").val("******");
            }
            $("#iPassword").on("keydown", (function() {
                var ρσ_anonfunc = function (e) {
                    if (self.password_modified === false) {
                        self.password_modified = true;
                        $("#iPassword").val("");
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            $("#iCookie").val(self.config.cookie || null);
            $("#iCookie").on("keydown", (function() {
                var ρσ_anonfunc = function (e) {
                    if (self.cookie_modified === false) {
                        self.cookie_modified = true;
                        $("#iCookie").val("");
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            $("#iCookie").on("input", (function() {
                var ρσ_anonfunc = function (e) {
                    $("#vAddress").removeClass().addClass("btn btn-outline-secondary");
                    $("#vAddress").prop("disabled", ρσ_equals(len($("#iAddress").val()), 0));
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            $("#bDelete").on("click", function () {
                self.confirm_delete();
            });
            $("#bSave").on("click", (function() {
                var ρσ_anonfunc = function (e) {
                    var connect, query;
                    $("#bSave").prop("disabled", true);
                    connect = self.connect();
                    query = (function(){
                        var ρσ_d = {};
                        ρσ_d["label"] = $("#iLabel").val();
                        ρσ_d["connect"] = connect;
                        ρσ_d["host"] = ((connect === "socket" || typeof connect === "object" && ρσ_equals(connect, "socket"))) ? $("#iAddress").val() : self.host();
                        ρσ_d["port"] = ((connect === "socket" || typeof connect === "object" && ρσ_equals(connect, "socket"))) ? "" : self.port();
                        ρσ_d["password"] = (self.password_modified === false) ? self.config.unmod : $("#iPassword").val();
                        ρσ_d["cookie"] = (self.cookie_modified === false) ? self.config.unmod : $("#iCookie").val();
                        return ρσ_d;
                    }).call(this);
                    $.post(self.base_path + "/" + self.session_id + "/cc/" + "save", query).done((function() {
                        var ρσ_anonfunc = function (data) {
                            self.modal.modal("hide");
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })()).fail((function() {
                        var ρσ_anonfunc = function (data) {
                            $("#bSave").removeClass().addClass("btn btn-danger");
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })()).always((function() {
                        var ρσ_anonfunc = function (data) {
                            $("#bSave").prop("disabled", false);
                        };
                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                            __argnames__ : {value: ["data"]}
                        });
                        return ρσ_anonfunc;
                    })());
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["e"]}
                });
                return ρσ_anonfunc;
            })());
            return p;
        };
        Properties.prototype.__repr__ = function __repr__ () {
            if(DialogBase.prototype.__repr__) return DialogBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Properties.prototype.__str__ = function __str__ () {
            if(DialogBase.prototype.__str__) return DialogBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Properties.prototype, "__bases__", {value: [DialogBase]});

        ρσ_modules["dialogs.properties"].Properties = Properties;
    })();

    (function(){
        var __name__ = "cards.node";
        var format_bytes = ρσ_modules["utils.format_bytes"].format_bytes;

        var MakeID = ρσ_modules["utils.make_id"].make_id;

        var Smoothie = ρσ_modules["controls.smoothie"].Smoothie;
        var TimeSeries = ρσ_modules["controls.smoothie"].TimeSeries;

        var MessageDialog = ρσ_modules["dialogs.base"].Message;

        var Login = ρσ_modules["dialogs.login"].Login;

        var Flags = ρσ_modules["controls.flags"].Flags;

        var Connection = ρσ_modules["controls.connection"].Connection;

        var VersionCheck = ρσ_modules["controls.version_check"].VersionCheck;

        var Version = ρσ_modules["controls.version"].Version;

        var TimestampedVariable = ρσ_modules["utils.variables"].TimestampedVariable;

        function Node() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Node.prototype.__init__.apply(this, arguments);
        }
        Node.prototype.__init__ = function __init__() {
            var self = this;
            var id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var base_path = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.base_path : arguments[1];
            var position = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.position : arguments[2];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "base_path")){
                base_path = ρσ_kwargs_obj.base_path;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "position")){
                position = ρσ_kwargs_obj.position;
            }
            self.id = id;
            self.base_path = base_path;
            self.update_timer = null;
            self.updating = null;
            self.update_timestamp = null;
            self.chart_options = (function(){
                var ρσ_d = {};
                ρσ_d["millisPerPixel"] = 500;
                ρσ_d["maxValueScale"] = 1.1;
                ρσ_d["minValueScale"] = 1.1;
                ρσ_d["maxDataSetLength"] = Math.max(screen.width, screen.height);
                ρσ_d["interpolation"] = "step";
                ρσ_d["enableDpiScaling"] = true;
                ρσ_d["timeLabelLeftAlign"] = true;
                ρσ_d["timeLabelSeparation"] = 2;
                ρσ_d["grid"] = (function(){
                    var ρσ_d = {};
                    ρσ_d["millisPerLine"] = 6e4;
                    ρσ_d["timeDividers"] = "";
                    ρσ_d["fillStyle"] = "#E6E6E6";
                    ρσ_d["strokeStyle"] = "#777777";
                    ρσ_d["verticalSections"] = 1;
                    ρσ_d["borderVisible"] = false;
                    return ρσ_d;
                }).call(this);
                ρσ_d["labels"] = (function(){
                    var ρσ_d = {};
                    ρσ_d["fontFamily"] = "LatoLatinWebLight";
                    ρσ_d["fillStyle"] = "#000000";
                    ρσ_d["disabled"] = false;
                    ρσ_d["fontSize"] = 10;
                    ρσ_d["precision"] = 2;
                    return ρσ_d;
                }).call(this);
                ρσ_d["timestampFormatter"] = (function() {
                    var ρσ_anonfunc = function (date) {
                        function pad2(number) {
                            return (number < 10) ? "0" + number : number;
                        };
                        if (!pad2.__argnames__) Object.defineProperties(pad2, {
                            __argnames__ : {value: ["number"]}
                        });

                        return pad2(date.getHours()) + ":" + pad2(date.getMinutes());
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["date"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["yMaxFormatter"] = (function() {
                    var ρσ_anonfunc = function () {
                        var data = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                        var precision = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.precision : arguments[1];
                        var ρσ_kwargs_obj = arguments[arguments.length-1];
                        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "precision")){
                            precision = ρσ_kwargs_obj.precision;
                        }
                        return format_bytes(data) + "/s";
                    };
                    if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
                        __defaults__ : {value: {precision:2}},
                        __handles_kwarg_interpolation__ : {value: true},
                        __argnames__ : {value: ["data", "precision"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["yMinFormatter"] = (function() {
                    var ρσ_anonfunc = function () {
                        var data = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                        var precision = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.precision : arguments[1];
                        var ρσ_kwargs_obj = arguments[arguments.length-1];
                        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "precision")){
                            precision = ρσ_kwargs_obj.precision;
                        }
                        return format_bytes(Math.abs(data)) + "/s";
                    };
                    if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
                        __defaults__ : {value: {precision:2}},
                        __handles_kwarg_interpolation__ : {value: true},
                        __argnames__ : {value: ["data", "precision"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["limitFPS"] = 10;
                return ρσ_d;
            }).call(this);
            self.chart = null;
            self.read_data = null;
            self.written_data = null;
            self.chart_monitor = null;
            self.clone = null;
            self.card_index = new TimestampedVariable(position);
        };
        if (!Node.prototype.__init__.__defaults__) Object.defineProperties(Node.prototype.__init__, {
            __defaults__ : {value: {base_path:"", position:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["id", "base_path", "position"]}
        });
        Node.__argnames__ = Node.prototype.__init__.__argnames__;
        Node.__handles_kwarg_interpolation__ = Node.prototype.__init__.__handles_kwarg_interpolation__;
        Node.prototype.make_id = function make_id() {
            var self = this;
            var tag = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? make_id.__defaults__.tag : arguments[0];
            var jquery = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? make_id.__defaults__.jquery : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "tag")){
                tag = ρσ_kwargs_obj.tag;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "jquery")){
                jquery = ρσ_kwargs_obj.jquery;
            }
            return MakeID(self.id, tag, jquery);
        };
        if (!Node.prototype.make_id.__defaults__) Object.defineProperties(Node.prototype.make_id, {
            __defaults__ : {value: {tag:null, jquery:true}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["tag", "jquery"]}
        });
        Node.prototype.attach = function attach() {
            var self = this;
            var parent_element = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var after_element = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? attach.__defaults__.after_element : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "after_element")){
                after_element = ρσ_kwargs_obj.after_element;
            }
            var card_spinner, canvas_html, xxx, card_html, card;
            self.parent = parent_element;
            self.after = after_element;
            card_spinner = "\n            <div style=\"min-height: 100px;\n                        width: 100%;\n                        position: absolute;\n                        display: flex;\n                        justify-content: center;\n                        align-items: center; \"\n                 id=\"tobcc.{id}.spinner\">\n                <div class=\"sk-three-bounce text-muted\" style=\"text-align: center\">\n                    <div class=\"spnnr sk-child sk-bounce1 bg-secondary\"></div>\n                    <div class=\"spnnr sk-child sk-bounce2 bg-secondary\"></div>\n                    <div class=\"spnnr sk-child sk-bounce3 bg-secondary\"></div>\n                </div>\n            </div>\n        ";
            canvas_html = "\n            <div class=\"card-img-top\">\n                <canvas class=\"bw_chart\"\n                    id=\"card_canvas\"\n                    height=\"100\" width=\"100%\"\n                    style=\"vertical-align: middle\">\n                </canvas>\n            </div>\n        ";
            xxx = "\n            <span class=\"fa-stack fa-2x my-auto\" style=\"color: darkgrey;\">\n                <i class=\"far fa-circle fa-stack-2x\"></i>\n                <i class=\"fas fa-play fa-stack-1x\"></i>\n            </span>\n        ";
            card_html = "\n            <div id=\"tobcc.{id}\" class='pep col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-4 tobcc-font'>\n                <div class='card droppable box-shadow' style=\"box-shadow: ''; transition=\"box-shadow 1s\" id=\"tobcc.{id}.card\">                \n                    <div class=\"card-header tobcc-header d-flex\">\n                        <span class=\"h5 flex-grow-1 text-truncate\" id=\"tobcc.{id}.label\">                        \n                            {label}\n                        </span>\n                        <span class=\"\" id=\"tobcc.{id}.connection\" style=\"color: lightgrey; white-space:nowrap;font-size=14px;\"></span>\n                    </div>\n                    <div class=\"card-img-top\" id=\"tobcc.{id}.top\">\n                        <div class=\"justify-content-center\"\n                             style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                            <a href=\"#\" class=\"my-auto\">\n                                <i class=\"fas fa-circle-notch fa-spin fa-4x\" style=\"color: darkgrey;\"></i>\n                            </a>\n                        </div>\n                    </div>\n                    <div class=\"card-body tobcc.body\">\n                        <div class=\"row\" id=\"tobcc.{id}.version\"></div>\n                        <div class=\"row\" id=\"tobcc.{id}.updown\" style=\"display:none\"></div>\n                    </div>\n                    \n                    <ul class=\"list-group list-group-flush\" id=\"tobcc.{id}.flags-c\" style=\"display:none; color:grey\">\n                        <li class=\"list-group-item card-text text-center\" id=\"tobcc.{id}.flags\"></li>\n                    </ul>\n\n                    <div class=\"card-footer\" id=\"tobcc.{id}.footer\">\n                        <div class=\"row text-center\">\n                            <div class=\"col\" style=\"display:none\" id=\"tobcc.{id}.edit\">\n                                <a href=\"#\" class=\"card-link pep-click disabled\">\n                                    Edit Node\n                                </a>\n                            </div>\n                            <div class=\"col\" style=\"display:none\" id=\"tobcc.{id}.details\">\n                                <a href=\"{base_path}/{id}/cc/details\" target=\"{id}\"\n                                    class=\"card-link pep-click disabled\">\n                                    Show Details\n                                </a>\n                            </div>\n                            <div class=\"col\" style=\"display:none\" id=\"tobcc.{id}.retry\">\n                                <a href=\"#\" class=\"card-link pep-click\">\n                                    Retry\n                                </a>\n                                <span class=\"\" style=\"color:grey\" style=\"display:none\">\n                                    Retry\n                                </span>\n                            </div>\n                            <div class=\"col\" style=\"display:none\" id=\"tobcc.{id}.login\">\n                                <a href=\"#\" class=\"card-link pep-click disabled\">\n                                    Authenticate\n                                </a>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
            card = ρσ_interpolate_kwargs.call(str, str.format, [card_html].concat([ρσ_desugar_kwargs({id: self.id, base_path: self.base_path, label: self.label || "Connecting...", version: self.version || ""})]));
            self.card = $(card);
            self.position(self.card);
            $(self.make_id("retry")).on("click", function () {
                self.retry();
                return false;
            });
            $(self.make_id("login")).on("click", function () {
                self.perform_login(self.label);
                return false;
            });
            $(self.make_id("edit")).on("click", function () {
                self.edit_node();
                return false;
            });
            ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({retry: false})]);
            self.flags = new Flags(self.id, "flags");
            self.connection = new Connection(self.id, "connection");
            self.version_check = new VersionCheck(self.id, "version.check");
            self.tor_version = new Version(self.id, "version");
            self.init_pep();
            setTimeout(function () {
                self.update();
            }, Math.random() * 1e3);
        };
        if (!Node.prototype.attach.__defaults__) Object.defineProperties(Node.prototype.attach, {
            __defaults__ : {value: {after_element:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["parent_element", "after_element"]}
        });
        Node.prototype.set_links = function set_links() {
            var self = this;
            var edit = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? set_links.__defaults__.edit : arguments[0];
            var details = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? set_links.__defaults__.details : arguments[1];
            var retry = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? set_links.__defaults__.retry : arguments[2];
            var login = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? set_links.__defaults__.login : arguments[3];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "edit")){
                edit = ρσ_kwargs_obj.edit;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "details")){
                details = ρσ_kwargs_obj.details;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "retry")){
                retry = ρσ_kwargs_obj.retry;
            }
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "login")){
                login = ρσ_kwargs_obj.login;
            }
            function set_link() {
                var $control = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                var status = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? set_link.__defaults__.status : arguments[1];
                var ρσ_kwargs_obj = arguments[arguments.length-1];
                if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "status")){
                    status = ρσ_kwargs_obj.status;
                }
                var $a, $s;
                if (ρσ_in(status, ρσ_list_decorate([ true, false ]))) {
                    if ($control.is(":hidden")) {
                        $control.show();
                    }
                    $a = $control.find("a");
                    $s = $control.find("span");
                    if (status === true) {
                        $a.show();
                        $s.hide();
                    } else {
                        $a.hide();
                        $s.show();
                    }
                } else {
                    if ($control.is(":visible")) {
                        $control.hide();
                    }
                }
            };
            if (!set_link.__defaults__) Object.defineProperties(set_link, {
                __defaults__ : {value: {status:null}},
                __handles_kwarg_interpolation__ : {value: true},
                __argnames__ : {value: ["$control", "status"]}
            });

            set_link($(self.make_id("edit")), edit);
            set_link($(self.make_id("details")), details);
            set_link($(self.make_id("retry")), retry);
            set_link($(self.make_id("login")), login);
        };
        if (!Node.prototype.set_links.__defaults__) Object.defineProperties(Node.prototype.set_links, {
            __defaults__ : {value: {edit:true, details:null, retry:null, login:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["edit", "details", "retry", "login"]}
        });
        Node.prototype.detatch = function detatch() {
            var self = this;
            if (self.update_timer !== null) {
                clearTimeout(self.update_timer);
            }
            self.card.fadeOut("1500", function () {
                self.card.remove();
            });
        };
        Node.prototype.moveTo = function moveTo() {
            var self = this;
            var after_element = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? moveTo.__defaults__.after_element : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "after_element")){
                after_element = ρσ_kwargs_obj.after_element;
            }
            self.after = after_element;
            self.position(self.card);
        };
        if (!Node.prototype.moveTo.__defaults__) Object.defineProperties(Node.prototype.moveTo, {
            __defaults__ : {value: {after_element:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["after_element"]}
        });
        Node.prototype.perform_login = function perform_login(server) {
            var self = this;
            var Basic = ρσ_modules["utils.auth"].Basic;
            var Digest = ρσ_modules["utils.auth"].Digest;

            new Login(server, self.id).show().then((function() {
                var ρσ_anonfunc = function (data) {
                    var url, spinning;
                    if ((typeof data !== "undefined" && data !== null) && ρσ_exists.n(data.password) && data.password.length > 0) {
                        url = self.base_path + "/" + self.id + "/cc/" + "login";
                        if (self.update_timer !== null) {
                            clearTimeout(self.update_timer);
                        }
                        spinning = "\n                    <div class=\"justify-content-center\"\n                         style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                        <a href=\"#\" class=\"my-auto\">\n                            <i class=\"fas fa-circle-notch fa-spin fa-4x\" style=\"color: darkgrey;\"></i>\n                        </a>\n                    </div>\n                ";
                        $(self.make_id("top")).html(spinning);
                        $.post((function(){
                            var ρσ_d = {};
                            ρσ_d["url"] = url;
                            ρσ_d["timeout"] = 1e4;
                            return ρσ_d;
                        }).call(this)).fail((function() {
                            var ρσ_anonfunc = function (request, textStatus, errorThrown) {
                                var header, elements, auth;
                                if ((request.status === 401 || typeof request.status === "object" && ρσ_equals(request.status, 401))) {
                                    header = request.getResponseHeader("WWW-Authenticate");
                                    elements = header.split(",");
                                    if (elements.length > 1) {
                                        auth = new Digest(header, "POST", url);
                                    } else {
                                        auth = new Basic(header);
                                    }
                                    $.post((function(){
                                        var ρσ_d = {};
                                        ρσ_d["url"] = url;
                                        ρσ_d["timeout"] = 1e4;
                                        ρσ_d["headers"] = (function(){
                                            var ρσ_d = {};
                                            ρσ_d["Authorization"] = auth.create_auth_header(self.id, data.password);
                                            return ρσ_d;
                                        }).call(this);
                                        return ρσ_d;
                                    }).call(this)).done((function() {
                                        var ρσ_anonfunc = function (data, textStatus, response) {
                                            self.id = data;
                                            self.after = self.card.prev();
                                            self.card.remove();
                                            self.attach(self.parent, self.after);
                                        };
                                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                            __argnames__ : {value: ["data", "textStatus", "response"]}
                                        });
                                        return ρσ_anonfunc;
                                    })()).fail((function() {
                                        var ρσ_anonfunc = function (request, textStatus, errorThrown) {
                                        };
                                        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                            __argnames__ : {value: ["request", "textStatus", "errorThrown"]}
                                        });
                                        return ρσ_anonfunc;
                                    })()).always(function () {
                                        self.update();
                                    });
                                } else {
                                    self.update();
                                }
                            };
                            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                __argnames__ : {value: ["request", "textStatus", "errorThrown"]}
                            });
                            return ρσ_anonfunc;
                        })()).done(function () {
                            self.update();
                        });
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data"]}
                });
                return ρσ_anonfunc;
            })());
        };
        if (!Node.prototype.perform_login.__argnames__) Object.defineProperties(Node.prototype.perform_login, {
            __argnames__ : {value: ["server"]}
        });
        Node.prototype.edit_node = function edit_node() {
            var self = this;
            var url;
            url = self.base_path + "/" + self.id + "/cc/" + "edit";
            $.post((function(){
                var ρσ_d = {};
                ρσ_d["url"] = url;
                ρσ_d["timeout"] = 1e4;
                return ρσ_d;
            }).call(this)).done((function() {
                var ρσ_anonfunc = function (data, textStatus, response) {
                    data = JSON.parse(data);
                    var NodeProperties = ρσ_modules["dialogs.properties"].Properties;

                    new NodeProperties(self.id, self.base_path, data["config"]).show();
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data", "textStatus", "response"]}
                });
                return ρσ_anonfunc;
            })());
        };
        Node.prototype.retry = function retry() {
            var self = this;
            var retry;
            retry = "\n                <div class=\"justify-content-center\" style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                    <i class=\"fas fa-circle-notch fa-spin fa-4x my-auto\" style=\"color: darkgrey;\"></i>\n                </div>\n            ";
            $(self.make_id("top")).html(retry);
            ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({retry: false})]);
            self.update();
        };
        Node.prototype.update = function update() {
            var self = this;
            var data, position, post_params;
            if (self.currently_updating === true) {
                return;
            }
            self.currently_updating = true;
            data = {};
            if (self.update_timestamp) {
                position = self.card_index.if_modified_since(self.update_timestamp);
                if (position !== null) {
                    data["position"] = position;
                }
            }
            post_params = (function(){
                var ρσ_d = {};
                ρσ_d["url"] = self.base_path + "/" + self.id + "/cc/" + "data";
                ρσ_d["headers"] = (function(){
                    var ρσ_d = {};
                    ρσ_d["if-modified-since"] = self.ims;
                    ρσ_d["timeout"] = 2e3;
                    return ρσ_d;
                }).call(this);
                return ρσ_d;
            }).call(this);
            if (len(data) > 0) {
                post_params["data"] = data;
            }
            self.update_timestamp = (new Date).getTime();
            $.post(post_params).done((function() {
                var ρσ_anonfunc = function (data, textStatus, response) {
                    var status202, top, c, canv, show_edit, d, $container, show, $card, $s, label, details, $details, rep, ts, datapoint, dp, has_html, up_down, style, key;
                    status202 = "\n                <div class=\"justify-content-center\" style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                    <a href=\"#\" class=\"my-auto\">\n                        <i class=\"far fa-play-circle fa-4x\" style=\"color: darkgrey;\"></i>\n                    </a>\n                </div>\n            ";
                    if ((response.status === 202 || typeof response.status === "object" && ρσ_equals(response.status, 202))) {
                        top = $(self.make_id("top")).html(status202);
                        ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({retry: false})]);
                    } else if ((response.status === 200 || typeof response.status === "object" && ρσ_equals(response.status, 200))) {
                        c = self.make_id("chart");
                        if (!$(c).length) {
                            canv = "\n                        <canvas class=\"bw_chart\"\n                            id=\"{id}\"\n                            height=\"100\" width=\"100%\"\n                            style=\"vertical-align: middle\">\n                        </canvas>\n                    ";
                            $(self.make_id("top")).html(ρσ_interpolate_kwargs.call(str, str.format, [canv].concat([ρσ_desugar_kwargs({id: ρσ_interpolate_kwargs.call(self, self.make_id, ["chart"].concat([ρσ_desugar_kwargs({jquery: false})]))})])));
                            self.chart = new Smoothie(self.chart_options);
                            self.read_data = new TimeSeries;
                            self.written_data = new TimeSeries;
                            self.chart.addTimeSeries(self.read_data, (function(){
                                var ρσ_d = {};
                                ρσ_d["lineWidth"] = 1;
                                ρσ_d["strokeStyle"] = "rgb(132, 54, 187)";
                                ρσ_d["fillStyle"] = "rgba(132, 54, 187, 0.30)";
                                return ρσ_d;
                            }).call(this));
                            self.chart.addTimeSeries(self.written_data, (function(){
                                var ρσ_d = {};
                                ρσ_d["lineWidth"] = 1;
                                ρσ_d["strokeStyle"] = "#64B22B";
                                ρσ_d["fillStyle"] = "rgba(100, 178, 43, 0.30)";
                                return ρσ_d;
                            }).call(this));
                            self.chart.streamTo($(c)[0], 5e3);
                            if ((typeof scrollMonitor !== "undefined" && scrollMonitor !== null)) {
                                self.chart_monitor = scrollMonitor.create($(c)[0], 100);
                                self.chart_monitor.enterViewport(function () {
                                    self.chart.start();
                                });
                                self.chart_monitor.exitViewport(function () {
                                    self.chart.stop();
                                });
                            } else {
                                self.chart.start();
                            }
                        }
                        self.ims = response.getResponseHeader("Last-Modified");
                        show_edit = true;
                        d = JSON.parse(data);
                        var ρσ_Iter0 = ρσ_Iterable(d);
                        for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                            key = ρσ_Iter0[ρσ_Index0];
                            if (ρσ_in(key, ρσ_list_decorate([ "version", "latest", "versionflag", "mode" ]))) {
                                self[(typeof key === "number" && key < 0) ? self.length + key : key] = d[(typeof key === "number" && key < 0) ? d.length + key : key];
                            } else if ((key === "flags" || typeof key === "object" && ρσ_equals(key, "flags"))) {
                                $container = $(self.make_id("flags-c"));
                                self.flags.update(d["flags"], self.mode);
                                show = d["flags"].length > 0;
                                if (show === false && $container.is(":visible")) {
                                    $container.hide("slow");
                                } else if (show === true && $container.is(":hidden")) {
                                    $container.show("slow");
                                }
                            } else if ((key === "conn" || typeof key === "object" && ρσ_equals(key, "conn"))) {
                                self.connection.update(d["conn"]);
                                if (ρσ_in("h", d["conn"])) {
                                    $card = $(self.make_id("card"));
                                    if ($card.hasClass("droppable")) {
                                        $card.addClass("border-primary").removeClass("droppable");
                                    }
                                    $s = $(self.make_id());
                                    if ($s.hasClass("pep")) {
                                        $s.removeClass("pep");
                                        $.pep.unbind($s);
                                    }
                                    show_edit = null;
                                }
                            } else if ((key === "label" || typeof key === "object" && ρσ_equals(key, "label"))) {
                                label = $(self.make_id("label"));
                                label.text(d["label"]);
                                self.label = d["label"];
                            } else if ((key === "details" || typeof key === "object" && ρσ_equals(key, "details"))) {
                                details = d["details"];
                                $details = $(self.make_id("details"));
                                if ((details === true || typeof details === "object" && ρσ_equals(details, true))) {
                                    if ($details.is(":hidden")) {
                                        $details.show("slow");
                                    }
                                } else {
                                    $details.hide("slow");
                                }
                            } else if ((key === "bw" || typeof key === "object" && ρσ_equals(key, "bw"))) {
                                if (ρσ_in("representing", d)) {
                                    rep = d["representing"];
                                    $(document).trigger("tobcc.bandwidth", ρσ_list_decorate([ self.id, rep, d["bw"] ]));
                                }
                                var ρσ_Iter1 = ρσ_Iterable(d["bw"]);
                                for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                                    datapoint = ρσ_Iter1[ρσ_Index1];
                                    ts = datapoint.s;
                                    self.read_data.append(ts, datapoint.r);
                                    self.written_data.append(ts, datapoint.w);
                                }
                                ts += 1e3;
                                self.read_data.append(ts, 0);
                                self.written_data.append(ts, 0);
                                dp = d["bw"][0];
                                has_html = $(self.make_id("updown")).html().length > 0;
                                up_down = "\n                            <div class=\"col text-right\">{down} <i class='fas fa-cloud-download-alt' style='color:rgb(132, 54, 187)'></i></div>\n                            <div class=\"col text-left\"><i class='fas fa-cloud-upload-alt' style='color: #64B22B'></i> {up}</div>\n                        ";
                                up_down = ρσ_interpolate_kwargs.call(str, str.format, [up_down].concat([ρσ_desugar_kwargs({down: format_bytes(dp.tr, "", "si"), up: format_bytes(dp.tw, "", "si")})]));
                                $(self.make_id("updown")).html(up_down);
                                if ((has_html === false || typeof has_html === "object" && ρσ_equals(has_html, false))) {
                                    $(self.make_id("updown")).slideDown("slow");
                                }
                            } else if ((key === "style" || typeof key === "object" && ρσ_equals(key, "style"))) {
                                style = d["style"];
                                if ((style === "readonly" || typeof style === "object" && ρσ_equals(style, "readonly"))) {
                                    $(self.make_id()).addClass("border-secondary");
                                }
                            }
                        }
                        self.tor_version.update(self.version, self.mode, self.latest, self.versionflag);
                        ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({edit: show_edit, details: true})]);
                        $(self.make_id("spinner")).hide();
                    }
                    self.update_timer = setTimeout(function () {
                        self.update();
                    }, 5e3);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data", "textStatus", "response"]}
                });
                return ρσ_anonfunc;
            })()).fail((function() {
                var ρσ_anonfunc = function (request, textStatus, errorThrown) {
                    var status_rs0, top, noconn, status404, exclam, status401, origin, split, label, header, lock;
                    status_rs0 = "\n                <div class=\"justify-content-center\" style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                    <span class=\"fa-stack fa-2x my-auto pep-click\" style=\"color: darkgrey;\" id=\"tobcc.{id}.noconn\">\n                        <i class=\"fas fa-wifi fa-stack-1x\" style=\"color: black;\"></i>\n                        <i class=\"fas fa-ban fa-stack-2x\"></i>\n                    </span>\n                </div>\n            ";
                    self.destroy_chart();
                    if ((request.readyState === 0 || typeof request.readyState === "object" && ρσ_equals(request.readyState, 0))) {
                        status_rs0 = ρσ_interpolate_kwargs.call(str, str.format, [status_rs0].concat([ρσ_desugar_kwargs({id: self.id})]));
                        top = $(self.make_id("top")).html(status_rs0);
                        noconn = $(self.make_id("noconn"));
                        noconn.css("cursor", "pointer");
                        noconn.on("click", function () {
                            self.retry();
                            return false;
                        });
                        ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({retry: false})]);
                    } else if ((request.status === 404 || typeof request.status === "object" && ρσ_equals(request.status, 404)) || (request.status === 0 || typeof request.status === "object" && ρσ_equals(request.status, 0))) {
                        status404 = "\n                    <div class=\"justify-content-center\" style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                        <span class=\"fa-stack fa-2x my-auto pep-click\" style=\"color: darkgrey;\" id=\"tobcc.{id}.exclam\">\n                            <i class=\"far fa-circle fa-stack-2x\"></i>\n                            <i class=\"fas fa-exclamation fa-stack-1x\"></i>\n                        </span>\n                    </div>\n                ";
                        status404 = ρσ_interpolate_kwargs.call(str, str.format, [status404].concat([ρσ_desugar_kwargs({id: self.id})]));
                        top = $(self.make_id("top")).html(status404);
                        exclam = $(self.make_id("exclam"));
                        exclam.css("cursor", "pointer");
                        exclam.on("click", function () {
                            self.retry();
                            return false;
                        });
                        ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({retry: true})]);
                    } else if ((request.status === 401 || typeof request.status === "object" && ρσ_equals(request.status, 401))) {
                        status401 = "\n                    <div class=\"justify-content-center\" style=\"display: flex; height: 100px; background-color: #E6E6E6\">\n                            <span class=\"fa-stack fa-2x my-auto pep-click\" style=\"color: darkgrey;\" id=\"tobcc.{id}.login_lock\">\n                                <i class=\"far fa-circle fa-stack-2x\"></i>\n                                <i class=\"fas fa-lock fa-stack-1x\"></i>\n                            </span>\n                    </div>\n                ";
                        status401 = ρσ_interpolate_kwargs.call(str, str.format, [status401].concat([ρσ_desugar_kwargs({id: self.id})]));
                        origin = request.getResponseHeader("Content-Location");
                        if ((typeof origin !== "undefined" && origin !== null) && origin.length > 0) {
                            split = origin.split("/");
                            if ((split.length === 3 || typeof split.length === "object" && ρσ_equals(split.length, 3)) && (split[0] === "Tor" || typeof split[0] === "object" && ρσ_equals(split[0], "Tor"))) {
                                self.version = split[1];
                                if (split[2].length > 0) {
                                    self.label = split[2];
                                } else {
                                    label = "Loading...";
                                }
                                $(self.make_id("label")).text(self.label);
                                self.tor_version.update(self.version);
                            }
                        }
                        header = request.getResponseHeader("WWW-Authenticate");
                        if ((typeof header !== "undefined" && header !== null) && header.length > 0) {
                        }
                        top = $(self.make_id("top")).html(status401);
                        lock = $(self.make_id("login_lock"));
                        lock.css("cursor", "pointer");
                        lock.on("click", function () {
                            self.perform_login(self.label);
                            return false;
                        });
                        ρσ_interpolate_kwargs.call(self, self.set_links, [ρσ_desugar_kwargs({login: true})]);
                        self.update_timer = setTimeout(function () {
                            self.update();
                        }, 25e3);
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["request", "textStatus", "errorThrown"]}
                });
                return ρσ_anonfunc;
            })()).always((function() {
                var ρσ_anonfunc = function (data) {
                    self.currently_updating = false;
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data"]}
                });
                return ρσ_anonfunc;
            })());
        };
        Node.prototype.destroy_chart = function destroy_chart() {
            var self = this;
            if (self.chart_monitor !== null) {
                self.chart_monitor.destroy();
                self.chart_monitor = null;
            }
            self.chart = null;
            self.written_data = null;
            self.read_data = null;
        };
        Node.prototype.position = function position(el) {
            var self = this;
            if (self.after === null) {
                $(self.parent).prepend(el);
            } else {
                $(self.after).after(el);
            }
        };
        if (!Node.prototype.position.__argnames__) Object.defineProperties(Node.prototype.position, {
            __argnames__ : {value: ["el"]}
        });
        Node.prototype.init_pep = function init_pep() {
            var self = this;
            $(self.make_id()).pep((function(){
                var ρσ_d = {};
                ρσ_d["droppable"] = ".droppable";
                ρσ_d["deferPlacement"] = true;
                ρσ_d["startThreshold"] = ρσ_list_decorate([ 5, 5 ]);
                ρσ_d["elementsWithInteraction"] = ".pep-click";
                ρσ_d["constrainTo"] = "parent";
                ρσ_d["initiate"] = (function() {
                    var ρσ_anonfunc = function (ev, obj) {
                        var $card, chart_id, $chart_clone;
                        if (ρσ_exists.n(self.clone)) {
                            return false;
                        }
                        $card = $(self.make_id());
                        $card.children(":first").removeClass("droppable");
                        self.clone = $card.clone();
                        self.clone.removeAttr("style");
                        self.clone.find("*").each((function() {
                            var ρσ_anonfunc = function (index) {
                                var id;
                                id = $(this).prop("id");
                                if ((typeof id !== "undefined" && id !== null) && ρσ_equals(id.substring(0, 6), "tobcc.")) {
                                    $(this).prop("id", "clone." + id);
                                }
                            };
                            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                __argnames__ : {value: ["index"]}
                            });
                            return ρσ_anonfunc;
                        })());
                        self.clone.prop("id", "");
                        chart_id = self.make_id("chart");
                        if ($(chart_id).length > 0) {
                            $chart_clone = self.clone.find("canvas");
                            if ($chart_clone.length > 0) {
                                self.chart.snapshot_to($chart_clone[0]);
                            }
                        }
                        self.clone.css("opacity", .5);
                        self.clone.children(":first").removeClass("droppable");
                        self.after = $card.prev();
                        if (self.after.length < 1) {
                            self.after = null;
                        }
                        self.position(self.clone);
                        $(self.parent).append($card);
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["ev", "obj"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["start"] = (function() {
                    var ρσ_anonfunc = function (ev, obj) {
                        var $card;
                        $card = $(self.make_id());
                        $card.children(":first").css("box-shadow", "0 15px 10px -10px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1)");
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["ev", "obj"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["drag"] = (function() {
                    var ρσ_anonfunc = function (ev, obj) {
                        var mx, my, drop_cr, clone_cr, p, adr;
                        mx = ev.pep.x - window.scrollX;
                        my = ev.pep.y - window.scrollY;
                        var ρσ_Iter2 = ρσ_Iterable(this.activeDropRegions);
                        for (var ρσ_Index2 = 0; ρσ_Index2 < ρσ_Iter2.length; ρσ_Index2++) {
                            adr = ρσ_Iter2[ρσ_Index2];
                            drop_cr = adr[0].getBoundingClientRect();
                            if (!(mx > drop_cr.right || mx < drop_cr.left || my < drop_cr.top || my > drop_cr.bottom)) {
                                clone_cr = self.clone[0].getBoundingClientRect();
                                p = adr.parent();
                                if (clone_cr.top < drop_cr.top) {
                                    p.after(self.clone);
                                } else if (clone_cr.top > drop_cr.top) {
                                    p.before(self.clone);
                                } else {
                                    if (clone_cr.left < drop_cr.left) {
                                        p.after(self.clone);
                                    } else if (clone_cr.left > drop_cr.left) {
                                        p.before(self.clone);
                                    }
                                }
                                break;
                            }
                        }
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["ev", "obj"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["revert"] = true;
                ρσ_d["revertIf"] = function () {
                    var $card, cr, clone_cr, pep, dx, dy;
                    $card = $(self.make_id());
                    cr = $card[0].getBoundingClientRect();
                    clone_cr = self.clone[0].getBoundingClientRect();
                    pep = $card.data("plugin_pep");
                    dx = clone_cr.left - cr.left;
                    dy = clone_cr.top - cr.top;
                    dx = (dx > 0) ? "+=" + dx : "-=" + Math.abs(dx);
                    dy = (dy > 0) ? "+=" + dy : "-=" + Math.abs(dy);
                    pep.useCSSTranslation = false;
                    pep.place = true;
                    pep.initialPosition.left = dx;
                    pep.initialPosition.top = dy;
                    return true;
                };
                ρσ_d["rest"] = (function() {
                    var ρσ_anonfunc = function (ev, obj) {
                        var $card, position_changed, current_pos, new_pos, after_id;
                        $card = $(self.make_id());
                        position_changed = false;
                        if (ρσ_exists.n(self.clone)) {
                            current_pos = (ρσ_exists.n(self.after)) ? self.after.attr("id") : null;
                            self.after = self.clone.prev();
                            if (self.after.length < 1) {
                                self.after = null;
                            }
                            new_pos = (ρσ_exists.n(self.after)) ? self.after.attr("id") : null;
                            position_changed = (current_pos !== new_pos && (typeof current_pos !== "object" || ρσ_not_equals(current_pos, new_pos)));
                            self.clone.remove();
                            self.clone = null;
                        }
                        self.position($card);
                        if (position_changed === true && self.after !== null) {
                            after_id = self.after.attr("id");
                            $.post(self.base_path + "/" + self.id + "/cc/" + "position", (function(){
                                var ρσ_d = {};
                                ρσ_d["position"] = after_id.slice(6);
                                return ρσ_d;
                            }).call(this));
                        }
                        $card.children(":first").addClass("droppable");
                        $card.children(":first").css("box-shadow", "");
                        obj.$el.removeAttr("style");
                        $.pep.unbind(obj.$el);
                        self.init_pep();
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["ev", "obj"]}
                    });
                    return ρσ_anonfunc;
                })();
                return ρσ_d;
            }).call(this));
        };
        Node.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Node.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(Node.prototype, "__bases__", {value: []});

        ρσ_modules["cards.node"].Node = Node;
    })();

    (function(){
        var __name__ = "dialogs.launcher";
        var DialogBase = ρσ_modules["dialogs.base"].Base;

        function Launcher() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            Launcher.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(Launcher, DialogBase);
        Launcher.prototype.__init__ = function __init__() {
            var self = this;
            var session_id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var base_path = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.base_path : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "base_path")){
                base_path = ρσ_kwargs_obj.base_path;
            }
            DialogBase.prototype.__init__.call(self);
            self.base_path = base_path;
            self.session_id = session_id;
        };
        if (!Launcher.prototype.__init__.__defaults__) Object.defineProperties(Launcher.prototype.__init__, {
            __defaults__ : {value: {base_path:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["session_id", "base_path"]}
        });
        Launcher.__argnames__ = Launcher.prototype.__init__.__argnames__;
        Launcher.__handles_kwarg_interpolation__ = Launcher.prototype.__init__.__handles_kwarg_interpolation__;
        Launcher.prototype.create = function create() {
            var self = this;
            var html;
            html = "\n            <div class=\"modal fade tobcc-font\" id=\"login_modal\" tabindex=\"-1\" role=\"dialog\"\n                aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 class=\"modal-title cc-dialog-title\" style=\"text-shadow: none\"><i class=\"fas fa-circle-notch fa-spin\"></i></h5>\n                        </div>\n                        <div class=\"modal-body text-center\" id='about'>\n                            <div style='font-family: LatoLatinWeb; font-size: 24px;'>\n                                {{stamp.__title__}} <span style='font-family: LatoLatinWeb; font-size: 18px;'> {{stamp.__version__}}\n                            </div>\n                            <div style='font-family: LatoLatinWebLight; font-size: 18px;'>\n                                {{stamp.__description__}}\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <div style='font-family: LatoLatinWeb; font-size: 14px;'>\n                                Copyright &copy; 2015 - 2019 Ralph Wetzel\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ";
            DialogBase.prototype.create.call(self, html);
        };
        Launcher.prototype.show = function show() {
            var self = this;
            var p;
            if (self.modal === null) {
                self.create();
            }
            p = DialogBase.prototype.show.call(self);
            setTimeout(function () {
                self.modal.modal("hide");
            }, 3e3);
            return p;
        };
        Launcher.prototype.__repr__ = function __repr__ () {
            if(DialogBase.prototype.__repr__) return DialogBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        Launcher.prototype.__str__ = function __str__ () {
            if(DialogBase.prototype.__str__) return DialogBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(Launcher.prototype, "__bases__", {value: [DialogBase]});

        ρσ_modules["dialogs.launcher"].Launcher = Launcher;
    })();

    (function(){
        var __name__ = "dialogs.license";
        var DialogBase = ρσ_modules["dialogs.base"].Base;

        var Basic = ρσ_modules["utils.auth"].Basic;
        var Digest = ρσ_modules["utils.auth"].Digest;

        function License() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            License.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(License, DialogBase);
        License.prototype.__init__ = function __init__() {
            var self = this;
            var session_id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var base_path = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.base_path : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "base_path")){
                base_path = ρσ_kwargs_obj.base_path;
            }
            DialogBase.prototype.__init__.call(self);
            self.base_path = base_path;
            self.session_id = session_id;
        };
        if (!License.prototype.__init__.__defaults__) Object.defineProperties(License.prototype.__init__, {
            __defaults__ : {value: {base_path:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["session_id", "base_path"]}
        });
        License.__argnames__ = License.prototype.__init__.__argnames__;
        License.__handles_kwarg_interpolation__ = License.prototype.__init__.__handles_kwarg_interpolation__;
        License.prototype.create = function create() {
            var self = this;
            var html;
            html = "\n            <div class=\"modal fade tobcc-font\" id=\"login_modal\" tabindex=\"-1\" role=\"dialog\"\n                aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 class=\"modal-title cc-dialog-title\">License (MIT)</h5>\n                            <button type=\"button\" class=\"close cc-dialog-close\" data-dismiss=\"modal\"\n                                id=\"bClose{id}\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n                        <div class=\"modal-body text-center\" id='license'>\n                            <i class=\"fas fa-circle-notch fa-spin fa-5x\" style=\"color: darkgrey;\"></i>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <div style=\"margin-right: auto\" id=\"lStatus{id}\"></div>\n                            <button type=\"button\" class=\"btn btn-outline-secondary\" data-dismiss=\"modal\"\n                                id=\"bClose\">\n                                Close\n                            </button>\n                        </div>\n                    </div>\n                </div>\n                </form>\n            </div>\n        ";
            DialogBase.prototype.create.call(self, html);
        };
        License.prototype.show = function show() {
            var self = this;
            var p;
            if (self.modal === null) {
                self.create();
            }
            p = DialogBase.prototype.show.call(self);
            $.post((function(){
                var ρσ_d = {};
                ρσ_d["url"] = self.base_path + "/" + self.session_id + "/cc/" + "license";
                ρσ_d["timeout"] = 2e3;
                return ρσ_d;
            }).call(this)).done((function() {
                var ρσ_anonfunc = function (data) {
                    $("#license").removeClass("text-center").addClass("text-left").css("color", "black").html(data);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data"]}
                });
                return ρσ_anonfunc;
            })());
            return p;
        };
        License.prototype.__repr__ = function __repr__ () {
            if(DialogBase.prototype.__repr__) return DialogBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        License.prototype.__str__ = function __str__ () {
            if(DialogBase.prototype.__str__) return DialogBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(License.prototype, "__bases__", {value: [DialogBase]});

        ρσ_modules["dialogs.license"].License = License;
    })();

    (function(){
        var __name__ = "dialogs.about";
        var DialogBase = ρσ_modules["dialogs.base"].Base;

        var Basic = ρσ_modules["utils.auth"].Basic;
        var Digest = ρσ_modules["utils.auth"].Digest;

        function About() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            About.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(About, DialogBase);
        About.prototype.__init__ = function __init__() {
            var self = this;
            var session_id = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var base_path = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.base_path : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "base_path")){
                base_path = ρσ_kwargs_obj.base_path;
            }
            DialogBase.prototype.__init__.call(self);
            self.base_path = base_path;
            self.session_id = session_id;
        };
        if (!About.prototype.__init__.__defaults__) Object.defineProperties(About.prototype.__init__, {
            __defaults__ : {value: {base_path:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["session_id", "base_path"]}
        });
        About.__argnames__ = About.prototype.__init__.__argnames__;
        About.__handles_kwarg_interpolation__ = About.prototype.__init__.__handles_kwarg_interpolation__;
        About.prototype.create = function create() {
            var self = this;
            var html;
            html = "\n            <div class=\"modal fade tobcc-font\" id=\"login_modal\" tabindex=\"-1\" role=\"dialog\"\n                aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header cc-dialog-header\">\n                            <h5 class=\"modal-title cc-dialog-title\">About</h5>\n                            <button type=\"button\" class=\"close cc-dialog-close\" data-dismiss=\"modal\"\n                                id=\"bClose{id}\" aria-label=\"Close\">\n                                <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                        </div>\n                        <div class=\"modal-body text-center\" id='about'>\n                            <i class=\"fas fa-circle-notch fa-spin fa-5x\" style=\"color: darkgrey;\"></i>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <a href=\"https://github.com/ralphwetzel/theonionbox\" target=\"_blank\">\n                                <i class=\"fab fa-github fa-lg\"></i> GitHub\n                            </a>\n                            <div style=\"margin-right: auto\" id=\"lStatus{id}\"></div>\n                            <button type=\"button\" class=\"btn btn-outline-secondary\" data-dismiss=\"modal\"\n                                id=\"bClose\">\n                                Close\n                            </button>\n                        </div>\n                    </div>\n                </div>\n                </form>\n            </div>\n        ";
            DialogBase.prototype.create.call(self, html);
        };
        About.prototype.show = function show() {
            var self = this;
            var p;
            if (self.modal === null) {
                self.create();
            }
            p = DialogBase.prototype.show.call(self);
            $.post((function(){
                var ρσ_d = {};
                ρσ_d["url"] = self.base_path + "/" + self.session_id + "/cc/" + "about";
                ρσ_d["timeout"] = 2e3;
                return ρσ_d;
            }).call(this)).done((function() {
                var ρσ_anonfunc = function (data) {
                    $("#about").removeClass("text-center").addClass("text-left").css("color", "black").html(data);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data"]}
                });
                return ρσ_anonfunc;
            })());
            return p;
        };
        About.prototype.__repr__ = function __repr__ () {
            if(DialogBase.prototype.__repr__) return DialogBase.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        About.prototype.__str__ = function __str__ () {
            if(DialogBase.prototype.__str__) return DialogBase.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(About.prototype, "__bases__", {value: [DialogBase]});

        ρσ_modules["dialogs.about"].About = About;
    })();

    (function(){
        var __name__ = "controlcenter";
        var NodeCard = ρσ_modules["cards.node"].Node;

        var make_id = ρσ_modules["utils.make_id"].make_id;

        var format_bytes = ρσ_modules["utils.format_bytes"].format_bytes;

        var Smoothie = ρσ_modules["controls.smoothie"].Smoothie;
        var TimeSeries = ρσ_modules["controls.smoothie"].TimeSeries;

        var Launcher = ρσ_modules["dialogs.launcher"].Launcher;

        
        
        function ControlCenter() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            ControlCenter.prototype.__init__.apply(this, arguments);
        }
        ControlCenter.prototype.__init__ = function __init__() {
            var self = this;
            var launcher = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.launcher : arguments[0];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "launcher")){
                launcher = ρσ_kwargs_obj.launcher;
            }
            var ts, c;
            if (launcher) {
                (new Launcher).show();
            }
            self.session_id = "{{session.id}}";
            self.base_path = "{{virtual_basepath}}";
            self.cards = ρσ_list_decorate([]);
            self.do_ping = true;
            self.ims = "Wed, 21 Oct 2015 07:28:00 GMT";
            self.chart_options_1 = (function(){
                var ρσ_d = {};
                ρσ_d["millisPerPixel"] = 500;
                ρσ_d["maxValueScale"] = 1.1;
                ρσ_d["minValueScale"] = 1.1;
                ρσ_d["maxDataSetLength"] = Math.max(screen.width, screen.height);
                ρσ_d["interpolation"] = "step";
                ρσ_d["enableDpiScaling"] = true;
                ρσ_d["timeLabelLeftAlign"] = true;
                ρσ_d["timeLabelSeparation"] = 2;
                ρσ_d["grid"] = (function(){
                    var ρσ_d = {};
                    ρσ_d["millisPerLine"] = 0;
                    ρσ_d["timeDividers"] = "";
                    ρσ_d["fillStyle"] = "rgba(255, 255, 255, 0.0)";
                    ρσ_d["strokeStyle"] = "rgba(255, 255, 255, 0.75)";
                    ρσ_d["verticalSections"] = 1;
                    ρσ_d["borderVisible"] = false;
                    return ρσ_d;
                }).call(this);
                ρσ_d["labels"] = (function(){
                    var ρσ_d = {};
                    ρσ_d["fontFamily"] = "LatoLatinWebLight";
                    ρσ_d["fillStyle"] = "rgba(255, 255, 255, 1)";
                    ρσ_d["disabled"] = false;
                    ρσ_d["fontSize"] = 10;
                    ρσ_d["precision"] = 2;
                    return ρσ_d;
                }).call(this);
                ρσ_d["timestampFormatter"] = (function() {
                    var ρσ_anonfunc = function (date) {
                        function pad2(number) {
                            return (number < 10) ? "0" + number : number;
                        };
                        if (!pad2.__argnames__) Object.defineProperties(pad2, {
                            __argnames__ : {value: ["number"]}
                        });

                        return pad2(date.getHours()) + ":" + pad2(date.getMinutes());
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["date"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["yMaxFormatter"] = (function() {
                    var ρσ_anonfunc = function () {
                        var data = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                        var precision = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.precision : arguments[1];
                        var ρσ_kwargs_obj = arguments[arguments.length-1];
                        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "precision")){
                            precision = ρσ_kwargs_obj.precision;
                        }
                        return format_bytes(data) + "/s";
                    };
                    if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
                        __defaults__ : {value: {precision:2}},
                        __handles_kwarg_interpolation__ : {value: true},
                        __argnames__ : {value: ["data", "precision"]}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["yMinFormatter"] = (function() {
                    var ρσ_anonfunc = function () {
                        var data = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                        var precision = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.precision : arguments[1];
                        var ρσ_kwargs_obj = arguments[arguments.length-1];
                        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "precision")){
                            precision = ρσ_kwargs_obj.precision;
                        }
                        return format_bytes(Math.abs(data)) + "/s";
                    };
                    if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
                        __defaults__ : {value: {precision:2}},
                        __handles_kwarg_interpolation__ : {value: true},
                        __argnames__ : {value: ["data", "precision"]}
                    });
                    return ρσ_anonfunc;
                })();
                return ρσ_d;
            }).call(this);
            self.chart = new Smoothie(self.chart_options_1);
            self.read_data = new TimeSeries;
            self.written_data = new TimeSeries;
            self.chart.addTimeSeries(self.read_data, (function(){
                var ρσ_d = {};
                ρσ_d["lineWidth"] = 1;
                ρσ_d["strokeStyle"] = "rgb(255, 255, 255)";
                ρσ_d["fillStyle"] = "rgba(255, 255, 255, 0.25)";
                return ρσ_d;
            }).call(this));
            self.chart.addTimeSeries(self.written_data, (function(){
                var ρσ_d = {};
                ρσ_d["lineWidth"] = 1;
                ρσ_d["strokeStyle"] = "rgb(255, 255, 255)";
                ρσ_d["fillStyle"] = "rgba(255, 255, 255, 0.50)";
                return ρσ_d;
            }).call(this));
            ts = int((new Date).getTime() / 1e3) * 1e3;
            self.read_data.append(ts, 0, true);
            self.written_data.append(ts, 0, true);
            c = $("#topchart");
            self.chart.streamTo($(c)[0], 5e3);
            if ((typeof scrollMonitor !== "undefined" && scrollMonitor !== null)) {
                self.chart_monitor = scrollMonitor.create($(c)[0], 100);
                self.chart_monitor.enterViewport(function () {
                    self.chart.start();
                });
                self.chart_monitor.exitViewport(function () {
                    self.chart.stop();
                });
            } else {
                self.chart.start();
            }
            self.stream_data_providers = {};
            $(document).on("tobcc.bandwidth", (function() {
                var ρσ_anonfunc = function (event, id, rep, data) {
                    var sdp, tss, ts, datapoint;
                    sdp = {};
                    if (len(data) > 0 && ρσ_in(rep, self.stream_data_providers)) {
                        sdp = (ρσ_expr_temp = self.stream_data_providers)[(typeof rep === "number" && rep < 0) ? ρσ_expr_temp.length + rep : rep];
                        if ((sdp.id !== id && (typeof sdp.id !== "object" || ρσ_not_equals(sdp.id, id))) && sdp.tss > int(data[0].s / 1e3) - 15) {
                            return;
                        }
                    }
                    sdp.id = id;
                    var ρσ_Iter0 = ρσ_Iterable(data);
                    for (var ρσ_Index0 = 0; ρσ_Index0 < ρσ_Iter0.length; ρσ_Index0++) {
                        datapoint = ρσ_Iter0[ρσ_Index0];
                        tss = int(datapoint.s / 1e3);
                        if (ρσ_exists.n(sdp.tss)) {
                            if ((tss === sdp.tss || typeof tss === "object" && ρσ_equals(tss, sdp.tss))) {
                                sdp.r = datapoint.r;
                                sdp.w = datapoint.w;
                                continue;
                            }
                            if (tss > sdp.tss + 1 && ρσ_exists.n(sdp.r)) {
                                self.read_data.append((sdp.tss + 1) * 1e3, sdp.r, true);
                                self.written_data.append((sdp.tss + 1) * 1e3, sdp.w, true);
                            }
                        }
                        ts = tss * 1e3;
                        self.read_data.append(ts, datapoint.r, true);
                        self.written_data.append(ts, datapoint.w, true);
                        sdp.tss = tss;
                        sdp.r = null;
                        sdp.w = null;
                    }
                    tss += 1;
                    self.read_data.append(tss * 1e3, 0, true);
                    self.written_data.append(tss * 1e3, 0, true);
                    (ρσ_expr_temp = self.stream_data_providers)[(typeof rep === "number" && rep < 0) ? ρσ_expr_temp.length + rep : rep] = sdp;
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["event", "id", "rep", "data"]}
                });
                return ρσ_anonfunc;
            })());
            $(document).one("tobcc.bandwidth", function () {
                var tc;
                tc = $("#topchart");
                if (tc.is(":hidden")) {
                    tc.fadeIn(2e3);
                    tc.css("width", "450px");
                    tc.css("height", "50px");
                }
            });
            $(".pep").pep();
            setTimeout(function () {
                self.ping();
            }, 250);
        };
        if (!ControlCenter.prototype.__init__.__defaults__) Object.defineProperties(ControlCenter.prototype.__init__, {
            __defaults__ : {value: {launcher:true}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["launcher"]}
        });
        ControlCenter.__argnames__ = ControlCenter.prototype.__init__.__argnames__;
        ControlCenter.__handles_kwarg_interpolation__ = ControlCenter.prototype.__init__.__handles_kwarg_interpolation__;
        ControlCenter.prototype.on_new_node = function on_new_node() {
            var self = this;
            var NodeProperties = ρσ_modules["dialogs.properties"].Properties;

            ρσ_interpolate_kwargs_constructor.call(Object.create(NodeProperties.prototype), false, NodeProperties, [self.session_id].concat([ρσ_desugar_kwargs({base_path: self.base_path})])).show();
        };
        ControlCenter.prototype.ping = function ping() {
            var self = this;
            if (self.do_ping !== true) {
                return;
            }
            $.post((function(){
                var ρσ_d = {};
                ρσ_d["url"] = self.base_path + "/" + self.session_id + "/cc/" + "ping";
                ρσ_d["headers"] = (function(){
                    var ρσ_d = {};
                    ρσ_d["if-modified-since"] = self.ims;
                    ρσ_d["timeout"] = 5e3;
                    return ρσ_d;
                }).call(this);
                return ρσ_d;
            }).call(this)).done((function() {
                var ρσ_anonfunc = function (data, textStatus, response) {
                    var d, cards, new_cards, c, after_element, done, card, cid;
                    if ((response.status === 200 || typeof response.status === "object" && ρσ_equals(response.status, 200))) {
                        self.ims = response.getResponseHeader("last-modified");
                        d = JSON.parse(data);
                        if (ρσ_in("cards", d)) {
                            cards = d["cards"];
                            new_cards = ρσ_list_decorate([]);
                            var ρσ_Iter1 = ρσ_Iterable(self.cards);
                            for (var ρσ_Index1 = 0; ρσ_Index1 < ρσ_Iter1.length; ρσ_Index1++) {
                                c = ρσ_Iter1[ρσ_Index1];
                                if (ρσ_in(c.id, cards)) {
                                    new_cards.push(c);
                                } else {
                                    $.post((function(){
                                        var ρσ_d = {};
                                        ρσ_d["url"] = self.base_path + "/" + c.id + "/cc/" + "ciao.html";
                                        return ρσ_d;
                                    }).call(this));
                                    c.detatch();
                                }
                            }
                            after_element = null;
                            var ρσ_Iter2 = ρσ_Iterable(cards);
                            for (var ρσ_Index2 = 0; ρσ_Index2 < ρσ_Iter2.length; ρσ_Index2++) {
                                cid = ρσ_Iter2[ρσ_Index2];
                                done = false;
                                var ρσ_Iter3 = ρσ_Iterable(new_cards);
                                for (var ρσ_Index3 = 0; ρσ_Index3 < ρσ_Iter3.length; ρσ_Index3++) {
                                    c = ρσ_Iter3[ρσ_Index3];
                                    if ((c.id === cid || typeof c.id === "object" && ρσ_equals(c.id, cid))) {
                                        c.moveTo(after_element);
                                        done = true;
                                        break;
                                    }
                                }
                                if ((done === false || typeof done === "object" && ρσ_equals(done, false))) {
                                    card = ρσ_interpolate_kwargs_constructor.call(Object.create(NodeCard.prototype), false, NodeCard, [ρσ_desugar_kwargs({id: cid, base_path: self.base_path, position: 0})]);
                                    new_cards.push(card);
                                    ρσ_interpolate_kwargs.call(card, card.attach, [ρσ_desugar_kwargs({parent_element: "#cc-cards", after_element: after_element})]);
                                }
                                after_element = make_id(cid);
                            }
                            self.cards = new_cards;
                        }
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data", "textStatus", "response"]}
                });
                return ρσ_anonfunc;
            })()).always((function() {
                var ρσ_anonfunc = function (data) {
                    setTimeout(function () {
                        self.ping();
                    }, 2e3);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["data"]}
                });
                return ρσ_anonfunc;
            })());
        };
        ControlCenter.prototype.license = function license() {
            var self = this;
            var License = ρσ_modules["dialogs.license"].License;

            new License(self.session_id, self.base_path).show();
        };
        ControlCenter.prototype.about = function about() {
            var self = this;
            var About = ρσ_modules["dialogs.about"].About;

            new About(self.session_id, self.base_path).show();
        };
        ControlCenter.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        ControlCenter.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(ControlCenter.prototype, "__bases__", {value: []});

        window.ControlCenter = ControlCenter;
        ρσ_modules.controlcenter.XMLHttpRequest = XMLHttpRequest;
        ρσ_modules.controlcenter.ControlCenter = ControlCenter;
    })();

    (function(){

        var __name__ = "__main__";


        var ControlCenter = ρσ_modules.controlcenter.ControlCenter;

    })();
})();