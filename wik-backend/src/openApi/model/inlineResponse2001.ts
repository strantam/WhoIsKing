/**
 * Who Is King API document
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from '../api';
import { CityResult } from './cityResult';
import { GameResult } from './gameResult';

export class InlineResponse2001 {
    'cityResult': Array<CityResult>;
    'gameResult': GameResult;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "cityResult",
            "baseName": "cityResult",
            "type": "Array<CityResult>"
        },
        {
            "name": "gameResult",
            "baseName": "gameResult",
            "type": "GameResult"
        }    ];

    static getAttributeTypeMap() {
        return InlineResponse2001.attributeTypeMap;
    }
}

