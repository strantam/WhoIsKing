import {Game} from "../../../../wik-backend/src/openApi/model/game";

export interface GameModel extends Game {
  frontendTime: Date;
}
