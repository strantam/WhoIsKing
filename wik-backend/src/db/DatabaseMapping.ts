/* tslint:disable */


/**
 * AUTO-GENERATED FILE @ 2020-03-19 23:26:05 - DO NOT EDIT!
 *
 * This file was automatically generated by schemats v.3.0.3
 * $ schemats generate -c postgres://username:password@wikdev.cxejqr4qverc.eu-central-1.rds.amazonaws.com:5432/wik?ssl=true -t Solution -t Question -t City -t User -s public
 *
 */

export type QuestionType = 'ESTIMATION' | 'MULTIPLE_CHOICE';

export namespace SolutionFields {
    export type uid = string;
    export type answer = string;
    export type points = number;
    export type userId = string;
    export type questionId = string;
    export type cityId = string;

}

export interface Solution {
    uid: SolutionFields.uid;
    answer: SolutionFields.answer;
    points: SolutionFields.points;
    userId: SolutionFields.userId;
    questionId: SolutionFields.questionId;
    cityId: SolutionFields.cityId;

}

export namespace QuestionFields {
    export type uid = string;
    export type type = QuestionType;
    export type params = Object;
    export type question = string;
    export type points = number;
    export type openTime = Date;
    export type closeTime = Date;

}

export interface Question {
    uid: QuestionFields.uid;
    type: QuestionFields.type;
    params: QuestionFields.params;
    question: QuestionFields.question;
    points: QuestionFields.points;
    openTime: QuestionFields.openTime;
    closeTime: QuestionFields.closeTime;

}

export namespace CityFields {
    export type uid = string;
    export type name = string;
    export type zip = string;

}

export interface City {
    uid: CityFields.uid;
    name: CityFields.name;
    zip: CityFields.zip;

}

export namespace UserFields {
    export type uid = string;
    export type fireBaseId = string;
    export type cityId = string | null;

}

export interface User {
    uid: UserFields.uid;
    fireBaseId: UserFields.fireBaseId;
    cityId: UserFields.cityId;

}
