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
import { GameResultAnswers } from './gameResultAnswers';

export class GameResult {
    'answers'?: Array<GameResultAnswers>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "answers",
            "baseName": "answers",
            "type": "Array<GameResultAnswers>"
        }    ];

    static getAttributeTypeMap() {
        return GameResult.attributeTypeMap;
    }
}

