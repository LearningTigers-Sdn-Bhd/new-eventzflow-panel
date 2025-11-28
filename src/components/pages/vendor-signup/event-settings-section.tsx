"use client";

import { Globe, Image, Link as LinkIcon } from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

interface FieldApi {
	name: string;
	state: {
		value: string;
		meta: { errors: (string | undefined)[] };
	};
	handleBlur: () => void;
	handleChange: (value: string) => void;
}

interface EventSettingsSectionProps {
	redirectUrlField: FieldApi;
	posterUrlField: FieldApi;
}

export function EventSettingsSection({
	redirectUrlField,
	posterUrlField,
}: EventSettingsSectionProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 border-b pb-2">
				<Globe className="h-5 w-5 text-primary" />
				<h3 className="font-semibold text-lg">Event Settings</h3>
				<span className="text-muted-foreground text-sm">(Optional)</span>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={redirectUrlField.name}>Website / Redirect URL</Label>
					<InputGroup className="h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20">
						<InputGroupAddon className="bg-muted/30 text-muted-foreground">
							<LinkIcon className="h-4 w-4" />
						</InputGroupAddon>
						<InputGroupInput
							id={redirectUrlField.name}
							type="url"
							placeholder="https://your-website.com"
							value={redirectUrlField.state.value}
							onBlur={redirectUrlField.handleBlur}
							onChange={(e) => redirectUrlField.handleChange(e.target.value)}
						/>
					</InputGroup>
					<p className="text-muted-foreground text-xs">
						Visitors can be redirected to this URL when scanning your QR code
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor={posterUrlField.name}>Poster URL</Label>
					<InputGroup className="h-11 transition-all focus-within:ring-2 focus-within:ring-primary/20">
						<InputGroupAddon className="bg-muted/30 text-muted-foreground">
							<Image className="h-4 w-4" />
						</InputGroupAddon>
						<InputGroupInput
							id={posterUrlField.name}
							type="url"
							placeholder="https://example.com/poster.jpg"
							value={posterUrlField.state.value}
							onBlur={posterUrlField.handleBlur}
							onChange={(e) => posterUrlField.handleChange(e.target.value)}
						/>
					</InputGroup>
					<p className="text-muted-foreground text-xs">
						Link to your promotional poster or banner image
					</p>
				</div>
			</div>
		</div>
	);
}
