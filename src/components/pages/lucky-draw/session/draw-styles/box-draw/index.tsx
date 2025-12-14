import type { DrawProps } from "../type";
import { BoxDraw as CartoonBoxDraw } from "./cartoon";
import { BoxDraw as ColorfulBoxDraw } from "./colorful";
import { BoxDraw as WireframeBoxDraw } from "./wireframe";

export function BoxDraw(
	props: DrawProps & { theme?: "wireframe" | "colorful" | "cartoon" },
) {
	const { theme = "wireframe", ...rest } = props;

	switch (theme) {
		case "colorful":
			return <ColorfulBoxDraw {...rest} />;
		case "cartoon":
			return <CartoonBoxDraw {...rest} />;
		case "wireframe":
		default:
			return <WireframeBoxDraw {...rest} />;
	}
}
