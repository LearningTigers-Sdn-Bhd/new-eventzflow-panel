import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import {
	protectedHttpClient,
	refreshAccessTokenClient,
} from "../lib/http-client";

// Input schemas
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	password_confirmation: z.string(),
	full_name: z.string().min(1),
	phone: z.string().optional(),
});

const updateUserSchema = z.object({
	full_name: z.string().optional(),
	phone: z.string().optional(),
	password: z.string().optional(),
	password_confirmation: z.string().optional(),
});

type AuthResponse = {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	user: User;
};

export type RefreshResponse = {
	access_token: string;
};

export type User = {
	id: number;
	email: string;
	full_name: string;
	role: "org_owner" | "manager" | "member";
	phone?: string;
};

export const authRouter = router({
	login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
		const response = await protectedHttpClient.post<AuthResponse>("v1/login", {
			user: input,
		});
		return response;
	}),

	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input }) => {
			const response = await protectedHttpClient.post<AuthResponse>(
				"v1/register",
				{ user: input },
			);
			return response;
		}),

	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		return await protectedHttpClient.get<User>("v1/users/profile", ctx.token);
	}),

	updateCurrentUser: protectedProcedure
		.input(updateUserSchema)
		.mutation(async ({ input, ctx }) => {
			return await protectedHttpClient.put<User>(
				"v1/users/profile",
				{ user: input },
				ctx.token,
			);
		}),

	refresh: publicProcedure
		.input(
			z.object({
				refresh_token: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await refreshAccessTokenClient.post<RefreshResponse>(
				"v1/refresh",
				input.refresh_token,
			);
			return response;
		}),

	logout: publicProcedure
		.input(
			z.object({
				refresh_token: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await refreshAccessTokenClient.delete<{
				message: string;
			}>("v1/logout", input.refresh_token);
			return { message: response.message };
		}),
});
