import {Route} from "../types";
import {dynamoDBService} from "./dynamodb";
import {DYNAMODB_TABLES} from "../config";
import logger from "../utils/logger";

export class RouteService {
    async getRoutesById(familyId: String): Promise<Route | null > {
        try {
            return await dynamoDBService.getItem(DYNAMODB_TABLES.Route, {id: familyId})
        }catch (error) {
            logger.error('Get Route Error', error);
            throw error;
        }
    }
}


export const routeService = new RouteService();
