import {
	promise,
	ok,
	ko,
	all,
	to,
	toPromise,
	allPromises,
	toAll,
	chain,
	toChain,
	every
} from "./index.js";
import test from "ava";



test("promise", async (t) =>
{
	const val = await promise((resolve) =>
	{
		resolve("test01");
	});

	t.is(val, "test01");
});


test("ok", async (t) =>
{
	const res = await ok("OK!");

	t.is(res, "OK!");
});

test("ko", async (t) =>
{
	try
	{
		const res = await ko("ERR");
	}
	catch(e)
	{

		t.deepEqual(e, new Error("ERR"));
	}
});

test("all", async (t) =>
{
	const res = await all([
		Promise.resolve("test05-A"),
		Promise.resolve("test05-B"),
		Promise.resolve("test05-C")
	]);

	t.deepEqual(res, ["test05-A", "test05-B", "test05-C"]);
});

test("to", async (t) =>
{
	const res = await to(Promise.resolve("test02"));

	t.deepEqual(res, {success: true, payload: "test02"});
});

test("toPromise", async (t) =>
{
	const res = await toPromise((resolve) =>
	{
		resolve("test03");
	});

	t.deepEqual(res, {success: true, payload: "test03"});
});

test("allPromises", async (t) =>
{
	const res = await allPromises((resolve) =>
	{
		resolve("test04-A");
	}, (resolve) =>
	{
		resolve("test04-B");
	}, (resolve) =>
	{
		resolve("test04-C");
	});

	t.deepEqual(res, ["test04-A", "test04-B", "test04-C"]);
});

test("toAll", async (t) =>
{
	const res = await toAll([
		Promise.resolve("test06-A"),
		Promise.resolve("test06-B"),
		Promise.resolve("test06-C")
	]);

	t.deepEqual(res, {success: true, payload: ["test06-A", "test06-B", "test06-C"]});
});

test("chain", async (t) =>
{
	const res = await chain(
		(resolve) =>
		{
			resolve(2);
		},
		(value) => value + 1,
		(value) => value * 5,
		(value) => value + 2
	);

	t.is(res, 17);
});


test("toChain", async (t) =>
{
	const res = await toChain(
		(resolve) =>
		{
			resolve(2);
		},
		(value) => value + 1,
		(value) => value * 5,
		(value) => value + 2
	);

	t.deepEqual(res, {success: true, payload: 17});
});


test("every", async (t) =>
{
	const res = await every([
		Promise.resolve("everyOK"),
		Promise.reject("everyBad"),
		Promise.resolve("everyOK"),
		Promise.reject("everyBad")
	]);

	t.deepEqual(res, [
		{success: true, payload: "everyOK"},
		{success: false, error: "everyBad"},
		{success: true, payload: "everyOK"},
		{success: false, error: "everyBad"},
	]);
});

