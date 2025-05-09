import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: number;
  username: string;
}

interface AuthorizationHeader extends Headers {
  authorization?: string;
}

interface AuthorizationRequest extends Request {
  headers: AuthorizationHeader;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the request object
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // If there is no token throw unauthorized exception
    if (!token) {
      throw new UnauthorizedException();
    }

    // Verify the token using jwt service, throw unauthorized exception
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwtSecret'),
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(
    request: AuthorizationRequest,
  ): string | undefined {
    // Get token from the header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
