import { HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private http;
    private memory;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, memory: MemoryHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
//# sourceMappingURL=health.controller.d.ts.map