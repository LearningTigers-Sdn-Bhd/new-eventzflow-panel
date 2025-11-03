"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement password change logic
		console.log("Password change form submitted");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col justify-between space-y-4 md:min-h-[320px]"
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="currentPassword">Current Password</Label>
					<div className="relative">
						<Input
							id="currentPassword"
							type={showCurrentPassword ? "text" : "password"}
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="Enter your current password"
							className="rounded-none"
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowCurrentPassword(!showCurrentPassword)}
						>
							{showCurrentPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="newPassword">New Password</Label>
					<div className="relative">
						<Input
							id="newPassword"
							type={showNewPassword ? "text" : "password"}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Enter your new password"
							className="rounded-none"
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowNewPassword(!showNewPassword)}
						>
							{showNewPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm New Password</Label>
					<div className="relative">
						<Input
							id="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm your new password"
							className="rounded-none"
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							{showConfirmPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>
			<div className="flex justify-end">
				<Button type="submit" className="min-w-[120px] rounded-none">
					Change Password
				</Button>
			</div>
		</form>
	);
}
