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

export class GameResultAnswers {
    'ratio': number;
    'uid': string;
    'answer': string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "ratio",
            "baseName": "ratio",
            "type": "number"
        },
        {
            "name": "uid",
            "baseName": "uid",
            "type": "string"
        },
        {
            "name": "answer",
            "baseName": "answer",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return GameResultAnswers.attributeTypeMap;
    }
}

