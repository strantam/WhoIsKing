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

export class Level {
    'index': number;
    'points': number;
    'plusVotes': number;
    'plusQuestions': number;
    'other'?: Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "index",
            "baseName": "index",
            "type": "number"
        },
        {
            "name": "points",
            "baseName": "points",
            "type": "number"
        },
        {
            "name": "plusVotes",
            "baseName": "plusVotes",
            "type": "number"
        },
        {
            "name": "plusQuestions",
            "baseName": "plusQuestions",
            "type": "number"
        },
        {
            "name": "other",
            "baseName": "other",
            "type": "Array<string>"
        }    ];

    static getAttributeTypeMap() {
        return Level.attributeTypeMap;
    }
}

