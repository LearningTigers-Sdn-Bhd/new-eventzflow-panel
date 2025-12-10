import type { DrawProps } from "../type";
import SpinWheelCartoon from "./cartoon";
import SpinWheelColorful from "./colorful";
import SpinWheelWireframe from "./wireframe";

export default function SpinWheel(props: DrawProps & { theme?: "wireframe" | "colorful" | "cartoon" }) {
	const { theme = "wireframe", ...rest } = props;

	switch (theme) {
		case "colorful":
			return <SpinWheelColorful {...rest} />;
		case "cartoon":
			return <SpinWheelCartoon {...rest} />;
		case "wireframe":
		default:
			return <SpinWheelWireframe {...rest} />;
	}
}
