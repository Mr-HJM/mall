webpackJsonp([1,14],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(40);


/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports) {

	module.exports = $;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by YU on 2016/2/18.
	 */
	var Q = __webpack_require__(4);
	var $ = __webpack_require__(2);
	var CONFIG=__webpack_require__(8);
	$.ajaxSetup({cache: false});
	
	module.exports = function(opt){
	    return Q.promise(function(resolve, reject, notify){
	        $.ajax({
	            url: opt.url,
	            data: opt.data || {},
	            dataType: opt.dataType || 'json',
	            headers: opt.headers || {},
	            type: opt.type || 'get',
	            success: function (data,textStatus,jqXHR) {
	                delete jqXHR.then;
	                if(data.status == '401'){
	                    //未登录 或者登录超时
	                    location.href =CONFIG.URL.SSO_LOGIN+"?service="+CONFIG.URL.INDEX;
	                    return;
	                }
	                resolve.apply(null, arguments);
	            },
	            error: function (jqXHR, textStatus, errorThrown) {
	                delete jqXHR.then;
	                reject.apply(null, arguments);
	            }
	        });
	    });
	};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
	 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	
	(function (definition) {
	    "use strict";
	
	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.
	
	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);
	
	    // CommonJS
	    } else if (true) {
	        module.exports = definition();
	
	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);
	
	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }
	
	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;
	
	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();
	
	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };
	
	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }
	
	})(function () {
	"use strict";
	
	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}
	
	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;
	
	// shims
	
	// used for fallback in "allResolved"
	var noop = function () {};
	
	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];
	
	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;
	
	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;
	
	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);
	
	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();
	
	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!
	
	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }
	
	                throw e;
	
	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }
	
	        if (domain) {
	            domain.exit();
	        }
	    }
	
	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };
	
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	
	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.toString()` yields "[object process]".
	        isNodeJS = true;
	
	        requestTick = function () {
	            process.nextTick(flush);
	        };
	
	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }
	
	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };
	
	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();
	
	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis
	
	var array_slice = uncurryThis(Array.prototype.slice);
	
	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);
	
	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);
	
	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);
	
	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};
	
	var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
	    obj[prop] = descriptor.value;
	    return obj;
	};
	
	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
	
	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};
	
	var object_toString = uncurryThis(Object.prototype.toString);
	
	function isObject(value) {
	    return value === Object(value);
	}
	
	// generator related shims
	
	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}
	
	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}
	
	// long stack traces
	
	var STACK_JUMP_SEPARATOR = "From previous event:";
	
	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
	                object_defineProperty(error, "__minimumStackCounter__", {value: p.stackCounter, configurable: true});
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);
	
	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        var stack = filterStackString(concatedStacks);
	        object_defineProperty(error, "stack", {value: stack, configurable: true});
	    }
	}
	
	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];
	
	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}
	
	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}
	
	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }
	
	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }
	
	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}
	
	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
	
	    if (!fileNameAndLineNumber) {
	        return false;
	    }
	
	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];
	
	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}
	
	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }
	
	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }
	
	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}
	
	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}
	
	// end of shims
	// beginning of real work
	
	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }
	
	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;
	
	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;
	
	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;
	
	/**
	 * The counter is used to determine the stopping point for building
	 * long stack traces. In makeStackTraceLong we walk backwards through
	 * the linked list of promises, only stacks which were created before
	 * the rejection are concatenated.
	 */
	var longStackCounter = 1;
	
	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}
	
	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;
	
	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };
	
	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };
	
	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };
	
	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	            promise.stackCounter = longStackCounter++;
	        }
	    }
	
	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.
	
	    function become(newPromise) {
	        resolvedPromise = newPromise;
	
	        if (Q.longStackSupport && hasStacks) {
	            // Only hold a reference to the new promise if long stacks
	            // are enabled to reduce memory usage
	            promise.source = newPromise;
	        }
	
	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);
	
	        messages = void 0;
	        progressListeners = void 0;
	    }
	
	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(Q(value));
	    };
	
	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };
	
	    return deferred;
	}
	
	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};
	
	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}
	
	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6
	
	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};
	
	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};
	
	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};
	
	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Q can't join: not the same: " + x + " " + y);
	        }
	    });
	};
	
	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}
	
	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};
	
	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }
	
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };
	
	    promise.inspect = inspect;
	
	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }
	
	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }
	
	    return promise;
	}
	
	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};
	
	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks
	
	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }
	
	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }
	
	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }
	
	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_rejected(exception));
	        }]);
	    });
	
	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }
	
	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);
	
	    return deferred.promise;
	};
	
	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};
	
	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);
	
	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};
	
	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}
	
	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};
	
	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};
	
	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};
	
	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};
	
	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */
	
	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}
	
	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}
	
	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}
	
	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}
	
	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};
	
	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}
	
	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};
	
	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}
	
	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};
	
	//// BEGIN UNHANDLED REJECTION TRACKING
	
	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;
	
	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;
	
	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}
	
	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }
	
	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}
	
	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	
	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}
	
	Q.resetUnhandledRejections = resetUnhandledRejections;
	
	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};
	
	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};
	
	resetUnhandledRejections();
	
	//// END UNHANDLED REJECTION TRACKING
	
	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });
	
	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);
	
	    return rejection;
	}
	
	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}
	
	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}
	
	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}
	
	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}
	
	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};
	
	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;
	
	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.
	
	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}
	
	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}
	
	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}
	
	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}
	
	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}
	
	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};
	
	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};
	
	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};
	
	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};
	
	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};
	
	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};
	
	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};
	
	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};
	
	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};
	
	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};
	
	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};
	
	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};
	
	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};
	
	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	
	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};
	
	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};
	
	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}
	
	Promise.prototype.all = function () {
	    return all(this);
	};
	
	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;
	
	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }
	
	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];
	
	        pendingCount++;
	
	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected(err) {
	            pendingCount--;
	            if (pendingCount === 0) {
	                err.message = ("Q can't get fulfillment value from any promise, all " +
	                    "promises were rejected. Last error message: " + err.message);
	                deferred.reject(err);
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);
	
	    return deferred.promise;
	}
	
	Promise.prototype.any = function () {
	    return any(this);
	};
	
	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}
	
	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};
	
	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}
	
	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};
	
	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};
	
	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};
	
	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}
	
	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};
	
	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};
	
	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    if (!callback || typeof callback.apply !== "function") {
	        throw new Error("Q can't apply finally callback");
	    }
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};
	
	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};
	
	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };
	
	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;
	
	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }
	
	    promise.then(void 0, onUnhandledError);
	};
	
	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};
	
	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);
	
	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);
	
	    return deferred.promise;
	};
	
	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};
	
	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    if (callback === undefined) {
	        throw new Error("Q can't wrap an undefined function");
	    }
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};
	
	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};
	
	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}
	
	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};
	
	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};
	
	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();
	
	return Q;
	
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(6).setImmediate))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(7);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/**
	 * Created by Tom on 2016/05/09
	 */
	
	module.exports = {
		URL:{
			SSO_LOGIN:'http://223.202.64.204:50901/login',//单点登录
	        SSO_LOGOUT:'http://223.202.64.204:50901/logout',//单点退出
	        INDEX:'http://127.0.0.1:9020/html/index.html',//人人通首页
	        CHECK_LOGIN:'http://223.202.64.204:50934/',//检查是否登陆及得到登陆信息
	        SETUSER:'http://223.202.64.204:50934/setuser.jsp',//设置登录
	        APP:'http://223.202.64.204:50713/',//应用的请求地址
	        RES:'http://221.228.242.4:8007/index.html',//资源的请求地址
	        UPLOAD:'http://223.202.64.204:50951/files',//上传文件地址
	        RESTFUL:'http://223.202.64.204:50932',
			FOOTERTYPE:2,//1是张家港，2是通配
			STATISTICS:0,//0是不显示，1是显示
	        COURSE:0//0是不显示，1是显示
		},
		APP:{
			ISWX:true
	    },
		APPEXISTS:false,//张家港显示，无锡、黄冈不显示
		ISPINGCETASK:false
	};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	
	var $ = __webpack_require__(2);
	var ajax = __webpack_require__(3);
	var jsonp = __webpack_require__(10);
	
	var headTpl = __webpack_require__(11);
	var typeListTpl = __webpack_require__(13);
	var hotListTpl = __webpack_require__(14);
	var moreFenTpl = __webpack_require__(15);
	var footTpl = __webpack_require__(16);
	var menuName, _callBack;
	
	/*
	 * 头部、尾部导航
	 */
	
	var header = {
	    id: null,
	    init: function () {
	        var me = this;
	        var storage = window.sessionStorage;
	        me.id = storage["id"];
	        me.initBtn();
	    },
	    initBtn: function () {
	        var me = this;
	        ajax({
	            url: '/eshop/belong/all',
	            type: 'get'
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('#header').html(headTpl(list));
	                $('body').on('click', '.my-order' ,function(){
	                    location.href = '../center-base/my-order.html';
	                });
	
	                $('body').on('click', '.my-car' ,function(){
	                    location.href = '../my-cart/my-cart.html';
	                });
	                _callBack()
	
	                $('.logo img').on('click', function(){
	                    location.href = '../integral-base/integral-home.html';
	                });
	                // 非首页划过全部商品分类显示
	                var url = window.location.pathname;
	                var splitUrl = url.split('/');
	                if(splitUrl[3] != 'integral-home.html'){
	                    $('.all-list').hide();
	                    $('.all-classify').on('mouseenter', function(){
	                        $('.all-list').slideDown(200);
	                    });
	                    $('.all-list').on('mouseleave', function(){
	                        $('.all-list').slideUp(200);
	                    });
	                } else {
	                    $('.all-list').show();
	                }
	                me.isLogin();
	                me.logingBtn();
	                me.allType();
	                me.hotList();
	                me.searchName();
	                me.searchHot();
	
	                $('.nav-classify li').on('click', function(){
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).html();
	                    var num = $(this).attr('data-num');
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId + '&bnum=' + num;
	                });
	            }
	        });
	        $('#footer').html(footTpl());
	    },
	    // 登录、注册操作
	    logingBtn: function(){
	        var me = this;
	        $('body').on('click', '.top .loging',function(){
	            location.href = '../integral-base/login.html';
	        });
	        $('body').on('click', '.top .register',function(){
	            location.href = '../integral-base/register.html';
	        });
	    },
	    isLogin: function(){
	        var me = this;
	        var storage = window.sessionStorage;
	        var getLoginname = storage["loginname"];
	        var loginStatus = storage["islogin"];
	        //var date = storage["date"];
	
	        if(loginStatus == 'yes'){
	            $('.top .site-loged').hide();
	            $('.welcome').html('您好 '+getLoginname+'，欢迎光临御廷家居！');
	        } else {
	            $('body').on('click','.site-loging-success li', function(){
	                location.href = '../integral-base/login.html'
	            });
	        }
	    },
	    hotList: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/type/plist',
	            type: 'get',
	            data:{
	                num: '6'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('.search-hot').html(hotListTpl(list));
	            }
	        });
	    },
	    allType: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/type/all',
	            type: 'get',
	            data:{
	                accountId: me.id,
	                level: '2'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                //console.log(list);
	                $('.all_list').html(typeListTpl(list));
	                $('.more-fen').html(moreFenTpl(list));
	                $('.all_list>li:gt(5)').remove();
	
	                $('.all_list>li').on('mouseenter', function(){
	                    if($(this).children('.classif-detail').find("ul li").length > 0){
	                        $(this).children('.classif-detail').show();
	                    }
	                });
	                $('.all_list>li').on('mouseleave', function(){
	                    $(this).children('.classif-detail').hide();
	                });
	                if(data.result.length > 5){
	                    $('.topCon .all-list .more-categories').on('mouseenter', function(){
	                        $('.more-fen').show();
	                    });
	                    $('.topCon .all-list .more-categories').on('mouseleave', function(){
	                        $('.more-fen').hide();
	                    });
	                }
	
	                // 全部商品分类下
	                $('.all_list>li').on('click', function(e){
	                    //e.stoppropagation();
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).children('.list-title').html().split('•')[1].trim();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	                /*$('.all_list>li>.list-hot>li').on('click', function(e){
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).html();
	                    location.href = '../commodity-base/commodity-list.html#flag=' + thisName + '&parentId=' + thisId;
	                    e.stoppropagation();
	                });*/
	                $('body').on('click', '.all_list>li>.classif-detail>ul>li',function(e){
	                    //e.stoppropagation();
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).html();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	
	                $('body').on('click', '.more-categories .more-fen .more-list',function(e){
	                    //e.stoppropagation();
	                    var thisId = $(this).attr('data-id');
	                    var thisName = $(this).children('div').html();
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
	                });
	            }
	        });
	    },
	    searchName: function(){
	        var me = this;
	        $('body').on('click','.search .search-btn', function(){
	            var goodName = $('.search-name').val();
	            ajax({
	                url: '/eshop/product/query',
	                type: 'post',
	                data:{
	                    name: goodName
	                }
	            }).then(function(data){
	                if(data.status == 200){
	                    var list = data.result;
	                    window.open('../commodity-base/commodity-list.html#name=' + goodName);
	                }
	            });
	        })
	    },
	    searchHot: function(){
	        var me = this;
	        $('body').on('click', '.search-hot li',function(){
	            var hotName = $(this).html();
	            var parentId = $(this).attr('data-id');
	            location.href = '../commodity-base/commodity-list.html?flag=' + hotName + '&parentId=' + parentId;
	        })
	    }
	};
	
	/*
	 *
	 */
	
	module.exports = {
	    init: function (callback) {
	        _callBack = callback;
	        header.init();
	    }
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/*
	 * jQuery JSONP Core Plugin 2.4.0 (2012-08-21)
	 *
	 * https://github.com/jaubourg/jquery-jsonp
	 *
	 * Copyright (c) 2012 Julian Aubourg
	 *
	 * This document is licensed as free software under the terms of the
	 * MIT License: http://www.opensource.org/licenses/mit-license.php
	 */
	( function( $ ) {
	
		// ###################### UTILITIES ##
	
		// Noop
		function noop() {
		}
	
		// Generic callback
		function genericCallback( data ) {
			lastValue = [ data ];
		}
	
		// Call if defined
		function callIfDefined( method , object , parameters ) {
			return method && method.apply( object.context || object , parameters );
		}
	
		// Give joining character given url
		function qMarkOrAmp( url ) {
			return /\?/ .test( url ) ? "&" : "?";
		}
	
		var // String constants (for better minification)
			STR_ASYNC = "async",
			STR_CHARSET = "charset",
			STR_EMPTY = "",
			STR_ERROR = "error",
			STR_INSERT_BEFORE = "insertBefore",
			STR_JQUERY_JSONP = "_jqjsp",
			STR_ON = "on",
			STR_ON_CLICK = STR_ON + "click",
			STR_ON_ERROR = STR_ON + STR_ERROR,
			STR_ON_LOAD = STR_ON + "load",
			STR_ON_READY_STATE_CHANGE = STR_ON + "readystatechange",
			STR_READY_STATE = "readyState",
			STR_REMOVE_CHILD = "removeChild",
			STR_SCRIPT_TAG = "<script>",
			STR_SUCCESS = "success",
			STR_TIMEOUT = "timeout",
	
			// Window
			win = window,
			// Deferred
			Deferred = $.Deferred,
			// Head element
			head = $( "head" )[ 0 ] || document.documentElement,
			// Page cache
			pageCache = {},
			// Counter
			count = 0,
			// Last returned value
			lastValue,
	
			// ###################### DEFAULT OPTIONS ##
			xOptionsDefaults = {
				//beforeSend: undefined,
				//cache: false,
				callback: STR_JQUERY_JSONP,
				//callbackParameter: undefined,
				//charset: undefined,
				//complete: undefined,
				//context: undefined,
				//data: "",
				//dataFilter: undefined,
				//error: undefined,
				//pageCache: false,
				//success: undefined,
				//timeout: 0,
				//traditional: false,
				url: location.href
			},
	
			// opera demands sniffing :/
			opera = win.opera,
	
			// IE < 10
			oldIE = !!$( "<div>" ).html( "<!--[if IE]><i><![endif]-->" ).find("i").length;
	
		// ###################### MAIN FUNCTION ##
		function jsonp( xOptions ) {
	
			// Build data with default
			xOptions = $.extend( {} , xOptionsDefaults , xOptions );
	
			// References to xOptions members (for better minification)
			var successCallback = xOptions.success,
				errorCallback = xOptions.error,
				completeCallback = xOptions.complete,
				dataFilter = xOptions.dataFilter,
				callbackParameter = xOptions.callbackParameter,
				successCallbackName = xOptions.callback,
				cacheFlag = xOptions.cache,
				pageCacheFlag = xOptions.pageCache,
				charset = xOptions.charset,
				url = xOptions.url,
				data = xOptions.data,
				timeout = xOptions.timeout,
				pageCached,
	
				// Abort/done flag
				done = 0,
	
				// Life-cycle functions
				cleanUp = noop,
	
				// Support vars
				supportOnload,
				supportOnreadystatechange,
	
				// Request execution vars
				firstChild,
				script,
				scriptAfter,
				timeoutTimer;
	
			// If we have Deferreds:
			// - substitute callbacks
			// - promote xOptions to a promise
			Deferred && Deferred(function( defer ) {
				defer.done( successCallback ).fail( errorCallback );
				successCallback = defer.resolve;
				errorCallback = defer.reject;
			}).promise( xOptions );
	
			// Create the abort method
			xOptions.abort = function() {
				!( done++ ) && cleanUp();
			};
	
			// Call beforeSend if provided (early abort if false returned)
			if ( callIfDefined( xOptions.beforeSend , xOptions , [ xOptions ] ) === !1 || done ) {
				return xOptions;
			}
	
			// Control entries
			url = url || STR_EMPTY;
			data = data ? ( (typeof data) == "string" ? data : $.param( data , xOptions.traditional ) ) : STR_EMPTY;
	
			// Build final url
			url += data ? ( qMarkOrAmp( url ) + data ) : STR_EMPTY;
	
			// Add callback parameter if provided as option
			callbackParameter && ( url += qMarkOrAmp( url ) + encodeURIComponent( callbackParameter ) + "=?" );
	
			// Add anticache parameter if needed
			!cacheFlag && !pageCacheFlag && ( url += qMarkOrAmp( url ) + "_" + ( new Date() ).getTime() + "=" );
	
			// Replace last ? by callback parameter
			url = url.replace( /=\?(&|$)/ , "=" + successCallbackName + "$1" );
	
			// Success notifier
			function notifySuccess( json ) {
	
				if ( !( done++ ) ) {
	
					cleanUp();
					// Pagecache if needed
					pageCacheFlag && ( pageCache [ url ] = { s: [ json ] } );
					// Apply the data filter if provided
					dataFilter && ( json = dataFilter.apply( xOptions , [ json ] ) );
					// Call success then complete
					callIfDefined( successCallback , xOptions , [ json , STR_SUCCESS, xOptions ] );
					callIfDefined( completeCallback , xOptions , [ xOptions , STR_SUCCESS ] );
	
				}
			}
	
			// Error notifier
			function notifyError( type ) {
	
				if ( !( done++ ) ) {
	
					// Clean up
					cleanUp();
					// If pure error (not timeout), cache if needed
					pageCacheFlag && type != STR_TIMEOUT && ( pageCache[ url ] = type );
					// Call error then complete
					callIfDefined( errorCallback , xOptions , [ xOptions , type ] );
					callIfDefined( completeCallback , xOptions , [ xOptions , type ] );
	
				}
			}
	
			// Check page cache
			if ( pageCacheFlag && ( pageCached = pageCache[ url ] ) ) {
	
				pageCached.s ? notifySuccess( pageCached.s[ 0 ] ) : notifyError( pageCached );
	
			} else {
	
				// Install the generic callback
				// (BEWARE: global namespace pollution ahoy)
				win[ successCallbackName ] = genericCallback;
	
				// Create the script tag
				script = $( STR_SCRIPT_TAG )[ 0 ];
				script.id = STR_JQUERY_JSONP + count++;
	
				// Set charset if provided
				if ( charset ) {
					script[ STR_CHARSET ] = charset;
				}
	
				opera && opera.version() < 11.60 ?
					// onerror is not supported: do not set as async and assume in-order execution.
					// Add a trailing script to emulate the event
					( ( scriptAfter = $( STR_SCRIPT_TAG )[ 0 ] ).text = "document.getElementById('" + script.id + "')." + STR_ON_ERROR + "()" )
				:
					// onerror is supported: set the script as async to avoid requests blocking each others
					( script[ STR_ASYNC ] = STR_ASYNC )
	
				;
	
				// Internet Explorer: event/htmlFor trick
				if ( oldIE ) {
					script.htmlFor = script.id;
					script.event = STR_ON_CLICK;
				}
	
				// Attached event handlers
				script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = script[ STR_ON_READY_STATE_CHANGE ] = function ( result ) {
	
					// Test readyState if it exists
					if ( !script[ STR_READY_STATE ] || !/i/.test( script[ STR_READY_STATE ] ) ) {
	
						try {
	
							script[ STR_ON_CLICK ] && script[ STR_ON_CLICK ]();
	
						} catch( _ ) {}
	
						result = lastValue;
						lastValue = 0;
						result ? notifySuccess( result[ 0 ] ) : notifyError( STR_ERROR );
	
					}
				};
	
				// Set source
				script.src = url;
	
				// Re-declare cleanUp function
				cleanUp = function( i ) {
					timeoutTimer && clearTimeout( timeoutTimer );
					script[ STR_ON_READY_STATE_CHANGE ] = script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = null;
					head[ STR_REMOVE_CHILD ]( script );
					scriptAfter && head[ STR_REMOVE_CHILD ]( scriptAfter );
				};
	
				// Append main script
				head[ STR_INSERT_BEFORE ]( script , ( firstChild = head.firstChild ) );
	
				// Append trailing script if needed
				scriptAfter && head[ STR_INSERT_BEFORE ]( scriptAfter , firstChild );
	
				// If a timeout is needed, install it
				timeoutTimer = timeout > 0 && setTimeout( function() {
					notifyError( STR_TIMEOUT );
				} , timeout );
	
			}
	
			return xOptions;
		}
	
		// ###################### SETUP FUNCTION ##
		jsonp.setup = function( xOptions ) {
			$.extend( xOptionsDefaults , xOptions );
		};
	
		// ###################### INSTALL in jQuery ##
		$.jsonp = jsonp;
	
	} )( jQuery );


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/integral-top',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$out+='<div class="top-site"> <div class="site">  <div class="welcome-presence fl"> <div class="welcome fl">您好，欢迎光临御廷家居！</div> <div class="site-loged fl"> <span class="loging">[ 登录 ]</span> <span class="register">[ 注册 ]</span> </div> </div>  <div class="site-loging-success fr"> <ul class="clearfix"> <li class="my-order"><i class="order"></i><a>我的订单</a></li> <li class="my-car"><i class="cart"></i><a>购物车</a></li> <li class="mu-info"><i class="user"></i><a>用户管理</a></li> </ul> </div> </div> </div> <div class="topCon"> <div class="top-logo clearfix"> <div class="logo fl"> <img src="../../bundle/img/logo.png"> </div> <div class="search fl"> <input type="text" class="search-name fl"> <span class="search-btn fr">搜 索</span> <img src="../../bundle/img/icon-search.png" class="search-icon"> <img src="../../bundle/img/icon-yuyin.png" class="yuyin-icon"> <ul class="search-hot"></ul> </div> </div> <div class="all-nav clearfix"> <div class="all-classify fl">全部商品分类</div> <ul class="nav-classify fl"> ';
	$each($data,function($value,$index){
	$out+=' <li data-num="';
	$out+=$escape($value.number);
	$out+='" data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> </div> <div class="all-list"> <ul class="all_list"></ul> <div class="more-categories"> <span>更多分类</span>  <div class="more-fen clearfix"></div> </div> </div> </div>';
	return new String($out);
	});

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	/*TMODJS:{}*/
	!function () {
		function a(a, b) {
			return (/string|function/.test(typeof b) ? h : g)(a, b)
		}
	
		function b(a, c) {
			return "string" != typeof a && (c = typeof a, "number" === c ? a += "" : a = "function" === c ? b(a.call(a)) : ""), a
		}
	
		function c(a) {
			return l[a]
		}
	
		function d(a) {
			return b(a).replace(/&(?![\w#]+;)|[<>"']/g, c)
		}
	
		function e(a, b) {
			if (m(a))for (var c = 0, d = a.length; d > c; c++)b.call(a, a[c], c, a); else for (c in a)b.call(a, a[c], c)
		}
	
		function f(a, b) {
			var c = /(\/)[^\/]+\1\.\.\1/, d = ("./" + a).replace(/[^\/]+$/, ""), e = d + b;
			for (e = e.replace(/\/\.\//g, "/"); e.match(c);)e = e.replace(c, "/");
			return e
		}
	
		function g(b, c) {
			var d = a.get(b) || i({filename: b, name: "Render Error", message: "Template not found"});
			return c ? d(c) : d
		}
	
		function h(a, b) {
			if ("string" == typeof b) {
				var c = b;
				b = function () {
					return new k(c)
				}
			}
			var d = j[a] = function (c) {
				try {
					return new b(c, a) + ""
				} catch (d) {
					return i(d)()
				}
			};
			return d.prototype = b.prototype = n, d.toString = function () {
				return b + ""
			}, d
		}
	
		function i(a) {
			var b = "{Template Error}", c = a.stack || "";
			if (c)c = c.split("\n").slice(0, 2).join("\n"); else for (var d in a)c += "<" + d + ">\n" + a[d] + "\n\n";
			return function () {
				return "object" == typeof console && console.error(b + "\n\n" + c), b
			}
		}
	
		var j = a.cache = {}, k = this.String, l = {
			"<": "&#60;",
			">": "&#62;",
			'"': "&#34;",
			"'": "&#39;",
			"&": "&#38;"
		}, m = Array.isArray || function (a) {
				return "[object Array]" === {}.toString.call(a)
			}, n = a.utils = {
			$helpers: {}, $include: function (a, b, c) {
				return a = f(c, a), g(a, b)
			}, $string: b, $escape: d, $each: e
		}, o = a.helpers = n.$helpers;
		a.get = function (a) {
			return j[a.replace(/^\.\//, "")]
		}, a.helper = function (a, b) {
			o[a] = b
		}, module.exports = a
	}();

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/type-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='"> <div class="list-title">• ';
	$out+=$escape($value.name);
	$out+='</div> <ul class="list-hot clearfix"> ';
	$each($value.child,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> <div class="classif-detail"> <ul class="more-list clearfix"> ';
	$each($value.child,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> </div> </li> ';
	});
	return new String($out);
	});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/hot-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	return new String($out);
	});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/more-fen',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <ul class="more-list clearfix" data-id="';
	$out+=$escape($value.id);
	$out+='"> <div class="more-title">';
	$out+=$escape($value.name);
	$out+='</div> </ul> ';
	});
	return new String($out);
	});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/integral-bottom','<div class="return-top"></div> <div class="bottomCon clearfix"> <ul class="foot-nav gouwu fl clearfix"> <div>购物指南</div> <li> <a href="javascript:void(0);">购物流程</a> </li> <li> <a href="javascript:void(0);">会员介绍</a> </li> <li> <a href="javascript:void(0);">团购/机票</a> </li> <li> <a href="javascript:void(0);">常见问题</a> </li> <li> <a href="javascript:void(0);">联系客服</a> </li> </ul> <ul class="foot-nav peisong fl clearfix"> <div>配送方式</div> <li> <a href="javascript:void(0);">上门自提</a> </li> <li> <a href="javascript:void(0);">211限时达</a> </li> <li> <a href="javascript:void(0);">配送服务查询</a> </li> <li> <a href="javascript:void(0);">配送费收取标准</a> </li> <li> <a href="javascript:void(0);">海外配送</a> </li> </ul> <ul class="foot-nav zhifu fl clearfix"> <div>支付方式</div> <li> <a href="javascript:void(0);">货到付款</a> </li> <li> <a href="javascript:void(0);">在线支付</a> </li> <li> <a href="javascript:void(0);">分期付款</a> </li> <li> <a href="javascript:void(0);">邮局汇款</a> </li> <li> <a href="javascript:void(0);">公司转账</a> </li> </ul> <ul class="foot-nav shouhou fl clearfix"> <div>售后服务</div> <li> <a href="javascript:void(0);">售后政策</a> </li> <li> <a href="javascript:void(0);">价格保护</a> </li> <li> <a href="javascript:void(0);">退款说明</a> </li> <li> <a href="javascript:void(0);">返修/退换货</a> </li> <li> <a href="javascript:void(0);">取消订单</a> </li> </ul> </div>');

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	_id = 0;
	var SHOW_POP_TYPE_SUCCESS = 0;
	var SHOW_POP_TYPE_FAIL = 1;
	var SHOW_POP_TYPE_WARNING = 2;
	module.exports = {
	    ajax:function(url, params, method, success, err) {
	        $.ajax({
	            url: url,
	            data: params,
	            type: method,
	            dataType: 'json',
	            success: function (data) {
	                success && success(data);
	            },
	            error: function (e) {
	                console.log(e);
	                err && err(e);
	            }
	        });
	    },
	    forEach: function (array, callback, scope) {
	        scope = scope || null;
	        array = array == null ? [] : array;
	        array = [].slice.call(array);//将array对象转化为数组,array不一定是个数组
	        if (!(array instanceof Array)) {
	            //console.log('array is not a Array!!!');
	            return;
	        }
	        for (var i = 0, len = array.length; i < len; i++) {
	            if (!callback.call(scope, array[i], i)) {//array[i],maps[i],
	                continue;
	            } else {
	                break;
	            }
	        }
	    },
	    /**
	     * url参数获取接口，经过decodeURI，如果没有传递key值，则返回当前页面的所有参数，如果有key返回key对应的内容，
	     * 如果key没有对应的内容，则返回空字符串
	     * @param key
	     * @returns {*}
	     */
	    getParams: function (key) {
	        var paramsStr = location.href.indexOf('#') > 0 ? location.href.substring(location.href.indexOf("#") + 1, location.href.length) : '';
	        //获取所有的#即以前的？后面的值，相当于location.search
	        var maps, paramsObj = {};
	        if (paramsStr === '') {
	            return '';
	        }
	        paramsStr = decodeURI(paramsStr);//解码的paramStr
	        maps = paramsStr.split('&');//将&之前的字符串都放入数组里面
	        this.forEach(maps, function (item) {//循环数组,arguments[0]
	            var paramList = item.split('=');//item为maps[i]
	            if (paramList.length < 2 && paramList[0] == '') {
	                return;
	            }
	            paramsObj[paramList[0]] = paramList[1];
	        });
	        if (key) {//如果key有值得话
	            return paramsObj[key] || '';//则返回对象里可以属性的值否则返回空
	        } else {
	            return paramsObj;//如果key传过来的是没有的话，即什么都没传的话则返回paramsObj的对象
	        }
	    },
	    getQueryString:function(name) {
	        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	        var r = window.location.search.substr(1).match(reg);
	        if (r!=null) return (r[2]); return null;
	    },
	    addEvent: function (el, type, callback) {
	        if (document.attachEvent) {//如果页面文档中存在attachEvent方法
	            el.attachEvent('on' + type, function () {
	                //console.log(arguments);
	                var params = [].slice.call(arguments, 0);
	                params.splice(0, 0, window.event);
	                callback.apply(el, params);
	            });
	        } else {
	            el.addEventListener(type, function (e) {
	                callback.apply(el, arguments);
	            }, false);
	        }
	    },
	    //是否是IE678
	    isIE678: function () {
	        return ('a~b'.split(/(~)/))[1] == "b";
	    },
	    //去空格
	    trimAll: function (str) {
	        return str.replace(/ +/g, '');
	    },
	    trimBlank:function(params){
	        //form表单序列化之后去前后空格
	        params= decodeURIComponent(params).split('&');
	        for(var i = 0;i<params.length;i++){
	            var param = params[i].split('=');
	            param[1]= param[1].replace(/(^\+*)|(\+*$)|(^\s*)|(\s*$)/g,'');
	            params[i] = param.join('=');
	        }
	        return params.join('&');
	    },
	    //验证联系方式 手机号 座机
	    check_phone:function(phone){
	        var reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
	        return reg.test(phone);
	    },
	    //验证英文名
	    check_english:function(en){
	        var reg = /^[a-zA-Z]+(\s*[a-zA-Z]+){0,}$/;
	        return reg.test(en);
	    },
	    //验证邮箱
	    check_email:function(email){
	        var reg =  /^\w+@\w+\.\w+$/;
	        return reg.test(email);
	    },
	    //只能含验证数字和.
	    check_numdot:function(val){
	        var reg =  /^\d+(?:\.\d{1,2})?$/;
	        return reg.test(val);
	    },
	    SHOW_POP_TYPE_SUCCESS: SHOW_POP_TYPE_SUCCESS,
	    SHOW_POP_TYPE_FAIL: SHOW_POP_TYPE_FAIL,
	    SHOW_POP_TYPE_WARNING: SHOW_POP_TYPE_WARNING,
	    /**
	     * 显示提示信息（要求每个要显示的页面都要有pop-mask div），
	     * 警示图片命名使用格式show-pop0.png代表sucess，show-pop1.png代表fail，跟上边的参数定义一致
	     * @param title 顶部显示框的标题
	     * @param message 内容值
	     * @param type 警示图片的类型，通过util.js返回对象获取，不写默认是success
	     */
	    showMsgInfo: function (title, message, type) {
	        type = type ? type : SHOW_POP_TYPE_SUCCESS;
	        var msgInfoId = 'msg-pop-' + _id++;
	        var data = {
	            title: title,
	            message: message,
	            msgInfoId: msgInfoId,
	            type: type
	        };
	        //   $("body").append(template('warning-box/warning-box-templ', data));
	        //关闭图标跟取消的点击事件封装，但是确认的就自己写
	        $("#" + msgInfoId + " .cancel,#" + msgInfoId + " .close-box").click(function () {
	            $('#' + msgInfoId).hide();
	            $(".pop-mask").hide();
	        });
	        return function () {
	            $('#' + msgInfoId).show();
	            $(".pop-mask").show();
	        };
	    },
	    apertInfo: function (title, message) {
	        var popup = "pop-up-div";
	        $(".pop-mask").show();
	        $("#"+popup).show();
	        $(".head").find("h1").html(title);
	        $(".pop-content").html(message);
	        $("#"+popup).find(".close").click(function(){
	            $('#' + popup).hide();
	            $(".pop-mask").hide();
	        });
	
	
	    },
	    closePop:function(popup){
	        $('#' + popup).hide();
	        $(".pop-mask").hide();
	    },
	    //根据阿拉伯数字生成中文数字
	    coverNum: function (number) {
	        if (isNaN(number - 0)) {
	            throw new Error('arg is not a number');
	        } else if (number.length > 12) {
	            throw new Error('arg is too big');
	        }
	        var a = (number + '').split(''),
	            s = [],
	            t = this,
	            chars = '零一二三四五六七八九',
	            units = '个十百千万@#%亿^&~';
	        for (var i = 0, j = a.length - 1; i <= j; i++) {
	            if (j == 1 || j == 5 || j == 9) {//两位数 处理特殊的 1*
	                if (i == 0) {
	                    if (a[i] != '1') s.push(chars.charAt(a[i]));
	                } else {
	                    s.push(chars.charAt(a[i]));
	                }
	            } else {
	                s.push(chars.charAt(a[i]));
	            }
	            if (i != j) {
	                s.push(units.charAt(j - i));
	            }
	        }
	        //return s;
	        return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) {//优先处理 零百 零千 等
	            b = units.indexOf(d);
	            if (b != -1) {
	                if (d == '亿') return d;
	                if (d == '万')return d;
	                if (a[j - b] == '0') return '零';
	            }
	            return '';
	        }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) {// 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
	            return b;
	        }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
	            return {'@': '十', '#': '百', '%': '千', '^': '十', '&': '百', '~': '千'}[m];
	        }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
	            c = units.indexOf(d);
	            if (c != -1) {
	                if (a[j - c] == '0') return d + '零' + b;
	            }
	            return m;
	        });
	    },
	    //计算echart title 高度
	    eHeight: function (array) {
	        array = [].slice.call(array);//将array对象转化为数组,array不一定是个数组
	        if (!(array instanceof Array)) {
	            return;
	        }
	        var StringPx = array.join('').length * 14;
	        var elsePL = array.length * (20 + 10);
	        var YHeight = Math.ceil((StringPx + elsePL) / 850) * 24 + 10;//向上修正10像素
	        return YHeight < 60 ? 60 : YHeight;
	    },
	    //转换时间格式
	    getTime: function (date, format) {
	        date = new Date(date * 1000);
	
	        var map = {
	            "M": date.getMonth() + 1, //月份
	            "d": date.getDate(), //日
	            "h": date.getHours(), //小时
	            "m": date.getMinutes(), //分
	            "s": date.getSeconds(), //秒
	            "q": Math.floor((date.getMonth() + 3) / 3), //季度
	            "S": date.getMilliseconds() //毫秒
	        };
	        format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
	            var v = map[t];
	            if (v !== undefined) {
	                if (all.length > 1) {
	                    v = '0' + v;
	                    v = v.substr(v.length - 2);
	                }
	                return v;
	            }
	            else if (t === 'y') {
	                return (date.getFullYear() + '').substr(4 - all.length);
	            }
	            return all;
	        });
	        return format;
	    },
	    getBrowser: function () {
	        var Sys = {};
	        var ua = navigator.userAgent.toLowerCase();
	        var s;
	        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
	            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
	                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
	                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
	                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
	                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	
	        if (Sys.ie) {
	            return 'ie'
	        }
	        if (Sys.firefox) {
	            return 'firefox'
	        }
	        if (Sys.chrome) {
	            return 'chrome'
	        }
	        if (Sys.opera) {
	            return 'opera'
	        }
	        if (Sys.safari) {
	            return 'safari'
	        }
	    },
	    //计算显示字符串的长度
	    strDisplayformat: function (string, maxLength) {
	        var num = 0;
	        var STR_NUMBER = maxLength ? maxLength : 30;
	        var pat = new RegExp('[0-9a-zA-Z-]');
	        for (var i = 0; i < (string.length > STR_NUMBER ? STR_NUMBER : string.length); i++) {
	            if (pat.test(string[i])) {
	                num++;
	            } else {
	                num += 2;
	            }
	            if (num > STR_NUMBER) {
	                return string.substring(0, i) + '...';
	            }
	        }
	        return string;
	    },
	    //根据中文数字生成阿拉伯数字
	    toNum:function(str){
	        if(typeof(str) !=="string"){
	            throw new Error('str is not a string');
	        }
	        var charts = {
	            "一":1,
	            "二":2,
	            "三":3,
	            "四":4,
	            "五":5,
	            "六":6,
	            "七":7,
	            "八":8,
	            "九":9
	        };
	        var nums =[];
	
	        if(str.length ==1){
	            return charts[str];
	        }
	        for(var i = 0;i<str.length;i++) {
	            if(str[i] == "十"){
	                nums.push("十");
	            }else{
	                nums.push(charts[str[i]]);
	            }
	        }
	        for(var i = 0,j=nums.length-1;i<=j;i++){
	            if(nums[i] =="十"){
	                nums[i] = (i == 0 && 1) ||( i==j && '0') || '';
	            }
	        }
	        return nums.join("")-0;
	
	    },
	    //不同年级不同班的排序
	    sortgrade:function(data){
	        if(data.length<=1){
	            return data;
	        }
	        var req = /[一二三四五六七八九十]+/g;
	
	        var resultGrades = [];
	
	        var grades={};//{[1:[]]}
	        for(var i = 0; i<data.length;i++){
	            var gradeNum = this.toNum(data[i].classesName.match(req)[0]);
	            if(!grades[gradeNum]){
	                grades[gradeNum] =[];
	            }
	            grades[gradeNum].push(data[i]);
	        }
	        for( var ii in grades){
	            resultGrades =resultGrades.concat(this.sortClass(grades[ii]));
	        }
	        return resultGrades;
	    },
	    //根据同年级不同班级排序
	    sortClass:function(data){
	        if(data.length<=1){
	            return data;
	        }
	        var toIndex = Math.floor(data.length/2);
	        var toNum = data[toIndex].classesName.match(/\d+/g)[0]-0;
	        var leftClass= [],rightClass = [];
	        for(var i = 0; i<data.length;i++){
	            //model.userData.classes[i].classNum = data[i].classesName.match(/\d+/g)[0]-0;
	            if(i ==toIndex){
	                continue;
	            }
	            if(toNum >data[i].classesName.match(/\d+/g)[0]-0){
	                leftClass.push(data[i]);
	            }else{
	                rightClass.push(data[i]);
	            }
	        }
	        return	 this.sortClass(leftClass).concat( data[toIndex],this.sortClass(rightClass));
	    }
	
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by hui on 2016/12/28 0028.
	 */
	var  noDataTpl=__webpack_require__(19);
	/*
	* data 没有数据需要填写的提示内容
	* */
	module.exports=function(data){
	   return noDataTpl(data);
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/no-data/no-data',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$escape=$utils.$escape,content=$data.content,$out='';$out+='<div class="no-data"> <div class="no-img"></div> <div class="cont">';
	$out+=$escape(content);
	$out+='</div> </div>';
	return new String($out);
	});

/***/ }),
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function(useSourceMap) {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			return this.map(function (item) {
				var content = cssWithMappingToString(item, useSourceMap);
				if(item[2]) {
					return "@media " + item[2] + "{" + content + "}";
				} else {
					return content;
				}
			}).join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};
	
	function cssWithMappingToString(item, useSourceMap) {
		var content = item[1] || '';
		var cssMapping = item[3];
		if (!cssMapping) {
			return content;
		}
	
		if (useSourceMap && typeof btoa === 'function') {
			var sourceMapping = toComment(cssMapping);
			var sourceURLs = cssMapping.sources.map(function (source) {
				return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
			});
	
			return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
		}
	
		return [content].join('\n');
	}
	
	// Adapted from convert-source-map (MIT)
	function toComment(sourceMap) {
		// eslint-disable-next-line no-undef
		var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
		var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
	
		return '/*# ' + data + ' */';
	}


/***/ }),
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }),
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/hot-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li class="fl clearfix" data-id="';
	$out+=$escape($value.id);
	$out+='"> <img class="fl" src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <div class="hot-detail fr"> <span>';
	$out+=$escape($value.name);
	$out+='</span> <b>特价：<i>￥';
	$out+=$escape($value.price);
	$out+='.00</i></b> <p class="now-buy">立即抢购</p> </div> </li> ';
	});
	return new String($out);
	});

/***/ }),
/* 38 */,
/* 39 */,
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	
	var ajax = __webpack_require__(3);
	var header = __webpack_require__(9);
	var noData = __webpack_require__(18);
	var pager = __webpack_require__(41);
	var util = __webpack_require__(17);
	var utils = __webpack_require__(45);
	
	var commodityList = __webpack_require__(46);
	var choiceList = __webpack_require__(47);
	var leftlist = __webpack_require__(48);
	var hotlist = __webpack_require__(37);
	var typelist = __webpack_require__(49);
	
	var commodity = {
	    flag: null,
	    flaG: null,
	    parentId: null,
	    parentID: null,
		pageNumber: '1',
	    bnum: null,
	    orderField: '',
	    orderDesc: 'asc',
	    searchName: '',
	    accountId: null,
		init: function(){
			var me = this;
			header.init(function(){});
	        var urlSearch = window.location.search;
	        /*me.flaG = urlSearch.split('=')[1];
	        me.parentID = urlSearch.split('=')[2];
	        me.bnum = urlSearch.split('=')[3];*/
	        me.flaG = utils.getParams('flag');
	        me.parentID = utils.getParams('parentId');
	        me.bnum = utils.getParams('bnum');
	
	        me.bnum = util.getParams('bnum');
	        me.searchName = util.getParams('name');
	        me.flag = util.getParams('flag');
	        me.parentId = util.getParams('parentId');
	        var storage = window.sessionStorage;
	        me.accountId = storage["id"];
	        $('.all-list').hide();
	        me.clickEven();
	        me.getList();
	        me.choiceGood();
	        me.leftList();
	        me.hotList();
	        me.allType();
		},
		getList: function(){
			var me = this;
			ajax({
	            url: '/eshop/product/query',
	            type: 'post',
	            data: {
	                typeId: me.parentId || me.parentID,
	                name: me.searchName,
	                orderField: me.orderField,
	                orderDesc: me.orderDesc,
	                bnum: me.bnum,
	            	pageSize: '20',
	            	curPageNumber: me.pageNumber
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('.commodity-right-list').html(commodityList(list.list));
	                pager.init($("#page"), me.pageNumber, list.pager.totalPage, function (curPgNum) {
	                    me.pageNumber = curPgNum;
	                    me.getList();
	                });
	            }
	        });
		},
	    leftList: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/activity/list',
	            type: 'post',
	            data: {
	                nos: 'ATC2017111921080682291'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('.commodity-left').html(leftlist(list[0].items));
	            }
	        });
	    },
	    // 精选商品
	    choiceGood: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/activity/list',
	            type: 'post',
	            data: {
	                nos: 'ATC2017111921141850052'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                $('.choice-list').html(choiceList(list[0].items));
	                $('.choice-list>div:gt(4)').remove();
	            }
	        });
	    },
	    // 热销排行榜
	    hotList: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/activity/list',
	            type: 'post',
	            data:{
	                nos: 'ATC2017111921025791892'
	            }
	        }).then(function(data){
	            // console.log(data);
	            if(data.status == 200){
	                var respon = data.result;
	                $('.hot-list').html(hotlist(respon[0].items));
	                $('.hot-list li:gt(3)').remove();
	            }
	        });
	    },
	    // 分类名称
	    allType: function(){
	        var me = this;
	        ajax({
	            url: '/eshop/type/all',
	            type: 'get',
	            data:{
	                accountId: me.accountId,
	                level: '2'
	            }
	        }).then(function(data){
	            if(data.status == 200){
	                var list = data.result;
	                //console.log(list);
	                $('.type-list ul').html(typelist(list));
	                if(me.flag != null && me.flag != ''){
	                    $('.type-list .type-name').html("<span class='deletePar'>" + me.flag + "：&nbsp;&nbsp;</span>");
	                    ajax({
	                        url: '/eshop/type/childs',
	                        type: 'get',
	                        data:{
	                            id: me.parentId || me.parentID
	                        }
	                    }).then(function(json){
	                        if(json.status == 200){
	                            var lists = json.result;
	                            $('.type-list ul').html(typelist(lists));
	                        }
	                    });
	                }
	            }
	        });
	    },
		clickEven: function(){
			var me = this;
	        $('body').on('click', '.type-list ul li', function(){
	            if($('.type-name').html() == "分类名称："){
	                $('.type-list .type-name').html("<span class='deletePar'>" + $(this).html() + "：&nbsp;&nbsp;</span>");
	                me.parentId = $(this).attr('data-id');
	                ajax({
	                    url: '/eshop/type/childs',
	                    type: 'get',
	                    data:{
	                        id: me.parentId
	                    }
	                }).then(function(json){
	                    if(json.status == 200){
	                        var lists = json.result;
	                        $('.type-list ul').html(typelist(lists));
	                    }
	                });
	                me.getList();
	            } else {
	                me.parentId = $(this).attr('data-id');
	                $(this).addClass('active').siblings().removeClass('active');
	                me.getList();
	            }
	        });
	        $('body').on('click', '.type-list .deletePar', function(){
	            me.parentId = '';
	            $('.type-list .type-name').html("分类名称：");
	            me.getList();
	            ajax({
	                url: '/eshop/type/all',
	                type: 'get',
	                data:{
	                    accountId: me.accountId,
	                    level: '2'
	                }
	            }).then(function(data){
	                if(data.status == 200){
	                    var list = data.result;
	                    //console.log(list);
	                    $('.type-list ul').html(typelist(list));
	                }
	            });
	        });
	
			$('body').on('click', '.commodity-right-list .right-list', function(){
				var id = $(this).attr('data-id');
				location.href = '../commodity-base/commodity-detail.html#id=' + id;
			});
	        $('.commodity-right-nav p').on('click', function(){
	            $(this).addClass('active').siblings().removeClass('active');
	            me.orderField = $(this).attr('data-category');
	            me.getList();
	        });
	        $('body').on('click', '.hot-list li', function(){
	            var id = $(this).attr('data-id');
	            location.href = '../commodity-base/commodity-detail.html#id=' + id;
	        });
	        $('body').on('click', '.commodity-left>div', function(){
	            var id = $(this).attr('data-id');
	            location.href = '../commodity-base/commodity-detail.html#id=' + id;
	        });
	        $('body').on('click', '.choice-list>div', function(){
	            var id = $(this).attr('data-id');
	            location.href = '../commodity-base/commodity-detail.html#id=' + id;
	        });
		}
	}
	
	commodity.init()

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by hui on 2016/12/9 0009.
	 */
	var pageVTpl = __webpack_require__(42);
	var util = __webpack_require__(17);
	__webpack_require__(43)
	//初始化
	var DEFAULT_NUM = 1, POINT = '...', PREV = '-', NEXT = '+';
	//存放element对象的数组
	var eleObj = [];
	/*
	 * 分页对象
	 * */
	function pageBreak(element, currentPageNum, pageCount, callback, scope) {
	    this.isClick = false;
	    this.ele = element;
	    this.currentPN = currentPageNum || DEFAULT_NUM;
	    this.pageCN = pageCount || 1;
	    this._callback = callback;
	    this._scope = scope || null;
	}
	pageBreak.prototype = {
	    init: function () {
	        var self = this;
	        self.renderTemplate();
	        if (!self.isClick) {
	            self.initBtn();
	        }
	        self.isClick = true;
	    },
	    renderTemplate: function () {
	        var self = this;
	        var pagedata = {
	            data: [],
	            pre: PREV,
	            next: NEXT
	        };
	        if (self.pageCN <= 6) {
	            for (var i = 1; i <= self.pageCN; i++) {
	                pagedata.data.push(i);
	            }
	        } else {
	            if (self.currentPN >= 1 && self.currentPN < 5) {
	                pagedata.data.push(1, 2, 3, 4, 5, POINT, self.pageCN);
	            } else if (self.currentPN >= 5 && (self.pageCN - self.currentPN) + 1 < 5) {
	                pagedata.data.push(1, POINT, self.pageCN - 4, self.pageCN - 3, self.pageCN - 2, self.pageCN - 1, self.pageCN);
	            } else if (self.currentPN >= 5 && (self.pageCN - self.currentPN) + 1 >= 5) {
	                pagedata.data.push(1, POINT, self.currentPN - 1, self.currentPN, self.currentPN + 1, POINT, self.pageCN)
	            }
	        }
	        self.ele.html(pageVTpl(pagedata));
	        self.setClass();
	    },
	    setClass: function () {
	        var self = this;
	        self.ele.find('.page a').each(function () {
	            if ($(this).attr("data-num") == self.currentPN) {
	                $(this).addClass("blueBg");
	            } else if ($(this).attr("data-num") == POINT) {
	                $(this).addClass("ellipsis");
	            }
	        });
	    },
	    setOwnProperty: function (currentPageNum, pageCount, callback, scope) {
	        this.currentPN = currentPageNum || DEFAULT_NUM;
	        this.pageCN = pageCount || 1;
	        this._callback = callback;
	        this._scope = scope || null;
	    },
	    initBtn: function () {
	        var self = this;
	        self.ele.delegate('.page a', 'click', function () {
	            if ($(this).attr("data-num") == PREV) {
	                if (!!--self.currentPN) {
	                    //执行回调函数
	                    if (!!self._callback) {
	                        self._callback.call(self._scope, self.currentPN);//将当前的页号传递给后台
	                    }
	                } else {
	                    self.currentPN = 1;
	                }
	            } else if ($(this).attr("data-num") == NEXT) {
	                if (++self.currentPN <= self.pageCN) {
	                    self._callback.call(self._scope, self.currentPN);//将当前的页号传递给后台
	                } else {
	                    self.currentPN = self.pageCN;
	                }
	            } else if (typeof ($(this).attr("data-num") - 0) == "number") {
	                self.currentPN = Number($(this).attr("data-num"));
	                self._callback.call(self._scope, self.currentPN);//将当前的页号传递给后台
	            }
	        });
	        self.ele.delegate('.page .jump', 'click', function () {
	            self._callback.call(self._scope, parseInt($(this).prev('input').val()));//将当前的页号传递给后台
	        });
	    }
	};
	
	/*
	 * currentPageNum传递的当前页码
	 * pageCount =totalCount/pageSize 页数
	 * element 分页对象
	 * callback回调函数
	 * scope 作用域
	 * */
	module.exports = {
	    init: function (element, currentPageNum, pageCount, callback, scope) {
	        var page, isNewPage = false;
	        currentPageNum = (currentPageNum - pageCount > 0 ? pageCount : currentPageNum);//这个是在删除的时候考虑的
	        util.forEach(eleObj, function (item) {
	            if (item) {
	                if (item.key == element.attr("id")) {
	                    page = item.value;
	                    page.setOwnProperty(currentPageNum, pageCount, callback, scope);
	                    isNewPage = true;
	                }
	            }
	        });
	        if (!isNewPage) {
	            var obj = {
	                key: element.attr("id"),
	                value: new pageBreak(element, currentPageNum, pageCount, callback, scope)
	            };
	            page = obj.value;
	            eleObj.push(obj);
	        }
	        return page.init();
	    }
	};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/page-break/tpl/page-break',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$escape=$utils.$escape,pre=$data.pre,$each=$utils.$each,data=$data.data,$value=$data.$value,$index=$data.$index,next=$data.next,$out='';$out+='<div class="page"> <a href="javascript:void(0);" data-num=';
	$out+=$escape(pre);
	$out+='><</a> ';
	$each(data,function($value,$index){
	$out+=' <a href="javascript:void(0);" data-num=';
	$out+=$escape($value);
	$out+='>';
	$out+=$escape($value);
	$out+='</a> ';
	});
	$out+=' <a href="javascript:void(0);" data-num=';
	$out+=$escape(next);
	$out+='>></a> <span class="appoint"> 跳至 <input type="text" value="1"> 页 <a class="jump" href="javascript:void(0);">跳转</a> </span> </div>';
	return new String($out);
	});

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(44);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(29)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./page-break.less", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./page-break.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(24)(undefined);
	// imports
	
	
	// module
	exports.push([module.id, "/*页码*/\n.page {\n  overflow: hidden;\n  text-align: center;\n  margin: 40px 10px 0 0;\n  padding-bottom: 20px;\n}\n.page a {\n  display: inline-block;\n  width: 30px;\n  height: 30px;\n  border: 1px solid #e8e8e8;\n  background-color: #fff;\n  text-align: center;\n  line-height: 30px;\n  margin: 0 3px;\n  font-size: 12px;\n  color: #666;\n  cursor: pointer;\n}\n.page a:hover {\n  border: 1px solid #f00;\n}\na.blueBg {\n  border: 1px solid #f00;\n}\na.ellipsis {\n  border: none;\n  background: none;\n  color: #c0c4cb;\n  padding-top: 6px;\n  margin: 0;\n}\na.ellipsis:hover {\n  background: none;\n  border: none;\n}\n.page input {\n  width: 30px;\n  height: 30px;\n  text-align: center;\n  border: 1px solid #e8e8e8;\n}\n", ""]);
	
	// exports


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by lsc on 2014/12/7.
	 */
	var $ = __webpack_require__(2);
	_id = 0;
	var SHOW_POP_TYPE_SUCCESS = 0;
	var SHOW_POP_TYPE_FAIL = 1;
	var SHOW_POP_TYPE_WARNING = 2;
	module.exports = {
	    forEach: function (array, callback, scope) {
	        scope = scope || null;
	        array = [].slice.call(array);//将array对象转化为数组,array不一定是个数组
	        if (!(array instanceof Array)) {
	            //console.log('array is not a Array!!!');
	            return;
	        }
	        for (var i = 0, len = array.length; i < len; i++) {
	            if (!callback.call(scope, array[i], i)) {//array[i],maps[i],
	                continue;
	            } else {
	                break;
	            }
	        }
	    },
	    /**
	     * url参数获取接口，经过decodeURI，如果没有传递key值，则返回当前页面的所有参数，如果有key返回key对应的内容，
	     * 如果key没有对应的内容，则返回空字符串
	     * @param key
	     * @returns {*}
	     */
	    getParams: function (key) {
	        var paramsStr = location.href.indexOf('?') > 0 ? location.href.substring(location.href.indexOf("?") + 1, location.href.length) : '';
	        //获取所有的#即以前的？后面的值，相当于location.search
	        var maps, paramsObj = {};
	        if (paramsStr === '') {
	            return '';
	        }
	        paramsStr = decodeURI(paramsStr);//解码的paramStr
	        maps = paramsStr.split('&');//将&之前的字符串都放入数组里面
	        this.forEach(maps, function (item) {//循环数组,arguments[0]
	            var paramList = item.split('=');//item为maps[i]
	            if (paramList.length < 2 && paramList[0] == '') {
	                return;
	            }
	            paramsObj[paramList[0]] = paramList[1];
	        });
	        if (key) {//如果key有值得话
	            return paramsObj[key] || '';//则返回对象里可以属性的值否则返回空
	        } else {
	            return paramsObj;//如果key传过来的是没有的话，即什么都没传的话则返回paramsObj的对象
	        }
	    },
	    getQueryString:function(name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	    var r = window.location.search.substr(1).match(reg);
	    if (r!=null) return (r[2]); return null;
	    },
	    addEvent: function (el, type, callback) {
	        if (document.attachEvent) {//如果页面文档中存在attachEvent方法
	            el.attachEvent('on' + type, function () {
	                //console.log(arguments);
	                var params = [].slice.call(arguments, 0);
	                params.splice(0, 0, window.event);
	                callback.apply(el, params);
	            });
	        } else {
	            el.addEventListener(type, function (e) {
	                callback.apply(el, arguments);
	            }, false);
	        }
	    },
	    //是否是IE678
	    isIE678: function () {
	        return ('a~b'.split(/(~)/))[1] == "b";
	    },
	    //去空格
	    trimAll: function (str) {
	        return str.replace(/ +/g, '');
	    },
	    SHOW_POP_TYPE_SUCCESS: SHOW_POP_TYPE_SUCCESS,
	    SHOW_POP_TYPE_FAIL: SHOW_POP_TYPE_FAIL,
	    SHOW_POP_TYPE_WARNING: SHOW_POP_TYPE_WARNING,
	    /**
	     * 显示提示信息（要求每个要显示的页面都要有pop-mask div），
	     * 警示图片命名使用格式show-pop0.png代表sucess，show-pop1.png代表fail，跟上边的参数定义一致
	     * @param title 顶部显示框的标题
	     * @param message 内容值
	     * @param type 警示图片的类型，通过util.js返回对象获取，不写默认是success
	     */
	    showMsgInfo: function (title, message, type) {
	        type = type ? type : SHOW_POP_TYPE_SUCCESS;
	        var msgInfoId = 'msg-pop-' + _id++;
	        var data = {
	            title: title,
	            message: message,
	            msgInfoId: msgInfoId,
	            type: type
	        };
	     //   $("body").append(template('warning-box/warning-box-templ', data));
	        //关闭图标跟取消的点击事件封装，但是确认的就自己写
	        $("#" + msgInfoId + " .cancel,#" + msgInfoId + " .close-box").click(function () {
	            $('#' + msgInfoId).hide();
	            $(".pop-mask").hide();
	        });
	        return function () {
	            $('#' + msgInfoId).show();
	            $(".pop-mask").show();
	        };
	    },
	    apertInfo: function (title, message) {
	    		var popup = "pop-up-div";
	            $(".pop-mask").show();
	    		$("#"+popup).show();
	    		$(".head").find("h1").html(title);
	    		$(".pop-content").html(message);
	    		$("#"+popup).find(".close").click(function(){
	    			$('#' + popup).hide();
		            $(".pop-mask").hide();
	    		});
	    		
	        
	    },
	    closePop:function(popup){
	    	$('#' + popup).hide();
		    $(".pop-mask").hide();
	    },
	    //根据阿拉伯数字生成中文数字
	    coverNum: function (number) {
	        if (isNaN(number - 0)) {
	            throw new Error('arg is not a number');
	        } else if (number.length > 12) {
	            throw new Error('arg is too big');
	        }
	        var a = (number + '').split(''),
	            s = [],
	            t = this,
	            chars = '零一二三四五六七八九',
	            units = '个十百千万@#%亿^&~';
	        for (var i = 0, j = a.length - 1; i <= j; i++) {
	            if (j == 1 || j == 5 || j == 9) {//两位数 处理特殊的 1*
	                if (i == 0) {
	                    if (a[i] != '1') s.push(chars.charAt(a[i]));
	                } else {
	                    s.push(chars.charAt(a[i]));
	                }
	            } else {
	                s.push(chars.charAt(a[i]));
	            }
	            if (i != j) {
	                s.push(units.charAt(j - i));
	            }
	        }
	        //return s;
	        return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) {//优先处理 零百 零千 等
	            b = units.indexOf(d);
	            if (b != -1) {
	                if (d == '亿') return d;
	                if (d == '万')return d;
	                if (a[j - b] == '0') return '零';
	            }
	            return '';
	        }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) {// 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
	            return b;
	        }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
	            return {'@': '十', '#': '百', '%': '千', '^': '十', '&': '百', '~': '千'}[m];
	        }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
	            c = units.indexOf(d);
	            if (c != -1) {
	                if (a[j - c] == '0') return d + '零' + b;
	            }
	            return m;
	        });
	    },
	    //计算echart title 高度
	    eHeight: function (array) {
	        array = [].slice.call(array);//将array对象转化为数组,array不一定是个数组
	        if (!(array instanceof Array)) {
	            return;
	        }
	        var StringPx = array.join('').length * 14;
	        var elsePL = array.length * (20 + 10);
	        var YHeight = Math.ceil((StringPx + elsePL) / 850) * 24 + 10;//向上修正10像素
	        return YHeight < 60 ? 60 : YHeight;
	    },
	    //转换时间格式
	    getTime: function (date, format) {
	        date = new Date(date * 1000);
	
	        var map = {
	            "M": date.getMonth() + 1, //月份
	            "d": date.getDate(), //日
	            "h": date.getHours(), //小时
	            "m": date.getMinutes(), //分
	            "s": date.getSeconds(), //秒
	            "q": Math.floor((date.getMonth() + 3) / 3), //季度
	            "S": date.getMilliseconds() //毫秒
	        };
	        format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
	            var v = map[t];
	            if (v !== undefined) {
	                if (all.length > 1) {
	                    v = '0' + v;
	                    v = v.substr(v.length - 2);
	                }
	                return v;
	            }
	            else if (t === 'y') {
	                return (date.getFullYear() + '').substr(4 - all.length);
	            }
	            return all;
	        });
	        return format;
	    },
	    getBrowser: function () {
	        var Sys = {};
	        var ua = navigator.userAgent.toLowerCase();
	        var s;
	        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
	            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
	                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
	                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
	                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
	                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	
	        if (Sys.ie) {
	            return 'ie'
	        }
	        if (Sys.firefox) {
	            return 'firefox'
	        }
	        if (Sys.chrome) {
	            return 'chrome'
	        }
	        if (Sys.opera) {
	            return 'opera'
	        }
	        if (Sys.safari) {
	            return 'safari'
	        }
	    },
	    //计算显示字符串的长度
	    strDisplayformat: function (string, maxLength) {
	        var num = 0;
	        var STR_NUMBER = maxLength ? maxLength : 30;
	        var pat = new RegExp('[0-9a-zA-Z-]');
	        for (var i = 0; i < (string.length > STR_NUMBER ? STR_NUMBER : string.length); i++) {
	            if (pat.test(string[i])) {
	                num++;
	            } else {
	                num += 2;
	            }
	            if (num > STR_NUMBER) {
	                return string.substring(0, i) + '...';
	            }
	        }
	        return string;
	    },
	    //根据中文数字生成阿拉伯数字
	    toNum:function(str){
	        if(typeof(str) !=="string"){
	            throw new Error('str is not a string');
	        }
	        var charts = {
	            "一":1,
	            "二":2,
	            "三":3,
	            "四":4,
	            "五":5,
	            "六":6,
	            "七":7,
	            "八":8,
	            "九":9
	        };
	        var nums =[];
	
	        if(str.length ==1){
	            return charts[str];
	        }
	        for(var i = 0;i<str.length;i++) {
	            if(str[i] == "十"){
	                nums.push("十");
	            }else{
	                nums.push(charts[str[i]]);
	            }
	        }
	        for(var i = 0,j=nums.length-1;i<=j;i++){
	            if(nums[i] =="十"){
	                nums[i] = (i == 0 && 1) ||( i==j && '0') || '';
	            }
	        }
	        return nums.join("")-0;
	
	    },
	    //不同年级不同班的排序
	    sortgrade:function(data){
	        if(data.length<=1){
	            return data;
	        }
	        var req = /[一二三四五六七八九十]+/g;
	
	        var resultGrades = [];
	
	        var grades={};//{[1:[]]}
	        for(var i = 0; i<data.length;i++){
	            var gradeNum = this.toNum(data[i].classesName.match(req)[0]);
	            if(!grades[gradeNum]){
	                grades[gradeNum] =[];
	            }
	            grades[gradeNum].push(data[i]);
	        }
	        for( var ii in grades){
	            resultGrades =resultGrades.concat(this.sortClass(grades[ii]));
	        }
	        return resultGrades;
	    },
	    //根据同年级不同班级排序
	    sortClass:function(data){
	        if(data.length<=1){
	            return data;
	        }
	        var toIndex = Math.floor(data.length/2);
	        var toNum = data[toIndex].classesName.match(/\d+/g)[0]-0;
	        var leftClass= [],rightClass = [];
	        for(var i = 0; i<data.length;i++){
	            //model.userData.classes[i].classNum = data[i].classesName.match(/\d+/g)[0]-0;
	            if(i ==toIndex){
	                continue;
	            }
	            if(toNum >data[i].classesName.match(/\d+/g)[0]-0){
	                leftClass.push(data[i]);
	            }else{
	                rightClass.push(data[i]);
	            }
	        }
	        return	 this.sortClass(leftClass).concat( data[toIndex],this.sortClass(rightClass));
	    }
	
	};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/commodity-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <div class="right-list fl" data-id=';
	$out+=$escape($value.id);
	$out+='> <img src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <p class="right-list-name">';
	$out+=$escape($value.name);
	$out+='</p> <div class="right-list-cont clearfix"> <span class="right-list-money fl">￥';
	$out+=$escape($value.price);
	$out+='</span> <span class="right-list-num fr">已售<b>';
	$out+=$escape($value.salenum);
	$out+='</b></span> </div> </div> ';
	});
	return new String($out);
	});

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/choice-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <div class="list-choice fl" data-id="';
	$out+=$escape($value.id);
	$out+='"> <img src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <p class="list-name">';
	$out+=$escape($value.name);
	$out+='</p> <div class="list-cont clearfix"> <span class="list-money fl">￥';
	$out+=$escape($value.price);
	$out+='.00</span> <span class="list-num fr"><b>';
	$out+=$escape($value.remarkNum || '0');
	$out+='</b>人评价</span> </div> </div> ';
	});
	return new String($out);
	});

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/commodity-left-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <div class="commodity-left-list" data-id="';
	$out+=$escape($value.id);
	$out+='"> <img src="';
	$out+=$escape($value.onePhoto);
	$out+='"> <p class="left-list-name">';
	$out+=$escape($value.name);
	$out+='</p> <p class="left-list-money">￥ ';
	$out+=$escape($value.price);
	$out+='.00</p> <p class="left-list-assess">已有 <b>';
	$out+=$escape($value.remarkNum || '0');
	$out+='</b> 人评价</p> </div> ';
	});
	return new String($out);
	});

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('tpl/commodity-list/type-list',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$each($data,function($value,$index){
	$out+=' <li class="fl" data-id="';
	$out+=$escape($value.id);
	$out+='"> ';
	$out+=$escape($value.name);
	$out+=' </li> ';
	});
	return new String($out);
	});

/***/ })
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCIkXCI/NTdhYSoiLCJ3ZWJwYWNrOi8vLy4vZGVwL3V0aWwvYWpheC5qcz8xNGQ3KiIsIndlYnBhY2s6Ly8vLi9+L3EvcS5qcz9iYjI3KiIsIndlYnBhY2s6Ly8vLi9+L3Byb2Nlc3MvYnJvd3Nlci5qcz84MmU0KiIsIndlYnBhY2s6Ly8vLi9+L3dlYnBhY2stc3RyZWFtL34vdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qcz80YmM2KiIsIndlYnBhY2s6Ly8vLi9+L3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanM/NGE4MCoiLCJ3ZWJwYWNrOi8vLy4vZGVwL2NvbmZpZy5qcz85ODI1KiIsIndlYnBhY2s6Ly8vLi9kZXAvaGVhZGVyLW5hdi9oZWFkZXIuanM/ZTcwMSIsIndlYnBhY2s6Ly8vLi9kZXAvanF1ZXJ5Lmpzb25wLmpzPzFhNDciLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLXRvcC50cGw/NWUwZSIsIndlYnBhY2s6Ly8vLi9+L3Rtb2Rqcy1sb2FkZXIvcnVudGltZS5qcz84OTY2KiIsIndlYnBhY2s6Ly8vLi9kZXAvaGVhZGVyLW5hdi90cGwvdHlwZS1saXN0LnRwbD83ZTBiIiwid2VicGFjazovLy8uL2RlcC9oZWFkZXItbmF2L3RwbC9ob3QtbGlzdC50cGw/YTJmMSIsIndlYnBhY2s6Ly8vLi9kZXAvaGVhZGVyLW5hdi90cGwvbW9yZS1mZW4udHBsPzU2MmEiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLWJvdHRvbS50cGw/YjQ4ZCIsIndlYnBhY2s6Ly8vLi9kZXAvdXRpbHNwYXJlL3V0aWwuanM/NDBjYyIsIndlYnBhY2s6Ly8vLi9kZXAvbm8tZGF0YS9uby1kYXRhLmpzPzc5MjYiLCJ3ZWJwYWNrOi8vLy4vZGVwL25vLWRhdGEvbm8tZGF0YS50cGw/ZGRkYyIsIndlYnBhY2s6Ly8vLi9+L2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzP2RhMDQiLCJ3ZWJwYWNrOi8vLy4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzP2I5ODAiLCJ3ZWJwYWNrOi8vLy4vdHBsL2NvbW1vZGl0eS1saXN0L2hvdC1saXN0LnRwbD84MmI1Iiwid2VicGFjazovLy8uL2pzL21haW4vY29tbW9kaXR5LWxpc3QuanMiLCJ3ZWJwYWNrOi8vLy4vZGVwL3BhZ2UtYnJlYWsvcGFnZS1icmVhay5qcyIsIndlYnBhY2s6Ly8vLi9kZXAvcGFnZS1icmVhay90cGwvcGFnZS1icmVhay50cGwiLCJ3ZWJwYWNrOi8vLy4vZGVwL3BhZ2UtYnJlYWsvcGFnZS1icmVhay5sZXNzP2Q3MjgiLCJ3ZWJwYWNrOi8vLy4vZGVwL3BhZ2UtYnJlYWsvcGFnZS1icmVhay5sZXNzIiwid2VicGFjazovLy8uL2RlcC91dGlsL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3RwbC9jb21tb2RpdHktbGlzdC9jb21tb2RpdHktbGlzdC50cGwiLCJ3ZWJwYWNrOi8vLy4vdHBsL2NvbW1vZGl0eS1saXN0L2Nob2ljZS1saXN0LnRwbCIsIndlYnBhY2s6Ly8vLi90cGwvY29tbW9kaXR5LWxpc3QvY29tbW9kaXR5LWxlZnQtbGlzdC50cGwiLCJ3ZWJwYWNrOi8vLy4vdHBsL2NvbW1vZGl0eS1saXN0L3R5cGUtbGlzdC50cGwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsb0I7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWEsYUFBYTs7QUFFMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBZ0M7QUFDaEM7QUFDQSx1Q0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7QUFDTCxHOzs7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQUs7QUFDTDtBQUNBOztBQUVBLEVBQUM7QUFDRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQSxlQUFjLGdCQUFnQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixpQkFBaUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFrQyxjQUFjLEVBQUU7QUFDbEQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQWtDLGNBQWMsRUFBRTtBQUNsRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMLGlCQUFnQjtBQUNoQixNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMLGlCQUFnQjtBQUNoQixNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEIsY0FBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBb0IsUUFBUTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckI7QUFDQTtBQUNBLDBDQUF5QyxnQ0FBZ0M7QUFDekU7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxNQUFNLHNDQUFzQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsbURBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsRUFBQzs7Ozs7Ozs7QUN4aEVEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSw0QkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNkJBQTRCLFVBQVU7Ozs7Ozs7QUN2THRDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLDBCQUF5Qjs7QUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLDZDQUE0QyxjQUFjO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsT0FBTTs7QUFFTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBLEVBQUMsRTs7Ozs7O0FDakJEO0FBQ0E7QUFDQTtBQUNBLGNBQWEsbUlBQW1JO0FBQ2hKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQSxFQUFDLEU7Ozs7OztBQ2pCRDtBQUNBO0FBQ0E7QUFDQSxjQUFhLG1JQUFtSTtBQUNoSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0EsRUFBQyxFIiwiZmlsZSI6ImNvbW1vZGl0eS1saXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiJFwiXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIDEyIDEzIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgWVUgb24gMjAxNi8yLzE4LlxyXG4gKi9cclxudmFyIFEgPSByZXF1aXJlKCdxJyk7XHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBDT05GSUc9cmVxdWlyZSgnY29uZmlnJyk7XHJcbiQuYWpheFNldHVwKHtjYWNoZTogZmFsc2V9KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0KXtcclxuICAgIHJldHVybiBRLnByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0LCBub3RpZnkpe1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcclxuICAgICAgICAgICAgZGF0YTogb3B0LmRhdGEgfHwge30sXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBvcHQuZGF0YVR5cGUgfHwgJ2pzb24nLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBvcHQuaGVhZGVycyB8fCB7fSxcclxuICAgICAgICAgICAgdHlwZTogb3B0LnR5cGUgfHwgJ2dldCcsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhLHRleHRTdGF0dXMsanFYSFIpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBqcVhIUi50aGVuO1xyXG4gICAgICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gJzQwMScpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8v5pyq55m75b2VIOaIluiAheeZu+W9lei2heaXtlxyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPUNPTkZJRy5VUkwuU1NPX0xPR0lOK1wiP3NlcnZpY2U9XCIrQ09ORklHLlVSTC5JTkRFWDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUganFYSFIudGhlbjtcclxuICAgICAgICAgICAgICAgIHJlamVjdC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC91dGlsL2FqYXguanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEgMTIgMTMiLCIvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxNyBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9ibG9iL3YxL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gUHJlZmVyIHdpbmRvdyBvdmVyIHNlbGYgZm9yIGFkZC1vbiBzY3JpcHRzLiBVc2Ugc2VsZiBmb3JcbiAgICAgICAgLy8gbm9uLXdpbmRvd2VkIGNvbnRleHRzLlxuICAgICAgICB2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHNlbGY7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBgd2luZG93YCBvYmplY3QsIHNhdmUgdGhlIHByZXZpb3VzIFEgZ2xvYmFsXG4gICAgICAgIC8vIGFuZCBpbml0aWFsaXplIFEgYXMgYSBnbG9iYWwuXG4gICAgICAgIHZhciBwcmV2aW91c1EgPSBnbG9iYWwuUTtcbiAgICAgICAgZ2xvYmFsLlEgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAgICAgLy8gQWRkIGEgbm9Db25mbGljdCBmdW5jdGlvbiBzbyBRIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICAgIC8vIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGdsb2JhbC5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnbG9iYWwuUSA9IHByZXZpb3VzUTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaXBhdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuICAgIC8vIHF1ZXVlIGZvciBsYXRlIHRhc2tzLCB1c2VkIGJ5IHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmdcbiAgICB2YXIgbGF0ZXJRdWV1ZSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuICAgICAgICB2YXIgdGFzaywgZG9tYWluO1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pO1xuXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxhdGVyUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXNrID0gbGF0ZXJRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrKTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBydW5zIGEgc2luZ2xlIGZ1bmN0aW9uIGluIHRoZSBhc3luYyBxdWV1ZVxuICAgIGZ1bmN0aW9uIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5leHRUaWNrID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgICAgICBkb21haW46IGlzTm9kZUpTICYmIHByb2Nlc3MuZG9tYWluLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIHByb2Nlc3MudG9TdHJpbmcoKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBFbnN1cmUgUSBpcyBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudCwgd2l0aCBhIGBwcm9jZXNzLm5leHRUaWNrYC5cbiAgICAgICAgLy8gVG8gc2VlIHRocm91Z2ggZmFrZSBOb2RlIGVudmlyb25tZW50czpcbiAgICAgICAgLy8gKiBNb2NoYSB0ZXN0IHJ1bm5lciAtIGV4cG9zZXMgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgXG4gICAgICAgIC8vICogQnJvd3NlcmlmeSAtIGV4cG9zZXMgYSBgcHJvY2Vzcy5uZXhUaWNrYCBmdW5jdGlvbiB0aGF0IHVzZXNcbiAgICAgICAgLy8gICBgc2V0VGltZW91dGAuIEluIHRoaXMgY2FzZSBgc2V0SW1tZWRpYXRlYCBpcyBwcmVmZXJyZWQgYmVjYXVzZVxuICAgICAgICAvLyAgICBpdCBpcyBmYXN0ZXIuIEJyb3dzZXJpZnkncyBgcHJvY2Vzcy50b1N0cmluZygpYCB5aWVsZHNcbiAgICAgICAgLy8gICBcIltvYmplY3QgT2JqZWN0XVwiLCB3aGlsZSBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudFxuICAgICAgICAvLyAgIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkcyBcIltvYmplY3QgcHJvY2Vzc11cIi5cbiAgICAgICAgaXNOb2RlSlMgPSB0cnVlO1xuXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxuICAgICAgICAvLyB3b3JraW5nIG1lc3NhZ2UgcG9ydHMgdGhlIGZpcnN0IHRpbWUgYSBwYWdlIGxvYWRzLlxuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXF1ZXN0UG9ydFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPcGVyYSByZXF1aXJlcyB1cyB0byBwcm92aWRlIGEgbWVzc2FnZSBwYXlsb2FkLCByZWdhcmRsZXNzIG9mXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICByZXF1ZXN0UG9ydFRpY2soKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBydW5zIGEgdGFzayBhZnRlciBhbGwgb3RoZXIgdGFza3MgaGF2ZSBiZWVuIHJ1blxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGZvciB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nIHRoYXQgbmVlZHMgdG8gaGFwcGVuXG4gICAgLy8gYWZ0ZXIgYWxsIGB0aGVuYGQgdGFza3MgaGF2ZSBiZWVuIHJ1bi5cbiAgICBuZXh0VGljay5ydW5BZnRlciA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIGxhdGVyUXVldWUucHVzaCh0YXNrKTtcbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgfHwgZnVuY3Rpb24gKG9iaiwgcHJvcCwgZGVzY3JpcHRvcikge1xuICAgIG9ialtwcm9wXSA9IGRlc2NyaXB0b3IudmFsdWU7XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrXG4gICAgKSB7XG4gICAgICAgIHZhciBzdGFja3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XG4gICAgICAgICAgICBpZiAocC5zdGFjayAmJiAoIWVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fIHx8IGVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fID4gcC5zdGFja0NvdW50ZXIpKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0X2RlZmluZVByb3BlcnR5KGVycm9yLCBcIl9fbWluaW11bVN0YWNrQ291bnRlcl9fXCIsIHt2YWx1ZTogcC5zdGFja0NvdW50ZXIsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcblxuICAgICAgICB2YXIgY29uY2F0ZWRTdGFja3MgPSBzdGFja3Muam9pbihcIlxcblwiICsgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgKyBcIlxcblwiKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgICAgICBvYmplY3RfZGVmaW5lUHJvcGVydHkoZXJyb3IsIFwic3RhY2tcIiwge3ZhbHVlOiBzdGFjaywgY29uZmlndXJhYmxlOiB0cnVlfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJTdGFja1N0cmluZyhzdGFja1N0cmluZykge1xuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBkZXNpcmVkTGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgaWYgKCFpc0ludGVybmFsRnJhbWUobGluZSkgJiYgIWlzTm9kZUZyYW1lKGxpbmUpICYmIGxpbmUpIHtcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgcmV0dXJuIHN0YWNrTGluZS5pbmRleE9mKFwiKG1vZHVsZS5qczpcIikgIT09IC0xIHx8XG4gICAgICAgICAgIHN0YWNrTGluZS5pbmRleE9mKFwiKG5vZGUuanM6XCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSkge1xuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXG4gICAgLy8gSW4gSUUxMCBmdW5jdGlvbiBuYW1lIGNhbiBoYXZlIHNwYWNlcyAoXCJBbm9ueW1vdXMgZnVuY3Rpb25cIikgT19vXG4gICAgdmFyIGF0dGVtcHQxID0gL2F0IC4rIFxcKCguKyk6KFxcZCspOig/OlxcZCspXFwpJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0MSkge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQxWzFdLCBOdW1iZXIoYXR0ZW1wdDFbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBBbm9ueW1vdXMgZnVuY3Rpb25zOiBcImF0IGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDIgPSAvYXQgKFteIF0rKTooXFxkKyk6KD86XFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQyKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDJbMV0sIE51bWJlcihhdHRlbXB0MlsyXSldO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggc3R5bGU6IFwiZnVuY3Rpb25AZmlsZW5hbWU6bGluZU51bWJlciBvciBAZmlsZW5hbWU6bGluZU51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQzID0gLy4qQCguKyk6KFxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mykge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQzWzFdLCBOdW1iZXIoYXR0ZW1wdDNbMl0pXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzSW50ZXJuYWxGcmFtZShzdGFja0xpbmUpIHtcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XG5cbiAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgIHZhciBsaW5lTnVtYmVyID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcbiAgICAgICAgbGluZU51bWJlciA+PSBxU3RhcnRpbmdMaW5lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPD0gcUVuZGluZ0xpbmU7XG59XG5cbi8vIGRpc2NvdmVyIG93biBmaWxlIG5hbWUgYW5kIGxpbmUgbnVtYmVyIHJhbmdlIGZvciBmaWx0ZXJpbmcgc3RhY2tcbi8vIHRyYWNlc1xuZnVuY3Rpb24gY2FwdHVyZUxpbmUoKSB7XG4gICAgaWYgKCFoYXNTdGFja3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgdmFyIGZpcnN0TGluZSA9IGxpbmVzWzBdLmluZGV4T2YoXCJAXCIpID4gMCA/IGxpbmVzWzFdIDogbGluZXNbMl07XG4gICAgICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoZmlyc3RMaW5lKTtcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHFGaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG5hbWUgKyBcIiBpcyBkZXByZWNhdGVkLCB1c2UgXCIgKyBhbHRlcm5hdGl2ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgXCIgaW5zdGVhZC5cIiwgbmV3IEVycm9yKFwiXCIpLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLy8gZW5kIG9mIHNoaW1zXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxuICogY29lcmNlcyBwcm9taXNlcyBmcm9tIGRpZmZlcmVudCBzeXN0ZW1zLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2Ugb3IgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBRKHZhbHVlKSB7XG4gICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IGEgUHJvbWlzZSwgcmV0dXJuIGl0IGRpcmVjdGx5LiAgVGhpcyBlbmFibGVzXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXG4gICAgLy8gYnV0IHRvIHRvbGVyYWJseSBjb2VyY2Ugbm9uLXByb21pc2VzIHRvIHByb21pc2VzLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGNvdW50ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHN0b3BwaW5nIHBvaW50IGZvciBidWlsZGluZ1xuICogbG9uZyBzdGFjayB0cmFjZXMuIEluIG1ha2VTdGFja1RyYWNlTG9uZyB3ZSB3YWxrIGJhY2t3YXJkcyB0aHJvdWdoXG4gKiB0aGUgbGlua2VkIGxpc3Qgb2YgcHJvbWlzZXMsIG9ubHkgc3RhY2tzIHdoaWNoIHdlcmUgY3JlYXRlZCBiZWZvcmVcbiAqIHRoZSByZWplY3Rpb24gYXJlIGNvbmNhdGVuYXRlZC5cbiAqL1xudmFyIGxvbmdTdGFja0NvdW50ZXIgPSAxO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICAgICAgcHJvbWlzZS5zdGFja0NvdW50ZXIgPSBsb25nU3RhY2tDb3VudGVyKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICAgICAgLy8gT25seSBob2xkIGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgcHJvbWlzZSBpZiBsb25nIHN0YWNrc1xuICAgICAgICAgICAgLy8gYXJlIGVuYWJsZWQgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKG1lc3NhZ2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShuZXdQcm9taXNlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xuICAgICAgICBwcm9ncmVzc0xpc3RlbmVycyA9IHZvaWQgMDtcbiAgICB9XG5cbiAgICBkZWZlcnJlZC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShRKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIGRlZmVycmVkLmZ1bGZpbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKHJlamVjdChyZWFzb24pKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvZ3Jlc3NMaXN0ZW5lcnMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb2dyZXNzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXIocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZS1zdHlsZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3QgdGhlIGRlZmVycmVkXG4gKiBwcm9taXNlLlxuICogQHJldHVybnMgYSBub2RlYmFja1xuICovXG5kZWZlci5wcm90b3R5cGUubWFrZU5vZGVSZXNvbHZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZShhcnJheV9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVzb2x2ZXIge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBub3RoaW5nIGFuZCBhY2NlcHRzXG4gKiB0aGUgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgbm90aWZ5IGZ1bmN0aW9ucyBmb3IgYSBkZWZlcnJlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcbiAqIGZ1bmN0aW9ucywgb3IgcmVqZWN0ZWQgYnkgYSB0aHJvd24gZXhjZXB0aW9uIGluIHJlc29sdmVyXG4gKi9cblEuUHJvbWlzZSA9IHByb21pc2U7IC8vIEVTNlxuUS5wcm9taXNlID0gcHJvbWlzZTtcbmZ1bmN0aW9uIHByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlc29sdmVyIG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgIH0gY2F0Y2ggKHJlYXNvbikge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbnByb21pc2UucmFjZSA9IHJhY2U7IC8vIEVTNlxucHJvbWlzZS5hbGwgPSBhbGw7IC8vIEVTNlxucHJvbWlzZS5yZWplY3QgPSByZWplY3Q7IC8vIEVTNlxucHJvbWlzZS5yZXNvbHZlID0gUTsgLy8gRVM2XG5cbi8vIFhYWCBleHBlcmltZW50YWwuICBUaGlzIG1ldGhvZCBpcyBhIHdheSB0byBkZW5vdGUgdGhhdCBhIGxvY2FsIHZhbHVlIGlzXG4vLyBzZXJpYWxpemFibGUgYW5kIHNob3VsZCBiZSBpbW1lZGlhdGVseSBkaXNwYXRjaGVkIHRvIGEgcmVtb3RlIHVwb24gcmVxdWVzdCxcbi8vIGluc3RlYWQgb2YgcGFzc2luZyBhIHJlZmVyZW5jZS5cblEucGFzc0J5Q29weSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIElmIHR3byBwcm9taXNlcyBldmVudHVhbGx5IGZ1bGZpbGwgdG8gdGhlIHNhbWUgdmFsdWUsIHByb21pc2VzIHRoYXQgdmFsdWUsXG4gKiBidXQgb3RoZXJ3aXNlIHJlamVjdHMuXG4gKiBAcGFyYW0geCB7QW55Kn1cbiAqIEBwYXJhbSB5IHtBbnkqfVxuICogQHJldHVybnMge0FueSp9IGEgcHJvbWlzZSBmb3IgeCBhbmQgeSBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYnV0IGEgcmVqZWN0aW9uXG4gKiBvdGhlcndpc2UuXG4gKlxuICovXG5RLmpvaW4gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHJldHVybiBRKHgpLmpvaW4oeSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gUShbdGhpcywgdGhhdF0pLnNwcmVhZChmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICAgICAgLy8gVE9ETzogXCI9PT1cIiBzaG91bGQgYmUgT2JqZWN0LmlzIG9yIGVxdWl2XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBTd2l0Y2ggdG8gdGhpcyBvbmNlIHdlIGNhbiBhc3N1bWUgYXQgbGVhc3QgRVM1XG4gICAgICAgIC8vIGFuc3dlclBzLmZvckVhY2goZnVuY3Rpb24gKGFuc3dlclApIHtcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gVXNlIHRoaXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgUShhbnN3ZXJQc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihRLnJhY2UpO1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUHJvbWlzZSB3aXRoIGEgcHJvbWlzZSBkZXNjcmlwdG9yIG9iamVjdCBhbmQgb3B0aW9uYWwgZmFsbGJhY2tcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXG4gKiBzZXQobmFtZSwgdmFsdWUpLCBwb3N0KG5hbWUsIGFyZ3MpLCBhbmQgZGVsZXRlKG5hbWUpLCB3aGljaCBhbGxcbiAqIHJldHVybiBlaXRoZXIgYSB2YWx1ZSwgYSBwcm9taXNlIGZvciBhIHZhbHVlLCBvciBhIHJlamVjdGlvbi4gIFRoZSBmYWxsYmFja1xuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxuICogaGF2ZSBiZWVuIGZvcndhcmRlZCB0byB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kIGFib3ZlIGhhZCBhIG1ldGhvZCBiZWVuXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBwcm9wZXIgbmFtZS4gIFRoZSBBUEkgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCB0aGUgbmF0dXJlXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcbiAqIGJvdWdodCBhbmQgc29sZC5cbiAqL1xuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XG5mdW5jdGlvbiBQcm9taXNlKGRlc2NyaXB0b3IsIGZhbGxiYWNrLCBpbnNwZWN0KSB7XG4gICAgaWYgKGZhbGxiYWNrID09PSB2b2lkIDApIHtcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiUHJvbWlzZSBkb2VzIG5vdCBzdXBwb3J0IG9wZXJhdGlvbjogXCIgKyBvcFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdGU6IFwidW5rbm93blwifTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yW29wXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFjay5jYWxsKHByb21pc2UsIG9wLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZCBgdmFsdWVPZmAgYW5kIGBleGNlcHRpb25gIHN1cHBvcnRcbiAgICBpZiAoaW5zcGVjdCkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInBlbmRpbmdcIiB8fFxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgZG9uZSA9IGZhbHNlOyAgIC8vIGVuc3VyZSB0aGUgdW50cnVzdGVkIHByb21pc2UgbWFrZXMgYXQgbW9zdCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xuXG4gICAgZnVuY3Rpb24gX2Z1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmdWxmaWxsZWQgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bGZpbGxlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0ZWQoZXhjZXB0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3RlZChleGNlcHRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdFeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvZ3Jlc3NlZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHByb2dyZXNzZWQgPT09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzZWQodmFsdWUpIDogdmFsdWU7XG4gICAgfVxuXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XG4gICAgICAgIH0sIFwid2hlblwiLCBbZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfcmVqZWN0ZWQoZXhjZXB0aW9uKSk7XG4gICAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIC8vIFByb2dyZXNzIHByb3BhZ2F0b3IgbmVlZCB0byBiZSBhdHRhY2hlZCBpbiB0aGUgY3VycmVudCB0aWNrLlxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbmV3VmFsdWU7XG4gICAgICAgIHZhciB0aHJldyA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBfcHJvZ3Jlc3NlZCh2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRocmV3KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5RLnRhcCA9IGZ1bmN0aW9uIChwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRhcChjYWxsYmFjayk7XG59O1xuXG4vKipcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cbiAqIE9yaWdpbmFsIHJlc29sdXRpb24gdmFsdWUgaXMgcGFzc2VkIHRocm91Z2ggY2FsbGJhY2sgdW5hZmZlY3RlZC5cbiAqIENhbGxiYWNrIG1heSByZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBhd2FpdGVkIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7US5Qcm9taXNlfVxuICogQGV4YW1wbGVcbiAqIGRvU29tZXRoaW5nKClcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGFwKGNvbnNvbGUubG9nKVxuICogICAudGhlbiguLi4pO1xuICovXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBvYnNlcnZlciBvbiBhIHByb21pc2UuXG4gKlxuICogR3VhcmFudGVlczpcbiAqXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICogMi4gdGhhdCBlaXRoZXIgdGhlIGZ1bGZpbGxlZCBjYWxsYmFjayBvciB0aGUgcmVqZWN0ZWQgY2FsbGJhY2sgd2lsbCBiZVxuICogICAgY2FsbGVkLCBidXQgbm90IGJvdGguXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgdG8gb2JzZXJ2ZVxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHJlamVjdGVkICAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIHJlamVjdGlvbiBleGNlcHRpb25cbiAqIEBwYXJhbSBwcm9ncmVzc2VkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcbiAqL1xuUS53aGVuID0gd2hlbjtcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbHVlOyB9KTtcbn07XG5cblEudGhlblJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyByZWFzb247IH0pO1xufTtcblxuUS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHJlYXNvbikge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZWplY3QocmVhc29uKTtcbn07XG5cbi8qKlxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxuICogSWYgYSBwcm9taXNlIGlzIHJlamVjdGVkLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZSB0b28uXG4gKiBJZiBpdOKAmXMgYSBmdWxmaWxsZWQgcHJvbWlzZSwgdGhlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5lYXJlci5cbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXG4gKiByZXNvbHV0aW9uIGlzIFwibmVhcmVyXCIuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcbiAqL1xuXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XG5RLm5lYXJlciA9IG5lYXJlcjtcbmZ1bmN0aW9uIG5lYXJlcih2YWx1ZSkge1xuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSB2YWx1ZS5pbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UuXG4gKiBPdGhlcndpc2UgaXQgaXMgYSBmdWxmaWxsZWQgdmFsdWUuXG4gKi9cblEuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xufVxuXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XG5mdW5jdGlvbiBpc1Byb21pc2VBbGlrZShvYmplY3QpIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XG4gKiBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG4gKi9cblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xuZnVuY3Rpb24gaXNQZW5kaW5nKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNQZW5kaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHZhbHVlIG9yIGZ1bGZpbGxlZFxuICogcHJvbWlzZS5cbiAqL1xuUS5pc0Z1bGZpbGxlZCA9IGlzRnVsZmlsbGVkO1xuZnVuY3Rpb24gaXNGdWxmaWxsZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cblEuaXNSZWplY3RlZCA9IGlzUmVqZWN0ZWQ7XG5mdW5jdGlvbiBpc1JlamVjdGVkKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59O1xuXG4vLy8vIEJFR0lOIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcbi8vIGhhbmRsZWQgYnkgYSBzdWJzZXF1ZW50IHByb21pc2UuICBUaGUgZXhjZXB0aW9ucyBnZXQgYWRkZWQgdG8gdGhpcyBhcnJheSB3aGVuXG4vLyB0aGV5IGFyZSBjcmVhdGVkLCBhbmQgcmVtb3ZlZCB3aGVuIHRoZXkgYXJlIGhhbmRsZWQuICBOb3RlIHRoYXQgaW4gRVM2IG9yXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cbnZhciB1bmhhbmRsZWRSZWFzb25zID0gW107XG52YXIgdW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInVuaGFuZGxlZFJlamVjdGlvblwiLCByZWFzb24sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgaWYgKHJlYXNvbiAmJiB0eXBlb2YgcmVhc29uLnN0YWNrICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChcIihubyBzdGFjaykgXCIgKyByZWFzb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXRSZXBvcnQgPSBhcnJheV9pbmRleE9mKHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGF0UmVwb3J0ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmVtaXQoXCJyZWplY3Rpb25IYW5kbGVkXCIsIHVuaGFuZGxlZFJlYXNvbnNbYXRdLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdFJlcG9ydCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytwZW5kaW5nQ291bnQ7XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLXBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2Ugb2YgYW4gYXJyYXkuIFByaW9yIHJlamVjdGVkIHByb21pc2VzIGFyZVxuICogaWdub3JlZC4gIFJlamVjdHMgb25seSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICogQHBhcmFtIHtBcnJheSp9IGFuIGFycmF5IGNvbnRhaW5pbmcgdmFsdWVzIG9yIHByb21pc2VzIGZvciB2YWx1ZXNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2UsXG4gKiBvciBhIHJlamVjdGVkIHByb21pc2UgaWYgYWxsIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAqL1xuUS5hbnkgPSBhbnk7XG5cbmZ1bmN0aW9uIGFueShwcm9taXNlcykge1xuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFEucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICB2YXIgcGVuZGluZ0NvdW50ID0gMDtcbiAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50LCBpbmRleCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VzW2luZGV4XTtcblxuICAgICAgICBwZW5kaW5nQ291bnQrKztcblxuICAgICAgICB3aGVuKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcbiAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQocmVzdWx0KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlcnIpIHtcbiAgICAgICAgICAgIHBlbmRpbmdDb3VudC0tO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gKFwiUSBjYW4ndCBnZXQgZnVsZmlsbG1lbnQgdmFsdWUgZnJvbSBhbnkgcHJvbWlzZSwgYWxsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9taXNlcyB3ZXJlIHJlamVjdGVkLiBMYXN0IGVycm9yIG1lc3NhZ2U6IFwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9ncmVzc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB1bmRlZmluZWQpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYW55KHRoaXMpO1xufTtcblxuLyoqXG4gKiBXYWl0cyBmb3IgYWxsIHByb21pc2VzIHRvIGJlIHNldHRsZWQsIGVpdGhlciBmdWxmaWxsZWQgb3JcbiAqIHJlamVjdGVkLiAgVGhpcyBpcyBkaXN0aW5jdCBmcm9tIGBhbGxgIHNpbmNlIHRoYXQgd291bGQgc3RvcFxuICogd2FpdGluZyBhdCB0aGUgZmlyc3QgcmVqZWN0aW9uLiAgVGhlIHByb21pc2UgcmV0dXJuZWQgYnlcbiAqIGBhbGxSZXNvbHZlZGAgd2lsbCBuZXZlciBiZSByZWplY3RlZC5cbiAqIEBwYXJhbSBwcm9taXNlcyBhIHByb21pc2UgZm9yIGFuIGFycmF5IChvciBhbiBhcnJheSkgb2YgcHJvbWlzZXNcbiAqIChvciB2YWx1ZXMpXG4gKiBAcmV0dXJuIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqL1xuUS5hbGxSZXNvbHZlZCA9IGRlcHJlY2F0ZShhbGxSZXNvbHZlZCwgXCJhbGxSZXNvbHZlZFwiLCBcImFsbFNldHRsZWRcIik7XG5mdW5jdGlvbiBhbGxSZXNvbHZlZChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcHJvbWlzZXMgPSBhcnJheV9tYXAocHJvbWlzZXMsIFEpO1xuICAgICAgICByZXR1cm4gd2hlbihhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdoZW4ocHJvbWlzZSwgbm9vcCwgbm9vcCk7XG4gICAgICAgIH0pKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VzO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsUmVzb2x2ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbFJlc29sdmVkKHRoaXMpO1xufTtcblxuLyoqXG4gKiBAc2VlIFByb21pc2UjYWxsU2V0dGxlZFxuICovXG5RLmFsbFNldHRsZWQgPSBhbGxTZXR0bGVkO1xuZnVuY3Rpb24gYWxsU2V0dGxlZChwcm9taXNlcykge1xuICAgIHJldHVybiBRKHByb21pc2VzKS5hbGxTZXR0bGVkKCk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gYXJyYXkgb2YgcHJvbWlzZXMgaW50byBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZWlyIHN0YXRlcyAoYXNcbiAqIHJldHVybmVkIGJ5IGBpbnNwZWN0YCkgd2hlbiB0aGV5IGhhdmUgYWxsIHNldHRsZWQuXG4gKiBAcGFyYW0ge0FycmF5W0FueSpdfSB2YWx1ZXMgYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMge0FycmF5W1N0YXRlXX0gYW4gYXJyYXkgb2Ygc3RhdGVzIGZvciB0aGUgcmVzcGVjdGl2ZSB2YWx1ZXMuXG4gKi9cblByb21pc2UucHJvdG90eXBlLmFsbFNldHRsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcmV0dXJuIGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gUShwcm9taXNlKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZ2FyZGxlc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UuaW5zcGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZWdhcmRsZXNzLCByZWdhcmRsZXNzKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgZmFpbHVyZSBvZiBhIHByb21pc2UsIGdpdmluZyBhbiBvcG9ydHVuaXR5IHRvIHJlY292ZXJcbiAqIHdpdGggYSBjYWxsYmFjay4gIElmIHRoZSBnaXZlbiBwcm9taXNlIGlzIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gKiBwcm9taXNlIGlzIGZ1bGZpbGxlZC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBmdWxmaWxsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlmIHRoZVxuICogZ2l2ZW4gcHJvbWlzZSBpcyByZWplY3RlZFxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBjYWxsYmFja1xuICovXG5RLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogQXR0YWNoZXMgYSBsaXN0ZW5lciB0aGF0IGNhbiByZXNwb25kIHRvIHByb2dyZXNzIG5vdGlmaWNhdGlvbnMgZnJvbSBhXG4gKiBwcm9taXNlJ3Mgb3JpZ2luYXRpbmcgZGVmZXJyZWQuIFRoaXMgbGlzdGVuZXIgcmVjZWl2ZXMgdGhlIGV4YWN0IGFyZ3VtZW50c1xuICogcGFzc2VkIHRvIGBgZGVmZXJyZWQubm90aWZ5YGAuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gcmVjZWl2ZSBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybnMgdGhlIGdpdmVuIHByb21pc2UsIHVuY2hhbmdlZFxuICovXG5RLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5mdW5jdGlvbiBwcm9ncmVzcyhvYmplY3QsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uIChwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIG9wcG9ydHVuaXR5IHRvIG9ic2VydmUgdGhlIHNldHRsaW5nIG9mIGEgcHJvbWlzZSxcbiAqIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgcHJvbWlzZSBpcyBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuICBGb3J3YXJkc1xuICogdGhlIHJlc29sdXRpb24gdG8gdGhlIHJldHVybmVkIHByb21pc2Ugd2hlbiB0aGUgY2FsbGJhY2sgaXMgZG9uZS5cbiAqIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgcHJvbWlzZSB0byBkZWZlciBjb21wbGV0aW9uLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBvYnNlcnZlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlblxuICogcHJvbWlzZSwgdGFrZXMgbm8gYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSB3aGVuXG4gKiBgYGZpbmBgIGlzIGRvbmUuXG4gKi9cblEuZmluID0gLy8gWFhYIGxlZ2FjeVxuUVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdClbXCJmaW5hbGx5XCJdKGNhbGxiYWNrKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZpbiA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2sgfHwgdHlwZW9mIGNhbGxiYWNrLmFwcGx5ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUSBjYW4ndCBhcHBseSBmaW5hbGx5IGNhbGxiYWNrXCIpO1xuICAgIH1cbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSk7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBdm9pZCB1bm5lY2Vzc2FyeSBgbmV4dFRpY2tgaW5nIHZpYSBhbiB1bm5lY2Vzc2FyeSBgd2hlbmAuXG4gICAgdmFyIHByb21pc2UgPSBmdWxmaWxsZWQgfHwgcmVqZWN0ZWQgfHwgcHJvZ3Jlc3MgP1xuICAgICAgICB0aGlzLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIDpcbiAgICAgICAgdGhpcztcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICAgIG9uVW5oYW5kbGVkRXJyb3IgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKG9uVW5oYW5kbGVkRXJyb3IpO1xuICAgIH1cblxuICAgIHByb21pc2UudGhlbih2b2lkIDAsIG9uVW5oYW5kbGVkRXJyb3IpO1xufTtcblxuLyoqXG4gKiBDYXVzZXMgYSBwcm9taXNlIHRvIGJlIHJlamVjdGVkIGlmIGl0IGRvZXMgbm90IGdldCBmdWxmaWxsZWQgYmVmb3JlXG4gKiBzb21lIG1pbGxpc2Vjb25kcyB0aW1lIG91dC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kcyB0aW1lb3V0XG4gKiBAcGFyYW0ge0FueSp9IGN1c3RvbSBlcnJvciBtZXNzYWdlIG9yIEVycm9yIG9iamVjdCAob3B0aW9uYWwpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGlmIGl0IGlzXG4gKiBmdWxmaWxsZWQgYmVmb3JlIHRoZSB0aW1lb3V0LCBvdGhlcndpc2UgcmVqZWN0ZWQuXG4gKi9cblEudGltZW91dCA9IGZ1bmN0aW9uIChvYmplY3QsIG1zLCBlcnJvcikge1xuICAgIHJldHVybiBRKG9iamVjdCkudGltZW91dChtcywgZXJyb3IpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgZXJyb3IpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFlcnJvciB8fCBcInN0cmluZ1wiID09PSB0eXBlb2YgZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKGVycm9yIHx8IFwiVGltZWQgb3V0IGFmdGVyIFwiICsgbXMgKyBcIiBtc1wiKTtcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSBcIkVUSU1FRE9VVFwiO1xuICAgICAgICB9XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgfSwgbXMpO1xuXG4gICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfSwgZGVmZXJyZWQubm90aWZ5KTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIGdpdmVuIHZhbHVlIChvciBwcm9taXNlZCB2YWx1ZSksIHNvbWVcbiAqIG1pbGxpc2Vjb25kcyBhZnRlciBpdCByZXNvbHZlZC4gUGFzc2VzIHJlamVjdGlvbnMgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgYWZ0ZXIgbWlsbGlzZWNvbmRzXG4gKiB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlLlxuICogSWYgdGhlIGdpdmVuIHByb21pc2UgcmVqZWN0cywgdGhhdCBpcyBwYXNzZWQgaW1tZWRpYXRlbHkuXG4gKi9cblEuZGVsYXkgPSBmdW5jdGlvbiAob2JqZWN0LCB0aW1lb3V0KSB7XG4gICAgaWYgKHRpbWVvdXQgPT09IHZvaWQgMCkge1xuICAgICAgICB0aW1lb3V0ID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiBRKG9iamVjdCkuZGVsYXkodGltZW91dCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBhcyBhbiBhcnJheSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICpcbiAqICAgICAgUS5uZmFwcGx5KEZTLnJlYWRGaWxlLCBbX19maWxlbmFtZV0pXG4gKiAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiAgICAgIH0pXG4gKlxuICovXG5RLm5mYXBwbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGluZGl2aWR1YWxseSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZjYWxsKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKVxuICogLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqIH0pXG4gKlxuICovXG5RLm5mY2FsbCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogV3JhcHMgYSBOb2RlSlMgY29udGludWF0aW9uIHBhc3NpbmcgZnVuY3Rpb24gYW5kIHJldHVybnMgYW4gZXF1aXZhbGVudFxuICogdmVyc2lvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZiaW5kKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKShcInV0Zi04XCIpXG4gKiAudGhlbihjb25zb2xlLmxvZylcbiAqIC5kb25lKClcbiAqL1xuUS5uZmJpbmQgPVxuUS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRIGNhbid0IHdyYXAgYW4gdW5kZWZpbmVkIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBRKGNhbGxiYWNrKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYmluZCA9XG5Qcm9taXNlLnByb3RvdHlwZS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLmRlbm9kZWlmeS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuUS5uYmluZCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3AgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBRKGJvdW5kKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5iaW5kID0gZnVuY3Rpb24gKC8qdGhpc3AsIC4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAwKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEubmJpbmQuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjayB3aXRoIGEgZ2l2ZW4gYXJyYXkgb2YgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFja1xuICogd2lsbCBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5ucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5wb3N0KG5hbWUsIGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5ucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyB8fCBbXSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrLCBmb3J3YXJkaW5nIHRoZSBnaXZlbiB2YXJpYWRpYyBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZFxuICogY2FsbGJhY2sgYXJndW1lbnQuXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0gLi4uYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2sgd2lsbFxuICogYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5RLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblEubmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUHJvbWlzZS5wcm90b3R5cGUubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUHJvbWlzZS5wcm90b3R5cGUubmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIElmIGEgZnVuY3Rpb24gd291bGQgbGlrZSB0byBzdXBwb3J0IGJvdGggTm9kZSBjb250aW51YXRpb24tcGFzc2luZy1zdHlsZSBhbmRcbiAqIHByb21pc2UtcmV0dXJuaW5nLXN0eWxlLCBpdCBjYW4gZW5kIGl0cyBpbnRlcm5hbCBwcm9taXNlIGNoYWluIHdpdGhcbiAqIGBub2RlaWZ5KG5vZGViYWNrKWAsIGZvcndhcmRpbmcgdGhlIG9wdGlvbmFsIG5vZGViYWNrIGFyZ3VtZW50LiAgSWYgdGhlIHVzZXJcbiAqIGVsZWN0cyB0byB1c2UgYSBub2RlYmFjaywgdGhlIHJlc3VsdCB3aWxsIGJlIHNlbnQgdGhlcmUuICBJZiB0aGV5IGRvIG5vdFxuICogcGFzcyBhIG5vZGViYWNrLCB0aGV5IHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IHByb21pc2UuXG4gKiBAcGFyYW0gb2JqZWN0IGEgcmVzdWx0IChvciBhIHByb21pc2UgZm9yIGEgcmVzdWx0KVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm9kZWJhY2sgYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrXG4gKiBAcmV0dXJucyBlaXRoZXIgdGhlIHByb21pc2Ugb3Igbm90aGluZ1xuICovXG5RLm5vZGVpZnkgPSBub2RlaWZ5O1xuZnVuY3Rpb24gbm9kZWlmeShvYmplY3QsIG5vZGViYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ub2RlaWZ5KG5vZGViYWNrKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUubm9kZWlmeSA9IGZ1bmN0aW9uIChub2RlYmFjaykge1xuICAgIGlmIChub2RlYmFjaykge1xuICAgICAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcblxuUS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUS5ub0NvbmZsaWN0IG9ubHkgd29ya3Mgd2hlbiBRIGlzIHVzZWQgYXMgYSBnbG9iYWxcIik7XG59O1xuXG4vLyBBbGwgY29kZSBiZWZvcmUgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzLlxudmFyIHFFbmRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcblxucmV0dXJuIFE7XG5cbn0pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3EvcS5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgNSA2IDcgOCAxMCAxMSAxMiAxMyIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIDEyIDEzIiwidmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkge1xuICBpZiAodGltZW91dCkge1xuICAgIHRpbWVvdXQuY2xvc2UoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBzZXRpbW1lZGlhdGUgYXR0YWNoZXMgaXRzZWxmIHRvIHRoZSBnbG9iYWwgb2JqZWN0XG5yZXF1aXJlKFwic2V0aW1tZWRpYXRlXCIpO1xuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSBzZXRJbW1lZGlhdGU7XG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2VicGFjay1zdHJlYW0vfi90aW1lcnMtYnJvd3NlcmlmeS9tYWluLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIDEyIDEzIiwiKGZ1bmN0aW9uIChnbG9iYWwsIHVuZGVmaW5lZCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKGdsb2JhbC5zZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXh0SGFuZGxlID0gMTsgLy8gU3BlYyBzYXlzIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgdmFyIHRhc2tzQnlIYW5kbGUgPSB7fTtcbiAgICB2YXIgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgdmFyIGRvYyA9IGdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgcmVnaXN0ZXJJbW1lZGlhdGU7XG5cbiAgICBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoY2FsbGJhY2spIHtcbiAgICAgIC8vIENhbGxiYWNrIGNhbiBlaXRoZXIgYmUgYSBmdW5jdGlvbiBvciBhIHN0cmluZ1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKFwiXCIgKyBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgICAvLyBDb3B5IGZ1bmN0aW9uIGFyZ3VtZW50c1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICB9XG4gICAgICAvLyBTdG9yZSBhbmQgcmVnaXN0ZXIgdGhlIHRhc2tcbiAgICAgIHZhciB0YXNrID0geyBjYWxsYmFjazogY2FsbGJhY2ssIGFyZ3M6IGFyZ3MgfTtcbiAgICAgIHRhc2tzQnlIYW5kbGVbbmV4dEhhbmRsZV0gPSB0YXNrO1xuICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUobmV4dEhhbmRsZSk7XG4gICAgICByZXR1cm4gbmV4dEhhbmRsZSsrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGhhbmRsZSkge1xuICAgICAgICBkZWxldGUgdGFza3NCeUhhbmRsZVtoYW5kbGVdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bih0YXNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRhc2suY2FsbGJhY2s7XG4gICAgICAgIHZhciBhcmdzID0gdGFzay5hcmdzO1xuICAgICAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FsbGJhY2soYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bklmUHJlc2VudChoYW5kbGUpIHtcbiAgICAgICAgLy8gRnJvbSB0aGUgc3BlYzogXCJXYWl0IHVudGlsIGFueSBpbnZvY2F0aW9ucyBvZiB0aGlzIGFsZ29yaXRobSBzdGFydGVkIGJlZm9yZSB0aGlzIG9uZSBoYXZlIGNvbXBsZXRlZC5cIlxuICAgICAgICAvLyBTbyBpZiB3ZSdyZSBjdXJyZW50bHkgcnVubmluZyBhIHRhc2ssIHdlJ2xsIG5lZWQgdG8gZGVsYXkgdGhpcyBpbnZvY2F0aW9uLlxuICAgICAgICBpZiAoY3VycmVudGx5UnVubmluZ0FUYXNrKSB7XG4gICAgICAgICAgICAvLyBEZWxheSBieSBkb2luZyBhIHNldFRpbWVvdXQuIHNldEltbWVkaWF0ZSB3YXMgdHJpZWQgaW5zdGVhZCwgYnV0IGluIEZpcmVmb3ggNyBpdCBnZW5lcmF0ZWQgYVxuICAgICAgICAgICAgLy8gXCJ0b28gbXVjaCByZWN1cnNpb25cIiBlcnJvci5cbiAgICAgICAgICAgIHNldFRpbWVvdXQocnVuSWZQcmVzZW50LCAwLCBoYW5kbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IHRydWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcnVuKHRhc2spO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW1tZWRpYXRlKGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdBVGFzayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7IHJ1bklmUHJlc2VudChoYW5kbGUpOyB9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5Vc2VQb3N0TWVzc2FnZSgpIHtcbiAgICAgICAgLy8gVGhlIHRlc3QgYWdhaW5zdCBgaW1wb3J0U2NyaXB0c2AgcHJldmVudHMgdGhpcyBpbXBsZW1lbnRhdGlvbiBmcm9tIGJlaW5nIGluc3RhbGxlZCBpbnNpZGUgYSB3ZWIgd29ya2VyLFxuICAgICAgICAvLyB3aGVyZSBgZ2xvYmFsLnBvc3RNZXNzYWdlYCBtZWFucyBzb21ldGhpbmcgY29tcGxldGVseSBkaWZmZXJlbnQgYW5kIGNhbid0IGJlIHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cbiAgICAgICAgaWYgKGdsb2JhbC5wb3N0TWVzc2FnZSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpIHtcbiAgICAgICAgICAgIHZhciBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBvbGRPbk1lc3NhZ2UgPSBnbG9iYWwub25tZXNzYWdlO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoXCJcIiwgXCIqXCIpO1xuICAgICAgICAgICAgZ2xvYmFsLm9ubWVzc2FnZSA9IG9sZE9uTWVzc2FnZTtcbiAgICAgICAgICAgIHJldHVybiBwb3N0TWVzc2FnZUlzQXN5bmNocm9ub3VzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIC8vIEluc3RhbGxzIGFuIGV2ZW50IGhhbmRsZXIgb24gYGdsb2JhbGAgZm9yIHRoZSBgbWVzc2FnZWAgZXZlbnQ6IHNlZVxuICAgICAgICAvLyAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0RPTS93aW5kb3cucG9zdE1lc3NhZ2VcbiAgICAgICAgLy8gKiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9jb21tcy5odG1sI2Nyb3NzRG9jdW1lbnRNZXNzYWdlc1xuXG4gICAgICAgIHZhciBtZXNzYWdlUHJlZml4ID0gXCJzZXRJbW1lZGlhdGUkXCIgKyBNYXRoLnJhbmRvbSgpICsgXCIkXCI7XG4gICAgICAgIHZhciBvbkdsb2JhbE1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gZ2xvYmFsICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGV2ZW50LmRhdGEgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgICAgICAgICAgICBldmVudC5kYXRhLmluZGV4T2YobWVzc2FnZVByZWZpeCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBydW5JZlByZXNlbnQoK2V2ZW50LmRhdGEuc2xpY2UobWVzc2FnZVByZWZpeC5sZW5ndGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbC5hdHRhY2hFdmVudChcIm9ubWVzc2FnZVwiLCBvbkdsb2JhbE1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShtZXNzYWdlUHJlZml4ICsgaGFuZGxlLCBcIipcIik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGUgPSBldmVudC5kYXRhO1xuICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSA8c2NyaXB0PiBlbGVtZW50OyBpdHMgcmVhZHlzdGF0ZWNoYW5nZSBldmVudCB3aWxsIGJlIGZpcmVkIGFzeW5jaHJvbm91c2x5IG9uY2UgaXQgaXMgaW5zZXJ0ZWRcbiAgICAgICAgICAgIC8vIGludG8gdGhlIGRvY3VtZW50LiBEbyBzbywgdGh1cyBxdWV1aW5nIHVwIHRoZSB0YXNrLiBSZW1lbWJlciB0byBjbGVhbiB1cCBvbmNlIGl0J3MgYmVlbiBjYWxsZWQuXG4gICAgICAgICAgICB2YXIgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudChoYW5kbGUpO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgICAgICBzY3JpcHQgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCkge1xuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSWYgc3VwcG9ydGVkLCB3ZSBzaG91bGQgYXR0YWNoIHRvIHRoZSBwcm90b3R5cGUgb2YgZ2xvYmFsLCBzaW5jZSB0aGF0IGlzIHdoZXJlIHNldFRpbWVvdXQgZXQgYWwuIGxpdmUuXG4gICAgdmFyIGF0dGFjaFRvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihnbG9iYWwpO1xuICAgIGF0dGFjaFRvID0gYXR0YWNoVG8gJiYgYXR0YWNoVG8uc2V0VGltZW91dCA/IGF0dGFjaFRvIDogZ2xvYmFsO1xuXG4gICAgLy8gRG9uJ3QgZ2V0IGZvb2xlZCBieSBlLmcuIGJyb3dzZXJpZnkgZW52aXJvbm1lbnRzLlxuICAgIGlmICh7fS50b1N0cmluZy5jYWxsKGdsb2JhbC5wcm9jZXNzKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIpIHtcbiAgICAgICAgLy8gRm9yIE5vZGUuanMgYmVmb3JlIDAuOVxuICAgICAgICBpbnN0YWxsTmV4dFRpY2tJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChjYW5Vc2VQb3N0TWVzc2FnZSgpKSB7XG4gICAgICAgIC8vIEZvciBub24tSUUxMCBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFBvc3RNZXNzYWdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZ2xvYmFsLk1lc3NhZ2VDaGFubmVsKSB7XG4gICAgICAgIC8vIEZvciB3ZWIgd29ya2Vycywgd2hlcmUgc3VwcG9ydGVkXG4gICAgICAgIGluc3RhbGxNZXNzYWdlQ2hhbm5lbEltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGRvYyAmJiBcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiIGluIGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpKSB7XG4gICAgICAgIC8vIEZvciBJRSA24oCTOFxuICAgICAgICBpbnN0YWxsUmVhZHlTdGF0ZUNoYW5nZUltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3Igb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgaW5zdGFsbFNldFRpbWVvdXRJbXBsZW1lbnRhdGlvbigpO1xuICAgIH1cblxuICAgIGF0dGFjaFRvLnNldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbiAgICBhdHRhY2hUby5jbGVhckltbWVkaWF0ZSA9IGNsZWFySW1tZWRpYXRlO1xufSh0eXBlb2Ygc2VsZiA9PT0gXCJ1bmRlZmluZWRcIiA/IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyB0aGlzIDogZ2xvYmFsIDogc2VsZikpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEgMTIgMTMiLCIvKipcclxuICogQ3JlYXRlZCBieSBUb20gb24gMjAxNi8wNS8wOVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdFVSTDp7XHJcblx0XHRTU09fTE9HSU46J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDkwMS9sb2dpbicsLy/ljZXngrnnmbvlvZVcclxuICAgICAgICBTU09fTE9HT1VUOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5MDEvbG9nb3V0JywvL+WNleeCuemAgOWHulxyXG4gICAgICAgIElOREVYOidodHRwOi8vMTI3LjAuMC4xOjkwMjAvaHRtbC9pbmRleC5odG1sJywvL+S6uuS6uumAmummlumhtVxyXG4gICAgICAgIENIRUNLX0xPR0lOOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5MzQvJywvL+ajgOafpeaYr+WQpueZu+mZhuWPiuW+l+WIsOeZu+mZhuS/oeaBr1xyXG4gICAgICAgIFNFVFVTRVI6J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDkzNC9zZXR1c2VyLmpzcCcsLy/orr7nva7nmbvlvZVcclxuICAgICAgICBBUFA6J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDcxMy8nLC8v5bqU55So55qE6K+35rGC5Zyw5Z2AXHJcbiAgICAgICAgUkVTOidodHRwOi8vMjIxLjIyOC4yNDIuNDo4MDA3L2luZGV4Lmh0bWwnLC8v6LWE5rqQ55qE6K+35rGC5Zyw5Z2AXHJcbiAgICAgICAgVVBMT0FEOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5NTEvZmlsZXMnLC8v5LiK5Lyg5paH5Lu25Zyw5Z2AXHJcbiAgICAgICAgUkVTVEZVTDonaHR0cDovLzIyMy4yMDIuNjQuMjA0OjUwOTMyJyxcclxuXHRcdEZPT1RFUlRZUEU6MiwvLzHmmK/lvKDlrrbmuK/vvIwy5piv6YCa6YWNXHJcblx0XHRTVEFUSVNUSUNTOjAsLy8w5piv5LiN5pi+56S677yMMeaYr+aYvuekulxyXG4gICAgICAgIENPVVJTRTowLy8w5piv5LiN5pi+56S677yMMeaYr+aYvuekulxyXG5cdH0sXHJcblx0QVBQOntcclxuXHRcdElTV1g6dHJ1ZVxyXG4gICAgfSxcclxuXHRBUFBFWElTVFM6ZmFsc2UsLy/lvKDlrrbmuK/mmL7npLrvvIzml6DplKHjgIHpu4TlhojkuI3mmL7npLpcclxuXHRJU1BJTkdDRVRBU0s6ZmFsc2VcclxufTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvY29uZmlnLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIDEyIDEzIiwiXHJcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBhamF4ID0gcmVxdWlyZShcInV0aWwvYWpheFwiKTtcclxudmFyIGpzb25wID0gcmVxdWlyZSgnanF1ZXJ5Lmpzb25wLmpzJyk7XHJcblxyXG52YXIgaGVhZFRwbCA9IHJlcXVpcmUoJy4vdHBsL2ludGVncmFsLXRvcC50cGwnKTtcclxudmFyIHR5cGVMaXN0VHBsID0gcmVxdWlyZSgnLi90cGwvdHlwZS1saXN0LnRwbCcpO1xyXG52YXIgaG90TGlzdFRwbCA9IHJlcXVpcmUoJy4vdHBsL2hvdC1saXN0LnRwbCcpO1xyXG52YXIgbW9yZUZlblRwbCA9IHJlcXVpcmUoJy4vdHBsL21vcmUtZmVuLnRwbCcpO1xyXG52YXIgZm9vdFRwbCA9IHJlcXVpcmUoJy4vdHBsL2ludGVncmFsLWJvdHRvbS50cGwnKTtcclxudmFyIG1lbnVOYW1lLCBfY2FsbEJhY2s7XHJcblxyXG4vKlxyXG4gKiDlpLTpg6jjgIHlsL7pg6jlr7zoiKpcclxuICovXHJcblxyXG52YXIgaGVhZGVyID0ge1xyXG4gICAgaWQ6IG51bGwsXHJcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTtcclxuICAgICAgICBtZS5pZCA9IHN0b3JhZ2VbXCJpZFwiXTtcclxuICAgICAgICBtZS5pbml0QnRuKCk7XHJcbiAgICB9LFxyXG4gICAgaW5pdEJ0bjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9lc2hvcC9iZWxvbmcvYWxsJyxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCdcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAyMDApe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICQoJyNoZWFkZXInKS5odG1sKGhlYWRUcGwobGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcubXktb3JkZXInICxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY2VudGVyLWJhc2UvbXktb3JkZXIuaHRtbCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5teS1jYXInICxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vbXktY2FydC9teS1jYXJ0Lmh0bWwnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfY2FsbEJhY2soKVxyXG5cclxuICAgICAgICAgICAgICAgICQoJy5sb2dvIGltZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9pbnRlZ3JhbC1iYXNlL2ludGVncmFsLWhvbWUuaHRtbCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIOmdnummlumhteWIkui/h+WFqOmDqOWVhuWTgeWIhuexu+aYvuekulxyXG4gICAgICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICAgICAgICAgIHZhciBzcGxpdFVybCA9IHVybC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgaWYoc3BsaXRVcmxbM10gIT0gJ2ludGVncmFsLWhvbWUuaHRtbCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5hbGwtbGlzdCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWNsYXNzaWZ5Jykub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWxpc3QnKS5zbGlkZURvd24oMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWxpc3QnKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5hbGwtbGlzdCcpLnNsaWRlVXAoMjAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmFsbC1saXN0Jykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbWUuaXNMb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgbWUubG9naW5nQnRuKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5hbGxUeXBlKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5ob3RMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICBtZS5zZWFyY2hOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5zZWFyY2hIb3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcubmF2LWNsYXNzaWZ5IGxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0lkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNOYW1lID0gJCh0aGlzKS5odG1sKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG51bSA9ICQodGhpcykuYXR0cignZGF0YS1udW0nKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1saXN0Lmh0bWw/ZmxhZz0nICsgdGhpc05hbWUgKyAnJnBhcmVudElkPScgKyB0aGlzSWQgKyAnJmJudW09JyArIG51bTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI2Zvb3RlcicpLmh0bWwoZm9vdFRwbCgpKTtcclxuICAgIH0sXHJcbiAgICAvLyDnmbvlvZXjgIHms6jlhozmk43kvZxcclxuICAgIGxvZ2luZ0J0bjogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnRvcCAubG9naW5nJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2ludGVncmFsLWJhc2UvbG9naW4uaHRtbCc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcudG9wIC5yZWdpc3RlcicsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9pbnRlZ3JhbC1iYXNlL3JlZ2lzdGVyLmh0bWwnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGlzTG9naW46IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTtcclxuICAgICAgICB2YXIgZ2V0TG9naW5uYW1lID0gc3RvcmFnZVtcImxvZ2lubmFtZVwiXTtcclxuICAgICAgICB2YXIgbG9naW5TdGF0dXMgPSBzdG9yYWdlW1wiaXNsb2dpblwiXTtcclxuICAgICAgICAvL3ZhciBkYXRlID0gc3RvcmFnZVtcImRhdGVcIl07XHJcblxyXG4gICAgICAgIGlmKGxvZ2luU3RhdHVzID09ICd5ZXMnKXtcclxuICAgICAgICAgICAgJCgnLnRvcCAuc2l0ZS1sb2dlZCcpLmhpZGUoKTtcclxuICAgICAgICAgICAgJCgnLndlbGNvbWUnKS5odG1sKCfmgqjlpb0gJytnZXRMb2dpbm5hbWUrJ++8jOasoui/juWFieS4tOW+oeW7t+WutuWxhe+8gScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCcuc2l0ZS1sb2dpbmctc3VjY2VzcyBsaScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2ludGVncmFsLWJhc2UvbG9naW4uaHRtbCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGhvdExpc3Q6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICBhamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3R5cGUvcGxpc3QnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICBudW06ICc2J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAkKCcuc2VhcmNoLWhvdCcpLmh0bWwoaG90TGlzdFRwbChsaXN0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBhbGxUeXBlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9lc2hvcC90eXBlL2FsbCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhOntcclxuICAgICAgICAgICAgICAgIGFjY291bnRJZDogbWUuaWQsXHJcbiAgICAgICAgICAgICAgICBsZXZlbDogJzInXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAyMDApe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobGlzdCk7XHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3QnKS5odG1sKHR5cGVMaXN0VHBsKGxpc3QpKTtcclxuICAgICAgICAgICAgICAgICQoJy5tb3JlLWZlbicpLmh0bWwobW9yZUZlblRwbChsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGk6Z3QoNSknKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGknKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5jaGlsZHJlbignLmNsYXNzaWYtZGV0YWlsJykuZmluZChcInVsIGxpXCIpLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCcuY2xhc3NpZi1kZXRhaWwnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGknKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jaGlsZHJlbignLmNsYXNzaWYtZGV0YWlsJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZihkYXRhLnJlc3VsdC5sZW5ndGggPiA1KXtcclxuICAgICAgICAgICAgICAgICAgICAkKCcudG9wQ29uIC5hbGwtbGlzdCAubW9yZS1jYXRlZ29yaWVzJykub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubW9yZS1mZW4nKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnRvcENvbiAuYWxsLWxpc3QgLm1vcmUtY2F0ZWdvcmllcycpLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLm1vcmUtZmVuJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIOWFqOmDqOWVhuWTgeWIhuexu+S4i1xyXG4gICAgICAgICAgICAgICAgJCgnLmFsbF9saXN0PmxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9lLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc05hbWUgPSAkKHRoaXMpLmNoaWxkcmVuKCcubGlzdC10aXRsZScpLmh0bWwoKS5zcGxpdCgn4oCiJylbMV0udHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLyokKCcuYWxsX2xpc3Q+bGk+Lmxpc3QtaG90PmxpJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNJZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzTmFtZSA9ICQodGhpcykuaHRtbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbCNmbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmFsbF9saXN0PmxpPi5jbGFzc2lmLWRldGFpbD51bD5saScsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9lLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc05hbWUgPSAkKHRoaXMpLmh0bWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1saXN0Lmh0bWw/ZmxhZz0nICsgdGhpc05hbWUgKyAnJnBhcmVudElkPScgKyB0aGlzSWQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5tb3JlLWNhdGVnb3JpZXMgLm1vcmUtZmVuIC5tb3JlLWxpc3QnLGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZS5zdG9wcHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0lkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNOYW1lID0gJCh0aGlzKS5jaGlsZHJlbignZGl2JykuaHRtbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc2VhcmNoTmFtZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCcuc2VhcmNoIC5zZWFyY2gtYnRuJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGdvb2ROYW1lID0gJCgnLnNlYXJjaC1uYW1lJykudmFsKCk7XHJcbiAgICAgICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3Byb2R1Y3QvcXVlcnknLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZ29vZE5hbWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbignLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbCNuYW1lPScgKyBnb29kTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc2VhcmNoSG90OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuc2VhcmNoLWhvdCBsaScsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGhvdE5hbWUgPSAkKHRoaXMpLmh0bWwoKTtcclxuICAgICAgICAgICAgdmFyIHBhcmVudElkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyBob3ROYW1lICsgJyZwYXJlbnRJZD0nICsgcGFyZW50SWQ7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICBfY2FsbEJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICBoZWFkZXIuaW5pdCgpO1xyXG4gICAgfVxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL2hlYWRlci1uYXYvaGVhZGVyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCAxMCAxMSAxMiIsIi8qXG4gKiBqUXVlcnkgSlNPTlAgQ29yZSBQbHVnaW4gMi40LjAgKDIwMTItMDgtMjEpXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2phdWJvdXJnL2pxdWVyeS1qc29ucFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBKdWxpYW4gQXVib3VyZ1xuICpcbiAqIFRoaXMgZG9jdW1lbnQgaXMgbGljZW5zZWQgYXMgZnJlZSBzb2Z0d2FyZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlXG4gKiBNSVQgTGljZW5zZTogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqL1xuKCBmdW5jdGlvbiggJCApIHtcblxuXHQvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIFVUSUxJVElFUyAjI1xuXG5cdC8vIE5vb3Bcblx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0fVxuXG5cdC8vIEdlbmVyaWMgY2FsbGJhY2tcblx0ZnVuY3Rpb24gZ2VuZXJpY0NhbGxiYWNrKCBkYXRhICkge1xuXHRcdGxhc3RWYWx1ZSA9IFsgZGF0YSBdO1xuXHR9XG5cblx0Ly8gQ2FsbCBpZiBkZWZpbmVkXG5cdGZ1bmN0aW9uIGNhbGxJZkRlZmluZWQoIG1ldGhvZCAsIG9iamVjdCAsIHBhcmFtZXRlcnMgKSB7XG5cdFx0cmV0dXJuIG1ldGhvZCAmJiBtZXRob2QuYXBwbHkoIG9iamVjdC5jb250ZXh0IHx8IG9iamVjdCAsIHBhcmFtZXRlcnMgKTtcblx0fVxuXG5cdC8vIEdpdmUgam9pbmluZyBjaGFyYWN0ZXIgZ2l2ZW4gdXJsXG5cdGZ1bmN0aW9uIHFNYXJrT3JBbXAoIHVybCApIHtcblx0XHRyZXR1cm4gL1xcPy8gLnRlc3QoIHVybCApID8gXCImXCIgOiBcIj9cIjtcblx0fVxuXG5cdHZhciAvLyBTdHJpbmcgY29uc3RhbnRzIChmb3IgYmV0dGVyIG1pbmlmaWNhdGlvbilcblx0XHRTVFJfQVNZTkMgPSBcImFzeW5jXCIsXG5cdFx0U1RSX0NIQVJTRVQgPSBcImNoYXJzZXRcIixcblx0XHRTVFJfRU1QVFkgPSBcIlwiLFxuXHRcdFNUUl9FUlJPUiA9IFwiZXJyb3JcIixcblx0XHRTVFJfSU5TRVJUX0JFRk9SRSA9IFwiaW5zZXJ0QmVmb3JlXCIsXG5cdFx0U1RSX0pRVUVSWV9KU09OUCA9IFwiX2pxanNwXCIsXG5cdFx0U1RSX09OID0gXCJvblwiLFxuXHRcdFNUUl9PTl9DTElDSyA9IFNUUl9PTiArIFwiY2xpY2tcIixcblx0XHRTVFJfT05fRVJST1IgPSBTVFJfT04gKyBTVFJfRVJST1IsXG5cdFx0U1RSX09OX0xPQUQgPSBTVFJfT04gKyBcImxvYWRcIixcblx0XHRTVFJfT05fUkVBRFlfU1RBVEVfQ0hBTkdFID0gU1RSX09OICsgXCJyZWFkeXN0YXRlY2hhbmdlXCIsXG5cdFx0U1RSX1JFQURZX1NUQVRFID0gXCJyZWFkeVN0YXRlXCIsXG5cdFx0U1RSX1JFTU9WRV9DSElMRCA9IFwicmVtb3ZlQ2hpbGRcIixcblx0XHRTVFJfU0NSSVBUX1RBRyA9IFwiPHNjcmlwdD5cIixcblx0XHRTVFJfU1VDQ0VTUyA9IFwic3VjY2Vzc1wiLFxuXHRcdFNUUl9USU1FT1VUID0gXCJ0aW1lb3V0XCIsXG5cblx0XHQvLyBXaW5kb3dcblx0XHR3aW4gPSB3aW5kb3csXG5cdFx0Ly8gRGVmZXJyZWRcblx0XHREZWZlcnJlZCA9ICQuRGVmZXJyZWQsXG5cdFx0Ly8gSGVhZCBlbGVtZW50XG5cdFx0aGVhZCA9ICQoIFwiaGVhZFwiIClbIDAgXSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0Ly8gUGFnZSBjYWNoZVxuXHRcdHBhZ2VDYWNoZSA9IHt9LFxuXHRcdC8vIENvdW50ZXJcblx0XHRjb3VudCA9IDAsXG5cdFx0Ly8gTGFzdCByZXR1cm5lZCB2YWx1ZVxuXHRcdGxhc3RWYWx1ZSxcblxuXHRcdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgREVGQVVMVCBPUFRJT05TICMjXG5cdFx0eE9wdGlvbnNEZWZhdWx0cyA9IHtcblx0XHRcdC8vYmVmb3JlU2VuZDogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jYWNoZTogZmFsc2UsXG5cdFx0XHRjYWxsYmFjazogU1RSX0pRVUVSWV9KU09OUCxcblx0XHRcdC8vY2FsbGJhY2tQYXJhbWV0ZXI6IHVuZGVmaW5lZCxcblx0XHRcdC8vY2hhcnNldDogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jb21wbGV0ZTogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jb250ZXh0OiB1bmRlZmluZWQsXG5cdFx0XHQvL2RhdGE6IFwiXCIsXG5cdFx0XHQvL2RhdGFGaWx0ZXI6IHVuZGVmaW5lZCxcblx0XHRcdC8vZXJyb3I6IHVuZGVmaW5lZCxcblx0XHRcdC8vcGFnZUNhY2hlOiBmYWxzZSxcblx0XHRcdC8vc3VjY2VzczogdW5kZWZpbmVkLFxuXHRcdFx0Ly90aW1lb3V0OiAwLFxuXHRcdFx0Ly90cmFkaXRpb25hbDogZmFsc2UsXG5cdFx0XHR1cmw6IGxvY2F0aW9uLmhyZWZcblx0XHR9LFxuXG5cdFx0Ly8gb3BlcmEgZGVtYW5kcyBzbmlmZmluZyA6L1xuXHRcdG9wZXJhID0gd2luLm9wZXJhLFxuXG5cdFx0Ly8gSUUgPCAxMFxuXHRcdG9sZElFID0gISEkKCBcIjxkaXY+XCIgKS5odG1sKCBcIjwhLS1baWYgSUVdPjxpPjwhW2VuZGlmXS0tPlwiICkuZmluZChcImlcIikubGVuZ3RoO1xuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgTUFJTiBGVU5DVElPTiAjI1xuXHRmdW5jdGlvbiBqc29ucCggeE9wdGlvbnMgKSB7XG5cblx0XHQvLyBCdWlsZCBkYXRhIHdpdGggZGVmYXVsdFxuXHRcdHhPcHRpb25zID0gJC5leHRlbmQoIHt9ICwgeE9wdGlvbnNEZWZhdWx0cyAsIHhPcHRpb25zICk7XG5cblx0XHQvLyBSZWZlcmVuY2VzIHRvIHhPcHRpb25zIG1lbWJlcnMgKGZvciBiZXR0ZXIgbWluaWZpY2F0aW9uKVxuXHRcdHZhciBzdWNjZXNzQ2FsbGJhY2sgPSB4T3B0aW9ucy5zdWNjZXNzLFxuXHRcdFx0ZXJyb3JDYWxsYmFjayA9IHhPcHRpb25zLmVycm9yLFxuXHRcdFx0Y29tcGxldGVDYWxsYmFjayA9IHhPcHRpb25zLmNvbXBsZXRlLFxuXHRcdFx0ZGF0YUZpbHRlciA9IHhPcHRpb25zLmRhdGFGaWx0ZXIsXG5cdFx0XHRjYWxsYmFja1BhcmFtZXRlciA9IHhPcHRpb25zLmNhbGxiYWNrUGFyYW1ldGVyLFxuXHRcdFx0c3VjY2Vzc0NhbGxiYWNrTmFtZSA9IHhPcHRpb25zLmNhbGxiYWNrLFxuXHRcdFx0Y2FjaGVGbGFnID0geE9wdGlvbnMuY2FjaGUsXG5cdFx0XHRwYWdlQ2FjaGVGbGFnID0geE9wdGlvbnMucGFnZUNhY2hlLFxuXHRcdFx0Y2hhcnNldCA9IHhPcHRpb25zLmNoYXJzZXQsXG5cdFx0XHR1cmwgPSB4T3B0aW9ucy51cmwsXG5cdFx0XHRkYXRhID0geE9wdGlvbnMuZGF0YSxcblx0XHRcdHRpbWVvdXQgPSB4T3B0aW9ucy50aW1lb3V0LFxuXHRcdFx0cGFnZUNhY2hlZCxcblxuXHRcdFx0Ly8gQWJvcnQvZG9uZSBmbGFnXG5cdFx0XHRkb25lID0gMCxcblxuXHRcdFx0Ly8gTGlmZS1jeWNsZSBmdW5jdGlvbnNcblx0XHRcdGNsZWFuVXAgPSBub29wLFxuXG5cdFx0XHQvLyBTdXBwb3J0IHZhcnNcblx0XHRcdHN1cHBvcnRPbmxvYWQsXG5cdFx0XHRzdXBwb3J0T25yZWFkeXN0YXRlY2hhbmdlLFxuXG5cdFx0XHQvLyBSZXF1ZXN0IGV4ZWN1dGlvbiB2YXJzXG5cdFx0XHRmaXJzdENoaWxkLFxuXHRcdFx0c2NyaXB0LFxuXHRcdFx0c2NyaXB0QWZ0ZXIsXG5cdFx0XHR0aW1lb3V0VGltZXI7XG5cblx0XHQvLyBJZiB3ZSBoYXZlIERlZmVycmVkczpcblx0XHQvLyAtIHN1YnN0aXR1dGUgY2FsbGJhY2tzXG5cdFx0Ly8gLSBwcm9tb3RlIHhPcHRpb25zIHRvIGEgcHJvbWlzZVxuXHRcdERlZmVycmVkICYmIERlZmVycmVkKGZ1bmN0aW9uKCBkZWZlciApIHtcblx0XHRcdGRlZmVyLmRvbmUoIHN1Y2Nlc3NDYWxsYmFjayApLmZhaWwoIGVycm9yQ2FsbGJhY2sgKTtcblx0XHRcdHN1Y2Nlc3NDYWxsYmFjayA9IGRlZmVyLnJlc29sdmU7XG5cdFx0XHRlcnJvckNhbGxiYWNrID0gZGVmZXIucmVqZWN0O1xuXHRcdH0pLnByb21pc2UoIHhPcHRpb25zICk7XG5cblx0XHQvLyBDcmVhdGUgdGhlIGFib3J0IG1ldGhvZFxuXHRcdHhPcHRpb25zLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQhKCBkb25lKysgKSAmJiBjbGVhblVwKCk7XG5cdFx0fTtcblxuXHRcdC8vIENhbGwgYmVmb3JlU2VuZCBpZiBwcm92aWRlZCAoZWFybHkgYWJvcnQgaWYgZmFsc2UgcmV0dXJuZWQpXG5cdFx0aWYgKCBjYWxsSWZEZWZpbmVkKCB4T3B0aW9ucy5iZWZvcmVTZW5kICwgeE9wdGlvbnMgLCBbIHhPcHRpb25zIF0gKSA9PT0gITEgfHwgZG9uZSApIHtcblx0XHRcdHJldHVybiB4T3B0aW9ucztcblx0XHR9XG5cblx0XHQvLyBDb250cm9sIGVudHJpZXNcblx0XHR1cmwgPSB1cmwgfHwgU1RSX0VNUFRZO1xuXHRcdGRhdGEgPSBkYXRhID8gKCAodHlwZW9mIGRhdGEpID09IFwic3RyaW5nXCIgPyBkYXRhIDogJC5wYXJhbSggZGF0YSAsIHhPcHRpb25zLnRyYWRpdGlvbmFsICkgKSA6IFNUUl9FTVBUWTtcblxuXHRcdC8vIEJ1aWxkIGZpbmFsIHVybFxuXHRcdHVybCArPSBkYXRhID8gKCBxTWFya09yQW1wKCB1cmwgKSArIGRhdGEgKSA6IFNUUl9FTVBUWTtcblxuXHRcdC8vIEFkZCBjYWxsYmFjayBwYXJhbWV0ZXIgaWYgcHJvdmlkZWQgYXMgb3B0aW9uXG5cdFx0Y2FsbGJhY2tQYXJhbWV0ZXIgJiYgKCB1cmwgKz0gcU1hcmtPckFtcCggdXJsICkgKyBlbmNvZGVVUklDb21wb25lbnQoIGNhbGxiYWNrUGFyYW1ldGVyICkgKyBcIj0/XCIgKTtcblxuXHRcdC8vIEFkZCBhbnRpY2FjaGUgcGFyYW1ldGVyIGlmIG5lZWRlZFxuXHRcdCFjYWNoZUZsYWcgJiYgIXBhZ2VDYWNoZUZsYWcgJiYgKCB1cmwgKz0gcU1hcmtPckFtcCggdXJsICkgKyBcIl9cIiArICggbmV3IERhdGUoKSApLmdldFRpbWUoKSArIFwiPVwiICk7XG5cblx0XHQvLyBSZXBsYWNlIGxhc3QgPyBieSBjYWxsYmFjayBwYXJhbWV0ZXJcblx0XHR1cmwgPSB1cmwucmVwbGFjZSggLz1cXD8oJnwkKS8gLCBcIj1cIiArIHN1Y2Nlc3NDYWxsYmFja05hbWUgKyBcIiQxXCIgKTtcblxuXHRcdC8vIFN1Y2Nlc3Mgbm90aWZpZXJcblx0XHRmdW5jdGlvbiBub3RpZnlTdWNjZXNzKCBqc29uICkge1xuXG5cdFx0XHRpZiAoICEoIGRvbmUrKyApICkge1xuXG5cdFx0XHRcdGNsZWFuVXAoKTtcblx0XHRcdFx0Ly8gUGFnZWNhY2hlIGlmIG5lZWRlZFxuXHRcdFx0XHRwYWdlQ2FjaGVGbGFnICYmICggcGFnZUNhY2hlIFsgdXJsIF0gPSB7IHM6IFsganNvbiBdIH0gKTtcblx0XHRcdFx0Ly8gQXBwbHkgdGhlIGRhdGEgZmlsdGVyIGlmIHByb3ZpZGVkXG5cdFx0XHRcdGRhdGFGaWx0ZXIgJiYgKCBqc29uID0gZGF0YUZpbHRlci5hcHBseSggeE9wdGlvbnMgLCBbIGpzb24gXSApICk7XG5cdFx0XHRcdC8vIENhbGwgc3VjY2VzcyB0aGVuIGNvbXBsZXRlXG5cdFx0XHRcdGNhbGxJZkRlZmluZWQoIHN1Y2Nlc3NDYWxsYmFjayAsIHhPcHRpb25zICwgWyBqc29uICwgU1RSX1NVQ0NFU1MsIHhPcHRpb25zIF0gKTtcblx0XHRcdFx0Y2FsbElmRGVmaW5lZCggY29tcGxldGVDYWxsYmFjayAsIHhPcHRpb25zICwgWyB4T3B0aW9ucyAsIFNUUl9TVUNDRVNTIF0gKTtcblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEVycm9yIG5vdGlmaWVyXG5cdFx0ZnVuY3Rpb24gbm90aWZ5RXJyb3IoIHR5cGUgKSB7XG5cblx0XHRcdGlmICggISggZG9uZSsrICkgKSB7XG5cblx0XHRcdFx0Ly8gQ2xlYW4gdXBcblx0XHRcdFx0Y2xlYW5VcCgpO1xuXHRcdFx0XHQvLyBJZiBwdXJlIGVycm9yIChub3QgdGltZW91dCksIGNhY2hlIGlmIG5lZWRlZFxuXHRcdFx0XHRwYWdlQ2FjaGVGbGFnICYmIHR5cGUgIT0gU1RSX1RJTUVPVVQgJiYgKCBwYWdlQ2FjaGVbIHVybCBdID0gdHlwZSApO1xuXHRcdFx0XHQvLyBDYWxsIGVycm9yIHRoZW4gY29tcGxldGVcblx0XHRcdFx0Y2FsbElmRGVmaW5lZCggZXJyb3JDYWxsYmFjayAsIHhPcHRpb25zICwgWyB4T3B0aW9ucyAsIHR5cGUgXSApO1xuXHRcdFx0XHRjYWxsSWZEZWZpbmVkKCBjb21wbGV0ZUNhbGxiYWNrICwgeE9wdGlvbnMgLCBbIHhPcHRpb25zICwgdHlwZSBdICk7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDaGVjayBwYWdlIGNhY2hlXG5cdFx0aWYgKCBwYWdlQ2FjaGVGbGFnICYmICggcGFnZUNhY2hlZCA9IHBhZ2VDYWNoZVsgdXJsIF0gKSApIHtcblxuXHRcdFx0cGFnZUNhY2hlZC5zID8gbm90aWZ5U3VjY2VzcyggcGFnZUNhY2hlZC5zWyAwIF0gKSA6IG5vdGlmeUVycm9yKCBwYWdlQ2FjaGVkICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBJbnN0YWxsIHRoZSBnZW5lcmljIGNhbGxiYWNrXG5cdFx0XHQvLyAoQkVXQVJFOiBnbG9iYWwgbmFtZXNwYWNlIHBvbGx1dGlvbiBhaG95KVxuXHRcdFx0d2luWyBzdWNjZXNzQ2FsbGJhY2tOYW1lIF0gPSBnZW5lcmljQ2FsbGJhY2s7XG5cblx0XHRcdC8vIENyZWF0ZSB0aGUgc2NyaXB0IHRhZ1xuXHRcdFx0c2NyaXB0ID0gJCggU1RSX1NDUklQVF9UQUcgKVsgMCBdO1xuXHRcdFx0c2NyaXB0LmlkID0gU1RSX0pRVUVSWV9KU09OUCArIGNvdW50Kys7XG5cblx0XHRcdC8vIFNldCBjaGFyc2V0IGlmIHByb3ZpZGVkXG5cdFx0XHRpZiAoIGNoYXJzZXQgKSB7XG5cdFx0XHRcdHNjcmlwdFsgU1RSX0NIQVJTRVQgXSA9IGNoYXJzZXQ7XG5cdFx0XHR9XG5cblx0XHRcdG9wZXJhICYmIG9wZXJhLnZlcnNpb24oKSA8IDExLjYwID9cblx0XHRcdFx0Ly8gb25lcnJvciBpcyBub3Qgc3VwcG9ydGVkOiBkbyBub3Qgc2V0IGFzIGFzeW5jIGFuZCBhc3N1bWUgaW4tb3JkZXIgZXhlY3V0aW9uLlxuXHRcdFx0XHQvLyBBZGQgYSB0cmFpbGluZyBzY3JpcHQgdG8gZW11bGF0ZSB0aGUgZXZlbnRcblx0XHRcdFx0KCAoIHNjcmlwdEFmdGVyID0gJCggU1RSX1NDUklQVF9UQUcgKVsgMCBdICkudGV4dCA9IFwiZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ1wiICsgc2NyaXB0LmlkICsgXCInKS5cIiArIFNUUl9PTl9FUlJPUiArIFwiKClcIiApXG5cdFx0XHQ6XG5cdFx0XHRcdC8vIG9uZXJyb3IgaXMgc3VwcG9ydGVkOiBzZXQgdGhlIHNjcmlwdCBhcyBhc3luYyB0byBhdm9pZCByZXF1ZXN0cyBibG9ja2luZyBlYWNoIG90aGVyc1xuXHRcdFx0XHQoIHNjcmlwdFsgU1RSX0FTWU5DIF0gPSBTVFJfQVNZTkMgKVxuXG5cdFx0XHQ7XG5cblx0XHRcdC8vIEludGVybmV0IEV4cGxvcmVyOiBldmVudC9odG1sRm9yIHRyaWNrXG5cdFx0XHRpZiAoIG9sZElFICkge1xuXHRcdFx0XHRzY3JpcHQuaHRtbEZvciA9IHNjcmlwdC5pZDtcblx0XHRcdFx0c2NyaXB0LmV2ZW50ID0gU1RSX09OX0NMSUNLO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBdHRhY2hlZCBldmVudCBoYW5kbGVyc1xuXHRcdFx0c2NyaXB0WyBTVFJfT05fTE9BRCBdID0gc2NyaXB0WyBTVFJfT05fRVJST1IgXSA9IHNjcmlwdFsgU1RSX09OX1JFQURZX1NUQVRFX0NIQU5HRSBdID0gZnVuY3Rpb24gKCByZXN1bHQgKSB7XG5cblx0XHRcdFx0Ly8gVGVzdCByZWFkeVN0YXRlIGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRpZiAoICFzY3JpcHRbIFNUUl9SRUFEWV9TVEFURSBdIHx8ICEvaS8udGVzdCggc2NyaXB0WyBTVFJfUkVBRFlfU1RBVEUgXSApICkge1xuXG5cdFx0XHRcdFx0dHJ5IHtcblxuXHRcdFx0XHRcdFx0c2NyaXB0WyBTVFJfT05fQ0xJQ0sgXSAmJiBzY3JpcHRbIFNUUl9PTl9DTElDSyBdKCk7XG5cblx0XHRcdFx0XHR9IGNhdGNoKCBfICkge31cblxuXHRcdFx0XHRcdHJlc3VsdCA9IGxhc3RWYWx1ZTtcblx0XHRcdFx0XHRsYXN0VmFsdWUgPSAwO1xuXHRcdFx0XHRcdHJlc3VsdCA/IG5vdGlmeVN1Y2Nlc3MoIHJlc3VsdFsgMCBdICkgOiBub3RpZnlFcnJvciggU1RSX0VSUk9SICk7XG5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gU2V0IHNvdXJjZVxuXHRcdFx0c2NyaXB0LnNyYyA9IHVybDtcblxuXHRcdFx0Ly8gUmUtZGVjbGFyZSBjbGVhblVwIGZ1bmN0aW9uXG5cdFx0XHRjbGVhblVwID0gZnVuY3Rpb24oIGkgKSB7XG5cdFx0XHRcdHRpbWVvdXRUaW1lciAmJiBjbGVhclRpbWVvdXQoIHRpbWVvdXRUaW1lciApO1xuXHRcdFx0XHRzY3JpcHRbIFNUUl9PTl9SRUFEWV9TVEFURV9DSEFOR0UgXSA9IHNjcmlwdFsgU1RSX09OX0xPQUQgXSA9IHNjcmlwdFsgU1RSX09OX0VSUk9SIF0gPSBudWxsO1xuXHRcdFx0XHRoZWFkWyBTVFJfUkVNT1ZFX0NISUxEIF0oIHNjcmlwdCApO1xuXHRcdFx0XHRzY3JpcHRBZnRlciAmJiBoZWFkWyBTVFJfUkVNT1ZFX0NISUxEIF0oIHNjcmlwdEFmdGVyICk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBBcHBlbmQgbWFpbiBzY3JpcHRcblx0XHRcdGhlYWRbIFNUUl9JTlNFUlRfQkVGT1JFIF0oIHNjcmlwdCAsICggZmlyc3RDaGlsZCA9IGhlYWQuZmlyc3RDaGlsZCApICk7XG5cblx0XHRcdC8vIEFwcGVuZCB0cmFpbGluZyBzY3JpcHQgaWYgbmVlZGVkXG5cdFx0XHRzY3JpcHRBZnRlciAmJiBoZWFkWyBTVFJfSU5TRVJUX0JFRk9SRSBdKCBzY3JpcHRBZnRlciAsIGZpcnN0Q2hpbGQgKTtcblxuXHRcdFx0Ly8gSWYgYSB0aW1lb3V0IGlzIG5lZWRlZCwgaW5zdGFsbCBpdFxuXHRcdFx0dGltZW91dFRpbWVyID0gdGltZW91dCA+IDAgJiYgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG5vdGlmeUVycm9yKCBTVFJfVElNRU9VVCApO1xuXHRcdFx0fSAsIHRpbWVvdXQgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB4T3B0aW9ucztcblx0fVxuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgU0VUVVAgRlVOQ1RJT04gIyNcblx0anNvbnAuc2V0dXAgPSBmdW5jdGlvbiggeE9wdGlvbnMgKSB7XG5cdFx0JC5leHRlbmQoIHhPcHRpb25zRGVmYXVsdHMgLCB4T3B0aW9ucyApO1xuXHR9O1xuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgSU5TVEFMTCBpbiBqUXVlcnkgIyNcblx0JC5qc29ucCA9IGpzb25wO1xuXG59ICkoIGpRdWVyeSApO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvanF1ZXJ5Lmpzb25wLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEgMTIiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLXRvcCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskb3V0Kz0nPGRpdiBjbGFzcz1cInRvcC1zaXRlXCI+IDxkaXYgY2xhc3M9XCJzaXRlXCI+ICA8ZGl2IGNsYXNzPVwid2VsY29tZS1wcmVzZW5jZSBmbFwiPiA8ZGl2IGNsYXNzPVwid2VsY29tZSBmbFwiPuaCqOWlve+8jOasoui/juWFieS4tOW+oeW7t+WutuWxhe+8gTwvZGl2PiA8ZGl2IGNsYXNzPVwic2l0ZS1sb2dlZCBmbFwiPiA8c3BhbiBjbGFzcz1cImxvZ2luZ1wiPlsg55m75b2VIF08L3NwYW4+IDxzcGFuIGNsYXNzPVwicmVnaXN0ZXJcIj5bIOazqOWGjCBdPC9zcGFuPiA8L2Rpdj4gPC9kaXY+ICA8ZGl2IGNsYXNzPVwic2l0ZS1sb2dpbmctc3VjY2VzcyBmclwiPiA8dWwgY2xhc3M9XCJjbGVhcmZpeFwiPiA8bGkgY2xhc3M9XCJteS1vcmRlclwiPjxpIGNsYXNzPVwib3JkZXJcIj48L2k+PGE+5oiR55qE6K6i5Y2VPC9hPjwvbGk+IDxsaSBjbGFzcz1cIm15LWNhclwiPjxpIGNsYXNzPVwiY2FydFwiPjwvaT48YT7otK3nianovaY8L2E+PC9saT4gPGxpIGNsYXNzPVwibXUtaW5mb1wiPjxpIGNsYXNzPVwidXNlclwiPjwvaT48YT7nlKjmiLfnrqHnkIY8L2E+PC9saT4gPC91bD4gPC9kaXY+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cInRvcENvblwiPiA8ZGl2IGNsYXNzPVwidG9wLWxvZ28gY2xlYXJmaXhcIj4gPGRpdiBjbGFzcz1cImxvZ28gZmxcIj4gPGltZyBzcmM9XCIuLi8uLi9idW5kbGUvaW1nL2xvZ28ucG5nXCI+IDwvZGl2PiA8ZGl2IGNsYXNzPVwic2VhcmNoIGZsXCI+IDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2VhcmNoLW5hbWUgZmxcIj4gPHNwYW4gY2xhc3M9XCJzZWFyY2gtYnRuIGZyXCI+5pCcIOe0ojwvc3Bhbj4gPGltZyBzcmM9XCIuLi8uLi9idW5kbGUvaW1nL2ljb24tc2VhcmNoLnBuZ1wiIGNsYXNzPVwic2VhcmNoLWljb25cIj4gPGltZyBzcmM9XCIuLi8uLi9idW5kbGUvaW1nL2ljb24teXV5aW4ucG5nXCIgY2xhc3M9XCJ5dXlpbi1pY29uXCI+IDx1bCBjbGFzcz1cInNlYXJjaC1ob3RcIj48L3VsPiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJhbGwtbmF2IGNsZWFyZml4XCI+IDxkaXYgY2xhc3M9XCJhbGwtY2xhc3NpZnkgZmxcIj7lhajpg6jllYblk4HliIbnsbs8L2Rpdj4gPHVsIGNsYXNzPVwibmF2LWNsYXNzaWZ5IGZsXCI+ICc7XG4kZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGRhdGEtbnVtPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm51bWJlcik7XG4kb3V0Kz0nXCIgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvbGk+ICc7XG59KTtcbiRvdXQrPScgPC91bD4gPC9kaXY+IDxkaXYgY2xhc3M9XCJhbGwtbGlzdFwiPiA8dWwgY2xhc3M9XCJhbGxfbGlzdFwiPjwvdWw+IDxkaXYgY2xhc3M9XCJtb3JlLWNhdGVnb3JpZXNcIj4gPHNwYW4+5pu05aSa5YiG57G7PC9zcGFuPiAgPGRpdiBjbGFzcz1cIm1vcmUtZmVuIGNsZWFyZml4XCI+PC9kaXY+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+JztcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvaW50ZWdyYWwtdG9wLnRwbFxuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIDEyIiwiLypUTU9ESlM6e30qL1xyXG4hZnVuY3Rpb24gKCkge1xyXG5cdGZ1bmN0aW9uIGEoYSwgYikge1xyXG5cdFx0cmV0dXJuICgvc3RyaW5nfGZ1bmN0aW9uLy50ZXN0KHR5cGVvZiBiKSA/IGggOiBnKShhLCBiKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYihhLCBjKSB7XHJcblx0XHRyZXR1cm4gXCJzdHJpbmdcIiAhPSB0eXBlb2YgYSAmJiAoYyA9IHR5cGVvZiBhLCBcIm51bWJlclwiID09PSBjID8gYSArPSBcIlwiIDogYSA9IFwiZnVuY3Rpb25cIiA9PT0gYyA/IGIoYS5jYWxsKGEpKSA6IFwiXCIpLCBhXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjKGEpIHtcclxuXHRcdHJldHVybiBsW2FdXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkKGEpIHtcclxuXHRcdHJldHVybiBiKGEpLnJlcGxhY2UoLyYoPyFbXFx3I10rOyl8Wzw+XCInXS9nLCBjKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZShhLCBiKSB7XHJcblx0XHRpZiAobShhKSlmb3IgKHZhciBjID0gMCwgZCA9IGEubGVuZ3RoOyBkID4gYzsgYysrKWIuY2FsbChhLCBhW2NdLCBjLCBhKTsgZWxzZSBmb3IgKGMgaW4gYSliLmNhbGwoYSwgYVtjXSwgYylcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGYoYSwgYikge1xyXG5cdFx0dmFyIGMgPSAvKFxcLylbXlxcL10rXFwxXFwuXFwuXFwxLywgZCA9IChcIi4vXCIgKyBhKS5yZXBsYWNlKC9bXlxcL10rJC8sIFwiXCIpLCBlID0gZCArIGI7XHJcblx0XHRmb3IgKGUgPSBlLnJlcGxhY2UoL1xcL1xcLlxcLy9nLCBcIi9cIik7IGUubWF0Y2goYyk7KWUgPSBlLnJlcGxhY2UoYywgXCIvXCIpO1xyXG5cdFx0cmV0dXJuIGVcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGcoYiwgYykge1xyXG5cdFx0dmFyIGQgPSBhLmdldChiKSB8fCBpKHtmaWxlbmFtZTogYiwgbmFtZTogXCJSZW5kZXIgRXJyb3JcIiwgbWVzc2FnZTogXCJUZW1wbGF0ZSBub3QgZm91bmRcIn0pO1xyXG5cdFx0cmV0dXJuIGMgPyBkKGMpIDogZFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaChhLCBiKSB7XHJcblx0XHRpZiAoXCJzdHJpbmdcIiA9PSB0eXBlb2YgYikge1xyXG5cdFx0XHR2YXIgYyA9IGI7XHJcblx0XHRcdGIgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBrKGMpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBkID0galthXSA9IGZ1bmN0aW9uIChjKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBiKGMsIGEpICsgXCJcIlxyXG5cdFx0XHR9IGNhdGNoIChkKSB7XHJcblx0XHRcdFx0cmV0dXJuIGkoZCkoKVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIGQucHJvdG90eXBlID0gYi5wcm90b3R5cGUgPSBuLCBkLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gYiArIFwiXCJcclxuXHRcdH0sIGRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGkoYSkge1xyXG5cdFx0dmFyIGIgPSBcIntUZW1wbGF0ZSBFcnJvcn1cIiwgYyA9IGEuc3RhY2sgfHwgXCJcIjtcclxuXHRcdGlmIChjKWMgPSBjLnNwbGl0KFwiXFxuXCIpLnNsaWNlKDAsIDIpLmpvaW4oXCJcXG5cIik7IGVsc2UgZm9yICh2YXIgZCBpbiBhKWMgKz0gXCI8XCIgKyBkICsgXCI+XFxuXCIgKyBhW2RdICsgXCJcXG5cXG5cIjtcclxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiBcIm9iamVjdFwiID09IHR5cGVvZiBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoYiArIFwiXFxuXFxuXCIgKyBjKSwgYlxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGogPSBhLmNhY2hlID0ge30sIGsgPSB0aGlzLlN0cmluZywgbCA9IHtcclxuXHRcdFwiPFwiOiBcIiYjNjA7XCIsXHJcblx0XHRcIj5cIjogXCImIzYyO1wiLFxyXG5cdFx0J1wiJzogXCImIzM0O1wiLFxyXG5cdFx0XCInXCI6IFwiJiMzOTtcIixcclxuXHRcdFwiJlwiOiBcIiYjMzg7XCJcclxuXHR9LCBtID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYSkge1xyXG5cdFx0XHRyZXR1cm4gXCJbb2JqZWN0IEFycmF5XVwiID09PSB7fS50b1N0cmluZy5jYWxsKGEpXHJcblx0XHR9LCBuID0gYS51dGlscyA9IHtcclxuXHRcdCRoZWxwZXJzOiB7fSwgJGluY2x1ZGU6IGZ1bmN0aW9uIChhLCBiLCBjKSB7XHJcblx0XHRcdHJldHVybiBhID0gZihjLCBhKSwgZyhhLCBiKVxyXG5cdFx0fSwgJHN0cmluZzogYiwgJGVzY2FwZTogZCwgJGVhY2g6IGVcclxuXHR9LCBvID0gYS5oZWxwZXJzID0gbi4kaGVscGVycztcclxuXHRhLmdldCA9IGZ1bmN0aW9uIChhKSB7XHJcblx0XHRyZXR1cm4galthLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKV1cclxuXHR9LCBhLmhlbHBlciA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcblx0XHRvW2FdID0gYlxyXG5cdH0sIG1vZHVsZS5leHBvcnRzID0gYVxyXG59KCk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Rtb2Rqcy1sb2FkZXIvcnVudGltZS5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEgMTIgMTMiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL3R5cGUtbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGRhdGEtaWQ9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9J1wiPiA8ZGl2IGNsYXNzPVwibGlzdC10aXRsZVwiPuKAoiAnO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9kaXY+IDx1bCBjbGFzcz1cImxpc3QtaG90IGNsZWFyZml4XCI+ICc7XG4kZWFjaCgkdmFsdWUuY2hpbGQsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxsaSBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9saT4gJztcbn0pO1xuJG91dCs9JyA8L3VsPiA8ZGl2IGNsYXNzPVwiY2xhc3NpZi1kZXRhaWxcIj4gPHVsIGNsYXNzPVwibW9yZS1saXN0IGNsZWFyZml4XCI+ICc7XG4kZWFjaCgkdmFsdWUuY2hpbGQsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxsaSBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9saT4gJztcbn0pO1xuJG91dCs9JyA8L3VsPiA8L2Rpdj4gPC9saT4gJztcbn0pO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9oZWFkZXItbmF2L3RwbC90eXBlLWxpc3QudHBsXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEgMTIiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL2hvdC1saXN0JyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvbGk+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvaG90LWxpc3QudHBsXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEgMTIiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL21vcmUtZmVuJyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8dWwgY2xhc3M9XCJtb3JlLWxpc3QgY2xlYXJmaXhcIiBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4gPGRpdiBjbGFzcz1cIm1vcmUtdGl0bGVcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9kaXY+IDwvdWw+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvbW9yZS1mZW4udHBsXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEgMTIiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLWJvdHRvbScsJzxkaXYgY2xhc3M9XCJyZXR1cm4tdG9wXCI+PC9kaXY+IDxkaXYgY2xhc3M9XCJib3R0b21Db24gY2xlYXJmaXhcIj4gPHVsIGNsYXNzPVwiZm9vdC1uYXYgZ291d3UgZmwgY2xlYXJmaXhcIj4gPGRpdj7otK3nianmjIfljZc8L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPui0reeJqea1geeoizwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuS8muWRmOS7i+e7jTwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWboui0rS/mnLrnpag8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7luLjop4Hpl67popg8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7ogZTns7vlrqLmnI08L2E+IDwvbGk+IDwvdWw+IDx1bCBjbGFzcz1cImZvb3QtbmF2IHBlaXNvbmcgZmwgY2xlYXJmaXhcIj4gPGRpdj7phY3pgIHmlrnlvI88L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuS4iumXqOiHquaPkDwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPjIxMemZkOaXtui+vjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumFjemAgeacjeWKoeafpeivojwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumFjemAgei0ueaUtuWPluagh+WHhjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPua1t+WklumFjemAgTwvYT4gPC9saT4gPC91bD4gPHVsIGNsYXNzPVwiZm9vdC1uYXYgemhpZnUgZmwgY2xlYXJmaXhcIj4gPGRpdj7mlK/ku5jmlrnlvI88L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPui0p+WIsOS7mOasvjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWcqOe6v+aUr+S7mDwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWIhuacn+S7mOasvjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumCruWxgOaxh+asvjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWFrOWPuOi9rOi0pjwvYT4gPC9saT4gPC91bD4gPHVsIGNsYXNzPVwiZm9vdC1uYXYgc2hvdWhvdSBmbCBjbGVhcmZpeFwiPiA8ZGl2PuWUruWQjuacjeWKoTwvZGl2PiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+5ZSu5ZCO5pS/562WPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+5Lu35qC85L+d5oqkPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+6YCA5qy+6K+05piOPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+6L+U5L+uL+mAgOaNoui0pzwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWPlua2iOiuouWNlTwvYT4gPC9saT4gPC91bD4gPC9kaXY+Jyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvaW50ZWdyYWwtYm90dG9tLnRwbFxuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIDEyIiwiX2lkID0gMDtcclxudmFyIFNIT1dfUE9QX1RZUEVfU1VDQ0VTUyA9IDA7XHJcbnZhciBTSE9XX1BPUF9UWVBFX0ZBSUwgPSAxO1xyXG52YXIgU0hPV19QT1BfVFlQRV9XQVJOSU5HID0gMjtcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBhamF4OmZ1bmN0aW9uKHVybCwgcGFyYW1zLCBtZXRob2QsIHN1Y2Nlc3MsIGVycikge1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXHJcbiAgICAgICAgICAgIHR5cGU6IG1ldGhvZCxcclxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgJiYgc3VjY2VzcyhkYXRhKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgIGVyciAmJiBlcnIoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBmb3JFYWNoOiBmdW5jdGlvbiAoYXJyYXksIGNhbGxiYWNrLCBzY29wZSkge1xyXG4gICAgICAgIHNjb3BlID0gc2NvcGUgfHwgbnVsbDtcclxuICAgICAgICBhcnJheSA9IGFycmF5ID09IG51bGwgPyBbXSA6IGFycmF5O1xyXG4gICAgICAgIGFycmF5ID0gW10uc2xpY2UuY2FsbChhcnJheSk7Ly/lsIZhcnJheeWvueixoei9rOWMluS4uuaVsOe7hCxhcnJheeS4jeS4gOWumuaYr+S4quaVsOe7hFxyXG4gICAgICAgIGlmICghKGFycmF5IGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2FycmF5IGlzIG5vdCBhIEFycmF5ISEhJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2suY2FsbChzY29wZSwgYXJyYXlbaV0sIGkpKSB7Ly9hcnJheVtpXSxtYXBzW2ldLFxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIHVybOWPguaVsOiOt+WPluaOpeWPo++8jOe7j+i/h2RlY29kZVVSSe+8jOWmguaenOayoeacieS8oOmAkmtleeWAvO+8jOWImei/lOWbnuW9k+WJjemhtemdoueahOaJgOacieWPguaVsO+8jOWmguaenOaciWtleei/lOWbnmtleeWvueW6lOeahOWGheWuue+8jFxyXG4gICAgICog5aaC5p6ca2V55rKh5pyJ5a+55bqU55qE5YaF5a6577yM5YiZ6L+U5Zue56m65a2X56ym5LiyXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAqL1xyXG4gICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgdmFyIHBhcmFtc1N0ciA9IGxvY2F0aW9uLmhyZWYuaW5kZXhPZignIycpID4gMCA/IGxvY2F0aW9uLmhyZWYuc3Vic3RyaW5nKGxvY2F0aW9uLmhyZWYuaW5kZXhPZihcIiNcIikgKyAxLCBsb2NhdGlvbi5ocmVmLmxlbmd0aCkgOiAnJztcclxuICAgICAgICAvL+iOt+WPluaJgOacieeahCPljbPku6XliY3nmoTvvJ/lkI7pnaLnmoTlgLzvvIznm7jlvZPkuo5sb2NhdGlvbi5zZWFyY2hcclxuICAgICAgICB2YXIgbWFwcywgcGFyYW1zT2JqID0ge307XHJcbiAgICAgICAgaWYgKHBhcmFtc1N0ciA9PT0gJycpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXJhbXNTdHIgPSBkZWNvZGVVUkkocGFyYW1zU3RyKTsvL+ino+eggeeahHBhcmFtU3RyXHJcbiAgICAgICAgbWFwcyA9IHBhcmFtc1N0ci5zcGxpdCgnJicpOy8v5bCGJuS5i+WJjeeahOWtl+espuS4sumDveaUvuWFpeaVsOe7hOmHjOmdolxyXG4gICAgICAgIHRoaXMuZm9yRWFjaChtYXBzLCBmdW5jdGlvbiAoaXRlbSkgey8v5b6q546v5pWw57uELGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICB2YXIgcGFyYW1MaXN0ID0gaXRlbS5zcGxpdCgnPScpOy8vaXRlbeS4um1hcHNbaV1cclxuICAgICAgICAgICAgaWYgKHBhcmFtTGlzdC5sZW5ndGggPCAyICYmIHBhcmFtTGlzdFswXSA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmFtc09ialtwYXJhbUxpc3RbMF1dID0gcGFyYW1MaXN0WzFdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChrZXkpIHsvL+WmguaenGtleeacieWAvOW+l+ivnVxyXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zT2JqW2tleV0gfHwgJyc7Ly/liJnov5Tlm57lr7nosaHph4zlj6/ku6XlsZ7mgKfnmoTlgLzlkKbliJnov5Tlm57nqbpcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zT2JqOy8v5aaC5p6ca2V55Lyg6L+H5p2l55qE5piv5rKh5pyJ55qE6K+d77yM5Y2z5LuA5LmI6YO95rKh5Lyg55qE6K+d5YiZ6L+U5ZuecGFyYW1zT2Jq55qE5a+56LGhXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdldFF1ZXJ5U3RyaW5nOmZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChcIihefCYpXCIgKyBuYW1lICsgXCI9KFteJl0qKSgmfCQpXCIsXCJpXCIpO1xyXG4gICAgICAgIHZhciByID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkubWF0Y2gocmVnKTtcclxuICAgICAgICBpZiAociE9bnVsbCkgcmV0dXJuIChyWzJdKTsgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG4gICAgYWRkRXZlbnQ6IGZ1bmN0aW9uIChlbCwgdHlwZSwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHsvL+WmguaenOmhtemdouaWh+aho+S4reWtmOWcqGF0dGFjaEV2ZW505pa55rOVXHJcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zLnNwbGljZSgwLCAwLCB3aW5kb3cuZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoZWwsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGVsLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8v5piv5ZCm5pivSUU2NzhcclxuICAgIGlzSUU2Nzg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKCdhfmInLnNwbGl0KC8ofikvKSlbMV0gPT0gXCJiXCI7XHJcbiAgICB9LFxyXG4gICAgLy/ljrvnqbrmoLxcclxuICAgIHRyaW1BbGw6IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyArL2csICcnKTtcclxuICAgIH0sXHJcbiAgICB0cmltQmxhbms6ZnVuY3Rpb24ocGFyYW1zKXtcclxuICAgICAgICAvL2Zvcm3ooajljZXluo/liJfljJbkuYvlkI7ljrvliY3lkI7nqbrmoLxcclxuICAgICAgICBwYXJhbXM9IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMpLnNwbGl0KCcmJyk7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDtpPHBhcmFtcy5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgdmFyIHBhcmFtID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgIHBhcmFtWzFdPSBwYXJhbVsxXS5yZXBsYWNlKC8oXlxcKyopfChcXCsqJCl8KF5cXHMqKXwoXFxzKiQpL2csJycpO1xyXG4gICAgICAgICAgICBwYXJhbXNbaV0gPSBwYXJhbS5qb2luKCc9Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXJhbXMuam9pbignJicpO1xyXG4gICAgfSxcclxuICAgIC8v6aqM6K+B6IGU57O75pa55byPIOaJi+acuuWPtyDluqfmnLpcclxuICAgIGNoZWNrX3Bob25lOmZ1bmN0aW9uKHBob25lKXtcclxuICAgICAgICB2YXIgcmVnID0gL14oKDBcXGR7MiwzfS1cXGR7Nyw4fSl8KDFbMzU4NF1cXGR7OX0pKSQvO1xyXG4gICAgICAgIHJldHVybiByZWcudGVzdChwaG9uZSk7XHJcbiAgICB9LFxyXG4gICAgLy/pqozor4Hoi7HmloflkI1cclxuICAgIGNoZWNrX2VuZ2xpc2g6ZnVuY3Rpb24oZW4pe1xyXG4gICAgICAgIHZhciByZWcgPSAvXlthLXpBLVpdKyhcXHMqW2EtekEtWl0rKXswLH0kLztcclxuICAgICAgICByZXR1cm4gcmVnLnRlc3QoZW4pO1xyXG4gICAgfSxcclxuICAgIC8v6aqM6K+B6YKu566xXHJcbiAgICBjaGVja19lbWFpbDpmdW5jdGlvbihlbWFpbCl7XHJcbiAgICAgICAgdmFyIHJlZyA9ICAvXlxcdytAXFx3K1xcLlxcdyskLztcclxuICAgICAgICByZXR1cm4gcmVnLnRlc3QoZW1haWwpO1xyXG4gICAgfSxcclxuICAgIC8v5Y+q6IO95ZCr6aqM6K+B5pWw5a2X5ZKMLlxyXG4gICAgY2hlY2tfbnVtZG90OmZ1bmN0aW9uKHZhbCl7XHJcbiAgICAgICAgdmFyIHJlZyA9ICAvXlxcZCsoPzpcXC5cXGR7MSwyfSk/JC87XHJcbiAgICAgICAgcmV0dXJuIHJlZy50ZXN0KHZhbCk7XHJcbiAgICB9LFxyXG4gICAgU0hPV19QT1BfVFlQRV9TVUNDRVNTOiBTSE9XX1BPUF9UWVBFX1NVQ0NFU1MsXHJcbiAgICBTSE9XX1BPUF9UWVBFX0ZBSUw6IFNIT1dfUE9QX1RZUEVfRkFJTCxcclxuICAgIFNIT1dfUE9QX1RZUEVfV0FSTklORzogU0hPV19QT1BfVFlQRV9XQVJOSU5HLFxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrmj5DnpLrkv6Hmga/vvIjopoHmsYLmr4/kuKropoHmmL7npLrnmoTpobXpnaLpg73opoHmnIlwb3AtbWFzayBkaXbvvInvvIxcclxuICAgICAqIOitpuekuuWbvueJh+WRveWQjeS9v+eUqOagvOW8j3Nob3ctcG9wMC5wbmfku6PooahzdWNlc3PvvIxzaG93LXBvcDEucG5n5Luj6KGoZmFpbO+8jOi3n+S4iui+ueeahOWPguaVsOWumuS5ieS4gOiHtFxyXG4gICAgICogQHBhcmFtIHRpdGxlIOmhtumDqOaYvuekuuahhueahOagh+mimFxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2Ug5YaF5a655YC8XHJcbiAgICAgKiBAcGFyYW0gdHlwZSDorabnpLrlm77niYfnmoTnsbvlnovvvIzpgJrov4d1dGlsLmpz6L+U5Zue5a+56LGh6I635Y+W77yM5LiN5YaZ6buY6K6k5pivc3VjY2Vzc1xyXG4gICAgICovXHJcbiAgICBzaG93TXNnSW5mbzogZnVuY3Rpb24gKHRpdGxlLCBtZXNzYWdlLCB0eXBlKSB7XHJcbiAgICAgICAgdHlwZSA9IHR5cGUgPyB0eXBlIDogU0hPV19QT1BfVFlQRV9TVUNDRVNTO1xyXG4gICAgICAgIHZhciBtc2dJbmZvSWQgPSAnbXNnLXBvcC0nICsgX2lkKys7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICAgICAgbXNnSW5mb0lkOiBtc2dJbmZvSWQsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vICAgJChcImJvZHlcIikuYXBwZW5kKHRlbXBsYXRlKCd3YXJuaW5nLWJveC93YXJuaW5nLWJveC10ZW1wbCcsIGRhdGEpKTtcclxuICAgICAgICAvL+WFs+mXreWbvuagh+i3n+WPlua2iOeahOeCueWHu+S6i+S7tuWwgeijhe+8jOS9huaYr+ehruiupOeahOWwseiHquW3seWGmVxyXG4gICAgICAgICQoXCIjXCIgKyBtc2dJbmZvSWQgKyBcIiAuY2FuY2VsLCNcIiArIG1zZ0luZm9JZCArIFwiIC5jbG9zZS1ib3hcIikuY2xpY2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcjJyArIG1zZ0luZm9JZCkuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiLnBvcC1tYXNrXCIpLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcjJyArIG1zZ0luZm9JZCkuc2hvdygpO1xyXG4gICAgICAgICAgICAkKFwiLnBvcC1tYXNrXCIpLnNob3coKTtcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGFwZXJ0SW5mbzogZnVuY3Rpb24gKHRpdGxlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIHBvcHVwID0gXCJwb3AtdXAtZGl2XCI7XHJcbiAgICAgICAgJChcIi5wb3AtbWFza1wiKS5zaG93KCk7XHJcbiAgICAgICAgJChcIiNcIitwb3B1cCkuc2hvdygpO1xyXG4gICAgICAgICQoXCIuaGVhZFwiKS5maW5kKFwiaDFcIikuaHRtbCh0aXRsZSk7XHJcbiAgICAgICAgJChcIi5wb3AtY29udGVudFwiKS5odG1sKG1lc3NhZ2UpO1xyXG4gICAgICAgICQoXCIjXCIrcG9wdXApLmZpbmQoXCIuY2xvc2VcIikuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCgnIycgKyBwb3B1cCkuaGlkZSgpO1xyXG4gICAgICAgICAgICAkKFwiLnBvcC1tYXNrXCIpLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgfSxcclxuICAgIGNsb3NlUG9wOmZ1bmN0aW9uKHBvcHVwKXtcclxuICAgICAgICAkKCcjJyArIHBvcHVwKS5oaWRlKCk7XHJcbiAgICAgICAgJChcIi5wb3AtbWFza1wiKS5oaWRlKCk7XHJcbiAgICB9LFxyXG4gICAgLy/moLnmja7pmL/mi4nkvK/mlbDlrZfnlJ/miJDkuK3mlofmlbDlrZdcclxuICAgIGNvdmVyTnVtOiBmdW5jdGlvbiAobnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKG51bWJlciAtIDApKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXJnIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobnVtYmVyLmxlbmd0aCA+IDEyKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXJnIGlzIHRvbyBiaWcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGEgPSAobnVtYmVyICsgJycpLnNwbGl0KCcnKSxcclxuICAgICAgICAgICAgcyA9IFtdLFxyXG4gICAgICAgICAgICB0ID0gdGhpcyxcclxuICAgICAgICAgICAgY2hhcnMgPSAn6Zu25LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5LmdJyxcclxuICAgICAgICAgICAgdW5pdHMgPSAn5Liq5Y2B55m+5Y2D5LiHQCMl5Lq/XiZ+JztcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGEubGVuZ3RoIC0gMTsgaSA8PSBqOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGogPT0gMSB8fCBqID09IDUgfHwgaiA9PSA5KSB7Ly/kuKTkvY3mlbAg5aSE55CG54m55q6K55qEIDEqXHJcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbaV0gIT0gJzEnKSBzLnB1c2goY2hhcnMuY2hhckF0KGFbaV0pKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5wdXNoKGNoYXJzLmNoYXJBdChhW2ldKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzLnB1c2goY2hhcnMuY2hhckF0KGFbaV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgICAgICBzLnB1c2godW5pdHMuY2hhckF0KGogLSBpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9yZXR1cm4gcztcclxuICAgICAgICByZXR1cm4gcy5qb2luKCcnKS5yZXBsYWNlKC/pm7YoW+WNgeeZvuWNg+S4h+S6v0AjJV4mfl0pL2csIGZ1bmN0aW9uIChtLCBkLCBiKSB7Ly/kvJjlhYjlpITnkIYg6Zu255m+IOmbtuWNgyDnrYlcclxuICAgICAgICAgICAgYiA9IHVuaXRzLmluZGV4T2YoZCk7XHJcbiAgICAgICAgICAgIGlmIChiICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA9PSAn5Lq/JykgcmV0dXJuIGQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA9PSAn5LiHJylyZXR1cm4gZDtcclxuICAgICAgICAgICAgICAgIGlmIChhW2ogLSBiXSA9PSAnMCcpIHJldHVybiAn6Zu2JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfSkucmVwbGFjZSgv6Zu2Ky9nLCAn6Zu2JykucmVwbGFjZSgv6Zu2KFvkuIfkur9dKS9nLCBmdW5jdGlvbiAobSwgYikgey8vIOmbtueZviDpm7bljYPlpITnkIblkI4g5Y+v6IO95Ye6546wIOmbtumbtuebuOi/nueahCDlho3lpITnkIbnu5PlsL7kuLrpm7bnmoRcclxuICAgICAgICAgICAgcmV0dXJuIGI7XHJcbiAgICAgICAgfSkucmVwbGFjZSgv5Lq/W+S4h+WNg+eZvl0vZywgJ+S6vycpLnJlcGxhY2UoL1vpm7ZdJC8sICcnKS5yZXBsYWNlKC9bQCMlXiZ+XS9nLCBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICByZXR1cm4geydAJzogJ+WNgScsICcjJzogJ+eZvicsICclJzogJ+WNgycsICdeJzogJ+WNgScsICcmJzogJ+eZvicsICd+JzogJ+WNgyd9W21dO1xyXG4gICAgICAgIH0pLnJlcGxhY2UoLyhb5Lq/5LiHXSkoW+S4gC3kuZ1dKS9nLCBmdW5jdGlvbiAobSwgZCwgYiwgYykge1xyXG4gICAgICAgICAgICBjID0gdW5pdHMuaW5kZXhPZihkKTtcclxuICAgICAgICAgICAgaWYgKGMgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhW2ogLSBjXSA9PSAnMCcpIHJldHVybiBkICsgJ+mbticgKyBiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8v6K6h566XZWNoYXJ0IHRpdGxlIOmrmOW6plxyXG4gICAgZUhlaWdodDogZnVuY3Rpb24gKGFycmF5KSB7XHJcbiAgICAgICAgYXJyYXkgPSBbXS5zbGljZS5jYWxsKGFycmF5KTsvL+WwhmFycmF55a+56LGh6L2s5YyW5Li65pWw57uELGFycmF55LiN5LiA5a6a5piv5Liq5pWw57uEXHJcbiAgICAgICAgaWYgKCEoYXJyYXkgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgU3RyaW5nUHggPSBhcnJheS5qb2luKCcnKS5sZW5ndGggKiAxNDtcclxuICAgICAgICB2YXIgZWxzZVBMID0gYXJyYXkubGVuZ3RoICogKDIwICsgMTApO1xyXG4gICAgICAgIHZhciBZSGVpZ2h0ID0gTWF0aC5jZWlsKChTdHJpbmdQeCArIGVsc2VQTCkgLyA4NTApICogMjQgKyAxMDsvL+WQkeS4iuS/ruatozEw5YOP57SgXHJcbiAgICAgICAgcmV0dXJuIFlIZWlnaHQgPCA2MCA/IDYwIDogWUhlaWdodDtcclxuICAgIH0sXHJcbiAgICAvL+i9rOaNouaXtumXtOagvOW8j1xyXG4gICAgZ2V0VGltZTogZnVuY3Rpb24gKGRhdGUsIGZvcm1hdCkge1xyXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlICogMTAwMCk7XHJcblxyXG4gICAgICAgIHZhciBtYXAgPSB7XHJcbiAgICAgICAgICAgIFwiTVwiOiBkYXRlLmdldE1vbnRoKCkgKyAxLCAvL+aciOS7vVxyXG4gICAgICAgICAgICBcImRcIjogZGF0ZS5nZXREYXRlKCksIC8v5pelXHJcbiAgICAgICAgICAgIFwiaFwiOiBkYXRlLmdldEhvdXJzKCksIC8v5bCP5pe2XHJcbiAgICAgICAgICAgIFwibVwiOiBkYXRlLmdldE1pbnV0ZXMoKSwgLy/liIZcclxuICAgICAgICAgICAgXCJzXCI6IGRhdGUuZ2V0U2Vjb25kcygpLCAvL+enklxyXG4gICAgICAgICAgICBcInFcIjogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSwgLy/lraPluqZcclxuICAgICAgICAgICAgXCJTXCI6IGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLy/mr6vnp5JcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKC8oW3lNZGhtc3FTXSkrL2csIGZ1bmN0aW9uIChhbGwsIHQpIHtcclxuICAgICAgICAgICAgdmFyIHYgPSBtYXBbdF07XHJcbiAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbGwubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSAnMCcgKyB2O1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSB2LnN1YnN0cih2Lmxlbmd0aCAtIDIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodCA9PT0gJ3knKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRhdGUuZ2V0RnVsbFllYXIoKSArICcnKS5zdWJzdHIoNCAtIGFsbC5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhbGw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdDtcclxuICAgIH0sXHJcbiAgICBnZXRCcm93c2VyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIFN5cyA9IHt9O1xyXG4gICAgICAgIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB2YXIgcztcclxuICAgICAgICAocyA9IHVhLm1hdGNoKC9ydjooW1xcZC5dKylcXCkgbGlrZSBnZWNrby8pKSA/IFN5cy5pZSA9IHNbMV0gOlxyXG4gICAgICAgICAgICAocyA9IHVhLm1hdGNoKC9tc2llIChbXFxkLl0rKS8pKSA/IFN5cy5pZSA9IHNbMV0gOlxyXG4gICAgICAgICAgICAgICAgKHMgPSB1YS5tYXRjaCgvZmlyZWZveFxcLyhbXFxkLl0rKS8pKSA/IFN5cy5maXJlZm94ID0gc1sxXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgKHMgPSB1YS5tYXRjaCgvY2hyb21lXFwvKFtcXGQuXSspLykpID8gU3lzLmNocm9tZSA9IHNbMV0gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocyA9IHVhLm1hdGNoKC9vcGVyYS4oW1xcZC5dKykvKSkgPyBTeXMub3BlcmEgPSBzWzFdIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzID0gdWEubWF0Y2goL3ZlcnNpb25cXC8oW1xcZC5dKykuKnNhZmFyaS8pKSA/IFN5cy5zYWZhcmkgPSBzWzFdIDogMDtcclxuXHJcbiAgICAgICAgaWYgKFN5cy5pZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2llJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU3lzLmZpcmVmb3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdmaXJlZm94J1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU3lzLmNocm9tZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2Nocm9tZSdcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFN5cy5vcGVyYSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ29wZXJhJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU3lzLnNhZmFyaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3NhZmFyaSdcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy/orqHnrpfmmL7npLrlrZfnrKbkuLLnmoTplb/luqZcclxuICAgIHN0ckRpc3BsYXlmb3JtYXQ6IGZ1bmN0aW9uIChzdHJpbmcsIG1heExlbmd0aCkge1xyXG4gICAgICAgIHZhciBudW0gPSAwO1xyXG4gICAgICAgIHZhciBTVFJfTlVNQkVSID0gbWF4TGVuZ3RoID8gbWF4TGVuZ3RoIDogMzA7XHJcbiAgICAgICAgdmFyIHBhdCA9IG5ldyBSZWdFeHAoJ1swLTlhLXpBLVotXScpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKHN0cmluZy5sZW5ndGggPiBTVFJfTlVNQkVSID8gU1RSX05VTUJFUiA6IHN0cmluZy5sZW5ndGgpOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHBhdC50ZXN0KHN0cmluZ1tpXSkpIHtcclxuICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbnVtICs9IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG51bSA+IFNUUl9OVU1CRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmcuc3Vic3RyaW5nKDAsIGkpICsgJy4uLic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZztcclxuICAgIH0sXHJcbiAgICAvL+agueaNruS4reaWh+aVsOWtl+eUn+aIkOmYv+aLieS8r+aVsOWtl1xyXG4gICAgdG9OdW06ZnVuY3Rpb24oc3RyKXtcclxuICAgICAgICBpZih0eXBlb2Yoc3RyKSAhPT1cInN0cmluZ1wiKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdHIgaXMgbm90IGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjaGFydHMgPSB7XHJcbiAgICAgICAgICAgIFwi5LiAXCI6MSxcclxuICAgICAgICAgICAgXCLkuoxcIjoyLFxyXG4gICAgICAgICAgICBcIuS4iVwiOjMsXHJcbiAgICAgICAgICAgIFwi5ZubXCI6NCxcclxuICAgICAgICAgICAgXCLkupRcIjo1LFxyXG4gICAgICAgICAgICBcIuWFrVwiOjYsXHJcbiAgICAgICAgICAgIFwi5LiDXCI6NyxcclxuICAgICAgICAgICAgXCLlhatcIjo4LFxyXG4gICAgICAgICAgICBcIuS5nVwiOjlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBudW1zID1bXTtcclxuXHJcbiAgICAgICAgaWYoc3RyLmxlbmd0aCA9PTEpe1xyXG4gICAgICAgICAgICByZXR1cm4gY2hhcnRzW3N0cl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7aTxzdHIubGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgICBpZihzdHJbaV0gPT0gXCLljYFcIil7XHJcbiAgICAgICAgICAgICAgICBudW1zLnB1c2goXCLljYFcIik7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbnVtcy5wdXNoKGNoYXJ0c1tzdHJbaV1dKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IodmFyIGkgPSAwLGo9bnVtcy5sZW5ndGgtMTtpPD1qO2krKyl7XHJcbiAgICAgICAgICAgIGlmKG51bXNbaV0gPT1cIuWNgVwiKXtcclxuICAgICAgICAgICAgICAgIG51bXNbaV0gPSAoaSA9PSAwICYmIDEpIHx8KCBpPT1qICYmICcwJykgfHwgJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bXMuam9pbihcIlwiKS0wO1xyXG5cclxuICAgIH0sXHJcbiAgICAvL+S4jeWQjOW5tOe6p+S4jeWQjOePreeahOaOkuW6j1xyXG4gICAgc29ydGdyYWRlOmZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmKGRhdGEubGVuZ3RoPD0xKXtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXEgPSAvW+S4gOS6jOS4ieWbm+S6lOWFreS4g+WFq+S5neWNgV0rL2c7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHRHcmFkZXMgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIGdyYWRlcz17fTsvL3tbMTpbXV19XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICB2YXIgZ3JhZGVOdW0gPSB0aGlzLnRvTnVtKGRhdGFbaV0uY2xhc3Nlc05hbWUubWF0Y2gocmVxKVswXSk7XHJcbiAgICAgICAgICAgIGlmKCFncmFkZXNbZ3JhZGVOdW1dKXtcclxuICAgICAgICAgICAgICAgIGdyYWRlc1tncmFkZU51bV0gPVtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdyYWRlc1tncmFkZU51bV0ucHVzaChkYXRhW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yKCB2YXIgaWkgaW4gZ3JhZGVzKXtcclxuICAgICAgICAgICAgcmVzdWx0R3JhZGVzID1yZXN1bHRHcmFkZXMuY29uY2F0KHRoaXMuc29ydENsYXNzKGdyYWRlc1tpaV0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdEdyYWRlcztcclxuICAgIH0sXHJcbiAgICAvL+agueaNruWQjOW5tOe6p+S4jeWQjOePree6p+aOkuW6j1xyXG4gICAgc29ydENsYXNzOmZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmKGRhdGEubGVuZ3RoPD0xKXtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0b0luZGV4ID0gTWF0aC5mbG9vcihkYXRhLmxlbmd0aC8yKTtcclxuICAgICAgICB2YXIgdG9OdW0gPSBkYXRhW3RvSW5kZXhdLmNsYXNzZXNOYW1lLm1hdGNoKC9cXGQrL2cpWzBdLTA7XHJcbiAgICAgICAgdmFyIGxlZnRDbGFzcz0gW10scmlnaHRDbGFzcyA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8ZGF0YS5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgLy9tb2RlbC51c2VyRGF0YS5jbGFzc2VzW2ldLmNsYXNzTnVtID0gZGF0YVtpXS5jbGFzc2VzTmFtZS5tYXRjaCgvXFxkKy9nKVswXS0wO1xyXG4gICAgICAgICAgICBpZihpID09dG9JbmRleCl7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0b051bSA+ZGF0YVtpXS5jbGFzc2VzTmFtZS5tYXRjaCgvXFxkKy9nKVswXS0wKXtcclxuICAgICAgICAgICAgICAgIGxlZnRDbGFzcy5wdXNoKGRhdGFbaV0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHJpZ2h0Q2xhc3MucHVzaChkYXRhW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm5cdCB0aGlzLnNvcnRDbGFzcyhsZWZ0Q2xhc3MpLmNvbmNhdCggZGF0YVt0b0luZGV4XSx0aGlzLnNvcnRDbGFzcyhyaWdodENsYXNzKSk7XHJcbiAgICB9XHJcblxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3V0aWxzcGFyZS91dGlsLmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSA2IDcgMTAgMTEiLCIvKipcclxuICogQ3JlYXRlZCBieSBodWkgb24gMjAxNi8xMi8yOCAwMDI4LlxyXG4gKi9cclxudmFyICBub0RhdGFUcGw9cmVxdWlyZShcIi4vbm8tZGF0YS50cGxcIik7XHJcbi8qXHJcbiogZGF0YSDmsqHmnInmlbDmja7pnIDopoHloavlhpnnmoTmj5DnpLrlhoXlrrlcclxuKiAqL1xyXG5tb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihkYXRhKXtcclxuICAgcmV0dXJuIG5vRGF0YVRwbChkYXRhKTtcclxufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9uby1kYXRhL25vLWRhdGEuanNcbi8vIG1vZHVsZSBpZCA9IDE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNSA2IDcgMTMiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL25vLWRhdGEvbm8tZGF0YScsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZXNjYXBlPSR1dGlscy4kZXNjYXBlLGNvbnRlbnQ9JGRhdGEuY29udGVudCwkb3V0PScnOyRvdXQrPSc8ZGl2IGNsYXNzPVwibm8tZGF0YVwiPiA8ZGl2IGNsYXNzPVwibm8taW1nXCI+PC9kaXY+IDxkaXYgY2xhc3M9XCJjb250XCI+JztcbiRvdXQrPSRlc2NhcGUoY29udGVudCk7XG4kb3V0Kz0nPC9kaXY+IDwvZGl2Pic7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL25vLWRhdGEvbm8tZGF0YS50cGxcbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNSA2IDcgMTMiLCIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDYgNyIsIi8qXHJcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXHJcbiovXHJcbnZhciBzdHlsZXNJbkRvbSA9IHt9LFxyXG5cdG1lbW9pemUgPSBmdW5jdGlvbihmbikge1xyXG5cdFx0dmFyIG1lbW87XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAodHlwZW9mIG1lbW8gPT09IFwidW5kZWZpbmVkXCIpIG1lbW8gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0XHRyZXR1cm4gbWVtbztcclxuXHRcdH07XHJcblx0fSxcclxuXHRpc09sZElFID0gbWVtb2l6ZShmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiAvbXNpZSBbNi05XVxcYi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKTtcclxuXHR9KSxcclxuXHRnZXRIZWFkRWxlbWVudCA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xyXG5cdH0pLFxyXG5cdHNpbmdsZXRvbkVsZW1lbnQgPSBudWxsLFxyXG5cdHNpbmdsZXRvbkNvdW50ZXIgPSAwLFxyXG5cdHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wID0gW107XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIG9wdGlvbnMpIHtcclxuXHRpZih0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcclxuXHRcdGlmKHR5cGVvZiBkb2N1bWVudCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0eWxlLWxvYWRlciBjYW5ub3QgYmUgdXNlZCBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xyXG5cdH1cclxuXHJcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XHJcblx0Ly8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxyXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gPT09IFwidW5kZWZpbmVkXCIpIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xyXG5cclxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSBib3R0b20gb2YgPGhlYWQ+LlxyXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ1bmRlZmluZWRcIikgb3B0aW9ucy5pbnNlcnRBdCA9IFwiYm90dG9tXCI7XHJcblxyXG5cdHZhciBzdHlsZXMgPSBsaXN0VG9TdHlsZXMobGlzdCk7XHJcblx0YWRkU3R5bGVzVG9Eb20oc3R5bGVzLCBvcHRpb25zKTtcclxuXHJcblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XHJcblx0XHR2YXIgbWF5UmVtb3ZlID0gW107XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xyXG5cdFx0XHR2YXIgZG9tU3R5bGUgPSBzdHlsZXNJbkRvbVtpdGVtLmlkXTtcclxuXHRcdFx0ZG9tU3R5bGUucmVmcy0tO1xyXG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XHJcblx0XHR9XHJcblx0XHRpZihuZXdMaXN0KSB7XHJcblx0XHRcdHZhciBuZXdTdHlsZXMgPSBsaXN0VG9TdHlsZXMobmV3TGlzdCk7XHJcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XHJcblx0XHR9XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbWF5UmVtb3ZlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcclxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xyXG5cdFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKylcclxuXHRcdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKCk7XHJcblx0XHRcdFx0ZGVsZXRlIHN0eWxlc0luRG9tW2RvbVN0eWxlLmlkXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucykge1xyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xyXG5cdFx0dmFyIGRvbVN0eWxlID0gc3R5bGVzSW5Eb21baXRlbS5pZF07XHJcblx0XHRpZihkb21TdHlsZSkge1xyXG5cdFx0XHRkb21TdHlsZS5yZWZzKys7XHJcblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBkb21TdHlsZS5wYXJ0cy5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGZvcig7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0ZG9tU3R5bGUucGFydHMucHVzaChhZGRTdHlsZShpdGVtLnBhcnRzW2pdLCBvcHRpb25zKSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciBwYXJ0cyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHN0eWxlc0luRG9tW2l0ZW0uaWRdID0ge2lkOiBpdGVtLmlkLCByZWZzOiAxLCBwYXJ0czogcGFydHN9O1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzKGxpc3QpIHtcclxuXHR2YXIgc3R5bGVzID0gW107XHJcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xyXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XHJcblx0XHR2YXIgaWQgPSBpdGVtWzBdO1xyXG5cdFx0dmFyIGNzcyA9IGl0ZW1bMV07XHJcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xyXG5cdFx0dmFyIHNvdXJjZU1hcCA9IGl0ZW1bM107XHJcblx0XHR2YXIgcGFydCA9IHtjc3M6IGNzcywgbWVkaWE6IG1lZGlhLCBzb3VyY2VNYXA6IHNvdXJjZU1hcH07XHJcblx0XHRpZighbmV3U3R5bGVzW2lkXSlcclxuXHRcdFx0c3R5bGVzLnB1c2gobmV3U3R5bGVzW2lkXSA9IHtpZDogaWQsIHBhcnRzOiBbcGFydF19KTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xyXG5cdH1cclxuXHRyZXR1cm4gc3R5bGVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KSB7XHJcblx0dmFyIGhlYWQgPSBnZXRIZWFkRWxlbWVudCgpO1xyXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wW3N0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wLmxlbmd0aCAtIDFdO1xyXG5cdGlmIChvcHRpb25zLmluc2VydEF0ID09PSBcInRvcFwiKSB7XHJcblx0XHRpZighbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcclxuXHRcdFx0aGVhZC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBoZWFkLmZpcnN0Q2hpbGQpO1xyXG5cdFx0fSBlbHNlIGlmKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XHJcblx0XHRcdGhlYWQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AubmV4dFNpYmxpbmcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xyXG5cdFx0fVxyXG5cdFx0c3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xyXG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xyXG5cdFx0aGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0Jy4gTXVzdCBiZSAndG9wJyBvciAnYm90dG9tJy5cIik7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XHJcblx0c3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcclxuXHR2YXIgaWR4ID0gc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AuaW5kZXhPZihzdHlsZUVsZW1lbnQpO1xyXG5cdGlmKGlkeCA+PSAwKSB7XHJcblx0XHRzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5zcGxpY2UoaWR4LCAxKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSB7XHJcblx0dmFyIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcclxuXHRzdHlsZUVsZW1lbnQudHlwZSA9IFwidGV4dC9jc3NcIjtcclxuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGVFbGVtZW50KTtcclxuXHRyZXR1cm4gc3R5bGVFbGVtZW50O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKSB7XHJcblx0dmFyIGxpbmtFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XHJcblx0bGlua0VsZW1lbnQucmVsID0gXCJzdHlsZXNoZWV0XCI7XHJcblx0aW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMsIGxpbmtFbGVtZW50KTtcclxuXHRyZXR1cm4gbGlua0VsZW1lbnQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xyXG5cdHZhciBzdHlsZUVsZW1lbnQsIHVwZGF0ZSwgcmVtb3ZlO1xyXG5cclxuXHRpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcclxuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xyXG5cdFx0c3R5bGVFbGVtZW50ID0gc2luZ2xldG9uRWxlbWVudCB8fCAoc2luZ2xldG9uRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XHJcblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCBmYWxzZSk7XHJcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGVFbGVtZW50LCBzdHlsZUluZGV4LCB0cnVlKTtcclxuXHR9IGVsc2UgaWYob2JqLnNvdXJjZU1hcCAmJlxyXG5cdFx0dHlwZW9mIFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgVVJMLmNyZWF0ZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgQmxvYiA9PT0gXCJmdW5jdGlvblwiICYmXHJcblx0XHR0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRzdHlsZUVsZW1lbnQgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcclxuXHRcdHVwZGF0ZSA9IHVwZGF0ZUxpbmsuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xyXG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xyXG5cdFx0XHRpZihzdHlsZUVsZW1lbnQuaHJlZilcclxuXHRcdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHN0eWxlRWxlbWVudC5ocmVmKTtcclxuXHRcdH07XHJcblx0fSBlbHNlIHtcclxuXHRcdHN0eWxlRWxlbWVudCA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcclxuXHRcdHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZUVsZW1lbnQpO1xyXG5cdFx0cmVtb3ZlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZShvYmopO1xyXG5cclxuXHRyZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XHJcblx0XHRpZihuZXdPYmopIHtcclxuXHRcdFx0aWYobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0dXBkYXRlKG9iaiA9IG5ld09iaik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZW1vdmUoKTtcclxuXHRcdH1cclxuXHR9O1xyXG59XHJcblxyXG52YXIgcmVwbGFjZVRleHQgPSAoZnVuY3Rpb24gKCkge1xyXG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcclxuXHJcblx0cmV0dXJuIGZ1bmN0aW9uIChpbmRleCwgcmVwbGFjZW1lbnQpIHtcclxuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcclxuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xyXG5cdH07XHJcbn0pKCk7XHJcblxyXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlRWxlbWVudCwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XHJcblx0dmFyIGNzcyA9IHJlbW92ZSA/IFwiXCIgOiBvYmouY3NzO1xyXG5cclxuXHRpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcclxuXHRcdHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xyXG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZUVsZW1lbnQuY2hpbGROb2RlcztcclxuXHRcdGlmIChjaGlsZE5vZGVzW2luZGV4XSkgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xyXG5cdFx0XHRzdHlsZUVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChjc3NOb2RlKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGVFbGVtZW50LCBvYmopIHtcclxuXHR2YXIgY3NzID0gb2JqLmNzcztcclxuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XHJcblx0dmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XHJcblxyXG5cdGlmKG1lZGlhKSB7XHJcblx0XHRzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIiwgbWVkaWEpXHJcblx0fVxyXG5cclxuXHRpZihzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xyXG5cdFx0c3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcclxuXHR9IGVsc2Uge1xyXG5cdFx0d2hpbGUoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcclxuXHRcdFx0c3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcclxuXHRcdH1cclxuXHRcdHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUxpbmsobGlua0VsZW1lbnQsIG9iaikge1xyXG5cdHZhciBjc3MgPSBvYmouY3NzO1xyXG5cdHZhciBtZWRpYSA9IG9iai5tZWRpYTtcclxuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcclxuXHJcblx0aWYoc291cmNlTWFwKSB7XHJcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yNjYwMzg3NVxyXG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xyXG5cdH1cclxuXHJcblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XHJcblxyXG5cdHZhciBvbGRTcmMgPSBsaW5rRWxlbWVudC5ocmVmO1xyXG5cclxuXHRsaW5rRWxlbWVudC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuXHJcblx0aWYob2xkU3JjKVxyXG5cdFx0VVJMLnJldm9rZU9iamVjdFVSTChvbGRTcmMpO1xyXG59XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9zdHlsZS1sb2FkZXIvYWRkU3R5bGVzLmpzXG4vLyBtb2R1bGUgaWQgPSAyOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSA2IDciLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgndHBsL2NvbW1vZGl0eS1saXN0L2hvdC1saXN0JyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgY2xhc3M9XCJmbCBjbGVhcmZpeFwiIGRhdGEtaWQ9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9J1wiPiA8aW1nIGNsYXNzPVwiZmxcIiBzcmM9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUub25lUGhvdG8pO1xuJG91dCs9J1wiPiA8ZGl2IGNsYXNzPVwiaG90LWRldGFpbCBmclwiPiA8c3Bhbj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9zcGFuPiA8Yj7nibnku7fvvJo8aT7vv6UnO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUucHJpY2UpO1xuJG91dCs9Jy4wMDwvaT48L2I+IDxwIGNsYXNzPVwibm93LWJ1eVwiPueri+WNs+aKoui0rTwvcD4gPC9kaXY+IDwvbGk+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi90cGwvY29tbW9kaXR5LWxpc3QvaG90LWxpc3QudHBsXG4vLyBtb2R1bGUgaWQgPSAzN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsIlxyXG52YXIgYWpheCA9IHJlcXVpcmUoJ3V0aWwvYWpheCcpO1xyXG52YXIgaGVhZGVyID0gcmVxdWlyZSgnaGVhZGVyLW5hdi9oZWFkZXInKTtcclxudmFyIG5vRGF0YSA9IHJlcXVpcmUoJ25vLWRhdGEvbm8tZGF0YS5qcycpO1xyXG52YXIgcGFnZXIgPSByZXF1aXJlKCdwYWdlLWJyZWFrL3BhZ2UtYnJlYWsuanMnKTtcclxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsc3BhcmUvdXRpbC5qcycpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlsL3V0aWxzLmpzJyk7XHJcblxyXG52YXIgY29tbW9kaXR5TGlzdCA9IHJlcXVpcmUoJ2NvbW1vZGl0eS1saXN0L2NvbW1vZGl0eS1saXN0Jyk7XHJcbnZhciBjaG9pY2VMaXN0ID0gcmVxdWlyZSgnY29tbW9kaXR5LWxpc3QvY2hvaWNlLWxpc3QnKTtcclxudmFyIGxlZnRsaXN0ID0gcmVxdWlyZSgnY29tbW9kaXR5LWxpc3QvY29tbW9kaXR5LWxlZnQtbGlzdCcpO1xyXG52YXIgaG90bGlzdCA9IHJlcXVpcmUoJ2NvbW1vZGl0eS1saXN0L2hvdC1saXN0Jyk7XHJcbnZhciB0eXBlbGlzdCA9IHJlcXVpcmUoJ2NvbW1vZGl0eS1saXN0L3R5cGUtbGlzdCcpO1xyXG5cclxudmFyIGNvbW1vZGl0eSA9IHtcclxuICAgIGZsYWc6IG51bGwsXHJcbiAgICBmbGFHOiBudWxsLFxyXG4gICAgcGFyZW50SWQ6IG51bGwsXHJcbiAgICBwYXJlbnRJRDogbnVsbCxcclxuXHRwYWdlTnVtYmVyOiAnMScsXHJcbiAgICBibnVtOiBudWxsLFxyXG4gICAgb3JkZXJGaWVsZDogJycsXHJcbiAgICBvcmRlckRlc2M6ICdhc2MnLFxyXG4gICAgc2VhcmNoTmFtZTogJycsXHJcbiAgICBhY2NvdW50SWQ6IG51bGwsXHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRoZWFkZXIuaW5pdChmdW5jdGlvbigpe30pO1xyXG4gICAgICAgIHZhciB1cmxTZWFyY2ggPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xyXG4gICAgICAgIC8qbWUuZmxhRyA9IHVybFNlYXJjaC5zcGxpdCgnPScpWzFdO1xyXG4gICAgICAgIG1lLnBhcmVudElEID0gdXJsU2VhcmNoLnNwbGl0KCc9JylbMl07XHJcbiAgICAgICAgbWUuYm51bSA9IHVybFNlYXJjaC5zcGxpdCgnPScpWzNdOyovXHJcbiAgICAgICAgbWUuZmxhRyA9IHV0aWxzLmdldFBhcmFtcygnZmxhZycpO1xyXG4gICAgICAgIG1lLnBhcmVudElEID0gdXRpbHMuZ2V0UGFyYW1zKCdwYXJlbnRJZCcpO1xyXG4gICAgICAgIG1lLmJudW0gPSB1dGlscy5nZXRQYXJhbXMoJ2JudW0nKTtcclxuXHJcbiAgICAgICAgbWUuYm51bSA9IHV0aWwuZ2V0UGFyYW1zKCdibnVtJyk7XHJcbiAgICAgICAgbWUuc2VhcmNoTmFtZSA9IHV0aWwuZ2V0UGFyYW1zKCduYW1lJyk7XHJcbiAgICAgICAgbWUuZmxhZyA9IHV0aWwuZ2V0UGFyYW1zKCdmbGFnJyk7XHJcbiAgICAgICAgbWUucGFyZW50SWQgPSB1dGlsLmdldFBhcmFtcygncGFyZW50SWQnKTtcclxuICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZTtcclxuICAgICAgICBtZS5hY2NvdW50SWQgPSBzdG9yYWdlW1wiaWRcIl07XHJcbiAgICAgICAgJCgnLmFsbC1saXN0JykuaGlkZSgpO1xyXG4gICAgICAgIG1lLmNsaWNrRXZlbigpO1xyXG4gICAgICAgIG1lLmdldExpc3QoKTtcclxuICAgICAgICBtZS5jaG9pY2VHb29kKCk7XHJcbiAgICAgICAgbWUubGVmdExpc3QoKTtcclxuICAgICAgICBtZS5ob3RMaXN0KCk7XHJcbiAgICAgICAgbWUuYWxsVHlwZSgpO1xyXG5cdH0sXHJcblx0Z2V0TGlzdDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRhamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3Byb2R1Y3QvcXVlcnknLFxyXG4gICAgICAgICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIHR5cGVJZDogbWUucGFyZW50SWQgfHwgbWUucGFyZW50SUQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBtZS5zZWFyY2hOYW1lLFxyXG4gICAgICAgICAgICAgICAgb3JkZXJGaWVsZDogbWUub3JkZXJGaWVsZCxcclxuICAgICAgICAgICAgICAgIG9yZGVyRGVzYzogbWUub3JkZXJEZXNjLFxyXG4gICAgICAgICAgICAgICAgYm51bTogbWUuYm51bSxcclxuICAgICAgICAgICAgXHRwYWdlU2l6ZTogJzIwJyxcclxuICAgICAgICAgICAgXHRjdXJQYWdlTnVtYmVyOiBtZS5wYWdlTnVtYmVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAyMDApe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICQoJy5jb21tb2RpdHktcmlnaHQtbGlzdCcpLmh0bWwoY29tbW9kaXR5TGlzdChsaXN0Lmxpc3QpKTtcclxuICAgICAgICAgICAgICAgIHBhZ2VyLmluaXQoJChcIiNwYWdlXCIpLCBtZS5wYWdlTnVtYmVyLCBsaXN0LnBhZ2VyLnRvdGFsUGFnZSwgZnVuY3Rpb24gKGN1clBnTnVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWUucGFnZU51bWJlciA9IGN1clBnTnVtO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lLmdldExpc3QoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblx0fSxcclxuICAgIGxlZnRMaXN0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogJy9lc2hvcC9hY3Rpdml0eS9saXN0JyxcclxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBub3M6ICdBVEMyMDE3MTExOTIxMDgwNjgyMjkxJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAkKCcuY29tbW9kaXR5LWxlZnQnKS5odG1sKGxlZnRsaXN0KGxpc3RbMF0uaXRlbXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOeyvumAieWVhuWTgVxyXG4gICAgY2hvaWNlR29vZDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvZXNob3AvYWN0aXZpdHkvbGlzdCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgbm9zOiAnQVRDMjAxNzExMTkyMTE0MTg1MDA1MidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgJCgnLmNob2ljZS1saXN0JykuaHRtbChjaG9pY2VMaXN0KGxpc3RbMF0uaXRlbXMpKTtcclxuICAgICAgICAgICAgICAgICQoJy5jaG9pY2UtbGlzdD5kaXY6Z3QoNCknKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOeDremUgOaOkuihjOamnFxyXG4gICAgaG90TGlzdDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvZXNob3AvYWN0aXZpdHkvbGlzdCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcclxuICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICBub3M6ICdBVEMyMDE3MTExOTIxMDI1NzkxODkyJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uID0gZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAkKCcuaG90LWxpc3QnKS5odG1sKGhvdGxpc3QocmVzcG9uWzBdLml0ZW1zKSk7XHJcbiAgICAgICAgICAgICAgICAkKCcuaG90LWxpc3QgbGk6Z3QoMyknKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOWIhuexu+WQjeensFxyXG4gICAgYWxsVHlwZTogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvZXNob3AvdHlwZS9hbGwnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICBhY2NvdW50SWQ6IG1lLmFjY291bnRJZCxcclxuICAgICAgICAgICAgICAgIGxldmVsOiAnMidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhsaXN0KTtcclxuICAgICAgICAgICAgICAgICQoJy50eXBlLWxpc3QgdWwnKS5odG1sKHR5cGVsaXN0KGxpc3QpKTtcclxuICAgICAgICAgICAgICAgIGlmKG1lLmZsYWcgIT0gbnVsbCAmJiBtZS5mbGFnICE9ICcnKXtcclxuICAgICAgICAgICAgICAgICAgICAkKCcudHlwZS1saXN0IC50eXBlLW5hbWUnKS5odG1sKFwiPHNwYW4gY2xhc3M9J2RlbGV0ZVBhcic+XCIgKyBtZS5mbGFnICsgXCLvvJombmJzcDsmbmJzcDs8L3NwYW4+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcvZXNob3AvdHlwZS9jaGlsZHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZ2V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbWUucGFyZW50SWQgfHwgbWUucGFyZW50SURcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oanNvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGpzb24uc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdHMgPSBqc29uLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy50eXBlLWxpc3QgdWwnKS5odG1sKHR5cGVsaXN0KGxpc3RzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHRjbGlja0V2ZW46IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnR5cGUtbGlzdCB1bCBsaScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKCQoJy50eXBlLW5hbWUnKS5odG1sKCkgPT0gXCLliIbnsbvlkI3np7DvvJpcIil7XHJcbiAgICAgICAgICAgICAgICAkKCcudHlwZS1saXN0IC50eXBlLW5hbWUnKS5odG1sKFwiPHNwYW4gY2xhc3M9J2RlbGV0ZVBhcic+XCIgKyAkKHRoaXMpLmh0bWwoKSArIFwi77yaJm5ic3A7Jm5ic3A7PC9zcGFuPlwiKTtcclxuICAgICAgICAgICAgICAgIG1lLnBhcmVudElkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgICAgICBhamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvZXNob3AvdHlwZS9jaGlsZHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbWUucGFyZW50SWRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGpzb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGpzb24uc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0cyA9IGpzb24ucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcudHlwZS1saXN0IHVsJykuaHRtbCh0eXBlbGlzdChsaXN0cykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbWUuZ2V0TGlzdCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWUucGFyZW50SWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgbWUuZ2V0TGlzdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcudHlwZS1saXN0IC5kZWxldGVQYXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBtZS5wYXJlbnRJZCA9ICcnO1xyXG4gICAgICAgICAgICAkKCcudHlwZS1saXN0IC50eXBlLW5hbWUnKS5odG1sKFwi5YiG57G75ZCN56ew77yaXCIpO1xyXG4gICAgICAgICAgICBtZS5nZXRMaXN0KCk7XHJcbiAgICAgICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3R5cGUvYWxsJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudElkOiBtZS5hY2NvdW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6ICcyJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnR5cGUtbGlzdCB1bCcpLmh0bWwodHlwZWxpc3QobGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5jb21tb2RpdHktcmlnaHQtbGlzdCAucmlnaHQtbGlzdCcsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBpZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG5cdFx0XHRsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1kZXRhaWwuaHRtbCNpZD0nICsgaWQ7XHJcblx0XHR9KTtcclxuICAgICAgICAkKCcuY29tbW9kaXR5LXJpZ2h0LW5hdiBwJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIG1lLm9yZGVyRmllbGQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtY2F0ZWdvcnknKTtcclxuICAgICAgICAgICAgbWUuZ2V0TGlzdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmhvdC1saXN0IGxpJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWRldGFpbC5odG1sI2lkPScgKyBpZDtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5jb21tb2RpdHktbGVmdD5kaXYnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktZGV0YWlsLmh0bWwjaWQ9JyArIGlkO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLmNob2ljZS1saXN0PmRpdicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1kZXRhaWwuaHRtbCNpZD0nICsgaWQ7XHJcbiAgICAgICAgfSk7XHJcblx0fVxyXG59XHJcblxyXG5jb21tb2RpdHkuaW5pdCgpXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy9tYWluL2NvbW1vZGl0eS1saXN0LmpzXG4vLyBtb2R1bGUgaWQgPSA0MFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvKipcclxuICogQ3JlYXRlZCBieSBodWkgb24gMjAxNi8xMi85IDAwMDkuXHJcbiAqL1xyXG52YXIgcGFnZVZUcGwgPSByZXF1aXJlKCcuL3RwbC9wYWdlLWJyZWFrJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbHNwYXJlL3V0aWwnKTtcclxucmVxdWlyZSgnLi9wYWdlLWJyZWFrLmxlc3MnKVxyXG4vL+WIneWni+WMllxyXG52YXIgREVGQVVMVF9OVU0gPSAxLCBQT0lOVCA9ICcuLi4nLCBQUkVWID0gJy0nLCBORVhUID0gJysnO1xyXG4vL+WtmOaUvmVsZW1lbnTlr7nosaHnmoTmlbDnu4RcclxudmFyIGVsZU9iaiA9IFtdO1xyXG4vKlxyXG4gKiDliIbpobXlr7nosaFcclxuICogKi9cclxuZnVuY3Rpb24gcGFnZUJyZWFrKGVsZW1lbnQsIGN1cnJlbnRQYWdlTnVtLCBwYWdlQ291bnQsIGNhbGxiYWNrLCBzY29wZSkge1xyXG4gICAgdGhpcy5pc0NsaWNrID0gZmFsc2U7XHJcbiAgICB0aGlzLmVsZSA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLmN1cnJlbnRQTiA9IGN1cnJlbnRQYWdlTnVtIHx8IERFRkFVTFRfTlVNO1xyXG4gICAgdGhpcy5wYWdlQ04gPSBwYWdlQ291bnQgfHwgMTtcclxuICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLl9zY29wZSA9IHNjb3BlIHx8IG51bGw7XHJcbn1cclxucGFnZUJyZWFrLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5yZW5kZXJUZW1wbGF0ZSgpO1xyXG4gICAgICAgIGlmICghc2VsZi5pc0NsaWNrKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaW5pdEJ0bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLmlzQ2xpY2sgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHJlbmRlclRlbXBsYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBwYWdlZGF0YSA9IHtcclxuICAgICAgICAgICAgZGF0YTogW10sXHJcbiAgICAgICAgICAgIHByZTogUFJFVixcclxuICAgICAgICAgICAgbmV4dDogTkVYVFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHNlbGYucGFnZUNOIDw9IDYpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gc2VsZi5wYWdlQ047IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcGFnZWRhdGEuZGF0YS5wdXNoKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuY3VycmVudFBOID49IDEgJiYgc2VsZi5jdXJyZW50UE4gPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBwYWdlZGF0YS5kYXRhLnB1c2goMSwgMiwgMywgNCwgNSwgUE9JTlQsIHNlbGYucGFnZUNOKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmLmN1cnJlbnRQTiA+PSA1ICYmIChzZWxmLnBhZ2VDTiAtIHNlbGYuY3VycmVudFBOKSArIDEgPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBwYWdlZGF0YS5kYXRhLnB1c2goMSwgUE9JTlQsIHNlbGYucGFnZUNOIC0gNCwgc2VsZi5wYWdlQ04gLSAzLCBzZWxmLnBhZ2VDTiAtIDIsIHNlbGYucGFnZUNOIC0gMSwgc2VsZi5wYWdlQ04pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYuY3VycmVudFBOID49IDUgJiYgKHNlbGYucGFnZUNOIC0gc2VsZi5jdXJyZW50UE4pICsgMSA+PSA1KSB7XHJcbiAgICAgICAgICAgICAgICBwYWdlZGF0YS5kYXRhLnB1c2goMSwgUE9JTlQsIHNlbGYuY3VycmVudFBOIC0gMSwgc2VsZi5jdXJyZW50UE4sIHNlbGYuY3VycmVudFBOICsgMSwgUE9JTlQsIHNlbGYucGFnZUNOKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGYuZWxlLmh0bWwocGFnZVZUcGwocGFnZWRhdGEpKTtcclxuICAgICAgICBzZWxmLnNldENsYXNzKCk7XHJcbiAgICB9LFxyXG4gICAgc2V0Q2xhc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5lbGUuZmluZCgnLnBhZ2UgYScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5hdHRyKFwiZGF0YS1udW1cIikgPT0gc2VsZi5jdXJyZW50UE4pIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJibHVlQmdcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJCh0aGlzKS5hdHRyKFwiZGF0YS1udW1cIikgPT0gUE9JTlQpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoXCJlbGxpcHNpc1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHNldE93blByb3BlcnR5OiBmdW5jdGlvbiAoY3VycmVudFBhZ2VOdW0sIHBhZ2VDb3VudCwgY2FsbGJhY2ssIHNjb3BlKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UE4gPSBjdXJyZW50UGFnZU51bSB8fCBERUZBVUxUX05VTTtcclxuICAgICAgICB0aGlzLnBhZ2VDTiA9IHBhZ2VDb3VudCB8fCAxO1xyXG4gICAgICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5fc2NvcGUgPSBzY29wZSB8fCBudWxsO1xyXG4gICAgfSxcclxuICAgIGluaXRCdG46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5lbGUuZGVsZWdhdGUoJy5wYWdlIGEnLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmF0dHIoXCJkYXRhLW51bVwiKSA9PSBQUkVWKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISEtLXNlbGYuY3VycmVudFBOKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy/miafooYzlm57osIPlh73mlbBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISFzZWxmLl9jYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9jYWxsYmFjay5jYWxsKHNlbGYuX3Njb3BlLCBzZWxmLmN1cnJlbnRQTik7Ly/lsIblvZPliY3nmoTpobXlj7fkvKDpgJLnu5nlkI7lj7BcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY3VycmVudFBOID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICgkKHRoaXMpLmF0dHIoXCJkYXRhLW51bVwiKSA9PSBORVhUKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKytzZWxmLmN1cnJlbnRQTiA8PSBzZWxmLnBhZ2VDTikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2NhbGxiYWNrLmNhbGwoc2VsZi5fc2NvcGUsIHNlbGYuY3VycmVudFBOKTsvL+WwhuW9k+WJjeeahOmhteWPt+S8oOmAkue7meWQjuWPsFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmN1cnJlbnRQTiA9IHNlbGYucGFnZUNOO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiAoJCh0aGlzKS5hdHRyKFwiZGF0YS1udW1cIikgLSAwKSA9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmN1cnJlbnRQTiA9IE51bWJlcigkKHRoaXMpLmF0dHIoXCJkYXRhLW51bVwiKSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLl9jYWxsYmFjay5jYWxsKHNlbGYuX3Njb3BlLCBzZWxmLmN1cnJlbnRQTik7Ly/lsIblvZPliY3nmoTpobXlj7fkvKDpgJLnu5nlkI7lj7BcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYuZWxlLmRlbGVnYXRlKCcucGFnZSAuanVtcCcsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5fY2FsbGJhY2suY2FsbChzZWxmLl9zY29wZSwgcGFyc2VJbnQoJCh0aGlzKS5wcmV2KCdpbnB1dCcpLnZhbCgpKSk7Ly/lsIblvZPliY3nmoTpobXlj7fkvKDpgJLnu5nlkI7lj7BcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qXHJcbiAqIGN1cnJlbnRQYWdlTnVt5Lyg6YCS55qE5b2T5YmN6aG156CBXHJcbiAqIHBhZ2VDb3VudCA9dG90YWxDb3VudC9wYWdlU2l6ZSDpobXmlbBcclxuICogZWxlbWVudCDliIbpobXlr7nosaFcclxuICogY2FsbGJhY2vlm57osIPlh73mlbBcclxuICogc2NvcGUg5L2c55So5Z+fXHJcbiAqICovXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKGVsZW1lbnQsIGN1cnJlbnRQYWdlTnVtLCBwYWdlQ291bnQsIGNhbGxiYWNrLCBzY29wZSkge1xyXG4gICAgICAgIHZhciBwYWdlLCBpc05ld1BhZ2UgPSBmYWxzZTtcclxuICAgICAgICBjdXJyZW50UGFnZU51bSA9IChjdXJyZW50UGFnZU51bSAtIHBhZ2VDb3VudCA+IDAgPyBwYWdlQ291bnQgOiBjdXJyZW50UGFnZU51bSk7Ly/ov5nkuKrmmK/lnKjliKDpmaTnmoTml7blgJnogIPomZHnmoRcclxuICAgICAgICB1dGlsLmZvckVhY2goZWxlT2JqLCBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ua2V5ID09IGVsZW1lbnQuYXR0cihcImlkXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZSA9IGl0ZW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5zZXRPd25Qcm9wZXJ0eShjdXJyZW50UGFnZU51bSwgcGFnZUNvdW50LCBjYWxsYmFjaywgc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzTmV3UGFnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIWlzTmV3UGFnZSkge1xyXG4gICAgICAgICAgICB2YXIgb2JqID0ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBlbGVtZW50LmF0dHIoXCJpZFwiKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXcgcGFnZUJyZWFrKGVsZW1lbnQsIGN1cnJlbnRQYWdlTnVtLCBwYWdlQ291bnQsIGNhbGxiYWNrLCBzY29wZSlcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcGFnZSA9IG9iai52YWx1ZTtcclxuICAgICAgICAgICAgZWxlT2JqLnB1c2gob2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhZ2UuaW5pdCgpO1xyXG4gICAgfVxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3BhZ2UtYnJlYWsvcGFnZS1icmVhay5qc1xuLy8gbW9kdWxlIGlkID0gNDFcbi8vIG1vZHVsZSBjaHVua3MgPSAxIDYgNyIsInZhciB0ZW1wbGF0ZT1yZXF1aXJlKCd0bW9kanMtbG9hZGVyL3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzPXRlbXBsYXRlKCdkZXAvcGFnZS1icmVhay90cGwvcGFnZS1icmVhaycsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZXNjYXBlPSR1dGlscy4kZXNjYXBlLHByZT0kZGF0YS5wcmUsJGVhY2g9JHV0aWxzLiRlYWNoLGRhdGE9JGRhdGEuZGF0YSwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsbmV4dD0kZGF0YS5uZXh0LCRvdXQ9Jyc7JG91dCs9JzxkaXYgY2xhc3M9XCJwYWdlXCI+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgZGF0YS1udW09JztcbiRvdXQrPSRlc2NhcGUocHJlKTtcbiRvdXQrPSc+PDwvYT4gJztcbiRlYWNoKGRhdGEsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgZGF0YS1udW09JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlKTtcbiRvdXQrPSc+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlKTtcbiRvdXQrPSc8L2E+ICc7XG59KTtcbiRvdXQrPScgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIiBkYXRhLW51bT0nO1xuJG91dCs9JGVzY2FwZShuZXh0KTtcbiRvdXQrPSc+PjwvYT4gPHNwYW4gY2xhc3M9XCJhcHBvaW50XCI+IOi3s+iHsyA8aW5wdXQgdHlwZT1cInRleHRcIiB2YWx1ZT1cIjFcIj4g6aG1IDxhIGNsYXNzPVwianVtcFwiIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+6Lez6L2sPC9hPiA8L3NwYW4+IDwvZGl2Pic7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3BhZ2UtYnJlYWsvdHBsL3BhZ2UtYnJlYWsudHBsXG4vLyBtb2R1bGUgaWQgPSA0MlxuLy8gbW9kdWxlIGNodW5rcyA9IDEgNiA3IiwiLy8gc3R5bGUtbG9hZGVyOiBBZGRzIHNvbWUgY3NzIHRvIHRoZSBET00gYnkgYWRkaW5nIGEgPHN0eWxlPiB0YWdcblxuLy8gbG9hZCB0aGUgc3R5bGVzXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3BhZ2UtYnJlYWsubGVzc1wiKTtcbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuLy8gYWRkIHRoZSBzdHlsZXMgdG8gdGhlIERPTVxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9hZGRTdHlsZXMuanNcIikoY29udGVudCwge30pO1xuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG4vLyBIb3QgTW9kdWxlIFJlcGxhY2VtZW50XG5pZihtb2R1bGUuaG90KSB7XG5cdC8vIFdoZW4gdGhlIHN0eWxlcyBjaGFuZ2UsIHVwZGF0ZSB0aGUgPHN0eWxlPiB0YWdzXG5cdGlmKCFjb250ZW50LmxvY2Fscykge1xuXHRcdG1vZHVsZS5ob3QuYWNjZXB0KFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9wYWdlLWJyZWFrLmxlc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3BhZ2UtYnJlYWsubGVzc1wiKTtcblx0XHRcdGlmKHR5cGVvZiBuZXdDb250ZW50ID09PSAnc3RyaW5nJykgbmV3Q29udGVudCA9IFtbbW9kdWxlLmlkLCBuZXdDb250ZW50LCAnJ11dO1xuXHRcdFx0dXBkYXRlKG5ld0NvbnRlbnQpO1xuXHRcdH0pO1xuXHR9XG5cdC8vIFdoZW4gdGhlIG1vZHVsZSBpcyBkaXNwb3NlZCwgcmVtb3ZlIHRoZSA8c3R5bGU+IHRhZ3Ncblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvcGFnZS1icmVhay9wYWdlLWJyZWFrLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMSA2IDciLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKHVuZGVmaW5lZCk7XG4vLyBpbXBvcnRzXG5cblxuLy8gbW9kdWxlXG5leHBvcnRzLnB1c2goW21vZHVsZS5pZCwgXCIvKumhteeggSovXFxuLnBhZ2Uge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIG1hcmdpbjogNDBweCAxMHB4IDAgMDtcXG4gIHBhZGRpbmctYm90dG9tOiAyMHB4O1xcbn1cXG4ucGFnZSBhIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIHdpZHRoOiAzMHB4O1xcbiAgaGVpZ2h0OiAzMHB4O1xcbiAgYm9yZGVyOiAxcHggc29saWQgI2U4ZThlODtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsaW5lLWhlaWdodDogMzBweDtcXG4gIG1hcmdpbjogMCAzcHg7XFxuICBmb250LXNpemU6IDEycHg7XFxuICBjb2xvcjogIzY2NjtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuLnBhZ2UgYTpob3ZlciB7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZjAwO1xcbn1cXG5hLmJsdWVCZyB7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZjAwO1xcbn1cXG5hLmVsbGlwc2lzIHtcXG4gIGJvcmRlcjogbm9uZTtcXG4gIGJhY2tncm91bmQ6IG5vbmU7XFxuICBjb2xvcjogI2MwYzRjYjtcXG4gIHBhZGRpbmctdG9wOiA2cHg7XFxuICBtYXJnaW46IDA7XFxufVxcbmEuZWxsaXBzaXM6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogbm9uZTtcXG4gIGJvcmRlcjogbm9uZTtcXG59XFxuLnBhZ2UgaW5wdXQge1xcbiAgd2lkdGg6IDMwcHg7XFxuICBoZWlnaHQ6IDMwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjZThlOGU4O1xcbn1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY3NzLWxvYWRlciEuL34vbGVzcy1sb2FkZXIvZGlzdC9janMuanMhLi9kZXAvcGFnZS1icmVhay9wYWdlLWJyZWFrLmxlc3Ncbi8vIG1vZHVsZSBpZCA9IDQ0XG4vLyBtb2R1bGUgY2h1bmtzID0gMSA2IDciLCIvKipcclxuICogQ3JlYXRlZCBieSBsc2Mgb24gMjAxNC8xMi83LlxyXG4gKi9cclxudmFyICQgPSByZXF1aXJlKFwianF1ZXJ5XCIpO1xyXG5faWQgPSAwO1xyXG52YXIgU0hPV19QT1BfVFlQRV9TVUNDRVNTID0gMDtcclxudmFyIFNIT1dfUE9QX1RZUEVfRkFJTCA9IDE7XHJcbnZhciBTSE9XX1BPUF9UWVBFX1dBUk5JTkcgPSAyO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGZvckVhY2g6IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XHJcbiAgICAgICAgc2NvcGUgPSBzY29wZSB8fCBudWxsO1xyXG4gICAgICAgIGFycmF5ID0gW10uc2xpY2UuY2FsbChhcnJheSk7Ly/lsIZhcnJheeWvueixoei9rOWMluS4uuaVsOe7hCxhcnJheeS4jeS4gOWumuaYr+S4quaVsOe7hFxyXG4gICAgICAgIGlmICghKGFycmF5IGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2FycmF5IGlzIG5vdCBhIEFycmF5ISEhJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2suY2FsbChzY29wZSwgYXJyYXlbaV0sIGkpKSB7Ly9hcnJheVtpXSxtYXBzW2ldLFxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIHVybOWPguaVsOiOt+WPluaOpeWPo++8jOe7j+i/h2RlY29kZVVSSe+8jOWmguaenOayoeacieS8oOmAkmtleeWAvO+8jOWImei/lOWbnuW9k+WJjemhtemdoueahOaJgOacieWPguaVsO+8jOWmguaenOaciWtleei/lOWbnmtleeWvueW6lOeahOWGheWuue+8jFxyXG4gICAgICog5aaC5p6ca2V55rKh5pyJ5a+55bqU55qE5YaF5a6577yM5YiZ6L+U5Zue56m65a2X56ym5LiyXHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAqL1xyXG4gICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgdmFyIHBhcmFtc1N0ciA9IGxvY2F0aW9uLmhyZWYuaW5kZXhPZignPycpID4gMCA/IGxvY2F0aW9uLmhyZWYuc3Vic3RyaW5nKGxvY2F0aW9uLmhyZWYuaW5kZXhPZihcIj9cIikgKyAxLCBsb2NhdGlvbi5ocmVmLmxlbmd0aCkgOiAnJztcclxuICAgICAgICAvL+iOt+WPluaJgOacieeahCPljbPku6XliY3nmoTvvJ/lkI7pnaLnmoTlgLzvvIznm7jlvZPkuo5sb2NhdGlvbi5zZWFyY2hcclxuICAgICAgICB2YXIgbWFwcywgcGFyYW1zT2JqID0ge307XHJcbiAgICAgICAgaWYgKHBhcmFtc1N0ciA9PT0gJycpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXJhbXNTdHIgPSBkZWNvZGVVUkkocGFyYW1zU3RyKTsvL+ino+eggeeahHBhcmFtU3RyXHJcbiAgICAgICAgbWFwcyA9IHBhcmFtc1N0ci5zcGxpdCgnJicpOy8v5bCGJuS5i+WJjeeahOWtl+espuS4sumDveaUvuWFpeaVsOe7hOmHjOmdolxyXG4gICAgICAgIHRoaXMuZm9yRWFjaChtYXBzLCBmdW5jdGlvbiAoaXRlbSkgey8v5b6q546v5pWw57uELGFyZ3VtZW50c1swXVxyXG4gICAgICAgICAgICB2YXIgcGFyYW1MaXN0ID0gaXRlbS5zcGxpdCgnPScpOy8vaXRlbeS4um1hcHNbaV1cclxuICAgICAgICAgICAgaWYgKHBhcmFtTGlzdC5sZW5ndGggPCAyICYmIHBhcmFtTGlzdFswXSA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmFtc09ialtwYXJhbUxpc3RbMF1dID0gcGFyYW1MaXN0WzFdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChrZXkpIHsvL+WmguaenGtleeacieWAvOW+l+ivnVxyXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zT2JqW2tleV0gfHwgJyc7Ly/liJnov5Tlm57lr7nosaHph4zlj6/ku6XlsZ7mgKfnmoTlgLzlkKbliJnov5Tlm57nqbpcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zT2JqOy8v5aaC5p6ca2V55Lyg6L+H5p2l55qE5piv5rKh5pyJ55qE6K+d77yM5Y2z5LuA5LmI6YO95rKh5Lyg55qE6K+d5YiZ6L+U5ZuecGFyYW1zT2Jq55qE5a+56LGhXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdldFF1ZXJ5U3RyaW5nOmZ1bmN0aW9uKG5hbWUpIHtcclxuICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKFwiKF58JilcIiArIG5hbWUgKyBcIj0oW14mXSopKCZ8JClcIixcImlcIik7XHJcbiAgICB2YXIgciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLm1hdGNoKHJlZyk7XHJcbiAgICBpZiAociE9bnVsbCkgcmV0dXJuIChyWzJdKTsgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG4gICAgYWRkRXZlbnQ6IGZ1bmN0aW9uIChlbCwgdHlwZSwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHsvL+WmguaenOmhtemdouaWh+aho+S4reWtmOWcqGF0dGFjaEV2ZW505pa55rOVXHJcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zLnNwbGljZSgwLCAwLCB3aW5kb3cuZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoZWwsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGVsLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8v5piv5ZCm5pivSUU2NzhcclxuICAgIGlzSUU2Nzg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKCdhfmInLnNwbGl0KC8ofikvKSlbMV0gPT0gXCJiXCI7XHJcbiAgICB9LFxyXG4gICAgLy/ljrvnqbrmoLxcclxuICAgIHRyaW1BbGw6IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyArL2csICcnKTtcclxuICAgIH0sXHJcbiAgICBTSE9XX1BPUF9UWVBFX1NVQ0NFU1M6IFNIT1dfUE9QX1RZUEVfU1VDQ0VTUyxcclxuICAgIFNIT1dfUE9QX1RZUEVfRkFJTDogU0hPV19QT1BfVFlQRV9GQUlMLFxyXG4gICAgU0hPV19QT1BfVFlQRV9XQVJOSU5HOiBTSE9XX1BPUF9UWVBFX1dBUk5JTkcsXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuaPkOekuuS/oeaBr++8iOimgeaxguavj+S4quimgeaYvuekuueahOmhtemdoumDveimgeaciXBvcC1tYXNrIGRpdu+8ie+8jFxyXG4gICAgICog6K2m56S65Zu+54mH5ZG95ZCN5L2/55So5qC85byPc2hvdy1wb3AwLnBuZ+S7o+ihqHN1Y2Vzc++8jHNob3ctcG9wMS5wbmfku6PooahmYWls77yM6Lef5LiK6L6555qE5Y+C5pWw5a6a5LmJ5LiA6Ie0XHJcbiAgICAgKiBAcGFyYW0gdGl0bGUg6aG26YOo5pi+56S65qGG55qE5qCH6aKYXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSDlhoXlrrnlgLxcclxuICAgICAqIEBwYXJhbSB0eXBlIOitpuekuuWbvueJh+eahOexu+Wei++8jOmAmui/h3V0aWwuanPov5Tlm57lr7nosaHojrflj5bvvIzkuI3lhpnpu5jorqTmmK9zdWNjZXNzXHJcbiAgICAgKi9cclxuICAgIHNob3dNc2dJbmZvOiBmdW5jdGlvbiAodGl0bGUsIG1lc3NhZ2UsIHR5cGUpIHtcclxuICAgICAgICB0eXBlID0gdHlwZSA/IHR5cGUgOiBTSE9XX1BPUF9UWVBFX1NVQ0NFU1M7XHJcbiAgICAgICAgdmFyIG1zZ0luZm9JZCA9ICdtc2ctcG9wLScgKyBfaWQrKztcclxuICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgICAgICBtc2dJbmZvSWQ6IG1zZ0luZm9JZCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICAgIH07XHJcbiAgICAgLy8gICAkKFwiYm9keVwiKS5hcHBlbmQodGVtcGxhdGUoJ3dhcm5pbmctYm94L3dhcm5pbmctYm94LXRlbXBsJywgZGF0YSkpO1xyXG4gICAgICAgIC8v5YWz6Zet5Zu+5qCH6Lef5Y+W5raI55qE54K55Ye75LqL5Lu25bCB6KOF77yM5L2G5piv56Gu6K6k55qE5bCx6Ieq5bex5YaZXHJcbiAgICAgICAgJChcIiNcIiArIG1zZ0luZm9JZCArIFwiIC5jYW5jZWwsI1wiICsgbXNnSW5mb0lkICsgXCIgLmNsb3NlLWJveFwiKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJyMnICsgbXNnSW5mb0lkKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoXCIucG9wLW1hc2tcIikuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJyMnICsgbXNnSW5mb0lkKS5zaG93KCk7XHJcbiAgICAgICAgICAgICQoXCIucG9wLW1hc2tcIikuc2hvdygpO1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgYXBlcnRJbmZvOiBmdW5jdGlvbiAodGl0bGUsIG1lc3NhZ2UpIHtcclxuICAgIFx0XHR2YXIgcG9wdXAgPSBcInBvcC11cC1kaXZcIjtcclxuICAgICAgICAgICAgJChcIi5wb3AtbWFza1wiKS5zaG93KCk7XHJcbiAgICBcdFx0JChcIiNcIitwb3B1cCkuc2hvdygpO1xyXG4gICAgXHRcdCQoXCIuaGVhZFwiKS5maW5kKFwiaDFcIikuaHRtbCh0aXRsZSk7XHJcbiAgICBcdFx0JChcIi5wb3AtY29udGVudFwiKS5odG1sKG1lc3NhZ2UpO1xyXG4gICAgXHRcdCQoXCIjXCIrcG9wdXApLmZpbmQoXCIuY2xvc2VcIikuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgIFx0XHRcdCQoJyMnICsgcG9wdXApLmhpZGUoKTtcclxuXHQgICAgICAgICAgICAkKFwiLnBvcC1tYXNrXCIpLmhpZGUoKTtcclxuICAgIFx0XHR9KTtcclxuICAgIFx0XHRcclxuICAgICAgICBcclxuICAgIH0sXHJcbiAgICBjbG9zZVBvcDpmdW5jdGlvbihwb3B1cCl7XHJcbiAgICBcdCQoJyMnICsgcG9wdXApLmhpZGUoKTtcclxuXHQgICAgJChcIi5wb3AtbWFza1wiKS5oaWRlKCk7XHJcbiAgICB9LFxyXG4gICAgLy/moLnmja7pmL/mi4nkvK/mlbDlrZfnlJ/miJDkuK3mlofmlbDlrZdcclxuICAgIGNvdmVyTnVtOiBmdW5jdGlvbiAobnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGlzTmFOKG51bWJlciAtIDApKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXJnIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAobnVtYmVyLmxlbmd0aCA+IDEyKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXJnIGlzIHRvbyBiaWcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGEgPSAobnVtYmVyICsgJycpLnNwbGl0KCcnKSxcclxuICAgICAgICAgICAgcyA9IFtdLFxyXG4gICAgICAgICAgICB0ID0gdGhpcyxcclxuICAgICAgICAgICAgY2hhcnMgPSAn6Zu25LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5LmdJyxcclxuICAgICAgICAgICAgdW5pdHMgPSAn5Liq5Y2B55m+5Y2D5LiHQCMl5Lq/XiZ+JztcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGEubGVuZ3RoIC0gMTsgaSA8PSBqOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGogPT0gMSB8fCBqID09IDUgfHwgaiA9PSA5KSB7Ly/kuKTkvY3mlbAg5aSE55CG54m55q6K55qEIDEqXHJcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFbaV0gIT0gJzEnKSBzLnB1c2goY2hhcnMuY2hhckF0KGFbaV0pKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5wdXNoKGNoYXJzLmNoYXJBdChhW2ldKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzLnB1c2goY2hhcnMuY2hhckF0KGFbaV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgICAgICBzLnB1c2godW5pdHMuY2hhckF0KGogLSBpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9yZXR1cm4gcztcclxuICAgICAgICByZXR1cm4gcy5qb2luKCcnKS5yZXBsYWNlKC/pm7YoW+WNgeeZvuWNg+S4h+S6v0AjJV4mfl0pL2csIGZ1bmN0aW9uIChtLCBkLCBiKSB7Ly/kvJjlhYjlpITnkIYg6Zu255m+IOmbtuWNgyDnrYlcclxuICAgICAgICAgICAgYiA9IHVuaXRzLmluZGV4T2YoZCk7XHJcbiAgICAgICAgICAgIGlmIChiICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA9PSAn5Lq/JykgcmV0dXJuIGQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCA9PSAn5LiHJylyZXR1cm4gZDtcclxuICAgICAgICAgICAgICAgIGlmIChhW2ogLSBiXSA9PSAnMCcpIHJldHVybiAn6Zu2JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfSkucmVwbGFjZSgv6Zu2Ky9nLCAn6Zu2JykucmVwbGFjZSgv6Zu2KFvkuIfkur9dKS9nLCBmdW5jdGlvbiAobSwgYikgey8vIOmbtueZviDpm7bljYPlpITnkIblkI4g5Y+v6IO95Ye6546wIOmbtumbtuebuOi/nueahCDlho3lpITnkIbnu5PlsL7kuLrpm7bnmoRcclxuICAgICAgICAgICAgcmV0dXJuIGI7XHJcbiAgICAgICAgfSkucmVwbGFjZSgv5Lq/W+S4h+WNg+eZvl0vZywgJ+S6vycpLnJlcGxhY2UoL1vpm7ZdJC8sICcnKS5yZXBsYWNlKC9bQCMlXiZ+XS9nLCBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICByZXR1cm4geydAJzogJ+WNgScsICcjJzogJ+eZvicsICclJzogJ+WNgycsICdeJzogJ+WNgScsICcmJzogJ+eZvicsICd+JzogJ+WNgyd9W21dO1xyXG4gICAgICAgIH0pLnJlcGxhY2UoLyhb5Lq/5LiHXSkoW+S4gC3kuZ1dKS9nLCBmdW5jdGlvbiAobSwgZCwgYiwgYykge1xyXG4gICAgICAgICAgICBjID0gdW5pdHMuaW5kZXhPZihkKTtcclxuICAgICAgICAgICAgaWYgKGMgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhW2ogLSBjXSA9PSAnMCcpIHJldHVybiBkICsgJ+mbticgKyBiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8v6K6h566XZWNoYXJ0IHRpdGxlIOmrmOW6plxyXG4gICAgZUhlaWdodDogZnVuY3Rpb24gKGFycmF5KSB7XHJcbiAgICAgICAgYXJyYXkgPSBbXS5zbGljZS5jYWxsKGFycmF5KTsvL+WwhmFycmF55a+56LGh6L2s5YyW5Li65pWw57uELGFycmF55LiN5LiA5a6a5piv5Liq5pWw57uEXHJcbiAgICAgICAgaWYgKCEoYXJyYXkgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgU3RyaW5nUHggPSBhcnJheS5qb2luKCcnKS5sZW5ndGggKiAxNDtcclxuICAgICAgICB2YXIgZWxzZVBMID0gYXJyYXkubGVuZ3RoICogKDIwICsgMTApO1xyXG4gICAgICAgIHZhciBZSGVpZ2h0ID0gTWF0aC5jZWlsKChTdHJpbmdQeCArIGVsc2VQTCkgLyA4NTApICogMjQgKyAxMDsvL+WQkeS4iuS/ruatozEw5YOP57SgXHJcbiAgICAgICAgcmV0dXJuIFlIZWlnaHQgPCA2MCA/IDYwIDogWUhlaWdodDtcclxuICAgIH0sXHJcbiAgICAvL+i9rOaNouaXtumXtOagvOW8j1xyXG4gICAgZ2V0VGltZTogZnVuY3Rpb24gKGRhdGUsIGZvcm1hdCkge1xyXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlICogMTAwMCk7XHJcblxyXG4gICAgICAgIHZhciBtYXAgPSB7XHJcbiAgICAgICAgICAgIFwiTVwiOiBkYXRlLmdldE1vbnRoKCkgKyAxLCAvL+aciOS7vVxyXG4gICAgICAgICAgICBcImRcIjogZGF0ZS5nZXREYXRlKCksIC8v5pelXHJcbiAgICAgICAgICAgIFwiaFwiOiBkYXRlLmdldEhvdXJzKCksIC8v5bCP5pe2XHJcbiAgICAgICAgICAgIFwibVwiOiBkYXRlLmdldE1pbnV0ZXMoKSwgLy/liIZcclxuICAgICAgICAgICAgXCJzXCI6IGRhdGUuZ2V0U2Vjb25kcygpLCAvL+enklxyXG4gICAgICAgICAgICBcInFcIjogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSwgLy/lraPluqZcclxuICAgICAgICAgICAgXCJTXCI6IGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLy/mr6vnp5JcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKC8oW3lNZGhtc3FTXSkrL2csIGZ1bmN0aW9uIChhbGwsIHQpIHtcclxuICAgICAgICAgICAgdmFyIHYgPSBtYXBbdF07XHJcbiAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbGwubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSAnMCcgKyB2O1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSB2LnN1YnN0cih2Lmxlbmd0aCAtIDIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodCA9PT0gJ3knKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRhdGUuZ2V0RnVsbFllYXIoKSArICcnKS5zdWJzdHIoNCAtIGFsbC5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhbGw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdDtcclxuICAgIH0sXHJcbiAgICBnZXRCcm93c2VyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIFN5cyA9IHt9O1xyXG4gICAgICAgIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB2YXIgcztcclxuICAgICAgICAocyA9IHVhLm1hdGNoKC9ydjooW1xcZC5dKylcXCkgbGlrZSBnZWNrby8pKSA/IFN5cy5pZSA9IHNbMV0gOlxyXG4gICAgICAgICAgICAocyA9IHVhLm1hdGNoKC9tc2llIChbXFxkLl0rKS8pKSA/IFN5cy5pZSA9IHNbMV0gOlxyXG4gICAgICAgICAgICAgICAgKHMgPSB1YS5tYXRjaCgvZmlyZWZveFxcLyhbXFxkLl0rKS8pKSA/IFN5cy5maXJlZm94ID0gc1sxXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgKHMgPSB1YS5tYXRjaCgvY2hyb21lXFwvKFtcXGQuXSspLykpID8gU3lzLmNocm9tZSA9IHNbMV0gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocyA9IHVhLm1hdGNoKC9vcGVyYS4oW1xcZC5dKykvKSkgPyBTeXMub3BlcmEgPSBzWzFdIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzID0gdWEubWF0Y2goL3ZlcnNpb25cXC8oW1xcZC5dKykuKnNhZmFyaS8pKSA/IFN5cy5zYWZhcmkgPSBzWzFdIDogMDtcclxuXHJcbiAgICAgICAgaWYgKFN5cy5pZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2llJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU3lzLmZpcmVmb3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdmaXJlZm94J1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU3lzLmNocm9tZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2Nocm9tZSdcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFN5cy5vcGVyYSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ29wZXJhJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU3lzLnNhZmFyaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3NhZmFyaSdcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy/orqHnrpfmmL7npLrlrZfnrKbkuLLnmoTplb/luqZcclxuICAgIHN0ckRpc3BsYXlmb3JtYXQ6IGZ1bmN0aW9uIChzdHJpbmcsIG1heExlbmd0aCkge1xyXG4gICAgICAgIHZhciBudW0gPSAwO1xyXG4gICAgICAgIHZhciBTVFJfTlVNQkVSID0gbWF4TGVuZ3RoID8gbWF4TGVuZ3RoIDogMzA7XHJcbiAgICAgICAgdmFyIHBhdCA9IG5ldyBSZWdFeHAoJ1swLTlhLXpBLVotXScpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgKHN0cmluZy5sZW5ndGggPiBTVFJfTlVNQkVSID8gU1RSX05VTUJFUiA6IHN0cmluZy5sZW5ndGgpOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHBhdC50ZXN0KHN0cmluZ1tpXSkpIHtcclxuICAgICAgICAgICAgICAgIG51bSsrO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbnVtICs9IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG51bSA+IFNUUl9OVU1CRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmcuc3Vic3RyaW5nKDAsIGkpICsgJy4uLic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZztcclxuICAgIH0sXHJcbiAgICAvL+agueaNruS4reaWh+aVsOWtl+eUn+aIkOmYv+aLieS8r+aVsOWtl1xyXG4gICAgdG9OdW06ZnVuY3Rpb24oc3RyKXtcclxuICAgICAgICBpZih0eXBlb2Yoc3RyKSAhPT1cInN0cmluZ1wiKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdHIgaXMgbm90IGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjaGFydHMgPSB7XHJcbiAgICAgICAgICAgIFwi5LiAXCI6MSxcclxuICAgICAgICAgICAgXCLkuoxcIjoyLFxyXG4gICAgICAgICAgICBcIuS4iVwiOjMsXHJcbiAgICAgICAgICAgIFwi5ZubXCI6NCxcclxuICAgICAgICAgICAgXCLkupRcIjo1LFxyXG4gICAgICAgICAgICBcIuWFrVwiOjYsXHJcbiAgICAgICAgICAgIFwi5LiDXCI6NyxcclxuICAgICAgICAgICAgXCLlhatcIjo4LFxyXG4gICAgICAgICAgICBcIuS5nVwiOjlcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBudW1zID1bXTtcclxuXHJcbiAgICAgICAgaWYoc3RyLmxlbmd0aCA9PTEpe1xyXG4gICAgICAgICAgICByZXR1cm4gY2hhcnRzW3N0cl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7aTxzdHIubGVuZ3RoO2krKykge1xyXG4gICAgICAgICAgICBpZihzdHJbaV0gPT0gXCLljYFcIil7XHJcbiAgICAgICAgICAgICAgICBudW1zLnB1c2goXCLljYFcIik7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbnVtcy5wdXNoKGNoYXJ0c1tzdHJbaV1dKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IodmFyIGkgPSAwLGo9bnVtcy5sZW5ndGgtMTtpPD1qO2krKyl7XHJcbiAgICAgICAgICAgIGlmKG51bXNbaV0gPT1cIuWNgVwiKXtcclxuICAgICAgICAgICAgICAgIG51bXNbaV0gPSAoaSA9PSAwICYmIDEpIHx8KCBpPT1qICYmICcwJykgfHwgJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bXMuam9pbihcIlwiKS0wO1xyXG5cclxuICAgIH0sXHJcbiAgICAvL+S4jeWQjOW5tOe6p+S4jeWQjOePreeahOaOkuW6j1xyXG4gICAgc29ydGdyYWRlOmZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmKGRhdGEubGVuZ3RoPD0xKXtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXEgPSAvW+S4gOS6jOS4ieWbm+S6lOWFreS4g+WFq+S5neWNgV0rL2c7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHRHcmFkZXMgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIGdyYWRlcz17fTsvL3tbMTpbXV19XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaTxkYXRhLmxlbmd0aDtpKyspe1xyXG4gICAgICAgICAgICB2YXIgZ3JhZGVOdW0gPSB0aGlzLnRvTnVtKGRhdGFbaV0uY2xhc3Nlc05hbWUubWF0Y2gocmVxKVswXSk7XHJcbiAgICAgICAgICAgIGlmKCFncmFkZXNbZ3JhZGVOdW1dKXtcclxuICAgICAgICAgICAgICAgIGdyYWRlc1tncmFkZU51bV0gPVtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdyYWRlc1tncmFkZU51bV0ucHVzaChkYXRhW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yKCB2YXIgaWkgaW4gZ3JhZGVzKXtcclxuICAgICAgICAgICAgcmVzdWx0R3JhZGVzID1yZXN1bHRHcmFkZXMuY29uY2F0KHRoaXMuc29ydENsYXNzKGdyYWRlc1tpaV0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdEdyYWRlcztcclxuICAgIH0sXHJcbiAgICAvL+agueaNruWQjOW5tOe6p+S4jeWQjOePree6p+aOkuW6j1xyXG4gICAgc29ydENsYXNzOmZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgIGlmKGRhdGEubGVuZ3RoPD0xKXtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0b0luZGV4ID0gTWF0aC5mbG9vcihkYXRhLmxlbmd0aC8yKTtcclxuICAgICAgICB2YXIgdG9OdW0gPSBkYXRhW3RvSW5kZXhdLmNsYXNzZXNOYW1lLm1hdGNoKC9cXGQrL2cpWzBdLTA7XHJcbiAgICAgICAgdmFyIGxlZnRDbGFzcz0gW10scmlnaHRDbGFzcyA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8ZGF0YS5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICAgLy9tb2RlbC51c2VyRGF0YS5jbGFzc2VzW2ldLmNsYXNzTnVtID0gZGF0YVtpXS5jbGFzc2VzTmFtZS5tYXRjaCgvXFxkKy9nKVswXS0wO1xyXG4gICAgICAgICAgICBpZihpID09dG9JbmRleCl7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0b051bSA+ZGF0YVtpXS5jbGFzc2VzTmFtZS5tYXRjaCgvXFxkKy9nKVswXS0wKXtcclxuICAgICAgICAgICAgICAgIGxlZnRDbGFzcy5wdXNoKGRhdGFbaV0pO1xyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHJpZ2h0Q2xhc3MucHVzaChkYXRhW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm5cdCB0aGlzLnNvcnRDbGFzcyhsZWZ0Q2xhc3MpLmNvbmNhdCggZGF0YVt0b0luZGV4XSx0aGlzLnNvcnRDbGFzcyhyaWdodENsYXNzKSk7XHJcbiAgICB9XHJcblxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3V0aWwvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDQ1XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsInZhciB0ZW1wbGF0ZT1yZXF1aXJlKCd0bW9kanMtbG9hZGVyL3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzPXRlbXBsYXRlKCd0cGwvY29tbW9kaXR5LWxpc3QvY29tbW9kaXR5LWxpc3QnLGZ1bmN0aW9uKCRkYXRhLCRmaWxlbmFtZVxuLyoqLykge1xuJ3VzZSBzdHJpY3QnO3ZhciAkdXRpbHM9dGhpcywkaGVscGVycz0kdXRpbHMuJGhlbHBlcnMsJGVhY2g9JHV0aWxzLiRlYWNoLCR2YWx1ZT0kZGF0YS4kdmFsdWUsJGluZGV4PSRkYXRhLiRpbmRleCwkZXNjYXBlPSR1dGlscy4kZXNjYXBlLCRvdXQ9Jyc7JGVhY2goJGRhdGEsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxkaXYgY2xhc3M9XCJyaWdodC1saXN0IGZsXCIgZGF0YS1pZD0nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9Jz4gPGltZyBzcmM9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUub25lUGhvdG8pO1xuJG91dCs9J1wiPiA8cCBjbGFzcz1cInJpZ2h0LWxpc3QtbmFtZVwiPic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5uYW1lKTtcbiRvdXQrPSc8L3A+IDxkaXYgY2xhc3M9XCJyaWdodC1saXN0LWNvbnQgY2xlYXJmaXhcIj4gPHNwYW4gY2xhc3M9XCJyaWdodC1saXN0LW1vbmV5IGZsXCI+77+lJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLnByaWNlKTtcbiRvdXQrPSc8L3NwYW4+IDxzcGFuIGNsYXNzPVwicmlnaHQtbGlzdC1udW0gZnJcIj7lt7LllK48Yj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuc2FsZW51bSk7XG4kb3V0Kz0nPC9iPjwvc3Bhbj4gPC9kaXY+IDwvZGl2PiAnO1xufSk7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdHBsL2NvbW1vZGl0eS1saXN0L2NvbW1vZGl0eS1saXN0LnRwbFxuLy8gbW9kdWxlIGlkID0gNDZcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwidmFyIHRlbXBsYXRlPXJlcXVpcmUoJ3Rtb2Rqcy1sb2FkZXIvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHM9dGVtcGxhdGUoJ3RwbC9jb21tb2RpdHktbGlzdC9jaG9pY2UtbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGRpdiBjbGFzcz1cImxpc3QtY2hvaWNlIGZsXCIgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+IDxpbWcgc3JjPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm9uZVBob3RvKTtcbiRvdXQrPSdcIj4gPHAgY2xhc3M9XCJsaXN0LW5hbWVcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9wPiA8ZGl2IGNsYXNzPVwibGlzdC1jb250IGNsZWFyZml4XCI+IDxzcGFuIGNsYXNzPVwibGlzdC1tb25leSBmbFwiPu+/pSc7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5wcmljZSk7XG4kb3V0Kz0nLjAwPC9zcGFuPiA8c3BhbiBjbGFzcz1cImxpc3QtbnVtIGZyXCI+PGI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLnJlbWFya051bSB8fCAnMCcpO1xuJG91dCs9JzwvYj7kurror4Tku7c8L3NwYW4+IDwvZGl2PiA8L2Rpdj4gJztcbn0pO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3RwbC9jb21tb2RpdHktbGlzdC9jaG9pY2UtbGlzdC50cGxcbi8vIG1vZHVsZSBpZCA9IDQ3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsInZhciB0ZW1wbGF0ZT1yZXF1aXJlKCd0bW9kanMtbG9hZGVyL3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzPXRlbXBsYXRlKCd0cGwvY29tbW9kaXR5LWxpc3QvY29tbW9kaXR5LWxlZnQtbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGRpdiBjbGFzcz1cImNvbW1vZGl0eS1sZWZ0LWxpc3RcIiBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4gPGltZyBzcmM9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUub25lUGhvdG8pO1xuJG91dCs9J1wiPiA8cCBjbGFzcz1cImxlZnQtbGlzdC1uYW1lXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvcD4gPHAgY2xhc3M9XCJsZWZ0LWxpc3QtbW9uZXlcIj7vv6UgJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLnByaWNlKTtcbiRvdXQrPScuMDA8L3A+IDxwIGNsYXNzPVwibGVmdC1saXN0LWFzc2Vzc1wiPuW3suaciSA8Yj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUucmVtYXJrTnVtIHx8ICcwJyk7XG4kb3V0Kz0nPC9iPiDkurror4Tku7c8L3A+IDwvZGl2PiAnO1xufSk7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdHBsL2NvbW1vZGl0eS1saXN0L2NvbW1vZGl0eS1sZWZ0LWxpc3QudHBsXG4vLyBtb2R1bGUgaWQgPSA0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgndHBsL2NvbW1vZGl0eS1saXN0L3R5cGUtbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGNsYXNzPVwiZmxcIiBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4gJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JyA8L2xpPiAnO1xufSk7XG5yZXR1cm4gbmV3IFN0cmluZygkb3V0KTtcbn0pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vdHBsL2NvbW1vZGl0eS1saXN0L3R5cGUtbGlzdC50cGxcbi8vIG1vZHVsZSBpZCA9IDQ5XG4vLyBtb2R1bGUgY2h1bmtzID0gMSJdLCJzb3VyY2VSb290IjoiIn0=