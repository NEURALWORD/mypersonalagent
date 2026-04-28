export type TracingMode = 'real' | 'mock';

export type TraceMetadata = {
	userId?: string;
	agent?: string;
	promptVersion?: string;
	model?: string;
	[key: string]: unknown;
};

export type SpanInput = {
	name: string;
	input?: unknown;
	metadata?: TraceMetadata;
};

export type SpanOutput = {
	output?: unknown;
	usage?: {
		promptTokens?: number;
		completionTokens?: number;
		totalTokens?: number;
		costUsd?: number;
	};
	error?: { message: string; code?: string };
};

export type Trace = {
	id: string;
	startSpan: (input: SpanInput) => Span;
	end: (metadata?: TraceMetadata) => Promise<void>;
};

export type Span = {
	id: string;
	end: (output: SpanOutput) => Promise<void>;
};
