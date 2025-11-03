"use client";

import { Cog, Lock, Sun, User } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { AccountInfoForm } from "./account-info-form";
import { PasswordForm } from "./password-form";
import { ThemeSettings } from "./theme-settings";

export function SettingsPage() {
	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="page-header border-y border-dashed">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Cog}
						title="Settings"
						description="Manage your account settings and preferences"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-2 border-y border-dashed bg-accent p-2 md:grid-cols-2 md:p-4">
				{/* Account Information */}
				<Card className="rounded-none border-primary/20 px-0 shadow-none">
					<CardHeader className="flex items-center gap-4 px-2 md:px-4">
						<div className="flex items-center gap-2 rounded-none border bg-muted p-2">
							<User className="size-5" />
						</div>
						<div className="flex flex-col gap-2">
							<CardTitle>Account Information</CardTitle>
							<CardDescription>
								Update your personal information and contact details.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="px-2 md:px-4">
						<AccountInfoForm />
					</CardContent>
				</Card>

				{/* Account Credentials */}
				<Card className="rounded-none border-primary/20 px-0 shadow-none">
					<CardHeader className="flex items-center gap-4 px-2 md:px-4">
						<div className="flex items-center gap-2 rounded-none border bg-muted p-2">
							<Lock className="size-5" />
						</div>
						<div className="flex flex-col gap-2">
							<CardTitle>Account Credentials</CardTitle>
							<CardDescription>
								Change your password to keep your account secure.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="px-2 md:px-4">
						<PasswordForm />
					</CardContent>
				</Card>
				{/* Theme Settings */}
				<Card className="rounded-none border-primary/20 px-0 shadow-none md:col-span-2">
					<CardHeader className="flex items-center gap-4 px-2 md:px-4">
						<div className="flex items-center gap-2 rounded-none border bg-muted p-2">
							<Sun className="size-5" />
						</div>
						<div className="flex flex-col gap-2">
							<CardTitle>Theme</CardTitle>
							<CardDescription>
								Choose how the interface looks and feels.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="px-2 md:px-4">
						<ThemeSettings />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
