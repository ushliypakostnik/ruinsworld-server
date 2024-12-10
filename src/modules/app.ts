// Nest
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

// Controllers
import Api from '../controllers/api';

// Services
import Gateway from '../services/gateway';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [Api],
  providers: [Gateway],
  exports: [Gateway],
})
export class App {
  constructor() {
    // console.log('App constructor()', this);
  }
}
