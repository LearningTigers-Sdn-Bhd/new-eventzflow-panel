import { beforeEach, expect, test } from "bun:test";

const values = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
	value: {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
		removeItem: (key: string) => values.delete(key),
	},
});
Object.defineProperty(globalThis, "window", { value: globalThis });

const { useExhibitorCart } = await import("./exhibitor-cart-store");

beforeEach(() => {
	values.clear();
	useExhibitorCart.setState({
		eventId: null,
		kitId: null,
		items: [],
		printings: [],
		carts: {},
	});
});

test("restores separate carts when switching kit scope", () => {
	const cart = useExhibitorCart.getState();
	cart.setScope(10, 101);
	useExhibitorCart.getState().addItem({
		rentableItemId: 1,
		name: "Chair",
		unitOfMeasure: "unit",
		agreedPrice: 20,
		quantity: 2,
	});

	useExhibitorCart.getState().setScope(10, 202);
	expect(useExhibitorCart.getState().items).toEqual([]);
	useExhibitorCart.getState().addItem({
		rentableItemId: 2,
		name: "Table",
		unitOfMeasure: "unit",
		agreedPrice: 50,
		quantity: 1,
	});

	useExhibitorCart.getState().setScope(10, 101);
	expect(useExhibitorCart.getState().items).toEqual([
		expect.objectContaining({ rentableItemId: 1, quantity: 2 }),
	]);
	useExhibitorCart.getState().setScope(10, 202);
	expect(useExhibitorCart.getState().items).toEqual([
		expect.objectContaining({ rentableItemId: 2, quantity: 1 }),
	]);
});

test("clearCart clears only active kit cart", () => {
	useExhibitorCart.getState().setScope(10, 101);
	useExhibitorCart.getState().addItem({
		rentableItemId: 1,
		name: "Chair",
		unitOfMeasure: "unit",
		agreedPrice: 20,
		quantity: 1,
	});
	useExhibitorCart.getState().setScope(10, 202);
	useExhibitorCart.getState().addItem({
		rentableItemId: 2,
		name: "Table",
		unitOfMeasure: "unit",
		agreedPrice: 50,
		quantity: 1,
	});

	useExhibitorCart.getState().clearCart();
	useExhibitorCart.getState().setScope(10, 101);
	expect(useExhibitorCart.getState().items).toHaveLength(1);
	useExhibitorCart.getState().setScope(10, 202);
	expect(useExhibitorCart.getState().items).toEqual([]);
});
