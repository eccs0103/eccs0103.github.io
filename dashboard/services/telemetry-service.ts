"use strict";

import "adaptive-extender/core";
import { Timespan } from "adaptive-extender/core";
import { type ActivityPulse } from "../models/activity-pulse.js";

const { trunc, min } = Math;

//#region Telemetry service
export class TelemetryService {
	static formatClock(date: Readonly<Date>): string {
		const pad = (value: number): string => value.toString().padStart(2, "0");
		return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	}

	static formatSignalAge(latest: Date | null): string {
		if (latest === null) return "No signal recorded";
		const span = Timespan.fromValue(Date.now() - latest.valueOf());
		if (span.days > 0) return `${span.days}d ${span.hours}h ago`;
		if (span.hours > 0) return `${span.hours}h ${span.minutes}m ago`;
		if (span.minutes > 0) return `${span.minutes}m ago`;
		return "Just now";
	}

	static formatUptime(since: Date | null): string {
		if (since === null) return "Not configured";
		const span = Timespan.fromValue(Date.now() - since.valueOf());
		return `${span.days}d ${span.hours}h ${span.minutes}m`;
	}

	static latestTimestamp(pulses: readonly ActivityPulse[]): Date | null {
		let latest: Date | null = null;
		for (const pulse of pulses) {
			if (latest === null || pulse.timestamp > latest) latest = pulse.timestamp;
		}
		return latest;
	}

	static buildHistogram(pulses: readonly ActivityPulse[], buckets: number, span: Readonly<Timespan>): number[] {
		const counts = new Array<number>(buckets).fill(0);
		const end = Date.now();
		const duration = span.valueOf();
		const start = end - duration;
		const width = duration / buckets;
		for (const pulse of pulses) {
			const timestamp = pulse.timestamp.valueOf();
			if (timestamp < start || timestamp > end) continue;
			const index = min(buckets - 1, trunc((timestamp - start) / width));
			counts[index]++;
		}
		return counts;
	}

	static pulseDuration(status: string | null): string {
		switch (status) {
		case "connected": return "2.4s";
		case "delayed": return "0.9s";
		default: return "0s";
		}
	}
}
//#endregion
