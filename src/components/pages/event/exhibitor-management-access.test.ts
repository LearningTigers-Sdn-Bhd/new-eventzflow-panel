import { describe, expect, test } from "bun:test";
import {
	canManageExhibitorContractorAction,
	isExhibitorManagementEnabled,
	isExhibitorManagementProtectedTab,
	shouldExpandEmbeddedTeamMembersSection,
	shouldLoadExhibitorManagementData,
	shouldShowEmbeddedExhibitorManagementSections,
	shouldShowExhibitorManagementLockedState,
} from "./exhibitor-management-access";

describe("exhibitor management access", () => {
	test("returns false when exhibitor management is disabled", () => {
		expect(
			isExhibitorManagementEnabled(undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(false);
	});

	test("lets org owners bypass the exhibitor management flag", () => {
		expect(
			isExhibitorManagementEnabled("org_owner", {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
	});

	test("allows contractor assignment only for org owners when feature is enabled", () => {
		expect(
			canManageExhibitorContractorAction("org_owner", {
				enable_exhibitor_management: true,
			}),
		).toBe(true);
		expect(
			canManageExhibitorContractorAction("organizer", {
				enable_exhibitor_management: true,
			}),
		).toBe(false);
	});

	test("does not load protected data while feature is disabled or event is unresolved", () => {
		expect(shouldLoadExhibitorManagementData(undefined, undefined)).toBe(false);
		expect(
			shouldLoadExhibitorManagementData(undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(false);
		expect(
			shouldLoadExhibitorManagementData(undefined, {
				enable_exhibitor_management: true,
			}),
		).toBe(true);
		expect(
			shouldLoadExhibitorManagementData("org_owner", {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
	});

	test("shows locked state only for protected exhibitor management tabs", () => {
		expect(isExhibitorManagementProtectedTab("rentable-items")).toBe(true);
		expect(isExhibitorManagementProtectedTab("printing-services")).toBe(true);
		expect(isExhibitorManagementProtectedTab("exhibitor-info")).toBe(false);

		expect(
			shouldShowExhibitorManagementLockedState("rentable-items", undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
		expect(
			shouldShowExhibitorManagementLockedState("printing-services", undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
		expect(
			shouldShowExhibitorManagementLockedState("exhibitor-info", undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(false);
		expect(
			shouldShowExhibitorManagementLockedState("rentable-items", "org_owner", {
				enable_exhibitor_management: false,
			}),
		).toBe(false);
	});

	test("allows exhibitor-side kit pages to lock when the feature is disabled", () => {
		expect(
			shouldShowExhibitorManagementLockedState("rentable-items", undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
		expect(
			shouldLoadExhibitorManagementData(undefined, {
				enable_exhibitor_management: true,
			}),
		).toBe(true);
	});

	test("only shows embedded paid sections when exhibitor management is enabled", () => {
		expect(
			shouldShowEmbeddedExhibitorManagementSections(undefined, undefined),
		).toBe(false);
		expect(
			shouldShowEmbeddedExhibitorManagementSections(undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(false);
		expect(
			shouldShowEmbeddedExhibitorManagementSections(undefined, {
				enable_exhibitor_management: true,
			}),
		).toBe(true);
		expect(
			shouldShowEmbeddedExhibitorManagementSections("org_owner", {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
	});

	test("expands embedded team members section when paid exhibitor sections are hidden", () => {
		expect(shouldExpandEmbeddedTeamMembersSection(undefined, undefined)).toBe(
			true,
		);
		expect(
			shouldExpandEmbeddedTeamMembersSection(undefined, {
				enable_exhibitor_management: false,
			}),
		).toBe(true);
		expect(
			shouldExpandEmbeddedTeamMembersSection(undefined, {
				enable_exhibitor_management: true,
			}),
		).toBe(false);
		expect(
			shouldExpandEmbeddedTeamMembersSection("org_owner", {
				enable_exhibitor_management: false,
			}),
		).toBe(false);
	});
});
