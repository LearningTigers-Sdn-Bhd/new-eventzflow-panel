"use client";

import { Lock, Sun, User } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccountInfoForm } from "./account-info-form";
import { PasswordForm } from "./password-form";
import { ThemeSettings } from "./theme-settings";

export function SettingsPage() {
	return (
		<div className="space-y-6 p-2">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</div>

			<Separator />

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Account Information */}
				<Card>
					<CardHeader className="flex items-center gap-4">
						<div className="flex items-center gap-2 p-2 bg-muted rounded-md border">
							<User className="size-5" />
						</div>
						<div className="flex flex-col gap-2">
							<CardTitle>Account Information</CardTitle>
							<CardDescription>
								Update your personal information and contact details.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<AccountInfoForm />
					</CardContent>
				</Card>

				{/* Account Credentials */}
				<Card>
					<CardHeader className="flex items-center gap-4">
						<div className="flex items-center gap-2 p-2 bg-muted rounded-md border">
							<Lock className="size-5" />
						</div>
						<div className="flex flex-col gap-2">
							<CardTitle>Account Credentials</CardTitle>
							<CardDescription>
								Change your password to keep your account secure.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<PasswordForm />
					</CardContent>
				</Card>
			</div>

			{/* Theme Settings */}
			<Card>
				<CardHeader className="flex items-center gap-4">
					<div className="flex items-center gap-2 p-2 bg-muted rounded-md border">
						<Sun className="size-5" />
					</div>
					<div className="flex flex-col gap-2">
						<CardTitle>Theme</CardTitle>
						<CardDescription>
							Choose how the interface looks and feels.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<ThemeSettings />
				</CardContent>
			</Card>
		</div>
	);
}
