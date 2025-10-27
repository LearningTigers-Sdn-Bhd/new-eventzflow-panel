import { publicProcedure, router } from "../index";
import { restapiAnalyticRouter } from "./analytic";
import { apiKeysRouter } from "./api-keys";
import { authRouter } from "./auth";
import { creditsRouter } from "./credits";
import { dashboardRouter } from "./dashboard";
import { restapiEventRouter } from "./event";
import { eventRouter } from "./event/event";
import { eventStaffRouter } from "./event/event-staff";
import { restapiUserRouter } from "./restapi/admin/user";
import { restapiTicketRouter } from "./restapi/ticket";
import { teamRouter } from "./team";
import { ticketRouter } from "./ticket";
import { ticketTypeRouter } from "./ticket-type";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	apiKeys: apiKeysRouter,
	auth: authRouter,
	credits: creditsRouter,
	dashboard: dashboardRouter,
	event: eventRouter,
	eventStaff: eventStaffRouter,
	team: teamRouter,
	ticket: ticketRouter,
	ticketType: ticketTypeRouter,
	restapiAnalytic: restapiAnalyticRouter,
	restapiEvent: restapiEventRouter,
	restapiUser: restapiUserRouter,
	restapiTicket: restapiTicketRouter,
});
export type AppRouter = typeof appRouter;
