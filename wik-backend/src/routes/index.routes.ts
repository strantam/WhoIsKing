// This can be removed once express 5 will be stable
import auth from "../middleware/auth";
import level from './level.routes';
import game from './game.routes';
import city from './city.routes';
import user from './user.routes';

require('express-async-errors');


const API_PREFIX = '/api/v1';

export default function (app): void {
    app.use(`${API_PREFIX}/city`, city);
    app.use(`${API_PREFIX}/game`, game);
    app.use(`${API_PREFIX}/user`, auth, user);
    app.use(`${API_PREFIX}/level`, level);
}
