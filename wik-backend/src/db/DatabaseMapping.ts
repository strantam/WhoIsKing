/* tslint:disable */


/**
 * AUTO-GENERATED FILE @ 2020-03-25 22:46:45 - DO NOT EDIT!
 *
 * This file was automatically generated by schemats v.3.0.3
 * $ schemats generate -c postgres://username:password@wikdev.cxejqr4qverc.eu-central-1.rds.amazonaws.com:5432/wik?ssl=true -t Answer -t Solution -t Question -t City -t User -t Level -s public
 *
 */

export type QuestionCategory = 'FASHION' | 'OTHER' | 'POLITICS' | 'SPORT';

export namespace AnswerFields {
    export type uid = string;
    export type questionId = string;
    export type answer = string;
    export type votes = number;

}

export interface Answer {
    uid: AnswerFields.uid;
    questionId: AnswerFields.questionId;
    answer: AnswerFields.answer;
    votes: AnswerFields.votes;

}

export namespace SolutionFields {
    export type uid = string;
    export type cityId = string | null;
    export type answerId = string;
    export type userId = string;
    export type createdAt = Date;
    export type questionId = string;

}

export interface Solution {
    uid: SolutionFields.uid;
    cityId: SolutionFields.cityId;
    answerId: SolutionFields.answerId;
    userId: SolutionFields.userId;
    createdAt: SolutionFields.createdAt;
    questionId: SolutionFields.questionId;

}

export namespace QuestionFields {
    export type uid = string;
    export type question = string;
    export type openTime = Date;
    export type closeTime = Date;
    export type userId = string | null;
    export type category = QuestionCategory;
    export type votes = number;

}

export interface Question {
    uid: QuestionFields.uid;
    question: QuestionFields.question;
    openTime: QuestionFields.openTime;
    closeTime: QuestionFields.closeTime;
    userId: QuestionFields.userId;
    category: QuestionFields.category;
    votes: QuestionFields.votes;

}

export namespace CityFields {
    export type uid = string;
    export type name = string;
    export type zip = string;
    export type lat = number | null;
    export type lng = number | null;

}

export interface City {
    uid: CityFields.uid;
    name: CityFields.name;
    zip: CityFields.zip;
    lat: CityFields.lat;
    lng: CityFields.lng;

}

export namespace UserFields {
    export type uid = string;
    export type fireBaseId = string;
    export type cityId = string | null;
    export type createdAt = Date;
    export type nickName = string | null;
    export type highestLevel = number;

}

export interface User {
    uid: UserFields.uid;
    fireBaseId: UserFields.fireBaseId;
    cityId: UserFields.cityId;
    createdAt: UserFields.createdAt;
    nickName: UserFields.nickName;
    highestLevel: UserFields.highestLevel;

}

export namespace LevelFields {
    export type index = number;
    export type points = number;
    export type plusVotes = number | null;
    export type plusQuestions = number | null;
    export type other = Array<string> | null;

}

export interface Level {
    index: LevelFields.index;
    points: LevelFields.points;
    plusVotes: LevelFields.plusVotes;
    plusQuestions: LevelFields.plusQuestions;
    other: LevelFields.other;

}
