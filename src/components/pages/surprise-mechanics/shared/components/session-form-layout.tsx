"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { DrawStyle, DrawTheme } from "../types";
import {
	DrawStyleField,
	DrawStylePreviewWrapper,
	DrawThemeField,
} from "./form-fields/draw-style-fields";
import { EventDayField } from "./form-fields/event-day-field";
import {
	NumberOption,
	SelectOption,
	ToggleOption,
} from "./form-fields/option-fields";
import {
	DrawDateField,
	LogoField,
	TitleField,
} from "./form-fields/session-basic-fields";

/** A session setting beyond the common ones; rendered by type */
export interface SessionExtraField {
	type: "boolean" | "number" | "event-day" | "select";
	name: string;
	label: string;
	description: string;
	options?: { value: string; label: string }[];
	renderCondition?: (formValues: Record<string, unknown>) => boolean;
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form API requires any type
	onChangeCallback?: (checked: boolean, form: any) => void;
}

interface SessionFormLayoutProps {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form API requires any type
	form: any;
	fields: SessionExtraField[];
	isPending: boolean;
	description: string;
	titlePlaceholder?: string;
	drawType?: "gifts" | "prizes";
	submitLabel: string;
	onCancel: () => void;
}

function SectionCard({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<section className="space-y-4 rounded-none border bg-card p-5 shadow-xs">
			<div>
				<h3 className="font-semibold text-base">{title}</h3>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
			{children}
		</section>
	);
}

/**
 * Shared layout for the create and edit session dialogs
 * (lucky-draw and roulette). Rows of settings sit one per line; settings that
 * depend on another (scanned-only day range) group into a nested panel.
 */
export function SessionFormLayout({
	form,
	fields,
	isPending,
	description,
	titlePlaceholder,
	drawType,
	submitLabel,
	onCancel,
}: SessionFormLayoutProps) {
	const rows = fields.filter(
		(f) => f.type === "boolean" || f.type === "number",
	);
	const dependents = fields.filter(
		(f) => f.type === "event-day" || f.type === "select",
	);
	const firstToggle = rows.find((f) => f.type === "boolean");

	// A number setting follows the first toggle unless it says otherwise
	const isVisible = (
		field: SessionExtraField,
		values: Record<string, unknown>,
	) => {
		if (field.renderCondition) return field.renderCondition(values);
		if (field.type === "number" && firstToggle) {
			return values[firstToggle.name] === true;
		}
		return true;
	};

	const renderField = (field: SessionExtraField) => (
		<form.Subscribe
			key={field.name}
			selector={(state: { values: Record<string, unknown> }) =>
				isVisible(field, state.values)
			}
		>
			{(shouldShow: boolean) =>
				shouldShow ? (
					// biome-ignore lint/suspicious/noExplicitAny: FieldApi generic
					<form.Field name={field.name}>
						{(formField: any) => {
							const common = {
								field: formField,
								label: field.label,
								description: field.description,
								isPending,
							};
							if (field.type === "boolean") {
								return (
									<ToggleOption
										{...common}
										onChange={(checked) =>
											field.onChangeCallback?.(checked, form)
										}
									/>
								);
							}
							if (field.type === "number") return <NumberOption {...common} />;
							if (field.type === "select") {
								return (
									<SelectOption {...common} options={field.options ?? []} />
								);
							}
							return <EventDayField {...common} />;
						}}
					</form.Field>
				) : null
			}
		</form.Subscribe>
	);

	return (
		<form
			className="mx-auto w-full max-w-8xl px-8"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
				<div className="space-y-5">
					<SectionCard title="Session details" description={description}>
						<div className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)]">
							<form.Field name="logo">
								{/* biome-ignore lint/suspicious/noExplicitAny: FieldApi generic */}
								{(field: any) => (
									<LogoField field={field} isPending={isPending} />
								)}
							</form.Field>
							<div className="grid content-start gap-4 sm:grid-cols-2">
								<form.Field name="title">
									{/* biome-ignore lint/suspicious/noExplicitAny: FieldApi generic */}
									{(field: any) => (
										<TitleField
											field={field}
											isPending={isPending}
											placeholder={titlePlaceholder}
										/>
									)}
								</form.Field>
								<form.Field name="draw_date">
									{/* biome-ignore lint/suspicious/noExplicitAny: FieldApi generic */}
									{(field: any) => (
										<DrawDateField field={field} isPending={isPending} />
									)}
								</form.Field>
							</div>
						</div>
					</SectionCard>

					{fields.length > 0 && (
						<SectionCard
							title="Draw options"
							description="Who can win, and what they win."
						>
							<div className="space-y-3">
								{rows.map(renderField)}
								{dependents.length > 0 && (
									<form.Subscribe
										selector={(state: { values: Record<string, unknown> }) =>
											dependents.some((f) => isVisible(f, state.values))
										}
									>
										{(show: boolean) =>
											show ? (
												<div className="grid gap-4 rounded-none border bg-muted/40 p-4 sm:grid-cols-2">
													{dependents.map((f) => (
														<div
															key={f.name}
															className={
																f.type === "select" ? "sm:col-span-2" : ""
															}
														>
															{renderField(f)}
														</div>
													))}
												</div>
											) : null
										}
									</form.Subscribe>
								)}
							</div>
						</SectionCard>
					)}

					<SectionCard
						title="Appearance"
						description="How the draw looks on screen."
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<form.Field name="draw_style">
								{/* biome-ignore lint/suspicious/noExplicitAny: FieldApi generic */}
								{(field: any) => (
									<DrawStyleField field={field} isPending={isPending} />
								)}
							</form.Field>
							<form.Field name="draw_theme">
								{/* biome-ignore lint/suspicious/noExplicitAny: FieldApi generic */}
								{(field: any) => (
									<DrawThemeField field={field} isPending={isPending} />
								)}
							</form.Field>
						</div>
					</SectionCard>
				</div>

				<aside className="lg:sticky lg:top-0 lg:self-start">
					<form.Subscribe
						selector={(state: { values: Record<string, unknown> }) => ({
							draw_style: state.values.draw_style,
							draw_theme: state.values.draw_theme,
						})}
					>
						{(values: { draw_style: unknown; draw_theme: unknown }) => (
							<DrawStylePreviewWrapper
								drawStyle={values.draw_style as DrawStyle}
								drawTheme={values.draw_theme as DrawTheme}
								drawType={drawType === "gifts" ? "prizes" : drawType}
							/>
						)}
					</form.Subscribe>
				</aside>
			</div>

			<div className="mt-6 flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					className="rounded-none"
					onClick={onCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" className="rounded-none" disabled={isPending}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
