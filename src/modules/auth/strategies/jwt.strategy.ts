import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('app.jwtSecret'),
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    if (!payload.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
