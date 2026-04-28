export class AppError extends Error {
	public readonly code: string;
	public override readonly cause?: unknown;

	constructor(code: string, message: string, cause?: unknown) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		if (cause !== undefined) {
			this.cause = cause;
		}
	}

	toJSON(): { name: string; code: string; message: string } {
		return { name: this.name, code: this.code, message: this.message };
	}
}

export class RouterError extends AppError {}
export class MemoryError extends AppError {}
export class ActionError extends AppError {}
export class IntegrationError extends AppError {}
export class AuthError extends AppError {}
export class BudgetError extends AppError {}
export class ValidationError extends AppError {}
