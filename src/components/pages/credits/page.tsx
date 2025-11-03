"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Info, Plus } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getConsumptionCharges,
	getCreditDeductions,
	getCreditStats,
	getTransactionLogs,
} from "@/lib/api/credits";
import { consumptionColumns } from "./consumption-columns";
import { ConsumptionTable } from "./consumption-table";
import { deductionColumns } from "./deduction-columns";
import { DeductionTable } from "./deduction-table";
import { transactionColumns } from "./transaction-columns";
import { TransactionTable } from "./transaction-table";

export default function CreditsContent() {
	const {
		data: transactionLogs,
		isLoading: isLoadingTransactions,
		error: transactionsError,
	} = useQuery({
		queryKey: ["credits", "transaction-logs"],
		queryFn: getTransactionLogs,
	});

	const {
		data: deductions,
		isLoading: isLoadingDeductions,
		error: deductionsError,
	} = useQuery({
		queryKey: ["credits", "deductions"],
		queryFn: getCreditDeductions,
	});

	const {
		data: consumptionCharges,
		isLoading: isLoadingConsumption,
		error: consumptionError,
	} = useQuery({
		queryKey: ["credits", "consumption-charges"],
		queryFn: getConsumptionCharges,
	});

	const {
		data: stats,
		isLoading: isLoadingStats,
		error: statsError,
	} = useQuery({
		queryKey: ["credits", "stats"],
		queryFn: getCreditStats,
	});

	const isLoading =
		isLoadingTransactions ||
		isLoadingDeductions ||
		isLoadingConsumption ||
		isLoadingStats;
	const error =
		transactionsError || deductionsError || consumptionError || statsError;

	return (
		<div className="p-2">
			<div className="page-header mb-4 sm:mb-8">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={CreditCard}
						title="WhatsApp Credits"
						description="Manage your credit balance and view consumption details"
					/>
				</div>
			</div>

			{isLoading ? (
				<LoadingState
					title="Loading credits data..."
					description="Please wait while we fetch your credit information..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load credits data"
					description="We couldn't load your credit information. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<Tabs defaultValue="transactions" className="w-full">
					<div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
							<TabsList className="grid w-full grid-cols-3 border bg-muted/50 p-1 sm:max-w-2xl">
								<TabsTrigger
									value="transactions"
									className="rounded-full text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm"
								>
									<span className="hidden sm:inline">Transaction Log</span>
									<span className="sm:hidden">Transactions</span>
								</TabsTrigger>
								<TabsTrigger
									value="deductions"
									className="rounded-full text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm"
								>
									Deductions
								</TabsTrigger>
								<TabsTrigger
									value="consumption"
									className="rounded-full text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm"
								>
									<span className="hidden sm:inline">Consumption Charges</span>
									<span className="sm:hidden">Consumption</span>
								</TabsTrigger>
							</TabsList>
							<Button className="w-full shrink-0 sm:w-auto">
								<Plus className="mr-2 size-4" />
								<span className="hidden sm:inline">Buy Credits</span>
								<span className="sm:hidden">Buy</span>
							</Button>
						</div>
					</div>

					<TabsContent value="transactions">
						<Card className="mb-4 sm:mb-6">
							<CardContent className="px-4 py-4 sm:px-6">
								<div className="flex items-center justify-between gap-3">
									<div className="flex-1">
										<p className="text-muted-foreground text-xs sm:text-sm">
											Current Balance
										</p>
										<p className="font-bold text-2xl sm:text-3xl">
											{stats?.currentBalance.toLocaleString() || 0} credits
										</p>
										<p className="text-muted-foreground text-xs sm:text-sm">
											Track your credit history and purchases
										</p>
									</div>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-16">
										<CreditCard className="size-6 text-primary sm:size-8" />
									</div>
								</div>
							</CardContent>
						</Card>
						<TransactionTable
							columns={transactionColumns}
							data={transactionLogs || []}
						/>
					</TabsContent>

					<TabsContent value="deductions">
						<Card className="mb-4 border-blue-200 bg-blue-50 sm:mb-6 dark:border-blue-900 dark:bg-blue-950/30">
							<CardContent className="px-4 py-4 sm:px-6">
								<div className="flex items-start gap-2 sm:gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:size-10 dark:bg-blue-900/50">
										<Info className="size-4 text-blue-600 sm:size-5 dark:text-blue-400" />
									</div>
									<div className="flex-1">
										<p className="font-semibold text-blue-900 text-sm sm:text-base dark:text-blue-100">
											WhatsApp Message Credits
										</p>
										<p className="text-blue-700 text-xs sm:text-sm dark:text-blue-300">
											This section shows the history of WhatsApp message credit
											deductions. Credits are deducted based on the recipient's
											country code when messages are sent.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<DeductionTable
							columns={deductionColumns}
							data={deductions || []}
						/>
					</TabsContent>

					<TabsContent value="consumption">
						<Card className="mb-4 sm:mb-6">
							<CardContent className="px-4 py-4 sm:px-6">
								<div className="flex items-start gap-3">
									<div className="flex-1">
										<p className="font-semibold text-sm sm:text-base">
											Credit Consumption by Country
										</p>
										<p className="text-muted-foreground text-xs sm:text-sm">
											View credit consumption rates for WhatsApp messages across
											different countries
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<ConsumptionTable
							columns={consumptionColumns}
							data={consumptionCharges || []}
						/>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
