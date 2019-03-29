/*--

@type:		document
@title:		till.mjs Documentation

## ES6 Promise Utility Library

Small library with a collection of utilities designed to facilitate the use of the ES6 Promise, especially with the await operator.

<a class="github-button" href="https://github.com/sandrolain/till" data-size="large" aria-label="Star sandrolain/till on GitHub">View on GitHub</a>
<script async defer src="https://buttons.github.io/buttons.js"></script>



--*/



const listFromArgs = (args) =>
{
	return (args[0] instanceof Array) ? Array.from(args[0]) : Array.from(args);
};

const promisesFromArgs = (args) =>
{
	return listFromArgs(args).map(promise);
};



/*--

@title:		`promise(executor)`
@param: 	executor Function/Promise/mixed The Promise, or the executor function, or the value of resolved promise
@return:	Promise Original Promise, or initialized Promise, or resolved Promise

Shorcut for Promise initialization.

```javascript

import {promise} from "./till.mjs";

const result = await promise((ok, ko) =>
{
	ok("Resolved!");
});

console.log(result);
// "Resolved!"

```
--*/

export const promise = (p) =>
{
	if(p instanceof Promise)
	{
		return p;
	}

	if(typeof p == "function")
	{
		return new Promise(p);
	}

	return Promise.resolve(p);
};


/*--

@title: `ok(value)`
@param: value mixed The resolved result of the Promise
@return Promise Resolved promise

Shortcut for **Promise.resolve**.

```javascript

import {ok} from "./till.mjs";

const result = await ok("Resolved!");

console.log(result);
// "Resolved!"

```
--*/

export const ok = (value) => Promise.resolve(value);


/*--

@title: `ko(error)`
@param: value Error/string The Error instance or error description string for the rejected Promise
@return Promise Rejected promise

Shortcut for **Promise.reject**.

```javascript

import {ko} "./till.mjs";

const result = await ko("Something went wrong");

// Error("Something went wrong")

```
--*/

export const ko = (err) => Promise.reject((err instanceof Error) ? err : new Error(err.toString()));


/*--

@title: `all(fn, [fn, ...])`
@param: fn Function/Promise/Array The first executor function or Promise to resolve.\nThe list of executors or Promises to be solved can be passed as individual arguments or as an Array in the first argument.
@param: [fn,...] Function/Promise Additional executor functions or Promises
@return: Promise Result of all Promises or Rejection

Shortcut for **Promise.all**, with the ability to pass the promises as single arguments.

```javascript

import {all, ok} "./till.mjs";

const result = await all(
	ok("Result #1"),
	ok("Result #2"),
	ok("Result #3")
);

console.log(result);
// ["Result #1", "Result #2", "Result #3"]

```
--*/

export const all = function()
{
	return Promise.all(promisesFromArgs(arguments));
};



/*--

@title:		`race(fn, [fn, ...])`
@param:		fn Function/Promise/Array The first executor function or Promise to resolve.\nThe list of executors or Promises to be solved can be passed as individual arguments or as an Array in the first argument.
@param:		[fn,...] Function/Promise Additional executor functions or Promises
@return:	Promise The first resolved Promise

Shortcut for **Promise.race**, with the ability to pass the promises as single arguments.

```javascript

import {race, ok} "./till.mjs";

const result = await race(
	(resolve) => { setTimeout(() => { resolve("One"); }, 600); },
	(resolve) => { setTimeout(() => { resolve("Two"); }, 200); },
	(resolve) => { setTimeout(() => { resolve("Three"); }, 400); },
);

console.log(result);
// "Two"

```
--*/

export const race = function()
{
	return Promise.race(promisesFromArgs(arguments));
};


/*--

@title: 	`to(promise)`
@param:		promise Promise The Promise to manage
@return:	Promise Promise with managed result object

Function that allows the safe use of await without the need for a try / catch. In case of rejection the error is captured and returned.
The structure of the result of the function is an object with two properties: "success" true / false and depending on the case "payload" or "error" evaluated.

```javascript

import {to, ok, ko} "./till.mjs";


const result1 = await to(
	ok("Resolved!")
);

console.log(result1);
// {"success": true, "payload": "Resolved!"}


const result2 = await to(
	ko("Something went wrong")
);

console.log(result2);
// {"success": false, "error": Error("Something went wrong")}

```
--*/

export const to = (fn) =>
{
	return promise(fn)
		.then((data) =>
		{
			return {
				success: true,
				payload: data
			};
		})
		.catch((err) =>
		{
			return {
				success: false,
				error: err
			};
		});
};


/*--

@title:		`chain(fn, [fn, ...])`
@param:		fn Function/Promise/mixed The Promise, or the executor function for the Promise, or value for the resolved promise
@param:		[fn,...] Function Sequence of functions to pass as chain of then() method calls
@return:	Promise Result Promise of the chain calls

Function that allows you to execute a promise followed by a sequence of transformations of the returned value through a chain of calls to the then() method.

```javascript

import {chain} "./till.mjs";

const result = await chain(
	(ok, ko) =>
	{
		ok(2);
	},
	(value) =>
	{
		return value * 2;
	},
	(value) =>
	{
		return value + 3;
	}
);

console.log(result);
// 7

```
--*/

export const chain = function()
{
	var list = listFromArgs(arguments),
		p = promise(list.shift());

	for(let fn of list)
	{
		p = p.then(fn);
	}

	return p;
};



/*--

@title:		`every(fn, [fn, ...])`
@param:		fn Function/Promise/Array The first executor function or Promise to resolve.\nThe list of executors or Promises to be solved can be passed as individual arguments or as an Array in the first argument.
@param:		[fn,...] Function/Promise Additional executor functions or Promises
@return:	Promise Result of all Promises

Similar to the "all" function but with the "to" function applied to each element.
This allows to obtain the result of each Promise, both in case of resolution and rejection.

```javascript

import {every, ok, ko} "./till.mjs";

const result = await every(
	ok("Result #1"),
	ko("Error #2"),
	ok("Result #3")
);

console.log(result);
// [{"success": true, "payload": "Result #1"},
//	{"success": false, "error": Error("Error #2")},
//	{"success": true, "payload": "Result #3"}]

```
--*/

export const every = function()
{
	return all(promisesFromArgs(arguments).map(p => to(p)));
};



/*--

@title:		`sleep(ms [, data])`
@param:		ms Number The time to wait before Promise resolution, in milliseconds
@param:		data mixed Optional. Promise, or executor function, or data value to pass to sleep() resolution after waiting time expires
@return:	Promise Result passed data

This function in conjunction with the use of await allows pausing the execution of the current context.
Without the use of await it allows you to perform a Promise with delay.

```javascript

import {sleep} "./till.mjs";

const result = await sleep(3000, "wake up!");

console.log(result);
// "wake up!"

```
--*/

export const sleep = (ms, data = null) =>
{
	return new Promise((resolve) =>
	{
		setTimeout(() =>
		{
			resolve(promise(data));
		}, ms);
	});
};




/*--

@title:		`retry(retries, executor)`
@param:		retries Number The maximum number of attempts to retry to execute the Promise
@param:		executor Function The executor function with the addition of two arguments, the attempt index and the total number of attempts
@return:	Promise Result Promise

This function allows you to execute the call to Promise several times in the case of re-rejection, until there is a resolution or the attempts are exhausted.

```javascript

import {retry} "./till.mjs";

const result = await retry(3, (resolve, reject, i, n) =>
{
	if(i == n)
	{
		resolve("At the last attempt");
	}
	else
	{
		reject(new Error("Failed attempt"));
	}
});

console.log(result);
// "At the last attempt"

```
--*/

export const retry = async (retries, fn) =>
{
	var res,
		ok = false,
		errors = [],
		index = 0;

	do
	{
		try
		{
			res = await new Promise(function(resolve, reject)
			{
				return fn.call(this, resolve, reject, index, retries);
			});

			ok	= true;
		}
		catch(e)
		{
			errors.push(e);
		}
	}
	while(!ok && index++ < retries);

	if(!ok)
	{
		throw errors[errors.length - 1];
	}

	return res;
};
