"use client";
import Head from "next/head";
import HomeSection from "@/components/pages/home/home-section";

export default function Home() {
	return (
		<div className="w-full">
			<Head>
				<title>EventzFlow</title>
				<meta
					name="description"
					content="EventzFlow is a platform for event management"
				/>
			</Head>
			<HomeSection />
		</div>
	);
}
