import {
	promise,
	ok,
	ko,
	all,
	race,
	to,
	chain,
	every,
	sleep,
	retry
} from "./till.js";
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

		res;
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

test("race", async (t) =>
{
	const res = await race([
		(resolve) => { setTimeout(() => { resolve("One"); }, 600); },
		(resolve) => { setTimeout(() => { resolve("Two"); }, 400); },
		(resolve) => { setTimeout(() => { resolve("Three"); }, 200); },
	]);

	t.is(res, "Three");
});

test("to race", async (t) =>
{
	const res = await to(race([
		(resolve) => { setTimeout(() => { resolve("One"); }, 600); },
		(resolve) => { setTimeout(() => { resolve("Two"); }, 400); },
		(resolve) => { setTimeout(() => { resolve("Three"); }, 200); },
	]));

	t.deepEqual(res, {success: true, payload: "Three"});
});

test("to", async (t) =>
{
	const res = await to(Promise.resolve("test02"));

	t.deepEqual(res, {success: true, payload: "test02"});
});


test("to all", async (t) =>
{
	const res = await to(all([
		Promise.resolve("test06-A"),
		Promise.resolve("test06-B"),
		Promise.resolve("test06-C")
	]));

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


test("to chain", async (t) =>
{
	const res = await to(chain(
		(resolve) =>
		{
			resolve(2);
		},
		(value) => value + 1,
		(value) => value * 5,
		(value) => value + 2
	));

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

test("sleep", async (t) =>
{
	const val = await sleep(2000, "wake up!");

	t.is(val, "wake up!");
});

test("retry", async (t) =>
{
	const val = await retry(3, (resolve, reject, i, n) =>
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

	t.is(val, "At the last attempt");
});
