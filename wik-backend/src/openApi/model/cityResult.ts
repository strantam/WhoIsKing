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
import { City } from './city';

export class CityResult {
    'city': City;
    'avgPoint': number;
    'allResponders': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "city",
            "baseName": "city",
            "type": "City"
        },
        {
            "name": "avgPoint",
            "baseName": "avgPoint",
            "type": "number"
        },
        {
            "name": "allResponders",
            "baseName": "allResponders",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return CityResult.attributeTypeMap;
    }
}

