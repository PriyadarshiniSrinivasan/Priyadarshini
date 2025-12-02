import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): {
        app: string;
        message: string;
        docs: {
            health: string;
            login: string;
            materials: string;
            tables: string;
        };
    };
    getHealth(): {
        status: string;
        uptime: number;
        timestamp: string;
    };
}
