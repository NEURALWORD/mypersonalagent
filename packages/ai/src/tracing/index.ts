import { mockLogger, newId, scrubPii } from '@exec/shared';
import type { Span, SpanInput, SpanOutput, Trace, TraceMetadata, TracingMode } from './types';

export * from './types';

const isPresent = (key: string | undefined): boolean =>
	typeof key === 'string' && key.trim().length > 0;

export const detectTracingMode = (
	env: Partial<Record<string, string | undefined>> = process.env,
): TracingMode =>
	isPresent(env.LANGFUSE_PUBLIC_KEY) && isPresent(env.LANGFUSE_SECRET_KEY) ? 'real' : 'mock';

const log = mockLogger('langfuse');

const buildMockSpan = (name: string): Span => {
	const id = newId('span');
	log('span.start', { id, name });
	return {
		id,
		end: async (output: SpanOutput) => {
			log('span.end', { id, name, output: scrubPii(output) });
		},
	};
};

const buildMockTrace = (name: string, metadata?: TraceMetadata): Trace => {
	const id = newId('trace');
	log('trace.start', { id, name, metadata: scrubPii(metadata ?? {}) });
	return {
		id,
		startSpan: (input: SpanInput) => buildMockSpan(input.name),
		end: async (extra?: TraceMetadata) => {
			log('trace.end', { id, name, metadata: scrubPii(extra ?? {}) });
		},
	};
};

/**
 * Open a new tracing context. In real mode (LANGFUSE_PUBLIC_KEY +
 * LANGFUSE_SECRET_KEY both set) AI-001 wires this through the Langfuse
 * client. Until then every call goes through mockLogger so trace shape
 * can be exercised in dev without a Langfuse account (ADR-020).
 */
export const startTrace = (name: string, metadata?: TraceMetadata): Trace => {
	if (detectTracingMode() === 'mock') return buildMockTrace(name, metadata);
	// AI-001: build a Langfuse client and adapt to the Trace surface.
	return buildMockTrace(name, metadata);
};
