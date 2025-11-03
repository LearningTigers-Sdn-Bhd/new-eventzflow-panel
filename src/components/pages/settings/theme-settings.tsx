"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ThemeSettings() {
	const { theme, setTheme } = useTheme();

	const themes = [
		{
			name: "Light",
			value: "light",
			icon: Sun,
			description: "Light mode for daytime use",
		},
		{
			name: "Dark",
			value: "dark",
			icon: Moon,
			description: "Dark mode for nighttime use",
		},
		{
			name: "System",
			value: "system",
			icon: Monitor,
			description: "Follows your system preference",
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-3">
				{themes.map((themeOption) => {
					const Icon = themeOption.icon;
					const isSelected = theme === themeOption.value;

					return (
						<Button
							key={themeOption.value}
							variant={isSelected ? "default" : "outline"}
							className="h-auto flex-col gap-2 rounded-none p-4"
							onClick={() => setTheme(themeOption.value)}
						>
							<Icon className="h-6 w-6" />
							<div className="text-center">
								<div className="font-medium">{themeOption.name}</div>
								<div className="text-xs">{themeOption.description}</div>
							</div>
						</Button>
					);
				})}
			</div>

			<div className="rounded-none border p-4">
				<div className="flex items-center justify-between">
					<div>
						<Label className="font-medium text-sm">Current Theme</Label>
						<p className="text-muted-foreground text-sm">
							{themes.find((t) => t.value === theme)?.name || "System"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{theme === "light" && <Sun className="h-4 w-4" />}
						{theme === "dark" && <Moon className="h-4 w-4" />}
						{theme === "system" && <Monitor className="h-4 w-4" />}
					</div>
				</div>
			</div>
		</div>
	);
}
