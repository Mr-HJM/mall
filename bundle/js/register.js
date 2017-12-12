webpackJsonp([11,12],{

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(71);


/***/ }),

/***/ 2:
/***/ (function(module, exports) {

	module.exports = $;

/***/ }),

/***/ 3:
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

/***/ 4:
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

/***/ 5:
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

/***/ 6:
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

/***/ 7:
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

/***/ 8:
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

/***/ 9:
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
	                    location.href = '../commodity-base/commodity-list.html?flag=' + thisName + '&parentId=' + thisId;
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

/***/ 10:
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

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/integral-top',function($data,$filename
	/**/) {
	'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,$value=$data.$value,$index=$data.$index,$escape=$utils.$escape,$out='';$out+='<div class="top-site"> <div class="site">  <div class="welcome-presence fl"> <div class="welcome fl">您好，欢迎光临御廷家居！</div> <div class="site-loged fl"> <span class="loging">[ 登录 ]</span> <span class="register">[ 注册 ]</span> </div> </div>  <div class="site-loging-success fr"> <ul class="clearfix"> <li class="my-order"><i class="order"></i><a>我的订单</a></li> <li class="my-car"><i class="cart"></i><a>购物车</a></li> <li class="mu-info"><i class="user"></i><a>用户管理</a></li> </ul> </div> </div> </div> <div class="topCon"> <div class="top-logo clearfix"> <div class="logo fl"> <img src="../../bundle/img/logo.png"> </div> <div class="search fl"> <input type="text" class="search-name fl"> <span class="search-btn fr">搜 索</span> <img src="../../bundle/img/icon-search.png" class="search-icon"> <img src="../../bundle/img/icon-yuyin.png" class="yuyin-icon"> <ul class="search-hot"></ul> </div> </div> <div class="all-nav clearfix"> <div class="all-classify fl">全部商品分类</div> <ul class="nav-classify fl"> ';
	$each($data,function($value,$index){
	$out+=' <li data-id="';
	$out+=$escape($value.id);
	$out+='">';
	$out+=$escape($value.name);
	$out+='</li> ';
	});
	$out+=' </ul> </div> <div class="all-list"> <ul class="all_list"></ul> <div class="more-categories"> <span>更多分类</span>  <div class="more-fen clearfix"></div> </div> </div> </div>';
	return new String($out);
	});

/***/ }),

/***/ 12:
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

/***/ 13:
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

/***/ 14:
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

/***/ 15:
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

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

	var template=__webpack_require__(12);
	module.exports=template('dep/header-nav/tpl/integral-bottom','<div class="return-top"></div> <div class="bottomCon clearfix"> <ul class="foot-nav gouwu fl clearfix"> <div>购物指南</div> <li> <a href="javascript:void(0);">购物流程</a> </li> <li> <a href="javascript:void(0);">会员介绍</a> </li> <li> <a href="javascript:void(0);">团购/机票</a> </li> <li> <a href="javascript:void(0);">常见问题</a> </li> <li> <a href="javascript:void(0);">联系客服</a> </li> </ul> <ul class="foot-nav peisong fl clearfix"> <div>配送方式</div> <li> <a href="javascript:void(0);">上门自提</a> </li> <li> <a href="javascript:void(0);">211限时达</a> </li> <li> <a href="javascript:void(0);">配送服务查询</a> </li> <li> <a href="javascript:void(0);">配送费收取标准</a> </li> <li> <a href="javascript:void(0);">海外配送</a> </li> </ul> <ul class="foot-nav zhifu fl clearfix"> <div>支付方式</div> <li> <a href="javascript:void(0);">货到付款</a> </li> <li> <a href="javascript:void(0);">在线支付</a> </li> <li> <a href="javascript:void(0);">分期付款</a> </li> <li> <a href="javascript:void(0);">邮局汇款</a> </li> <li> <a href="javascript:void(0);">公司转账</a> </li> </ul> <ul class="foot-nav shouhou fl clearfix"> <div>售后服务</div> <li> <a href="javascript:void(0);">售后政策</a> </li> <li> <a href="javascript:void(0);">价格保护</a> </li> <li> <a href="javascript:void(0);">退款说明</a> </li> <li> <a href="javascript:void(0);">返修/退换货</a> </li> <li> <a href="javascript:void(0);">取消订单</a> </li> </ul> </div>');

/***/ }),

/***/ 71:
/***/ (function(module, exports, __webpack_require__) {

	
	var ajax = __webpack_require__(3);
	var header = __webpack_require__(9);
	var message = __webpack_require__(72);
	
	var integral = {
		init: function(){
			var me = this;
			header.init(function(){
				$('.top-site,.all-nav,.all-list,.search').remove();
				var welcomeHtml = "<div class='welcomeLogin fl'>欢迎注册</div><div class='already fr'>已有账号？<span>请登录</span></div>";
		        $('.top-logo').append(welcomeHtml);
		        me.logingBtn();
		        me.clickEven();
			});
		},
		logingBtn: function(){
			var me = this;
			$('.wrap .login-btn').on('click', function(){
				if($('.user-name').val() == ''){
					$('.login-detail .username').show();
				} else {
					$('.login-detail .username').hide();
				}
				if($('.user-pass').val() == '') {
					$('.login-detail .userpass').show();
				} else {
					$('.login-detail .userpass').hide();
				}
				if($('.user-phone').val() == '') {
					$('.login-detail .userPhone').show();
				} else {
					$('.login-detail .userPhone').hide();
				}
				if($('.user-pass').val() != $('.user_pass').val()) {
					$('.login-detail .userPass').show();
				} else {
					$('.login-detail .userPass').hide();
				}
				if($('.user-name').val() != '' && $('.user-pass').val() != '' && $('.user-phone').val() != '' && $('.user-pass').val() == $('.user_pass').val()){
					ajax({
			            url: '/eshop/account/regist',
			            type: 'post',
			            data:{
			                loginName: $('.user-name').val(),
			                password: $('.user-pass').val(),
			                mobile: $('.user-phone').val()
			            }
			        }).then(function(data){
			            if(data.status == 200){
			            	message.popMess('body','添加成功');
			            	setTimeout(function(){
			            		location.href = '../integral-base/login.html';
			            	},2000);
			            } else {
			            	alert(data.message);
			            }
			        });
				}
			})
		},
		clickEven: function(){
			var me = this;
			$('.already span').on('click', function(){
				location.href = '../integral-base/login.html';
			})
		}
	}
	
	integral.init()


/***/ }),

/***/ 72:
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by Lanxumit on 2016/5/27.
	 */
	var $ = __webpack_require__(2);
	
	//pop add pic success
	
	var _callback = null, _ele = null,_mes = null;
	var message = {
	    style: {
	        opacity:1,
	        top:"20px",
	        width:"250px",
	        height:"30px",
	        marginLeft:"-125px"
	    },
	    speed:500,
	    init:function(){
	        var me = this;
	        this.addPop();
	        this.popMess();
	    },
	    an_callback:function(call){
	        var me = this;
	        setTimeout(function(){
	            //$('.pop-message').fadeOut();
	            $(".pop-message").remove();
	            if(call){
	                call();
	            }
	
	        },2000);
	    },
	    popMess:function(){
	        var me = this;
	        $('.pop-message').animate(me.style,me.speed,function(){me.an_callback(_callback)});
	    },
	    addPop:function(){
	        var me = this;
	        var html ='<div class="pop-message">'+_mes+'</div>';
	        $(_ele).css('position','relative').append(html);
	        if(_ele =='body'||_ele==''){
	            $('.pop-message').css({"position":"fixed","top":"230px"});
	            me.style.top = "250px";
	        }
	    }
	
	};
	module.exports = {
	    /**
	     * ele:parent盒子
	     * mes:要弹出的消息
	     * callback:回调函数
	     * 说明：参数可全部省略，或者直接写回调
	     * */
	   popMess:function(ele,mes,callback){
	        if(typeof(ele) === 'function'){
	            _callback = ele;
	            _ele = 'body';
	            _mes= '添加成功';
	        }else{
	            if(typeof(mes) === 'function'){
	                _callback = mes;
	                _ele = ele;
	                _mes='添加成功';
	            }else{
	                _ele = ele||'body';
	                _mes= mes|| '添加成功';
	                _callback = callback || null ;
	            }
	        }
	       message.init();
	   }
	};


/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCIkXCI/NTdhYSoqKioqKioqIiwid2VicGFjazovLy8uL2RlcC91dGlsL2FqYXguanM/MTRkNyoqKioqKioqIiwid2VicGFjazovLy8uL34vcS9xLmpzP2JiMjcqKioqKioqKiIsIndlYnBhY2s6Ly8vLi9+L3Byb2Nlc3MvYnJvd3Nlci5qcz84MmU0KioqKioqKioiLCJ3ZWJwYWNrOi8vLy4vfi93ZWJwYWNrLXN0cmVhbS9+L3RpbWVycy1icm93c2VyaWZ5L21haW4uanM/NGJjNioqKioqKioqIiwid2VicGFjazovLy8uL34vc2V0aW1tZWRpYXRlL3NldEltbWVkaWF0ZS5qcz80YTgwKioqKioqKioiLCJ3ZWJwYWNrOi8vLy4vZGVwL2NvbmZpZy5qcz85ODI1KioqKioqKioiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvaGVhZGVyLmpzP2U3MDEqKioqIiwid2VicGFjazovLy8uL2RlcC9qcXVlcnkuanNvbnAuanM/MWE0NyoqKioiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLXRvcC50cGw/NWUwZSoqKioiLCJ3ZWJwYWNrOi8vLy4vfi90bW9kanMtbG9hZGVyL3J1bnRpbWUuanM/ODk2NioqKioqKioqIiwid2VicGFjazovLy8uL2RlcC9oZWFkZXItbmF2L3RwbC90eXBlLWxpc3QudHBsPzdlMGIqKioqIiwid2VicGFjazovLy8uL2RlcC9oZWFkZXItbmF2L3RwbC9ob3QtbGlzdC50cGw/YTJmMSoqKioiLCJ3ZWJwYWNrOi8vLy4vZGVwL2hlYWRlci1uYXYvdHBsL21vcmUtZmVuLnRwbD81NjJhKioqKiIsIndlYnBhY2s6Ly8vLi9kZXAvaGVhZGVyLW5hdi90cGwvaW50ZWdyYWwtYm90dG9tLnRwbD9iNDhkKioqKiIsIndlYnBhY2s6Ly8vLi9qcy9tYWluL3JlZ2lzdGVyLmpzIiwid2VicGFjazovLy8uL2RlcC91dGlsL21lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5n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QUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFTO0FBQ1QsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1DQUFrQyxjQUFjLEVBQUU7QUFDbEQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQWtDLGNBQWMsRUFBRTtBQUNsRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMLGlCQUFnQjtBQUNoQixNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMLGlCQUFnQjtBQUNoQixNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSTtBQUNKO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEIsY0FBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBb0IsUUFBUTtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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VUFBUztBQUNUO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxNQUFNLHNDQUFzQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsbURBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsRUFBQzs7Ozs7Ozs7O0FDeGhFRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0JBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRzs7Ozs7OztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsMEJBQXlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsNkNBQTRDLGNBQWM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWdCO0FBQ2hCLGdCQUFlO0FBQ2Y7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBLElBQUc7QUFDSCxHQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTs7Ozs7Ozs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0EsZ0VBQStELDBCQUEwQjtBQUN6RixNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFtQyxpQ0FBaUM7QUFDcEU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9ICQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCIkXCJcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCIvKipcclxuICogQ3JlYXRlZCBieSBZVSBvbiAyMDE2LzIvMTguXHJcbiAqL1xyXG52YXIgUSA9IHJlcXVpcmUoJ3EnKTtcclxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcclxudmFyIENPTkZJRz1yZXF1aXJlKCdjb25maWcnKTtcclxuJC5hamF4U2V0dXAoe2NhY2hlOiBmYWxzZX0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHQpe1xyXG4gICAgcmV0dXJuIFEucHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QsIG5vdGlmeSl7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxyXG4gICAgICAgICAgICBkYXRhOiBvcHQuZGF0YSB8fCB7fSxcclxuICAgICAgICAgICAgZGF0YVR5cGU6IG9wdC5kYXRhVHlwZSB8fCAnanNvbicsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IG9wdC5oZWFkZXJzIHx8IHt9LFxyXG4gICAgICAgICAgICB0eXBlOiBvcHQudHlwZSB8fCAnZ2V0JyxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEsdGV4dFN0YXR1cyxqcVhIUikge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGpxWEhSLnRoZW47XHJcbiAgICAgICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAnNDAxJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy/mnKrnmbvlvZUg5oiW6ICF55m75b2V6LaF5pe2XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9Q09ORklHLlVSTC5TU09fTE9HSU4rXCI/c2VydmljZT1cIitDT05GSUcuVVJMLklOREVYO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBqcVhIUi50aGVuO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3V0aWwvYWpheC5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgNSA2IDcgOCAxMCAxMSIsIi8vIHZpbTp0cz00OnN0cz00OnN3PTQ6XG4vKiFcbiAqXG4gKiBDb3B5cmlnaHQgMjAwOS0yMDE3IEtyaXMgS293YWwgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVRcbiAqIGxpY2Vuc2UgZm91bmQgYXQgaHR0cHM6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9xL2Jsb2IvdjEvTElDRU5TRVxuICpcbiAqIFdpdGggcGFydHMgYnkgVHlsZXIgQ2xvc2VcbiAqIENvcHlyaWdodCAyMDA3LTIwMDkgVHlsZXIgQ2xvc2UgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgWCBsaWNlbnNlIGZvdW5kXG4gKiBhdCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLmh0bWxcbiAqIEZvcmtlZCBhdCByZWZfc2VuZC5qcyB2ZXJzaW9uOiAyMDA5LTA1LTExXG4gKlxuICogV2l0aCBwYXJ0cyBieSBNYXJrIE1pbGxlclxuICogQ29weXJpZ2h0IChDKSAyMDExIEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICovXG5cbihmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gVGhpcyBmaWxlIHdpbGwgZnVuY3Rpb24gcHJvcGVybHkgYXMgYSA8c2NyaXB0PiB0YWcsIG9yIGEgbW9kdWxlXG4gICAgLy8gdXNpbmcgQ29tbW9uSlMgYW5kIE5vZGVKUyBvciBSZXF1aXJlSlMgbW9kdWxlIGZvcm1hdHMuICBJblxuICAgIC8vIENvbW1vbi9Ob2RlL1JlcXVpcmVKUywgdGhlIG1vZHVsZSBleHBvcnRzIHRoZSBRIEFQSSBhbmQgd2hlblxuICAgIC8vIGV4ZWN1dGVkIGFzIGEgc2ltcGxlIDxzY3JpcHQ+LCBpdCBjcmVhdGVzIGEgUSBnbG9iYWwgaW5zdGVhZC5cblxuICAgIC8vIE1vbnRhZ2UgUmVxdWlyZVxuICAgIGlmICh0eXBlb2YgYm9vdHN0cmFwID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYm9vdHN0cmFwKFwicHJvbWlzZVwiLCBkZWZpbml0aW9uKTtcblxuICAgIC8vIENvbW1vbkpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xuXG4gICAgLy8gUmVxdWlyZUpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG5cbiAgICAvLyBTRVMgKFNlY3VyZSBFY21hU2NyaXB0KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlcyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoIXNlcy5vaygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXMubWFrZVEgPSBkZWZpbml0aW9uO1xuICAgICAgICB9XG5cbiAgICAvLyA8c2NyaXB0PlxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBQcmVmZXIgd2luZG93IG92ZXIgc2VsZiBmb3IgYWRkLW9uIHNjcmlwdHMuIFVzZSBzZWxmIGZvclxuICAgICAgICAvLyBub24td2luZG93ZWQgY29udGV4dHMuXG4gICAgICAgIHZhciBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDogc2VsZjtcblxuICAgICAgICAvLyBHZXQgdGhlIGB3aW5kb3dgIG9iamVjdCwgc2F2ZSB0aGUgcHJldmlvdXMgUSBnbG9iYWxcbiAgICAgICAgLy8gYW5kIGluaXRpYWxpemUgUSBhcyBhIGdsb2JhbC5cbiAgICAgICAgdmFyIHByZXZpb3VzUSA9IGdsb2JhbC5RO1xuICAgICAgICBnbG9iYWwuUSA9IGRlZmluaXRpb24oKTtcblxuICAgICAgICAvLyBBZGQgYSBub0NvbmZsaWN0IGZ1bmN0aW9uIHNvIFEgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgICAgLy8gZ2xvYmFsIG5hbWVzcGFjZS5cbiAgICAgICAgZ2xvYmFsLlEubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdsb2JhbC5RID0gcHJldmlvdXNRO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGVudmlyb25tZW50IHdhcyBub3QgYW50aWNpcGF0ZWQgYnkgUS4gUGxlYXNlIGZpbGUgYSBidWcuXCIpO1xuICAgIH1cblxufSkoZnVuY3Rpb24gKCkge1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBoYXNTdGFja3MgPSBmYWxzZTtcbnRyeSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59IGNhdGNoIChlKSB7XG4gICAgaGFzU3RhY2tzID0gISFlLnN0YWNrO1xufVxuXG4vLyBBbGwgY29kZSBhZnRlciB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMgcmVwb3J0ZWRcbi8vIGJ5IFEuXG52YXIgcVN0YXJ0aW5nTGluZSA9IGNhcHR1cmVMaW5lKCk7XG52YXIgcUZpbGVOYW1lO1xuXG4vLyBzaGltc1xuXG4vLyB1c2VkIGZvciBmYWxsYmFjayBpbiBcImFsbFJlc29sdmVkXCJcbnZhciBub29wID0gZnVuY3Rpb24gKCkge307XG5cbi8vIFVzZSB0aGUgZmFzdGVzdCBwb3NzaWJsZSBtZWFucyB0byBleGVjdXRlIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuXG4vLyBvZiB0aGUgZXZlbnQgbG9vcC5cbnZhciBuZXh0VGljayA9KGZ1bmN0aW9uICgpIHtcbiAgICAvLyBsaW5rZWQgbGlzdCBvZiB0YXNrcyAoc2luZ2xlLCB3aXRoIGhlYWQgbm9kZSlcbiAgICB2YXIgaGVhZCA9IHt0YXNrOiB2b2lkIDAsIG5leHQ6IG51bGx9O1xuICAgIHZhciB0YWlsID0gaGVhZDtcbiAgICB2YXIgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB2YXIgcmVxdWVzdFRpY2sgPSB2b2lkIDA7XG4gICAgdmFyIGlzTm9kZUpTID0gZmFsc2U7XG4gICAgLy8gcXVldWUgZm9yIGxhdGUgdGFza3MsIHVzZWQgYnkgdW5oYW5kbGVkIHJlamVjdGlvbiB0cmFja2luZ1xuICAgIHZhciBsYXRlclF1ZXVlID0gW107XG5cbiAgICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAgICAgLyoganNoaW50IGxvb3BmdW5jOiB0cnVlICovXG4gICAgICAgIHZhciB0YXNrLCBkb21haW47XG5cbiAgICAgICAgd2hpbGUgKGhlYWQubmV4dCkge1xuICAgICAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgICAgICAgIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgICAgICBoZWFkLnRhc2sgPSB2b2lkIDA7XG4gICAgICAgICAgICBkb21haW4gPSBoZWFkLmRvbWFpbjtcblxuICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcnVuU2luZ2xlKHRhc2ssIGRvbWFpbik7XG5cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAobGF0ZXJRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRhc2sgPSBsYXRlclF1ZXVlLnBvcCgpO1xuICAgICAgICAgICAgcnVuU2luZ2xlKHRhc2spO1xuICAgICAgICB9XG4gICAgICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIHJ1bnMgYSBzaW5nbGUgZnVuY3Rpb24gaW4gdGhlIGFzeW5jIHF1ZXVlXG4gICAgZnVuY3Rpb24gcnVuU2luZ2xlKHRhc2ssIGRvbWFpbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGFzaygpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgIC8vIEluIG5vZGUsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIGNvbnNpZGVyZWQgZmF0YWwgZXJyb3JzLlxuICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgIC8vIGxpc3RlbmluZyBcInVuY2F1Z2h0RXhjZXB0aW9uXCIgZXZlbnRzIChhcyBkb21haW5zIGRvZXMpLlxuICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRocm93IGU7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIGFzeW5jaHJvbm91c2x5IHRvIGF2b2lkIHNsb3ctZG93bnMuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmV4dFRpY2sgPSBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICB0YWlsID0gdGFpbC5uZXh0ID0ge1xuICAgICAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgICAgIGRvbWFpbjogaXNOb2RlSlMgJiYgcHJvY2Vzcy5kb21haW4sXG4gICAgICAgICAgICBuZXh0OiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgcHJvY2Vzcy50b1N0cmluZygpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgICAgIC8vIEVuc3VyZSBRIGlzIGluIGEgcmVhbCBOb2RlIGVudmlyb25tZW50LCB3aXRoIGEgYHByb2Nlc3MubmV4dFRpY2tgLlxuICAgICAgICAvLyBUbyBzZWUgdGhyb3VnaCBmYWtlIE5vZGUgZW52aXJvbm1lbnRzOlxuICAgICAgICAvLyAqIE1vY2hhIHRlc3QgcnVubmVyIC0gZXhwb3NlcyBhIGBwcm9jZXNzYCBnbG9iYWwgd2l0aG91dCBhIGBuZXh0VGlja2BcbiAgICAgICAgLy8gKiBCcm93c2VyaWZ5IC0gZXhwb3NlcyBhIGBwcm9jZXNzLm5leFRpY2tgIGZ1bmN0aW9uIHRoYXQgdXNlc1xuICAgICAgICAvLyAgIGBzZXRUaW1lb3V0YC4gSW4gdGhpcyBjYXNlIGBzZXRJbW1lZGlhdGVgIGlzIHByZWZlcnJlZCBiZWNhdXNlXG4gICAgICAgIC8vICAgIGl0IGlzIGZhc3Rlci4gQnJvd3NlcmlmeSdzIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkc1xuICAgICAgICAvLyAgIFwiW29iamVjdCBPYmplY3RdXCIsIHdoaWxlIGluIGEgcmVhbCBOb2RlIGVudmlyb25tZW50XG4gICAgICAgIC8vICAgYHByb2Nlc3MudG9TdHJpbmcoKWAgeWllbGRzIFwiW29iamVjdCBwcm9jZXNzXVwiLlxuICAgICAgICBpc05vZGVKUyA9IHRydWU7XG5cbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIEluIElFMTAsIE5vZGUuanMgMC45Kywgb3IgaHR0cHM6Ly9naXRodWIuY29tL05vYmxlSlMvc2V0SW1tZWRpYXRlXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZsdXNoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgICAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxuICAgICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgICAvLyBBdCBsZWFzdCBTYWZhcmkgVmVyc2lvbiA2LjAuNSAoODUzNi4zMC4xKSBpbnRlcm1pdHRlbnRseSBjYW5ub3QgY3JlYXRlXG4gICAgICAgIC8vIHdvcmtpbmcgbWVzc2FnZSBwb3J0cyB0aGUgZmlyc3QgdGltZSBhIHBhZ2UgbG9hZHMuXG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSByZXF1ZXN0UG9ydFRpY2s7XG4gICAgICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlcXVlc3RQb3J0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE9wZXJhIHJlcXVpcmVzIHVzIHRvIHByb3ZpZGUgYSBtZXNzYWdlIHBheWxvYWQsIHJlZ2FyZGxlc3Mgb2ZcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgd2UgdXNlIGl0LlxuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgIHJlcXVlc3RQb3J0VGljaygpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb2xkIGJyb3dzZXJzXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIHJ1bnMgYSB0YXNrIGFmdGVyIGFsbCBvdGhlciB0YXNrcyBoYXZlIGJlZW4gcnVuXG4gICAgLy8gdGhpcyBpcyB1c2VmdWwgZm9yIHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmcgdGhhdCBuZWVkcyB0byBoYXBwZW5cbiAgICAvLyBhZnRlciBhbGwgYHRoZW5gZCB0YXNrcyBoYXZlIGJlZW4gcnVuLlxuICAgIG5leHRUaWNrLnJ1bkFmdGVyID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgbGF0ZXJRdWV1ZS5wdXNoKHRhc2spO1xuICAgICAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXF1ZXN0VGljaygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gbmV4dFRpY2s7XG59KSgpO1xuXG4vLyBBdHRlbXB0IHRvIG1ha2UgZ2VuZXJpY3Mgc2FmZSBpbiB0aGUgZmFjZSBvZiBkb3duc3RyZWFtXG4vLyBtb2RpZmljYXRpb25zLlxuLy8gVGhlcmUgaXMgbm8gc2l0dWF0aW9uIHdoZXJlIHRoaXMgaXMgbmVjZXNzYXJ5LlxuLy8gSWYgeW91IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsIHRoZXNlIHByaW1vcmRpYWxzIG5lZWQgdG8gYmVcbi8vIGRlZXBseSBmcm96ZW4gYW55d2F5LCBhbmQgaWYgeW91IGRvbuKAmXQgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSxcbi8vIHRoaXMgaXMganVzdCBwbGFpbiBwYXJhbm9pZC5cbi8vIEhvd2V2ZXIsIHRoaXMgKiptaWdodCoqIGhhdmUgdGhlIG5pY2Ugc2lkZS1lZmZlY3Qgb2YgcmVkdWNpbmcgdGhlIHNpemUgb2Zcbi8vIHRoZSBtaW5pZmllZCBjb2RlIGJ5IHJlZHVjaW5nIHguY2FsbCgpIHRvIG1lcmVseSB4KClcbi8vIFNlZSBNYXJrIE1pbGxlcuKAmXMgZXhwbGFuYXRpb24gb2Ygd2hhdCB0aGlzIGRvZXMuXG4vLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1jb252ZW50aW9uczpzYWZlX21ldGFfcHJvZ3JhbW1pbmdcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbDtcbmZ1bmN0aW9uIHVuY3VycnlUaGlzKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY2FsbC5hcHBseShmLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG4vLyBUaGlzIGlzIGVxdWl2YWxlbnQsIGJ1dCBzbG93ZXI6XG4vLyB1bmN1cnJ5VGhpcyA9IEZ1bmN0aW9uX2JpbmQuYmluZChGdW5jdGlvbl9iaW5kLmNhbGwpO1xuLy8gaHR0cDovL2pzcGVyZi5jb20vdW5jdXJyeXRoaXNcblxudmFyIGFycmF5X3NsaWNlID0gdW5jdXJyeVRoaXMoQXJyYXkucHJvdG90eXBlLnNsaWNlKTtcblxudmFyIGFycmF5X3JlZHVjZSA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UgfHwgZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcykge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIC8vIGNvbmNlcm5pbmcgdGhlIGluaXRpYWwgdmFsdWUsIGlmIG9uZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHNlZWsgdG8gdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBhcnJheSwgYWNjb3VudGluZ1xuICAgICAgICAgICAgLy8gZm9yIHRoZSBwb3NzaWJpbGl0eSB0aGF0IGlzIGlzIGEgc3BhcnNlIGFycmF5XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzaXMgPSB0aGlzW2luZGV4KytdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCsraW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlICgxKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWR1Y2VcbiAgICAgICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyBhY2NvdW50IGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCB0aGUgYXJyYXkgaXMgc3BhcnNlXG4gICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGJhc2lzID0gY2FsbGJhY2soYmFzaXMsIHRoaXNbaW5kZXhdLCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2lzO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9pbmRleE9mID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5vdCBhIHZlcnkgZ29vZCBzaGltLCBidXQgZ29vZCBlbm91Z2ggZm9yIG91ciBvbmUgdXNlIG9mIGl0XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9tYXAgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUubWFwIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3ApIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY29sbGVjdCA9IFtdO1xuICAgICAgICBhcnJheV9yZWR1Y2Uoc2VsZiwgZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBjb2xsZWN0LnB1c2goY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIGluZGV4LCBzZWxmKSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0O1xuICAgIH1cbik7XG5cbnZhciBvYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG4gICAgZnVuY3Rpb24gVHlwZSgpIHsgfVxuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHJldHVybiBuZXcgVHlwZSgpO1xufTtcblxudmFyIG9iamVjdF9kZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB8fCBmdW5jdGlvbiAob2JqLCBwcm9wLCBkZXNjcmlwdG9yKSB7XG4gICAgb2JqW3Byb3BdID0gZGVzY3JpcHRvci52YWx1ZTtcbiAgICByZXR1cm4gb2JqO1xufTtcblxudmFyIG9iamVjdF9oYXNPd25Qcm9wZXJ0eSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuXG52YXIgb2JqZWN0X2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3RfaGFzT3duUHJvcGVydHkob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn07XG5cbnZhciBvYmplY3RfdG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IE9iamVjdCh2YWx1ZSk7XG59XG5cbi8vIGdlbmVyYXRvciByZWxhdGVkIHNoaW1zXG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBmdW5jdGlvbiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG5mdW5jdGlvbiBpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgb2JqZWN0X3RvU3RyaW5nKGV4Y2VwdGlvbikgPT09IFwiW29iamVjdCBTdG9wSXRlcmF0aW9uXVwiIHx8XG4gICAgICAgIGV4Y2VwdGlvbiBpbnN0YW5jZW9mIFFSZXR1cm5WYWx1ZVxuICAgICk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBoZWxwZXIgYW5kIFEucmV0dXJuIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluXG4vLyBTcGlkZXJNb25rZXkuXG52YXIgUVJldHVyblZhbHVlO1xuaWYgKHR5cGVvZiBSZXR1cm5WYWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIFFSZXR1cm5WYWx1ZSA9IFJldHVyblZhbHVlO1xufSBlbHNlIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH07XG59XG5cbi8vIGxvbmcgc3RhY2sgdHJhY2VzXG5cbnZhciBTVEFDS19KVU1QX1NFUEFSQVRPUiA9IFwiRnJvbSBwcmV2aW91cyBldmVudDpcIjtcblxuZnVuY3Rpb24gbWFrZVN0YWNrVHJhY2VMb25nKGVycm9yLCBwcm9taXNlKSB7XG4gICAgLy8gSWYgcG9zc2libGUsIHRyYW5zZm9ybSB0aGUgZXJyb3Igc3RhY2sgdHJhY2UgYnkgcmVtb3ZpbmcgTm9kZSBhbmQgUVxuICAgIC8vIGNydWZ0LCB0aGVuIGNvbmNhdGVuYXRpbmcgd2l0aCB0aGUgc3RhY2sgdHJhY2Ugb2YgYHByb21pc2VgLiBTZWUgIzU3LlxuICAgIGlmIChoYXNTdGFja3MgJiZcbiAgICAgICAgcHJvbWlzZS5zdGFjayAmJlxuICAgICAgICB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgZXJyb3IgIT09IG51bGwgJiZcbiAgICAgICAgZXJyb3Iuc3RhY2tcbiAgICApIHtcbiAgICAgICAgdmFyIHN0YWNrcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwID0gcHJvbWlzZTsgISFwOyBwID0gcC5zb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChwLnN0YWNrICYmICghZXJyb3IuX19taW5pbXVtU3RhY2tDb3VudGVyX18gfHwgZXJyb3IuX19taW5pbXVtU3RhY2tDb3VudGVyX18gPiBwLnN0YWNrQ291bnRlcikpIHtcbiAgICAgICAgICAgICAgICBvYmplY3RfZGVmaW5lUHJvcGVydHkoZXJyb3IsIFwiX19taW5pbXVtU3RhY2tDb3VudGVyX19cIiwge3ZhbHVlOiBwLnN0YWNrQ291bnRlciwgY29uZmlndXJhYmxlOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgc3RhY2tzLnVuc2hpZnQocC5zdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2tzLnVuc2hpZnQoZXJyb3Iuc3RhY2spO1xuXG4gICAgICAgIHZhciBjb25jYXRlZFN0YWNrcyA9IHN0YWNrcy5qb2luKFwiXFxuXCIgKyBTVEFDS19KVU1QX1NFUEFSQVRPUiArIFwiXFxuXCIpO1xuICAgICAgICB2YXIgc3RhY2sgPSBmaWx0ZXJTdGFja1N0cmluZyhjb25jYXRlZFN0YWNrcyk7XG4gICAgICAgIG9iamVjdF9kZWZpbmVQcm9wZXJ0eShlcnJvciwgXCJzdGFja1wiLCB7dmFsdWU6IHN0YWNrLCBjb25maWd1cmFibGU6IHRydWV9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZpbHRlclN0YWNrU3RyaW5nKHN0YWNrU3RyaW5nKSB7XG4gICAgdmFyIGxpbmVzID0gc3RhY2tTdHJpbmcuc3BsaXQoXCJcXG5cIik7XG4gICAgdmFyIGRlc2lyZWRMaW5lcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tpXTtcblxuICAgICAgICBpZiAoIWlzSW50ZXJuYWxGcmFtZShsaW5lKSAmJiAhaXNOb2RlRnJhbWUobGluZSkgJiYgbGluZSkge1xuICAgICAgICAgICAgZGVzaXJlZExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlc2lyZWRMaW5lcy5qb2luKFwiXFxuXCIpO1xufVxuXG5mdW5jdGlvbiBpc05vZGVGcmFtZShzdGFja0xpbmUpIHtcbiAgICByZXR1cm4gc3RhY2tMaW5lLmluZGV4T2YoXCIobW9kdWxlLmpzOlwiKSAhPT0gLTEgfHxcbiAgICAgICAgICAgc3RhY2tMaW5lLmluZGV4T2YoXCIobm9kZS5qczpcIikgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoc3RhY2tMaW5lKSB7XG4gICAgLy8gTmFtZWQgZnVuY3Rpb25zOiBcImF0IGZ1bmN0aW9uTmFtZSAoZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXIpXCJcbiAgICAvLyBJbiBJRTEwIGZ1bmN0aW9uIG5hbWUgY2FuIGhhdmUgc3BhY2VzIChcIkFub255bW91cyBmdW5jdGlvblwiKSBPX29cbiAgICB2YXIgYXR0ZW1wdDEgPSAvYXQgLisgXFwoKC4rKTooXFxkKyk6KD86XFxkKylcXCkkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQxKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDFbMV0sIE51bWJlcihhdHRlbXB0MVsyXSldO1xuICAgIH1cblxuICAgIC8vIEFub255bW91cyBmdW5jdGlvbnM6IFwiYXQgZmlsZW5hbWU6bGluZU51bWJlcjpjb2x1bW5OdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MiA9IC9hdCAoW14gXSspOihcXGQrKTooPzpcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDIpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MlsxXSwgTnVtYmVyKGF0dGVtcHQyWzJdKV07XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveCBzdHlsZTogXCJmdW5jdGlvbkBmaWxlbmFtZTpsaW5lTnVtYmVyIG9yIEBmaWxlbmFtZTpsaW5lTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDMgPSAvLipAKC4rKTooXFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQzKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDNbMV0sIE51bWJlcihhdHRlbXB0M1syXSldO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNJbnRlcm5hbEZyYW1lKHN0YWNrTGluZSkge1xuICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoc3RhY2tMaW5lKTtcblxuICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgdmFyIGxpbmVOdW1iZXIgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG5cbiAgICByZXR1cm4gZmlsZU5hbWUgPT09IHFGaWxlTmFtZSAmJlxuICAgICAgICBsaW5lTnVtYmVyID49IHFTdGFydGluZ0xpbmUgJiZcbiAgICAgICAgbGluZU51bWJlciA8PSBxRW5kaW5nTGluZTtcbn1cblxuLy8gZGlzY292ZXIgb3duIGZpbGUgbmFtZSBhbmQgbGluZSBudW1iZXIgcmFuZ2UgZm9yIGZpbHRlcmluZyBzdGFja1xuLy8gdHJhY2VzXG5mdW5jdGlvbiBjYXB0dXJlTGluZSgpIHtcbiAgICBpZiAoIWhhc1N0YWNrcykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB2YXIgbGluZXMgPSBlLnN0YWNrLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICB2YXIgZmlyc3RMaW5lID0gbGluZXNbMF0uaW5kZXhPZihcIkBcIikgPiAwID8gbGluZXNbMV0gOiBsaW5lc1syXTtcbiAgICAgICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihmaXJzdExpbmUpO1xuICAgICAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcUZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgICAgICByZXR1cm4gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGVwcmVjYXRlKGNhbGxiYWNrLCBuYW1lLCBhbHRlcm5hdGl2ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICAgICAgdHlwZW9mIGNvbnNvbGUud2FybiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4obmFtZSArIFwiIGlzIGRlcHJlY2F0ZWQsIHVzZSBcIiArIGFsdGVybmF0aXZlICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpbnN0ZWFkLlwiLCBuZXcgRXJyb3IoXCJcIikuc3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShjYWxsYmFjaywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vLyBlbmQgb2Ygc2hpbXNcbi8vIGJlZ2lubmluZyBvZiByZWFsIHdvcmtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgcHJvbWlzZSBmb3IgYW4gaW1tZWRpYXRlIHJlZmVyZW5jZSwgcGFzc2VzIHByb21pc2VzIHRocm91Z2gsIG9yXG4gKiBjb2VyY2VzIHByb21pc2VzIGZyb20gZGlmZmVyZW50IHN5c3RlbXMuXG4gKiBAcGFyYW0gdmFsdWUgaW1tZWRpYXRlIHJlZmVyZW5jZSBvciBwcm9taXNlXG4gKi9cbmZ1bmN0aW9uIFEodmFsdWUpIHtcbiAgICAvLyBJZiB0aGUgb2JqZWN0IGlzIGFscmVhZHkgYSBQcm9taXNlLCByZXR1cm4gaXQgZGlyZWN0bHkuICBUaGlzIGVuYWJsZXNcbiAgICAvLyB0aGUgcmVzb2x2ZSBmdW5jdGlvbiB0byBib3RoIGJlIHVzZWQgdG8gY3JlYXRlZCByZWZlcmVuY2VzIGZyb20gb2JqZWN0cyxcbiAgICAvLyBidXQgdG8gdG9sZXJhYmx5IGNvZXJjZSBub24tcHJvbWlzZXMgdG8gcHJvbWlzZXMuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLy8gYXNzaW1pbGF0ZSB0aGVuYWJsZXNcbiAgICBpZiAoaXNQcm9taXNlQWxpa2UodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBjb2VyY2UodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdWxmaWxsKHZhbHVlKTtcbiAgICB9XG59XG5RLnJlc29sdmUgPSBRO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgdGFzayBpbiBhIGZ1dHVyZSB0dXJuIG9mIHRoZSBldmVudCBsb29wLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdGFza1xuICovXG5RLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbi8qKlxuICogQ29udHJvbHMgd2hldGhlciBvciBub3QgbG9uZyBzdGFjayB0cmFjZXMgd2lsbCBiZSBvblxuICovXG5RLmxvbmdTdGFja1N1cHBvcnQgPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgY291bnRlciBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgc3RvcHBpbmcgcG9pbnQgZm9yIGJ1aWxkaW5nXG4gKiBsb25nIHN0YWNrIHRyYWNlcy4gSW4gbWFrZVN0YWNrVHJhY2VMb25nIHdlIHdhbGsgYmFja3dhcmRzIHRocm91Z2hcbiAqIHRoZSBsaW5rZWQgbGlzdCBvZiBwcm9taXNlcywgb25seSBzdGFja3Mgd2hpY2ggd2VyZSBjcmVhdGVkIGJlZm9yZVxuICogdGhlIHJlamVjdGlvbiBhcmUgY29uY2F0ZW5hdGVkLlxuICovXG52YXIgbG9uZ1N0YWNrQ291bnRlciA9IDE7XG5cbi8vIGVuYWJsZSBsb25nIHN0YWNrcyBpZiBRX0RFQlVHIGlzIHNldFxuaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MgJiYgcHJvY2Vzcy5lbnYgJiYgcHJvY2Vzcy5lbnYuUV9ERUJVRykge1xuICAgIFEubG9uZ1N0YWNrU3VwcG9ydCA9IHRydWU7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHtwcm9taXNlLCByZXNvbHZlLCByZWplY3R9IG9iamVjdC5cbiAqXG4gKiBgcmVzb2x2ZWAgaXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2l0aCBhIG1vcmUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZVxuICogcHJvbWlzZS4gVG8gZnVsZmlsbCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGFueSB2YWx1ZSB0aGF0IGlzXG4gKiBub3QgYSB0aGVuYWJsZS4gVG8gcmVqZWN0IHRoZSBwcm9taXNlLCBpbnZva2UgYHJlc29sdmVgIHdpdGggYSByZWplY3RlZFxuICogdGhlbmFibGUsIG9yIGludm9rZSBgcmVqZWN0YCB3aXRoIHRoZSByZWFzb24gZGlyZWN0bHkuIFRvIHJlc29sdmUgdGhlXG4gKiBwcm9taXNlIHRvIGFub3RoZXIgdGhlbmFibGUsIHRodXMgcHV0dGluZyBpdCBpbiB0aGUgc2FtZSBzdGF0ZSwgaW52b2tlXG4gKiBgcmVzb2x2ZWAgd2l0aCB0aGF0IG90aGVyIHRoZW5hYmxlLlxuICovXG5RLmRlZmVyID0gZGVmZXI7XG5mdW5jdGlvbiBkZWZlcigpIHtcbiAgICAvLyBpZiBcIm1lc3NhZ2VzXCIgaXMgYW4gXCJBcnJheVwiLCB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBwcm9taXNlIGhhcyBub3QgeWV0XG4gICAgLy8gYmVlbiByZXNvbHZlZC4gIElmIGl0IGlzIFwidW5kZWZpbmVkXCIsIGl0IGhhcyBiZWVuIHJlc29sdmVkLiAgRWFjaFxuICAgIC8vIGVsZW1lbnQgb2YgdGhlIG1lc3NhZ2VzIGFycmF5IGlzIGl0c2VsZiBhbiBhcnJheSBvZiBjb21wbGV0ZSBhcmd1bWVudHMgdG9cbiAgICAvLyBmb3J3YXJkIHRvIHRoZSByZXNvbHZlZCBwcm9taXNlLiAgV2UgY29lcmNlIHRoZSByZXNvbHV0aW9uIHZhbHVlIHRvIGFcbiAgICAvLyBwcm9taXNlIHVzaW5nIHRoZSBgcmVzb2x2ZWAgZnVuY3Rpb24gYmVjYXVzZSBpdCBoYW5kbGVzIGJvdGggZnVsbHlcbiAgICAvLyBub24tdGhlbmFibGUgdmFsdWVzIGFuZCBvdGhlciB0aGVuYWJsZXMgZ3JhY2VmdWxseS5cbiAgICB2YXIgbWVzc2FnZXMgPSBbXSwgcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXSwgcmVzb2x2ZWRQcm9taXNlO1xuXG4gICAgdmFyIGRlZmVycmVkID0gb2JqZWN0X2NyZWF0ZShkZWZlci5wcm90b3R5cGUpO1xuICAgIHZhciBwcm9taXNlID0gb2JqZWN0X2NyZWF0ZShQcm9taXNlLnByb3RvdHlwZSk7XG5cbiAgICBwcm9taXNlLnByb21pc2VEaXNwYXRjaCA9IGZ1bmN0aW9uIChyZXNvbHZlLCBvcCwgb3BlcmFuZHMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goYXJncyk7XG4gICAgICAgICAgICBpZiAob3AgPT09IFwid2hlblwiICYmIG9wZXJhbmRzWzFdKSB7IC8vIHByb2dyZXNzIG9wZXJhbmRcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVycy5wdXNoKG9wZXJhbmRzWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkocmVzb2x2ZWRQcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFhYWCBkZXByZWNhdGVkXG4gICAgcHJvbWlzZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZWFyZXJWYWx1ZSA9IG5lYXJlcihyZXNvbHZlZFByb21pc2UpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKG5lYXJlclZhbHVlKSkge1xuICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmVhcmVyVmFsdWU7IC8vIHNob3J0ZW4gY2hhaW5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVhcmVyVmFsdWU7XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN0YXRlOiBcInBlbmRpbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlZFByb21pc2UuaW5zcGVjdCgpO1xuICAgIH07XG5cbiAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGRvbid0IHRyeSB0byB1c2UgYEVycm9yLmNhcHR1cmVTdGFja1RyYWNlYCBvciB0cmFuc2ZlciB0aGVcbiAgICAgICAgICAgIC8vIGFjY2Vzc29yIGFyb3VuZDsgdGhhdCBjYXVzZXMgbWVtb3J5IGxlYWtzIGFzIHBlciBHSC0xMTEuIEp1c3RcbiAgICAgICAgICAgIC8vIHJlaWZ5IHRoZSBzdGFjayB0cmFjZSBhcyBhIHN0cmluZyBBU0FQLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEF0IHRoZSBzYW1lIHRpbWUsIGN1dCBvZmYgdGhlIGZpcnN0IGxpbmU7IGl0J3MgYWx3YXlzIGp1c3RcbiAgICAgICAgICAgIC8vIFwiW29iamVjdCBQcm9taXNlXVxcblwiLCBhcyBwZXIgdGhlIGB0b1N0cmluZ2AuXG4gICAgICAgICAgICBwcm9taXNlLnN0YWNrID0gZS5zdGFjay5zdWJzdHJpbmcoZS5zdGFjay5pbmRleE9mKFwiXFxuXCIpICsgMSk7XG4gICAgICAgICAgICBwcm9taXNlLnN0YWNrQ291bnRlciA9IGxvbmdTdGFja0NvdW50ZXIrKztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5PVEU6IHdlIGRvIHRoZSBjaGVja3MgZm9yIGByZXNvbHZlZFByb21pc2VgIGluIGVhY2ggbWV0aG9kLCBpbnN0ZWFkIG9mXG4gICAgLy8gY29uc29saWRhdGluZyB0aGVtIGludG8gYGJlY29tZWAsIHNpbmNlIG90aGVyd2lzZSB3ZSdkIGNyZWF0ZSBuZXdcbiAgICAvLyBwcm9taXNlcyB3aXRoIHRoZSBsaW5lcyBgYmVjb21lKHdoYXRldmVyKHZhbHVlKSlgLiBTZWUgZS5nLiBHSC0yNTIuXG5cbiAgICBmdW5jdGlvbiBiZWNvbWUobmV3UHJvbWlzZSkge1xuICAgICAgICByZXNvbHZlZFByb21pc2UgPSBuZXdQcm9taXNlO1xuXG4gICAgICAgIGlmIChRLmxvbmdTdGFja1N1cHBvcnQgJiYgaGFzU3RhY2tzKSB7XG4gICAgICAgICAgICAvLyBPbmx5IGhvbGQgYSByZWZlcmVuY2UgdG8gdGhlIG5ldyBwcm9taXNlIGlmIGxvbmcgc3RhY2tzXG4gICAgICAgICAgICAvLyBhcmUgZW5hYmxlZCB0byByZWR1Y2UgbWVtb3J5IHVzYWdlXG4gICAgICAgICAgICBwcm9taXNlLnNvdXJjZSA9IG5ld1Byb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UobWVzc2FnZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ld1Byb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KG5ld1Byb21pc2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG5cbiAgICAgICAgbWVzc2FnZXMgPSB2b2lkIDA7XG4gICAgICAgIHByb2dyZXNzTGlzdGVuZXJzID0gdm9pZCAwO1xuICAgIH1cblxuICAgIGRlZmVycmVkLnByb21pc2UgPSBwcm9taXNlO1xuICAgIGRlZmVycmVkLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKFEodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgZGVmZXJyZWQuZnVsZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoZnVsZmlsbCh2YWx1ZSkpO1xuICAgIH07XG4gICAgZGVmZXJyZWQucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUocmVqZWN0KHJlYXNvbikpO1xuICAgIH07XG4gICAgZGVmZXJyZWQubm90aWZ5ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9ncmVzc0xpc3RlbmVycywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvZ3Jlc3NMaXN0ZW5lcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcihwcm9ncmVzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlZmVycmVkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBOb2RlLXN0eWxlIGNhbGxiYWNrIHRoYXQgd2lsbCByZXNvbHZlIG9yIHJlamVjdCB0aGUgZGVmZXJyZWRcbiAqIHByb21pc2UuXG4gKiBAcmV0dXJucyBhIG5vZGViYWNrXG4gKi9cbmRlZmVyLnByb3RvdHlwZS5tYWtlTm9kZVJlc29sdmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCB2YWx1ZSkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNlbGYucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG4vKipcbiAqIEBwYXJhbSByZXNvbHZlciB7RnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIG5vdGhpbmcgYW5kIGFjY2VwdHNcbiAqIHRoZSByZXNvbHZlLCByZWplY3QsIGFuZCBub3RpZnkgZnVuY3Rpb25zIGZvciBhIGRlZmVycmVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIHRoYXQgbWF5IGJlIHJlc29sdmVkIHdpdGggdGhlIGdpdmVuIHJlc29sdmUgYW5kIHJlamVjdFxuICogZnVuY3Rpb25zLCBvciByZWplY3RlZCBieSBhIHRocm93biBleGNlcHRpb24gaW4gcmVzb2x2ZXJcbiAqL1xuUS5Qcm9taXNlID0gcHJvbWlzZTsgLy8gRVM2XG5RLnByb21pc2UgPSBwcm9taXNlO1xuZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgfSBjYXRjaCAocmVhc29uKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxucHJvbWlzZS5yYWNlID0gcmFjZTsgLy8gRVM2XG5wcm9taXNlLmFsbCA9IGFsbDsgLy8gRVM2XG5wcm9taXNlLnJlamVjdCA9IHJlamVjdDsgLy8gRVM2XG5wcm9taXNlLnJlc29sdmUgPSBROyAvLyBFUzZcblxuLy8gWFhYIGV4cGVyaW1lbnRhbC4gIFRoaXMgbWV0aG9kIGlzIGEgd2F5IHRvIGRlbm90ZSB0aGF0IGEgbG9jYWwgdmFsdWUgaXNcbi8vIHNlcmlhbGl6YWJsZSBhbmQgc2hvdWxkIGJlIGltbWVkaWF0ZWx5IGRpc3BhdGNoZWQgdG8gYSByZW1vdGUgdXBvbiByZXF1ZXN0LFxuLy8gaW5zdGVhZCBvZiBwYXNzaW5nIGEgcmVmZXJlbmNlLlxuUS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSWYgdHdvIHByb21pc2VzIGV2ZW50dWFsbHkgZnVsZmlsbCB0byB0aGUgc2FtZSB2YWx1ZSwgcHJvbWlzZXMgdGhhdCB2YWx1ZSxcbiAqIGJ1dCBvdGhlcndpc2UgcmVqZWN0cy5cbiAqIEBwYXJhbSB4IHtBbnkqfVxuICogQHBhcmFtIHkge0FueSp9XG4gKiBAcmV0dXJucyB7QW55Kn0gYSBwcm9taXNlIGZvciB4IGFuZCB5IGlmIHRoZXkgYXJlIHRoZSBzYW1lLCBidXQgYSByZWplY3Rpb25cbiAqIG90aGVyd2lzZS5cbiAqXG4gKi9cblEuam9pbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgcmV0dXJuIFEoeCkuam9pbih5KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiBRKFt0aGlzLCB0aGF0XSkuc3ByZWFkKGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBcIj09PVwiIHNob3VsZCBiZSBPYmplY3QuaXMgb3IgZXF1aXZcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUSBjYW4ndCBqb2luOiBub3QgdGhlIHNhbWU6IFwiICsgeCArIFwiIFwiICsgeSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBmaXJzdCBvZiBhbiBhcnJheSBvZiBwcm9taXNlcyB0byBiZWNvbWUgc2V0dGxlZC5cbiAqIEBwYXJhbSBhbnN3ZXJzIHtBcnJheVtBbnkqXX0gcHJvbWlzZXMgdG8gcmFjZVxuICogQHJldHVybnMge0FueSp9IHRoZSBmaXJzdCBwcm9taXNlIHRvIGJlIHNldHRsZWRcbiAqL1xuUS5yYWNlID0gcmFjZTtcbmZ1bmN0aW9uIHJhY2UoYW5zd2VyUHMpIHtcbiAgICByZXR1cm4gcHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcbiAgICAgICAgLy8gYW5zd2VyUHMuZm9yRWFjaChmdW5jdGlvbiAoYW5zd2VyUCkge1xuICAgICAgICAvLyAgICAgUShhbnN3ZXJQKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBVc2UgdGhpcyBpbiB0aGUgbWVhbnRpbWVcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFuc3dlclBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBRKGFuc3dlclBzW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucmFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKFEucmFjZSk7XG59O1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBQcm9taXNlIHdpdGggYSBwcm9taXNlIGRlc2NyaXB0b3Igb2JqZWN0IGFuZCBvcHRpb25hbCBmYWxsYmFja1xuICogZnVuY3Rpb24uICBUaGUgZGVzY3JpcHRvciBjb250YWlucyBtZXRob2RzIGxpa2Ugd2hlbihyZWplY3RlZCksIGdldChuYW1lKSxcbiAqIHNldChuYW1lLCB2YWx1ZSksIHBvc3QobmFtZSwgYXJncyksIGFuZCBkZWxldGUobmFtZSksIHdoaWNoIGFsbFxuICogcmV0dXJuIGVpdGhlciBhIHZhbHVlLCBhIHByb21pc2UgZm9yIGEgdmFsdWUsIG9yIGEgcmVqZWN0aW9uLiAgVGhlIGZhbGxiYWNrXG4gKiBhY2NlcHRzIHRoZSBvcGVyYXRpb24gbmFtZSwgYSByZXNvbHZlciwgYW5kIGFueSBmdXJ0aGVyIGFyZ3VtZW50cyB0aGF0IHdvdWxkXG4gKiBoYXZlIGJlZW4gZm9yd2FyZGVkIHRvIHRoZSBhcHByb3ByaWF0ZSBtZXRob2QgYWJvdmUgaGFkIGEgbWV0aG9kIGJlZW5cbiAqIHByb3ZpZGVkIHdpdGggdGhlIHByb3BlciBuYW1lLiAgVGhlIEFQSSBtYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IHRoZSBuYXR1cmVcbiAqIG9mIHRoZSByZXR1cm5lZCBvYmplY3QsIGFwYXJ0IGZyb20gdGhhdCBpdCBpcyB1c2FibGUgd2hlcmVldmVyIHByb21pc2VzIGFyZVxuICogYm91Z2h0IGFuZCBzb2xkLlxuICovXG5RLm1ha2VQcm9taXNlID0gUHJvbWlzZTtcbmZ1bmN0aW9uIFByb21pc2UoZGVzY3JpcHRvciwgZmFsbGJhY2ssIGluc3BlY3QpIHtcbiAgICBpZiAoZmFsbGJhY2sgPT09IHZvaWQgMCkge1xuICAgICAgICBmYWxsYmFjayA9IGZ1bmN0aW9uIChvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgXCJQcm9taXNlIGRvZXMgbm90IHN1cHBvcnQgb3BlcmF0aW9uOiBcIiArIG9wXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGluc3BlY3QgPT09IHZvaWQgMCkge1xuICAgICAgICBpbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtzdGF0ZTogXCJ1bmtub3duXCJ9O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBwcm9taXNlID0gb2JqZWN0X2NyZWF0ZShQcm9taXNlLnByb3RvdHlwZSk7XG5cbiAgICBwcm9taXNlLnByb21pc2VEaXNwYXRjaCA9IGZ1bmN0aW9uIChyZXNvbHZlLCBvcCwgYXJncykge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0b3Jbb3BdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZGVzY3JpcHRvcltvcF0uYXBwbHkocHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbGxiYWNrLmNhbGwocHJvbWlzZSwgb3AsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNvbHZlKSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJvbWlzZS5pbnNwZWN0ID0gaW5zcGVjdDtcblxuICAgIC8vIFhYWCBkZXByZWNhdGVkIGB2YWx1ZU9mYCBhbmQgYGV4Y2VwdGlvbmAgc3VwcG9ydFxuICAgIGlmIChpbnNwZWN0KSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgcHJvbWlzZS5leGNlcHRpb24gPSBpbnNwZWN0ZWQucmVhc29uO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwicGVuZGluZ1wiIHx8XG4gICAgICAgICAgICAgICAgaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cblByb21pc2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgUHJvbWlzZV1cIjtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciBkb25lID0gZmFsc2U7ICAgLy8gZW5zdXJlIHRoZSB1bnRydXN0ZWQgcHJvbWlzZSBtYWtlcyBhdCBtb3N0IGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmdsZSBjYWxsIHRvIG9uZSBvZiB0aGUgY2FsbGJhY2tzXG5cbiAgICBmdW5jdGlvbiBfZnVsZmlsbGVkKHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGZ1bGZpbGxlZCA9PT0gXCJmdW5jdGlvblwiID8gZnVsZmlsbGVkKHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWplY3RlZChleGNlcHRpb24pIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZWplY3RlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXhjZXB0aW9uLCBzZWxmKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkKGV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChuZXdFeGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ld0V4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wcm9ncmVzc2VkKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcHJvZ3Jlc3NlZCA9PT0gXCJmdW5jdGlvblwiID8gcHJvZ3Jlc3NlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5wcm9taXNlRGlzcGF0Y2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9mdWxmaWxsZWQodmFsdWUpKTtcbiAgICAgICAgfSwgXCJ3aGVuXCIsIFtmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKF9yZWplY3RlZChleGNlcHRpb24pKTtcbiAgICAgICAgfV0pO1xuICAgIH0pO1xuXG4gICAgLy8gUHJvZ3Jlc3MgcHJvcGFnYXRvciBuZWVkIHRvIGJlIGF0dGFjaGVkIGluIHRoZSBjdXJyZW50IHRpY2suXG4gICAgc2VsZi5wcm9taXNlRGlzcGF0Y2godm9pZCAwLCBcIndoZW5cIiwgW3ZvaWQgMCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZTtcbiAgICAgICAgdmFyIHRocmV3ID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IF9wcm9ncmVzc2VkKHZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyZXcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhyZXcpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblEudGFwID0gZnVuY3Rpb24gKHByb21pc2UsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGFwKGNhbGxiYWNrKTtcbn07XG5cbi8qKlxuICogV29ya3MgYWxtb3N0IGxpa2UgXCJmaW5hbGx5XCIsIGJ1dCBub3QgY2FsbGVkIGZvciByZWplY3Rpb25zLlxuICogT3JpZ2luYWwgcmVzb2x1dGlvbiB2YWx1ZSBpcyBwYXNzZWQgdGhyb3VnaCBjYWxsYmFjayB1bmFmZmVjdGVkLlxuICogQ2FsbGJhY2sgbWF5IHJldHVybiBhIHByb21pc2UgdGhhdCB3aWxsIGJlIGF3YWl0ZWQgZm9yLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtRLlByb21pc2V9XG4gKiBAZXhhbXBsZVxuICogZG9Tb21ldGhpbmcoKVxuICogICAudGhlbiguLi4pXG4gKiAgIC50YXAoY29uc29sZS5sb2cpXG4gKiAgIC50aGVuKC4uLik7XG4gKi9cblByb21pc2UucHJvdG90eXBlLnRhcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gUShjYWxsYmFjayk7XG5cbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwodmFsdWUpLnRoZW5SZXNvbHZlKHZhbHVlKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXJzIGFuIG9ic2VydmVyIG9uIGEgcHJvbWlzZS5cbiAqXG4gKiBHdWFyYW50ZWVzOlxuICpcbiAqIDEuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UuXG4gKiAyLiB0aGF0IGVpdGhlciB0aGUgZnVsZmlsbGVkIGNhbGxiYWNrIG9yIHRoZSByZWplY3RlZCBjYWxsYmFjayB3aWxsIGJlXG4gKiAgICBjYWxsZWQsIGJ1dCBub3QgYm90aC5cbiAqIDMuIHRoYXQgZnVsZmlsbGVkIGFuZCByZWplY3RlZCB3aWxsIG5vdCBiZSBjYWxsZWQgaW4gdGhpcyB0dXJuLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSAgICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSB0byBvYnNlcnZlXG4gKiBAcGFyYW0gZnVsZmlsbGVkICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgZnVsZmlsbGVkIHZhbHVlXG4gKiBAcGFyYW0gcmVqZWN0ZWQgICBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGUgcmVqZWN0aW9uIGV4Y2VwdGlvblxuICogQHBhcmFtIHByb2dyZXNzZWQgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgZnJvbSB0aGUgaW52b2tlZCBjYWxsYmFja1xuICovXG5RLndoZW4gPSB3aGVuO1xuZnVuY3Rpb24gd2hlbih2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0pO1xufTtcblxuUS50aGVuUmVzb2x2ZSA9IGZ1bmN0aW9uIChwcm9taXNlLCB2YWx1ZSkge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZXNvbHZlKHZhbHVlKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IHJlYXNvbjsgfSk7XG59O1xuXG5RLnRoZW5SZWplY3QgPSBmdW5jdGlvbiAocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlamVjdChyZWFzb24pO1xufTtcblxuLyoqXG4gKiBJZiBhbiBvYmplY3QgaXMgbm90IGEgcHJvbWlzZSwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUuXG4gKiBJZiBhIHByb21pc2UgaXMgcmVqZWN0ZWQsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlIHRvby5cbiAqIElmIGl04oCZcyBhIGZ1bGZpbGxlZCBwcm9taXNlLCB0aGUgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmVhcmVyLlxuICogSWYgaXTigJlzIGEgZGVmZXJyZWQgcHJvbWlzZSBhbmQgdGhlIGRlZmVycmVkIGhhcyBiZWVuIHJlc29sdmVkLCB0aGVcbiAqIHJlc29sdXRpb24gaXMgXCJuZWFyZXJcIi5cbiAqIEBwYXJhbSBvYmplY3RcbiAqIEByZXR1cm5zIG1vc3QgcmVzb2x2ZWQgKG5lYXJlc3QpIGZvcm0gb2YgdGhlIG9iamVjdFxuICovXG5cbi8vIFhYWCBzaG91bGQgd2UgcmUtZG8gdGhpcz9cblEubmVhcmVyID0gbmVhcmVyO1xuZnVuY3Rpb24gbmVhcmVyKHZhbHVlKSB7XG4gICAgaWYgKGlzUHJvbWlzZSh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IHZhbHVlLmluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcHJvbWlzZS5cbiAqIE90aGVyd2lzZSBpdCBpcyBhIGZ1bGZpbGxlZCB2YWx1ZS5cbiAqL1xuUS5pc1Byb21pc2UgPSBpc1Byb21pc2U7XG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIFByb21pc2U7XG59XG5cblEuaXNQcm9taXNlQWxpa2UgPSBpc1Byb21pc2VBbGlrZTtcbmZ1bmN0aW9uIGlzUHJvbWlzZUFsaWtlKG9iamVjdCkge1xuICAgIHJldHVybiBpc09iamVjdChvYmplY3QpICYmIHR5cGVvZiBvYmplY3QudGhlbiA9PT0gXCJmdW5jdGlvblwiO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHBlbmRpbmcgcHJvbWlzZSwgbWVhbmluZyBub3RcbiAqIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cbiAqL1xuUS5pc1BlbmRpbmcgPSBpc1BlbmRpbmc7XG5mdW5jdGlvbiBpc1BlbmRpbmcob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzUHJvbWlzZShvYmplY3QpICYmIG9iamVjdC5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1BlbmRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn07XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgdmFsdWUgb3IgZnVsZmlsbGVkXG4gKiBwcm9taXNlLlxuICovXG5RLmlzRnVsZmlsbGVkID0gaXNGdWxmaWxsZWQ7XG5mdW5jdGlvbiBpc0Z1bGZpbGxlZChvYmplY3QpIHtcbiAgICByZXR1cm4gIWlzUHJvbWlzZShvYmplY3QpIHx8IG9iamVjdC5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzRnVsZmlsbGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn07XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcmVqZWN0ZWQgcHJvbWlzZS5cbiAqL1xuUS5pc1JlamVjdGVkID0gaXNSZWplY3RlZDtcbmZ1bmN0aW9uIGlzUmVqZWN0ZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzUHJvbWlzZShvYmplY3QpICYmIG9iamVjdC5pbnNwZWN0KCkuc3RhdGUgPT09IFwicmVqZWN0ZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNSZWplY3RlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicmVqZWN0ZWRcIjtcbn07XG5cbi8vLy8gQkVHSU4gVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vLyBUaGlzIHByb21pc2UgbGlicmFyeSBjb25zdW1lcyBleGNlcHRpb25zIHRocm93biBpbiBoYW5kbGVycyBzbyB0aGV5IGNhbiBiZVxuLy8gaGFuZGxlZCBieSBhIHN1YnNlcXVlbnQgcHJvbWlzZS4gIFRoZSBleGNlcHRpb25zIGdldCBhZGRlZCB0byB0aGlzIGFycmF5IHdoZW5cbi8vIHRoZXkgYXJlIGNyZWF0ZWQsIGFuZCByZW1vdmVkIHdoZW4gdGhleSBhcmUgaGFuZGxlZC4gIE5vdGUgdGhhdCBpbiBFUzYgb3Jcbi8vIHNoaW1tZWQgZW52aXJvbm1lbnRzLCB0aGlzIHdvdWxkIG5hdHVyYWxseSBiZSBhIGBTZXRgLlxudmFyIHVuaGFuZGxlZFJlYXNvbnMgPSBbXTtcbnZhciB1bmhhbmRsZWRSZWplY3Rpb25zID0gW107XG52YXIgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zID0gW107XG52YXIgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcblxuZnVuY3Rpb24gcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCkge1xuICAgIHVuaGFuZGxlZFJlYXNvbnMubGVuZ3RoID0gMDtcbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLmxlbmd0aCA9IDA7XG5cbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSB0cnVlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdHJhY2tSZWplY3Rpb24ocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIFEubmV4dFRpY2sucnVuQWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5lbWl0KFwidW5oYW5kbGVkUmVqZWN0aW9uXCIsIHJlYXNvbiwgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMucHVzaChwcm9taXNlKTtcbiAgICBpZiAocmVhc29uICYmIHR5cGVvZiByZWFzb24uc3RhY2sgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdW5oYW5kbGVkUmVhc29ucy5wdXNoKHJlYXNvbi5zdGFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdW5oYW5kbGVkUmVhc29ucy5wdXNoKFwiKG5vIHN0YWNrKSBcIiArIHJlYXNvbik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1bnRyYWNrUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGF0ID0gYXJyYXlfaW5kZXhPZih1bmhhbmRsZWRSZWplY3Rpb25zLCBwcm9taXNlKTtcbiAgICBpZiAoYXQgIT09IC0xKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcHJvY2Vzcy5lbWl0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2sucnVuQWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhdFJlcG9ydCA9IGFycmF5X2luZGV4T2YocmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICBpZiAoYXRSZXBvcnQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInJlamVjdGlvbkhhbmRsZWRcIiwgdW5oYW5kbGVkUmVhc29uc1thdF0sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXBvcnRlZFVuaGFuZGxlZFJlamVjdGlvbnMuc3BsaWNlKGF0UmVwb3J0LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdCwgMSk7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMuc3BsaWNlKGF0LCAxKTtcbiAgICB9XG59XG5cblEucmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zID0gcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zO1xuXG5RLmdldFVuaGFuZGxlZFJlYXNvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTWFrZSBhIGNvcHkgc28gdGhhdCBjb25zdW1lcnMgY2FuJ3QgaW50ZXJmZXJlIHdpdGggb3VyIGludGVybmFsIHN0YXRlLlxuICAgIHJldHVybiB1bmhhbmRsZWRSZWFzb25zLnNsaWNlKCk7XG59O1xuXG5RLnN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSBmYWxzZTtcbn07XG5cbnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpO1xuXG4vLy8vIEVORCBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHJlamVjdGVkIHByb21pc2UuXG4gKiBAcGFyYW0gcmVhc29uIHZhbHVlIGRlc2NyaWJpbmcgdGhlIGZhaWx1cmVcbiAqL1xuUS5yZWplY3QgPSByZWplY3Q7XG5mdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gICAgdmFyIHJlamVjdGlvbiA9IFByb21pc2Uoe1xuICAgICAgICBcIndoZW5cIjogZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgICAgICAgICAvLyBub3RlIHRoYXQgdGhlIGVycm9yIGhhcyBiZWVuIGhhbmRsZWRcbiAgICAgICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgICAgICAgIHVudHJhY2tSZWplY3Rpb24odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZChyZWFzb24pIDogdGhpcztcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJyZWplY3RlZFwiLCByZWFzb246IHJlYXNvbiB9O1xuICAgIH0pO1xuXG4gICAgLy8gTm90ZSB0aGF0IHRoZSByZWFzb24gaGFzIG5vdCBiZWVuIGhhbmRsZWQuXG4gICAgdHJhY2tSZWplY3Rpb24ocmVqZWN0aW9uLCByZWFzb24pO1xuXG4gICAgcmV0dXJuIHJlamVjdGlvbjtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgZnVsZmlsbGVkIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UuXG4gKiBAcGFyYW0gdmFsdWUgaW1tZWRpYXRlIHJlZmVyZW5jZVxuICovXG5RLmZ1bGZpbGwgPSBmdWxmaWxsO1xuZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24gKG5hbWUsIHJocykge1xuICAgICAgICAgICAgdmFsdWVbbmFtZV0gPSByaHM7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVsZXRlXCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwicG9zdFwiOiBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgICAgICAgICAgLy8gTWFyayBNaWxsZXIgcHJvcG9zZXMgdGhhdCBwb3N0IHdpdGggbm8gbmFtZSBzaG91bGQgYXBwbHkgYVxuICAgICAgICAgICAgLy8gcHJvbWlzZWQgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gbnVsbCB8fCBuYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodm9pZCAwLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlW25hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcHBseVwiOiBmdW5jdGlvbiAodGhpc3AsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh0aGlzcCwgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIFwia2V5c1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0X2tleXModmFsdWUpO1xuICAgICAgICB9XG4gICAgfSwgdm9pZCAwLCBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJmdWxmaWxsZWRcIiwgdmFsdWU6IHZhbHVlIH07XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlbmFibGVzIHRvIFEgcHJvbWlzZXMuXG4gKiBAcGFyYW0gcHJvbWlzZSB0aGVuYWJsZSBwcm9taXNlXG4gKiBAcmV0dXJucyBhIFEgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBjb2VyY2UocHJvbWlzZSkge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9taXNlLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbi8qKlxuICogQW5ub3RhdGVzIGFuIG9iamVjdCBzdWNoIHRoYXQgaXQgd2lsbCBuZXZlciBiZVxuICogdHJhbnNmZXJyZWQgYXdheSBmcm9tIHRoaXMgcHJvY2VzcyBvdmVyIGFueSBwcm9taXNlXG4gKiBjb21tdW5pY2F0aW9uIGNoYW5uZWwuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBwcm9taXNlIGEgd3JhcHBpbmcgb2YgdGhhdCBvYmplY3QgdGhhdFxuICogYWRkaXRpb25hbGx5IHJlc3BvbmRzIHRvIHRoZSBcImlzRGVmXCIgbWVzc2FnZVxuICogd2l0aG91dCBhIHJlamVjdGlvbi5cbiAqL1xuUS5tYXN0ZXIgPSBtYXN0ZXI7XG5mdW5jdGlvbiBtYXN0ZXIob2JqZWN0KSB7XG4gICAgcmV0dXJuIFByb21pc2Uoe1xuICAgICAgICBcImlzRGVmXCI6IGZ1bmN0aW9uICgpIHt9XG4gICAgfSwgZnVuY3Rpb24gZmFsbGJhY2sob3AsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpO1xuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFEob2JqZWN0KS5pbnNwZWN0KCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU3ByZWFkcyB0aGUgdmFsdWVzIG9mIGEgcHJvbWlzZWQgYXJyYXkgb2YgYXJndW1lbnRzIGludG8gdGhlXG4gKiBmdWxmaWxsbWVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSBmdWxmaWxsZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB2YXJpYWRpYyBhcmd1bWVudHMgZnJvbSB0aGVcbiAqIHByb21pc2VkIGFycmF5XG4gKiBAcGFyYW0gcmVqZWN0ZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB0aGUgZXhjZXB0aW9uIGlmIHRoZSBwcm9taXNlXG4gKiBpcyByZWplY3RlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvciB0aHJvd24gZXhjZXB0aW9uIG9mXG4gKiBlaXRoZXIgY2FsbGJhY2suXG4gKi9cblEuc3ByZWFkID0gc3ByZWFkO1xuZnVuY3Rpb24gc3ByZWFkKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEodmFsdWUpLnNwcmVhZChmdWxmaWxsZWQsIHJlamVjdGVkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5hbGwoKS50aGVuKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICByZXR1cm4gZnVsZmlsbGVkLmFwcGx5KHZvaWQgMCwgYXJyYXkpO1xuICAgIH0sIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogVGhlIGFzeW5jIGZ1bmN0aW9uIGlzIGEgZGVjb3JhdG9yIGZvciBnZW5lcmF0b3IgZnVuY3Rpb25zLCB0dXJuaW5nXG4gKiB0aGVtIGludG8gYXN5bmNocm9ub3VzIGdlbmVyYXRvcnMuICBBbHRob3VnaCBnZW5lcmF0b3JzIGFyZSBvbmx5IHBhcnRcbiAqIG9mIHRoZSBuZXdlc3QgRUNNQVNjcmlwdCA2IGRyYWZ0cywgdGhpcyBjb2RlIGRvZXMgbm90IGNhdXNlIHN5bnRheFxuICogZXJyb3JzIGluIG9sZGVyIGVuZ2luZXMuICBUaGlzIGNvZGUgc2hvdWxkIGNvbnRpbnVlIHRvIHdvcmsgYW5kIHdpbGxcbiAqIGluIGZhY3QgaW1wcm92ZSBvdmVyIHRpbWUgYXMgdGhlIGxhbmd1YWdlIGltcHJvdmVzLlxuICpcbiAqIEVTNiBnZW5lcmF0b3JzIGFyZSBjdXJyZW50bHkgcGFydCBvZiBWOCB2ZXJzaW9uIDMuMTkgd2l0aCB0aGVcbiAqIC0taGFybW9ueS1nZW5lcmF0b3JzIHJ1bnRpbWUgZmxhZyBlbmFibGVkLiAgU3BpZGVyTW9ua2V5IGhhcyBoYWQgdGhlbVxuICogZm9yIGxvbmdlciwgYnV0IHVuZGVyIGFuIG9sZGVyIFB5dGhvbi1pbnNwaXJlZCBmb3JtLiAgVGhpcyBmdW5jdGlvblxuICogd29ya3Mgb24gYm90aCBraW5kcyBvZiBnZW5lcmF0b3JzLlxuICpcbiAqIERlY29yYXRlcyBhIGdlbmVyYXRvciBmdW5jdGlvbiBzdWNoIHRoYXQ6XG4gKiAgLSBpdCBtYXkgeWllbGQgcHJvbWlzZXNcbiAqICAtIGV4ZWN1dGlvbiB3aWxsIGNvbnRpbnVlIHdoZW4gdGhhdCBwcm9taXNlIGlzIGZ1bGZpbGxlZFxuICogIC0gdGhlIHZhbHVlIG9mIHRoZSB5aWVsZCBleHByZXNzaW9uIHdpbGwgYmUgdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogIC0gaXQgcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgKHdoZW4gdGhlIGdlbmVyYXRvclxuICogICAgc3RvcHMgaXRlcmF0aW5nKVxuICogIC0gdGhlIGRlY29yYXRlZCBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICogICAgb2YgdGhlIGdlbmVyYXRvciBvciB0aGUgZmlyc3QgcmVqZWN0ZWQgcHJvbWlzZSBhbW9uZyB0aG9zZVxuICogICAgeWllbGRlZC5cbiAqICAtIGlmIGFuIGVycm9yIGlzIHRocm93biBpbiB0aGUgZ2VuZXJhdG9yLCBpdCBwcm9wYWdhdGVzIHRocm91Z2hcbiAqICAgIGV2ZXJ5IGZvbGxvd2luZyB5aWVsZCB1bnRpbCBpdCBpcyBjYXVnaHQsIG9yIHVudGlsIGl0IGVzY2FwZXNcbiAqICAgIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24gYWx0b2dldGhlciwgYW5kIGlzIHRyYW5zbGF0ZWQgaW50byBhXG4gKiAgICByZWplY3Rpb24gZm9yIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBkZWNvcmF0ZWQgZ2VuZXJhdG9yLlxuICovXG5RLmFzeW5jID0gYXN5bmM7XG5mdW5jdGlvbiBhc3luYyhtYWtlR2VuZXJhdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwic2VuZFwiLCBhcmcgaXMgYSB2YWx1ZVxuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJ0aHJvd1wiLCBhcmcgaXMgYW4gZXhjZXB0aW9uXG4gICAgICAgIGZ1bmN0aW9uIGNvbnRpbnVlcih2ZXJiLCBhcmcpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgICAgIC8vIFVudGlsIFY4IDMuMTkgLyBDaHJvbWl1bSAyOSBpcyByZWxlYXNlZCwgU3BpZGVyTW9ua2V5IGlzIHRoZSBvbmx5XG4gICAgICAgICAgICAvLyBlbmdpbmUgdGhhdCBoYXMgYSBkZXBsb3llZCBiYXNlIG9mIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBnZW5lcmF0b3JzLlxuICAgICAgICAgICAgLy8gSG93ZXZlciwgU00ncyBnZW5lcmF0b3JzIHVzZSB0aGUgUHl0aG9uLWluc3BpcmVkIHNlbWFudGljcyBvZlxuICAgICAgICAgICAgLy8gb3V0ZGF0ZWQgRVM2IGRyYWZ0cy4gIFdlIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBFUzYsIGJ1dCB3ZSdkIGFsc29cbiAgICAgICAgICAgIC8vIGxpa2UgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byB1c2UgZ2VuZXJhdG9ycyBpbiBkZXBsb3llZCBicm93c2Vycywgc29cbiAgICAgICAgICAgIC8vIHdlIGFsc28gc3VwcG9ydCBQeXRob24tc3R5bGUgZ2VuZXJhdG9ycy4gIEF0IHNvbWUgcG9pbnQgd2UgY2FuIHJlbW92ZVxuICAgICAgICAgICAgLy8gdGhpcyBibG9jay5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTdG9wSXRlcmF0aW9uID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gRVM2IEdlbmVyYXRvcnNcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFEocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihyZXN1bHQudmFsdWUsIGNhbGxiYWNrLCBlcnJiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNwaWRlck1vbmtleSBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IFJlbW92ZSB0aGlzIGNhc2Ugd2hlbiBTTSBkb2VzIEVTNiBnZW5lcmF0b3JzLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGdlbmVyYXRvclt2ZXJiXShhcmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBRKGV4Y2VwdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG1ha2VHZW5lcmF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY29udGludWVyLmJpbmQoY29udGludWVyLCBcIm5leHRcIik7XG4gICAgICAgIHZhciBlcnJiYWNrID0gY29udGludWVyLmJpbmQoY29udGludWVyLCBcInRocm93XCIpO1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIFRoZSBzcGF3biBmdW5jdGlvbiBpcyBhIHNtYWxsIHdyYXBwZXIgYXJvdW5kIGFzeW5jIHRoYXQgaW1tZWRpYXRlbHlcbiAqIGNhbGxzIHRoZSBnZW5lcmF0b3IgYW5kIGFsc28gZW5kcyB0aGUgcHJvbWlzZSBjaGFpbiwgc28gdGhhdCBhbnlcbiAqIHVuaGFuZGxlZCBlcnJvcnMgYXJlIHRocm93biBpbnN0ZWFkIG9mIGZvcndhcmRlZCB0byB0aGUgZXJyb3JcbiAqIGhhbmRsZXIuIFRoaXMgaXMgdXNlZnVsIGJlY2F1c2UgaXQncyBleHRyZW1lbHkgY29tbW9uIHRvIHJ1blxuICogZ2VuZXJhdG9ycyBhdCB0aGUgdG9wLWxldmVsIHRvIHdvcmsgd2l0aCBsaWJyYXJpZXMuXG4gKi9cblEuc3Bhd24gPSBzcGF3bjtcbmZ1bmN0aW9uIHNwYXduKG1ha2VHZW5lcmF0b3IpIHtcbiAgICBRLmRvbmUoUS5hc3luYyhtYWtlR2VuZXJhdG9yKSgpKTtcbn1cblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGludGVyZmFjZSBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG4vKipcbiAqIFRocm93cyBhIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB0byBzdG9wIGFuIGFzeW5jaHJvbm91cyBnZW5lcmF0b3IuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgaXMgYSBzdG9wLWdhcCBtZWFzdXJlIHRvIHN1cHBvcnQgZ2VuZXJhdG9yIHJldHVyblxuICogdmFsdWVzIGluIG9sZGVyIEZpcmVmb3gvU3BpZGVyTW9ua2V5LiAgSW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEVTNlxuICogZ2VuZXJhdG9ycyBsaWtlIENocm9taXVtIDI5LCBqdXN0IHVzZSBcInJldHVyblwiIGluIHlvdXIgZ2VuZXJhdG9yXG4gKiBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHZhbHVlIHRoZSByZXR1cm4gdmFsdWUgZm9yIHRoZSBzdXJyb3VuZGluZyBnZW5lcmF0b3JcbiAqIEB0aHJvd3MgUmV0dXJuVmFsdWUgZXhjZXB0aW9uIHdpdGggdGhlIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqIC8vIEVTNiBzdHlsZVxuICogUS5hc3luYyhmdW5jdGlvbiogKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICByZXR1cm4gZm9vICsgYmFyO1xuICogfSlcbiAqIC8vIE9sZGVyIFNwaWRlck1vbmtleSBzdHlsZVxuICogUS5hc3luYyhmdW5jdGlvbiAoKSB7XG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XG4gKiAgICAgIFEucmV0dXJuKGZvbyArIGJhcik7XG4gKiB9KVxuICovXG5RW1wicmV0dXJuXCJdID0gX3JldHVybjtcbmZ1bmN0aW9uIF9yZXR1cm4odmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgUVJldHVyblZhbHVlKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGUgcHJvbWlzZWQgZnVuY3Rpb24gZGVjb3JhdG9yIGVuc3VyZXMgdGhhdCBhbnkgcHJvbWlzZSBhcmd1bWVudHNcbiAqIGFyZSBzZXR0bGVkIGFuZCBwYXNzZWQgYXMgdmFsdWVzIChgdGhpc2AgaXMgYWxzbyBzZXR0bGVkIGFuZCBwYXNzZWRcbiAqIGFzIGEgdmFsdWUpLiAgSXQgd2lsbCBhbHNvIGVuc3VyZSB0aGF0IHRoZSByZXN1bHQgb2YgYSBmdW5jdGlvbiBpc1xuICogYWx3YXlzIGEgcHJvbWlzZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogdmFyIGFkZCA9IFEucHJvbWlzZWQoZnVuY3Rpb24gKGEsIGIpIHtcbiAqICAgICByZXR1cm4gYSArIGI7XG4gKiB9KTtcbiAqIGFkZChRKGEpLCBRKEIpKTtcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZGVjb3JhdGVcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IGhhcyBiZWVuIGRlY29yYXRlZC5cbiAqL1xuUS5wcm9taXNlZCA9IHByb21pc2VkO1xuZnVuY3Rpb24gcHJvbWlzZWQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc3ByZWFkKFt0aGlzLCBhbGwoYXJndW1lbnRzKV0sIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8qKlxuICogc2VuZHMgYSBtZXNzYWdlIHRvIGEgdmFsdWUgaW4gYSBmdXR1cmUgdHVyblxuICogQHBhcmFtIG9iamVjdCogdGhlIHJlY2lwaWVudFxuICogQHBhcmFtIG9wIHRoZSBuYW1lIG9mIHRoZSBtZXNzYWdlIG9wZXJhdGlvbiwgZS5nLiwgXCJ3aGVuXCIsXG4gKiBAcGFyYW0gYXJncyBmdXJ0aGVyIGFyZ3VtZW50cyB0byBiZSBmb3J3YXJkZWQgdG8gdGhlIG9wZXJhdGlvblxuICogQHJldHVybnMgcmVzdWx0IHtQcm9taXNlfSBhIHByb21pc2UgZm9yIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvblxuICovXG5RLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5mdW5jdGlvbiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChvcCwgYXJncyk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24gKG9wLCBhcmdzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGRlZmVycmVkLnJlc29sdmUsIG9wLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBnZXRcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHByb3BlcnR5IHZhbHVlXG4gKi9cblEuZ2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImdldFwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3Igb2JqZWN0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIHNldFxuICogQHBhcmFtIHZhbHVlICAgICBuZXcgdmFsdWUgb2YgcHJvcGVydHlcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG4vKipcbiAqIERlbGV0ZXMgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBkZWxldGVcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLmRlbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gKiBAcGFyYW0gdmFsdWUgICAgIGEgdmFsdWUgdG8gcG9zdCwgdHlwaWNhbGx5IGFuIGFycmF5IG9mXG4gKiAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gYXJndW1lbnRzIGZvciBwcm9taXNlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgIGFyZSB1bHRpbWF0ZWx5IGJhY2tlZCB3aXRoIGByZXNvbHZlYCB2YWx1ZXMsXG4gKiAgICAgICAgICAgICAgICAgIGFzIG9wcG9zZWQgdG8gdGhvc2UgYmFja2VkIHdpdGggVVJMc1xuICogICAgICAgICAgICAgICAgICB3aGVyZWluIHRoZSBwb3N0ZWQgdmFsdWUgY2FuIGJlIGFueVxuICogICAgICAgICAgICAgICAgICBKU09OIHNlcmlhbGl6YWJsZSBvYmplY3QuXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuLy8gYm91bmQgbG9jYWxseSBiZWNhdXNlIGl0IGlzIHVzZWQgYnkgb3RoZXIgbWV0aG9kc1xuUS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBpbnZvY2F0aW9uIGFyZ3VtZW50c1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5RLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEuaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcblByb21pc2UucHJvdG90eXBlLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gYXJncyAgICAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZhcHBseSA9IGZ1bmN0aW9uIChvYmplY3QsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RW1widHJ5XCJdID1cblEuZmNhbGwgPSBmdW5jdGlvbiAob2JqZWN0IC8qIC4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzKV0pO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24sIHRyYW5zZm9ybWluZyByZXR1cm4gdmFsdWVzIGludG8gYSBmdWxmaWxsZWRcbiAqIHByb21pc2UgYW5kIHRocm93biBlcnJvcnMgaW50byBhIHJlamVjdGVkIG9uZS5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblEuZmJpbmQgPSBmdW5jdGlvbiAob2JqZWN0IC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSBRKG9iamVjdCk7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuUHJvbWlzZS5wcm90b3R5cGUuZmJpbmQgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuXG4vKipcbiAqIFJlcXVlc3RzIHRoZSBuYW1lcyBvZiB0aGUgb3duZWQgcHJvcGVydGllcyBvZiBhIHByb21pc2VkXG4gKiBvYmplY3QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBrZXlzIG9mIHRoZSBldmVudHVhbGx5IHNldHRsZWQgb2JqZWN0XG4gKi9cblEua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheS4gIElmIGFueSBvZlxuICogdGhlIHByb21pc2VzIGdldHMgcmVqZWN0ZWQsIHRoZSB3aG9sZSBhcnJheSBpcyByZWplY3RlZCBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlc1xuICovXG4vLyBCeSBNYXJrIE1pbGxlclxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46Y29uY3VycmVuY3kmcmV2PTEzMDg3NzY1MjEjYWxsZnVsZmlsbGVkXG5RLmFsbCA9IGFsbDtcbmZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgdmFyIHBlbmRpbmdDb3VudCA9IDA7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvbWlzZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzbmFwc2hvdDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBpc1Byb21pc2UocHJvbWlzZSkgJiZcbiAgICAgICAgICAgICAgICAoc25hcHNob3QgPSBwcm9taXNlLmluc3BlY3QoKSkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHNuYXBzaG90LnZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICArK3BlbmRpbmdDb3VudDtcbiAgICAgICAgICAgICAgICB3aGVuKFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tcGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoeyBpbmRleDogaW5kZXgsIHZhbHVlOiBwcm9ncmVzcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIGlmIChwZW5kaW5nQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgcmVzb2x2ZWQgcHJvbWlzZSBvZiBhbiBhcnJheS4gUHJpb3IgcmVqZWN0ZWQgcHJvbWlzZXMgYXJlXG4gKiBpZ25vcmVkLiAgUmVqZWN0cyBvbmx5IGlmIGFsbCBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgY29udGFpbmluZyB2YWx1ZXMgb3IgcHJvbWlzZXMgZm9yIHZhbHVlc1xuICogQHJldHVybnMgYSBwcm9taXNlIGZ1bGZpbGxlZCB3aXRoIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgcmVzb2x2ZWQgcHJvbWlzZSxcbiAqIG9yIGEgcmVqZWN0ZWQgcHJvbWlzZSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICovXG5RLmFueSA9IGFueTtcblxuZnVuY3Rpb24gYW55KHByb21pc2VzKSB7XG4gICAgaWYgKHByb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gUS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHByZXYsIGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gcHJvbWlzZXNbaW5kZXhdO1xuXG4gICAgICAgIHBlbmRpbmdDb3VudCsrO1xuXG4gICAgICAgIHdoZW4ocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIG9uUHJvZ3Jlc3MpO1xuICAgICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChyZXN1bHQpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGVycikge1xuICAgICAgICAgICAgcGVuZGluZ0NvdW50LS07XG4gICAgICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSAoXCJRIGNhbid0IGdldCBmdWxmaWxsbWVudCB2YWx1ZSBmcm9tIGFueSBwcm9taXNlLCBhbGwgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInByb21pc2VzIHdlcmUgcmVqZWN0ZWQuIExhc3QgZXJyb3IgbWVzc2FnZTogXCIgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25Qcm9ncmVzcyhwcm9ncmVzcykge1xuICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHtcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb2dyZXNzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHVuZGVmaW5lZCk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYW55ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbnkodGhpcyk7XG59O1xuXG4vKipcbiAqIFdhaXRzIGZvciBhbGwgcHJvbWlzZXMgdG8gYmUgc2V0dGxlZCwgZWl0aGVyIGZ1bGZpbGxlZCBvclxuICogcmVqZWN0ZWQuICBUaGlzIGlzIGRpc3RpbmN0IGZyb20gYGFsbGAgc2luY2UgdGhhdCB3b3VsZCBzdG9wXG4gKiB3YWl0aW5nIGF0IHRoZSBmaXJzdCByZWplY3Rpb24uICBUaGUgcHJvbWlzZSByZXR1cm5lZCBieVxuICogYGFsbFJlc29sdmVkYCB3aWxsIG5ldmVyIGJlIHJlamVjdGVkLlxuICogQHBhcmFtIHByb21pc2VzIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgKG9yIGFuIGFycmF5KSBvZiBwcm9taXNlc1xuICogKG9yIHZhbHVlcylcbiAqIEByZXR1cm4gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBwcm9taXNlc1xuICovXG5RLmFsbFJlc29sdmVkID0gZGVwcmVjYXRlKGFsbFJlc29sdmVkLCBcImFsbFJlc29sdmVkXCIsIFwiYWxsU2V0dGxlZFwiKTtcbmZ1bmN0aW9uIGFsbFJlc29sdmVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICBwcm9taXNlcyA9IGFycmF5X21hcChwcm9taXNlcywgUSk7XG4gICAgICAgIHJldHVybiB3aGVuKGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2hlbihwcm9taXNlLCBub29wLCBub29wKTtcbiAgICAgICAgfSkpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZXM7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxSZXNvbHZlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYWxsUmVzb2x2ZWQodGhpcyk7XG59O1xuXG4vKipcbiAqIEBzZWUgUHJvbWlzZSNhbGxTZXR0bGVkXG4gKi9cblEuYWxsU2V0dGxlZCA9IGFsbFNldHRsZWQ7XG5mdW5jdGlvbiBhbGxTZXR0bGVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZXMpLmFsbFNldHRsZWQoKTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdGhlaXIgc3RhdGVzIChhc1xuICogcmV0dXJuZWQgYnkgYGluc3BlY3RgKSB3aGVuIHRoZXkgaGF2ZSBhbGwgc2V0dGxlZC5cbiAqIEBwYXJhbSB7QXJyYXlbQW55Kl19IHZhbHVlcyBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyB7QXJyYXlbU3RhdGVdfSBhbiBhcnJheSBvZiBzdGF0ZXMgZm9yIHRoZSByZXNwZWN0aXZlIHZhbHVlcy5cbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUuYWxsU2V0dGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICByZXR1cm4gYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBRKHByb21pc2UpO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVnYXJkbGVzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS5pbnNwZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKHJlZ2FyZGxlc3MsIHJlZ2FyZGxlc3MpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSBmYWlsdXJlIG9mIGEgcHJvbWlzZSwgZ2l2aW5nIGFuIG9wb3J0dW5pdHkgdG8gcmVjb3ZlclxuICogd2l0aCBhIGNhbGxiYWNrLiAgSWYgdGhlIGdpdmVuIHByb21pc2UgaXMgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAqIHByb21pc2UgaXMgZnVsZmlsbGVkLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIGZ1bGZpbGwgdGhlIHJldHVybmVkIHByb21pc2UgaWYgdGhlXG4gKiBnaXZlbiBwcm9taXNlIGlzIHJlamVjdGVkXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGNhbGxiYWNrXG4gKi9cblEuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhIGxpc3RlbmVyIHRoYXQgY2FuIHJlc3BvbmQgdG8gcHJvZ3Jlc3Mgbm90aWZpY2F0aW9ucyBmcm9tIGFcbiAqIHByb21pc2UncyBvcmlnaW5hdGluZyBkZWZlcnJlZC4gVGhpcyBsaXN0ZW5lciByZWNlaXZlcyB0aGUgZXhhY3QgYXJndW1lbnRzXG4gKiBwYXNzZWQgdG8gYGBkZWZlcnJlZC5ub3RpZnlgYC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byByZWNlaXZlIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJucyB0aGUgZ2l2ZW4gcHJvbWlzZSwgdW5jaGFuZ2VkXG4gKi9cblEucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbmZ1bmN0aW9uIHByb2dyZXNzKG9iamVjdCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24gKHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gb3Bwb3J0dW5pdHkgdG8gb2JzZXJ2ZSB0aGUgc2V0dGxpbmcgb2YgYSBwcm9taXNlLFxuICogcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC4gIEZvcndhcmRzXG4gKiB0aGUgcmVzb2x1dGlvbiB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aGVuIHRoZSBjYWxsYmFjayBpcyBkb25lLlxuICogVGhlIGNhbGxiYWNrIGNhbiByZXR1cm4gYSBwcm9taXNlIHRvIGRlZmVyIGNvbXBsZXRpb24uXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIG9ic2VydmUgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuXG4gKiBwcm9taXNlLCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIHdoZW5cbiAqIGBgZmluYGAgaXMgZG9uZS5cbiAqL1xuUS5maW4gPSAvLyBYWFggbGVnYWN5XG5RW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KVtcImZpbmFsbHlcIl0oY2FsbGJhY2spO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmluID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgaWYgKCFjYWxsYmFjayB8fCB0eXBlb2YgY2FsbGJhY2suYXBwbHkgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRIGNhbid0IGFwcGx5IGZpbmFsbHkgY2FsbGJhY2tcIik7XG4gICAgfVxuICAgIGNhbGxiYWNrID0gUShjYWxsYmFjayk7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVE9ETyBhdHRlbXB0IHRvIHJlY3ljbGUgdGhlIHJlamVjdGlvbiB3aXRoIFwidGhpc1wiLlxuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFRlcm1pbmF0ZXMgYSBjaGFpbiBvZiBwcm9taXNlcywgZm9yY2luZyByZWplY3Rpb25zIHRvIGJlXG4gKiB0aHJvd24gYXMgZXhjZXB0aW9ucy5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBhdCB0aGUgZW5kIG9mIGEgY2hhaW4gb2YgcHJvbWlzZXNcbiAqIEByZXR1cm5zIG5vdGhpbmdcbiAqL1xuUS5kb25lID0gZnVuY3Rpb24gKG9iamVjdCwgZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRvbmUoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuICAgIHZhciBvblVuaGFuZGxlZEVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIC8vIGZvcndhcmQgdG8gYSBmdXR1cmUgdHVybiBzbyB0aGF0IGBgd2hlbmBgXG4gICAgICAgIC8vIGRvZXMgbm90IGNhdGNoIGl0IGFuZCB0dXJuIGl0IGludG8gYSByZWplY3Rpb24uXG4gICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGVycm9yLCBwcm9taXNlKTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEF2b2lkIHVubmVjZXNzYXJ5IGBuZXh0VGlja2BpbmcgdmlhIGFuIHVubmVjZXNzYXJ5IGB3aGVuYC5cbiAgICB2YXIgcHJvbWlzZSA9IGZ1bGZpbGxlZCB8fCByZWplY3RlZCB8fCBwcm9ncmVzcyA/XG4gICAgICAgIHRoaXMudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykgOlxuICAgICAgICB0aGlzO1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MgJiYgcHJvY2Vzcy5kb21haW4pIHtcbiAgICAgICAgb25VbmhhbmRsZWRFcnJvciA9IHByb2Nlc3MuZG9tYWluLmJpbmQob25VbmhhbmRsZWRFcnJvcik7XG4gICAgfVxuXG4gICAgcHJvbWlzZS50aGVuKHZvaWQgMCwgb25VbmhhbmRsZWRFcnJvcik7XG59O1xuXG4vKipcbiAqIENhdXNlcyBhIHByb21pc2UgdG8gYmUgcmVqZWN0ZWQgaWYgaXQgZG9lcyBub3QgZ2V0IGZ1bGZpbGxlZCBiZWZvcmVcbiAqIHNvbWUgbWlsbGlzZWNvbmRzIHRpbWUgb3V0LlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzIHRpbWVvdXRcbiAqIEBwYXJhbSB7QW55Kn0gY3VzdG9tIGVycm9yIG1lc3NhZ2Ugb3IgRXJyb3Igb2JqZWN0IChvcHRpb25hbClcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgaWYgaXQgaXNcbiAqIGZ1bGZpbGxlZCBiZWZvcmUgdGhlIHRpbWVvdXQsIG90aGVyd2lzZSByZWplY3RlZC5cbiAqL1xuUS50aW1lb3V0ID0gZnVuY3Rpb24gKG9iamVjdCwgbXMsIGVycm9yKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aW1lb3V0KG1zLCBlcnJvcik7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24gKG1zLCBlcnJvcikge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWVycm9yIHx8IFwic3RyaW5nXCIgPT09IHR5cGVvZiBlcnJvcikge1xuICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IgfHwgXCJUaW1lZCBvdXQgYWZ0ZXIgXCIgKyBtcyArIFwiIG1zXCIpO1xuICAgICAgICAgICAgZXJyb3IuY29kZSA9IFwiRVRJTUVET1VUXCI7XG4gICAgICAgIH1cbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcbiAgICB9LCBtcyk7XG5cbiAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAoZXhjZXB0aW9uKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9LCBkZWZlcnJlZC5ub3RpZnkpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZ2l2ZW4gdmFsdWUgKG9yIHByb21pc2VkIHZhbHVlKSwgc29tZVxuICogbWlsbGlzZWNvbmRzIGFmdGVyIGl0IHJlc29sdmVkLiBQYXNzZXMgcmVqZWN0aW9ucyBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kc1xuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBhZnRlciBtaWxsaXNlY29uZHNcbiAqIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UuXG4gKiBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSByZWplY3RzLCB0aGF0IGlzIHBhc3NlZCBpbW1lZGlhdGVseS5cbiAqL1xuUS5kZWxheSA9IGZ1bmN0aW9uIChvYmplY3QsIHRpbWVvdXQpIHtcbiAgICBpZiAodGltZW91dCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBvYmplY3Q7XG4gICAgICAgIG9iamVjdCA9IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kZWxheSh0aW1lb3V0KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGFzIGFuIGFycmF5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKlxuICogICAgICBRLm5mYXBwbHkoRlMucmVhZEZpbGUsIFtfX2ZpbGVuYW1lXSlcbiAqICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqICAgICAgfSlcbiAqXG4gKi9cblEubmZhcHBseSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXJncykge1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgaW5kaXZpZHVhbGx5LCBhbmQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmNhbGwoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpXG4gKiAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogfSlcbiAqXG4gKi9cblEubmZjYWxsID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBRKGNhbGxiYWNrKS5uZmFwcGx5KGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZjYWxsID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBXcmFwcyBhIE5vZGVKUyBjb250aW51YXRpb24gcGFzc2luZyBmdW5jdGlvbiBhbmQgcmV0dXJucyBhbiBlcXVpdmFsZW50XG4gKiB2ZXJzaW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UuXG4gKiBAZXhhbXBsZVxuICogUS5uZmJpbmQoRlMucmVhZEZpbGUsIF9fZmlsZW5hbWUpKFwidXRmLThcIilcbiAqIC50aGVuKGNvbnNvbGUubG9nKVxuICogLmRvbmUoKVxuICovXG5RLm5mYmluZCA9XG5RLmRlbm9kZWlmeSA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgd3JhcCBhbiB1bmRlZmluZWQgZnVuY3Rpb25cIik7XG4gICAgfVxuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIFEoY2FsbGJhY2spLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmZiaW5kID1cblByb21pc2UucHJvdG90eXBlLmRlbm9kZWlmeSA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEuZGVub2RlaWZ5LmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG5RLm5iaW5kID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzcCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBiYXNlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGVBcmdzID0gYmFzZUFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgICAgIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXNwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIFEoYm91bmQpLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubmJpbmQgPSBmdW5jdGlvbiAoLyp0aGlzcCwgLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDApO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5uYmluZC5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrIHdpdGggYSBnaXZlbiBhcnJheSBvZiBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZCBjYWxsYmFjay5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrXG4gKiB3aWxsIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLm5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkubnBvc3QobmFtZSwgYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLm5wb3N0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmdzIHx8IFtdKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2ssIGZvcndhcmRpbmcgdGhlIGdpdmVuIHZhcmlhZGljIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkXG4gKiBjYWxsYmFjayBhcmd1bWVudC5cbiAqIEBwYXJhbSBvYmplY3QgYW4gb2JqZWN0IHRoYXQgaGFzIHRoZSBuYW1lZCBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG1ldGhvZCBvZiBvYmplY3RcbiAqIEBwYXJhbSAuLi5hcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFjayB3aWxsXG4gKiBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblEubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUS5uaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5Qcm9taXNlLnByb3RvdHlwZS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5Qcm9taXNlLnByb3RvdHlwZS5uaW52b2tlID0gZnVuY3Rpb24gKG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogSWYgYSBmdW5jdGlvbiB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgYm90aCBOb2RlIGNvbnRpbnVhdGlvbi1wYXNzaW5nLXN0eWxlIGFuZFxuICogcHJvbWlzZS1yZXR1cm5pbmctc3R5bGUsIGl0IGNhbiBlbmQgaXRzIGludGVybmFsIHByb21pc2UgY2hhaW4gd2l0aFxuICogYG5vZGVpZnkobm9kZWJhY2spYCwgZm9yd2FyZGluZyB0aGUgb3B0aW9uYWwgbm9kZWJhY2sgYXJndW1lbnQuICBJZiB0aGUgdXNlclxuICogZWxlY3RzIHRvIHVzZSBhIG5vZGViYWNrLCB0aGUgcmVzdWx0IHdpbGwgYmUgc2VudCB0aGVyZS4gIElmIHRoZXkgZG8gbm90XG4gKiBwYXNzIGEgbm9kZWJhY2ssIHRoZXkgd2lsbCByZWNlaXZlIHRoZSByZXN1bHQgcHJvbWlzZS5cbiAqIEBwYXJhbSBvYmplY3QgYSByZXN1bHQgKG9yIGEgcHJvbWlzZSBmb3IgYSByZXN1bHQpXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBub2RlYmFjayBhIE5vZGUuanMtc3R5bGUgY2FsbGJhY2tcbiAqIEByZXR1cm5zIGVpdGhlciB0aGUgcHJvbWlzZSBvciBub3RoaW5nXG4gKi9cblEubm9kZWlmeSA9IG5vZGVpZnk7XG5mdW5jdGlvbiBub2RlaWZ5KG9iamVjdCwgbm9kZWJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5vZGVpZnkobm9kZWJhY2spO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKG5vZGViYWNrKSB7XG4gICAgaWYgKG5vZGViYWNrKSB7XG4gICAgICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5vZGViYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5vZGViYWNrKGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59O1xuXG5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJRLm5vQ29uZmxpY3Qgb25seSB3b3JrcyB3aGVuIFEgaXMgdXNlZCBhcyBhIGdsb2JhbFwiKTtcbn07XG5cbi8vIEFsbCBjb2RlIGJlZm9yZSB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMuXG52YXIgcUVuZGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xuXG5yZXR1cm4gUTtcblxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcS9xLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCA1IDYgNyA4IDEwIDExIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9wcm9jZXNzL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCJ2YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG4gIGlmICh0aW1lb3V0KSB7XG4gICAgdGltZW91dC5jbG9zZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIHNldGltbWVkaWF0ZSBhdHRhY2hlcyBpdHNlbGYgdG8gdGhlIGdsb2JhbCBvYmplY3RcbnJlcXVpcmUoXCJzZXRpbW1lZGlhdGVcIik7XG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHNldEltbWVkaWF0ZTtcbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSBjbGVhckltbWVkaWF0ZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJwYWNrLXN0cmVhbS9+L3RpbWVycy1icm93c2VyaWZ5L21haW4uanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCIoZnVuY3Rpb24gKGdsb2JhbCwgdW5kZWZpbmVkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoZ2xvYmFsLnNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5leHRIYW5kbGUgPSAxOyAvLyBTcGVjIHNheXMgZ3JlYXRlciB0aGFuIHplcm9cbiAgICB2YXIgdGFza3NCeUhhbmRsZSA9IHt9O1xuICAgIHZhciBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSBmYWxzZTtcbiAgICB2YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xuICAgIHZhciByZWdpc3RlckltbWVkaWF0ZTtcblxuICAgIGZ1bmN0aW9uIHNldEltbWVkaWF0ZShjYWxsYmFjaykge1xuICAgICAgLy8gQ2FsbGJhY2sgY2FuIGVpdGhlciBiZSBhIGZ1bmN0aW9uIG9yIGEgc3RyaW5nXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oXCJcIiArIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICAgIC8vIENvcHkgZnVuY3Rpb24gYXJndW1lbnRzXG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgIH1cbiAgICAgIC8vIFN0b3JlIGFuZCByZWdpc3RlciB0aGUgdGFza1xuICAgICAgdmFyIHRhc2sgPSB7IGNhbGxiYWNrOiBjYWxsYmFjaywgYXJnczogYXJncyB9O1xuICAgICAgdGFza3NCeUhhbmRsZVtuZXh0SGFuZGxlXSA9IHRhc2s7XG4gICAgICByZWdpc3RlckltbWVkaWF0ZShuZXh0SGFuZGxlKTtcbiAgICAgIHJldHVybiBuZXh0SGFuZGxlKys7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaGFuZGxlKSB7XG4gICAgICAgIGRlbGV0ZSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuKHRhc2spIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGFzay5jYWxsYmFjaztcbiAgICAgICAgdmFyIGFyZ3MgPSB0YXNrLmFyZ3M7XG4gICAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuSWZQcmVzZW50KGhhbmRsZSkge1xuICAgICAgICAvLyBGcm9tIHRoZSBzcGVjOiBcIldhaXQgdW50aWwgYW55IGludm9jYXRpb25zIG9mIHRoaXMgYWxnb3JpdGhtIHN0YXJ0ZWQgYmVmb3JlIHRoaXMgb25lIGhhdmUgY29tcGxldGVkLlwiXG4gICAgICAgIC8vIFNvIGlmIHdlJ3JlIGN1cnJlbnRseSBydW5uaW5nIGEgdGFzaywgd2UnbGwgbmVlZCB0byBkZWxheSB0aGlzIGludm9jYXRpb24uXG4gICAgICAgIGlmIChjdXJyZW50bHlSdW5uaW5nQVRhc2spIHtcbiAgICAgICAgICAgIC8vIERlbGF5IGJ5IGRvaW5nIGEgc2V0VGltZW91dC4gc2V0SW1tZWRpYXRlIHdhcyB0cmllZCBpbnN0ZWFkLCBidXQgaW4gRmlyZWZveCA3IGl0IGdlbmVyYXRlZCBhXG4gICAgICAgICAgICAvLyBcInRvbyBtdWNoIHJlY3Vyc2lvblwiIGVycm9yLlxuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzQnlIYW5kbGVbaGFuZGxlXTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBydW4odGFzayk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbW1lZGlhdGUoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE5leHRUaWNrSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHsgcnVuSWZQcmVzZW50KGhhbmRsZSk7IH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblVzZVBvc3RNZXNzYWdlKCkge1xuICAgICAgICAvLyBUaGUgdGVzdCBhZ2FpbnN0IGBpbXBvcnRTY3JpcHRzYCBwcmV2ZW50cyB0aGlzIGltcGxlbWVudGF0aW9uIGZyb20gYmVpbmcgaW5zdGFsbGVkIGluc2lkZSBhIHdlYiB3b3JrZXIsXG4gICAgICAgIC8vIHdoZXJlIGBnbG9iYWwucG9zdE1lc3NhZ2VgIG1lYW5zIHNvbWV0aGluZyBjb21wbGV0ZWx5IGRpZmZlcmVudCBhbmQgY2FuJ3QgYmUgdXNlZCBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgICBpZiAoZ2xvYmFsLnBvc3RNZXNzYWdlICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cykge1xuICAgICAgICAgICAgdmFyIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG9sZE9uTWVzc2FnZSA9IGdsb2JhbC5vbm1lc3NhZ2U7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cyA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShcIlwiLCBcIipcIik7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gb2xkT25NZXNzYWdlO1xuICAgICAgICAgICAgcmV0dXJuIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgLy8gSW5zdGFsbHMgYW4gZXZlbnQgaGFuZGxlciBvbiBgZ2xvYmFsYCBmb3IgdGhlIGBtZXNzYWdlYCBldmVudDogc2VlXG4gICAgICAgIC8vICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL3dpbmRvdy5wb3N0TWVzc2FnZVxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2NvbW1zLmh0bWwjY3Jvc3NEb2N1bWVudE1lc3NhZ2VzXG5cbiAgICAgICAgdmFyIG1lc3NhZ2VQcmVmaXggPSBcInNldEltbWVkaWF0ZSRcIiArIE1hdGgucmFuZG9tKCkgKyBcIiRcIjtcbiAgICAgICAgdmFyIG9uR2xvYmFsTWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXhPZihtZXNzYWdlUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudCgrZXZlbnQuZGF0YS5zbGljZShtZXNzYWdlUHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsLmF0dGFjaEV2ZW50KFwib25tZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKG1lc3NhZ2VQcmVmaXggKyBoYW5kbGUsIFwiKlwiKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTWVzc2FnZUNoYW5uZWxJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZSA9IGV2ZW50LmRhdGE7XG4gICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZShoYW5kbGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIDxzY3JpcHQ+IGVsZW1lbnQ7IGl0cyByZWFkeXN0YXRlY2hhbmdlIGV2ZW50IHdpbGwgYmUgZmlyZWQgYXN5bmNocm9ub3VzbHkgb25jZSBpdCBpcyBpbnNlcnRlZFxuICAgICAgICAgICAgLy8gaW50byB0aGUgZG9jdW1lbnQuIERvIHNvLCB0aHVzIHF1ZXVpbmcgdXAgdGhlIHRhc2suIFJlbWVtYmVyIHRvIGNsZWFuIHVwIG9uY2UgaXQncyBiZWVuIGNhbGxlZC5cbiAgICAgICAgICAgIHZhciBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgaHRtbC5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIHNjcmlwdCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHRtbC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bklmUHJlc2VudCwgMCwgaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBzdXBwb3J0ZWQsIHdlIHNob3VsZCBhdHRhY2ggdG8gdGhlIHByb3RvdHlwZSBvZiBnbG9iYWwsIHNpbmNlIHRoYXQgaXMgd2hlcmUgc2V0VGltZW91dCBldCBhbC4gbGl2ZS5cbiAgICB2YXIgYXR0YWNoVG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbCk7XG4gICAgYXR0YWNoVG8gPSBhdHRhY2hUbyAmJiBhdHRhY2hUby5zZXRUaW1lb3V0ID8gYXR0YWNoVG8gOiBnbG9iYWw7XG5cbiAgICAvLyBEb24ndCBnZXQgZm9vbGVkIGJ5IGUuZy4gYnJvd3NlcmlmeSBlbnZpcm9ubWVudHMuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoZ2xvYmFsLnByb2Nlc3MpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIikge1xuICAgICAgICAvLyBGb3IgTm9kZS5qcyBiZWZvcmUgMC45XG4gICAgICAgIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGNhblVzZVBvc3RNZXNzYWdlKCkpIHtcbiAgICAgICAgLy8gRm9yIG5vbi1JRTEwIG1vZGVybiBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChnbG9iYWwuTWVzc2FnZUNoYW5uZWwpIHtcbiAgICAgICAgLy8gRm9yIHdlYiB3b3JrZXJzLCB3aGVyZSBzdXBwb3J0ZWRcbiAgICAgICAgaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZG9jICYmIFwib25yZWFkeXN0YXRlY2hhbmdlXCIgaW4gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIikpIHtcbiAgICAgICAgLy8gRm9yIElFIDbigJM4XG4gICAgICAgIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBvbGRlciBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoVG8uc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlO1xuICAgIGF0dGFjaFRvLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG59KHR5cGVvZiBzZWxmID09PSBcInVuZGVmaW5lZFwiID8gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHRoaXMgOiBnbG9iYWwgOiBzZWxmKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc2V0aW1tZWRpYXRlL3NldEltbWVkaWF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgNSA2IDcgOCAxMCAxMSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IFRvbSBvbiAyMDE2LzA1LzA5XHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0VVJMOntcclxuXHRcdFNTT19MT0dJTjonaHR0cDovLzIyMy4yMDIuNjQuMjA0OjUwOTAxL2xvZ2luJywvL+WNleeCueeZu+W9lVxyXG4gICAgICAgIFNTT19MT0dPVVQ6J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDkwMS9sb2dvdXQnLC8v5Y2V54K56YCA5Ye6XHJcbiAgICAgICAgSU5ERVg6J2h0dHA6Ly8xMjcuMC4wLjE6OTAyMC9odG1sL2luZGV4Lmh0bWwnLC8v5Lq65Lq66YCa6aaW6aG1XHJcbiAgICAgICAgQ0hFQ0tfTE9HSU46J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDkzNC8nLC8v5qOA5p+l5piv5ZCm55m76ZmG5Y+K5b6X5Yiw55m76ZmG5L+h5oGvXHJcbiAgICAgICAgU0VUVVNFUjonaHR0cDovLzIyMy4yMDIuNjQuMjA0OjUwOTM0L3NldHVzZXIuanNwJywvL+iuvue9rueZu+W9lVxyXG4gICAgICAgIEFQUDonaHR0cDovLzIyMy4yMDIuNjQuMjA0OjUwNzEzLycsLy/lupTnlKjnmoTor7fmsYLlnLDlnYBcclxuICAgICAgICBSRVM6J2h0dHA6Ly8yMjEuMjI4LjI0Mi40OjgwMDcvaW5kZXguaHRtbCcsLy/otYTmupDnmoTor7fmsYLlnLDlnYBcclxuICAgICAgICBVUExPQUQ6J2h0dHA6Ly8yMjMuMjAyLjY0LjIwNDo1MDk1MS9maWxlcycsLy/kuIrkvKDmlofku7blnLDlnYBcclxuICAgICAgICBSRVNURlVMOidodHRwOi8vMjIzLjIwMi42NC4yMDQ6NTA5MzInLFxyXG5cdFx0Rk9PVEVSVFlQRToyLC8vMeaYr+W8oOWutua4r++8jDLmmK/pgJrphY1cclxuXHRcdFNUQVRJU1RJQ1M6MCwvLzDmmK/kuI3mmL7npLrvvIwx5piv5pi+56S6XHJcbiAgICAgICAgQ09VUlNFOjAvLzDmmK/kuI3mmL7npLrvvIwx5piv5pi+56S6XHJcblx0fSxcclxuXHRBUFA6e1xyXG5cdFx0SVNXWDp0cnVlXHJcbiAgICB9LFxyXG5cdEFQUEVYSVNUUzpmYWxzZSwvL+W8oOWutua4r+aYvuekuu+8jOaXoOmUoeOAgem7hOWGiOS4jeaYvuekulxyXG5cdElTUElOR0NFVEFTSzpmYWxzZVxyXG59O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9jb25maWcuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCJcclxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcclxudmFyIGFqYXggPSByZXF1aXJlKFwidXRpbC9hamF4XCIpO1xyXG52YXIganNvbnAgPSByZXF1aXJlKCdqcXVlcnkuanNvbnAuanMnKTtcclxuXHJcbnZhciBoZWFkVHBsID0gcmVxdWlyZSgnLi90cGwvaW50ZWdyYWwtdG9wLnRwbCcpO1xyXG52YXIgdHlwZUxpc3RUcGwgPSByZXF1aXJlKCcuL3RwbC90eXBlLWxpc3QudHBsJyk7XHJcbnZhciBob3RMaXN0VHBsID0gcmVxdWlyZSgnLi90cGwvaG90LWxpc3QudHBsJyk7XHJcbnZhciBtb3JlRmVuVHBsID0gcmVxdWlyZSgnLi90cGwvbW9yZS1mZW4udHBsJyk7XHJcbnZhciBmb290VHBsID0gcmVxdWlyZSgnLi90cGwvaW50ZWdyYWwtYm90dG9tLnRwbCcpO1xyXG52YXIgbWVudU5hbWUsIF9jYWxsQmFjaztcclxuXHJcbi8qXHJcbiAqIOWktOmDqOOAgeWwvumDqOWvvOiIqlxyXG4gKi9cclxuXHJcbnZhciBoZWFkZXIgPSB7XHJcbiAgICBpZDogbnVsbCxcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzdG9yYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlO1xyXG4gICAgICAgIG1lLmlkID0gc3RvcmFnZVtcImlkXCJdO1xyXG4gICAgICAgIG1lLmluaXRCdG4oKTtcclxuICAgIH0sXHJcbiAgICBpbml0QnRuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICBhamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2VzaG9wL2JlbG9uZy9hbGwnLFxyXG4gICAgICAgICAgICB0eXBlOiAnZ2V0J1xyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlcicpLmh0bWwoaGVhZFRwbChsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5teS1vcmRlcicgLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jZW50ZXItYmFzZS9teS1vcmRlci5odG1sJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm15LWNhcicgLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9teS1jYXJ0L215LWNhcnQuaHRtbCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIF9jYWxsQmFjaygpXHJcblxyXG4gICAgICAgICAgICAgICAgJCgnLmxvZ28gaW1nJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2ludGVncmFsLWJhc2UvaW50ZWdyYWwtaG9tZS5odG1sJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8g6Z2e6aaW6aG15YiS6L+H5YWo6YOo5ZWG5ZOB5YiG57G75pi+56S6XHJcbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNwbGl0VXJsID0gdXJsLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICBpZihzcGxpdFVybFszXSAhPSAnaW50ZWdyYWwtaG9tZS5odG1sJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmFsbC1saXN0JykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5hbGwtY2xhc3NpZnknKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5hbGwtbGlzdCcpLnNsaWRlRG93bigyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5hbGwtbGlzdCcpLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmFsbC1saXN0Jykuc2xpZGVVcCgyMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcuYWxsLWxpc3QnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZS5pc0xvZ2luKCk7XHJcbiAgICAgICAgICAgICAgICBtZS5sb2dpbmdCdG4oKTtcclxuICAgICAgICAgICAgICAgIG1lLmFsbFR5cGUoKTtcclxuICAgICAgICAgICAgICAgIG1lLmhvdExpc3QoKTtcclxuICAgICAgICAgICAgICAgIG1lLnNlYXJjaE5hbWUoKTtcclxuICAgICAgICAgICAgICAgIG1lLnNlYXJjaEhvdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5uYXYtY2xhc3NpZnkgbGknKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc05hbWUgPSAkKHRoaXMpLmh0bWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJy4uL2NvbW1vZGl0eS1iYXNlL2NvbW1vZGl0eS1saXN0Lmh0bWw/ZmxhZz0nICsgdGhpc05hbWUgKyAnJnBhcmVudElkPScgKyB0aGlzSWQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJyNmb290ZXInKS5odG1sKGZvb3RUcGwoKSk7XHJcbiAgICB9LFxyXG4gICAgLy8g55m75b2V44CB5rOo5YaM5pON5L2cXHJcbiAgICBsb2dpbmdCdG46IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy50b3AgLmxvZ2luZycsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9pbnRlZ3JhbC1iYXNlL2xvZ2luLmh0bWwnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnRvcCAucmVnaXN0ZXInLGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vaW50ZWdyYWwtYmFzZS9yZWdpc3Rlci5odG1sJztcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBpc0xvZ2luOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHN0b3JhZ2UgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2U7XHJcbiAgICAgICAgdmFyIGdldExvZ2lubmFtZSA9IHN0b3JhZ2VbXCJsb2dpbm5hbWVcIl07XHJcbiAgICAgICAgdmFyIGxvZ2luU3RhdHVzID0gc3RvcmFnZVtcImlzbG9naW5cIl07XHJcbiAgICAgICAgLy92YXIgZGF0ZSA9IHN0b3JhZ2VbXCJkYXRlXCJdO1xyXG5cclxuICAgICAgICBpZihsb2dpblN0YXR1cyA9PSAneWVzJyl7XHJcbiAgICAgICAgICAgICQoJy50b3AgLnNpdGUtbG9nZWQnKS5oaWRlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsJy5zaXRlLWxvZ2luZy1zdWNjZXNzIGxpJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vaW50ZWdyYWwtYmFzZS9sb2dpbi5odG1sJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaG90TGlzdDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIGFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6ICcvZXNob3AvdHlwZS9wbGlzdCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdnZXQnLFxyXG4gICAgICAgICAgICBkYXRhOntcclxuICAgICAgICAgICAgICAgIG51bTogJzYnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICBpZihkYXRhLnN0YXR1cyA9PSAyMDApe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICQoJy5zZWFyY2gtaG90JykuaHRtbChob3RMaXN0VHBsKGxpc3QpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGFsbFR5cGU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICBhamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2VzaG9wL3R5cGUvYWxsJyxcclxuICAgICAgICAgICAgdHlwZTogJ2dldCcsXHJcbiAgICAgICAgICAgIGRhdGE6e1xyXG4gICAgICAgICAgICAgICAgYWNjb3VudElkOiBtZS5pZCxcclxuICAgICAgICAgICAgICAgIGxldmVsOiAnMidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhsaXN0KTtcclxuICAgICAgICAgICAgICAgICQoJy5hbGxfbGlzdCcpLmh0bWwodHlwZUxpc3RUcGwobGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgJCgnLm1vcmUtZmVuJykuaHRtbChtb3JlRmVuVHBsKGxpc3QpKTtcclxuICAgICAgICAgICAgICAgICQoJy5hbGxfbGlzdD5saTpndCg1KScpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJy5hbGxfbGlzdD5saScpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmNoaWxkcmVuKCcuY2xhc3NpZi1kZXRhaWwnKS5maW5kKFwidWwgbGlcIikubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY2hpbGRyZW4oJy5jbGFzc2lmLWRldGFpbCcpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoJy5hbGxfbGlzdD5saScpLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCcuY2xhc3NpZi1kZXRhaWwnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmKGRhdGEucmVzdWx0Lmxlbmd0aCA+IDUpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy50b3BDb24gLmFsbC1saXN0IC5tb3JlLWNhdGVnb3JpZXMnKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tb3JlLWZlbicpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcudG9wQ29uIC5hbGwtbGlzdCAubW9yZS1jYXRlZ29yaWVzJykub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubW9yZS1mZW4nKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8g5YWo6YOo5ZWG5ZOB5YiG57G75LiLXHJcbiAgICAgICAgICAgICAgICAkKCcuYWxsX2xpc3Q+bGknKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2Uuc3RvcHByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNJZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzTmFtZSA9ICQodGhpcykuY2hpbGRyZW4oJy5saXN0LXRpdGxlJykuaHRtbCgpLnNwbGl0KCfigKInKVsxXS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktbGlzdC5odG1sP2ZsYWc9JyArIHRoaXNOYW1lICsgJyZwYXJlbnRJZD0nICsgdGhpc0lkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvKiQoJy5hbGxfbGlzdD5saT4ubGlzdC1ob3Q+bGknKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc0lkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNOYW1lID0gJCh0aGlzKS5odG1sKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktbGlzdC5odG1sI2ZsYWc9JyArIHRoaXNOYW1lICsgJyZwYXJlbnRJZD0nICsgdGhpc0lkO1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcHByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9KTsqL1xyXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICcuYWxsX2xpc3Q+bGk+LmNsYXNzaWYtZGV0YWlsPnVsPmxpJyxmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2Uuc3RvcHByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNJZCA9ICQodGhpcykuYXR0cignZGF0YS1pZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzTmFtZSA9ICQodGhpcykuaHRtbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnLi4vY29tbW9kaXR5LWJhc2UvY29tbW9kaXR5LWxpc3QuaHRtbD9mbGFnPScgKyB0aGlzTmFtZSArICcmcGFyZW50SWQ9JyArIHRoaXNJZDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLm1vcmUtY2F0ZWdvcmllcyAubW9yZS1mZW4gLm1vcmUtbGlzdCcsZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9lLnN0b3Bwcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzSWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc05hbWUgPSAkKHRoaXMpLmNoaWxkcmVuKCdkaXYnKS5odG1sKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktbGlzdC5odG1sP2ZsYWc9JyArIHRoaXNOYW1lICsgJyZwYXJlbnRJZD0nICsgdGhpc0lkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzZWFyY2hOYW1lOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsJy5zZWFyY2ggLnNlYXJjaC1idG4nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgZ29vZE5hbWUgPSAkKCcuc2VhcmNoLW5hbWUnKS52YWwoKTtcclxuICAgICAgICAgICAgYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvZXNob3AvcHJvZHVjdC9xdWVyeScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXHJcbiAgICAgICAgICAgICAgICBkYXRhOntcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBnb29kTmFtZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgaWYoZGF0YS5zdGF0dXMgPT0gMjAwKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdCA9IGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktbGlzdC5odG1sI25hbWU9JyArIGdvb2ROYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBzZWFyY2hIb3Q6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJy5zZWFyY2gtaG90IGxpJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgaG90TmFtZSA9ICQodGhpcykuaHRtbCgpO1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50SWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcuLi9jb21tb2RpdHktYmFzZS9jb21tb2RpdHktbGlzdC5odG1sP2ZsYWc9JyArIGhvdE5hbWUgKyAnJnBhcmVudElkPScgKyBwYXJlbnRJZDtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59O1xyXG5cclxuLypcclxuICpcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIF9jYWxsQmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIGhlYWRlci5pbml0KCk7XHJcbiAgICB9XHJcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi9oZWFkZXIuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIiwiLypcbiAqIGpRdWVyeSBKU09OUCBDb3JlIFBsdWdpbiAyLjQuMCAoMjAxMi0wOC0yMSlcbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vamF1Ym91cmcvanF1ZXJ5LWpzb25wXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIEp1bGlhbiBBdWJvdXJnXG4gKlxuICogVGhpcyBkb2N1bWVudCBpcyBsaWNlbnNlZCBhcyBmcmVlIHNvZnR3YXJlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGVcbiAqIE1JVCBMaWNlbnNlOiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICovXG4oIGZ1bmN0aW9uKCAkICkge1xuXG5cdC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgVVRJTElUSUVTICMjXG5cblx0Ly8gTm9vcFxuXHRmdW5jdGlvbiBub29wKCkge1xuXHR9XG5cblx0Ly8gR2VuZXJpYyBjYWxsYmFja1xuXHRmdW5jdGlvbiBnZW5lcmljQ2FsbGJhY2soIGRhdGEgKSB7XG5cdFx0bGFzdFZhbHVlID0gWyBkYXRhIF07XG5cdH1cblxuXHQvLyBDYWxsIGlmIGRlZmluZWRcblx0ZnVuY3Rpb24gY2FsbElmRGVmaW5lZCggbWV0aG9kICwgb2JqZWN0ICwgcGFyYW1ldGVycyApIHtcblx0XHRyZXR1cm4gbWV0aG9kICYmIG1ldGhvZC5hcHBseSggb2JqZWN0LmNvbnRleHQgfHwgb2JqZWN0ICwgcGFyYW1ldGVycyApO1xuXHR9XG5cblx0Ly8gR2l2ZSBqb2luaW5nIGNoYXJhY3RlciBnaXZlbiB1cmxcblx0ZnVuY3Rpb24gcU1hcmtPckFtcCggdXJsICkge1xuXHRcdHJldHVybiAvXFw/LyAudGVzdCggdXJsICkgPyBcIiZcIiA6IFwiP1wiO1xuXHR9XG5cblx0dmFyIC8vIFN0cmluZyBjb25zdGFudHMgKGZvciBiZXR0ZXIgbWluaWZpY2F0aW9uKVxuXHRcdFNUUl9BU1lOQyA9IFwiYXN5bmNcIixcblx0XHRTVFJfQ0hBUlNFVCA9IFwiY2hhcnNldFwiLFxuXHRcdFNUUl9FTVBUWSA9IFwiXCIsXG5cdFx0U1RSX0VSUk9SID0gXCJlcnJvclwiLFxuXHRcdFNUUl9JTlNFUlRfQkVGT1JFID0gXCJpbnNlcnRCZWZvcmVcIixcblx0XHRTVFJfSlFVRVJZX0pTT05QID0gXCJfanFqc3BcIixcblx0XHRTVFJfT04gPSBcIm9uXCIsXG5cdFx0U1RSX09OX0NMSUNLID0gU1RSX09OICsgXCJjbGlja1wiLFxuXHRcdFNUUl9PTl9FUlJPUiA9IFNUUl9PTiArIFNUUl9FUlJPUixcblx0XHRTVFJfT05fTE9BRCA9IFNUUl9PTiArIFwibG9hZFwiLFxuXHRcdFNUUl9PTl9SRUFEWV9TVEFURV9DSEFOR0UgPSBTVFJfT04gKyBcInJlYWR5c3RhdGVjaGFuZ2VcIixcblx0XHRTVFJfUkVBRFlfU1RBVEUgPSBcInJlYWR5U3RhdGVcIixcblx0XHRTVFJfUkVNT1ZFX0NISUxEID0gXCJyZW1vdmVDaGlsZFwiLFxuXHRcdFNUUl9TQ1JJUFRfVEFHID0gXCI8c2NyaXB0PlwiLFxuXHRcdFNUUl9TVUNDRVNTID0gXCJzdWNjZXNzXCIsXG5cdFx0U1RSX1RJTUVPVVQgPSBcInRpbWVvdXRcIixcblxuXHRcdC8vIFdpbmRvd1xuXHRcdHdpbiA9IHdpbmRvdyxcblx0XHQvLyBEZWZlcnJlZFxuXHRcdERlZmVycmVkID0gJC5EZWZlcnJlZCxcblx0XHQvLyBIZWFkIGVsZW1lbnRcblx0XHRoZWFkID0gJCggXCJoZWFkXCIgKVsgMCBdIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblx0XHQvLyBQYWdlIGNhY2hlXG5cdFx0cGFnZUNhY2hlID0ge30sXG5cdFx0Ly8gQ291bnRlclxuXHRcdGNvdW50ID0gMCxcblx0XHQvLyBMYXN0IHJldHVybmVkIHZhbHVlXG5cdFx0bGFzdFZhbHVlLFxuXG5cdFx0Ly8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBERUZBVUxUIE9QVElPTlMgIyNcblx0XHR4T3B0aW9uc0RlZmF1bHRzID0ge1xuXHRcdFx0Ly9iZWZvcmVTZW5kOiB1bmRlZmluZWQsXG5cdFx0XHQvL2NhY2hlOiBmYWxzZSxcblx0XHRcdGNhbGxiYWNrOiBTVFJfSlFVRVJZX0pTT05QLFxuXHRcdFx0Ly9jYWxsYmFja1BhcmFtZXRlcjogdW5kZWZpbmVkLFxuXHRcdFx0Ly9jaGFyc2V0OiB1bmRlZmluZWQsXG5cdFx0XHQvL2NvbXBsZXRlOiB1bmRlZmluZWQsXG5cdFx0XHQvL2NvbnRleHQ6IHVuZGVmaW5lZCxcblx0XHRcdC8vZGF0YTogXCJcIixcblx0XHRcdC8vZGF0YUZpbHRlcjogdW5kZWZpbmVkLFxuXHRcdFx0Ly9lcnJvcjogdW5kZWZpbmVkLFxuXHRcdFx0Ly9wYWdlQ2FjaGU6IGZhbHNlLFxuXHRcdFx0Ly9zdWNjZXNzOiB1bmRlZmluZWQsXG5cdFx0XHQvL3RpbWVvdXQ6IDAsXG5cdFx0XHQvL3RyYWRpdGlvbmFsOiBmYWxzZSxcblx0XHRcdHVybDogbG9jYXRpb24uaHJlZlxuXHRcdH0sXG5cblx0XHQvLyBvcGVyYSBkZW1hbmRzIHNuaWZmaW5nIDovXG5cdFx0b3BlcmEgPSB3aW4ub3BlcmEsXG5cblx0XHQvLyBJRSA8IDEwXG5cdFx0b2xkSUUgPSAhISQoIFwiPGRpdj5cIiApLmh0bWwoIFwiPCEtLVtpZiBJRV0+PGk+PCFbZW5kaWZdLS0+XCIgKS5maW5kKFwiaVwiKS5sZW5ndGg7XG5cblx0Ly8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBNQUlOIEZVTkNUSU9OICMjXG5cdGZ1bmN0aW9uIGpzb25wKCB4T3B0aW9ucyApIHtcblxuXHRcdC8vIEJ1aWxkIGRhdGEgd2l0aCBkZWZhdWx0XG5cdFx0eE9wdGlvbnMgPSAkLmV4dGVuZCgge30gLCB4T3B0aW9uc0RlZmF1bHRzICwgeE9wdGlvbnMgKTtcblxuXHRcdC8vIFJlZmVyZW5jZXMgdG8geE9wdGlvbnMgbWVtYmVycyAoZm9yIGJldHRlciBtaW5pZmljYXRpb24pXG5cdFx0dmFyIHN1Y2Nlc3NDYWxsYmFjayA9IHhPcHRpb25zLnN1Y2Nlc3MsXG5cdFx0XHRlcnJvckNhbGxiYWNrID0geE9wdGlvbnMuZXJyb3IsXG5cdFx0XHRjb21wbGV0ZUNhbGxiYWNrID0geE9wdGlvbnMuY29tcGxldGUsXG5cdFx0XHRkYXRhRmlsdGVyID0geE9wdGlvbnMuZGF0YUZpbHRlcixcblx0XHRcdGNhbGxiYWNrUGFyYW1ldGVyID0geE9wdGlvbnMuY2FsbGJhY2tQYXJhbWV0ZXIsXG5cdFx0XHRzdWNjZXNzQ2FsbGJhY2tOYW1lID0geE9wdGlvbnMuY2FsbGJhY2ssXG5cdFx0XHRjYWNoZUZsYWcgPSB4T3B0aW9ucy5jYWNoZSxcblx0XHRcdHBhZ2VDYWNoZUZsYWcgPSB4T3B0aW9ucy5wYWdlQ2FjaGUsXG5cdFx0XHRjaGFyc2V0ID0geE9wdGlvbnMuY2hhcnNldCxcblx0XHRcdHVybCA9IHhPcHRpb25zLnVybCxcblx0XHRcdGRhdGEgPSB4T3B0aW9ucy5kYXRhLFxuXHRcdFx0dGltZW91dCA9IHhPcHRpb25zLnRpbWVvdXQsXG5cdFx0XHRwYWdlQ2FjaGVkLFxuXG5cdFx0XHQvLyBBYm9ydC9kb25lIGZsYWdcblx0XHRcdGRvbmUgPSAwLFxuXG5cdFx0XHQvLyBMaWZlLWN5Y2xlIGZ1bmN0aW9uc1xuXHRcdFx0Y2xlYW5VcCA9IG5vb3AsXG5cblx0XHRcdC8vIFN1cHBvcnQgdmFyc1xuXHRcdFx0c3VwcG9ydE9ubG9hZCxcblx0XHRcdHN1cHBvcnRPbnJlYWR5c3RhdGVjaGFuZ2UsXG5cblx0XHRcdC8vIFJlcXVlc3QgZXhlY3V0aW9uIHZhcnNcblx0XHRcdGZpcnN0Q2hpbGQsXG5cdFx0XHRzY3JpcHQsXG5cdFx0XHRzY3JpcHRBZnRlcixcblx0XHRcdHRpbWVvdXRUaW1lcjtcblxuXHRcdC8vIElmIHdlIGhhdmUgRGVmZXJyZWRzOlxuXHRcdC8vIC0gc3Vic3RpdHV0ZSBjYWxsYmFja3Ncblx0XHQvLyAtIHByb21vdGUgeE9wdGlvbnMgdG8gYSBwcm9taXNlXG5cdFx0RGVmZXJyZWQgJiYgRGVmZXJyZWQoZnVuY3Rpb24oIGRlZmVyICkge1xuXHRcdFx0ZGVmZXIuZG9uZSggc3VjY2Vzc0NhbGxiYWNrICkuZmFpbCggZXJyb3JDYWxsYmFjayApO1xuXHRcdFx0c3VjY2Vzc0NhbGxiYWNrID0gZGVmZXIucmVzb2x2ZTtcblx0XHRcdGVycm9yQ2FsbGJhY2sgPSBkZWZlci5yZWplY3Q7XG5cdFx0fSkucHJvbWlzZSggeE9wdGlvbnMgKTtcblxuXHRcdC8vIENyZWF0ZSB0aGUgYWJvcnQgbWV0aG9kXG5cdFx0eE9wdGlvbnMuYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdCEoIGRvbmUrKyApICYmIGNsZWFuVXAoKTtcblx0XHR9O1xuXG5cdFx0Ly8gQ2FsbCBiZWZvcmVTZW5kIGlmIHByb3ZpZGVkIChlYXJseSBhYm9ydCBpZiBmYWxzZSByZXR1cm5lZClcblx0XHRpZiAoIGNhbGxJZkRlZmluZWQoIHhPcHRpb25zLmJlZm9yZVNlbmQgLCB4T3B0aW9ucyAsIFsgeE9wdGlvbnMgXSApID09PSAhMSB8fCBkb25lICkge1xuXHRcdFx0cmV0dXJuIHhPcHRpb25zO1xuXHRcdH1cblxuXHRcdC8vIENvbnRyb2wgZW50cmllc1xuXHRcdHVybCA9IHVybCB8fCBTVFJfRU1QVFk7XG5cdFx0ZGF0YSA9IGRhdGEgPyAoICh0eXBlb2YgZGF0YSkgPT0gXCJzdHJpbmdcIiA/IGRhdGEgOiAkLnBhcmFtKCBkYXRhICwgeE9wdGlvbnMudHJhZGl0aW9uYWwgKSApIDogU1RSX0VNUFRZO1xuXG5cdFx0Ly8gQnVpbGQgZmluYWwgdXJsXG5cdFx0dXJsICs9IGRhdGEgPyAoIHFNYXJrT3JBbXAoIHVybCApICsgZGF0YSApIDogU1RSX0VNUFRZO1xuXG5cdFx0Ly8gQWRkIGNhbGxiYWNrIHBhcmFtZXRlciBpZiBwcm92aWRlZCBhcyBvcHRpb25cblx0XHRjYWxsYmFja1BhcmFtZXRlciAmJiAoIHVybCArPSBxTWFya09yQW1wKCB1cmwgKSArIGVuY29kZVVSSUNvbXBvbmVudCggY2FsbGJhY2tQYXJhbWV0ZXIgKSArIFwiPT9cIiApO1xuXG5cdFx0Ly8gQWRkIGFudGljYWNoZSBwYXJhbWV0ZXIgaWYgbmVlZGVkXG5cdFx0IWNhY2hlRmxhZyAmJiAhcGFnZUNhY2hlRmxhZyAmJiAoIHVybCArPSBxTWFya09yQW1wKCB1cmwgKSArIFwiX1wiICsgKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpICsgXCI9XCIgKTtcblxuXHRcdC8vIFJlcGxhY2UgbGFzdCA/IGJ5IGNhbGxiYWNrIHBhcmFtZXRlclxuXHRcdHVybCA9IHVybC5yZXBsYWNlKCAvPVxcPygmfCQpLyAsIFwiPVwiICsgc3VjY2Vzc0NhbGxiYWNrTmFtZSArIFwiJDFcIiApO1xuXG5cdFx0Ly8gU3VjY2VzcyBub3RpZmllclxuXHRcdGZ1bmN0aW9uIG5vdGlmeVN1Y2Nlc3MoIGpzb24gKSB7XG5cblx0XHRcdGlmICggISggZG9uZSsrICkgKSB7XG5cblx0XHRcdFx0Y2xlYW5VcCgpO1xuXHRcdFx0XHQvLyBQYWdlY2FjaGUgaWYgbmVlZGVkXG5cdFx0XHRcdHBhZ2VDYWNoZUZsYWcgJiYgKCBwYWdlQ2FjaGUgWyB1cmwgXSA9IHsgczogWyBqc29uIF0gfSApO1xuXHRcdFx0XHQvLyBBcHBseSB0aGUgZGF0YSBmaWx0ZXIgaWYgcHJvdmlkZWRcblx0XHRcdFx0ZGF0YUZpbHRlciAmJiAoIGpzb24gPSBkYXRhRmlsdGVyLmFwcGx5KCB4T3B0aW9ucyAsIFsganNvbiBdICkgKTtcblx0XHRcdFx0Ly8gQ2FsbCBzdWNjZXNzIHRoZW4gY29tcGxldGVcblx0XHRcdFx0Y2FsbElmRGVmaW5lZCggc3VjY2Vzc0NhbGxiYWNrICwgeE9wdGlvbnMgLCBbIGpzb24gLCBTVFJfU1VDQ0VTUywgeE9wdGlvbnMgXSApO1xuXHRcdFx0XHRjYWxsSWZEZWZpbmVkKCBjb21wbGV0ZUNhbGxiYWNrICwgeE9wdGlvbnMgLCBbIHhPcHRpb25zICwgU1RSX1NVQ0NFU1MgXSApO1xuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gRXJyb3Igbm90aWZpZXJcblx0XHRmdW5jdGlvbiBub3RpZnlFcnJvciggdHlwZSApIHtcblxuXHRcdFx0aWYgKCAhKCBkb25lKysgKSApIHtcblxuXHRcdFx0XHQvLyBDbGVhbiB1cFxuXHRcdFx0XHRjbGVhblVwKCk7XG5cdFx0XHRcdC8vIElmIHB1cmUgZXJyb3IgKG5vdCB0aW1lb3V0KSwgY2FjaGUgaWYgbmVlZGVkXG5cdFx0XHRcdHBhZ2VDYWNoZUZsYWcgJiYgdHlwZSAhPSBTVFJfVElNRU9VVCAmJiAoIHBhZ2VDYWNoZVsgdXJsIF0gPSB0eXBlICk7XG5cdFx0XHRcdC8vIENhbGwgZXJyb3IgdGhlbiBjb21wbGV0ZVxuXHRcdFx0XHRjYWxsSWZEZWZpbmVkKCBlcnJvckNhbGxiYWNrICwgeE9wdGlvbnMgLCBbIHhPcHRpb25zICwgdHlwZSBdICk7XG5cdFx0XHRcdGNhbGxJZkRlZmluZWQoIGNvbXBsZXRlQ2FsbGJhY2sgLCB4T3B0aW9ucyAsIFsgeE9wdGlvbnMgLCB0eXBlIF0gKTtcblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENoZWNrIHBhZ2UgY2FjaGVcblx0XHRpZiAoIHBhZ2VDYWNoZUZsYWcgJiYgKCBwYWdlQ2FjaGVkID0gcGFnZUNhY2hlWyB1cmwgXSApICkge1xuXG5cdFx0XHRwYWdlQ2FjaGVkLnMgPyBub3RpZnlTdWNjZXNzKCBwYWdlQ2FjaGVkLnNbIDAgXSApIDogbm90aWZ5RXJyb3IoIHBhZ2VDYWNoZWQgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIEluc3RhbGwgdGhlIGdlbmVyaWMgY2FsbGJhY2tcblx0XHRcdC8vIChCRVdBUkU6IGdsb2JhbCBuYW1lc3BhY2UgcG9sbHV0aW9uIGFob3kpXG5cdFx0XHR3aW5bIHN1Y2Nlc3NDYWxsYmFja05hbWUgXSA9IGdlbmVyaWNDYWxsYmFjaztcblxuXHRcdFx0Ly8gQ3JlYXRlIHRoZSBzY3JpcHQgdGFnXG5cdFx0XHRzY3JpcHQgPSAkKCBTVFJfU0NSSVBUX1RBRyApWyAwIF07XG5cdFx0XHRzY3JpcHQuaWQgPSBTVFJfSlFVRVJZX0pTT05QICsgY291bnQrKztcblxuXHRcdFx0Ly8gU2V0IGNoYXJzZXQgaWYgcHJvdmlkZWRcblx0XHRcdGlmICggY2hhcnNldCApIHtcblx0XHRcdFx0c2NyaXB0WyBTVFJfQ0hBUlNFVCBdID0gY2hhcnNldDtcblx0XHRcdH1cblxuXHRcdFx0b3BlcmEgJiYgb3BlcmEudmVyc2lvbigpIDwgMTEuNjAgP1xuXHRcdFx0XHQvLyBvbmVycm9yIGlzIG5vdCBzdXBwb3J0ZWQ6IGRvIG5vdCBzZXQgYXMgYXN5bmMgYW5kIGFzc3VtZSBpbi1vcmRlciBleGVjdXRpb24uXG5cdFx0XHRcdC8vIEFkZCBhIHRyYWlsaW5nIHNjcmlwdCB0byBlbXVsYXRlIHRoZSBldmVudFxuXHRcdFx0XHQoICggc2NyaXB0QWZ0ZXIgPSAkKCBTVFJfU0NSSVBUX1RBRyApWyAwIF0gKS50ZXh0ID0gXCJkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnXCIgKyBzY3JpcHQuaWQgKyBcIicpLlwiICsgU1RSX09OX0VSUk9SICsgXCIoKVwiIClcblx0XHRcdDpcblx0XHRcdFx0Ly8gb25lcnJvciBpcyBzdXBwb3J0ZWQ6IHNldCB0aGUgc2NyaXB0IGFzIGFzeW5jIHRvIGF2b2lkIHJlcXVlc3RzIGJsb2NraW5nIGVhY2ggb3RoZXJzXG5cdFx0XHRcdCggc2NyaXB0WyBTVFJfQVNZTkMgXSA9IFNUUl9BU1lOQyApXG5cblx0XHRcdDtcblxuXHRcdFx0Ly8gSW50ZXJuZXQgRXhwbG9yZXI6IGV2ZW50L2h0bWxGb3IgdHJpY2tcblx0XHRcdGlmICggb2xkSUUgKSB7XG5cdFx0XHRcdHNjcmlwdC5odG1sRm9yID0gc2NyaXB0LmlkO1xuXHRcdFx0XHRzY3JpcHQuZXZlbnQgPSBTVFJfT05fQ0xJQ0s7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEF0dGFjaGVkIGV2ZW50IGhhbmRsZXJzXG5cdFx0XHRzY3JpcHRbIFNUUl9PTl9MT0FEIF0gPSBzY3JpcHRbIFNUUl9PTl9FUlJPUiBdID0gc2NyaXB0WyBTVFJfT05fUkVBRFlfU1RBVEVfQ0hBTkdFIF0gPSBmdW5jdGlvbiAoIHJlc3VsdCApIHtcblxuXHRcdFx0XHQvLyBUZXN0IHJlYWR5U3RhdGUgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdGlmICggIXNjcmlwdFsgU1RSX1JFQURZX1NUQVRFIF0gfHwgIS9pLy50ZXN0KCBzY3JpcHRbIFNUUl9SRUFEWV9TVEFURSBdICkgKSB7XG5cblx0XHRcdFx0XHR0cnkge1xuXG5cdFx0XHRcdFx0XHRzY3JpcHRbIFNUUl9PTl9DTElDSyBdICYmIHNjcmlwdFsgU1RSX09OX0NMSUNLIF0oKTtcblxuXHRcdFx0XHRcdH0gY2F0Y2goIF8gKSB7fVxuXG5cdFx0XHRcdFx0cmVzdWx0ID0gbGFzdFZhbHVlO1xuXHRcdFx0XHRcdGxhc3RWYWx1ZSA9IDA7XG5cdFx0XHRcdFx0cmVzdWx0ID8gbm90aWZ5U3VjY2VzcyggcmVzdWx0WyAwIF0gKSA6IG5vdGlmeUVycm9yKCBTVFJfRVJST1IgKTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBTZXQgc291cmNlXG5cdFx0XHRzY3JpcHQuc3JjID0gdXJsO1xuXG5cdFx0XHQvLyBSZS1kZWNsYXJlIGNsZWFuVXAgZnVuY3Rpb25cblx0XHRcdGNsZWFuVXAgPSBmdW5jdGlvbiggaSApIHtcblx0XHRcdFx0dGltZW91dFRpbWVyICYmIGNsZWFyVGltZW91dCggdGltZW91dFRpbWVyICk7XG5cdFx0XHRcdHNjcmlwdFsgU1RSX09OX1JFQURZX1NUQVRFX0NIQU5HRSBdID0gc2NyaXB0WyBTVFJfT05fTE9BRCBdID0gc2NyaXB0WyBTVFJfT05fRVJST1IgXSA9IG51bGw7XG5cdFx0XHRcdGhlYWRbIFNUUl9SRU1PVkVfQ0hJTEQgXSggc2NyaXB0ICk7XG5cdFx0XHRcdHNjcmlwdEFmdGVyICYmIGhlYWRbIFNUUl9SRU1PVkVfQ0hJTEQgXSggc2NyaXB0QWZ0ZXIgKTtcblx0XHRcdH07XG5cblx0XHRcdC8vIEFwcGVuZCBtYWluIHNjcmlwdFxuXHRcdFx0aGVhZFsgU1RSX0lOU0VSVF9CRUZPUkUgXSggc2NyaXB0ICwgKCBmaXJzdENoaWxkID0gaGVhZC5maXJzdENoaWxkICkgKTtcblxuXHRcdFx0Ly8gQXBwZW5kIHRyYWlsaW5nIHNjcmlwdCBpZiBuZWVkZWRcblx0XHRcdHNjcmlwdEFmdGVyICYmIGhlYWRbIFNUUl9JTlNFUlRfQkVGT1JFIF0oIHNjcmlwdEFmdGVyICwgZmlyc3RDaGlsZCApO1xuXG5cdFx0XHQvLyBJZiBhIHRpbWVvdXQgaXMgbmVlZGVkLCBpbnN0YWxsIGl0XG5cdFx0XHR0aW1lb3V0VGltZXIgPSB0aW1lb3V0ID4gMCAmJiBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0bm90aWZ5RXJyb3IoIFNUUl9USU1FT1VUICk7XG5cdFx0XHR9ICwgdGltZW91dCApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHhPcHRpb25zO1xuXHR9XG5cblx0Ly8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBTRVRVUCBGVU5DVElPTiAjI1xuXHRqc29ucC5zZXR1cCA9IGZ1bmN0aW9uKCB4T3B0aW9ucyApIHtcblx0XHQkLmV4dGVuZCggeE9wdGlvbnNEZWZhdWx0cyAsIHhPcHRpb25zICk7XG5cdH07XG5cblx0Ly8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBJTlNUQUxMIGluIGpRdWVyeSAjI1xuXHQkLmpzb25wID0ganNvbnA7XG5cbn0gKSggalF1ZXJ5ICk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9qcXVlcnkuanNvbnAuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIDMgNCAxMCAxMSIsInZhciB0ZW1wbGF0ZT1yZXF1aXJlKCd0bW9kanMtbG9hZGVyL3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzPXRlbXBsYXRlKCdkZXAvaGVhZGVyLW5hdi90cGwvaW50ZWdyYWwtdG9wJyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRvdXQrPSc8ZGl2IGNsYXNzPVwidG9wLXNpdGVcIj4gPGRpdiBjbGFzcz1cInNpdGVcIj4gIDxkaXYgY2xhc3M9XCJ3ZWxjb21lLXByZXNlbmNlIGZsXCI+IDxkaXYgY2xhc3M9XCJ3ZWxjb21lIGZsXCI+5oKo5aW977yM5qyi6L+O5YWJ5Li05b6h5bu35a625bGF77yBPC9kaXY+IDxkaXYgY2xhc3M9XCJzaXRlLWxvZ2VkIGZsXCI+IDxzcGFuIGNsYXNzPVwibG9naW5nXCI+WyDnmbvlvZUgXTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJyZWdpc3RlclwiPlsg5rOo5YaMIF08L3NwYW4+IDwvZGl2PiA8L2Rpdj4gIDxkaXYgY2xhc3M9XCJzaXRlLWxvZ2luZy1zdWNjZXNzIGZyXCI+IDx1bCBjbGFzcz1cImNsZWFyZml4XCI+IDxsaSBjbGFzcz1cIm15LW9yZGVyXCI+PGkgY2xhc3M9XCJvcmRlclwiPjwvaT48YT7miJHnmoTorqLljZU8L2E+PC9saT4gPGxpIGNsYXNzPVwibXktY2FyXCI+PGkgY2xhc3M9XCJjYXJ0XCI+PC9pPjxhPui0reeJqei9pjwvYT48L2xpPiA8bGkgY2xhc3M9XCJtdS1pbmZvXCI+PGkgY2xhc3M9XCJ1c2VyXCI+PC9pPjxhPueUqOaIt+euoeeQhjwvYT48L2xpPiA8L3VsPiA8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8ZGl2IGNsYXNzPVwidG9wQ29uXCI+IDxkaXYgY2xhc3M9XCJ0b3AtbG9nbyBjbGVhcmZpeFwiPiA8ZGl2IGNsYXNzPVwibG9nbyBmbFwiPiA8aW1nIHNyYz1cIi4uLy4uL2J1bmRsZS9pbWcvbG9nby5wbmdcIj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJzZWFyY2ggZmxcIj4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzZWFyY2gtbmFtZSBmbFwiPiA8c3BhbiBjbGFzcz1cInNlYXJjaC1idG4gZnJcIj7mkJwg57SiPC9zcGFuPiA8aW1nIHNyYz1cIi4uLy4uL2J1bmRsZS9pbWcvaWNvbi1zZWFyY2gucG5nXCIgY2xhc3M9XCJzZWFyY2gtaWNvblwiPiA8aW1nIHNyYz1cIi4uLy4uL2J1bmRsZS9pbWcvaWNvbi15dXlpbi5wbmdcIiBjbGFzcz1cInl1eWluLWljb25cIj4gPHVsIGNsYXNzPVwic2VhcmNoLWhvdFwiPjwvdWw+IDwvZGl2PiA8L2Rpdj4gPGRpdiBjbGFzcz1cImFsbC1uYXYgY2xlYXJmaXhcIj4gPGRpdiBjbGFzcz1cImFsbC1jbGFzc2lmeSBmbFwiPuWFqOmDqOWVhuWTgeWIhuexuzwvZGl2PiA8dWwgY2xhc3M9XCJuYXYtY2xhc3NpZnkgZmxcIj4gJztcbiRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvbGk+ICc7XG59KTtcbiRvdXQrPScgPC91bD4gPC9kaXY+IDxkaXYgY2xhc3M9XCJhbGwtbGlzdFwiPiA8dWwgY2xhc3M9XCJhbGxfbGlzdFwiPjwvdWw+IDxkaXYgY2xhc3M9XCJtb3JlLWNhdGVnb3JpZXNcIj4gPHNwYW4+5pu05aSa5YiG57G7PC9zcGFuPiAgPGRpdiBjbGFzcz1cIm1vcmUtZmVuIGNsZWFyZml4XCI+PC9kaXY+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+JztcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvaW50ZWdyYWwtdG9wLnRwbFxuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIiwiLypUTU9ESlM6e30qL1xyXG4hZnVuY3Rpb24gKCkge1xyXG5cdGZ1bmN0aW9uIGEoYSwgYikge1xyXG5cdFx0cmV0dXJuICgvc3RyaW5nfGZ1bmN0aW9uLy50ZXN0KHR5cGVvZiBiKSA/IGggOiBnKShhLCBiKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYihhLCBjKSB7XHJcblx0XHRyZXR1cm4gXCJzdHJpbmdcIiAhPSB0eXBlb2YgYSAmJiAoYyA9IHR5cGVvZiBhLCBcIm51bWJlclwiID09PSBjID8gYSArPSBcIlwiIDogYSA9IFwiZnVuY3Rpb25cIiA9PT0gYyA/IGIoYS5jYWxsKGEpKSA6IFwiXCIpLCBhXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjKGEpIHtcclxuXHRcdHJldHVybiBsW2FdXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkKGEpIHtcclxuXHRcdHJldHVybiBiKGEpLnJlcGxhY2UoLyYoPyFbXFx3I10rOyl8Wzw+XCInXS9nLCBjKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZShhLCBiKSB7XHJcblx0XHRpZiAobShhKSlmb3IgKHZhciBjID0gMCwgZCA9IGEubGVuZ3RoOyBkID4gYzsgYysrKWIuY2FsbChhLCBhW2NdLCBjLCBhKTsgZWxzZSBmb3IgKGMgaW4gYSliLmNhbGwoYSwgYVtjXSwgYylcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGYoYSwgYikge1xyXG5cdFx0dmFyIGMgPSAvKFxcLylbXlxcL10rXFwxXFwuXFwuXFwxLywgZCA9IChcIi4vXCIgKyBhKS5yZXBsYWNlKC9bXlxcL10rJC8sIFwiXCIpLCBlID0gZCArIGI7XHJcblx0XHRmb3IgKGUgPSBlLnJlcGxhY2UoL1xcL1xcLlxcLy9nLCBcIi9cIik7IGUubWF0Y2goYyk7KWUgPSBlLnJlcGxhY2UoYywgXCIvXCIpO1xyXG5cdFx0cmV0dXJuIGVcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGcoYiwgYykge1xyXG5cdFx0dmFyIGQgPSBhLmdldChiKSB8fCBpKHtmaWxlbmFtZTogYiwgbmFtZTogXCJSZW5kZXIgRXJyb3JcIiwgbWVzc2FnZTogXCJUZW1wbGF0ZSBub3QgZm91bmRcIn0pO1xyXG5cdFx0cmV0dXJuIGMgPyBkKGMpIDogZFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaChhLCBiKSB7XHJcblx0XHRpZiAoXCJzdHJpbmdcIiA9PSB0eXBlb2YgYikge1xyXG5cdFx0XHR2YXIgYyA9IGI7XHJcblx0XHRcdGIgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBrKGMpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBkID0galthXSA9IGZ1bmN0aW9uIChjKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBiKGMsIGEpICsgXCJcIlxyXG5cdFx0XHR9IGNhdGNoIChkKSB7XHJcblx0XHRcdFx0cmV0dXJuIGkoZCkoKVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIGQucHJvdG90eXBlID0gYi5wcm90b3R5cGUgPSBuLCBkLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gYiArIFwiXCJcclxuXHRcdH0sIGRcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGkoYSkge1xyXG5cdFx0dmFyIGIgPSBcIntUZW1wbGF0ZSBFcnJvcn1cIiwgYyA9IGEuc3RhY2sgfHwgXCJcIjtcclxuXHRcdGlmIChjKWMgPSBjLnNwbGl0KFwiXFxuXCIpLnNsaWNlKDAsIDIpLmpvaW4oXCJcXG5cIik7IGVsc2UgZm9yICh2YXIgZCBpbiBhKWMgKz0gXCI8XCIgKyBkICsgXCI+XFxuXCIgKyBhW2RdICsgXCJcXG5cXG5cIjtcclxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHJldHVybiBcIm9iamVjdFwiID09IHR5cGVvZiBjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IoYiArIFwiXFxuXFxuXCIgKyBjKSwgYlxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGogPSBhLmNhY2hlID0ge30sIGsgPSB0aGlzLlN0cmluZywgbCA9IHtcclxuXHRcdFwiPFwiOiBcIiYjNjA7XCIsXHJcblx0XHRcIj5cIjogXCImIzYyO1wiLFxyXG5cdFx0J1wiJzogXCImIzM0O1wiLFxyXG5cdFx0XCInXCI6IFwiJiMzOTtcIixcclxuXHRcdFwiJlwiOiBcIiYjMzg7XCJcclxuXHR9LCBtID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYSkge1xyXG5cdFx0XHRyZXR1cm4gXCJbb2JqZWN0IEFycmF5XVwiID09PSB7fS50b1N0cmluZy5jYWxsKGEpXHJcblx0XHR9LCBuID0gYS51dGlscyA9IHtcclxuXHRcdCRoZWxwZXJzOiB7fSwgJGluY2x1ZGU6IGZ1bmN0aW9uIChhLCBiLCBjKSB7XHJcblx0XHRcdHJldHVybiBhID0gZihjLCBhKSwgZyhhLCBiKVxyXG5cdFx0fSwgJHN0cmluZzogYiwgJGVzY2FwZTogZCwgJGVhY2g6IGVcclxuXHR9LCBvID0gYS5oZWxwZXJzID0gbi4kaGVscGVycztcclxuXHRhLmdldCA9IGZ1bmN0aW9uIChhKSB7XHJcblx0XHRyZXR1cm4galthLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKV1cclxuXHR9LCBhLmhlbHBlciA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcblx0XHRvW2FdID0gYlxyXG5cdH0sIG1vZHVsZS5leHBvcnRzID0gYVxyXG59KCk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3Rtb2Rqcy1sb2FkZXIvcnVudGltZS5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDUgNiA3IDggMTAgMTEiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL3R5cGUtbGlzdCcsZnVuY3Rpb24oJGRhdGEsJGZpbGVuYW1lXG4vKiovKSB7XG4ndXNlIHN0cmljdCc7dmFyICR1dGlscz10aGlzLCRoZWxwZXJzPSR1dGlscy4kaGVscGVycywkZWFjaD0kdXRpbHMuJGVhY2gsJHZhbHVlPSRkYXRhLiR2YWx1ZSwkaW5kZXg9JGRhdGEuJGluZGV4LCRlc2NhcGU9JHV0aWxzLiRlc2NhcGUsJG91dD0nJzskZWFjaCgkZGF0YSxmdW5jdGlvbigkdmFsdWUsJGluZGV4KXtcbiRvdXQrPScgPGxpIGRhdGEtaWQ9XCInO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUuaWQpO1xuJG91dCs9J1wiPiA8ZGl2IGNsYXNzPVwibGlzdC10aXRsZVwiPuKAoiAnO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9kaXY+IDx1bCBjbGFzcz1cImxpc3QtaG90IGNsZWFyZml4XCI+ICc7XG4kZWFjaCgkdmFsdWUuY2hpbGQsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxsaSBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9saT4gJztcbn0pO1xuJG91dCs9JyA8L3VsPiA8ZGl2IGNsYXNzPVwiY2xhc3NpZi1kZXRhaWxcIj4gPHVsIGNsYXNzPVwibW9yZS1saXN0IGNsZWFyZml4XCI+ICc7XG4kZWFjaCgkdmFsdWUuY2hpbGQsZnVuY3Rpb24oJHZhbHVlLCRpbmRleCl7XG4kb3V0Kz0nIDxsaSBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9saT4gJztcbn0pO1xuJG91dCs9JyA8L3VsPiA8L2Rpdj4gPC9saT4gJztcbn0pO1xucmV0dXJuIG5ldyBTdHJpbmcoJG91dCk7XG59KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2RlcC9oZWFkZXItbmF2L3RwbC90eXBlLWxpc3QudHBsXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL2hvdC1saXN0JyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8bGkgZGF0YS1pZD1cIic7XG4kb3V0Kz0kZXNjYXBlKCR2YWx1ZS5pZCk7XG4kb3V0Kz0nXCI+JztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLm5hbWUpO1xuJG91dCs9JzwvbGk+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvaG90LWxpc3QudHBsXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL21vcmUtZmVuJyxmdW5jdGlvbigkZGF0YSwkZmlsZW5hbWVcbi8qKi8pIHtcbid1c2Ugc3RyaWN0Jzt2YXIgJHV0aWxzPXRoaXMsJGhlbHBlcnM9JHV0aWxzLiRoZWxwZXJzLCRlYWNoPSR1dGlscy4kZWFjaCwkdmFsdWU9JGRhdGEuJHZhbHVlLCRpbmRleD0kZGF0YS4kaW5kZXgsJGVzY2FwZT0kdXRpbHMuJGVzY2FwZSwkb3V0PScnOyRlYWNoKCRkYXRhLGZ1bmN0aW9uKCR2YWx1ZSwkaW5kZXgpe1xuJG91dCs9JyA8dWwgY2xhc3M9XCJtb3JlLWxpc3QgY2xlYXJmaXhcIiBkYXRhLWlkPVwiJztcbiRvdXQrPSRlc2NhcGUoJHZhbHVlLmlkKTtcbiRvdXQrPSdcIj4gPGRpdiBjbGFzcz1cIm1vcmUtdGl0bGVcIj4nO1xuJG91dCs9JGVzY2FwZSgkdmFsdWUubmFtZSk7XG4kb3V0Kz0nPC9kaXY+IDwvdWw+ICc7XG59KTtcbnJldHVybiBuZXcgU3RyaW5nKCRvdXQpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvbW9yZS1mZW4udHBsXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSAzIDQgMTAgMTEiLCJ2YXIgdGVtcGxhdGU9cmVxdWlyZSgndG1vZGpzLWxvYWRlci9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cz10ZW1wbGF0ZSgnZGVwL2hlYWRlci1uYXYvdHBsL2ludGVncmFsLWJvdHRvbScsJzxkaXYgY2xhc3M9XCJyZXR1cm4tdG9wXCI+PC9kaXY+IDxkaXYgY2xhc3M9XCJib3R0b21Db24gY2xlYXJmaXhcIj4gPHVsIGNsYXNzPVwiZm9vdC1uYXYgZ291d3UgZmwgY2xlYXJmaXhcIj4gPGRpdj7otK3nianmjIfljZc8L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPui0reeJqea1geeoizwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuS8muWRmOS7i+e7jTwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWboui0rS/mnLrnpag8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7luLjop4Hpl67popg8L2E+IDwvbGk+IDxsaT4gPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIj7ogZTns7vlrqLmnI08L2E+IDwvbGk+IDwvdWw+IDx1bCBjbGFzcz1cImZvb3QtbmF2IHBlaXNvbmcgZmwgY2xlYXJmaXhcIj4gPGRpdj7phY3pgIHmlrnlvI88L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuS4iumXqOiHquaPkDwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPjIxMemZkOaXtui+vjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumFjemAgeacjeWKoeafpeivojwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumFjemAgei0ueaUtuWPluagh+WHhjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPua1t+WklumFjemAgTwvYT4gPC9saT4gPC91bD4gPHVsIGNsYXNzPVwiZm9vdC1uYXYgemhpZnUgZmwgY2xlYXJmaXhcIj4gPGRpdj7mlK/ku5jmlrnlvI88L2Rpdj4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPui0p+WIsOS7mOasvjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWcqOe6v+aUr+S7mDwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWIhuacn+S7mOasvjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumCruWxgOaxh+asvjwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWFrOWPuOi9rOi0pjwvYT4gPC9saT4gPC91bD4gPHVsIGNsYXNzPVwiZm9vdC1uYXYgc2hvdWhvdSBmbCBjbGVhcmZpeFwiPiA8ZGl2PuWUruWQjuacjeWKoTwvZGl2PiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+5ZSu5ZCO5pS/562WPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+5Lu35qC85L+d5oqkPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+6YCA5qy+6K+05piOPC9hPiA8L2xpPiA8bGk+IDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+6L+U5L+uL+mAgOaNoui0pzwvYT4gPC9saT4gPGxpPiA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuWPlua2iOiuouWNlTwvYT4gPC9saT4gPC91bD4gPC9kaXY+Jyk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9kZXAvaGVhZGVyLW5hdi90cGwvaW50ZWdyYWwtYm90dG9tLnRwbFxuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEgMyA0IDEwIDExIiwiXHJcbnZhciBhamF4ID0gcmVxdWlyZSgndXRpbC9hamF4Jyk7XHJcbnZhciBoZWFkZXIgPSByZXF1aXJlKCdoZWFkZXItbmF2L2hlYWRlcicpO1xyXG52YXIgbWVzc2FnZSA9IHJlcXVpcmUoJ3V0aWwvbWVzc2FnZScpO1xyXG5cclxudmFyIGludGVncmFsID0ge1xyXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aGVhZGVyLmluaXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0JCgnLnRvcC1zaXRlLC5hbGwtbmF2LC5hbGwtbGlzdCwuc2VhcmNoJykucmVtb3ZlKCk7XHJcblx0XHRcdHZhciB3ZWxjb21lSHRtbCA9IFwiPGRpdiBjbGFzcz0nd2VsY29tZUxvZ2luIGZsJz7mrKLov47ms6jlhow8L2Rpdj48ZGl2IGNsYXNzPSdhbHJlYWR5IGZyJz7lt7LmnInotKblj7fvvJ88c3Bhbj7or7fnmbvlvZU8L3NwYW4+PC9kaXY+XCI7XHJcblx0ICAgICAgICAkKCcudG9wLWxvZ28nKS5hcHBlbmQod2VsY29tZUh0bWwpO1xyXG5cdCAgICAgICAgbWUubG9naW5nQnRuKCk7XHJcblx0ICAgICAgICBtZS5jbGlja0V2ZW4oKTtcclxuXHRcdH0pO1xyXG5cdH0sXHJcblx0bG9naW5nQnRuOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdCQoJy53cmFwIC5sb2dpbi1idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRpZigkKCcudXNlci1uYW1lJykudmFsKCkgPT0gJycpe1xyXG5cdFx0XHRcdCQoJy5sb2dpbi1kZXRhaWwgLnVzZXJuYW1lJykuc2hvdygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJy5sb2dpbi1kZXRhaWwgLnVzZXJuYW1lJykuaGlkZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCQoJy51c2VyLXBhc3MnKS52YWwoKSA9PSAnJykge1xyXG5cdFx0XHRcdCQoJy5sb2dpbi1kZXRhaWwgLnVzZXJwYXNzJykuc2hvdygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJy5sb2dpbi1kZXRhaWwgLnVzZXJwYXNzJykuaGlkZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCQoJy51c2VyLXBob25lJykudmFsKCkgPT0gJycpIHtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VyUGhvbmUnKS5zaG93KCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0JCgnLmxvZ2luLWRldGFpbCAudXNlclBob25lJykuaGlkZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCQoJy51c2VyLXBhc3MnKS52YWwoKSAhPSAkKCcudXNlcl9wYXNzJykudmFsKCkpIHtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VyUGFzcycpLnNob3coKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQkKCcubG9naW4tZGV0YWlsIC51c2VyUGFzcycpLmhpZGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZigkKCcudXNlci1uYW1lJykudmFsKCkgIT0gJycgJiYgJCgnLnVzZXItcGFzcycpLnZhbCgpICE9ICcnICYmICQoJy51c2VyLXBob25lJykudmFsKCkgIT0gJycgJiYgJCgnLnVzZXItcGFzcycpLnZhbCgpID09ICQoJy51c2VyX3Bhc3MnKS52YWwoKSl7XHJcblx0XHRcdFx0YWpheCh7XHJcblx0XHQgICAgICAgICAgICB1cmw6ICcvZXNob3AvYWNjb3VudC9yZWdpc3QnLFxyXG5cdFx0ICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxyXG5cdFx0ICAgICAgICAgICAgZGF0YTp7XHJcblx0XHQgICAgICAgICAgICAgICAgbG9naW5OYW1lOiAkKCcudXNlci1uYW1lJykudmFsKCksXHJcblx0XHQgICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICQoJy51c2VyLXBhc3MnKS52YWwoKSxcclxuXHRcdCAgICAgICAgICAgICAgICBtb2JpbGU6ICQoJy51c2VyLXBob25lJykudmFsKClcclxuXHRcdCAgICAgICAgICAgIH1cclxuXHRcdCAgICAgICAgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcclxuXHRcdCAgICAgICAgICAgIGlmKGRhdGEuc3RhdHVzID09IDIwMCl7XHJcblx0XHQgICAgICAgICAgICBcdG1lc3NhZ2UucG9wTWVzcygnYm9keScsJ+a3u+WKoOaIkOWKnycpO1xyXG5cdFx0ICAgICAgICAgICAgXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblx0XHQgICAgICAgICAgICBcdFx0bG9jYXRpb24uaHJlZiA9ICcuLi9pbnRlZ3JhbC1iYXNlL2xvZ2luLmh0bWwnO1xyXG5cdFx0ICAgICAgICAgICAgXHR9LDIwMDApO1xyXG5cdFx0ICAgICAgICAgICAgfSBlbHNlIHtcclxuXHRcdCAgICAgICAgICAgIFx0YWxlcnQoZGF0YS5tZXNzYWdlKTtcclxuXHRcdCAgICAgICAgICAgIH1cclxuXHRcdCAgICAgICAgfSk7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fSxcclxuXHRjbGlja0V2ZW46IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0JCgnLmFscmVhZHkgc3BhbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdGxvY2F0aW9uLmhyZWYgPSAnLi4vaW50ZWdyYWwtYmFzZS9sb2dpbi5odG1sJztcclxuXHRcdH0pXHJcblx0fVxyXG59XHJcblxyXG5pbnRlZ3JhbC5pbml0KClcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy9tYWluL3JlZ2lzdGVyLmpzXG4vLyBtb2R1bGUgaWQgPSA3MVxuLy8gbW9kdWxlIGNodW5rcyA9IDExIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgTGFueHVtaXQgb24gMjAxNi81LzI3LlxyXG4gKi9cclxudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcclxuXHJcbi8vcG9wIGFkZCBwaWMgc3VjY2Vzc1xyXG5cclxudmFyIF9jYWxsYmFjayA9IG51bGwsIF9lbGUgPSBudWxsLF9tZXMgPSBudWxsO1xyXG52YXIgbWVzc2FnZSA9IHtcclxuICAgIHN0eWxlOiB7XHJcbiAgICAgICAgb3BhY2l0eToxLFxyXG4gICAgICAgIHRvcDpcIjIwcHhcIixcclxuICAgICAgICB3aWR0aDpcIjI1MHB4XCIsXHJcbiAgICAgICAgaGVpZ2h0OlwiMzBweFwiLFxyXG4gICAgICAgIG1hcmdpbkxlZnQ6XCItMTI1cHhcIlxyXG4gICAgfSxcclxuICAgIHNwZWVkOjUwMCxcclxuICAgIGluaXQ6ZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYWRkUG9wKCk7XHJcbiAgICAgICAgdGhpcy5wb3BNZXNzKCk7XHJcbiAgICB9LFxyXG4gICAgYW5fY2FsbGJhY2s6ZnVuY3Rpb24oY2FsbCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIC8vJCgnLnBvcC1tZXNzYWdlJykuZmFkZU91dCgpO1xyXG4gICAgICAgICAgICAkKFwiLnBvcC1tZXNzYWdlXCIpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZihjYWxsKXtcclxuICAgICAgICAgICAgICAgIGNhbGwoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LDIwMDApO1xyXG4gICAgfSxcclxuICAgIHBvcE1lc3M6ZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgICAgICQoJy5wb3AtbWVzc2FnZScpLmFuaW1hdGUobWUuc3R5bGUsbWUuc3BlZWQsZnVuY3Rpb24oKXttZS5hbl9jYWxsYmFjayhfY2FsbGJhY2spfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkUG9wOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcztcclxuICAgICAgICB2YXIgaHRtbCA9JzxkaXYgY2xhc3M9XCJwb3AtbWVzc2FnZVwiPicrX21lcysnPC9kaXY+JztcclxuICAgICAgICAkKF9lbGUpLmNzcygncG9zaXRpb24nLCdyZWxhdGl2ZScpLmFwcGVuZChodG1sKTtcclxuICAgICAgICBpZihfZWxlID09J2JvZHknfHxfZWxlPT0nJyl7XHJcbiAgICAgICAgICAgICQoJy5wb3AtbWVzc2FnZScpLmNzcyh7XCJwb3NpdGlvblwiOlwiZml4ZWRcIixcInRvcFwiOlwiMjMwcHhcIn0pO1xyXG4gICAgICAgICAgICBtZS5zdHlsZS50b3AgPSBcIjI1MHB4XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTtcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvKipcclxuICAgICAqIGVsZTpwYXJlbnTnm5LlrZBcclxuICAgICAqIG1lczropoHlvLnlh7rnmoTmtojmga9cclxuICAgICAqIGNhbGxiYWNrOuWbnuiwg+WHveaVsFxyXG4gICAgICog6K+05piO77ya5Y+C5pWw5Y+v5YWo6YOo55yB55Wl77yM5oiW6ICF55u05o6l5YaZ5Zue6LCDXHJcbiAgICAgKiAqL1xyXG4gICBwb3BNZXNzOmZ1bmN0aW9uKGVsZSxtZXMsY2FsbGJhY2spe1xyXG4gICAgICAgIGlmKHR5cGVvZihlbGUpID09PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICAgICAgX2NhbGxiYWNrID0gZWxlO1xyXG4gICAgICAgICAgICBfZWxlID0gJ2JvZHknO1xyXG4gICAgICAgICAgICBfbWVzPSAn5re75Yqg5oiQ5YqfJztcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgaWYodHlwZW9mKG1lcykgPT09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgICAgICAgICAgX2NhbGxiYWNrID0gbWVzO1xyXG4gICAgICAgICAgICAgICAgX2VsZSA9IGVsZTtcclxuICAgICAgICAgICAgICAgIF9tZXM9J+a3u+WKoOaIkOWKnyc7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgX2VsZSA9IGVsZXx8J2JvZHknO1xyXG4gICAgICAgICAgICAgICAgX21lcz0gbWVzfHwgJ+a3u+WKoOaIkOWKnyc7XHJcbiAgICAgICAgICAgICAgICBfY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBudWxsIDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgIG1lc3NhZ2UuaW5pdCgpO1xyXG4gICB9XHJcbn07XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vZGVwL3V0aWwvbWVzc2FnZS5qc1xuLy8gbW9kdWxlIGlkID0gNzJcbi8vIG1vZHVsZSBjaHVua3MgPSAxMSJdLCJzb3VyY2VSb290IjoiIn0=