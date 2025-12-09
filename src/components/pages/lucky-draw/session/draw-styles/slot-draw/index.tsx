import type { DrawProps } from "../type";
import { SlotDraw as CartoonSlotDraw } from "./cartoon";
import { SlotDraw as ColorfulSlotDraw } from "./colorful";
import { SlotDraw as WireframeSlotDraw } from "./wireframe";

export function SlotDraw(props: DrawProps & { theme?: "wireframe" | "colorful" | "cartoon" }) {
	const { theme = "wireframe", ...rest } = props;

	switch (theme) {
		case "colorful":
			return <ColorfulSlotDraw {...rest} />;
		case "cartoon":
			return <CartoonSlotDraw {...rest} />;
		case "wireframe":
		default:
			return <WireframeSlotDraw {...rest} />;
	}
}
