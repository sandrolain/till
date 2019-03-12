

const listFromArgs = (args) =>
{
	return (args[0] instanceof Array) ? Array.from(args[0]) : Array.from(args);
};


export const promise = (fn) => new Promise(fn);


export const ok = (value) => Promise.resolve(value);


export const ko = (err) => Promise.reject((err instanceof Error) ? err : new Error(err.toString()));


export const all = function()
{
	return Promise.all(listFromArgs(arguments))
};


export const to = (promise) =>
	promise.then((data) => { return {success: true, payload: data}; })
	.catch((err) => { return {success: false, error: err}; });


export const toPromise = (fn) => to(new Promise(fn));


export const allPromises = function()
{
	return Promise.all(listFromArgs(arguments).map(promise));
};


export const toAll = function()
{
	return to(all.apply(null, arguments));
}


export const chain = function()
{
	var list = listFromArgs(arguments),
		p = new Promise(list.shift());

	for(let fn of list)
	{
		p = p.then(fn);
	}

	return p;
};


export const toChain = function()
{
	return to(chain.apply(null, arguments));
};


export const every = function()
{
	const list = listFromArgs(arguments).map(
		(p) => p.then((res) => { return {success: true, payload: res}})
		.catch((e) => { return {success: false, error: e}})
	);

	return all(list);
}
