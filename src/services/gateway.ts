// Library
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// Types
import {
  IPointMessage,
  IUpdateMessage,
  IMessage,
  IPickMessage,
  IShot,
  IExplosion,
  ILocationUnits,
} from '../models/api';

// Constants
import { Messages } from '../models/api';

// Services
import Game from '../services/game/game';

// Utils
import Helper from './utils/helper';

@WebSocketGateway({
  cors: {
    credentials: true, // TODO!!! For development!!!
  },
  allowEIO3: true,
})
export default class Gateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server;

  // Gameplay
  public game: Game;

  private _timeout!: ReturnType<typeof setInterval>;
  private _locations: ILocationUnits[];
  private ZERO_ROOM = '0000';

  constructor() {
    // Go!
    this.game = new Game();

    // Запускаем постоянные обновления клиентов
    this._timeout = setInterval(
      () => this.getGameUpdates(),
      process.env.TIMEOUT as unknown as number,
    );
  }

  // Пульнуть всем стейт игры по локациям
  getGameUpdates(): void {
    if (this.server) {
      this._locations = this.game.world.array.filter(
        (location) => location.users.length > 0,
      );
      this._locations.forEach((location: ILocationUnits) => {
        this.server
          .to(location.id)
          .emit(
            Messages.updateToClients,
            this.game.getGameUpdates(location.id),
          );
      });
    }
  }

  // Присоединился пользователь
  async handleConnection(T): Promise<typeof T> {
    // console.log('Gateway handleConnection() connect!');
    this.server.emit(Messages.onConnect);
  }

  // Пользователь отвалился
  async handleDisconnect(T): Promise<typeof T> {
    // console.log('Gateway handleDisconnect()!');
  }

  // Пришла реакция на сообщение о соединении
  @SubscribeMessage(Messages.onOnConnect)
  async onOnConnect(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateway onOnConnect()!', message);

    let player;
    if (
      Helper.isEmptyObject(message) ||
      !Helper.isHasProperty(message, 'id') ||
      !this.game.checkPlayerId(message.id as string)
    ) {
      // Если пришел айди или пришел, но неправильный
      client.join(this.ZERO_ROOM);
      console.log('Gateway - подключаем "в тамбур"!');
      client.emit(Messages.newPlayer);
    } else {
      // Вспоминаем игрока
      player = this.game.updatePlayer(message.id as string);
      client.join(player.location);
      client.emit(Messages.onUpdatePlayer, player);
      console.log('Gateway Этот игрок уже был!', player);
    }
  }

  // Пользователь сказал как его зовут и за какую расу он хочет играть
  @SubscribeMessage(Messages.enter)
  async onEnter(client, message: IUpdateMessage): Promise<void> {
    const player = this.game.onEnter(message);
    // console.log('Gateway onEnter() - setNewPlayer: ', player);
    client.join(player.location);
    client.emit(Messages.onEnter, player);
  }

  // Пользователь решил переиграть
  @SubscribeMessage(Messages.reenter)
  async onReenter(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateway onReenter()!', message);
    this.game.onReenter(message);
    client.join(this.ZERO_ROOM);
  }

  // Пришли обновления от клиента
  @SubscribeMessage(Messages.updateToServer)
  async onUpdateToServer(client, message: IUpdateMessage): Promise<void> {
    this.game.onUpdateToServer(message);
  }

  // Пришел выстрел
  @SubscribeMessage(Messages.shot)
  async onShot(client, message: IShot): Promise<void> {
    this.server
      .to(message.location)
      .emit(Messages.onShot, this.game.onShot(message));
  }

  // Выстрел клиента улетел
  @SubscribeMessage(Messages.unshot)
  async onUnshot(client, message: number): Promise<void> {
    this.server
      .to(this.game.onUnshot(message))
      .emit(Messages.onUnshot, message);
  }

  // Взрыв на клиенте
  @SubscribeMessage(Messages.explosion)
  async explosion(client, message: IExplosion): Promise<void> {
    // console.log('Gateway explosion!!!', message);
    this.game.onUnshotExplosion(message.id); // Удаляем выстрел
    this.server
      .to(message.location)
      .emit(Messages.onExplosion, this.game.onExplosion(message));
  }

  // Самоповреждение на клиенте
  @SubscribeMessage(Messages.selfharm)
  async selfharm(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateway selfharm!!!', message);
    this.server
      .to(message.location)
      .emit(Messages.onSelfharm, this.game.onSelfharm(message));
  }

  // Переход на локацию
  @SubscribeMessage(Messages.relocation)
  async relocation(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateway relocation!!!', message);
    this.game.onRelocation(message);
    this.server.to(message.location).emit(Messages.onRelocation, message.id);
  }

  // Переход на локацию
  @SubscribeMessage(Messages.location)
  async onLocation(client, message: string): Promise<void> {
    // console.log('Gateway onLocation!!!', message);
    this.game.onLocation(message);
  }

  // Смена флага на контрольной точке
  @SubscribeMessage(Messages.point)
  async onPoint(client, message: IPointMessage): Promise<void> {
    // console.log('Gateway onPoint!!!', message);
    this.game.onPoint(message);
  }

  // Игрок подобрал что-то
  @SubscribeMessage(Messages.pick)
  async onPick(client, message: IPickMessage): Promise<void> {
    // console.log('Gateway onPick!!!', message);
    this.server
      .to(message.location)
      .emit(Messages.onPick, {
        uuid: message.uuid,
        exp: this.game.onPick(message),
      });
  }

  // Игрок подобрал что-то
  @SubscribeMessage(Messages.userDead)
  async onUserDead(client, message: IMessage): Promise<void> {
    // console.log('Gateway onUserDead!!!', message);
    this.game.onUserDead(message);
  }
}
