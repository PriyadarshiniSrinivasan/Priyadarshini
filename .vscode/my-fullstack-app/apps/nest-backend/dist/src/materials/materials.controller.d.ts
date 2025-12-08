import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private svc;
    constructor(svc: MaterialsService);
    list(department?: string, category?: string, name?: string): any;
    create(body: any): any;
    update(id: string, body: any): any;
}
