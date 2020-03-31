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

export class User {
    'cityName'?: string;
    'nickName'?: string;
    'votes': number;
    'questions': number;
    'points': number;
    'highestLevel': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "cityName",
            "baseName": "cityName",
            "type": "string"
        },
        {
            "name": "nickName",
            "baseName": "nickName",
            "type": "string"
        },
        {
            "name": "votes",
            "baseName": "votes",
            "type": "number"
        },
        {
            "name": "questions",
            "baseName": "questions",
            "type": "number"
        },
        {
            "name": "points",
            "baseName": "points",
            "type": "number"
        },
        {
            "name": "highestLevel",
            "baseName": "highestLevel",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return User.attributeTypeMap;
    }
}

